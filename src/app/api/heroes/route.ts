import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { randomUUID } from 'crypto';
import { getHeroes } from '@/server/db/heroes';
import { createJob, createJobItems } from '@/server/db/jobs';
import { checkBlotBalance, reserveBlots } from '@/server/billing/blots';
import { checkContentSafety } from '@/server/ai/content-safety';
import { triggerHeroJob } from '@/server/jobs';
import { getSignedDownloadUrl } from '@/server/storage/r2';
import { BLOT_COSTS } from '@/lib/constants';
import type { Audience } from '@/lib/constants';

/**
 * Validation schema for creating a hero
 */
const heroCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(500),
  audience: z.enum(['toddler', 'children', 'tween', 'teen', 'adult']),
});

/**
 * GET /api/heroes
 * List all heroes for the current user
 */
export async function GET() {
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

    const heroes = await getHeroes(user.id);

    // Add signed thumbnail URLs
    const heroesWithUrls = await Promise.all(
      heroes.map(async (hero) => {
        let thumbnailUrl: string | null = null;
        if (hero.thumbnail_key) {
          try {
            thumbnailUrl = await getSignedDownloadUrl(hero.thumbnail_key);
          } catch {
            // Ignore errors for missing thumbnails
          }
        }
        return {
          ...hero,
          thumbnailUrl,
        };
      })
    );

    return NextResponse.json({
      heroes: heroesWithUrls,
      correlationId,
    });
  } catch (error) {
    console.error('GET /api/heroes error:', error);
    Sentry.captureException(error, {
      tags: { correlationId, endpoint: 'GET /api/heroes' },
    });

    return NextResponse.json(
      { error: 'Failed to fetch heroes', correlationId },
      { status: 500 }
    );
  }
}

/**
 * POST /api/heroes
 * Start a new hero creation job
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
    const validationResult = heroCreateSchema.safeParse(body);

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

    const { name, description, audience } = validationResult.data;

    // Check content safety for the description
    const safetyResult = await checkContentSafety(description, audience as Audience);
    if (!safetyResult.safe) {
      return NextResponse.json(
        {
          error: 'Description not suitable for the target audience',
          blocked: safetyResult.blocked,
          suggestions: safetyResult.suggestions,
          correlationId,
        },
        { status: 400 }
      );
    }

    // Calculate blots required
    const blotsRequired = BLOT_COSTS.heroReferenceSheet;

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
      project_id: null, // Hero jobs don't have a project
      type: 'hero_creation',
      total_items: 1,
      metadata: { name, description, audience },
    });

    // Reserve blots
    await reserveBlots(user.id, blotsRequired, job.id);

    // Create job item (no page_id for hero jobs)
    await createJobItems(job.id, [{}]);

    // Trigger async job processing
    await triggerHeroJob(job.id);

    return NextResponse.json({
      jobId: job.id,
      status: 'pending',
      blotsReserved: blotsRequired,
      correlationId,
    });
  } catch (error) {
    console.error('POST /api/heroes error:', error);
    Sentry.captureException(error, {
      tags: { correlationId, endpoint: 'POST /api/heroes' },
    });

    return NextResponse.json(
      { error: 'Failed to start hero creation job', correlationId },
      { status: 500 }
    );
  }
}
