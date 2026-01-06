# Resend Email Setup Guide

## Overview

Resend is configured for sending transactional emails using React Email templates. All email templates are styled with a dark theme to match the Myjoe brand.

## Configuration

### Environment Variables

Add to `.env.local`:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@myjoe.app  # Optional - defaults to onboarding@resend.dev
```

### Domain Setup (Production)

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add your domain: `myjoe.app`
3. Add DNS records as instructed:
   - SPF record
   - DKIM records
   - DMARC record (optional but recommended)
4. Verify domain
5. Update `RESEND_FROM_EMAIL` to use your verified domain

### Testing

For development, you can use the default `onboarding@resend.dev` sender without domain verification.

## Email Templates

All templates are located in `src/server/email/templates/`:

### 1. Subscription Welcome
**Trigger:** `checkout.session.completed`  
**Template:** `subscription-welcome.tsx`  
**Function:** `sendSubscriptionWelcomeEmail()`

Sends when a user successfully subscribes to a paid plan.

### 2. Payment Failed
**Trigger:** `invoice.payment_failed`  
**Template:** `payment-failed.tsx`  
**Function:** `sendPaymentFailedEmail()`

Sends when a payment fails. Includes link to update payment method.

### 3. Subscription Cancelled
**Trigger:** `customer.subscription.deleted`  
**Template:** `subscription-cancelled.tsx`  
**Function:** `sendSubscriptionCancelledEmail()`

Sends when a subscription is cancelled. Includes resubscribe CTA.

### 4. Blots Low
**Trigger:** Manual (when blots < 20% of plan)  
**Template:** `blots-low.tsx`  
**Function:** `sendBlotsLowEmail()`

Sends when user has less than 20% of their monthly Blots remaining.

### 5. Blots Depleted
**Trigger:** Manual (when blots = 0)  
**Template:** `blots-depleted.tsx`  
**Function:** `sendBlotsDepletedEmail()`

Sends when user runs out of Blots. Includes upgrade CTA.

## Usage

### Sending Emails

```typescript
import {
  sendSubscriptionWelcomeEmail,
  sendPaymentFailedEmail,
  sendSubscriptionCancelledEmail,
  sendBlotsLowEmail,
  sendBlotsDepletedEmail,
} from '@/server/email';

// Welcome email
await sendSubscriptionWelcomeEmail('user@example.com', 'starter');

// Payment failed
await sendPaymentFailedEmail('user@example.com', 'https://invoice.stripe.com/...');

// Cancellation
await sendSubscriptionCancelledEmail('user@example.com');

// Low blots
await sendBlotsLowEmail('user@example.com', 50, 'starter');

// Depleted blots
await sendBlotsDepletedEmail('user@example.com', 'free');
```

### Email Styling

All templates use:
- Dark theme (`#0a0a0a` background)
- Consistent color scheme matching Myjoe brand
- Responsive design
- Accessible contrast ratios

## Testing Emails Locally

### Option 1: React Email Dev Server

```bash
npx react-email dev
```

Opens preview server at `http://localhost:3000` to preview all templates.

### Option 2: Send Test Email

```typescript
// In a test script or API route
import { sendSubscriptionWelcomeEmail } from '@/server/email';

await sendSubscriptionWelcomeEmail('your-email@example.com', 'starter');
```

## Webhook Integration

Emails are automatically sent from Stripe webhooks:

- **Checkout Complete** → Welcome email
- **Payment Failed** → Payment failed email
- **Subscription Deleted** → Cancellation email

See `src/app/api/webhooks/stripe/route.ts` for implementation.

## Rate Limits

Resend free tier:
- 3,000 emails/month
- 100 emails/day

Paid plans start at $20/month for 50,000 emails.

## Troubleshooting

### Emails not sending
1. Check `RESEND_API_KEY` is set correctly
2. Verify API key is active in Resend Dashboard
3. Check Resend logs for errors
4. Ensure `FROM_EMAIL` is verified (or using default)

### Domain verification issues
1. Check DNS records are correct
2. Wait 24-48 hours for DNS propagation
3. Use Resend's DNS checker tool

### Template rendering errors
1. Check React Email components are imported correctly
2. Verify all props are passed to templates
3. Check browser console for React errors

## Production Checklist

- [ ] Domain added and verified in Resend
- [ ] DNS records configured correctly
- [ ] `RESEND_FROM_EMAIL` updated to verified domain
- [ ] Test emails sent and verified
- [ ] Webhook emails tested with Stripe test mode
- [ ] Email templates reviewed for brand consistency
- [ ] Rate limits monitored
