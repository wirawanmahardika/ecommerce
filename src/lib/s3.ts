import { S3Client } from "bun";

const globalForS3 = globalThis as unknown as {
  s3: S3Client | undefined;
};

export function getS3Client(): S3Client {
  if (!globalForS3.s3) {
    globalForS3.s3 = new S3Client({
      endpoint: process.env.S3_ENDPOINT ?? "http://localhost:9000",
      region: process.env.S3_REGION ?? "us-east-1",
      bucket: process.env.S3_BUCKET ?? "tokosedia",
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "rustfsadmin",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "rustfsadmin",
    });
  }
  return globalForS3.s3;
}

export async function uploadToS3(
  file: File,
  folder: "products" | "categories" | "brands" | "avatars"
): Promise<{ key: string; url: string }> {
  const s3 = getS3Client();
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const key = `${folder}/${Bun.randomUUIDv7()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  await s3.write(key, bytes, {
    type: file.type || "application/octet-stream",
  });

  return {
    key,
    url: `/api/files/${key}`,
  };
}

export async function deleteFromS3(key: string): Promise<void> {
  const s3 = getS3Client();
  await s3.delete(key);
}
