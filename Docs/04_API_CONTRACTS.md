# API Contracts

## Overview

All API routes follow these conventions:

| Aspect | Convention |
|--------|------------|
| Base URL | `/api` |
| Auth | Supabase JWT in cookies (automatic) |
| Content-Type | `application/json` |
| Correlation ID | `X-Correlation-ID` header on all responses |
| Errors | `{ error: string, code: string, ...context }` |

---

## Authentication

All protected routes require authentication via Supabase session cookie. Unauthenticated requests receive:

```json
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

**Status:** `401`

---

## Common Error Responses

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | No valid session |
| `FORBIDDEN` | 403 | Authenticated but not allowed |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `INSUFFICIENT_BLOTS` | 402 | Not enough Blots |
| `STORAGE_FULL` | 402 | Storage quota exceeded |
| `SAFETY_BLOCKED` | 400 | Content blocked by safety |
| `RATE_LIMITED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Projects

### GET /api/projects

List user's projects.

**Response:**
```typescript
{
  projects: Array<{
    id: string;
    name: string;
    description: string | null;
    pageCount: number;
    trimSize: '8.5x11' | '8.5x8.5' | '6x9';
    audience: 'toddler' | 'children' | 'tween' | 'teen' | 'adult';
    stylePreset: string;
    status: 'draft' | 'calibrating' | 'generating' | 'ready' | 'exported';
    heroId: string | null;
    thumbnailUrl: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

---

### POST /api/projects

Create a new project.

**Request:**
```typescript
{
  name: string;              // Required, 1-100 chars
  description?: string;      // Optional, max 500 chars
  pageCount: number;         // 1-45
  trimSize: '8.5x11' | '8.5x8.5' | '6x9';
  audience: 'toddler' | 'children' | 'tween' | 'teen' | 'adult';
  stylePreset: 'bold-simple' | 'kawaii' | 'whimsical' | 'cartoon' | 'botanical';
  heroId?: string;           // Optional, existing hero UUID
}
```

**Response:** `201 Created`
```typescript
{
  project: {
    id: string;
    name: string;
    // ... full project object
  };
}
```

**Errors:**
- `VALIDATION_ERROR` — Invalid input
- `PROJECT_LIMIT_EXCEEDED` — Free tier at 3 projects

---

### GET /api/projects/[id]

Get project with pages and versions.

**Response:**
```typescript
{
  project: {
    id: string;
    name: string;
    // ... project fields
    hero: {
      id: string;
      name: string;
      thumbnailUrl: string;
    } | null;
    pages: Array<{
      id: string;
      sortOrder: number;
      pageType: string;
      currentVersion: number;
      sceneBrief: string | null;
      versions: Array<{
        version: number;
        imageUrl: string;
        thumbnailUrl: string;
        qualityStatus: string;
        editType: string;
        createdAt: string;
      }>;
    }>;
  };
}
```

---

### PATCH /api/projects/[id]

Update project metadata (name, description only — DNA is locked).

**Request:**
```typescript
{
  name?: string;
  description?: string;
  heroId?: string | null;
}
```

**Response:**
```typescript
{
  project: { /* updated project */ };
}
```

---

### DELETE /api/projects/[id]

Soft delete a project.

**Response:** `204 No Content`

---

## Heroes

### GET /api/heroes

List user's heroes.

**Response:**
```typescript
{
  heroes: Array<{
    id: string;
    name: string;
    description: string;
    audience: string;
    thumbnailUrl: string;
    timesUsed: number;
    createdAt: string;
  }>;
}
```

---

### POST /api/heroes

Create a new hero with reference sheet.

**Request:**
```typescript
{
  name: string;           // Required, 1-50 chars
  description: string;    // Required, 10-500 chars (user's description)
  audience: 'toddler' | 'children' | 'tween' | 'teen' | 'adult';
}
```

**Response:** `202 Accepted`
```typescript
{
  jobId: string;
  heroId: string;
  blotsDeducted: 8;
}
```

**Errors:**
- `INSUFFICIENT_BLOTS` — Need 8 Blots
- `SAFETY_BLOCKED` — Description flagged

---

### GET /api/heroes/[id]

Get hero detail.

**Response:**
```typescript
{
  hero: {
    id: string;
    name: string;
    description: string;
    audience: string;
    compiledPrompt: string;
    referenceUrl: string;
    thumbnailUrl: string;
    timesUsed: number;
    createdAt: string;
  };
}
```

---

### DELETE /api/heroes/[id]

Delete a hero.

**Response:** `204 No Content`

**Note:** Projects using this hero will have `heroId` set to null.

---

## Generation

### POST /api/generate

Start a page generation job.

**Request:**
```typescript
{
  projectId: string;
  pages: Array<{
    pageId?: string;      // Existing page (regenerate) or omit (new)
    sortOrder: number;
    pageType?: 'illustration' | 'text-focus' | 'pattern' | 'educational';
    sceneBrief?: string;  // Optional scene description
  }>;
}
```

**Response:** `202 Accepted`
```typescript
{
  jobId: string;
  totalPages: number;
  blotsReserved: number;  // pages × 5 Blots
  estimatedSeconds: number;
}
```

**Errors:**
- `INSUFFICIENT_BLOTS` — Not enough for all pages
- `SAFETY_BLOCKED` — Scene brief flagged
- `PROJECT_NOT_CALIBRATED` — Style calibration required first
- `RATE_LIMITED` — Too many concurrent jobs

---

### GET /api/generate/[jobId]

Poll job status.

**Response:**
```typescript
{
  job: {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    totalItems: number;
    completedItems: number;
    failedItems: number;
    blotsReserved: number;
    blotsSpent: number;
    blotsRefunded: number;
    startedAt: string | null;
    completedAt: string | null;
    errorMessage: string | null;
  };
  items: Array<{
    id: string;
    pageId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    thumbnailUrl: string | null;
    errorMessage: string | null;
  }>;
}
```

---

## Calibration

### POST /api/calibration

Start style calibration for a project.

**Request:**
```typescript
{
  projectId: string;
}
```

**Response:** `202 Accepted`
```typescript
{
  jobId: string;
  blotsDeducted: 4;  // 4 sample images
}
```

---

### GET /api/calibration/[jobId]

Get calibration samples.

**Response:**
```typescript
{
  status: 'processing' | 'ready' | 'failed';
  samples: Array<{
    id: string;
    imageUrl: string;
    seed: string;
    prompt: string;
  }>;
}
```

---

### POST /api/calibration/[jobId]/select

Select the style anchor.

**Request:**
```typescript
{
  sampleId: string;
}
```

**Response:**
```typescript
{
  project: {
    id: string;
    styleAnchorKey: string;
    status: 'ready';  // Now ready for generation
  };
}
```

---

## Pages

### GET /api/pages/[id]

Get page with all versions.

**Response:**
```typescript
{
  page: {
    id: string;
    projectId: string;
    sortOrder: number;
    pageType: string;
    currentVersion: number;
    sceneBrief: string | null;
    versions: Array<{
      version: number;
      imageUrl: string;
      thumbnailUrl: string;
      compiledPrompt: string;
      seed: string;
      qualityScore: number;
      qualityStatus: string;
      editType: string;
      editPrompt: string | null;
      blotsSpent: number;
      createdAt: string;
    }>;
  };
}
```

---

### POST /api/pages/[id]/edit

Edit a page (regenerate or inpaint).

**Request:**
```typescript
{
  editType: 'regenerate' | 'inpaint' | 'quick_action';
  prompt?: string;         // Edit instruction
  maskDataUrl?: string;    // Base64 mask for inpaint
  quickAction?: 'simplify' | 'add_detail' | 'fix_lines';
}
```

**Response:** `202 Accepted`
```typescript
{
  jobId: string;
  blotsDeducted: 5;
}
```

---

### POST /api/pages/[id]/revert

Revert to a previous version.

**Request:**
```typescript
{
  version: number;
}
```

**Response:**
```typescript
{
  page: {
    id: string;
    currentVersion: number;  // Now points to reverted version
  };
}
```

**Note:** No Blots cost — just updates pointer.

---

## Export

### POST /api/export

Start export job.

**Request:**
```typescript
{
  projectId: string;
  formats: Array<'pdf' | 'png' | 'svg'>;
  includeColorGuide?: boolean;
}
```

**Response:** `202 Accepted`
```typescript
{
  jobId: string;
  formats: string[];
  blotsDeducted: 0;  // Exports are free
}
```

---

### GET /api/export/[jobId]

Get export status and download URLs.

**Response:**
```typescript
{
  status: 'processing' | 'completed' | 'failed';
  progress: number;  // 0-100
  downloads: {
    pdf?: string;    // Signed URL, valid 1 hour
    png?: string;    // ZIP of PNGs
    svg?: string;    // ZIP of SVGs
  };
  expiresAt: string;
}
```

---

## Billing

### GET /api/billing/balance

Get current Blot balance and subscription info.

**Response:**
```typescript
{
  subscription: number;     // Blots from subscription (resets monthly)
  pack: number;             // Blots from packs (never expire)
  total: number;            // subscription + pack
  plan: 'free' | 'creator' | 'studio';
  planBlots: number;        // Plan's monthly allocation
  resetsAt: string | null;  // Next reset date
  storage: {
    usedBytes: number;
    limitBytes: number;
    usedPercent: number;
  };
}
```

---

### POST /api/billing/checkout

Create subscription checkout session.

**Request:**
```typescript
{
  tier: 'creator' | 'studio';
  blots: number;              // 300, 500, 800, 2500, 4000, or 5000
  interval: 'monthly' | 'yearly';
}
```

**Response:**
```typescript
{
  checkoutUrl: string;  // Redirect user here
}
```

---

### POST /api/billing/pack-checkout

Create pack purchase checkout session.

**Request:**
```typescript
{
  packId: 'topup' | 'boost';
}
```

**Response:**
```typescript
{
  checkoutUrl: string;
}
```

---

### POST /api/billing/portal

Create Stripe Customer Portal session.

**Response:**
```typescript
{
  portalUrl: string;  // Redirect user here
}
```

**Note:** User must have an active subscription.

---

### GET /api/billing/transactions

Get Blot transaction history.

**Query params:**
- `limit` — Number of records (default: 20, max: 100)
- `offset` — Pagination offset

**Response:**
```typescript
{
  transactions: Array<{
    id: string;
    type: 'subscription_reset' | 'pack_purchase' | 'generation' | 'edit' | 'hero' | 'calibration' | 'refund';
    subscriptionDelta: number;
    packDelta: number;
    description: string;
    createdAt: string;
  }>;
  total: number;
  hasMore: boolean;
}
```

---

## Webhooks

### POST /api/webhooks/stripe

Handle Stripe webhook events.

**Headers:**
- `Stripe-Signature` — Webhook signature for verification

**Events handled:**

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Activate subscription or add pack Blots |
| `invoice.payment_succeeded` | Reset subscription Blots (on renewal) |
| `invoice.payment_failed` | Set `payment_failed_at` |
| `customer.subscription.updated` | Handle upgrade, update plan |
| `customer.subscription.deleted` | Downgrade to Free |

**Response:** `200 OK` with `{ received: true }`

---

## Upload

### POST /api/upload

Get signed URL for direct upload to R2.

**Request:**
```typescript
{
  filename: string;
  contentType: string;
  size: number;  // bytes
  purpose: 'hero_reference' | 'style_anchor' | 'edit_mask';
}
```

**Response:**
```typescript
{
  uploadUrl: string;      // Signed PUT URL
  assetKey: string;       // R2 key for the file
  expiresAt: string;      // URL expiration
}
```

**Errors:**
- `STORAGE_FULL` — Would exceed quota
- `FILE_TOO_LARGE` — Exceeds 10MB limit
- `INVALID_CONTENT_TYPE` — Not an allowed image type

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| All endpoints | 100 requests | 1 minute |
| POST /api/generate | 5 jobs | 1 minute |
| POST /api/pages/[id]/edit | 20 edits | 1 minute |
| POST /api/export | 10 exports | 1 hour |
| POST /api/heroes | 10 heroes | 1 hour |

**Rate limit response:**
```typescript
{
  error: "Rate limit exceeded",
  code: "RATE_LIMITED",
  retryAfter: 45  // seconds
}
```

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 23
X-RateLimit-Reset: 1704067200
```

---

## Polling Best Practices

For job status endpoints:

```typescript
// Recommended polling strategy
async function pollJob(jobId: string): Promise<Job> {
  const delays = [1000, 2000, 3000, 5000, 5000, 5000]; // ms
  let attempt = 0;
  
  while (attempt < 60) {  // Max 5 minutes
    const res = await fetch(`/api/generate/${jobId}`);
    const { job } = await res.json();
    
    if (job.status === 'completed' || job.status === 'failed') {
      return job;
    }
    
    const delay = delays[Math.min(attempt, delays.length - 1)];
    await new Promise(r => setTimeout(r, delay));
    attempt++;
  }
  
  throw new Error('Job polling timeout');
}
```

---

## Type Definitions

```typescript
// src/types/api.ts

// Request types
export interface CreateProjectRequest {
  name: string;
  description?: string;
  pageCount: number;
  trimSize: TrimSize;
  audience: Audience;
  stylePreset: StylePreset;
  heroId?: string;
}

export interface GenerateRequest {
  projectId: string;
  pages: Array<{
    pageId?: string;
    sortOrder: number;
    pageType?: PageType;
    sceneBrief?: string;
  }>;
}

export interface EditPageRequest {
  editType: 'regenerate' | 'inpaint' | 'quick_action';
  prompt?: string;
  maskDataUrl?: string;
  quickAction?: 'simplify' | 'add_detail' | 'fix_lines';
}

export interface CheckoutRequest {
  tier: 'creator' | 'studio';
  blots: number;
  interval: 'monthly' | 'yearly';
}

// Response types
export interface ApiError {
  error: string;
  code: string;
  [key: string]: unknown;
}

export interface JobResponse {
  job: {
    id: string;
    status: JobStatus;
    totalItems: number;
    completedItems: number;
    failedItems: number;
    blotsReserved: number;
    blotsSpent: number;
    blotsRefunded: number;
    startedAt: string | null;
    completedAt: string | null;
    errorMessage: string | null;
  };
  items?: Array<{
    id: string;
    pageId: string;
    status: JobItemStatus;
    thumbnailUrl: string | null;
    errorMessage: string | null;
  }>;
}

export interface BlotBalanceResponse {
  subscription: number;
  pack: number;
  total: number;
  plan: Tier;
  planBlots: number;
  resetsAt: string | null;
  storage: {
    usedBytes: number;
    limitBytes: number;
    usedPercent: number;
  };
}
```
