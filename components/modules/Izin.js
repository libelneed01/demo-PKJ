"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { fmtDate, fmtDT, ymd } from "@/lib/format";
import Crud from "../Crud";
import { Badge, Button, Field, Input, Icon } from "../ui";

const STEPS = ["Diajukan", "Disetujui RT", "Disetujui RW", "Disetujui Keamanan", "Selesai"];
const tones = { Diajukan: "yellow", "Disetujui RT": "navy", "Disetujui RW": "navy", "Disetujui Keamanan": "green", Selesai: "green", Ditolak: "red" };
const JENIS = ["Renovasi", "Pesta Ulang Tahun", "Pesta Pernikahan", "Kumpulan Keagamaan", "Arisan Keluarga", "Acara Lainnya"];
const LEVEL = ["RT", "RW", "Keamanan", "Penyelesaian"];
// role yang boleh memproses tiap tahap (RT dan RW ditangani Pengurus RW pada prototype ini)
const WHO = { 0: ["rw"], 1: ["rw"], 2: ["keamanan"], 3: ["keamanan", "rw"] };
const ACT = ["Setujui sebagai RT", "Setujui sebagai RW", "Setujui sebagai Keamanan", "Tandai selesai"];

function Stepper({ row }) {
  return (
    <ol className="flex items-start">
      {STEPS.map((s, i) => {
        const done = i < row.tahap || (i === row.tahap && !row.ditolak && row.tahap === 4);
        const cur = i === row.tahap;
        const bad = row.ditolak && cur;
        return (
          <li key={s} className="flex flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center">
              <span className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : done || cur ? "bg-mint-500" : "bg-slate-200"}`} />
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${bad ? "bg-rose-500 text-white" : done ? "bg-mint-500 text-white" : cur ? "bg-navy text-white" : "bg-slate-100 text-slate-400"}`}>
                {bad ? <Icon n="x" className="h-4 w-4" /> : done ? <Icon n="check" className="h-4 w-4" /> : i + 1}
              </span>
              <span className={`h-0.5 flex-1 ${i === STEPS.length - 1 ? "opacity-0" : i < row.tahap ? "bg-mint-500" : "bg-slate-200"}`} />
            </div>
            <span className={`mt-1.5 px-1 text-[11px] leading-tight ${cur ? "font-semibold text-navy" : "text-slate-500"}`}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}

function Actions({ row }) {
  const { role, update, toast } = useApp();
  const [catatan, setCatatan] = useState("");
  const can = !row.ditolak && row.tahap < 4 && WHO[row.tahap].includes(role);
  const log = row.log || [];
  const push = (aksi, extra) => [...log, { level: LEVEL[row.tahap], aksi, catatan: catatan.trim(), at: new Date().toISOString() }];
  const approve = () => { const t = row.tahap + 1; update("izin", row.id, { tahap: t, status: STEPS[t], log: push("Setuju") }); toast(`Status: ${STEPS[t]}`); setCatatan(""); };
  const reject = () => {
    if (!catatan.trim()) return toast("Isi catatan alasan penolakan", "yellow");
    update("izin", row.id, { ditolak: true, status: "Ditolak", alasan: catatan.trim(), log: push("Tolak") }); toast("Pengajuan ditolak", "red"); setCatatan("");
  };
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-50 p-4"><p className="mb-3 text-sm font-bold text-navy">Alur persetujuan</p><Stepper row={row} /></div>
      {row.ditolak && <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700"><b>Ditolak.</b> {row.alasan}</div>}
      {log.length > 0 && (
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="mb-3 text-sm font-bold text-navy">Catatan tiap level</p>
          <ul className="space-y-2">{log.map((l, i) => <li key={i} className="flex items-start gap-2 text-sm"><Badge tone={l.aksi === "Setuju" ? "green" : "red"}>{l.level}: {l.aksi}</Badge><span className="text-slate-600">{l.catatan || "Tanpa catatan"} <span className="text-xs text-slate-400">({fmtDT(l.at)})</span></span></li>)}</ul>
        </div>
      )}
      {can && (
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="mb-3 text-sm font-bold text-navy">Tindakan Anda ({LEVEL[row.tahap]})</p>
          <Field label="Catatan (wajib bila menolak)"><Input value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Contoh: dokumen lengkap, boleh lanjut" /></Field>
          <div className="mt-3 flex flex-wrap gap-2"><Button variant="mint" onClick={approve}>{ACT[row.tahap]}</Button>{row.tahap < 3 && <Button variant="danger" onClick={reject}>Tolak</Button>}</div>
        </div>
      )}
      {!can && !row.ditolak && row.tahap < 4 && <p className="text-xs text-slate-500">Menunggu tindakan dari {WHO[row.tahap].includes("keamanan") ? "Pengurus Keamanan" : "Pengurus RW"} untuk tahap {LEVEL[row.tahap]}.</p>}
    </div>
  );
}

export default function Izin({ params }) {
  const { role, session, data } = useApp();
  const mine = role === "warga";
  const h = mine ? data.rumah.find((x) => x.id === session.houseId) : null;
  return (
    <Crud
      col="izin" title={mine ? "Izin Saya" : "Izin Renovasi & Keramaian"} desc="Ajukan izin sebelum renovasi atau mengadakan acara. Alur: Diajukan, RT, RW, Keamanan, lalu Selesai."
      params={params} statusKey="status" tones={tones} statusOptions={[...STEPS, "Ditolak"]} searchKeys={["pemohon", "rumah", "jenis"]} addLabel="Ajukan izin"
      groups={[{ label: "Menunggu persetujuan", test: (r) => !r.ditolak && r.tahap < 3 }, { label: "Menunggu review Keamanan", test: (r) => !r.ditolak && r.tahap === 2 }]}
      rowFilter={mine ? (r) => r.rumah === session.houseId : undefined}
      fields={[
        { key: "pemohon", label: "Nama pemohon", required: true }, { key: "rumah", label: "Blok & nomor rumah", required: true, placeholder: "Contoh: B-23" },
        { key: "jenis", label: "Jenis izin", type: "select", required: true, options: JENIS }, { key: "jumlah", label: "Perkiraan jumlah tamu / pekerja", type: "number", required: true },
        { key: "mulai", label: "Tanggal mulai", type: "date", required: true }, { key: "selesai", label: "Tanggal selesai", type: "date", required: true },
        { key: "deskripsi", label: "Keterangan kegiatan", type: "textarea", required: true },
      ]}
      defaults={{ mulai: ymd(new Date()), selesai: ymd(new Date(Date.now() + 86400000)), ...(mine && h ? { rumah: h.id, pemohon: h.owner } : {}) }}
      makeItem={(v) => ({ ...v, tahap: 0, ditolak: false, alasan: "", status: "Diajukan", log: [] })}
      columns={[
        { label: "Pemohon", render: (r) => <div><p className="font-semibold text-navy">{r.pemohon}</p><p className="text-xs text-slate-500">{r.rumah}</p></div> },
        { label: "Jenis", render: (r) => <div><p>{r.jenis}</p><p className="text-xs text-slate-500">{r.deskripsi}</p></div> },
        { label: "Tanggal", render: (r) => <span className="text-xs">{fmtDate(r.mulai)} - {fmtDate(r.selesai)}</span> },
        { label: "Tahap", render: (r) => <Badge tone={tones[r.status]}>{r.status}</Badge> },
      ]}
      detailActions={(r) => <Actions row={r} />}
    />
  );
}
