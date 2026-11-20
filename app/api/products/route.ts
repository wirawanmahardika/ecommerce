import { NextRequest } from "next/server";
import { and, asc, desc, eq, gte, ilike, inArray, lte, SQL } from "drizzle-orm";
import { db, brands, categories, products } from "@/src/db";
import { requireAdmin } from "@/src/lib/auth";
import { fail, handleApiError, ok } from "@/src/lib/response";
import { productSchema } from "@/src/lib/validators";
import { slugify } from "@/src/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const q = sp.get("q");
    const categoryIds = sp.get("categoryIds");
    const brandIds = sp.get("brandIds");
    const minPrice = sp.get("minPrice");
    const maxPrice = sp.get("maxPrice");
    const featured = sp.get("featured");
    const inStock = sp.get("inStock");
    const sort = sp.get("sort");

    const conditions: SQL[] = [];
    if (q) conditions.push(ilike(products.name, `%${q}%`));
    if (featured === "true") conditions.push(eq(products.isFeatured, true));
    if (inStock === "true") conditions.push(gte(products.stock, 1));
    if (minPrice) conditions.push(gte(products.price, parseInt(minPrice, 10)));
    if (maxPrice) conditions.push(lte(products.price, parseInt(maxPrice, 10)));
    if (categoryIds) {
      const ids = categoryIds
        .split(",")
        .map((n) => parseInt(n, 10))
        .filter((n) => !Number.isNaN(n));
      if (ids.length > 0) conditions.push(inArray(products.categoryId, ids));
    }
    if (brandIds) {
      const ids = brandIds
        .split(",")
        .map((n) => parseInt(n, 10))
        .filter((n) => !Number.isNaN(n));
      if (ids.length > 0) conditions.push(inArray(products.brandId, ids));
    }

    const orderClause =
      sort === "price_asc"
        ? asc(products.price)
        : sort === "price_desc"
          ? desc(products.price)
          : desc(products.createdAt);

    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        stock: products.stock,
        rating: products.rating,
        imageUrl: products.imageUrl,
        isFeatured: products.isFeatured,
        brandId: products.brandId,
        categoryId: products.categoryId,
        brandName: brands.name,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderClause);

    return ok(rows);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Data tidak valid", 400);
    }

    const baseSlug = slugify(parsed.data.name);
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    const [created] = await db
      .insert(products)
      .values({
        name: parsed.data.name,
        slug: uniqueSlug,
        description: parsed.data.description ?? null,
        brandId: parsed.data.brandId,
        categoryId: parsed.data.categoryId,
        price: parsed.data.price,
        stock: parsed.data.stock,
        imageUrl: parsed.data.imageUrl ?? null,
        isFeatured: parsed.data.isFeatured ?? false,
      })
      .returning();

    return ok(created, "Produk berhasil ditambahkan", 201);
  } catch (err) {
    return handleApiError(err);
  }
}
