// Email service - centralized email sending
import { sendEmail } from './client';
import { SubscriptionWelcomeEmail } from './templates/subscription-welcome';
import { PaymentFailedEmail } from './templates/payment-failed';
import { SubscriptionCancelledEmail } from './templates/subscription-cancelled';
import { BlotsLowEmail } from './templates/blots-low';
import { BlotsDepletedEmail } from './templates/blots-depleted';

export async function sendSubscriptionWelcomeEmail(email: string, plan: 'creator' | 'studio') {
  return sendEmail({
    to: email,
    subject: `Welcome to Myjoe ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan! 🎨`,
    component: SubscriptionWelcomeEmail({ plan }),
  });
}

export async function sendPaymentFailedEmail(email: string, invoiceUrl: string) {
  return sendEmail({
    to: email,
    subject: 'Payment Failed - Update Your Payment Method',
    component: PaymentFailedEmail({ invoiceUrl }),
  });
}

export async function sendSubscriptionCancelledEmail(email: string) {
  return sendEmail({
    to: email,
    subject: 'Your Myjoe Subscription Has Been Cancelled',
    component: SubscriptionCancelledEmail(),
  });
}

export async function sendBlotsLowEmail(email: string, blots: number, plan: string) {
  return sendEmail({
    to: email,
    subject: 'Low Blot Balance Warning',
    component: BlotsLowEmail({ blots, plan }),
  });
}

export async function sendBlotsDepletedEmail(email: string, plan: string) {
  return sendEmail({
    to: email,
    subject: 'Out of Blots - Upgrade to Continue Creating',
    component: BlotsDepletedEmail({ plan }),
  });
}
