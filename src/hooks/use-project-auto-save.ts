'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { storage } from '@/lib/storage';
import type { ProjectSettings } from '@/components/features/project/project-settings-panel';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const DRAFT_STORE_KEY = 'draftProjectSettings' as const;
const DB_SAVE_INTERVAL = 30000; // 30 seconds
const DEBOUNCE_DELAY = 500; // 500ms

interface DraftProjectSettings extends ProjectSettings {
  projectId: string;
  savedAt: number;
}

/**
 * Hook for managing project settings auto-save
 * Implements dual save strategy: draft store (instant) + DB (periodic)
 */
export function useProjectAutoSave(
  projectId: string,
  settings: ProjectSettings
) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dbSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<ProjectSettings | null>(null);
  const hasChangesRef = useRef(false);

  // API mutation for saving to DB
  const saveMutation = useMutation({
    mutationFn: async (settingsToSave: ProjectSettings) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: settingsToSave.name,
          page_count: settingsToSave.pageCount,
          trim_size: settingsToSave.trimSize,
          style_preset: settingsToSave.stylePreset,
          audience: settingsToSave.audience,
          line_thickness_pts: settingsToSave.lineThicknessPts,
          line_thickness_auto: settingsToSave.lineThicknessAuto,
          description: settingsToSave.idea || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      return response.json();
    },
    onSuccess: () => {
      setSaveStatus('saved');
      lastSavedRef.current = settings;
      hasChangesRef.current = false;
      
      // Clear saved status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    },
    onError: () => {
      setSaveStatus('error');
    },
  });

  // Save to draft store (instant, localStorage)
  const saveToDraftStore = useCallback((settingsToSave: ProjectSettings) => {
    const draft: DraftProjectSettings = {
      ...settingsToSave,
      projectId,
      savedAt: Date.now(),
    };
    storage.set(DRAFT_STORE_KEY, draft);
  }, [projectId]);

  // Save function (debounced draft store + periodic DB)
  const save = useCallback((settingsToSave: ProjectSettings) => {
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounced draft store save
    debounceTimerRef.current = setTimeout(() => {
      saveToDraftStore(settingsToSave);
      hasChangesRef.current = true;
    }, DEBOUNCE_DELAY);

    // Mark as saving
    if (saveStatus === 'idle') {
      setSaveStatus('saving');
    }
  }, [saveToDraftStore, saveStatus]);

  // Periodic DB save (every 30 seconds if changes exist)
  useEffect(() => {
    if (dbSaveTimerRef.current) {
      clearInterval(dbSaveTimerRef.current);
    }

    dbSaveTimerRef.current = setInterval(() => {
      if (hasChangesRef.current && JSON.stringify(lastSavedRef.current) !== JSON.stringify(settings)) {
        setSaveStatus('saving');
        saveMutation.mutate(settings);
      }
    }, DB_SAVE_INTERVAL);

    return () => {
      if (dbSaveTimerRef.current) {
        clearInterval(dbSaveTimerRef.current);
      }
    };
  }, [settings, saveMutation]);

  // Save on unmount/blur
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasChangesRef.current) {
        saveToDraftStore(settings);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [settings, saveToDraftStore]);

  // Load draft on mount
  useEffect(() => {
    const draft = storage.get(DRAFT_STORE_KEY, null) as DraftProjectSettings | null;
    if (draft && draft.projectId === projectId) {
      // Check if draft is stale (older than 24 hours)
      const STALE_THRESHOLD = 24 * 60 * 60 * 1000;
      if (Date.now() - draft.savedAt < STALE_THRESHOLD) {
        // Draft is still valid - could restore here if needed
        // For now, we'll just use it as a backup
      }
    }
  }, [projectId]);

  return {
    saveStatus,
    save,
  };
}
