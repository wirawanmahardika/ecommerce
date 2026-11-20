import { z } from "zod";

export const signupSchema = z.object({
  fullname: z.string().min(2, "Nama lengkap minimal 2 karakter").max(255),
  username: z
    .string()
    .min(4, "Username minimal 4 karakter")
    .max(50, "Username maksimal 50 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore"),
  email: z.string().email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
    .regex(/[0-9]/, "Password harus mengandung minimal 1 angka"),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Username atau email wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const updateProfileSchema = z.object({
  fullname: z.string().min(2).max(255),
  username: z.string().min(4).max(50),
  email: z.string().email(),
  avatarUrl: z.string().nullable().optional(),
});

export const brandSchema = z.object({
  name: z.string().min(1, "Nama brand wajib diisi").max(120),
  logoUrl: z.string().nullable().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi").max(120),
  imageUrl: z.string().nullable().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi").max(255),
  description: z.string().nullable().optional(),
  brandId: z.coerce.number().int().positive("Brand wajib dipilih"),
  categoryId: z.coerce.number().int().positive("Kategori wajib dipilih"),
  price: z.coerce.number().int().min(0, "Harga tidak boleh negatif"),
  stock: z.coerce.number().int().min(0, "Stok tidak boleh negatif"),
  imageUrl: z.string().nullable().optional(),
  isFeatured: z.boolean().optional(),
});

export const checkoutSchema = z.object({
  shippingAddress: z.string().min(5, "Alamat pengiriman minimal 5 karakter"),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .optional(),
});
