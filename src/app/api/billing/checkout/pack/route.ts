import { NextRequest, NextResponse } from 'next/server';
import { createPackCheckout } from '@/server/billing/stripe';
import { createClient } from '@/lib/supabase/server';
import { BLOT_PACKS, type PackId } from '@/lib/constants';

const VALID_PACKS = Object.keys(BLOT_PACKS) as PackId[];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { packId } = body;

    if (!packId) {
      return NextResponse.json({ error: 'Pack ID is required' }, { status: 400 });
    }

    if (!VALID_PACKS.includes(packId)) {
      return NextResponse.json({ error: `Invalid pack ID. Must be one of: ${VALID_PACKS.join(', ')}` }, { status: 400 });
    }

    const checkoutUrl = await createPackCheckout(user.id, user.email!, packId);

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Pack checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
