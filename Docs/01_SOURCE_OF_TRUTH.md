# Source of Truth

> **LOCKED DECISIONS** — Do not deviate without explicit approval

---

## Product Definition

| Attribute | Value |
|-----------|-------|
| Name | Myjoe |
| Domain | myjoe.app |
| Tagline | AI Coloring Book Studio |
| Target | KDP publishers (beginners to professionals) |
| Platform | PC-first web app (responsive) |

---

## Core Stack (LOCKED)

```
Frontend:     Next.js 14 + App Router + TypeScript
Styling:      TailwindCSS (no other CSS frameworks)
State:        TanStack Query + Zustand
Database:     Supabase Postgres
Auth:         Supabase Auth (Google + Magic Link)
Storage:      Cloudflare R2 (S3-compatible)
AI Planning:  GPT-4o-mini
AI Images:    GPT Image 1.5
Payments:     Stripe (quantity-based subscriptions)
Hosting:      Vercel
Analytics:    PostHog
Errors:       Sentry
Email:        Resend + React Email
```

---

## Currency: Blots

| Decision | Value |
|----------|-------|
| Name | Blots |
| Symbol | 🎨 (optional in UI) |
| Base unit | 1 Blot ≈ $0.026 |
| Refresh | RESET monthly (no rollover in v1) |
| Display | Always show balance in header |

### Blot Costs (LOCKED)

| Action | Blots | Your Cost |
|--------|-------|-----------|
| Generate 1 page | 12 | $0.186 |
| Edit 1 page | 12 | $0.186 |
| Style calibration (4 samples) | 10 | $0.163 |
| Hero Reference Sheet | 15 | $0.20 |
| Cover generation | 14 | $0.217 |
| Export PDF | 3 | $0.05 |

---

## Subscription Tiers (LOCKED)

| Plan | Price | Blots | Storage | Commercial |
|------|-------|-------|---------|------------|
| Free | $0 | 50/mo | 1 GB | ❌ |
| Starter | $12/mo | 300/mo | 5 GB | ✅ |
| Creator | $29/mo | 900/mo | 15 GB | ✅ |
| Pro | $79/mo | 2,800/mo | 50 GB | ✅ |

---

## Project Constraints (LOCKED)

| Constraint | Value | Reason |
|------------|-------|--------|
| Max pages per project | 45 | KDP practical limit |
| Max projects (Free) | 3 | Encourage upgrade |
| Max projects (Paid) | Unlimited | — |
| Max heroes | 20 | Storage management |
| Max page versions | 10 | Prevent Blot drain |
| Output resolution | 300 DPI | KDP requirement |
| Output format | PNG + PDF | KDP standard |

---

## Audience Presets (LOCKED)

| Audience | Age | Line Weight | Complexity | Detail |
|----------|-----|-------------|------------|--------|
| Toddler | 2-4 | Thick (8px+) | Minimal | Sparse |
| Children | 5-8 | Thick (6px) | Moderate | Balanced |
| Tween | 9-12 | Medium (4px) | Moderate | Balanced |
| Teen | 13-17 | Medium (3px) | Detailed | Dense |
| Adult | 18+ | Fine (2px) | Intricate | Dense |

---

## Style Presets (LOCKED)

1. **Bold & Simple** — Thick outlines, minimal detail, clean shapes
2. **Kawaii Cute** — Round shapes, big eyes, soft curves
3. **Whimsical Fantasy** — Flowing lines, magical elements
4. **Cartoon Classic** — Traditional animation style
5. **Nature Botanical** — Organic shapes, plants, flowers

*More styles can be added post-launch*

---

## Hero Reference Sheet (LOCKED)

| Attribute | Value |
|-----------|-------|
| Grid layout | 2×2 |
| Views | Front, Side, Back, 3/4 |
| Output size | 1536×1536 px |
| Includes | Audience age group metadata |
| Storage | Single image file |
| Usage | Passed as reference to all page generations |

---

## Page Editor (LOCKED)

| Feature | Implementation |
|---------|----------------|
| Chat edits | Text input → regenerate/inpaint |
| Paintbrush edits | Canvas mask → inpaint specific area |
| Quick actions | Regenerate, Simplify, Add Detail |
| Version history | Max 10 versions per page |
| Undo | Restore any previous version |

---

## Export Requirements (LOCKED)

| Attribute | Value |
|-----------|-------|
| Interior DPI | 300 |
| Interior format | PNG (individual) + PDF (combined) |
| Color space | RGB (KDP converts) |
| Margins | 0.25" safe zone |
| Trim sizes | 8.5×11, 8.5×8.5, 6×9 |
| Cover | Separate (v1.1) |

---

## UI/UX Principles (LOCKED)

| Principle | Rule |
|-----------|------|
| Theme | Dark only (v1) |
| Max content width | 1280px |
| Font | Inter |
| Border radius | 6px inputs, 8px buttons, 12px cards |
| Primary color | TBD during build |
| Empty states | Always show CTA |
| Loading | Skeleton UI, not spinners |
| Icons | Lucide React |

---

## Technical Rules (LOCKED)

| Rule | Enforcement |
|------|-------------|
| TypeScript | Strict mode, no `any` |
| File size | Max 300 lines per file |
| API routes | Must use correlation IDs |
| Database | All tables have RLS |
| Secrets | Never in code, always env vars |
| Errors | Log to Sentry with context |
| State | Server state in TanStack Query |

---

## Coding Style (LOCKED)

```typescript
// File naming: kebab-case
// src/components/hero-card.tsx

// Component naming: PascalCase
export function HeroCard() {}

// Function naming: camelCase
function generatePage() {}

// Types: PascalCase with descriptive names
type ProjectDNA = { ... }

// Constants: SCREAMING_SNAKE_CASE
const MAX_PAGES = 45;

// Async functions: always try/catch with logging
async function createProject() {
  try {
    // ...
  } catch (error) {
    logger.error('createProject failed', { error, correlationId });
    throw error;
  }
}
```

---

## Database Naming (LOCKED)

| Convention | Example |
|------------|---------|
| Tables | snake_case plural: `projects`, `page_versions` |
| Columns | snake_case: `created_at`, `owner_id` |
| Primary keys | `id` (UUID) |
| Foreign keys | `{table}_id`: `project_id`, `hero_id` |
| Timestamps | `created_at`, `updated_at` |
| Soft delete | `deleted_at` (nullable) |
| Enums | snake_case: `page_type`, `job_status` |

---

## R2 Key Structure (LOCKED)

```
assets/{user_id}/projects/{project_id}/pages/{page_id}/v{version}.png
assets/{user_id}/projects/{project_id}/thumbs/{page_id}/v{version}.jpg
assets/{user_id}/heroes/{hero_id}/reference.png
assets/{user_id}/heroes/{hero_id}/thumb.jpg
assets/{user_id}/exports/{project_id}/{timestamp}/interior.pdf
```

---

## Environment Variables (LOCKED)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=
R2_PUBLIC_URL=

# OpenAI
OPENAI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_APP_URL=

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Email
RESEND_API_KEY=
```

---

## What's NOT in v1

| Feature | Status | Target |
|---------|--------|--------|
| Cover Creator | Deferred | v1.1 |
| LoRA training | Deferred | v2 |
| Teams/Workspaces | Deferred | v2 |
| Credit rollover | Deferred | v1.1 |
| Props library | Deferred | v1.1 |
| Light theme | Deferred | v1.1 |
| Keyboard shortcuts | Deferred | v1.1 |
| Onboarding tour | Deferred | v1.1 |

---

## Edge Cases (MUST HANDLE)

| Case | Solution |
|------|----------|
| Browser closes mid-generation | Job continues server-side, show "In Progress" on return |
| Payment fails | 3-day grace period, banner, then downgrade to Free |
| Blots run out mid-generation | Check balance BEFORE starting, reject if insufficient |
| Two tabs open | TanStack Query handles sync, last write wins |
| Large export timeout | Background job, poll for completion |
| Auth expires mid-session | Redirect to login with return URL |
| Storage full | Block new uploads, show upgrade prompt |
