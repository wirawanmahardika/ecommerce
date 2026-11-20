import { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db, wallets } from "@/src/db";
import { requireAuth } from "@/src/lib/auth";
import { fail, handleApiError, ok } from "@/src/lib/response";

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { amount } = await req.json();
    const numAmount = parseInt(String(amount), 10);
    if (!numAmount || numAmount < 10000) {
      return fail("Minimal top up Rp 10.000", 400);
    }

    const [updated] = await db
      .update(wallets)
      .set({
        balance: sql`${wallets.balance} + ${numAmount}`,
        updatedAt: new Date(),
      })
      .where(eq(wallets.userId, auth.user.id))
      .returning();

    return ok(updated, "Top up saldo berhasil");
  } catch (err) {
    return handleApiError(err);
  }
}
