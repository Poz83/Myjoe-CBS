'use client';

import { useQuery } from '@tanstack/react-query';

interface VaultHero {
  id: string;
  name: string;
  description: string;
  audience: string;
  created_at: string;
  thumbnailUrl: string | null;
  referenceUrl?: string | null;
  storageUsed: number;
  hasAsset: boolean;
}

/**
 * Fetch heroes for vault view with storage information
 */
export function useVaultHeroes() {
  return useQuery<VaultHero[]>({
    queryKey: ['vault-heroes'],
    queryFn: async () => {
      const response = await fetch('/api/vault/assets?type=heroes');

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch vault heroes' }));
        throw new Error(error.error || 'Failed to fetch vault heroes');
      }

      const data = await response.json();
      return data.heroes || [];
    },
  });
}