import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkStorageQuota } from '@/server/storage/quota';

// Force dynamic rendering since this route uses cookies
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quota = await checkStorageQuota(user.id);

    return NextResponse.json({
      used: quota.used,
      limit: quota.limit,
      remaining: quota.remaining,
      percentageUsed: quota.limit > 0 ? Math.round((quota.used / quota.limit) * 100) : 0,
    });
  } catch (error) {
    console.error('Quota error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch storage quota' },
      { status: 500 }
    );
  }
}
