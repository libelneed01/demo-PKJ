"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import * as D from "@/lib/data";
import { Stat, Modal, Donut, Bars, Trend, Hint, rupiah } from "./Charts";
const MapView = dynamic(() => import("./MapView"), { ssr: false });

const Panel = ({ title, hint, children }) => (
  <section className="card"><h3 className="mb-2 font-bold text-pine">{title}</h3>{children}{hint && <Hint>{hint}</Hint>}</section>
);
const Chip = ({ on, ...p }) => (
  <button {...p} className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${on ? "bg-moss text-white ring-moss" : "bg-white text-moss ring-moss/40"}`} />
);
const JENIS = [["Masjid", "#1F5A43"], ["Duka", "#64748B"], ["Bonus Security", "#B8913A"], ["Bonus Kebersihan", "#2E86C1"]];
const TS = ["Open", "On Progress", "Selesai"];
const TC = ["#C0392B", "#B8913A", "#1F5A43"];
const sumBy = (list) => JENIS.map(([j, c]) => ({ label: j, color: c, value: list.filter((d) => d.jenis === j).reduce((a, d) => a + d.nominal, 0) })).filter((d) => d.value);
const iplTot = () => Object.values(D.IPL).reduce((a, r) => ({ lunas: a.lunas + r.lunas, terlambat: a.terlambat + r.terlambat, menunggak: a.menunggak + r.menunggak }), { lunas: 0, terlambat: 0, menunggak: 0 });
const iplData = (x) => [{ label: "Lunas", value: x.lunas, color: "#1F5A43" }, { label: "Terlambat", value: x.terlambat, color: "#B8913A" }, { label: "Menunggak", value: x.menunggak, color: "#C0392B" }];

export function Attendance({ groups, shifts, trend, total }) {
  const [st, setSt] = useState({});
  const [sel, setSel] = useState(null);
  const set = (k, v) => setSt((s) => ({ ...s, [k]: { ...s[k], ...v } }));
  const all = groups.flatMap((g) => g.members);
  const n = (s) => all.filter((m) => st[m]?.status === s).length;
  const hadir = n("Hadir") + n("Terlambat");
  const donut = D.STATUS.map((s) => ({ label: s, value: n(s), color: D.STATUS_COLOR[s] })).filter((d) => d.value);
  const now = () => new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const hist = (m) => D.HARI.map((h, i) => { const k = (m.length * (i + 3)) % 11; return { h, s: k === 0 ? "Terlambat" : k === 1 ? "Sakit" : i === 6 ? "Libur" : "Hadir" }; });
  const g = sel && groups.find((x) => x.members.includes(sel));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Terdaftar" value={all.length} hint="Total petugas" />
        <Stat label="Hadir" value={hadir} hint={`Terlambat: ${n("Terlambat")}`} />
        <Stat label="Kehadiran" value={Math.round((hadir / all.length) * 100) + "%"} hint="Hadir / terdaftar" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Status hari ini" hint={D.STATUS.map((s) => <p key={s}><b style={{ color: D.STATUS_COLOR[s] }}>{s}</b>: {D.STATUS_DESC[s]}</p>)}>
          {donut.length ? <Donut data={donut} center="petugas" /> : <p className="text-sm text-slate-500">Belum ada check-in. Tekan Check-in pada nama petugas.</p>}
        </Panel>
        <Panel title="Tren kehadiran 7 hari" hint={<p>Jumlah petugas hadir per hari (dari {total}). Sentuh titik untuk melihat angkanya. Data contoh.</p>}>
          <Trend points={D.HARI.map((l, i) => ({ label: l, value: trend[i] }))} unit=" org" />
        </Panel>
      </div>
      {groups.map((gr) => {
        const h = gr.members.filter((m) => ["Hadir", "Terlambat"].includes(st[m]?.status)).length;
        return (
          <section key={gr.group} className="card">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-bold text-pine">{gr.group} <span className="text-xs font-normal text-slate-500">· shift {shifts[gr.group]}</span></h3>
              <span className="text-xs font-semibold text-moss">{h}/{gr.members.length} hadir</span>
            </div>
            <ul className="divide-y divide-slate-100">
              {gr.members.map((m) => {
                const s = st[m] || {};
                return (
                  <li key={m} className="flex flex-wrap items-center gap-2 py-2">
                    <button onClick={() => setSel(m)} className="min-w-36 flex-1 text-left text-sm font-medium underline decoration-dotted">{m}</button>
                    <select aria-label={`Status ${m}`} className="input !w-auto" value={s.status || ""} onChange={(e) => set(m, { status: e.target.value })}>
                      <option value="">Status…</option>
                      {D.STATUS.map((x) => <option key={x}>{x}</option>)}
                    </select>
                    {s.out ? <span className="text-xs text-slate-500">{s.in} – {s.out}</span> : s.in ? (
                      <button className="btn-ghost" onClick={() => set(m, { out: now() })}>Check-out</button>
                    ) : (
                      <button className="btn" onClick={() => set(m, { in: now(), status: s.status || "Hadir" })}>Check-in</button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      {sel && (
        <Modal title={sel} onClose={() => setSel(null)}>
          <p className="mb-3 text-sm text-slate-600">{g.group} · shift {shifts[g.group]}</p>
          <p className="mb-2 text-sm">Hari ini: <b style={{ color: D.STATUS_COLOR[st[sel]?.status] }}>{st[sel]?.status || "Belum check-in"}</b>{st[sel]?.in && ` · masuk ${st[sel].in}`}{st[sel]?.out && ` · pulang ${st[sel].out}`}</p>
          <h4 className="mb-1 text-sm font-bold text-pine">Riwayat 7 hari (contoh)</h4>
          <ul className="grid grid-cols-7 gap-1 text-center text-[11px]">
            {hist(sel).map((x) => (
              <li key={x.h} title={`${x.h}: ${x.s}`} className="rounded-lg p-1 text-white" style={{ background: D.STATUS_COLOR[x.s] }}>
                <p className="font-semibold">{x.h}</p><p>{x.s.slice(0, 3)}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-slate-600">Kehadiran minggu ini: <b>{hist(sel).filter((x) => ["Hadir", "Terlambat"].includes(x.s)).length}/7 hari</b></p>
        </Modal>
      )}
    </div>
  );
}

export function Dashboard({ role, go }) {
  const tc = (s) => D.TIKET.filter((t) => t.status === s).length;
  const tot = iplTot();
  const tiket = TS.map((s, i) => ({ label: s, value: tc(s), color: TC[i] }));
  const sec = <Trend points={D.HARI.map((l, i) => ({ label: l, value: D.TREND_SEC[i] }))} unit=" org" />;
  const cln = <Trend points={D.HARI.map((l, i) => ({ label: l, value: D.TREND_CLN[i] }))} unit=" org" color="#2E86C1" />;
  const P = {
    sec: <Panel key="s" title="Kehadiran security 7 hari" hint="Jumlah security hadir per hari dari 15 orang. Sentuh titik untuk detail.">{sec}</Panel>,
    cln: <Panel key="c" title="Kehadiran kebersihan 7 hari" hint="Jumlah petugas hadir per hari dari 9 orang.">{cln}</Panel>,
    tkt: <Panel key="t" title="Pengaduan per status" hint="Klik batang untuk membuka daftar pengaduan."><Bars data={tiket} onPick={() => go("tiket")} /></Panel>,
    ipl: <Panel key="i" title="Komposisi IPL" hint="Seluruh RW 29 dan RW 31. Arahkan ke irisan untuk persentase."><Donut data={iplData(tot)} center="rumah" /></Panel>,
    tren: <Panel key="it" title="Tren IPL lunas (%)" hint="Persentase rumah yang sudah lunas tiap bulan."><Trend points={D.IPL_TREND} unit="%" /></Panel>,
    don: <Panel key="d" title="Donasi per jenis" hint="Total nominal tiap kategori."><Donut data={sumBy(D.DONASI)} center="Rupiah" /></Panel>,
    tamu: <Panel key="tm" title="Tamu per jam" hint="Jam kunjungan paling ramai hari ini (data contoh)."><Bars data={[["07–09", 2], ["09–12", 3], ["12–15", 1], ["15–18", 4], ["18–21", 2]].map(([label, value]) => ({ label, value }))} unit=" tamu" /></Panel>,
  };
  const K = {
    rw: [["Hadir hari ini", 31, "security", "Security + kebersihan"], ["Tiket terbuka", tc("Open"), "tiket", "Belum ditangani"], ["Tamu hari ini", 6, "tamu", "Termasuk yang keluar"], ["Tunggakan IPL", tot.menunggak, "ipl", "Rumah belum bayar"]],
    keamanan: [["Security hadir", 12, "security", "Dari 15 orang"], ["Tamu hari ini", 6, "tamu", "Lihat daftar"], ["Patroli selesai", "3/4", "peta", "Lihat titik di peta"], ["Tiket terbuka", tc("Open"), "tiket", "Belum ditangani"]],
    kebersihan: [["Petugas hadir", 8, "kebersihan", "Dari 9 orang"], ["Area bersih", "2/2", "peta", "RW 29 dan RW 31"], ["Tiket terbuka", tc("Open"), "tiket", "Belum ditangani"], ["Pengumuman", 2, "info", "Lihat info"]],
    bendahara: [["IPL lunas", tot.lunas, "ipl", "Rumah"], ["Terlambat", tot.terlambat, "ipl", "Rumah"], ["Menunggak", tot.menunggak, "ipl", "Rumah"], ["Donasi", rupiah(D.DONASI.reduce((a, d) => a + d.nominal, 0)), "donasi", "Total tercatat"]],
  }[role];
  const panels = { rw: ["sec", "ipl", "tkt", "tren"], keamanan: ["sec", "tamu", "tkt"], kebersihan: ["cln", "tkt"], bendahara: ["tren", "ipl", "don"] }[role];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{K.map(([l, v, p, h]) => <Stat key={l} label={l} value={v} hint={h} onClick={() => go(p)} />)}</div>
      <div className="grid gap-4 md:grid-cols-2">{panels.map((p) => P[p])}</div>
    </div>
  );
}

const NEXT = { Open: "On Progress", "On Progress": "Selesai" };
export function Tiket({ role }) {
  const [list, setList] = useState(D.TIKET);
  const [judul, setJudul] = useState("");
  const [f, setF] = useState("Semua");
  const [sel, setSel] = useState(null);
  const t = list.find((x) => x.id === sel);
  const det = t && (D.TIKET_DETAIL[t.id] || { lokasi: "Perumahan", tgl: "Hari ini", desk: `Laporan baru dari ${t.pelapor}.` });
  const adv = (id) => setList(list.map((x) => (x.id === id ? { ...x, status: NEXT[x.status] } : x)));
  const shown = list.filter((x) => f === "Semua" || x.status === f);
  return (
    <div className="space-y-4">
      <Panel title="Ringkasan" hint="Klik batang atau tombol untuk memfilter daftar. Status berubah Open, On Progress, lalu Selesai.">
        <Bars data={TS.map((s, i) => ({ label: s, value: list.filter((x) => x.status === s).length, color: TC[i] }))} onPick={(d) => setF(d.label)} />
      </Panel>
      <form className="card flex gap-2" onSubmit={(e) => { e.preventDefault(); if (judul) { setList([{ id: Date.now(), judul, pelapor: D.ROLES[role].label, status: "Open" }, ...list]); setJudul(""); } }}>
        <input className="input" placeholder="Tulis laporan baru" aria-label="Laporan baru" value={judul} onChange={(e) => setJudul(e.target.value)} />
        <button className="btn">Kirim</button>
      </form>
      <div className="flex flex-wrap gap-2">{["Semua", ...TS].map((s) => <Chip key={s} on={f === s} onClick={() => setF(s)}>{s}</Chip>)}</div>
      <ul className="space-y-2">
        {shown.map((x) => (
          <li key={x.id} className="card flex items-center justify-between gap-3">
            <button className="flex-1 text-left text-sm" onClick={() => setSel(x.id)}><p className="font-semibold">{x.judul}</p><p className="text-slate-500">{x.pelapor} · ketuk untuk detail</p></button>
            <span className="rounded-full px-2 py-1 text-xs font-semibold text-white" style={{ background: TC[TS.indexOf(x.status)] }}>{x.status}</span>
          </li>
        ))}
      </ul>
      {t && (
        <Modal title={t.judul} onClose={() => setSel(null)}>
          <p className="text-sm text-slate-600">{det.desk}</p>
          <p className="mt-2 text-sm">Lokasi: <b>{det.lokasi}</b> · Dilaporkan {det.tgl} oleh {t.pelapor}</p>
          <ol className="my-4 flex items-center">
            {TS.map((s, i) => (
              <li key={s} className="flex flex-1 flex-col items-center text-center text-xs">
                <span className="mb-1 h-5 w-5 rounded-full" style={{ background: i <= TS.indexOf(t.status) ? TC[TS.indexOf(t.status)] : "#E2E8F0" }} />{s}
              </li>
            ))}
          </ol>
          {NEXT[t.status] ? <button className="btn w-full" onClick={() => adv(t.id)}>Ubah status ke {NEXT[t.status]}</button> : <p className="text-center text-sm font-semibold text-emerald-700">Pengaduan sudah selesai</p>}
        </Modal>
      )}
    </div>
  );
}

export function Info({ role }) {
  const [list, setList] = useState(D.INFO);
  const [open, setOpen] = useState(null);
  const [f, setF] = useState({ judul: "", isi: "", kat: "Umum" });
  return (
    <div className="space-y-4">
      {role === "rw" && (
        <form className="card grid gap-2" onSubmit={(e) => { e.preventDefault(); if (f.judul) { setList([{ id: Date.now(), ...f }, ...list]); setF({ judul: "", isi: "", kat: "Umum" }); } }}>
          <input className="input" placeholder="Judul pengumuman" aria-label="Judul" value={f.judul} onChange={(e) => setF({ ...f, judul: e.target.value })} />
          <select className="input" aria-label="Kategori" value={f.kat} onChange={(e) => setF({ ...f, kat: e.target.value })}>{["Umum", "Listrik", "Acara", "Keamanan", "Kebersihan"].map((k) => <option key={k}>{k}</option>)}</select>
          <textarea className="input" rows={2} placeholder="Isi pengumuman" aria-label="Isi" value={f.isi} onChange={(e) => setF({ ...f, isi: e.target.value })} />
          <button className="btn">Terbitkan</button>
        </form>
      )}
      {list.map((i) => {
        const m = D.INFO_META[i.id] || { kat: i.kat || "Umum", tgl: "Hari ini" };
        return (
          <article key={i.id} className="card">
            <button className="w-full text-left" onClick={() => setOpen(open === i.id ? null : i.id)} aria-expanded={open === i.id}>
              <span className="mr-2 rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold text-moss">{m.kat}</span><span className="text-xs text-slate-500">{m.tgl}</span>
              <h3 className="mt-1 font-bold text-pine">{i.judul}</h3>
            </button>
            {open === i.id && <p className="mt-2 text-sm text-slate-600">{i.isi || "Tidak ada keterangan tambahan."}</p>}
          </article>
        );
      })}
    </div>
  );
}

export function Ipl() {
  const [rw, setRw] = useState("RW 29");
  const tot = iplTot();
  const tg = D.TUNGGAKAN[rw];
  const sum = tg.reduce((a, t) => a + t.bulan * D.IPL_FEE, 0);
  const pct = Object.entries(D.IPL).map(([k, r]) => ({ label: k, value: Math.round((r.lunas / (r.lunas + r.terlambat + r.menunggak)) * 100), color: k === rw ? "#1F5A43" : "#94A3B8" }));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Lunas" value={tot.lunas} tone="text-emerald-700" hint="Bayar tepat waktu" />
        <Stat label="Terlambat" value={tot.terlambat} tone="text-amber-600" hint="Bayar lewat jatuh tempo" />
        <Stat label="Menunggak" value={tot.menunggak} tone="text-red-600" hint="Belum bayar" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Komposisi seluruh RW" hint="Arahkan ke irisan untuk melihat jumlah dan persentase."><Donut data={iplData(tot)} center="rumah" /></Panel>
        <Panel title="Tren IPL lunas (%)" hint="Persentase rumah lunas per bulan, naik tiap bulan."><Trend points={D.IPL_TREND} unit="%" /></Panel>
      </div>
      <div className="flex gap-2">{Object.keys(D.IPL).map((k) => <Chip key={k} on={rw === k} onClick={() => setRw(k)}>{k}</Chip>)}</div>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title={`Rincian ${rw}`} hint="Pilih RW di atas untuk berganti."><Donut data={iplData(D.IPL[rw])} center="rumah" /></Panel>
        <Panel title="Perbandingan % lunas" hint="RW yang dipilih berwarna hijau. Klik batang untuk berpindah RW."><Bars data={pct} unit="%" max={100} onPick={(d) => setRw(d.label)} /></Panel>
      </div>
      <Panel title={`Daftar tunggakan ${rw}`} hint={`Iuran ${rupiah(D.IPL_FEE)} per bulan. Data contoh.`}>
        <ul className="divide-y divide-slate-100 text-sm">
          {tg.map((t) => <li key={t.rumah} className="flex justify-between py-2"><span>Rumah {t.rumah} · {t.bulan} bulan</span><b className="text-red-600">{rupiah(t.bulan * D.IPL_FEE)}</b></li>)}
        </ul>
        <p className="mt-2 text-right text-sm font-bold">Total: {rupiah(sum)}</p>
      </Panel>
    </div>
  );
}

export function Donasi() {
  const [list, setList] = useState(D.DONASI);
  const [f, setF] = useState({ jenis: "Masjid", nama: "", nominal: "" });
  const [flt, setFlt] = useState("Semua");
  const shown = list.filter((d) => flt === "Semua" || d.jenis === flt);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Stat label="Total donasi tercatat" value={rupiah(list.reduce((a, d) => a + d.nominal, 0))} hint={`${list.length} transaksi`} />
        <Panel title="Donasi per jenis" hint="Klik nama kategori pada filter di bawah untuk melihat riwayatnya."><Donut data={sumBy(list)} center="Rupiah" /></Panel>
      </div>
      <form className="card grid gap-2 sm:grid-cols-3" onSubmit={(e) => { e.preventDefault(); if (f.nama && f.nominal) { setList([{ id: Date.now(), ...f, nominal: +f.nominal }, ...list]); setF({ ...f, nama: "", nominal: "" }); } }}>
        <select className="input" aria-label="Jenis donasi" value={f.jenis} onChange={(e) => setF({ ...f, jenis: e.target.value })}>{JENIS.map(([j]) => <option key={j}>{j}</option>)}</select>
        <input className="input" placeholder="Nama donatur" aria-label="Nama donatur" value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} />
        <input className="input" type="number" placeholder="Nominal (Rp)" aria-label="Nominal" value={f.nominal} onChange={(e) => setF({ ...f, nominal: e.target.value })} />
        <button className="btn sm:col-span-3">Simpan donasi</button>
      </form>
      <div className="flex flex-wrap gap-2">{["Semua", ...JENIS.map(([j]) => j)].map((j) => <Chip key={j} on={flt === j} onClick={() => setFlt(j)}>{j}</Chip>)}</div>
      <ul className="space-y-2">
        {shown.map((d) => (
          <li key={d.id} className="card flex justify-between text-sm"><span><b>{d.jenis}</b> <span className="text-slate-500">· {d.nama}</span></span><span className="font-semibold text-moss">{rupiah(d.nominal)}</span></li>
        ))}
      </ul>
    </div>
  );
}

export function Peta() {
  const [f, setF] = useState("semua");
  const [a, setA] = useState(null);
  const list = D.TITIK.filter((t) => f === "semua" || t.tipe === f);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Chip on={f === "semua"} onClick={() => { setF("semua"); setA(null); }}>Semua</Chip>
        {Object.entries(D.TIPE).map(([k, v]) => <Chip key={k} on={f === k} onClick={() => { setF(k); setA(null); }}>{v.label}</Chip>)}
      </div>
      <MapView filter={f} active={a} />
      <ul className="grid gap-2 sm:grid-cols-2">
        {list.map((t) => (
          <li key={t.nama}>
            <button className="card w-full text-left hover:ring-moss" onClick={() => setA(t.nama)}>
              <span className="mr-2 inline-block h-3 w-3 rounded-full" style={{ background: D.TIPE[t.tipe].color }} /><b className="text-sm">{t.nama}</b>
              <p className="text-xs text-slate-500">{D.TIPE[t.tipe].desc} Ketuk untuk melihat di peta.</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
