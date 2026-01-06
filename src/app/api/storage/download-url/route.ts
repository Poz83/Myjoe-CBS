import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSignedDownloadUrl } from '@/server/storage';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { r2Key, expiresIn = 3600 } = body;

    if (!r2Key) {
      return NextResponse.json(
        { error: 'r2Key is required' },
        { status: 400 }
      );
    }

    // Verify user owns the asset
    const { data: asset } = await supabase
      .from('assets')
      .select('owner_id')
      .eq('r2_key', r2Key)
      .eq('owner_id', user.id)
      .single();

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found or access denied' },
        { status: 404 }
      );
    }

    // Get signed download URL
    const downloadUrl = await getSignedDownloadUrl(r2Key, expiresIn);

    return NextResponse.json({
      downloadUrl,
      expiresIn,
    });
  } catch (error) {
    console.error('Download URL error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}
