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
AI Images:    Flux via Replicate (flux-lineart, flux-pro)
AI Safety:    OpenAI Moderation API + GPT-4o Vision
Payments:     Stripe (subscriptions + one-time packs)
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
| Refresh | RESET monthly (no rollover in v1) |
| Display | Always show balance in header |

### Blot Costs (REVISED ✅)

| Action | Blots | Your Cost (USD) | Your Cost (GBP) |
|--------|-------|-----------------|-----------------|
| Generate 1 page | **5** | $0.013 | £0.010 |
| Edit/Regenerate page | **5** | $0.013 | £0.010 |
| Style calibration (4 samples) | **4** | $0.052 | £0.042 |
| Hero Reference Sheet | **8** | $0.040 | £0.032 |
| Cover generation | **6** | $0.020 | £0.016 |
| Export PDF | **FREE** | $0.010 | £0.008 |

### Full 40-Page Book Cost

| Component | Blots | Your Cost |
|-----------|-------|-----------|
| 40 pages @ 5 Blots | 200 | £0.42 |
| Calibration | 4 | £0.04 |
| Hero sheet | 8 | £0.03 |
| Export | FREE | £0.01 |
| Planning (GPT-4o) | - | £0.02 |
| **TOTAL (Adult)** | **212** | **£0.52** |
| + Safety scans (Children) | - | +£0.32 |
| **TOTAL (Children)** | **212** | **£0.84** |

---

## Subscription Tiers (REVISED ✅)

| Plan | Price (USD) | Price (GBP) | Blots | Storage | Books/Mo | Commercial |
|------|-------------|-------------|-------|---------|----------|------------|
| Free | $0 | £0 | 50/mo | 1 GB | Trial | ❌ |
| **Starter** | **$9/mo** | **£7.20** | **250/mo** | 5 GB | ~1 | ✅ |
| **Creator** | **$24/mo** | **£19.20** | **800/mo** | 15 GB | ~3-4 | ✅ |
| **Pro** | **$59/mo** | **£47.20** | **2,500/mo** | 50 GB | ~11 | ✅ |

### Per-Book Economics (User Pays)

| Plan | Blots per Book | User Pays | Your Cost | Margin |
|------|----------------|-----------|-----------|--------|
| Starter | 212 | £6.10 | £0.52 | **91%** |
| Creator | 212 | £5.09 | £0.52 | **90%** |
| Pro | 212 | £4.00 | £0.52 | **87%** |

---

## Blot Packs (One-Time Purchase) ✅ NEW

| Pack | Blots | Price (USD) | Price (GBP) | Per Book |
|------|-------|-------------|-------------|----------|
| **Splash** 💧 | 100 | $4 | £3.20 | £6.85 |
| **Bucket** 🪣 | 350 | $12 | £9.60 | £5.87 |
| **Barrel** 🛢️ | 1,200 | $35 | £28 | £5.00 |

- Packs **never expire**
- Stack with subscription Blots
- Single pool (subscription + pack combined)

---

## Flux Configuration (LOCKED)

| Model | Use Case | Cost | Trigger |
|-------|----------|------|---------|
| `flux-lineart` | Production pages | $0.013 | None |
| `flux-dev-lora` | Custom trained | $0.025 | `c0l0ringb00k` |
| `flux-pro` | Hero sheets | $0.040 | None |

### Line Weight Prompts

| Weight | Prompt Addition |
|--------|-----------------|
| thick | `bold thick black outlines, 6-8 pixel line weight` |
| medium | `clean medium black outlines, 3-5 pixel line weight` |
| fine | `delicate fine black outlines, 1-3 pixel line weight` |

---

## Content Safety (LOCKED)

### Safety Levels

| Level | Audiences | Thresholds |
|-------|-----------|------------|
| **Strict** | Toddler, Children | Violence: 0.05, Sexual: 0.01 |
| **Moderate** | Tween, Teen | Violence: 0.20, Sexual: 0.10 |
| **Standard** | Adult | Violence: 0.50, Sexual: 0.30 |

**ALWAYS:** `sexual/minors` threshold = **0.01** (all audiences)

### Post-Generation Scans

| Audience | GPT-4V Safety Scan |
|----------|-------------------|
| Toddler | ✅ Required |
| Children | ✅ Required |
| Tween | ❌ Skip |
| Teen | ❌ Skip |
| Adult | ❌ Skip |

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

| Audience | Age | Line Weight | Complexity | Safety Level |
|----------|-----|-------------|------------|--------------|
| Toddler | 2-4 | Thick (8px+) | Minimal | Strict |
| Children | 5-8 | Thick (6px) | Moderate | Strict |
| Tween | 9-12 | Medium (4px) | Moderate | Moderate |
| Teen | 13-17 | Medium (3px) | Detailed | Moderate |
| Adult | 18+ | Fine (2px) | Intricate | Standard |

---

## Style Presets (LOCKED)

1. **Bold & Simple** — Thick outlines, minimal detail, clean shapes
2. **Kawaii Cute** — Round shapes, big eyes, soft curves
3. **Whimsical Fantasy** — Flowing lines, magical elements
4. **Cartoon Classic** — Traditional animation style
5. **Nature Botanical** — Organic shapes, plants, flowers

---

## Hero Reference Sheet (LOCKED)

| Attribute | Value |
|-----------|-------|
| Grid layout | 2×2 |
| Views | Front, Side, Back, 3/4 |
| Output size | 1536×1536 px |
| Model | Flux-Pro ($0.04) |
| Storage | Single image file |

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

## Database Naming (LOCKED)

| Convention | Example |
|------------|---------|
| Tables | snake_case plural: `projects`, `page_versions` |
| Columns | snake_case: `created_at`, `owner_id` |
| Primary keys | `id` (UUID) |
| Foreign keys | `{table}_id`: `project_id`, `hero_id` |
| Timestamps | `created_at`, `updated_at` |
| Soft delete | `deleted_at` (nullable) |

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

# Replicate (Flux)
REPLICATE_API_TOKEN=
FLUX_MODEL=flux-lineart

# Stripe - Subscriptions
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_STARTER_MONTHLY=
STRIPE_PRICE_STARTER_YEARLY=
STRIPE_PRICE_CREATOR_MONTHLY=
STRIPE_PRICE_CREATOR_YEARLY=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_YEARLY=

# Stripe - Blot Packs
STRIPE_PRICE_SPLASH=
STRIPE_PRICE_BUCKET=
STRIPE_PRICE_BARREL=

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

## Infrastructure Costs (Monthly)

| Service | Plan | Cost (USD) | Cost (GBP) |
|---------|------|------------|------------|
| Supabase | Pro | $25 | £20 |
| Vercel | Pro | $20 | £16 |
| Cloudflare R2 | Pay-as-go | ~$15 | ~£12 |
| Sentry | Team | $26 | £21 |
| PostHog | Free | $0 | £0 |
| Domain | Annual | ~$1 | ~£1 |
| **Total Fixed** | | **~$87** | **~£70** |

**Breakeven:** ~8 paying subscribers

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

---

## Edge Cases (MUST HANDLE)

| Case | Solution |
|------|----------|
| Browser closes mid-generation | Job continues, show "In Progress" on return |
| Payment fails | 3-day grace, banner, then downgrade |
| Blots run out mid-generation | Check BEFORE starting |
| Safety blocked | Show suggestions, allow retry |
| Two tabs open | Last write wins |
| Large export timeout | Background job, poll completion |
| Auth expires | Redirect with return URL |
| Storage full | Block uploads, show upgrade |
