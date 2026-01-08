import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { randomUUID } from 'crypto';
import {
  getPage,
  getCurrentPageVersion,
  getNextVersionNumber,
  createPageVersion,
  setCurrentVersion,
  type EditType
} from '@/server/db/pages';
import { getProject } from '@/server/db/projects';
import { checkContentSafety } from '@/server/ai/content-safety';
import { checkBlotBalance, spendBlots } from '@/server/billing/blots';
import { inpaintImage } from '@/server/ai/inpaint';
import { uploadFile, getSignedDownloadUrl, generateR2Key } from '@/server/storage/r2';
import { createAsset } from '@/server/storage/assets';
import { BLOT_COSTS, LINE_WEIGHT_PROMPTS, COMPLEXITY_PROMPTS } from '@/lib/constants';
import type { Audience } from '@/types/domain';
import { rateLimit } from '@/lib/rate-limit';

// Data URL regex for validating base64 PNG images
const DATA_URL_REGEX = /^data:image\/png;base64,[A-Za-z0-9+/]+=*$/;

const editRequestSchema = z.object({
  type: z.enum(['regenerate', 'inpaint', 'quick_action']),
  prompt: z.string().max(500).optional(),
  maskDataUrl: z.string()
    .refine(
      (val) => !val || DATA_URL_REGEX.test(val),
      { message: 'Invalid mask data URL format - must be a base64 PNG data URL' }
    )
    .optional(),
});

/**
 * POST /api/pages/[pageId]/edit
 * Edit a page (regenerate, inpaint, or quick action)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { pageId: string } }
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

    // Rate limit: expensive operation (page editing)
    const rateLimitResult = rateLimit(user.id, 'expensive');
    if (rateLimitResult) return rateLimitResult;

    const pageId = params.pageId;

    // Validate UUID format
    if (!z.string().uuid().safeParse(pageId).success) {
      return NextResponse.json(
        { error: 'Invalid page ID', correlationId },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = editRequestSchema.safeParse(body);

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

    const { type, prompt, maskDataUrl } = validationResult.data;

    // Get page with ownership check
    const page = await getPage(pageId, user.id);

    // Get project for context (audience, style)
    const project = await getProject(page.project_id, user.id);
    const audience = project.audience as Audience;

    // Check content safety if prompt provided
    if (prompt) {
      const safetyResult = await checkContentSafety(prompt, audience);
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
    }

    // Calculate blot cost
    const blotCost = BLOT_COSTS.editPage;

    // Check blot balance
    const balanceCheck = await checkBlotBalance(user.id, blotCost);
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

    // Get current version for context
    const currentVersion = await getCurrentPageVersion(pageId);

    // Build style context from project DNA
    const styleContext = [
      LINE_WEIGHT_PROMPTS[project.line_weight as keyof typeof LINE_WEIGHT_PROMPTS],
      COMPLEXITY_PROMPTS[project.complexity as keyof typeof COMPLEXITY_PROMPTS],
      `Style: ${project.style_preset}`,
    ].join('. ');

    let newImageBuffer: Buffer;
    let compiledPrompt: string;
    let editType: EditType = type;

    if (type === 'inpaint' && maskDataUrl) {
      // Inpainting flow
      if (!prompt) {
        return NextResponse.json(
          { error: 'Prompt is required for inpainting', correlationId },
          { status: 400 }
        );
      }

      // Get current image with error handling
      const currentImageUrl = await getSignedDownloadUrl(currentVersion.asset_key);
      let currentImageBuffer: Buffer;
      try {
        const currentImageResponse = await fetch(currentImageUrl);
        if (!currentImageResponse.ok) {
          throw new Error(`Failed to fetch current image: ${currentImageResponse.status}`);
        }
        currentImageBuffer = Buffer.from(await currentImageResponse.arrayBuffer());
      } catch (fetchError) {
        console.error('Failed to fetch current image:', fetchError);
        return NextResponse.json(
          { error: 'Failed to retrieve current page image', correlationId },
          { status: 500 }
        );
      }

      // Convert mask data URL to buffer (already validated by schema)
      const maskParts = maskDataUrl.split(',');
      if (maskParts.length !== 2) {
        return NextResponse.json(
          { error: 'Invalid mask data URL format', correlationId },
          { status: 400 }
        );
      }
      const maskBase64 = maskParts[1];
      const maskBuffer = Buffer.from(maskBase64, 'base64');

      // Call inpaint function
      newImageBuffer = await inpaintImage({
        originalImage: currentImageBuffer,
        maskImage: maskBuffer,
        prompt,
        styleContext,
      });

      compiledPrompt = `[Inpaint] ${prompt}. ${styleContext}`;
    } else if (type === 'regenerate') {
      // Regenerate flow - generate new image with same scene brief
      // For now, return error as we need the Flux generator
      return NextResponse.json(
        { error: 'Regenerate not yet implemented', correlationId },
        { status: 501 }
      );
    } else if (type === 'quick_action') {
      // Quick action flow (simplify, add detail)
      // For now, return error as we need the Flux generator
      return NextResponse.json(
        { error: 'Quick actions not yet implemented', correlationId },
        { status: 501 }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid edit type or missing required fields', correlationId },
        { status: 400 }
      );
    }

    // Spend blots
    await spendBlots(user.id, blotCost, `Page edit: ${type}`);

    // Get next version number
    const nextVersion = await getNextVersionNumber(pageId);

    // Upload new image to R2
    const r2Key = generateR2Key('page', {
      userId: user.id,
      projectId: page.project_id,
      pageId: page.id,
      version: nextVersion,
    });

    await uploadFile({
      key: r2Key,
      body: newImageBuffer,
      contentType: 'image/png',
    });

    // Create asset record
    await createAsset({
      userId: user.id,
      type: 'page',
      r2Key,
      sizeBytes: newImageBuffer.length,
      contentType: 'image/png',
      projectId: page.project_id,
    });

    // Upload mask to R2 if inpainting
    let editMaskKey: string | null = null;
    if (type === 'inpaint' && maskDataUrl) {
      const maskBase64 = maskDataUrl.split(',')[1];
      const maskBuffer = Buffer.from(maskBase64, 'base64');
      editMaskKey = `users/${user.id}/projects/${page.project_id}/pages/${page.id}/mask-v${nextVersion}.png`;

      await uploadFile({
        key: editMaskKey,
        body: maskBuffer,
        contentType: 'image/png',
      });
    }

    // Create new page version
    const newVersion = await createPageVersion({
      page_id: pageId,
      version: nextVersion,
      asset_key: r2Key,
      compiled_prompt: compiledPrompt,
      edit_type: editType,
      edit_prompt: prompt || null,
      edit_mask_key: editMaskKey,
      blots_spent: blotCost,
    });

    // Update current version pointer
    await setCurrentVersion(pageId, nextVersion);

    // Get signed URL for new image
    const newImageUrl = await getSignedDownloadUrl(r2Key);

    // Get updated page
    const updatedPage = await getPage(pageId, user.id);

    return NextResponse.json({
      success: true,
      page: updatedPage,
      version: newVersion,
      imageUrl: newImageUrl,
      correlationId,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Handle specific errors
    if (errorMessage.includes('not found')) {
      return NextResponse.json(
        { error: 'Page not found', correlationId },
        { status: 404 }
      );
    }

    if (errorMessage.includes('forbidden') || errorMessage.includes('access')) {
      return NextResponse.json(
        { error: 'Access denied', correlationId },
        { status: 403 }
      );
    }

    if (errorMessage.includes('Insufficient blots')) {
      return NextResponse.json(
        { error: errorMessage, correlationId },
        { status: 402 }
      );
    }

    console.error('POST /api/pages/[pageId]/edit error:', error);
    Sentry.captureException(error, {
      tags: { correlationId, endpoint: 'POST /api/pages/[pageId]/edit' },
    });

    return NextResponse.json(
      { error: 'Failed to edit page', correlationId },
      { status: 500 }
    );
  }
}
