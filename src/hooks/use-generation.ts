'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ============================================================================
// Types
// ============================================================================

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type JobItemStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';

export interface GenerateJobRequest {
  projectId: string;
  idea: string;
  pageNumbers?: number[];
}

export interface GenerateJobResponse {
  jobId: string;
  status: 'pending';
  totalItems: number;
  blotsReserved: number;
  correlationId: string;
}

export interface JobItem {
  id: string;
  pageId: string | null;
  status: JobItemStatus;
  thumbnailUrl: string | null;
  errorMessage: string | null;
}

export interface JobStatusResponse {
  job: {
    id: string;
    status: JobStatus;
    totalItems: number;
    completedItems: number;
    failedItems: number;
    blotsReserved: number;
    blotsSpent: number;
    errorMessage: string | null;
    createdAt: string;
    startedAt: string | null;
    completedAt: string | null;
  };
  items: JobItem[];
  correlationId: string;
}

export interface CancelJobResponse {
  success: boolean;
  blotsRefunded: number;
  newBalance: number;
  correlationId: string;
}

export interface ContentSafetyError {
  error: string;
  blocked: string[];
  suggestions: string[];
}

export interface InsufficientBlotsError {
  error: string;
  required: number;
  available: number;
  shortfall: number;
}

export interface GenerationError {
  error: string;
  blocked?: string[];
  suggestions?: string[];
  required?: number;
  available?: number;
  shortfall?: number;
}

// ============================================================================
// useGenerationJob - Poll job status every 2s
// ============================================================================

export function useGenerationJob(jobId: string | null) {
  const query = useQuery<JobStatusResponse>({
    queryKey: ['generation-job', jobId],
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
    staleTime: 1000, // Consider data stale after 1 second
  });

  return {
    job: query.data?.job || null,
    items: query.data?.items || [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

// ============================================================================
// useStartGeneration - Mutation to start a generation job
// ============================================================================

export function useStartGeneration() {
  const queryClient = useQueryClient();

  return useMutation<GenerateJobResponse, GenerationError, GenerateJobRequest>({
    mutationFn: async (input: GenerateJobRequest) => {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        // Throw the full error response for handling in the component
        throw data as GenerationError;
      }

      return data as GenerateJobResponse;
    },
    onError: (error) => {
      // Only show toast for non-safety errors (safety errors shown inline)
      if (!error.blocked && !error.shortfall) {
        toast.error(error.error || 'Failed to start generation');
      }
    },
    onSuccess: (data) => {
      toast.success(`Generation started! ${data.totalItems} pages queued.`);
      // Invalidate profile to update blot balance
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// ============================================================================
// useCancelGeneration - Mutation to cancel a job and refund blots
// ============================================================================

export function useCancelGeneration() {
  const queryClient = useQueryClient();

  return useMutation<CancelJobResponse, Error, string>({
    mutationFn: async (jobId: string) => {
      const response = await fetch(`/api/generate/${jobId}/cancel`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel job');
      }

      return data as CancelJobResponse;
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel generation');
    },
    onSuccess: (data) => {
      if (data.blotsRefunded > 0) {
        toast.success(`Generation cancelled. ${data.blotsRefunded} blots refunded.`);
      } else {
        toast.success('Generation cancelled.');
      }
      // Invalidate profile to update blot balance
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
