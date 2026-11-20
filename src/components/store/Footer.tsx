import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold">TokoSedia</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            Destinasi fashion modern dengan koleksi pilihan dari brand ternama,
            pembayaran wallet instan, dan pengiriman cepat ke seluruh Indonesia.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Navigasi
          </h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              <Link href="/" className="hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link href="/toko" className="hover:text-white">
                Katalog Produk
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-white">
                Keranjang Belanja
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-white">
                Profil & Riwayat
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Hubungi Kami
          </h3>
          <p className="text-sm text-slate-400">support@tokosedia.com</p>
          <p className="text-sm text-slate-400">+62 812-3456-7890</p>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        &copy; 2026 TokoSedia. All rights reserved.
      </div>
    </footer>
  );
}
