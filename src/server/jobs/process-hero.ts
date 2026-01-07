import { createClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';
import {
  getJob,
  startJob,
  failJob,
  updateJob,
  updateJobItem,
  getJobItems,
  type Job,
} from '@/server/db/jobs';
import { createHero } from '@/server/db/heroes';
import {
  recordJobBlotSpend,
  finalizeJobBilling,
} from '@/server/billing/blots';
import { generateHeroSheet } from '@/server/ai/hero-generator';
import { createThumbnail } from '@/server/ai/cleanup';
import { uploadFile, generateR2Key } from '@/server/storage/r2';
import { BLOT_COSTS } from '@/lib/constants';
import type { Audience } from '@/lib/constants';

interface HeroJobMetadata {
  name: string;
  description: string;
  audience: Audience;
}

/**
 * Process a hero creation job
 * Orchestrates: generation → R2 upload → hero record creation
 */
export async function processHeroJob(jobId: string): Promise<void> {
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
  const metadata = job.metadata as unknown as HeroJobMetadata;

  // Validate metadata has required fields
  if (!metadata?.name || !metadata?.description || !metadata?.audience) {
    throw new Error('Job metadata missing required fields (name, description, audience)');
  }

  // 2. Mark job as processing
  await startJob(jobId);

  // Get job items
  const jobItems = await getJobItems(jobId);
  const jobItem = jobItems[0];

  if (!jobItem) {
    await failJob(jobId, 'No job item found');
    await finalizeJobBilling(userId, jobId);
    return;
  }

  // Mark item as processing
  await updateJobItem(jobItem.id, {
    status: 'processing',
    started_at: new Date().toISOString(),
  });

  try {
    // 3. Generate hero reference sheet
    console.log(`Generating hero sheet for job ${jobId}: ${metadata.name}`);

    const result = await generateHeroSheet({
      name: metadata.name,
      description: metadata.description,
      audience: metadata.audience,
    });

    // 4. Check for safety issues
    if (!result.success) {
      if (result.safetyIssue) {
        const errorMessage = result.suggestions?.length
          ? `Content blocked. Suggestions: ${result.suggestions.join(', ')}`
          : 'Content blocked by safety check';

        await failJob(jobId, errorMessage);
        await updateJobItem(jobItem.id, {
          status: 'failed',
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        });
        await finalizeJobBilling(userId, jobId);
        return;
      }

      await failJob(jobId, result.error || 'Hero generation failed');
      await updateJobItem(jobItem.id, {
        status: 'failed',
        error_message: result.error || 'Generation failed',
        completed_at: new Date().toISOString(),
      });
      await finalizeJobBilling(userId, jobId);
      return;
    }

    // 5. Generate hero ID for R2 keys
    const heroId = randomUUID();

    // 6. Generate R2 keys
    const referenceKey = generateR2Key('hero', {
      userId,
      heroId,
      extension: 'png',
    });

    // Generate thumbnail key (using a pattern similar to hero but for thumbnail)
    const thumbnailKey = `users/${userId}/heroes/${heroId}/thumbnail.jpg`;

    // 7. Create thumbnail from image buffer (300px)
    const thumbnailBuffer = await createThumbnail(result.imageBuffer!, 300);

    // 8. Upload to R2 (reference and thumbnail in parallel)
    await Promise.all([
      uploadFile({
        key: referenceKey,
        body: result.imageBuffer!,
        contentType: 'image/png',
      }),
      uploadFile({
        key: thumbnailKey,
        body: thumbnailBuffer,
        contentType: 'image/jpeg',
      }),
    ]);

    // 9. Create hero record
    await createHero({
      owner_id: userId,
      name: metadata.name,
      description: metadata.description,
      audience: metadata.audience,
      compiled_prompt: result.compiledPrompt || '',
      negative_prompt: result.negativePrompt || null,
      reference_key: referenceKey,
      thumbnail_key: thumbnailKey,
    });

    // 10. Record blot spend
    await recordJobBlotSpend(jobId, BLOT_COSTS.heroReferenceSheet);

    // 11. Mark job item complete
    await updateJobItem(jobItem.id, {
      status: 'completed',
      asset_key: referenceKey,
      completed_at: new Date().toISOString(),
    });

    // 12. Update job status to completed
    await updateJob(jobId, {
      status: 'completed',
      completed_items: 1,
      completed_at: new Date().toISOString(),
    });

    // 13. Finalize billing (refund unused blots if any)
    await finalizeJobBilling(userId, jobId);

    console.log(`Hero job ${jobId} completed successfully`);
  } catch (error) {
    console.error(`Hero job ${jobId} failed:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await failJob(jobId, errorMessage);
    await updateJobItem(jobItem.id, {
      status: 'failed',
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
    });
    await finalizeJobBilling(userId, jobId);

    throw error;
  }
}
