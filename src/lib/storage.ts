/**
 * Type-safe localStorage utilities for Myjoe
 * 
 * Usage:
 * ```typescript
 * // Set a value
 * storage.set('recentProjects', ['id1', 'id2']);
 * 
 * // Get a value with default
 * const projects = storage.get('recentProjects', []);
 * 
 * // Remove a value
 * storage.remove('recentProjects');
 * ```
 */

// ============================================================================
// Storage Keys and Types
// ============================================================================

/**
 * Define all localStorage keys and their types here.
 * This ensures type safety across the application.
 */
export interface StorageSchema {
  // Recent projects for quick access
  recentProjects: string[];
  
  // Draft data for forms (prevents data loss on refresh)
  draftProject: DraftProject | null;
  draftProjectSettings: DraftProjectSettings | null;
  draftHero: DraftHero | null;
  draftPrompt: DraftPrompt | null;
  
  // View preferences
  projectsView: 'grid' | 'list';
  projectsSort: 'newest' | 'oldest' | 'name' | 'updated';
  heroesView: 'grid' | 'list';
  
  // Billing interval preference
  billingInterval: 'monthly' | 'yearly';
  
  // Last selected tier
  lastSelectedTier: 'creator' | 'studio';
  
  // Onboarding
  onboardingCompleted: boolean;
  
  // Feature announcements dismissed
  dismissedAnnouncements: string[];
}

// Draft types
export interface DraftProject {
  name: string;
  description: string;
  pageCount: number;
  audience: string;
  stylePreset: string;
  trimSize: string;
  heroId: string | null;
  savedAt: number; // timestamp
}

export interface DraftHero {
  name: string;
  description: string;
  audience: string;
  savedAt: number;
}

export interface DraftPrompt {
  projectId: string;
  pageId?: string;
  prompt: string;
  type: 'generation' | 'edit' | 'regenerate';
  savedAt: number;
}

export interface DraftProjectSettings {
  projectId: string;
  name: string;
  pageCount: number;
  trimSize: string;
  stylePreset: string;
  audience: string[];
  lineThicknessPts: number | null;
  lineThicknessAuto: boolean;
  idea: string;
  savedAt: number;
}

// ============================================================================
// Storage Utilities
// ============================================================================

const STORAGE_PREFIX = 'myjoe_';

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get prefixed key
 */
function getKey<K extends keyof StorageSchema>(key: K): string {
  return `${STORAGE_PREFIX}${key}`;
}

/**
 * Get a value from localStorage with type safety
 */
function get<K extends keyof StorageSchema>(
  key: K,
  defaultValue: StorageSchema[K]
): StorageSchema[K] {
  if (!isLocalStorageAvailable()) return defaultValue;

  try {
    const item = window.localStorage.getItem(getKey(key));
    if (item === null) return defaultValue;
    return JSON.parse(item) as StorageSchema[K];
  } catch {
    return defaultValue;
  }
}

/**
 * Set a value in localStorage with type safety
 */
function set<K extends keyof StorageSchema>(
  key: K,
  value: StorageSchema[K]
): boolean {
  if (!isLocalStorageAvailable()) return false;

  try {
    window.localStorage.setItem(getKey(key), JSON.stringify(value));
    return true;
  } catch {
    // Storage might be full or blocked
    console.warn(`Failed to save to localStorage: ${key}`);
    return false;
  }
}

/**
 * Remove a value from localStorage
 */
function remove<K extends keyof StorageSchema>(key: K): boolean {
  if (!isLocalStorageAvailable()) return false;

  try {
    window.localStorage.removeItem(getKey(key));
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all Myjoe storage
 */
function clear(): boolean {
  if (!isLocalStorageAvailable()) return false;

  try {
    const keys = Object.keys(window.localStorage);
    for (const key of keys) {
      if (key.startsWith(STORAGE_PREFIX)) {
        window.localStorage.removeItem(key);
      }
    }
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Add a project ID to recent projects (max 5)
 */
function addRecentProject(projectId: string): void {
  const recent = get('recentProjects', []);
  const filtered = recent.filter((id) => id !== projectId);
  const updated = [projectId, ...filtered].slice(0, 5);
  set('recentProjects', updated);
}

/**
 * Save a draft project (auto-save)
 */
function saveDraftProject(draft: Omit<DraftProject, 'savedAt'>): void {
  set('draftProject', { ...draft, savedAt: Date.now() });
}

/**
 * Get and clear a draft project
 */
function consumeDraftProject(): DraftProject | null {
  const draft = get('draftProject', null);
  if (draft) {
    remove('draftProject');
  }
  return draft;
}

/**
 * Save a draft hero (auto-save)
 */
function saveDraftHero(draft: Omit<DraftHero, 'savedAt'>): void {
  set('draftHero', { ...draft, savedAt: Date.now() });
}

/**
 * Get and clear a draft hero
 */
function consumeDraftHero(): DraftHero | null {
  const draft = get('draftHero', null);
  if (draft) {
    remove('draftHero');
  }
  return draft;
}

/**
 * Save a draft prompt (auto-save)
 */
function saveDraftPrompt(draft: Omit<DraftPrompt, 'savedAt'>): void {
  set('draftPrompt', { ...draft, savedAt: Date.now() });
}

/**
 * Get and clear a draft prompt for a specific context
 */
function consumeDraftPrompt(projectId: string, pageId?: string): DraftPrompt | null {
  const draft = get('draftPrompt', null);
  if (draft && draft.projectId === projectId && (!pageId || draft.pageId === pageId)) {
    remove('draftPrompt');
    return draft;
  }
  return null;
}

/**
 * Check if a draft is stale (older than 24 hours)
 */
function isDraftStale(savedAt: number): boolean {
  const STALE_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours
  return Date.now() - savedAt > STALE_THRESHOLD;
}

/**
 * Clean up stale drafts
 */
function cleanupStaleDrafts(): void {
  const draftProject = get('draftProject', null);
  if (draftProject && isDraftStale(draftProject.savedAt)) {
    remove('draftProject');
  }

  const draftHero = get('draftHero', null);
  if (draftHero && isDraftStale(draftHero.savedAt)) {
    remove('draftHero');
  }

  const draftPrompt = get('draftPrompt', null);
  if (draftPrompt && isDraftStale(draftPrompt.savedAt)) {
    remove('draftPrompt');
  }
}

// ============================================================================
// Export
// ============================================================================

export const storage = {
  get,
  set,
  remove,
  clear,
  isAvailable: isLocalStorageAvailable,
  
  // Convenience methods
  addRecentProject,
  saveDraftProject,
  consumeDraftProject,
  saveDraftHero,
  consumeDraftHero,
  saveDraftPrompt,
  consumeDraftPrompt,
  isDraftStale,
  cleanupStaleDrafts,
};
