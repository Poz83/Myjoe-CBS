# Stripe Setup Guide

## Overview

This guide will help you set up Stripe in test mode for the Myjoe billing system.

## Step 1: Create Stripe Products

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/products)
2. Make sure you're in **Test mode** (toggle in top right)
3. Click **"+ Add product"**

### Create Product: "Myjoe Subscription"

Create **6 prices** for this product:

| Plan | Interval | Price | Price ID Variable |
|------|----------|------|-------------------|
| Starter | Monthly | $12/month | `STRIPE_PRICE_STARTER_MONTHLY` |
| Starter | Yearly | $120/year | `STRIPE_PRICE_STARTER_YEARLY` |
| Creator | Monthly | $29/month | `STRIPE_PRICE_CREATOR_MONTHLY` |
| Creator | Yearly | $290/year | `STRIPE_PRICE_CREATOR_YEARLY` |
| Pro | Monthly | $79/month | `STRIPE_PRICE_PRO_MONTHLY` |
| Pro | Yearly | $790/year | `STRIPE_PRICE_PRO_YEARLY` |

**For each price:**
1. Set the price amount
2. Set billing period (monthly or yearly)
3. Copy the **Price ID** (starts with `price_`)
4. Add it to `.env.local`:

```bash
STRIPE_PRICE_STARTER_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_STARTER_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_CREATOR_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_CREATOR_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_PRO_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_PRO_YEARLY=price_xxxxxxxxxxxxx
```

## Step 2: Set Up Webhook Endpoint

### Option A: Local Development (Stripe CLI)

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Copy the webhook signing secret (starts with `whsec_`)
5. Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx`

### Option B: Production/Staging

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **"+ Add endpoint"**
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx`

## Step 3: Enable Billing Portal

1. Go to [Stripe Dashboard → Settings → Billing → Customer portal](https://dashboard.stripe.com/test/settings/billing/portal)
2. Click **"Activate test link"**
3. Configure portal settings:
   - Allow customers to update payment methods
   - Allow customers to cancel subscriptions
   - Set cancellation behavior (immediate or end of period)

## Step 4: Test Cards

Use these test card numbers in Stripe Checkout:

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | 3D Secure authentication |

- **Expiry**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

## Step 5: Verify Setup

1. Check `.env.local` has all required variables:
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_STARTER_MONTHLY=price_...
   STRIPE_PRICE_STARTER_YEARLY=price_...
   STRIPE_PRICE_CREATOR_MONTHLY=price_...
   STRIPE_PRICE_CREATOR_YEARLY=price_...
   STRIPE_PRICE_PRO_MONTHLY=price_...
   STRIPE_PRICE_PRO_YEARLY=price_...
   ```

2. Test checkout flow:
   - Call `POST /api/billing/checkout` with `{ plan: 'starter', interval: 'monthly' }`
   - Complete checkout with test card `4242 4242 4242 4242`
   - Verify webhook updates profile in database

3. Test webhook locally:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

## API Endpoints

### Create Checkout Session
```typescript
POST /api/billing/checkout
Body: { plan: 'starter' | 'creator' | 'pro', interval: 'monthly' | 'yearly' }
Response: { url: string }
```

### Get Balance
```typescript
GET /api/billing/balance
Response: { blots: number, plan: string, resetsAt: string, storageUsed: number, storageLimit: number }
```

### Create Portal Session
```typescript
POST /api/billing/portal
Response: { url: string }
```

## Webhook Events Handled

1. **checkout.session.completed**: Updates profile with plan, blots, and storage
2. **invoice.payment_succeeded**: Resets blots to plan amount (monthly renewal)
3. **customer.subscription.deleted**: Downgrades user to free tier

## Troubleshooting

### Webhook signature verification fails
- Ensure `STRIPE_WEBHOOK_SECRET` matches the endpoint's signing secret
- For local testing, use the secret from `stripe listen` command

### Price ID not found error
- Verify all price IDs are set in `.env.local`
- Check price IDs match the ones in Stripe Dashboard
- Ensure you're using test mode price IDs (not live mode)

### Customer not found
- Check that `stripe_customer_id` is saved in profiles table after checkout
- Verify webhook is receiving `checkout.session.completed` event
