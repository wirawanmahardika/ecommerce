import { NextRequest } from "next/server";
import { asc } from "drizzle-orm";
import { db, categories } from "@/src/db";
import { requireAdmin } from "@/src/lib/auth";
import { fail, handleApiError, ok } from "@/src/lib/response";
import { categorySchema } from "@/src/lib/validators";
import { slugify } from "@/src/lib/utils";

export async function GET() {
  try {
    const data = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.name));
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
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Data tidak valid", 400);
    }

    const [created] = await db
      .insert(categories)
      .values({
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        imageUrl: parsed.data.imageUrl ?? null,
      })
      .returning();

    return ok(created, "Kategori berhasil ditambahkan", 201);
  } catch (err) {
    return handleApiError(err);
  }
}
