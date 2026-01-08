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

// === TIER CONFIGURATION (Semi-Aggressive Pricing - Corbin Method) ===
export const TIERS = {
  free: {
    name: 'Free',
    blots: 75,
    storageGb: 25,
    maxProjects: 3,
    commercial: false,
    commercialProjectsAllowed: 1, // One-time trial for KDP testing
    watermark: true,
    prioritySupport: false,
  },
  creator: {
    name: 'Creator',
    storageGb: 25,
    maxProjects: null,
    commercial: true,
    watermark: false,
    prioritySupport: false,
    unitRate: { monthly: 1.60, yearly: 1.28 }, // 20% annual discount
    blotOptions: [500, 1000, 2000, 3000, 4500] as const,
  },
  studio: {
    name: 'Studio',
    storageGb: 50,
    maxProjects: null,
    commercial: true,
    watermark: false,
    prioritySupport: true,
    unitRate: { monthly: 1.00, yearly: 0.80 }, // 20% annual discount
    blotOptions: [7500, 10000, 15000] as const,
  },
} as const;

// === PLAN TIERS (for UI dropdown selectors - Corbin Method) ===
export const PLAN_TIERS = {
  creator: [
    { blots: 500, monthly: 8, yearly: 76.80, popular: false },
    { blots: 1000, monthly: 16, yearly: 153.60, popular: true },
    { blots: 2000, monthly: 32, yearly: 307.20, popular: false },
    { blots: 3000, monthly: 48, yearly: 460.80, popular: false },
    { blots: 4500, monthly: 72, yearly: 691.20, popular: false }, // CEILING
  ],
  studio: [
    { blots: 7500, monthly: 75, yearly: 720, popular: false },
    { blots: 10000, monthly: 100, yearly: 960, popular: true },
    { blots: 15000, monthly: 150, yearly: 1440, popular: false },
  ],
} as const;

// === PLAN LIMITS (for storage enforcement) ===
export const PLAN_LIMITS = {
  free: { blots: 75, storageBytes: 26843545600, priceCents: 0 },        // 25 GB
  creator: { blots: 4500, storageBytes: 26843545600, priceCents: 7200 }, // 25 GB, max tier
  studio: { blots: 15000, storageBytes: 53687091200, priceCents: 15000 }, // 50 GB, max tier
} as const;

// BLOT_PACKS removed - using Corbin's 2-tier dropdown method instead

export type TierName = keyof typeof PLAN_TIERS;
export type Tier = keyof typeof TIERS;
export type Interval = 'monthly' | 'yearly';

// === STRIPE PRICE IDS (from env) ===
// Semi-aggressive pricing (20% annual discount):
// - creator_monthly: $1.60/unit → price_1Sn7ZDRb0thGyayr2gQNFGlL
// - creator_annual:  $1.28/unit → price_1Sn7ZDRb0thGyayrokJSnZFC
// - studio_monthly:  $1.00/unit → price_1Sn7ZDRb0thGyayrnIANu0F8
// - studio_annual:   $0.80/unit → price_1Sn7ZDRb0thGyayrWRlIdXdl
export const STRIPE_PRICES = {
  creator: {
    monthly: process.env.STRIPE_PRICE_CREATOR_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_CREATOR_ANNUAL || '',
  },
  studio: {
    monthly: process.env.STRIPE_PRICE_STUDIO_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_STUDIO_ANNUAL || '',
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

// === GENERATION DEFAULTS ===
export const GENERATION_DEFAULTS = {
  MAX_RETRIES: 2,
  MAX_RETRIES_LIMIT: 10,
  CHILD_AUDIENCES: ['toddler', 'children'] as const,
  RETRY_DELAYS: [1000, 2000, 4000] as const, // 1s, 2s, 4s
} as const;

// === PROJECT LIMITS (per plan) ===
export const PROJECT_LIMITS = {
  free: 3,
  creator: null, // Unlimited
  studio: null,  // Unlimited
} as const;
