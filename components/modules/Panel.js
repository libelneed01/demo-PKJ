"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { Card, Button, PageHeader, Confirm } from "../ui";

const MODULES = [
  { label: "Warga & Rumah", cols: ["rumah"] }, { label: "Tamu & Kendaraan", cols: ["tamu"] },
  { label: "Keuangan (pengeluaran & pembayaran)", cols: ["pengeluaran", "pembayaran"] }, { label: "Pengumuman", cols: ["pengumuman"] },
  { label: "Absensi Security", cols: ["absenSecurity"] }, { label: "Absensi Kebersihan", cols: ["absenKebersihan"] },
  { label: "Serah Terima Security", cols: ["shiftSecurity"] }, { label: "Serah Terima Kebersihan", cols: ["shiftKebersihan"] },
  { label: "Pengaduan", cols: ["pengaduan"] }, { label: "Parkir (pelanggaran)", cols: ["pelanggaran"] },
  { label: "Laporan Sampah", cols: ["sampahLaporan"] }, { label: "Kerusakan Fasilitas", cols: ["kerusakan"] },
  { label: "Izin Renovasi & Keramaian", cols: ["izin"] }, { label: "Dokumen & upload", cols: ["uploads"] },
];

export default function Panel() {
  const { data, clearTesting, clearTestingCols, resetAll, toast } = useApp();
  const [c, setC] = useState(null);
  const test = (cols) => cols.reduce((a, k) => a + (data[k] || []).filter((i) => i._t).length, 0);
  const total = (cols) => cols.reduce((a, k) => a + (data[k] || []).length, 0);
  const all = MODULES.reduce((a, m) => a + test(m.cols), 0);

  return (
    <div>
      <PageHeader title="Panel Pengelola Data Demo" desc="Kelola data hasil uji coba. Perubahan hanya berlaku di browser ini karena data disimpan lokal." />
      <Card className="mb-4">
        <p className="text-sm text-slate-500">Total data testing</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-navy">{all}</p>
        <p className="mt-1 text-xs text-slate-500">Data yang ditambahkan penguji lewat aplikasi, di semua modul.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="danger" disabled={!all} onClick={() => setC({ title: "Hapus semua data testing?", desc: `${all} data testing di semua modul akan dihapus. Data dummy awal tetap ada.`, text: "HAPUS", fn: () => { clearTesting(); toast("Semua data testing dihapus"); } })}>Hapus semua data testing</Button>
          <Button variant="ghost" onClick={() => setC({ title: "Reset ke data dummy awal?", desc: "Semua perubahan di browser ini akan hilang dan diganti data dummy awal.", text: "RESET", fn: () => { resetAll(); toast("Data dikembalikan ke dummy awal"); } })}>Reset ke data dummy awal</Button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 text-base font-bold text-navy">Data per modul</h2>
        <p className="mb-4 text-sm text-slate-500">Menghapus hanya data testing pada modul tersebut. Data dummy awal tidak ikut terhapus.</p>
        <div className="grid gap-3 md:grid-cols-2">
          {MODULES.map((m) => (
            <div key={m.label} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <div className="min-w-0"><p className="truncate text-sm font-semibold text-navy">{m.label}</p><p className="text-xs text-slate-500">{test(m.cols)} data testing dari {total(m.cols)}</p></div>
              <Button variant="ghost" disabled={!test(m.cols)} onClick={() => setC({ title: `Hapus data testing: ${m.label}?`, desc: `${test(m.cols)} data testing akan dihapus.`, fn: () => { clearTestingCols(m.cols); toast(`Data testing ${m.label} dihapus`); } })}>Hapus</Button>
            </div>
          ))}
        </div>
      </Card>
      <Confirm open={!!c} onClose={() => setC(null)} title={c ? c.title : ""} desc={c ? c.desc : ""} requireText={c ? c.text : undefined} onOk={() => c.fn()} okText="Ya, lanjutkan" />
    </div>
  );
}
