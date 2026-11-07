"use client";
import { useState, useEffect } from "react";
import { DB_ENABLED, getSupabase } from "@/lib/supabase";
import { fmtDT } from "@/lib/format";
import { useApp } from "@/lib/store";
import { Card, Button, PageHeader, Confirm, Badge, DataTable } from "../ui";

const MODULES = [
  { label: "Warga & Rumah", cols: ["rumah"] }, { label: "Tamu & Kendaraan", cols: ["tamu"] },
  { label: "Keuangan (pengeluaran & pembayaran)", cols: ["pengeluaran", "pembayaran"] }, { label: "Pengumuman", cols: ["pengumuman"] },
  { label: "Absensi Security", cols: ["absenSecurity"] }, { label: "Absensi Kebersihan", cols: ["absenKebersihan"] },
  { label: "Serah Terima Security", cols: ["shiftSecurity"] }, { label: "Serah Terima Kebersihan", cols: ["shiftKebersihan"] },
  { label: "Pengaduan", cols: ["pengaduan"] }, { label: "Parkir (pelanggaran)", cols: ["pelanggaran"] },
  { label: "Laporan Sampah", cols: ["sampahLaporan"] }, { label: "Kerusakan Fasilitas", cols: ["kerusakan"] },
  { label: "Izin Renovasi & Keramaian", cols: ["izin"] }, { label: "Masukan penguji", cols: ["masukan"] }, { label: "Ketidakhadiran petugas", cols: ["ketidakhadiran"] }, { label: "Pesan WhatsApp (simulasi)", cols: ["waPesan"] }, { label: "Dokumen & upload", cols: ["uploads"] },
];

export default function Panel() {
  const { data, clearTesting, clearTestingCols, resetAll, toast } = useApp();
  const [c, setC] = useState(null);
  const { dbStatus, data: appData, update } = useApp();
  const [audit, setAudit] = useState(null);
  const loadAudit = async () => {
    if (!DB_ENABLED) return setAudit([]);
    const { data: rows, error } = await getSupabase().from("audit_log").select("id,at,actor_role,col,row_id,action").order("at", { ascending: false }).limit(40);
    setAudit(error ? [] : rows || []);
  };
  useEffect(() => { loadAudit(); }, []); // eslint-disable-line
  const test = (cols) => cols.reduce((a, k) => a + (data[k] || []).filter((i) => i._t).length, 0);
  const total = (cols) => cols.reduce((a, k) => a + (data[k] || []).length, 0);
  const all = MODULES.reduce((a, m) => a + test(m.cols), 0);

  return (
    <div>
      <PageHeader title="Panel Pengelola Data Demo" desc={DB_ENABLED ? "Kelola data hasil uji coba. Karena data tersimpan di database bersama, semua penghapusan dan reset berlaku untuk SEMUA penguji." : "Kelola data hasil uji coba. Perubahan hanya berlaku di browser ini karena data disimpan lokal."} />
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
      <Card className="mt-4">
        <h2 className="text-base font-bold text-navy">Masukan penguji ({(appData.masukan || []).length})</h2>
        <p className="mb-3 text-xs text-slate-500">Dikirim lewat tombol Masukan di setiap halaman.</p>
        <DataTable rows={[...(appData.masukan || [])].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 30)} empty="Belum ada masukan." columns={[
          { label: "Waktu", render: (m) => fmtDT(m.at) }, { label: "Jenis", render: (m) => <Badge tone={m.jenis === "Temuan masalah" ? "red" : m.jenis === "Saran perbaikan" ? "yellow" : "navy"}>{m.jenis}</Badge> },
          { label: "Peran / halaman", render: (m) => `${m.role} / ${m.halaman}` }, { label: "Nilai", render: (m) => (m.nilai ? m.nilai + "/5" : "-") }, { label: "Pesan", key: "pesan" },
          { label: "", render: (m) => (m.status === "Selesai" ? <Badge tone="green">Selesai</Badge> : <button onClick={() => update("masukan", m.id, { status: "Selesai" })} className="text-xs font-semibold text-mint-700">Tandai selesai</button>) },
        ]} />
      </Card>
      <Card className="mt-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div><h2 className="text-base font-bold text-navy">Jejak audit</h2><p className="text-xs text-slate-500">40 perubahan terakhir (siapa, kapan, apa). Status database: <Badge tone={dbStatus === "online" ? "green" : dbStatus === "error" ? "red" : "gray"}>{dbStatus === "online" ? "Terhubung" : dbStatus === "error" ? "Terputus" : "Mode lokal"}</Badge></p></div>
          <Button variant="ghost" onClick={loadAudit}>Muat ulang</Button>
        </div>
        <DataTable rows={(audit || []).map((a) => ({ ...a, id: String(a.id) }))} empty={DB_ENABLED ? "Belum ada perubahan tercatat." : "Jejak audit aktif setelah database tersambung."} columns={[
          { label: "Waktu", render: (a) => fmtDT(a.at) }, { label: "Peran", render: (a) => a.actor_role || "-" },
          { label: "Aksi", render: (a) => <Badge tone={a.action === "DELETE" ? "red" : a.action === "INSERT" ? "green" : "yellow"}>{a.action}</Badge> },
          { label: "Koleksi", key: "col" }, { label: "ID", key: "row_id" },
        ]} />
      </Card>
      <Confirm open={!!c} onClose={() => setC(null)} title={c ? c.title : ""} desc={c ? c.desc : ""} requireText={c ? c.text : undefined} onOk={() => c.fn()} okText="Ya, lanjutkan" />
    </div>
  );
}
