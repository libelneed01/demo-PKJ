"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { flatKendaraan } from "@/lib/stats";
import { fmtDate } from "@/lib/format";
import Crud, { StatusEditor } from "../Crud";
import { Card, Tabs, SearchBox, Select, DataTable, Pagination, Badge, PageHeader, Stat } from "../ui";

export default function Parkir({ params }) {
  const { data } = useApp();
  const [tab, setTab] = useState(params.tab || "kendaraan");
  const [q, setQ] = useState("");
  const [jenis, setJenis] = useState("");
  const [page, setPage] = useState(1);
  const ST = ["Peringatan", "Ditindak", "Selesai"];
  const tones = { Peringatan: "yellow", Ditindak: "red", Selesai: "green" };
  const all = flatKendaraan(data);
  const tabs = <Tabs value={tab} onChange={setTab} tabs={[{ id: "kendaraan", label: "Kendaraan warga", count: all.length }, { id: "pelanggaran", label: "Pelanggaran parkir", count: data.pelanggaran.length }]} />;

  if (tab === "pelanggaran") {
    return (
      <Crud
        col="pelanggaran" title="Parkir & Kendaraan" desc="Catat pelanggaran parkir dan tindak lanjutnya." params={params} extraTop={tabs}
        statusKey="status" tones={tones} statusOptions={ST} searchKeys={["plat", "lokasi", "pelanggaran"]} addLabel="Catat pelanggaran"
        fields={[
          { key: "plat", label: "Plat nomor", required: true, placeholder: "B 1234 ABC" }, { key: "jenisKendaraan", label: "Jenis kendaraan", type: "select", required: true, options: ["Mobil", "Motor"] },
          { key: "lokasi", label: "Lokasi", required: true }, { key: "pelanggaran", label: "Jenis pelanggaran", type: "select", required: true, options: ["Parkir di bahu jalan", "Menutup akses gerbang rumah", "Parkir sembarang di taman", "Parkir ganda menghalangi", "Parkir di depan hydrant", "Kendaraan tamu parkir > 24 jam", "Lainnya"] },
          { key: "deskripsi", label: "Keterangan", type: "textarea" }, { key: "foto", label: "Foto bukti", type: "file" },
        ]}
        makeItem={(v) => ({ ...v, plat: v.plat.toUpperCase(), status: "Peringatan", catatan: "", pelapor: "Security" })}
        columns={[
          { label: "Kendaraan", render: (r) => <div><p className="font-semibold text-navy">{r.plat}</p><p className="text-xs text-slate-500">{r.jenisKendaraan}</p></div> },
          { label: "Pelanggaran", render: (r) => <div><p>{r.pelanggaran}</p><p className="text-xs text-slate-500">{r.lokasi}</p></div> }, { label: "Tanggal", render: (r) => fmtDate(r.at) },
          { label: "Status", render: (r) => <Badge tone={tones[r.status]}>{r.status}</Badge> },
        ]}
        detailActions={(r) => <StatusEditor col="pelanggaran" row={r} options={ST} />}
      />
    );
  }

  let rows = all;
  if (jenis) rows = rows.filter((v) => v.jenis === jenis);
  if (q) rows = rows.filter((v) => [v.plat, v.nama, v.houseId].some((x) => String(x).toLowerCase().includes(q.toLowerCase())));
  const mobil = all.filter((v) => v.jenis === "Mobil").length;
  return (
    <div>
      <PageHeader title="Parkir & Kendaraan" desc="Daftar seluruh kendaraan terdaftar milik warga dan pengontrak." />
      {tabs}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Stat label="Total kendaraan" value={all.length} icon="car" /><Stat label="Mobil" value={mobil} icon="car" /><Stat label="Motor" value={all.length - mobil} icon="car" />
      </div>
      <Card>
        <div className="mb-4 flex flex-wrap gap-3">
          <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Cari plat, nama, atau blok" />
          <Select value={jenis} onChange={(e) => { setJenis(e.target.value); setPage(1); }} placeholder="Semua jenis" options={["Mobil", "Motor"]} className="!w-auto min-w-[130px]" />
        </div>
        <DataTable rows={rows.slice((page - 1) * 12, page * 12).map((v, i) => ({ ...v, id: v.plat + i }))} columns={[
          { label: "Plat", render: (v) => <span className="font-semibold text-navy">{v.plat}</span> }, { label: "Jenis", key: "jenis" }, { label: "Pemilik / pengguna", key: "nama" },
          { label: "Rumah", render: (v) => `${v.houseId} (RW ${v.rw})` }, { label: "Status hunian", render: (v) => <Badge tone={v.status === "ngontrak" ? "navy" : "green"}>{v.status === "ngontrak" ? "Pengontrak" : "Pemilik"}</Badge> },
        ]} />
        <Pagination page={page} total={rows.length} size={12} onPage={setPage} />
      </Card>
    </div>
  );
}
