import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { randomUUID } from 'crypto';
import { getProject } from '@/server/db/projects';
import { generateCalibrationSamples } from '@/server/ai/style-calibration';
import { uploadFile, getSignedDownloadUrl } from '@/server/storage/r2';
import { BLOT_COSTS } from '@/lib/constants';
import { InsufficientBlotsError } from '@/lib/errors';

/**
 * POST /api/projects/[id]/calibrate
 * Generate 4 style calibration samples for user to choose from
 */
export async function POST(
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

    // Verify project ownership
    const project = await getProject(projectId, user.id);

    // Check blot balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('blots')
      .eq('owner_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Failed to fetch profile', correlationId },
        { status: 500 }
      );
    }

    const requiredBlots = BLOT_COSTS.styleCalibration;

    if (profile.blots < requiredBlots) {
      return NextResponse.json(
        { 
          error: 'Insufficient blots', 
          required: requiredBlots,
          current: profile.blots,
          correlationId 
        },
        { status: 402 } // Payment Required
      );
    }

    // Deduct blots
    const { error: deductError } = await supabase
      .from('profiles')
      .update({ blots: profile.blots - requiredBlots })
      .eq('owner_id', user.id);

    if (deductError) {
      console.error('Failed to deduct blots:', deductError);
      Sentry.captureException(deductError, {
        tags: { correlationId, endpoint: 'POST /api/projects/[id]/calibrate' },
      });
      return NextResponse.json(
        { error: 'Failed to deduct blots', correlationId },
        { status: 500 }
      );
    }

    // Generate calibration samples
    const samples = await generateCalibrationSamples({
      subject: project.name,
      audience: project.audience as any,
      stylePreset: project.style_preset as any,
    });

    // Store samples in temporary R2 location and generate signed URLs
    const sampleUrls = await Promise.all(
      samples.map(async (sample) => {
        const tempKey = `users/${user.id}/projects/${projectId}/calibration/temp/${sample.id}.png`;
        
        // Upload to R2
        await uploadFile({
          key: tempKey,
          body: sample.imageBuffer,
          contentType: 'image/png',
          metadata: {
            variation: sample.variation,
            projectId,
          },
        });

        // Generate signed URL for preview
        const url = await getSignedDownloadUrl(tempKey, 3600); // 1 hour expiry

        return {
          id: sample.id,
          url,
        };
      })
    );

    return NextResponse.json({
      samples: sampleUrls,
      blotsSpent: requiredBlots,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Handle not found or forbidden
    if (errorMessage.includes('not found') || errorMessage.includes('access denied')) {
      return NextResponse.json(
        { error: 'Project not found', correlationId },
        { status: 404 }
      );
    }

    // Handle insufficient blots
    if (error instanceof InsufficientBlotsError) {
      return NextResponse.json(
        { error: error.message, correlationId },
        { status: 402 }
      );
    }

    console.error('POST /api/projects/[id]/calibrate error:', error);
    Sentry.captureException(error, {
      tags: { correlationId, endpoint: 'POST /api/projects/[id]/calibrate' },
    });

    return NextResponse.json(
      { error: 'Failed to generate calibration samples', correlationId },
      { status: 500 }
    );
  }
}
