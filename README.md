# TokoSedia — Modern Full-Stack E-Commerce

Aplikasi e-commerce full-stack yang dibangun dengan **Next.js 16 (App Router)**, **Bun**, **PostgreSQL**, **Drizzle ORM (`@rc`)**, dan **S3 Object Storage (RustFS)**.

---

## Tech Stack

- **Runtime & Built-in APIs**: [Bun](https://bun.sh/) (`Bun.SQL`, `Bun.S3Client`, `Bun.password`, `Bun.randomUUIDv7`)
- **Framework**: Next.js 16.4.6 (App Router, Turbopack) + React 19
- **Styling & Icons**: Tailwind CSS v4 + `lucide-react`
- **Database & ORM**: PostgreSQL 16 + Drizzle ORM `1.0.0-rc.5` & Drizzle Kit `1.0.0-rc.5`
- **Object Storage**: RustFS (S3-compatible storage)
- **Auth & Validation**: `jose` (HTTP-only JWT cookie) + `zod`

---

## Prasyarat

- [Bun](https://bun.sh/) (`>= 1.4`)
- Docker & Docker Compose

---

## Cara Menjalankan

### 1. Clone & Install Dependencies

```bash
bun install
```

### 2. Konfigurasi Environment (`.env`)

Pastikan file `.env` tersedia di root proyek:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5430/shop"
JWT_SECRET="tokosedia-super-secret-jwt-key-change-in-production"

S3_ENDPOINT="http://localhost:9000"
S3_REGION="us-east-1"
S3_BUCKET="tokosedia"
S3_ACCESS_KEY_ID="rustfsadmin"
S3_SECRET_ACCESS_KEY="rustfsadmin"
```

### 3. Jalankan PostgreSQL & RustFS S3 via Docker Compose

```bash
docker compose up -d
```

Layanan yang berjalan:
- **PostgreSQL 16** (`tokosedia-postgres`): `localhost:5430` (database `shop`)
- **RustFS S3 API** (`tokosedia-s3`): `http://localhost:9000`
- **RustFS Console**: `http://localhost:9001` (login: `rustfsadmin` / `rustfsadmin`)

### 4. Push Schema Database & Seed Data

```bash
bun db:push
bun db:seed
```

### 5. Jalankan Development Server

```bash
bun dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## Akun Demo (Hasil Seed)

| Role  | Username  | Email                  | Password    |
| ----- | --------- | ---------------------- | ----------- |
| Admin | `admin`   | `admin@tokosedia.com`  | `Admin123!` |
| User  | `dika123` | `dika@tokosedia.com`   | `User1234!` |

---

## Daftar Script

| Script            | Perintah                          | Keterangan                              |
| ----------------- | --------------------------------- | --------------------------------------- |
| `bun dev`         | `bun --bun next dev`              | Menjalankan server development          |
| `bun build`       | `bun --bun next build`            | Build aplikasi untuk production         |
| `bun start`       | `bun --bun next start`            | Menjalankan hasil build production      |
| `bun lint`        | `eslint`                          | Menjalankan linter                      |
| `bun db:push`     | `bun --bun drizzle-kit push`      | Sinkronisasi schema langsung ke DB      |
| `bun db:generate` | `bun --bun drizzle-kit generate`  | Generate file migrasi Drizzle           |
| `bun db:migrate`  | `bun --bun drizzle-kit migrate`   | Menjalankan migrasi ke database         |
| `bun db:pull`     | `bun --bun drizzle-kit pull`      | Introspect schema dari database         |
| `bun db:studio`   | `bun --bun drizzle-kit studio`    | Membuka Drizzle Studio                  |
| `bun db:check`    | `bun --bun drizzle-kit check`     | Validasi konsistensi schema/migrasi     |
| `bun db:seed`     | `bun run src/db/seed.ts`          | Mengisi data awal (user, brand, produk) |

> **Catatan**: Script Next.js dan Drizzle menggunakan flag `bun --bun` agar runtime API bawaan Bun (`Bun.SQL`, `Bun.password`, `Bun.S3Client`) aktif.

---

## Struktur Proyek

```text
.
├── app/
│   ├── admin/              # Halaman Admin Dashboard (orders, products, categories, brands, customers)
│   ├── api/                # Route Handlers (auth, products, categories, brands, cart, orders, wallet, upload, files, admin)
│   ├── cart/               # Halaman Keranjang & Checkout
│   ├── login/              # Halaman Login
│   ├── profile/            # Halaman Profil, Wallet & Riwayat Pesanan
│   ├── signup/             # Halaman Registrasi
│   ├── toko/               # Halaman Katalog Toko (pencarian & filter)
│   └── page.tsx            # Landing Page / Storefront
├── src/
│   ├── components/         # Komponen UI (admin & storefront)
│   ├── db/
│   │   ├── index.ts        # Koneksi Bun.SQL + Drizzle ORM + defineRelations
│   │   ├── schema.ts       # Schema PostgreSQL (users, wallets, brands, categories, products, cart_items, orders, order_items)
│   │   └── seed.ts         # Script seeding database
│   └── lib/
│       ├── auth.ts         # JWT session helper (jose)
│       ├── response.ts     # Standard API response & error handler
│       ├── s3.ts           # Helper Bun.S3Client (upload & delete)
│       ├── utils.ts        # Formatter & slugify
│       └── validators.ts   # Schema validasi Zod
├── docker-compose.yml      # Konfigurasi PostgreSQL 16 & RustFS S3
├── drizzle.config.ts       # Konfigurasi Drizzle Kit
└── package.json
```

---

## Fitur Utama

- **Storefront**: Landing page, katalog produk dengan pencarian dan filter kategori/brand (`/toko`), keranjang belanja & checkout transaksional (`/cart`), serta profil pengguna, top-up wallet, dan riwayat pesanan (`/profile`).
- **Admin Dashboard** (`/admin`): Ringkasan statistik, manajemen produk, kategori, brand, status pesanan, dan daftar pelanggan.
- **S3 Media Storage**: Upload gambar melalui `/api/upload` ke RustFS (`Bun.S3Client`) dan streaming file melalui `/api/files/[...key]`, dengan hanya menyimpan URL/key di PostgreSQL.
