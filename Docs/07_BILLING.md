# Billing System

## Currency: Blots

### Overview

| Attribute | Value |
|-----------|-------|
| Name | Blots |
| Symbol | 🎨 (optional in UI) |
| Base value | 1 Blot ≈ $0.026 |
| Refresh | Monthly RESET (unused expire) |
| Storage | `profiles.blots` column |

### Blot Costs

| Action | Your Cost | Blots | User Pays |
|--------|-----------|-------|-----------|
| Generate 1 page | $0.186 | 12 | $0.31 |
| Edit 1 page (any type) | $0.186 | 12 | $0.31 |
| Style calibration | $0.163 | 10 | $0.26 |
| Hero reference sheet | $0.20 | 15 | $0.39 |
| Export PDF | $0.05 | 3 | $0.08 |

### Cost Estimates

| Book Type | Pages | Hero | Total Blots | User Cost |
|-----------|-------|------|-------------|-----------|
| Simple (no hero) | 20 | ❌ | ~250 | $6.50 |
| Standard | 40 | ❌ | ~490 | $12.75 |
| Standard + Hero | 40 | ✅ | ~505 | $13.15 |
| Premium + Hero + Edits | 40 | ✅ | ~600 | $15.60 |

---

## Subscription Tiers

### Plan Details

| Plan | Price | Blots/mo | Storage | ≈ Books/mo | Margin |
|------|-------|----------|---------|------------|--------|
| **Free** | $0 | 50 | 1 GB | Trial only | -$1.30 |
| **Starter** | $12/mo | 300 | 5 GB | ~0.6 | 48% |
| **Creator** | $29/mo | 900 | 15 GB | ~1.8 | 42% |
| **Pro** | $79/mo | 2,800 | 50 GB | ~5.6 | 28% |

### Annual Pricing (16% discount)

| Plan | Monthly | Annual | Savings |
|------|---------|--------|---------|
| Starter | $12 | $120/yr ($10/mo) | $24 |
| Creator | $29 | $290/yr ($24.17/mo) | $58 |
| Pro | $79 | $790/yr ($65.83/mo) | $158 |

---

## Stripe Integration

### Architecture

```
User clicks "Upgrade"
        │
        ▼
┌───────────────────┐
│ POST /api/billing │
│     /checkout     │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Create Stripe    │
│ Checkout Session  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   Return URL to   │
│   checkout.stripe │
└─────────┬─────────┘
          │
          ▼
    User completes
    payment on Stripe
          │
          ▼
┌───────────────────┐
│  Stripe Webhook   │
│ checkout.session  │
│    .completed     │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   Update profile  │
│  plan + blots     │
└───────────────────┘
```

### Stripe Product Setup

```
Product: "Myjoe Subscription"
├── Price: starter_monthly
│   └── $12/month, quantity: 300 (Blots)
├── Price: starter_yearly
│   └── $120/year, quantity: 300 (Blots)
├── Price: creator_monthly
│   └── $29/month, quantity: 900 (Blots)
├── Price: creator_yearly
│   └── $290/year, quantity: 900 (Blots)
├── Price: pro_monthly
│   └── $79/month, quantity: 2800 (Blots)
└── Price: pro_yearly
    └── $790/year, quantity: 2800 (Blots)
```

### Price IDs (Configure in env)

```bash
STRIPE_PRICE_STARTER_MONTHLY=price_xxx
STRIPE_PRICE_STARTER_YEARLY=price_xxx
STRIPE_PRICE_CREATOR_MONTHLY=price_xxx
STRIPE_PRICE_CREATOR_YEARLY=price_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
```

### Checkout Session

```typescript
// src/server/billing/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface CheckoutParams {
  userId: string;
  email: string;
  plan: 'starter' | 'creator' | 'pro';
  interval: 'monthly' | 'yearly';
}

export async function createCheckoutSession(params: CheckoutParams): Promise<string> {
  const { userId, email, plan, interval } = params;
  
  const priceId = getPriceId(plan, interval);
  
  // Get or create Stripe customer
  let customerId = await getStripeCustomerId(userId);
  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });
    customerId = customer.id;
    await updateStripeCustomerId(userId, customerId);
  }
  
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
    metadata: { userId, plan },
  });
  
  return session.url!;
}

function getPriceId(plan: string, interval: string): string {
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${interval.toUpperCase()}`;
  return process.env[key]!;
}
```

### Webhook Handler

```typescript
// src/app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PLAN_BLOTS: Record<string, number> = {
  starter: 300,
  creator: 900,
  pro: 2800,
};

const PLAN_STORAGE: Record<string, number> = {
  starter: 5 * 1024 * 1024 * 1024,    // 5 GB
  creator: 15 * 1024 * 1024 * 1024,   // 15 GB
  pro: 50 * 1024 * 1024 * 1024,       // 50 GB
};

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
      break;
      
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;
      
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;
      
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
      
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
  }
  
  return Response.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan as string;
  
  if (!userId || !plan) return;
  
  await updateProfile(userId, {
    plan,
    blots: PLAN_BLOTS[plan],
    storage_limit_bytes: PLAN_STORAGE[plan],
    stripe_subscription_id: session.subscription as string,
    blots_reset_at: getNextResetDate(),
  });
  
  // Send welcome email
  await sendEmail({
    to: session.customer_email!,
    template: 'subscription-welcome',
    data: { plan },
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Monthly renewal - RESET blots to plan amount
  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  );
  const customerId = invoice.customer as string;
  const userId = await getUserIdByStripeCustomer(customerId);
  
  if (!userId) return;
  
  const plan = getPlanFromSubscription(subscription);
  
  await updateProfile(userId, {
    blots: PLAN_BLOTS[plan], // RESET, not add
    blots_reset_at: getNextResetDate(),
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const userId = await getUserIdByStripeCustomer(customerId);
  
  if (!userId) return;
  
  // Flag account, send email
  await updateProfile(userId, {
    payment_failed_at: new Date().toISOString(),
  });
  
  await sendEmail({
    to: invoice.customer_email!,
    template: 'payment-failed',
    data: { invoiceUrl: invoice.hosted_invoice_url },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const userId = await getUserIdByStripeCustomer(customerId);
  
  if (!userId) return;
  
  // Downgrade to free
  await updateProfile(userId, {
    plan: 'free',
    blots: 50,
    storage_limit_bytes: 1 * 1024 * 1024 * 1024, // 1 GB
    stripe_subscription_id: null,
  });
  
  await sendEmail({
    to: subscription.customer_email,
    template: 'subscription-cancelled',
  });
}

function getNextResetDate(): string {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toISOString();
}
```

---

## Blot Management

### Spending Blots

```typescript
// src/server/billing/blots.ts

export async function spendBlots(
  userId: string,
  amount: number,
  reason: string
): Promise<void> {
  const profile = await getProfile(userId);
  
  if (profile.blots < amount) {
    throw new InsufficientBlotsError(amount, profile.blots);
  }
  
  await updateProfile(userId, {
    blots: profile.blots - amount,
  });
  
  // Log transaction for audit
  await logBlotTransaction(userId, -amount, reason);
}

export async function reserveBlots(
  userId: string,
  amount: number,
  jobId: string
): Promise<void> {
  // Atomic operation: check and reserve
  const { error } = await supabase.rpc('reserve_blots', {
    p_user_id: userId,
    p_amount: amount,
    p_job_id: jobId,
  });
  
  if (error) {
    if (error.code === 'INSUFFICIENT_BLOTS') {
      throw new InsufficientBlotsError(amount, 0);
    }
    throw error;
  }
}

export async function refundBlots(
  userId: string,
  amount: number,
  reason: string
): Promise<void> {
  await updateProfile(userId, {
    blots: supabase.raw(`blots + ${amount}`),
  });
  
  await logBlotTransaction(userId, amount, `refund: ${reason}`);
}
```

### Database Function for Atomic Reserve

```sql
CREATE OR REPLACE FUNCTION reserve_blots(
  p_user_id UUID,
  p_amount INTEGER,
  p_job_id UUID
) RETURNS VOID AS $$
DECLARE
  v_current_blots INTEGER;
BEGIN
  -- Lock row and get current blots
  SELECT blots INTO v_current_blots
  FROM profiles
  WHERE owner_id = p_user_id
  FOR UPDATE;
  
  IF v_current_blots < p_amount THEN
    RAISE EXCEPTION 'INSUFFICIENT_BLOTS';
  END IF;
  
  -- Deduct blots
  UPDATE profiles
  SET blots = blots - p_amount
  WHERE owner_id = p_user_id;
  
  -- Record in job
  UPDATE jobs
  SET blots_reserved = p_amount
  WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql;
```

---

## UI Components

### Blot Balance Display (Header)

```tsx
// src/components/features/billing/blot-display.tsx
'use client';

import { useBlots } from '@/hooks/use-blots';

export function BlotDisplay() {
  const { blots, isLoading } = useBlots();
  
  if (isLoading) {
    return <div className="h-8 w-24 bg-zinc-800 animate-pulse rounded" />;
  }
  
  const isLow = blots < 50;
  
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
      isLow ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-300'
    }`}>
      <span>🎨</span>
      <span className="font-medium">{blots.toLocaleString()}</span>
      <span className="text-sm opacity-70">Blots</span>
    </div>
  );
}
```

### Cost Preview Modal

```tsx
// src/components/features/billing/cost-preview.tsx
'use client';

interface CostPreviewProps {
  items: { label: string; blots: number }[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function CostPreview({ items, onConfirm, onCancel }: CostPreviewProps) {
  const { blots } = useBlots();
  const total = items.reduce((sum, item) => sum + item.blots, 0);
  const remaining = blots - total;
  const canAfford = remaining >= 0;
  
  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Confirm Action</h3>
      
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-zinc-400">{item.label}</span>
            <span>{item.blots} Blots</span>
          </div>
        ))}
        
        <div className="border-t border-zinc-700 pt-2 flex justify-between font-medium">
          <span>Total</span>
          <span>{total} Blots</span>
        </div>
      </div>
      
      <div className="p-3 bg-zinc-800 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Your balance</span>
          <span>{blots} Blots</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-zinc-400">After</span>
          <span className={canAfford ? 'text-green-400' : 'text-red-400'}>
            {remaining} Blots
          </span>
        </div>
      </div>
      
      {!canAfford && (
        <p className="text-sm text-red-400">
          Not enough Blots. <a href="/billing" className="underline">Upgrade your plan</a>
        </p>
      )}
      
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-zinc-700 rounded-lg hover:bg-zinc-600"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={!canAfford}
          className="flex-1 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
```

---

## Grace Period (Payment Failed)

| Day | Action |
|-----|--------|
| 0 | Payment fails, banner shown, email sent |
| 1-2 | User can still use app (existing Blots) |
| 3 | Auto-downgrade to Free tier |

```typescript
// src/server/billing/grace-period.ts

export async function checkGracePeriod(userId: string): Promise<void> {
  const profile = await getProfile(userId);
  
  if (!profile.payment_failed_at) return;
  
  const failedAt = new Date(profile.payment_failed_at);
  const daysSinceFailed = Math.floor(
    (Date.now() - failedAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceFailed >= 3) {
    // Auto-downgrade
    await updateProfile(userId, {
      plan: 'free',
      blots: Math.min(profile.blots, 50), // Keep existing but cap at 50
      storage_limit_bytes: 1 * 1024 * 1024 * 1024,
      payment_failed_at: null,
    });
  }
}
```

---

## Emails

### Templates Needed

| Template | Trigger | Content |
|----------|---------|---------|
| `subscription-welcome` | Checkout complete | Welcome, plan details |
| `payment-failed` | Invoice failed | Update card link |
| `subscription-cancelled` | Subscription deleted | Confirmation, resubscribe CTA |
| `blots-low` | < 20% remaining | Upgrade prompt |
| `blots-depleted` | 0 Blots | Upgrade prompt |

```typescript
// src/server/email/templates.tsx
import { Html, Text, Button, Section } from '@react-email/components';

export function PaymentFailedEmail({ invoiceUrl }: { invoiceUrl: string }) {
  return (
    <Html>
      <Section>
        <Text>Your payment couldn't be processed.</Text>
        <Text>
          Please update your payment method to continue using Myjoe without interruption.
          You have 3 days before your account is downgraded.
        </Text>
        <Button href={invoiceUrl}>
          Update Payment Method
        </Button>
      </Section>
    </Html>
  );
}
```
