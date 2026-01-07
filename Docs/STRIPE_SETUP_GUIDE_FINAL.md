# Stripe Setup Guide — Myjoe Unit-Based Pricing

> **Complete step-by-step guide** for setting up Stripe with the 100-Blot unit pricing model.

---

## Table of Contents

1. [Create & Configure Stripe Account](#part-1-create--configure-stripe-account)
2. [Understand Test vs Live Mode](#part-2-understand-test-vs-live-mode)
3. [Get Your API Keys](#part-3-get-your-api-keys)
4. [Create the Blots Product](#part-4-create-the-blots-product)
5. [Create Subscription Prices](#part-5-create-subscription-prices)
6. [Create Pack Prices](#part-6-create-pack-prices)
7. [Set Up Webhooks](#part-7-set-up-webhooks)
8. [Configure Customer Portal](#part-8-configure-customer-portal)
9. [Test Locally with Stripe CLI](#part-9-test-locally-with-stripe-cli)
10. [Environment Variables](#part-10-environment-variables)
11. [Go Live Checklist](#part-11-go-live-checklist)

---

## Pricing Overview

### The Unit Model

**1 Unit = 100 Blots**

| Tier | Rate per Unit | Quantities |
|------|---------------|------------|
| Creator Monthly | $3.00 | 3, 5, 8 units |
| Creator Annual | $2.50 | 3, 5, 8 units |
| Studio Monthly | $2.00 | 25, 40, 50 units |
| Studio Annual | $1.75 | 25, 40, 50 units |

### Resulting Prices

| Plan | Units | Blots | Monthly | Annual |
|------|-------|-------|---------|--------|
| Creator S | 3 | 300 | $9 | $90 |
| Creator M | 5 | 500 | $15 | $150 |
| Creator L | 8 | 800 | $24 | $240 |
| Studio S | 25 | 2,500 | $50 | $525 |
| Studio M | 40 | 4,000 | $80 | $840 |
| Studio L | 50 | 5,000 | $100 | $1,050 |

### Blot Packs (One-Time)

| Pack | Blots | Price |
|------|-------|-------|
| Top-Up | 100 | $5 |
| Boost | 500 | $20 |

---

## Part 1: Create & Configure Stripe Account

### 1.1 Sign Up

1. Go to **[dashboard.stripe.com](https://dashboard.stripe.com)**
2. Click **"Create account"** or **"Sign up"**
3. Enter your email address
4. Create a strong password
5. Verify your email (check inbox, click link)

### 1.2 Initial Account Setup

After verifying email, you'll see the Stripe Dashboard. Before doing anything:

1. Look at the **top-left corner** — you should see your account name
2. Look at the **top-right corner** — you should see **"Test mode"** toggle

```
┌──────────────────────────────────────────────────────────────────┐
│ 🏠 Stripe    [Your Account ▼]              [Test mode: ON 🔘]    │
├──────────────────────────────────────────────────────────────────┤
```

### 1.3 Set Your Business Name

1. Click your **account name** (top-left dropdown)
2. Click **"Settings"**
3. Under **"Business settings"** → **"Account details"**
4. Set:
   - **Business name:** `Myjoe`
   - **Country:** United Kingdom
   - **Business website:** `https://myjoe.app`

---

## Part 2: Understand Test vs Live Mode

### What's the Difference?

| Aspect | Test Mode | Live Mode |
|--------|-----------|-----------|
| Real money | ❌ No | ✅ Yes |
| Real cards | ❌ No (use test cards) | ✅ Yes |
| API keys | Start with `pk_test_`, `sk_test_` | Start with `pk_live_`, `sk_live_` |
| Webhooks | Separate endpoint | Separate endpoint |
| Products/Prices | Must recreate in live | Different IDs |

### Important Rule

> ⚠️ **ALWAYS build and test in Test Mode first.** Only switch to Live Mode when ready to accept real payments.

### How to Toggle

- **Top-right of dashboard:** Click the "Test mode" toggle
- When **ON** (orange): You're in test mode
- When **OFF** (no color): You're in live mode

**For this entire guide, stay in TEST MODE.**

---

## Part 3: Get Your API Keys

### 3.1 Navigate to API Keys

1. Click **"Developers"** in the left sidebar
2. Click **"API keys"**

### 3.2 Your Keys

You'll see two keys:

```
┌─────────────────────────────────────────────────────────────────┐
│ STANDARD KEYS                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Publishable key                                                 │
│ pk_test_51Abc123DefGhi456...                    [Reveal] [Copy] │
│                                                                 │
│ Secret key                                                      │
│ sk_test_51Abc123DefGhi456...                    [Reveal] [Copy] │
│ (hidden until you click Reveal)                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Understanding the Keys

| Key | Prefix | Use | Security |
|-----|--------|-----|----------|
| **Publishable** | `pk_test_` | Frontend (browser) | Safe to expose |
| **Secret** | `sk_test_` | Backend (server only) | NEVER expose |

### 3.4 Copy Your Keys

1. Click **"Reveal"** next to Secret key
2. Copy both keys somewhere safe (we'll use them later)

```bash
# Save these for later:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Abc...
STRIPE_SECRET_KEY=sk_test_51Abc...
```

---

## Part 4: Create the Blots Product

### 4.1 Navigate to Products

1. Click **"Product catalog"** in the left sidebar
2. Click **"+ Add product"** button (top-right)

### 4.2 Product Details

Fill in the form:

```
┌─────────────────────────────────────────────────────────────────┐
│ Add a product                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Name *                                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Myjoe Blots (100-pack)                                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Description                                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 100 Blots for AI coloring book generation. Use Blots to     │ │
│ │ generate pages, create heroes, and export your books.       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Image                                                           │
│ [Upload] ← Upload your Blots icon (optional but recommended)    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 DO NOT Add Pricing Yet

At the bottom, you'll see a "Pricing" section. **Leave it empty for now.**

We'll add prices separately to keep them organized.

### 4.4 Save the Product

Click **"Save product"** (top-right)

You'll be taken to the product detail page. Note the **Product ID**:

```
Product ID: prod_Abc123DefGhi
```

---

## Part 5: Create Subscription Prices

Now we'll add 4 subscription prices to the product.

### 5.1 Add First Price (Creator Monthly)

From your product page, click **"+ Add price"**

#### Price Details:

```
┌─────────────────────────────────────────────────────────────────┐
│ Add a price                                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Pricing model                                                   │
│ ○ Standard pricing                                              │
│ ● Per unit  ← SELECT THIS                                       │
│ ○ Package                                                       │
│ ○ Graduated                                                     │
│ ○ Volume                                                        │
│                                                                 │
│ Price *                                                         │
│ ┌────────────────┐                                              │
│ │ $ 3.00         │  per unit                                    │
│ └────────────────┘                                              │
│                                                                 │
│ Currency: USD ▼                                                 │
│                                                                 │
│ Billing period                                                  │
│ ● Recurring                                                     │
│ ○ One time                                                      │
│                                                                 │
│ ┌────────────────┐                                              │
│ │ Monthly     ▼  │                                              │
│ └────────────────┘                                              │
│                                                                 │
│ ▼ More options (click to expand)                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Expand "More options" and set:

```
┌─────────────────────────────────────────────────────────────────┐
│ More options                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Price description (for your reference)                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Creator Monthly - $3 per 100 Blots                          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Lookup key (for API lookups - optional but helpful)             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ creator_monthly                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Add Metadata:

Scroll down to **"Metadata"** section, click **"+ Add metadata"**:

| Key | Value |
|-----|-------|
| `tier` | `creator` |
| `interval` | `monthly` |
| `blots_per_unit` | `100` |

Click **"Save price"**

---

### 5.2 Add Second Price (Creator Annual)

Click **"+ Add price"** again.

```
Pricing model:     Per unit
Price:             $2.50 per unit
Billing period:    Recurring → Yearly
Price description: Creator Annual - $2.50 per 100 Blots
Lookup key:        creator_annual

Metadata:
├── tier: creator
├── interval: yearly
└── blots_per_unit: 100
```

**Click "Save price"**

---

### 5.3 Add Third Price (Studio Monthly)

Click **"+ Add price"** again.

```
Pricing model:     Per unit
Price:             $2.00 per unit
Billing period:    Recurring → Monthly
Price description: Studio Monthly - $2 per 100 Blots
Lookup key:        studio_monthly

Metadata:
├── tier: studio
├── interval: monthly
└── blots_per_unit: 100
```

**Click "Save price"**

---

### 5.4 Add Fourth Price (Studio Annual)

Click **"+ Add price"** again.

```
Pricing model:     Per unit
Price:             $1.75 per unit
Billing period:    Recurring → Yearly
Price description: Studio Annual - $1.75 per 100 Blots
Lookup key:        studio_annual

Metadata:
├── tier: studio
├── interval: yearly
└── blots_per_unit: 100
```

**Click "Save price"**

---

### 5.5 Verify Your Prices

Your product should now show 4 prices:

```
┌─────────────────────────────────────────────────────────────────┐
│ Myjoe Blots (100-pack)                                          │
│ prod_Abc123...                                                  │
├─────────────────────────────────────────────────────────────────┤
│ PRICES                                                          │
│                                                                 │
│ $3.00 / unit / month    Creator Monthly    price_1ABC...        │
│ $2.50 / unit / year     Creator Annual     price_2DEF...        │
│ $2.00 / unit / month    Studio Monthly     price_3GHI...        │
│ $1.75 / unit / year     Studio Annual      price_4JKL...        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.6 Copy All Price IDs

Click on each price and copy the Price ID (starts with `price_`):

```bash
STRIPE_PRICE_CREATOR_MONTHLY=price_1ABC...
STRIPE_PRICE_CREATOR_ANNUAL=price_2DEF...
STRIPE_PRICE_STUDIO_MONTHLY=price_3GHI...
STRIPE_PRICE_STUDIO_ANNUAL=price_4JKL...
```

---

## Part 6: Create Pack Prices

### 6.1 Add Top-Up Pack Price

From your "Myjoe Blots (100-pack)" product, click **"+ Add price"**

```
Pricing model:     Standard pricing ← (NOT per unit)
Price:             $5.00
Billing period:    One time ← (NOT recurring)
Price description: Top-Up Pack - 100 Blots
Lookup key:        pack_topup

Metadata:
├── type: blot_pack
├── pack_id: topup
└── blots: 100
```

**Click "Save price"**

---

### 6.2 Add Boost Pack Price

Click **"+ Add price"** again.

```
Pricing model:     Standard pricing
Price:             $20.00
Billing period:    One time
Price description: Boost Pack - 500 Blots
Lookup key:        pack_boost

Metadata:
├── type: blot_pack
├── pack_id: boost
└── blots: 500
```

**Click "Save price"**

---

### 6.3 Copy Pack Price IDs

```bash
STRIPE_PRICE_PACK_TOPUP=price_5MNO...
STRIPE_PRICE_PACK_BOOST=price_6PQR...
```

---

### 6.4 Final Product Summary

Your product now has **6 prices**:

| Description | Type | Amount | Price ID |
|-------------|------|--------|----------|
| Creator Monthly | Per unit, Monthly | $3.00/unit | `price_1ABC...` |
| Creator Annual | Per unit, Yearly | $2.50/unit | `price_2DEF...` |
| Studio Monthly | Per unit, Monthly | $2.00/unit | `price_3GHI...` |
| Studio Annual | Per unit, Yearly | $1.75/unit | `price_4JKL...` |
| Top-Up Pack | One-time | $5.00 | `price_5MNO...` |
| Boost Pack | One-time | $20.00 | `price_6PQR...` |

---

## Part 7: Set Up Webhooks

Webhooks notify your app when payment events occur (successful payment, subscription cancelled, etc.).

### 7.1 Navigate to Webhooks

1. Click **"Developers"** in left sidebar
2. Click **"Webhooks"**
3. Click **"+ Add endpoint"**

### 7.2 Configure Endpoint

```
┌─────────────────────────────────────────────────────────────────┐
│ Add webhook endpoint                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Endpoint URL *                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ https://myjoe.app/api/webhooks/stripe                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Description (optional)                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Myjoe production webhook                                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Listen to                                                       │
│ ● Events on your account                                        │
│ ○ Events on connected accounts                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 Select Events

Click **"+ Select events"**

In the search/filter, find and check these events:

```
✅ checkout.session.completed
   → Fires when checkout completes (subscription started or pack bought)

✅ invoice.payment_succeeded
   → Fires when subscription renews successfully

✅ invoice.payment_failed
   → Fires when renewal payment fails

✅ customer.subscription.updated
   → Fires when subscription changes (upgrade/downgrade)

✅ customer.subscription.deleted
   → Fires when subscription is cancelled
```

Click **"Add events"**

### 7.4 Create the Endpoint

Click **"Add endpoint"**

### 7.5 Get Webhook Signing Secret

After creating, you'll see your endpoint. Click on it to view details.

Find **"Signing secret"** and click **"Reveal"**:

```
Signing secret: whsec_AbcDefGhi123456789...
```

Copy this:

```bash
STRIPE_WEBHOOK_SECRET=whsec_AbcDefGhi123456789...
```

---

## Part 8: Configure Customer Portal

The Customer Portal lets users manage their own subscriptions (update payment method, cancel, etc.).

### 8.1 Navigate to Portal Settings

1. Click **"Settings"** (gear icon, bottom-left)
2. Under "Billing", click **"Customer portal"**

### 8.2 Configure Features

Enable these settings:

```
┌─────────────────────────────────────────────────────────────────┐
│ Customer portal settings                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ FUNCTIONALITY                                                   │
│                                                                 │
│ Payment methods                                                 │
│ ✅ Allow customers to update their payment methods              │
│                                                                 │
│ Invoices                                                        │
│ ✅ Allow customers to view their invoice history                │
│                                                                 │
│ Subscriptions                                                   │
│ ✅ Allow customers to update subscriptions                      │
│    ✅ Customers can switch plans                                │
│    ✅ Prorate changes                                           │
│                                                                 │
│ ✅ Allow customers to cancel subscriptions                      │
│    ● At end of billing period ← SELECT THIS                     │
│    ○ Immediately                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 Add Products to Portal

Scroll to **"Products"** section:

1. Click **"+ Add product"**
2. Select **"Myjoe Blots (100-pack)"**
3. Check all the prices you want customers to switch between

### 8.4 Set Business Information

Under **"Business information"**:

```
Business name: Myjoe
Support email: support@myjoe.app
Support phone: (optional)
```

### 8.5 Save Changes

Click **"Save changes"** at the top.

---

## Part 9: Test Locally with Stripe CLI

### 9.1 Install Stripe CLI

**Mac (Homebrew):**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows (Scoop):**
```bash
scoop install stripe
```

**Linux (Debian/Ubuntu):**
```bash
# Add Stripe's GPG key
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg

# Add repo
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee /etc/apt/sources.list.d/stripe.list

# Install
sudo apt update && sudo apt install stripe
```

### 9.2 Login to Stripe CLI

```bash
stripe login
```

This opens your browser. Click **"Allow access"** to authenticate.

### 9.3 Forward Webhooks to Localhost

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see:

```
> Ready! Your webhook signing secret is whsec_LOCAL123456789...
```

⚠️ **Important:** This local webhook secret is **different** from your production one. Use this one in `.env.local` for development:

```bash
# For LOCAL development only:
STRIPE_WEBHOOK_SECRET=whsec_LOCAL123456789...
```

### 9.4 Test Checkout Flow

Open another terminal and trigger test events:

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

Watch your app logs to verify events are received.

### 9.5 Test Card Numbers

When testing checkout in the browser, use these test cards:

| Scenario | Card Number | Expiry | CVC |
|----------|-------------|--------|-----|
| ✅ Success | `4242 4242 4242 4242` | Any future | Any 3 digits |
| ❌ Declined | `4000 0000 0000 0002` | Any future | Any 3 digits |
| ⚠️ Requires auth | `4000 0025 0000 3155` | Any future | Any 3 digits |
| ❌ Insufficient funds | `4000 0000 0000 9995` | Any future | Any 3 digits |

---

## Part 10: Environment Variables

### 10.1 Complete List

```bash
# ============================================
# STRIPE CONFIGURATION
# ============================================

# API Keys (from Part 3)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Webhook Secret (from Part 7 or CLI)
STRIPE_WEBHOOK_SECRET=whsec_...

# ============================================
# SUBSCRIPTION PRICES (from Part 5)
# ============================================

STRIPE_PRICE_CREATOR_MONTHLY=price_...
STRIPE_PRICE_CREATOR_ANNUAL=price_...
STRIPE_PRICE_STUDIO_MONTHLY=price_...
STRIPE_PRICE_STUDIO_ANNUAL=price_...

# ============================================
# PACK PRICES (from Part 6)
# ============================================

STRIPE_PRICE_PACK_TOPUP=price_...
STRIPE_PRICE_PACK_BOOST=price_...
```

### 10.2 Add to .env.local

Create or update `.env.local` in your project root:

```bash
# Copy all variables above with your actual values
```

### 10.3 Add to Vercel (for production)

1. Go to **Vercel Dashboard** → Your Project
2. Click **"Settings"** → **"Environment Variables"**
3. Add each variable
4. Set scope to: Production, Preview, Development (as needed)

---

## Part 11: Go Live Checklist

### Before Going Live

#### ✅ Stripe Account

- [ ] Complete business verification (Settings → Business settings)
- [ ] Add bank account for payouts (Settings → Payouts)
- [ ] Set statement descriptor (Settings → Public details) — e.g., `MYJOE`
- [ ] Upload branding assets (Settings → Branding)

#### ✅ Test Everything

- [ ] Test subscription checkout (all 4 price options)
- [ ] Test pack purchase (both packs)
- [ ] Test webhook handling (all 5 events)
- [ ] Test subscription upgrade
- [ ] Test subscription cancellation
- [ ] Test customer portal access

### Switch to Live Mode

1. **Toggle OFF "Test mode"** in Stripe dashboard (top-right)

2. **Recreate everything in Live mode:**
   - Get new API keys (pk_live_, sk_live_)
   - Recreate the product
   - Recreate all 6 prices
   - Create new webhook endpoint
   - Get new webhook signing secret

3. **Update environment variables:**

```bash
# PRODUCTION VALUES
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...  # New live webhook secret

STRIPE_PRICE_CREATOR_MONTHLY=price_live_...  # New live price IDs
STRIPE_PRICE_CREATOR_ANNUAL=price_live_...
STRIPE_PRICE_STUDIO_MONTHLY=price_live_...
STRIPE_PRICE_STUDIO_ANNUAL=price_live_...
STRIPE_PRICE_PACK_TOPUP=price_live_...
STRIPE_PRICE_PACK_BOOST=price_live_...
```

4. **Deploy to Vercel** with live environment variables

---

## Quick Reference

### Checkout Code Example

```typescript
// Create subscription checkout
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  customer: customerId,
  line_items: [{
    price: process.env.STRIPE_PRICE_CREATOR_MONTHLY, // $3/unit
    quantity: 5, // 5 units × 100 Blots = 500 Blots = $15/mo
  }],
  metadata: { userId, tier: 'creator', blots: '500' },
  success_url: `${APP_URL}/billing?success=1`,
  cancel_url: `${APP_URL}/billing`,
});
```

### Pricing Math

| Plan | Price ID | Quantity | Calculation | Result |
|------|----------|----------|-------------|--------|
| Creator 300 | creator_monthly | 3 | 3 × $3.00 | $9/mo |
| Creator 500 | creator_monthly | 5 | 5 × $3.00 | $15/mo |
| Creator 800 | creator_monthly | 8 | 8 × $3.00 | $24/mo |
| Studio 2500 | studio_monthly | 25 | 25 × $2.00 | $50/mo |
| Studio 4000 | studio_monthly | 40 | 40 × $2.00 | $80/mo |
| Studio 5000 | studio_monthly | 50 | 50 × $2.00 | $100/mo |

### Stripe CLI Commands

```bash
# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.deleted

# View events
stripe events list --limit 10

# View failed deliveries
stripe events list --delivery-success=false
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "No such price" | Using test price in live mode | Check your env vars match the mode |
| Webhook signature failed | Wrong secret | Use CLI secret locally, dashboard secret in prod |
| Price shows wrong amount | Wrong pricing model | Ensure "Per unit" is selected |
| Customer created twice | Not checking existing | Use `stripe.customers.list({ email })` first |
| Subscription not updating | Webhook not received | Check webhook endpoint URL, check events selected |

---

## Summary

| What | Count |
|------|-------|
| Products | **1** (Myjoe Blots) |
| Subscription prices | **4** |
| Pack prices | **2** |
| Webhook events | **5** |
| Environment variables | **8** |

You're ready to accept payments! 🎉
