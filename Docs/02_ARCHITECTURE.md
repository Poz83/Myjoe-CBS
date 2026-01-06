# Architecture Blueprint

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│                         Next.js App Router                              │
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
│  │ Queries │  │ Pipeline│  │    R2    │  │ Webhook │                   │
│  └────┬────┘  └────┬────┘  └────┬─────┘  └────┬────┘                   │
└───────┼────────────┼────────────┼─────────────┼─────────────────────────┘
        │            │            │             │
   ┌────▼────┐  ┌────▼────┐  ┌───▼────┐   ┌───▼────┐
   │Supabase │  │ OpenAI  │  │   R2   │   │ Stripe │
   │Postgres │  │   API   │  │        │   │        │
   └─────────┘  └─────────┘  └────────┘   └────────┘
```

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
│  2. CREATE JOB          │
│  - Insert job record    │
│  - Insert job_items     │
│  - Deduct Blots         │
│  - Return job_id        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  3. BACKGROUND WORKER   │
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
│  4. PER-PAGE PIPELINE   │
│  a. Planner-Compiler    │
│  b. GPT Image 1.5       │
│  c. Cleanup (Sharp)     │
│  d. Quality Gate        │
│  e. Store to R2         │
│  f. Update job_item     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  5. COMPLETION          │
│  - Update job status    │
│  - Send notification    │
│  - Invalidate cache     │
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
│   │   ├── export/
│   │   │   └── route.ts
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
│   │   └── billing/
│   │       ├── blot-display.tsx
│   │       ├── plan-selector.tsx
│   │       └── usage-chart.tsx
│   │
│   └── layout/
│       ├── sidebar.tsx
│       ├── header.tsx
│       └── mobile-nav.tsx
│
├── server/                       # Server-only code
│   ├── ai/
│   │   ├── planner-compiler.ts   # Prompt generation
│   │   ├── image-generator.ts    # GPT Image 1.5 calls
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
│   └── billing/
│       ├── stripe.ts
│       ├── blots.ts
│       └── webhooks.ts
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts
│   ├── utils.ts
│   ├── constants.ts
│   └── logger.ts
│
├── hooks/
│   ├── use-project.ts
│   ├── use-heroes.ts
│   ├── use-generation.ts
│   └── use-blots.ts
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
| Mutations with revalidation | Server Actions |
| Long-running jobs | API Routes + polling |
| Webhooks | API Routes |
| File uploads | API Routes (signed URLs) |

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

// Usage in API route
export async function POST(request: Request) {
  const correlationId = crypto.randomUUID();
  
  try {
    // ... logic
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(error.message, { correlationId, ...error.context });
      return Response.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    
    logger.error('Unexpected error', { correlationId, error });
    Sentry.captureException(error, { extra: { correlationId } });
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Database Queries Pattern

```typescript
// src/server/db/projects.ts
import { createClient } from '@/lib/supabase/server';
import type { Project, ProjectInsert } from '@/types/database';

export async function getProjects(userId: string): Promise<Project[]> {
  const supabase = await createClient();
  
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
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();
  
  if (error) throw error;
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
      if (!res.ok) throw new Error('Failed to create project');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
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
  
  // Process in batches of 3 (rate limit friendly)
  const batches = chunk(items, 3);
  
  for (const batch of batches) {
    await Promise.all(
      batch.map(item => processJobItem(item, job))
    );
  }
  
  await updateJob(jobId, { status: 'completed' });
}

async function processJobItem(item: JobItem, job: Job) {
  try {
    await updateJobItem(item.id, { status: 'processing' });
    
    // 1. Compile prompt
    const prompt = await compilePagePrompt(item, job.project);
    
    // 2. Generate image
    const rawImage = await generateImage(prompt, job.project.hero);
    
    // 3. Cleanup
    const cleanedImage = await cleanupImage(rawImage);
    
    // 4. Quality check
    const quality = await qualityCheck(cleanedImage);
    
    if (!quality.passed && item.retry_count < 2) {
      await updateJobItem(item.id, { 
        status: 'pending',
        retry_count: item.retry_count + 1 
      });
      return processJobItem(item, job); // Retry
    }
    
    // 5. Store
    const key = await storeImage(cleanedImage, item);
    
    // 6. Update
    await updateJobItem(item.id, { 
      status: quality.passed ? 'completed' : 'needs_review',
      asset_key: key,
    });
    
  } catch (error) {
    await updateJobItem(item.id, { 
      status: 'failed',
      error: error.message,
    });
    throw error;
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

---

## Rate Limits

| Resource | Limit | Window |
|----------|-------|--------|
| API requests | 100 | 1 min |
| Generation jobs | 5 | 1 min |
| Image uploads | 20 | 1 min |
| Export requests | 10 | 1 hour |
| Failed logins | 5 | 15 min |
