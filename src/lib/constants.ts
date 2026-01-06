import type { Audience, StylePreset, TrimSize } from '@/types/domain';

/**
 * Blot costs for each operation
 * Blots are the currency used in Myjoe for AI operations
 */
export const BLOT_COSTS = {
  generate: 12,      // Generate 1 page
  edit: 12,          // Edit 1 page (any type)
  calibration: 10,   // Style calibration (4 samples)
  hero: 15,          // Hero reference sheet generation
  export: 3,         // Export PDF
} as const;

/**
 * Plan limits for blots and storage
 * Storage limits are in bytes
 */
export const PLAN_LIMITS = {
  free: {
    blots: 50,
    storageBytes: 1073741824, // 1 GB
  },
  starter: {
    blots: 300,
    storageBytes: 5368709120, // 5 GB
  },
  creator: {
    blots: 900,
    storageBytes: 16106127360, // 15 GB
  },
  pro: {
    blots: 2800,
    storageBytes: 53687091200, // 50 GB
  },
} as const;

/**
 * Trim sizes in pixels at 300 DPI
 * Used for KDP-compatible coloring book pages
 */
export const TRIM_SIZES: Record<TrimSize, { width: number; height: number }> = {
  '8.5x11': { width: 2550, height: 3300 },  // 8.5 × 300, 11 × 300
  '8.5x8.5': { width: 2550, height: 2550 },
  '6x9': { width: 1800, height: 2700 },
} as const;

/**
 * Available target audiences for coloring books
 * Determines line weight and complexity automatically
 */
export const AUDIENCES: readonly Audience[] = [
  'toddler',
  'children',
  'tween',
  'teen',
  'adult',
] as const;

/**
 * Available style presets for coloring book generation
 * Each preset has distinct visual characteristics
 */
export const STYLE_PRESETS: readonly StylePreset[] = [
  'bold-simple',
  'kawaii',
  'whimsical',
  'cartoon',
  'botanical',
] as const;

/**
 * Maximum number of pages per project
 * KDP practical limit
 */
export const MAX_PAGES = 45;

/**
 * Maximum number of versions per page
 * Prevents excessive Blot drain
 */
export const MAX_VERSIONS = 10;
