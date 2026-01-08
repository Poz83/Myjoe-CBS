'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ============================================================================
// Types
// ============================================================================

export type ExportFormat = 'pdf' | 'png_zip';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface StartExportRequest {
  projectId: string;
  format: ExportFormat;
}

export interface StartExportResponse {
  jobId: string;
  status: 'pending';
  totalPages: number;
  correlationId: string;
}

export interface ExportStatusResponse {
  jobId: string;
  status: ExportStatus;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  errorMessage: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  downloadUrl?: string;
  expiresAt?: string;
  fileSize?: number | null;
  format?: ExportFormat;
  correlationId: string;
}

export interface ExportError {
  error: string;
  status?: string;
}

// ============================================================================
// useStartExport - Mutation to start an export job
// ============================================================================

export function useStartExport() {
  const queryClient = useQueryClient();

  return useMutation<StartExportResponse, ExportError, StartExportRequest>({
    mutationFn: async (input: StartExportRequest) => {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        throw data as ExportError;
      }

      return data as StartExportResponse;
    },
    onError: (error) => {
      toast.error(error.error || "Couldn't start export");
    },
    onSuccess: () => {
      toast.success('Export started!');
      // Invalidate profile (even though export is free, for consistency)
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// ============================================================================
// useExportStatus - Poll export job status every 2s
// ============================================================================

export function useExportStatus(jobId: string | null) {
  const query = useQuery<ExportStatusResponse>({
    queryKey: ['export-job', jobId],
    queryFn: async () => {
      const response = await fetch(`/api/export/${jobId}`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Couldn't check export progress" }));
        throw new Error(error.error || "Couldn't check export progress");
      }

      return response.json();
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      // Stop polling if job is finished
      const status = query.state.data?.status;
      if (status === 'completed' || status === 'failed' || status === 'cancelled') {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
    staleTime: 1000,
  });

  return {
    status: query.data?.status || null,
    downloadUrl: query.data?.downloadUrl || null,
    expiresAt: query.data?.expiresAt || null,
    fileSize: query.data?.fileSize || null,
    format: query.data?.format || null,
    errorMessage: query.data?.errorMessage || null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

// ============================================================================
// Helper: Format file size
// ============================================================================

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return 'Unknown size';

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
