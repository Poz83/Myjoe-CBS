'use client';

import { useQuery } from '@tanstack/react-query';

interface StorageQuota {
  used: number;
  limit: number;
  remaining: number;
  percentageUsed: number;
}

interface UseStorageQuota {
  used: number;
  limit: number;
  remaining: number;
  percentageUsed: number;
  isLoading: boolean;
  refetch: () => void;
}

export function useStorageQuota(): UseStorageQuota {
  const { data, isLoading, refetch } = useQuery<StorageQuota>({
    queryKey: ['storage-quota'],
    queryFn: async () => {
      const response = await fetch('/api/storage/quota');

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch storage quota' }));
        throw new Error(error.error || 'Failed to fetch storage quota');
      }

      return response.json();
    },
    refetchInterval: 30000, // 30s updates for real-time feel
  });

  return {
    used: data?.used ?? 0,
    limit: data?.limit ?? 0,
    remaining: data?.remaining ?? 0,
    percentageUsed: data?.percentageUsed ?? 0,
    isLoading,
    refetch,
  };
}