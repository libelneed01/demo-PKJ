# Pesona Khayangan Juanda - Spesifikasi Final

**Tagline:** Tetangga Kompak Lingkungan Hebat
**Status dokumen:** Draf final v1 untuk ditinjau, lalu dijadikan acuan pengembangan
**Cakupan:** RW 29 dan RW 31 (600 rumah), prototype demo dengan database bersama

Dokumen ini menggabungkan tiga sumber: narasi prototype, dokumen "Final Ultra-Align", dan keputusan yang diambil selama pengembangan. Bagian yang masih perlu diputuskan ditandai **[TERBUKA]** dan dikumpulkan di bagian 17.

---

## 1. Tujuan dan ruang lingkup

1. Menjadi alat kerja bersama pengurus, petugas, dan warga, bukan sekadar kumpulan formulir.
2. Setiap proses punya pemilik, batas waktu (SLA), eskalasi, dan jejak audit.
3. Penilaian petugas (KPI) bersumber dari data sistem yang bisa diperiksa silang, bukan dari kesan pribadi.
4. Prototype ini diuji banyak orang sekaligus (60+), sehingga data harus tersimpan di database bersama.

**Di luar cakupan prototype:** pembayaran sungguhan (payment gateway), mesin fingerprint fisik, panggilan ke layanan AI sungguhan, dan unggah file sungguhan (file hanya disimulasikan lewat nama file).

---

## 2. Tujuh pilar tata kelola dan aturannya

| No | Pilar | Modul utama | Aturan yang perlu dipublikasikan ke warga |
|---|---|---|---|
| 1 | Administrasi Kependudukan | Administrasi Warga, Lapor Data Kependudukan | Wajib lapor pindah masuk, pindah keluar, kelahiran, kematian, kontrak baru |
| 2 | Iuran Pengelolaan Lingkungan (IPL) | IPL dan Keuangan, IPL WhatsApp | Jatuh tempo, cara bayar, denda, transparansi penggunaan |
| 3 | Kebersihan dan Keindahan | Sampah, Kerusakan, Absensi dan Serah Terima Kebersihan | Jadwal angkut, titik buang, kerja bakti |
| 4 | Keamanan dan Ketertiban | Tamu, Absensi dan Serah Terima Security, Pengaduan | Jam tamu, tamu menginap, kendaraan asing, jam malam kegiatan |
| 5 | Parkir Kendaraan | Parkir | Larangan parkir di bahu jalan, depan gerbang, hydrant, tikungan |
| 6 | Akses Masuk Area Komplek | Tamu dan Akses Masuk | Stiker atau kartu akses, kendaraan berat, ojek dan taksi online |
| 7 | Pembangunan, Renovasi, Fasilitas | Izin, Kerusakan, Booking Fasilitas | Jam kerja renovasi, penanganan puing, tenggat selesai, persetujuan tetangga |

**Sanksi bertingkat (usulan, berlaku untuk parkir, keramaian, renovasi, kebersihan):**
Teguran lisan, lalu Surat Peringatan 1, SP 2, SP 3, lalu denda atau tindakan sesuai keputusan RW. Setiap tingkat tercatat di sistem dan terlihat oleh warga yang bersangkutan. **[TERBUKA]** nominal denda dan jumlah pelanggaran untuk naik tingkat.

Halaman **Aturan Komplek** per pilar dibuat dengan bahasa sederhana dan dapat dibuka dari dashboard warga.

---

## 3. Struktur organisasi dan role

```
Pengelola Cluster (akses tersembunyi di demo)
|
+-- Pengurus RW
    +-- Pengurus RT (per RT)  --  Warga / Penghuni
    +-- Bendahara
    +-- Pengurus Keamanan  -- Koordinator Keamanan -- Danru per regu -- Petugas security
    +-- Pengurus Kebersihan -- Danru per regu -- Petugas kebersihan
    +-- Pengurus Fasilitas   (tahap lanjut)
    +-- Takmir, Koordinator Pengajian, Koordinator Arisan (tahap lanjut)
```

- **RT:** RW 29 punya 4 RT (blok A, B, C, D+E), RW 31 punya 3 RT (blok F+G, H+I, J). **[TERBUKA]** pembagian ini asumsi, sesuaikan dengan kenyataan.
- **Koordinator Keamanan:** Bang Jago, 0812-3456-7890.
- **Danru (Komandan Regu):** satu per regu, menjabat 6 bulan, lalu dirotasi (bagian 10).

### Hak akses (ringkas)

| Data | Pengelola | RW | RT | Bendahara | Keamanan | Kebersihan | Warga |
|---|---|---|---|---|---|---|---|
| Data warga dan aset | Lihat, edit | Lihat | Lihat dan edit (RT sendiri) | Lihat | Kendaraan dan tamu saja | - | Edit data sendiri |
| IPL dan keuangan | Lihat | Lihat | Lihat (RT sendiri) | Lihat, edit | - | - | Lihat sendiri dan transparansi |
| Pengaduan | Semua | Semua, approve | Tindak lanjut (RT sendiri) | Hanya yang Umum | Menurut tingkat kerahasiaan dan kategori | Menurut tingkat kerahasiaan dan kategori | Buat, lacak milik sendiri, lihat yang Umum |
| Izin kegiatan | Lihat | Approve | Approve | - | Approve (tahap Keamanan) | - | Ajukan dan setujui sebagai tetangga |
| Absensi, KPI, serah terima | Lihat | Lihat | - | Lihat (KPI untuk gaji dan bonus) | Edit (security) | Edit (kebersihan) | - |
| Audit trail | Lihat | Lihat | Lihat | Lihat | - | - | - |

Aturan tambahan: Pengurus RT hanya melihat warga RT-nya; RW melihat semua RT; warga hanya melihat rumahnya.

---

## 4. Aturan antarmuka

1. Background semua halaman **#EDF4EE**; kartu dan konten putih.
2. Gaya elegan, minimalis, modern; navy sebagai warna utama, emerald sebagai aksen.
3. Logo (ikon rumah dan bunga) kecil di kiri atas; nama ditulis sebagai teks.
4. Status berwarna konsisten: **hijau** selesai, aman, lunas, hadir; **kuning** proses, perhatian, terlambat; **merah** belum selesai, menunggak, kurang, kritis.
5. Mobile-first. Desktop memakai sidebar; mobile memakai navigasi bawah dan drawer.
6. Footer di setiap halaman: `Prototype Demo dibuat oleh : A0/3 - dibuat karena iseng`.
7. Teks "Super Admin", "Admin", atau "Superuser" tidak boleh muncul di menu utama.
8. Semua angka penting di dashboard bisa diklik dan membuka daftar rinci dengan filter yang sudah terpasang, lengkap dengan tombol Kembali dan jejak halaman.
9. Pencarian cepat (Ctrl+K) untuk menu, warga, blok, dan plat nomor.
10. Aksesibilitas: huruf bisa diperbesar dan bahasa sederhana untuk warga lanjut usia.

---

## 5. Login, role, dan panel tersembunyi

- Halaman awal hanya menampilkan pilihan role: Pengurus RW, Pengurus RT, Pengurus Keamanan, Pengurus Kebersihan, Bendahara, Warga. Tanpa kata sandi (khusus demo).
- Setiap penguji masuk sebagai pengguna anonim di Supabase lalu memilih role; role tercatat di tabel profil.
- **Panel Pengelola Data Demo:** ikon gear kecil di footer, klik, muncul modal login (User ID `brobar`, password `110375`). Panel hanya berisi: ringkasan data testing, hapus data per modul, hapus semua data testing, reset ke data awal, dan jejak audit. Setiap hapus wajib konfirmasi. Karena data bersama, aksi ini berlaku untuk semua penguji.
- **Produksi:** pemeriksaan kata sandi pindah ke server, login per akun, dan akses dibatasi per role dan RT lewat aturan database.

---

## 6. Menu per role

| Role | Menu |
|---|---|
| Pengurus RW | Dashboard, Administrasi Warga, IPL dan Keuangan, IPL WhatsApp, KPI dan Rotasi Petugas, Keamanan (Tamu), Kebersihan (Sampah, Kerusakan), Parkir, Izin, Pengaduan, Pengumuman, AI Analisis, Export, Kontak |
| Pengurus RT | Dashboard RT, IPL WhatsApp, Lapor Data Kependudukan (persetujuan), Pengumuman, Pengaduan, Izin, Kontak |
| Pengurus Keamanan | Dashboard, Tamu dan Akses Masuk, Absensi Security, Asset dan Serah Terima Shift Security, KPI dan Rotasi Petugas, Parkir, Pengaduan, Izin, Pengumuman, Kontak |
| Pengurus Kebersihan | Dashboard, Absensi Kebersihan, Asset dan Serah Terima Shift Kebersihan, KPI dan Rotasi Petugas, Laporan Sampah, Kerusakan Fasilitas, Pengaduan, Kontak |
| Bendahara | Dashboard, IPL dan Keuangan, IPL WhatsApp, KPI (lihat), Export, Kontak |
| Warga | Dashboard Warga, IPL Saya, Lapor Data Kependudukan, Buat Pengaduan, Ajukan Izin, Lapor Sampah, Lapor Kerusakan, Pengumuman, Aturan Komplek, Kontak |

---

## 7. Dashboard per role

Semua dashboard memuat: ringkasan "Perlu perhatian", empat angka utama, kartu daftar berkelompok, dan grafik. Semua baris bisa diklik.

- **RW:** tamu di dalam, pengaduan dan kerusakan dan sampah belum selesai, izin menunggu, kehadiran security dan kebersihan, asset atau serah terima bermasalah, IPL per status dan per RT, saldo kas dengan indikator, komposisi warga (tinggal, ngontrak, ditinggal), kinerja petugas, Danru jatuh tempo rotasi.
- **Keamanan:** tamu di dalam, security hadir dan terlambat, asset belum lengkap, serah terima menunggu approval, pelanggaran parkir, pengaduan keamanan, izin menunggu review Keamanan.
- **Kebersihan:** hadir di RW 29 dan RW 31, asset, serah terima shift, sampah belum selesai, kerusakan terkait kebersihan.
- **Bendahara:** saldo kas, tunggakan IPL, pembayaran masuk, pengeluaran, bukti transfer menunggu verifikasi, rekap per RT, grafik pemasukan dan pengeluaran.
- **RT:** rumah di RT, sudah bayar, terlambat, menunggak, total terkumpul, daftar yang perlu diingatkan, aktivitas grup WhatsApp.
- **Warga:** status IPL rumah saya, pengaduan saya, izin saya, pengumuman terbaru, tombol cepat aksi.

Filter periode, tren 2 tahun, dan perbandingan dengan tahun lalu direncanakan untuk dashboard RW dan Bendahara (tahap 3).

---

## 8. Modul dan field

### A. Administrasi Warga dan Rumah
Status: Warga Tinggal, Warga Ngontrak, Rumah Ditinggal.
- **Tinggal:** nama pemilik, No KK, No KTP, blok dan nomor rumah, RW, jumlah penghuni, kendaraan dan plat, nomor HP.
- **Ngontrak:** nama pengontrak, KTP pengontrak, jumlah orang, kendaraan dan plat, nama pemilik, blok dan nomor, tanggal mulai dan selesai kontrak, HP pengontrak dan pemilik. Status kontrak otomatis: Aktif, Akan Berakhir (60 hari), Habis.
- **Ditinggal:** nama pemilik, KK dan KTP, blok dan nomor, kota dan provinsi alamat baru, nama dan HP penunggu, tanggal mulai ditinggal.
- Fitur: tambah, edit, filter status, filter RW, cari nama, nomor rumah, atau plat, klik baris untuk detail.
- Privasi: nomor KK dan KTP disamarkan di daftar dan hanya terbuka untuk role yang berhak.

### B. Lapor Data Kependudukan (baru)
Jenis laporan: pindah masuk, pindah keluar, kelahiran, kematian, tambah atau kurang anggota, ganti kendaraan, kontrak baru atau berakhir. Alur: warga lapor, RT verifikasi, RW setujui, data warga berubah otomatis, tercatat di audit trail.

### C. Tamu dan Akses Masuk
Field: nama, plat, jenis kendaraan (Mobil Pribadi, Motor Pribadi, Taxi Online, Ojek Online), rumah tujuan, tujuan, catatan, foto KTP dan kendaraan (placeholder), jam masuk otomatis. Aksi: simpan, keluar (jam keluar otomatis), daftar sedang di dalam, riwayat, statistik minggu ini dengan grafik.
Tahap lanjut: tamu terdaftar lebih dulu oleh warga dengan kode QR, daftar hitam kendaraan, peringatan tamu lebih dari 12 jam di dalam.

### D. IPL dan Keuangan
Tab: Ringkasan IPL, Tunggakan, Pengeluaran, Neraca, Pembayaran Online, Bukti Transfer.
- 600 rumah, filter RW. Status IPL: **Lunas**, **Terlambat** (telat 1 bulan), **Menunggak** (2 bulan atau lebih).
- Batas minimum kas **Rp 15.000.000**; indikator hijau (aman), kuning (mendekati batas), merah (di bawah batas).
- Pembayaran online: simulasi scan QR dengan pilihan jumlah bulan. Bukti transfer: unggah placeholder, diverifikasi Bendahara.
- Nominal IPL per bulan: **[TERBUKA]** Rp 450.000 (dari mockup Ultra-Align) atau Rp 100.000 (nilai prototype saat ini). Nilainya disimpan di satu pengaturan sehingga mudah diganti.
- Tahap lanjut: tagihan otomatis tiap bulan, denda keterlambatan, kuitansi, rekonsiliasi dengan mutasi bank, persetujuan dua orang untuk pengeluaran besar.

### E. IPL WhatsApp (simulasi, lalu nyata)
- Grup per RW dan per RT, misalnya "IPL PKJ RT 01 RW 29".
- Pengumuman di grup: narasi, tata cara bayar scan QR, nilai pembayaran, pilihan jumlah bulan. Pengingat tanggal 1 dengan QR dan pilihan periode (1, 2, 3 bulan atau 1 tahun).
- Setelah pembayaran: **grup RT** menerima ucapan terima kasih dan nama saja (tanpa nominal dan periode); **pesan pribadi** ke pembayar memuat detail lengkap (nominal, periode, metode, waktu, nomor referensi).
- Rekap otomatis total pembayaran bulan berjalan di grup, terhubung ke dashboard RW, RT, dan Bendahara.
- Pengiriman nyata lewat provider (Fonnte atau Wablas, tidak resmi sehingga ada risiko nomor diblokir; gunakan nomor cadangan) atau WhatsApp Business Platform (resmi, kirim ke grup terbatas). **[TERBUKA]** pilihan provider.

### F. Pengumuman
Field wajib: judul, kategori, tanggal, jam mulai dan selesai, tempat, deskripsi, penanggung jawab, dan kolom "Sudah menghubungi Koordinator Keamanan" (Bang Jago, 0812-3456-7890). Tombol terbitkan nonaktif bila ada kolom kosong.

### G. Absensi Security dan Kebersihan
- Security 3 group, kebersihan 3 group (24 orang per unit, 8 per group). **[TERBUKA]** prototype saat ini kebersihan 2 group.
- Pola shift 08.00 sampai 20.00 (12 jam): satu group pagi atau siang, satu group malam, satu group libur, dirotasi otomatis.
- Check-in dan check-out, deteksi terlambat otomatis (toleransi 10 menit), kebersihan wajib pilih area RW 29 atau RW 31, riwayat per petugas.
- Aktivitas wajib per shift: absen masuk, apel, cek peralatan, serah terima, pelaksanaan tugas, absen keluar, serah terima ke group berikutnya.
- Absensi fingerprint: prototype menyimulasikan; versi nyata mengimpor data dari mesin (CSV atau API mesin).

### H. Asset dan Serah Terima Shift
- **Security:** Handy Talky, Senter, Pentungan, Rompi, Jas Hujan, Peluit, Borgol (opsional).
- **Kebersihan:** Troli, Sapu, Pel, Karung Sampah, Sarung Tangan, Rompi, Jas Hujan.
- **Mulai shift:** pilih group dan petugas, centang asset, isi kondisi (Baik, Rusak Ringan, Rusak Berat). Shift tidak bisa dimulai bila asset wajib belum lengkap.
- **Akhir shift:** group lama mengembalikan asset, sistem membandingkan dengan yang dibawa (kurang atau memburuk berarti status merah), lalu mengisi **Catatan Serah Terima Shift**.
  - Security: kejadian penting, area rawan, tamu belum keluar, catatan parkir, instruksi untuk group berikutnya.
  - Kebersihan: area sudah dibersihkan, area belum selesai, titik sampah bermasalah, kerusakan ditemukan, instruksi untuk berikutnya.
- **Approval group baru** hanya bisa bila catatan terisi dan asset lengkap atau ada keterangan kekurangan yang jelas. Penerima harus dari group yang berbeda. Group baru bisa menolak dengan alasan.
- Setelah approve, shift selesai bersih (atau "dengan catatan" bila ada masalah asset). Riwayat lengkap tersimpan.

### I. Pengaduan dan kerahasiaannya
Field: judul, kategori, lokasi, deskripsi, foto (placeholder), nama pelapor, pihak yang dilaporkan (opsional), dan **tingkat kerahasiaan**. Status: Baru, Diproses, Selesai (narasi awal menulis Belum Ditangani, Sedang Dikerjakan, Selesai). Pengurus bisa mengubah status dan menambah catatan.

**Tiga tingkat kerahasiaan** (dipilih pelapor; RT dan RW bisa mengubahnya):

| Tingkat | Siapa yang bisa melihat | Contoh |
|---|---|---|
| Umum | Semua warga; nama pelapor dan rumah disamarkan | Lampu jalan mati, selokan tersumbat, jalan berlubang |
| Pribadi | Pelapor, Pengurus RW, Pengurus RT, dan seksi terkait (Keamanan untuk kategori Keamanan dan Kebisingan; Kebersihan untuk kategori Kebersihan dan Fasilitas) | Orang asing berkeliaran, CCTV mati |
| Rahasia | Pelapor, Pengurus RT, dan Pengurus RW saja | Keluhan yang menyangkut tetangga tertentu, kebisingan, masalah sosial |

Aturan tambahan:
- Seksi (Keamanan, Kebersihan) hanya melihat blok pelapor, bukan nama dan nomor rumah.
- "Pihak yang dilaporkan" hanya terlihat oleh RT dan RW, tidak pernah oleh warga lain atau pihak yang dilaporkan.
- Data lama tanpa tingkat kerahasiaan dianggap Pribadi.
- Bendahara tidak melihat pengaduan selain yang Umum; Export hanya memuat pengaduan yang boleh dilihat role pengunduh.
- Di database, aturan ini dijaga lewat aturan akses baris (`can_read_record` di `supabase/schema.sql`), sehingga pengaduan yang tidak berhak dilihat tidak ikut terkirim ke perangkat warga. Pembatasan per RT masih di tingkat tampilan; di database baru berlaku setelah login per akun.

Alur SLA dan eskalasi di bagian 9.

### J. Parkir
Daftar kendaraan warga (dari data rumah), input pelanggaran, riwayat, dan tindak lanjut bertingkat (peringatan, ditindak, selesai) yang terhubung ke sanksi bertingkat.

### K. Laporan Sampah
Jadwal angkut per area dan hari, form lapor tumpukan (lokasi, RW, ukuran, foto), status Dilaporkan, Dijadwalkan, Diangkut.

### L. Kerusakan Fasilitas
Jenis: Lampu jalan, Pagar, Portal, CCTV, Taman, Saluran air, Jalan, Pos security, Lainnya. Field: lokasi, tingkat (Ringan, Sedang, Berat), deskripsi, foto, status perbaikan.

### M. Izin Renovasi dan Keramaian
Jenis: Renovasi, Pembangunan, Pesta ulang tahun, Kumpulan keagamaan, Arisan keluarga, Lainnya.
Alur: Diajukan, Disetujui RT, Disetujui RW, Disetujui Keamanan, Selesai atau Ditolak. Setiap level menyetujui atau menolak dengan catatan. Untuk izin keramaian, tetangga se-RT menyatakan setuju atau tidak (kuorum **[TERBUKA]**) sebelum persetujuan akhir. Izin yang disetujui otomatis memberi tahu Keamanan.

### N. Kontak Penting
Kartu kontak: Pengurus RW, Keamanan, Kebersihan, Bendahara, Koordinator Keamanan Bang Jago, Pos Security, Pemadam (113), Ambulans (118), PLN (123), PDAM.

### O. AI Analisis Data Warga (simulasi)
Hanya untuk Pengurus RW dan panel pengelola. Tombol "Analisis Data Warga Sekarang" menampilkan kartu insight dari data dummy (komposisi tinggal, ngontrak, ditinggal, rata-rata penghuni, kontrak hampir habis, blok dengan penyewa terbanyak, rekomendasi). Tombol "Generate Ulang Analisis". Bukan panggilan AI sungguhan.

### P. Export
Excel dan PDF berisi ringkasan seluruh modul. Excel rinci untuk warga, IPL, tamu, pengaduan, KPI petugas, dan ketidakhadiran.

### Q. Tahap lanjut (belum dibangun)
Booking fasilitas (lapangan, masjid) dengan kalender dan deteksi konflik; Transparansi Penggunaan IPL untuk warga; Laporan Kehilangan dan Kerusakan Aset Bersama yang otomatis masuk ke keuangan; Takmir, Pengajian, dan Arisan.

---

## 9. SLA dan eskalasi bertingkat

**Prinsip:** jam SLA dihitung oleh server; boleh dijeda hanya dengan alasan tercatat (misalnya menunggu warga); setiap pelanggaran SLA tercatat dan masuk KPI pihak yang bertanggung jawab.

**Tangga eskalasi:** L0 petugas atau pengurus terkait, L1 Danru, L2 Koordinator (Keamanan atau Kebersihan), L3 Pengurus RT, L4 Pengurus RW, L5 Pengelola Cluster.

| Prioritas | Contoh | Respon pertama | Selesai | Eskalasi |
|---|---|---|---|---|
| P1 Darurat | Kebakaran, pencurian berlangsung, medis, panic button | 5 menit | 15 menit tindakan awal | 5 menit ke L1 dan L2, 10 menit ke L3, 20 menit ke L4 |
| P2 Tinggi | Lampu mati di area rawan, pohon menutup jalan, banjir | 2 jam | 24 jam | 2 jam ke L1, 12 jam ke L3, 24 jam ke L4 |
| P3 Normal | Pengaduan umum, kerusakan sedang, sampah | 24 jam kerja | 3 hari kerja | 24 jam ke L2, 3 hari ke L3, 5 hari ke L4 |
| P4 Rendah | Saran, kerusakan ringan | 3 hari kerja | 14 hari | 7 hari ke L3, 14 hari ke L4 |

Aturan jalur pengaduan menurut dokumen Ultra-Align: RT (1x24 jam), RW (1x24 jam), Pengelola. Pengaduan tingkat tinggi langsung memberi notifikasi ke Keamanan dan RW.

| Proses lain | SLA |
|---|---|
| Persetujuan izin per level | 2 hari kerja; pengingat di 1 hari; lewat batas otomatis naik ke level berikutnya |
| Verifikasi bukti transfer | 1x24 jam |
| Approval serah terima shift | 30 menit setelah shift berikutnya mulai; lewat batas naik ke Danru lalu Koordinator |
| Asset kurang | Diselesaikan 24 jam, kalau tidak naik ke Koordinator dan RW |
| Penagihan IPL | H-3 pengingat, H+1 terlambat, H+10 denda **[TERBUKA]**, H+30 kunjungan RT, H+60 surat peringatan RW |

**[TERBUKA]** semua angka SLA di atas adalah usulan; sesuaikan dengan kemampuan lapangan.

---

## 10. KPI objektif dan rotasi Danru

**Prinsip:** minimal 90 persen nilai berasal dari data sistem yang bercap waktu server; bagian penilaian atasan dibatasi 10 persen, memakai rubrik, wajib beralasan, dan bisa disanggah. KPI dihitung ulang otomatis dan periodenya dikunci setelah tanggal 5 bulan berikutnya; perubahan setelah dikunci perlu persetujuan dan tercatat.

### Bobot petugas (dari dokumen Ultra-Align)

| Komponen | Bobot | Sumber data objektif |
|---|---|---|
| Kehadiran dan ketepatan waktu | 25 | Absensi (fingerprint atau check-in) dibandingkan jadwal shift |
| Kelengkapan apel dan peralatan | 15 | Catatan apel dan checklist asset saat mulai shift |
| Pelaksanaan tugas | 30 | Security: ronde patroli dan titik cek; kebersihan: checklist area dengan foto sebelum dan sesudah; serta SLA tiket yang ditugaskan |
| Serah terima | 10 | Ketepatan, kelengkapan catatan, selisih asset, approval dua pihak |
| Komplain dan insiden | 10 | Pengaduan warga terkait area atau shift petugas |
| Penilaian Danru atau pengurus | 10 | Rubrik terstruktur dengan alasan tertulis |

Prototype saat ini memakai rumus sementara (35 ketepatan, 35 kehadiran, 30 nilai Danru); akan disamakan dengan bobot di atas.

### Bobot peran lain (usulan)
- **Danru:** rata-rata KPI regu 30, SLA eskalasi yang ditangani 25, kualitas serah terima regu 15, kehadiran sendiri 15, konsistensi penilaian 10, pembinaan anggota 5.
- **Bendahara:** verifikasi bukti dalam 1x24 jam 25, rekonsiliasi bulanan tepat waktu dan selisih nol 30, laporan bulanan terbit sebelum tanggal 5 20, kuitansi terbit 10, pengeluaran dengan bukti lengkap 15.
- **Pengurus RT:** approval izin dalam SLA 25, rasio IPL tertagih di RT 30, data warga mutakhir 15, tindak lanjut tiket eskalasi 20, penyebaran pengumuman 10.

### Keputusan bonus dan kenaikan gaji
- **Bonus bulanan:** KPI bulan 85 ke atas, terlambat maksimal 1 kali, tanpa alpa, tanpa sakit tanpa surat. Parameter perhitungan terlihat oleh warga; nominal individual privat.
- **Kenaikan gaji (evaluasi 6 bulan):** rata-rata KPI 85 ke atas, tanpa alpa, sakit tanpa surat maksimal 1, terlambat maksimal 6 kali, dan tidak ada bulan di bawah 75. Rantai persetujuan: Danru, Koordinator, RW; Bendahara mengeksekusi; setiap keputusan menyimpan potret KPI yang dipakai.
- **Pembinaan:** KPI di bawah 70, alpa 2 kali atau lebih, atau sakit tanpa surat 3 kali atau lebih.
- Jenis ketidakhadiran dicatat terpisah: sakit dengan surat, sakit tanpa surat, izin, alpa.
- Bulan dengan data tidak lengkap (misalnya perangkat mati) ditandai "data tidak lengkap", bukan dihukum.

### Pemeriksaan silang

| Klaim | Dibandingkan dengan | Tanda bahaya otomatis |
|---|---|---|
| Hadir di pos | Jadwal, scan patroli pertama, log gerbang | Check-in tanpa aktivitas 2 jam |
| Tamu masuk | Undangan warga, konfirmasi warga, catat keluar | Tamu lebih dari 12 jam di dalam, plat berulang tanpa konfirmasi |
| Tiket selesai | Foto sesudah, konfirmasi warga | Selesai tanpa foto, sering dibuka ulang |
| Pembayaran | Mutasi bank, notifikasi WA terkirim, kuitansi | Pembayaran tanpa mutasi lebih dari 2 hari |
| Pengeluaran | Foto nota, persetujuan dua orang, buku kas | Di atas batas tanpa approval, nominal dipecah mendekati batas |
| Serah terima | Hitung asset, approval group baru, audit acak | Approval kurang dari 60 detik, perangkat sama dengan pengirim |
| Nilai Danru | Skor objektif, sebaran nilai Danru lain | Nilai seragam, selisih lebih dari 15 poin tanpa alasan |

### Rotasi Danru setiap 6 bulan
- Masa jabatan Danru maksimal 6 bulan; mulai bulan ke-5 muncul peringatan kuning, bulan ke-6 merah.
- Prioritas pengganti: petugas yang **belum pernah** menjadi Danru, lalu rata-rata KPI 6 bulan tertinggi.
- Rotasi tercatat (siapa, kapan, berapa lama) dan masuk audit trail. Promosi dari Personil ke Danru Regu ke Danru Group berbasis peringkat KPI dan disetujui RW.
- **[TERBUKA]** "belum kena rotasi" ditafsirkan sebagai belum pernah menjabat Danru; ubah bila maksudnya rotasi antar-regu.

---

## 11. Notifikasi dan Tugas Saya

- **Pusat notifikasi** dalam aplikasi untuk setiap perubahan status penting (pengaduan diproses, izin disetujui, serah terima menunggu, eskalasi naik).
- **Tugas Saya** per role: izin menunggu persetujuan, bukti transfer menunggu verifikasi, serah terima menunggu approval, pengaduan baru, Danru jatuh tempo rotasi, persetujuan data kependudukan.
- WhatsApp hanya untuk notifikasi yang memang perlu (IPL, eskalasi darurat), bukan semua kejadian.

---

## 12. Audit trail, keamanan, dan privasi

- Audit trail wajib untuk: data warga dan aset, keuangan, pengaduan, izin, surat, absensi manual, promosi dan mutasi, perubahan role. Isinya siapa, peran, waktu server, nilai sebelum dan sesudah.
- Data pribadi (KK, KTP, nomor HP) disamarkan secara default, dan hanya dibuka bila role berhak serta ada alasan. Warga memberi persetujuan penggunaan data; rujukan hukum: UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.
- Tidak ada penghapusan permanen untuk data operasional di produksi (hapus lunak).
- Pengaduan dilindungi tiga tingkat kerahasiaan (bagian 8.I). Koleksi data lain di prototype masih terbuka untuk semua pengguna yang punya profil; pembatasan per role dan RT menyusul bersama login per akun.
- Prototype: aturan akses database masih longgar dan kata sandi panel pengelola dicek di sisi aplikasi; hanya untuk demo, bukan data warga sungguhan.

---

## 13. Arsitektur teknis

- Next.js (App Router), Tailwind CSS, recharts, xlsx, jspdf, Supabase (Postgres, Auth anonim, Realtime).
- Tahap 1 (selesai): tabel generik `app_records`, `profiles`, `audit_log`, trigger audit, sinkronisasi dua arah dengan realtime; berkas `supabase/schema.sql`.
- Tahap berikutnya: tabel terstruktur untuk tiket, tagihan, pembayaran, absensi, KPI, dan eskalasi; login per akun; akses dibatasi per role dan RT; tugas terjadwal untuk SLA dan eskalasi; antrean pesan WhatsApp.
- Variabel lingkungan: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Jangan pernah menaruh service role key di repositori atau kode klien.
- Deploy: Vercel; isi variabel lingkungan sebelum deploy.

---

## 14. Data dummy dan skenario uji

Data awal: 600 rumah (RW 29 dan RW 31, 7 RT), tamu, pembayaran, pengumuman, absensi, shift, pengaduan, kerusakan, sampah, izin, petugas, ketidakhadiran, dan pesan WhatsApp.

**Skenario uji per role (agar penguji tahu harus mencoba apa):**
1. **Warga:** cek status IPL, bayar lewat QR, buat pengaduan sampah, ajukan izin ulang tahun.
2. **Pengurus Kebersihan:** ubah status laporan sampah, mulai dan akhiri shift lengkap dengan catatan.
3. **Pengurus Keamanan:** catat tamu, mulai shift dengan asset kurang (harus ditolak), akhiri shift dengan HT hilang, minta approval group lain.
4. **Pengurus RT:** setujui izin, ingatkan warga yang menunggak lewat WhatsApp.
5. **Bendahara:** verifikasi bukti transfer, input pengeluaran sampai kas di bawah batas (indikator merah).
6. **Pengurus RW:** lihat dashboard berubah setelah aksi di atas, jalankan AI Analisis, export Excel dan PDF.

Setiap halaman punya tombol **Beri masukan** yang menyimpan masukan penguji ke database. **[BELUM DIBANGUN]**

---

## 15. Status pembangunan

| Area | Status |
|---|---|
| Login role, panel tersembunyi, footer, tampilan, navigasi, pencarian cepat | Selesai |
| Dashboard per role dengan drill-down dan grafik | Selesai (filter periode dan tren 2 tahun belum) |
| Administrasi warga, tamu, IPL dan keuangan 6 tab, pengumuman | Selesai (sebagian field belum sesuai, lihat bagian 16) |
| Absensi, asset dan serah terima dua pihak, parkir, sampah, kerusakan, izin, kontak | Selesai |
| KPI dan Rotasi Danru | Sebagian (bobot dan SLA belum disamakan) |
| IPL WhatsApp (simulasi, per RT) | Sebagian (aturan privasi grup belum diterapkan) |
| AI Analisis, Export | Selesai |
| Database bersama, sinkronisasi realtime, audit trail | Selesai (perlu diuji di Supabase) |
| Lapor Data Kependudukan, SLA dan eskalasi, Tugas Saya dan notifikasi | Belum |
| Login per akun, akses per role dan RT | Belum |
| Tamu undangan QR, panic button, patroli, buku kejadian | Belum |
| Booking fasilitas, transparansi IPL, aset bersama, role tambahan | Belum |
| WhatsApp nyata (Fonnte atau Wablas), tagihan otomatis, kuitansi | Belum |

---

## 16. Selisih antara narasi dan aplikasi saat ini

| Bagian | Narasi | Aplikasi sekarang |
|---|---|---|
| Menu RW | Memuat Keamanan, Kebersihan, Parkir | Memuat Tamu, Kerusakan, Sampah; Parkir belum ada |
| Pengaduan | Status Belum Ditangani, Sedang Dikerjakan, Selesai | Status Baru, Diproses, Selesai (kolom lokasi dan tingkat kerahasiaan sudah ada) |
| Pengumuman | Tanggal, jam mulai dan selesai, tempat, penanggung jawab | Hanya judul, kategori, isi, berlaku sampai, koordinator |
| Kerusakan | Jenis dari daftar tetap | Nama fasilitas teks bebas |
| Izin | Jenis termasuk Pembangunan | Tidak ada jenis Pembangunan |
| AI Analisis | RW dan panel pengelola | Hanya RW |
| Kebersihan | 3 group (dokumen Ultra-Align) | 2 group |
| WhatsApp grup | Nama saja, tanpa nominal dan periode | Memuat blok, nomor, dan periode |
| KPI | Bobot 25/15/30/10/10/10 | Bobot sementara 35/35/30 |

---

## 17. Keputusan terbuka

1. Nominal IPL per bulan: Rp 450.000 atau Rp 100.000?
2. Pembagian RT per blok sudah sesuai kenyataan?
3. Angka SLA dan jenjang eskalasi (bagian 9) disetujui atau diubah?
4. Bobot KPI Danru, Bendahara, dan Pengurus RT disetujui?
5. Kebersihan menjadi 3 group (24 orang)?
6. Arti "belum kena rotasi": belum pernah jadi Danru atau rotasi antar-regu?
7. Kebijakan denda IPL (nominal, mulai hari ke berapa) dan jenjang sanksi pelanggaran.
8. Kuorum persetujuan tetangga untuk izin keramaian.
9. Penyedia WhatsApp nyata: Fonnte, Wablas, atau resmi.
10. Cara menarik data fingerprint (CSV dari mesin atau API).
11. Hari kerja efektif per bulan (prototype memakai 26 hari).

---

## 18. Cara menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
```

Siapkan database: jalankan `supabase/schema.sql` di SQL Editor Supabase, aktifkan Anonymous Sign-Ins, lalu isi dua variabel lingkungan di atas. Panel pengelola dibuka lewat ikon gear di footer.
