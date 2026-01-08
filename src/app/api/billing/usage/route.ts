import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering since this route uses cookies
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get transactions from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: transactions, error } = await supabase
      .from('blot_transactions')
      .select('subscription_delta, pack_delta, created_at')
      .eq('owner_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .in('type', ['generation', 'edit', 'hero', 'calibration']);

    if (error) {
      console.error('Usage error:', error);
      return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
    }

    // Aggregate by date
    const usageByDate: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      usageByDate[date.toISOString().split('T')[0]] = 0;
    }

    transactions?.forEach(t => {
      const date = new Date(t.created_at).toISOString().split('T')[0];
      const spent = Math.abs(t.subscription_delta) + Math.abs(t.pack_delta);
      if (usageByDate[date] !== undefined) {
        usageByDate[date] += spent;
      }
    });

    return NextResponse.json({
      usage: Object.entries(usageByDate).map(([date, blots]) => ({ date, blots })),
    });
  } catch (error) {
    console.error('Usage error:', error);
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
  }
}
