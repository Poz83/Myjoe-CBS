import { NextRequest, NextResponse } from 'next/server';
import { createSubscriptionCheckout } from '@/server/billing/stripe';
import { createClient } from '@/lib/supabase/server';
import { TIERS } from '@/lib/constants';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: checkout operations
    const rateLimitResult = rateLimit(user.id, 'checkout');
    if (rateLimitResult) return rateLimitResult;

    const body = await request.json();
    const { tier, blots, interval } = body;

    if (!tier || !blots || !interval) {
      return NextResponse.json({ error: 'tier, blots, and interval are required' }, { status: 400 });
    }

    if (!['creator', 'studio'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier. Must be creator or studio.' }, { status: 400 });
    }

    if (!['monthly', 'yearly'].includes(interval)) {
      return NextResponse.json({ error: 'Invalid interval. Must be monthly or yearly.' }, { status: 400 });
    }

    const tierConfig = TIERS[tier as 'creator' | 'studio'];
    const validBlots = tierConfig.blotOptions as readonly number[];
    if (!validBlots.includes(blots)) {
      return NextResponse.json({ error: `Invalid blots for ${tier}. Must be one of: ${tierConfig.blotOptions.join(', ')}` }, { status: 400 });
    }

    const checkoutUrl = await createSubscriptionCheckout(
      user.id,
      user.email!,
      tier as 'creator' | 'studio',
      blots,
      interval as 'monthly' | 'yearly'
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
