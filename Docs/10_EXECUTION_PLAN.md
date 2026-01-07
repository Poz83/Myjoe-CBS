# Execution Plan

## Overview

**Timeline:** 30 days to production-ready  
**Approach:** Build incrementally, commit often, test each phase

---

## What's New in This Plan

| Addition | Why |
|----------|-----|
| **Flux via Replicate** | 67% cost reduction vs GPT Image 1.5 |
| **Content Safety System** | Required for children's coloring books |
| **Blot Packs** | One-time purchases solve "50 Blots short" problem |
| **Post-Gen Safety** | GPT-4V scan for toddler/children content |

---

## Git Workflow

### Branch Strategy

```
main (production)
  └── develop (staging)
        ├── feature/phase-1-setup
        ├── feature/phase-2-auth
        └── ...
```

### Commit Convention

```
feat: add Flux generator
fix: correct safety threshold for toddlers
refactor: extract content safety module
```

---

## Phase 1: Foundation (Days 1-3)

### Goals
- Project scaffolding
- Database schema deployed
- Design system in place

### Tasks

```
□ 1.1 Project Setup
  □ Create Next.js 14 project with TypeScript
  □ Configure Tailwind CSS
  □ Install dependencies including `replicate`
  □ Set up folder structure

□ 1.2 Supabase Setup
  □ Run migrations including blot_purchases table
  □ Enable RLS on all tables
  □ Create profile trigger + add_blots function

□ 1.3 Environment Configuration
  □ Create .env.local with ALL variables:
    - REPLICATE_API_TOKEN
    - FLUX_MODEL
    - STRIPE_PRICE_SPLASH/BUCKET/BARREL
  □ Create .env.example

□ 1.4 Design System
  □ Create UI primitives
  □ Set up dark theme colors
```

### Git Checkpoint

```bash
git add . && git commit -m "feat: phase 1 complete"
git tag -a v0.1 -m "Phase 1: Foundation"
```

---

## Phase 2: Authentication (Days 4-5)

### Goals
- Google OAuth working
- Magic Link working
- Profile auto-creation

### Tasks

```
□ 2.1 Auth Setup
□ 2.2 Auth Pages
□ 2.3 Auth Flow Testing
□ 2.4 User Menu
```

---

## Phase 3: Projects CRUD (Days 6-8)

### Goals
- Create/list/edit/delete projects
- Project wizard with DNA selection

### Tasks

```
□ 3.1 Projects API
□ 3.2 Projects UI
□ 3.3 Project Wizard (4 steps)
□ 3.4 Project Editor Shell (fluid 3-column layout)
```

---

## Phase 4: AI Pipeline with Safety (Days 9-13) ⭐ UPDATED

### Goals
- **Flux via Replicate** (not GPT Image 1.5)
- **Multi-layer content safety**
- Cleanup pipeline + Quality gate

### Tasks

```
□ 4.1 Constants & Types
  □ Add FLUX_MODELS, FLUX_TRIGGERS
  □ Add AUDIENCE_DERIVATIONS with safetyLevel
  □ Add BLOT_PACKS

□ 4.2 Forbidden Content
  □ Create forbidden-content.ts
  □ Define blocklists per audience
  □ Create SAFE_SUGGESTIONS

□ 4.3 Content Safety System
  □ Create sanitize.ts (input cleaning)
  □ Create content-safety.ts (keyword + moderation)
  □ Integrate with audience thresholds

□ 4.4 Flux Generator
  □ Install replicate package
  □ Create flux-generator.ts
  □ Model selection: flux-lineart, flux-dev-lora, flux-pro

□ 4.5 Planner-Compiler
  □ Create with Flux trigger words
  □ Safety integration before compilation
  □ Return suggestions if blocked

□ 4.6 Cleanup & Quality Gate
  □ Sharp-based binarization
  □ Quality scoring

□ 4.7 Post-Generation Safety
  □ Create image-safety-check.ts
  □ GPT-4V for toddler/children only
  □ Auto-retry on failure

□ 4.8 Complete Pipeline
  □ Wire all components together
  □ Test with different audiences
```

### Safety Test Matrix

| Input | Toddler | Children | Adult |
|-------|---------|----------|-------|
| "cute bunny" | ✅ | ✅ | ✅ |
| "scary monster" | ❌ | ❌ | ✅ |
| "dragon with fire" | ❌ | ⚠️ | ✅ |
| "zombie attack" | ❌ | ❌ | ✅ |

---

## Phase 5: Style Calibration (Days 14-15)

### Goals
- Generate 4 style samples with Flux
- User picks anchor

### Tasks

```
□ 5.1 Calibration Generator (Flux-powered)
□ 5.2 Calibration API
□ 5.3 Calibration UI
```

### If Upgrading Mid-Build

**Use PROMPT_5.2a_UPGRADE.md** to migrate existing codebase to Flux + Safety before continuing.

---

## Phase 6: Generation Jobs (Days 16-18)

### Goals
- Async job processing with safety
- Progress UI with safety feedback

### Tasks

```
□ 6.1 R2 Storage
□ 6.2 Jobs & Pages Database
□ 6.3 Blot Management
□ 6.4 Generation API (with safety blocking)
□ 6.5 Job Processor (with safety checks)
□ 6.6 Generation UI (with safety feedback)
```

---

## Phase 7: Hero System (Days 19-21)

### Goals
- Hero creation with Flux Pro
- Safety checked descriptions

### Tasks

```
□ 7.1 Hero Generator (Flux Pro for quality)
□ 7.2 Heroes Database & API (with safety)
□ 7.3 Hero UI (with safety feedback)
□ 7.4 Hero Integration
```

---

## Phase 8: Page Editor (Days 22-24)

### Goals
- Edit pages with safety
- Version history

### Tasks

```
□ 8.1 Page API (with safety on edit prompts)
□ 8.2 Inpainting (with safety)
□ 8.3 Edit Canvas
□ 8.4 Page Editor UI
```

---

## Phase 9: Export (Days 25-26)

### Goals
- PDF export
- KDP-compliant output

---

## Phase 10: Billing with Packs (Days 27-28) ⭐ UPDATED

### Goals
- Stripe subscriptions
- **Blot Packs** (one-time purchases)

### Tasks

```
□ 10.1 Stripe Setup
  □ Create subscription products
  □ Create pack products (splash, bucket, barrel)

□ 10.2 Checkout Flow
  □ Subscription checkout
  □ Pack checkout

□ 10.3 Webhook Handler
  □ Handle checkout.session.completed for BOTH types
  □ Add blots for pack purchases

□ 10.4 Blot Display
  □ Balance display
  □ Low blots warning

□ 10.5 Blot Packs UI
  □ Pack selector component
  □ 3 cards: Splash, Bucket, Barrel
  □ Success toast

□ 10.6 Billing Page
  □ Current plan + balance
  □ Pack selector section
```

---

## Phase 11: Polish (Days 29-30)

### Goals
- All edge cases handled
- Safety event tracking

### Tasks

```
□ 11.1 Empty States
□ 11.2 Loading States
□ 11.3 Error Handling
□ 11.4 Edge Cases
□ 11.5 Analytics
  □ Track: generation_safety_blocked
  □ Track: hero_safety_blocked
  □ Track: blot_pack_purchased
□ 11.6 Final Polish
```

---

## Deployment Checklist

### Environment Variables (Vercel)

```
# New variables for Flux + Safety + Packs
REPLICATE_API_TOKEN=
FLUX_MODEL=flux-lineart
STRIPE_PRICE_SPLASH=
STRIPE_PRICE_BUCKET=
STRIPE_PRICE_BARREL=

# Existing variables
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
R2_ACCESS_KEY_ID=
STRIPE_SECRET_KEY=
...
```

---

## Cost Impact

### Per 40-Page Book

| Audience | Generation | Safety | Total |
|----------|------------|--------|-------|
| Adult | $0.52 | $0 | ~$0.60 |
| Children | $0.52 | $0.40 | ~$1.00 |

### vs Previous Approach

| Before (GPT Image 1.5) | After (Flux) | Savings |
|------------------------|--------------|---------|
| ~$2.00/book | ~$0.65/book | **67%** |

---

## Quick Reference

### Start a Session
```
I'm building Myjoe. I last completed prompt [X.X].
Let's continue with the next prompt.
```

### If Upgrading at Phase 5
```
I'm at prompt 5.2. I need to upgrade to Flux + Safety.
Let's use PROMPT_5.2a_UPGRADE.md
```

### After Each Prompt
```bash
npm run dev  # Test
git add . && git commit -m "feat(X.X): description"
```

### After Each Phase
```bash
git tag -a v0.X -m "Phase X complete"
git push origin main --tags
```
