import { createClient } from '@/lib/supabase/server';
import {
  startJob,
  failJob,
  updateJob,
  type Job,
} from '@/server/db/jobs';
import { getProject, updateProject } from '@/server/db/projects';
import { getProjectPagesWithVersions } from '@/server/db/pages';
import { uploadFile, generateR2Key, getSignedDownloadUrl } from '@/server/storage/r2';
import { generateInteriorPDF, generateExportZip } from '@/server/export/pdf-generator';

interface ExportMetadata {
  format: 'pdf' | 'png_zip';
  assetKey?: string;
}

/**
 * Process an export job
 * Orchestrates: fetch pages → generate PDF/ZIP → upload to R2
 */
export async function processExportJob(jobId: string): Promise<void> {
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
  const metadata = job.metadata as unknown as ExportMetadata;

  // Validate metadata
  if (!metadata?.format) {
    await failJob(jobId, 'Job metadata missing required "format" field');
    return;
  }

  // 2. Mark job as processing
  await startJob(jobId);

  try {
    // 3. Get project
    const project = await getProject(job.project_id!, userId);

    // 4. Get all pages with current versions
    const pagesWithVersions = await getProjectPagesWithVersions(job.project_id!);

    if (pagesWithVersions.length === 0) {
      await failJob(jobId, 'No pages to export');
      return;
    }

    // 5. Fetch all page images from R2 in parallel
    const pageImagePromises = pagesWithVersions.map(async (page) => {
      if (!page.current_version_data?.asset_key) {
        throw new Error(`Page ${page.id} has no current version image`);
      }

      // Get signed URL and fetch image
      const imageUrl = await getSignedDownloadUrl(page.current_version_data.asset_key);
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch image for page ${page.id}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return {
        sortOrder: page.sort_order,
        imageBuffer: Buffer.from(arrayBuffer),
      };
    });

    const pages = await Promise.all(pageImagePromises);

    // 6. Generate PDF or ZIP based on format
    let exportBuffer: Buffer;
    let extension: string;
    let contentType: string;

    if (metadata.format === 'pdf') {
      exportBuffer = await generateInteriorPDF({
        projectId: project.id,
        projectName: project.name,
        trimSize: project.trim_size,
        pages,
      });
      extension = 'pdf';
      contentType = 'application/pdf';
    } else {
      exportBuffer = await generateExportZip({
        projectId: project.id,
        projectName: project.name,
        trimSize: project.trim_size,
        pages,
      });
      extension = 'zip';
      contentType = 'application/zip';
    }

    // 7. Upload to R2
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const assetKey = `users/${userId}/projects/${project.id}/exports/${timestamp}-${random}.${extension}`;

    await uploadFile({
      key: assetKey,
      body: exportBuffer,
      contentType,
    });

    // 8. Update job with asset key and mark completed
    await updateJob(jobId, {
      status: 'completed',
      completed_items: pagesWithVersions.length,
      completed_at: new Date().toISOString(),
    });

    // Update metadata with asset key
    await supabase
      .from('jobs')
      .update({
        metadata: {
          ...metadata,
          assetKey,
        },
      })
      .eq('id', jobId);

    // 9. Update project status to 'exported'
    await updateProject(job.project_id!, userId, { status: 'exported' });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Export job ${jobId} failed:`, error);
    await failJob(jobId, errorMessage);
    throw error;
  }
}
