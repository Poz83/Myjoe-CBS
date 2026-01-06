import { S3Client } from '@aws-sdk/client-s3';

if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_ENDPOINT) {
  throw new Error('R2 credentials are not set. Check R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_ENDPOINT');
}

// Cloudflare R2 is S3-compatible, so we use the AWS SDK
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'myjoeprod';
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://cdn.myjoe.app';
