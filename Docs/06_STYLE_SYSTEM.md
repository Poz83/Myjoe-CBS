# Style System

## Project DNA

Everything locks at project creation to prevent AI drift across 40 pages.

```typescript
interface ProjectDNA {
  // User selections (immutable after creation)
  name: string;
  pageCount: number;           // 1-45
  trimSize: TrimSize;          // '8.5x11' | '8.5x8.5' | '6x9'
  audience: Audience;          // 'toddler' | 'children' | 'tween' | 'teen' | 'adult'
  stylePreset: StylePreset;    // 'bold-simple' | 'kawaii' | 'whimsical' | 'cartoon' | 'botanical'
  
  // Derived automatically from audience
  lineWeight: LineWeight;      // 'thick' | 'medium' | 'fine'
  complexity: Complexity;      // 'minimal' | 'moderate' | 'detailed' | 'intricate'
  
  // Set after style calibration
  styleAnchorKey?: string;
  styleAnchorDescription?: string;
  
  // Optional hero reference
  heroId?: string;
}
```

### Audience → Derivation Rules

| Audience | Ages | Line Weight | Complexity | Detail Density |
|----------|------|-------------|------------|----------------|
| Toddler | 2-4 | Thick (8px+) | Minimal | 3-5 elements |
| Children | 5-8 | Thick (6px) | Moderate | 5-10 elements |
| Tween | 9-12 | Medium (4px) | Moderate | 10-15 elements |
| Teen | 13-17 | Medium (3px) | Detailed | 15-20 elements |
| Adult | 18+ | Fine (2px) | Intricate | 20+ elements |

```typescript
// src/lib/audience-rules.ts
export const AUDIENCE_DERIVATIONS: Record<Audience, { lineWeight: LineWeight; complexity: Complexity }> = {
  toddler: { lineWeight: 'thick', complexity: 'minimal' },
  children: { lineWeight: 'thick', complexity: 'moderate' },
  tween: { lineWeight: 'medium', complexity: 'moderate' },
  teen: { lineWeight: 'medium', complexity: 'detailed' },
  adult: { lineWeight: 'fine', complexity: 'intricate' },
};
```

---

## Style Presets

### Visual Reference

| Preset | Characteristics | Best For |
|--------|-----------------|----------|
| **Bold & Simple** | Thick outlines, minimal detail, clean geometric shapes | Toddlers, beginners |
| **Kawaii Cute** | Rounded shapes, big sparkly eyes, soft curves, cheerful | Children, cute themes |
| **Whimsical Fantasy** | Flowing organic lines, magical elements, dreamy | Fantasy, magical themes |
| **Cartoon Classic** | Animation-style lines, expressive, dynamic | Characters, action |
| **Nature Botanical** | Organic shapes, leaves, flowers, elegant patterns | Adults, nature themes |

### Prompt Fragments

```typescript
// src/lib/style-presets.ts
export const STYLE_PROMPT_FRAGMENTS: Record<StylePreset, string> = {
  'bold-simple': `
    Bold thick black outlines (6-8px),
    Minimal detail with clean simple shapes,
    Geometric forms, chunky proportions,
    Clear separation between elements,
    Easy to color large areas
  `,
  
  'kawaii': `
    Cute rounded shapes with soft curves,
    Large expressive eyes with sparkles,
    Chibi-style proportions (big head, small body),
    Cheerful friendly expressions,
    Decorative elements like hearts and stars
  `,
  
  'whimsical': `
    Flowing organic curvy lines,
    Magical fantasy elements,
    Dreamy ethereal aesthetic,
    Swirling decorative patterns,
    Enchanted storybook feel
  `,
  
  'cartoon': `
    Classic animation style outlines,
    Expressive dynamic lines,
    Clear character silhouettes,
    Action-ready poses,
    Bold confident strokes
  `,
  
  'botanical': `
    Organic natural shapes,
    Detailed leaves and flowers,
    Elegant flowing patterns,
    Nature-inspired compositions,
    Sophisticated adult aesthetic
  `,
};
```

---

## Style Calibration Flow

### Purpose

Users say "cute animals" but have different mental images. Calibration aligns expectations by letting them pick a visual anchor.

### User Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Style Calibration                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  What's your book about? (brief description)                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Cute forest animals having adventures              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                          [Generate Samples →]               │
│                          10 Blots                           │
└─────────────────────────────────────────────────────────────┘

                              ↓

┌─────────────────────────────────────────────────────────────┐
│  Pick Your Style                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Which style matches your vision?                           │
│                                                             │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│  │           │ │           │ │           │ │           │   │
│  │  [img 1]  │ │  [img 2]  │ │  [img 3]  │  │  [img 4]  │   │
│  │           │ │           │ │           │ │           │   │
│  │     ○     │ │     ●     │ │     ○     │ │     ○     │   │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘   │
│                                                             │
│  [← Back]                              [Use This Style →]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Implementation

```typescript
// src/server/ai/style-calibration.ts

interface CalibrationResult {
  samples: {
    id: string;
    imageUrl: string;
    variation: string;
  }[];
  blotsSpent: number;
}

export async function runCalibration(
  projectId: string,
  subject: string,
  stylePreset: StylePreset,
  audience: Audience
): Promise<CalibrationResult> {
  // Generate 4 variations
  const variations = [
    'balanced interpretation',
    'more detailed with decorative accents',
    'simpler with bolder shapes',
    'more playful with curved lines',
  ];
  
  const samples = await Promise.all(
    variations.map(async (variation, index) => {
      const prompt = buildCalibrationPrompt(subject, stylePreset, audience, variation);
      const image = await generateLowQualityImage(prompt);
      const key = await storeTempImage(image, projectId, index);
      
      return {
        id: String(index),
        imageUrl: await getSignedUrl(key),
        variation,
      };
    })
  );
  
  return {
    samples,
    blotsSpent: 10, // 4 low-quality images
  };
}

export async function selectStyleAnchor(
  projectId: string,
  sampleId: string
): Promise<void> {
  // Copy selected sample to permanent storage
  const tempKey = getTempKey(projectId, sampleId);
  const permanentKey = getStyleAnchorKey(projectId);
  
  await copyAsset(tempKey, permanentKey);
  
  // Generate description for prompt inclusion
  const description = await describeStyleAnchor(permanentKey);
  
  // Update project
  await updateProject(projectId, {
    styleAnchorKey: permanentKey,
    styleAnchorDescription: description,
  });
  
  // Clean up temp samples
  await deleteTempSamples(projectId);
}
```

---

## Hero System

### Hero DNA

```typescript
interface HeroDNA {
  id: string;
  name: string;
  description: string;         // User's original input
  audience: Audience;          // Target age group for rendering
  compiledPrompt: string;      // AI-enhanced for consistency
  negativePrompt: string;
  referenceKey: string;        // R2 key for 2×2 reference sheet
  thumbnailKey: string;
  stylePreset?: string;        // Optional: lock to specific style
  timesUsed: number;
}
```

### Reference Sheet Structure

```
┌─────────────────────────────────────────┐
│                                         │
│  ┌───────────────┐ ┌───────────────┐   │
│  │               │ │               │   │
│  │    FRONT      │ │     SIDE      │   │
│  │    VIEW       │ │     VIEW      │   │
│  │               │ │               │   │
│  └───────────────┘ └───────────────┘   │
│                                         │
│  ┌───────────────┐ ┌───────────────┐   │
│  │               │ │               │   │
│  │    BACK       │ │     3/4       │   │
│  │    VIEW       │ │     VIEW      │   │
│  │               │ │               │   │
│  └───────────────┘ └───────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Hero Creation Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Create Hero                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Name your hero:                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Bella                                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Describe your hero in detail:                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ A friendly white bunny with long floppy ears that   │   │
│  │ hang down past her shoulders. She has big round     │   │
│  │ eyes with long lashes, a small pink triangle nose,  │   │
│  │ and wears a pink bow on top of her head between     │   │
│  │ her ears. She has a fluffy round cotton tail.       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  This hero is for:                                          │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                   │
│  │ 👶  │ │ 🧒  │ │ 🧑  │ │ 👩  │ │ 🎨  │                   │
│  │Tiny │ │Kids │ │Teens│ │Adult│ │ Pro │                   │
│  │ ✓   │ │     │ │     │ │     │ │     │                   │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                   │
│                                                             │
│                          [Generate Reference Sheet →]       │
│                          15 Blots                           │
└─────────────────────────────────────────────────────────────┘

                              ↓

┌─────────────────────────────────────────────────────────────┐
│  Approve Your Hero                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  ┌───────────┐ ┌───────────┐                       │   │
│  │  │   FRONT   │ │   SIDE    │                       │   │
│  │  └───────────┘ └───────────┘                       │   │
│  │  ┌───────────┐ ┌───────────┐                       │   │
│  │  │   BACK    │ │    3/4    │                       │   │
│  │  └───────────┘ └───────────┘                       │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Does Bella look right from all angles?                     │
│                                                             │
│  [🔄 Try Again]                      [✓ Save Hero]          │
│   15 Blots                                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Hero Compilation

```typescript
// src/server/ai/hero-compiler.ts

const HERO_COMPILER_PROMPT = `You are a character designer for children's coloring books.

Create a detailed, consistent character description that can be used to generate the SAME character across multiple images.

INPUT:
- Character name
- User's description
- Target audience age group

OUTPUT:
A detailed prompt for generating a CHARACTER REFERENCE SHEET with 4 views:
- FRONT view (facing viewer directly)
- SIDE view (profile facing right)
- BACK view (facing away)
- 3/4 view (turned slightly toward viewer)

REQUIREMENTS:
1. Expand vague descriptions into specific visual details
2. Add consistent proportions and measurements where applicable
3. Include distinctive features that can be recognized in any pose
4. Specify coloring book style appropriate for the audience
5. All 4 views must show the SAME character with IDENTICAL features
6. Pure black outlines on white background
7. No shading, no gradients
8. Line weight appropriate for audience age

Output ONLY the prompt text, nothing else.`;

export async function compileHeroPrompt(
  name: string,
  description: string,
  audience: Audience
): Promise<{ compiledPrompt: string; negativePrompt: string }> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: HERO_COMPILER_PROMPT },
      { 
        role: 'user', 
        content: `Name: ${name}\nDescription: ${description}\nAudience: ${audience}` 
      }
    ],
    temperature: 0.5,
  });
  
  return {
    compiledPrompt: response.choices[0].message.content!,
    negativePrompt: 'shading, gradient, gray, inconsistent proportions, different characters, realistic, photograph, broken lines, different styles between views',
  };
}
```

---

## Asset Library

### Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  My Library                                      Storage: 2.3 / 15 GB   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [All] [Heroes] [Style Anchors]            🔍 [Search...]              │
│                                                                         │
│  🎭 Heroes (3)                                             [+ Create]   │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐                             │
│  │  [thumb]  │ │  [thumb]  │ │  [thumb]  │                             │
│  │  Bella    │ │  Mochi    │ │  Drago    │                             │
│  │  🐰 Kids  │ │  🐱 Kids  │ │  🐉 Teen  │                             │
│  │  Used 12x │ │  Used 5x  │ │  Used 2x  │                             │
│  └───────────┘ └───────────┘ └───────────┘                             │
│                                                                         │
│  🎨 Style Anchors (2)                                                   │
│  ┌───────────┐ ┌───────────┐                                           │
│  │  [thumb]  │ │  [thumb]  │                                           │
│  │  Kawaii   │ │  Bold     │                                           │
│  │  Forest   │ │  Animals  │                                           │
│  │  Used 8x  │ │  Used 3x  │                                           │
│  └───────────┘ └───────────┘                                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Hero Usage in Projects

When user selects a hero from the library:

1. Hero reference sheet is fetched from R2
2. Hero compiled prompt is included in every page generation
3. Reference sheet is passed to GPT Image 1.5 as reference image
4. Hero's `times_used` counter is incremented

```typescript
// src/server/ai/generate-with-hero.ts

export async function generatePageWithHero(
  compiledPrompt: string,
  hero: HeroDNA,
  styleAnchor?: Buffer
): Promise<Buffer> {
  // Get hero reference sheet
  const heroReference = await getHeroReferenceSheet(hero.referenceKey);
  
  // Enhance prompt with hero details
  const enhancedPrompt = `${compiledPrompt}

CHARACTER REFERENCE:
The main character is ${hero.name}. ${hero.compiledPrompt}
The character MUST match the reference sheet exactly - same proportions, same features, same style.
Refer to the attached reference image for the exact character design.`;

  // Generate with reference
  return generateImage({
    prompt: enhancedPrompt,
    negativePrompt: hero.negativePrompt,
    heroReference,
    styleAnchor,
  });
}
```

---

## Consistency Enforcement Summary

| Layer | What It Does | When |
|-------|--------------|------|
| **Project DNA** | Locks style, audience, complexity | At creation |
| **Style Calibration** | User picks visual anchor | Before first generation |
| **Hero Reference** | 4-view character sheet | Per hero |
| **Planner-Compiler** | Enforces rules in every prompt | Every page |
| **Style Anchor Reference** | Passed to image API | Every generation |
| **Hero Reference** | Passed to image API | Every generation |
| **Deterministic Cleanup** | Guarantees pure B&W | Post-generation |
| **Quality Gate** | Validates output | Post-cleanup |
