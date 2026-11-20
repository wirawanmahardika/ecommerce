import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, orders } from "@/src/db";
import { requireAdmin, requireAuth } from "@/src/lib/auth";
import { fail, handleApiError, ok } from "@/src/lib/response";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await context.params;
    const orderId = parseInt(id, 10);
    const { status } = await req.json();

    const [existing] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!existing) return fail("Pesanan tidak ditemukan", 404);

    // Non-admin users can only mark their own delivered order as completed
    if (auth.user.role !== "admin") {
      if (existing.userId !== auth.user.id || status !== "completed") {
        return fail("Tidak memiliki izin mengubah status pesanan", 403);
      }
    }

    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    return ok(updated, `Status pesanan diubah ke ${status}`);
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
    const orderId = parseInt(id, 10);
    const [deleted] = await db
      .delete(orders)
      .where(eq(orders.id, orderId))
      .returning();

    if (!deleted) return fail("Pesanan tidak ditemukan", 404);
    return ok(deleted, "Pesanan berhasil dihapus");
  } catch (err) {
    return handleApiError(err);
  }
}
