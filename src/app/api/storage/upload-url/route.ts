import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSignedUploadUrl, generateR2Key } from '@/server/storage';
import { checkStorageQuota } from '@/server/storage/quota';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, contentType, sizeBytes, projectId, heroId, pageId, version } = body;

    if (!type || !contentType || !sizeBytes) {
      return NextResponse.json(
        { error: 'type, contentType, and sizeBytes are required' },
        { status: 400 }
      );
    }

    // Check storage quota
    const quota = await checkStorageQuota(user.id, sizeBytes);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: 'Storage quota exceeded',
          used: quota.used,
          limit: quota.limit,
          remaining: quota.remaining,
        },
        { status: 403 }
      );
    }

    // Generate R2 key
    const extension = contentType.includes('pdf') ? 'pdf' : 'png';
    const r2Key = generateR2Key(type, {
      userId: user.id,
      projectId,
      heroId,
      pageId,
      version,
      extension,
    });

    // Get signed upload URL
    const uploadUrl = await getSignedUploadUrl(r2Key, contentType, 3600); // 1 hour

    return NextResponse.json({
      uploadUrl,
      r2Key,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Upload URL error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
