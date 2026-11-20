"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, Wallet } from "lucide-react";
import { formatCurrency } from "@/src/lib/utils";

interface CustomerRow {
  id: string;
  fullname: string;
  username: string;
  email: string;
  role: "user" | "admin";
  balance: number | null;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);

  const load = useCallback(() => {
    fetch("/api/admin/customers")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.data) setCustomers(j.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleEditBalance = async (customer: CustomerRow) => {
    const input = prompt(
      `Masukkan saldo wallet baru untuk ${customer.username}:`,
      String(customer.balance ?? 0)
    );
    if (input === null) return;
    const balance = parseInt(input, 10);
    if (Number.isNaN(balance) || balance < 0) return;

    await fetch(`/api/admin/customers/${customer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ balance }),
    });
    load();
  };

  const handleToggleRole = async (customer: CustomerRow) => {
    const nextRole = customer.role === "admin" ? "user" : "admin";
    await fetch(`/api/admin/customers/${customer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus customer ini?")) return;
    await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kelola Customer</h1>
        <p className="mt-1 text-sm text-slate-500">
          Lihat daftar pengguna, atur role, dan kelola saldo wallet.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <th className="px-5 py-3.5">Nama</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Saldo Wallet</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900">{c.fullname}</p>
                  <p className="text-xs text-slate-500">@{c.username}</p>
                </td>
                <td className="px-5 py-4 text-slate-600">{c.email}</td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => handleToggleRole(c)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize cursor-pointer ${
                      c.role === "admin"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {c.role}
                  </button>
                </td>
                <td className="px-5 py-4 font-semibold text-teal-700">
                  {formatCurrency(c.balance ?? 0)}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditBalance(c)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <Wallet className="h-3.5 w-3.5" />
                      Ubah Saldo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
