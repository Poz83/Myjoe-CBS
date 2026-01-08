import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { randomUUID } from 'crypto';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME } from '@/lib/r2';
import { getProject, updateProject } from '@/server/db/projects';
import { uploadFile, deleteFiles, generateR2Key, getSignedDownloadUrl } from '@/server/storage/r2';
import { getOpenAIClient } from '@/server/ai/openai-client';

// Valid sample IDs are strictly '1', '2', '3', or '4' to prevent path traversal
const VALID_SAMPLE_IDS = ['1', '2', '3', '4'] as const;

const selectSchema = z.object({
  selectedId: z.enum(VALID_SAMPLE_IDS),
});

/**
 * POST /api/projects/[id]/calibrate/select
 * Select a style anchor from calibration samples
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = selectSchema.safeParse(body);

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

    const { selectedId } = validationResult.data;

    // Verify project ownership
    const project = await getProject(projectId, user.id);

    // Download selected sample from temp location
    const tempKey = `users/${user.id}/projects/${projectId}/calibration/temp/${selectedId}.png`;
    
    const getCommand = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: tempKey,
    });

    const tempObject = await r2Client.send(getCommand);
    if (!tempObject.Body) {
      return NextResponse.json(
        { error: 'Selected sample not found', correlationId },
        { status: 404 }
      );
    }
    const imageBuffer = await streamToBuffer(tempObject.Body as NodeJS.ReadableStream);

    // Generate permanent R2 key for style anchor
    const permanentKey = generateR2Key('style_anchor', {
      userId: user.id,
      projectId,
    });

    // Upload to permanent location
    await uploadFile({
      key: permanentKey,
      body: imageBuffer,
      contentType: 'image/png',
      metadata: {
        projectId,
        type: 'style_anchor',
      },
    });

    // Generate style description using GPT-4o-mini vision
    const signedUrl = await getSignedDownloadUrl(permanentKey, 3600);
    
    const styleDescription = await generateStyleDescription(signedUrl);

    // Update project with style anchor
    await updateProject(projectId, user.id, {
      // @ts-ignore - these fields exist in the database but not in UpdateProjectInput type
      style_anchor_key: permanentKey,
      style_anchor_description: styleDescription,
    });

    // Clean up all temp calibration files (all 4 samples)
    const tempKeys = ['1', '2', '3', '4'].map(id => 
      `users/${user.id}/projects/${projectId}/calibration/temp/${id}.png`
    );
    await deleteFiles(tempKeys);

    // Generate signed URL for response
    const styleAnchorUrl = await getSignedDownloadUrl(permanentKey, 3600);

    return NextResponse.json({
      styleAnchorUrl,
      styleAnchorDescription: styleDescription,
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

    console.error('POST /api/projects/[id]/calibrate/select error:', error);
    Sentry.captureException(error, {
      tags: { correlationId, endpoint: 'POST /api/projects/[id]/calibrate/select' },
    });

    return NextResponse.json(
      { error: 'Failed to select style anchor', correlationId },
      { status: 500 }
    );
  }
}

/**
 * Helper: Convert readable stream to buffer with size limit
 */
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB max

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let totalSize = 0;

  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalSize += buffer.length;
    if (totalSize > MAX_IMAGE_SIZE) {
      throw new Error('Image exceeds maximum allowed size of 10MB');
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

/**
 * Helper: Generate style description using GPT-4o-mini
 */
async function generateStyleDescription(imageUrl: string): Promise<string> {
  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You describe coloring book art styles concisely. Focus on: line weight, complexity, shapes, and overall aesthetic. Keep it to 2-3 sentences.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
            {
              type: 'text',
              text: 'Describe the style of this coloring book page.',
            },
          ],
        },
      ],
      max_tokens: 150,
    });

    return response.choices[0].message.content || 'Style anchor selected';
  } catch (error) {
    console.error('Failed to generate style description:', error);
    // Fallback to generic description
    return 'Style anchor selected for consistent page generation';
  }
}
