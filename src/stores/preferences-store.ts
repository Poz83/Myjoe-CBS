import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// Types
// ============================================================================

export type ViewMode = 'grid' | 'list';
export type SortOrder = 'newest' | 'oldest' | 'name' | 'updated';
export type BillingInterval = 'monthly' | 'yearly';
export type SelectedTier = 'creator' | 'studio';

// ============================================================================
// Preferences State
// ============================================================================

interface PreferencesState {
  // Projects view
  projectsView: ViewMode;
  setProjectsView: (view: ViewMode) => void;
  projectsSort: SortOrder;
  setProjectsSort: (sort: SortOrder) => void;

  // Heroes view
  heroesView: ViewMode;
  setHeroesView: (view: ViewMode) => void;
  heroesSort: SortOrder;
  setHeroesSort: (sort: SortOrder) => void;

  // Billing preferences
  billingInterval: BillingInterval;
  setBillingInterval: (interval: BillingInterval) => void;
  selectedTier: SelectedTier;
  setSelectedTier: (tier: SelectedTier) => void;

  // Recent projects (for quick access)
  recentProjects: string[];
  addRecentProject: (projectId: string) => void;
  clearRecentProjects: () => void;

  // Onboarding
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;

  // Dismissed announcements/tooltips
  dismissedItems: string[];
  dismissItem: (itemId: string) => void;
  isItemDismissed: (itemId: string) => boolean;

  // Editor preferences
  showPageNumbers: boolean;
  setShowPageNumbers: (show: boolean) => void;
  autoExpandInspector: boolean;
  setAutoExpandInspector: (auto: boolean) => void;
}

// ============================================================================
// Preferences Store
// ============================================================================

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      // Projects view
      projectsView: 'grid',
      setProjectsView: (view) => set({ projectsView: view }),
      projectsSort: 'newest',
      setProjectsSort: (sort) => set({ projectsSort: sort }),

      // Heroes view
      heroesView: 'grid',
      setHeroesView: (view) => set({ heroesView: view }),
      heroesSort: 'newest',
      setHeroesSort: (sort) => set({ heroesSort: sort }),

      // Billing preferences
      billingInterval: 'monthly',
      setBillingInterval: (interval) => set({ billingInterval: interval }),
      selectedTier: 'creator',
      setSelectedTier: (tier) => set({ selectedTier: tier }),

      // Recent projects (max 5)
      recentProjects: [],
      addRecentProject: (projectId) => {
        const { recentProjects } = get();
        const filtered = recentProjects.filter((id) => id !== projectId);
        const updated = [projectId, ...filtered].slice(0, 5);
        set({ recentProjects: updated });
      },
      clearRecentProjects: () => set({ recentProjects: [] }),

      // Onboarding
      onboardingCompleted: false,
      setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),

      // Dismissed items
      dismissedItems: [],
      dismissItem: (itemId) => {
        const { dismissedItems } = get();
        if (!dismissedItems.includes(itemId)) {
          set({ dismissedItems: [...dismissedItems, itemId] });
        }
      },
      isItemDismissed: (itemId) => get().dismissedItems.includes(itemId),

      // Editor preferences
      showPageNumbers: true,
      setShowPageNumbers: (show) => set({ showPageNumbers: show }),
      autoExpandInspector: true,
      setAutoExpandInspector: (auto) => set({ autoExpandInspector: auto }),
    }),
    {
      name: 'myjoe-preferences',
    }
  )
);

// ============================================================================
// Selector Hooks for Common Use Cases
// ============================================================================

/**
 * Hook for projects list view preferences
 */
export function useProjectsViewPreferences() {
  const {
    projectsView,
    setProjectsView,
    projectsSort,
    setProjectsSort,
  } = usePreferencesStore();

  return {
    view: projectsView,
    setView: setProjectsView,
    sort: projectsSort,
    setSort: setProjectsSort,
    toggleView: () => setProjectsView(projectsView === 'grid' ? 'list' : 'grid'),
  };
}

/**
 * Hook for heroes list view preferences
 */
export function useHeroesViewPreferences() {
  const {
    heroesView,
    setHeroesView,
    heroesSort,
    setHeroesSort,
  } = usePreferencesStore();

  return {
    view: heroesView,
    setView: setHeroesView,
    sort: heroesSort,
    setSort: setHeroesSort,
    toggleView: () => setHeroesView(heroesView === 'grid' ? 'list' : 'grid'),
  };
}

/**
 * Hook for billing preferences
 */
export function useBillingPreferences() {
  const {
    billingInterval,
    setBillingInterval,
    selectedTier,
    setSelectedTier,
  } = usePreferencesStore();

  return {
    interval: billingInterval,
    setInterval: setBillingInterval,
    tier: selectedTier,
    setTier: setSelectedTier,
    isAnnual: billingInterval === 'yearly',
    toggleInterval: () => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly'),
  };
}

/**
 * Hook for recent projects
 */
export function useRecentProjects() {
  const {
    recentProjects,
    addRecentProject,
    clearRecentProjects,
  } = usePreferencesStore();

  return {
    projects: recentProjects,
    add: addRecentProject,
    clear: clearRecentProjects,
    hasRecent: recentProjects.length > 0,
  };
}
