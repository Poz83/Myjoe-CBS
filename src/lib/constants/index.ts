import type { Audience, StylePreset, TrimSize, SafetyLevel, FluxModel } from '@/types/domain';

// Re-export types for convenience
export type { Audience, StylePreset, TrimSize, SafetyLevel, FluxModel };

// === BLOT COSTS (REVISED) ===
export const BLOT_COSTS = {
  styleCalibration: 4,      // 4 samples
  heroReferenceSheet: 8,    // Flux-Pro
  generatePage: 5,          // Flux-LineArt
  regeneratePage: 5,
  editPage: 5,
  coverGeneration: 6,
  exportPDF: 0,             // Free export
  // Legacy aliases for backward compatibility
  generate: 5,              // Alias for generatePage
  edit: 5,                  // Alias for editPage
  calibration: 4,           // Alias for styleCalibration
  hero: 8,                  // Alias for heroReferenceSheet
  export: 0,                // Alias for exportPDF
} as const;

// === PLAN LIMITS (REVISED) ===
export const PLAN_LIMITS = {
  free: { blots: 50, storageBytes: 1073741824, priceCents: 0 },
  starter: { blots: 250, storageBytes: 5368709120, priceCents: 900 },
  creator: { blots: 800, storageBytes: 16106127360, priceCents: 2400 },
  pro: { blots: 2500, storageBytes: 53687091200, priceCents: 5900 },
} as const;

// === BLOT PACKS (REVISED) ===
export const BLOT_PACKS = {
  splash: { blots: 100, priceCents: 400 },   // $4
  bucket: { blots: 350, priceCents: 1200 },  // $12
  barrel: { blots: 1200, priceCents: 3500 }, // $35
} as const;

// === TRIM SIZES (300 DPI) ===
export const TRIM_SIZES: Record<TrimSize, { width: number; height: number; aspectRatio: string }> = {
  '8.5x11': { width: 2550, height: 3300, aspectRatio: '3:4' },
  '8.5x8.5': { width: 2550, height: 2550, aspectRatio: '1:1' },
  '6x9': { width: 1800, height: 2700, aspectRatio: '2:3' },
} as const;

// === AUDIENCES ===
export const AUDIENCES: readonly Audience[] = ['toddler', 'children', 'tween', 'teen', 'adult'] as const;

// Legacy alias for backward compatibility
export const AUDIENCE_DNA_MAPPING = {
  toddler: { lineWeight: 'thick' as const, complexity: 'minimal' as const },
  children: { lineWeight: 'thick' as const, complexity: 'moderate' as const },
  tween: { lineWeight: 'medium' as const, complexity: 'moderate' as const },
  teen: { lineWeight: 'medium' as const, complexity: 'detailed' as const },
  adult: { lineWeight: 'fine' as const, complexity: 'intricate' as const },
} as const;

// === STYLE PRESETS ===
export const STYLE_PRESETS: readonly StylePreset[] = ['bold-simple', 'kawaii', 'whimsical', 'cartoon', 'botanical'] as const;

// === AUDIENCE DERIVATIONS (with safety) ===
export const AUDIENCE_DERIVATIONS: Record<Audience, {
  lineWeight: 'thick' | 'medium' | 'fine';
  complexity: 'minimal' | 'moderate' | 'detailed' | 'intricate';
  safetyLevel: SafetyLevel;
  ageRange: string;
  maxElements: number;
}> = {
  toddler: { lineWeight: 'thick', complexity: 'minimal', safetyLevel: 'strict', ageRange: '2-4', maxElements: 5 },
  children: { lineWeight: 'thick', complexity: 'moderate', safetyLevel: 'strict', ageRange: '5-8', maxElements: 10 },
  tween: { lineWeight: 'medium', complexity: 'moderate', safetyLevel: 'moderate', ageRange: '9-12', maxElements: 15 },
  teen: { lineWeight: 'medium', complexity: 'detailed', safetyLevel: 'moderate', ageRange: '13-17', maxElements: 20 },
  adult: { lineWeight: 'fine', complexity: 'intricate', safetyLevel: 'standard', ageRange: '18+', maxElements: 30 },
};

// === FLUX CONFIGURATION ===
export const FLUX_MODELS: Record<FluxModel, string> = {
  'flux-lineart': 'cuuupid/flux-lineart',
  'flux-dev-lora': process.env.FLUX_CUSTOM_MODEL || 'your-username/myjoe-coloring-flux',
  'flux-pro': 'black-forest-labs/flux-1.1-pro',
} as const;

export const FLUX_TRIGGERS: Record<FluxModel, { trigger: string; template: string }> = {
  'flux-lineart': { trigger: '', template: 'line art, black and white, coloring book page' },
  'flux-dev-lora': { trigger: 'c0l0ringb00k', template: 'c0l0ringb00k, coloring book page, black and white line art' },
  'flux-pro': { trigger: '', template: 'coloring book illustration, clean black outlines on white background' },
};

export const LINE_WEIGHT_PROMPTS = {
  thick: 'bold thick black outlines, 6-8 pixel line weight, chunky shapes, prominent lines',
  medium: 'clean medium black outlines, 3-5 pixel line weight, balanced detail',
  fine: 'delicate fine black outlines, 1-3 pixel line weight, intricate details',
} as const;

export const COMPLEXITY_PROMPTS = {
  minimal: '3-5 main elements only, large simple shapes, maximum white space',
  moderate: '5-10 elements, some decorative detail, balanced composition',
  detailed: '10-20 elements, patterns and decorative elements',
  intricate: '20+ elements, fine patterns, mandala-level detail',
} as const;

// === LIMITS ===
export const MAX_PAGES = 45;
export const MAX_VERSIONS = 10;
export const MAX_PROMPT_LENGTH = 500;

// === PROJECT LIMITS (per plan) ===
export const PROJECT_LIMITS = {
  free: 3,
  starter: 10,
  creator: 50,
  pro: Infinity,
} as const;
