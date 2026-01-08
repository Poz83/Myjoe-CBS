'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ProjectSettings } from '@/components/features/project/project-settings-panel';
import type { Audience, StylePreset, TrimSize } from '@/types/domain';

interface Project {
  id: string;
  name: string;
  page_count: number;
  trim_size: TrimSize;
  style_preset: StylePreset;
  audience: Audience[];
  line_thickness_pts?: number | null;
  line_thickness_auto?: boolean;
  description?: string | null;
}

/**
 * Hook for managing project settings state
 */
export function useProjectSettings(projectId: string) {
  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      return response.json();
    },
  });

  const [settings, setSettings] = useState<ProjectSettings | null>(null);

  // Initialize settings from project data
  useEffect(() => {
    if (project) {
      setSettings({
        name: project.name,
        pageCount: project.page_count,
        trimSize: project.trim_size,
        stylePreset: project.style_preset,
        audience: project.audience,
        lineThicknessPts: project.line_thickness_pts ?? null,
        lineThicknessAuto: project.line_thickness_auto ?? true,
        idea: project.description || '',
      });
    }
  }, [project]);

  return {
    settings,
    isLoading,
    project,
  };
}
