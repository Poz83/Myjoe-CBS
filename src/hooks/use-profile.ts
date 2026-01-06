'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * Client-side function to get user profile
 * This is separate from the server-side queries.ts to avoid importing server-only code
 */
async function getProfileClient(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('owner_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw error;
  }

  return data;
}

interface UseProfileReturn {
  profile: Profile | null | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useProfile(userId: string | undefined): UseProfileReturn {
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getProfileClient(userId!),
    enabled: !!userId, // Only fetch if userId exists
    staleTime: 5 * 60 * 1000, // 5 minutes - profiles don't change often
  });

  return {
    profile,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
