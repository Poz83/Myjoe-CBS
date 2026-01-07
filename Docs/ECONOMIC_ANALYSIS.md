# Myjoe Economic Analysis - Blot Currency Deep Dive

## Executive Summary

After analyzing competitors, infrastructure costs, and your USP (hero consistency), I recommend **adjusting the Blot costs DOWN** to be more competitive while maintaining healthy margins.

**Key Finding:** Your current pricing is ~20% higher than competitors for basic generation, but your USP (hero consistency) justifies a small premium, not a large one.

---

## 1. Infrastructure Costs (Monthly)

### Fixed Costs (Per Month)

| Service | Plan | Cost | Notes |
|---------|------|------|-------|
| **Supabase** | Pro | $25 | 8GB DB, 100K MAU, 250GB bandwidth |
| **Vercel** | Pro | $20 | 1TB bandwidth, 40h functions |
| **Cloudflare R2** | Pay-as-go | ~$15 | 1TB storage @ $0.015/GB, zero egress |
| **Sentry** | Team | $26 | Error tracking |
| **PostHog** | Free | $0 | 1M events/month |
| **Resend** | Free → $20 | $0-20 | 3K free, then $20/month |
| **Domain** | - | $1 | ~$12/year |
| **Total Fixed** | | **~$87-107/mo** | |

### Variable Costs (Per Action)

| Service | Action | Cost |
|---------|--------|------|
| **Replicate (Flux-LineArt)** | 1 image | $0.013 |
| **Replicate (Flux-Pro)** | 1 hero sheet | $0.040 |
| **OpenAI Moderation API** | 1 check | ~$0.0001 (effectively free) |
| **OpenAI GPT-4o** | Planning 40 pages | ~$0.02-0.05 |
| **OpenAI GPT-4o (Vision)** | Safety scan | ~$0.01/image |
| **R2 Storage** | 1 book (40 images @ 2MB) | ~$0.0012/month |
| **R2 Operations** | 40 writes + 100 reads | ~$0.0002 |

---

## 2. Cost Per Book Analysis

### A) Standard Adult Book (40 pages, no hero)

| Step | Cost |
|------|------|
| GPT-4o Planning | $0.03 |
| 40x Flux-LineArt images | $0.52 |
| R2 Storage (80MB) | $0.0012 |
| **Total** | **~$0.55** |

### B) Children's Book (40 pages, with hero + safety)

| Step | Cost |
|------|------|
| GPT-4o Planning | $0.03 |
| Hero sheet (Flux-Pro) | $0.04 |
| 40x Flux-LineArt images | $0.52 |
| 40x Safety scans (GPT-4V) | $0.40 |
| R2 Storage | $0.0012 |
| **Total** | **~$1.00** |

### C) Calibration (4 samples)

| Step | Cost |
|------|------|
| 4x Flux-LineArt | $0.052 |
| **Total** | **~$0.05** |

---

## 3. Competitive Analysis

### Competitor Pricing Comparison

| Platform | Plan | Price | Credits | Per Credit | Per 40-Page Book |
|----------|------|-------|---------|------------|------------------|
| **ColorBliss** | Starter | $7/mo | ~100 | $0.070 | $2.80 |
| **ColorBliss** | Hobby | $12/mo | ~200 | $0.060 | $2.40 |
| **ColorBliss** | Artist | $25/mo | ~500 | $0.050 | $2.00 |
| **ColorBliss** | Business | $83/mo | ~2000 | $0.042 | $1.65 |
| **Colorin.ai** | Launch | $12.99/mo | 150 | $0.087 | $3.47 |
| **Colorin.ai** | Prime | $49.99/mo | 700 | $0.071 | $2.86 |
| **Coloring-Pages** | Starter | $4.90/mo | 100 | $0.049 | $1.96 |
| **Coloring-Pages** | Premium | $29.90/mo | 1000 | $0.030 | $1.20 |

### Current Myjoe Pricing (Your Original)

| Plan | Price | Blots | Per Blot | Per Book (480 Blots) |
|------|-------|-------|----------|---------------------|
| Free | $0 | 50 | - | Trial only |
| Starter | $12/mo | 300 | $0.040 | **$19.20** ❌ |
| Creator | $29/mo | 900 | $0.032 | **$15.36** ❌ |
| Pro | $79/mo | 2800 | $0.028 | **$13.44** ❌ |

**⚠️ PROBLEM:** At 12 Blots per page, a 40-page book = 480 Blots. Your Starter plan (300 Blots) can't even make ONE book!

---

## 4. Recommended Pricing Revision

### New Blot Costs (Reduced)

| Action | OLD | NEW | Rationale |
|--------|-----|-----|-----------|
| Generate 1 page | 12 | **5** | Match competitors |
| Edit 1 page | 12 | **5** | Same cost as generate |
| Style calibration | 10 | **4** | Lower barrier |
| Hero Reference Sheet | 15 | **8** | Still premium (USP) |
| Cover generation | 14 | **6** | Slight premium |
| Export PDF | 3 | **FREE** | Don't charge for downloads |

### New Subscription Tiers

| Plan | Price | Blots | Per Book (212 Blots) | Books/Month | vs ColorBliss |
|------|-------|-------|---------------------|-------------|---------------|
| **Free** | $0 | 50 | $0 | 0.25 (trial) | Standard |
| **Starter** | $9/mo | 250 | $1.80 | ~1.2 | **Cheaper than $12** |
| **Creator** | $24/mo | 800 | $1.50 | ~4 | **Cheaper than $25** |
| **Pro** | $59/mo | 2500 | $1.18 | ~12 | **Cheaper than $83** |

### New Blot Packs

| Pack | Blots | Price | Per Book | Margin |
|------|-------|-------|----------|--------|
| **Splash** 💧 | 100 | $4 | $2.00 | 64% |
| **Bucket** 🪣 | 350 | $12 | $1.71 | 69% |
| **Barrel** 🛢️ | 1200 | $35 | $1.46 | 74% |

---

## 5. Margin Analysis (New Pricing)

### Per Book Profit

| Scenario | Your Cost | User Pays (Blot value) | Margin |
|----------|-----------|------------------------|--------|
| Adult book (Starter) | $0.55 | $1.80 | **69%** |
| Adult book (Pro) | $0.55 | $1.18 | **53%** |
| Children's book (Starter) | $1.00 | $1.80 | **44%** |
| Children's book (Pro) | $1.00 | $1.18 | **15%** |

### Monthly Profit Projection (100 subscribers)

| Metric | Calculation | Amount |
|--------|-------------|--------|
| Revenue (mix of plans) | 50 Starter + 35 Creator + 15 Pro | $1,570/mo |
| Infrastructure | Fixed costs | -$107/mo |
| AI Costs | ~150 books @ $0.70 avg | -$105/mo |
| **Net Profit** | | **~$1,358/mo (86%)** |

---

## 6. Value Justification - Your USP

### What Competitors CAN'T Do

| Feature | ColorBliss | Colorin.ai | **Myjoe** |
|---------|------------|------------|-----------|
| Hero consistency across 40 pages | ❌ | ❌ | ✅ |
| Style calibration (pick anchor) | ❌ | ❌ | ✅ |
| Project DNA lock (no drift) | ❌ | ❌ | ✅ |
| Age-appropriate safety system | ❌ | ❌ | ✅ |
| Paintbrush inpainting | Limited | ❌ | ✅ |
| KDP-ready export with margins | ✅ | ✅ | ✅ |

### Why You Can Charge LESS and Still Win

1. **Lower AI costs** - Flux ($0.013) vs competitors likely using DALL-E ($0.04-0.08)
2. **Zero egress fees** - R2 vs S3 saves ~$90/TB
3. **Leaner infrastructure** - Supabase + Vercel vs AWS

### Marketing Position

> "The ONLY AI coloring book tool with consistent characters across every page. Your hero looks the same on page 1 and page 40 - guaranteed."

This USP is **worth 10-15% premium**, not 50-100% premium.

---

## 7. Final Recommended Configuration

### Updated constants/index.ts

```typescript
// === BLOT COSTS (REVISED) ===
export const BLOT_COSTS = {
  styleCalibration: 4,      // was 10
  heroReferenceSheet: 8,    // was 15
  generatePage: 5,          // was 12
  regeneratePage: 5,        // was 12
  editPage: 5,              // was 12
  coverGeneration: 6,       // was 14
  exportPDF: 0,             // FREE - don't charge for downloads
} as const;

// === PLAN LIMITS (REVISED) ===
export const PLAN_LIMITS = {
  free: { blots: 50, storageBytes: 1073741824, priceMonthly: 0 },
  starter: { blots: 250, storageBytes: 5368709120, priceMonthly: 900 },
  creator: { blots: 800, storageBytes: 16106127360, priceMonthly: 2400 },
  pro: { blots: 2500, storageBytes: 53687091200, priceMonthly: 5900 },
} as const;

// === BLOT PACKS (REVISED) ===
export const BLOT_PACKS = {
  splash: { blots: 100, priceCents: 400 },
  bucket: { blots: 350, priceCents: 1200 },
  barrel: { blots: 1200, priceCents: 3500 },
} as const;
```

### Pricing Summary

| Plan | Price | Blots | Books | Per Book |
|------|-------|-------|-------|----------|
| Free | $0 | 50 | Trial | - |
| Starter | **$9/mo** | 250 | ~1.2 | $1.80 |
| Creator | **$24/mo** | 800 | ~4 | $1.50 |
| Pro | **$59/mo** | 2500 | ~12 | $1.18 |

---

## 8. Breakeven Analysis

### At What Point Do You Profit?

| Subscribers | Monthly Revenue | Costs | Profit |
|-------------|-----------------|-------|--------|
| 10 | ~$200 | ~$150 | $50 |
| 25 | ~$500 | ~$180 | $320 |
| 50 | ~$1,000 | ~$250 | $750 |
| 100 | ~$2,000 | ~$400 | $1,600 |
| 500 | ~$10,000 | ~$1,500 | $8,500 |

**Breakeven: ~8 paying subscribers**

---

## 9. Action Items

1. ✅ **Update BLOT_COSTS** in constants (reduce all values)
2. ✅ **Update PLAN_LIMITS** with new blot amounts and prices
3. ✅ **Update BLOT_PACKS** with revised values
4. ✅ **Update Stripe products** with new prices
5. ✅ **Update documentation** to reflect new pricing
6. ✅ **Marketing**: Emphasize hero consistency as key differentiator

---

## 10. Summary

### Before (Too Expensive)
- 40-page book = 480 Blots
- Starter couldn't make 1 book
- Price: $15-19 per book
- **Not competitive**

### After (Competitive + Profitable)
- 40-page book = 212 Blots
- Starter makes 1+ books
- Price: $1.18-1.80 per book
- **Cheaper than competitors with BETTER features**
- **Still 53-69% margin**

Your USP (hero consistency) justifies charging similar prices to competitors while delivering MORE value. You don't need to be cheaper - you need to be **fair** and let your features speak for themselves.
