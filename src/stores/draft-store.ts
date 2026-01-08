import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DraftProject, DraftHero, DraftPrompt } from '@/lib/storage';

// ============================================================================
// Draft Store State
// ============================================================================

interface DraftState {
  // Project creation draft
  projectDraft: DraftProject | null;
  setProjectDraft: (draft: Omit<DraftProject, 'savedAt'> | null) => void;
  clearProjectDraft: () => void;

  // Hero creation draft
  heroDraft: DraftHero | null;
  setHeroDraft: (draft: Omit<DraftHero, 'savedAt'> | null) => void;
  clearHeroDraft: () => void;

  // Generation/edit prompt draft
  promptDraft: DraftPrompt | null;
  setPromptDraft: (draft: Omit<DraftPrompt, 'savedAt'> | null) => void;
  clearPromptDraft: () => void;
  
  // Get prompt draft for specific context
  getPromptDraftFor: (projectId: string, pageId?: string) => DraftPrompt | null;

  // Cleanup stale drafts (older than 24 hours)
  cleanupStale: () => void;
}

// ============================================================================
// Helper
// ============================================================================

const STALE_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours

function isStale(savedAt: number): boolean {
  return Date.now() - savedAt > STALE_THRESHOLD;
}

// ============================================================================
// Draft Store
// ============================================================================

export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      // Project draft
      projectDraft: null,
      setProjectDraft: (draft) => {
        if (draft === null) {
          set({ projectDraft: null });
        } else {
          set({ projectDraft: { ...draft, savedAt: Date.now() } });
        }
      },
      clearProjectDraft: () => set({ projectDraft: null }),

      // Hero draft
      heroDraft: null,
      setHeroDraft: (draft) => {
        if (draft === null) {
          set({ heroDraft: null });
        } else {
          set({ heroDraft: { ...draft, savedAt: Date.now() } });
        }
      },
      clearHeroDraft: () => set({ heroDraft: null }),

      // Prompt draft
      promptDraft: null,
      setPromptDraft: (draft) => {
        if (draft === null) {
          set({ promptDraft: null });
        } else {
          set({ promptDraft: { ...draft, savedAt: Date.now() } });
        }
      },
      clearPromptDraft: () => set({ promptDraft: null }),

      // Get prompt draft for specific context
      getPromptDraftFor: (projectId, pageId) => {
        const { promptDraft } = get();
        if (!promptDraft) return null;
        if (promptDraft.projectId !== projectId) return null;
        if (pageId && promptDraft.pageId !== pageId) return null;
        return promptDraft;
      },

      // Cleanup stale drafts
      cleanupStale: () => {
        const { projectDraft, heroDraft, promptDraft } = get();
        const updates: Partial<DraftState> = {};

        if (projectDraft && isStale(projectDraft.savedAt)) {
          updates.projectDraft = null;
        }
        if (heroDraft && isStale(heroDraft.savedAt)) {
          updates.heroDraft = null;
        }
        if (promptDraft && isStale(promptDraft.savedAt)) {
          updates.promptDraft = null;
        }

        if (Object.keys(updates).length > 0) {
          set(updates);
        }
      },
    }),
    {
      name: 'myjoe-drafts',
    }
  )
);

// ============================================================================
// Hooks for Specific Draft Types
// ============================================================================

/**
 * Hook for managing project creation draft
 * Auto-saves form data to localStorage
 */
export function useProjectDraft() {
  const { projectDraft, setProjectDraft, clearProjectDraft } = useDraftStore();

  return {
    draft: projectDraft,
    saveDraft: setProjectDraft,
    clearDraft: clearProjectDraft,
    hasDraft: projectDraft !== null,
    isStale: projectDraft ? isStale(projectDraft.savedAt) : false,
  };
}

/**
 * Hook for managing hero creation draft
 * Auto-saves form data to localStorage
 */
export function useHeroDraft() {
  const { heroDraft, setHeroDraft, clearHeroDraft } = useDraftStore();

  return {
    draft: heroDraft,
    saveDraft: setHeroDraft,
    clearDraft: clearHeroDraft,
    hasDraft: heroDraft !== null,
    isStale: heroDraft ? isStale(heroDraft.savedAt) : false,
  };
}

/**
 * Hook for managing prompt draft (generation/edit)
 * Auto-saves prompt text to localStorage
 */
export function usePromptDraft(projectId: string, pageId?: string) {
  const { getPromptDraftFor, setPromptDraft, clearPromptDraft } = useDraftStore();

  const draft = getPromptDraftFor(projectId, pageId);

  return {
    draft,
    prompt: draft?.prompt || '',
    saveDraft: (prompt: string, type: 'generation' | 'edit' | 'regenerate') => {
      setPromptDraft({ projectId, pageId, prompt, type });
    },
    clearDraft: clearPromptDraft,
    hasDraft: draft !== null,
  };
}
