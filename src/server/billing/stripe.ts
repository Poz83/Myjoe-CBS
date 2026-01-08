import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia' as any,
  typescript: true,
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Import constants dynamically to avoid build-time env var access
async function getStripeConfig() {
  const { STRIPE_PRICES, BLOTS_PER_UNIT } = await import('@/lib/constants');
  return { STRIPE_PRICES, BLOTS_PER_UNIT };
}

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
  const quantity = blots / BLOTS_PER_UNIT;

  if (!priceId) {
    throw new Error(`Price ID not found for ${tier} ${interval}. Check env vars.`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity }],
    metadata: { userId, tier, blots: blots.toString(), type: 'subscription' },
    subscription_data: { metadata: { userId, tier, blots: blots.toString() } },
    success_url: `${APP_URL}/dashboard/billing?success=subscription`,
    cancel_url: `${APP_URL}/dashboard/billing?canceled=true`,
    allow_promotion_codes: true,
  });

  return session.url!;
}

// createPackCheckout removed - using Corbin's 2-tier dropdown method instead

export async function createPortalSession(customerId: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${APP_URL}/dashboard/billing`,
  });
  return session.url;
}

async function getOrCreateCustomer(userId: string, email: string): Promise<string> {
  const supabase = await createClient();

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
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('owner_id', userId);
    return customerId;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  await supabase
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('owner_id', userId);

  return customer.id;
}
