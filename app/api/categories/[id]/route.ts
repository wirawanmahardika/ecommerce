import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, categories } from "@/src/db";
import { requireAdmin } from "@/src/lib/auth";
import { fail, handleApiError, ok } from "@/src/lib/response";
import { categorySchema } from "@/src/lib/validators";
import { slugify } from "@/src/lib/utils";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const { id } = await context.params;
    const catId = parseInt(id, 10);
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Data tidak valid", 400);
    }

    const [updated] = await db
      .update(categories)
      .set({
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        imageUrl: parsed.data.imageUrl ?? null,
      })
      .where(eq(categories.id, catId))
      .returning();

    if (!updated) return fail("Kategori tidak ditemukan", 404);
    return ok(updated, "Kategori berhasil diperbarui");
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
    const catId = parseInt(id, 10);
    const [deleted] = await db
      .delete(categories)
      .where(eq(categories.id, catId))
      .returning();

    if (!deleted) return fail("Kategori tidak ditemukan", 404);
    return ok(deleted, "Kategori berhasil dihapus");
  } catch (err) {
    return handleApiError(err);
  }
}
