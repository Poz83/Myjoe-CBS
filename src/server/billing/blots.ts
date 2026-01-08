import { createClient } from '@/lib/supabase/server';
import { InsufficientBlotsError, NotFoundError } from '@/lib/errors';

// ============================================================================
// Types
// ============================================================================

export interface BlotBalance {
  userId: string;
  blots: number;
  plan: 'free' | 'creator' | 'studio';
}

export interface BlotCheckResult {
  sufficient: boolean;
  available: number;
  required: number;
  shortfall: number;
}

export interface BlotSpendResult {
  success: boolean;
  amountSpent: number;
  newBalance: number;
  reason: string;
}

export interface BlotReservation {
  success: boolean;
  amountReserved: number;
  newBalance: number;
  jobId: string;
}

export interface BlotRefund {
  success: boolean;
  amountRefunded: number;
  newBalance: number;
  reason: string;
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get current blot balance for a user
 */
export async function getBlotBalance(userId: string): Promise<BlotBalance> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('blots, plan')
    .eq('owner_id', userId)
    .single();

  if (error || !profile) {
    throw new NotFoundError('User profile');
  }

  return {
    userId,
    blots: profile.blots,
    plan: profile.plan as BlotBalance['plan'],
  };
}

/**
 * Check if user has sufficient blots
 */
export async function checkBlotBalance(
  userId: string,
  required: number
): Promise<BlotCheckResult> {
  const balance = await getBlotBalance(userId);

  const sufficient = balance.blots >= required;
  const shortfall = sufficient ? 0 : required - balance.blots;

  return {
    sufficient,
    available: balance.blots,
    required,
    shortfall,
  };
}

/**
 * Spend blots for a specific action
 * Throws InsufficientBlotsError if not enough blots
 */
export async function spendBlots(
  userId: string,
  amount: number,
  reason: string
): Promise<BlotSpendResult> {
  const supabase = await createClient();

  // Get current balance
  const balance = await getBlotBalance(userId);

  if (balance.blots < amount) {
    throw new InsufficientBlotsError(amount, balance.blots);
  }

  const newBalance = balance.blots - amount;

  // Deduct blots
  const { error } = await supabase
    .from('profiles')
    .update({ blots: newBalance })
    .eq('owner_id', userId);

  if (error) {
    throw new Error(`Failed to spend blots: ${error.message}`);
  }


  return {
    success: true,
    amountSpent: amount,
    newBalance,
    reason,
  };
}

/**
 * Reserve blots for a job (doesn't deduct from balance yet)
 * Updates job.blots_reserved
 */
export async function reserveBlots(
  userId: string,
  amount: number,
  jobId: string
): Promise<BlotReservation> {
  const supabase = await createClient();

  // Check if user has enough blots
  const balance = await getBlotBalance(userId);

  if (balance.blots < amount) {
    throw new InsufficientBlotsError(amount, balance.blots);
  }

  const newBalance = balance.blots - amount;

  // Deduct blots from user
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ blots: newBalance })
    .eq('owner_id', userId);

  if (profileError) {
    throw new Error(`Failed to reserve blots: ${profileError.message}`);
  }

  // Update job's blots_reserved
  const { error: jobError } = await supabase
    .from('jobs')
    .update({ blots_reserved: amount })
    .eq('id', jobId);

  if (jobError) {
    // Rollback the profile update
    await supabase
      .from('profiles')
      .update({ blots: balance.blots })
      .eq('owner_id', userId);

    throw new Error(`Failed to update job blots_reserved: ${jobError.message}`);
  }


  return {
    success: true,
    amountReserved: amount,
    newBalance,
    jobId,
  };
}

/**
 * Refund unused blots from a job
 * Updates user balance and job.blots_refunded
 */
export async function refundBlots(
  userId: string,
  amount: number,
  jobId: string,
  reason: string
): Promise<BlotRefund> {
  const supabase = await createClient();

  if (amount <= 0) {
    return {
      success: true,
      amountRefunded: 0,
      newBalance: (await getBlotBalance(userId)).blots,
      reason: 'No refund needed',
    };
  }

  // Get current balance
  const balance = await getBlotBalance(userId);
  const newBalance = balance.blots + amount;

  // Add blots back to user
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ blots: newBalance })
    .eq('owner_id', userId);

  if (profileError) {
    throw new Error(`Failed to refund blots: ${profileError.message}`);
  }

  // Get current job refunded amount
  const { data: job } = await supabase
    .from('jobs')
    .select('blots_refunded')
    .eq('id', jobId)
    .single();

  const currentRefunded = job?.blots_refunded || 0;

  // Update job's blots_refunded
  const { error: jobError } = await supabase
    .from('jobs')
    .update({ blots_refunded: currentRefunded + amount })
    .eq('id', jobId);

  if (jobError) {
    console.error(`Failed to update job blots_refunded: ${jobError.message}`);
    // Don't rollback - user already has their blots back
  }


  return {
    success: true,
    amountRefunded: amount,
    newBalance,
    reason,
  };
}

/**
 * Record blots spent on a job item
 * Updates job.blots_spent
 */
export async function recordJobBlotSpend(
  jobId: string,
  amount: number
): Promise<void> {
  const supabase = await createClient();

  // Get current spent amount
  const { data: job, error: fetchError } = await supabase
    .from('jobs')
    .select('blots_spent')
    .eq('id', jobId)
    .single();

  if (fetchError || !job) {
    throw new NotFoundError('Job');
  }

  // Update blots_spent
  const { error } = await supabase
    .from('jobs')
    .update({ blots_spent: job.blots_spent + amount })
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to record job blot spend: ${error.message}`);
  }
}

/**
 * Calculate refund amount for a job based on reserved vs spent
 */
export async function calculateJobRefund(jobId: string): Promise<number> {
  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from('jobs')
    .select('blots_reserved, blots_spent, blots_refunded')
    .eq('id', jobId)
    .single();

  if (error || !job) {
    throw new NotFoundError('Job');
  }

  // Refund = reserved - spent - already_refunded
  const refundAmount = job.blots_reserved - job.blots_spent - job.blots_refunded;
  return Math.max(0, refundAmount);
}

/**
 * Finalize job billing: refund unused blots
 */
export async function finalizeJobBilling(
  userId: string,
  jobId: string
): Promise<BlotRefund> {
  const refundAmount = await calculateJobRefund(jobId);

  if (refundAmount > 0) {
    return refundBlots(userId, refundAmount, jobId, 'Job completed - unused blots');
  }

  const balance = await getBlotBalance(userId);
  return {
    success: true,
    amountRefunded: 0,
    newBalance: balance.blots,
    reason: 'No refund needed - all blots used',
  };
}

/**
 * Add blots to a user's balance (for purchases)
 */
export async function addBlots(
  userId: string,
  amount: number,
  reason: string
): Promise<BlotSpendResult> {
  const supabase = await createClient();

  const balance = await getBlotBalance(userId);
  const newBalance = balance.blots + amount;

  const { error } = await supabase
    .from('profiles')
    .update({ blots: newBalance })
    .eq('owner_id', userId);

  if (error) {
    throw new Error(`Failed to add blots: ${error.message}`);
  }


  return {
    success: true,
    amountSpent: -amount, // Negative indicates addition
    newBalance,
    reason,
  };
}
