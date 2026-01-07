# Architecture Blueprint

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│                         Next.js 14 App Router                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │  Studio  │  │  Library │  │ Settings │  │ Billing  │               │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘               │
└───────┼─────────────┼─────────────┼─────────────┼───────────────────────┘
        │             │             │             │
        └─────────────┴──────┬──────┴─────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────────────┐
│                       API LAYER                                          │
│                  Next.js API Routes                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ /projects│  │ /generate│  │  /heroes │  │ /billing │               │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘               │
└───────┼─────────────┼─────────────┼─────────────┼───────────────────────┘
        │             │             │             │
┌───────┼─────────────┼─────────────┼─────────────┼───────────────────────┐
│       │        SERVER LAYER       │             │                        │
│  ┌────▼────┐  ┌────▼────┐  ┌─────▼────┐  ┌────▼────┐                   │
│  │   DB    │  │   AI    │  │  Storage │  │ Stripe  │                   │
│  │ Queries │  │ Pipeline│  │    R2    │  │ Billing │                   │
│  └────┬────┘  └────┬────┘  └────┬─────┘  └────┬────┘                   │
└───────┼────────────┼────────────┼─────────────┼─────────────────────────┘
        │            │            │             │
   ┌────▼────┐  ┌────▼────┐  ┌───▼────┐   ┌───▼────┐
   │Supabase │  │Replicate│  │   R2   │   │ Stripe │
   │Postgres │  │  (Flux) │  │        │   │        │
   └─────────┘  └────┬────┘  └────────┘   └────────┘
                     │
               ┌─────▼─────┐
               │  OpenAI   │
               │ (Safety)  │
               └───────────┘
```

---

## Core Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 + TypeScript | App Router, RSC |
| **Styling** | TailwindCSS | Utility-first CSS |
| **State** | TanStack Query + Zustand | Server + client state |
| **Database** | Supabase Postgres | Data + Auth + RLS |
| **Storage** | Cloudflare R2 | S3-compatible object storage |
| **AI Images** | Flux via Replicate | Page generation |
| **AI Planning** | GPT-4o-mini | Prompt compilation |
| **AI Safety** | OpenAI Moderation + GPT-4V | Content safety |
| **Payments** | Stripe | Unit-based subscriptions |
| **Hosting** | Vercel | Edge + Serverless |
| **Analytics** | PostHog | Product analytics |
| **Errors** | Sentry | Error tracking |
| **Email** | Resend | Transactional email |

---

## Request Flow

### Page Generation Flow

```
User clicks "Generate 40 pages"
           │
           ▼
┌─────────────────────────┐
│  1. VALIDATION          │
│  - Check Blot balance   │
│  - Validate project DNA │
│  - Check rate limits    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  2. CONTENT SAFETY      │
│  - Sanitize input       │
│  - Keyword blocklist    │
│  - OpenAI Moderation    │
│  - Return suggestions   │
│    if blocked           │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  3. CREATE JOB          │
│  - Insert job record    │
│  - Insert job_items     │
│  - Deduct Blots         │
│  - Return job_id        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  4. BACKGROUND WORKER   │
│  (Vercel Edge Function) │
└───────────┬─────────────┘
            │
    ┌───────┴───────┐
    ▼               ▼
┌─────────┐   ┌─────────┐
│ Page 1  │   │ Page 2  │  ... (parallel, max 3)
└────┬────┘   └────┬────┘
     │             │
     ▼             ▼
┌─────────────────────────┐
│  5. PER-PAGE PIPELINE   │
│  a. Planner-Compiler    │
│  b. Flux via Replicate  │
│  c. Cleanup (Sharp)     │
│  d. Quality Gate        │
│  e. Post-Gen Safety     │
│     (Toddler/Children)  │
│  f. Store to R2         │
│  g. Update job_item     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  6. COMPLETION          │
│  - Update job status    │
│  - Send notification    │
│  - Invalidate cache     │
└─────────────────────────┘
```

### Billing Flow (Unit-Based)

```
User selects Creator 500/mo
           │
           ▼
┌─────────────────────────┐
│  1. CHECKOUT            │
│  - Create/get customer  │
│  - Select price ID      │
│  - Set quantity (5)     │
│  - Create session       │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  2. STRIPE CHECKOUT     │
│  User sees:             │
│  "5 × $3.00 = $15/mo"   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  3. WEBHOOK             │
│  checkout.session       │
│  .completed             │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  4. UPDATE PROFILE      │
│  - plan: 'creator'      │
│  - plan_blots: 500      │
│  - subscription_blots:  │
│    500                  │
│  - storage: 25GB        │
│  - Log transaction      │
└─────────────────────────┘
```

---

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group (no layout)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── route.ts          # OAuth callback
│   │
│   ├── (studio)/                 # Protected group
│   │   ├── layout.tsx            # Sidebar + header
│   │   ├── page.tsx              # Dashboard/redirect
│   │   ├── projects/
│   │   │   ├── page.tsx          # Project list
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # New project wizard
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Project editor
│   │   │       └── export/
│   │   │           └── page.tsx  # Export view
│   │   ├── library/
│   │   │   ├── page.tsx          # Asset library
│   │   │   └── heroes/
│   │   │       └── [id]/
│   │   │           └── page.tsx  # Hero detail
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── billing/
│   │       └── page.tsx
│   │
│   ├── api/                      # API routes
│   │   ├── projects/
│   │   │   ├── route.ts          # GET (list), POST (create)
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET, PATCH, DELETE
│   │   ├── generate/
│   │   │   ├── route.ts          # POST (start job)
│   │   │   └── [jobId]/
│   │   │       └── route.ts      # GET (status)
│   │   ├── heroes/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── pages/
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── edit/
│   │   │           └── route.ts  # Inpainting
│   │   ├── calibration/
│   │   │   └── route.ts          # Style calibration
│   │   ├── export/
│   │   │   └── route.ts
│   │   ├── billing/
│   │   │   ├── balance/
│   │   │   │   └── route.ts      # GET balance
│   │   │   ├── checkout/
│   │   │   │   └── route.ts      # POST subscription
│   │   │   ├── pack-checkout/
│   │   │   │   └── route.ts      # POST pack purchase
│   │   │   └── portal/
│   │   │       └── route.ts      # POST portal session
│   │   ├── webhooks/
│   │   │   └── stripe/
│   │   │       └── route.ts
│   │   └── upload/
│   │       └── route.ts          # Signed URL generation
│   │
│   └── globals.css
│
├── components/
│   ├── ui/                       # Primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── toast.tsx
│   │   └── tooltip.tsx
│   │
│   ├── features/                 # Feature components
│   │   ├── project/
│   │   │   ├── project-card.tsx
│   │   │   ├── project-wizard.tsx
│   │   │   ├── page-grid.tsx
│   │   │   └── page-editor.tsx
│   │   ├── hero/
│   │   │   ├── hero-card.tsx
│   │   │   ├── hero-creator.tsx
│   │   │   └── hero-selector.tsx
│   │   ├── editor/
│   │   │   ├── edit-canvas.tsx   # Paintbrush tool
│   │   │   ├── edit-chat.tsx
│   │   │   └── version-history.tsx
│   │   ├── billing/
│   │   │   ├── blot-display.tsx
│   │   │   ├── blot-calculator.tsx
│   │   │   ├── tier-card.tsx
│   │   │   ├── pack-selector.tsx
│   │   │   ├── out-of-blots-modal.tsx
│   │   │   └── usage-chart.tsx
│   │   └── safety/
│   │       └── safety-feedback.tsx
│   │
│   └── layout/
│       ├── sidebar.tsx
│       ├── header.tsx
│       └── mobile-nav.tsx
│
├── server/                       # Server-only code
│   ├── ai/
│   │   ├── planner-compiler.ts   # Prompt generation
│   │   ├── flux-generator.ts     # Replicate Flux calls
│   │   ├── content-safety.ts     # Pre-gen safety
│   │   ├── image-safety-check.ts # Post-gen GPT-4V
│   │   ├── cleanup.ts            # Sharp processing
│   │   ├── quality-gate.ts       # Validation
│   │   └── hero-generator.ts     # Reference sheet
│   │
│   ├── db/
│   │   ├── projects.ts
│   │   ├── pages.ts
│   │   ├── heroes.ts
│   │   ├── jobs.ts
│   │   └── profiles.ts
│   │
│   ├── storage/
│   │   ├── r2-client.ts
│   │   ├── upload.ts
│   │   └── signed-urls.ts
│   │
│   ├── billing/
│   │   ├── stripe.ts             # Checkout, portal
│   │   ├── blots.ts              # Balance, deduction
│   │   └── webhooks.ts           # Event handlers
│   │
│   └── export/
│       ├── pdf-generator.ts
│       └── vectorize.ts          # SVG via Potrace
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts
│   ├── constants/
│   │   ├── billing.ts            # Tiers, packs, costs
│   │   ├── audiences.ts          # Age presets
│   │   ├── styles.ts             # Style presets
│   │   ├── flux.ts               # Flux config
│   │   └── forbidden-content.ts  # Safety blocklists
│   ├── utils.ts
│   ├── utils/
│   │   └── slugify.ts
│   ├── errors.ts
│   └── logger.ts
│
├── hooks/
│   ├── use-project.ts
│   ├── use-projects.ts
│   ├── use-heroes.ts
│   ├── use-generation.ts
│   ├── use-blots.ts
│   └── use-blot-check.ts
│
└── types/
    ├── database.ts               # Generated from Supabase
    ├── api.ts                    # API request/response
    └── domain.ts                 # Business types
```

---

## Key Patterns

### Server Actions vs API Routes

| Use Case | Pattern |
|----------|---------|
| Simple mutations | Server Actions |
| Long-running jobs | API Routes + polling |
| Webhooks | API Routes |
| File uploads | API Routes (signed URLs) |
| Billing | API Routes |

### Error Handling

```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public context?: Record<string, unknown>
  ) {
    super(message);
  }
}

export class InsufficientBlotsError extends AppError {
  constructor(required: number, available: number) {
    super(
      `Insufficient Blots: need ${required}, have ${available}`,
      'INSUFFICIENT_BLOTS',
      402,
      { required, available }
    );
  }
}

export class SafetyBlockedError extends AppError {
  constructor(reason: string, suggestions: string[]) {
    super(
      `Content blocked: ${reason}`,
      'SAFETY_BLOCKED',
      400,
      { reason, suggestions }
    );
  }
}

export class StorageFullError extends AppError {
  constructor(used: number, limit: number) {
    super(
      `Storage full: ${used} of ${limit} bytes used`,
      'STORAGE_FULL',
      402,
      { used, limit }
    );
  }
}

// Usage in API route
export async function POST(request: Request) {
  const correlationId = crypto.randomUUID();
  
  try {
    // ... logic
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(error.message, { correlationId, ...error.context });
      return Response.json(
        { error: error.message, code: error.code, ...error.context },
        { status: error.statusCode }
      );
    }
    
    logger.error('Unexpected error', { correlationId, error });
    Sentry.captureException(error, { extra: { correlationId } });
    return Response.json(
      { error: 'Internal server error', correlationId },
      { status: 500 }
    );
  }
}
```

### Database Queries Pattern

```typescript
// src/server/db/projects.ts
import { createServiceClient } from '@/lib/supabase/server';
import type { Project, ProjectInsert } from '@/types/database';

export async function getProjects(userId: string): Promise<Project[]> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', userId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createProject(project: ProjectInsert): Promise<Project> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getProjectWithPages(
  projectId: string,
  userId: string
): Promise<ProjectWithPages | null> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      pages (
        *,
        page_versions (*)
      ),
      hero:heroes (*)
    `)
    .eq('id', projectId)
    .eq('owner_id', userId)
    .is('deleted_at', null)
    .single();
  
  if (error) return null;
  return data;
}
```

### TanStack Query Pattern

```typescript
// src/hooks/use-projects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateProjectInput) => {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create project');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// src/hooks/use-blots.ts
export function useBlotBalance() {
  return useQuery({
    queryKey: ['blot-balance'],
    queryFn: async () => {
      const res = await fetch('/api/billing/balance');
      if (!res.ok) throw new Error('Failed to fetch balance');
      return res.json();
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000,
  });
}
```

---

## AI Pipeline Architecture

### Flux Generator

```typescript
// src/server/ai/flux-generator.ts
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const FLUX_MODELS = {
  lineart: 'black-forest-labs/flux-schnell',
  dev: 'black-forest-labs/flux-dev',
  pro: 'black-forest-labs/flux-1.1-pro',
} as const;

export async function generateWithFlux(
  prompt: string,
  options: FluxOptions
): Promise<Buffer> {
  const model = FLUX_MODELS[options.model || 'lineart'];
  
  const output = await replicate.run(model, {
    input: {
      prompt: prompt,
      width: options.width || 1024,
      height: options.height || 1024,
      num_inference_steps: options.steps || 28,
      guidance_scale: options.guidance || 3.5,
      seed: options.seed,
      output_format: 'png',
    },
  });
  
  // Fetch the generated image
  const imageUrl = Array.isArray(output) ? output[0] : output;
  const response = await fetch(imageUrl);
  return Buffer.from(await response.arrayBuffer());
}
```

### Content Safety Pipeline

```typescript
// src/server/ai/content-safety.ts
import OpenAI from 'openai';
import { FORBIDDEN_CONTENT, SAFE_SUGGESTIONS } from '@/lib/constants/forbidden-content';

const openai = new OpenAI();

export async function checkContentSafety(
  input: string,
  audience: Audience
): Promise<SafetyResult> {
  // Layer 1: Sanitize input
  const sanitized = sanitizeInput(input);
  
  // Layer 2: Keyword blocklist (instant, free)
  const blockedKeywords = checkBlocklist(sanitized, audience);
  if (blockedKeywords.length > 0) {
    return {
      safe: false,
      reason: `Contains inappropriate content for ${audience}`,
      blockedKeywords,
      suggestions: SAFE_SUGGESTIONS[audience],
    };
  }
  
  // Layer 3: OpenAI Moderation API (free)
  const moderation = await openai.moderations.create({ input: sanitized });
  const result = moderation.results[0];
  
  const thresholds = SAFETY_THRESHOLDS[audience];
  const violations = checkThresholds(result.category_scores, thresholds);
  
  if (violations.length > 0) {
    return {
      safe: false,
      reason: `Content flagged for: ${violations.join(', ')}`,
      violations,
      suggestions: SAFE_SUGGESTIONS[audience],
    };
  }
  
  return { safe: true };
}
```

---

## Background Jobs

### Job Processing Pattern

```typescript
// src/server/jobs/process-generation.ts
export async function processGenerationJob(jobId: string) {
  const job = await getJob(jobId);
  const items = await getJobItems(jobId);
  const project = await getProject(job.project_id);
  
  // Update job status
  await updateJob(jobId, { status: 'processing', started_at: new Date() });
  
  // Process in batches of 3 (rate limit friendly)
  const batches = chunk(items, 3);
  
  for (const batch of batches) {
    await Promise.allSettled(
      batch.map(item => processJobItem(item, job, project))
    );
    
    // Update progress
    const completed = await countCompletedItems(jobId);
    await updateJob(jobId, { completed_items: completed });
  }
  
  // Final status
  const finalStats = await getJobStats(jobId);
  await updateJob(jobId, {
    status: finalStats.failed > 0 ? 'completed_with_errors' : 'completed',
    completed_at: new Date(),
  });
  
  // Refund failed items
  if (finalStats.failed > 0) {
    const refundAmount = finalStats.failed * BLOT_COSTS.generate;
    await refundBlots(job.owner_id, refundAmount, jobId, 'Failed generations');
  }
}

async function processJobItem(
  item: JobItem,
  job: Job,
  project: Project
): Promise<void> {
  try {
    await updateJobItem(item.id, { status: 'processing', started_at: new Date() });
    
    // 1. Compile prompt
    const compiled = await compilePagePrompt(item, project);
    
    // 2. Generate with Flux
    const rawImage = await generateWithFlux(compiled.prompt, {
      model: 'lineart',
      width: 1024,
      height: 1024,
      seed: compiled.seed,
    });
    
    // 3. Cleanup with Sharp
    const cleanedImage = await cleanupImage(rawImage, project.audience);
    
    // 4. Quality check
    const quality = await checkQuality(cleanedImage);
    
    // 5. Post-gen safety (toddler/children only)
    if (['toddler', 'children'].includes(project.audience)) {
      const safetyCheck = await checkImageSafety(cleanedImage, project.audience);
      if (!safetyCheck.safe) {
        if (item.retry_count < 2) {
          await updateJobItem(item.id, {
            status: 'pending',
            retry_count: item.retry_count + 1,
          });
          return; // Will be retried
        }
        throw new Error(`Safety check failed: ${safetyCheck.reason}`);
      }
    }
    
    // 6. Store to R2
    const assetKey = await storeImage(cleanedImage, item, project);
    const thumbnailKey = await storeThumbnail(cleanedImage, item, project);
    
    // 7. Create page version
    await createPageVersion(item.page_id, {
      version: await getNextVersion(item.page_id),
      asset_key: assetKey,
      thumbnail_key: thumbnailKey,
      compiled_prompt: compiled.prompt,
      seed: compiled.seed,
      quality_score: quality.score,
      quality_status: quality.status,
      edit_type: 'initial',
      blots_spent: BLOT_COSTS.generate,
    });
    
    // 8. Mark complete
    await updateJobItem(item.id, {
      status: 'completed',
      asset_key: assetKey,
      completed_at: new Date(),
    });
    
  } catch (error) {
    logger.error('Job item failed', { itemId: item.id, error });
    await updateJobItem(item.id, {
      status: 'failed',
      error_message: error.message,
      completed_at: new Date(),
    });
  }
}
```

---

## Caching Strategy

| Data | Cache Location | TTL | Invalidation |
|------|----------------|-----|--------------|
| User profile | TanStack Query | 5 min | On update |
| Projects list | TanStack Query | 1 min | On CRUD |
| Page images | R2 + Browser | Forever | On new version |
| Thumbnails | R2 + Browser | Forever | On new version |
| Job status | TanStack Query | 2 sec | Polling |
| Blot balance | TanStack Query | 30 sec | On spend/refresh |
| Style presets | Static | Build time | Deploy |

---

## Rate Limits

| Resource | Limit | Window | Scope |
|----------|-------|--------|-------|
| API requests | 100 | 1 min | Per user |
| Generation jobs | 5 | 1 min | Per user |
| Page edits | 20 | 1 min | Per user |
| Export requests | 10 | 1 hour | Per user |
| Login attempts | 5 | 15 min | Per IP |
| Webhook events | 1000 | 1 hour | Global |

---

## Monitoring & Observability

### Logging

```typescript
// src/lib/logger.ts
import { Logger } from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
});

// Usage
logger.info('Generation started', { jobId, userId, pageCount });
logger.warn('Rate limit approaching', { userId, current, limit });
logger.error('Generation failed', { jobId, error: err.message });
```

### Sentry Integration

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter sensitive data
    return event;
  },
});

// Usage
Sentry.captureException(error, {
  tags: { feature: 'generation', audience },
  extra: { jobId, projectId },
});
```

### PostHog Analytics

```typescript
// Track key events
posthog.capture('generation_started', { pageCount, audience });
posthog.capture('generation_completed', { pageCount, duration });
posthog.capture('safety_blocked', { audience, reason });
posthog.capture('subscription_created', { tier, blots, interval });
posthog.capture('pack_purchased', { packId, blots });
```

---

## Security Considerations

### Authentication

- Supabase Auth handles all authentication
- JWT tokens stored in httpOnly cookies
- Session refresh handled automatically
- OAuth (Google) + Magic Link supported

### Authorization

- Row Level Security (RLS) on ALL user tables
- Server-side user ID verification
- No direct database access from client

### Data Protection

- All API routes verify authentication
- Sensitive operations require re-authentication
- Stripe webhooks verified with signing secret
- Environment variables never exposed to client

### Content Safety

- Multi-layer content moderation
- Audience-appropriate safety thresholds
- Post-generation visual inspection for children's content
- Keyword blocklists per audience
