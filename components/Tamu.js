"use client";
import { useState } from "react";
import * as D from "@/lib/data";
import { Stat, Modal, Hint, Bars, ExportBtn } from "./Charts";
import { Ktp, Kendaraan } from "./Photos";
import DateRange, { inRange, ALL } from "./DateRange";

export const nowHM = () => new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":");
const mins = (a) => { const [h, m] = a.split(":").map(Number); return h * 60 + m; };
const dur = (t) => { let d = mins(t.keluar || nowHM()) - mins(t.masuk); if (d < 0) d += 1440; return d >= 60 ? `${Math.floor(d / 60)} jam ${d % 60} menit` : `${d} menit`; };
const tglLabel = (s) => (s === D.TODAY ? "Hari ini" : new Date(s + "T00:00").toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" }));
const EMPTY = { nama: "", plat: "", jenis: D.JENIS_KENDARAAN[0], rumah: "", warga: "", catatan: "", ktp: false, foto: false };

export default function Tamu({ S }) {
  const { tamu, setTamu } = S;
  const [tab, setTab] = useState("dalam"), [jf, setJf] = useState("Semua"), [q, setQ] = useState(""), [sel, setSel] = useState(null), [f, setF] = useState(EMPTY), [rg, setRg] = useState(ALL), [view, setView] = useState("kartu");
  const ok = f.nama && f.plat && f.rumah && f.warga && f.ktp && f.foto;
  const keluar = (id) => setTamu(tamu.map((t) => (t.id === id ? { ...t, keluar: nowHM() } : t)));
  const add = (e) => {
    e.preventDefault();
    if (!ok) return;
    setTamu([{ ...f, id: Date.now(), nik: "35150" + String(Date.now()).slice(-11), tgl: D.TODAY, masuk: nowHM(), keluar: null }, ...tamu]);
    setF(EMPTY); setTab("dalam");
  };
  const list = (tab === "dalam" ? tamu.filter((t) => !t.keluar) : tamu).filter((t) => (t.nama + t.plat).toLowerCase().includes(q.toLowerCase()) && (jf === "Semua" || t.jenis === jf) && inRange(t.tgl, rg));
  const t = tamu.find((x) => x.id === sel);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="space-y-5">
      <section>
        <h3 className="mb-2 font-bold text-pine">Statistik minggu ini</h3>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {D.JENIS_KENDARAAN.map((j) => <Stat key={j} label={j} value={tamu.filter((x) => x.jenis === j).length} hint="Ketuk untuk lihat daftar" onClick={() => { setJf(j); setTab("riwayat"); }} />)}
        </div>
        <div className="card mt-3"><Bars unit=" kendaraan" data={D.JENIS_KENDARAAN.map((j, i) => ({ label: j, value: tamu.filter((x) => x.jenis === j).length, color: ["#0B2545", "#4A7FC1", "#2FA37A", "#E0A526"][i] }))} /></div>
      </section>
      <form onSubmit={add} className="card grid gap-3 sm:grid-cols-2">
        <h3 className="font-bold text-pine sm:col-span-2">Kendaraan masuk <span className="text-xs font-normal text-slate-400">· jam masuk otomatis {nowHM()}</span></h3>
        <input className="input" placeholder="Nama tamu / driver *" aria-label="Nama" value={f.nama} onChange={set("nama")} />
        <input className="input" placeholder="Nomor polisi *" aria-label="Plat" value={f.plat} onChange={set("plat")} />
        <select className="input" aria-label="Jenis kendaraan" value={f.jenis} onChange={set("jenis")}>{D.JENIS_KENDARAAN.map((j) => <option key={j}>{j}</option>)}</select>
        <div className="grid grid-cols-2 gap-2"><input className="input" placeholder="No. rumah *" aria-label="Rumah" value={f.rumah} onChange={set("rumah")} /><input className="input" placeholder="Nama warga *" aria-label="Warga" value={f.warga} onChange={set("warga")} /></div>
        <button type="button" onClick={() => setF({ ...f, ktp: !f.ktp })} className={`btn-ghost ${f.ktp ? "!bg-emerald-50 !text-emerald-700" : ""}`}>{f.ktp ? "Foto KTP/SIM terambil" : "Ambil foto KTP/SIM *"}</button>
        <button type="button" onClick={() => setF({ ...f, foto: !f.foto })} className={`btn-ghost ${f.foto ? "!bg-emerald-50 !text-emerald-700" : ""}`}>{f.foto ? "Foto kendaraan terambil" : "Ambil foto kendaraan *"}</button>
        {f.ktp && f.foto && f.nama && f.plat && <div className="grid grid-cols-2 gap-2 sm:col-span-2"><Ktp nama={f.nama} nik="3515000000000000" /><Kendaraan jenis={f.jenis} plat={f.plat} /></div>}
        <input className="input sm:col-span-2" placeholder="Catatan (opsional)" aria-label="Catatan" value={f.catatan} onChange={set("catatan")} />
        <button className="btn sm:col-span-2" disabled={!ok}>Catat kendaraan masuk</button>
        {!ok && <p className="text-xs text-slate-400 sm:col-span-2">Lengkapi semua kolom bertanda * dan kedua foto. Foto diambil secara simulasi.</p>}
      </form>
      <div className="flex flex-wrap items-center gap-2">
        {[["dalam", `Sedang di dalam (${tamu.filter((x) => !x.keluar).length})`], ["riwayat", "Riwayat"]].map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === k ? "bg-moss text-white" : "bg-mist text-moss"}`}>{l}</button>)}
        <select className="input !w-auto" aria-label="Filter jenis" value={jf} onChange={(e) => setJf(e.target.value)}>{["Semua", ...D.JENIS_KENDARAAN].map((j) => <option key={j}>{j}</option>)}</select>
        <DateRange value={rg} onChange={setRg} />
        <input className="input !w-auto flex-1" placeholder="Cari nama atau plat" aria-label="Cari" value={q} onChange={(e) => setQ(e.target.value)} />
        {["kartu", "tabel"].map((v) => <button key={v} onClick={() => setView(v)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${view === v ? "bg-moss text-white" : "bg-mist text-moss"}`}>{v === "kartu" ? "Kartu" : "Tabel"}</button>)}
        <ExportBtn name="tamu-kendaraan" rows={list.map((t) => ({ Plat: t.plat, Identifikasi: t.nik, Jenis: t.jenis, Tujuan: `${t.rumah} ${t.warga}`, Tanggal: t.tgl, Masuk: t.masuk, Keluar: t.keluar || "" }))} />
      </div>
      {view === "tabel" && (
        <div className="card overflow-x-auto !p-3"><table className="w-full text-sm"><thead><tr className="text-left text-xs text-slate-400"><th className="py-1">Plat</th><th>Identifikasi</th><th>Jenis</th><th>Tujuan</th><th>Waktu</th><th>Foto</th></tr></thead><tbody>{list.map((x) => <tr key={x.id} className="border-t border-slate-100"><td className="py-2 font-semibold">{x.plat}</td><td>{x.nik}</td><td>{x.jenis}</td><td>{x.rumah}, {x.warga}</td><td>{tglLabel(x.tgl)} {x.masuk}{x.keluar ? `–${x.keluar}` : ""}</td><td><button aria-label={`Foto ${x.nama}`} onClick={() => setSel(x.id)} className="rounded-full bg-mist px-3 py-1 text-moss">🪪</button></td></tr>)}</tbody></table></div>
      )}
      <ul className={`space-y-2 ${view === "tabel" ? "hidden" : ""}`}>
        {list.length === 0 && <li className="text-sm text-slate-400">Tidak ada data.</li>}
        {list.map((x) => (
          <li key={x.id} className="card flex items-center gap-3 !p-3">
            <button className="flex flex-1 items-center gap-3 text-left" onClick={() => setSel(x.id)}>
              <div className="w-20 shrink-0"><Kendaraan jenis={x.jenis} plat={x.plat} /></div>
              <div className="text-sm"><p className="font-semibold text-pine">{x.nama} <span className="font-normal text-slate-400">· {x.plat}</span></p><p className="text-slate-500">{x.jenis} → {x.rumah} {x.warga}</p><p className="text-xs text-slate-400">{tglLabel(x.tgl)} · {x.masuk}{x.keluar ? ` – ${x.keluar}` : ""}</p></div>
            </button>
            {x.keluar ? <span className="text-xs text-slate-400">Keluar</span> : <button className="btn" onClick={() => keluar(x.id)}>Keluar</button>}
          </li>
        ))}
      </ul>
      <Hint><p>Ketuk data tamu untuk melihat foto KTP, foto kendaraan, dan durasi di dalam komplek.</p></Hint>
      {t && (
        <Modal title={t.nama} onClose={() => setSel(null)}>
          <div className="grid grid-cols-2 gap-2"><Ktp nama={t.nama} nik={t.nik} /><Kendaraan jenis={t.jenis} plat={t.plat} /></div>
          <dl className="mt-3 space-y-1 text-sm">
            <p><b>{t.jenis}</b> · {t.plat}</p><p>Tujuan: rumah {t.rumah}, {t.warga}</p>
            <p>Masuk: {tglLabel(t.tgl)} {t.masuk} · Keluar: {t.keluar || "masih di dalam"}</p>
            <p>Durasi di dalam: <b>{dur(t)}</b></p>{t.catatan && <p>Catatan: {t.catatan}</p>}
          </dl>
          {!t.keluar && <button className="btn mt-4 w-full" onClick={() => keluar(t.id)}>Keluar</button>}
        </Modal>
      )}
    </div>
  );
}
