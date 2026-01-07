import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as Sentry from '@sentry/nextjs';
import { randomUUID } from 'crypto';
import { getJob, getJobItems } from '@/server/db/jobs';
import { getSignedDownloadUrl } from '@/server/storage/r2';

/**
 * GET /api/generate/[jobId]
 * Get job status with page thumbnails
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const correlationId = randomUUID();
  const { jobId } = await params;

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
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jobId)) {
      return NextResponse.json(
        { error: 'Invalid job ID format', correlationId },
        { status: 400 }
      );
    }

    // Get job with ownership verification
    let job;
    try {
      job = await getJob(jobId, user.id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Job not found or access denied', correlationId },
        { status: 404 }
      );
    }

    // Get job items
    const items = await getJobItems(jobId);

    // Get thumbnail URLs for completed items
    const itemsWithThumbnails = await Promise.all(
      items.map(async (item) => {
        let thumbnailUrl: string | null = null;

        if (item.status === 'completed' && item.page_id) {
          // Get page version to find thumbnail key
          const { data: pageVersion } = await supabase
            .from('page_versions')
            .select('thumbnail_key')
            .eq('page_id', item.page_id)
            .order('version', { ascending: false })
            .limit(1)
            .single();

          if (pageVersion?.thumbnail_key) {
            try {
              thumbnailUrl = await getSignedDownloadUrl(pageVersion.thumbnail_key, 3600);
            } catch (error) {
              console.error(`Failed to get thumbnail URL for page ${item.page_id}:`, error);
            }
          }
        }

        return {
          id: item.id,
          pageId: item.page_id,
          status: item.status,
          thumbnailUrl,
          errorMessage: item.error_message,
        };
      })
    );

    return NextResponse.json({
      job: {
        id: job.id,
        status: job.status,
        totalItems: job.total_items,
        completedItems: job.completed_items,
        failedItems: job.failed_items,
        blotsReserved: job.blots_reserved,
        blotsSpent: job.blots_spent,
        errorMessage: job.error_message,
        createdAt: job.created_at,
        startedAt: job.started_at,
        completedAt: job.completed_at,
      },
      items: itemsWithThumbnails,
      correlationId,
    });
  } catch (error) {
    console.error('GET /api/generate/[jobId] error:', error);
    Sentry.captureException(error, {
      tags: { correlationId, endpoint: 'GET /api/generate/[jobId]', jobId },
    });

    return NextResponse.json(
      { error: 'Failed to fetch job status', correlationId },
      { status: 500 }
    );
  }
}
