"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DollarSign, Package, ShoppingBag, Users } from "lucide-react";
import { formatCurrency, formatDate } from "@/src/lib/utils";

interface StatsData {
  customers: number;
  products: number;
  categories: number;
  brands: number;
  orders: number;
  revenue: number;
  recentOrders: Array<{
    id: number;
    status: string;
    totalAmount: number;
    createdAt: string;
    user?: { username: string; fullname: string } | null;
    items: Array<{ id: number }>;
  }>;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.data) setStats(j.data);
      })
      .catch(() => {});
  }, []);

  const cards = [
    {
      label: "Total Pendapatan",
      value: formatCurrency(stats?.revenue ?? 0),
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Total Pesanan",
      value: String(stats?.orders ?? 0),
      icon: ShoppingBag,
      color: "bg-teal-50 text-teal-700",
    },
    {
      label: "Total Produk",
      value: String(stats?.products ?? 0),
      icon: Package,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Total Customer",
      value: String(stats?.customers ?? 0),
      icon: Users,
      color: "bg-indigo-50 text-indigo-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan performa toko dan aktivitas pesanan terbaru.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <p className="text-xs font-medium text-slate-500">{c.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {c.value}
                </p>
              </div>
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.color}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Pesanan Terbaru</h2>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-teal-700 hover:underline"
          >
            Kelola Semua &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 pr-4">ID</th>
                <th className="py-3 pr-4">Customer</th>
                <th className="py-3 pr-4">Tanggal</th>
                <th className="py-3 pr-4">Item</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentOrders?.map((o) => (
                <tr key={o.id}>
                  <td className="py-3 pr-4 font-mono text-xs font-semibold">
                    #{o.id}
                  </td>
                  <td className="py-3 pr-4 font-medium text-slate-900">
                    {o.user?.fullname ?? o.user?.username ?? "-"}
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-500">
                    {formatDate(o.createdAt)}
                  </td>
                  <td className="py-3 pr-4">{o.items.length}</td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-700">
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 text-right font-semibold text-slate-900">
                    {formatCurrency(o.totalAmount)}
                  </td>
                </tr>
              ))}
              {(!stats || stats.recentOrders.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada pesanan masuk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
