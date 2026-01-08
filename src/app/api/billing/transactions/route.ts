import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate limit parameter
    const limitParam = request.nextUrl.searchParams.get('limit') || '10';
    const parsedLimit = parseInt(limitParam, 10);

    // Validate limit is a positive number between 1-50
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return NextResponse.json(
        { error: 'Invalid limit parameter - must be a positive integer' },
        { status: 400 }
      );
    }
    const limit = Math.min(parsedLimit, 50);

    const { data: transactions, error } = await supabase
      .from('blot_transactions')
      .select('id, type, subscription_delta, pack_delta, description, created_at')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 50));

    if (error) {
      console.error('Transactions error:', error);
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }

    return NextResponse.json({
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        delta: (t.subscription_delta ?? 0) + (t.pack_delta ?? 0),
        subscriptionDelta: t.subscription_delta ?? 0,
        packDelta: t.pack_delta ?? 0,
        description: t.description,
        createdAt: t.created_at,
      })),
    });
  } catch (error) {
    console.error('Transactions error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
