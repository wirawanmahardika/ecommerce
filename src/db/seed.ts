import { db, brands, categories, products, users, wallets } from "./index";
import { slugify } from "../lib/utils";

async function seed() {
  console.log("Seeding database...");

  const adminPass = await Bun.password.hash("Admin123!");
  const userPass = await Bun.password.hash("User1234!");

  const [admin] = await db
    .insert(users)
    .values({
      fullname: "Admin TokoSedia",
      username: "admin",
      email: "admin@tokosedia.com",
      password: adminPass,
      role: "admin",
      emailValidated: true,
    })
    .onConflictDoNothing()
    .returning();

  if (admin) {
    await db
      .insert(wallets)
      .values({ userId: admin.id, balance: 10_000_000 })
      .onConflictDoNothing();
  }

  const [demoUser] = await db
    .insert(users)
    .values({
      fullname: "Wirawan Mahardika",
      username: "dika123",
      email: "dika@tokosedia.com",
      password: userPass,
      role: "user",
      emailValidated: true,
    })
    .onConflictDoNothing()
    .returning();

  if (demoUser) {
    await db
      .insert(wallets)
      .values({ userId: demoUser.id, balance: 2_500_000 })
      .onConflictDoNothing();
  }

  const brandSeeds = [
    { name: "Nike", logoUrl: "/img/nike.png" },
    { name: "Adidas", logoUrl: "/img/adidas.png" },
    { name: "Converse", logoUrl: "/img/converse.png" },
    { name: "Puma", logoUrl: "/img/puma.png" },
    { name: "Gucci", logoUrl: "/img/gucci.png" },
  ];

  for (const b of brandSeeds) {
    await db
      .insert(brands)
      .values({ name: b.name, slug: slugify(b.name), logoUrl: b.logoUrl })
      .onConflictDoNothing();
  }

  const categorySeeds = [
    { name: "Sepatu", imageUrl: "/img/shoes1.png" },
    { name: "Baju", imageUrl: "/img/baju.png" },
    { name: "Celana", imageUrl: "/img/celana.png" },
    { name: "Aksesoris", imageUrl: "/img/kalung.png" },
  ];

  for (const c of categorySeeds) {
    await db
      .insert(categories)
      .values({ name: c.name, slug: slugify(c.name), imageUrl: c.imageUrl })
      .onConflictDoNothing();
  }

  const allBrands = await db.select().from(brands);
  const allCategories = await db.select().from(categories);

  const brandMap = Object.fromEntries(allBrands.map((b) => [b.name, b.id]));
  const catMap = Object.fromEntries(allCategories.map((c) => [c.name, c.id]));

  const productSeeds = [
    {
      name: "Nike Air Max Classic",
      brand: "Nike",
      category: "Sepatu",
      price: 1450000,
      stock: 15,
      imageUrl: "/img/shoes1.png",
      isFeatured: true,
      description: "Sepatu lari ikonik dengan bantalan udara yang nyaman untuk aktivitas harian.",
    },
    {
      name: "Adidas Ultraboost Runner",
      brand: "Adidas",
      category: "Sepatu",
      price: 1850000,
      stock: 12,
      imageUrl: "/img/shoes2.png",
      isFeatured: true,
      description: "Desain responsif dengan sol empuk untuk performa maksimal.",
    },
    {
      name: "Converse Chuck Taylor High",
      brand: "Converse",
      category: "Sepatu",
      price: 890000,
      stock: 20,
      imageUrl: "/img/shoes3.png",
      isFeatured: true,
      description: "Sneakers kanvas klasik yang cocok untuk segala gaya kasual.",
    },
    {
      name: "Puma Essential Tee",
      brand: "Puma",
      category: "Baju",
      price: 320000,
      stock: 30,
      imageUrl: "/img/baju.png",
      isFeatured: true,
      description: "Kaos katun premium yang ringan dan breathable.",
    },
    {
      name: "Adidas Cargo Pants",
      brand: "Adidas",
      category: "Celana",
      price: 650000,
      stock: 18,
      imageUrl: "/img/celana.png",
      isFeatured: false,
      description: "Celana kasual modern dengan potongan relaxed fit.",
    },
    {
      name: "Gucci Silver Chain",
      brand: "Gucci",
      category: "Aksesoris",
      price: 3200000,
      stock: 5,
      imageUrl: "/img/kalung.png",
      isFeatured: false,
      description: "Aksesoris kalung elegan dengan detail mewah.",
    },
    {
      name: "Gucci Leather Bracelet",
      brand: "Gucci",
      category: "Aksesoris",
      price: 2100000,
      stock: 8,
      imageUrl: "/img/gelang.png",
      isFeatured: false,
      description: "Gelang kulit premium dengan sentuhan modern.",
    },
  ];

  for (const p of productSeeds) {
    const brandId = brandMap[p.brand];
    const categoryId = catMap[p.category];
    if (!brandId || !categoryId) continue;

    await db
      .insert(products)
      .values({
        name: p.name,
        slug: slugify(p.name),
        description: p.description,
        brandId,
        categoryId,
        price: p.price,
        stock: p.stock,
        imageUrl: p.imageUrl,
        isFeatured: p.isFeatured,
      })
      .onConflictDoNothing();
  }

  console.log("Seeding completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
