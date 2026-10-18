export const ROLES = {
  rw: { label: "Pengurus RW", desc: "Akses semua menu" },
  keamanan: { label: "Pengurus Keamanan", desc: "Absensi security, tamu, patroli, panic" },
  kebersihan: { label: "Pengurus Kebersihan", desc: "Absensi kebersihan & area bersih" },
  bendahara: { label: "Bendahara", desc: "IPL dan donasi" },
};
export const MENUS = [
  { id: "dashboard", label: "Dashboard", roles: ["rw", "keamanan", "kebersihan", "bendahara"] },
  { id: "security", label: "Absensi Security", roles: ["rw", "keamanan"] },
  { id: "kebersihan", label: "Absensi Kebersihan", roles: ["rw", "kebersihan"] },
  { id: "tamu", label: "Tamu", roles: ["rw", "keamanan"] },
  { id: "tiket", label: "Pengaduan", roles: ["rw", "keamanan", "kebersihan"] },
  { id: "panic", label: "Panic", roles: ["rw", "keamanan"] },
  { id: "info", label: "Pengumuman", roles: ["rw", "keamanan", "kebersihan", "bendahara"] },
  { id: "ipl", label: "IPL", roles: ["rw", "bendahara"] },
  { id: "donasi", label: "Donasi", roles: ["rw", "bendahara"] },
  { id: "peta", label: "Peta", roles: ["rw", "keamanan", "kebersihan"] },
];
export const STATUS = ["Hadir", "Terlambat", "Sakit", "Bolos", "Libur"];
export const SECURITY = [
  { group: "Group A", members: ["Budi Santoso", "Agus Wijaya", "Slamet Riyadi", "Hendra Pratama", "Joko Susilo"] },
  { group: "Group B", members: ["Rudi Hartono", "Eko Prasetyo", "Wahyu Hidayat", "Dimas Saputra", "Yusuf Ramadhan"] },
  { group: "Group C", members: ["Fajar Nugroho", "Andi Kurniawan", "Bambang Irawan", "Teguh Santoso", "Rizki Firmansyah"] },
];
export const KEBERSIHAN = [
  { group: "Kebersihan 1 (RW 29)", members: ["Sumarni", "Katimin", "Suparman", "Wiwik Handayani"] },
  { group: "Kebersihan 2 (RW 31)", members: ["Mulyono", "Sri Lestari", "Darto", "Nur Hasanah", "Paijo"] },
];
export const TAMU = [
  { id: 1, nama: "Rina Marlina", plat: "L 1234 AB", tujuan: "Kunjungan keluarga", rumah: "B-12", keluar: false },
  { id: 2, nama: "Kurir Paket", plat: "W 5521 XY", tujuan: "Antar paket", rumah: "C-07", keluar: true },
];
export const TIKET = [
  { id: 1, judul: "Lampu jalan mati di Blok C", pelapor: "Pengurus RW", status: "Open" },
  { id: 2, judul: "Sampah menumpuk dekat taman RW 31", pelapor: "Pengurus Kebersihan", status: "On Progress" },
  { id: 3, judul: "Portal gerbang macet", pelapor: "Pengurus Keamanan", status: "Selesai" },
];
export const INFO = [
  { id: 1, judul: "Pemadaman listrik Sabtu 24 Okt", isi: "PLN melakukan perawatan jaringan pukul 09.00–13.00." },
  { id: 2, judul: "Kerja bakti bulanan", isi: "Minggu pagi pukul 07.00, kumpul di taman utama." },
];
export const IPL = {
  "RW 29": { lunas: 230, terlambat: 60, menunggak: 30 },
  "RW 31": { lunas: 190, terlambat: 50, menunggak: 40 },
};
export const DONASI = [
  { id: 1, jenis: "Masjid", nama: "Keluarga Pak Hadi", nominal: 500000 },
  { id: 2, jenis: "Duka", nama: "Warga Blok B", nominal: 1250000 },
  { id: 3, jenis: "Bonus Security", nama: "Kolektif RW 29", nominal: 3000000 },
  { id: 4, jenis: "Bonus Kebersihan", nama: "Kolektif RW 31", nominal: 2000000 },
];
export const TITIK = [
  { nama: "Pintu Gerbang Utama", lat: -7.3712, lng: 112.7795, tipe: "gerbang" },
  { nama: "Pos Patroli Blok A", lat: -7.3722, lng: 112.7782, tipe: "patroli" },
  { nama: "Pos Patroli Blok C", lat: -7.3731, lng: 112.7805, tipe: "patroli" },
  { nama: "Area Bersih RW 29", lat: -7.3718, lng: 112.7772, tipe: "bersih" },
  { nama: "Area Bersih RW 31", lat: -7.3738, lng: 112.7788, tipe: "bersih" },
];
