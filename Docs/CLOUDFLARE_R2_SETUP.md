# Cloudflare R2 Setup Guide

## Overview

Cloudflare R2 is used for storing all user-generated assets (page images, thumbnails, hero reference sheets, exports, etc.). R2 is S3-compatible, so we use the AWS SDK.

## Configuration

### Environment Variables

Already configured in `.env.local`:

```bash
R2_ACCESS_KEY_ID=8a33ba822132bc9da58778bb56a57329
R2_SECRET_ACCESS_KEY=3b640f651c47035d3ba9274d6db46a1e42dcd2e6fecec17b850cff14aab74706
R2_BUCKET_NAME=myjoeprod
R2_ENDPOINT=https://7eabbcd49cfb5790c0d619970229b230.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://cdn.myjoe.app
```

### Bucket Setup

1. Go to [Cloudflare Dashboard → R2](https://dash.cloudflare.com/)
2. Create bucket: `myjoeprod`
3. Configure CORS (if needed for direct uploads):
   ```json
   [
     {
       "AllowedOrigins": ["https://myjoe.app", "https://cdn.myjoe.app"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

### Custom Domain Setup

**IMPORTANT:** Use `cdn.myjoe.app` as the R2 custom domain, NOT `myjoe.app`. The root domain (`myjoe.app`) is reserved for your Vercel deployment.

1. Go to [Cloudflare Dashboard → R2 → myjoeprod bucket → Settings → Domain Access](https://dash.cloudflare.com/)
2. Remove any existing custom domain for `myjoe.app` if present
3. Add custom domain: `cdn.myjoe.app`
4. Cloudflare will automatically create the CNAME record pointing to `public.r2.dev`
5. Update `R2_PUBLIC_URL` in `.env.local` to `https://cdn.myjoe.app`

## Storage Structure

Files are organized by user and type:

```
users/{userId}/
  ├── projects/{projectId}/
  │   ├── pages/{pageId}/
  │   │   ├── v1.png
  │   │   ├── v2.png
  │   │   └── thumb.png
  │   ├── exports/
  │   │   └── {timestamp}-{random}.pdf
  │   └── style-anchor.png
  └── heroes/{heroId}/
      └── reference.png
```

## API Usage

### Upload File

```typescript
import { uploadFile, generateR2Key } from '@/server/storage';

const r2Key = generateR2Key('page', {
  userId: 'user-123',
  projectId: 'project-456',
  pageId: 'page-789',
  version: 1,
  extension: 'png',
});

await uploadFile({
  key: r2Key,
  body: imageBuffer,
  contentType: 'image/png',
});
```

### Upload with Asset Tracking

```typescript
import { uploadAsset } from '@/server/storage';

const { assetId, r2Key } = await uploadAsset(
  userId,
  'page',
  {
    buffer: imageBuffer,
    contentType: 'image/png',
  },
  {
    projectId: 'project-456',
    pageId: 'page-789',
    version: 1,
  }
);
```

### Get Signed Download URL

```typescript
import { getSignedDownloadUrl } from '@/server/storage';

const url = await getSignedDownloadUrl('users/.../page.png', 3600); // 1 hour
```

### Get Signed Upload URL

```typescript
import { getSignedUploadUrl } from '@/server/storage';

const url = await getSignedUploadUrl('users/.../page.png', 'image/png', 3600);
```

### Check Storage Quota

```typescript
import { checkStorageQuota } from '@/server/storage/quota';

const quota = await checkStorageQuota(userId, fileSize);
if (!quota.allowed) {
  throw new Error('Storage quota exceeded');
}
```

## API Routes

### Generate Upload URL
```typescript
POST /api/storage/upload-url
Body: {
  type: 'page' | 'thumbnail' | 'hero' | 'export' | 'style_anchor',
  contentType: string,
  sizeBytes: number,
  projectId?: string,
  heroId?: string,
  pageId?: string,
  version?: number
}
Response: { uploadUrl: string, r2Key: string, expiresIn: number }
```

### Generate Download URL
```typescript
POST /api/storage/download-url
Body: { r2Key: string, expiresIn?: number }
Response: { downloadUrl: string, expiresIn: number }
```

### Get Storage Quota
```typescript
GET /api/storage/quota
Response: {
  used: number,
  limit: number,
  remaining: number,
  percentageUsed: number
}
```

## Storage Quota Management

Storage is tracked in the `profiles` table:
- `storage_used_bytes` - Current usage
- `storage_limit_bytes` - Plan limit

Quotas by plan:
- Free: 1 GB
- Starter: 5 GB
- Creator: 15 GB
- Pro: 50 GB

Storage is automatically updated when:
- Assets are created via `createAsset()`
- Assets are deleted via `deleteAsset()`

## Database Functions (Optional)

For atomic storage updates, create these PostgreSQL functions:

```sql
CREATE OR REPLACE FUNCTION increment_storage(
  p_user_id UUID,
  p_bytes BIGINT
) RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET storage_used_bytes = storage_used_bytes + p_bytes
  WHERE owner_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_storage(
  p_user_id UUID,
  p_bytes BIGINT
) RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET storage_used_bytes = GREATEST(0, storage_used_bytes - p_bytes)
  WHERE owner_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

## Security

- All R2 keys are prefixed with `users/{userId}/` to ensure isolation
- Download URLs require ownership verification via assets table
- Upload URLs check storage quota before generation
- Signed URLs expire after 1 hour (configurable)

## Error Handling

Common errors:
- `Storage quota exceeded` - User has reached their plan limit
- `Asset not found` - R2 key doesn't exist or user doesn't own it
- `Access denied` - User trying to access another user's asset

## Testing

### Test Upload
```typescript
import { uploadFile } from '@/server/storage';

const testBuffer = Buffer.from('test content');
await uploadFile({
  key: 'test/test.txt',
  body: testBuffer,
  contentType: 'text/plain',
});
```

### Test Download URL
```typescript
import { getSignedDownloadUrl } from '@/server/storage';

const url = await getSignedDownloadUrl('test/test.txt');
console.log('Download URL:', url);
```

## Production Checklist

- [ ] R2 bucket created and configured
- [ ] CORS configured (if using direct uploads)
- [ ] Custom domain configured (optional)
- [ ] Storage quota limits verified
- [ ] Database functions created (optional)
- [ ] Error handling tested
- [ ] Signed URL expiration tested
- [ ] Storage tracking verified
