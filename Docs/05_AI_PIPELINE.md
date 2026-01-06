# AI Pipeline

## Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AI PIPELINE                                  │
└─────────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│    STYLE      │      │     HERO      │      │     PAGE      │
│  CALIBRATION  │      │   CREATION    │      │  GENERATION   │
└───────┬───────┘      └───────┬───────┘      └───────┬───────┘
        │                      │                      │
        ▼                      ▼                      ▼
   4 samples            Reference sheet         40 pages
   User picks           2×2 grid               Consistent style
   Style anchor         4 views                Quality checked
```

---

## 1. Planner-Compiler

Single GPT-4o-mini call that transforms user input into enforced prompts.

### System Prompt

```typescript
// src/server/ai/planner-compiler.ts

const SYSTEM_PROMPT = `You are a coloring book page planner for professional KDP publishers.

Given a user's idea, create {pageCount} distinct scene briefs and compiled prompts.

RULES YOU MUST ENFORCE IN EVERY PROMPT:
- Coloring book page style
- Pure black outlines on pure white background
- No shading, no gradients, no gray tones, no textures, no fills
- No crosshatching or stippling
- {lineWeight} line weight (consistent across all pages)
- {complexity} level of detail
- Closed shapes suitable for coloring (no broken or open lines)
- No tiny intricate clusters that can't be colored
- No text, watermarks, or signatures
- Margin-safe composition (subject not touching edges, 10% padding)
- Single scene per page (no split panels)

LINE WEIGHT SPECIFICATIONS:
- thick: Bold 6-8px lines, chunky shapes, minimal detail
- medium: Clean 3-5px lines, balanced detail
- fine: Delicate 1-3px lines, intricate detail allowed

COMPLEXITY SPECIFICATIONS:
- minimal: 3-5 main elements, large simple shapes
- moderate: 5-10 elements, some decorative detail
- detailed: 10-20 elements, patterns and textures allowed
- intricate: 20+ elements, fine patterns, mandala-level detail

FOR HERO CHARACTER (if provided):
- Include this exact description in every scene where hero appears: {heroDescription}
- Hero must appear in at least 80% of pages
- Maintain consistent proportions and features
- Hero should be prominent in composition (20-40% of frame)

FOR STYLE CONSISTENCY:
- Match this style description: {styleAnchorDescription}
- Maintain consistent aesthetic across all pages

COMPOSITION VARIETY:
- Vary compositions across pages using these types:
  - close-up: Face or upper body focus (15% of pages)
  - full-body: Complete figure, centered (30% of pages)
  - action: Character doing something (25% of pages)
  - environment: Character small in larger scene (15% of pages)
  - pattern: Decorative/mandala style (15% of pages)
- No more than 2 consecutive pages with same composition type
- First page should be iconic/cover-worthy

OUTPUT FORMAT (JSON only, no explanation):
{
  "pages": [
    {
      "pageNumber": 1,
      "sceneBrief": "Short 5-10 word description for user display",
      "compositionType": "full-body",
      "compiledPrompt": "Full detailed prompt with all rules enforced...",
      "negativePrompt": "shading, gradient, gray, realistic, photograph, watermark, signature, text, broken lines, open shapes, crosshatching, texture, fill, 3D, shadow, color"
    }
  ]
}`;
```

### Implementation

```typescript
// src/server/ai/planner-compiler.ts
import OpenAI from 'openai';
import type { ProjectDNA, HeroDNA } from '@/types/domain';

const openai = new OpenAI();

interface PlannerInput {
  userIdea: string;
  projectDNA: ProjectDNA;
  hero?: HeroDNA;
}

interface CompiledPage {
  pageNumber: number;
  sceneBrief: string;
  compositionType: string;
  compiledPrompt: string;
  negativePrompt: string;
}

export async function planAndCompile(input: PlannerInput): Promise<CompiledPage[]> {
  const { userIdea, projectDNA, hero } = input;
  
  const systemPrompt = SYSTEM_PROMPT
    .replace('{pageCount}', String(projectDNA.pageCount))
    .replace('{lineWeight}', projectDNA.lineWeight)
    .replace('{complexity}', projectDNA.complexity)
    .replace('{heroDescription}', hero?.compiledPrompt ?? 'No hero character')
    .replace('{styleAnchorDescription}', projectDNA.styleAnchorDescription ?? projectDNA.stylePreset);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userIdea }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const result = JSON.parse(response.choices[0].message.content!);
  return result.pages;
}
```

**Cost:** ~$0.003 for 40 pages

---

## 2. Image Generator

### GPT Image 1.5 Integration

```typescript
// src/server/ai/image-generator.ts
import OpenAI from 'openai';
import type { HeroDNA } from '@/types/domain';

const openai = new OpenAI();

interface GenerateOptions {
  prompt: string;
  negativePrompt: string;
  heroReference?: Buffer; // Hero reference sheet image
  styleAnchor?: Buffer;   // Style anchor image
}

export async function generateImage(options: GenerateOptions): Promise<Buffer> {
  const { prompt, negativePrompt, heroReference, styleAnchor } = options;
  
  // Build full prompt with negative
  const fullPrompt = `${prompt}

AVOID: ${negativePrompt}`;

  // If we have reference images, use edit endpoint
  if (heroReference || styleAnchor) {
    const referenceImage = heroReference || styleAnchor;
    
    const response = await openai.images.edit({
      model: 'gpt-image-1.5',
      image: referenceImage,
      prompt: `Create a new coloring book page in the exact same style as this reference. ${fullPrompt}`,
      n: 1,
      size: '1536x1024', // Landscape
      quality: 'high',
      response_format: 'b64_json',
    });
    
    return Buffer.from(response.data[0].b64_json!, 'base64');
  }
  
  // No reference, use generate endpoint
  const response = await openai.images.generate({
    model: 'gpt-image-1.5',
    prompt: fullPrompt,
    n: 1,
    size: '1536x1024',
    quality: 'high',
    response_format: 'b64_json',
  });
  
  return Buffer.from(response.data[0].b64_json!, 'base64');
}
```

**Cost:** ~$0.17 per image (high quality)

---

## 3. Deterministic Cleanup

Code-based image processing to guarantee pure black and white output.

```typescript
// src/server/ai/cleanup.ts
import sharp from 'sharp';

interface CleanupOptions {
  targetWidth: number;  // Based on trim size
  targetHeight: number;
  threshold?: number;   // B&W threshold (default 128)
}

export async function cleanupImage(
  imageBuffer: Buffer,
  options: CleanupOptions
): Promise<Buffer> {
  const { targetWidth, targetHeight, threshold = 128 } = options;
  
  let image = sharp(imageBuffer);
  
  // Step 1: Convert to grayscale
  image = image.grayscale();
  
  // Step 2: Threshold to pure B&W
  // Pixels > threshold = white (255), else = black (0)
  image = image.threshold(threshold);
  
  // Step 3: Morphological cleanup (remove specs)
  // Sharp doesn't have built-in morphology, so we use blur + threshold trick
  image = image
    .blur(0.5)      // Slight blur to smooth jaggies
    .threshold(200); // Re-threshold to clean up
  
  // Step 4: Resize to target dimensions (300 DPI)
  image = image.resize(targetWidth, targetHeight, {
    fit: 'contain',
    background: { r: 255, g: 255, b: 255 },
  });
  
  // Step 5: Ensure pure white background
  image = image.flatten({ background: { r: 255, g: 255, b: 255 } });
  
  // Output as PNG
  return image.png().toBuffer();
}

// Trim size to pixel dimensions at 300 DPI
export const TRIM_SIZES = {
  '8.5x11': { width: 2550, height: 3300 },  // 8.5 × 300, 11 × 300
  '8.5x8.5': { width: 2550, height: 2550 },
  '6x9': { width: 1800, height: 2700 },
} as const;
```

**Cost:** ~$0 (CPU only, milliseconds)

---

## 4. Quality Gate

Automated checks before accepting a generated image.

```typescript
// src/server/ai/quality-gate.ts
import sharp from 'sharp';

interface QualityReport {
  passed: boolean;
  score: number;        // 0-100
  checks: QualityChecks;
  failReasons: string[];
}

interface QualityChecks {
  pureBlackWhite: boolean;  // No gray pixels
  hasContent: boolean;       // Not blank
  notTooDense: boolean;      // Not all black
  marginSafe: boolean;       // No ink at edges
}

export async function qualityCheck(imageBuffer: Buffer): Promise<QualityReport> {
  const image = sharp(imageBuffer);
  const stats = await image.stats();
  const metadata = await image.metadata();
  
  // Get raw pixel data for edge checking
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const checks: QualityChecks = {
    // Check 1: Pure B&W (no gray in histogram)
    pureBlackWhite: isPureBlackWhite(stats),
    
    // Check 2: Has content (not all white)
    hasContent: stats.channels[0].mean < 250,
    
    // Check 3: Not too dense (colorable)
    notTooDense: stats.channels[0].mean > 200,
    
    // Check 4: Margin safety (sample edge pixels)
    marginSafe: checkMargins(data, info.width, info.height, 75), // 75px = 0.25" at 300dpi
  };
  
  const failReasons = Object.entries(checks)
    .filter(([_, passed]) => !passed)
    .map(([check]) => check);
  
  const passedCount = Object.values(checks).filter(Boolean).length;
  const score = (passedCount / Object.keys(checks).length) * 100;
  
  return {
    passed: failReasons.length === 0,
    score,
    checks,
    failReasons,
  };
}

function isPureBlackWhite(stats: sharp.Stats): boolean {
  // Check if pixels are only at 0 or 255
  const channel = stats.channels[0];
  return channel.min <= 5 && channel.max >= 250;
}

function checkMargins(
  data: Buffer,
  width: number,
  height: number,
  margin: number
): boolean {
  // Sample pixels in margin zones
  for (let y = 0; y < margin; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x);
      if (data[idx] < 128) return false; // Found black pixel in margin
    }
  }
  // Check other edges similarly...
  return true;
}
```

---

## 5. Hero Reference Sheet Generator

Creates 2×2 grid with front, side, back, and 3/4 views.

```typescript
// src/server/ai/hero-generator.ts
import OpenAI from 'openai';
import type { Audience } from '@/types/domain';

const openai = new OpenAI();

interface HeroInput {
  name: string;
  description: string;
  audience: Audience;
}

export async function compileHeroPrompt(input: HeroInput): Promise<string> {
  const { name, description, audience } = input;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a character designer for coloring books.
        
Create a detailed prompt for a CHARACTER REFERENCE SHEET containing:
- Front view (facing viewer directly)
- Side view (profile, facing right)  
- Back view (facing away)
- 3/4 view (slightly turned)

All 4 views must be:
- Same character with IDENTICAL proportions
- Arranged in a 2x2 grid on white background
- Coloring book style: pure black outlines on white
- Line weight appropriate for ${audience} audience
- No shading, no gradients, no gray
- Simple, clear, consistent
- Labeled: "FRONT" "SIDE" "BACK" "3/4"

Output ONLY the prompt text, no explanation.`
      },
      {
        role: 'user',
        content: `Character name: ${name}\nDescription: ${description}\nAudience: ${audience}`
      }
    ],
    temperature: 0.5,
  });
  
  return response.choices[0].message.content!;
}

export async function generateHeroSheet(compiledPrompt: string): Promise<Buffer> {
  const response = await openai.images.generate({
    model: 'gpt-image-1.5',
    prompt: compiledPrompt,
    n: 1,
    size: '1536x1536', // Square for 2×2 grid
    quality: 'high',
    response_format: 'b64_json',
  });
  
  return Buffer.from(response.data[0].b64_json!, 'base64');
}
```

---

## 6. Style Calibration

Generate 4 style samples for user to choose anchor.

```typescript
// src/server/ai/style-calibration.ts
import OpenAI from 'openai';
import type { StylePreset, Audience } from '@/types/domain';

const openai = new OpenAI();

const STYLE_VARIATIONS = [
  'default interpretation',
  'slightly more detailed with decorative elements',
  'simpler with bolder shapes',
  'more whimsical with curved lines',
];

export async function generateCalibrationSamples(
  subject: string,
  stylePreset: StylePreset,
  audience: Audience
): Promise<Buffer[]> {
  const basePrompt = buildBasePrompt(subject, stylePreset, audience);
  
  const samples = await Promise.all(
    STYLE_VARIATIONS.map(async (variation, i) => {
      const prompt = `${basePrompt}, ${variation}`;
      
      const response = await openai.images.generate({
        model: 'gpt-image-1.5',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'low', // Faster for samples
        response_format: 'b64_json',
      });
      
      return Buffer.from(response.data[0].b64_json!, 'base64');
    })
  );
  
  return samples;
}

function buildBasePrompt(
  subject: string,
  stylePreset: StylePreset,
  audience: Audience
): string {
  const styleRules = STYLE_RULES[stylePreset];
  const audienceRules = AUDIENCE_RULES[audience];
  
  return `${subject}, coloring book page style, ${styleRules}, ${audienceRules}, pure black outlines on white background, no shading, no gradients, closed shapes suitable for coloring`;
}

const STYLE_RULES: Record<StylePreset, string> = {
  'bold-simple': 'thick bold outlines, minimal detail, clean simple shapes',
  'kawaii': 'cute rounded shapes, big eyes, soft curves, charming style',
  'whimsical': 'flowing organic lines, magical elements, dreamy aesthetic',
  'cartoon': 'classic animation style, expressive lines, dynamic poses',
  'botanical': 'organic natural shapes, leaves and flowers, elegant patterns',
};

const AUDIENCE_RULES: Record<Audience, string> = {
  'toddler': 'very thick lines 8px+, 3-5 large simple shapes only',
  'children': 'thick lines 6px, moderate detail, friendly compositions',
  'tween': 'medium lines 4px, balanced complexity, engaging scenes',
  'teen': 'medium-fine lines 3px, detailed but not overwhelming',
  'adult': 'fine lines 2px, intricate detail allowed, sophisticated patterns',
};
```

---

## 7. Inpainting (Paintbrush Edits)

Targeted edits using mask.

```typescript
// src/server/ai/inpaint.ts
import OpenAI from 'openai';

const openai = new OpenAI();

interface InpaintOptions {
  originalImage: Buffer;
  maskImage: Buffer;       // White = edit area, Black = preserve
  prompt: string;
  styleContext: string;    // From project DNA
}

export async function inpaintImage(options: InpaintOptions): Promise<Buffer> {
  const { originalImage, maskImage, prompt, styleContext } = options;
  
  const fullPrompt = `${prompt}. 
Coloring book style, black outlines on white, match the existing line weight and style exactly.
Style context: ${styleContext}
AVOID: shading, gradient, gray, different style, broken lines`;

  const response = await openai.images.edit({
    model: 'gpt-image-1.5',
    image: originalImage,
    mask: maskImage,
    prompt: fullPrompt,
    n: 1,
    size: '1536x1024',
    quality: 'high',
    response_format: 'b64_json',
  });
  
  return Buffer.from(response.data[0].b64_json!, 'base64');
}
```

---

## Complete Page Generation Flow

```typescript
// src/server/ai/generate-page.ts
import { planAndCompile } from './planner-compiler';
import { generateImage } from './image-generator';
import { cleanupImage, TRIM_SIZES } from './cleanup';
import { qualityCheck } from './quality-gate';
import { storeImage } from '../storage/r2-client';
import type { Job, JobItem, Project, Hero } from '@/types/domain';

const MAX_RETRIES = 2;

export async function generatePage(
  item: JobItem,
  project: Project,
  hero: Hero | null,
  compiledPage: CompiledPage
): Promise<{ assetKey: string; qualityScore: number }> {
  let attempt = 0;
  let lastError: Error | null = null;
  
  while (attempt <= MAX_RETRIES) {
    try {
      // 1. Generate raw image
      const rawImage = await generateImage({
        prompt: compiledPage.compiledPrompt,
        negativePrompt: compiledPage.negativePrompt,
        heroReference: hero ? await getHeroReference(hero.referenceKey) : undefined,
        styleAnchor: project.styleAnchorKey 
          ? await getStyleAnchor(project.styleAnchorKey) 
          : undefined,
      });
      
      // 2. Cleanup (deterministic)
      const trimSize = TRIM_SIZES[project.trimSize];
      const cleanedImage = await cleanupImage(rawImage, {
        targetWidth: trimSize.width,
        targetHeight: trimSize.height,
      });
      
      // 3. Quality check
      const quality = await qualityCheck(cleanedImage);
      
      if (quality.passed || attempt === MAX_RETRIES) {
        // 4. Store to R2
        const assetKey = await storeImage(cleanedImage, {
          userId: project.ownerId,
          projectId: project.id,
          pageId: item.pageId,
          version: item.version,
        });
        
        // 5. Create thumbnail
        const thumbnail = await sharp(cleanedImage)
          .resize(300, 300, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toBuffer();
        
        await storeThumbnail(thumbnail, { ... });
        
        return {
          assetKey,
          qualityScore: quality.score,
        };
      }
      
      // Quality failed, retry
      attempt++;
      
    } catch (error) {
      lastError = error as Error;
      attempt++;
    }
  }
  
  throw lastError || new Error('Generation failed after retries');
}
```

---

## Cost Summary

| Operation | Model | Cost |
|-----------|-------|------|
| Plan 40 pages | GPT-4o-mini | ~$0.003 |
| Generate 1 page | GPT Image 1.5 (high) | ~$0.17 |
| Style calibration (4) | GPT Image 1.5 (low) | ~$0.16 |
| Hero sheet | GPT Image 1.5 (high) | ~$0.17 |
| Cleanup | Sharp (CPU) | ~$0 |
| Quality check | Sharp (CPU) | ~$0 |

**40-page book total:** ~$7-8
