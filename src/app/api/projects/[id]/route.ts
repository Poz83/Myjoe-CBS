import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { getProject, updateProject, deleteProject } from '@/server/db/projects';
import { randomUUID } from 'crypto';

/**
 * Validation schema for updating a project
 * Only allows updating specific fields - DNA is immutable
 */
const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  heroId: z.string().uuid().nullable().optional(),
  status: z.enum(['draft', 'generating', 'ready', 'exported']).optional(),
});

/**
 * GET /api/projects/[id]
 * Fetch a single project with hero and pages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const projectId = params.id;

    // Validate UUID format
    if (!z.string().uuid().safeParse(projectId).success) {
      return NextResponse.json(
        { error: 'Invalid project ID', correlationId },
        { status: 400 }
      );
    }

    const project = await getProject(projectId, user.id);

    return NextResponse.json(project);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Handle not found
    if (errorMessage.includes('not found') || errorMessage.includes('access denied')) {
      return NextResponse.json(
        { error: 'Project not found', correlationId },
        { status: 404 }
      );
    }

    console.error('GET /api/projects/[id] error:', error);
    Sentry.captureException(error, {
      tags: { correlationId, endpoint: 'GET /api/projects/[id]' },
    });

    return NextResponse.json(
      { error: 'Failed to fetch project', correlationId },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/[id]
 * Update a project (only allowed fields)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const projectId = params.id;

    // Validate UUID format
    if (!z.string().uuid().safeParse(projectId).success) {
      return NextResponse.json(
        { error: 'Invalid project ID', correlationId },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateProjectSchema.safeParse(body);

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

    const input = validationResult.data;

    // Check if trying to update DNA fields (not allowed)
    const dnaFields = ['audience', 'stylePreset', 'pageCount', 'lineWeight', 'complexity', 'trimSize'];
    const attemptedDnaUpdate = Object.keys(body).some(key => 
      dnaFields.includes(key)
    );

    if (attemptedDnaUpdate) {
      return NextResponse.json(
        {
          error: 'Cannot modify project DNA fields (audience, stylePreset, pageCount, etc.)',
          correlationId,
        },
        { status: 400 }
      );
    }

    const project = await updateProject(projectId, user.id, input);

    return NextResponse.json(project);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Handle not found or forbidden
    if (errorMessage.includes('not found') || errorMessage.includes('access denied')) {
      return NextResponse.json(
        { error: 'Project not found', correlationId },
        { status: 404 }
      );
    }

    console.error('PATCH /api/projects/[id] error:', error);
    Sentry.captureException(error, {
      tags: { correlationId, endpoint: 'PATCH /api/projects/[id]' },
    });

    return NextResponse.json(
      { error: 'Failed to update project', correlationId },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Soft delete a project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const projectId = params.id;

    // Validate UUID format
    if (!z.string().uuid().safeParse(projectId).success) {
      return NextResponse.json(
        { error: 'Invalid project ID', correlationId },
        { status: 400 }
      );
    }

    await deleteProject(projectId, user.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Handle not found or forbidden
    if (errorMessage.includes('not found') || errorMessage.includes('access denied')) {
      return NextResponse.json(
        { error: 'Project not found', correlationId },
        { status: 404 }
      );
    }

    console.error('DELETE /api/projects/[id] error:', error);
    Sentry.captureException(error, {
      tags: { correlationId, endpoint: 'DELETE /api/projects/[id]' },
    });

    return NextResponse.json(
      { error: 'Failed to delete project', correlationId },
      { status: 500 }
    );
  }
}
