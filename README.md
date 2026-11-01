# Pesona Khayangan Juanda - Prototype

Next.js 14 (App Router) + Tailwind + recharts + xlsx + jspdf + Supabase (database bersama).

## Menyiapkan database (sekali saja)
1. Buka project Supabase > **SQL Editor** > New query > tempel seluruh isi `supabase/schema.sql` > Run.
2. **Authentication > Sign In / Providers > Anonymous Sign-Ins** > aktifkan (penguji masuk sebagai pengguna anonim lalu memilih peran).
3. Pastikan `.env.local` berisi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (lihat `.env.example`).

## Menjalankan
    npm install
    npm run dev     # http://localhost:3000

Pengguna pertama yang membuka aplikasi otomatis mengisi database dengan data dummy awal.
Tanpa env Supabase, aplikasi berjalan dalam mode lokal (data di browser).

## Deploy ke Vercel
Upload ke GitHub, import di vercel.com, lalu isi Environment Variables (dua variabel di atas) sebelum Deploy.

## Panel pengelola data demo (tersembunyi)
Klik ikon gear kecil di samping teks footer, login User ID `brobar`, password `110375`.
