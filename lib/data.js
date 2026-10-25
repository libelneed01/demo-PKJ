import { IPL_NOMINAL } from "./config";
import { ymd } from "./format";
import { DEFAULT_CFG, seedWa } from "./wa";

export const SEC_GROUPS = {
  "Group A": { start: "06:00", end: "14:00", anggota: ["Joko Prasetyo", "Slamet Riyadi", "Dedi Kurniawan", "Wahyu Hidayat"] },
  "Group B": { start: "14:00", end: "22:00", anggota: ["Anto Wijaya", "Rudi Hartono", "Hendra Gunawan", "Yanto Saputra"] },
  "Group C": { start: "22:00", end: "06:00", anggota: ["Bambang Sutrisno", "Agus Salim", "Tono Purnomo", "Eko Susanto"] },
};
export const CLEAN_GROUPS = {
  "Group 1": { start: "06:00", end: "11:00", anggota: ["Sari Wulandari", "Mamat Suryana", "Dadang Hermawan"] },
  "Group 2": { start: "13:00", end: "17:00", anggota: ["Rina Marlina", "Ujang Sudrajat", "Asep Saepudin"] },
};
export const TOLERANSI = 10;

const FN = ["Ahmad", "Budi", "Citra", "Dewi", "Eko", "Fajar", "Gita", "Hendra", "Indra", "Joko", "Kartika", "Lestari", "Mulyadi", "Nurul", "Oki", "Putri", "Rahmat", "Siti", "Taufik", "Umar", "Vina", "Wahyu", "Yusuf", "Zainal", "Agus", "Bambang", "Dian", "Endang", "Hasan", "Irfan", "Lina", "Maya", "Nanda", "Rizky", "Sri", "Tri", "Yanti", "Andi", "Rina", "Heru"];
const LN = ["Santoso", "Wijaya", "Hidayat", "Pratama", "Saputra", "Kusuma", "Nugroho", "Susanto", "Rahayu", "Wulandari", "Hartono", "Setiawan", "Lubis", "Siregar", "Nasution", "Purnomo", "Firmansyah", "Maulana", "Permana", "Gunawan", "Halim", "Suryadi", "Ramadhan", "Utomo", "Anggraini"];
const CITY = [["Bandung", "Jawa Barat"], ["Surabaya", "Jawa Timur"], ["Semarang", "Jawa Tengah"], ["Yogyakarta", "DI Yogyakarta"], ["Medan", "Sumatera Utara"], ["Makassar", "Sulawesi Selatan"], ["Palembang", "Sumatera Selatan"], ["Balikpapan", "Kalimantan Timur"], ["Malang", "Jawa Timur"], ["Denpasar", "Bali"]];
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export const BLOK_RW = { 29: ["A", "B", "C", "D", "E"], 31: ["F", "G", "H", "I", "J"] };

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export function buildSeed() {
  const r = rng(20261021);
  const pick = (a) => a[Math.floor(r() * a.length)];
  const int = (a, b) => a + Math.floor(r() * (b - a + 1));
  const digits = (n) => Array.from({ length: n }, () => int(0, 9)).join("");
  const now = new Date();
  const day = (n) => { const d = new Date(now); d.setDate(d.getDate() + n); return d; };
  const name = () => pick(FN) + " " + pick(LN);
  const hp = () => "08" + pick(["12", "13", "21", "52", "57", "78", "81", "96"]) + digits(8);
  const plat = () => "B " + int(1000, 9999) + " " + pick(["KJD", "TXA", "BRM", "SDF", "PWL", "RNA", "UCK", "FGH", "ZZA", "BKL"]);
  const vk = () => {
    const v = [];
    if (r() < 0.6) v.push({ jenis: "Mobil", plat: plat() });
    if (r() < 0.55) v.push({ jenis: "Motor", plat: plat() });
    if (r() < 0.2) v.push({ jenis: "Motor", plat: plat() });
    return v;
  };

  // ---------- Rumah (600) ----------
  const rumah = [];
  Object.entries(BLOK_RW).forEach(([rw, bloks]) => bloks.forEach((b) => {
    for (let n = 1; n <= 60; n++) {
      const x = r();
      const status = x < 0.72 ? "tinggal" : x < 0.92 ? "ngontrak" : "ditinggal";
      const menunggak = status === "ditinggal" ? r() < 0.55 : status === "ngontrak" ? r() < 0.3 : r() < 0.18;
      const h = {
        id: `${b}-${n}`, rw: Number(rw), blok: b, no: n, status,
        owner: name(), kk: "3276" + digits(12), ktp: "3276" + digits(12), hp: hp(),
        iplStatus: menunggak ? "menunggak" : "lunas", tunggakan: menunggak ? int(1, 6) : 0,
        penghuni: 0, kendaraan: [],
      };
      if (status === "tinggal") { h.penghuni = int(1, 6); h.kendaraan = vk(); }
      if (status === "ngontrak") {
        h.penyewa = name(); h.penyewaKtp = "3276" + digits(12); h.penyewaHp = hp();
        h.penghuni = int(1, 5); h.kendaraan = vk();
        const start = day(-int(30, 400)); const end = new Date(start); end.setMonth(end.getMonth() + pick([6, 12, 12, 24]));
        h.kontrakMulai = ymd(start); h.kontrakSelesai = ymd(end);
      }
      if (status === "ditinggal") {
        const c = pick(CITY); h.kota = c[0]; h.provinsi = c[1];
        h.penunggu = name(); h.penungguHp = hp(); h.mulaiDitinggal = ymd(day(-int(60, 1000)));
      }
      rumah.push(h);
    }
  }));
  const lunasN = rumah.filter((h) => h.iplStatus === "lunas").length;

  // ---------- Keuangan ----------
  const pengeluaran = [
    ["Gaji Security", "Gaji 12 petugas security", 12000000], ["Gaji Kebersihan", "Gaji 6 petugas kebersihan", 6000000],
    ["Listrik Fasum", "Penerangan jalan & pos jaga", 2400000], ["Perbaikan", "Ganti 6 lampu jalan Blok C", 1350000],
    ["Operasional", "BBM & servis truk sampah", 1800000], ["Perlengkapan", "Sapu, trash bag, sarung tangan", 850000],
    ["Rapat", "Konsumsi rapat pengurus", 600000], ["Taman", "Perawatan taman & pemangkasan", 1500000],
    ["Keamanan", "Internet & pulsa CCTV", 900000], ["Lain-lain", "Materai, fotokopi, ATK", 500000],
  ].map((x, i) => ({ id: "exp-" + i, kategori: x[0], ket: x[1], nominal: x[2], tanggal: ymd(day(-i * 2)), bukti: i % 3 === 0 ? `nota-${i + 1}.jpg` : "" }));
  const sumKeluar = pengeluaran.reduce((a, b) => a + b.nominal, 0);
  const kasAwal = 17500000 - lunasN * IPL_NOMINAL + sumKeluar;
  const kasBulanan = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { id: "kb" + i, bulan: BULAN[d.getMonth()], masuk: int(41, 49) * 1000000 + int(0, 9) * 100000, keluar: int(38, 44) * 1000000 + int(0, 9) * 100000 };
  });
  const lunasList = rumah.filter((h) => h.iplStatus === "lunas");
  const pembayaran = Array.from({ length: 12 }, (_, i) => {
    const h = lunasList[int(0, lunasList.length - 1)];
    const d = day(-int(0, 9)); d.setHours(int(7, 21), int(0, 59));
    return { id: "pay-" + i, houseId: h.id, nama: h.penyewa || h.owner, nominal: IPL_NOMINAL, metode: pick(["QRIS", "Virtual Account", "Transfer Bank", "E-Wallet"]), at: d.toISOString(), status: "Lunas", bukti: i % 4 === 0 ? `bukti-${h.id}.jpg` : "" };
  }).sort((a, b) => b.at.localeCompare(a.at));

  // ---------- Tamu ----------
  const jenisT = ["Mobil Pribadi", "Motor Pribadi", "Taxi Online", "Ojek Online"];
  const tujuanT = ["Mengunjungi keluarga", "Mengantar paket", "Servis AC", "Kurir makanan", "Tukang renovasi", "Menjemput penghuni", "Arisan", "Urusan RW"];
  const tamu = Array.from({ length: 46 }, (_, i) => {
    const inside = i < 6;
    const masuk = inside ? new Date(now.getTime() - int(10, 200) * 60000) : (() => { const d = day(-Math.floor(i / 7)); d.setHours(int(7, 20), int(0, 59)); return d; })();
    const keluar = inside ? null : new Date(masuk.getTime() + int(15, 180) * 60000);
    const h = rumah[int(0, rumah.length - 1)];
    return { id: "tamu-" + i, nama: name(), plat: plat(), jenis: pick(jenisT), tujuan: pick(tujuanT), rumahTujuan: h.id, ktpFoto: `ktp-${i + 1}.jpg`, kendaraanFoto: `kendaraan-${i + 1}.jpg`, masuk: masuk.toISOString(), keluar: keluar ? keluar.toISOString() : null };
  });

  // ---------- Pengumuman ----------
  const pengumuman = [
    ["Kerja bakti bulanan", "Kegiatan & Acara", "Kerja bakti dilaksanakan Minggu pukul 07.00 di masing-masing blok. Mohon membawa peralatan kebersihan sendiri."],
    ["Pemadaman listrik terjadwal", "Pemadaman Listrik/Air", "PLN menginformasikan pemadaman listrik Rabu pukul 10.00-14.00 untuk perawatan jaringan."],
    ["Pengingat pembayaran IPL", "Keuangan & IPL", "Mohon segera melunasi IPL bulan berjalan paling lambat tanggal 10. Pembayaran dapat dilakukan secara online."],
    ["Imbauan kunci kendaraan", "Keamanan", "Terjadi percobaan pencurian motor di area luar komplek. Pastikan kendaraan dikunci ganda dan tidak diparkir di bahu jalan."],
    ["Jadwal pengangkutan sampah berubah", "Kebersihan", "Mulai pekan ini pengangkutan RW 31 dimajukan menjadi pukul 06.00."],
    ["Dompet ditemukan di pos jaga", "Kehilangan & Penemuan", "Dompet cokelat ditemukan di dekat pos jaga utama. Pemilik dapat mengambil di pos dengan menunjukkan identitas."],
    ["Peringatan: banjir kiriman", "Darurat", "Ketinggian air di kali belakang Blok J meningkat. Warga di sekitar kali harap waspada dan hubungi keamanan bila diperlukan."],
    ["Pembukaan pendaftaran lomba 17-an", "Umum", "Pendaftaran lomba tingkat RW dibuka di pos RW setiap sore pukul 16.00-18.00."],
  ].map((x, i) => ({ id: "ann-" + i, judul: x[0], kategori: x[1], isi: x[2], berlaku: ymd(day(10 - i)), penulis: pick(["Pengurus RW", "Pengurus Keamanan", "Bendahara", "Pengurus Kebersihan"]), koordinator: true, at: day(-i).toISOString() }));

  // ---------- Absensi ----------
  const mk = (groups, kind) => {
    const out = [];
    for (let d = 0; d <= 6; d++) {
      Object.entries(groups).forEach(([g, cfg], gi) => {
        if (d === 0 && gi > 0) return;
        const menit = r() < 0.7 ? int(-8, 8) : int(11, 40);
        const m0 = cfg.start.split(":").map(Number); const total = m0[0] * 60 + m0[1] + menit;
        const hm = (t) => String(Math.floor(((t % 1440) + 1440) % 1440 / 60)).padStart(2, "0") + ":" + String(((t % 60) + 60) % 60).padStart(2, "0");
        const e0 = cfg.end.split(":").map(Number);
        out.push({
          id: `${kind}-${d}-${gi}`, group: g, nama: pick(cfg.anggota), tanggal: ymd(day(-d)),
          masuk: hm(total), keluar: d === 0 ? null : hm(e0[0] * 60 + e0[1] + int(0, 6)),
          menit: Math.max(0, menit), telat: menit > TOLERANSI, area: kind === "kbs" ? pick(["RW 29", "RW 31"]) : "",
        });
      });
    }
    return out;
  };
  let absenSecurity = mk(SEC_GROUPS, "sec");
  let absenKebersihan = mk(CLEAN_GROUPS, "kbs");

  // ---------- Petugas, keterlambatan 6 bulan, ketidakhadiran ----------
  const petugas = [];
  const mkStaff = (unit, groups) => Object.entries(groups).forEach(([g, cfg]) => cfg.anggota.forEach((nama, i) => {
    const p = { id: `pt-${unit}-${g.replace(/\s/g, "")}-${i}`, nama, unit, group: g, jabatan: "Anggota", hp: hp(), tglMasuk: ymd(day(-int(300, 1800))), danruMulai: null, riwayatDanru: [], nilaiDanru: int(72, 96) };
    if (i === 0) { p.jabatan = "Danru"; p.danruMulai = ymd(day(-int(60, 230))); }
    else if (i === 1 && r() < 0.7) p.riwayatDanru = [{ group: g, mulai: ymd(day(-int(400, 700))), selesai: ymd(day(-int(250, 390))) }];
    petugas.push(p);
  }));
  mkStaff("security", SEC_GROUPS); mkStaff("kebersihan", CLEAN_GROUPS);
  const habitLate = new Set(); const habitSick = new Set(); const habitAlpa = new Set();
  ["security", "kebersihan"].forEach((u) => { const ps = petugas.filter((p) => p.unit === u && p.jabatan !== "Danru"); habitLate.add(ps[int(0, ps.length - 1)].id); habitLate.add(ps[int(0, ps.length - 1)].id); habitSick.add(ps[int(0, ps.length - 1)].id); habitAlpa.add(ps[int(0, ps.length - 1)].id); });
  const hmAdd = (start, add) => { const [h, m] = start.split(":").map(Number); const t = h * 60 + m + add; return String(Math.floor((t % 1440) / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0"); };
  const ketidakhadiran = [];
  for (let m = 5; m >= 0; m--) {
    const first = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const lastDay = m === 0 ? Math.max(1, now.getDate() - 8) : new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const dt = (n) => ymd(new Date(first.getFullYear(), first.getMonth(), n));
    petugas.forEach((p) => {
      const cfg = (p.unit === "security" ? SEC_GROUPS : CLEAN_GROUPS)[p.group];
      const nLate = habitLate.has(p.id) ? int(3, 7) : r() < 0.55 ? int(0, 2) : 0;
      for (let k = 0; k < nLate; k++) {
        const menit = int(11, 45);
        (p.unit === "security" ? absenSecurity : absenKebersihan).push({ id: `old-${p.id}-${m}-${k}`, group: p.group, nama: p.nama, tanggal: dt(int(1, lastDay)), masuk: hmAdd(cfg.start, menit), keluar: cfg.end, menit, telat: true, area: p.unit === "kebersihan" ? pick(["RW 29", "RW 31"]) : "" });
      }
      const add = (jenis, ket, surat) => ketidakhadiran.push({ id: `kh-${p.id}-${m}-${ketidakhadiran.length}`, petugasId: p.id, nama: p.nama, unit: p.unit, group: p.group, tanggal: dt(int(1, lastDay)), jenis, keterangan: ket, surat: surat || "", at: first.toISOString() });
      if (r() < 0.18) add("Sakit dengan surat", pick(["Demam, istirahat dari dokter", "Tipus, rawat jalan", "Sakit punggung"]), `surat-dokter-${p.nama.split(" ")[0].toLowerCase()}-${m}.pdf`);
      if (r() < (habitSick.has(p.id) ? 0.75 : 0.07)) add("Sakit tanpa surat", pick(["Mengabari lewat telepon, tidak ada surat", "Sakit kepala, tidak ke dokter"]));
      if (r() < 0.15) add("Izin", pick(["Urusan keluarga", "Mengurus dokumen", "Acara keluarga di kampung"]));
      if (r() < (habitAlpa.has(p.id) ? 0.45 : 0.03)) add("Alpa", "Tidak hadir tanpa kabar");
    });
  }

  // ---------- Pengaduan / Kerusakan / Sampah / Parkir ----------
  const rw = () => pick(["RW 29", "RW 31"]);
  const pengaduan = [
    ["Lampu jalan mati di Blok C", "Fasilitas", "Baru"], ["Anjing liar berkeliaran malam hari", "Keamanan", "Diproses"], ["Musik keras tetangga lewat tengah malam", "Kebisingan", "Selesai"],
    ["Selokan tersumbat depan rumah", "Kebersihan", "Diproses"], ["Mobil parkir menutup gerbang rumah", "Sosial", "Baru"], ["Gerbang utama sulit ditutup", "Fasilitas", "Selesai"],
    ["Sampah menumpuk di pojok Blok H", "Kebersihan", "Baru"], ["Orang tak dikenal berkeliling di Blok F", "Keamanan", "Diproses"], ["Pohon hampir roboh di jalan Blok B", "Fasilitas", "Baru"],
    ["Air PDAM sering mati pagi hari", "Lainnya", "Diproses"], ["Parkir liar kendaraan tamu di Blok I", "Sosial", "Selesai"], ["Kucing mencuri makanan warga", "Lainnya", "Selesai"],
    ["CCTV area Blok D tidak menyala", "Keamanan", "Baru"], ["Jalan berlubang depan Blok G", "Fasilitas", "Diproses"],
  ].map((x, i) => ({ id: "adu-" + i, pelapor: name(), rumah: rumah[int(0, 599)].id, judul: x[0], kategori: x[1], deskripsi: x[0] + ". Mohon segera ditindaklanjuti oleh pengurus.", foto: i % 3 === 0 ? `foto-${i}.jpg` : "", status: x[2], catatan: x[2] === "Baru" ? "" : x[2] === "Diproses" ? "Sudah diteruskan ke petugas terkait." : "Sudah ditangani. Terima kasih atas laporannya.", at: day(-int(0, 12)).toISOString() }));
  const kerusakan = [
    ["Lampu penerangan jalan", "Blok C", "Sedang", "Dikerjakan"], ["Paving block amblas", "Blok G", "Berat", "Dilaporkan"], ["Pagar taman rusak", "Taman RW 29", "Ringan", "Selesai"],
    ["Gerbang utama macet", "Gerbang utama", "Berat", "Dikerjakan"], ["Pos jaga bocor", "Pos jaga 2", "Sedang", "Dilaporkan"], ["Saluran drainase retak", "Blok J", "Berat", "Dilaporkan"],
    ["Lampu taman mati", "Taman RW 31", "Ringan", "Selesai"], ["Bangku taman patah", "Taman RW 29", "Ringan", "Dilaporkan"], ["Portal otomatis error", "Gerbang RW 31", "Sedang", "Dikerjakan"], ["Cat jalan pudar", "Blok E", "Ringan", "Selesai"],
  ].map((x, i) => ({ id: "rsk-" + i, fasilitas: x[0], lokasi: x[1], rw: x[1].includes("31") || ["Blok F", "Blok G", "Blok H", "Blok I", "Blok J"].includes(x[1]) ? "RW 31" : "RW 29", tingkat: x[2], deskripsi: "Perlu perbaikan: " + x[0].toLowerCase() + " di " + x[1] + ".", foto: "", status: x[3], catatan: x[3] === "Dilaporkan" ? "" : "Dijadwalkan oleh tukang komplek.", pelapor: name(), at: day(-int(0, 20)).toISOString() }));
  const sampahLaporan = [
    ["Pojok Blok H", "Sedang", "Dilaporkan"], ["Depan Blok C no. 20", "Besar", "Dijadwalkan"], ["Belakang pos jaga 1", "Kecil", "Diangkut"], ["Lahan kosong Blok J", "Besar", "Dilaporkan"],
    ["Samping taman RW 29", "Sedang", "Diangkut"], ["Gang Blok F", "Kecil", "Dijadwalkan"], ["Dekat gerbang RW 31", "Sedang", "Dilaporkan"], ["Jalan utama Blok A", "Kecil", "Diangkut"],
  ].map((x, i) => ({ id: "smp-" + i, lokasi: x[0], rw: rw(), ukuran: x[1], deskripsi: "Tumpukan sampah " + x[1].toLowerCase() + " di " + x[0].toLowerCase() + ".", foto: "", status: x[2], catatan: "", pelapor: name(), at: day(-int(0, 8)).toISOString() }));
  const jadwalSampah = [
    ["Senin", "RW 29", "Blok A - B", "06:00"], ["Selasa", "RW 29", "Blok C - D", "06:00"], ["Rabu", "RW 29", "Blok E + Fasum", "06:00"], ["Kamis", "RW 31", "Blok F - G", "06:00"],
    ["Jumat", "RW 31", "Blok H - I", "06:00"], ["Sabtu", "RW 31", "Blok J + Fasum", "06:00"], ["Minggu", "Semua RW", "Sampah besar (by request)", "08:00"],
  ].map((x, i) => ({ id: "jd-" + i, hari: x[0], area: x[1] + " - " + x[2], jam: x[3] }));
  const pelanggaran = [
    ["Parkir di bahu jalan", "Blok C", "Peringatan"], ["Menutup akses gerbang rumah", "Blok G", "Ditindak"], ["Parkir sembarang di taman", "Taman RW 29", "Selesai"], ["Parkir di bahu jalan", "Blok H", "Peringatan"],
    ["Parkir ganda menghalangi", "Blok A", "Ditindak"], ["Parkir di depan hydrant", "Blok E", "Peringatan"], ["Kendaraan tamu parkir > 24 jam", "Blok I", "Selesai"], ["Parkir sembarang di tikungan", "Blok J", "Peringatan"],
  ].map((x, i) => ({ id: "plg-" + i, plat: plat(), jenisKendaraan: i % 2 ? "Motor" : "Mobil", lokasi: x[1], pelanggaran: x[0], deskripsi: "", foto: "", status: x[2], catatan: x[2] === "Peringatan" ? "Teguran lisan diberikan." : "", pelapor: "Security", at: day(-int(0, 10)).toISOString() }));

  // ---------- Izin ----------
  const STEPS = ["Diajukan", "Disetujui RT", "Disetujui RW", "Disetujui Keamanan", "Selesai"];
  const izin = [
    ["Renovasi", "Renovasi dapur dan kamar mandi", 2], ["Pesta Ulang Tahun", "Ulang tahun anak, 60 tamu", 0], ["Kumpulan Keagamaan", "Pengajian bulanan", 3], ["Arisan Keluarga", "Arisan keluarga besar", 4],
    ["Renovasi", "Penambahan lantai 2", 1], ["Pesta Pernikahan", "Syukuran pernikahan", 0], ["Renovasi", "Pengecatan fasad", 4], ["Kumpulan Keagamaan", "Tahlilan", 3], ["Pesta Ulang Tahun", "Ulang tahun 17 tahun", 1], ["Arisan Keluarga", "Arisan RT", 2],
  ].map((x, i) => {
    const ditolak = i === 5; const tahap = ditolak ? 1 : x[2];
    return { id: "izn-" + i, pemohon: name(), rumah: rumah[int(0, 599)].id, jenis: x[0], deskripsi: x[1], mulai: ymd(day(int(-5, 20))), selesai: ymd(day(int(21, 40))), jumlah: int(10, 80), tahap, ditolak, alasan: ditolak ? "Bentrok dengan kegiatan RW pada tanggal tersebut." : "", status: ditolak ? "Ditolak" : STEPS[tahap], log: Array.from({ length: Math.min(tahap, 3) }, (_, k) => ({ level: ["RT", "RW", "Keamanan"][k], aksi: "Setuju", catatan: "Dokumen lengkap.", at: day(-int(0, 5)).toISOString() })).concat(ditolak ? [{ level: "RW", aksi: "Tolak", catatan: "Bentrok dengan kegiatan RW pada tanggal tersebut.", at: day(-1).toISOString() }] : []), at: day(-int(1, 14)).toISOString() };
  });

  // ---------- Asset & Shift ----------
  const assetSecurity = [["Handy Talky", true], ["Senter", true], ["Pentungan", true], ["Rompi", true], ["Peluit", true], ["Jas Hujan", false], ["Borgol", false]].map((x, i) => ({ id: "as" + i, nama: x[0], wajib: x[1] }));
  const assetKebersihan = [["Troli / Keranjang", true], ["Sapu", true], ["Pel", true], ["Karung Sampah", true], ["Sarung Tangan", true], ["Rompi Kebersihan", true], ["Jas Hujan", false]].map((x, i) => ({ id: "ak" + i, nama: x[0], wajib: x[1] }));
  const mkShift = (kind, group, petugas, daysAgo, hour, status, o = {}) => {
    const assets = kind === "security" ? assetSecurity : assetKebersihan;
    const start = day(-daysAgo); start.setHours(hour, 0, 0, 0);
    const items = assets.filter((a) => a.wajib || r() < 0.5).map((a) => ({ id: a.id, nama: a.nama, wajib: a.wajib, kondisi: "Baik" }));
    const sh = { id: `sh-${kind}-${group}-${daysAgo}`, kind, group, petugas, mulai: start.toISOString(), items, status, selesai: null, returns: null, kurangKet: "", catatan: null, masalah: [], approval: null, tolak: null, at: start.toISOString() };
    if (status !== "Bertugas") {
      const end = new Date(start.getTime() + 8 * 3600000);
      sh.selesai = end.toISOString();
      sh.returns = items.map((i) => ({ id: i.id, nama: i.nama, kembali: true, kondisi: "Baik" }));
      sh.catatan = kind === "security"
        ? { kejadian: pick(["Tidak ada kejadian penting.", "Ada kurir salah alamat di Blok D, sudah diarahkan.", "Alarm rumah B-14 berbunyi, ternyata false alarm."]), rawan: pick(["Pojok Blok J dan jalan belakang Blok E.", "Area parkir dekat taman RW 29."]), tamu: "Semua tamu sudah keluar.", kendaraan: pick(["Tidak ada.", "Mobil putih tanpa stiker tamu parkir di Blok C, sudah ditegur."]), instruksi: "Patroli tiap 2 jam dan cek gerbang RW 31." }
        : { dibersihkan: "Jalan utama Blok A - C dan taman RW 29.", belum: pick(["Tidak ada.", "Selokan Blok H belum dibersihkan."]), titik: pick(["Tidak ada.", "Pojok Blok H sering jadi tumpukan sampah."]), kerusakan: pick(["Tidak ada.", "Tutup got Blok G patah."]), instruksi: "Lanjutkan pembersihan Blok D - E." };
    }
    if (o.missing) {
      sh.returns = sh.returns.map((x) => (x.nama === o.missing ? { ...x, kembali: false } : x));
      if (o.rusak) sh.returns = sh.returns.map((x) => (x.nama === o.rusak ? { ...x, kondisi: "Rusak Ringan" } : x));
      sh.masalah = [`${o.missing} tidak dikembalikan`, ...(o.rusak ? [`${o.rusak} rusak ringan`] : [])];
      sh.kurangKet = o.ket;
    }
    if (status === "Disetujui" || status === "Disetujui dengan catatan") {
      const gs = kind === "security" ? SEC_GROUPS : CLEAN_GROUPS; const names = Object.keys(gs); const ng = names[(names.indexOf(group) + 1) % names.length];
      sh.approval = { group: ng, nama: pick(gs[ng].anggota), at: new Date(sh.selesai).toISOString(), ket: "" };
    }
    return sh;
  };
  const shiftSecurity = [
    mkShift("security", "Group C", "Bambang Sutrisno", 0, 6, "Bertugas"),
    mkShift("security", "Group B", "Anto Wijaya", 1, 14, "Menunggu Approval", { missing: "Handy Talky", rusak: "Senter", ket: "HT dipinjam sementara oleh pos RW 31 dan belum dikembalikan." }),
    mkShift("security", "Group A", "Joko Prasetyo", 1, 6, "Disetujui"), mkShift("security", "Group C", "Agus Salim", 2, 22, "Disetujui"),
    mkShift("security", "Group B", "Rudi Hartono", 2, 14, "Disetujui dengan catatan", { missing: "Peluit", ket: "Peluit hilang saat patroli malam, sudah dicari tidak ketemu." }),
    mkShift("security", "Group A", "Slamet Riyadi", 3, 6, "Disetujui"), mkShift("security", "Group C", "Tono Purnomo", 3, 22, "Disetujui"),
  ];
  const shiftKebersihan = [
    mkShift("kebersihan", "Group 2", "Rina Marlina", 0, 13, "Bertugas"),
    mkShift("kebersihan", "Group 1", "Sari Wulandari", 0, 6, "Menunggu Approval"),
    mkShift("kebersihan", "Group 2", "Asep Saepudin", 1, 13, "Disetujui"), mkShift("kebersihan", "Group 1", "Mamat Suryana", 1, 6, "Disetujui"),
    mkShift("kebersihan", "Group 2", "Ujang Sudrajat", 2, 13, "Disetujui dengan catatan", { missing: "Sarung Tangan", ket: "Sarung tangan robek dan dibuang, perlu pengadaan baru." }),
  ];
  shiftKebersihan[1].catatan.belum = "Selokan Blok H belum dibersihkan karena hujan.";

  // ---------- Kontak ----------
  const kontak = [
    ["Pengurus", "Ketua RW 29", "0812-1000-2900"], ["Pengurus", "Ketua RW 31", "0812-1000-3100"], ["Pengurus", "Sekretaris RW", "0812-1000-3200"], ["Pengurus", "Bendahara RW", "0812-1000-3300"],
    ["Keamanan", "Koordinator Keamanan - Bang Jago", "0812-3456-7890"], ["Keamanan", "Pos Jaga Utama", "0812-1000-4001"], ["Keamanan", "Pos Jaga Gerbang RW 31", "0812-1000-4002"],
    ["Kebersihan", "Koordinator Kebersihan", "0812-1000-5001"], ["Kebersihan", "Truk Sampah / Pengangkut", "0812-1000-5002"],
    ["Darurat", "Polisi", "110"], ["Darurat", "Pemadam Kebakaran", "113"], ["Darurat", "Ambulans", "118"], ["Darurat", "SAR / Basarnas", "115"],
    ["Layanan Publik", "PLN Contact Center", "123"], ["Layanan Publik", "PDAM (contoh)", "0251-000-0001"], ["Layanan Publik", "Puskesmas terdekat (contoh)", "021-000-0002"], ["Layanan Publik", "Kelurahan (contoh)", "021-000-0003"], ["Layanan Publik", "Layanan Gas (contoh)", "021-000-0004"],
  ].map((x, i) => ({ id: "kt-" + i, kategori: x[0], nama: x[1], hp: x[2] }));

  const uploads = [
    { id: "u0", modul: "Tamu", name: "ktp-1.jpg", size: 182000, at: day(-1).toISOString() }, { id: "u1", modul: "Tamu", name: "kendaraan-1.jpg", size: 240000, at: day(-1).toISOString() },
    { id: "u2", modul: "Keuangan", name: "nota-1.jpg", size: 130000, at: day(-3).toISOString() }, { id: "u3", modul: "Keuangan", name: "bukti-A-12.jpg", size: 96000, at: day(-2).toISOString() },
    { id: "u4", modul: "Pengaduan", name: "foto-0.jpg", size: 310000, at: day(-4).toISOString() },
  ];

  const seedData = { rumah };
  const waPesan = seedWa(seedData, now);
  return { petugas, ketidakhadiran, waConfig: { ...DEFAULT_CFG }, waPesan, rumah, tamu, pengeluaran, kasBulanan, kasAwal, pembayaran, pengumuman, absenSecurity, absenKebersihan, pengaduan, kerusakan, sampahLaporan, jadwalSampah, pelanggaran, izin, assetSecurity, assetKebersihan, shiftSecurity, shiftKebersihan, kontak, uploads };
}
