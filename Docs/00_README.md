# Myjoe - AI Coloring Book Studio

> Production-ready KDP coloring book generator with hero character consistency

## Quick Links

| Doc | Purpose |
|-----|---------|
| [01_SOURCE_OF_TRUTH](./01_SOURCE_OF_TRUTH.md) | Locked decisions - read first |
| [02_ARCHITECTURE](./02_ARCHITECTURE.md) | System design |
| [03_DATA_MODEL](./03_DATA_MODEL.md) | Database schema |
| [04_API_CONTRACTS](./04_API_CONTRACTS.md) | Endpoints |
| [05_AI_PIPELINE](./05_AI_PIPELINE.md) | Generation system |
| [06_STYLE_SYSTEM](./06_STYLE_SYSTEM.md) | Styles, heroes, calibration |
| [07_BILLING](./07_BILLING.md) | Blots + Stripe |
| [08_UI_UX](./08_UI_UX.md) | Design system |
| [09_SECURITY](./09_SECURITY.md) | Auth, RLS, limits |
| [10_EXECUTION_PLAN](./10_EXECUTION_PLAN.md) | Build phases with git checkpoints |
| [CURSOR_PROMPTS](./CURSOR_PROMPTS.md) | Copy-paste prompts for Cursor |

---

## What is Myjoe?

AI-powered coloring book studio for Amazon KDP publishers. Users create professional print-ready coloring books with consistent hero characters across all pages.

**Domain:** myjoe.app

---

## Competitive Analysis

| Competitor | Price Range | Credits/Gen | Key Features | Weakness |
|------------|-------------|-------------|--------------|----------|
| **ColorBliss** | $7-83/mo | 250-5000/mo | Rollover credits, batch gen, photo-to-page | No character consistency |
| **Colorin.ai** | $12.99-49.99/mo | 150-700/mo | KDP export, styles | No hero system |
| **ColoringBook.AI** | $6.99+/mo | 100+/mo | Story mode, 20-page books | Basic, no pro features |
| **Coloring-Pages.app** | $4.90-29.90/mo | 100-1000/mo | Cheap, simple | Very basic |
| **Automateed** | Varies | Batch 10-20 | KDP-focused, covers | No consistency |

### Our Differentiators

1. **Hero Reference Sheets** — Character stays consistent across 40 pages (competitors can't do this)
2. **Style Calibration** — User picks visual anchor, all pages match
3. **Project DNA Lock** — Prevents AI drift mid-book
4. **Audience Presets** — Automatic line weight/complexity for age groups
5. **Paintbrush Inpainting** — Precise AI edits (competitors use chat only)
6. **KDP-Ready Export** — 300 DPI PDF with correct margins

---

## Myjoe Pricing (Competitive Position)

| Plan | Price | Blots | ≈ Books | vs Competition |
|------|-------|-------|---------|----------------|
| **Free** | $0 | 50/mo | Trial | Standard |
| **Starter** | $12/mo | 300 | ~0.6 | Matches Colorin Launch |
| **Creator** | $29/mo | 900 | ~1.8 | Below ColorBliss Artist |
| **Pro** | $79/mo | 2,800 | ~5.6 | Below ColorBliss Business |

**Storage by plan:**
- Free: 1 GB
- Starter: 5 GB  
- Creator: 15 GB
- Pro: 50 GB

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 + TypeScript + TailwindCSS |
| Backend | Next.js API Routes + Server Actions |
| Database | Supabase (Postgres + Auth + RLS) |
| Storage | Cloudflare R2 |
| AI | GPT-4o-mini (planning) + GPT Image 1.5 (generation) |
| Payments | Stripe (subscriptions + webhooks) |
| Hosting | Vercel |
| Analytics | PostHog |
| Errors | Sentry |
| Email | Resend + React Email |

---

## Timeline

**30-Day Internal Testing → Commercial Launch**

| Week | Focus |
|------|-------|
| 1 | Auth + Project CRUD + Basic UI |
| 2 | Generation Pipeline + Style Calibration |
| 3 | Hero System + Page Editor + Export |
| 4 | Billing + Polish + Deploy |

---

## Key Commands

```bash
# Development
npm run dev           # Start Next.js
npx supabase start    # Start local Supabase
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Database
npx supabase db reset # Reset database
npx supabase gen types typescript --local > src/types/database.ts

# Deploy
vercel deploy         # Preview
vercel --prod        # Production
```

---

## File Structure

```
myjoe/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Login, signup
│   │   ├── (studio)/          # Main app (protected)
│   │   │   ├── projects/
│   │   │   ├── library/
│   │   │   └── settings/
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # Primitives (button, input)
│   │   └── features/         # Feature components
│   ├── server/               # Server-only code
│   │   ├── ai/              # AI pipeline
│   │   ├── db/              # Database queries
│   │   └── storage/         # R2 operations
│   ├── lib/                  # Shared utilities
│   └── types/               # TypeScript types
├── supabase/
│   ├── migrations/          # SQL migrations
│   └── seed.sql            # Test data
├── public/                  # Static assets
└── docs/                   # These docs
```
