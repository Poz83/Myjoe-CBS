import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { randomUUID } from 'crypto';
import { getPage, getPageVersions } from '@/server/db/pages';
import { getSignedDownloadUrl } from '@/server/storage/r2';

/**
 * GET /api/pages/[pageId]
 * Fetch a page with all versions and signed URLs
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  const correlationId = randomUUID();

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', correlationId },
        { status: 401 }
      );
    }

    const pageId = params.pageId;

    // Validate UUID format
    if (!z.string().uuid().safeParse(pageId).success) {
      return NextResponse.json(
        { error: 'Invalid page ID', correlationId },
        { status: 400 }
      );
    }

    // Get page with ownership check
    const page = await getPage(pageId, user.id);

    // Get all versions
    const versions = await getPageVersions(pageId);

    // Get signed URL for current version image
    const currentVersionData = versions.find(v => v.version === page.current_version);
    let imageUrl: string | null = null;
    if (currentVersionData?.asset_key) {
      imageUrl = await getSignedDownloadUrl(currentVersionData.asset_key);
    }

    // Get signed thumbnail URLs for all versions
    const thumbnailUrls: Record<number, string> = {};
    for (const version of versions) {
      if (version.thumbnail_key) {
        thumbnailUrls[version.version] = await getSignedDownloadUrl(version.thumbnail_key);
      } else if (version.asset_key) {
        // Fall back to main image if no thumbnail
        thumbnailUrls[version.version] = await getSignedDownloadUrl(version.asset_key);
      }
    }

    return NextResponse.json({
      page,
      versions,
      imageUrl,
      thumbnailUrls,
      correlationId,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Handle not found
    if (errorMessage.includes('not found') || errorMessage.includes('forbidden')) {
      return NextResponse.json(
        { error: 'Page not found', correlationId },
        { status: 404 }
      );
    }

    console.error('GET /api/pages/[pageId] error:', error);
    Sentry.captureException(error, {
      tags: { correlationId, endpoint: 'GET /api/pages/[pageId]' },
    });

    return NextResponse.json(
      { error: 'Failed to fetch page', correlationId },
      { status: 500 }
    );
  }
}
