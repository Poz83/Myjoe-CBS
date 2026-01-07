import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { randomUUID } from 'crypto';
import { getJob } from '@/server/db/jobs';
import { getSignedDownloadUrl, getFileMetadata } from '@/server/storage/r2';

/**
 * GET /api/export/[jobId]
 * Get export job status and download URL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
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

    const jobId = params.jobId;

    // Validate UUID format
    if (!z.string().uuid().safeParse(jobId).success) {
      return NextResponse.json(
        { error: 'Invalid job ID', correlationId },
        { status: 400 }
      );
    }

    // Get job with ownership verification
    let job;
    try {
      job = await getJob(jobId, user.id);
    } catch {
      return NextResponse.json(
        { error: 'Export job not found', correlationId },
        { status: 404 }
      );
    }

    // Verify this is an export job
    if (job.type !== 'export') {
      return NextResponse.json(
        { error: 'Not an export job', correlationId },
        { status: 400 }
      );
    }

    const response: Record<string, unknown> = {
      jobId: job.id,
      status: job.status,
      totalItems: job.total_items,
      completedItems: job.completed_items,
      failedItems: job.failed_items,
      errorMessage: job.error_message,
      createdAt: job.created_at,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      correlationId,
    };

    // If completed, generate download URL
    if (job.status === 'completed') {
      const metadata = job.metadata as { format?: string; assetKey?: string };
      const assetKey = metadata?.assetKey;

      if (assetKey) {
        // Generate signed download URL (1 hour expiry)
        const downloadUrl = await getSignedDownloadUrl(assetKey, 3600);
        const fileMetadata = await getFileMetadata(assetKey);

        // Calculate expiry time
        const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

        response.downloadUrl = downloadUrl;
        response.expiresAt = expiresAt;
        response.fileSize = fileMetadata?.size || null;
        response.format = metadata?.format || 'pdf';
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/export/[jobId] error:', error);
    Sentry.captureException(error, {
      tags: { correlationId, endpoint: 'GET /api/export/[jobId]' },
    });

    return NextResponse.json(
      { error: 'Failed to get export status', correlationId },
      { status: 500 }
    );
  }
}
