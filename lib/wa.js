import { IPL_NOMINAL, RT_LIST, rtKeyOf, rtLabel, groupName } from "./config";

const BLN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const rp = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");
const uid = (p) => p + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
export const bulanLabel = (d) => `${BLN[d.getMonth()]} ${d.getFullYear()}`;
const addM = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);

export const nomorWA = (hp) => { let x = String(hp || "").replace(/\D/g, ""); if (x.startsWith("0")) x = "62" + x.slice(1); return x; };
export const waLink = (hp, text) => `https://wa.me/${nomorWA(hp)}?text=${encodeURIComponent(text)}`;
export const waShare = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`;

export const DEFAULT_CFG = {
  nomorAdmin: "", nomorTester: "", opsiBulan: [1, 3, 6, 12], qr: {},
  narasi: "Yth. Bapak/Ibu warga {grup}, Pesona Khayangan Juanda.\nBerikut informasi pembayaran IPL (Iuran Pengelolaan Lingkungan) periode {bulan}. Mohon dibayarkan sebelum tanggal 10 setiap bulannya.",
  tata: "1. Buka aplikasi m-banking / e-wallet yang mendukung scan QR (QRIS).\n2. Scan QR yang dilampirkan di grup ini.\n3. Masukkan nominal sesuai jumlah bulan yang dibayar.\n4. Isi berita/catatan dengan BLOK-NO rumah, contoh: C-12.\n5. Selesai. Notifikasi pembayaran akan dikirim otomatis ke grup dan ke nomor WhatsApp Anda.",
};

// periode yang tercakup bila membayar n bulan (membayar bulan tertunggak paling lama dulu)
export function periode(h, n, now = new Date()) {
  const t = h.tunggakan || 0;
  const cur = new Date(now.getFullYear(), now.getMonth(), 1);
  const a = addM(cur, t > 0 ? -(t - 1) : 1 + (h.prepaid || 0));
  const b = addM(a, n - 1);
  return { a, b, range: n === 1 ? `bulan ${bulanLabel(a)}` : `dari bulan ${bulanLabel(a)} sampai ${bulanLabel(b)}`, short: n === 1 ? `bulan ${bulanLabel(a)}` : `${n} bulan, dari bulan ${bulanLabel(a)} sampai ${bulanLabel(b)}` };
}

export function rtStats(data) {
  return RT_LIST.map((r) => {
    const hs = (data.rumah || []).filter((h) => rtKeyOf(h) === r.key);
    const lunas = hs.filter((h) => h.iplStatus === "lunas").length;
    const terlambat = hs.filter((h) => h.iplStatus !== "lunas" && h.tunggakan <= 1).length;
    const menunggak = hs.length - lunas - terlambat;
    return { ...r, label: rtLabel(r.key), total: hs.length, lunas, terlambat, menunggak, belum: hs.length - lunas, terkumpul: lunas * IPL_NOMINAL, target: hs.length * IPL_NOMINAL, pct: hs.length ? Math.round((lunas / hs.length) * 100) : 0 };
  });
}

export function textPengumuman(cfg, key, now = new Date()) {
  const [rw, rt] = key.split("-");
  const fill = (t) => t.replaceAll("{grup}", `RT ${rt}/RW ${rw}`).replaceAll("{bulan}", bulanLabel(now));
  const opsi = (cfg.opsiBulan || [1]).map((n) => `- ${n} bulan = ${rp(n * IPL_NOMINAL)}`).join("\n");
  return `*${groupName(key).toUpperCase()}*\n\n${fill(cfg.narasi)}\n\n*Nilai IPL:* ${rp(IPL_NOMINAL)} per bulan\n*Pilihan jumlah bulan:*\n${opsi}\n\n*Tata cara pembayaran (scan QR):*\n${cfg.tata}\n\n[QR pembayaran terlampir]`;
}
export const textNotifGroup = (h, nama, per, n) => `Telah terjadi pembayaran IPL dari Bapak/Ibu ${nama}, Rumah BLOK ${h.blok} NO ${h.no}, selama ${n} bulan (${per.range}). Terima kasih.`;
export const textNotifPribadi = (nominal, per, n) => `Terima kasih, IPL Anda sudah terbayar sebesar ${rp(nominal)} ${n === 1 ? "untuk " + per.short : "untuk " + per.short}.`;
export function textRekap(data, key, now = new Date()) {
  const r = rtStats(data).find((x) => x.key === key);
  return `*REKAP IPL ${groupName(key).replace("IPL PKJ ", "")} - ${bulanLabel(now)}*\n\nSudah bayar: ${r.lunas} dari ${r.total} rumah (${r.pct}%)\nTotal pembayaran terkumpul bulan ini: ${rp(r.terkumpul)}\nTerlambat 1 bulan: ${r.terlambat} rumah\nMenunggak 2 bulan atau lebih: ${r.menunggak} rumah\nBelum terkumpul: ${rp(r.target - r.terkumpul)}\n\nTerima kasih atas partisipasi Bapak/Ibu.`;
}

const msg = (thread, type, text, at, extra = {}) => ({ id: uid("wa"), thread, type, text, at: at.toISOString(), _t: true, ...extra });

// Terapkan pembayaran: update rumah, catat pembayaran, dan buat 3 pesan WhatsApp (grup, pribadi, rekap)
export function applyPayment(x, { houseId, n, metode = "QRIS", sumber = "Aplikasi", payId, hp, now = new Date() }) {
  const h = x.rumah.find((r) => r.id === houseId);
  if (!h) return x;
  const per = periode(h, n, now);
  const nominal = n * IPL_NOMINAL;
  const t = h.tunggakan || 0;
  const rem = Math.max(0, t - n);
  const extra = t > 0 ? Math.max(0, n - t) : n;
  const nh = { ...h, tunggakan: rem, iplStatus: rem === 0 ? "lunas" : "menunggak", prepaid: (h.prepaid || 0) + extra };
  const nama = h.status === "ngontrak" ? h.penyewa : h.owner;
  const key = rtKeyOf(h);
  const noHp = nomorWA(hp || (h.status === "ngontrak" ? h.penyewaHp : h.hp));
  const rec = { id: payId || uid("pay"), houseId, nama, nominal, bulan: n, periode: per.short, metode, sumber, status: "Lunas", bukti: "", at: now.toISOString(), _t: true };
  const pembayaran = payId ? x.pembayaran.map((p) => (p.id === payId ? { ...p, status: "Lunas", bulan: n, periode: per.short, sumber } : p)) : [rec, ...x.pembayaran];
  const nx = { ...x, rumah: x.rumah.map((r) => (r.id === houseId ? nh : r)), pembayaran };
  const t0 = now.getTime();
  const pesan = [
    msg("g:" + key, "notif_group", textNotifGroup(h, nama, per, n), new Date(t0), { houseId }),
    msg("d:" + noHp, "notif_pribadi", textNotifPribadi(nominal, per, n), new Date(t0 + 1), { title: `${nama} (+${noHp})`, houseId }),
    msg("g:" + key, "rekap", textRekap(nx, key, now), new Date(t0 + 2)),
  ];
  return { ...nx, waPesan: [...(x.waPesan || []), ...pesan] };
}

export function seedWa(d, now = new Date()) {
  const out = [];
  const first = new Date(now.getFullYear(), now.getMonth(), 1, 8, 0, 0);
  RT_LIST.forEach((r, i) => {
    out.push(msg("g:" + r.key, "pengumuman", textPengumuman(DEFAULT_CFG, r.key, now), first, { _t: false }));
    const lun = d.rumah.filter((h) => rtKeyOf(h) === r.key && h.iplStatus === "lunas").slice(0, 3);
    lun.forEach((h, k) => {
      const at = new Date(first.getTime() + (k + 1) * 3600000 * (i + 2));
      const nama = h.status === "ngontrak" ? h.penyewa : h.owner;
      out.push(msg("g:" + r.key, "notif_group", textNotifGroup(h, nama, { short: `bulan ${bulanLabel(now)}`, range: `bulan ${bulanLabel(now)}` }, 1), at, { _t: false, houseId: h.id }));
    });
    out.push(msg("g:" + r.key, "rekap", textRekap(d, r.key, now), new Date(first.getTime() + 5 * 3600000 * (i + 1)), { _t: false }));
  });
  return out;
}
