# Myjoe - AI Coloring Book Studio

> Production-ready KDP coloring book generator with hero character consistency
> 
> **Last Updated:** January 7, 2026 | **Version:** 2.0 (2-Tier Unit-Based Billing)

## Quick Links

| Doc | Purpose |
|-----|---------|
| [01_SOURCE_OF_TRUTH](./01_SOURCE_OF_TRUTH.md) | Locked decisions - read first |
| [02_ARCHITECTURE](./02_ARCHITECTURE.md) | System design & directory structure |
| [03_DATA_MODEL](./03_DATA_MODEL.md) | Database schema & RLS |
| [04_API_CONTRACTS](./04_API_CONTRACTS.md) | API endpoints & types |
| [05_AI_PIPELINE](./05_AI_PIPELINE.md) | Flux generation system |
| [06_CONTENT_SAFETY](./06_CONTENT_SAFETY.md) | Multi-layer safety pipeline |
| [07_BILLING](./07_BILLING.md) | Blots + Stripe (unit-based) |
| [STRIPE_SETUP_GUIDE_FINAL](./STRIPE_SETUP_GUIDE_FINAL.md) | Step-by-step Stripe setup |
| [BLOT_CALCULATOR](./BLOT_CALCULATOR.md) | Calculator component for billing |
| [PROMPTS_PHASE_10](./PROMPTS_PHASE_10.md) | Billing implementation prompts |

---

## What is Myjoe?

AI-powered coloring book studio for Amazon KDP publishers. Users create professional print-ready coloring books with consistent hero characters across all pages.

**Domain:** myjoe.app

---

## Key Differentiators

1. **Hero Reference Sheets** — Character stays consistent across 40+ pages
2. **Style Calibration** — User picks visual anchor, all pages match
3. **Child-Safe Generation** — Multi-layer content moderation for kids' books
4. **Flux-Powered** — 67% cheaper than competitors, better line art quality
5. **Audience Presets** — Automatic line weight/complexity for age groups
6. **KDP-Ready Export** — 300 DPI PDF + SVG with correct margins

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 + TypeScript + TailwindCSS |
| Backend | Next.js API Routes + Server Actions |
| Database | Supabase (Postgres + Auth + RLS) |
| Storage | Cloudflare R2 |
| AI Planning | GPT-4o-mini |
| AI Images | **Flux via Replicate** (lineart, dev, pro) |
| AI Safety | OpenAI Moderation API + GPT-4V |
| Payments | Stripe (unit-based subscriptions) |
| Hosting | Vercel |
| Analytics | PostHog |
| Errors | Sentry |

---

## Cost Comparison (Per 40-Page Book)

| Provider | Cost | Notes |
|----------|------|-------|
| **Myjoe (Flux-LineArt)** | ~$0.55 | Best value |
| **Myjoe (Flux-Pro)** | ~$5.60 | Best quality |
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

## Pricing (2-Tier Unit Model)

### How It Works

**1 Unit = 100 Blots** — Stripe charges per unit, you select quantity.

### Free Tier

| Attribute | Value |
|-----------|-------|
| Price | $0 |
| Blots | 50/month |
| Storage | 25 GB |
| Projects | 3 max |
| Commercial | ❌ |

### Creator Tier (Individuals)

| Blots | Units | Monthly | Annual |
|-------|-------|---------|--------|
| **300** | 3 | **$9** | $90 |
| **500** | 5 | **$15** | $150 |
| **800** | 8 | **$24** | $240 |

- Storage: 25 GB
- Projects: Unlimited
- Commercial: ✅

### Studio Tier (Power Users)

| Blots | Units | Monthly | Annual |
|-------|-------|---------|--------|
| **2,500** | 25 | **$50** | $525 |
| **4,000** | 40 | **$80** | $840 |
| **5,000** | 50 | **$100** | $1,050 |

- Storage: 50 GB
- Projects: Unlimited
- Commercial: ✅
- Priority Support: ✅

### Blot Packs (One-Time, Never Expire)

| Pack | Blots | Price |
|------|-------|-------|
| **Top-Up** 🎨 | 100 | $5 |
| **Boost** 🚀 | 500 | $20 |

### Blot Costs

| Action | Blots |
|--------|-------|
| Generate page | 5 |
| Edit page | 5 |
| Style calibration | 4 |
| Hero sheet | 8 |
| Export PDF/SVG | FREE |

**Full 40-page book = ~212 Blots**

---

## File Structure

```
myjoe/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Login, signup
│   │   ├── (studio)/          # Main app (protected)
│   │   └── api/               # API routes
│   │       └── billing/       # Checkout, portal, balance
│   ├── components/            # React components
│   │   ├── ui/               # Primitives
│   │   └── features/         # Feature components
│   │       └── billing/      # Calculator, tier cards
│   ├── server/               # Server-only code
│   │   ├── ai/              # AI pipeline + safety
│   │   ├── db/              # Database queries
│   │   ├── billing/         # Stripe, Blots
│   │   └── storage/         # R2 operations
│   ├── lib/                  # Shared utilities
│   │   └── constants/       # Billing, safety, styles
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

# Stripe CLI
stripe login
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded

# Deploy
vercel deploy
vercel --prod
```

---

## Revenue Model

### Per-Book Economics

| Tier | User Pays | Your Cost | Margin |
|------|-----------|-----------|--------|
| Creator 500 | $6.36/book | $0.55/book | **91%** |
| Studio 2500 | $4.24/book | $0.55/book | **87%** |

### Monthly Projections

| Paying Users | Est. MRR | Fixed Costs | Net |
|--------------|----------|-------------|-----|
| 10 | ~$220 | ~$87 | ~$133 |
| 50 | ~$1,100 | ~$87 | ~$1,013 |
| 100 | ~$2,200 | ~$87 | ~$2,113 |

**Breakeven:** ~8 paying subscribers
