"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Package, PlusCircle, User, Wallet } from "lucide-react";
import Navbar from "@/src/components/store/Navbar";
import Footer from "@/src/components/store/Footer";
import { formatCurrency, formatDate } from "@/src/lib/utils";

interface UserProfile {
  id: string;
  fullname: string;
  username: string;
  email: string;
  role: string;
  balance: number;
}

interface OrderRow {
  id: number;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  createdAt: string;
  items: Array<{
    id: number;
    quantity: number;
    totalPrice: number;
    product?: { name: string; imageUrl: string | null } | null;
  }>;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [topupAmount, setTopupAmount] = useState("500000");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const meRes = await fetch("/api/auth/me");
      const meJson = await meRes.json();
      if (!meJson.data) {
        router.push("/login");
        return;
      }
      setUser(meJson.data);

      const ordRes = await fetch("/api/orders");
      if (ordRes.ok) {
        const ordJson = await ordRes.json();
        setOrders(ordJson.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleTopup = async () => {
    setMsg(null);
    const res = await fetch("/api/wallet/topup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseInt(topupAmount, 10) }),
    });
    const json = await res.json();
    if (res.ok) {
      setMsg("Saldo wallet berhasil ditambahkan!");
      loadProfile();
    } else {
      setMsg(json.message ?? "Gagal top up");
    }
  };

  const handleConfirmDelivered = async (orderId: number) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    if (res.ok) {
      loadProfile();
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-teal-100 text-teal-800",
      completed: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
          map[status] ?? "bg-slate-100 text-slate-700"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {loading || !user ? (
          <div className="h-64 animate-pulse rounded-2xl bg-white" />
        ) : (
          <div className="space-y-8">
            {/* Profile & Wallet Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    {user.fullname}
                  </h1>
                  <p className="text-sm text-slate-500">@{user.username}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-slate-900 to-teal-900 p-6 text-white shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-teal-200">
                    TokoSedia Wallet
                  </span>
                  <Wallet className="h-5 w-5 text-teal-300" />
                </div>
                <p className="my-2 text-2xl font-extrabold">
                  {formatCurrency(user.balance ?? 0)}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    className="w-full rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-white placeholder:text-white/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleTopup}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-teal-400 cursor-pointer"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Top Up
                  </button>
                </div>
              </div>
            </div>

            {msg && (
              <div className="rounded-xl bg-teal-50 p-3 text-sm font-medium text-teal-800 border border-teal-200">
                {msg}
              </div>
            )}

            {/* Order History */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <Package className="h-5 w-5 text-teal-700" />
                <h2 className="text-lg font-bold text-slate-900">
                  Riwayat Pesanan ({orders.length})
                </h2>
              </div>

              {orders.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  Belum ada transaksi pesanan.
                </p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-slate-700">
                            Order #{order.id}
                          </span>
                          {statusBadge(order.status)}
                        </div>
                        <span className="text-xs text-slate-500">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-slate-700">
                              {item.product?.name ?? "Produk"} x{item.quantity}
                            </span>
                            <span className="font-medium text-slate-900">
                              {formatCurrency(item.totalPrice)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                        <p className="text-xs text-slate-500">
                          Alamat: {order.shippingAddress}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-900">
                            Total: {formatCurrency(order.totalAmount)}
                          </span>
                          {order.status === "delivered" && (
                            <button
                              type="button"
                              onClick={() => handleConfirmDelivered(order.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Pesanan Diterima
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
