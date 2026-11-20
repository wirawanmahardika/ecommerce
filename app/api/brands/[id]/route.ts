import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, brands } from "@/src/db";
import { requireAdmin } from "@/src/lib/auth";
import { fail, handleApiError, ok } from "@/src/lib/response";
import { brandSchema } from "@/src/lib/validators";
import { slugify } from "@/src/lib/utils";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const { id } = await context.params;
    const brandId = parseInt(id, 10);
    const body = await req.json();
    const parsed = brandSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Data tidak valid", 400);
    }

    const [updated] = await db
      .update(brands)
      .set({
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        logoUrl: parsed.data.logoUrl ?? null,
      })
      .where(eq(brands.id, brandId))
      .returning();

    if (!updated) return fail("Brand tidak ditemukan", 404);
    return ok(updated, "Brand berhasil diperbarui");
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const { id } = await context.params;
    const brandId = parseInt(id, 10);
    const [deleted] = await db
      .delete(brands)
      .where(eq(brands.id, brandId))
      .returning();

    if (!deleted) return fail("Brand tidak ditemukan", 404);
    return ok(deleted, "Brand berhasil dihapus");
  } catch (err) {
    return handleApiError(err);
  }
}
