import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as Sentry from '@sentry/nextjs';
import { randomUUID } from 'crypto';
import { getHero, deleteHero } from '@/server/db/heroes';
import { getSignedDownloadUrl } from '@/server/storage/r2';
import { NotFoundError, ForbiddenError } from '@/lib/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/heroes/[id]
 * Get a single hero with signed reference URL
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const correlationId = randomUUID();
  const { id } = await params;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', correlationId },
        { status: 401 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid hero ID format', correlationId },
        { status: 400 }
      );
    }

    const hero = await getHero(id, user.id);

    // Get signed URLs
    let referenceUrl: string | null = null;
    let thumbnailUrl: string | null = null;

    if (hero.reference_key) {
      try {
        referenceUrl = await getSignedDownloadUrl(hero.reference_key);
      } catch {
        // Ignore errors for missing reference
      }
    }

    if (hero.thumbnail_key) {
      try {
        thumbnailUrl = await getSignedDownloadUrl(hero.thumbnail_key);
      } catch {
        // Ignore errors for missing thumbnail
      }
    }

    return NextResponse.json({
      ...hero,
      referenceUrl,
      thumbnailUrl,
      correlationId,
    });
  } catch (error) {
    console.error(`GET /api/heroes/${id} error:`, error);

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: 'Hero not found', correlationId },
        { status: 404 }
      );
    }

    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        { error: 'Access denied', correlationId },
        { status: 403 }
      );
    }

    Sentry.captureException(error, {
      tags: { correlationId, endpoint: `GET /api/heroes/${id}` },
    });

    return NextResponse.json(
      { error: 'Failed to fetch hero', correlationId },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/heroes/[id]
 * Soft delete a hero
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const correlationId = randomUUID();
  const { id } = await params;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', correlationId },
        { status: 401 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid hero ID format', correlationId },
        { status: 400 }
      );
    }

    await deleteHero(id, user.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE /api/heroes/${id} error:`, error);

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: 'Hero not found', correlationId },
        { status: 404 }
      );
    }

    Sentry.captureException(error, {
      tags: { correlationId, endpoint: `DELETE /api/heroes/${id}` },
    });

    return NextResponse.json(
      { error: 'Failed to delete hero', correlationId },
      { status: 500 }
    );
  }
}
