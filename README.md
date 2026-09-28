# AKABI Dashboard

Project ini dipisahkan menjadi dua aplikasi:

- `frontend/` — Next.js dashboard dan seluruh tampilan pengguna.
- `backend/` — API Node.js untuk Google Sheets dan verifikasi token export.

## Menjalankan lokal

### Backend

```powershell
cd backend
Copy-Item .env.example .env
# Isi GOOGLE_SHEETS_API_KEY, GOOGLE_SHEETS_SPREADSHEET_ID,
# GOOGLE_SHEETS_RANGE, dan EXPORT_TOKEN di .env
npm run dev
```

Backend berjalan di `http://localhost:4000`.

### Frontend

```powershell
cd frontend
Copy-Item .env.local.example .env.local
npm install
npm run dev
```

Frontend berjalan di `http://localhost:3000` dan menggunakan `NEXT_PUBLIC_API_URL` untuk mengakses backend.

## Endpoint backend

- `GET /api/health` — status API.
- `GET /api/sheets` — mengambil data Google Sheets dengan cache dan fallback yang aman.
- `POST /api/export-auth` — memvalidasi token export Excel.

Jangan menaruh kredensial Google Sheets atau `EXPORT_TOKEN` di folder frontend. Semua secret hanya dibaca oleh backend.
