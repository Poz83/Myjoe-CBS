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

// === BLOTS PER UNIT (for Stripe unit-based pricing) ===
export const BLOTS_PER_UNIT = 100;

// === TIER CONFIGURATION ===
export const TIERS = {
  free: {
    name: 'Free',
    blots: 50,
    storageGb: 25,
    maxProjects: 3,
    commercial: false,
    prioritySupport: false,
  },
  creator: {
    name: 'Creator',
    storageGb: 25,
    maxProjects: null,
    commercial: true,
    prioritySupport: false,
    unitRate: { monthly: 3.00, yearly: 2.50 },
    blotOptions: [300, 500, 800] as const,
  },
  studio: {
    name: 'Studio',
    storageGb: 50,
    maxProjects: null,
    commercial: true,
    prioritySupport: true,
    unitRate: { monthly: 2.00, yearly: 1.75 },
    blotOptions: [2500, 4000, 5000] as const,
  },
} as const;

// === PLAN TIERS (for UI selectors) ===
export const PLAN_TIERS = {
  creator: [
    { blots: 300, monthly: 9, yearly: 90, popular: false },
    { blots: 500, monthly: 15, yearly: 150, popular: true },
    { blots: 800, monthly: 24, yearly: 240, popular: false },
  ],
  studio: [
    { blots: 2500, monthly: 50, yearly: 525, popular: false },
    { blots: 4000, monthly: 80, yearly: 840, popular: true },
    { blots: 5000, monthly: 100, yearly: 1050, popular: false },
  ],
} as const;

// === PLAN LIMITS (for storage enforcement) ===
export const PLAN_LIMITS = {
  free: { blots: 50, storageBytes: 26843545600, priceCents: 0 },       // 25 GB
  creator: { blots: 800, storageBytes: 26843545600, priceCents: 2400 }, // 25 GB
  studio: { blots: 5000, storageBytes: 53687091200, priceCents: 10000 }, // 50 GB
} as const;

// === BLOT PACKS (from docs: only 2 packs) ===
export const BLOT_PACKS = {
  topup: { name: 'Top-Up', blots: 100, priceCents: 500, emoji: '🎨' },
  boost: { name: 'Boost', blots: 500, priceCents: 2000, emoji: '🚀', popular: true },
} as const;

export type PackId = keyof typeof BLOT_PACKS;
export type TierName = keyof typeof PLAN_TIERS;
export type Tier = keyof typeof TIERS;
export type Interval = 'monthly' | 'yearly';

// === STRIPE PRICE IDS (from env) ===
export const STRIPE_PRICES = {
  creator: {
    monthly: process.env.STRIPE_PRICE_CREATOR_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_CREATOR_ANNUAL || '',
  },
  studio: {
    monthly: process.env.STRIPE_PRICE_STUDIO_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_STUDIO_ANNUAL || '',
  },
  packs: {
    topup: process.env.STRIPE_PRICE_TOPUP || '',
    boost: process.env.STRIPE_PRICE_BOOST || '',
  },
} as const;

// === HELPER FUNCTIONS ===
export function calculatePrice(tier: 'creator' | 'studio', blots: number, interval: Interval): number {
  const units = blots / BLOTS_PER_UNIT;
  const rate = TIERS[tier].unitRate[interval];
  return units * rate;
}

export function blotsToUnits(blots: number): number {
  return blots / BLOTS_PER_UNIT;
}

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
