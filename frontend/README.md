# AKABI Dashboard Frontend

Frontend dashboard berbasis Next.js, React, TypeScript, Tailwind CSS, dan Recharts.

## Menjalankan

Dari folder `frontend/`:

```powershell
Copy-Item .env.local.example .env.local
npm install
npm run dev
```

Atur `NEXT_PUBLIC_API_URL` jika backend tidak berjalan pada `http://localhost:4000`.

## Struktur utama

- `app/` — halaman dan layout Next.js.
- `components/` — komponen UI.
- `lib/data.ts` — tipe dan parser data dashboard.
- `lib/api.ts` — pembentuk URL API backend.
- `public/` — aset gambar.

Frontend tidak menyimpan kredensial Google Sheets atau token export.
