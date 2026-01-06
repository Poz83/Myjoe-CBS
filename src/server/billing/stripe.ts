import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Plan to Blots mapping
export const PLAN_BLOTS: Record<string, number> = {
  starter: 300,
  creator: 900,
  pro: 2800,
};

// Plan to Storage mapping (in bytes)
export const PLAN_STORAGE: Record<string, number> = {
  starter: 5 * 1024 * 1024 * 1024,    // 5 GB
  creator: 15 * 1024 * 1024 * 1024,   // 15 GB
  pro: 50 * 1024 * 1024 * 1024,       // 50 GB
};

export interface CheckoutParams {
  userId: string;
  email: string;
  plan: 'starter' | 'creator' | 'pro';
  interval: 'monthly' | 'yearly';
}

export function getPriceId(plan: string, interval: string): string {
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${interval.toUpperCase()}`;
  const priceId = process.env[key];
  if (!priceId) {
    throw new Error(`Price ID not found for ${plan} ${interval}. Set ${key} in .env.local`);
  }
  return priceId;
}

export async function createCheckoutSession(params: CheckoutParams): Promise<string> {
  const { userId, email, plan, interval } = params;
  
  const priceId = getPriceId(plan, interval);
  
  // Get or create Stripe customer
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('owner_id', userId)
    .single();
  
  let customerId = profile?.stripe_customer_id;
  
  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });
    customerId = customer.id;
    
    // Save customer ID to profile
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('owner_id', userId);
  }
  
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/billing?canceled=true`,
    metadata: { userId, plan },
  });
  
  return session.url!;
}

export async function createPortalSession(customerId: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/billing`,
  });
  
  return session.url;
}
