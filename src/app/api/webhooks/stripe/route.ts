import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, PLAN_BLOTS, PLAN_STORAGE } from '@/server/billing/stripe';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
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

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as string;

        if (!userId || !plan) {
          console.error('Missing userId or plan in checkout session', { userId, plan });
          break;
        }

        if (!PLAN_BLOTS[plan] || !PLAN_STORAGE[plan]) {
          console.error('Invalid plan in checkout session', { plan });
          break;
        }

        const { error } = await supabase
          .from('profiles')
          .update({
            plan,
            blots: PLAN_BLOTS[plan],
            storage_limit_bytes: PLAN_STORAGE[plan],
            stripe_subscription_id: session.subscription as string,
            blots_reset_at: getNextResetDate(),
          })
          .eq('owner_id', userId);

        if (error) {
          console.error('Error updating profile after checkout:', error);
        } else {
          // Send welcome email
          const email = session.customer_email;
          if (email && ['starter', 'creator', 'pro'].includes(plan)) {
            try {
              await sendSubscriptionWelcomeEmail(email, plan as 'starter' | 'creator' | 'pro');
            } catch (emailError) {
              console.error('Error sending welcome email:', emailError);
              // Don't fail the webhook if email fails
            }
          }
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) {
          console.log('No subscription ID in invoice');
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const customerId = subscription.customer as string;

        // Get user by customer ID
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('owner_id, plan')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profileError || !profile) {
          console.error('Error finding profile for customer:', profileError);
          break;
        }

        const plan = profile.plan || 'free';
        if (plan === 'free' || !PLAN_BLOTS[plan]) {
          console.log('Profile is free tier or invalid plan, skipping reset');
          break;
        }

        // RESET blots to plan amount (not add)
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            blots: PLAN_BLOTS[plan],
            blots_reset_at: getNextResetDate(),
          })
          .eq('owner_id', profile.owner_id);

        if (updateError) {
          console.error('Error resetting blots:', updateError);
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('owner_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profileError || !profile) {
          console.error('Error finding profile for failed payment:', profileError);
          break;
        }

        // Get user email
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

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('owner_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profileError || !profile) {
          console.error('Error finding profile for deleted subscription:', profileError);
          break;
        }

        // Downgrade to free
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            plan: 'free',
            blots: 50,
            storage_limit_bytes: 1 * 1024 * 1024 * 1024, // 1 GB
            stripe_subscription_id: null,
          })
          .eq('owner_id', profile.owner_id);

        if (updateError) {
          console.error('Error downgrading profile:', updateError);
        } else {
          // Send cancellation email
          const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(profile.owner_id);
          const email = user?.email;
          if (email) {
            try {
              await sendSubscriptionCancelledEmail(email);
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
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
