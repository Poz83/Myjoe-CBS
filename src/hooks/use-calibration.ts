'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CalibrationSample {
  id: string;
  url: string;
}

interface GenerateCalibrationResponse {
  samples: CalibrationSample[];
  blotsSpent: number;
}

interface SelectStyleAnchorResponse {
  styleAnchorUrl: string;
  styleAnchorDescription: string;
}

/**
 * Mutation to generate 4 style calibration samples
 * Calls POST /api/projects/[id]/calibrate
 */
export function useGenerateCalibration(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<GenerateCalibrationResponse> => {
      const response = await fetch(`/api/projects/${projectId}/calibrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to generate samples' }));
        
        // Handle insufficient blots specifically
        if (response.status === 402) {
          throw new Error(`Insufficient blots. Need ${error.required}, have ${error.current}`);
        }
        
        throw new Error(error.error || 'Failed to generate calibration samples');
      }

      return response.json();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate calibration samples');
    },
    onSuccess: (data) => {
      toast.success(`Generated ${data.samples.length} style samples (${data.blotsSpent} blots spent)`);
      // Invalidate profile to refresh blot balance
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

/**
 * Mutation to select a style anchor from calibration samples
 * Calls POST /api/projects/[id]/calibrate/select
 */
export function useSelectStyleAnchor(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (selectedId: string): Promise<SelectStyleAnchorResponse> => {
      const response = await fetch(`/api/projects/${projectId}/calibrate/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedId }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to select style' }));
        throw new Error(error.error || 'Failed to select style anchor');
      }

      return response.json();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to set style anchor');
    },
    onSuccess: () => {
      toast.success('Style anchor set successfully!');
      // Invalidate project query to refresh style_anchor_key
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}

export type { CalibrationSample, GenerateCalibrationResponse, SelectStyleAnchorResponse };
