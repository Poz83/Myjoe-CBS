'use client';

import { useQuery } from '@tanstack/react-query';

interface VaultProject {
  id: string;
  name: string;
  description: string | null;
  page_count: number;
  audience: string;
  style_preset: string;
  status: string;
  created_at: string;
  storageUsed: number;
  assetCount: number;
}

/**
 * Fetch projects for vault view with storage information
 */
export function useVaultProjects() {
  return useQuery<VaultProject[]>({
    queryKey: ['vault-projects'],
    queryFn: async () => {
      const response = await fetch('/api/vault/assets?type=projects');

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch vault projects' }));
        throw new Error(error.error || 'Failed to fetch vault projects');
      }

      const data = await response.json();
      return data.projects || [];
    },
  });
}