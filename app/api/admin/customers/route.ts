import { desc, eq } from "drizzle-orm";
import { db, users, wallets } from "@/src/db";
import { requireAdmin } from "@/src/lib/auth";
import { handleApiError, ok } from "@/src/lib/response";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const rows = await db
      .select({
        id: users.id,
        fullname: users.fullname,
        username: users.username,
        email: users.email,
        role: users.role,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
        balance: wallets.balance,
      })
      .from(users)
      .leftJoin(wallets, eq(users.id, wallets.userId))
      .orderBy(desc(users.createdAt));

    return ok(rows);
  } catch (err) {
    return handleApiError(err);
  }
}
