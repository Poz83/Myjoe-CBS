import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface LayoutState {
  // Sidebar state (persisted)
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Inspector state (persisted)
  inspectorCollapsed: boolean;
  toggleInspector: () => void;
  setInspectorCollapsed: (collapsed: boolean) => void;

  // Auto-save state (not persisted - transient)
  autoSaveStatus: AutoSaveStatus;
  setAutoSaveStatus: (status: AutoSaveStatus) => void;

  // Blot balance (not persisted - fetched from API)
  blotBalance: number;
  setBlotBalance: (balance: number) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Inspector
      inspectorCollapsed: false,
      toggleInspector: () => set((state) => ({ inspectorCollapsed: !state.inspectorCollapsed })),
      setInspectorCollapsed: (collapsed) => set({ inspectorCollapsed: collapsed }),

      // Auto-save
      autoSaveStatus: 'idle',
      setAutoSaveStatus: (status) => set({ autoSaveStatus: status }),

      // Blot balance
      blotBalance: 0,
      setBlotBalance: (balance) => set({ blotBalance: balance }),
    }),
    {
      name: 'myjoe-layout',
      // Only persist UI preferences, not transient state
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        inspectorCollapsed: state.inspectorCollapsed,
      }),
    }
  )
);
