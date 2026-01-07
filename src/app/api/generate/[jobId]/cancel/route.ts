import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as Sentry from '@sentry/nextjs';
import { randomUUID } from 'crypto';
import { getJob, cancelJob } from '@/server/db/jobs';
import { calculateJobRefund, refundBlots } from '@/server/billing/blots';
import { updateProject } from '@/server/db/projects';

/**
 * POST /api/generate/[jobId]/cancel
 * Cancel a generation job and refund unspent blots
 */
export async function POST(
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

    // Validate job can be cancelled
    if (!['pending', 'processing'].includes(job.status)) {
      return NextResponse.json(
        {
          error: `Cannot cancel job with status '${job.status}'`,
          correlationId,
        },
        { status: 400 }
      );
    }

    // Cancel the job
    await cancelJob(jobId);

    // Calculate and issue refund
    const refundAmount = await calculateJobRefund(jobId);
    let blotsRefunded = 0;
    let newBalance = 0;

    if (refundAmount > 0) {
      const refundResult = await refundBlots(
        user.id,
        refundAmount,
        jobId,
        'Job cancelled by user'
      );
      blotsRefunded = refundResult.amountRefunded;
      newBalance = refundResult.newBalance;
    } else {
      // Get current balance if no refund
      const { data: profile } = await supabase
        .from('profiles')
        .select('blots')
        .eq('owner_id', user.id)
        .single();
      newBalance = profile?.blots || 0;
    }

    // Update project status back to draft
    if (job.project_id) {
      try {
        await updateProject(job.project_id, user.id, { status: 'draft' });
      } catch (error) {
        console.error('Failed to update project status:', error);
        // Don't fail the whole operation if this fails
      }
    }

    return NextResponse.json({
      success: true,
      blotsRefunded,
      newBalance,
      correlationId,
    });
  } catch (error) {
    console.error('POST /api/generate/[jobId]/cancel error:', error);
    Sentry.captureException(error, {
      tags: { correlationId, endpoint: 'POST /api/generate/[jobId]/cancel', jobId },
    });

    return NextResponse.json(
      { error: 'Failed to cancel job', correlationId },
      { status: 500 }
    );
  }
}
