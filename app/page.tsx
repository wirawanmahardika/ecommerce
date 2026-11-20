"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Truck, Wallet } from "lucide-react";
import Navbar from "@/src/components/store/Navbar";
import Footer from "@/src/components/store/Footer";
import ProductCard, { ProductItem } from "@/src/components/store/ProductCard";

interface BrandItem {
  id: number;
  name: string;
  logoUrl: string | null;
}

interface CategoryItem {
  id: number;
  name: string;
  imageUrl: string | null;
}

export default function HomePage() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [featured, setFeatured] = useState<ProductItem[]>([]);

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((j) => setBrands(j.data ?? []))
      .catch(() => {});

    fetch("/api/categories")
      .then((r) => r.json())
      .then((j) => setCategories(j.data ?? []))
      .catch(() => {});

    fetch("/api/products?featured=true")
      .then((r) => r.json())
      .then((j) => setFeatured(j.data ?? []))
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-300">
              <Sparkles className="h-3.5 w-3.5" />
              Koleksi Fashion Terbaru 2026
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Temukan Gaya{" "}
              <span className="bg-gradient-to-r from-teal-300 to-amber-300 bg-clip-text text-transparent">
                Fashion Impianmu
              </span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Belanja sneakers, pakaian, dan aksesoris original dari brand
              terbaik dunia dengan checkout instan menggunakan TokoSedia Wallet.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/toko"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:bg-teal-400"
              >
                Jelajahi Katalog
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Cek Wallet & Pesanan
              </Link>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" />
            <img
              src="/img/bg-image-home.png"
              alt="TokoSedia Fashion"
              className="relative z-10 max-h-96 w-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Pengiriman Flat Rp 15.000
              </h3>
              <p className="text-xs text-slate-500">
                Cepat, aman, dan terlacak real-time
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Pembayaran Wallet Instan
              </h3>
              <p className="text-xs text-slate-500">
                Top up mudah dan transaksi transparan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                100% Produk Original
              </h3>
              <p className="text-xs text-slate-500">
                Garansi keaslian dari brand resmi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Kategori Pilihan
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Temukan produk sesuai gaya yang kamu cari
              </p>
            </div>
            <Link
              href="/toko"
              className="text-sm font-semibold text-teal-700 hover:underline"
            >
              Lihat Semua &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/toko?categoryId=${cat.id}`}
                className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-600 hover:shadow-md"
              >
                <img
                  src={cat.imageUrl || "/img/shoes1.png"}
                  alt={cat.name}
                  className="h-20 w-20 object-contain transition-transform group-hover:scale-110"
                />
                <span className="text-sm font-semibold text-slate-900 capitalize">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Produk Unggulan
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Item paling diminati minggu ini
              </p>
            </div>
            <Link
              href="/toko"
              className="text-sm font-semibold text-teal-700 hover:underline"
            >
              Semua Produk &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <section className="border-t border-slate-200 bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
              Dipercaya oleh Brand Ternama
            </p>
            <div className="grid grid-cols-2 items-center justify-items-center gap-8 sm:grid-cols-3 md:grid-cols-5">
              {brands.map((b) => (
                <img
                  key={b.id}
                  src={b.logoUrl || "/img/nike.png"}
                  alt={b.name}
                  className="h-12 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
