"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ShoppingCart, Star } from "lucide-react";
import { formatCurrency } from "@/src/lib/utils";

export interface ProductItem {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  rating: string | null;
  imageUrl: string | null;
  brandName?: string | null;
  categoryName?: string | null;
}

export default function ProductCard({
  product,
  onAdded,
}: {
  product: ProductItem;
  onAdded?: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const router = useRouter();

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (res.ok) {
        setAdded(true);
        onAdded?.();
        setTimeout(() => setAdded(false), 1500);
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative flex h-52 items-center justify-center overflow-hidden bg-slate-50 p-6">
        <img
          src={product.imageUrl || "/img/shoes1.png"}
          alt={product.name}
          className="max-h-40 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
        />
        {product.stock <= 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
            Habis
          </span>
        )}
        {product.brandName && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm">
            {product.brandName}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-teal-700">
            {product.categoryName || "Fashion"}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {product.rating ?? "5.0"}
          </span>
        </div>

        <h3 className="line-clamp-1 text-base font-semibold text-slate-900">
          {product.name}
        </h3>

        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
            {product.description}
          </p>
        )}

        <div className="mt-auto pt-4">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(product.price)}
            </span>
            <span className="text-xs text-slate-500">Stok: {product.stock}</span>
          </div>

          <button
            type="button"
            disabled={adding || product.stock <= 0}
            onClick={handleAddToCart}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-slate-900 text-white hover:bg-teal-700"
            }`}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" />
                Ditambahkan
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                {adding ? "Menambahkan..." : "Tambah ke Keranjang"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
