export const ROLES = {
  rw: { label: "Pengurus RW", desc: "Akses semua menu" },
  keamanan: { label: "Pengurus Keamanan", desc: "Tamu, absensi security, pengumuman, pengaduan" },
  kebersihan: { label: "Pengurus Kebersihan", desc: "Absensi kebersihan dan pengaduan terkait" },
  bendahara: { label: "Bendahara", desc: "IPL, pengeluaran, neraca, donasi" },
};
export const MENUS = [
  { id: "dashboard", label: "Dashboard", roles: ["rw", "keamanan", "kebersihan", "bendahara"] },
  { id: "tamu", label: "Tamu & Kendaraan", roles: ["rw", "keamanan"] },
  { id: "keuangan", label: "Keuangan", roles: ["rw", "bendahara"] },
  { id: "info", label: "Pengumuman", roles: ["rw", "keamanan", "kebersihan", "bendahara"] },
  { id: "security", label: "Absensi Security", roles: ["rw", "keamanan"] },
  { id: "kebersihan", label: "Absensi Kebersihan", roles: ["rw", "kebersihan"] },
  { id: "tiket", label: "Pengaduan", roles: ["rw", "keamanan", "kebersihan"] },
];
export const C = { ok: "#2FA37A", warn: "#E0A526", bad: "#E26D6D", info: "#4A7FC1", mute: "#94A3B8", navy: "#0B2545" };
export const TODAY = "2026-10-18";
export const KOORD = { nama: "Bang Jago", telp: "0812-3456-7890" };

export const SECURITY = [
  { group: "Group A", members: ["Budi Santoso", "Agus Wijaya", "Slamet Riyadi", "Hendra Pratama", "Joko Susilo"] },
  { group: "Group B", members: ["Rudi Hartono", "Eko Prasetyo", "Wahyu Hidayat", "Dimas Saputra", "Yusuf Ramadhan"] },
  { group: "Group C", members: ["Fajar Nugroho", "Andi Kurniawan", "Bambang Irawan", "Teguh Santoso", "Rizki Firmansyah"] },
];
export const KEBERSIHAN = [
  { group: "Kebersihan 1", members: ["Sumarni", "Katimin", "Suparman", "Wiwik Handayani"] },
  { group: "Kebersihan 2", members: ["Mulyono", "Sri Lestari", "Darto", "Nur Hasanah", "Paijo"] },
];
export const SHIFT = {
  "Group A": { label: "Shift Pagi 07.00–19.00", start: "07:00" },
  "Group B": { label: "Shift Malam 19.00–07.00", start: "19:00" },
  "Group C": { label: "Shift Pagi 07.00–19.00 (cadangan)", start: "07:00" },
  "Kebersihan 1": { label: "Shift 06.00–14.00", start: "06:00" },
  "Kebersihan 2": { label: "Shift 06.00–14.00", start: "06:00" },
};
export const MANUAL = ["Sakit dengan Surat", "Sakit tanpa Surat", "Izin", "Bolos", "Libur"];
export const ATT0 = {
  "Budi Santoso": { in: "07:05", late: 5 }, "Agus Wijaya": { in: "07:50", late: 50 }, "Slamet Riyadi": { in: "08:15", late: 75 },
  "Sumarni": { in: "06:02", late: 2, area: "RW 29" }, "Katimin": { in: "06:20", late: 20, area: "RW 29" },
  "Mulyono": { in: "06:00", late: 0, area: "RW 31" }, "Sri Lestari": { in: "06:50", late: 50, area: "RW 31" },
};

export const JENIS_KENDARAAN = ["Mobil Pribadi", "Motor Pribadi", "Taxi Online", "Ojek Online"];
const T = (id, nama, plat, jenis, rumah, warga, tgl, masuk, keluar, catatan = "") => ({ id, nama, plat, jenis, rumah, warga, tgl, masuk, keluar, catatan, nik: "35150" + (1000000000 + id * 7919317), ktp: true, foto: true });
export const TAMU = [
  T(1, "Rina Marlina", "L 1234 AB", "Mobil Pribadi", "B-12", "Bpk. Hendra", TODAY, "08:10", null, "Kunjungan keluarga"),
  T(2, "Andi Saputra", "W 5521 XY", "Ojek Online", "C-07", "Ibu Sari", TODAY, "09:05", "09:20", "Antar makanan"),
  T(3, "Dedi Kurniawan", "L 7788 KP", "Taxi Online", "A-21", "Bpk. Wijaya", TODAY, "10:30", null, "Jemput penumpang"),
  T(4, "Fitri Handayani", "L 3321 ZZ", "Motor Pribadi", "D-03", "Ibu Lina", TODAY, "11:15", null),
  T(5, "Yoga Pratama", "W 4410 QA", "Mobil Pribadi", "E-18", "Bpk. Gunawan", TODAY, "13:40", "15:05", "Rapat arisan"),
  T(6, "Bayu Aji", "L 9012 CD", "Ojek Online", "B-09", "Ibu Dewi", "2026-10-17", "19:20", "19:30"),
  T(7, "Santi Wulandari", "S 2201 MN", "Mobil Pribadi", "F-14", "Ibu Retno", "2026-10-16", "16:00", "18:45", "Silaturahmi"),
  T(8, "Heru Setiawan", "L 6655 RT", "Taxi Online", "C-15", "Bpk. Anton", "2026-10-15", "07:45", "07:55"),
  T(9, "Wawan Gunadi", "W 7788 BK", "Motor Pribadi", "A-05", "Bpk. Rahmat", "2026-10-14", "10:10", "11:20", "Servis AC"),
];

export const IPL_FEE = 150000;
export const IPL = { "RW 29": { lunas: 230, terlambat: 60, menunggak: 30 }, "RW 31": { lunas: 190, terlambat: 50, menunggak: 40 } };
export const TUNGGAKAN = {
  "RW 29": [["A-03", "Bpk. Rahmat", 3], ["B-11", "Ibu Dewi", 2], ["C-05", "Bpk. Hasan", 4], ["D-09", "Ibu Lina", 2], ["A-17", "Bpk. Toni", 6], ["B-02", "Ibu Maya", 3]],
  "RW 31": [["E-02", "Bpk. Gunawan", 5], ["F-14", "Ibu Retno", 2], ["G-07", "Bpk. Farid", 3], ["H-10", "Ibu Siska", 4], ["E-19", "Bpk. Anton", 2]],
};
export const IPL_MASUK = 530 * IPL_FEE;
export const SALDO_AWAL = 20000000, CADANGAN = 10000000, MIN_KAS = 15000000, THIS_MONTH = "2026-10";
export const KAT_EXP = ["Gaji Security", "Gaji Kebersihan", "Listrik Fasilitas", "Perbaikan", "Operasional", "Lainnya"];
export const EXP = [
  { id: 1, tgl: "2026-10-01", kat: "Gaji Security", ket: "Gaji 15 security", nominal: 42000000 },
  { id: 2, tgl: "2026-10-01", kat: "Gaji Kebersihan", ket: "Gaji 9 petugas", nominal: 18000000 },
  { id: 3, tgl: "2026-10-05", kat: "Listrik Fasilitas", ket: "Lampu jalan dan pos", nominal: 6500000 },
  { id: 4, tgl: "2026-10-12", kat: "Perbaikan", ket: "Servis portal gerbang", nominal: 4200000 },
  { id: 5, tgl: "2026-10-15", kat: "Operasional", ket: "ATK dan konsumsi rapat", nominal: 7300000 },
  { id: 6, tgl: "2026-09-01", kat: "Gaji Security", ket: "Gaji 15 security", nominal: 42000000 },
  { id: 7, tgl: "2026-09-01", kat: "Gaji Kebersihan", ket: "Gaji 9 petugas", nominal: 18000000 },
  { id: 8, tgl: "2026-09-09", kat: "Listrik Fasilitas", ket: "Lampu jalan dan pos", nominal: 6200000 },
  { id: 9, tgl: "2026-09-20", kat: "Operasional", ket: "Kegiatan 17-an", nominal: 8800000 },
  { id: 10, tgl: "2026-08-01", kat: "Gaji Security", ket: "Gaji 15 security", nominal: 42000000 },
  { id: 11, tgl: "2026-08-01", kat: "Gaji Kebersihan", ket: "Gaji 9 petugas", nominal: 18000000 },
  { id: 12, tgl: "2026-08-14", kat: "Perbaikan", ket: "Cat pagar taman", nominal: 12000000 },
];
export const EXP_OLD = { "2026-05": 68000000, "2026-06": 71000000, "2026-07": 70000000 };
export const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export const DONASI = [
  { id: 1, jenis: "Masjid", nama: "Keluarga Pak Hadi", nominal: 500000 },
  { id: 2, jenis: "Duka", nama: "Warga Blok B", nominal: 1250000 },
  { id: 3, jenis: "Bonus Security", nama: "Kolektif RW 29", nominal: 3000000 },
  { id: 4, jenis: "Bonus Kebersihan", nama: "Kolektif RW 31", nominal: 2000000 },
];
export const JENIS_DON = ["Masjid", "Duka", "Bonus Security", "Bonus Kebersihan"];
export const TONE = {
  ok: { c: "#2FA37A", bg: "#E8F6F0", t: "Saldo aman" },
  warn: { c: "#E0A526", bg: "#FDF5E0", t: "Mendekati batas minimum" },
  bad: { c: "#E26D6D", bg: "#FCEBEB", t: "Kritis, di bawah batas minimum" },
};
export function kas(exp, don) {
  const keluar = exp.filter((e) => e.tgl.startsWith(THIS_MONTH)).reduce((a, e) => a + e.nominal, 0);
  const dn = don.reduce((a, d) => a + d.nominal, 0);
  const saldo = SALDO_AWAL + IPL_MASUK + dn - keluar;
  return { keluar, dn, saldo, tone: saldo < MIN_KAS ? "bad" : saldo < MIN_KAS * 1.5 ? "warn" : "ok" };
}

export const KAT_INFO = ["Kesehatan", "Keagamaan", "Keamanan", "Kebersihan", "Olahraga & Sosial", "Pemeliharaan Fasilitas", "Lainnya"];
const I = (id, judul, kat, tgl, mulai, selesai, tempat, desk, pj) => ({ id, judul, kat, tgl, mulai, selesai, tempat, desk, pj, konf: `Sudah menghubungi ${KOORD.nama} (${KOORD.telp}) via WhatsApp pukul 09.15` });
export const INFO = [
  I(1, "Penimbangan Balita (Posyandu)", "Kesehatan", "2026-10-24", "08:00", "11:00", "Kantor RW 29", "Penimbangan, imunisasi, dan pemberian vitamin untuk balita. Bawa buku KIA.", "Ibu Ratna"),
  I(2, "Kajian Rutin Ba'da Maghrib", "Keagamaan", "2026-10-22", "18:30", "20:00", "Masjid Al-Ikhlas", "Kajian bulanan bersama ustaz tamu. Terbuka untuk seluruh warga.", "Bpk. Yusuf"),
  I(3, "Patroli Gabungan Malam", "Keamanan", "2026-10-23", "22:00", "02:00", "Pos Gerbang Utama", "Patroli gabungan security dan warga di seluruh blok.", "Bang Jago"),
  I(4, "Kerja Bakti Bersih Got", "Kebersihan", "2026-10-25", "07:00", "10:00", "Taman Utama RW 31", "Warga diminta membawa sapu dan sarung tangan.", "Bpk. Hasan"),
  I(5, "Senam Sehat Pagi", "Olahraga & Sosial", "2026-10-25", "06:00", "07:30", "Lapangan Blok C", "Senam bersama dengan instruktur, gratis untuk warga.", "Ibu Maya"),
  I(6, "Perbaikan Lampu Jalan Blok C", "Pemeliharaan Fasilitas", "2026-10-21", "09:00", "15:00", "Jl. Melati Blok C", "Pemadaman lampu sementara selama perbaikan.", "Bpk. Hendra"),
];
export const KAT_ADU = ["Lampu Jalan", "Got", "Sampah", "Keamanan", "Air", "Listrik", "Lainnya"];
export const STATUS_ADU = [["Belum Ditangani", "#E26D6D"], ["Sedang Dikerjakan", "#E0A526"], ["Selesai", "#2FA37A"]];
export const SCOPE = { keamanan: ["Keamanan", "Lampu Jalan"], kebersihan: ["Got", "Sampah"] };
const A = (id, judul, kat, lokasi, desk, pelapor, status, catatan = []) => ({ id, judul, kat, lokasi, desk, pelapor, status, catatan, tgl: "2026-10-1" + (id % 8) });
export const ADU = [
  A(1, "Lampu jalan mati", "Lampu Jalan", "Blok C", "Tiga lampu padam sejak Kamis, area gelap.", "Bpk. Hendra", "Belum Ditangani"),
  A(2, "Sampah menumpuk di taman", "Sampah", "Taman RW 31", "Belum diangkut 3 hari.", "Ibu Retno", "Sedang Dikerjakan", [{ t: "Petugas sudah dijadwalkan sore ini" }]),
  A(3, "Got tersumbat", "Got", "Blok B-10", "Air meluap saat hujan.", "Ibu Dewi", "Belum Ditangani"),
  A(4, "Orang asing mondar-mandir", "Keamanan", "Blok E", "Terlihat malam hari tanpa tujuan jelas.", "Bpk. Gunawan", "Sedang Dikerjakan", [{ t: "Security Group B menambah patroli" }]),
  A(5, "Portal gerbang macet", "Keamanan", "Gerbang utama", "Sering macet saat dibuka.", "Pengurus Keamanan", "Selesai", [{ t: "Sudah diperbaiki teknisi" }]),
  A(6, "Air PDAM keruh", "Air", "Blok A", "Air berwarna kecokelatan pagi hari.", "Ibu Lina", "Belum Ditangani"),
  A(7, "Lampu taman diganti", "Lampu Jalan", "Taman RW 29", "Lampu taman berkedip.", "Bpk. Rahmat", "Selesai", [{ t: "Sudah diganti lampunya" }]),
];
export const HARI7 = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
