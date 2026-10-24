# Pesona Khayangan Juanda - Prototype

Next.js 14 (App Router) + Tailwind CSS + recharts + xlsx + jspdf. Semua data dummy, disimpan di localStorage browser masing-masing.

## Menjalankan
    npm install
    npm run dev     # http://localhost:3000

## Deploy ke Vercel
Upload ke GitHub, lalu Add New > Project di vercel.com, import repo, klik Deploy (tanpa environment variable).

## Panel pengelola data demo (tersembunyi)
Klik ikon gear kecil di samping teks footer (ada di setiap halaman), lalu login User ID `brobar`, password `110375`.

## IPL WhatsApp (simulasi)
Menu "IPL WhatsApp" (Pengurus RW, Pengurus RT, Bendahara): 7 grup "IPL PKJ RT xx RW xx" (RW 29 = 4 RT, RW 31 = 3 RT).
Bayar via scan QR menghasilkan 3 pesan otomatis: notifikasi grup, notifikasi pribadi, dan rekap bulan ini.
Ini simulasi di dalam aplikasi. Tombol "Kirim lewat WhatsApp" membuka wa.me dengan teks siap kirim.
