# Myjoe - AI Coloring Book Studio

> Production-ready KDP coloring book generator with hero character consistency

## Quick Links

| Doc | Purpose |
|-----|---------|
| [01_SOURCE_OF_TRUTH](./01_SOURCE_OF_TRUTH.md) | Locked decisions - read first |
| [02_ARCHITECTURE](./02_ARCHITECTURE.md) | System design |
| [03_DATA_MODEL](./03_DATA_MODEL.md) | Database schema |
| [04_API_CONTRACTS](./04_API_CONTRACTS.md) | Endpoints |
| [05_AI_PIPELINE](./05_AI_PIPELINE.md) | Generation system (Flux + Safety) |
| [06_STYLE_SYSTEM](./06_STYLE_SYSTEM.md) | Styles, heroes, calibration |
| [07_BILLING](./07_BILLING.md) | Blots + Blot Packs + Stripe |
| [08_UI_UX](./08_UI_UX.md) | Design system |
| [09_SECURITY](./09_SECURITY.md) | Auth, RLS, Content Safety |
| [10_EXECUTION_PLAN](./10_EXECUTION_PLAN.md) | Build phases with git checkpoints |
| [CURSOR_PROMPTS](./CURSOR_PROMPTS.md) | Copy-paste prompts for Cursor |

---

## What is Myjoe?

AI-powered coloring book studio for Amazon KDP publishers. Users create professional print-ready coloring books with consistent hero characters across all pages.

**Domain:** myjoe.app

---

## Key Differentiators

1. **Hero Reference Sheets** — Character stays consistent across 40 pages
2. **Style Calibration** — User picks visual anchor, all pages match
3. **Child-Safe Generation** — Multi-layer content moderation for kids' books
4. **Flux-Powered** — 67% cheaper than competitors, better line art quality
5. **Audience Presets** — Automatic line weight/complexity for age groups
6. **KDP-Ready Export** — 300 DPI PDF with correct margins

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 + TypeScript + TailwindCSS |
| Backend | Next.js API Routes + Server Actions |
| Database | Supabase (Postgres + Auth + RLS) |
| Storage | Cloudflare R2 |
| AI Planning | GPT-4o-mini |
| AI Images | **Flux via Replicate** (with LoRA support) |
| AI Safety | OpenAI Moderation API + GPT-4V |
| Payments | Stripe (subscriptions + one-time packs) |
| Hosting | Vercel |
| Analytics | PostHog |
| Errors | Sentry |

---

## Cost Comparison (Per 40-Page Book)

| Provider | Cost | Notes |
|----------|------|-------|
| **Myjoe (Flux-LineArt)** | ~$0.65 | Best value |
| **Myjoe (Flux Dev+LoRA)** | ~$1.00 | Best quality |
| GPT Image 1.5 | ~$2.00 | Previous approach |
| DALL-E 3 | ~$1.60 | No consistency |

---

## Safety Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTENT SAFETY PIPELINE                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Input                                                 │
│      │                                                      │
│      ▼                                                      │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐       │
│  │  Sanitize   │ → │  Keyword    │ → │  OpenAI     │       │
│  │  Input      │   │  Blocklist  │   │  Moderation │       │
│  └─────────────┘   └─────────────┘   └─────────────┘       │
│                           │                 │               │
│                           ▼                 ▼               │
│                    ┌─────────────────────────┐              │
│                    │    SAFE? Generate       │              │
│                    └───────────┬─────────────┘              │
│                                │                            │
│                                ▼                            │
│                    ┌─────────────────────────┐              │
│                    │  Post-Gen GPT-4V Check  │              │
│                    │  (Toddler/Children only)│              │
│                    └─────────────────────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Pricing

### Subscriptions

| Plan | Price | Blots | Storage |
|------|-------|-------|---------|
| **Free** | $0 | 50/mo | 1 GB |
| **Starter** | $15/mo | 300/mo | 5 GB |
| **Creator** | $39/mo | 900/mo | 15 GB |
| **Pro** | $99/mo | 2,800/mo | 50 GB |

### Blot Packs (One-Time)

| Pack | Blots | Price |
|------|-------|-------|
| Splash 💧 | 100 | $5 |
| Bucket 🪣 | 300 | $12 |
| Barrel 🛢️ | 1,000 | $35 |

---

## File Structure

```
myjoe/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Login, signup
│   │   ├── (studio)/          # Main app (protected)
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # Primitives
│   │   └── features/         # Feature components
│   ├── server/               # Server-only code
│   │   ├── ai/              # AI pipeline + safety
│   │   ├── db/              # Database queries
│   │   └── storage/         # R2 operations
│   ├── lib/                  # Shared utilities
│   │   └── constants/       # Config + forbidden content
│   └── types/               # TypeScript types
├── supabase/
│   └── migrations/          # SQL migrations
└── docs/                   # These docs
```

---

## Key Commands

```bash
# Development
npm run dev
npx supabase start
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Database
npx supabase db reset
npx supabase gen types typescript --local > src/types/database.ts

# Deploy
vercel deploy
vercel --prod
```
