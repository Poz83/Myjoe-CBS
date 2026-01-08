import { createClient } from '@/lib/supabase/server';
import {
  getJob,
  getJobItems,
  getPendingJobItems,
  startJob,
  failJob,
  updateJobItem,
  incrementJobProgress,
  type Job,
  type JobItem,
} from '@/server/db/jobs';
import { getProject, updateProject } from '@/server/db/projects';
import {
  createPageVersion,
  getNextVersionNumber,
  setCurrentVersion,
} from '@/server/db/pages';
import {
  recordJobBlotSpend,
  finalizeJobBilling,
} from '@/server/billing/blots';
import { planAndCompile, type CompiledPage } from '@/server/ai/planner-compiler';
import { generatePage } from '@/server/ai/generate-page';
import { createThumbnail } from '@/server/ai/cleanup';
import { uploadFile, generateR2Key, getSignedDownloadUrl } from '@/server/storage/r2';
import { BLOT_COSTS } from '@/lib/constants';
import type { Audience, StylePreset, TrimSize, FluxModel } from '@/lib/constants';

// Configuration
const BATCH_SIZE = 3;
const MAX_RETRIES = 2;

interface JobMetadata {
  idea: string;
  pageNumbers?: number[];
}

/**
 * Process a generation job
 * Orchestrates: planning → batch generation → page version creation
 */
export async function processGenerationJob(jobId: string): Promise<void> {
  const supabase = await createClient();

  // 1. Get job
  const { data: jobData, error: jobError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (jobError || !jobData) {
    throw new Error(`Job not found: ${jobId}`);
  }

  const job = jobData as Job;
  const userId = job.owner_id;
  const metadata = job.metadata as unknown as JobMetadata;

  // Validate metadata has required fields
  if (!metadata?.idea) {
    throw new Error('Job metadata missing required "idea" field');
  }

  // 2. Mark job as processing
  await startJob(jobId);

  try {
    // 3. Get project with hero
    const project = await getProject(job.project_id!, userId);
    const hero = project.hero;

    // 3b. If hero exists, get signed URL for reference image (for future ControlNet)
    let heroReferenceUrl: string | null = null;
    if (hero?.reference_key) {
      try {
        heroReferenceUrl = await getSignedDownloadUrl(hero.reference_key);
      } catch (error) {
        console.warn(`Failed to get hero reference URL for job ${jobId}:`, error);
      }
    }

    // 4. Get pending job items
    let pendingItems = await getPendingJobItems(jobId);

    if (pendingItems.length === 0) {
      // All items already processed
      await finalizeJobBilling(userId, jobId);
      await updateProject(job.project_id!, userId, { status: 'ready' });
      return;
    }

    // 5. Plan all pages using planner-compiler
    const planResult = await planAndCompile({
      userIdea: metadata.idea,
      pageCount: pendingItems.length,
      audience: project.audience as Audience,
      stylePreset: project.style_preset as StylePreset,
      lineWeight: project.line_weight,
      complexity: project.complexity,
      heroDescription: hero?.compiled_prompt,
      heroReferenceUrl, // For future ControlNet/image-guided generation
      fluxModel: 'flux-lineart' as FluxModel,
    });

    // 6. Check for safety issues in planning
    if (!planResult.success) {
      if (planResult.safetyIssue) {
        await failJob(jobId, `Content blocked: ${planResult.error || 'Safety check failed'}`);
        await finalizeJobBilling(userId, jobId);
        return;
      }
      await failJob(jobId, planResult.error || 'Planning failed');
      await finalizeJobBilling(userId, jobId);
      return;
    }

    // 7. Map compiled pages to job items
    const compiledPages = planResult.pages!;
    const itemPageMap = pendingItems.map((item, index) => ({
      item,
      compiled: compiledPages[index],
    }));

    // 8. Process in batches
    for (let i = 0; i < itemPageMap.length; i += BATCH_SIZE) {
      // Check if job was cancelled mid-processing
      const currentJob = await getJob(jobId, userId);
      if (currentJob.status === 'cancelled') {
        break;
      }

      const batch = itemPageMap.slice(i, i + BATCH_SIZE);

      // Process batch concurrently
      await Promise.all(
        batch.map(({ item, compiled }) =>
          processJobItem(jobId, item, compiled, project, userId)
        )
      );
    }

    // 9. Finalize job billing (refund unused blots)
    await finalizeJobBilling(userId, jobId);

    // 10. Update project status
    // Check final job status before updating project
    const finalJob = await getJob(jobId, userId);
    if (finalJob.status !== 'cancelled') {
      await updateProject(job.project_id!, userId, { status: 'ready' });
    }
  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await failJob(jobId, errorMessage);
    await finalizeJobBilling(userId, jobId);
    throw error;
  }
}

/**
 * Process a single job item (page generation)
 */
async function processJobItem(
  jobId: string,
  item: JobItem,
  compiled: CompiledPage,
  project: Awaited<ReturnType<typeof getProject>>,
  userId: string
): Promise<void> {
  const pageId = item.page_id!;

  // Mark item as processing
  await updateJobItem(item.id, {
    status: 'processing',
    started_at: new Date().toISOString(),
  });

  try {
    // Generate page image
    const result = await generatePage({
      compiledPrompt: compiled.compiledPrompt,
      negativePrompt: compiled.negativePrompt,
      audience: project.audience as Audience,
      fluxModel: 'flux-lineart' as FluxModel,
      trimSize: project.trim_size as TrimSize,
      maxRetries: MAX_RETRIES,
    });

    if (!result.success) {
      throw new Error(result.error || 'Generation failed');
    }

    // Get next version number
    const version = await getNextVersionNumber(pageId);

    // Generate R2 keys
    const assetKey = generateR2Key('page', {
      userId,
      projectId: project.id,
      pageId,
      version,
    });

    const thumbnailKey = generateR2Key('thumbnail', {
      userId,
      projectId: project.id,
      pageId,
    });

    // Create thumbnail
    const thumbnailBuffer = await createThumbnail(result.imageBuffer!, 300);

    // Upload to R2 (full image and thumbnail)
    await Promise.all([
      uploadFile({
        key: assetKey,
        body: result.imageBuffer!,
        contentType: 'image/png',
      }),
      uploadFile({
        key: thumbnailKey,
        body: thumbnailBuffer,
        contentType: 'image/jpeg',
      }),
    ]);

    // Create page version record
    await createPageVersion({
      page_id: pageId,
      version,
      asset_key: assetKey,
      thumbnail_key: thumbnailKey,
      compiled_prompt: compiled.compiledPrompt,
      negative_prompt: compiled.negativePrompt,
      seed: result.seed?.toString() || null,
      quality_score: result.qualityScore || null,
      quality_status: result.needsReview ? 'needs_review' : 'pass',
      edit_type: 'initial',
      blots_spent: BLOT_COSTS.generatePage,
    });

    // Update page's current_version
    await setCurrentVersion(pageId, version);

    // Record blot spend
    await recordJobBlotSpend(jobId, BLOT_COSTS.generatePage);

    // Mark item complete
    await updateJobItem(item.id, {
      status: 'completed',
      asset_key: assetKey,
      completed_at: new Date().toISOString(),
    });

    // Increment job progress
    await incrementJobProgress(jobId, true);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to process job item ${item.id}:`, errorMessage);

    // Check retry count
    if (item.retry_count < MAX_RETRIES) {
      // Increment retry and re-queue
      await updateJobItem(item.id, {
        retry_count: item.retry_count + 1,
        status: 'pending',
        error_message: `Retry ${item.retry_count + 1}: ${errorMessage}`,
      });
    } else {
      // Max retries exceeded - fail item
      await updateJobItem(item.id, {
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      });

      await incrementJobProgress(jobId, false);
    }
  }
}
