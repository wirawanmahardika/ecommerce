"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Trash2, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/src/lib/utils";

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: { name: string; imageUrl: string | null } | null;
}

interface OrderRow {
  id: number;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  createdAt: string;
  user?: { username: string; fullname: string; email: string } | null;
  items: OrderItem[];
}

const STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [detailOrder, setDetailOrder] = useState<OrderRow | null>(null);

  const loadOrders = useCallback(() => {
    fetch("/api/orders?scope=all")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.data) setOrders(j.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateStatus = async (orderId: number, status: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadOrders();
  };

  const deleteOrder = async (orderId: number) => {
    if (!confirm("Hapus pesanan ini?")) return;
    await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
    loadOrders();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kelola Pesanan</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pantau dan perbarui status pengiriman pesanan customer.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <th className="px-5 py-3.5">Order</th>
              <th className="px-5 py-3.5">Customer</th>
              <th className="px-5 py-3.5">Tanggal</th>
              <th className="px-5 py-3.5">Total</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-4 font-mono text-xs font-bold">
                  #{order.id}
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-900">
                    {order.user?.fullname ?? "-"}
                  </p>
                  <p className="text-xs text-slate-500">
                    @{order.user?.username}
                  </p>
                </td>
                <td className="px-5 py-4 text-xs text-slate-500">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-5 py-4 font-semibold text-slate-900">
                  {formatCurrency(order.totalAmount)}
                </td>
                <td className="px-5 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold capitalize focus:border-teal-600 focus:outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailOrder(order)}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
                      title="Detail"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteOrder(order.id)}
                      className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">
                  Belum ada data pesanan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                Detail Pesanan #{detailOrder.id}
              </h3>
              <button
                type="button"
                onClick={() => setDetailOrder(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Alamat Pengiriman:</p>
              <p className="mt-0.5">{detailOrder.shippingAddress}</p>
            </div>

            <div className="max-h-64 space-y-3 overflow-y-auto">
              {detailOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product?.imageUrl || "/img/shoes1.png"}
                      alt={item.product?.name ?? "Produk"}
                      className="h-12 w-12 rounded-lg bg-slate-50 object-contain p-1"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.product?.name ?? "Produk"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.quantity} x {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
