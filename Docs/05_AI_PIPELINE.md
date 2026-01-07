# AI Pipeline

## Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AI PIPELINE WITH SAFETY                           │
└─────────────────────────────────────────────────────────────────────┘
                                │
     ┌──────────────────────────┼──────────────────────────┐
     │                          │                          │
     ▼                          ▼                          ▼
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│   STYLE     │          │    HERO     │          │    PAGE     │
│ CALIBRATION │          │  CREATION   │          │ GENERATION  │
└──────┬──────┘          └──────┬──────┘          └──────┬──────┘
       │                        │                        │
       ▼                        ▼                        ▼
  4 samples               Reference sheet           40+ pages
  User picks              2×2 grid                 Flux + Safety
  Style anchor            Flux Pro                 Quality checked
```

---

## Safety-First Architecture

```
User Input
    │
    ▼
┌─────────────┐
│  Sanitize   │──→ Remove injection attempts
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Keyword    │──→ Audience-specific blocklist
│  Blocklist  │
└──────┬──────┘
       │ FAIL → Return suggestions
       ▼ PASS
┌─────────────┐
│  OpenAI     │──→ Moderation API with thresholds
│  Moderation │
└──────┬──────┘
       │ FAIL → Return suggestions
       ▼ PASS
┌─────────────┐
│  Compile    │──→ GPT-4o-mini generates prompts
│  Prompts    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Generate   │──→ Flux via Replicate
│  with Flux  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Cleanup    │──→ Sharp: B&W, threshold, resize
│  Image      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Quality    │──→ Check margins, density, contrast
│  Gate       │
└──────┬──────┘
       │
       ▼
┌─────────────┐    Only for Toddler/Children
│  GPT-4V     │──→ Visual safety verification
│  Safety     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Store &    │──→ R2 storage + DB update
│  Return     │
└─────────────┘
```

---

## 1. Content Safety System

### 1.1 Safety Levels by Audience

| Audience | Age Range | Safety Level | Violence | Sexual | Post-Gen Scan |
|----------|-----------|--------------|----------|--------|---------------|
| **Toddler** | 2-4 | Strict | 0.05 | 0.01 | ✅ Required |
| **Children** | 5-8 | Strict | 0.10 | 0.05 | ✅ Required |
| **Tween** | 9-12 | Moderate | 0.20 | 0.10 | ❌ Skip |
| **Teen** | 13-17 | Moderate | 0.30 | 0.15 | ❌ Skip |
| **Adult** | 18+ | Standard | 0.50 | 0.30 | ❌ Skip |

**ALWAYS:** `sexual/minors` threshold = **0.01** for ALL audiences

### 1.2 Forbidden Content by Audience

```typescript
// src/lib/constants/forbidden-content.ts

export const FORBIDDEN_BY_AUDIENCE = {
  toddler: [
    // Violence & Weapons
    'scary', 'monster', 'weapon', 'gun', 'sword', 'knife', 'fight', 'attack',
    'blood', 'violence', 'war', 'battle', 'kill', 'dead', 'death',
    // Scary creatures
    'ghost', 'zombie', 'skeleton', 'skull', 'demon', 'devil', 'witch',
    'vampire', 'werewolf', 'spider', 'snake', 'shark',
    // Dangerous
    'fire', 'explosion', 'danger', 'falling', 'drowning',
    // Emotions
    'crying', 'sad', 'angry', 'screaming', 'nightmare', 'terrified',
    // Inappropriate
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
    'realistic weapons in threatening context',
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
} as const;
```

### 1.3 Safety Check Implementation

```typescript
// src/server/ai/content-safety.ts

import OpenAI from 'openai';
import { FORBIDDEN_BY_AUDIENCE } from '@/lib/constants/forbidden-content';
import { AUDIENCE_DERIVATIONS } from '@/lib/constants';

const openai = new OpenAI();

export interface SafetyResult {
  safe: boolean;
  blocked: string[];
  suggestions?: string[];
}

// Moderation thresholds by safety level
const THRESHOLDS = {
  strict: {
    violence: 0.05, 'violence/graphic': 0.01,
    sexual: 0.01, 'sexual/minors': 0.01,
    hate: 0.05, 'self-harm': 0.05
  },
  moderate: {
    violence: 0.20, 'violence/graphic': 0.10,
    sexual: 0.10, 'sexual/minors': 0.01,
    hate: 0.20, 'self-harm': 0.15
  },
  standard: {
    violence: 0.50, 'violence/graphic': 0.30,
    sexual: 0.30, 'sexual/minors': 0.01,
    hate: 0.40, 'self-harm': 0.30
  }
};

export async function checkContentSafety(
  input: string,
  audience: Audience
): Promise<SafetyResult> {
  const rules = AUDIENCE_DERIVATIONS[audience];
  const forbidden = FORBIDDEN_BY_AUDIENCE[audience];
  
  // Layer 1: Keyword blocklist (instant, free)
  const lowerInput = input.toLowerCase();
  const blocked = forbidden.filter(word => 
    lowerInput.includes(word.toLowerCase())
  );
  
  if (blocked.length > 0) {
    return {
      safe: false,
      blocked,
      suggestions: getSuggestions(audience)
    };
  }
  
  // Layer 2: OpenAI Moderation API (free)
  const moderation = await openai.moderations.create({ input });
  const result = moderation.results[0];
  const thresholds = THRESHOLDS[rules.safetyLevel];
  
  const violations: string[] = [];
  
  if (result.category_scores.violence > thresholds.violence) {
    violations.push('violence');
  }
  if (result.category_scores['violence/graphic'] > thresholds['violence/graphic']) {
    violations.push('graphic violence');
  }
  if (result.category_scores.sexual > thresholds.sexual) {
    violations.push('sexual content');
  }
  if (result.category_scores['sexual/minors'] > 0.01) {
    violations.push('child safety'); // ALWAYS block
  }
  if (result.category_scores.hate > thresholds.hate) {
    violations.push('hate content');
  }
  if (result.category_scores['self-harm'] > thresholds['self-harm']) {
    violations.push('self-harm');
  }
  
  if (violations.length > 0) {
    return {
      safe: false,
      blocked: violations,
      suggestions: getSuggestions(audience)
    };
  }
  
  return { safe: true, blocked: [] };
}

function getSuggestions(audience: Audience): string[] {
  const suggestions: Record<Audience, string[]> = {
    toddler: [
      'Try: "cute farm animals playing"',
      'Try: "happy vehicles in a town"',
      'Try: "friendly dinosaur with flowers"'
    ],
    children: [
      'Try: "brave knight befriending a dragon"',
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
  return suggestions[audience];
}
```

### 1.4 Input Sanitization

```typescript
// src/server/ai/sanitize.ts

export function sanitizePrompt(input: string): string {
  let clean = input;
  
  // Remove prompt injection attempts
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
  
  // Remove special characters
  clean = clean
    .replace(/[<>{}[\]\\]/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Truncate to max length
  return clean.slice(0, 500);
}

export function validateIdea(idea: string): { valid: boolean; reason?: string } {
  if (idea.length < 3) {
    return { valid: false, reason: 'Please provide a more detailed idea' };
  }
  if (idea.length > 500) {
    return { valid: false, reason: 'Please shorten your idea (max 500 characters)' };
  }
  
  return { valid: true };
}
```

---

## 2. Flux Image Generation

### 2.1 Flux Configuration

```typescript
// src/lib/constants/flux.ts

export const FLUX_MODELS = {
  'flux-lineart': 'cuuupid/flux-lineart',
  'flux-dev': 'black-forest-labs/flux-dev',
  'flux-pro': 'black-forest-labs/flux-1.1-pro',
} as const;

export type FluxModel = keyof typeof FLUX_MODELS;

export const FLUX_TRIGGERS: Record<FluxModel, { trigger: string; template: string }> = {
  'flux-lineart': {
    trigger: '',
    template: 'line art, black and white, coloring book page'
  },
  'flux-dev': {
    trigger: 'c0l0ringb00k',  // If using coloring book LoRA
    template: 'c0l0ringb00k, coloring book page, black and white line art'
  },
  'flux-pro': {
    trigger: '',
    template: 'coloring book illustration, clean black outlines on white background'
  }
};

export const FLUX_COSTS: Record<FluxModel, number> = {
  'flux-lineart': 0.013,
  'flux-dev': 0.025,
  'flux-pro': 0.040,
};

export const LINE_WEIGHT_PROMPTS = {
  thick: 'bold thick black outlines, 6-8 pixel line weight, chunky shapes, prominent lines',
  medium: 'clean medium black outlines, 3-5 pixel line weight, balanced detail',
  fine: 'delicate fine black outlines, 1-3 pixel line weight, intricate details'
} as const;

export const COMPLEXITY_PROMPTS = {
  minimal: '3-5 main elements only, large simple shapes, maximum white space',
  moderate: '5-10 elements, some decorative detail, balanced composition',
  detailed: '10-20 elements, patterns and decorative elements',
  intricate: '20+ elements, fine patterns, mandala-level detail'
} as const;
```

### 2.2 Flux Generator

```typescript
// src/server/ai/flux-generator.ts

import Replicate from 'replicate';
import { FLUX_MODELS, FLUX_TRIGGERS, TRIM_SIZES } from '@/lib/constants';

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
  const dimensions = TRIM_SIZES[trimSize] || TRIM_SIZES['8.5x11'];
  
  const params: Record<string, any> = {
    prompt: compiledPrompt,
    negative_prompt: negativePrompt,
    num_inference_steps: 28,
    guidance_scale: 3.5,
    output_format: 'png',
    output_quality: 95,
    seed: seed ?? Math.floor(Math.random() * 2147483647),
    width: dimensions.width,
    height: dimensions.height,
  };
  
  try {
    const output = await replicate.run(model, { input: params });
    const imageUrl = Array.isArray(output) ? output[0] : output;
    
    return {
      success: true,
      imageUrl: imageUrl as string,
      seed: params.seed
    };
  } catch (error) {
    console.error('Flux generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed'
    };
  }
}

export async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to download image');
  return Buffer.from(await response.arrayBuffer());
}
```

---

## 3. Planner-Compiler

### 3.1 System Prompt

```typescript
// src/server/ai/planner-compiler.ts

const SYSTEM_PROMPT = `You are a professional coloring book page planner for KDP publishers.

CRITICAL: You are generating prompts for Flux AI image generation.
Every prompt MUST include the style cue: {fluxTemplate}

## YOUR TASK
Transform the user's idea into {pageCount} distinct, age-appropriate coloring book pages.

## ABSOLUTE RULES FOR EVERY PROMPT

### Technical Requirements (NON-NEGOTIABLE)
- Include style cue: {fluxTemplate}
- Pure black outlines on pure white background
- {lineWeight} line weight: {lineWeightDescription}
- {complexity} complexity: {complexityDescription}
- No shading, no gradients, no gray tones, no fills
- No crosshatching or stippling
- All shapes must be CLOSED (suitable for coloring)
- Margin-safe composition (10% padding from edges)
- Single scene per page (no split panels)
- No text, watermarks, or signatures

### Audience Safety ({audience}, ages {ageRange})
- SAFETY LEVEL: {safetyLevel}
- FORBIDDEN content (NEVER include): {forbiddenContent}
- Maximum {maxElements} elements per page

### Hero Character (if provided)
- Include this EXACT description: {heroDescription}
- Hero appears in 80% of pages
- Hero should be 20-40% of frame

### Composition Variety
Distribute compositions across pages:
- close-up (15%): Face or upper body
- full-body (30%): Complete figure
- action (25%): Character doing activity
- environment (15%): Character in larger scene
- pattern (15%): Decorative style

## OUTPUT FORMAT (JSON ONLY)
{
  "pages": [
    {
      "pageNumber": 1,
      "sceneBrief": "Short 5-10 word description",
      "compositionType": "full-body",
      "compiledPrompt": "{fluxTemplate}, [detailed prompt]...",
      "negativePrompt": "{negativePrompt}"
    }
  ]
}`;
```

### 3.2 Compiler Implementation

```typescript
// src/server/ai/planner-compiler.ts (continued)

import OpenAI from 'openai';
import { checkContentSafety } from './content-safety';
import { sanitizePrompt, validateIdea } from './sanitize';
import { 
  AUDIENCE_DERIVATIONS, 
  FLUX_TRIGGERS, 
  LINE_WEIGHT_PROMPTS, 
  COMPLEXITY_PROMPTS,
  FORBIDDEN_BY_AUDIENCE 
} from '@/lib/constants';

const openai = new OpenAI();

interface PlannerInput {
  userIdea: string;
  projectDNA: ProjectDNA;
}

interface CompiledPage {
  pageNumber: number;
  sceneBrief: string;
  compositionType: string;
  compiledPrompt: string;
  negativePrompt: string;
}

interface PlannerResult {
  success: boolean;
  pages?: CompiledPage[];
  error?: string;
  safetyIssue?: boolean;
  suggestions?: string[];
}

export async function planAndCompile(input: PlannerInput): Promise<PlannerResult> {
  const { userIdea, projectDNA } = input;
  
  // Step 1: Validate
  const validation = validateIdea(userIdea);
  if (!validation.valid) {
    return { success: false, error: validation.reason };
  }
  
  // Step 2: Sanitize
  const sanitizedIdea = sanitizePrompt(userIdea);
  
  // Step 3: Safety check
  const safetyResult = await checkContentSafety(sanitizedIdea, projectDNA.audience);
  if (!safetyResult.safe) {
    return {
      success: false,
      error: `Content not suitable for ${projectDNA.audience}`,
      safetyIssue: true,
      suggestions: safetyResult.suggestions
    };
  }
  
  // Step 4: Build context
  const audienceRules = AUDIENCE_DERIVATIONS[projectDNA.audience];
  const fluxConfig = FLUX_TRIGGERS['flux-lineart'];
  const forbidden = FORBIDDEN_BY_AUDIENCE[projectDNA.audience];
  
  const negativePrompt = buildNegativePrompt(projectDNA.audience, projectDNA.stylePreset);
  
  const systemPrompt = SYSTEM_PROMPT
    .replace(/{fluxTemplate}/g, fluxConfig.template)
    .replace('{pageCount}', String(projectDNA.pageCount))
    .replace('{lineWeight}', projectDNA.lineWeight)
    .replace('{lineWeightDescription}', LINE_WEIGHT_PROMPTS[projectDNA.lineWeight])
    .replace('{complexity}', projectDNA.complexity)
    .replace('{complexityDescription}', COMPLEXITY_PROMPTS[projectDNA.complexity])
    .replace('{audience}', projectDNA.audience)
    .replace('{ageRange}', audienceRules.ageRange)
    .replace('{safetyLevel}', audienceRules.safetyLevel.toUpperCase())
    .replace('{forbiddenContent}', forbidden.slice(0, 20).join(', '))
    .replace('{maxElements}', String(audienceRules.maxElements))
    .replace('{heroDescription}', projectDNA.heroDescription || 'No hero character')
    .replace('{negativePrompt}', negativePrompt);
  
  // Step 5: Call GPT-4o-mini
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create ${projectDNA.pageCount} coloring book pages for: "${sanitizedIdea}"` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4000,
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      return { success: false, error: 'No response from AI' };
    }
    
    const parsed = JSON.parse(content);
    
    return { success: true, pages: parsed.pages };
    
  } catch (error) {
    console.error('Planner error:', error);
    return { success: false, error: 'Failed to generate pages' };
  }
}

function buildNegativePrompt(audience: Audience, stylePreset: StylePreset): string {
  const base = [
    'shading', 'gradient', 'gray', 'grayscale', 'color', 'colored',
    'photograph', 'photorealistic', 'realistic', '3D', 'render', 'shadow',
    'watermark', 'signature', 'text', 'logo',
    'broken lines', 'open shapes', 'disconnected',
    'crosshatching', 'stippling', 'hatching',
    'blurry', 'low quality', 'artifacts'
  ];
  
  const audienceNegatives = FORBIDDEN_BY_AUDIENCE[audience].slice(0, 10);
  
  return [...new Set([...base, ...audienceNegatives])].join(', ');
}
```

---

## 4. Post-Generation Safety Check

```typescript
// src/server/ai/image-safety-check.ts

import OpenAI from 'openai';
import { AUDIENCE_DERIVATIONS } from '@/lib/constants';

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
  // Only run for strict audiences (cost: ~$0.01 per check)
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

---

## 5. Quality Gate

```typescript
// src/server/ai/quality-gate.ts

import sharp from 'sharp';

interface QualityReport {
  passed: boolean;
  score: number;
  checks: {
    pureBlackWhite: boolean;
    hasContent: boolean;
    notTooDense: boolean;
    marginSafe: boolean;
  };
  failReasons: string[];
}

export async function qualityCheck(imageBuffer: Buffer): Promise<QualityReport> {
  const image = sharp(imageBuffer);
  const stats = await image.stats();
  const metadata = await image.metadata();
  
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  
  const checks = {
    // Check for pure B&W (min ~0, max ~255)
    pureBlackWhite: stats.channels[0].min <= 5 && stats.channels[0].max >= 250,
    // Check image has content (not all white)
    hasContent: stats.channels[0].mean < 250,
    // Check not too dense (enough white space)
    notTooDense: stats.channels[0].mean > 180,
    // Check margins are clear
    marginSafe: checkMargins(data, info.width, info.height, 75),
  };
  
  const failReasons = Object.entries(checks)
    .filter(([_, passed]) => !passed)
    .map(([check]) => check);
  
  const score = (Object.values(checks).filter(Boolean).length / 4) * 100;
  
  return {
    passed: failReasons.length === 0,
    score,
    checks,
    failReasons,
  };
}

function checkMargins(data: Buffer, width: number, height: number, margin: number): boolean {
  // Check top margin
  for (let y = 0; y < margin; y++) {
    for (let x = 0; x < width; x++) {
      if (data[y * width + x] < 128) return false;
    }
  }
  // Similar checks for bottom, left, right margins...
  return true;
}
```

---

## 6. Cleanup Pipeline

```typescript
// src/server/ai/cleanup.ts

import sharp from 'sharp';
import { TRIM_SIZES } from '@/lib/constants';

interface CleanupOptions {
  targetWidth: number;
  targetHeight: number;
  threshold?: number;
}

export async function cleanupImage(
  buffer: Buffer,
  options: CleanupOptions
): Promise<Buffer> {
  const { targetWidth, targetHeight, threshold = 128 } = options;
  
  return sharp(buffer)
    // Convert to grayscale
    .grayscale()
    // Threshold to pure B&W
    .threshold(threshold)
    // Slight blur + re-threshold (despeckle)
    .blur(0.5)
    .threshold(threshold)
    // Resize to target dimensions (300 DPI)
    .resize(targetWidth, targetHeight, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255 }
    })
    // Flatten with white background
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    // Output as PNG
    .png()
    .toBuffer();
}
```

---

## 7. Complete Generation Pipeline

```typescript
// src/server/ai/generate-page.ts

import { generateWithFlux, downloadImage } from './flux-generator';
import { cleanupImage } from './cleanup';
import { qualityCheck } from './quality-gate';
import { checkGeneratedImageSafety } from './image-safety-check';
import { TRIM_SIZES } from '@/lib/constants';

interface GeneratePageOptions {
  compiledPrompt: string;
  negativePrompt: string;
  projectDNA: ProjectDNA;
  maxRetries?: number;
}

interface PageResult {
  success: boolean;
  imageBuffer?: Buffer;
  seed?: number;
  qualityScore?: number;
  safetyPassed?: boolean;
  error?: string;
}

export async function generatePage(options: GeneratePageOptions): Promise<PageResult> {
  const { compiledPrompt, negativePrompt, projectDNA, maxRetries = 2 } = options;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // 1. Generate with Flux
    const genResult = await generateWithFlux({
      compiledPrompt,
      negativePrompt,
      fluxModel: 'flux-lineart',
      trimSize: projectDNA.trimSize,
    });
    
    if (!genResult.success) {
      if (attempt === maxRetries) {
        return { success: false, error: genResult.error };
      }
      continue;
    }
    
    // 2. Download image
    const rawBuffer = await downloadImage(genResult.imageUrl!);
    
    // 3. Run cleanup
    const dimensions = TRIM_SIZES[projectDNA.trimSize];
    const cleanedBuffer = await cleanupImage(rawBuffer, {
      targetWidth: dimensions.width,
      targetHeight: dimensions.height,
    });
    
    // 4. Quality gate
    const quality = await qualityCheck(cleanedBuffer);
    
    // 5. Safety check (for children only - adds ~$0.01)
    let safetyPassed = true;
    if (['toddler', 'children'].includes(projectDNA.audience)) {
      const safetyResult = await checkGeneratedImageSafety(
        genResult.imageUrl!,
        projectDNA.audience
      );
      safetyPassed = safetyResult.safe;
      
      if (!safetyPassed && attempt < maxRetries) {
        continue; // Auto-retry
      }
    }
    
    // 6. Return result
    if (quality.passed && safetyPassed) {
      return {
        success: true,
        imageBuffer: cleanedBuffer,
        seed: genResult.seed,
        qualityScore: quality.score,
        safetyPassed: true,
      };
    }
    
    // Quality or safety failed on last attempt
    if (attempt === maxRetries) {
      return {
        success: true, // Still return, but flagged for review
        imageBuffer: cleanedBuffer,
        seed: genResult.seed,
        qualityScore: quality.score,
        safetyPassed,
        error: !safetyPassed ? 'Safety check failed' : 'Quality check failed',
      };
    }
  }
  
  return { success: false, error: 'Max retries exceeded' };
}
```

---

## 8. Hero Reference Sheet

```typescript
// src/server/ai/hero-generator.ts

import { generateWithFlux, downloadImage } from './flux-generator';
import { checkContentSafety } from './content-safety';
import { sanitizePrompt } from './sanitize';

interface HeroInput {
  name: string;
  description: string;
  audience: Audience;
}

interface HeroResult {
  success: boolean;
  referenceBuffer?: Buffer;
  compiledPrompt?: string;
  error?: string;
  safetyIssue?: boolean;
  suggestions?: string[];
}

export async function generateHeroReference(input: HeroInput): Promise<HeroResult> {
  const { name, description, audience } = input;
  
  // Safety check
  const sanitized = sanitizePrompt(description);
  const safety = await checkContentSafety(sanitized, audience);
  
  if (!safety.safe) {
    return {
      success: false,
      error: 'Character description not suitable',
      safetyIssue: true,
      suggestions: safety.suggestions
    };
  }
  
  // Build character sheet prompt
  const compiledPrompt = buildCharacterSheetPrompt(name, sanitized, audience);
  
  // Generate with Flux Pro (best quality for reference)
  const result = await generateWithFlux({
    compiledPrompt,
    negativePrompt: 'realistic, photograph, 3D, shading, gradient',
    fluxModel: 'flux-pro',
    trimSize: '8.5x8.5', // Square for reference sheet
  });
  
  if (!result.success) {
    return { success: false, error: result.error };
  }
  
  const buffer = await downloadImage(result.imageUrl!);
  
  return {
    success: true,
    referenceBuffer: buffer,
    compiledPrompt
  };
}

function buildCharacterSheetPrompt(
  name: string, 
  description: string, 
  audience: Audience
): string {
  const ageStyle = {
    toddler: 'simple cartoon style, very round shapes, minimal detail',
    children: 'friendly cartoon style, soft shapes',
    tween: 'animated style, balanced detail',
    teen: 'anime-influenced style',
    adult: 'clean illustration style'
  }[audience];
  
  return `character reference sheet, 2x2 grid layout, ${ageStyle}, 
${description}, 
four views: front view, side profile, back view, three-quarter view,
pure black outlines on white background, coloring book style,
consistent character design across all views,
labeled character name: ${name}`;
}
```

---

## Cost Analysis

### Per-Image Costs

| Model | Cost | Best For |
|-------|------|----------|
| **flux-lineart** | $0.013 | Production pages (default) |
| **flux-dev** | $0.025 | Custom LoRA styles |
| **flux-pro** | $0.040 | Hero reference sheets |

### Per-Book Costs (40 pages)

| Scenario | Generation | Safety | Total |
|----------|------------|--------|-------|
| Adult book (no safety scan) | $0.52 | $0 | ~$0.55 |
| Children's book (with safety scan) | $0.52 | $0.40 | ~$1.00 |

### Blot Economics

| Action | Blots | Your Cost | Consumer Pays* |
|--------|-------|-----------|----------------|
| Generate 1 page | 5 | $0.013 | $0.15 (Creator) |
| Hero sheet | 8 | $0.040 | $0.24 (Creator) |
| Calibration (4 samples) | 4 | $0.052 | $0.12 (Creator) |
| Full 40-page book | 212 | ~$0.55 | $6.36 (Creator) |

*Based on Creator tier ($3/100 Blots = $0.03/Blot)

### Your Margins

| Tier | Consumer Pays/Blot | Your Cost/Blot | Margin |
|------|-------------------|----------------|--------|
| Creator Monthly | $0.030 | $0.0026 | **91%** |
| Creator Annual | $0.025 | $0.0026 | **90%** |
| Studio Monthly | $0.020 | $0.0026 | **87%** |
| Studio Annual | $0.0175 | $0.0026 | **85%** |
| Pack (Top-Up) | $0.050 | $0.0026 | **95%** |
| Pack (Boost) | $0.040 | $0.0026 | **94%** |
