import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, cartItems, orderItems, orders, products, wallets } from "@/src/db";
import { requireAuth } from "@/src/lib/auth";
import { AppError, fail, handleApiError, ok } from "@/src/lib/response";
import { checkoutSchema } from "@/src/lib/validators";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const scope = req.nextUrl.searchParams.get("scope");
    const isAdminScope = scope === "all" && auth.user.role === "admin";

    const data = await db.query.orders.findMany({
      where: isAdminScope ? undefined : { userId: auth.user.id },
      orderBy: { createdAt: "desc" },
      with: {
        user: {
          columns: { id: true, username: true, fullname: true, email: true },
        },
        items: {
          with: {
            product: {
              columns: { id: true, name: true, imageUrl: true },
            },
          },
        },
      },
    });

    return ok(data);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Data tidak valid", 400);
    }

    const SHIPPING_FEE = 15000;

    const order = await db.transaction(async (tx) => {
      let requestedItems = parsed.data.items;
      const fromCart = !requestedItems || requestedItems.length === 0;

      if (fromCart) {
        const cartRows = await tx
          .select({
            productId: cartItems.productId,
            quantity: cartItems.quantity,
          })
          .from(cartItems)
          .where(eq(cartItems.userId, auth.user.id));
        requestedItems = cartRows;
      }

      if (!requestedItems || requestedItems.length === 0) {
        throw new AppError("Keranjang masih kosong", 400);
      }

      let subtotal = 0;
      const preparedItems: Array<{
        productId: number;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }> = [];

      for (const reqItem of requestedItems) {
        const [product] = await tx
          .select()
          .from(products)
          .where(eq(products.id, reqItem.productId))
          .limit(1);

        if (!product) throw new AppError("Produk tidak ditemukan", 404);
        if (reqItem.quantity > product.stock) {
          throw new AppError(
            `Stok ${product.name} tidak mencukupi (tersisa ${product.stock})`,
            400
          );
        }

        const totalPrice = product.price * reqItem.quantity;
        subtotal += totalPrice;

        await tx
          .update(products)
          .set({ stock: product.stock - reqItem.quantity, updatedAt: new Date() })
          .where(eq(products.id, product.id));

        preparedItems.push({
          productId: product.id,
          quantity: reqItem.quantity,
          unitPrice: product.price,
          totalPrice,
        });
      }

      const totalAmount = subtotal + SHIPPING_FEE;

      const [wallet] = await tx
        .select()
        .from(wallets)
        .where(eq(wallets.userId, auth.user.id))
        .limit(1);

      if (!wallet || wallet.balance < totalAmount) {
        throw new AppError("Saldo wallet tidak mencukupi", 402);
      }

      await tx
        .update(wallets)
        .set({
          balance: wallet.balance - totalAmount,
          updatedAt: new Date(),
        })
        .where(eq(wallets.userId, auth.user.id));

      const [newOrder] = await tx
        .insert(orders)
        .values({
          userId: auth.user.id,
          status: "pending",
          subtotal,
          shippingFee: SHIPPING_FEE,
          totalAmount,
          shippingAddress: parsed.data.shippingAddress,
        })
        .returning();

      await tx.insert(orderItems).values(
        preparedItems.map((item) => ({
          ...item,
          orderId: newOrder.id,
        }))
      );

      if (fromCart) {
        await tx.delete(cartItems).where(eq(cartItems.userId, auth.user.id));
      }

      return newOrder;
    });

    return ok(order, "Pesanan berhasil dibuat", 201);
  } catch (err) {
    return handleApiError(err);
  }
}
