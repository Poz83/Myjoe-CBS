# Phase 10: Billing Implementation Prompts

## Prerequisites

Before starting Phase 10, ensure:
1. Stripe account created and in TEST mode
2. All 6 prices created in Stripe dashboard (see STRIPE_SETUP_GUIDE_FINAL.md)
3. Webhook endpoint configured
4. Environment variables set in `.env.local`

---

## Prompt 10.1: Billing Constants & Types

```
Create the billing constants and types file.

Create: src/lib/constants/billing.ts

This file should define:

1. Type definitions:
   - Tier: 'free' | 'creator' | 'studio'
   - PackId: 'topup' | 'boost'
   - Interval: 'monthly' | 'yearly'

2. BLOTS_PER_UNIT constant: 100

3. TIERS object with:
   - free: { name, blots: 50, storageGb: 25, maxProjects: 3, commercial: false, prioritySupport: false }
   - creator: { name, storageGb: 25, maxProjects: null, commercial: true, prioritySupport: false, unitRate: { monthly: 3.00, yearly: 2.50 }, blotOptions: [300, 500, 800] }
   - studio: { name, storageGb: 50, maxProjects: null, commercial: true, prioritySupport: true, unitRate: { monthly: 2.00, yearly: 1.75 }, blotOptions: [2500, 4000, 5000] }

4. PACKS object:
   - topup: { name: 'Top-Up', emoji: '🎨', blots: 100, price: 5 }
   - boost: { name: 'Boost', emoji: '🚀', blots: 500, price: 20 }

5. BLOT_COSTS object:
   - generate: 5, edit: 5, calibration: 4, hero: 8, cover: 6, export: 0

6. STRIPE_PRICES object that maps tier/interval and packs to environment variable price IDs

7. Helper functions:
   - calculatePrice(tier, blots, interval): number - calculates price from tier, blots, and interval
   - blotsToUnits(blots): number - converts blots to units (divide by 100)
   - calculateBookCost(pages, hasHero, hasCalibration): number - calculates total blots for a book

Use TypeScript with full type safety and 'as const' assertions.
```

**Test:** TypeScript compiles with no errors.

**Git:** `git add . && git commit -m "feat: add billing constants and types"`

---

## Prompt 10.2: Database Schema Updates

```
Create the database migration for the new billing schema.

Create: supabase/migrations/20250107_billing_v2.sql

The migration should:

1. Add columns to profiles table:
   - plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'creator', 'studio'))
   - plan_blots INTEGER DEFAULT 50
   - subscription_blots INTEGER DEFAULT 50
   - pack_blots INTEGER DEFAULT 0
   - blots_reset_at TIMESTAMPTZ
   - stripe_price_id TEXT
   - payment_failed_at TIMESTAMPTZ
   - storage_limit_bytes BIGINT DEFAULT 26843545600

2. Create blot_transactions table with:
   - id UUID PRIMARY KEY
   - owner_id UUID REFERENCES auth.users
   - type TEXT CHECK (valid types)
   - subscription_delta INTEGER DEFAULT 0
   - pack_delta INTEGER DEFAULT 0
   - description TEXT
   - job_id UUID
   - stripe_session_id TEXT
   - stripe_invoice_id TEXT
   - pack_id TEXT
   - created_at TIMESTAMPTZ

3. Create helper functions:
   - get_available_blots(user_id UUID) RETURNS INTEGER
   - deduct_blots(user_id, amount, tx_type, tx_description, tx_job_id) RETURNS BOOLEAN
   - add_pack_blots(user_id, amount, pack_id, session_id) RETURNS VOID
   - reset_subscription_blots(user_id, new_amount, invoice_id) RETURNS VOID
   - add_upgrade_blots(user_id, blot_difference, invoice_id) RETURNS VOID
   - refund_blots(user_id, amount, job_id, reason) RETURNS VOID

4. Add RLS policies for blot_transactions

5. Add appropriate indexes

Include comments explaining each section.
```

**Test:** Run `npx supabase db reset` and verify tables created.

**Git:** `git add . && git commit -m "feat: add billing v2 schema with Blot pools"`

---

## Prompt 10.3: Stripe Service

```
Create the Stripe service for checkout and portal sessions.

Create: src/server/billing/stripe.ts

This file should:

1. Initialize Stripe client with API version '2024-11-20.acacia'

2. Export async function createSubscriptionCheckout(userId, email, tier, blots, interval):
   - Get or create Stripe customer
   - Look up the correct price ID based on tier and interval
   - Calculate quantity (blots / 100)
   - Create checkout session in subscription mode
   - Include metadata: userId, tier, blots, type: 'subscription'
   - Set subscription_data metadata
   - Return session URL

3. Export async function createPackCheckout(userId, email, packId):
   - Get pack from PACKS constant
   - Create checkout session in payment mode
   - Include metadata: userId, packId, blots, type: 'blot_pack'
   - Return session URL

4. Export async function createPortalSession(customerId):
   - Create billing portal session
   - Return portal URL

5. Helper function getOrCreateCustomer(userId, email):
   - Check if profile has stripe_customer_id
   - If not, check if customer exists by email in Stripe
   - If not, create new customer
   - Update profile with customer ID
   - Return customer ID

Import from @/lib/constants/billing for prices and packs.
Use NEXT_PUBLIC_APP_URL for success/cancel URLs.
```

**Test:** Create a test route that calls createSubscriptionCheckout and verify it returns a valid URL.

**Git:** `git add . && git commit -m "feat: add Stripe checkout service"`

---

## Prompt 10.4: Blot Management Service

```
Create the Blot management service.

Create: src/server/billing/blots.ts

This file should:

1. Define BlotBalance interface:
   - subscription: number
   - pack: number
   - total: number
   - plan: Tier
   - planBlots: number
   - resetsAt: Date | null

2. Export async function getBlotBalance(userId): BlotBalance
   - Query profile for blot data
   - Calculate total
   - Return structured balance

3. Export async function checkBlotBalance(userId, required): boolean
   - Get available blots
   - Return whether sufficient

4. Export async function deductBlots(userId, amount, type, description, jobId?):
   - Call the database function deduct_blots
   - Return success/failure

5. Export async function addPackBlots(userId, amount, packId, sessionId):
   - Call the database function add_pack_blots

6. Export async function resetSubscriptionBlots(userId, amount, invoiceId?):
   - Call the database function reset_subscription_blots

7. Export async function addUpgradeBlots(userId, difference, invoiceId?):
   - Call the database function add_upgrade_blots

8. Export async function refundBlots(userId, amount, jobId, reason):
   - Call the database function refund_blots

Use createServiceClient from @/lib/supabase/server for database access.
Include proper error handling and logging.
```

**Test:** Call getBlotBalance and verify it returns correct structure.

**Git:** `git add . && git commit -m "feat: add Blot management service"`

---

## Prompt 10.5: Stripe Webhook Handler

```
Create the Stripe webhook handler.

Create: src/app/api/webhooks/stripe/route.ts

This file should:

1. Export async function POST(request):
   - Get raw body and signature header
   - Verify webhook signature using STRIPE_WEBHOOK_SECRET
   - Parse the event

2. Handle checkout.session.completed:
   - Check metadata.type
   - If 'subscription': 
     - Get tier, blots from metadata
     - Update profile: plan, plan_blots, subscription_blots, stripe_subscription_id, stripe_price_id
     - Calculate storage_limit_bytes based on tier
     - Log transaction
   - If 'blot_pack':
     - Get packId, blots from metadata
     - Call addPackBlots

3. Handle invoice.payment_succeeded:
   - Check if this is a renewal (not first payment)
   - Get subscription from event
   - Get quantity and price metadata
   - Calculate blots (quantity * 100)
   - Call resetSubscriptionBlots

4. Handle invoice.payment_failed:
   - Update profile.payment_failed_at = NOW()
   - (Optionally send email notification)

5. Handle customer.subscription.updated:
   - Get previous and new quantities
   - If upgrade: calculate blot difference, call addUpgradeBlots
   - Update profile: plan_blots, stripe_price_id
   - If tier changed, update storage_limit_bytes

6. Handle customer.subscription.deleted:
   - Update profile to free tier
   - Set plan_blots = 50, subscription_blots = 50
   - Keep pack_blots unchanged
   - Set storage_limit_bytes to 25GB

Return { received: true } with status 200.
Include error handling that returns 200 (to prevent retries) but logs errors.
```

**Test:** Use Stripe CLI to trigger events: `stripe trigger checkout.session.completed`

**Git:** `git add . && git commit -m "feat: add Stripe webhook handler"`

---

## Prompt 10.6: Billing API Routes

```
Create the billing API routes.

Create the following files:

1. src/app/api/billing/balance/route.ts
   - GET: Return BlotBalance plus storage info
   - Include: subscription, pack, total, plan, planBlots, resetsAt, storage { usedBytes, limitBytes, usedPercent }

2. src/app/api/billing/checkout/route.ts
   - POST: Create subscription checkout
   - Body: { tier, blots, interval }
   - Validate tier is 'creator' or 'studio'
   - Validate blots is valid for tier
   - Validate interval is 'monthly' or 'yearly'
   - Return { checkoutUrl }

3. src/app/api/billing/pack-checkout/route.ts
   - POST: Create pack checkout
   - Body: { packId }
   - Validate packId is 'topup' or 'boost'
   - Return { checkoutUrl }

4. src/app/api/billing/portal/route.ts
   - POST: Create customer portal session
   - Check user has stripe_customer_id
   - Return { portalUrl }

5. src/app/api/billing/transactions/route.ts
   - GET: Return transaction history
   - Query params: limit (default 20), offset (default 0)
   - Return { transactions, total, hasMore }

All routes should:
- Verify authentication
- Use correlation IDs
- Handle errors consistently
- Return appropriate status codes
```

**Test:** Call GET /api/billing/balance and verify response structure.

**Git:** `git add . && git commit -m "feat: add billing API routes"`

---

## Prompt 10.7: Billing Page UI

```
Create the billing page UI.

Create: src/app/(studio)/billing/page.tsx

The page should include:

1. Header section with "Billing & Blots" title

2. BalanceCard component showing:
   - Total Blots available (large number)
   - Breakdown: X subscription + Y pack
   - Current plan name and Blot level
   - Days until reset
   - Storage usage bar

3. BlotCalculator component (optional - can be collapsed):
   - "How many books do you make?" selector
   - Shows recommended plan based on selection

4. IntervalToggle component:
   - Monthly / Yearly toggle
   - Show savings badge for yearly

5. Tier cards grid (2 columns):
   - Creator card with Blot dropdown (300, 500, 800)
   - Studio card with Blot dropdown (2500, 4000, 5000)
   - Each shows: price, Blots, storage, features
   - Current plan highlighted
   - "Get Plan" button (or "Current Plan" if active)

6. Packs section:
   - Top-Up card: 100 Blots, $5
   - Boost card: 500 Blots, $20
   - "Buy" button for each

7. Manage Subscription section (if subscribed):
   - "Manage Subscription" button → portal

Use TanStack Query to fetch balance.
Handle loading and error states.
Show success toast on return from checkout.
```

**Test:** Navigate to /billing and verify all sections render correctly.

**Git:** `git add . && git commit -m "feat: add billing page UI"`

---

## Prompt 10.8: Out of Blots Modal

```
Create the Out of Blots modal and hook.

1. Create: src/components/features/billing/out-of-blots-modal.tsx

The modal should show:
- "Not enough Blots" title with warning icon
- Current balance vs required amount
- Days until subscription resets
- Recommended action:
  - If need <= 100: Suggest Top-Up pack
  - If need > 100: Suggest Boost pack
- "Upgrade Plan" link if not on Studio
- "Buy Pack" button
- "Cancel" button

2. Create: src/hooks/use-blot-check.ts

Export function useBlotCheck() that returns:
- checkBlots(required: number): boolean - returns false if insufficient, shows modal
- modalProps: props to spread on OutOfBlotsModal

Usage example:
```tsx
const { checkBlots, modalProps } = useBlotCheck();

const handleGenerate = () => {
  if (!checkBlots(212)) return;  // Shows modal if insufficient
  // proceed with generation
};

<OutOfBlotsModal {...modalProps} />
```

The hook should:
- Get current balance from useBlotBalance()
- Track modal open state
- Track required amount
- Calculate best pack recommendation
- Provide onBuyPack and onUpgrade handlers
```

**Test:** Trigger the modal with insufficient Blots and verify it shows correct info.

**Git:** `git add . && git commit -m "feat: add Out of Blots modal and hook"`

---

## Phase 10 Complete Checklist

```
□ 10.1 Billing constants & types
□ 10.2 Database schema migration
□ 10.3 Stripe checkout service
□ 10.4 Blot management service
□ 10.5 Webhook handler
□ 10.6 API routes
□ 10.7 Billing page UI
□ 10.8 Out of Blots modal

Integration Tests:
□ Create subscription checkout → Stripe → webhook → profile updated
□ Buy pack → Stripe → webhook → pack_blots increased
□ Use Blots → deduct_blots → transaction logged
□ Subscription renewal → subscription_blots reset, pack_blots preserved
□ Upgrade mid-cycle → difference Blots added
□ Cancel subscription → downgrade to Free, pack_blots preserved
□ Payment failure → payment_failed_at set, grace period starts
```

---

## Environment Variables Checklist

Ensure all these are in `.env.local`:

```bash
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Prices (from Stripe dashboard)
STRIPE_PRICE_CREATOR_MONTHLY=price_...
STRIPE_PRICE_CREATOR_ANNUAL=price_...
STRIPE_PRICE_STUDIO_MONTHLY=price_...
STRIPE_PRICE_STUDIO_ANNUAL=price_...
STRIPE_PRICE_PACK_TOPUP=price_...
STRIPE_PRICE_PACK_BOOST=price_...
```

---

## Testing with Stripe CLI

```bash
# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test checkout completed
stripe trigger checkout.session.completed

# Test subscription renewal
stripe trigger invoice.payment_succeeded

# Test payment failure
stripe trigger invoice.payment_failed

# Test subscription cancelled
stripe trigger customer.subscription.deleted
```

---

## Final Git Tag

After all prompts complete:

```bash
git tag -a v0.10.0 -m "Phase 10: Billing system with unit-based pricing"
git push origin v0.10.0
```
