import { NextRequest } from "next/server";
import { eq, or } from "drizzle-orm";
import { db, users } from "@/src/db";
import { fail, handleApiError, ok } from "@/src/lib/response";
import { loginSchema } from "@/src/lib/validators";
import { setSessionCookie } from "@/src/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Data tidak valid", 400);
    }

    const { identifier, password } = parsed.data;
    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.username, identifier), eq(users.email, identifier)))
      .limit(1);

    if (!user || !(await Bun.password.verify(password, user.password))) {
      return fail("Username/email atau password salah", 401);
    }

    await setSessionCookie({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    return ok(
      {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
      "Berhasil login"
    );
  } catch (err) {
    return handleApiError(err);
  }
}
