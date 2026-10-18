"use client";
import { useState } from "react";
import * as D from "@/lib/data";
import { Stat, Modal, Hint, Donut, Bars, ExportBtn, rupiah } from "./Charts";
import DateRange, { inRange, ALL, bulanIni } from "./DateRange";

const Chip = ({ on, ...p }) => <button {...p} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${on ? "bg-moss text-white" : "bg-mist text-moss"}`} />;
const monthLabel = (k) => D.BULAN[+k.slice(5) - 1] + " " + k.slice(0, 4);
const monthly = (exp) => { const m = { ...D.EXP_OLD }; exp.forEach((e) => { const k = e.tgl.slice(0, 7); if (!D.EXP_OLD[k]) m[k] = (m[k] || 0) + e.nominal; }); return Object.entries(m).sort().slice(-6); };

export default function Keuangan({ S, tab0 = "ipl" }) {
  const [tab, setTab] = useState(tab0);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">{[["ipl", "IPL"], ["pengeluaran", "Pengeluaran"], ["neraca", "Neraca & Kas"], ["donasi", "Donasi"]].map(([k, l]) => <Chip key={k} on={tab === k} onClick={() => setTab(k)}>{l}</Chip>)}</div>
      {tab === "ipl" && <Ipl />}
      {tab === "pengeluaran" && <Pengeluaran S={S} />}
      {tab === "neraca" && <Neraca S={S} />}
      {tab === "donasi" && <Donasi S={S} />}
    </div>
  );
}

function Ipl() {
  const [rw, setRw] = useState("Semua"), [open, setOpen] = useState(false);
  const rows = rw === "Semua" ? Object.values(D.IPL) : [D.IPL[rw]];
  const t = rows.reduce((a, r) => ({ lunas: a.lunas + r.lunas, terlambat: a.terlambat + r.terlambat, menunggak: a.menunggak + r.menunggak }), { lunas: 0, terlambat: 0, menunggak: 0 });
  const list = (rw === "Semua" ? Object.entries(D.TUNGGAKAN).flatMap(([k, v]) => v.map((x) => [...x, k])) : D.TUNGGAKAN[rw].map((x) => [...x, rw]));
  return (
    <div className="space-y-4">
      <div className="flex gap-2">{["Semua", "RW 29", "RW 31"].map((k) => <Chip key={k} on={rw === k} onClick={() => setRw(k)}>{k}</Chip>)}</div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total rumah" value={t.lunas + t.terlambat + t.menunggak} hint="Seluruh unit" />
        <Stat label="Sudah bayar" value={t.lunas} color={D.C.ok} hint="Tepat waktu" />
        <Stat label="Terlambat" value={t.terlambat} color={D.C.warn} hint="Lewat jatuh tempo" />
        <Stat label="Menunggak" value={t.menunggak} color={D.C.bad} hint="Ketuk untuk lihat daftar" onClick={() => setOpen(true)} />
      </div>
      <div className="card"><Donut center="rumah" data={[{ label: "Sudah bayar", value: t.lunas, color: D.C.ok }, { label: "Terlambat", value: t.terlambat, color: D.C.warn }, { label: "Menunggak", value: t.menunggak, color: D.C.bad }]} /></div>
      {open && (
        <Modal title={`Rumah menunggak · ${rw}`} onClose={() => setOpen(false)}>
          <ul className="divide-y divide-slate-100 text-sm">
            {list.map(([r, n, b, k]) => <li key={r} className="flex justify-between py-2"><span><b>{r}</b> {n}<br /><span className="text-xs text-slate-400">{k} · {b} bulan</span></span><b style={{ color: D.C.bad }}>{rupiah(b * D.IPL_FEE)}</b></li>)}
          </ul>
          <p className="mt-3 text-right text-sm font-bold">Total contoh: {rupiah(list.reduce((a, x) => a + x[2] * D.IPL_FEE, 0))}</p>
          <p className="text-xs text-slate-400">Menampilkan {list.length} rumah contoh dari {t.menunggak} yang menunggak. Iuran {rupiah(D.IPL_FEE)} per bulan.</p>
        </Modal>
      )}
    </div>
  );
}

function Pengeluaran({ S }) {
  const { exp, setExp } = S;
  const [rg, setRg] = useState(bulanIni());
  const shown = exp.filter((e) => inRange(e.tgl, rg));
  const [f, setF] = useState({ tgl: D.TODAY, kat: D.KAT_EXP[0], ket: "", nominal: "" });
  const sum = (k) => exp.filter((e) => e.tgl.startsWith(k)).reduce((a, e) => a + e.nominal, 0);
  const add = (e) => { e.preventDefault(); if (!f.ket || !f.nominal) return; setExp([{ id: Date.now(), ...f, nominal: +f.nominal }, ...exp]); if (!inRange(f.tgl, rg)) setRg(ALL); setF({ ...f, ket: "", nominal: "" }); };
  const data = monthly(exp).map(([k, v]) => ({ label: D.BULAN[+k.slice(5) - 1], value: Math.round(v / 1e6), color: k === D.THIS_MONTH ? D.C.navy : "#CBD5E1" }));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3"><Stat label="Pengeluaran bulan ini" value={rupiah(sum("2026-10"))} /><Stat label="Bulan lalu" value={rupiah(sum("2026-09"))} /></div>
      <div className="card"><h3 className="mb-2 font-bold text-pine">6 bulan terakhir (juta rupiah)</h3><Bars data={data} unit=" jt" /></div>
      <form onSubmit={add} className="card grid gap-2 sm:grid-cols-2">
        <input type="date" className="input" aria-label="Tanggal" value={f.tgl} onChange={(e) => setF({ ...f, tgl: e.target.value })} />
        <select className="input" aria-label="Kategori" value={f.kat} onChange={(e) => setF({ ...f, kat: e.target.value })}>{D.KAT_EXP.map((k) => <option key={k}>{k}</option>)}</select>
        <input className="input" placeholder="Keterangan" aria-label="Keterangan" value={f.ket} onChange={(e) => setF({ ...f, ket: e.target.value })} />
        <input className="input" type="number" placeholder="Nominal (Rp)" aria-label="Nominal" value={f.nominal} onChange={(e) => setF({ ...f, nominal: e.target.value })} />
        <button className="btn sm:col-span-2">Simpan pengeluaran</button>
      </form>
      <div className="flex flex-wrap items-center gap-2"><DateRange value={rg} onChange={setRg} /><ExportBtn name="pengeluaran" rows={shown.map((e) => ({ Tanggal: e.tgl, Kategori: e.kat, Keterangan: e.ket, Nominal: e.nominal }))} /></div>
      <p className="text-sm text-slate-500">{shown.length} transaksi · total <b className="text-pine">{rupiah(shown.reduce((a, e) => a + e.nominal, 0))}</b></p>
      <ul className="space-y-2">{[...shown].sort((x, y) => y.tgl.localeCompare(x.tgl)).map((e) => <li key={e.id} className="card flex justify-between !p-3 text-sm"><span><b>{e.kat}</b><br /><span className="text-slate-500">{e.ket} · {e.tgl.slice(8)} {D.BULAN[+e.tgl.slice(5, 7) - 1]}</span></span><b>{rupiah(e.nominal)}</b></li>)}</ul>
    </div>
  );
}

function Neraca({ S }) {
  const k = D.kas(S.exp, S.don), tn = D.TONE[k.tone], pct = Math.min(100, (k.saldo / (D.MIN_KAS * 3)) * 100);
  const Row = ({ l, v, c }) => <div className="flex justify-between py-2 text-sm"><span className="text-slate-500">{l}</span><b style={{ color: c }}>{v}</b></div>;
  return (
    <div className="space-y-4">
      <div className="card" style={{ background: tn.bg }}>
        <p className="text-sm text-slate-600">Saldo kas saat ini</p>
        <p className="text-3xl font-extrabold" style={{ color: tn.c }}>{rupiah(k.saldo)}</p>
        <p className="text-sm font-semibold" style={{ color: tn.c }}>{tn.t}</p>
        <div className="relative mt-3 h-3 rounded-full bg-white"><div className="h-3 rounded-full" style={{ width: pct + "%", background: tn.c }} /><span className="absolute top-[-4px] h-5 w-0.5 bg-slate-500" style={{ left: "33.3%" }} title="Batas minimum" /></div>
        <p className="mt-1 text-xs text-slate-500">Garis = batas minimum {rupiah(D.MIN_KAS)}</p>
      </div>
      <div className="card divide-y divide-slate-100">
        <Row l="Saldo awal bulan" v={rupiah(D.SALDO_AWAL)} />
        <Row l="Pemasukan IPL" v={"+ " + rupiah(D.IPL_MASUK)} c={D.C.ok} />
        <Row l="Pemasukan donasi" v={"+ " + rupiah(k.dn)} c={D.C.ok} />
        <Row l="Pengeluaran bulan ini" v={"− " + rupiah(k.keluar)} c={D.C.bad} />
        <Row l="Cadangan kas pengurus" v={rupiah(D.CADANGAN)} />
        <Row l="Batas minimum kas" v={rupiah(D.MIN_KAS)} />
      </div>
      <Hint><p>Hijau: saldo di atas 1,5 kali batas minimum. Kuning: di antara batas minimum dan 1,5 kali. Merah: di bawah batas minimum. Coba tambah pengeluaran besar untuk melihat warna berubah.</p></Hint>
    </div>
  );
}

function Donasi({ S }) {
  const { don, setDon } = S;
  const [rg, setRg] = useState(ALL);
  const shown = don.filter((d) => inRange(d.tgl, rg));
  const [f, setF] = useState({ jenis: D.JENIS_DON[0], nama: "", nominal: "" });
  const cols = [D.C.ok, "#64748B", D.C.warn, D.C.info];
  return (
    <div className="space-y-4">
      <DateRange value={rg} onChange={setRg} />
      <div className="card"><Donut center="Rupiah" data={D.JENIS_DON.map((j, i) => ({ label: j, color: cols[i], value: shown.filter((d) => d.jenis === j).reduce((a, d) => a + d.nominal, 0) })).filter((d) => d.value)} /></div>
      <form className="card grid gap-2 sm:grid-cols-3" onSubmit={(e) => { e.preventDefault(); if (f.nama && f.nominal) { setDon([{ id: Date.now(), tgl: D.TODAY, ...f, nominal: +f.nominal }, ...don]); setF({ ...f, nama: "", nominal: "" }); } }}>
        <select className="input" aria-label="Jenis" value={f.jenis} onChange={(e) => setF({ ...f, jenis: e.target.value })}>{D.JENIS_DON.map((j) => <option key={j}>{j}</option>)}</select>
        <input className="input" placeholder="Nama donatur" aria-label="Donatur" value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} />
        <input className="input" type="number" placeholder="Nominal (Rp)" aria-label="Nominal" value={f.nominal} onChange={(e) => setF({ ...f, nominal: e.target.value })} />
        <button className="btn sm:col-span-3">Simpan donasi</button>
      </form>
      <ul className="space-y-2">{shown.map((d) => <li key={d.id} className="card flex justify-between !p-3 text-sm"><span><b>{d.jenis}</b> · {d.nama} <span className="text-xs text-slate-400">· {d.tgl.slice(8)}/{d.tgl.slice(5, 7)}</span></span><b>{rupiah(d.nominal)}</b></li>)}</ul>
    </div>
  );
}
