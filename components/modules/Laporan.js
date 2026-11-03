"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { fmtDate } from "@/lib/format";
import Crud, { StatusEditor } from "../Crud";
import { Badge, Card, Tabs, DataTable, Button, Field, Select } from "../ui";
import { SIFAT_OPTS, SIFAT_TONE, SIFAT_LABEL, canSeePengaduan, maskPengaduan } from "@/lib/privacy";

const RW = ["RW 29", "RW 31"];

function SifatEditor({ row }) {
  const { update, toast } = useApp();
  const [v, setV] = useState(row.sifat || "Pengurus");
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="mb-3 text-sm font-bold text-navy">Tingkat kerahasiaan</p>
      <div className="flex flex-wrap items-end gap-3"><div className="min-w-[260px] flex-1"><Select value={v} onChange={(e) => setV(e.target.value)} options={SIFAT_OPTS} /></div><Button variant="ghost" onClick={() => { update("pengaduan", row.id, { sifat: v }); toast("Tingkat kerahasiaan diubah"); }}>Simpan</Button></div>
    </div>
  );
}

export function Pengaduan({ params }) {
  const { role, session, data } = useApp();
  const ST = ["Baru", "Diproses", "Selesai"];
  const tones = { Baru: "red", Diproses: "yellow", Selesai: "green" };
  const mine = role === "warga";
  const [tab, setTab] = useState("saya");
  const ctx = { role, session, data };
  const h = mine ? data.rumah.find((x) => x.id === session.houseId) : null;
  const isPublicTab = mine && tab === "umum";
  const rowFilter = mine ? (tab === "saya" ? (r) => r.rumah === session.houseId : (r) => (r.sifat || "Pengurus") === "Umum") : (r) => canSeePengaduan(r, ctx);
  const tabs = mine ? <Tabs value={tab} onChange={setTab} tabs={[{ id: "saya", label: "Pengaduan saya" }, { id: "umum", label: "Pengaduan umum komplek" }]} /> : null;
  return (
    <Crud
      col="pengaduan" title={mine ? (isPublicTab ? "Pengaduan Umum" : "Pengaduan Saya") : "Pengaduan Warga"}
      desc={mine ? (isPublicTab ? "Pengaduan tentang fasilitas dan lingkungan yang dibuka untuk semua warga. Nama pelapor disamarkan." : "Hanya Anda dan pengurus yang berwenang yang bisa melihat pengaduan pribadi atau rahasia Anda.") : "Pengaduan dibatasi menurut tingkat kerahasiaan. Pengaduan rahasia hanya terlihat oleh Pengurus RT dan RW."}
      params={params} statusKey="status" tones={tones} statusOptions={ST} searchKeys={["judul", "pelapor", "rumah", "kategori", "lokasi"]} addLabel="Buat pengaduan" canAdd={!isPublicTab}
      extraTop={tabs} rowFilter={rowFilter} mapRow={(r) => maskPengaduan(r, ctx)} defaults={mine && h ? { rumah: h.id, pelapor: h.owner } : {}}
      fields={[
        { key: "pelapor", label: "Nama pelapor", required: true }, { key: "rumah", label: "Blok & nomor rumah", required: true, placeholder: "Contoh: C-12" },
        { key: "kategori", label: "Kategori", type: "select", required: true, options: ["Keamanan", "Kebersihan", "Fasilitas", "Kebisingan", "Sosial", "Lainnya"] },
        { key: "judul", label: "Judul pengaduan", required: true }, { key: "lokasi", label: "Lokasi kejadian", required: true, placeholder: "Contoh: Taman RW 29" },
        { key: "sifat", label: "Siapa yang boleh melihat? *", type: "select", required: true, default: "Pengurus", options: SIFAT_OPTS, full: true },
        { key: "terlapor", label: "Pihak yang dilaporkan (opsional, hanya dilihat RT dan RW)", placeholder: "Blok dan nomor rumah, bila menyangkut tetangga", full: true },
        { key: "deskripsi", label: "Uraian", type: "textarea", required: true }, { key: "foto", label: "Foto pendukung (opsional)", type: "file" },
      ]}
      makeItem={(v) => ({ ...v, status: "Baru", catatan: "" })}
      columns={[
        { label: "Pengaduan", render: (r) => <div><p className="font-semibold text-navy">{r.judul}</p><p className="text-xs text-slate-500">{r.pelapor}{r.rumah && r.rumah !== "-" ? " - " + r.rumah : ""}</p></div> },
        { label: "Kategori", key: "kategori" }, { label: "Sifat", render: (r) => <Badge tone={SIFAT_TONE[r.sifat || "Pengurus"]}>{SIFAT_LABEL[r.sifat || "Pengurus"]}</Badge> }, { label: "Tanggal", render: (r) => fmtDate(r.at) },
        { label: "Status", render: (r) => <Badge tone={tones[r.status]}>{r.status}</Badge> },
      ]}
      detailActions={(r) => (<>
        {r.terlapor && <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800"><b>Pihak yang dilaporkan:</b> {r.terlapor} (hanya terlihat RT dan RW)</p>}
        {(role === "rw" || role === "rt") && <SifatEditor row={r} />}
        <StatusEditor col="pengaduan" row={r} options={ST} canEdit={role !== "warga" && role !== "bendahara"} />
      </>)}
    />
  );
}

export function Kerusakan({ params }) {
  const { role } = useApp();
  const ST = ["Dilaporkan", "Dikerjakan", "Selesai"];
  const tones = { Dilaporkan: "red", Dikerjakan: "yellow", Selesai: "green" };
  const lv = { Ringan: "green", Sedang: "yellow", Berat: "red" };
  return (
    <Crud
      col="kerusakan" title="Kerusakan Fasilitas" desc="Laporkan fasilitas umum yang rusak beserta tingkat kerusakannya."
      params={params} statusKey="status" tones={tones} statusOptions={ST} searchKeys={["fasilitas", "lokasi", "tingkat"]} addLabel="Lapor kerusakan"
      fields={[
        { key: "fasilitas", label: "Fasilitas yang rusak", required: true, placeholder: "Contoh: Lampu jalan" }, { key: "lokasi", label: "Lokasi", required: true, placeholder: "Contoh: Blok C" },
        { key: "rw", label: "RW", type: "select", required: true, options: RW }, { key: "tingkat", label: "Tingkat kerusakan", type: "select", required: true, options: ["Ringan", "Sedang", "Berat"] },
        { key: "deskripsi", label: "Keterangan", type: "textarea", required: true }, { key: "foto", label: "Foto kerusakan", type: "file" },
        { key: "pelapor", label: "Nama pelapor", required: true },
      ]}
      makeItem={(v) => ({ ...v, status: "Dilaporkan", catatan: "" })}
      columns={[
        { label: "Fasilitas", render: (r) => <div><p className="font-semibold text-navy">{r.fasilitas}</p><p className="text-xs text-slate-500">{r.lokasi} - {r.rw}</p></div> },
        { label: "Tingkat", render: (r) => <Badge tone={lv[r.tingkat]}>{r.tingkat}</Badge> }, { label: "Tanggal", render: (r) => fmtDate(r.at) },
        { label: "Perbaikan", render: (r) => <Badge tone={tones[r.status]}>{r.status}</Badge> },
      ]}
      detailActions={(r) => <StatusEditor col="kerusakan" row={r} options={ST} canEdit={role !== "warga"} />}
    />
  );
}

export function Sampah({ params }) {
  const { role, data } = useApp();
  const [tab, setTab] = useState(params.tab || "jadwal");
  const [sw, setSw] = useState(false);
  const ST = ["Dilaporkan", "Dijadwalkan", "Diangkut"];
  const tones = { Dilaporkan: "red", Dijadwalkan: "yellow", Diangkut: "green" };
  const today = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][new Date().getDay()];
  const tabs = <Tabs value={tab} onChange={(t) => { setSw(true); setTab(t); }} tabs={[{ id: "jadwal", label: "Jadwal angkut" }, { id: "laporan", label: "Laporan tumpukan", count: data.sampahLaporan.length }]} />;

  if (tab === "jadwal") {
    return (
      <div>
        <div className="mb-6"><h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[28px]">Laporan Sampah</h1><p className="mt-1 text-sm text-slate-500">Jadwal pengangkutan rutin dan pelaporan tumpukan sampah.</p></div>
        {tabs}
        <Card>
          <DataTable columns={[
            { label: "Hari", render: (r) => <span className="font-semibold text-navy">{r.hari}{r.hari === today && <span className="ml-2"><Badge tone="green">Hari ini</Badge></span>}</span> },
            { label: "Area", key: "area" }, { label: "Jam", key: "jam" },
          ]} rows={data.jadwalSampah} />
        </Card>
      </div>
    );
  }
  return (
    <Crud
      col="sampahLaporan" title="Laporan Sampah" desc="Laporkan tumpukan sampah yang belum terangkut."
      params={sw ? { ...params, add: false } : params} statusKey="status" tones={tones} statusOptions={ST} searchKeys={["lokasi", "ukuran", "rw"]} addLabel="Lapor tumpukan" extraTop={tabs}
      fields={[
        { key: "lokasi", label: "Lokasi tumpukan", required: true, placeholder: "Contoh: Pojok Blok H" }, { key: "rw", label: "RW", type: "select", required: true, options: RW },
        { key: "ukuran", label: "Perkiraan ukuran", type: "select", required: true, options: ["Kecil", "Sedang", "Besar"] }, { key: "pelapor", label: "Nama pelapor", required: true },
        { key: "deskripsi", label: "Keterangan", type: "textarea" }, { key: "foto", label: "Foto", type: "file" },
      ]}
      makeItem={(v) => ({ ...v, status: "Dilaporkan", catatan: "" })}
      columns={[
        { label: "Lokasi", render: (r) => <div><p className="font-semibold text-navy">{r.lokasi}</p><p className="text-xs text-slate-500">{r.rw} - {r.pelapor}</p></div> },
        { label: "Ukuran", key: "ukuran" }, { label: "Tanggal", render: (r) => fmtDate(r.at) },
        { label: "Status", render: (r) => <Badge tone={tones[r.status]}>{r.status}</Badge> },
      ]}
      detailActions={(r) => <StatusEditor col="sampahLaporan" row={r} options={ST} canEdit={role === "kebersihan" || role === "rw"} />}
    />
  );
}
