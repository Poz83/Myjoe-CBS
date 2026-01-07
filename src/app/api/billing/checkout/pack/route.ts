import { NextRequest, NextResponse } from 'next/server';
import { createPackCheckout, type PackId } from '@/server/billing/stripe';
import { createClient } from '@/lib/supabase/server';

const VALID_PACKS: PackId[] = ['splash', 'bucket', 'barrel'];

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
      return NextResponse.json(
        { error: 'Pack ID is required' },
        { status: 400 }
      );
    }

    if (!VALID_PACKS.includes(packId)) {
      return NextResponse.json(
        { error: 'Invalid pack ID. Must be splash, bucket, or barrel.' },
        { status: 400 }
      );
    }

    const checkoutUrl = await createPackCheckout(
      user.id,
      user.email!,
      packId as PackId
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Pack checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
