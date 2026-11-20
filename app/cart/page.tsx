"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Navbar from "@/src/components/store/Navbar";
import Footer from "@/src/components/store/Footer";
import { formatCurrency } from "@/src/lib/utils";

interface CartItemRow {
  id: number;
  productId: number;
  quantity: number;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItemRow[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [shippingAddress, setShippingAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const [meRes, cartRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/cart"),
      ]);
      const meJson = await meRes.json();
      if (!meJson.data) {
        router.push("/login");
        return;
      }
      setBalance(meJson.data.balance ?? 0);

      if (cartRes.ok) {
        const cartJson = await cartRes.json();
        setItems(cartJson.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const updateQty = async (productId: number, quantity: number) => {
    setErrorMsg(null);
    const res = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    const json = await res.json();
    if (!res.ok) {
      setErrorMsg(json.message);
      return;
    }
    loadCart();
  };

  const removeItem = async (productId: number) => {
    await fetch(`/api/cart?productId=${productId}`, { method: "DELETE" });
    loadCart();
  };

  const handleCheckout = async () => {
    setErrorMsg(null);
    if (shippingAddress.trim().length < 5) {
      setErrorMsg("Masukkan alamat pengiriman minimal 5 karakter");
      return;
    }
    setCheckingOut(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingAddress }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.message ?? "Checkout gagal");
        return;
      }
      router.push("/profile");
    } finally {
      setCheckingOut(false);
    }
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = items.length > 0 ? 15000 : 0;
  const total = subtotal + shippingFee;
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar cartCountOverride={cartCount} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-bold text-slate-900 sm:text-3xl">
          Keranjang Belanja
        </h1>

        {loading ? (
          <div className="h-64 animate-pulse rounded-2xl bg-white" />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <ShoppingBag className="mb-3 h-12 w-12 text-slate-300" />
            <p className="text-lg font-semibold text-slate-700">
              Keranjang Anda masih kosong
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Yuk temukan produk fashion favoritmu di katalog!
            </p>
            <Link
              href="/toko"
              className="mt-5 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Belanja Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                >
                  <img
                    src={item.imageUrl || "/img/shoes1.png"}
                    alt={item.name}
                    className="h-20 w-20 rounded-xl bg-slate-50 object-contain p-2 sm:h-24 sm:w-24"
                  />
                  <div className="flex flex-1 flex-col gap-1">
                    <h3 className="font-semibold text-slate-900">
                      {item.name}
                    </h3>
                    <p className="text-sm font-bold text-teal-700">
                      {formatCurrency(item.price)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Stok tersedia: {item.stock}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() =>
                          updateQty(item.productId, item.quantity - 1)
                        }
                        className="p-2 text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQty(item.productId, item.quantity + 1)
                        }
                        className="p-2 text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Ringkasan Pesanan
              </h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Ongkos Kirim</span>
                  <span>{formatCurrency(shippingFee)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-bold text-slate-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                Saldo Wallet Anda:{" "}
                <span
                  className={`font-bold ${
                    balance < total ? "text-red-600" : "text-teal-700"
                  }`}
                >
                  {formatCurrency(balance)}
                </span>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Alamat Pengiriman
                </label>
                <textarea
                  rows={3}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Jl. Merdeka No. 10, Jakarta..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-teal-600 focus:outline-none"
                />
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700">
                  {errorMsg}
                </div>
              )}

              <button
                type="button"
                disabled={checkingOut}
                onClick={handleCheckout}
                className="w-full rounded-xl bg-teal-700 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 cursor-pointer disabled:opacity-50"
              >
                {checkingOut ? "Memproses Checkout..." : "Bayar Sekarang"}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
