import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { randomUUID } from 'crypto';
import { getProject, updateProject } from '@/server/db/projects';
import { createJob, createJobItems } from '@/server/db/jobs';
import { checkBlotBalance, reserveBlots } from '@/server/billing/blots';
import { checkContentSafety } from '@/server/ai/content-safety';
import { triggerGenerationJob } from '@/server/jobs';
import { BLOT_COSTS } from '@/lib/constants';
import type { Audience } from '@/lib/constants';

/**
 * Validation schema for starting a generation job
 */
const generateRequestSchema = z.object({
  projectId: z.string().uuid(),
  idea: z.string().min(3).max(500),
  pageNumbers: z.array(z.number().int().positive()).optional(),
});

/**
 * POST /api/generate
 * Start a new page generation job
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
    const validationResult = generateRequestSchema.safeParse(body);

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

    const { projectId, idea, pageNumbers } = validationResult.data;

    // Get project with ownership verification
    let project;
    try {
      project = await getProject(projectId, user.id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Project not found or access denied', correlationId },
        { status: 404 }
      );
    }

    // Check content safety for the idea
    const safetyResult = await checkContentSafety(idea, project.audience as Audience);
    if (!safetyResult.safe) {
      return NextResponse.json(
        {
          error: 'Content not suitable for the target audience',
          blocked: safetyResult.blocked,
          suggestions: safetyResult.suggestions,
          correlationId,
        },
        { status: 400 }
      );
    }

    // Verify style anchor exists
    if (!project.style_anchor_key) {
      return NextResponse.json(
        {
          error: 'Style calibration required before generation',
          correlationId,
        },
        { status: 400 }
      );
    }

    // Get pages to generate
    const allPages = project.pages || [];
    let pagesToGenerate = allPages;

    if (pageNumbers && pageNumbers.length > 0) {
      // Filter by page numbers (using sort_order)
      pagesToGenerate = allPages.filter(page =>
        pageNumbers.includes(page.sort_order)
      );

      if (pagesToGenerate.length === 0) {
        return NextResponse.json(
          { error: 'No matching pages found for the specified page numbers', correlationId },
          { status: 400 }
        );
      }
    }

    if (pagesToGenerate.length === 0) {
      return NextResponse.json(
        { error: 'No pages to generate', correlationId },
        { status: 400 }
      );
    }

    // Calculate blots required
    const blotsRequired = pagesToGenerate.length * BLOT_COSTS.generatePage;

    // Check blot balance
    const balanceCheck = await checkBlotBalance(user.id, blotsRequired);
    if (!balanceCheck.sufficient) {
      return NextResponse.json(
        {
          error: 'Insufficient blots',
          required: balanceCheck.required,
          available: balanceCheck.available,
          shortfall: balanceCheck.shortfall,
          correlationId,
        },
        { status: 402 }
      );
    }

    // Create job with metadata
    const job = await createJob({
      owner_id: user.id,
      project_id: projectId,
      type: 'generation',
      total_items: pagesToGenerate.length,
      metadata: { idea, pageNumbers },
    });

    // Reserve blots
    await reserveBlots(user.id, blotsRequired, job.id);

    // Create job items for each page
    await createJobItems(
      job.id,
      pagesToGenerate.map(page => ({ page_id: page.id }))
    );

    // Update project status to 'generating'
    await updateProject(projectId, user.id, { status: 'generating' });

    // Trigger async job processing
    await triggerGenerationJob(job.id);

    return NextResponse.json({
      jobId: job.id,
      status: 'pending',
      totalItems: pagesToGenerate.length,
      blotsReserved: blotsRequired,
      correlationId,
    });
  } catch (error) {
    console.error('POST /api/generate error:', error);
    Sentry.captureException(error, {
      tags: { correlationId, endpoint: 'POST /api/generate' },
    });

    return NextResponse.json(
      { error: 'Failed to start generation job', correlationId },
      { status: 500 }
    );
  }
}
