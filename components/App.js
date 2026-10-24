"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { NAV, EXTRA, ROLES, PICK_ROLES } from "@/lib/config";
import { Icon, Brand, Badge, Footer, Toasts } from "./ui";
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
import WaIpl from "./modules/WaIpl";

const VIEWS = { dashboard: Dashboard, warga: Warga, tamu: Tamu, keuangan: Keuangan, iplSaya: IPLSaya, waIpl: WaIpl, pengumuman: Pengumuman, absenSecurity: AbsenSecurity, absenKebersihan: AbsenKebersihan, pengaduan: Pengaduan, assetSecurity: AssetSecurity, assetKebersihan: AssetKebersihan, parkir: Parkir, sampah: Sampah, kerusakan: Kerusakan, izin: Izin, kontak: Kontak, ai: AI, export: Export, panel: Panel };
const DESC = { rw: "Ringkasan seluruh komplek", rt: "IPL dan warga per RT", keamanan: "Pos jaga dan keamanan", kebersihan: "Petugas dan lingkungan", bendahara: "IPL dan kas", warga: "Layanan untuk penghuni" };

export default function App() {
  const { ready, session } = useApp();
  if (!ready) return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Memuat data demo…</div>;
  return (<>{session ? (session.role === "pengelola" ? <PanelShell /> : <Shell />) : <Login />}<Toasts /></>);
}

const ROLE_UI = {
  warga: { icon: "users", desc: "Bayar IPL, lapor, dan baca pengumuman" },
  rw: { icon: "building", desc: "Pantau seluruh komplek dalam satu layar" },
  rt: { icon: "home", desc: "IPL dan warga di RT Anda" },
  keamanan: { icon: "shield", desc: "Tamu, parkir, dan serah terima shift" },
  kebersihan: { icon: "broom", desc: "Petugas, sampah, dan lingkungan" },
  bendahara: { icon: "wallet", desc: "IPL, kas, dan laporan keuangan" },
};

function Login() {
  const { login, toast, data } = useApp();
  const enter = (r) => {
    let houseId;
    if (r === "warga") {
      const h = data.rumah.find((x) => x.status === "tinggal" && x.iplStatus === "menunggak") || data.rumah.find((x) => x.status === "tinggal") || data.rumah[0];
      houseId = h ? h.id : "";
    }
    login({ role: r, name: ROLES[r], houseId, rt: r === "rt" ? "29-01" : undefined });
    toast("Masuk sebagai " + ROLES[r]);
  };
  const order = ["warga", ...PICK_ROLES.filter((r) => r !== "warga")];
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-5 pt-5 sm:px-8"><Brand size={40} /></header>
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <section className="fade-up relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy-800 via-navy-700 to-navy-600 p-8 text-white shadow-card sm:p-12 lg:min-h-[520px]">
          <span className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-mint-500/25 blur-3xl" />
          <span className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-mint-200/15 blur-3xl" />
          <div className="relative flex h-full flex-col justify-center">
            <p className="text-sm font-semibold text-mint-200">Selamat datang di</p>
            <h1 className="mt-2 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Pesona<br />Khayangan Juanda</h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/75">Satu tempat untuk iuran, keamanan, kebersihan, dan layanan warga RW 29 dan RW 31. Ini versi demo dengan data contoh, silakan dicoba dengan tenang.</p>
            <ul className="mt-8 flex flex-wrap gap-2.5 text-xs font-semibold">
              {["Bayar IPL mudah", "Lapor cepat", "Info komplek terkini"].map((t) => <li key={t} className="rounded-full bg-white/10 px-3.5 py-1.5 text-white/90 ring-1 ring-inset ring-white/15">{t}</li>)}
            </ul>
          </div>
        </section>
        <section className="fade-up" style={{ animationDelay: ".08s" }}>
          <h2 className="text-2xl font-bold tracking-tight text-navy">Halo! Masuk sebagai siapa hari ini?</h2>
          <p className="mt-1.5 text-sm text-slate-500">Pilih peran untuk mulai mencoba. Tidak perlu password.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {order.map((r) => (
              <button key={r} onClick={() => enter(r)} className={`group flex items-center gap-4 rounded-3xl bg-white p-4 text-left shadow-card ring-1 ring-transparent transition hover:-translate-y-0.5 hover:ring-mint-200 ${r === "warga" ? "sm:col-span-2" : ""}`}>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mint-50 text-mint-700 transition group-hover:bg-mint-500 group-hover:text-white"><Icon n={ROLE_UI[r].icon} className="h-6 w-6" /></span>
                <span className="min-w-0 flex-1"><span className="block text-[15px] font-bold text-navy">{ROLES[r]}</span><span className="mt-0.5 block text-xs leading-snug text-slate-500">{ROLE_UI[r].desc}</span></span>
                <Icon n="chevron" className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-mint-600" />
              </button>
            ))}
          </div>
        </section>
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
        <Brand size={40} />
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
        <button key={m.label} onClick={() => { go(m.id, m.params || {}); setOpen(false); }} className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-sm font-semibold transition ${view === m.id ? "bg-navy text-white shadow-md" : "text-slate-600 hover:bg-mint-50 hover:text-navy"}`}>
          <Icon n={m.icon} className="h-[18px] w-[18px] shrink-0" /><span className="leading-snug">{m.label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 bg-canvas/90 px-4 backdrop-blur sm:px-6">
        <button onClick={() => go("dashboard", {})} aria-label="Ke dashboard"><Brand size={40} /></button>
        <div className="flex items-center gap-3">
          <Badge tone="green">{ROLES[role]}</Badge>
          <button onClick={logout} className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-navy shadow-card hover:bg-slate-50"><Icon n="logout" className="h-4 w-4" />Keluar</button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-navy-900/40" />
          <aside className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-canvas shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 pt-4"><Brand size={36} /><button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white" aria-label="Tutup menu"><Icon n="x" /></button></div>
            <Nav list={items} />
          </aside>
        </div>
      )}

      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 overflow-y-auto py-2 pl-6 lg:block"><div className="rounded-3xl bg-white p-2 shadow-card"><Nav list={items} /></div></aside>
        <div className="flex min-h-[calc(100vh-4rem)] min-w-0 flex-1 flex-col pb-16 lg:pb-0">
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-6 pt-2 sm:px-6 lg:px-8"><div className="fade-up"><View key={view + JSON.stringify(nav.params)} params={nav.params} /></div></main>
          <Footer />
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex rounded-t-3xl border-t border-slate-100 bg-white/95 shadow-[0_-8px_24px_-12px_rgba(18,41,74,.18)] pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Navigasi utama">
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
