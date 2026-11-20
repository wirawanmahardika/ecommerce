import { NextRequest } from "next/server";
import { requireAuth } from "@/src/lib/auth";
import { fail, handleApiError, ok } from "@/src/lib/response";
import { uploadToS3 } from "@/src/lib/s3";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_FOLDERS = new Set([
  "products",
  "categories",
  "brands",
  "avatars",
]);

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folderRaw = String(formData.get("folder") ?? "products");
    const folder = ALLOWED_FOLDERS.has(folderRaw)
      ? (folderRaw as "products" | "categories" | "brands" | "avatars")
      : "products";

    if (!file || file.size === 0) {
      return fail("File gambar wajib diunggah", 400);
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return fail("Format gambar harus JPG, PNG, WebP, atau GIF", 400);
    }
    if (file.size > 5 * 1024 * 1024) {
      return fail("Ukuran file maksimal 5MB", 400);
    }

    if (folder !== "avatars" && auth.user.role !== "admin") {
      return fail("Hanya admin yang dapat mengunggah aset katalog", 403);
    }

    const result = await uploadToS3(file, folder);
    return ok(result, "Berhasil mengunggah file ke S3", 201);
  } catch (err) {
    return handleApiError(err);
  }
}
