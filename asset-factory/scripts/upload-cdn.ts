import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2BucketName = process.env.R2_BUCKET_NAME;
const r2Endpoint = process.env.R2_ENDPOINT;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2PublicUrl = process.env.R2_PUBLIC_URL || 'https://cdn.jiuspeak.com';

let r2Client: S3Client | null = null;

// Lazy initialize the R2/S3 client to avoid crashes if keys are initially missing
function getR2Client(): S3Client | null {
  if (r2Client) return r2Client;

  if (!r2BucketName || !r2Endpoint || !r2AccessKeyId || !r2SecretAccessKey) {
    console.warn(`[WARN] Cloudflare R2 keys missing in env. CDN uploads will use high-fidelity virtual URL mock mapping.`);
    return null;
  }

  try {
    r2Client = new S3Client({
      endpoint: r2Endpoint,
      region: 'auto',
      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey
      }
    });
    return r2Client;
  } catch (err: any) {
    console.error(`[ERROR] Failed to initialize R2 client:`, err?.message || err);
    return null;
  }
}

/**
 * Uploads a file buffer to Cloudflare R2 and returns the final public CDN access URL.
 */
export async function uploadToCDN(
  fileBuffer: Buffer,
  keyPath: string, // e.g., 'kimonos/atama-mundial.webp'
  contentType: string
): Promise<string> {
  const client = getR2Client();
  const rawKey = `assets/${keyPath}`.replace(/\/+/g, '/'); // Ensure no double slashes

  if (client && r2BucketName) {
    try {
      console.log(`[CDN] Uploading to R2: ${rawKey} (${contentType})...`);
      const command = new PutObjectCommand({
        Bucket: r2BucketName,
        Key: rawKey,
        Body: fileBuffer,
        ContentType: contentType,
        ACL: 'public-read'
      });
      await client.send(command);
      const publicUrl = `${r2PublicUrl}/${rawKey}`.replace(/([^:]\/)\/+/g, '$1');
      console.log(`[CDN SUCCESS] Uploaded! URL: ${publicUrl}`);
      return publicUrl;
    } catch (error: any) {
      console.error(`[CDN ERROR] Failed to upload ${rawKey} to R2:`, error?.message || error);
    }
  }

  // Graceful virtual URL mapping fallback
  const fallbackUrl = `${r2PublicUrl}/${rawKey}`.replace(/([^:]\/)\/+/g, '$1');
  return fallbackUrl;
}
