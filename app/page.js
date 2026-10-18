"use client";
import { useState } from "react";
import * as D from "@/lib/data";

import { Attendance, Dashboard, Tiket, Ipl, Donasi, Info, Peta } from "@/components/Pages";

function Tamu() {
  const [list, setList] = useState(D.TAMU);
  const [f, setF] = useState({ nama: "", plat: "", tujuan: "", rumah: "" });
  const add = (e) => {
    e.preventDefault();
    if (!f.nama) return;
    setList([{ id: Date.now(), ...f, keluar: false }, ...list]);
    setF({ nama: "", plat: "", tujuan: "", rumah: "" });
  };
  return (
    <div className="space-y-4">
      <form onSubmit={add} className="card grid gap-2 sm:grid-cols-2">
        {[["nama", "Nama tamu"], ["plat", "Plat nomor"], ["tujuan", "Tujuan"], ["rumah", "Rumah tujuan"]].map(([k, p]) => (
          <input key={k} className="input" placeholder={p} aria-label={p} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
        ))}
        <button className="btn sm:col-span-2">Tambah tamu</button>
      </form>
      <ul className="space-y-2">
        {list.map((t) => (
          <li key={t.id} className="card flex items-center justify-between gap-3">
            <div className="text-sm">
              <p className="font-semibold">{t.nama} <span className="font-normal text-slate-500">· {t.plat}</span></p>
              <p className="text-slate-500">{t.tujuan}, rumah {t.rumah}</p>
            </div>
            {t.keluar ? <span className="text-xs text-slate-500">Sudah keluar</span> : (
              <button className="btn-ghost" onClick={() => setList(list.map((x) => (x.id === t.id ? { ...x, keluar: true } : x)))}>Sudah keluar</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Panic() {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <button onClick={() => alert("Notifikasi darurat telah dikirim ke semua petugas")} className="h-56 w-56 rounded-full bg-red-600 text-2xl font-extrabold text-white shadow-xl ring-8 ring-red-200 active:scale-95">PANIC</button>
      <p className="text-sm text-slate-500">Tekan hanya saat keadaan darurat.</p>
    </div>
  );
}

export default function Home() {
  const [role, setRole] = useState(null);
  const [page, setPage] = useState("dashboard");

  if (!role) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
        <div className="text-center">
          <img src="/logo.png" alt="Logo Pesona Khayangan Juanda" className="mx-auto h-40 w-auto" />
          <h1 className="sr-only">Pesona Khayangan Juanda</h1>
          <p className="mt-2 text-slate-600">Demo manajemen perumahan. Pilih peran untuk masuk.</p>
        </div>
        <div className="grid gap-3">
          {Object.entries(D.ROLES).map(([id, r]) => (
            <button key={id} onClick={() => { setRole(id); setPage("dashboard"); }} className="card text-left hover:ring-moss focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass">
              <p className="font-bold text-pine">{r.label}</p>
              <p className="text-sm text-slate-500">{r.desc}</p>
            </button>
          ))}
        </div>
      </main>
    );
  }

  const menus = D.MENUS.filter((m) => m.roles.includes(role));
  const views = {
    dashboard: <Dashboard role={role} go={setPage} />,
    security: <Attendance groups={D.SECURITY} shifts={D.SHIFT_SEC} trend={D.TREND_SEC} total={15} />,
    kebersihan: <Attendance groups={D.KEBERSIHAN} shifts={D.SHIFT_CLN} trend={D.TREND_CLN} total={9} />,
    tamu: <Tamu />,
    tiket: <Tiket role={role} />,
    panic: <Panic />,
    info: <Info role={role} />,
    ipl: <Ipl />,
    donasi: <Donasi />,
    peta: <Peta />,
  };

  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-pine text-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0">
        <div className="flex items-center justify-between p-4 md:block">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo Pesona Khayangan Juanda" className="h-12 w-12 rounded-lg bg-white object-cover object-top p-0.5" />
            <div>
              <p className="font-extrabold leading-tight">Pesona Khayangan</p>
              <p className="text-xs text-white/70">{D.ROLES[role].label}</p>
            </div>
          </div>
          <button onClick={() => setRole(null)} className="text-xs underline md:mt-3">Ganti peran</button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:overflow-visible">
          {menus.map((m) => (
            <button key={m.id} onClick={() => setPage(m.id)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium ${page === m.id ? "bg-white text-pine" : "text-white/85 hover:bg-white/10"}`}>
              {m.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="mx-auto w-full max-w-4xl p-4 md:p-8">
        <h2 className="mb-4 text-xl font-extrabold text-pine">{menus.find((m) => m.id === page)?.label}</h2>
        {views[page]}
      </main>
    </div>
  );
}
