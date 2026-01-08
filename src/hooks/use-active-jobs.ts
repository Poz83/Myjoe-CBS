'use client';

import { useQuery } from '@tanstack/react-query';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface ActiveJob {
  id: string;
  projectId: string;
  type: 'generation' | 'export' | 'hero_creation' | 'calibration';
  status: JobStatus;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  createdAt: string;
  startedAt: string | null;
}

/**
 * Check for active jobs on page load.
 * Useful for resuming polling after browser close/refresh.
 * 
 * @param projectId - Optional project ID to filter jobs
 */
export function useActiveJobs(projectId?: string) {
  return useQuery({
    queryKey: ['active-jobs', projectId],
    queryFn: async (): Promise<ActiveJob[]> => {
      const params = new URLSearchParams();
      if (projectId) {
        params.set('projectId', projectId);
      }
      params.set('status', 'pending,processing');

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) {
        // Don't throw for 404 - might just mean no jobs endpoint
        if (res.status === 404) return [];
        throw new Error('Failed to fetch active jobs');
      }
      
      const data = await res.json();
      return data.jobs || [];
    },
    staleTime: 5000, // Check every 5 seconds on mount
    refetchOnWindowFocus: true, // Refetch when tab becomes active (concurrent tabs)
    retry: false, // Don't retry if endpoint doesn't exist
  });
}

/**
 * Get the most recent active job for a project
 */
export function useActiveProjectJob(projectId: string) {
  const { data: jobs, isLoading, error } = useActiveJobs(projectId);
  
  const activeJob = jobs?.find(
    (job) => 
      job.projectId === projectId && 
      (job.status === 'pending' || job.status === 'processing')
  ) || null;

  return {
    activeJob,
    isLoading,
    error,
  };
}
