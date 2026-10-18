"use client";
import { useState } from "react";
import * as D from "@/lib/data";
import { Dashboard, Absensi, Tiket, Info } from "@/components/Pages";
import Tamu from "@/components/Tamu";
import Keuangan from "@/components/Keuangan";
import { Penghuni, Maintenance, Fasilitas, Keamanan, Laporan } from "@/components/Modules";

export default function Home() {
  const [role, setRole] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [sub, setSub] = useState(null);
  const [tamu, setTamu] = useState(D.TAMU);
  const [exp, setExp] = useState(D.EXP);
  const [don, setDon] = useState(D.DONASI);
  const [info, setInfo] = useState(D.INFO);
  const [tiket, setTiket] = useState(D.ADU);
  const [att, setAtt] = useState(D.ATT0);
  const [wo, setWo] = useState(D.WO);
  const [book, setBook] = useState(D.BOOK);
  const [insiden, setInsiden] = useState(D.INSIDEN);
  const S = { tamu, setTamu, exp, setExp, don, setDon, info, setInfo, tiket, setTiket, att, setAtt, wo, setWo, book, setBook, insiden, setInsiden };
  const go = (p, s = null) => { setPage(p); setSub(s); window.scrollTo(0, 0); };

  if (!role) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
        <div className="text-center">
          <img src="/logo.png" alt="Logo Pesona Khayangan Juanda" className="mx-auto h-40 w-auto" />
          <h1 className="sr-only">Pesona Khayangan Juanda</h1>
          <p className="mt-2 text-slate-500">Pengelolaan komplek perumahan. Pilih peran untuk masuk.</p>
        </div>
        <div className="grid gap-3">
          {Object.entries(D.ROLES).map(([id, r]) => (
            <button key={id} onClick={() => { setRole(id); go("dashboard"); }} className="card text-left transition hover:ring-moss focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass">
              <p className="font-bold text-pine">{r.label}</p><p className="text-sm text-slate-500">{r.desc}</p>
            </button>
          ))}
        </div>
      </main>
    );
  }

  const menus = D.MENUS.filter((m) => m.roles.includes(role));
  const views = {
    dashboard: <Dashboard role={role} go={go} S={S} />,
    tamu: <Tamu S={S} />,
    keuangan: <Keuangan key={sub} S={S} tab0={sub || "ipl"} />,
    info: <Info S={S} role={role} />,
    security: <Absensi S={S} kind="security" />,
    kebersihan: <Absensi S={S} kind="kebersihan" />,
    tiket: <Tiket S={S} role={role} />,
    cctv: <Keamanan S={S} />,
    penghuni: <Penghuni />,
    maintenance: <Maintenance S={S} />,
    fasilitas: <Fasilitas S={S} />,
    laporan: <Laporan S={S} />,
  };
  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-slate-100 bg-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-3 p-4 md:block">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo Pesona Khayangan Juanda" className="h-9 w-9 rounded-lg object-cover object-top" />
            <div><p className="text-sm font-extrabold leading-tight text-pine">Pesona Khayangan</p><p className="text-xs text-slate-400">{D.ROLES[role].label}</p></div>
          </div>
          <button onClick={() => setRole(null)} className="text-xs font-semibold text-moss underline md:mt-3">Ganti peran</button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
          {menus.map((m) => (
            <button key={m.id} onClick={() => go(m.id)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm font-medium transition ${page === m.id ? "bg-moss text-white" : "text-slate-600 hover:bg-mist"}`}>{m.label}</button>
          ))}
        </nav>
      </aside>
      <main className="mx-auto w-full max-w-4xl p-4 md:p-8">
        <h2 className="mb-5 text-2xl font-extrabold text-pine">{menus.find((m) => m.id === page)?.label}</h2>
        {views[page]}
      </main>
    </div>
  );
}
