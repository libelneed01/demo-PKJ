"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { BLOK_RW } from "@/lib/data";
import { fmtDate, daysUntil, ymd } from "@/lib/format";
import { Card, Button, Modal, Field, Input, Select, SearchBox, DataTable, Pagination, Badge, PageHeader, Tabs, Icon, Confirm } from "../ui";

const SIZE = 15;
const ST = { tinggal: ["Warga Tinggal", "green"], ngontrak: ["Warga Ngontrak", "navy"], ditinggal: ["Rumah Ditinggal", "yellow"] };
const blank = () => ({ status: "tinggal", rw: 29, blok: "A", no: "", owner: "", kk: "", ktp: "", hp: "", penghuni: 1, kendaraan: [], penyewa: "", penyewaKtp: "", penyewaHp: "", kontrakMulai: "", kontrakSelesai: "", kota: "", provinsi: "", penunggu: "", penungguHp: "", mulaiDitinggal: "", iplStatus: "lunas", tunggakan: 0 });
const vText = (h) => (h.kendaraan || []).map((v) => `${v.jenis} ${v.plat}`).join(", ") || "-";

function validate(f) {
  const e = {};
  const need = (k, m = "Wajib diisi") => { if (!String(f[k] ?? "").trim()) e[k] = m; };
  const dig = (k, n = 16) => { if (!/^\d+$/.test(f[k] || "") || f[k].length !== n) e[k] = `Harus ${n} digit angka`; };
  need("owner"); dig("kk"); dig("ktp"); need("hp");
  if (!(Number(f.no) >= 1 && Number(f.no) <= 60)) e.no = "Nomor rumah 1-60";
  if (f.status === "tinggal" && !(Number(f.penghuni) >= 1)) e.penghuni = "Minimal 1 orang";
  if (f.status === "ngontrak") {
    need("penyewa"); dig("penyewaKtp"); need("penyewaHp"); need("kontrakMulai"); need("kontrakSelesai");
    if (!(Number(f.penghuni) >= 1)) e.penghuni = "Minimal 1 orang";
    if (f.kontrakMulai && f.kontrakSelesai && f.kontrakSelesai <= f.kontrakMulai) e.kontrakSelesai = "Harus setelah tanggal mulai";
  }
  if (f.status === "ditinggal") { need("kota"); need("provinsi"); need("penunggu"); need("penungguHp"); need("mulaiDitinggal"); }
  (f.kendaraan || []).forEach((v, i) => { if (!v.plat.trim()) e["v" + i] = "Isi plat nomor"; });
  return e;
}

export default function Warga({ params }) {
  const { data, role, add, update, remove, toast } = useApp();
  const canEdit = role === "rw";
  const [tab, setTab] = useState(params.tab || "all");
  const [rw, setRw] = useState("");
  const [q, setQ] = useState(params.q || "");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(null);
  const [errs, setErrs] = useState({});
  const [detail, setDetail] = useState(params.detail || null);
  const [del, setDel] = useState(null);

  const R = data.rumah;
  const count = (s) => R.filter((h) => h.status === s).length;
  let rows = R.filter((h) => (tab === "all" || h.status === tab) && (!rw || String(h.rw) === rw));
  if (q) {
    const s = q.toLowerCase();
    rows = rows.filter((h) => [h.id, h.owner, h.penyewa, h.hp, h.penyewaHp, h.penunggu, vText(h)].some((x) => String(x || "").toLowerCase().includes(s)));
  }
  rows = [...rows].sort((a, b) => a.blok.localeCompare(b.blok) || a.no - b.no);
  const view = rows.slice((page - 1) * SIZE, page * SIZE);
  const cur = detail ? R.find((h) => h.id === detail) : null;

  const rumahCol = { label: "Rumah", render: (h) => <div><p className="font-semibold text-navy">{h.id}</p><p className="text-xs text-slate-500">RW {h.rw}</p></div> };
  const statusCol = { label: "Status", render: (h) => <Badge tone={ST[h.status][1]}>{ST[h.status][0]}</Badge> };
  const kontrak = (h) => { const d = daysUntil(h.kontrakSelesai); return <div><p className="text-xs">{fmtDate(h.kontrakMulai)} - {fmtDate(h.kontrakSelesai)}</p>{d < 0 ? <Badge tone="red">Berakhir</Badge> : d <= 60 ? <Badge tone="yellow">{d} hari lagi</Badge> : null}</div>; };
  const columns = tab === "ngontrak"
    ? [rumahCol, { label: "Pengontrak", render: (h) => <div><p className="font-medium">{h.penyewa}</p><p className="text-xs text-slate-500">{h.penyewaHp}</p></div> }, { label: "Pemilik", render: (h) => <div><p>{h.owner}</p><p className="text-xs text-slate-500">{h.hp}</p></div> }, { label: "Kontrak", render: kontrak }, { label: "Orang", key: "penghuni" }, { label: "Kendaraan", render: vText }]
    : tab === "ditinggal"
    ? [rumahCol, { label: "Pemilik", key: "owner" }, { label: "Domisili baru", render: (h) => `${h.kota}, ${h.provinsi}` }, { label: "Penunggu", render: (h) => <div><p>{h.penunggu}</p><p className="text-xs text-slate-500">{h.penungguHp}</p></div> }, { label: "Sejak", render: (h) => fmtDate(h.mulaiDitinggal) }]
    : [rumahCol, { label: "Nama", render: (h) => <div><p className="font-medium">{h.status === "ngontrak" ? h.penyewa : h.owner}</p><p className="text-xs text-slate-500">{h.status === "ngontrak" ? "Pemilik: " + h.owner : h.hp}</p></div> }, statusCol, { label: "Penghuni", render: (h) => h.penghuni || "-" }, { label: "Kendaraan", render: vText }];

  const openForm = (h) => { setEditing(h ? h.id : null); setForm(h ? JSON.parse(JSON.stringify(h)) : blank()); setErrs({}); };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = () => {
    const e = validate(form); setErrs(e);
    if (Object.keys(e).length) return toast("Periksa kolom yang berwarna merah", "yellow");
    const id = `${form.blok}-${Number(form.no)}`;
    const payload = { ...form, no: Number(form.no), rw: Number(form.rw), penghuni: form.status === "ditinggal" ? 0 : Number(form.penghuni), id };
    if (editing) { update("rumah", editing, payload); toast("Data diperbarui"); }
    else {
      if (R.some((h) => h.id === id)) return toast(`Rumah ${id} sudah terdaftar. Gunakan tombol Edit.`, "red");
      add("rumah", payload); toast("Data rumah ditambahkan");
    }
    setForm(null);
  };

  return (
    <div>
      <PageHeader title="Warga & Rumah" desc="Database 600 rumah di RW 29 dan RW 31, dikelompokkan menurut status hunian." action={canEdit && <Button icon="plus" onClick={() => openForm(null)}>Tambah data</Button>} />
      <Tabs value={tab} onChange={(t) => { setTab(t); setPage(1); }} tabs={[{ id: "all", label: "Semua", count: R.length }, { id: "tinggal", label: "Warga Tinggal", count: count("tinggal") }, { id: "ngontrak", label: "Warga Ngontrak", count: count("ngontrak") }, { id: "ditinggal", label: "Rumah Ditinggal", count: count("ditinggal") }]} />
      <Card>
        <div className="mb-4 flex flex-wrap gap-3">
          <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Cari nama, blok, plat, atau nomor HP" />
          <Select value={rw} onChange={(e) => { setRw(e.target.value); setPage(1); }} placeholder="Semua RW" options={[{ value: "29", label: "RW 29" }, { value: "31", label: "RW 31" }]} className="!w-auto min-w-[130px]" />
        </div>
        <DataTable columns={columns} rows={view} onRow={(h) => setDetail(h.id)} empty="Tidak ada data yang cocok." />
        <Pagination page={page} total={rows.length} size={SIZE} onPage={setPage} />
      </Card>

      <Modal open={!!cur} onClose={() => setDetail(null)} title={cur ? `Rumah ${cur.id}` : ""} wide footer={canEdit && cur ? <><Button variant="ghost" onClick={() => setDel(cur)}>Hapus</Button><Button onClick={() => { const h = cur; setDetail(null); openForm(h); }}>Edit data</Button></> : null}>
        {cur && (
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {[
              ["Status", ST[cur.status][0]], ["RW", cur.rw], ["Pemilik (sesuai KTP)", cur.owner], ["No. KK", cur.kk], ["No. KTP", cur.ktp], ["HP pemilik", cur.hp],
              ...(cur.status === "tinggal" ? [["Jumlah penghuni", cur.penghuni]] : []),
              ...(cur.status === "ngontrak" ? [["Pengontrak", cur.penyewa], ["KTP pengontrak", cur.penyewaKtp], ["HP pengontrak", cur.penyewaHp], ["Jumlah orang", cur.penghuni], ["Kontrak", `${fmtDate(cur.kontrakMulai)} - ${fmtDate(cur.kontrakSelesai)}`]] : []),
              ...(cur.status === "ditinggal" ? [["Alamat baru", `${cur.kota}, ${cur.provinsi}`], ["Penunggu rumah", cur.penunggu], ["Telepon penunggu", cur.penungguHp], ["Ditinggal sejak", fmtDate(cur.mulaiDitinggal)]] : []),
              ["Kendaraan", vText(cur)], ["IPL", cur.iplStatus === "lunas" ? "Lunas" : `Menunggak ${cur.tunggakan} bulan`],
            ].map(([k, v]) => <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="mt-0.5 text-sm font-medium text-navy">{v}</dd></div>)}
          </dl>
        )}
      </Modal>

      <Modal open={!!form} onClose={() => setForm(null)} wide title={editing ? `Edit rumah ${editing}` : "Tambah data rumah"} footer={<><Button variant="ghost" onClick={() => setForm(null)}>Batal</Button><Button onClick={save}>Simpan</Button></>}>
        {form && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status hunian *" className="sm:col-span-2"><Select value={form.status} onChange={(e) => set("status", e.target.value)} options={[{ value: "tinggal", label: "Warga Tinggal (pemilik menempati)" }, { value: "ngontrak", label: "Warga Ngontrak (penyewa)" }, { value: "ditinggal", label: "Rumah Ditinggal (pemilik pindah)" }]} /></Field>
            <Field label="RW *"><Select value={form.rw} disabled={!!editing} onChange={(e) => setForm({ ...form, rw: e.target.value, blok: BLOK_RW[e.target.value][0] })} options={["29", "31"]} /></Field>
            <Field label="Blok *"><Select value={form.blok} disabled={!!editing} onChange={(e) => set("blok", e.target.value)} options={BLOK_RW[form.rw]} /></Field>
            <Field label="Nomor rumah (1-60) *" error={errs.no}><Input type="number" min="1" max="60" value={form.no} disabled={!!editing} onChange={(e) => set("no", e.target.value)} /></Field>
            <Field label="Nama pemilik (sesuai KTP) *" error={errs.owner}><Input value={form.owner} onChange={(e) => set("owner", e.target.value)} /></Field>
            <Field label="Nomor KK *" error={errs.kk}><Input inputMode="numeric" value={form.kk} onChange={(e) => set("kk", e.target.value.replace(/\D/g, ""))} placeholder="16 digit" /></Field>
            <Field label="Nomor KTP pemilik *" error={errs.ktp}><Input inputMode="numeric" value={form.ktp} onChange={(e) => set("ktp", e.target.value.replace(/\D/g, ""))} placeholder="16 digit" /></Field>
            <Field label="Nomor HP pemilik *" error={errs.hp}><Input value={form.hp} onChange={(e) => set("hp", e.target.value)} /></Field>
            {form.status === "tinggal" && <Field label="Jumlah penghuni *" error={errs.penghuni}><Input type="number" min="1" value={form.penghuni} onChange={(e) => set("penghuni", e.target.value)} /></Field>}
            {form.status === "ngontrak" && (<>
              <Field label="Nama pengontrak *" error={errs.penyewa}><Input value={form.penyewa} onChange={(e) => set("penyewa", e.target.value)} /></Field>
              <Field label="KTP pengontrak *" error={errs.penyewaKtp}><Input inputMode="numeric" value={form.penyewaKtp} onChange={(e) => set("penyewaKtp", e.target.value.replace(/\D/g, ""))} placeholder="16 digit" /></Field>
              <Field label="HP pengontrak *" error={errs.penyewaHp}><Input value={form.penyewaHp} onChange={(e) => set("penyewaHp", e.target.value)} /></Field>
              <Field label="Jumlah orang yang tinggal *" error={errs.penghuni}><Input type="number" min="1" value={form.penghuni} onChange={(e) => set("penghuni", e.target.value)} /></Field>
              <Field label="Kontrak mulai *" error={errs.kontrakMulai}><Input type="date" value={form.kontrakMulai} onChange={(e) => set("kontrakMulai", e.target.value)} /></Field>
              <Field label="Kontrak selesai *" error={errs.kontrakSelesai}><Input type="date" value={form.kontrakSelesai} onChange={(e) => set("kontrakSelesai", e.target.value)} /></Field>
            </>)}
            {form.status === "ditinggal" && (<>
              <Field label="Kota tinggal baru *" error={errs.kota}><Input value={form.kota} onChange={(e) => set("kota", e.target.value)} /></Field>
              <Field label="Provinsi *" error={errs.provinsi}><Input value={form.provinsi} onChange={(e) => set("provinsi", e.target.value)} /></Field>
              <Field label="Nama penunggu rumah *" error={errs.penunggu}><Input value={form.penunggu} onChange={(e) => set("penunggu", e.target.value)} /></Field>
              <Field label="Telepon penunggu *" error={errs.penungguHp}><Input value={form.penungguHp} onChange={(e) => set("penungguHp", e.target.value)} /></Field>
              <Field label="Tanggal mulai ditinggal *" error={errs.mulaiDitinggal}><Input type="date" max={ymd(new Date())} value={form.mulaiDitinggal} onChange={(e) => set("mulaiDitinggal", e.target.value)} /></Field>
            </>)}
            {form.status !== "ditinggal" && (
              <div className="sm:col-span-2">
                <p className="mb-2 text-[13px] font-semibold text-navy">Kendaraan</p>
                <div className="space-y-2">
                  {form.kendaraan.map((v, i) => (
                    <div key={i} className="flex gap-2">
                      <Select value={v.jenis} onChange={(e) => set("kendaraan", form.kendaraan.map((x, j) => (j === i ? { ...x, jenis: e.target.value } : x)))} options={["Mobil", "Motor"]} className="!w-28" />
                      <div className="flex-1"><Input value={v.plat} placeholder="B 1234 ABC" onChange={(e) => set("kendaraan", form.kendaraan.map((x, j) => (j === i ? { ...x, plat: e.target.value.toUpperCase() } : x)))} />{errs["v" + i] && <span className="text-xs text-rose-600">{errs["v" + i]}</span>}</div>
                      <button onClick={() => set("kendaraan", form.kendaraan.filter((_, j) => j !== i))} className="rounded-xl px-2 text-slate-400 hover:bg-slate-100" aria-label="Hapus kendaraan"><Icon n="x" className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
                <Button variant="soft" className="mt-2" icon="plus" onClick={() => set("kendaraan", [...form.kendaraan, { jenis: "Mobil", plat: "" }])}>Tambah kendaraan</Button>
              </div>
            )}
          </div>
        )}
      </Modal>
      <Confirm open={!!del} onClose={() => setDel(null)} title={`Hapus rumah ${del ? del.id : ""}?`} desc="Data rumah akan dihapus dari database prototype." okText="Hapus" onOk={() => { remove("rumah", del.id); setDetail(null); toast("Data dihapus"); }} />
    </div>
  );
}
