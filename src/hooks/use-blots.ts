'use client';

import { useBalance } from './use-billing';

interface UseBlots {
  blots: number;
  plan: string;
  isLoading: boolean;
  refetch: () => void;
}

export function useBlots(): UseBlots {
  const { data, isLoading, refetch } = useBalance();

  return {
    blots: data?.total ?? 0,
    plan: data?.plan ?? 'free',
    isLoading,
    refetch,
  };
}
