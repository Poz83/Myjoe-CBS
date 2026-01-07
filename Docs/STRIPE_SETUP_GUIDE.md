# Stripe Setup Guide for Myjoe

> **Complete beginner's guide** — Follow these steps exactly to set up payments.

---

## Table of Contents

1. [Create Stripe Account](#step-1-create-stripe-account)
2. [Navigate the Dashboard](#step-2-navigate-the-dashboard)
3. [Get Your API Keys](#step-3-get-your-api-keys)
4. [Create Products & Prices](#step-4-create-products--prices)
5. [Set Up Webhooks](#step-5-set-up-webhooks)
6. [Configure Customer Portal](#step-6-configure-customer-portal)
7. [Test Locally](#step-7-test-locally)
8. [Go Live Checklist](#step-8-go-live-checklist)

---

## Step 1: Create Stripe Account

### 1.1 Sign Up

1. Go to **[stripe.com](https://stripe.com)**
2. Click **"Start now"** (top right)
3. Enter your email and create a password
4. Verify your email

### 1.2 Initial Setup

When prompted:
- **Country:** United Kingdom (or your country)
- **Business type:** Select "Individual" or "Company" as appropriate
- **Skip** the bank account setup for now (we'll do this before going live)

### 1.3 Stay in Test Mode

> ⚠️ **IMPORTANT:** Look at the top-right of your dashboard. You should see **"Test mode"** with a toggle. Make sure it says "Test mode" — this lets you test without real money.

```
┌─────────────────────────────────────────────┐
│  [Logo]              Test mode [ON]  [OFF]  │
│                         ↑                   │
│                  Keep this ON for now       │
└─────────────────────────────────────────────┘
```

---

## Step 2: Navigate the Dashboard

### Key Areas You'll Use

```
STRIPE DASHBOARD
│
├── Home              ← Overview of your account
├── Payments          ← See all transactions
├── Customers         ← See all customers
├── Product catalog   ← CREATE YOUR PRODUCTS HERE
├── Subscriptions     ← Manage active subscriptions
│
├── Developers        ← API KEYS & WEBHOOKS HERE
│   ├── API keys
│   ├── Webhooks
│   └── Events
│
└── Settings          ← Business settings, billing
```

---

## Step 3: Get Your API Keys

### 3.1 Find Your Keys

1. Click **"Developers"** in the left sidebar
2. Click **"API keys"**

### 3.2 You'll See Two Keys

```
┌─────────────────────────────────────────────────────────────┐
│ STANDARD KEYS                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Publishable key                                             │
│ pk_test_51ABC123...                          [Reveal] [Copy]│
│                                                             │
│ Secret key                                                  │
│ sk_test_51ABC123...                          [Reveal] [Copy]│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Copy Both Keys

Click **"Reveal"** next to Secret key, then copy both:

```bash
# Add to your .env.local file:

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...
STRIPE_SECRET_KEY=sk_test_51ABC123...
```

> **Note:** 
> - `pk_test_` = Publishable key (safe to use in browser)
> - `sk_test_` = Secret key (NEVER expose this in frontend code)

---

## Step 4: Create Products & Prices

### 4.1 Go to Product Catalog

1. Click **"Product catalog"** in left sidebar
2. Click **"+ Add product"** button

### 4.2 Create Creator Tier Product

```
┌─────────────────────────────────────────────────────────────┐
│ Add a product                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Name:         Myjoe Creator                                 │
│                                                             │
│ Description:  For publishers making 1-4 coloring books      │
│               per month. Includes commercial license.       │
│                                                             │
│ [Save product]                                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Add Creator Prices

After saving the product, click **"Add price"** and create 6 prices:

#### Price 1: Creator 250 Monthly
```
Price:          $9.00
Billing period: Monthly (Recurring)
[Click "Add price"]

After creating, click the price to add metadata:
├── Key: tier      Value: creator
├── Key: blots     Value: 250
└── Key: storage_gb Value: 25

SAVE THE PRICE ID: price_1ABC... (copy this!)
```

#### Price 2: Creator 250 Yearly
```
Price:          $90.00
Billing period: Yearly (Recurring)
Metadata: tier=creator, blots=250, storage_gb=25
```

#### Price 3: Creator 500 Monthly
```
Price:          $15.00
Billing period: Monthly
Metadata: tier=creator, blots=500, storage_gb=25
```

#### Price 4: Creator 500 Yearly
```
Price:          $150.00
Billing period: Yearly
Metadata: tier=creator, blots=500, storage_gb=25
```

#### Price 5: Creator 800 Monthly
```
Price:          $24.00
Billing period: Monthly
Metadata: tier=creator, blots=800, storage_gb=25
```

#### Price 6: Creator 800 Yearly
```
Price:          $240.00
Billing period: Yearly
Metadata: tier=creator, blots=800, storage_gb=25
```

### 4.4 Create Studio Tier Product

Click **"+ Add product"** again:

```
Name:        Myjoe Studio
Description: For power users and agencies. Includes priority support.
```

Add 6 prices:

| Price | Amount | Billing | Metadata |
|-------|--------|---------|----------|
| Studio 2000 Monthly | $49 | Monthly | tier=studio, blots=2000, storage_gb=50 |
| Studio 2000 Yearly | $490 | Yearly | tier=studio, blots=2000, storage_gb=50 |
| Studio 3500 Monthly | $79 | Monthly | tier=studio, blots=3500, storage_gb=50 |
| Studio 3500 Yearly | $790 | Yearly | tier=studio, blots=3500, storage_gb=50 |
| Studio 5000 Monthly | $99 | Monthly | tier=studio, blots=5000, storage_gb=50 |
| Studio 5000 Yearly | $990 | Yearly | tier=studio, blots=5000, storage_gb=50 |

### 4.5 Create Blot Packs Product

Click **"+ Add product"**:

```
Name:        Myjoe Blot Packs
Description: One-time Blot purchases that never expire.
```

Add 2 prices (these are **one-time**, not recurring):

#### Top-Up Pack
```
Price:      $5.00
Type:       One time (NOT recurring)
Metadata:
├── pack_id: topup
├── blots: 100
└── type: blot_pack
```

#### Boost Pack
```
Price:      $20.00
Type:       One time
Metadata:
├── pack_id: boost
├── blots: 500
└── type: blot_pack
```

### 4.6 Collect All Price IDs

After creating everything, go back to each price and copy its ID:

```bash
# Add ALL of these to .env.local:

# Creator Prices
STRIPE_PRICE_CREATOR_250_MONTHLY=price_1ABC...
STRIPE_PRICE_CREATOR_250_YEARLY=price_1DEF...
STRIPE_PRICE_CREATOR_500_MONTHLY=price_1GHI...
STRIPE_PRICE_CREATOR_500_YEARLY=price_1JKL...
STRIPE_PRICE_CREATOR_800_MONTHLY=price_1MNO...
STRIPE_PRICE_CREATOR_800_YEARLY=price_1PQR...

# Studio Prices
STRIPE_PRICE_STUDIO_2000_MONTHLY=price_1STU...
STRIPE_PRICE_STUDIO_2000_YEARLY=price_1VWX...
STRIPE_PRICE_STUDIO_3500_MONTHLY=price_1YZA...
STRIPE_PRICE_STUDIO_3500_YEARLY=price_1BCD...
STRIPE_PRICE_STUDIO_5000_MONTHLY=price_1EFG...
STRIPE_PRICE_STUDIO_5000_YEARLY=price_1HIJ...

# Pack Prices
STRIPE_PRICE_TOPUP=price_1KLM...
STRIPE_PRICE_BOOST=price_1NOP...
```

---

## Step 5: Set Up Webhooks

Webhooks tell your app when payments happen.

### 5.1 Create Webhook Endpoint

1. Click **"Developers"** → **"Webhooks"**
2. Click **"Add endpoint"**

```
┌─────────────────────────────────────────────────────────────┐
│ Add webhook endpoint                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Endpoint URL:                                               │
│ https://myjoe.app/api/webhooks/stripe                       │
│                                                             │
│ Description:                                                │
│ Myjoe production webhook                                    │
│                                                             │
│ [Select events to listen to]                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Select Events

Click **"Select events"** and check these boxes:

```
✅ checkout.session.completed
✅ invoice.payment_succeeded  
✅ invoice.payment_failed
✅ customer.subscription.updated
✅ customer.subscription.deleted
```

### 5.3 Get Webhook Secret

After creating the webhook:

1. Click on your new webhook endpoint
2. Click **"Reveal"** next to "Signing secret"
3. Copy the secret:

```bash
# Add to .env.local:
STRIPE_WEBHOOK_SECRET=whsec_ABC123...
```

---

## Step 6: Configure Customer Portal

The Customer Portal lets users manage their own subscriptions.

### 6.1 Enable Portal

1. Click **"Settings"** (gear icon)
2. Click **"Billing"** → **"Customer portal"**
3. Click **"Activate link"**

### 6.2 Configure Features

Enable these options:

```
✅ View invoice history
✅ Update payment methods
✅ Update subscriptions
   ✅ Allow customers to switch plans
   ✅ Prorate subscription changes
✅ Cancel subscriptions
   ○ Cancel immediately
   ● Cancel at end of billing period  ← Choose this
```

### 6.3 Add Your Products

Scroll down to **"Products"** section:
1. Click **"Add products"**
2. Select your Myjoe Creator and Myjoe Studio products
3. Save

---

## Step 7: Test Locally

### 7.1 Install Stripe CLI

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
```bash
scoop install stripe
```

**Linux:**
```bash
# Download from https://github.com/stripe/stripe-cli/releases
```

### 7.2 Login to Stripe CLI

```bash
stripe login
```

This opens your browser to authenticate.

### 7.3 Forward Webhooks to Localhost

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see:

```
> Ready! Your webhook signing secret is whsec_LOCAL123...
```

**Copy this local webhook secret** — use it in `.env.local` for testing:

```bash
# For LOCAL testing only:
STRIPE_WEBHOOK_SECRET=whsec_LOCAL123...
```

### 7.4 Test with Test Cards

In test mode, use these card numbers:

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Declined |
| `4000 0025 0000 3155` | ⚠️ Requires authentication |
| `4000 0000 0000 9995` | ❌ Insufficient funds |

**Expiry:** Any future date (e.g., 12/34)
**CVC:** Any 3 digits (e.g., 123)
**Postcode:** Any valid postcode

### 7.5 Trigger Test Events

In a separate terminal:

```bash
# Test successful checkout
stripe trigger checkout.session.completed

# Test subscription renewal
stripe trigger invoice.payment_succeeded

# Test failed payment
stripe trigger invoice.payment_failed

# Test cancellation
stripe trigger customer.subscription.deleted
```

Watch your app logs to verify webhooks are received.

---

## Step 8: Go Live Checklist

### 8.1 Complete Business Verification

1. **Settings** → **Business settings**
2. Fill in all required information:
   - Business name
   - Business address
   - Business type
   - Website URL

### 8.2 Add Bank Account

1. **Settings** → **Payouts** → **Add bank account**
2. Enter your bank details
3. Verify with micro-deposits (takes 1-2 days)

### 8.3 Configure Branding

1. **Settings** → **Branding**
2. Upload your logo
3. Set your brand colors
4. Set your icon (shows on invoices)

### 8.4 Set Statement Descriptor

1. **Settings** → **Public details**
2. **Statement descriptor:** `MYJOE` (what shows on bank statements)

### 8.5 Switch to Live Mode

1. Toggle **OFF** "Test mode" (top right)
2. **YOU MUST RECREATE ALL PRODUCTS AND PRICES IN LIVE MODE**
3. Get your LIVE API keys (they start with `pk_live_` and `sk_live_`)
4. Create a new webhook endpoint for production
5. Update all environment variables in Vercel

### 8.6 Final Environment Variables

```bash
# PRODUCTION - Vercel Dashboard

# Live API Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...  # New live webhook secret

# Live Price IDs (all different from test!)
STRIPE_PRICE_CREATOR_250_MONTHLY=price_live_...
STRIPE_PRICE_CREATOR_250_YEARLY=price_live_...
# ... all other price IDs
```

---

## Quick Reference

### Your .env.local Template

```bash
# ========================================
# STRIPE CONFIGURATION
# ========================================

# API Keys (Test mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Webhook Secret (use CLI secret for local)
STRIPE_WEBHOOK_SECRET=whsec_...

# ========================================
# CREATOR TIER PRICES
# ========================================
STRIPE_PRICE_CREATOR_250_MONTHLY=price_...
STRIPE_PRICE_CREATOR_250_YEARLY=price_...
STRIPE_PRICE_CREATOR_500_MONTHLY=price_...
STRIPE_PRICE_CREATOR_500_YEARLY=price_...
STRIPE_PRICE_CREATOR_800_MONTHLY=price_...
STRIPE_PRICE_CREATOR_800_YEARLY=price_...

# ========================================
# STUDIO TIER PRICES
# ========================================
STRIPE_PRICE_STUDIO_2000_MONTHLY=price_...
STRIPE_PRICE_STUDIO_2000_YEARLY=price_...
STRIPE_PRICE_STUDIO_3500_MONTHLY=price_...
STRIPE_PRICE_STUDIO_3500_YEARLY=price_...
STRIPE_PRICE_STUDIO_5000_MONTHLY=price_...
STRIPE_PRICE_STUDIO_5000_YEARLY=price_...

# ========================================
# BLOT PACK PRICES
# ========================================
STRIPE_PRICE_TOPUP=price_...
STRIPE_PRICE_BOOST=price_...
```

### Stripe CLI Commands

```bash
# Login
stripe login

# Forward webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.deleted

# View recent events
stripe events list --limit 10

# View failed webhook deliveries
stripe events list --delivery-success=false
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Webhook not receiving | Check URL is correct, HTTPS in production |
| "No such price" error | Using test price ID in live mode (or vice versa) |
| Signature verification failed | Wrong webhook secret (test vs live vs CLI) |
| Customer already exists | Check before creating: `stripe.customers.list({ email })` |

---

## Summary

1. ✅ Create Stripe account, stay in TEST mode
2. ✅ Get API keys from Developers → API keys
3. ✅ Create 3 products with all prices + metadata
4. ✅ Create webhook endpoint, get signing secret
5. ✅ Configure customer portal
6. ✅ Test locally with Stripe CLI
7. ✅ Verify business, add bank account
8. ✅ Switch to live mode, recreate everything
9. ✅ Update Vercel env vars with live keys

**Total products:** 3 (Creator, Studio, Blot Packs)
**Total prices:** 14 (12 subscription + 2 one-time)
**Total env vars:** 17 Stripe-related

You're ready to accept payments! 🎉
