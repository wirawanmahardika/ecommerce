import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, users, wallets } from "@/src/db";
import { getSessionUser, requireAuth, setSessionCookie } from "@/src/lib/auth";
import { fail, handleApiError, ok } from "@/src/lib/response";
import { updateProfileSchema } from "@/src/lib/validators";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return ok(null, "Belum login");
  }

  try {
    const [row] = await db
      .select({
        id: users.id,
        email: users.email,
        fullname: users.fullname,
        username: users.username,
        role: users.role,
        avatarUrl: users.avatarUrl,
        balance: wallets.balance,
      })
      .from(users)
      .leftJoin(wallets, eq(users.id, wallets.userId))
      .where(eq(users.id, session.id))
      .limit(1);

    return ok(row ?? null);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Data tidak valid", 400);
    }

    const [updated] = await db
      .update(users)
      .set({
        fullname: parsed.data.fullname,
        username: parsed.data.username,
        email: parsed.data.email,
        avatarUrl: parsed.data.avatarUrl ?? null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, auth.user.id))
      .returning({
        id: users.id,
        fullname: users.fullname,
        username: users.username,
        email: users.email,
        role: users.role,
        avatarUrl: users.avatarUrl,
      });

    await setSessionCookie({
      id: updated.id,
      username: updated.username,
      role: updated.role,
    });

    return ok(updated, "Profil berhasil diperbarui");
  } catch (err) {
    return handleApiError(err);
  }
}
