"use client";
import { useState } from "react";
import * as D from "@/lib/data";
import { Stat, Modal, Hint, Donut, Bars, ExportBtn, rupiah } from "./Charts";
import DateRange, { inRange, ALL, lastDays, eachDay } from "./DateRange";

const Chip = ({ on, ...p }) => <button {...p} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${on ? "bg-moss text-white" : "bg-mist text-moss"}`} />;
const fmt = (s) => new Date(s + "T00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const addMin = (hm, m) => { const [h, mm] = hm.split(":").map(Number); const t = (h * 60 + mm + m) % 1440; return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0"); };
const scope = (role, list) => (D.SCOPE[role] ? list.filter((t) => D.SCOPE[role].includes(t.kat)) : list);
const hadir = (att, groups) => groups.flatMap((g) => g.members).filter((m) => att[m]?.in && !att[m]?.status).length;
const pseudo = (m, d) => { const dt = new Date(d + "T00:00"); if (dt.getDay() === 0) return "Libur"; const k = (m.length * (dt.getDate() + 3)) % 11; return k === 0 ? "Sakit" : k < 4 ? "Telat" : "Tepat"; };
const stat = (s = {}) => {
  if (s.status) return [s.status, s.status === "Bolos" ? D.C.bad : s.status === "Libur" ? D.C.mute : D.C.info];
  if (!s.in) return ["Belum Check-in", D.C.mute];
  if (s.late > 60) return [`Terlambat ${s.late} mnt`, D.C.bad];
  if (s.late >= 45) return [`Terlambat ${s.late} mnt`, D.C.warn];
  return ["Tepat waktu", D.C.ok];
};

export function Dashboard({ role, go, S }) {
  const k = D.kas(S.exp, S.don), tn = D.TONE[k.tone];
  const dalam = S.tamu.filter((t) => !t.keluar).length;
  const open = (r) => scope(r, S.tiket).filter((t) => t.status === "Belum Ditangani").length;
  const hs = hadir(S.att, D.SECURITY), hk = hadir(S.att, D.KEBERSIHAN);
  const area = (a) => D.KEBERSIHAN.flatMap((g) => g.members).filter((m) => S.att[m]?.in && S.att[m]?.area === a).length;
  const mIni = S.exp.filter((e) => e.tgl.startsWith(D.THIS_MONTH)).reduce((a, e) => a + e.nominal, 0);
  const tunggak = Object.values(D.IPL).reduce((a, r) => a + r.menunggak, 0);
  const latest = S.info[0];
  const cards = {
    rw: [["Tamu sedang di dalam", dalam, "tamu"], ["Pengaduan belum ditangani", open("rw"), "tiket"], ["Security hadir hari ini", `${hs}/15`, "security"], ["Petugas kebersihan hadir", `${hk}/9`, "kebersihan"], ["Saldo kas", rupiah(k.saldo), "keuangan", "neraca", tn.c, tn.t]],
    keamanan: [["Tamu sedang di dalam", dalam, "tamu"], ["Security hadir", `${hs}/15`, "security"], ["Pengaduan keamanan", open("keamanan"), "tiket", null, null, "Belum ditangani"]],
    kebersihan: [["Petugas hadir", `${hk}/9`, "kebersihan"], ["Hadir di RW 29", area("RW 29"), "kebersihan"], ["Hadir di RW 31", area("RW 31"), "kebersihan"], ["Pengaduan kebersihan", open("kebersihan"), "tiket", null, null, "Belum ditangani"]],
    bendahara: [["Saldo kas", rupiah(k.saldo), "keuangan", "neraca", tn.c, tn.t], ["Tunggakan IPL", tunggak, "keuangan", "ipl", D.C.bad, "Rumah menunggak"], ["Pengeluaran bulan ini", rupiah(mIni), "keuangan", "pengeluaran"], ["Donasi tercatat", rupiah(k.dn), "keuangan", "donasi"]],
  }[role];
  const jenis = D.JENIS_KENDARAAN.map((j, i) => ({ label: j, value: S.tamu.filter((t) => t.jenis === j).length, color: [D.C.navy, D.C.info, D.C.ok, D.C.warn][i] }));
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">{cards.map(([l, v, p, s, c, h]) => <Stat key={l} label={l} value={v} color={c} hint={h || "Ketuk untuk detail"} onClick={() => go(p, s)} />)}</div>
      {role === "rw" && (
        <section>
          <h3 className="mb-2 font-bold text-pine">Executive dashboard <span className="text-xs font-normal text-slate-400">· ringkasan seluruh operasional komplek</span></h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {[["Resident Management", "Data warga, rumah, penghuni, kendaraan", "penghuni"], ["Finance & Billing", "IPL, tagihan, pembayaran, tunggakan", "keuangan"], ["Security", "Tamu, kendaraan, kejadian, akses gerbang", "cctv"], ["Maintenance", "Komplain, work order, preventive maintenance", "maintenance"], ["Facility Booking", "Reservasi dan penggunaan fasilitas", "fasilitas"], ["Community", "Pengumuman, event, administrasi warga", "info"], ["Reporting & Analytics", "Laporan KPI, audit trail, anggaran, SLA, dan evaluasi kinerja", "laporan"]].map(([t, d, p], i) => <button key={t} onClick={() => go(p)} className={`card text-left transition hover:ring-moss ${i === 6 ? "sm:col-span-2" : ""}`}><p className="font-bold text-pine">{t}</p><p className="text-sm text-slate-500">{d}</p></button>)}
          </div>
        </section>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {["rw", "keamanan"].includes(role) && <section className="card"><h3 className="mb-2 font-bold text-pine">Kendaraan minggu ini</h3><Donut data={jenis} center="kendaraan" /></section>}
        {role === "kebersihan" && <section className="card"><h3 className="mb-2 font-bold text-pine">Kehadiran per area</h3><Bars data={[{ label: "RW 29", value: area("RW 29") }, { label: "RW 31", value: area("RW 31") }]} unit=" orang" /></section>}
        {role === "bendahara" && <section className="card"><h3 className="mb-2 font-bold text-pine">Komposisi IPL</h3><Donut center="rumah" data={[{ label: "Sudah bayar", value: 420, color: D.C.ok }, { label: "Terlambat", value: 110, color: D.C.warn }, { label: "Menunggak", value: tunggak, color: D.C.bad }]} /></section>}
        {latest && (
          <button className="card text-left" onClick={() => go("info")}>
            <p className="text-xs font-semibold text-moss">Pengumuman terbaru · {latest.kat}</p>
            <h3 className="font-bold text-pine">{latest.judul}</h3>
            <p className="text-sm text-slate-500">{fmt(latest.tgl)} · {latest.mulai}–{latest.selesai}</p><p className="text-sm text-slate-500">{latest.tempat}</p>
          </button>
        )}
      </div>
    </div>
  );
}

export function Absensi({ S, kind }) {
  const sec = kind === "security", groups = sec ? D.SECURITY : D.KEBERSIHAN;
  const { att, setAtt } = S;
  const [delay, setDelay] = useState(0), [sel, setSel] = useState(null), [rg, setRg] = useState(lastDays(7));
  const set = (m, v) => setAtt((a) => ({ ...a, [m]: { ...a[m], ...v } }));
  const all = groups.flatMap((g) => g.members);
  const h = hadir(att, groups);
  const hist = (m) => D.HARI7.map((d, i) => { const k = (m.length * (i + 3)) % 11; return { d, s: k === 0 ? "Sakit" : i === 6 ? "Libur" : k < 4 ? "Telat" : "Tepat", a: (m.length + i) % 2 ? "RW 29" : "RW 31" }; });
  const g = sel && groups.find((x) => x.members.includes(sel));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Hadir hari ini" value={`${h}/${all.length}`} color={D.C.ok} />
        {sec ? <Stat label="Terlambat" value={all.filter((m) => att[m]?.late >= 45).length} color={D.C.warn} /> : <><Stat label="Hadir RW 29" value={all.filter((m) => att[m]?.in && att[m].area === "RW 29").length} /><Stat label="Hadir RW 31" value={all.filter((m) => att[m]?.in && att[m].area === "RW 31").length} /></>}
      </div>
      <div className="card flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold text-pine">Mode demo, jam check-in:</span>
        <select className="input !w-auto" aria-label="Simulasi keterlambatan" value={delay} onChange={(e) => setDelay(+e.target.value)}>{[[0, "Tepat waktu"], [30, "Telat 30 menit"], [50, "Telat 50 menit"], [75, "Telat 75 menit"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <Hint><p><b style={{ color: D.C.ok }}>Hijau</b>: tepat waktu (sampai 44 menit). <b style={{ color: D.C.warn }}>Kuning</b>: terlambat 45–60 menit. <b style={{ color: D.C.bad }}>Merah</b>: terlambat lebih dari 60 menit.</p></Hint>
      </div>
      <section className="card">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-pine">Rekap kehadiran</h3><DateRange noAll value={rg} onChange={setRg} /></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-slate-400"><th className="py-1">Nama</th><th>Tepat</th><th>Telat</th><th>Sakit</th><th>Libur</th></tr></thead>
            <tbody>{all.map((m) => { const c = { Tepat: 0, Telat: 0, Sakit: 0, Libur: 0 }; eachDay(rg).forEach((d) => { c[pseudo(m, d)]++; }); return <tr key={m} className="border-t border-slate-100"><td className="py-1.5">{m}</td><td style={{ color: D.C.ok }}>{c.Tepat}</td><td style={{ color: D.C.warn }}>{c.Telat}</td><td style={{ color: D.C.info }}>{c.Sakit}</td><td className="text-slate-400">{c.Libur}</td></tr>; })}</tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-400">{eachDay(rg).length} hari dipilih. Data riwayat contoh, hari Minggu dihitung libur.</p>
      </section>
      {groups.map((gr) => (
        <section key={gr.group} className="card">
          <h3 className="mb-2 font-bold text-pine">{gr.group} <span className="text-xs font-normal text-slate-400">· {D.SHIFT[gr.group].label}</span></h3>
          <ul className="divide-y divide-slate-100">
            {gr.members.map((m) => {
              const s = att[m] || {}, [lbl, col] = stat(s);
              return (
                <li key={m} className="flex flex-wrap items-center gap-2 py-2">
                  <button onClick={() => setSel(m)} className="min-w-32 flex-1 text-left text-sm font-medium text-pine underline decoration-dotted">{m}</button>
                  <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ background: col }}>{lbl}</span>
                  {!sec && <select className="input !w-auto" aria-label={`Area ${m}`} value={s.area || ""} disabled={!!s.in} onChange={(e) => set(m, { area: e.target.value })}><option value="">Area…</option><option>RW 29</option><option>RW 31</option></select>}
                  <select className="input !w-auto" aria-label={`Status ${m}`} value={s.status || ""} onChange={(e) => set(m, { status: e.target.value })}><option value="">Status…</option>{D.MANUAL.map((x) => <option key={x}>{x}</option>)}</select>
                  {s.out ? <span className="text-xs text-slate-400">{s.in}–{s.out}</span> : s.in ? <button className="btn-ghost" onClick={() => set(m, { out: addMin(s.in, 480) })}>Check-out</button> : <button className="btn" disabled={!sec && !s.area} onClick={() => set(m, { in: addMin(D.SHIFT[gr.group].start, delay), late: delay, status: "" })}>Check-in</button>}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {sel && (
        <Modal title={sel} onClose={() => setSel(null)}>
          <p className="mb-2 text-sm text-slate-500">{g.group} · {D.SHIFT[g.group].label}</p>
          <p className="mb-3 text-sm">Hari ini: <b>{stat(att[sel])[0]}</b>{att[sel]?.in && ` · masuk ${att[sel].in}`}{att[sel]?.area && ` · ${att[sel].area}`}</p>
          <h4 className="mb-1 text-sm font-bold text-pine">Riwayat 7 hari (contoh)</h4>
          <ul className="grid grid-cols-7 gap-1 text-center text-[11px] text-white">
            {hist(sel).map((x) => <li key={x.d} className="rounded-lg p-1" style={{ background: { Tepat: D.C.ok, Telat: D.C.warn, Sakit: D.C.info, Libur: D.C.mute }[x.s] }}><p className="font-semibold">{x.d}</p><p>{x.s}</p>{!sec && <p>{x.a.slice(3)}</p>}</li>)}
          </ul>
          <p className="mt-3 text-sm">Terlambat bulan ini: <b>{(sel.length % 4) + 1} kali</b></p>
        </Modal>
      )}
    </div>
  );
}

export function Tiket({ S, role }) {
  const { tiket, setTiket } = S;
  const [fs, setFs] = useState("Semua"), [fk, setFk] = useState("Semua"), [sel, setSel] = useState(null), [note, setNote] = useState(""), [rg, setRg] = useState(ALL);
  const kats = D.SCOPE[role] || D.KAT_ADU;
  const E = { judul: "", kat: kats[0], lokasi: "", desk: "", pelapor: "", foto: false };
  const [f, setF] = useState(E);
  const list = scope(role, tiket).filter((t) => (fs === "Semua" || t.status === fs) && (fk === "Semua" || t.kat === fk) && inRange(t.tgl, rg));
  const t = tiket.find((x) => x.id === sel);
  const upd = (id, v) => setTiket(tiket.map((x) => (x.id === id ? { ...x, ...v } : x)));
  const col = (s) => D.STATUS_ADU.find((x) => x[0] === s)[1];
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="space-y-4">
      <form className="card grid gap-2 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); if (f.judul && f.lokasi && f.pelapor) { setTiket([{ ...f, id: Date.now(), status: "Belum Ditangani", catatan: [], tgl: D.TODAY }, ...tiket]); setF(E); } }}>
        <h3 className="font-bold text-pine sm:col-span-2">Buat pengaduan</h3>
        <input className="input" placeholder="Judul *" aria-label="Judul" value={f.judul} onChange={set("judul")} />
        <select className="input" aria-label="Kategori" value={f.kat} onChange={set("kat")}>{kats.map((k) => <option key={k}>{k}</option>)}</select>
        <input className="input" placeholder="Lokasi / blok *" aria-label="Lokasi" value={f.lokasi} onChange={set("lokasi")} />
        <input className="input" placeholder="Nama pelapor *" aria-label="Pelapor" value={f.pelapor} onChange={set("pelapor")} />
        <textarea className="input sm:col-span-2" rows={2} placeholder="Deskripsi" aria-label="Deskripsi" value={f.desk} onChange={set("desk")} />
        <button type="button" className="btn-ghost" onClick={() => setF({ ...f, foto: !f.foto })}>{f.foto ? "Foto terlampir" : "Lampirkan foto (opsional)"}</button>
        <button className="btn" disabled={!(f.judul && f.lokasi && f.pelapor)}>Kirim</button>
      </form>
      <div className="flex flex-wrap items-center gap-2">
        {["Semua", ...D.STATUS_ADU.map((s) => s[0])].map((s) => <Chip key={s} on={fs === s} onClick={() => setFs(s)}>{s}</Chip>)}
        <select className="input !w-auto" aria-label="Filter kategori" value={fk} onChange={(e) => setFk(e.target.value)}>{["Semua", ...kats].map((k) => <option key={k}>{k}</option>)}</select>
        <DateRange value={rg} onChange={setRg} />
        <ExportBtn name="pengaduan" rows={list.map((t) => ({ Tanggal: t.tgl, Judul: t.judul, Kategori: t.kat, Lokasi: t.lokasi, Pelapor: t.pelapor, Status: t.status }))} />
      </div>
      <ul className="space-y-2">
        {list.map((x) => <li key={x.id}><button className="card flex w-full items-center justify-between gap-3 !p-3 text-left" onClick={() => setSel(x.id)}><span className="text-sm"><b className="text-pine">{x.judul}</b><br /><span className="text-slate-500">{x.kat} · {x.lokasi} · {x.pelapor}</span></span><span className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-white" style={{ background: col(x.status) }}>{x.status}</span></button></li>)}
      </ul>
      {t && (
        <Modal title={t.judul} onClose={() => setSel(null)}>
          <p className="text-sm text-slate-600">{t.desk || "Tanpa deskripsi."}</p>
          <p className="mt-2 text-sm">{t.kat} · {t.lokasi} · dilaporkan {t.pelapor}{t.foto && " · ada foto"}</p>
          <div className="my-3 grid grid-cols-3 gap-2">{D.STATUS_ADU.map(([s, c]) => <button key={s} onClick={() => upd(t.id, { status: s })} className="rounded-xl px-2 py-2 text-xs font-semibold" style={t.status === s ? { background: c, color: "#fff" } : { background: "#F4F7FB", color: "#13315C" }}>{s}</button>)}</div>
          <ul className="mb-2 space-y-1 text-sm">{t.catatan.map((c, i) => <li key={i} className="rounded-lg bg-mist px-3 py-2">{c.t}</li>)}</ul>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (note) { upd(t.id, { catatan: [...t.catatan, { t: note }] }); setNote(""); } }}>
            <input className="input" placeholder="Tambah catatan" aria-label="Catatan" value={note} onChange={(e) => setNote(e.target.value)} /><button className="btn">Tambah</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export function Info({ S, role }) {
  const { info, setInfo } = S;
  const E = { judul: "", kat: D.KAT_INFO[0], tgl: "", mulai: "", selesai: "", tempat: "", desk: "", pj: "", konf: "" };
  const [f, setF] = useState(E), [fk, setFk] = useState("Semua"), [sel, setSel] = useState(null), [rg, setRg] = useState(ALL);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const ok = Object.values(f).every((v) => v.trim());
  const canMake = ["rw", "keamanan"].includes(role);
  const x = info.find((i) => i.id === sel);
  return (
    <div className="space-y-4">
      {canMake && (
        <form className="card grid gap-2 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); if (ok) { setInfo([{ ...f, id: Date.now() }, ...info]); setF(E); } }}>
          <h3 className="font-bold text-pine sm:col-span-2">Buat pengumuman</h3>
          <input className="input sm:col-span-2" placeholder="Judul pengumuman *" aria-label="Judul" value={f.judul} onChange={set("judul")} />
          <select className="input" aria-label="Kategori" value={f.kat} onChange={set("kat")}>{D.KAT_INFO.map((k) => <option key={k}>{k}</option>)}</select>
          <input type="date" className="input" aria-label="Hari dan tanggal" value={f.tgl} onChange={set("tgl")} />
          <input type="time" className="input" aria-label="Jam mulai" value={f.mulai} onChange={set("mulai")} />
          <input type="time" className="input" aria-label="Jam selesai" value={f.selesai} onChange={set("selesai")} />
          <input className="input" placeholder="Tempat *" aria-label="Tempat" value={f.tempat} onChange={set("tempat")} />
          <input className="input" placeholder="Nama penanggung jawab *" aria-label="Penanggung jawab" value={f.pj} onChange={set("pj")} />
          <textarea className="input sm:col-span-2" rows={2} placeholder="Deskripsi *" aria-label="Deskripsi" value={f.desk} onChange={set("desk")} />
          <div className="rounded-xl bg-amber-50 p-3 text-sm sm:col-span-2">
            <p className="font-semibold text-amber-800">Wajib hubungi Koordinator Keamanan: {D.KOORD.nama} ({D.KOORD.telp})</p>
            <textarea className="input mt-2" rows={2} placeholder="Sudah menghubungi Koordinator Keamanan *" aria-label="Sudah menghubungi Koordinator Keamanan" value={f.konf} onChange={set("konf")} />
            <button type="button" className="mt-1 text-xs font-semibold text-moss underline" onClick={() => setF({ ...f, konf: `Sudah menghubungi ${D.KOORD.nama} (${D.KOORD.telp}) via WhatsApp pukul 09.15` })}>Isi contoh</button>
          </div>
          {!f.konf.trim() && <p className="text-xs font-semibold text-red-500 sm:col-span-2">Kolom koordinator keamanan wajib diisi sebelum pengumuman bisa dikirim.</p>}
          <button className="btn sm:col-span-2" disabled={!ok}>Terbitkan pengumuman</button>
        </form>
      )}
      <div className="flex flex-wrap gap-2">{["Semua", ...D.KAT_INFO].map((k) => <Chip key={k} on={fk === k} onClick={() => setFk(k)}>{k}</Chip>)}</div>
      <DateRange future value={rg} onChange={setRg} />
      <ul className="space-y-3">
        {info.filter((i) => (fk === "Semua" || i.kat === fk) && inRange(i.tgl, rg)).map((i) => (
          <li key={i.id}><button className="card w-full text-left" onClick={() => setSel(i.id)}>
            <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold text-moss">{i.kat}</span>
            <h3 className="mt-1 font-bold text-pine">{i.judul}</h3>
            <p className="text-sm text-slate-500">{fmt(i.tgl)} · {i.mulai}–{i.selesai}</p><p className="text-sm text-slate-500">{i.tempat}</p>
          </button></li>
        ))}
      </ul>
      {x && (
        <Modal title={x.judul} onClose={() => setSel(null)}>
          <p className="text-sm"><b>{x.kat}</b></p>
          <p className="mt-2 text-sm">{fmt(x.tgl)}, {x.mulai}–{x.selesai}<br />Tempat: {x.tempat}<br />Penanggung jawab: {x.pj}</p>
          <p className="mt-2 text-sm text-slate-600">{x.desk}</p>
          <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">Koordinasi keamanan: {x.konf}</p>
        </Modal>
      )}
    </div>
  );
}
