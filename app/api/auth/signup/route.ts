import { NextRequest } from "next/server";
import { db, users, wallets } from "@/src/db";
import { fail, handleApiError, ok } from "@/src/lib/response";
import { signupSchema } from "@/src/lib/validators";
import { setSessionCookie } from "@/src/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Data tidak valid", 400);
    }

    const { fullname, username, email, password } = parsed.data;
    const hashPassword = await Bun.password.hash(password);

    const createdUser = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          fullname,
          username,
          email,
          password: hashPassword,
          role: "user",
        })
        .returning({
          id: users.id,
          fullname: users.fullname,
          username: users.username,
          email: users.email,
          role: users.role,
        });

      await tx.insert(wallets).values({
        userId: user.id,
        balance: 0,
      });

      return user;
    });

    await setSessionCookie({
      id: createdUser.id,
      username: createdUser.username,
      role: createdUser.role,
    });

    return ok(createdUser, "Berhasil mendaftar", 201);
  } catch (err) {
    return handleApiError(err);
  }
}
