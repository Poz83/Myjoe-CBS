import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { randomUUID } from 'crypto';
import { getPage, getPageVersion, setCurrentVersion } from '@/server/db/pages';

const restoreRequestSchema = z.object({
  version: z.number().int().positive(),
});

/**
 * POST /api/pages/[pageId]/restore
 * Restore a specific version as the current version
 */
export async function POST(
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = restoreRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
          correlationId,
        },
        { status: 400 }
      );
    }

    const { version } = validationResult.data;

    // Get page with ownership check
    await getPage(pageId, user.id);

    // Verify the version exists (setCurrentVersion will also check this)
    await getPageVersion(pageId, version);

    // Set the current version
    const updatedPage = await setCurrentVersion(pageId, version);

    return NextResponse.json({
      success: true,
      page: updatedPage,
      correlationId,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Handle not found
    if (errorMessage.includes('not found')) {
      return NextResponse.json(
        { error: 'Page or version not found', correlationId },
        { status: 404 }
      );
    }

    if (errorMessage.includes('forbidden') || errorMessage.includes('access')) {
      return NextResponse.json(
        { error: 'Access denied', correlationId },
        { status: 403 }
      );
    }

    console.error('POST /api/pages/[pageId]/restore error:', error);
    Sentry.captureException(error, {
      tags: { correlationId, endpoint: 'POST /api/pages/[pageId]/restore' },
    });

    return NextResponse.json(
      { error: 'Failed to restore version', correlationId },
      { status: 500 }
    );
  }
}
