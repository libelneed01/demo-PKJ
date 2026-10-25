export const JENIS = ["Sakit dengan surat", "Sakit tanpa surat", "Izin", "Alpa"];
export const JENIS_TONE = { "Sakit dengan surat": "green", "Sakit tanpa surat": "red", Izin: "navy", Alpa: "red" };
const BLN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export function monthList(n = 6, now = new Date()) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return { key: monthKey(d), label: `${BLN[d.getMonth()]} ${d.getFullYear()}`, short: BLN[d.getMonth()] };
  });
}
// 26 hari kerja per bulan (6 hari/minggu); bulan berjalan dihitung proporsional
export const hariKerja = (key, now = new Date()) => (key === monthKey(now) ? Math.max(1, Math.round((now.getDate() * 26) / 30)) : 26);
const absenOf = (data, unit) => (unit === "security" ? data.absenSecurity : data.absenKebersihan) || [];
export const monthsSince = (s, now = new Date()) => Math.max(0, (now.getFullYear() - new Date(s).getFullYear()) * 12 + now.getMonth() - new Date(s).getMonth() - (now.getDate() < new Date(s).getDate() ? 1 : 0));

export const danruOf = (data, unit, group) => (data.petugas || []).find((p) => p.unit === unit && p.group === group && p.jabatan === "Danru");

export function statsOne(data, p, key, now = new Date()) {
  const late = absenOf(data, p.unit).filter((a) => a.nama === p.nama && a.telat && String(a.tanggal).startsWith(key));
  const ev = (data.ketidakhadiran || []).filter((e) => e.petugasId === p.id && String(e.tanggal).startsWith(key));
  const c = (j) => ev.filter((e) => e.jenis === j).length;
  const telat = late.length;
  const menit = late.reduce((a, b) => a + (b.menit || 0), 0);
  const sakitSurat = c("Sakit dengan surat"), sakitTanpa = c("Sakit tanpa surat"), izin = c("Izin"), alpa = c("Alpa");
  const hk = hariKerja(key, now);
  const hadir = Math.max(0, hk - sakitSurat - sakitTanpa - izin - alpa);
  const skorWaktu = Math.max(0, 35 - (telat * 5 + Math.floor(menit / 30)));
  const skorHadir = Math.max(0, 35 - (alpa * 12 + sakitTanpa * 7 + izin * 2 + sakitSurat));
  const skorDanru = Math.round((p.nilaiDanru || 0) * 0.3);
  const total = skorWaktu + skorHadir + skorDanru;
  const grade = total >= 90 ? "A" : total >= 80 ? "B" : total >= 70 ? "C" : "D";
  const bonus = total >= 85 && telat <= 1 && alpa === 0 && sakitTanpa === 0;
  const binaan = total < 70 || alpa >= 2 || sakitTanpa >= 3;
  const lastLate = late.map((x) => x.tanggal).sort().pop() || "";
  return { p, key, danru: danruOf(data, p.unit, p.group), telat, menit, lastLate, sakitSurat, sakitTanpa, izin, alpa, hk, hadir, skorWaktu, skorHadir, skorDanru, total, grade, bonus, binaan, events: ev };
}

export const staffStats = (data, key, now = new Date()) => (data.petugas || []).map((p) => statsOne(data, p, key, now));

// evaluasi 6 bulan untuk kenaikan gaji
export function eval6(data, p, now = new Date()) {
  const months = monthList(6, now).map((m) => ({ ...m, ...statsOne(data, p, m.key, now) }));
  const avg = Math.round(months.reduce((a, b) => a + b.total, 0) / months.length);
  const alpa = months.reduce((a, b) => a + b.alpa, 0);
  const sakitTanpa = months.reduce((a, b) => a + b.sakitTanpa, 0);
  const telat = months.reduce((a, b) => a + b.telat, 0);
  const layakNaik = avg >= 85 && alpa === 0 && sakitTanpa <= 1 && telat <= 6;
  return { months, avg, alpa, sakitTanpa, telat, layakNaik };
}

export function danruInfo(data, unit, group, now = new Date()) {
  const danru = danruOf(data, unit, group);
  const bulan = danru && danru.danruMulai ? monthsSince(danru.danruMulai, now) : 0;
  const due = danru && danru.danruMulai ? new Date(new Date(danru.danruMulai).getFullYear(), new Date(danru.danruMulai).getMonth() + 6, new Date(danru.danruMulai).getDate()) : null;
  const status = bulan >= 6 ? "red" : bulan >= 5 ? "yellow" : "green";
  const kandidat = (data.petugas || [])
    .filter((p) => p.unit === unit && p.group === group && p.jabatan !== "Danru")
    .map((p) => ({ p, pernah: (p.riwayatDanru || []).length > 0, avg: eval6(data, p, now).avg }))
    .sort((a, b) => Number(a.pernah) - Number(b.pernah) || b.avg - a.avg);
  return { danru, bulan, due, status, kandidat };
}

export const belumDanru = (data, unit, now = new Date()) =>
  (data.petugas || []).filter((p) => (!unit || p.unit === unit) && p.jabatan !== "Danru" && (p.riwayatDanru || []).length === 0)
    .map((p) => ({ p, avg: eval6(data, p, now).avg, masa: monthsSince(p.tglMasuk, now) })).sort((a, b) => b.masa - a.masa);

export function applyRotasi(x, { unit, group, newId, now = new Date() }) {
  const iso = now.toISOString().slice(0, 10);
  return {
    ...x,
    petugas: x.petugas.map((p) => {
      if (p.unit === unit && p.group === group && p.jabatan === "Danru") return { ...p, jabatan: "Anggota", danruMulai: null, riwayatDanru: [...(p.riwayatDanru || []), { group, mulai: p.danruMulai, selesai: iso }] };
      if (p.id === newId) return { ...p, jabatan: "Danru", danruMulai: iso };
      return p;
    }),
  };
}

export function ringkasKinerja(data, unit, now = new Date()) {
  const key = monthKey(now);
  const rows = staffStats(data, key, now).filter((r) => !unit || r.p.unit === unit);
  const due = [];
  const units = unit ? [unit] : ["security", "kebersihan"];
  units.forEach((u) => [...new Set((data.petugas || []).filter((p) => p.unit === u).map((p) => p.group))].forEach((g) => { const i = danruInfo(data, u, g, now); if (i.danru && i.bulan >= 6) due.push({ unit: u, group: g, ...i }); }));
  return {
    seringTelat: rows.filter((r) => r.telat >= 3).length, totalTelat: rows.reduce((a, b) => a + b.telat, 0), orangTelat: rows.filter((r) => r.telat > 0).length,
    tanpaSurat: rows.reduce((a, b) => a + b.sakitTanpa, 0), alpa: rows.reduce((a, b) => a + b.alpa, 0), layakBonus: rows.filter((r) => r.bonus).length,
    binaan: rows.filter((r) => r.binaan).length, danruJatuhTempo: due.length, due,
  };
}
