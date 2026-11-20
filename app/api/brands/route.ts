import { NextRequest } from "next/server";
import { asc, desc } from "drizzle-orm";
import { db, brands } from "@/src/db";
import { requireAdmin } from "@/src/lib/auth";
import { fail, handleApiError, ok } from "@/src/lib/response";
import { brandSchema } from "@/src/lib/validators";
import { slugify } from "@/src/lib/utils";

export async function GET() {
  try {
    const data = await db.select().from(brands).orderBy(asc(brands.name));
    return ok(data);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const parsed = brandSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Data tidak valid", 400);
    }

    const [created] = await db
      .insert(brands)
      .values({
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        logoUrl: parsed.data.logoUrl ?? null,
      })
      .returning();

    return ok(created, "Brand berhasil ditambahkan", 201);
  } catch (err) {
    return handleApiError(err);
  }
}
