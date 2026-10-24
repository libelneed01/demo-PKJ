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
  rw: [m("dashboard", "Dashboard", "home"), m("warga", "Warga & Rumah", "users"), m("tamu", "Tamu", "car"), m("keuangan", "Keuangan", "wallet"), m("waIpl", "IPL WhatsApp", "msg"), m("pengumuman", "Pengumuman", "megaphone"), m("pengaduan", "Pengaduan", "msg"), m("izin", "Izin", "building"), m("kerusakan", "Kerusakan", "tool"), m("sampah", "Sampah", "trash"), m("ai", "AI Analisis", "sparkle"), m("export", "Export", "download"), m("kontak", "Kontak", "phone")],
  rt: [m("dashboard", "Dashboard RT", "home"), m("waIpl", "IPL WhatsApp", "msg"), m("pengumuman", "Pengumuman", "megaphone"), m("pengaduan", "Pengaduan", "msg"), m("izin", "Izin", "building"), m("kontak", "Kontak", "phone")],
  keamanan: [m("dashboard", "Dashboard", "home"), m("tamu", "Tamu", "car"), m("absenSecurity", "Absensi Security", "shield"), m("assetSecurity", "Asset & Serah Terima Security", "box"), m("parkir", "Parkir", "parking"), m("pengaduan", "Pengaduan", "msg"), m("izin", "Izin", "building"), m("pengumuman", "Pengumuman", "megaphone"), m("kontak", "Kontak", "phone")],
  kebersihan: [m("dashboard", "Dashboard", "home"), m("absenKebersihan", "Absensi Kebersihan", "broom"), m("assetKebersihan", "Asset & Serah Terima Kebersihan", "box"), m("sampah", "Sampah", "trash"), m("kerusakan", "Kerusakan", "tool"), m("pengaduan", "Pengaduan", "msg"), m("kontak", "Kontak", "phone")],
  bendahara: [m("dashboard", "Dashboard", "home"), m("keuangan", "Keuangan", "wallet"), m("waIpl", "IPL WhatsApp", "msg"), m("export", "Export", "download"), m("kontak", "Kontak", "phone")],
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
