import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkStorageQuota } from '@/server/storage/quota';
import { performanceLogger } from '@/lib/performance-logger';

// Force dynamic rendering since this route uses cookies
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quota = await checkStorageQuota(user.id);

    const duration = Date.now() - startTime;
    performanceLogger.logApiCall('/api/storage/quota', duration, {
      userId: user.id,
      percentageUsed: quota.limit > 0 ? Math.round((quota.used / quota.limit) * 100) : 0,
    });

    return NextResponse.json({
      used: quota.used,
      limit: quota.limit,
      remaining: quota.remaining,
      percentageUsed: quota.limit > 0 ? Math.round((quota.used / quota.limit) * 100) : 0,
    }, {
      headers: {
        'Cache-Control': 'private, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    performanceLogger.logApiCall('/api/storage/quota', duration, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('Quota error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch storage quota' },
      { status: 500 }
    );
  }
}
