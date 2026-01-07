# Billing & Blots

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    2-TIER UNIT-BASED MODEL                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   FREE             CREATOR                STUDIO                │
│   ────             ───────                ──────                │
│   50 Blots         300/500/800            2500/4000/5000        │
│   25GB             25GB                   50GB                  │
│   3 projects       Unlimited              Unlimited             │
│   No commercial    Commercial ✅           Commercial ✅          │
│                                           Priority support      │
│                                                                 │
│   + BLOT PACKS (anytime)                                        │
│     Top-Up: 100 Blots ($5)                                      │
│     Boost: 500 Blots ($20)                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Currency: Blots

| Attribute | Value |
|-----------|-------|
| Name | Blots |
| Symbol | 🎨 (optional) |
| Display | Always in header |
| Unit Size | 100 Blots (for Stripe pricing) |

### Blot Costs

| Action | Blots | Your Cost |
|--------|-------|-----------|
| Generate 1 page | **5** | ~$0.013 |
| Edit 1 page | **5** | ~$0.013 |
| Style calibration (4 samples) | **4** | ~$0.05 |
| Hero Reference Sheet | **8** | ~$0.04 |
| Cover generation | **6** | ~$0.02 |
| Export PDF + SVG | **FREE** | ~$0.01 |

### Full 40-Page Book = **212 Blots**

| Component | Blots |
|-----------|-------|
| 40 pages @ 5 Blots | 200 |
| Style calibration | 4 |
| Hero sheet | 8 |
| Export | 0 |
| **Total** | **212** |

---

## Unit-Based Pricing Model

### Why Unit-Based?

Instead of creating separate Stripe products for each plan level:
- ❌ "Creator 300 Plan" product
- ❌ "Creator 500 Plan" product
- ❌ "Studio 2500 Plan" product

We create **ONE product** with **different rates**:
- ✅ "Myjoe Blots (100-pack)" product
- ✅ 4 price tiers (different $/unit rates)
- ✅ Checkout sends: Price ID + Quantity

### Benefits

| Benefit | Explanation |
|---------|-------------|
| **Transparency** | User sees "5 × $3.00 = $15" |
| **Flexibility** | Add new Blot levels without new products |
| **Scalability** | Slider pricing in v1.1 |
| **Enterprise ready** | "How many Blots?" becomes trivial |
| **Clean dashboard** | 1 product, 6 prices |

---

## Tier Structure

### Pricing Rates

**1 Unit = 100 Blots**

| Tier | Monthly Rate | Annual Rate | Savings |
|------|--------------|-------------|---------|
| Creator | $3.00/unit | $2.50/unit | 17% |
| Studio | $2.00/unit | $1.75/unit | 12.5% |

### Free Tier

| Attribute | Value |
|-----------|-------|
| Price | $0 |
| Blots | 50/month |
| Storage | 25 GB |
| Projects | 3 max |
| Commercial | ❌ |

### Creator Tier (Individuals)

Users select their Blot level:

| Blots | Units | Monthly | Annual | Books/Mo |
|-------|-------|---------|--------|----------|
| **300** | 3 | **$9** | $90 | ~1 |
| **500** | 5 | **$15** | $150 | ~2 |
| **800** | 8 | **$24** | $240 | ~3-4 |

**Included:**
- 25 GB storage
- Unlimited projects
- Commercial license ✅
- SVG + PDF exports

### Studio Tier (Power Users & Agencies)

| Blots | Units | Monthly | Annual | Books/Mo |
|-------|-------|---------|--------|----------|
| **2,500** | 25 | **$50** | $525 | ~11 |
| **4,000** | 40 | **$80** | $840 | ~18 |
| **5,000** | 50 | **$100** | $1,050 | ~23 |

**Included:**
- 50 GB storage
- Unlimited projects
- Commercial license ✅
- SVG + PDF exports
- Priority support ✅

---

## Blot Packs (One-Time)

| Pack | Blots | Price | Per Blot |
|------|-------|-------|----------|
| **Top-Up** 🎨 | 100 | $5 | $0.050 |
| **Boost** 🚀 | 500 | $20 | $0.040 |

### Pack Rules

1. **Never expire** — Use them whenever
2. **Consumed AFTER subscription Blots** — Subscription depletes first
3. **Stack with any tier** — Even Free users can buy packs
4. **No refunds** — Stripe handles disputes

### When to Recommend Packs

| Scenario | Recommendation |
|----------|----------------|
| Need 50 more Blots to finish | Top-Up ($5) |
| Big project this month | Boost ($20) |
| At tier ceiling, need more | Boost + consider upgrade |
| Don't want commitment | Packs only (Free + Packs) |

---

## Blot Pool Logic

### Two Separate Pools

```typescript
interface BlotBalance {
  subscription: number;  // Resets monthly
  pack: number;          // Never expires
  total: number;         // subscription + pack
}
```

### Depletion Order

**Always use subscription Blots first, then pack Blots.**

```typescript
function deductBlots(amount: number, balance: BlotBalance): BlotBalance {
  let subDeduct = Math.min(balance.subscription, amount);
  let packDeduct = amount - subDeduct;
  
  return {
    subscription: balance.subscription - subDeduct,
    pack: balance.pack - packDeduct,
    total: (balance.subscription - subDeduct) + (balance.pack - packDeduct),
  };
}
```

### Example Flow

```
MONTH 1:
├── User subscribes to Creator-500: Gets 500 subscription Blots
├── Buys Top-Up pack: +100 pack Blots
├── Total available: 600 Blots
│
├── Uses 550 Blots for projects:
│   ├── 500 from subscription (depleted)
│   └── 50 from pack (50 remaining)
│
└── End of month: 0 subscription + 50 pack = 50 total

MONTH 2:
├── Subscription resets: 500 new subscription Blots
├── Pack balance carries: 50 pack Blots
└── Total available: 550 Blots
```

---

## Subscription Behavior

### Upgrade Within Tier

```
User: Creator-300 ($9/mo) → Creator-500 ($15/mo)
Day: 15 of 30 (halfway through billing period)

Calculation:
├── Remaining days: 15
├── Prorated charge: ($15 - $9) × (15/30) = $3
├── Blot difference: 500 - 300 = 200
│
Action:
├── Charge: $3 immediately
├── Add: 200 Blots immediately
└── Next month: Full 500 Blots, $15 charge
```

### Upgrade Across Tiers

```
User: Creator-800 ($24/mo) → Studio-2500 ($50/mo)
Day: 10 of 30

Calculation:
├── Remaining days: 20
├── Prorated charge: ($50 - $24) × (20/30) = $17.33
├── Blot difference: 2500 - 800 = 1700
│
Action:
├── Charge: $17.33 immediately
├── Add: 1700 Blots immediately
├── Storage: 25GB → 50GB immediately
└── Next month: Full 2500 Blots, $50 charge
```

### Downgrade

```
User: Studio-4000 ($80/mo) → Creator-500 ($15/mo)
Day: Any

Action:
├── NO immediate change
├── Current Blots remain until period ends
├── Storage remains until period ends
│
Next billing cycle:
├── 500 Blots
├── 25GB storage
└── $15 charge
```

### Cancellation

```
User: Creator-500, cancels
Day: 15 of 30

Action:
├── Access continues until day 30
├── Subscription Blots remain usable until day 30
├── Pack Blots preserved (never lost)
│
Day 31:
├── Reverts to Free tier
├── 50 subscription Blots
├── 25GB storage (same as Creator)
├── 3 projects max (excess become read-only)
└── Pack Blots still available
```

### Payment Failure

```
Day 1: Renewal charge fails
├── Full access continues
├── Show banner: "Update your payment method"
├── Send email notification

Day 2-3: Grace period
├── Full access continues
├── Daily email reminders
├── Banner becomes more prominent

Day 4: If still failed
├── Downgrade to Free tier
├── 50 Blots
├── Send email: "Your subscription has been cancelled"
└── Pack Blots preserved
```

---

## Database Schema

### profiles Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription (2-tier model)
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'creator', 'studio')),
  plan_blots INTEGER NOT NULL DEFAULT 50,  -- Selected Blot level (300, 500, 800, etc.)
  
  -- Blot balances (separate pools)
  subscription_blots INTEGER NOT NULL DEFAULT 50,  -- Resets monthly
  pack_blots INTEGER NOT NULL DEFAULT 0,           -- Never expires
  blots_reset_at TIMESTAMPTZ,
  
  -- Stripe
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,  -- Current price ID for upgrade handling
  payment_failed_at TIMESTAMPTZ,
  
  -- Storage
  storage_used_bytes BIGINT NOT NULL DEFAULT 0,
  storage_limit_bytes BIGINT NOT NULL DEFAULT 26843545600, -- 25 GB
  
  -- Status
  disabled_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(owner_id)
);

CREATE INDEX profiles_stripe_customer_idx ON profiles(stripe_customer_id);
```

### blot_transactions Table

```sql
CREATE TABLE blot_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transaction type
  type TEXT NOT NULL CHECK (type IN (
    'subscription_reset',    -- Monthly reset
    'subscription_upgrade',  -- Mid-cycle upgrade
    'pack_purchase',         -- Bought a pack
    'generation',            -- Used for page generation
    'edit',                  -- Used for page edit
    'hero',                  -- Used for hero creation
    'calibration',           -- Used for style calibration
    'refund'                 -- Refunded (job failed)
  )),
  
  -- Amounts (positive = credit, negative = debit)
  subscription_delta INTEGER NOT NULL DEFAULT 0,
  pack_delta INTEGER NOT NULL DEFAULT 0,
  
  -- Context
  description TEXT,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  stripe_session_id TEXT,
  stripe_invoice_id TEXT,
  pack_id TEXT,  -- 'topup' or 'boost'
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX blot_transactions_owner_idx ON blot_transactions(owner_id);
CREATE INDEX blot_transactions_created_idx ON blot_transactions(created_at DESC);

-- RLS
ALTER TABLE blot_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON blot_transactions FOR SELECT
  USING (auth.uid() = owner_id);
```

### Helper Functions

```sql
-- Get total available Blots
CREATE OR REPLACE FUNCTION get_available_blots(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(subscription_blots, 0) + COALESCE(pack_blots, 0)
  FROM profiles WHERE owner_id = user_id;
$$ LANGUAGE sql STABLE;

-- Deduct Blots (subscription first, then pack)
CREATE OR REPLACE FUNCTION deduct_blots(
  user_id UUID, 
  amount INTEGER,
  tx_type TEXT DEFAULT 'generation',
  tx_description TEXT DEFAULT NULL,
  tx_job_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  profile_row profiles%ROWTYPE;
  sub_deduct INTEGER;
  pack_deduct INTEGER;
BEGIN
  -- Lock row for update
  SELECT * INTO profile_row FROM profiles WHERE owner_id = user_id FOR UPDATE;
  
  -- Check sufficient balance
  IF (profile_row.subscription_blots + profile_row.pack_blots) < amount THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate deduction split (subscription first)
  IF profile_row.subscription_blots >= amount THEN
    sub_deduct := amount;
    pack_deduct := 0;
  ELSE
    sub_deduct := profile_row.subscription_blots;
    pack_deduct := amount - sub_deduct;
  END IF;
  
  -- Update balances
  UPDATE profiles SET
    subscription_blots = subscription_blots - sub_deduct,
    pack_blots = pack_blots - pack_deduct,
    updated_at = NOW()
  WHERE owner_id = user_id;
  
  -- Log transaction
  INSERT INTO blot_transactions (owner_id, type, subscription_delta, pack_delta, description, job_id)
  VALUES (user_id, tx_type, -sub_deduct, -pack_deduct, tx_description, tx_job_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add pack Blots
CREATE OR REPLACE FUNCTION add_pack_blots(
  user_id UUID,
  amount INTEGER,
  p_pack_id TEXT,
  session_id TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET
    pack_blots = pack_blots + amount,
    updated_at = NOW()
  WHERE owner_id = user_id;
  
  INSERT INTO blot_transactions (owner_id, type, pack_delta, pack_id, stripe_session_id, description)
  VALUES (user_id, 'pack_purchase', amount, p_pack_id, session_id, 'Blot pack: ' || p_pack_id);
END;
$$ LANGUAGE plpgsql;

-- Reset subscription Blots (on renewal)
CREATE OR REPLACE FUNCTION reset_subscription_blots(
  user_id UUID,
  new_amount INTEGER,
  invoice_id TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET
    subscription_blots = new_amount,
    blots_reset_at = NOW() + INTERVAL '1 month',
    payment_failed_at = NULL,
    updated_at = NOW()
  WHERE owner_id = user_id;
  
  INSERT INTO blot_transactions (owner_id, type, subscription_delta, stripe_invoice_id, description)
  VALUES (user_id, 'subscription_reset', new_amount, invoice_id, 'Monthly subscription reset');
END;
$$ LANGUAGE plpgsql;

-- Add Blots on upgrade (difference only)
CREATE OR REPLACE FUNCTION add_upgrade_blots(
  user_id UUID,
  blot_difference INTEGER,
  invoice_id TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET
    subscription_blots = subscription_blots + blot_difference,
    updated_at = NOW()
  WHERE owner_id = user_id;
  
  INSERT INTO blot_transactions (owner_id, type, subscription_delta, stripe_invoice_id, description)
  VALUES (user_id, 'subscription_upgrade', blot_difference, invoice_id, 'Upgrade: +' || blot_difference || ' Blots');
END;
$$ LANGUAGE plpgsql;

-- Refund Blots (job failed)
CREATE OR REPLACE FUNCTION refund_blots(
  user_id UUID,
  amount INTEGER,
  p_job_id UUID,
  reason TEXT
) RETURNS VOID AS $$
BEGIN
  -- Refund to subscription pool (simpler than tracking original source)
  UPDATE profiles SET
    subscription_blots = subscription_blots + amount,
    updated_at = NOW()
  WHERE owner_id = user_id;
  
  INSERT INTO blot_transactions (owner_id, type, subscription_delta, job_id, description)
  VALUES (user_id, 'refund', amount, p_job_id, reason);
END;
$$ LANGUAGE plpgsql;
```

---

## Stripe Configuration

### Product Structure

**One Product:** `Myjoe Blots (100-pack)`

| Lookup Key | Type | Amount | Metadata |
|------------|------|--------|----------|
| `creator_monthly` | Per unit, Monthly | $3.00/unit | tier=creator, interval=monthly, blots_per_unit=100 |
| `creator_annual` | Per unit, Yearly | $2.50/unit | tier=creator, interval=yearly, blots_per_unit=100 |
| `studio_monthly` | Per unit, Monthly | $2.00/unit | tier=studio, interval=monthly, blots_per_unit=100 |
| `studio_annual` | Per unit, Yearly | $1.75/unit | tier=studio, interval=yearly, blots_per_unit=100 |
| `pack_topup` | One-time | $5.00 | type=blot_pack, pack_id=topup, blots=100 |
| `pack_boost` | One-time | $20.00 | type=blot_pack, pack_id=boost, blots=500 |

### Environment Variables

```bash
STRIPE_PRICE_CREATOR_MONTHLY=price_...
STRIPE_PRICE_CREATOR_ANNUAL=price_...
STRIPE_PRICE_STUDIO_MONTHLY=price_...
STRIPE_PRICE_STUDIO_ANNUAL=price_...
STRIPE_PRICE_PACK_TOPUP=price_...
STRIPE_PRICE_PACK_BOOST=price_...
```

### Webhook Events

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create subscription or add pack Blots |
| `invoice.payment_succeeded` | Reset subscription Blots (if renewal) |
| `invoice.payment_failed` | Set payment_failed_at timestamp |
| `customer.subscription.updated` | Handle upgrade, update plan info |
| `customer.subscription.deleted` | Downgrade to Free |

---

## Implementation

### Constants

```typescript
// src/lib/constants/billing.ts

export type Tier = 'free' | 'creator' | 'studio';
export type PackId = 'topup' | 'boost';
export type Interval = 'monthly' | 'yearly';

export const TIERS = {
  free: {
    name: 'Free',
    blots: 50,
    storageGb: 25,
    maxProjects: 3,
    commercial: false,
    prioritySupport: false,
  },
  creator: {
    name: 'Creator',
    storageGb: 25,
    maxProjects: null,
    commercial: true,
    prioritySupport: false,
    unitRate: { monthly: 3.00, yearly: 2.50 },
    blotOptions: [300, 500, 800] as const,
  },
  studio: {
    name: 'Studio',
    storageGb: 50,
    maxProjects: null,
    commercial: true,
    prioritySupport: true,
    unitRate: { monthly: 2.00, yearly: 1.75 },
    blotOptions: [2500, 4000, 5000] as const,
  },
} as const;

export const PACKS = {
  topup: { name: 'Top-Up', emoji: '🎨', blots: 100, price: 5 },
  boost: { name: 'Boost', emoji: '🚀', blots: 500, price: 20 },
} as const;

export const BLOT_COSTS = {
  generate: 5,
  edit: 5,
  calibration: 4,
  hero: 8,
  cover: 6,
  export: 0,
} as const;

export const BLOTS_PER_UNIT = 100;

// Helper: Calculate price from tier/blots/interval
export function calculatePrice(
  tier: 'creator' | 'studio',
  blots: number,
  interval: Interval
): number {
  const units = blots / BLOTS_PER_UNIT;
  const rate = TIERS[tier].unitRate[interval];
  return units * rate;
}

// Helper: Calculate units from blots
export function blotsToUnits(blots: number): number {
  return blots / BLOTS_PER_UNIT;
}

// Helper: Calculate book cost
export function calculateBookCost(
  pages: number,
  hasHero: boolean,
  hasCalibration: boolean
): number {
  let cost = pages * BLOT_COSTS.generate;
  if (hasHero) cost += BLOT_COSTS.hero;
  if (hasCalibration) cost += BLOT_COSTS.calibration;
  return cost;
}

// Stripe price ID mapping
export const STRIPE_PRICES = {
  creator: {
    monthly: process.env.STRIPE_PRICE_CREATOR_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_CREATOR_ANNUAL!,
  },
  studio: {
    monthly: process.env.STRIPE_PRICE_STUDIO_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_STUDIO_ANNUAL!,
  },
  packs: {
    topup: process.env.STRIPE_PRICE_PACK_TOPUP!,
    boost: process.env.STRIPE_PRICE_PACK_BOOST!,
  },
} as const;
```

### Checkout Functions

```typescript
// src/server/billing/stripe.ts

import Stripe from 'stripe';
import { TIERS, PACKS, STRIPE_PRICES, BLOTS_PER_UNIT } from '@/lib/constants/billing';
import type { Tier, PackId, Interval } from '@/lib/constants/billing';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function createSubscriptionCheckout(
  userId: string,
  email: string,
  tier: 'creator' | 'studio',
  blots: number,
  interval: Interval
): Promise<string> {
  const customerId = await getOrCreateCustomer(userId, email);
  const priceId = STRIPE_PRICES[tier][interval === 'yearly' ? 'yearly' : 'monthly'];
  const quantity = blots / BLOTS_PER_UNIT;  // Convert to units
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{
      price: priceId,
      quantity: quantity,
    }],
    metadata: {
      userId,
      tier,
      blots: blots.toString(),
      type: 'subscription',
    },
    subscription_data: {
      metadata: { userId, tier, blots: blots.toString() },
    },
    success_url: `${APP_URL}/billing?success=subscription`,
    cancel_url: `${APP_URL}/billing?canceled=true`,
    allow_promotion_codes: true,
  });
  
  return session.url!;
}

export async function createPackCheckout(
  userId: string,
  email: string,
  packId: PackId
): Promise<string> {
  const pack = PACKS[packId];
  const priceId = STRIPE_PRICES.packs[packId];
  
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: email,
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    metadata: {
      userId,
      packId,
      blots: pack.blots.toString(),
      type: 'blot_pack',
    },
    success_url: `${APP_URL}/billing?success=pack&blots=${pack.blots}`,
    cancel_url: `${APP_URL}/billing?canceled=true`,
  });
  
  return session.url!;
}

export async function createPortalSession(customerId: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${APP_URL}/billing`,
  });
  return session.url;
}

async function getOrCreateCustomer(userId: string, email: string): Promise<string> {
  const supabase = createServiceClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('owner_id', userId)
    .single();
  
  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }
  
  // Check if customer exists by email
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) {
    const customerId = existing.data[0].id;
    await supabase.from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('owner_id', userId);
    return customerId;
  }
  
  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });
  
  await supabase.from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('owner_id', userId);
  
  return customer.id;
}
```

---

## UI Components

### Pricing Page Structure

```tsx
// src/app/(studio)/billing/page.tsx structure

<BillingPage>
  {/* Current Balance Card */}
  <BalanceCard balance={balance} />
  
  {/* Blot Calculator */}
  <BlotCalculator onSelectPlan={handleSelect} />
  
  {/* Interval Toggle */}
  <IntervalToggle value={interval} onChange={setInterval} />
  
  {/* Tier Cards */}
  <div className="grid md:grid-cols-2 gap-6">
    <TierCard tier="creator" />
    <TierCard tier="studio" />
  </div>
  
  {/* Blot Packs */}
  <PacksSection />
</BillingPage>
```

### What User Sees at Checkout

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Myjoe Blots (100-pack)                                 │
│                                                         │
│  5 × $3.00                                              │
│                                                         │
│  Subtotal                                $15.00/month   │
│                                                         │
│  [Pay $15.00]                                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Revenue Projections

### Per-Subscriber Revenue

| Plan | Monthly | Annual (Yearly) |
|------|---------|-----------------|
| Creator 300 | $9 | $90 |
| Creator 500 | $15 | $150 |
| Creator 800 | $24 | $240 |
| Studio 2500 | $50 | $525 |
| Studio 4000 | $80 | $840 |
| Studio 5000 | $100 | $1,050 |

### Assumed Distribution

| Plan | % of Paid Users | Avg Revenue |
|------|-----------------|-------------|
| Creator 300 | 30% | $9 |
| Creator 500 | 35% | $15 |
| Creator 800 | 15% | $24 |
| Studio tiers | 20% | $70 avg |

**Blended ARPU:** ~$22/month

### Monthly Projections

| Paying Users | MRR | After Costs (~$87) | Net |
|--------------|-----|--------------------|----|
| 10 | $220 | $133 | Profitable |
| 25 | $550 | $463 | |
| 50 | $1,100 | $1,013 | |
| 100 | $2,200 | $2,113 | |
| 500 | $11,000 | $10,800* | *Costs scale |

---

## Edge Cases

### User at Tier Ceiling Needs More

```
User: Creator-800 (max Creator), needs 1000 Blots this month

Show modal:
├── "You've reached Creator's maximum"
├── Options:
│   ├── Buy Boost pack (+500) → Total: 1300 ✓
│   ├── Upgrade to Studio-2500 → Long-term solution
│   └── Wait for reset (X days)
```

### User at Absolute Ceiling (Studio-5000)

```
User: Studio-5000, still needs more

Show modal:
├── "You're on our largest plan!"
├── Options:
│   ├── Buy Boost packs (unlimited)
│   ├── Wait for reset
│   └── "Need enterprise volume? Contact us"
```

### Subscription + Pack Timing

```
Before renewal:
├── Subscription: 0 Blots
├── Pack: 100 Blots
└── Total: 100 Blots

After renewal (subscription resets):
├── Subscription: 500 Blots (fresh)
├── Pack: 100 Blots (preserved)
└── Total: 600 Blots

Pack Blots are NEVER lost on renewal or downgrade.
```

### Partial Refund on Job Failure

```
Job started: 40 pages × 5 = 200 Blots reserved
Completed: 35 pages
Failed: 5 pages

Refund: 5 × 5 = 25 Blots
└── Added back to subscription pool
```
