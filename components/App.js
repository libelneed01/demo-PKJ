"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { NAV, EXTRA, ROLES, PICK_ROLES } from "@/lib/config";
import { Icon, Logo, Badge, Footer, Toasts } from "./ui";
import Dashboard from "./modules/Dashboard";
import Warga from "./modules/Warga";
import Tamu from "./modules/Tamu";
import Keuangan, { IPLSaya } from "./modules/Keuangan";
import Pengumuman from "./modules/Pengumuman";
import { AbsenSecurity, AbsenKebersihan } from "./modules/Absensi";
import { Pengaduan, Kerusakan, Sampah } from "./modules/Laporan";
import { AssetSecurity, AssetKebersihan } from "./modules/Asset";
import Parkir from "./modules/Parkir";
import Izin from "./modules/Izin";
import Kontak from "./modules/Kontak";
import AI from "./modules/AI";
import Export from "./modules/Export";
import Panel from "./modules/Panel";

const VIEWS = { dashboard: Dashboard, warga: Warga, tamu: Tamu, keuangan: Keuangan, iplSaya: IPLSaya, pengumuman: Pengumuman, absenSecurity: AbsenSecurity, absenKebersihan: AbsenKebersihan, pengaduan: Pengaduan, assetSecurity: AssetSecurity, assetKebersihan: AssetKebersihan, parkir: Parkir, sampah: Sampah, kerusakan: Kerusakan, izin: Izin, kontak: Kontak, ai: AI, export: Export, panel: Panel };
const DESC = { rw: "Ringkasan seluruh komplek", keamanan: "Pos jaga dan keamanan", kebersihan: "Petugas dan lingkungan", bendahara: "IPL dan kas", warga: "Layanan untuk penghuni" };

export default function App() {
  const { ready, session } = useApp();
  if (!ready) return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Memuat data demo…</div>;
  return (<>{session ? (session.role === "pengelola" ? <PanelShell /> : <Shell />) : <Login />}<Toasts /></>);
}

function Login() {
  const { login, toast, data } = useApp();
  const enter = (r) => {
    let houseId;
    if (r === "warga") {
      const h = data.rumah.find((x) => x.status === "tinggal" && x.iplStatus === "menunggak") || data.rumah.find((x) => x.status === "tinggal") || data.rumah[0];
      houseId = h ? h.id : "";
    }
    login({ role: r, name: ROLES[r], houseId });
    toast("Masuk sebagai " + ROLES[r]);
  };
  return (
    <div className="flex min-h-screen flex-col">
      <div className="px-5 pt-5 sm:px-8"><div className="flex items-center gap-2.5"><Logo size={44} /><span className="text-sm font-bold text-navy">Pesona Khayangan Juanda</span></div></div>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-8">
        <div className="mb-5"><Logo size={104} /></div>
        <h1 className="text-3xl font-bold tracking-tight text-navy">Selamat datang</h1>
        <p className="mt-2 text-sm text-slate-500">Pilih peran untuk mencoba prototype pengelolaan komplek RW 29 dan RW 31. Semua data adalah data contoh.</p>
        <div className="mt-7 space-y-3">
          {PICK_ROLES.map((r) => (
            <button key={r} onClick={() => enter(r)} className="flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4 text-left shadow-card transition hover:-translate-y-0.5 hover:ring-2 hover:ring-mint-200">
              <span><span className="block text-sm font-bold text-navy">{ROLES[r]}</span><span className="block text-xs text-slate-500">{DESC[r]}</span></span>
              <Icon n="chevron" className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PanelShell() {
  const { logout } = useApp();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5"><Logo size={44} /><span className="hidden text-sm font-bold text-navy sm:block">Pesona Khayangan Juanda</span></div>
        <button onClick={logout} className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-navy shadow-card hover:bg-slate-50"><Icon n="logout" className="h-4 w-4" />Keluar</button>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-6 pt-2 sm:px-6"><Panel /></main>
      <Footer />
    </div>
  );
}

function Shell() {
  const { role, nav, go, logout } = useApp();
  const [open, setOpen] = useState(false);
  const items = NAV[role] || [];
  const ids = [...items.map((m) => m.id), ...(EXTRA[role] || [])];
  const view = ids.includes(nav.view) ? nav.view : "dashboard";
  const View = VIEWS[view];
  const bottom = items.slice(0, 4);

  const Nav = ({ list }) => (
    <nav className="space-y-1 p-3">
      {list.map((m) => (
        <button key={m.label} onClick={() => { go(m.id, m.params || {}); setOpen(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${view === m.id ? "bg-navy text-white shadow" : "text-slate-600 hover:bg-white/70"}`}>
          <Icon n={m.icon} className="h-[18px] w-[18px] shrink-0" /><span className="leading-snug">{m.label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 bg-canvas/90 px-4 backdrop-blur sm:px-6">
        <button onClick={() => go("dashboard", {})} className="flex items-center gap-2.5"><Logo size={44} /><span className="hidden text-sm font-bold text-navy sm:block">Pesona Khayangan Juanda</span></button>
        <div className="flex items-center gap-3">
          <Badge tone="green">{ROLES[role]}</Badge>
          <button onClick={logout} className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-navy shadow-card hover:bg-slate-50"><Icon n="logout" className="h-4 w-4" />Keluar</button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-navy-900/40" />
          <aside className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-canvas shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 pt-4"><Logo size={44} /><button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white" aria-label="Tutup menu"><Icon n="x" /></button></div>
            <Nav list={items} />
          </aside>
        </div>
      )}

      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto lg:block"><Nav list={items} /></aside>
        <div className="flex min-h-[calc(100vh-4rem)] min-w-0 flex-1 flex-col pb-16 lg:pb-0">
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-6 pt-2 sm:px-6 lg:px-8"><View key={view + JSON.stringify(nav.params)} params={nav.params} /></main>
          <Footer />
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Navigasi utama">
        {bottom.map((m) => (
          <button key={m.label} onClick={() => go(m.id, m.params || {})} className={`flex flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-semibold ${view === m.id ? "text-navy" : "text-slate-400"}`}>
            <Icon n={m.icon} className="h-5 w-5" /><span className="max-w-full truncate">{m.label.split(" ")[0]}</span>
          </button>
        ))}
        <button onClick={() => setOpen(true)} className="flex flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-semibold text-slate-400"><Icon n="menu" className="h-5 w-5" />Menu</button>
      </nav>
    </div>
  );
}
