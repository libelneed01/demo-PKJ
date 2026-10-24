"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { fmtDate } from "@/lib/format";
import Crud, { StatusEditor } from "../Crud";
import { Badge, Card, Tabs, DataTable } from "../ui";

const RW = ["RW 29", "RW 31"];

export function Pengaduan({ params }) {
  const { role, session, data } = useApp();
  const mine = role === "warga";
  const h = mine ? data.rumah.find((x) => x.id === session.houseId) : null;
  const ST = ["Baru", "Diproses", "Selesai"];
  const tones = { Baru: "red", Diproses: "yellow", Selesai: "green" };
  return (
    <Crud
      col="pengaduan" title={mine ? "Pengaduan Saya" : "Pengaduan Warga"} desc="Sampaikan keluhan atau masukan. Pengurus akan menindaklanjuti dan memberi catatan."
      params={params} statusKey="status" tones={tones} statusOptions={ST} searchKeys={["judul", "pelapor", "rumah", "kategori"]} addLabel="Buat pengaduan"
      rowFilter={mine ? (r) => r.rumah === session.houseId : undefined} defaults={mine && h ? { rumah: h.id, pelapor: h.owner } : {}}
      fields={[
        { key: "pelapor", label: "Nama pelapor", required: true }, { key: "rumah", label: "Blok & nomor rumah", required: true, placeholder: "Contoh: C-12" },
        { key: "kategori", label: "Kategori", type: "select", required: true, options: ["Keamanan", "Kebersihan", "Fasilitas", "Kebisingan", "Sosial", "Lainnya"] },
        { key: "judul", label: "Judul pengaduan", required: true },
        { key: "deskripsi", label: "Uraian", type: "textarea", required: true }, { key: "foto", label: "Foto pendukung (opsional)", type: "file" },
      ]}
      makeItem={(v) => ({ ...v, status: "Baru", catatan: "" })}
      columns={[
        { label: "Pengaduan", render: (r) => <div><p className="font-semibold text-navy">{r.judul}</p><p className="text-xs text-slate-500">{r.pelapor} - {r.rumah}</p></div> },
        { label: "Kategori", key: "kategori" }, { label: "Tanggal", render: (r) => fmtDate(r.at) },
        { label: "Status", render: (r) => <Badge tone={tones[r.status]}>{r.status}</Badge> },
      ]}
      detailActions={(r) => <StatusEditor col="pengaduan" row={r} options={ST} canEdit={role !== "warga"} />}
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
