# Stripe Setup (Corbin's Unit-Based Method)

> **One Product, Four Prices, Infinite Flexibility**
> 
> Semi-Aggressive Pricing with 20% Annual Discount

---

## The Method

Instead of creating separate products for each plan:
- "Creator 500 Plan" product
- "Creator 1000 Plan" product
- "Studio 7500 Plan" product

Create ONE product with FOUR price rates:
- "Myjoe Blots (100-pack)" product
- 4 price IDs (different per-unit rates)
- Checkout sends: Price ID + Quantity

---

## Pricing Structure

### Unit Rates (Per 100 Blots)

| Tier | Monthly | Annual | Discount |
|------|---------|--------|----------|
| Creator | $1.60 | $1.28 | 20% |
| Studio | $1.00 | $0.80 | 20% |

### Resulting Prices

| Tier | Blots | Monthly | Annual/mo | Books/mo |
|------|-------|---------|-----------|----------|
| **Free** | 75 | $0 | $0 | Trial |
| Creator | 500 | $8 | $6.40 | ~2 |
| Creator | 1,000 | $16 | $12.80 | ~4 |
| Creator | 2,000 | $32 | $25.60 | ~9 |
| Creator | 3,000 | $48 | $38.40 | ~14 |
| Creator | 4,500 | $72 | $57.60 | ~21 (CEILING) |
| Studio | 7,500 | $75 | $60 | ~35 |
| Studio | 10,000 | $100 | $80 | ~47 |
| Studio | 15,000 | $150 | $120 | ~70 |

### Upgrade Psychology

```
Creator 4500 ($72) --> Studio 7500 ($75)
                       |
            Only $3 more for 3,000 extra blots!
            (67% more blots for 4% more cost)
```

---

## Step 1: Product Already Created

Product exists in Stripe:
- **Name:** Myjoe Blots (100-pack)
- **ID:** prod_TkbaBjo3CzwutD
- **Type:** Service

---

## Step 2: Price IDs (Created)

### Creator Tier

```
creator_monthly ($1.60/unit):
  ID: price_1Sn7ZDRb0thGyayr2gQNFGlL
  Type: Recurring monthly
  
creator_annual ($1.28/unit):
  ID: price_1Sn7ZDRb0thGyayrokJSnZFC
  Type: Recurring yearly
```

### Studio Tier

```
studio_monthly ($1.00/unit):
  ID: price_1Sn7ZDRb0thGyayrnIANu0F8
  Type: Recurring monthly
  
studio_annual ($0.80/unit):
  ID: price_1Sn7ZDRb0thGyayrWRlIdXdl
  Type: Recurring yearly
```

---

## Step 3: Environment Variables

```bash
# Stripe Price IDs (Semi-Aggressive Pricing)
STRIPE_PRICE_CREATOR_MONTHLY=price_1Sn7ZDRb0thGyayr2gQNFGlL
STRIPE_PRICE_CREATOR_ANNUAL=price_1Sn7ZDRb0thGyayrokJSnZFC
STRIPE_PRICE_STUDIO_MONTHLY=price_1Sn7ZDRb0thGyayrnIANu0F8
STRIPE_PRICE_STUDIO_ANNUAL=price_1Sn7ZDRb0thGyayrWRlIdXdl
```

---

## Step 4: Checkout Code

```typescript
// src/lib/constants/index.ts

export const TIERS = {
  free: {
    name: 'Free',
    blots: 75,
    commercial: false,
    commercialProjectsAllowed: 1, // One trial
    watermark: true,
  },
  creator: {
    name: 'Creator',
    commercial: true,
    watermark: false,
    unitRate: { monthly: 1.60, yearly: 1.28 },
    blotOptions: [500, 1000, 2000, 3000, 4500],
  },
  studio: {
    name: 'Studio',
    commercial: true,
    watermark: false,
    unitRate: { monthly: 1.00, yearly: 0.80 },
    blotOptions: [7500, 10000, 15000],
  },
};

export const BLOTS_PER_UNIT = 100;
```

```typescript
// src/server/billing/stripe.ts

export async function createSubscriptionCheckout(
  userId: string,
  email: string,
  tier: 'creator' | 'studio',
  blots: number,
  interval: 'monthly' | 'yearly'
): Promise<string> {
  const { STRIPE_PRICES, BLOTS_PER_UNIT } = await getStripeConfig();
  const customerId = await getOrCreateCustomer(userId, email);
  const priceId = STRIPE_PRICES[tier][interval];
  const quantity = blots / BLOTS_PER_UNIT; // e.g., 500 blots = 5 units
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity }],
    metadata: { userId, tier, blots: blots.toString() },
    subscription_data: {
      metadata: { userId, tier, blots: blots.toString() },
    },
    success_url: `${APP_URL}/studio/settings?tab=billing&success=subscription`,
    cancel_url: `${APP_URL}/studio/settings?tab=billing&canceled=true`,
    allow_promotion_codes: true,
  });
  
  return session.url!;
}
```

---

## What Users See at Checkout

```
+-----------------------------------------------------+
|                                                     |
|  Myjoe Blots (100-pack)                             |
|                                                     |
|  10 x $1.60                                         |
|                                                     |
|  Subtotal                              $16.00/mo    |
|                                                     |
|  [Pay $16.00]                                       |
|                                                     |
+-----------------------------------------------------+
```

**Transparency:** User sees exactly what they're buying.

---

## Free Tier Configuration

```
FREE TIER:
+-- 75 blots (15 pages worth)
+-- Personal use only
+-- 1 commercial project trial (for KDP testing)
+-- Watermark on exports
+-- 3 projects max
+-- No credit card required
```

### Why This Free Tier Works

1. **Hook them with the magic** - Enough to experience hero consistency
2. **Clear upgrade path** - Commercial use requires Creator ($8+)
3. **1 commercial trial** - Let them test with real KDP before paying
4. **Watermark** - Brand visibility + clear upgrade incentive

---

## Webhook Events Required

```typescript
// Events to listen for:
- checkout.session.completed  // New subscription
- invoice.payment_succeeded   // Monthly renewal (reset blots)
- invoice.payment_failed      // Payment issues
- customer.subscription.updated // Mid-cycle upgrade
- customer.subscription.deleted // Cancellation
```

### customer.subscription.updated Handler

Handles mid-cycle upgrades (the key to Corbin's method):

```typescript
case 'customer.subscription.updated': {
  const subscription = event.data.object;
  const previousAttributes = event.data.previous_attributes;
  
  if (previousAttributes?.items) {
    const oldQty = previousAttributes.items.data?.[0]?.quantity || 0;
    const newQty = subscription.items.data?.[0]?.quantity || 0;
    
    if (newQty > oldQty) {
      // UPGRADE: Add blot difference immediately
      const blotDiff = (newQty - oldQty) * BLOTS_PER_UNIT;
      await addBlotsToUser(userId, blotDiff);
    }
    // DOWNGRADE: Just update plan_blots, current blots stay until reset
  }
}
```

---

## Benefits Summary

| Benefit | Impact |
|---------|--------|
| **1 product** | Clean Stripe dashboard |
| **4 price IDs** | Simple configuration |
| **Transparent** | User sees "10 x $1.60" |
| **Flexible** | Add 600 Blots option without new price |
| **Upgrade-friendly** | Dropdown lets users scale easily |
| **No packs** | Simpler codebase, forces proper upgrades |

---

## Competitive Positioning

| Platform | Entry Price | Credits | Myjoe Entry | Winner |
|----------|-------------|---------|-------------|--------|
| ColorBliss | $7 | 250 | $8 / 500 | Myjoe (2x value) |
| ColoringBook AI | $6.99 | 100 | $8 / 500 | Myjoe (5x value) |
| Colorvia | $9.99 | 100 | $8 / 500 | Myjoe (price + value) |

**Plus:** Only Myjoe has hero consistency across all pages.

---

## Quick Reference

```
PRODUCT: Myjoe Blots (100-pack)
  +-- creator_monthly: $1.60/unit (recurring)
  +-- creator_annual:  $1.28/unit (recurring yearly)
  +-- studio_monthly:  $1.00/unit (recurring)
  +-- studio_annual:   $0.80/unit (recurring yearly)

CHECKOUT EXAMPLES:
  +-- Creator-1000-Monthly: price=creator_monthly, qty=10 --> $16
  +-- Studio-7500-Annual:   price=studio_annual, qty=75 --> $60/mo
  
FREE TIER:
  +-- 75 blots
  +-- Personal use only
  +-- 1 commercial project trial
  +-- Watermark on exports
```
