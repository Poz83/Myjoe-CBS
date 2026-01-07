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
Payments:     Stripe (unit-based subscriptions + one-time packs)
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
| Unit Size | 100 Blots (for Stripe pricing) |
| Refresh | Subscription Blots RESET monthly (no rollover) |
| Pack Blots | Never expire, consumed after subscription Blots |
| Display | Always show balance in header |

---

## Blot Costs

| Action | Blots | Your Cost (USD) |
|--------|-------|-----------------|
| Generate 1 page | **5** | ~$0.013 |
| Edit/Regenerate page | **5** | ~$0.013 |
| Style calibration (4 samples) | **4** | ~$0.052 |
| Hero Reference Sheet | **8** | ~$0.040 |
| Cover generation | **6** | ~$0.020 |
| Export PDF + SVG | **FREE** | ~$0.010 |

### Full 40-Page Book Cost

| Component | Blots |
|-----------|-------|
| 40 pages @ 5 Blots | 200 |
| Calibration | 4 |
| Hero sheet | 8 |
| Export | FREE |
| **TOTAL** | **212 Blots** |

---

## Subscription Tiers (2-TIER UNIT MODEL)

### Pricing Model

**1 Unit = 100 Blots**

| Tier | Rate/Unit (Monthly) | Rate/Unit (Annual) |
|------|---------------------|-------------------|
| Creator | $3.00 | $2.50 |
| Studio | $2.00 | $1.75 |

### Free Tier

| Attribute | Value |
|-----------|-------|
| Price | $0 |
| Blots | 50/month |
| Storage | 25 GB |
| Projects | 3 max |
| Commercial License | ❌ |

### Creator Tier (Individuals)

| Blots | Units | Monthly | Annual | Books/Mo |
|-------|-------|---------|--------|----------|
| **300** | 3 | **$9** | $90 | ~1 |
| **500** | 5 | **$15** | $150 | ~2 |
| **800** | 8 | **$24** | $240 | ~3-4 |

- Storage: **25 GB**
- Projects: **Unlimited**
- Commercial License: **✅**

### Studio Tier (Power Users & Agencies)

| Blots | Units | Monthly | Annual | Books/Mo |
|-------|-------|---------|--------|----------|
| **2,500** | 25 | **$50** | $525 | ~11 |
| **4,000** | 40 | **$80** | $840 | ~18 |
| **5,000** | 50 | **$100** | $1,050 | ~23 |

- Storage: **50 GB**
- Projects: **Unlimited**
- Commercial License: **✅**
- Priority Support: **✅**

### Annual Pricing = 2 Months Free Equivalent

| Tier | Monthly Rate | Annual Rate | Savings |
|------|--------------|-------------|---------|
| Creator | $3.00/unit | $2.50/unit | 17% |
| Studio | $2.00/unit | $1.75/unit | 12.5% |

---

## Blot Packs (One-Time Purchase)

| Pack | Blots | Price | Per Blot |
|------|-------|-------|----------|
| **Top-Up** 🎨 | 100 | $5 | $0.050 |
| **Boost** 🚀 | 500 | $20 | $0.040 |

### Pack Rules

- **Never expire**
- **Consumed AFTER subscription Blots** (subscription depletes first)
- **Stack with any tier** (including Free)
- **No refunds**

---

## Blot Depletion Order

```
1. Subscription Blots (reset monthly)
2. Pack Blots (never expire)
```

**Example:**
- User has 100 subscription Blots + 50 pack Blots = 150 total
- Uses 120 Blots → 0 subscription + 30 pack remaining
- Month resets → 300 subscription + 30 pack = 330 total

---

## Subscription Rules

| Action | Behavior |
|--------|----------|
| **Upgrade (same tier)** | Immediate, prorated charge, Blots difference added |
| **Upgrade (tier jump)** | Immediate, prorated, storage increased, Blots difference added |
| **Downgrade** | Takes effect next billing cycle |
| **Cancel** | Access continues until period ends, then reverts to Free |
| **Payment fails** | 3-day grace period with banner, then downgrade to Free |

---

## Stripe Configuration (LOCKED)

### Product Structure

**One Product:** `Myjoe Blots (100-pack)`

**6 Price IDs:**

| Lookup Key | Type | Amount |
|------------|------|--------|
| `creator_monthly` | Per unit, Recurring Monthly | $3.00/unit |
| `creator_annual` | Per unit, Recurring Yearly | $2.50/unit |
| `studio_monthly` | Per unit, Recurring Monthly | $2.00/unit |
| `studio_annual` | Per unit, Recurring Yearly | $1.75/unit |
| `pack_topup` | One-time | $5.00 |
| `pack_boost` | One-time | $20.00 |

### Checkout Logic

```typescript
// Creator 500/mo = 5 units × $3.00 = $15/mo
stripe.checkout.sessions.create({
  line_items: [{
    price: STRIPE_PRICE_CREATOR_MONTHLY,
    quantity: 5,
  }],
});
```

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

| Level | Audiences | Violence Threshold | Sexual Threshold |
|-------|-----------|-------------------|------------------|
| **Strict** | Toddler, Children | 0.05 | 0.01 |
| **Moderate** | Tween, Teen | 0.20 | 0.10 |
| **Standard** | Adult | 0.50 | 0.30 |

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
| Output format | PNG + PDF + SVG | KDP + Cricut |

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
| Cost | 8 Blots |

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
| Formats | PNG + PDF + SVG (vectorized via Potrace) |
| Color space | RGB (KDP converts) |
| Margins | 0.25" safe zone |
| Trim sizes | 8.5×11, 8.5×8.5, 6×9 |
| File naming | `{project-slug}-page-{num}.{ext}` |
| Cost | FREE (no Blots) |

---

## UI/UX Principles (LOCKED)

| Principle | Rule |
|-----------|------|
| Theme | Dark only (v1) |
| Max content width | 1280px |
| Font | Inter |
| Border radius | 6px inputs, 8px buttons, 12px cards |
| Primary color | Blue (#3B82F6) |
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
assets/{user_id}/exports/{project_id}/{timestamp}/svg/{project-slug}-page-{num}.svg
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

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Stripe Prices (Unit-Based)
STRIPE_PRICE_CREATOR_MONTHLY=
STRIPE_PRICE_CREATOR_ANNUAL=
STRIPE_PRICE_STUDIO_MONTHLY=
STRIPE_PRICE_STUDIO_ANNUAL=
STRIPE_PRICE_PACK_TOPUP=
STRIPE_PRICE_PACK_BOOST=

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

## Profit Margins

### Your Cost Per Blot

```
1 page generation = $0.013 ÷ 5 Blots = $0.0026 per Blot
```

### Consumer Pays vs Your Cost

| Tier | Consumer Pays | Your Cost | Margin |
|------|---------------|-----------|--------|
| Creator Monthly | $0.030/Blot | $0.0026/Blot | **91%** |
| Creator Annual | $0.025/Blot | $0.0026/Blot | **90%** |
| Studio Monthly | $0.020/Blot | $0.0026/Blot | **87%** |
| Studio Annual | $0.0175/Blot | $0.0026/Blot | **85%** |

### Per Book Profitability (212 Blots)

| Tier | User Pays | Your Cost | Profit |
|------|-----------|-----------|--------|
| Creator 500 ($15/mo, ~2 books) | $6.36/book | $0.55/book | $5.81 |
| Studio 2500 ($50/mo, ~11 books) | $4.24/book | $0.55/book | $3.69 |

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
| Slider pricing | Deferred | v1.1 |

---

## Edge Cases (MUST HANDLE)

| Case | Solution |
|------|----------|
| Browser closes mid-generation | Job continues, show "In Progress" on return |
| Payment fails | 3-day grace with banner, then downgrade to Free |
| Blots run out mid-generation | Check FULL job cost BEFORE starting |
| Safety blocked | Show suggestions, allow retry |
| Two tabs open | Last write wins |
| Large export timeout | Background job, poll completion |
| Auth expires | Redirect with return URL |
| Storage full | Block uploads, show upgrade |
| User at tier ceiling needs more | Offer packs or tier upgrade |
| User at absolute ceiling (Studio 5000) | Offer packs or "Contact for Enterprise" |
