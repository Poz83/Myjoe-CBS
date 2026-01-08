import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/server/billing/stripe';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { TIERS, BLOTS_PER_UNIT } from '@/lib/constants';
import {
  sendSubscriptionWelcomeEmail,
  sendPaymentFailedEmail,
  sendSubscriptionCancelledEmail,
} from '@/server/email';
import Stripe from 'stripe';
import { rateLimit } from '@/lib/rate-limit';

function getNextResetDate(): string {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toISOString();
}

function getStorageForTier(tier: string): number {
  if (tier === 'studio') return TIERS.studio.storageGb * 1024 * 1024 * 1024;
  if (tier === 'creator') return TIERS.creator.storageGb * 1024 * 1024 * 1024;
  return TIERS.free.storageGb * 1024 * 1024 * 1024;
}

export async function POST(request: NextRequest) {
  // Get IP for rate limiting (use x-forwarded-for for proxied requests)
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';

  // Rate limit by IP to prevent webhook abuse
  const rateLimitResult = rateLimit(`webhook:${ip}`, 'webhook');
  if (rateLimitResult) return rateLimitResult;

  const body = await request.text();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        const userId = metadata.userId;

        if (!userId) {
          console.error('Missing userId in checkout session metadata');
          break;
        }

        // Handle subscription purchase (Corbin method - no packs)
        const tier = metadata.tier as string;
        const blots = parseInt(metadata.blots, 10);

        if (!tier || !['creator', 'studio'].includes(tier)) {
          console.error('Invalid tier in checkout session', { tier });
          break;
        }

        const storageBytes = getStorageForTier(tier);

        const { error } = await supabase
          .from('profiles')
          .update({
            plan: tier,
            plan_blots: blots,
            blots: blots, // Single blots column (simplified)
            storage_limit_bytes: storageBytes,
            stripe_subscription_id: session.subscription as string,
            blots_reset_at: getNextResetDate(),
            payment_failed_at: null,
          })
          .eq('owner_id', userId);

        if (error) {
          console.error('Error updating profile after checkout:', error);
        } else {
          const email = session.customer_email;
          if (email) {
            try {
              await sendSubscriptionWelcomeEmail(email, tier as 'creator' | 'studio');
            } catch (emailError) {
              console.error('Error sending welcome email:', emailError);
            }
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof (invoice as any).subscription === 'string'
          ? (invoice as any).subscription
          : (invoice as any).subscription?.id || null;

        if (!subscriptionId) break;

        // Skip first invoice (handled by checkout.session.completed)
        if (invoice.billing_reason === 'subscription_create') break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const customerId = subscription.customer as string;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('owner_id, plan, plan_blots')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profileError || !profile) {
          console.error('Error finding profile for customer:', profileError);
          break;
        }

        if (profile.plan === 'free' || !profile.plan_blots) break;

        // Reset blots to plan amount (simplified single-pool)
        await supabase
          .from('profiles')
          .update({
            blots: profile.plan_blots,
            blots_reset_at: getNextResetDate(),
          })
          .eq('owner_id', profile.owner_id);
        

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: profile } = await supabase
          .from('profiles')
          .select('owner_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!profile) break;

        // Mark payment failed
        await supabase
          .from('profiles')
          .update({ payment_failed_at: new Date().toISOString() })
          .eq('owner_id', profile.owner_id);

        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(profile.owner_id);
        const email = user?.email || invoice.customer_email;

        if (email && invoice.hosted_invoice_url) {
          try {
            await sendPaymentFailedEmail(email, invoice.hosted_invoice_url);
          } catch (emailError) {
            console.error('Error sending payment failed email:', emailError);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: profile } = await supabase
          .from('profiles')
          .select('owner_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!profile) break;

        // Downgrade to free tier
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            plan: 'free',
            plan_blots: TIERS.free.blots,
            blots: TIERS.free.blots,
            storage_limit_bytes: getStorageForTier('free'),
            stripe_subscription_id: null,
          })
          .eq('owner_id', profile.owner_id);

        if (!updateError) {
          const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(profile.owner_id);
          if (user?.email) {
            try {
              await sendSubscriptionCancelledEmail(user.email);
            } catch (emailError) {
              console.error('Error sending cancellation email:', emailError);
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        // Handle mid-cycle upgrades/downgrades (Corbin method)
        const subscription = event.data.object as Stripe.Subscription;
        const previousAttributes = event.data.previous_attributes as Partial<Stripe.Subscription> | undefined;
        const customerId = subscription.customer as string;

        const { data: profile } = await supabase
          .from('profiles')
          .select('owner_id, plan, plan_blots, blots')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!profile) break;

        // Check for quantity change (upgrade/downgrade within tier)
        if (previousAttributes?.items) {
          const oldQty = previousAttributes.items.data?.[0]?.quantity || 0;
          const newQty = subscription.items.data?.[0]?.quantity || 0;
          
          if (newQty !== oldQty) {
            const newBlots = newQty * BLOTS_PER_UNIT;
            const blotDiff = (newQty - oldQty) * BLOTS_PER_UNIT;
            
            // Get tier from subscription metadata
            const tier = subscription.metadata?.tier || profile.plan;
            const storageBytes = getStorageForTier(tier);
            
            if (blotDiff > 0) {
              // Upgrade: Add prorated blots immediately
              await supabase
                .from('profiles')
                .update({
                  plan: tier,
                  plan_blots: newBlots,
                  blots: profile.blots + blotDiff, // Add difference to current balance
                  storage_limit_bytes: storageBytes,
                })
                .eq('owner_id', profile.owner_id);
              
            } else {
              // Downgrade: Update plan_blots, keep current blots until reset
              await supabase
                .from('profiles')
                .update({
                  plan: tier,
                  plan_blots: newBlots,
                  storage_limit_bytes: storageBytes,
                })
                .eq('owner_id', profile.owner_id);
              
            }
          }
        }
        break;
      }

      default:
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
