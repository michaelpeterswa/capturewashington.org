import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function createR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

const globalForR2 = globalThis as unknown as {
  r2Client: S3Client | undefined;
};

export const r2 =
  globalForR2.r2Client ?? (process.env.R2_ACCOUNT_ID ? createR2Client() : null);

if (process.env.NODE_ENV !== "production" && r2) {
  globalForR2.r2Client = r2;
}

export async function presignUpload(
  key: string,
  contentType: string,
): Promise<string> {
  if (!r2) throw new Error("R2 client not configured");
  return getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 900 },
  );
}

export function getPublicUrl(r2Key: string): string {
  return `${process.env.R2_PUBLIC_URL}/${r2Key}`;
}
