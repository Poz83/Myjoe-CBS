'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { PageWithVersions, PageVersion, EditType } from '@/server/db/pages';

// ============================================================================
// Types
// ============================================================================

interface PageDetailResponse {
  page: PageWithVersions;
  versions: PageVersion[];
  imageUrl: string | null;
  thumbnailUrls: Record<number, string>;
}

interface EditPageInput {
  pageId: string;
  projectId: string;
  type: EditType;
  prompt?: string;
  maskDataUrl?: string;
}

interface EditPageResponse {
  success: boolean;
  page: PageWithVersions;
  version: PageVersion;
  imageUrl: string;
}

export interface EditPageError {
  error: string;
  blocked?: string[];
  suggestions?: string[];
  required?: number;
  available?: number;
}

interface RestoreVersionInput {
  pageId: string;
  projectId: string;
  version: number;
}

interface RestoreVersionResponse {
  success: boolean;
  page: PageWithVersions;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Fetch a single page with all versions
 */
export function usePageDetail(pageId: string | null) {
  return useQuery<PageDetailResponse>({
    queryKey: ['page', pageId],
    queryFn: async () => {
      const response = await fetch(`/api/pages/${pageId}`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch page' }));
        throw new Error(error.error || 'Failed to fetch page');
      }

      return response.json();
    },
    enabled: !!pageId,
  });
}

/**
 * Mutation to edit a page (regenerate, inpaint, quick_action)
 * Handles safety errors inline via error object
 */
export function useEditPage() {
  const queryClient = useQueryClient();

  return useMutation<EditPageResponse, EditPageError, EditPageInput>({
    mutationFn: async (input: EditPageInput) => {
      const response = await fetch(`/api/pages/${input.pageId}/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: input.type,
          prompt: input.prompt,
          maskDataUrl: input.maskDataUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Throw the full error response for handling in the component
        throw data as EditPageError;
      }

      return data as EditPageResponse;
    },
    onError: (error) => {
      // Only show toast for non-safety errors (safety errors shown inline)
      if (!error.blocked && !error.required) {
        toast.error(error.error || 'Failed to edit page');
      }
    },
    onSuccess: (data, variables) => {
      toast.success('Page edited successfully');
      // Invalidate page and project queries
      queryClient.invalidateQueries({ queryKey: ['page', variables.pageId] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

/**
 * Mutation to restore a specific version
 * Includes optimistic update
 */
export function useRestoreVersion() {
  const queryClient = useQueryClient();

  return useMutation<RestoreVersionResponse, Error, RestoreVersionInput>({
    mutationFn: async (input: RestoreVersionInput) => {
      const response = await fetch(`/api/pages/${input.pageId}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: input.version,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to restore version' }));
        throw new Error(error.error || 'Failed to restore version');
      }

      return response.json();
    },
    onMutate: async (input) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['page', input.pageId] });

      // Snapshot previous value
      const previousPage = queryClient.getQueryData<PageDetailResponse>(['page', input.pageId]);

      // Optimistically update current version
      if (previousPage) {
        queryClient.setQueryData<PageDetailResponse>(['page', input.pageId], {
          ...previousPage,
          page: {
            ...previousPage.page,
            current_version: input.version,
          },
        });
      }

      return { previousPage };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      const ctx = context as { previousPage?: PageDetailResponse } | undefined;
      if (ctx?.previousPage) {
        queryClient.setQueryData(['page', variables.pageId], ctx.previousPage);
      }
      toast.error(error.message || 'Failed to restore version');
    },
    onSuccess: (_data, variables) => {
      toast.success(`Restored to version ${variables.version}`);
      // Invalidate to get fresh data
      queryClient.invalidateQueries({ queryKey: ['page', variables.pageId] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] });
    },
  });
}
