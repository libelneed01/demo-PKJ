import { IPL_NOMINAL, MIN_KAS } from "./config";
import { ymd } from "./format";
import { shiftStats } from "./shift";

export const iplLabel = (h) => (h.iplStatus === "lunas" ? "lunas" : h.tunggakan <= 1 ? "terlambat" : "menunggak");

export function kasInfo(data) {
  const R = data.rumah || [];
  const lunas = R.filter((h) => h.iplStatus === "lunas").length;
  const terlambat = R.filter((h) => iplLabel(h) === "terlambat").length;
  const menunggak = R.filter((h) => iplLabel(h) === "menunggak").length;
  const masuk = lunas * IPL_NOMINAL;
  const keluar = (data.pengeluaran || []).reduce((a, b) => a + (b.nominal || 0), 0);
  const saldo = (data.kasAwal || 0) + masuk - keluar;
  const tone = saldo < MIN_KAS ? "red" : saldo < MIN_KAS * 1.25 ? "yellow" : "green";
  const label = tone === "red" ? "Bahaya: di bawah batas minimum" : tone === "yellow" ? "Perhatian: mendekati batas minimum" : "Aman";
  return { lunas, terlambat, menunggak, belumLunas: R.length - lunas, total: R.length, masuk, keluar, saldo, tone, label, pct: R.length ? Math.round((lunas / R.length) * 100) : 0 };
}

const KERUSAKAN_KEBERSIHAN = /taman|drainase|saluran|selokan|got|bangku/i;

export function stats(data) {
  const R = data.rumah || [];
  const cnt = (st) => R.filter((h) => h.status === st).length;
  const kas = kasInfo(data);
  const week = new Date(); week.setDate(week.getDate() - 7);
  const today = ymd(new Date());
  const sh = shiftStats(data);
  const sec = data.absenSecurity || []; const cl = data.absenKebersihan || [];
  return {
    kas, sh, totalRumah: R.length, tinggal: cnt("tinggal"), ngontrak: cnt("ngontrak"), ditinggal: cnt("ditinggal"),
    tamuDalam: (data.tamu || []).filter((t) => !t.keluar).length,
    tamuMinggu: (data.tamu || []).filter((t) => new Date(t.masuk) >= week).length,
    pengaduanBelum: (data.pengaduan || []).filter((x) => x.status !== "Selesai").length,
    pengaduanKeamanan: (data.pengaduan || []).filter((x) => x.kategori === "Keamanan" && x.status !== "Selesai").length,
    kerusakanAktif: (data.kerusakan || []).filter((x) => x.status !== "Selesai").length,
    kerusakanBerat: (data.kerusakan || []).filter((x) => x.status !== "Selesai" && x.tingkat === "Berat").length,
    kerusakanKebersihan: (data.kerusakan || []).filter((x) => x.status !== "Selesai" && KERUSAKAN_KEBERSIHAN.test(x.fasilitas + " " + x.lokasi)).length,
    izinMenunggu: (data.izin || []).filter((x) => !x.ditolak && x.tahap < 3).length,
    izinReviewKeamanan: (data.izin || []).filter((x) => !x.ditolak && x.tahap === 2).length,
    sampahAktif: (data.sampahLaporan || []).filter((x) => x.status !== "Diangkut").length,
    pelanggaranAktif: (data.pelanggaran || []).filter((x) => x.status !== "Selesai").length,
    telatMinggu: sec.filter((x) => x.telat && new Date(x.tanggal) >= week).length,
    hadirSecurity: sec.filter((x) => x.tanggal === today).length,
    telatSecurityHariIni: sec.filter((x) => x.tanggal === today && x.telat).length,
    hadirKebersihan: cl.filter((x) => x.tanggal === today).length,
    hadirRW29: cl.filter((x) => x.tanggal === today && x.area === "RW 29").length,
    hadirRW31: cl.filter((x) => x.tanggal === today && x.area === "RW 31").length,
    assetMasalah: sh.security.bermasalah + sh.kebersihan.bermasalah,
    approvalPending: sh.security.menunggu + sh.kebersihan.menunggu,
  };
}

export function tamuPerHari(data) {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = ymd(d);
    out.push({ label: d.toLocaleDateString("id-ID", { weekday: "short" }), a: (data.tamu || []).filter((t) => ymd(new Date(t.masuk)) === key).length });
  }
  return out;
}

export function kasChart(data) {
  const k = kasInfo(data);
  const m = new Date().toLocaleDateString("id-ID", { month: "short" });
  return [...(data.kasBulanan || []).map((x) => ({ label: x.bulan, a: x.masuk, b: x.keluar })), { label: m, a: k.masuk, b: k.keluar }];
}

export const flatKendaraan = (data) =>
  (data.rumah || []).flatMap((h) => (h.kendaraan || []).map((v) => ({ ...v, houseId: h.id, rw: h.rw, nama: h.status === "ngontrak" ? h.penyewa : h.owner, status: h.status })));
