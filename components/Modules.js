"use client";
import { useState } from "react";
import * as D from "@/lib/data";
import { Stat, Modal, Hint, Donut, Bars, Lines, Stack, Cols, Gauge, Heat, ExportBtn, rupiah } from "./Charts";
import DateRange, { inRange, ALL, bulanIni, eachDay } from "./DateRange";
import { Feed } from "./Cctv";
import { Ktp, Kendaraan } from "./Photos";

const Chip = ({ on, ...p }) => <button {...p} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${on ? "bg-moss text-white" : "bg-mist text-moss"}`} />;
const Panel = ({ title, sub, children }) => <section className="card"><h3 className="font-bold text-pine">{title}</h3>{sub && <p className="mb-3 text-xs text-slate-400">{sub}</p>}{children}</section>;
const sum = (a) => a.reduce((x, y) => x + y, 0);
const slot = (jam) => { const h = +jam.slice(0, 2); return D.SLOT[h < 6 ? 0 : h < 12 ? 1 : h < 18 ? 2 : 3]; };
const hrs = (a, b) => { const m = (x) => { const [h, mm] = x.split(":").map(Number); return h * 60 + mm; }; return (m(b) - m(a)) / 60; };
const SEV = { Tinggi: D.C.bad, Sedang: D.C.warn, Rendah: D.C.info };
const nowHM = () => new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":");

export function Penghuni() {
  const [st, setSt] = useState("Semua"), [bl, setBl] = useState("Semua"), [q, setQ] = useState(""), [sel, setSel] = useState(null);
  const tot = D.BLOK_STAT.reduce((a, r) => a.map((v, i) => v + r[i]), [0, 0, 0]);
  const list = D.RUMAH.filter((r) => (st === "Semua" || r.status === st) && (bl === "Semua" || r.blok === bl) && (r.pemilik + r.id).toLowerCase().includes(q.toLowerCase()));
  const r = D.RUMAH.find((x) => x.id === sel);
  const ic = { Lunas: D.C.ok, Terlambat: D.C.warn, Menunggak: D.C.bad };
  const parts = [{ name: "Dihuni", color: D.C.ok }, { name: "Disewakan", color: D.C.warn }, { name: "Kosong", color: D.C.mute }];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total rumah" value={600} hint="RW 29 dan RW 31" onClick={() => setSt("Semua")} />
        {parts.map((p, i) => <Stat key={p.name} label={p.name} value={tot[i]} color={p.color} hint="Ketuk untuk filter" onClick={() => setSt(p.name)} />)}
      </div>
      <Panel title="Status rumah per blok" sub="Stacked bar: dihuni, disewakan, dan kosong tiap blok."><Stack parts={parts} data={D.BLOK.map((b, i) => ({ label: "Blok " + b, v: D.BLOK_STAT[i] }))} /></Panel>
      <div className="flex flex-wrap gap-2">
        {["Semua", "Dihuni", "Disewakan", "Kosong"].map((s) => <Chip key={s} on={st === s} onClick={() => setSt(s)}>{s}</Chip>)}
        <select className="input !w-auto" aria-label="Blok" value={bl} onChange={(e) => setBl(e.target.value)}>{["Semua", ...D.BLOK].map((b) => <option key={b} value={b}>{b === "Semua" ? "Semua blok" : "Blok " + b}</option>)}</select>
        <input className="input !w-auto flex-1" placeholder="Cari rumah atau pemilik" aria-label="Cari" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {list.map((x) => (
          <li key={x.id}><button onClick={() => setSel(x.id)} className="card flex w-full items-center justify-between !p-3 text-left text-sm">
            <span><b className="text-pine">{x.id}</b> · {x.pemilik}<br /><span className="text-xs text-slate-400">{x.status} · {x.rw}</span></span>
            <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ background: ic[x.ipl] }}>{x.ipl}</span>
          </button></li>
        ))}
      </ul>
      <p className="text-xs text-slate-400">Menampilkan {list.length} rumah contoh dari 600 unit.</p>
      {r && (
        <Modal title={`Rumah ${r.id} · ${r.pemilik}`} onClose={() => setSel(null)}>
          <p className="text-sm">{r.rw} · Blok {r.blok} · <b>{r.status}</b>{r.anggota > 0 && ` · ${r.anggota} anggota keluarga`}</p>
          <p className="mt-2 text-sm">Status IPL: <b style={{ color: ic[r.ipl] }}>{r.ipl}</b></p>
          <h4 className="mb-1 mt-3 text-sm font-bold text-pine">Kendaraan terdaftar</h4>
          {r.kendaraan.length ? <ul className="space-y-1 text-sm">{r.kendaraan.map(([p, j]) => <li key={p} className="rounded-lg bg-mist px-3 py-2">{p} · {j}</li>)}</ul> : <p className="text-sm text-slate-400">Tidak ada kendaraan.</p>}
        </Modal>
      )}
    </div>
  );
}

export function Maintenance({ S }) {
  const { wo, setWo } = S;
  const [tab, setTab] = useState("wo"), [rg, setRg] = useState(ALL), [f, setF] = useState({ judul: "", kat: D.KAT_FAS[0], biaya: "", vendor: "" });
  const list = wo.filter((w) => inRange(w.tgl, rg));
  const cost = D.KAT_FAS.map((k) => ({ label: k, value: +(sum(list.filter((w) => w.kat === k).map((w) => w.biaya)) / 1e6).toFixed(1), color: D.C.navy })).filter((d) => d.value);
  const days = (s) => Math.round((new Date(s + "T00:00") - new Date(D.TODAY + "T00:00")) / 864e5);
  const col = (s) => D.STATUS_WO.find((x) => x[0] === s)[1];
  return (
    <div className="space-y-4">
      <div className="flex gap-2"><Chip on={tab === "wo"} onClick={() => setTab("wo")}>Work order</Chip><Chip on={tab === "prev"} onClick={() => setTab("prev")}>Preventive maintenance</Chip></div>
      {tab === "wo" ? (
        <>
          <div className="flex flex-wrap items-center gap-2"><DateRange value={rg} onChange={setRg} /><ExportBtn name="work-order" rows={list.map((w) => ({ Tanggal: w.tgl, Pekerjaan: w.judul, Kategori: w.kat, Biaya: w.biaya, Status: w.status, Vendor: w.vendor }))} /></div>
          <div className="grid gap-3 sm:grid-cols-2"><Stat label="Total biaya pada rentang" value={rupiah(sum(list.map((w) => w.biaya)))} hint={`${list.length} work order`} /><Stat label="Belum selesai" value={list.filter((w) => w.status !== "Selesai").length} color={D.C.warn} /></div>
          <Panel title="Biaya per kategori fasilitas" sub="Dalam juta rupiah"><Bars data={cost} unit=" jt" /></Panel>
          <form className="card grid gap-2 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); if (f.judul && f.biaya) { setWo([{ id: Date.now(), tgl: D.TODAY, status: "Baru", ...f, biaya: +f.biaya }, ...wo]); setF({ ...f, judul: "", biaya: "", vendor: "" }); } }}>
            <input className="input" placeholder="Pekerjaan *" aria-label="Pekerjaan" value={f.judul} onChange={(e) => setF({ ...f, judul: e.target.value })} />
            <select className="input" aria-label="Kategori" value={f.kat} onChange={(e) => setF({ ...f, kat: e.target.value })}>{D.KAT_FAS.map((k) => <option key={k}>{k}</option>)}</select>
            <input className="input" type="number" placeholder="Estimasi biaya (Rp) *" aria-label="Biaya" value={f.biaya} onChange={(e) => setF({ ...f, biaya: e.target.value })} />
            <input className="input" placeholder="Vendor" aria-label="Vendor" value={f.vendor} onChange={(e) => setF({ ...f, vendor: e.target.value })} />
            <button className="btn sm:col-span-2" disabled={!(f.judul && f.biaya)}>Buat work order</button>
          </form>
          <ul className="space-y-2">
            {list.map((w) => (
              <li key={w.id} className="card flex flex-wrap items-center justify-between gap-2 !p-3 text-sm">
                <span><b className="text-pine">{w.judul}</b><br /><span className="text-slate-500">{w.kat} · {w.vendor || "-"} · {w.tgl.slice(8)}/{w.tgl.slice(5, 7)} · {rupiah(w.biaya)}</span></span>
                <select aria-label={`Status ${w.judul}`} value={w.status} onChange={(e) => setWo(wo.map((x) => (x.id === w.id ? { ...x, status: e.target.value } : x)))} className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: col(w.status) }}>{D.STATUS_WO.map(([s]) => <option key={s} className="text-black">{s}</option>)}</select>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <ul className="space-y-2">
          {D.PREV.map((p) => { const d = days(p.berikut), c = d < 0 ? D.C.bad : d <= 7 ? D.C.warn : D.C.ok; return (
            <li key={p.nama} className="card flex items-center justify-between gap-3 !p-3 text-sm">
              <span><b className="text-pine">{p.nama}</b><br /><span className="text-slate-500">Tiap {p.tiap} · terakhir {p.terakhir} · berikutnya {p.berikut}</span></span>
              <span className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-white" style={{ background: c }}>{d < 0 ? `Lewat ${-d} hari` : d === 0 ? "Hari ini" : `${d} hari lagi`}</span>
            </li>); })}
        </ul>
      )}
    </div>
  );
}

export function Fasilitas({ S }) {
  const { book, setBook } = S;
  const [rg, setRg] = useState(ALL), [f, setF] = useState({ fas: "lap", tgl: D.TODAY, mulai: "", selesai: "", pemesan: "", perlu: "" });
  const bentrok = f.mulai && f.selesai && book.some((b) => b.fas === f.fas && b.tgl === f.tgl && f.mulai < b.selesai && f.selesai > b.mulai);
  const salah = f.mulai && f.selesai && f.selesai <= f.mulai;
  const ok = f.mulai && f.selesai && f.pemesan && f.perlu && !bentrok && !salah;
  const list = book.filter((b) => inRange(b.tgl, rg)).sort((a, b) => b.tgl.localeCompare(a.tgl));
  const days = rg.from ? eachDay(rg).length : 30;
  const per = D.FAS.map((x) => { const bs = list.filter((b) => b.fas === x.id); return { label: x.nama, n: bs.length, pct: Math.min(100, Math.round((sum(bs.map((b) => hrs(b.mulai, b.selesai))) / (days * x.jam)) * 100)) }; });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const nama = (id) => D.FAS.find((x) => x.id === id).nama;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2"><DateRange value={rg} onChange={setRg} /><ExportBtn name="reservasi" rows={list.map((b) => ({ Fasilitas: nama(b.fas), Tanggal: b.tgl, Mulai: b.mulai, Selesai: b.selesai, Pemesan: b.pemesan, Keperluan: b.perlu }))} /></div>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Jumlah reservasi" sub="Per fasilitas pada rentang terpilih"><Bars data={per.map((p) => ({ label: p.label, value: p.n }))} unit="x" /></Panel>
        <Panel title="Tingkat pemakaian" sub={`Jam terpakai dibanding jam buka (${days} hari)`}><Bars max={100} unit="%" data={per.map((p) => ({ label: p.label, value: p.pct, color: p.pct > 60 ? D.C.warn : D.C.ok }))} /></Panel>
      </div>
      <form className="card grid gap-2 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); if (ok) { setBook([{ id: Date.now(), ...f }, ...book]); setF({ ...f, mulai: "", selesai: "", pemesan: "", perlu: "" }); } }}>
        <h3 className="font-bold text-pine sm:col-span-2">Reservasi fasilitas</h3>
        <select className="input" aria-label="Fasilitas" value={f.fas} onChange={set("fas")}>{D.FAS.map((x) => <option key={x.id} value={x.id}>{x.nama} ({x.buka})</option>)}</select>
        <input type="date" className="input" aria-label="Tanggal" value={f.tgl} onChange={set("tgl")} />
        <input type="time" className="input" aria-label="Jam mulai" value={f.mulai} onChange={set("mulai")} />
        <input type="time" className="input" aria-label="Jam selesai" value={f.selesai} onChange={set("selesai")} />
        <input className="input" placeholder="Nama pemesan *" aria-label="Pemesan" value={f.pemesan} onChange={set("pemesan")} />
        <input className="input" placeholder="Keperluan *" aria-label="Keperluan" value={f.perlu} onChange={set("perlu")} />
        {bentrok && <p className="text-xs font-semibold text-red-500 sm:col-span-2">Jadwal bentrok dengan reservasi lain di fasilitas dan tanggal yang sama.</p>}
        {salah && <p className="text-xs font-semibold text-red-500 sm:col-span-2">Jam selesai harus setelah jam mulai.</p>}
        <button className="btn sm:col-span-2" disabled={!ok}>Simpan reservasi</button>
      </form>
      <ul className="space-y-2">{list.map((b) => <li key={b.id} className="card !p-3 text-sm"><b className="text-pine">{nama(b.fas)}</b> · {b.tgl.slice(8)}/{b.tgl.slice(5, 7)} {b.mulai}–{b.selesai}<br /><span className="text-slate-500">{b.pemesan} · {b.perlu}</span></li>)}</ul>
    </div>
  );
}

export function Keamanan({ S }) {
  const [tab, setTab] = useState("cctv"), [full, setFull] = useState(null), [mic, setMic] = useState({}), [msg, setMsg] = useState(""), [pic, setPic] = useState(null);
  const [rg, setRg] = useState(ALL), [f, setF] = useState({ lokasi: D.LOKASI[0], jenis: D.JENIS_INS[0], ket: "", sev: "Rendah" });
  const CAM = ["Gerbang Utama – Depan", "Gerbang Utama – Belakang", "Pos Blok A", "Taman Utama"];
  const p = S.tamu.find((t) => t.id === pic);
  const ins = S.insiden.filter((i) => inRange(i.tgl, rg));
  return (
    <div className="space-y-4">
      <div className="flex gap-2"><Chip on={tab === "cctv"} onClick={() => setTab("cctv")}>CCTV & akses gerbang</Chip><Chip on={tab === "kej"} onClick={() => setTab("kej")}>Kejadian</Chip></div>
      {tab === "cctv" ? (
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="card overflow-x-auto lg:col-span-3">
            <h3 className="mb-2 font-bold text-pine">Akses kendaraan terbaru</h3>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-slate-400"><th className="py-1">Plat</th><th>Identifikasi</th><th>Jenis</th><th>Tujuan</th><th>Waktu</th><th>Foto</th></tr></thead>
              <tbody>{S.tamu.slice(0, 8).map((t) => <tr key={t.id} className="border-t border-slate-100"><td className="py-2 font-semibold">{t.plat}</td><td>{t.nik}</td><td>{t.jenis.split(" ")[0]}</td><td>{t.rumah}, {t.warga}</td><td>{t.tgl.slice(8)}/{t.tgl.slice(5, 7)} {t.masuk}</td><td><button aria-label={`Foto ${t.nama}`} onClick={() => setPic(t.id)} className="rounded-full bg-mist px-3 py-1 text-moss">🪪</button></td></tr>)}</tbody>
            </table>
          </div>
          <div className="space-y-3 lg:col-span-2">
            {CAM.map((c, i) => (
              <div key={c} className="overflow-hidden rounded-xl bg-slate-900">
                <Feed name={c} seed={i} />
                <div className="flex items-center justify-center gap-5 py-2 text-lg text-white">
                  <button aria-label="Ambil snapshot" onClick={() => setMsg(`Snapshot ${c} tersimpan (simulasi)`)}>📷</button>
                  <button aria-label="Mikrofon" onClick={() => setMic({ ...mic, [i]: !mic[i] })} className={mic[i] ? "opacity-100" : "opacity-50"}>🎙</button>
                  <button aria-label="Layar penuh" onClick={() => setFull(i)}>⛶</button>
                </div>
              </div>
            ))}
            {msg && <p className="rounded-xl bg-emerald-50 p-2 text-center text-xs text-emerald-800" role="status">{msg}</p>}
            <p className="text-xs text-slate-400">Tampilan kamera adalah simulasi untuk demo.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2"><DateRange value={rg} onChange={setRg} /><ExportBtn name="kejadian" rows={ins.map((i) => ({ Tanggal: i.tgl, Jam: i.jam, Lokasi: i.lokasi, Jenis: i.jenis, Keterangan: i.ket, Tingkat: i.sev }))} /></div>
          <Panel title="Kejadian berdasarkan waktu dan lokasi" sub="Heatmap: makin merah makin banyak kejadian"><Heat rows={D.LOKASI} cols={D.SLOT} cell={(r, c) => ins.filter((i) => i.lokasi === r && slot(i.jam) === c).length} /></Panel>
          <form className="card grid gap-2 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); if (f.ket) { S.setInsiden([{ id: Date.now(), tgl: D.TODAY, jam: nowHM(), ...f }, ...S.insiden]); setF({ ...f, ket: "" }); } }}>
            <h3 className="font-bold text-pine sm:col-span-2">Catat kejadian</h3>
            <select className="input" aria-label="Lokasi" value={f.lokasi} onChange={(e) => setF({ ...f, lokasi: e.target.value })}>{D.LOKASI.map((l) => <option key={l}>{l}</option>)}</select>
            <select className="input" aria-label="Jenis" value={f.jenis} onChange={(e) => setF({ ...f, jenis: e.target.value })}>{D.JENIS_INS.map((l) => <option key={l}>{l}</option>)}</select>
            <input className="input" placeholder="Keterangan *" aria-label="Keterangan" value={f.ket} onChange={(e) => setF({ ...f, ket: e.target.value })} />
            <select className="input" aria-label="Tingkat" value={f.sev} onChange={(e) => setF({ ...f, sev: e.target.value })}>{Object.keys(SEV).map((l) => <option key={l}>{l}</option>)}</select>
            <button className="btn sm:col-span-2" disabled={!f.ket}>Simpan kejadian</button>
          </form>
          <ul className="space-y-2">{ins.map((i) => <li key={i.id} className="card flex items-center justify-between gap-3 !p-3 text-sm"><span><b className="text-pine">{i.jenis}</b> · {i.lokasi}<br /><span className="text-slate-500">{i.tgl.slice(8)}/{i.tgl.slice(5, 7)} {i.jam} · {i.ket}</span></span><span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ background: SEV[i.sev] }}>{i.sev}</span></li>)}</ul>
        </>
      )}
      {full !== null && <Modal title={CAM[full]} onClose={() => setFull(null)}><Feed name={CAM[full]} seed={full} /></Modal>}
      {p && <Modal title={`${p.nama} · ${p.plat}`} onClose={() => setPic(null)}><div className="grid grid-cols-2 gap-2"><Ktp nama={p.nama} nik={p.nik} /><Kendaraan jenis={p.jenis} plat={p.plat} /></div></Modal>}
    </div>
  );
}

export function Laporan({ S }) {
  const [rg, setRg] = useState(bulanIni());
  const pengel = D.KEYS6.map((k) => D.EXP_OLD[k] ?? sum(S.exp.filter((e) => e.tgl.startsWith(k)).map((e) => e.nominal)));
  const wo = S.wo.filter((w) => inRange(w.tgl, rg)), ins = S.insiden.filter((i) => inRange(i.tgl, rg)), bk = S.book.filter((b) => inRange(b.tgl, rg));
  const days = rg.from ? eachDay(rg).length : 30;
  const fas = D.FAS.map((x) => { const bs = bk.filter((b) => b.fas === x.id); return { label: x.nama, n: bs.length, pct: Math.min(100, Math.round((sum(bs.map((b) => hrs(b.mulai, b.selesai))) / (days * x.jam)) * 100)) }; });
  const done = Math.round((S.tiket.filter((t) => t.status === "Selesai").length / S.tiket.length) * 100);
  const hadir = Object.values(S.att).filter((a) => a.in && !a.status).length;
  const lunas = Math.round((420 / 600) * 100);
  const logs = D.AUDIT.filter(([t]) => inRange(t.slice(0, 10), rg));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2"><DateRange value={rg} onChange={setRg} /><ExportBtn name="audit-trail" rows={logs.map(([w, u, a]) => ({ Waktu: w, Pengguna: u, Aksi: a }))} /></div>
      <p className="text-xs text-slate-400">Rentang tanggal berlaku untuk grafik kejadian, maintenance, fasilitas, dan audit trail. Grafik bulanan selalu 6 bulan terakhir.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Keuangan" sub="Pemasukan vs pengeluaran per bulan (juta rupiah)"><Cols unit=" jt" series={[{ name: "Pemasukan", color: D.C.ok }, { name: "Pengeluaran", color: D.C.bad }]} data={D.BULAN6.map((l, i) => ({ label: l, v: [D.MASUK6[i], Math.round(pengel[i] / 1e6)] }))} /></Panel>
        <Panel title="IPL" sub="Lunas vs belum lunas"><Donut center="rumah" data={[{ label: "Lunas", value: 420, color: D.C.ok }, { label: "Belum lunas", value: 180, color: D.C.bad }]} /></Panel>
        <Panel title="Penghuni" sub="Status rumah per blok"><Stack parts={[{ name: "Dihuni", color: D.C.ok }, { name: "Disewakan", color: D.C.warn }, { name: "Kosong", color: D.C.mute }]} data={D.BLOK.map((b, i) => ({ label: "Blok " + b, v: D.BLOK_STAT[i] }))} /></Panel>
        <Panel title="Komplain" sub="Tren tiket masuk dan selesai"><Lines labels={D.BULAN6} series={[{ name: "Masuk", color: D.C.warn, values: D.KOMPLAIN6.masuk }, { name: "Selesai", color: D.C.ok, values: D.KOMPLAIN6.selesai }]} /></Panel>
        <Panel title="Maintenance" sub="Biaya per kategori fasilitas (juta rupiah)"><Bars unit=" jt" data={D.KAT_FAS.map((k) => ({ label: k, value: +(sum(wo.filter((w) => w.kat === k).map((w) => w.biaya)) / 1e6).toFixed(1), color: D.C.navy })).filter((d) => d.value)} /></Panel>
        <Panel title="Security" sub="Kejadian berdasarkan waktu dan lokasi"><Heat rows={D.LOKASI} cols={D.SLOT} cell={(r, c) => ins.filter((i) => i.lokasi === r && slot(i.jam) === c).length} /></Panel>
        <Panel title="Fasilitas" sub="Jumlah reservasi dan tingkat pemakaian"><Bars unit="x" data={fas.map((p) => ({ label: p.label, value: p.n, sub: p.pct + "% terpakai" }))} /></Panel>
        <Panel title="Operasional" sub="Persentase pencapaian SLA">
          <div className="grid grid-cols-2 gap-3"><Gauge value={done} label="Pengaduan selesai" target={80} /><Gauge value={92} label="Respon di bawah 24 jam" target={90} /><Gauge value={lunas} label="IPL lunas" target={85} /><Gauge value={Math.round((hadir / 24) * 100)} label="Kehadiran petugas" target={90} /></div>
        </Panel>
      </div>
      <Panel title="Audit trail" sub="Catatan aktivitas pengurus">
        <ul className="divide-y divide-slate-100 text-sm">{logs.length ? logs.map(([w, u, a]) => <li key={w + a} className="py-2"><span className="text-xs text-slate-400">{w}</span> · <b>{u}</b><br />{a}</li>) : <li className="py-2 text-slate-400">Tidak ada aktivitas pada rentang ini.</li>}</ul>
      </Panel>
    </div>
  );
}
