import { createClient } from '@/lib/supabase/server';
import { getFileMetadata } from './r2';

/**
 * Check if user has enough storage quota
 */
export async function checkStorageQuota(userId: string, additionalBytes: number = 0): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}> {
  const supabase = await createClient();
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('storage_used_bytes, storage_limit_bytes')
    .eq('owner_id', userId)
    .single();

  if (error || !profile) {
    throw new Error('Profile not found');
  }

  const used = profile.storage_used_bytes || 0;
  const limit = profile.storage_limit_bytes || 0;
  const remaining = limit - used;
  const allowed = remaining >= additionalBytes;

  return {
    allowed,
    used,
    limit,
    remaining,
  };
}

/**
 * Update storage usage after upload
 */
export async function incrementStorageUsage(userId: string, bytes: number): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase.rpc('increment_storage', {
    p_user_id: userId,
    p_bytes: bytes,
  });

  if (error) {
    // Fallback to direct update if RPC doesn't exist
    const { data: profile } = await supabase
      .from('profiles')
      .select('storage_used_bytes')
      .eq('owner_id', userId)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({
          storage_used_bytes: (profile.storage_used_bytes || 0) + bytes,
        })
        .eq('owner_id', userId);
    }
  }
}

/**
 * Update storage usage after delete
 */
export async function decrementStorageUsage(userId: string, bytes: number): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase.rpc('decrement_storage', {
    p_user_id: userId,
    p_bytes: bytes,
  });

  if (error) {
    // Fallback to direct update if RPC doesn't exist
    const { data: profile } = await supabase
      .from('profiles')
      .select('storage_used_bytes')
      .eq('owner_id', userId)
      .single();

    if (profile) {
      const newUsed = Math.max(0, (profile.storage_used_bytes || 0) - bytes);
      await supabase
        .from('profiles')
        .update({ storage_used_bytes: newUsed })
        .eq('owner_id', userId);
    }
  }
}

/**
 * Recalculate storage usage from assets table
 */
export async function recalculateStorageUsage(userId: string): Promise<number> {
  const supabase = await createClient();
  
  const { data: assets, error } = await supabase
    .from('assets')
    .select('size_bytes')
    .eq('owner_id', userId);

  if (error) {
    throw error;
  }

  const totalBytes = assets?.reduce((sum, asset) => sum + (asset.size_bytes || 0), 0) || 0;

  await supabase
    .from('profiles')
    .update({ storage_used_bytes: totalBytes })
    .eq('owner_id', userId);

  return totalBytes;
}
