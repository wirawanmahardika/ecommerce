import { NextRequest, NextResponse } from "next/server";
import { getS3Client } from "@/src/lib/s3";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await context.params;
    const objectKey = key.join("/");
    const s3 = getS3Client();
    const s3File = s3.file(objectKey);

    if (!(await s3File.exists())) {
      return new NextResponse("File not found", { status: 404 });
    }

    const bytes = await s3File.bytes();
    const stat = await s3File.stat();

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": stat.type || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("S3 read error:", err);
    return new NextResponse("Failed to fetch file", { status: 500 });
  }
}
