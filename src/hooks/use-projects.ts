'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Database } from '@/lib/supabase/types';
import type { ProjectWithDetails } from '@/server/db/projects';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectsResponse {
  projects: Project[];
}

interface CreateProjectInput {
  name: string;
  description?: string | null;
  pageCount: number;
  audience: 'toddler' | 'children' | 'tween' | 'teen' | 'adult';
  stylePreset: 'bold-simple' | 'kawaii' | 'whimsical' | 'cartoon' | 'botanical';
  trimSize?: '8.5x11' | '8.5x8.5' | '6x9';
  heroId?: string | null;
}

/**
 * Fetch all projects for the current user
 */
export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch projects' }));
        throw new Error(error.error || 'Failed to fetch projects');
      }
      
      const data: ProjectsResponse = await response.json();
      return data.projects;
    },
  });
}

/**
 * Fetch a single project by ID
 */
export function useProject(id: string) {
  return useQuery<ProjectWithDetails>({
    queryKey: ['projects', id],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${id}`);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch project' }));
        throw new Error(error.error || 'Failed to fetch project');
      }
      
      return response.json();
    },
    enabled: !!id,
  });
}

/**
 * Mutation to create a new project
 * Includes optimistic update for immediate UI feedback
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProjectInput): Promise<Project> => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to create project' }));
        throw new Error(error.error || 'Failed to create project');
      }

      return response.json();
    },
    onMutate: async (newProject) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['projects'] });

      // Snapshot previous value
      const previousProjects = queryClient.getQueryData<Project[]>(['projects']);

      // Optimistically add temporary project
      const tempProject: Project = {
        id: `temp-${Date.now()}`,
        owner_id: '', // Will be set by server
        hero_id: newProject.heroId || null,
        name: newProject.name,
        description: newProject.description || null,
        page_count: newProject.pageCount,
        trim_size: newProject.trimSize || '8.5x11',
        audience: newProject.audience,
        style_preset: newProject.stylePreset,
        line_weight: 'thick', // Will be set by server
        complexity: 'minimal', // Will be set by server
        style_anchor_key: null,
        style_anchor_description: null,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };

      queryClient.setQueryData<Project[]>(['projects'], (old = []) => [tempProject, ...old]);

      return { previousProjects };
    },
    onError: (error, _newProject, context) => {
      // Rollback on error
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
      toast.error(error.message || 'Failed to create project');
    },
    onSuccess: () => {
      toast.success('Project created successfully');
    },
    onSettled: () => {
      // Refetch to get real data from server
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/**
 * Mutation to delete a project
 * Includes optimistic removal for immediate UI feedback
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string): Promise<void> => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to delete project' }));
        throw new Error(error.error || 'Failed to delete project');
      }
    },
    onMutate: async (projectId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['projects'] });

      // Snapshot previous value
      const previousProjects = queryClient.getQueryData<Project[]>(['projects']);

      // Optimistically remove project
      queryClient.setQueryData<Project[]>(['projects'], (old = []) =>
        old.filter((project) => project.id !== projectId)
      );

      return { previousProjects };
    },
    onError: (error, _projectId, context) => {
      // Rollback on error
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
      toast.error(error.message || 'Failed to delete project');
    },
    onSuccess: () => {
      toast.success('Project deleted successfully');
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
