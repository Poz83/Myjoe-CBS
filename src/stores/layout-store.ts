import { create } from 'zustand';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface LayoutState {
  // Sidebar state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Inspector state
  inspectorCollapsed: boolean;
  toggleInspector: () => void;
  setInspectorCollapsed: (collapsed: boolean) => void;

  // Auto-save state
  autoSaveStatus: AutoSaveStatus;
  setAutoSaveStatus: (status: AutoSaveStatus) => void;

  // Blot balance
  blotBalance: number;
  setBlotBalance: (balance: number) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
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
}));
