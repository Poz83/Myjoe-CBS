'use client';

import { useQuery } from '@tanstack/react-query';

interface Project {
  id: string;
  name: string;
}

interface ExportAsset {
  id: string;
  r2_key: string;
  size_bytes: number;
  content_type: string;
  created_at: string;
}

interface ExportsByProject {
  project: Project;
  assets: ExportAsset[];
  totalStorage: number;
}

/**
 * Fetch exports for vault view grouped by project
 */
export function useVaultExports() {
  return useQuery<ExportsByProject[]>({
    queryKey: ['vault-exports'],
    queryFn: async () => {
      const response = await fetch('/api/vault/assets?type=exports');

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch vault exports' }));
        throw new Error(error.error || 'Failed to fetch vault exports');
      }

      const data = await response.json();
      return data.exportsByProject || [];
    },
  });
}