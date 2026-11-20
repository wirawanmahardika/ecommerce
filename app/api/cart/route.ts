import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, cartItems, products } from "@/src/db";
import { requireAuth } from "@/src/lib/auth";
import { fail, handleApiError, ok } from "@/src/lib/response";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const rows = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        name: products.name,
        price: products.price,
        stock: products.stock,
        imageUrl: products.imageUrl,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, auth.user.id));

    return ok(rows);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { productId, quantity = 1 } = await req.json();
    if (!productId || quantity < 1) {
      return fail("Produk dan kuantitas tidak valid", 400);
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!product) return fail("Produk tidak ditemukan", 404);

    const [existing] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, auth.user.id),
          eq(cartItems.productId, productId)
        )
      )
      .limit(1);

    const nextQty = (existing?.quantity ?? 0) + quantity;
    if (nextQty > product.stock) {
      return fail("Jumlah melebihi stok tersedia", 400);
    }

    if (existing) {
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: nextQty })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return ok(updated, "Keranjang diperbarui");
    }

    const [created] = await db
      .insert(cartItems)
      .values({
        userId: auth.user.id,
        productId,
        quantity,
      })
      .returning();

    return ok(created, "Ditambahkan ke keranjang", 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { productId, quantity } = await req.json();
    if (!productId || typeof quantity !== "number") {
      return fail("Data tidak valid", 400);
    }

    if (quantity <= 0) {
      await db
        .delete(cartItems)
        .where(
          and(
            eq(cartItems.userId, auth.user.id),
            eq(cartItems.productId, productId)
          )
        );
      return ok(null, "Item dihapus dari keranjang");
    }

    const [product] = await db
      .select({ stock: products.stock })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!product) return fail("Produk tidak ditemukan", 404);
    if (quantity > product.stock) {
      return fail("Jumlah melebihi stok tersedia", 400);
    }

    const [updated] = await db
      .update(cartItems)
      .set({ quantity })
      .where(
        and(
          eq(cartItems.userId, auth.user.id),
          eq(cartItems.productId, productId)
        )
      )
      .returning();

    return ok(updated, "Kuantitas diperbarui");
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const productIdParam = req.nextUrl.searchParams.get("productId");
    if (productIdParam) {
      await db
        .delete(cartItems)
        .where(
          and(
            eq(cartItems.userId, auth.user.id),
            eq(cartItems.productId, parseInt(productIdParam, 10))
          )
        );
    } else {
      await db.delete(cartItems).where(eq(cartItems.userId, auth.user.id));
    }
    return ok(null, "Keranjang diperbarui");
  } catch (err) {
    return handleApiError(err);
  }
}
