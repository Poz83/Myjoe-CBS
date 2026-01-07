import { processGenerationJob } from './process-generation';

/**
 * Trigger a generation job for async processing
 * Uses fire-and-forget pattern for MVP
 *
 * Future: Replace with queue-based processing (Vercel Queue, AWS SQS, etc.)
 */
export async function triggerGenerationJob(jobId: string): Promise<void> {
  // Fire and forget - don't await
  processGenerationJob(jobId).catch((error) => {
    console.error(`Generation job ${jobId} failed:`, error);
    // In production, capture to Sentry or similar
    // Sentry.captureException(error, { tags: { jobId } });
  });
}
