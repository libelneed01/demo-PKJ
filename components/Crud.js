"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { fmtDate } from "@/lib/format";
import { Card, Button, Modal, Field, Input, Select, Textarea, FileInput, SearchBox, DataTable, Pagination, Badge, PageHeader, Confirm } from "./ui";

const SIZE = 12;

export default function Crud({ col, title, desc, fields, columns, makeItem, statusKey, tones = {}, statusOptions = [], params = {}, searchKeys = [], canAdd = true, addLabel = "Tambah laporan", detailActions, extraTop, uploadModul, defaults = {}, rowFilter, groups, doneStatus }) {
  const { data, role, add, remove, toast } = useApp();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState(params.status || "");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null);
  const [errs, setErrs] = useState({});
  const [detail, setDetail] = useState(null);
  const [del, setDel] = useState(null);
  const canDelete = role === "rw";
  const grp = groups || (statusOptions.length ? [{ label: "Belum selesai", test: (r) => r[statusKey] !== (doneStatus || statusOptions[statusOptions.length - 1]) }] : []);
  const kat = params.kategori || "";

  let rows = data[col] || [];
  if (rowFilter) rows = rows.filter(rowFilter);
  if (kat) rows = rows.filter((r) => r.kategori === kat);
  if (filter) { const g = grp.find((x) => x.label === filter); rows = rows.filter((r) => (g ? g.test(r) : r[statusKey] === filter)); }
  if (q) rows = rows.filter((r) => searchKeys.some((k) => String(r[k] || "").toLowerCase().includes(q.toLowerCase())));
  rows = [...rows].sort((a, b) => (b.at || "").localeCompare(a.at || ""));
  const view = rows.slice((page - 1) * SIZE, page * SIZE);
  const current = detail ? (data[col] || []).find((r) => r.id === detail) : null;

  const open = () => { setForm({ ...fields.reduce((o, f) => ({ ...o, [f.key]: f.default || "" }), {}), ...defaults }); setErrs({}); };
  useEffect(() => { if (params.add && canAdd) open(); }, []); // eslint-disable-line
  const submit = () => {
    const e = {};
    fields.forEach((f) => { if (f.required && !String(form[f.key] || "").trim()) e[f.key] = "Wajib diisi"; });
    setErrs(e);
    if (Object.keys(e).length) return toast("Lengkapi kolom yang wajib diisi", "yellow");
    add(col, makeItem(form));
    setForm(null); setPage(1);
    toast("Data berhasil disimpan");
  };

  return (
    <div>
      <PageHeader title={title} desc={desc} action={canAdd && <Button icon="plus" onClick={open}>{addLabel}</Button>} />
      {extraTop}
      <Card>
        <div className="mb-4 flex flex-wrap gap-3">
          <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} />
          {statusOptions.length > 0 && <Select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} placeholder="Semua status" options={[...grp.map((g) => g.label), ...statusOptions]} className="!w-auto min-w-[160px]" />}
          {kat && <span className="inline-flex items-center rounded-xl bg-mint-50 px-3 text-xs font-semibold text-mint-700">Kategori: {kat}</span>}
        </div>
        <DataTable columns={columns} rows={view} onRow={(r) => setDetail(r.id)} empty="Belum ada data. Tambahkan laporan pertama." />
        <Pagination page={page} total={rows.length} size={SIZE} onPage={setPage} />
      </Card>

      <Modal open={!!form} onClose={() => setForm(null)} title={addLabel} footer={<><Button variant="ghost" onClick={() => setForm(null)}>Batal</Button><Button onClick={submit}>Simpan</Button></>}>
        {form && (
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <Field key={f.key} label={f.label + (f.required ? " *" : "")} error={errs[f.key]} className={f.full || f.type === "textarea" || f.type === "file" ? "sm:col-span-2" : ""}>
                {f.type === "select" ? <Select value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} options={f.options} placeholder="Pilih…" />
                  : f.type === "textarea" ? <Textarea value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} />
                  : f.type === "file" ? <FileInput value={form[f.key]} onChange={(v) => setForm({ ...form, [f.key]: v })} modul={uploadModul || title} />
                  : <Input type={f.type || "text"} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} />}
              </Field>
            ))}
          </div>
        )}
      </Modal>

      <Modal open={!!current} onClose={() => setDetail(null)} title="Detail" wide footer={canDelete && current ? <Button variant="ghost" onClick={() => setDel(current)}>Hapus data</Button> : null}>
        {current && (
          <div className="space-y-5">
            {statusKey && <Badge tone={tones[current[statusKey]] || "gray"}>{current[statusKey]}</Badge>}
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                  <dt className="text-xs text-slate-500">{f.label}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-navy">{(f.type === "date" ? fmtDate(current[f.key]) : current[f.key]) || "-"}</dd>
                </div>
              ))}
              <div><dt className="text-xs text-slate-500">Dicatat</dt><dd className="mt-0.5 text-sm font-medium text-navy">{fmtDate(current.at)}</dd></div>
              {current.catatan && <div className="sm:col-span-2"><dt className="text-xs text-slate-500">Catatan pengurus</dt><dd className="mt-0.5 text-sm font-medium text-navy">{current.catatan}</dd></div>}
            </dl>
            {detailActions && detailActions(current)}
          </div>
        )}
      </Modal>
      <Confirm open={!!del} onClose={() => setDel(null)} title="Hapus data ini?" desc="Data akan dihapus permanen dari prototype ini." onOk={() => { remove(col, del.id); setDetail(null); toast("Data dihapus"); }} okText="Hapus" />
    </div>
  );
}

export function StatusEditor({ col, row, statusKey = "status", options, canEdit = true }) {
  const { update, toast } = useApp();
  const [st, setSt] = useState(row[statusKey]);
  const [note, setNote] = useState(row.catatan || "");
  if (!canEdit) return null;
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="mb-3 text-sm font-bold text-navy">Tindak lanjut pengurus</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Ubah status"><Select value={st} onChange={(e) => setSt(e.target.value)} options={options} /></Field>
        <Field label="Catatan"><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: sudah diteruskan ke tukang" /></Field>
      </div>
      <Button className="mt-3" variant="mint" onClick={() => { update(col, row.id, { [statusKey]: st, catatan: note }); toast("Status diperbarui"); }}>Simpan perubahan</Button>
    </div>
  );
}
