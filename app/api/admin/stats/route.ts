import { count, ne, sum } from "drizzle-orm";
import { db, brands, categories, orders, products, users } from "@/src/db";
import { requireAdmin } from "@/src/lib/auth";
import { handleApiError, ok } from "@/src/lib/response";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const [[userCount], [productCount], [categoryCount], [brandCount], [orderStats]] =
      await Promise.all([
        db.select({ total: count() }).from(users),
        db.select({ total: count() }).from(products),
        db.select({ total: count() }).from(categories),
        db.select({ total: count() }).from(brands),
        db
          .select({
            totalOrders: count(),
            totalRevenue: sum(orders.totalAmount),
          })
          .from(orders)
          .where(ne(orders.status, "cancelled")),
      ]);

    const recentOrders = await db.query.orders.findMany({
      limit: 5,
      orderBy: { createdAt: "desc" },
      with: {
        user: {
          columns: { username: true, fullname: true },
        },
        items: true,
      },
    });

    return ok({
      customers: userCount?.total ?? 0,
      products: productCount?.total ?? 0,
      categories: categoryCount?.total ?? 0,
      brands: brandCount?.total ?? 0,
      orders: orderStats?.totalOrders ?? 0,
      revenue: Number(orderStats?.totalRevenue ?? 0),
      recentOrders,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
