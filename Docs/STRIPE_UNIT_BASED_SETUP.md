# Stripe Setup (Corbin's Unit-Based Method)

> **One Product, Four Prices, Infinite Flexibility**

---

## The Method

Instead of creating separate products for each plan:
- ❌ "Creator 250 Plan" product
- ❌ "Creator 500 Plan" product  
- ❌ "Studio 2000 Plan" product

Create ONE product with FOUR price rates:
- ✅ "Myjoe Blots" product
- ✅ 4 price IDs (different per-Blot rates)
- ✅ Checkout sends: Price ID + Quantity

---

## Step 1: Create Single Product

Go to **Product catalog → Add product**

```
Name:        Myjoe Blots
Description: Monthly Blot allocation for AI coloring book generation
Image:       [Upload Myjoe logo or Blot icon]
```

**DO NOT add a price yet.** Save the product first.

---

## Step 2: Create 4 Price IDs

Click into your "Myjoe Blots" product, then **Add price** four times:

### Price 1: Creator Monthly

```
Pricing model:  Recurring
Price:          $0.03 per unit
Billing period: Monthly
Lookup key:     creator_monthly

Metadata:
├── tier: creator
└── interval: monthly
```

### Price 2: Creator Annual

```
Pricing model:  Recurring  
Price:          $0.025 per unit
Billing period: Yearly
Lookup key:     creator_annual

Metadata:
├── tier: creator
└── interval: yearly
```

### Price 3: Studio Monthly

```
Pricing model:  Recurring
Price:          $0.022 per unit
Billing period: Monthly
Lookup key:     studio_monthly

Metadata:
├── tier: studio
└── interval: monthly
```

### Price 4: Studio Annual

```
Pricing model:  Recurring
Price:          $0.018 per unit
Billing period: Yearly
Lookup key:     studio_annual

Metadata:
├── tier: studio
└── interval: yearly
```

---

## Step 3: Create Pack Prices (One-Time)

Still in "Myjoe Blots" product, add 2 more prices:

### Top-Up Pack

```
Pricing model:  One time
Price:          $5.00
Lookup key:     pack_topup

Metadata:
├── type: blot_pack
├── pack_id: topup
└── blots: 100
```

### Boost Pack

```
Pricing model:  One time
Price:          $20.00
Lookup key:     pack_boost

Metadata:
├── type: blot_pack
├── pack_id: boost
└── blots: 500
```

---

## Step 4: Copy Price IDs

Your "Myjoe Blots" product now has **6 prices**:

| Lookup Key | Price ID | Rate/Amount |
|------------|----------|-------------|
| creator_monthly | `price_1ABC...` | $0.03/unit |
| creator_annual | `price_1DEF...` | $0.025/unit |
| studio_monthly | `price_1GHI...` | $0.022/unit |
| studio_annual | `price_1JKL...` | $0.018/unit |
| pack_topup | `price_1MNO...` | $5 one-time |
| pack_boost | `price_1PQR...` | $20 one-time |

---

## Step 5: Environment Variables

```bash
# Just 6 price IDs (not 14!)
STRIPE_PRICE_CREATOR_MONTHLY=price_1ABC...
STRIPE_PRICE_CREATOR_ANNUAL=price_1DEF...
STRIPE_PRICE_STUDIO_MONTHLY=price_1GHI...
STRIPE_PRICE_STUDIO_ANNUAL=price_1JKL...
STRIPE_PRICE_PACK_TOPUP=price_1MNO...
STRIPE_PRICE_PACK_BOOST=price_1PQR...
```

---

## Step 6: Checkout Code

```typescript
// src/lib/constants/billing.ts

export const BLOT_RATES = {
  creator: { monthly: 0.03, annual: 0.025 },
  studio: { monthly: 0.022, annual: 0.018 },
} as const;

export const STRIPE_PRICES = {
  creator: {
    monthly: process.env.STRIPE_PRICE_CREATOR_MONTHLY!,
    annual: process.env.STRIPE_PRICE_CREATOR_ANNUAL!,
  },
  studio: {
    monthly: process.env.STRIPE_PRICE_STUDIO_MONTHLY!,
    annual: process.env.STRIPE_PRICE_STUDIO_ANNUAL!,
  },
  packs: {
    topup: process.env.STRIPE_PRICE_PACK_TOPUP!,
    boost: process.env.STRIPE_PRICE_PACK_BOOST!,
  },
} as const;

// Pre-defined quantities for UI
export const BLOT_OPTIONS = {
  creator: [250, 500, 800],
  studio: [2000, 3500, 5000],
} as const;
```

```typescript
// src/server/billing/stripe.ts

export async function createSubscriptionCheckout(
  userId: string,
  email: string,
  tier: 'creator' | 'studio',
  blots: number,
  interval: 'monthly' | 'annual'
): Promise<string> {
  const customerId = await getOrCreateCustomer(userId, email);
  const priceId = STRIPE_PRICES[tier][interval];
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{
      price: priceId,
      quantity: blots,  // ← THE MAGIC: quantity determines plan
    }],
    metadata: { userId, tier, blots: blots.toString() },
    subscription_data: {
      metadata: { userId, tier, blots: blots.toString() },
    },
    success_url: `${APP_URL}/billing?success=1`,
    cancel_url: `${APP_URL}/billing`,
  });
  
  return session.url!;
}
```

---

## What Users See at Checkout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Myjoe Blots                                        │
│                                                     │
│  500 × $0.03                                        │
│                                                     │
│  Subtotal                              $15.00/mo    │
│                                                     │
│  [Pay $15.00]                                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Transparency:** User sees exactly what they're buying.

---

## Resulting Prices

| Selection | Quantity × Rate | Price |
|-----------|-----------------|-------|
| Creator 250 Monthly | 250 × $0.03 | **$7.50** |
| Creator 500 Monthly | 500 × $0.03 | **$15** |
| Creator 800 Monthly | 800 × $0.03 | **$24** |
| Creator 250 Annual | 250 × $0.025 × 12 | **$75/yr** |
| Creator 500 Annual | 500 × $0.025 × 12 | **$150/yr** |
| Creator 800 Annual | 800 × $0.025 × 12 | **$240/yr** |
| Studio 2000 Monthly | 2000 × $0.022 | **$44** |
| Studio 3500 Monthly | 3500 × $0.022 | **$77** |
| Studio 5000 Monthly | 5000 × $0.022 | **$110** |

*Note: Adjust rates slightly to hit round numbers if needed*

---

## Adjusted Rates for Round Pricing

If you want exact round prices:

| Tier/Interval | Target Prices | Rate |
|---------------|---------------|------|
| Creator Monthly | $9, $15, $24 | Custom per qty |
| Creator Annual | $75, $125, $200 | Custom per qty |
| Studio Monthly | $49, $79, $99 | Custom per qty |
| Studio Annual | $410, $660, $830 | Custom per qty |

**Option A:** Accept non-round prices ($7.50, $44, $77)
**Option B:** Create 6 price IDs with fixed amounts (like before)
**Option C:** Adjust quantities to hit targets (e.g., 300 instead of 250)

---

## Benefits Summary

| Benefit | Impact |
|---------|--------|
| **1 product** | Clean Stripe dashboard |
| **4 price IDs** | vs 12 in named-product approach |
| **Transparent** | User sees "500 × $0.03" |
| **Flexible** | Add 600 Blots option without new price |
| **Future slider** | Let users pick exact quantity |
| **Enterprise ready** | "Need 15,000 Blots? No problem" |

---

## Quick Reference

```
PRODUCT: Myjoe Blots
├── creator_monthly: $0.03/unit (recurring)
├── creator_annual: $0.025/unit (recurring yearly)
├── studio_monthly: $0.022/unit (recurring)
├── studio_annual: $0.018/unit (recurring yearly)
├── pack_topup: $5 one-time
└── pack_boost: $20 one-time

CHECKOUT:
├── Creator-500-Monthly: price=creator_monthly, qty=500 → $15
├── Studio-2000-Monthly: price=studio_monthly, qty=2000 → $44
└── Pack-Boost: price=pack_boost, qty=1 → $20
```
