import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, users, wallets } from "@/src/db";
import { requireAdmin } from "@/src/lib/auth";
import { fail, handleApiError, ok } from "@/src/lib/response";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const { id } = await context.params;
    const { role, balance } = await req.json();

    if (role === "user" || role === "admin") {
      await db
        .update(users)
        .set({ role, updatedAt: new Date() })
        .where(eq(users.id, id));
    }

    if (typeof balance === "number" && balance >= 0) {
      await db
        .update(wallets)
        .set({ balance, updatedAt: new Date() })
        .where(eq(wallets.userId, id));
    }

    return ok(null, "Data customer diperbarui");
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
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!deleted) return fail("Customer tidak ditemukan", 404);
    return ok(deleted, "Customer berhasil dihapus");
  } catch (err) {
    return handleApiError(err);
  }
}
