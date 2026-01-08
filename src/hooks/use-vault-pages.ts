'use client';

import { useQuery } from '@tanstack/react-query';

interface Project {
  id: string;
  name: string;
}

interface PageAsset {
  id: string;
  r2_key: string;
  size_bytes: number;
  content_type: string;
  created_at: string;
}

interface PagesByProject {
  project: Project;
  assets: PageAsset[];
  totalStorage: number;
}

/**
 * Fetch pages for vault view grouped by project
 */
export function useVaultPages() {
  return useQuery<PagesByProject[]>({
    queryKey: ['vault-pages'],
    queryFn: async () => {
      const response = await fetch('/api/vault/assets?type=pages');

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch vault pages' }));
        throw new Error(error.error || 'Failed to fetch vault pages');
      }

      const data = await response.json();
      return data.pagesByProject || [];
    },
  });
}