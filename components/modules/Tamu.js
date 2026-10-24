"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { tamuPerHari } from "@/lib/stats";
import { fmtDT, fmtTime } from "@/lib/format";
import { Card, Button, Modal, Field, Input, Select, Textarea, FileInput, SearchBox, DataTable, Pagination, Badge, PageHeader, Stat, BarChart, Icon, Empty } from "../ui";

const JENIS = ["Mobil Pribadi", "Motor Pribadi", "Taxi Online", "Ojek Online"];
const blank = { nama: "", plat: "", jenis: "", tujuan: "", catatan: "", rumahTujuan: "", ktpFoto: "", kendaraanFoto: "" };
const dur = (a) => { const m = Math.max(1, Math.round((Date.now() - new Date(a).getTime()) / 60000)); return m >= 60 ? `${Math.floor(m / 60)} jam ${m % 60} mnt` : `${m} mnt`; };

export default function Tamu() {
  const { data, add, update, toast } = useApp();
  const [form, setForm] = useState(null);
  const [errs, setErrs] = useState({});
  const [q, setQ] = useState("");
  const [jenis, setJenis] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);

  const inside = data.tamu.filter((t) => !t.keluar);
  const week = new Date(); week.setDate(week.getDate() - 7);
  const mingguIni = data.tamu.filter((t) => new Date(t.masuk) >= week);
  const online = mingguIni.filter((t) => t.jenis.includes("Online")).length;
  let hist = data.tamu.filter((t) => t.keluar);
  if (jenis) hist = hist.filter((t) => t.jenis === jenis);
  if (q) hist = hist.filter((t) => [t.nama, t.plat, t.tujuan, t.rumahTujuan].some((x) => String(x).toLowerCase().includes(q.toLowerCase())));
  hist = [...hist].sort((a, b) => b.masuk.localeCompare(a.masuk));

  const save = () => {
    const e = {};
    ["nama", "plat", "jenis", "tujuan"].forEach((k) => { if (!String(form[k]).trim()) e[k] = "Wajib diisi"; });
    setErrs(e);
    if (Object.keys(e).length) return toast("Lengkapi data tamu terlebih dahulu", "yellow");
    add("tamu", { ...form, plat: form.plat.toUpperCase(), masuk: new Date().toISOString(), keluar: null });
    setForm(null); toast("Tamu tercatat masuk");
  };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <PageHeader title="Tamu & Kendaraan" desc="Catat tamu yang masuk, pantau siapa yang masih di dalam, dan catat saat mereka keluar." action={<Button icon="plus" onClick={() => { setForm({ ...blank }); setErrs({}); }}>Catat tamu masuk</Button>} />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Sedang di dalam" value={inside.length} tone={inside.length > 10 ? "yellow" : "green"} icon="car" />
        <Stat label="Tamu minggu ini" value={mingguIni.length} icon="users" />
        <Stat label="Taksi/ojek online" value={online} sub="Minggu ini" icon="car" />
        <Stat label="Tamu hari ini" value={tamuPerHari(data)[6].a} icon="clock" />
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-base font-bold text-navy">Sedang di dalam ({inside.length})</h2>
        {inside.length === 0 ? <Empty text="Tidak ada tamu di dalam komplek saat ini." /> : (
          <div className="grid gap-3 md:grid-cols-2">
            {inside.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-navy">{t.nama}</p>
                  <p className="text-xs text-slate-500">{t.plat} - {t.jenis}</p>
                  <p className="mt-1 text-xs text-slate-500">Ke {t.rumahTujuan || "-"}: {t.tujuan}</p>
                  <p className="mt-1 text-xs"><Badge tone={Date.now() - new Date(t.masuk) > 8 * 3600000 ? "red" : "green"}>Di dalam {dur(t.masuk)}</Badge></p>
                </div>
                <Button variant="soft" onClick={() => setDetail(t.id)}>Detail</Button>
                <Button variant="ghost" onClick={() => { update("tamu", t.id, { keluar: new Date().toISOString() }); toast(`${t.nama} tercatat keluar`); }}>Keluar</Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1"><h2 className="mb-3 text-base font-bold text-navy">Statistik 7 hari</h2><BarChart data={tamuPerHari(data)} height={200} /></Card>
        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-base font-bold text-navy">Riwayat tamu</h2>
          <div className="mb-4 flex flex-wrap gap-3">
            <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Cari nama, plat, atau tujuan" />
            <Select value={jenis} onChange={(e) => { setJenis(e.target.value); setPage(1); }} placeholder="Semua jenis" options={JENIS} className="!w-auto min-w-[150px]" />
          </div>
          <DataTable onRow={(t) => setDetail(t.id)} columns={[
            { label: "Tamu", render: (t) => <div><p className="font-semibold text-navy">{t.nama}</p><p className="text-xs text-slate-500">{t.plat}</p></div> },
            { label: "Jenis", key: "jenis" }, { label: "Tujuan", render: (t) => `${t.rumahTujuan || "-"} - ${t.tujuan}` },
            { label: "Masuk - keluar", render: (t) => <span className="text-xs">{fmtDT(t.masuk)}<br />s/d {fmtTime(t.keluar)}</span> },
          ]} rows={hist.slice((page - 1) * 8, page * 8)} />
          <Pagination page={page} total={hist.length} size={8} onPage={setPage} />
        </Card>
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Detail tamu">
        {detail && (() => { const t = data.tamu.find((x) => x.id === detail); return t ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            {[["Nama", t.nama], ["Plat", t.plat], ["Jenis", t.jenis], ["Rumah tujuan", t.rumahTujuan || "-"], ["Tujuan", t.tujuan], ["Catatan", t.catatan || "-"], ["Masuk", fmtDT(t.masuk)], ["Keluar", t.keluar ? fmtDT(t.keluar) : "Masih di dalam"], ["Foto KTP", t.ktpFoto || "Tidak ada"], ["Foto kendaraan", t.kendaraanFoto || "Tidak ada"]].map(([k, v]) => <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="text-sm font-medium text-navy">{v}</dd></div>)}
          </dl>) : null; })()}
      </Modal>
      <Modal open={!!form} onClose={() => setForm(null)} title="Catat tamu masuk" footer={<><Button variant="ghost" onClick={() => setForm(null)}>Batal</Button><Button onClick={save}>Simpan & izinkan masuk</Button></>}>
        {form && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama tamu *" error={errs.nama}><Input value={form.nama} onChange={(e) => set("nama", e.target.value)} /></Field>
            <Field label="Plat nomor *" error={errs.plat}><Input value={form.plat} onChange={(e) => set("plat", e.target.value.toUpperCase())} placeholder="B 1234 ABC" /></Field>
            <Field label="Jenis kendaraan *" error={errs.jenis}><Select value={form.jenis} onChange={(e) => set("jenis", e.target.value)} options={JENIS} placeholder="Pilih jenis" /></Field>
            <Field label="Rumah tujuan"><Input value={form.rumahTujuan} onChange={(e) => set("rumahTujuan", e.target.value.toUpperCase())} placeholder="Contoh: C-12" /></Field>
            <Field label="Tujuan kunjungan *" error={errs.tujuan} className="sm:col-span-2"><Textarea value={form.tujuan} onChange={(e) => set("tujuan", e.target.value)} /></Field>
            <Field label="Catatan" className="sm:col-span-2"><Input value={form.catatan} onChange={(e) => set("catatan", e.target.value)} placeholder="Opsional" /></Field>
            <Field label="Foto KTP (placeholder)" className="sm:col-span-2"><FileInput value={form.ktpFoto} onChange={(v) => set("ktpFoto", v)} modul="Tamu" /></Field>
            <Field label="Foto kendaraan (placeholder)" className="sm:col-span-2"><FileInput value={form.kendaraanFoto} onChange={(v) => set("kendaraanFoto", v)} modul="Tamu" /></Field>
          </div>
        )}
      </Modal>
    </div>
  );
}
