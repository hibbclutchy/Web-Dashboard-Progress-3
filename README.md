# AKABI Kedelai Dashboard - Pure React Version

Dashboard monitoring pertanian komoditas kedelai berbasis **React (Vite)**, TypeScript, Tailwind CSS, Recharts, dan desain glassmorphic.

## Menjalankan lokal

```powershell
npm install
Copy-Item .env.local.example .env.local
npm run dev
```

Buka `http://localhost:3000`.

## Integrasi Google Sheets

Isi `.env.local` (variabel hanya dibaca server, sehingga API key tidak dikirim ke browser):

```env
GOOGLE_SHEETS_API_KEY=...
GOOGLE_SHEETS_SPREADSHEET_ID=...
GOOGLE_SHEETS_RANGE=...
EXPORT_TOKEN=...
```

Server-side akan mengambil data dari Google Sheets REST API v4. Untuk spreadsheet besar, range terbuka seperti `MASTERPROVITAS!A:L` dibaca dalam beberapa chunk agar refresh tidak timeout. Semua kolom A:L, termasuk komoditas dan catatan, tetap dimuat; nilai formula/error yang tidak valid dibersihkan saat parsing. Dashboard otomatis:

- Mengambil data saat halaman dibuka dan menyediakan tombol **Refresh**.
- Mem-parsing kolom `Tahun`, `Bulan`, `Provinsi`, `Kabupaten/Kota`, `Luas Tanam (Ha)`, `Luas Panen (Ha)`, `Produksi (Ton)`, dan `Komoditas`.
- Mengubah nama bulan Indonesia ke format grafik.
- Menampilkan status koneksi yang jelas. Jika koneksi gagal, data contoh dipakai sebagai fallback agar UI tetap terbuka.

Pastikan Google Sheets API aktif, API key dibatasi untuk Google Sheets API, dan spreadsheet dapat dibaca sesuai pengaturan aksesnya.

## Navigasi dan fitur

Navigasi **Overview**, **Komoditas**, **Wilayah**, **Petani**, dan **Settings** sekarang berpindah tampilan tanpa tetap terkunci di dashboard. Filter tahun/bulan/provinsi/kabupaten, pencarian wilayah, mode gelap, refresh koneksi, dan tabel modul terhubung ke state data yang sama.

## Export Excel

Klik **Export Excel**. Dialog token dapat ditutup dengan tombol **Batal**, ikon **X**, klik area di luar dialog, atau tombol `Escape`.

Token demo saat ini:

```text
AKABIKEDELAI
```

## Perbedaan dengan versi Next.js

- Menggunakan **Vite** sebagai development server dan build tool
- API routes menggunakan **Express** middleware dalam Vite dev server
- Komponen menggunakan pure React hooks tanpa Next.js App Router
- Logo menggunakan `<img>` tag biasa (tidak pakai Next.js Image component)
- Struktur lebih sederhana dan bisa di-deploy ke platform apa saja yang mendukung Node.js

## Build & Deploy

Untuk production build:

```powershell
npm run build
npm run preview
```

Deploy ke hosting mana pun yang mendukung Node.js dengan menjalankan `node dist/server/index.js` untuk server API + frontend.


## Struktur halaman (setelah digabung dengan landing page)

| URL | File | Keterangan |
| --- | --- | --- |
| `/` | `app/page.tsx` | Landing page / Home (pilih komoditas) |
| `/dashboardkedelai` | `app/dashboardkedelai/page.tsx` | Dashboard kedelai |
| `/dashboardjagung`, dst. | `app/[slug]/page.tsx` | Halaman "belum tersedia" sampai dashboard-nya dibuat |

Aset landing page (`bg-home.png`, `logo-akabi.jpeg`) diletakkan di folder `public/`.
Untuk menambah dashboard komoditas baru, buat folder `app/dashboard<nama>/page.tsx` lalu hapus slug-nya dari daftar `COMING_SOON` di `app/[slug]/page.tsx`.

