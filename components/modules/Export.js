"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { exportExcel, exportPDF } from "@/lib/export";
import { Card, Button, PageHeader, Icon } from "../ui";

const CONTENT = ["Ringkasan seluruh modul", "Database warga & rumah (600 rumah)", "IPL menunggak dan pengeluaran", "Tamu & kendaraan", "Absensi security dan kebersihan", "Pengaduan, kerusakan, sampah, izin", "Serah terima shift security & kebersihan, pelanggaran parkir"];

export default function Export() {
  const { data, toast } = useApp();
  const [busy, setBusy] = useState("");
  const run = async (kind) => {
    setBusy(kind);
    try { kind === "xlsx" ? await exportExcel(data) : await exportPDF(data); toast("Laporan berhasil diunduh"); }
    catch (e) { console.error(e); toast("Gagal membuat laporan. Coba lagi.", "red"); }
    setBusy("");
  };
  return (
    <div>
      <PageHeader title="Export Laporan" desc="Unduh ringkasan semua modul beserta rincian datanya." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <span className="rounded-xl bg-mint-50 p-2.5 text-mint-700 inline-block"><Icon n="file" /></span>
          <h2 className="mt-3 text-lg font-bold text-navy">Excel (.xlsx)</h2>
          <p className="mt-1 text-sm text-slate-500">Satu file dengan sheet Ringkasan dan 14 sheet rincian. Cocok untuk diolah lebih lanjut.</p>
          <Button className="mt-5" variant="mint" icon="download" disabled={!!busy} onClick={() => run("xlsx")}>{busy === "xlsx" ? "Menyiapkan…" : "Download Excel"}</Button>
        </Card>
        <Card>
          <span className="rounded-xl bg-navy-50 p-2.5 text-navy inline-block"><Icon n="file" /></span>
          <h2 className="mt-3 text-lg font-bold text-navy">PDF</h2>
          <p className="mt-1 text-sm text-slate-500">Laporan cetak dengan ringkasan di halaman pertama, lalu tabel rincian per modul.</p>
          <Button className="mt-5" icon="download" disabled={!!busy} onClick={() => run("pdf")}>{busy === "pdf" ? "Menyiapkan…" : "Download PDF"}</Button>
        </Card>
      </div>
      <Card className="mt-4"><h3 className="mb-3 text-sm font-bold text-navy">Isi laporan</h3><ul className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">{CONTENT.map((c) => <li key={c} className="flex items-center gap-2"><Icon n="check" className="h-4 w-4 text-mint-600" />{c}</li>)}</ul></Card>
    </div>
  );
}
