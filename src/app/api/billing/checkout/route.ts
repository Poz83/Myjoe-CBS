import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/server/billing/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { plan, interval } = body;
    
    if (!plan || !interval) {
      return NextResponse.json(
        { error: 'Plan and interval are required' },
        { status: 400 }
      );
    }
    
    if (!['starter', 'creator', 'pro'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }
    
    if (!['monthly', 'yearly'].includes(interval)) {
      return NextResponse.json(
        { error: 'Invalid interval' },
        { status: 400 }
      );
    }
    
    const checkoutUrl = await createCheckoutSession({
      userId: user.id,
      email: user.email!,
      plan: plan as 'starter' | 'creator' | 'pro',
      interval: interval as 'monthly' | 'yearly',
    });
    
    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
