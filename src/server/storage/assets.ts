import { createClient } from '@/lib/supabase/server';
import { uploadFile, deleteFile, getFileMetadata, generateR2Key } from './r2';
import { incrementStorageUsage, decrementStorageUsage, checkStorageQuota } from './quota';

export interface CreateAssetParams {
  userId: string;
  type: 'page' | 'thumbnail' | 'hero' | 'export' | 'style_anchor';
  r2Key: string;
  sizeBytes: number;
  contentType: string;
  projectId?: string;
  heroId?: string;
}

/**
 * Create an asset record in the database and track storage
 */
export async function createAsset(params: CreateAssetParams): Promise<string> {
  const { userId, type, r2Key, sizeBytes, contentType, projectId, heroId } = params;

  // Check quota before creating
  const quota = await checkStorageQuota(userId, sizeBytes);
  if (!quota.allowed) {
    throw new Error(`Storage quota exceeded. Used: ${quota.used}, Limit: ${quota.limit}`);
  }

  const supabase = await createClient();

  const { data: asset, error } = await supabase
    .from('assets')
    .insert({
      owner_id: userId,
      type,
      r2_key: r2Key,
      size_bytes: sizeBytes,
      content_type: contentType,
      project_id: projectId,
      hero_id: heroId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Update storage usage
  await incrementStorageUsage(userId, sizeBytes);

  return asset.id;
}

/**
 * Delete an asset and update storage usage
 */
export async function deleteAsset(assetId: string, userId: string): Promise<void> {
  const supabase = await createClient();

  // Get asset info before deleting
  const { data: asset, error: fetchError } = await supabase
    .from('assets')
    .select('r2_key, size_bytes')
    .eq('id', assetId)
    .eq('owner_id', userId)
    .single();

  if (fetchError || !asset) {
    throw new Error('Asset not found or access denied');
  }

  // Delete from R2
  await deleteFile(asset.r2_key);

  // Delete from database
  const { error: deleteError } = await supabase
    .from('assets')
    .delete()
    .eq('id', assetId)
    .eq('owner_id', userId);

  if (deleteError) {
    throw deleteError;
  }

  // Update storage usage
  await decrementStorageUsage(userId, asset.size_bytes);
}

/**
 * Upload file and create asset record
 */
export async function uploadAsset(
  userId: string,
  type: CreateAssetParams['type'],
  file: {
    buffer: Buffer;
    contentType: string;
    originalName?: string;
  },
  options: {
    projectId?: string;
    heroId?: string;
    pageId?: string;
    version?: number;
  }
): Promise<{ assetId: string; r2Key: string }> {
  const { projectId, heroId, pageId, version } = options;

  // Generate R2 key
  const extension = file.contentType.includes('pdf') ? 'pdf' : 'png';
  const r2Key = generateR2Key(type, {
    userId,
    projectId,
    heroId,
    pageId,
    version,
    extension,
  });

  // Check quota
  const quota = await checkStorageQuota(userId, file.buffer.length);
  if (!quota.allowed) {
    throw new Error(`Storage quota exceeded. Used: ${quota.used}, Limit: ${quota.limit}`);
  }

  // Upload to R2
  await uploadFile({
    key: r2Key,
    body: file.buffer,
    contentType: file.contentType,
  });

  // Create asset record
  const assetId = await createAsset({
    userId,
    type,
    r2Key,
    sizeBytes: file.buffer.length,
    contentType: file.contentType,
    projectId,
    heroId,
  });

  return { assetId, r2Key };
}

/**
 * Get assets for a user
 */
export async function getUserAssets(
  userId: string,
  filters?: {
    type?: CreateAssetParams['type'];
    projectId?: string;
    heroId?: string;
  }
) {
  const supabase = await createClient();

  let query = supabase
    .from('assets')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.projectId) {
    query = query.eq('project_id', filters.projectId);
  }
  if (filters?.heroId) {
    query = query.eq('hero_id', filters.heroId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}
