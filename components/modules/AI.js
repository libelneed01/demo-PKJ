"use client";
import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/store";
import { stats, flatKendaraan } from "@/lib/stats";
import { MIN_KAS } from "@/lib/config";
import { rp, daysUntil, monthsSince, fmtDT } from "@/lib/format";
import { Card, Button, Badge, Icon, PageHeader } from "../ui";

const STEPS = ["Membaca data warga dan rumah", "Menghitung pola tunggakan IPL", "Memeriksa keamanan dan kegiatan tamu", "Menyusun rekomendasi"];

function build(data, v) {
  const s = stats(data); const R = data.rumah; const out = [];
  if (!R.length) return out;
  const pick = (a) => a[v % a.length];
  const blok = {};
  R.forEach((h) => { blok[h.blok] = blok[h.blok] || { n: 0, m: 0 }; blok[h.blok].n++; if (h.iplStatus !== "lunas") blok[h.blok].m++; });
  const worst = Object.entries(blok).sort((a, b) => b[1].m / b[1].n - a[1].m / a[1].n)[0];
  const wr = Math.round((worst[1].m / worst[1].n) * 100);
  out.push({ w: wr > 30 ? 3 : 2, tone: wr > 30 ? "red" : "yellow", icon: "wallet", title: `Tunggakan IPL tertinggi di Blok ${worst[0]}`, metric: `${wr}%`, view: "keuangan", params: { tab: "tunggakan" },
    text: pick([`Blok ${worst[0]} mencatat ${worst[1].m} dari ${worst[1].n} rumah belum lunas. Secara keseluruhan ${s.kas.belumLunas} rumah (${100 - s.kas.pct}%) belum membayar, ${s.kas.menunggak} di antaranya menunggak 2 bulan atau lebih.`, `${worst[1].m} rumah di Blok ${worst[0]} belum membayar IPL, tertinggi dibanding blok lain. ${s.kas.terlambat} rumah terlambat 1 bulan dan ${s.kas.menunggak} menunggak lebih lama.`]),
    reco: pick(["Prioritaskan penagihan door-to-door di blok ini dan tawarkan pembayaran online.", "Kirim pengingat massal dan tetapkan tenggat yang jelas untuk blok ini."]) });
  const dt = R.filter((h) => h.status === "ditinggal"); const lama = dt.filter((h) => monthsSince(h.mulaiDitinggal) > 12);
  out.push({ w: lama.length > 10 ? 3 : 2, tone: lama.length > 10 ? "red" : "yellow", icon: "home", title: "Rumah kosong berisiko keamanan", metric: `${dt.length}`, view: "warga", params: { tab: "ditinggal" },
    text: `${dt.length} rumah ditinggal pemilik, ${lama.length} di antaranya kosong lebih dari 12 bulan. Rumah kosong jangka panjang lebih rentan terhadap pencurian dan kerusakan.`, reco: "Masukkan rumah ini ke rute patroli prioritas dan verifikasi nomor penunggu rumah secara berkala." });
  const ak = R.filter((h) => h.status === "ngontrak" && daysUntil(h.kontrakSelesai) <= 60 && daysUntil(h.kontrakSelesai) >= 0);
  const lw = R.filter((h) => h.status === "ngontrak" && daysUntil(h.kontrakSelesai) < 0);
  out.push({ w: 2, tone: ak.length > 8 ? "yellow" : "green", icon: "users", title: "Kontrak pengontrak segera berakhir", metric: `${ak.length}`, view: "warga", params: { tab: "ngontrak" },
    text: `${ak.length} kontrak berakhir dalam 60 hari ke depan dan ${lw.length} kontrak sudah melewati tanggal selesai tetapi datanya belum diperbarui.`, reco: "Hubungi pemilik untuk memperbarui data kontrak atau mencatat pengontrak baru." });
  const veh = flatKendaraan(data); const banyak = R.filter((h) => (h.kendaraan || []).length >= 3).length;
  out.push({ w: s.pelanggaranAktif > 5 ? 2 : 1, tone: s.pelanggaranAktif > 5 ? "yellow" : "green", icon: "parking", title: "Kepadatan kendaraan dan parkir", metric: veh.length + "", view: "warga", params: {},
    text: `Terdapat ${veh.length} kendaraan terdaftar (rata-rata ${(veh.length / R.length).toFixed(1)} per rumah). ${banyak} rumah memiliki 3 kendaraan atau lebih, dan ${s.pelanggaranAktif} pelanggaran parkir masih aktif.`, reco: "Sosialisasikan aturan parkir dan tandai zona larangan parkir di tikungan dan gerbang." });
  const jam = {}; data.tamu.forEach((t) => { const h = new Date(t.masuk).getHours(); jam[h] = (jam[h] || 0) + 1; });
  const pk = Object.entries(jam).sort((a, b) => b[1] - a[1])[0];
  const onl = data.tamu.filter((t) => t.jenis.includes("Online")).length;
  if (pk) out.push({ w: 1, tone: "green", icon: "car", title: "Pola kunjungan tamu", metric: `${String(pk[0]).padStart(2, "0")}:00`, view: "tamu", params: {},
    text: `Puncak kedatangan tamu sekitar pukul ${String(pk[0]).padStart(2, "0")}.00 (${pk[1]} kunjungan). Kendaraan online (taksi dan ojek) berjumlah ${Math.round((onl / data.tamu.length) * 100)}% dari seluruh tamu.`, reco: "Tambah personel di gerbang pada jam puncak dan siapkan jalur cepat untuk kurir." });
  out.push({ w: s.kas.tone === "red" ? 3 : s.kas.tone === "yellow" ? 2 : 1, tone: s.kas.tone, icon: "wallet", title: "Kesehatan kas komplek", metric: rp(s.kas.saldo), view: "keuangan", params: { tab: "neraca" },
    text: `Saldo kas ${rp(s.kas.saldo)} berada ${s.kas.saldo >= MIN_KAS ? rp(s.kas.saldo - MIN_KAS) + " di atas" : rp(MIN_KAS - s.kas.saldo) + " di bawah"} batas minimum ${rp(MIN_KAS)}. Pengeluaran bulan ini ${rp(s.kas.keluar)}.`,
    reco: s.kas.tone === "green" ? "Pertahankan kedisiplinan IPL dan sisihkan dana cadangan perbaikan fasilitas." : "Tunda pengeluaran non-esensial dan percepat penagihan tunggakan." });
  const kc = {}; data.pengaduan.forEach((p) => { kc[p.kategori] = (kc[p.kategori] || 0) + 1; });
  const top = Object.entries(kc).sort((a, b) => b[1] - a[1])[0];
  if (top) out.push({ w: s.pengaduanBelum > 6 ? 2 : 1, tone: s.pengaduanBelum > 6 ? "yellow" : "green", icon: "msg", title: `Pengaduan terbanyak: ${top[0]}`, metric: `${top[1]}`, view: "pengaduan", params: { status: "Belum selesai" },
    text: `Kategori ${top[0]} menyumbang ${top[1]} dari ${data.pengaduan.length} pengaduan. Saat ini ${s.pengaduanBelum} pengaduan belum selesai.`, reco: "Tetapkan batas waktu respons maksimal 2 hari kerja untuk pengaduan baru." });
  const g = {}; data.absenSecurity.filter((x) => x.telat).forEach((x) => { g[x.group] = (g[x.group] || 0) + 1; });
  const tg = Object.entries(g).sort((a, b) => b[1] - a[1])[0];
  if (tg) out.push({ w: tg[1] > 3 ? 2 : 1, tone: tg[1] > 3 ? "yellow" : "green", icon: "shield", title: `Keterlambatan security: ${tg[0]}`, metric: `${tg[1]}x`, view: "absenSecurity", params: {},
    text: `${tg[0]} paling sering terlambat check-in (${tg[1]} kali). Total keterlambatan 7 hari terakhir: ${s.telatMinggu}.`, reco: "Bahas jadwal serah terima shift dengan koordinator keamanan." });
  out.push({ w: s.assetMasalah ? 3 : s.approvalPending ? 2 : 0, tone: s.assetMasalah ? "red" : s.approvalPending ? "yellow" : "green", icon: "box", title: "Serah terima shift dan asset", metric: `${s.assetMasalah}`, view: "assetSecurity", params: { tab: "approval" },
    text: s.assetMasalah || s.approvalPending ? `${s.assetMasalah} serah terima memiliki asset kurang atau rusak dan ${s.approvalPending} serah terima belum di-approve (security dan kebersihan).` : "Semua serah terima shift sudah di-approve tanpa masalah asset.",
    reco: s.assetMasalah ? "Minta group lama melengkapi keterangan dan pastikan group baru mengecek fisik asset sebelum approve." : "Pertahankan disiplin serah terima antar group." });
  out.push({ w: s.kerusakanBerat ? 3 : 1, tone: s.kerusakanBerat ? "red" : "green", icon: "tool", title: "Kerusakan fasilitas", metric: `${s.kerusakanAktif}`, view: "kerusakan", params: { status: "Belum selesai" },
    text: `${s.kerusakanAktif} laporan kerusakan belum selesai, ${s.kerusakanBerat} di antaranya tingkat berat. ${s.sampahAktif} tumpukan sampah belum diangkut.`, reco: "Dahulukan perbaikan tingkat berat yang menyangkut keselamatan, seperti gerbang dan drainase." });
  const pop = R.reduce((a, h) => a + (h.penghuni || 0), 0);
  out.push({ w: 0, tone: "green", icon: "users", title: "Gambaran demografi komplek", metric: pop.toLocaleString("id-ID"), view: "warga", params: {},
    text: `Estimasi ${pop.toLocaleString("id-ID")} penghuni dengan rata-rata ${(pop / Math.max(1, s.tinggal + s.ngontrak)).toFixed(1)} orang per rumah berpenghuni. Proporsi pengontrak ${Math.round((s.ngontrak / R.length) * 100)}% dari seluruh rumah.`, reco: "Gunakan data ini untuk merencanakan kapasitas fasilitas dan kegiatan RW." });
  return out.map((p, i) => ({ ...p, k: p.w * 10 + ((i * 7 + v * 13) % 10) })).sort((a, b) => b.k - a.k).slice(0, 8);
}

export default function AI() {
  const { data, go } = useApp();
  const [phase, setPhase] = useState("idle");
  const [step, setStep] = useState(0);
  const [v, setV] = useState(0);
  const [res, setRes] = useState([]);
  const [at, setAt] = useState(null);
  const timer = useRef(null);
  useEffect(() => () => clearInterval(timer.current), []);
  const run = (next) => {
    setPhase("loading"); setStep(0);
    let i = 0;
    timer.current = setInterval(() => {
      i++;
      if (i >= STEPS.length) { clearInterval(timer.current); setV(next); setRes(build(data, next)); setAt(new Date().toISOString()); setPhase("done"); } else setStep(i);
    }, 600);
  };
  const s = stats(data);
  const merah = res.filter((r) => r.tone === "red").length;
  return (
    <div>
      <PageHeader title="AI Analisis Data Warga" desc="Simulasi analisis berbasis data prototype. Tidak memanggil layanan AI sungguhan." action={phase === "done" && <Button variant="ghost" icon="sparkle" onClick={() => run(v + 1)}>Generate Ulang Analisis</Button>} />
      {phase === "idle" && (
        <Card className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mint-50 text-mint-700"><Icon n="sparkle" className="h-7 w-7" /></span>
          <h2 className="mt-4 text-lg font-bold text-navy">Siap menganalisis {data.rumah.length} rumah</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Analisis mencakup tunggakan IPL, hunian, kendaraan, tamu, keamanan, serah terima shift, dan kas.</p>
          <Button variant="mint" className="mt-5" onClick={() => run(0)} disabled={!data.rumah.length}>Analisis Data Warga Sekarang</Button>
        </Card>
      )}
      {phase === "loading" && (
        <Card><div className="flex items-center gap-3"><span className="spin h-6 w-6 rounded-full border-4 border-mint-100 border-t-mint-500" /><p className="text-sm font-semibold text-navy">{STEPS[step]}…</p></div>
          <ul className="mt-4 space-y-1.5 text-xs text-slate-500">{STEPS.map((x, i) => <li key={x} className={i <= step ? "text-navy" : ""}>{i < step ? "Selesai: " : i === step ? "Berjalan: " : "Menunggu: "}{x}</li>)}</ul></Card>
      )}
      {phase === "done" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-navy p-5 text-white shadow-card sm:p-6">
            <p className="text-sm text-white/70">Ringkasan - {fmtDT(at)}</p>
            <p className="mt-2 text-lg font-semibold leading-snug">{merah ? `${merah} temuan perlu penanganan segera.` : "Tidak ada temuan kritis saat ini."} IPL terkumpul {s.kas.pct}%, saldo kas {rp(s.kas.saldo)}, {s.tamuDalam} tamu sedang berada di dalam komplek.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {res.map((r) => (
              <Card key={r.title}>
                <div className="flex items-start justify-between gap-3"><span className="rounded-xl bg-mint-50 p-2 text-mint-700"><Icon n={r.icon} /></span><Badge tone={r.tone}>{r.tone === "red" ? "Bahaya" : r.tone === "yellow" ? "Perhatian" : "Aman"}</Badge></div>
                <h3 className="mt-3 text-base font-bold text-navy">{r.title}</h3>
                <p className="mt-1 text-2xl font-bold text-navy">{r.metric}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{r.text}</p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-navy"><b>Rekomendasi:</b> {r.reco}</p>
                <button onClick={() => go(r.view, r.params)} className="mt-3 text-sm font-semibold text-mint-700 hover:underline">Lihat data terkait</button>
              </Card>
            ))}
          </div>
          <p className="text-xs text-slate-500">Hasil dihitung dari data dummy di prototype ini. Redaksi dan urutan berubah setiap kali dianalisis ulang.</p>
        </div>
      )}
    </div>
  );
}
