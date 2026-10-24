"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { KOORDINATOR, ROLES } from "@/lib/config";
import { fmtDate, ymd } from "@/lib/format";
import { Card, Button, Modal, Field, Input, Select, Textarea, Badge, PageHeader, Empty, Icon, Confirm } from "../ui";

const KAT = ["Umum", "Keamanan", "Kebersihan", "Kegiatan & Acara", "Keuangan & IPL", "Pemadaman Listrik/Air", "Kehilangan & Penemuan", "Darurat"];
const TONE = { Darurat: "red", Keamanan: "yellow", "Pemadaman Listrik/Air": "yellow", Kebersihan: "green", "Kegiatan & Acara": "green", "Keuangan & IPL": "navy", "Kehilangan & Penemuan": "gray", Umum: "navy" };
const blank = () => ({ judul: "", kategori: "", isi: "", berlaku: ymd(new Date(Date.now() + 7 * 86400000)), koordinator: false });

export default function Pengumuman() {
  const { data, role, add, remove, toast } = useApp();
  const canPost = role === "rw" || role === "rt" || role === "keamanan";
  const [form, setForm] = useState(null);
  const [kat, setKat] = useState("");
  const [del, setDel] = useState(null);

  const missing = form ? [!form.judul.trim() && "judul", !form.kategori && "kategori", !form.isi.trim() && "isi pengumuman", !form.berlaku && "tanggal berlaku", !form.koordinator && "konfirmasi koordinator keamanan"].filter(Boolean) : [];
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = () => {
    if (missing.length) return toast("Lengkapi semua kolom wajib", "yellow");
    add("pengumuman", { ...form, judul: form.judul.trim(), isi: form.isi.trim(), penulis: ROLES[role] });
    setForm(null); toast("Pengumuman diterbitkan");
  };
  const list = data.pengumuman.filter((a) => !kat || a.kategori === kat).sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div>
      <PageHeader title="Pengumuman" desc="Informasi resmi untuk seluruh warga RW 29 dan RW 31." action={canPost && <Button icon="plus" onClick={() => setForm(blank())}>Buat pengumuman</Button>} />
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {["", ...KAT].map((k) => (
          <button key={k || "all"} onClick={() => setKat(k)} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold ${kat === k ? "bg-navy text-white" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200"}`}>{k || "Semua"}</button>
        ))}
      </div>
      {list.length === 0 ? <Empty text="Belum ada pengumuman pada kategori ini." /> : (
        <div className="space-y-4">
          {list.map((a) => (
            <Card key={a.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0"><Badge tone={TONE[a.kategori] || "gray"}>{a.kategori}</Badge><h2 className="mt-2 text-lg font-bold text-navy">{a.judul}</h2></div>
                {role === "rw" && <button onClick={() => setDel(a)} className="text-xs font-semibold text-rose-600">Hapus</button>}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{a.isi}</p>
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>Oleh {a.penulis}</span><span>Terbit {fmtDate(a.at)}</span><span>Berlaku s/d {fmtDate(a.berlaku)}</span>
                {a.koordinator && <span className="inline-flex items-center gap-1 text-emerald-700"><Icon n="check" className="h-3.5 w-3.5" />Koordinator keamanan sudah dihubungi</span>}
              </p>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!form} onClose={() => setForm(null)} title="Buat pengumuman" wide footer={<><Button variant="ghost" onClick={() => setForm(null)}>Batal</Button><Button disabled={missing.length > 0} onClick={submit}>Terbitkan</Button></>}>
        {form && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Judul *" className="sm:col-span-2"><Input value={form.judul} onChange={(e) => set("judul", e.target.value)} /></Field>
            <Field label="Kategori *"><Select value={form.kategori} onChange={(e) => set("kategori", e.target.value)} options={KAT} placeholder="Pilih kategori" /></Field>
            <Field label="Berlaku sampai *"><Input type="date" value={form.berlaku} onChange={(e) => set("berlaku", e.target.value)} /></Field>
            <Field label="Isi pengumuman *" className="sm:col-span-2"><Textarea rows={5} value={form.isi} onChange={(e) => set("isi", e.target.value)} /></Field>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-mint-50 p-4 sm:col-span-2">
              <input type="checkbox" checked={form.koordinator} onChange={(e) => set("koordinator", e.target.checked)} className="mt-0.5 h-5 w-5 accent-emerald-600" />
              <span className="text-sm text-navy"><b>Sudah menghubungi Koordinator Keamanan *</b><br /><span className="text-slate-600">{KOORDINATOR.nama} ({KOORDINATOR.hp})</span></span>
            </label>
            {missing.length > 0 && <p className="text-xs font-medium text-amber-700 sm:col-span-2">Belum bisa diterbitkan. Lengkapi: {missing.join(", ")}.</p>}
          </div>
        )}
      </Modal>
      <Confirm open={!!del} onClose={() => setDel(null)} title="Hapus pengumuman?" desc={del ? `"${del.judul}" akan dihapus.` : ""} okText="Hapus" onOk={() => { remove("pengumuman", del.id); toast("Pengumuman dihapus"); }} />
    </div>
  );
}
