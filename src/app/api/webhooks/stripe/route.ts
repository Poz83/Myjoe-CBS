import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/server/billing/stripe';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { TIERS, BLOT_PACKS } from '@/lib/constants';
import {
  sendSubscriptionWelcomeEmail,
  sendPaymentFailedEmail,
  sendSubscriptionCancelledEmail,
} from '@/server/email';
import Stripe from 'stripe';

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
  const body = await request.text();
  const headersList = await headers();
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

        // Handle blot pack purchase (one-time payment)
        if (metadata.type === 'blot_pack') {
          const blots = parseInt(metadata.blots, 10);
          const packId = metadata.packId as keyof typeof BLOT_PACKS;

          if (isNaN(blots) || blots <= 0) {
            console.error('Invalid blots amount in pack purchase', { blots: metadata.blots });
            break;
          }

          // Add blots to pack_blots pool and record transaction
          await supabaseAdmin.rpc('add_pack_blots', {
            user_id: userId,
            amount: blots,
            p_pack_id: packId,
            session_id: session.id,
          });

          console.log(`Added ${blots} pack blots to user ${userId} from ${packId}`);
          break;
        }

        // Handle subscription purchase
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
            subscription_blots: blots,
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

        // Reset subscription blots to plan amount
        await supabaseAdmin.rpc('reset_subscription_blots', {
          user_id: profile.owner_id,
          new_amount: profile.plan_blots,
          invoice_id: invoice.id,
        });

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

        // Downgrade to free (preserve pack_blots)
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            plan: 'free',
            plan_blots: TIERS.free.blots,
            subscription_blots: TIERS.free.blots,
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

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
