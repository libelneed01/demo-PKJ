export const ROLES = {
  warga: { label: "Warga", desc: "Tagihan, pengumuman, pengaduan, reservasi" },
  rw: { label: "Pengurus RW", desc: "Akses semua menu" },
  keamanan: { label: "Pengurus Keamanan", desc: "Tamu, absensi security, pengumuman, pengaduan" },
  kebersihan: { label: "Pengurus Kebersihan", desc: "Absensi kebersihan dan pengaduan terkait" },
  bendahara: { label: "Bendahara", desc: "IPL, pengeluaran, neraca, donasi" },
};
export const MENUS = [
  { id: "dashboard", label: "Dashboard", roles: ["rw", "keamanan", "kebersihan", "bendahara", "warga"] },
  { id: "tamu", label: "Tamu & Kendaraan", roles: ["rw", "keamanan"] },
  { id: "cctv", label: "CCTV & Kejadian", roles: ["rw", "keamanan"] },
  { id: "penghuni", label: "Penghuni", roles: ["rw"] },
  { id: "keuangan", label: "Keuangan", roles: ["rw", "bendahara"] },
  { id: "maintenance", label: "Maintenance", roles: ["rw", "kebersihan"] },
  { id: "fasilitas", label: "Fasilitas", roles: ["rw", "keamanan", "warga"] },
  { id: "info", label: "Pengumuman", roles: ["rw", "keamanan", "kebersihan", "bendahara", "warga"] },
  { id: "security", label: "Absensi Security", roles: ["rw", "keamanan"] },
  { id: "kebersihan", label: "Absensi Kebersihan", roles: ["rw", "kebersihan"] },
  { id: "tagihan", label: "Tagihan IPL Saya", roles: ["warga"] },
  { id: "tiket", label: "Pengaduan", roles: ["rw", "keamanan", "kebersihan", "warga"] },
  { id: "laporan", label: "Laporan & Analitik", roles: ["rw", "bendahara"] },
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
  { id: 1, jenis: "Masjid", nama: "Keluarga Pak Hadi", tgl: "2026-10-03", nominal: 500000 },
  { id: 2, jenis: "Duka", nama: "Warga Blok B", tgl: "2026-10-07", nominal: 1250000 },
  { id: 3, jenis: "Bonus Security", nama: "Kolektif RW 29", tgl: "2026-10-10", nominal: 3000000 },
  { id: 4, jenis: "Bonus Kebersihan", nama: "Kolektif RW 31", tgl: "2026-10-14", nominal: 2000000 },
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

const NAMA = ["Hendra", "Sari", "Wijaya", "Lina", "Rahmat", "Dewi", "Hasan", "Toni", "Maya", "Gunawan", "Retno", "Farid", "Siska", "Anton", "Yusuf", "Ratna"];
export const BLOK = ["A", "B", "C", "D", "E", "F", "G", "H"];
export const BLOK_STAT = [[62, 8, 5], [58, 10, 7], [64, 6, 5], [55, 12, 8], [60, 9, 6], [57, 11, 7], [63, 7, 5], [59, 9, 7]];
export const RUMAH = BLOK.flatMap((b, bi) => [1, 2, 3, 4, 5].map((n) => {
  const i = bi * 5 + n, status = n === 5 ? (bi % 2 ? "Disewakan" : "Kosong") : "Dihuni";
  return { id: `${b}-0${n}`, blok: b, rw: bi < 4 ? "RW 29" : "RW 31", pemilik: `${i % 2 ? "Bpk." : "Ibu"} ${NAMA[i % NAMA.length]}`, status, anggota: status === "Dihuni" ? 2 + (i % 4) : 0,
    kendaraan: status === "Kosong" ? [] : [[`L ${1000 + i * 37} ${"ABCDEFGH"[bi]}X`, "Mobil"], ...(i % 3 ? [[`W ${2000 + i * 53} ${"KLMNPQRS"[bi]}Z`, "Motor"]] : [])],
    ipl: status === "Kosong" ? "Lunas" : ["Lunas", "Lunas", "Terlambat", "Menunggak"][i % 4] };
}));
export const LOKASI = ["Gerbang Utama", "Blok A", "Blok C", "Blok E", "Taman Utama"];
export const SLOT = ["00–06", "06–12", "12–18", "18–24"];
export const JENIS_INS = ["Orang tidak dikenal", "Kendaraan mencurigakan", "Kehilangan", "Gangguan", "Portal rusak"];
const N = (id, tgl, jam, lokasi, jenis, ket, sev) => ({ id, tgl, jam, lokasi, jenis, ket, sev });
export const INSIDEN = [
  N(1, "2026-10-17", "23:40", "Gerbang Utama", "Orang tidak dikenal", "Mencoba masuk tanpa identitas", "Sedang"),
  N(2, "2026-10-16", "02:15", "Blok E", "Kendaraan mencurigakan", "Mobil parkir lama, plat tak terdaftar", "Tinggi"),
  N(3, "2026-10-15", "19:30", "Blok C", "Kehilangan", "Helm hilang dari teras", "Rendah"),
  N(4, "2026-10-14", "21:05", "Gerbang Utama", "Portal rusak", "Portal macet saat jam sibuk", "Sedang"),
  N(5, "2026-10-12", "14:20", "Taman Utama", "Gangguan", "Remaja berkumpul sampai larut", "Rendah"),
  N(6, "2026-10-10", "03:10", "Blok A", "Orang tidak dikenal", "Terlihat di sekitar rumah kosong", "Tinggi"),
  N(7, "2026-10-09", "18:45", "Gerbang Utama", "Kendaraan mencurigakan", "Motor tanpa plat", "Sedang"),
  N(8, "2026-10-05", "11:30", "Blok C", "Kehilangan", "Paket hilang di depan pagar", "Rendah"),
  N(9, "2026-10-03", "22:50", "Blok E", "Gangguan", "Suara keras tengah malam", "Rendah"),
  N(10, "2026-09-28", "19:10", "Gerbang Utama", "Orang tidak dikenal", "Sales masuk tanpa izin", "Rendah"),
];
export const KAT_FAS = ["Lampu Jalan", "Jalan & Drainase", "Taman", "Gerbang & Portal", "Listrik", "Air"];
const W = (id, tgl, judul, kat, biaya, status, vendor) => ({ id, tgl, judul, kat, biaya, status, vendor });
export const WO = [
  W(1, "2026-10-16", "Ganti 3 lampu jalan Blok C", "Lampu Jalan", 1800000, "Baru", "CV Terang Jaya"),
  W(2, "2026-10-12", "Servis portal gerbang", "Gerbang & Portal", 4200000, "Selesai", "PT Akses Prima"),
  W(3, "2026-10-08", "Pengerukan got Blok B", "Jalan & Drainase", 2500000, "Dikerjakan", "Pak Slamet"),
  W(4, "2026-10-04", "Pangkas pohon taman utama", "Taman", 1200000, "Selesai", "Pak Darto"),
  W(5, "2026-09-25", "Perbaikan panel listrik pos", "Listrik", 3100000, "Selesai", "CV Listrik Mandiri"),
  W(6, "2026-09-18", "Perbaikan pompa air", "Air", 2700000, "Selesai", "Pak Heri"),
];
export const STATUS_WO = [["Baru", "#4A7FC1"], ["Dikerjakan", "#E0A526"], ["Selesai", "#2FA37A"]];
export const PREV = [
  { nama: "Servis portal dan CCTV", tiap: "3 bulan", terakhir: "2026-10-12", berikut: "2026-11-14" },
  { nama: "Cek lampu jalan seluruh blok", tiap: "1 bulan", terakhir: "2026-09-20", berikut: "2026-10-22" },
  { nama: "Pengurasan got", tiap: "2 bulan", terakhir: "2026-08-20", berikut: "2026-10-17" },
  { nama: "Servis pompa air", tiap: "6 bulan", terakhir: "2026-09-18", berikut: "2027-03-18" },
];
export const FAS = [
  { id: "lap", nama: "Lapangan Serbaguna", buka: "06.00–22.00", jam: 16 }, { id: "bal", nama: "Balai Warga", buka: "08.00–22.00", jam: 14 },
  { id: "mas", nama: "Aula Masjid", buka: "08.00–21.00", jam: 13 }, { id: "tam", nama: "Taman & Gazebo", buka: "06.00–20.00", jam: 14 },
];
const B = (id, fas, tgl, mulai, selesai, pemesan, perlu) => ({ id, fas, tgl, mulai, selesai, pemesan, perlu });
export const BOOK = [
  B(1, "lap", "2026-10-18", "16:00", "18:00", "Bpk. Hendra", "Futsal remaja"), B(2, "bal", "2026-10-19", "19:00", "21:30", "Ibu Ratna", "Rapat PKK"),
  B(3, "bal", "2026-10-24", "08:00", "11:00", "Ibu Ratna", "Posyandu"), B(4, "mas", "2026-10-22", "18:30", "20:00", "Bpk. Yusuf", "Kajian rutin"),
  B(5, "tam", "2026-10-14", "15:00", "17:00", "Ibu Maya", "Ulang tahun anak"), B(6, "lap", "2026-10-10", "06:00", "08:00", "Bpk. Toni", "Senam pagi"),
  B(7, "bal", "2026-10-05", "10:00", "14:00", "Bpk. Gunawan", "Arisan RW 31"),
];
export const AUDIT = [
  ["2026-10-18 09:12", "Pengurus Keamanan", "Mencatat tamu masuk L 1234 AB"], ["2026-10-18 08:30", "Bendahara", "Menambah pengeluaran Operasional"],
  ["2026-10-17 20:05", "Pengurus RW", "Menerbitkan pengumuman Posyandu"], ["2026-10-17 14:40", "Pengurus Kebersihan", "Mengubah status pengaduan Sampah"],
  ["2026-10-16 07:10", "Pengurus Keamanan", "Check-in Group A"], ["2026-10-15 16:25", "Pengurus RW", "Menyetujui work order servis portal"],
  ["2026-10-12 10:00", "Bendahara", "Rekonsiliasi IPL RW 29"], ["2026-10-08 09:30", "Pengurus RW", "Membuat work order got Blok B"],
];
export const BULAN6 = ["Mei", "Jun", "Jul", "Agu", "Sep", "Okt"];
export const KEYS6 = ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"];
export const MASUK6 = [81, 83, 84, 85, 86, 87];
export const KOMPLAIN6 = { masuk: [14, 12, 16, 11, 13, 9], selesai: [12, 12, 14, 11, 12, 6] };
export const TAGIHAN0 = [["Mei", "Lunas"], ["Jun", "Lunas"], ["Jul", "Lunas"], ["Agu", "Lunas"], ["Sep", "Menunggak"], ["Okt", "Menunggak"]];
