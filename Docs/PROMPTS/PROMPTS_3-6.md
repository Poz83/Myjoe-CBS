# Cursor Prompts - Phases 3-6

> Continuation of copy-paste prompts. See CURSOR_PROMPTS.md for Phases 1-2.

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

# PHASE 4: AI PIPELINE

---

## Prompt 4.1 - Planner-Compiler

```
I'm building Myjoe. Phase 3 (Projects) is complete.

Create the AI planner-compiler:

Create src/server/ai/planner-compiler.ts:

This uses GPT-4o-mini to transform a user's idea into page prompts.

SYSTEM PROMPT (include in file as constant):
- Role: coloring book page planner for KDP publishers
- Rules to enforce: coloring book style, pure black on white, no shading, correct line weight, closed shapes, margin-safe
- Line weight specs: thick (6-8px), medium (3-5px), fine (1-3px)
- Complexity specs: minimal (3-5 elements), moderate (5-10), detailed (10-20), intricate (20+)
- Hero instructions if provided
- Composition variety: close-up, full-body, action, environment, pattern
- Output: JSON array of pages with pageNumber, sceneBrief, compositionType, compiledPrompt, negativePrompt

FUNCTION: planAndCompile(input: PlannerInput): Promise<CompiledPage[]>

Input type:
- userIdea: string
- pageCount: number
- audience, stylePreset, lineWeight, complexity
- heroDescription?: string
- styleAnchorDescription?: string

Use OpenAI SDK with gpt-4o-mini, temperature 0.7, JSON response format.

Generate the file.
```

```bash
git add . && git commit -m "feat(4.1): planner-compiler AI module"
```

---

## Prompt 4.2 - Image Generator

```
I'm building Myjoe. Planner-compiler is done.

Create the image generator:

Create src/server/ai/image-generator.ts:

FUNCTION: generateImage(options: GenerateOptions): Promise<Buffer>

Options:
- prompt: string
- negativePrompt: string
- heroReference?: Buffer
- styleAnchor?: Buffer

LOGIC:
1. Combine prompt with "AVOID: {negativePrompt}"
2. If references provided: use images.edit endpoint with reference as image
3. If no references: use images.generate endpoint
4. Settings: model 'gpt-image-1.5', size '1536x1024', quality 'high', response_format 'b64_json'
5. Decode base64 and return Buffer

Include retry logic (max 2 retries) and error handling.

Generate the file.
```

```bash
git add . && git commit -m "feat(4.2): image generator module"
```

---

## Prompt 4.3 - Cleanup Pipeline

```
I'm building Myjoe. Image generator is done.

Create the cleanup pipeline:

Create src/server/ai/cleanup.ts:

FUNCTION: cleanupImage(buffer: Buffer, options: CleanupOptions): Promise<Buffer>

Options: targetWidth, targetHeight, threshold (default 128)

STEPS using Sharp:
1. Convert to grayscale
2. Threshold to pure B&W
3. Slight blur + re-threshold to clean edges
4. Resize to target dimensions with white background
5. Flatten with white background
6. Output as PNG

EXPORT: TRIM_SIZES constant
- '8.5x11': { width: 2550, height: 3300 }
- '8.5x8.5': { width: 2550, height: 2550 }
- '6x9': { width: 1800, height: 2700 }

Also create: createThumbnail(buffer, size = 300) → JPEG thumbnail

Generate the file.
```

```bash
git add . && git commit -m "feat(4.3): cleanup pipeline"
```

---

## Prompt 4.4 - Quality Gate

```
I'm building Myjoe. Cleanup pipeline is done.

Create the quality gate:

Create src/server/ai/quality-gate.ts:

FUNCTION: qualityCheck(buffer: Buffer): Promise<QualityReport>

QualityReport type:
- passed: boolean
- score: 0-100
- checks: { pureBlackWhite, hasContent, notTooDense, marginSafe }
- failReasons: string[]

CHECKS using Sharp stats():
1. pureBlackWhite: min < 10 and max > 245
2. hasContent: mean < 250 (not blank)
3. notTooDense: mean > 200 (colorable)
4. marginSafe: edge pixels all > 250

Score: 25 points per passed check.

Generate the file.
```

```bash
git add . && git commit -m "feat(4.4): quality gate"
```

---

## Prompt 4.5 - Pipeline Integration

```
I'm building Myjoe. All AI modules are done.

Create the integrated pipeline:

Create src/server/ai/generate-page.ts:

FUNCTION: generateSinglePage(input): Promise<PageGenerationResult>

Input: compiledPrompt, negativePrompt, trimSize, heroReferenceBuffer?, styleAnchorBuffer?

Result: imageBuffer, thumbnailBuffer, qualityReport

LOGIC:
1. generateImage with prompt and references
2. cleanupImage with trim size dimensions
3. qualityCheck
4. If passed OR retried twice: create thumbnail, return result
5. If failed and retries < 2: retry from step 1

Also create src/server/ai/index.ts that exports all functions.

Generate both files.
```

```bash
git add . && git commit -m "feat(4.5): integrated pipeline"
git tag -a v0.4 -m "Phase 4 complete: AI Pipeline"
git push origin main --tags
```

---

# PHASE 5: STYLE CALIBRATION

---

## Prompt 5.1 - Calibration Generator

```
I'm building Myjoe. Phase 4 (AI Pipeline) is complete.

Create style calibration:

Create src/server/ai/style-calibration.ts:

FUNCTION: generateCalibrationSamples(input): Promise<CalibrationSample[]>

Input: subject, stylePreset, audience

Output: 4 samples with id, imageBuffer, variation

VARIATIONS:
1. "balanced interpretation"
2. "more detailed with decorative accents"
3. "simpler with bolder shapes"
4. "more playful with curved lines"

For each: build prompt with subject + style + audience + variation, generate with low quality, run through cleanup at smaller size.

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
- Verify ownership, check Blots (10), deduct
- Call generateCalibrationSamples
- Store in temp R2 location
- Return { samples: [{ id, url }], blotsSpent: 10 }

2. src/app/api/projects/[id]/calibrate/select/route.ts
POST: Select style anchor
- Copy selected to permanent storage
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

INPUT: Subject textarea, "Generate Samples" button (10 Blots)
GENERATING: Loading spinner
SELECT: 2x2 grid of samples, click to select, "Use This Style" button
CONFIRMING: Loading, then auto-close

Integrate into project editor:
- Show calibration prompt if no style_anchor_key
- After complete, show "Style Ready ✓"

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

Create R2 storage:

Create src/server/storage/r2-client.ts:

S3 client configured for Cloudflare R2.

FUNCTIONS:
- uploadImage(buffer, key, contentType): Promise<void>
- getImage(key): Promise<Buffer>
- deleteImage(key): Promise<void>
- deletePrefix(prefix): Promise<void>
- getSignedUrl(key, expiresIn = 3600): Promise<string>
- getSignedUploadUrl(key, contentType, expiresIn = 300): Promise<string>

KEY HELPERS:
- getPageKey(userId, projectId, pageId, version)
- getThumbnailKey(userId, projectId, pageId, version)
- getHeroKey(userId, heroId)
- getExportKey(userId, projectId, timestamp)

Generate the file.
```

```bash
git add . && git commit -m "feat(6.1): R2 storage client"
```

---

## Prompt 6.2 - Jobs & Pages Database

```
I'm building Myjoe. R2 storage is done.

Create job and page database functions:

1. src/server/db/jobs.ts:
- createJob, createJobItems, getJob, getJobItems
- updateJob, updateJobItem, getPendingJobItems

2. src/server/db/pages.ts:
- createPage, createPageVersion
- getPage, getPageVersions, updatePage

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
- getBlotBalance(userId): Promise<number>
- checkBlotBalance(userId, required): Promise<boolean>
- spendBlots(userId, amount, reason): Promise<void>
- reserveBlots(userId, amount, jobId): Promise<void>
- refundBlots(userId, amount, jobId, reason): Promise<void>

2. src/lib/errors.ts:
Custom error classes:
- AppError (base)
- InsufficientBlotsError
- StorageFullError
- NotFoundError
- ForbiddenError

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
POST: Start job
- Validate { projectId, idea, pageNumbers? }
- Verify style anchor exists
- Calculate and reserve Blots
- Create job and job_items
- Return { jobId, status, totalItems, blotsReserved }

2. src/app/api/generate/[jobId]/route.ts
GET: Job status with page thumbnails

3. src/app/api/generate/[jobId]/cancel/route.ts
POST: Cancel and refund unspent Blots

Generate all files.
```

```bash
git add . && git commit -m "feat(6.4): generation API"
```

---

## Prompt 6.5 - Job Processor

```
I'm building Myjoe. Generation API is done.

Create job processor:

Create src/server/jobs/process-generation.ts:

FUNCTION: processGenerationJob(jobId): Promise<void>

1. Get job, update to 'processing'
2. Get project with hero and style anchor
3. Call planAndCompile for all page prompts
4. Process in batches of 3:
   - For each: generate, cleanup, quality check, store to R2, create page_version
   - Handle failures with retry
   - Update progress
5. Update job to 'completed'

Also create src/server/jobs/trigger.ts with triggerGenerationJob function.

Generate both files.
```

```bash
git add . && git commit -m "feat(6.5): job processor"
```

---

## Prompt 6.6 - Generation UI

```
I'm building Myjoe. Job processor is done.

Create generation UI with PROGRESS FEEDBACK PATTERNS:

1. src/hooks/use-generation.ts:
- useGenerationJob(jobId): Poll every 2s, return progress data
- useStartGeneration(): Mutation with optimistic UI
- useCancelGeneration(): Mutation

2. src/components/features/project/generation-progress.tsx:
Full-screen generation progress view based on research patterns:

LAYOUT:
- Centered content, max-w-xl
- "✨ Generating your coloring book..." heading
- Progress bar with percentage (15 / 40)
- Current stage text: "Creating page 16: Bella discovers a hidden treehouse..."
- Grid of thumbnail placeholders that fill in as pages complete:
  - Complete: show thumbnail with ✓ overlay
  - Generating: show skeleton with Loader spinner
  - Pending: show empty skeleton (bg-zinc-800/50)
- Estimated time remaining
- Cancel button (secondary style)

PROGRESS BAR:
- Height: h-2
- Background: bg-zinc-800 rounded-full
- Fill: bg-blue-500 with smooth transition (duration-300 ease-out)

3. src/components/features/project/generation-start.tsx:
Generation start dialog in inspector panel:
- "What's your coloring book about?" label
- Idea textarea (min 3 lines)
- Example prompts as clickable pills below
- Blot cost calculation: "{pageCount} pages × 12 = {total} Blots"
- "Generate" button (primary, full width)
- Shows InsufficientBlotsError inline if not enough

4. Update project editor:
- If project.status === 'generating': show generation-progress
- If project has no pages: show generation-start in center
- If project has pages: show normal editor view

Generate all files.
```

```bash
git add . && git commit -m "feat(6.6): generation UI with progress feedback"
git tag -a v0.6 -m "Phase 6 complete: Generation Jobs"
git push origin main --tags
```
