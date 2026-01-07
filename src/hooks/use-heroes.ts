'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Database } from '@/lib/supabase/types';

type Hero = Database['public']['Tables']['heroes']['Row'];

interface HeroWithUrls extends Hero {
  thumbnailUrl: string | null;
  referenceUrl?: string | null;
}

interface HeroesResponse {
  heroes: HeroWithUrls[];
}

interface CreateHeroInput {
  name: string;
  description: string;
  audience: 'toddler' | 'children' | 'tween' | 'teen' | 'adult';
}

interface CreateHeroResponse {
  jobId: string;
  status: 'pending';
  blotsReserved: number;
  correlationId: string;
}

export interface HeroCreationError {
  error: string;
  blocked?: string[];
  suggestions?: string[];
  required?: number;
  available?: number;
  shortfall?: number;
}

/**
 * Fetch all heroes for the current user
 */
export function useHeroes() {
  return useQuery<HeroWithUrls[]>({
    queryKey: ['heroes'],
    queryFn: async () => {
      const response = await fetch('/api/heroes');

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch heroes' }));
        throw new Error(error.error || 'Failed to fetch heroes');
      }

      const data: HeroesResponse = await response.json();
      return data.heroes;
    },
  });
}

/**
 * Fetch a single hero by ID
 */
export function useHero(id: string | null) {
  return useQuery<HeroWithUrls>({
    queryKey: ['heroes', id],
    queryFn: async () => {
      const response = await fetch(`/api/heroes/${id}`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch hero' }));
        throw new Error(error.error || 'Failed to fetch hero');
      }

      return response.json();
    },
    enabled: !!id,
  });
}

/**
 * Mutation to create a new hero
 * Starts the hero creation job
 */
export function useCreateHero() {
  const queryClient = useQueryClient();

  return useMutation<CreateHeroResponse, HeroCreationError, CreateHeroInput>({
    mutationFn: async (input: CreateHeroInput) => {
      const response = await fetch('/api/heroes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        // Throw the full error response for handling in the component
        throw data as HeroCreationError;
      }

      return data as CreateHeroResponse;
    },
    onError: (error) => {
      // Only show toast for non-safety/non-blot errors (those are shown inline)
      if (!error.blocked && !error.shortfall) {
        toast.error(error.error || 'Failed to create hero');
      }
    },
    onSuccess: () => {
      toast.success('Hero creation started!');
      // Invalidate profile to update blot balance
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

/**
 * Mutation to delete a hero
 * Includes optimistic removal for immediate UI feedback
 */
export function useDeleteHero() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (heroId: string): Promise<void> => {
      const response = await fetch(`/api/heroes/${heroId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to delete hero' }));
        throw new Error(error.error || 'Failed to delete hero');
      }
    },
    onMutate: async (heroId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['heroes'] });

      // Snapshot previous value
      const previousHeroes = queryClient.getQueryData<HeroWithUrls[]>(['heroes']);

      // Optimistically remove hero
      queryClient.setQueryData<HeroWithUrls[]>(['heroes'], (old = []) =>
        old.filter((hero) => hero.id !== heroId)
      );

      return { previousHeroes };
    },
    onError: (error, _heroId, context) => {
      // Rollback on error
      if (context?.previousHeroes) {
        queryClient.setQueryData(['heroes'], context.previousHeroes);
      }
      toast.error(error instanceof Error ? error.message : 'Failed to delete hero');
    },
    onSuccess: () => {
      toast.success('Hero deleted successfully');
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
    },
  });
}

/**
 * Poll hero job status
 */
export function useHeroJob(jobId: string | null) {
  return useQuery({
    queryKey: ['hero-job', jobId],
    queryFn: async () => {
      const response = await fetch(`/api/generate/${jobId}`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch job status' }));
        throw new Error(error.error || 'Failed to fetch job status');
      }

      return response.json();
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      // Stop polling if job is finished
      const status = query.state.data?.job?.status;
      if (status === 'completed' || status === 'failed' || status === 'cancelled') {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
    staleTime: 1000,
  });
}
