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
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('blots, plan_blots, plan, blots_reset_at, storage_used_bytes, storage_limit_bytes')
      .eq('owner_id', user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      blots: profile.blots ?? 0,
      planBlots: profile.plan_blots,
      plan: profile.plan,
      resetsAt: profile.blots_reset_at,
      storageUsed: profile.storage_used_bytes,
      storageLimit: profile.storage_limit_bytes,
    });
  } catch (error) {
    console.error('Balance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
