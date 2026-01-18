import { GetBucketLocationCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import crypto from 'crypto';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing env var: ${name}`);
  }
  return v;
}

let cachedBucketRegion: string | null = null;

function normalizeBucketLocationConstraint(location: string | null | undefined): string {
  // S3 returns empty/undefined for us-east-1 and sometimes "EU" for eu-west-1 (legacy).
  if (!location) return 'us-east-1';
  if (location === 'EU') return 'eu-west-1';
  return location;
}

function getS3Client(region: string) {
  const accessKeyId = requireEnv('AWS_ACCESS_KEY_ID');
  const secretAccessKey = requireEnv('AWS_SECRET_ACCESS_KEY');
  return new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
}

async function resolveBucketRegion(bucket: string): Promise<string> {
  // Prefer explicit config.
  if (process.env.AWS_S3_REGION) return process.env.AWS_S3_REGION;
  if (cachedBucketRegion) return cachedBucketRegion;

  // Bucket region lookup works via us-east-1.
  const lookupClient = getS3Client('us-east-1');
  const res = await lookupClient.send(new GetBucketLocationCommand({ Bucket: bucket }));
  cachedBucketRegion = normalizeBucketLocationConstraint(res.LocationConstraint);
  return cachedBucketRegion;
}

export function getPublicS3Url(key: string, region: string): string {
  const bucket = requireEnv('AWS_S3_BUCKET');
  // us-east-1 has a special "global" endpoint; other regions use region-specific hosts.
  const host =
    region === 'us-east-1'
      ? `${bucket}.s3.amazonaws.com`
      : `${bucket}.s3.${region}.amazonaws.com`;
  return `https://${host}/${key}`;
}

export async function uploadUserAvatar(params: {
  userId: number;
  bytes: Uint8Array;
  contentType: string;
}): Promise<{ key: string; url: string }> {
  const bucket = requireEnv('AWS_S3_BUCKET');
  const region = await resolveBucketRegion(bucket);
  const client = getS3Client(region);

  // Keep it simple: unique object per upload (no overwrite caching headaches).
  const ext =
    params.contentType === 'image/png'
      ? 'png'
      : params.contentType === 'image/jpeg'
        ? 'jpg'
        : params.contentType === 'image/webp'
          ? 'webp'
          : 'bin';

  const key = `avatars/${params.userId}/${crypto.randomUUID?.() ?? crypto.randomBytes(16).toString('hex')}.${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: params.bytes,
      ContentType: params.contentType,
      // NOTE: This requires bucket settings that allow ACLs (Object Ownership not "Bucket owner enforced")
      // and "Block public ACLs"/"Ignore public ACLs" disabled at bucket/account level.
      ACL: 'public-read',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  return { key, url: getPublicS3Url(key, region) };
}

