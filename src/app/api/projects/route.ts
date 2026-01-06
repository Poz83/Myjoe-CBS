import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { getProjects, createProject } from '@/server/db/projects';
import { PROJECT_LIMITS, MAX_PAGES, AUDIENCES, STYLE_PRESETS } from '@/lib/constants';
import { randomUUID } from 'crypto';

/**
 * Validation schema for creating a project
 */
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  pageCount: z.number().int().min(1).max(MAX_PAGES),
  audience: z.enum(['toddler', 'children', 'tween', 'teen', 'adult']),
  stylePreset: z.enum(['bold-simple', 'kawaii', 'whimsical', 'cartoon', 'botanical']),
  trimSize: z.enum(['8.5x11', '8.5x8.5', '6x9']).default('8.5x11'),
  heroId: z.string().uuid().nullable().optional(),
});

/**
 * GET /api/projects
 * List all projects for the current user
 */
export async function GET(request: NextRequest) {
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

    const projects = await getProjects(user.id);

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('GET /api/projects error:', error);
    Sentry.captureException(error, {
      tags: { correlationId, endpoint: 'GET /api/projects' },
    });

    return NextResponse.json(
      { error: 'Failed to fetch projects', correlationId },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project
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
    const validationResult = createProjectSchema.safeParse(body);

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

    // Get user profile to check plan and project count
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan')
      .eq('owner_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Failed to fetch profile:', profileError);
      Sentry.captureException(profileError, {
        tags: { correlationId, endpoint: 'POST /api/projects' },
      });
      return NextResponse.json(
        { error: 'Failed to fetch user profile', correlationId },
        { status: 500 }
      );
    }

    // Count existing projects (non-deleted)
    const { count, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .is('deleted_at', null);

    if (countError) {
      console.error('Failed to count projects:', countError);
      Sentry.captureException(countError, {
        tags: { correlationId, endpoint: 'POST /api/projects' },
      });
      return NextResponse.json(
        { error: 'Failed to check project limit', correlationId },
        { status: 500 }
      );
    }

    // Check project limit
    const limit = PROJECT_LIMITS[profile.plan as keyof typeof PROJECT_LIMITS];
    if (count !== null && count >= limit) {
      return NextResponse.json(
        {
          error: `Project limit reached. Your ${profile.plan} plan allows ${limit} projects.`,
          correlationId,
        },
        { status: 403 }
      );
    }

    // Create project
    const project = await createProject(user.id, {
      name: input.name,
      description: input.description,
      pageCount: input.pageCount,
      audience: input.audience,
      stylePreset: input.stylePreset,
      trimSize: input.trimSize,
      heroId: input.heroId,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('POST /api/projects error:', error);
    Sentry.captureException(error, {
      tags: { correlationId, endpoint: 'POST /api/projects' },
    });

    return NextResponse.json(
      { error: 'Failed to create project', correlationId },
      { status: 500 }
    );
  }
}
