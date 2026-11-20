import { SQL } from "bun";
import { defineRelations } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    wallet: r.one.wallets({
      from: r.users.id,
      to: r.wallets.userId,
    }),
    orders: r.many.orders(),
    cartItems: r.many.cartItems(),
  },
  wallets: {
    user: r.one.users({
      from: r.wallets.userId,
      to: r.users.id,
    }),
  },
  brands: {
    products: r.many.products(),
  },
  categories: {
    products: r.many.products(),
  },
  products: {
    brand: r.one.brands({
      from: r.products.brandId,
      to: r.brands.id,
    }),
    category: r.one.categories({
      from: r.products.categoryId,
      to: r.categories.id,
    }),
    orderItems: r.many.orderItems(),
    cartItems: r.many.cartItems(),
  },
  cartItems: {
    user: r.one.users({
      from: r.cartItems.userId,
      to: r.users.id,
    }),
    product: r.one.products({
      from: r.cartItems.productId,
      to: r.products.id,
    }),
  },
  orders: {
    user: r.one.users({
      from: r.orders.userId,
      to: r.users.id,
    }),
    items: r.many.orderItems(),
  },
  orderItems: {
    order: r.one.orders({
      from: r.orderItems.orderId,
      to: r.orders.id,
    }),
    product: r.one.products({
      from: r.orderItems.productId,
      to: r.products.id,
    }),
  },
}));

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5430/shop";

const globalForDb = globalThis as unknown as {
  sql: SQL | undefined;
};

const sql = globalForDb.sql ?? new SQL(databaseUrl);

if (process.env.NODE_ENV !== "production") {
  globalForDb.sql = sql;
}

export const db = drizzle({ client: sql, relations });
export * from "./schema";
