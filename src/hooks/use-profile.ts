'use client';

import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/lib/supabase/queries';
import type { Database } from '@/lib/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

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
    queryFn: () => getProfile(userId!),
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
