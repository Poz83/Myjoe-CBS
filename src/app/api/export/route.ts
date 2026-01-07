import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { randomUUID } from 'crypto';
import { getProject } from '@/server/db/projects';
import { createJob } from '@/server/db/jobs';
import { triggerExportJob } from '@/server/jobs';

/**
 * Validation schema for starting an export job
 */
const exportRequestSchema = z.object({
  projectId: z.string().uuid(),
  format: z.enum(['pdf', 'png_zip']),
});

/**
 * POST /api/export
 * Start a new export job
 */
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = exportRequestSchema.safeParse(body);

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

    const { projectId, format } = validationResult.data;

    // Get project with ownership verification
    let project;
    try {
      project = await getProject(projectId, user.id);
    } catch {
      return NextResponse.json(
        { error: 'Project not found or access denied', correlationId },
        { status: 404 }
      );
    }

    // Verify project has generated pages (status is 'ready')
    if (project.status !== 'ready' && project.status !== 'exported') {
      return NextResponse.json(
        {
          error: 'Project must have generated pages before exporting',
          status: project.status,
          correlationId,
        },
        { status: 400 }
      );
    }

    // Get pages count
    const totalPages = project.pages?.length || 0;
    if (totalPages === 0) {
      return NextResponse.json(
        { error: 'No pages to export', correlationId },
        { status: 400 }
      );
    }

    // Create export job (free - no blot reservation)
    const job = await createJob({
      owner_id: user.id,
      project_id: projectId,
      type: 'export',
      total_items: totalPages,
      metadata: { format },
    });

    // Trigger async job processing
    await triggerExportJob(job.id);

    return NextResponse.json({
      jobId: job.id,
      status: 'pending',
      totalPages,
      correlationId,
    });
  } catch (error) {
    console.error('POST /api/export error:', error);
    Sentry.captureException(error, {
      tags: { correlationId, endpoint: 'POST /api/export' },
    });

    return NextResponse.json(
      { error: 'Failed to start export job', correlationId },
      { status: 500 }
    );
  }
}
