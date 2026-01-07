import { createClient } from '@/lib/supabase/server';
import { NotFoundError, ForbiddenError } from '@/lib/errors';

// ============================================================================
// Types
// ============================================================================

export type JobType = 'generation' | 'export' | 'hero_creation';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type JobItemStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';

export interface Job {
  id: string;
  owner_id: string;
  project_id: string | null;
  type: JobType;
  status: JobStatus;
  total_items: number;
  completed_items: number;
  failed_items: number;
  blots_reserved: number;
  blots_spent: number;
  blots_refunded: number;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface JobInsert {
  owner_id: string;
  project_id?: string | null;
  type: JobType;
  total_items?: number;
  blots_reserved?: number;
  metadata?: Record<string, unknown>;
}

export interface JobUpdate {
  status?: JobStatus;
  total_items?: number;
  completed_items?: number;
  failed_items?: number;
  blots_spent?: number;
  blots_refunded?: number;
  error_message?: string | null;
  started_at?: string;
  completed_at?: string;
}

export interface JobItem {
  id: string;
  job_id: string;
  page_id: string | null;
  status: JobItemStatus;
  retry_count: number;
  asset_key: string | null;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface JobItemInsert {
  job_id: string;
  page_id?: string | null;
}

export interface JobItemUpdate {
  status?: JobItemStatus;
  retry_count?: number;
  asset_key?: string | null;
  error_message?: string | null;
  started_at?: string;
  completed_at?: string;
}

// ============================================================================
// Job Functions
// ============================================================================

/**
 * Create a new job record
 */
export async function createJob(data: JobInsert): Promise<Job> {
  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from('jobs')
    .insert({
      owner_id: data.owner_id,
      project_id: data.project_id || null,
      type: data.type,
      total_items: data.total_items || 0,
      blots_reserved: data.blots_reserved || 0,
      metadata: data.metadata || {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create job: ${error.message}`);
  }

  return job as Job;
}

/**
 * Create multiple job items (batch insert)
 */
export async function createJobItems(
  jobId: string,
  items: Omit<JobItemInsert, 'job_id'>[]
): Promise<JobItem[]> {
  const supabase = await createClient();

  const insertData = items.map(item => ({
    job_id: jobId,
    page_id: item.page_id || null,
  }));

  const { data: jobItems, error } = await supabase
    .from('job_items')
    .insert(insertData)
    .select();

  if (error) {
    throw new Error(`Failed to create job items: ${error.message}`);
  }

  return jobItems as JobItem[];
}

/**
 * Get a job with ownership verification
 */
export async function getJob(jobId: string, userId: string): Promise<Job> {
  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error || !job) {
    throw new NotFoundError('Job');
  }

  if (job.owner_id !== userId) {
    throw new ForbiddenError('Access to this job is forbidden');
  }

  return job as Job;
}

/**
 * Get all items for a job
 */
export async function getJobItems(jobId: string): Promise<JobItem[]> {
  const supabase = await createClient();

  const { data: items, error } = await supabase
    .from('job_items')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch job items: ${error.message}`);
  }

  return items as JobItem[];
}

/**
 * Update a job's status and progress
 */
export async function updateJob(jobId: string, data: JobUpdate): Promise<Job> {
  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from('jobs')
    .update(data)
    .eq('id', jobId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update job: ${error.message}`);
  }

  return job as Job;
}

/**
 * Update a job item's status
 */
export async function updateJobItem(itemId: string, data: JobItemUpdate): Promise<JobItem> {
  const supabase = await createClient();

  const { data: item, error } = await supabase
    .from('job_items')
    .update(data)
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update job item: ${error.message}`);
  }

  return item as JobItem;
}

/**
 * Get pending job items for processing
 */
export async function getPendingJobItems(jobId: string): Promise<JobItem[]> {
  const supabase = await createClient();

  const { data: items, error } = await supabase
    .from('job_items')
    .select('*')
    .eq('job_id', jobId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch pending job items: ${error.message}`);
  }

  return items as JobItem[];
}

/**
 * Increment completed/failed counts and update job status
 */
export async function incrementJobProgress(
  jobId: string,
  success: boolean
): Promise<Job> {
  const supabase = await createClient();

  // Get current job state
  const { data: currentJob, error: fetchError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (fetchError || !currentJob) {
    throw new NotFoundError('Job');
  }

  const newCompleted = success 
    ? currentJob.completed_items + 1 
    : currentJob.completed_items;
  const newFailed = !success 
    ? currentJob.failed_items + 1 
    : currentJob.failed_items;

  // Check if job is complete
  const totalProcessed = newCompleted + newFailed;
  const isComplete = totalProcessed >= currentJob.total_items;

  const updateData: JobUpdate = {
    completed_items: newCompleted,
    failed_items: newFailed,
  };

  if (isComplete) {
    updateData.status = newFailed === currentJob.total_items ? 'failed' : 'completed';
    updateData.completed_at = new Date().toISOString();
  }

  return updateJob(jobId, updateData);
}

/**
 * Mark job as started
 */
export async function startJob(jobId: string): Promise<Job> {
  return updateJob(jobId, {
    status: 'processing',
    started_at: new Date().toISOString(),
  });
}

/**
 * Mark job as failed with error message
 */
export async function failJob(jobId: string, errorMessage: string): Promise<Job> {
  return updateJob(jobId, {
    status: 'failed',
    error_message: errorMessage,
    completed_at: new Date().toISOString(),
  });
}

/**
 * Cancel a job
 */
export async function cancelJob(jobId: string): Promise<Job> {
  return updateJob(jobId, {
    status: 'cancelled',
    completed_at: new Date().toISOString(),
  });
}
