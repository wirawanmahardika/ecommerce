import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, products } from "@/src/db";
import { requireAdmin } from "@/src/lib/auth";
import { fail, handleApiError, ok } from "@/src/lib/response";
import { productSchema } from "@/src/lib/validators";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const { id } = await context.params;
    const productId = parseInt(id, 10);
    const body = await req.json();
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Data tidak valid", 400);
    }

    const [updated] = await db
      .update(products)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId))
      .returning();

    if (!updated) return fail("Produk tidak ditemukan", 404);
    return ok(updated, "Produk berhasil diperbarui");
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
    const productId = parseInt(id, 10);
    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, productId))
      .returning();

    if (!deleted) return fail("Produk tidak ditemukan", 404);
    return ok(deleted, "Produk berhasil dihapus");
  } catch (err) {
    return handleApiError(err);
  }
}
