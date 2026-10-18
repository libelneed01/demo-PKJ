"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import * as D from "@/lib/data";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });
const rupiah = (n) => "Rp " + n.toLocaleString("id-ID");

function Attendance({ groups, title }) {
  const [state, setState] = useState({});
  const set = (k, v) => setState((s) => ({ ...s, [k]: { ...s[k], ...v } }));
  const all = groups.flatMap((g) => g.members);
  const hadir = all.filter((m) => ["Hadir", "Terlambat"].includes(state[m]?.status)).length;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Terdaftar" value={all.length} />
        <Stat label="Hadir" value={hadir} />
        <Stat label="Kehadiran" value={Math.round((hadir / all.length) * 100) + "%"} />
      </div>
      {groups.map((g) => (
        <section key={g.group} className="card">
          <h3 className="mb-3 font-bold text-pine">{g.group}</h3>
          <ul className="divide-y divide-slate-100">
            {g.members.map((m) => {
              const s = state[m] || {};
              return (
                <li key={m} className="flex flex-wrap items-center gap-2 py-2">
                  <span className="min-w-36 flex-1 text-sm font-medium">{m}</span>
                  <select aria-label={`Status ${m}`} className="input !w-auto" value={s.status || ""} onChange={(e) => set(m, { status: e.target.value })}>
                    <option value="">Status…</option>
                    {D.STATUS.map((x) => <option key={x}>{x}</option>)}
                  </select>
                  {s.out ? <span className="text-xs text-slate-500">Pulang {s.out}</span> : s.in ? (
                    <button className="btn-ghost" onClick={() => set(m, { out: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) })}>Check-out</button>
                  ) : (
                    <button className="btn" onClick={() => set(m, { in: true, status: s.status || "Hadir" })}>Check-in</button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className="card">
      <p className={`text-2xl font-extrabold ${tone || "text-pine"}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function Dashboard({ role }) {
  const sets = {
    rw: [["Hadir hari ini", 31], ["Tiket terbuka", 2], ["Tamu hari ini", 6], ["Tunggakan IPL", 70]],
    keamanan: [["Security hadir", 12], ["Tamu hari ini", 6], ["Patroli selesai", "3/4"], ["Tiket terbuka", 1]],
    kebersihan: [["Petugas hadir", 8], ["Area bersih", "2/2"], ["Tiket terbuka", 1], ["Pengumuman", 2]],
    bendahara: [["IPL lunas", 420], ["Terlambat", 110], ["Menunggak", 70], ["Donasi bulan ini", rupiah(6750000)]],
  }[role];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{sets.map(([l, v]) => <Stat key={l} label={l} value={v} />)}</div>
      <div className="card">
        <h3 className="mb-2 font-bold text-pine">Pengumuman terbaru</h3>
        <p className="text-sm">{D.INFO[0].judul}</p>
        <p className="text-sm text-slate-500">{D.INFO[0].isi}</p>
      </div>
    </div>
  );
}

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

const NEXT = { Open: "On Progress", "On Progress": "Selesai" };
function Tiket({ role }) {
  const [list, setList] = useState(D.TIKET);
  const [judul, setJudul] = useState("");
  return (
    <div className="space-y-4">
      <form className="card flex gap-2" onSubmit={(e) => { e.preventDefault(); if (judul) { setList([{ id: Date.now(), judul, pelapor: D.ROLES[role].label, status: "Open" }, ...list]); setJudul(""); } }}>
        <input className="input" placeholder="Tulis laporan baru" aria-label="Laporan baru" value={judul} onChange={(e) => setJudul(e.target.value)} />
        <button className="btn">Kirim</button>
      </form>
      <ul className="space-y-2">
        {list.map((t) => (
          <li key={t.id} className="card flex items-center justify-between gap-3">
            <div className="text-sm"><p className="font-semibold">{t.judul}</p><p className="text-slate-500">{t.pelapor}</p></div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${t.status === "Selesai" ? "bg-emerald-100 text-emerald-800" : t.status === "Open" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{t.status}</span>
              {NEXT[t.status] && <button className="btn-ghost" onClick={() => setList(list.map((x) => (x.id === t.id ? { ...x, status: NEXT[x.status] } : x)))}>{NEXT[t.status]}</button>}
            </div>
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

function Info({ role }) {
  const [list, setList] = useState(D.INFO);
  const [f, setF] = useState({ judul: "", isi: "" });
  return (
    <div className="space-y-4">
      {role === "rw" && (
        <form className="card grid gap-2" onSubmit={(e) => { e.preventDefault(); if (f.judul) { setList([{ id: Date.now(), ...f }, ...list]); setF({ judul: "", isi: "" }); } }}>
          <input className="input" placeholder="Judul pengumuman" aria-label="Judul" value={f.judul} onChange={(e) => setF({ ...f, judul: e.target.value })} />
          <textarea className="input" rows={2} placeholder="Isi pengumuman" aria-label="Isi" value={f.isi} onChange={(e) => setF({ ...f, isi: e.target.value })} />
          <button className="btn">Terbitkan</button>
        </form>
      )}
      {list.map((i) => <article key={i.id} className="card"><h3 className="font-bold text-pine">{i.judul}</h3><p className="text-sm text-slate-600">{i.isi}</p></article>)}
    </div>
  );
}

function Ipl() {
  const tot = { lunas: 0, terlambat: 0, menunggak: 0 };
  Object.values(D.IPL).forEach((r) => Object.keys(tot).forEach((k) => (tot[k] += r[k])));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Lunas" value={tot.lunas} tone="text-emerald-700" />
        <Stat label="Terlambat" value={tot.terlambat} tone="text-amber-600" />
        <Stat label="Menunggak" value={tot.menunggak} tone="text-red-600" />
      </div>
      {Object.entries(D.IPL).map(([rw, r]) => {
        const sum = r.lunas + r.terlambat + r.menunggak;
        return (
          <section key={rw} className="card">
            <h3 className="mb-2 font-bold text-pine">{rw} <span className="font-normal text-slate-500">({sum} rumah)</span></h3>
            <div className="flex h-3 overflow-hidden rounded-full">
              <div className="bg-emerald-600" style={{ width: (r.lunas / sum) * 100 + "%" }} />
              <div className="bg-amber-500" style={{ width: (r.terlambat / sum) * 100 + "%" }} />
              <div className="bg-red-500" style={{ width: (r.menunggak / sum) * 100 + "%" }} />
            </div>
            <p className="mt-2 text-sm text-slate-600">{r.lunas} lunas, {r.terlambat} terlambat, {r.menunggak} menunggak</p>
          </section>
        );
      })}
    </div>
  );
}

function Donasi() {
  const [list, setList] = useState(D.DONASI);
  const [f, setF] = useState({ jenis: "Masjid", nama: "", nominal: "" });
  return (
    <div className="space-y-4">
      <form className="card grid gap-2 sm:grid-cols-3" onSubmit={(e) => { e.preventDefault(); if (f.nama && f.nominal) { setList([{ id: Date.now(), ...f, nominal: +f.nominal }, ...list]); setF({ ...f, nama: "", nominal: "" }); } }}>
        <select className="input" aria-label="Jenis donasi" value={f.jenis} onChange={(e) => setF({ ...f, jenis: e.target.value })}>
          {["Masjid", "Duka", "Bonus Security", "Bonus Kebersihan"].map((j) => <option key={j}>{j}</option>)}
        </select>
        <input className="input" placeholder="Nama donatur" aria-label="Nama donatur" value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} />
        <input className="input" type="number" placeholder="Nominal (Rp)" aria-label="Nominal" value={f.nominal} onChange={(e) => setF({ ...f, nominal: e.target.value })} />
        <button className="btn sm:col-span-3">Simpan donasi</button>
      </form>
      <ul className="space-y-2">
        {list.map((d) => (
          <li key={d.id} className="card flex justify-between text-sm">
            <span><b>{d.jenis}</b> <span className="text-slate-500">· {d.nama}</span></span>
            <span className="font-semibold text-moss">{rupiah(d.nominal)}</span>
          </li>
        ))}
      </ul>
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
    dashboard: <Dashboard role={role} />,
    security: <Attendance groups={D.SECURITY} />,
    kebersihan: <Attendance groups={D.KEBERSIHAN} />,
    tamu: <Tamu />,
    tiket: <Tiket role={role} />,
    panic: <Panic />,
    info: <Info role={role} />,
    ipl: <Ipl />,
    donasi: <Donasi />,
    peta: <MapView />,
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
