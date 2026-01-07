# Cursor Prompts - Phases 3-6

> Continuation of copy-paste prompts. See CURSOR_PROMPTS.md for Phases 1-2.
> **UPDATED:** Includes Flux + Safety system integration

---

# PHASE 3: PROJECTS

---

## Prompt 3.1 - Projects Database Queries

```
I'm building Myjoe. Phase 2 (Auth) is complete.

Create database query functions for projects:

Create src/server/db/projects.ts:

FUNCTIONS:

1. getProjects(userId: string)
- Select all projects where owner_id = userId
- Filter: deleted_at IS NULL
- Order by updated_at DESC
- Return array of projects

2. getProject(projectId: string, userId: string)
- Select single project by ID
- Verify owner_id matches userId
- Include hero data if hero_id exists (join)
- Include pages ordered by sort_order
- Throw if not found or not owned

3. createProject(data: CreateProjectInput)
- Insert new project
- Auto-derive line_weight and complexity from audience:
  - toddler → thick, minimal
  - children → thick, moderate
  - tween → medium, moderate
  - teen → medium, detailed
  - adult → fine, intricate
- Return created project

4. updateProject(projectId: string, userId: string, data: UpdateProjectInput)
- Update only allowed fields: name, description, hero_id, status
- Cannot update: audience, style_preset, page_count (DNA is locked)
- Verify ownership
- Update updated_at
- Return updated project

5. deleteProject(projectId: string, userId: string)
- Soft delete: set deleted_at = now()
- Verify ownership

Use the Supabase server client.
Include proper TypeScript types for inputs and outputs.

Generate the file.
```

```bash
git add . && git commit -m "feat(3.1): project database queries"
```

---

## Prompt 3.2 - Projects API Routes

```
I'm building Myjoe. Project database queries are done.

Create API routes for projects:

1. src/app/api/projects/route.ts

GET handler:
- Get current user (requireAuth)
- Call getProjects(userId)
- Return { projects: [...] }

POST handler:
- Get current user
- Validate body with zod schema:
  - name: string, 1-100 chars
  - pageCount: number, 1-45
  - audience: enum
  - stylePreset: enum
  - trimSize: enum (default '8.5x11')
  - heroId: uuid or null (optional)
- Check project limit (free plan = max 3 projects)
- Call createProject(data)
- Return created project with 201 status

2. src/app/api/projects/[id]/route.ts

GET handler:
- Get projectId from params
- Get current user
- Call getProject(projectId, userId)
- Return project with pages

PATCH handler:
- Validate body (only name, description, heroId allowed)
- Call updateProject
- Return updated project

DELETE handler:
- Call deleteProject
- Return 204 no content

Include error handling:
- 401 for unauthorized
- 403 for forbidden (not owner)
- 404 for not found
- 400 for validation errors

Add correlation IDs to all error logs.

Generate both route files.
```

```bash
git add . && git commit -m "feat(3.2): projects API routes"
```

---

## Prompt 3.3 - Projects List UI

```
I'm building Myjoe. Projects API is working.

Create the projects list page:

1. src/hooks/use-projects.ts
- useProjects(): Fetch all projects with TanStack Query
- useProject(id): Fetch single project
- useCreateProject(): Mutation to create project (with optimistic update)
- useDeleteProject(): Mutation to delete project
- Invalidate queries on mutations

2. src/components/features/project/project-card.tsx
- Card showing project thumbnail, name, page count, status
- Status badge (draft=zinc, generating=blue pulse, ready=green, exported=purple)
- Click navigates to /studio/projects/[id]
- Dropdown menu with Delete option
- Show skeleton with shimmer while image loads (>500ms)
- Hover: border-zinc-700, slight scale transform
- Use aspect-[3/4] for thumbnail area

3. src/app/(studio)/projects/page.tsx
- Page title "My Projects" (text-2xl font-semibold)
- "New Project" button (top right, primary style)
- Grid of ProjectCards (grid-cols-2 sm:3 md:4 lg:5, gap-6)
- Empty state if no projects:
  - Icon (Book from Lucide) in circle bg-zinc-800
  - "No projects yet"
  - "Create your first coloring book"
  - "Create Project" button
- Loading state: skeleton cards with shimmer animation

STYLING (4px grid):
- Grid gap: 24px (space-6)
- Card padding: 0 (image fills top), p-4 for content below
- Content area: title (text-base font-medium), page count (text-sm text-zinc-400)

Generate all files.
```

```bash
git add . && git commit -m "feat(3.3): projects list page and components"
```

---

## Prompt 3.4 - Project Wizard (Part 1)

```
I'm building Myjoe. Projects list is done.

Create the project creation wizard - Part 1:

1. src/app/(studio)/projects/new/page.tsx
- Multi-step wizard container
- Track current step in state (1-4)
- Back/Next navigation
- Store form data in state

2. src/components/features/project/wizard/step-basics.tsx (Step 1)
- "Name your coloring book" heading
- Name input (required)
- Page count selector:
  - Presets: 20, 30, 40 pages (buttons)
  - Custom input option
  - Range: 1-45
- Validation before allowing Next

3. src/components/features/project/wizard/step-audience.tsx (Step 2)
- "Who is this book for?" heading
- 5 large visual buttons in a row:
  - Toddler (👶) - "Ages 2-4"
  - Children (🧒) - "Ages 5-8"
  - Tween (🧑) - "Ages 9-12"
  - Teen (👩) - "Ages 13-17"
  - Adult (🎨) - "Ages 18+"
- Selected state: blue border, background tint
- Description below selected option

WIZARD STYLING:
- Centered content, max-width 600px
- Progress indicator at top (steps 1-4)
- Generous padding

Generate these files.
```

```bash
git add . && git commit -m "feat(3.4): project wizard steps 1-2"
```

---

## Prompt 3.5 - Project Wizard (Part 2)

```
I'm building Myjoe. Wizard steps 1-2 are done.

Create wizard steps 3-4:

1. src/components/features/project/wizard/step-style.tsx (Step 3)
- "Choose your style" heading
- 5 visual style cards in a grid:
  - Bold & Simple
  - Kawaii Cute
  - Whimsical Fantasy
  - Cartoon Classic
  - Nature Botanical
- Each card: sample image placeholder, name, description
- Selected state: blue border, checkmark

2. src/components/features/project/wizard/step-hero.tsx (Step 4)
- "Add a hero character? (Optional)" heading
- Two options:
  a. "Skip - No main character"
  b. "Choose from library" - show hero grid if heroes exist
- Selected hero shows thumbnail and name
- "Create new hero" link

3. Wire up all 4 steps in the wizard page:
- "Create Project" button on final step
- On submit: call createProject mutation
- On success: navigate to /studio/projects/[id]
- Show loading state during creation

Generate these files.
```

```bash
git add . && git commit -m "feat(3.5): project wizard steps 3-4"
```

---

## Prompt 3.6 - Project Editor Shell

```
I'm building Myjoe. Project wizard is complete.

Create the project editor page with FLUID 3-COLUMN LAYOUT:

1. src/app/(studio)/projects/[id]/page.tsx
- Fetch project with pages using useProject hook
- Fluid 3-column layout using CSS Grid:
  - Left panel (300px): Page thumbnails in scrollable list
  - Center (fluid, min 400px): Selected page preview with zoom
  - Right panel (360px): Inspector with accordion sections
- Both side panels collapsible via toggle buttons
- Auto-save indicator in header showing save status

2. src/components/features/project/page-thumbnails.tsx (Left Panel)
- Tabs at top: "Pages" (active) | "Assets" | "History"
- Scrollable list of page thumbnails (80px × 80px)
- Page number badge on each thumbnail
- Selected state: ring-2 ring-blue-500
- Drag handle for reordering (future)
- "Generate Pages" button at bottom if no pages exist
- Show skeleton thumbnails while loading

3. src/components/features/project/page-preview.tsx (Center)
- Large image display of selected page
- Neutral background (bg-canvas #171717)
- Zoom controls at bottom: slider + fit button
- Empty state if no pages: icon + "Generate pages to get started"

4. src/components/features/project/page-inspector.tsx (Right Panel)
- Context-sensitive based on selection
- Accordion sections:
  - "Scene" - scene brief, page type
  - "Actions" - Regenerate, Edit, Simplify buttons
  - "Versions" - version history with thumbnails
- Actions show Blot cost (e.g., "Regenerate · 12 Blots")
- Sticky action buttons at panel bottom

5. src/components/features/project/project-header.tsx
- Back arrow to projects list
- Project name (editable on click)
- Status badge
- Auto-save indicator: "Saving..." | "Saved" | "Save failed · Retry"
- Blot balance display (🎨 847)
- Export button (primary)

Generate all files.
```

```bash
git add . && git commit -m "feat(3.6): project editor with fluid 3-column layout"
git tag -a v0.3 -m "Phase 3 complete: Projects"
git push origin main --tags
```

---

# PHASE 4: AI PIPELINE (Updated for Flux + Safety)

---

## Prompt 4.1 - Constants & Types

```
I'm building Myjoe. Phase 3 (Projects) is complete.

Create the constants and types for the AI pipeline:

1. Create src/lib/constants/index.ts with ALL constants:

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
export type Audience = typeof AUDIENCES[number];

// === STYLE PRESETS ===
export const STYLE_PRESETS = ['bold-simple', 'kawaii', 'whimsical', 'cartoon', 'botanical'] as const;
export type StylePreset = typeof STYLE_PRESETS[number];

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

2. Create src/types/ai.ts with TypeScript types for:
- ProjectDNA
- CompiledPrompt
- FluxConfig
- SafetyResult
- GenerationResult

Generate both files.
```

```bash
git add . && git commit -m "feat(4.1): constants and types for AI pipeline"
```

---

## Prompt 4.2 - Forbidden Content

```
I'm building Myjoe. Constants are set up.

Create the forbidden content lists for content safety:

Create src/lib/constants/forbidden-content.ts:

export const FORBIDDEN_BY_AUDIENCE = {
  toddler: [
    // Violence & Weapons
    'scary', 'monster', 'weapon', 'gun', 'sword', 'knife', 'fight', 'attack',
    'blood', 'violence', 'war', 'battle', 'kill', 'dead', 'death',
    // Scary creatures
    'ghost', 'zombie', 'skeleton', 'skull', 'demon', 'devil', 'witch',
    'vampire', 'werewolf', 'spider', 'snake', 'shark', 'wolf attacking',
    // Dangerous situations
    'fire', 'explosion', 'danger', 'falling', 'drowning',
    // Negative emotions
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

Update src/lib/constants/index.ts to re-export from forbidden-content.ts.

Generate the file.
```

```bash
git add . && git commit -m "feat(4.2): forbidden content lists for safety"
```

---

## Prompt 4.3 - Content Safety System

```
I'm building Myjoe. Forbidden content lists are ready.

Create the content safety system:

1. Create src/server/ai/sanitize.ts:

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
  
  return clean.slice(0, 500);
}

export function validateIdea(idea: string): { valid: boolean; reason?: string } {
  if (idea.length < 3) return { valid: false, reason: 'Please provide more detail' };
  if (idea.length > 500) return { valid: false, reason: 'Please shorten (max 500 chars)' };
  
  const hasVisual = /\b(animal|character|scene|place|object|person|creature|plant|flower|vehicle|building)\b/i.test(idea);
  if (!hasVisual) return { valid: false, reason: 'Please describe something visual' };
  
  return { valid: true };
}

2. Create src/server/ai/content-safety.ts:

import OpenAI from 'openai';
import { AUDIENCE_DERIVATIONS } from '@/lib/constants';
import { FORBIDDEN_BY_AUDIENCE, SAFE_SUGGESTIONS } from '@/lib/constants/forbidden-content';

const openai = new OpenAI();

export interface SafetyResult {
  safe: boolean;
  blocked: string[];
  suggestions?: string[];
}

const THRESHOLDS = {
  strict: { violence: 0.05, 'violence/graphic': 0.01, sexual: 0.01, hate: 0.05, 'self-harm': 0.05 },
  moderate: { violence: 0.20, 'violence/graphic': 0.10, sexual: 0.10, hate: 0.20, 'self-harm': 0.15 },
  standard: { violence: 0.50, 'violence/graphic': 0.30, sexual: 0.30, hate: 0.40, 'self-harm': 0.30 },
};

export async function checkContentSafety(input: string, audience: Audience): Promise<SafetyResult> {
  const rules = AUDIENCE_DERIVATIONS[audience];
  const forbidden = FORBIDDEN_BY_AUDIENCE[audience];
  
  // Layer 1: Keyword blocklist
  const lowerInput = input.toLowerCase();
  const blocked = forbidden.filter(word => lowerInput.includes(word.toLowerCase()));
  
  if (blocked.length > 0) {
    return { safe: false, blocked, suggestions: SAFE_SUGGESTIONS[audience] };
  }
  
  // Layer 2: OpenAI Moderation API
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
  
  return { safe: true, blocked: [] };
}

Generate both files.
```

```bash
git add . && git commit -m "feat(4.3): content safety system with moderation"
```

---

## Prompt 4.4 - Flux Image Generator

```
I'm building Myjoe. Content safety is ready.

Install Replicate and create the Flux generator:

npm install replicate

Create src/server/ai/flux-generator.ts:

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
  
  const params: Record<string, any> = {
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
      seed: params.seed,
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

Generate the file.
```

```bash
git add . && git commit -m "feat(4.4): Flux image generator via Replicate"
```

---

## Prompt 4.5 - Planner-Compiler

```
I'm building Myjoe. Flux generator is ready.

Create the planner-compiler that transforms user ideas into Flux-optimized prompts:

Create src/server/ai/planner-compiler.ts:

import OpenAI from 'openai';
import { checkContentSafety } from './content-safety';
import { sanitizePrompt, validateIdea } from './sanitize';
import { 
  AUDIENCE_DERIVATIONS, 
  FLUX_TRIGGERS, 
  LINE_WEIGHT_PROMPTS, 
  COMPLEXITY_PROMPTS,
} from '@/lib/constants';
import { FORBIDDEN_BY_AUDIENCE } from '@/lib/constants/forbidden-content';
import type { Audience, StylePreset, FluxModel } from '@/lib/constants';

const openai = new OpenAI();

// Full system prompt - see 05_AI_PIPELINE.md for complete version
const SYSTEM_PROMPT = `You are a professional coloring book page planner for KDP publishers.

CRITICAL: Every prompt MUST start with the trigger: {fluxTrigger}

Create {pageCount} distinct, age-appropriate coloring book pages.

RULES:
- Start every prompt with: {fluxTrigger}
- Pure black outlines on pure white background
- {lineWeight} line weight: {lineWeightDescription}
- {complexity} complexity: {complexityDescription}
- No shading, gradients, gray tones, or fills
- All shapes must be CLOSED (suitable for coloring)
- Margin-safe composition (10% padding)
- No text, watermarks, signatures

AUDIENCE: {audience} (ages {ageRange})
SAFETY: {safetyLevel}
FORBIDDEN: {forbiddenContent}
MAX ELEMENTS: {maxElements}

HERO (if provided): {heroDescription}

OUTPUT JSON ONLY:
{
  "pages": [
    {
      "pageNumber": 1,
      "sceneBrief": "Short description",
      "compositionType": "full-body",
      "compiledPrompt": "{fluxTrigger}, [detailed prompt]...",
      "negativePrompt": "{negativePrompt}"
    }
  ]
}`;

interface PlannerInput {
  userIdea: string;
  pageCount: number;
  audience: Audience;
  stylePreset: StylePreset;
  lineWeight: string;
  complexity: string;
  heroDescription?: string;
  fluxModel?: FluxModel;
}

interface PlannerResult {
  success: boolean;
  pages?: CompiledPrompt[];
  error?: string;
  safetyIssue?: boolean;
  suggestions?: string[];
}

export async function planAndCompile(input: PlannerInput): Promise<PlannerResult> {
  // 1. Validate
  const validation = validateIdea(input.userIdea);
  if (!validation.valid) return { success: false, error: validation.reason };
  
  // 2. Sanitize
  const sanitizedIdea = sanitizePrompt(input.userIdea);
  
  // 3. Safety check
  const safetyResult = await checkContentSafety(sanitizedIdea, input.audience);
  if (!safetyResult.safe) {
    return {
      success: false,
      error: `Content not suitable for ${input.audience}`,
      safetyIssue: true,
      suggestions: safetyResult.suggestions,
    };
  }
  
  // 4. Build context
  const rules = AUDIENCE_DERIVATIONS[input.audience];
  const fluxConfig = FLUX_TRIGGERS[input.fluxModel || 'flux-lineart'];
  const negativePrompt = buildNegativePrompt(input.audience);
  
  const prompt = SYSTEM_PROMPT
    .replace(/{fluxTrigger}/g, fluxConfig.trigger || fluxConfig.template)
    .replace('{pageCount}', String(input.pageCount))
    .replace('{lineWeight}', input.lineWeight)
    .replace('{lineWeightDescription}', LINE_WEIGHT_PROMPTS[input.lineWeight as keyof typeof LINE_WEIGHT_PROMPTS])
    .replace('{complexity}', input.complexity)
    .replace('{complexityDescription}', COMPLEXITY_PROMPTS[input.complexity as keyof typeof COMPLEXITY_PROMPTS])
    .replace('{audience}', input.audience)
    .replace('{ageRange}', rules.ageRange)
    .replace('{safetyLevel}', rules.safetyLevel.toUpperCase())
    .replace('{forbiddenContent}', FORBIDDEN_BY_AUDIENCE[input.audience].slice(0, 15).join(', '))
    .replace('{maxElements}', String(rules.maxElements))
    .replace('{heroDescription}', input.heroDescription || 'No hero character')
    .replace('{negativePrompt}', negativePrompt);
  
  // 5. Call GPT-4o-mini
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Create ${input.pageCount} coloring pages for: "${sanitizedIdea}"` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });
    
    const content = response.choices[0].message.content;
    if (!content) return { success: false, error: 'No response' };
    
    const parsed = JSON.parse(content);
    return { success: true, pages: parsed.pages };
    
  } catch (error) {
    console.error('Planner error:', error);
    return { success: false, error: 'Failed to generate pages' };
  }
}

function buildNegativePrompt(audience: Audience): string {
  const base = [
    'shading', 'gradient', 'gray', 'color', 'photorealistic', '3D', 'shadow',
    'watermark', 'signature', 'text', 'broken lines', 'crosshatching', 'blurry'
  ];
  const audienceNegatives = FORBIDDEN_BY_AUDIENCE[audience].slice(0, 10);
  return [...new Set([...base, ...audienceNegatives])].join(', ');
}

Generate the file with full implementation.
```

```bash
git add . && git commit -m "feat(4.5): planner-compiler with safety integration"
```

---

## Prompt 4.6 - Cleanup & Quality Gate

```
I'm building Myjoe. Planner-compiler is done.

Create cleanup pipeline and quality gate:

1. Create src/server/ai/cleanup.ts:

import sharp from 'sharp';
import { TRIM_SIZES } from '@/lib/constants';

interface CleanupOptions {
  targetWidth: number;
  targetHeight: number;
  threshold?: number;
}

export async function cleanupImage(buffer: Buffer, options: CleanupOptions): Promise<Buffer> {
  const { targetWidth, targetHeight, threshold = 128 } = options;
  
  return sharp(buffer)
    .grayscale()
    .threshold(threshold)
    .blur(0.5)
    .threshold(threshold)
    .resize(targetWidth, targetHeight, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255 }
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer();
}

2. Create src/server/ai/quality-gate.ts:

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
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  
  const checks = {
    pureBlackWhite: stats.channels[0].min <= 5 && stats.channels[0].max >= 250,
    hasContent: stats.channels[0].mean < 250,
    notTooDense: stats.channels[0].mean > 180,
    marginSafe: checkMargins(data, info.width, info.height, 75),
  };
  
  const failReasons = Object.entries(checks).filter(([_, v]) => !v).map(([k]) => k);
  const score = (Object.values(checks).filter(Boolean).length / 4) * 100;
  
  return { passed: failReasons.length === 0, score, checks, failReasons };
}

function checkMargins(data: Buffer, width: number, height: number, margin: number): boolean {
  for (let y = 0; y < margin; y++) {
    for (let x = 0; x < width; x++) {
      if (data[y * width + x] < 128) return false;
    }
  }
  return true;
}

Generate both files.
```

```bash
git add . && git commit -m "feat(4.6): cleanup pipeline and quality gate"
```

---

## Prompt 4.7 - Post-Generation Safety

```
I'm building Myjoe. Cleanup and quality gate are done.

Create post-generation safety check for children's content:

Create src/server/ai/image-safety-check.ts:

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

Generate the file.
```

```bash
git add . && git commit -m "feat(4.7): post-generation safety check with GPT-4V"
```

---

## Prompt 4.8 - Complete Generation Pipeline

```
I'm building Myjoe. All AI components are ready.

Create the complete page generation pipeline:

Create src/server/ai/generate-page.ts:

import { generateWithFlux, downloadImage } from './flux-generator';
import { cleanupImage } from './cleanup';
import { qualityCheck } from './quality-gate';
import { checkGeneratedImageSafety } from './image-safety-check';
import { TRIM_SIZES } from '@/lib/constants';
import type { Audience, FluxModel } from '@/lib/constants';

interface GeneratePageOptions {
  compiledPrompt: string;
  negativePrompt: string;
  audience: Audience;
  fluxModel: FluxModel;
  trimSize: string;
  maxRetries?: number;
}

interface PageResult {
  success: boolean;
  imageBuffer?: Buffer;
  seed?: number;
  qualityScore?: number;
  safetyPassed?: boolean;
  needsReview?: boolean;
  error?: string;
}

export async function generatePage(options: GeneratePageOptions): Promise<PageResult> {
  const { compiledPrompt, negativePrompt, audience, fluxModel, trimSize, maxRetries = 2 } = options;
  const dimensions = TRIM_SIZES[trimSize as keyof typeof TRIM_SIZES] || TRIM_SIZES['8.5x11'];
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // 1. Generate with Flux
    const genResult = await generateWithFlux({
      compiledPrompt,
      negativePrompt,
      fluxModel,
      trimSize,
    });
    
    if (!genResult.success) {
      if (attempt === maxRetries) return { success: false, error: genResult.error };
      continue;
    }
    
    // 2. Download image
    const rawBuffer = await downloadImage(genResult.imageUrl!);
    
    // 3. Cleanup
    const cleanedBuffer = await cleanupImage(rawBuffer, {
      targetWidth: dimensions.width,
      targetHeight: dimensions.height,
    });
    
    // 4. Quality gate
    const quality = await qualityCheck(cleanedBuffer);
    
    // 5. Safety check for children
    let safetyPassed = true;
    if (['toddler', 'children'].includes(audience)) {
      const safetyResult = await checkGeneratedImageSafety(genResult.imageUrl!, audience);
      safetyPassed = safetyResult.safe;
      
      if (!safetyPassed && safetyResult.recommendation === 'regenerate' && attempt < maxRetries) {
        continue; // Auto-retry
      }
    }
    
    // 6. Return result
    return {
      success: true,
      imageBuffer: cleanedBuffer,
      seed: genResult.seed,
      qualityScore: quality.score,
      safetyPassed,
      needsReview: !quality.passed || !safetyPassed,
    };
  }
  
  return { success: false, error: 'Max retries exceeded' };
}

Generate the file.
```

```bash
git add . && git commit -m "feat(4.8): complete generation pipeline with safety"
git tag -a v0.4 -m "Phase 4 complete: AI Pipeline with Flux + Safety"
git push origin main --tags
```

---

# PHASE 5: STYLE CALIBRATION

---

## Prompt 5.1 - Calibration Generator

```
I'm building Myjoe. Phase 4 (AI Pipeline) is complete.

Create style calibration generator:

Create src/server/ai/style-calibration.ts:

import { generateWithFlux, downloadImage } from './flux-generator';
import { cleanupImage } from './cleanup';
import { FLUX_TRIGGERS, LINE_WEIGHT_PROMPTS, TRIM_SIZES } from '@/lib/constants';
import type { Audience, StylePreset, FluxModel } from '@/lib/constants';

interface CalibrationInput {
  subject: string;
  audience: Audience;
  stylePreset: StylePreset;
  lineWeight: string;
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
  const { subject, audience, stylePreset, lineWeight, fluxModel = 'flux-lineart' } = input;
  
  const fluxConfig = FLUX_TRIGGERS[fluxModel];
  const linePrompt = LINE_WEIGHT_PROMPTS[lineWeight as keyof typeof LINE_WEIGHT_PROMPTS];
  const dimensions = TRIM_SIZES['8.5x11'];
  
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
        targetWidth: 512, // Smaller for calibration
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

Generate the file.
```

```bash
git add . && git commit -m "feat(5.1): calibration generator"
```

---

## Prompt 5.2 - Calibration API

```
I'm building Myjoe. Calibration generator is done.

Create calibration API:

1. src/app/api/projects/[id]/calibrate/route.ts

POST: Generate 4 samples
- Verify ownership
- Check Blots (10 required)
- Deduct Blots
- Call generateCalibrationSamples
- Store in temp R2 location
- Return { samples: [{ id, url }], blotsSpent: 10 }

2. src/app/api/projects/[id]/calibrate/select/route.ts

POST: Select style anchor
- Verify ownership
- Copy selected sample to permanent storage
- Generate description with GPT-4o-mini
- Update project with style_anchor_key and description
- Delete temp samples
- Return { styleAnchorUrl, styleAnchorDescription }

Generate both files.
```

```bash
git add . && git commit -m "feat(5.2): calibration API"
```

---

## Prompt 5.3 - Calibration UI

```
I'm building Myjoe. Calibration API is done.

Create calibration UI:

Create src/components/features/project/style-calibration.tsx:

STATES: 'input' | 'generating' | 'select' | 'confirming'

INPUT STATE:
- "What subject should we use to calibrate your style?" label
- Subject textarea with placeholder: "e.g., a friendly cat sitting"
- "Generate Samples" button (shows cost: 10 Blots)
- Blot balance display

GENERATING STATE:
- Loading spinner
- "Generating 4 style samples..."
- Progress indicator

SELECT STATE:
- "Choose your preferred style" heading
- 2x2 grid of samples
- Each sample is a clickable card with blue border on select
- "Use This Style" button (enabled when selected)

CONFIRMING STATE:
- Loading spinner
- "Setting up your style..."
- Auto-closes on completion

Integration:
- Show calibration if project has no style_anchor_key
- After complete, update project in cache
- Show "Style Ready ✓" indicator when calibrated

Generate the component.
```

```bash
git add . && git commit -m "feat(5.3): calibration UI"
git tag -a v0.5 -m "Phase 5 complete: Style Calibration"
git push origin main --tags
```

---

# PHASE 6: GENERATION JOBS

---

## Prompt 6.1 - R2 Storage

```
I'm building Myjoe. Phase 5 (Calibration) is complete.

Create R2 storage client:

Create src/server/storage/r2-client.ts:

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;

// Upload functions
export async function uploadImage(buffer: Buffer, key: string, contentType: string): Promise<void> {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
}

export async function getImage(key: string): Promise<Buffer> {
  const response = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  return Buffer.from(await response.Body!.transformToByteArray());
}

export async function deleteImage(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn });
}

export async function getSignedUploadUrl(key: string, contentType: string, expiresIn = 300): Promise<string> {
  return getSignedUrl(s3, new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }), { expiresIn });
}

// Key helpers
export const getPageKey = (userId: string, projectId: string, pageId: string, version: number) =>
  `assets/${userId}/projects/${projectId}/pages/${pageId}/v${version}.png`;

export const getThumbnailKey = (userId: string, projectId: string, pageId: string, version: number) =>
  `assets/${userId}/projects/${projectId}/thumbs/${pageId}/v${version}.jpg`;

export const getHeroKey = (userId: string, heroId: string) =>
  `assets/${userId}/heroes/${heroId}/reference.png`;

export const getExportKey = (userId: string, projectId: string, timestamp: string) =>
  `assets/${userId}/exports/${projectId}/${timestamp}/interior.pdf`;

Generate the file.
```

```bash
git add . && git commit -m "feat(6.1): R2 storage client"
```

---

## Prompt 6.2 - Jobs & Pages Database

```
I'm building Myjoe. R2 storage is done.

Create database functions for jobs and pages:

1. src/server/db/jobs.ts:

Functions:
- createJob(data): Create job record
- createJobItems(jobId, items): Create job items
- getJob(jobId, userId): Get job with verification
- getJobItems(jobId): Get all items for job
- updateJob(jobId, data): Update job status/progress
- updateJobItem(itemId, data): Update item status
- getPendingJobItems(jobId): Get items with status 'pending'

2. src/server/db/pages.ts:

Functions:
- createPage(data): Create page record
- createPageVersion(data): Create page version
- getPage(pageId, userId): Get page with ownership check
- getPageVersions(pageId): Get all versions
- updatePage(pageId, data): Update page
- setCurrentVersion(pageId, version): Set current version

Include proper TypeScript types.

Generate both files.
```

```bash
git add . && git commit -m "feat(6.2): jobs and pages database"
```

---

## Prompt 6.3 - Blot Management

```
I'm building Myjoe. Job database is done.

Create Blot management:

1. src/server/billing/blots.ts:

Functions:
- getBlotBalance(userId): Get current balance
- checkBlotBalance(userId, required): Check if sufficient
- spendBlots(userId, amount, reason): Deduct blots
- reserveBlots(userId, amount, jobId): Reserve for job
- refundBlots(userId, amount, jobId, reason): Refund unused

2. src/lib/errors.ts:

Custom error classes:
- AppError (base class)
- InsufficientBlotsError
- StorageFullError
- NotFoundError
- ForbiddenError
- SafetyBlockedError (NEW - for safety rejections)

Generate both files.
```

```bash
git add . && git commit -m "feat(6.3): blot management"
```

---

## Prompt 6.4 - Generation API

```
I'm building Myjoe. Blot management is done.

Create generation API:

1. src/app/api/generate/route.ts

POST: Start generation job
- Validate { projectId, idea, pageNumbers? }
- Check content safety for the idea
- If safety blocked, return 400 with suggestions
- Verify style anchor exists
- Calculate and reserve Blots
- Create job and job_items
- Return { jobId, status, totalItems, blotsReserved }

2. src/app/api/generate/[jobId]/route.ts

GET: Job status with page thumbnails

3. src/app/api/generate/[jobId]/cancel/route.ts

POST: Cancel and refund unspent Blots

Generate all files with safety integration.
```

```bash
git add . && git commit -m "feat(6.4): generation API with safety"
```

---

## Prompt 6.5 - Job Processor

```
I'm building Myjoe. Generation API is done.

Create job processor with safety checks:

Create src/server/jobs/process-generation.ts:

FUNCTION: processGenerationJob(jobId): Promise<void>

1. Get job, update to 'processing'
2. Get project with hero and style anchor
3. Call planAndCompile for all page prompts
   - If safety blocks the idea, fail job with reason
4. Process in batches of 3:
   - For each page:
     a. Call generatePage with all safety checks
     b. If needsReview is true, mark for review
     c. Upload to R2
     d. Create page_version
     e. Update progress
5. Handle failures with retry (max 2)
6. Update job to 'completed'

Also create src/server/jobs/trigger.ts with triggerGenerationJob function.

Generate both files.
```

```bash
git add . && git commit -m "feat(6.5): job processor with safety"
```

---

## Prompt 6.6 - Generation UI

```
I'm building Myjoe. Job processor is done.

Create generation UI with safety feedback:

1. src/hooks/use-generation.ts:
- useGenerationJob(jobId): Poll every 2s
- useStartGeneration(): Mutation
- useCancelGeneration(): Mutation

2. src/components/features/project/generation-progress.tsx:

Full-screen generation progress:
- Centered content, max-w-xl
- "✨ Generating your coloring book..." heading
- Progress bar with percentage
- Current stage text
- Grid of thumbnail placeholders filling in
- Estimated time remaining
- Cancel button

3. src/components/features/project/generation-start.tsx:

Generation start in inspector:
- "What's your coloring book about?" label
- Idea textarea
- SAFETY FEEDBACK: Show error inline if safety blocked
  - Red border on textarea
  - Error message: "This content isn't suitable for [audience]"
  - Suggestions list: "Try instead: ..."
- Blot cost calculation
- "Generate" button

4. Update project editor to show appropriate view.

Generate all files.
```

```bash
git add . && git commit -m "feat(6.6): generation UI with safety feedback"
git tag -a v0.6 -m "Phase 6 complete: Generation Jobs"
git push origin main --tags
```
