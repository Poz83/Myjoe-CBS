import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET_NAME } from '@/lib/r2';

export interface UploadFileParams {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType: string;
  metadata?: Record<string, string>;
}

export interface FileMetadata {
  size: number;
  contentType: string;
  lastModified?: Date;
  metadata?: Record<string, string>;
}

/**
 * Upload a file to R2
 */
export async function uploadFile({
  key,
  body,
  contentType,
  metadata,
}: UploadFileParams): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    Metadata: metadata,
  });

  await r2Client.send(command);
}

/**
 * Get file metadata without downloading
 */
export async function getFileMetadata(key: string): Promise<FileMetadata | null> {
  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    const response = await r2Client.send(command);

    return {
      size: response.ContentLength || 0,
      contentType: response.ContentType || 'application/octet-stream',
      lastModified: response.LastModified,
      metadata: response.Metadata,
    };
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(key: string): Promise<boolean> {
  const metadata = await getFileMetadata(key);
  return metadata !== null;
}

/**
 * Delete a file from R2
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * Delete multiple files from R2
 */
export async function deleteFiles(keys: string[]): Promise<void> {
  await Promise.all(keys.map(key => deleteFile(key)));
}

/**
 * Get a signed URL for downloading a file
 * @param key - R2 object key
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Get a signed URL for uploading a file
 * @param key - R2 object key
 * @param contentType - MIME type of the file
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 */
export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Generate R2 key for different asset types
 */
export function generateR2Key(type: 'page' | 'thumbnail' | 'hero' | 'export' | 'style_anchor', options: {
  userId: string;
  projectId?: string;
  heroId?: string;
  pageId?: string;
  version?: number;
  extension?: string;
}): string {
  const { userId, projectId, heroId, pageId, version, extension = 'png' } = options;
  
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  
  switch (type) {
    case 'page':
      if (!projectId || !pageId || version === undefined) {
        throw new Error('projectId, pageId, and version are required for page assets');
      }
      return `users/${userId}/projects/${projectId}/pages/${pageId}/v${version}.${extension}`;
    
    case 'thumbnail':
      if (!projectId || !pageId) {
        throw new Error('projectId and pageId are required for thumbnails');
      }
      return `users/${userId}/projects/${projectId}/pages/${pageId}/thumb.${extension}`;
    
    case 'hero':
      if (!heroId) {
        throw new Error('heroId is required for hero assets');
      }
      return `users/${userId}/heroes/${heroId}/reference.${extension}`;
    
    case 'export':
      if (!projectId) {
        throw new Error('projectId is required for exports');
      }
      return `users/${userId}/projects/${projectId}/exports/${timestamp}-${random}.pdf`;
    
    case 'style_anchor':
      if (!projectId) {
        throw new Error('projectId is required for style anchors');
      }
      return `users/${userId}/projects/${projectId}/style-anchor.${extension}`;
    
    default:
      throw new Error(`Unknown asset type: ${type}`);
  }
}
