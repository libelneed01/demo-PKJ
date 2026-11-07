export const MIN_KAS = 15000000;
export const IPL_NOMINAL = 100000;
export const KOORDINATOR = { nama: "Bang Jago", hp: "0812-3456-7890" };
export const PANEL = { id: "brobar", pass: "110375" };
export const FOOTER = "Prototype Demo dibuat oleh : A0/3 - dibuat karena iseng";
export const ROLES = {
  rw: "Pengurus RW", rt: "Pengurus RT", keamanan: "Pengurus Keamanan", kebersihan: "Pengurus Kebersihan",
  bendahara: "Bendahara", warga: "Warga", pengelola: "Pengelola Data Demo",
};
export const PICK_ROLES = ["rw", "rt", "keamanan", "kebersihan", "bendahara", "warga"];

const m = (id, label, icon, params) => ({ id, label, icon, params });
export const NAV = {
  rw: [m("dashboard", "Dashboard", "home"), m("warga", "Warga & Rumah", "users"), m("tamu", "Tamu", "car"), m("keuangan", "Keuangan", "wallet"), m("waIpl", "IPL WhatsApp", "msg"), m("kinerja", "KPI & Rotasi Petugas", "users"), m("pengumuman", "Pengumuman", "megaphone"), m("pengaduan", "Pengaduan", "msg"), m("izin", "Izin", "building"), m("kerusakan", "Kerusakan", "tool"), m("sampah", "Sampah", "trash"), m("ai", "AI Analisis", "sparkle"), m("export", "Export", "download"), m("kontak", "Kontak", "phone")],
  rt: [m("dashboard", "Dashboard RT", "home"), m("waIpl", "IPL WhatsApp", "msg"), m("pengumuman", "Pengumuman", "megaphone"), m("pengaduan", "Pengaduan", "msg"), m("izin", "Izin", "building"), m("kontak", "Kontak", "phone")],
  keamanan: [m("dashboard", "Dashboard", "home"), m("tamu", "Tamu", "car"), m("absenSecurity", "Absensi Security", "shield"), m("assetSecurity", "Asset & Serah Terima Security", "box"), m("kinerja", "KPI & Rotasi Petugas", "users"), m("parkir", "Parkir", "parking"), m("pengaduan", "Pengaduan", "msg"), m("izin", "Izin", "building"), m("pengumuman", "Pengumuman", "megaphone"), m("kontak", "Kontak", "phone")],
  kebersihan: [m("dashboard", "Dashboard", "home"), m("absenKebersihan", "Absensi Kebersihan", "broom"), m("assetKebersihan", "Asset & Serah Terima Kebersihan", "box"), m("kinerja", "KPI & Rotasi Petugas", "users"), m("sampah", "Sampah", "trash"), m("kerusakan", "Kerusakan", "tool"), m("pengaduan", "Pengaduan", "msg"), m("kontak", "Kontak", "phone")],
  bendahara: [m("dashboard", "Dashboard", "home"), m("keuangan", "Keuangan", "wallet"), m("waIpl", "IPL WhatsApp", "msg"), m("kinerja", "KPI & Rotasi Petugas", "users"),  m("export", "Export", "download"), m("kontak", "Kontak", "phone")],
  warga: [m("dashboard", "Dashboard Warga", "home"), m("iplSaya", "IPL Saya", "wallet"), m("pengaduan", "Buat Pengaduan", "msg", { add: true }), m("izin", "Ajukan Izin", "building", { add: true }), m("sampah", "Lapor Sampah", "trash", { tab: "laporan", add: true }), m("kerusakan", "Lapor Kerusakan", "tool", { add: true }), m("pengumuman", "Pengumuman", "megaphone"), m("kontak", "Kontak", "phone")],
  pengelola: [],
};
// halaman yang boleh dibuka lewat drill-down dashboard walau tidak ada di menu
export const EXTRA = { rw: ["absenSecurity", "absenKebersihan", "assetSecurity", "assetKebersihan"], pengelola: ["panel"] };

// ---- Struktur RT (asumsi prototype: 4 RT di RW 29, 3 RT di RW 31)
export const RT_MAP = { A: ["29", "01"], B: ["29", "02"], C: ["29", "03"], D: ["29", "04"], E: ["29", "04"], F: ["31", "01"], G: ["31", "01"], H: ["31", "02"], I: ["31", "02"], J: ["31", "03"] };
export const rtKeyOf = (h) => `${h.rw}-${(RT_MAP[h.blok] || ["", "01"])[1]}`;
export const RT_LIST = Object.values(RT_MAP).reduce((a, [rw, rt]) => (a.some((x) => x.key === `${rw}-${rt}`) ? a : [...a, { key: `${rw}-${rt}`, rw, rt }]), []);
export const rtLabel = (k) => { const [rw, rt] = k.split("-"); return `RT ${rt} / RW ${rw}`; };
export const groupName = (k) => { const [rw, rt] = k.split("-"); return `IPL PKJ RT ${rt} RW ${rw}`; };

// Skenario uji untuk penguji (tampil di "Panduan uji")
export const SCENARIOS = {
  warga: [
    "Buka Dashboard Warga dan lihat status IPL rumah Anda.",
    "Buka IPL Saya, bayar lewat scan QR (simulasi) untuk 1 bulan. Status berubah menjadi Lunas.",
    "Buat Pengaduan dengan tingkat RAHASIA tentang tetangga (isi 'Pihak yang dilaporkan'). Minta teman masuk sebagai Pengurus Keamanan: pengaduan itu tidak boleh terlihat. Sebagai Pengurus RW: terlihat.",
    "Buat Pengaduan UMUM tentang lampu jalan. Buka tab 'Pengaduan umum komplek' dan cek nama Anda disamarkan.",
    "Ajukan Izin pesta ulang tahun, lalu pantau tahapnya setelah teman menyetujui sebagai Pengurus RT dan RW.",
    "Lapor tumpukan sampah dan kerusakan fasilitas, lalu minta Pengurus Kebersihan mengubah statusnya.",
  ],
  rt: [
    "Di Dashboard RT, pilih RT Anda dan lihat angka IPL.",
    "Buka Izin, pilih izin berstatus Diajukan, lalu 'Setujui sebagai RT' dengan catatan.",
    "Buka IPL WhatsApp, lihat grup RT, kirim rekap, lalu kirim pengingat ke warga yang menunggak.",
    "Buka Pengaduan: baca pengaduan Rahasia di RT Anda dan ubah statusnya.",
  ],
  keamanan: [
    "Tamu: catat tamu masuk, lalu tekan Keluar.",
    "Absensi Security: check-in dengan jam yang diubah (misalnya 30 menit setelah shift) dan lihat status terlambat.",
    "Asset dan Serah Terima: coba mulai shift tanpa Handy Talky (harus ditolak), lengkapi, lalu mulai shift.",
    "Akhiri shift dengan Handy Talky tidak dikembalikan, isi catatan, lalu minta teman approve dari group lain.",
    "Izin: setujui tahap Keamanan pada izin yang sudah disetujui RW.",
  ],
  kebersihan: [
    "Absensi Kebersihan: check-in dan pilih area RW 29 atau RW 31 (wajib).",
    "Asset dan Serah Terima: mulai shift, akhiri dengan catatan, minta approve dari group lain.",
    "Laporan Sampah: ubah status laporan warga menjadi Dijadwalkan lalu Diangkut.",
    "Kerusakan Fasilitas: ubah status laporan menjadi Dikerjakan.",
  ],
  bendahara: [
    "IPL dan Keuangan, tab Tunggakan: buka satu rumah dan tandai lunas.",
    "Tab Bukti Transfer: verifikasi bukti yang dikirim warga.",
    "Tab Pengeluaran: input pengeluaran besar sampai saldo di bawah Rp 15.000.000 dan lihat indikator berubah merah.",
    "Export Excel dan PDF.",
  ],
  rw: [
    "Dashboard: lihat angka berubah setelah penguji lain beraksi (data bersama).",
    "Pengaduan: baca pengaduan Rahasia dan ubah tingkat kerahasiaannya.",
    "KPI dan Rotasi Petugas: lihat keterlambatan dan lakukan rotasi Danru.",
    "AI Analisis: jalankan analisis, lalu Generate Ulang.",
    "Export Excel dan PDF.",
  ],
};
