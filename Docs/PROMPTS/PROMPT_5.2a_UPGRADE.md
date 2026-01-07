# SPECIAL PROMPT 5.2a - Upgrade to Flux + Safety

> **USE THIS PROMPT NOW** - You have completed prompts 1 through 5.2.
> This prompt upgrades your existing codebase to use Flux + Safety before continuing.

---

## Prompt 5.2a - Upgrade AI Pipeline to Flux + Safety

```
I'm building Myjoe. I've completed prompts 1 through 5.2.

I need to UPGRADE my AI pipeline to:
1. Use Flux via Replicate instead of GPT Image 1.5 (67% cheaper)
2. Add multi-layer content safety for children's books
3. Add Blot Packs (one-time purchases)

## STEP 1: Install new dependencies

npm install replicate

## STEP 2: Add new environment variables

Add to .env.local:
REPLICATE_API_TOKEN=your_token_here
FLUX_MODEL=flux-lineart

Add to .env.example:
# Replicate (Flux image generation)
REPLICATE_API_TOKEN=
FLUX_MODEL=flux-lineart

# Blot Packs
STRIPE_PRICE_SPLASH=
STRIPE_PRICE_BUCKET=
STRIPE_PRICE_BARREL=

## STEP 3: Update src/lib/constants/index.ts

Replace the entire file with:

```typescript
// === BLOT COSTS (REVISED) ===
export const BLOT_COSTS = {
  styleCalibration: 4,      // 4 samples
  heroReferenceSheet: 8,    // Flux-Pro
  generatePage: 5,          // Flux-LineArt
  regeneratePage: 5,
  editPage: 5,
  coverGeneration: 6,
  exportPDF: 0,             // FREE - don't charge for downloads
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
export const TRIM_SIZES = {
  '8.5x11': { width: 2550, height: 3300, aspectRatio: '3:4' },
  '8.5x8.5': { width: 2550, height: 2550, aspectRatio: '1:1' },
  '6x9': { width: 1800, height: 2700, aspectRatio: '2:3' },
} as const;

// === AUDIENCES ===
export const AUDIENCES = ['toddler', 'children', 'tween', 'teen', 'adult'] as const;
export type Audience = (typeof AUDIENCES)[number];

// === STYLE PRESETS ===
export const STYLE_PRESETS = ['bold-simple', 'kawaii', 'whimsical', 'cartoon', 'botanical'] as const;
export type StylePreset = (typeof STYLE_PRESETS)[number];

// === SAFETY LEVELS ===
export type SafetyLevel = 'strict' | 'moderate' | 'standard';

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
export const FLUX_MODELS = {
  'flux-lineart': 'cuuupid/flux-lineart',
  'flux-dev-lora': process.env.FLUX_CUSTOM_MODEL || 'your-username/myjoe-coloring-flux',
  'flux-pro': 'black-forest-labs/flux-1.1-pro',
} as const;

export type FluxModel = keyof typeof FLUX_MODELS;

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
```

## STEP 4: Create src/lib/constants/forbidden-content.ts

```typescript
import type { Audience } from './index';

export const FORBIDDEN_BY_AUDIENCE: Record<Audience, string[]> = {
  toddler: [
    'scary', 'monster', 'weapon', 'gun', 'sword', 'knife', 'fight', 'attack',
    'blood', 'violence', 'war', 'battle', 'kill', 'dead', 'death',
    'ghost', 'zombie', 'skeleton', 'skull', 'demon', 'devil', 'witch',
    'vampire', 'werewolf', 'spider', 'snake', 'shark',
    'fire', 'explosion', 'danger', 'falling', 'drowning',
    'crying', 'sad', 'angry', 'screaming', 'nightmare', 'terrified',
    'adult', 'sexy', 'naked', 'beer', 'wine', 'cigarette'
  ],
  children: [
    'scary monster', 'realistic weapon', 'blood', 'gore', 'death scene',
    'violence', 'fighting', 'war', 'battle', 'killing',
    'horror', 'zombie', 'demon', 'devil', 'evil spirit',
    'frightening', 'terrifying', 'nightmare',
    'adult content', 'romance', 'kissing', 'sexy',
    'drug', 'alcohol', 'smoking', 'gambling'
  ],
  tween: [
    'graphic violence', 'gore', 'blood', 'death',
    'adult content', 'sexual', 'suggestive',
    'drug use', 'alcohol', 'smoking',
    'self-harm', 'suicide', 'eating disorder'
  ],
  teen: [
    'explicit violence', 'gore', 'torture',
    'sexual content', 'nudity', 'pornographic',
    'drug use', 'drug paraphernalia',
    'self-harm', 'suicide methods',
    'hate symbols', 'extremist content'
  ],
  adult: [
    'explicit sexual content', 'pornography',
    'child exploitation', 'CSAM',
    'hate symbols', 'extremist propaganda',
    'real violence', 'torture',
    'illegal content', 'drug manufacturing'
  ]
};

export const SAFE_SUGGESTIONS: Record<Audience, string[]> = {
  toddler: [
    'Try: "cute farm animals playing"',
    'Try: "happy vehicles in a town"',
    'Try: "friendly dinosaur with flowers"'
  ],
  children: [
    'Try: "brave knight saving a friendly dragon"',
    'Try: "underwater mermaid palace"',
    'Try: "space adventure with rockets"'
  ],
  tween: [
    'Try: "fantasy castle with mythical creatures"',
    'Try: "sports action scene"',
    'Try: "ocean wildlife adventure"'
  ],
  teen: [
    'Try: "anime-style character portrait"',
    'Try: "geometric abstract patterns"',
    'Try: "gothic architecture scene"'
  ],
  adult: [
    'Try: "intricate mandala pattern"',
    'Try: "botanical garden illustration"',
    'Try: "art nouveau decorative design"'
  ]
};
```

## STEP 5: Create src/server/ai/sanitize.ts

```typescript
export function sanitizePrompt(input: string): string {
  let clean = input;
  
  const injections = [
    /ignore (previous|all|above) instructions/gi,
    /disregard (everything|all|previous)/gi,
    /forget (everything|all|previous)/gi,
    /new (instructions|rules|prompt):/gi,
    /system\s*:/gi,
    /assistant\s*:/gi,
    /\[INST\].*?\[\/INST\]/gs,
    /<\|.*?\|>/g,
    /```[\s\S]*?```/g,
  ];
  
  for (const pattern of injections) {
    clean = clean.replace(pattern, '');
  }
  
  clean = clean
    .replace(/[<>{}[\]\\]/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return clean.slice(0, 500);
}

export function validateIdea(idea: string): { valid: boolean; reason?: string } {
  if (idea.length < 3) return { valid: false, reason: 'Please provide more detail' };
  if (idea.length > 500) return { valid: false, reason: 'Please shorten (max 500 chars)' };
  
  const hasVisual = /\b(animal|character|scene|place|object|person|creature|plant|flower|vehicle|building|dragon|princess|robot|dinosaur|cat|dog|bird|fish|house|castle|forest|ocean|space|garden)\b/i.test(idea);
  if (!hasVisual) return { valid: false, reason: 'Please describe something visual' };
  
  return { valid: true };
}
```

## STEP 6: Create src/server/ai/content-safety.ts

```typescript
import OpenAI from 'openai';
import { AUDIENCE_DERIVATIONS } from '@/lib/constants';
import type { Audience, SafetyLevel } from '@/lib/constants';
import { FORBIDDEN_BY_AUDIENCE, SAFE_SUGGESTIONS } from '@/lib/constants/forbidden-content';

const openai = new OpenAI();

export interface SafetyResult {
  safe: boolean;
  blocked: string[];
  suggestions?: string[];
}

const THRESHOLDS: Record<SafetyLevel, Record<string, number>> = {
  strict: { violence: 0.05, 'violence/graphic': 0.01, sexual: 0.01, hate: 0.05, 'self-harm': 0.05 },
  moderate: { violence: 0.20, 'violence/graphic': 0.10, sexual: 0.10, hate: 0.20, 'self-harm': 0.15 },
  standard: { violence: 0.50, 'violence/graphic': 0.30, sexual: 0.30, hate: 0.40, 'self-harm': 0.30 },
};

export async function checkContentSafety(input: string, audience: Audience): Promise<SafetyResult> {
  const rules = AUDIENCE_DERIVATIONS[audience];
  const forbidden = FORBIDDEN_BY_AUDIENCE[audience];
  
  // Layer 1: Keyword blocklist (instant, free)
  const lowerInput = input.toLowerCase();
  const blocked = forbidden.filter(word => lowerInput.includes(word.toLowerCase()));
  
  if (blocked.length > 0) {
    return { safe: false, blocked, suggestions: SAFE_SUGGESTIONS[audience] };
  }
  
  // Layer 2: OpenAI Moderation API (free)
  try {
    const moderation = await openai.moderations.create({ input });
    const result = moderation.results[0];
    const thresholds = THRESHOLDS[rules.safetyLevel];
    
    const violations: string[] = [];
    
    if (result.category_scores.violence > thresholds.violence) violations.push('violence');
    if (result.category_scores['violence/graphic'] > thresholds['violence/graphic']) violations.push('graphic violence');
    if (result.category_scores.sexual > thresholds.sexual) violations.push('sexual content');
    if (result.category_scores['sexual/minors'] > 0.01) violations.push('child safety');
    if (result.category_scores.hate > thresholds.hate) violations.push('hate content');
    if (result.category_scores['self-harm'] > thresholds['self-harm']) violations.push('self-harm');
    
    if (violations.length > 0) {
      return { safe: false, blocked: violations, suggestions: SAFE_SUGGESTIONS[audience] };
    }
  } catch (error) {
    console.error('Moderation API error:', error);
    // Continue without moderation if API fails
  }
  
  return { safe: true, blocked: [] };
}
```

## STEP 7: Create src/server/ai/flux-generator.ts

```typescript
import Replicate from 'replicate';
import { FLUX_MODELS, TRIM_SIZES } from '@/lib/constants';
import type { FluxModel } from '@/lib/constants';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

interface GenerateOptions {
  compiledPrompt: string;
  negativePrompt: string;
  fluxModel: FluxModel;
  trimSize: string;
  seed?: number;
}

interface GenerationResult {
  success: boolean;
  imageUrl?: string;
  seed?: number;
  error?: string;
}

export async function generateWithFlux(options: GenerateOptions): Promise<GenerationResult> {
  const { compiledPrompt, negativePrompt, fluxModel, trimSize, seed } = options;
  
  const model = FLUX_MODELS[fluxModel];
  const dimensions = TRIM_SIZES[trimSize as keyof typeof TRIM_SIZES] || TRIM_SIZES['8.5x11'];
  
  const params: Record<string, unknown> = {
    prompt: compiledPrompt,
    negative_prompt: negativePrompt,
    num_inference_steps: 28,
    guidance_scale: 3.5,
    output_format: 'png',
    output_quality: 95,
    seed: seed ?? Math.floor(Math.random() * 2147483647),
    aspect_ratio: dimensions.aspectRatio,
  };
  
  try {
    const output = await replicate.run(model as `${string}/${string}`, { input: params });
    const imageUrl = Array.isArray(output) ? output[0] : output;
    
    return {
      success: true,
      imageUrl: imageUrl as string,
      seed: params.seed as number,
    };
  } catch (error) {
    console.error('Flux generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    };
  }
}

export async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to download image');
  return Buffer.from(await response.arrayBuffer());
}
```

## STEP 8: Create src/server/ai/image-safety-check.ts

```typescript
import OpenAI from 'openai';
import { AUDIENCE_DERIVATIONS } from '@/lib/constants';
import type { Audience } from '@/lib/constants';

const openai = new OpenAI();

interface ImageSafetyResult {
  safe: boolean;
  issues: string[];
  recommendation: 'approve' | 'regenerate' | 'flag';
}

export async function checkGeneratedImageSafety(
  imageUrl: string,
  audience: Audience
): Promise<ImageSafetyResult> {
  // Only run for strict audiences (toddler, children)
  if (!['toddler', 'children'].includes(audience)) {
    return { safe: true, issues: [], recommendation: 'approve' };
  }
  
  const rules = AUDIENCE_DERIVATIONS[audience];
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You review coloring book images for children (ages ${rules.ageRange}).

Flag ANY of these:
- Scary or frightening elements
- Weapons or violence
- Monsters that could frighten children
- Dark or disturbing themes
- Inappropriate content

Respond ONLY with JSON:
{"safe": boolean, "issues": ["list"], "recommendation": "approve"|"regenerate"|"flag"}`
        },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl } },
            { type: 'text', text: `Is this safe for ${audience} (ages ${rules.ageRange})?` }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });
    
    const content = response.choices[0].message.content;
    return content ? JSON.parse(content) : { safe: true, issues: [], recommendation: 'approve' };
    
  } catch (error) {
    console.error('Image safety check failed:', error);
    return { safe: false, issues: ['Unable to verify'], recommendation: 'flag' };
  }
}
```

## STEP 9: Update src/server/ai/style-calibration.ts

Replace your existing calibration file with Flux-powered version:

```typescript
import { generateWithFlux, downloadImage } from './flux-generator';
import { cleanupImage } from './cleanup';
import { FLUX_TRIGGERS, LINE_WEIGHT_PROMPTS, AUDIENCE_DERIVATIONS } from '@/lib/constants';
import type { Audience, StylePreset, FluxModel } from '@/lib/constants';

interface CalibrationInput {
  subject: string;
  audience: Audience;
  stylePreset: StylePreset;
  fluxModel?: FluxModel;
}

interface CalibrationSample {
  id: string;
  imageBuffer: Buffer;
  variation: string;
}

const VARIATIONS = [
  'balanced interpretation',
  'more detailed with decorative accents',
  'simpler with bolder shapes',
  'more playful with curved lines',
];

export async function generateCalibrationSamples(
  input: CalibrationInput
): Promise<CalibrationSample[]> {
  const { subject, audience, stylePreset, fluxModel = 'flux-lineart' } = input;
  
  const rules = AUDIENCE_DERIVATIONS[audience];
  const fluxConfig = FLUX_TRIGGERS[fluxModel];
  const linePrompt = LINE_WEIGHT_PROMPTS[rules.lineWeight];
  
  const samples: CalibrationSample[] = [];
  
  for (let i = 0; i < 4; i++) {
    const variation = VARIATIONS[i];
    
    const prompt = [
      fluxConfig.trigger || fluxConfig.template,
      subject,
      'coloring book page',
      linePrompt,
      `${stylePreset} style`,
      variation,
      'pure black outlines on white background',
      'no shading, no gradients',
    ].filter(Boolean).join(', ');
    
    const negativePrompt = 'shading, gradient, gray, color, photorealistic, 3D, blurry';
    
    const result = await generateWithFlux({
      compiledPrompt: prompt,
      negativePrompt,
      fluxModel,
      trimSize: '8.5x11',
    });
    
    if (result.success && result.imageUrl) {
      const rawBuffer = await downloadImage(result.imageUrl);
      const cleanedBuffer = await cleanupImage(rawBuffer, {
        targetWidth: 512,
        targetHeight: 512,
      });
      
      samples.push({
        id: String(i + 1),
        imageBuffer: cleanedBuffer,
        variation,
      });
    }
  }
  
  return samples;
}
```

## STEP 10: Add database migration for Blot Packs

Create supabase/migrations/003_blot_packs.sql:

```sql
-- Blot Pack Purchases
CREATE TABLE blot_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_id TEXT NOT NULL,
  blots INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blot_purchases_owner ON blot_purchases(owner_id);

-- RLS
ALTER TABLE blot_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON blot_purchases FOR SELECT
  USING (auth.uid() = owner_id);

-- Helper function to add blots
CREATE OR REPLACE FUNCTION add_blots(p_user_id UUID, p_amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET blots = blots + p_amount 
  WHERE owner_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Run the migration:
npx supabase db push

## STEP 11: Add SafetyBlockedError to src/lib/errors.ts

Add to your existing errors file:

```typescript
export class SafetyBlockedError extends AppError {
  suggestions: string[];
  
  constructor(message: string, suggestions: string[] = []) {
    super(message, 400);
    this.suggestions = suggestions;
  }
}
```

## VERIFICATION

After completing all steps:

1. Check that `npm run dev` works without errors
2. Verify new files exist:
   - src/lib/constants/forbidden-content.ts
   - src/server/ai/sanitize.ts
   - src/server/ai/content-safety.ts
   - src/server/ai/flux-generator.ts
   - src/server/ai/image-safety-check.ts
3. Verify environment variables are set in .env.local

Generate all these files now.
```

---

## After Running This Prompt

```bash
git add .
git commit -m "feat(5.2a): upgrade to Flux + Safety system"
git push origin main
```

Then continue with **Prompt 5.3** from the updated PROMPTS_3-6.md file.

---

## Cost Comparison

| Before (GPT Image 1.5) | After (Flux-LineArt) |
|------------------------|---------------------|
| ~$0.05/image | ~$0.013/image |
| ~$2.00/40-page book | ~$0.65/40-page book |
| No content safety | Multi-layer safety |
| No child protection | Toddler/Children guardrails |

**You're now saving 67% on image generation AND have production-grade child safety!**
