import { stats } from "./stats";
import { rp, fmtDate, fmtDT } from "./format";
import { FOOTER, MIN_KAS } from "./config";

const stamp = () => new Date().toISOString().slice(0, 10);
const nm = (h) => (h.status === "ngontrak" ? h.penyewa : h.owner);
const veh = (h) => (h.kendaraan || []).map((v) => `${v.jenis} ${v.plat}`).join("; ");
const STAT = { tinggal: "Warga Tinggal", ngontrak: "Warga Ngontrak", ditinggal: "Rumah Ditinggal" };

function summaryRows(d) {
  const s = stats(d);
  return [
    ["Total rumah", s.totalRumah, "RW 29 dan RW 31"],
    ["Warga tinggal", s.tinggal, "Pemilik menempati"],
    ["Warga ngontrak", s.ngontrak, "Penyewa"],
    ["Rumah ditinggal", s.ditinggal, "Pemilik di luar komplek"],
    ["IPL lunas", s.kas.lunas, `${s.kas.pct}% terkumpul`],
    ["IPL terlambat", s.kas.terlambat, "Telat 1 bulan"],
    ["IPL menunggak", s.kas.menunggak, "Telat 2 bulan atau lebih"],
    ["Pemasukan IPL bulan ini", rp(s.kas.masuk), ""],
    ["Pengeluaran bulan ini", rp(s.kas.keluar), ""],
    ["Saldo kas", rp(s.kas.saldo), s.kas.label],
    ["Batas minimum kas", rp(MIN_KAS), ""],
    ["Tamu di dalam", s.tamuDalam, `${s.tamuMinggu} tamu minggu ini`],
    ["Pengaduan belum selesai", s.pengaduanBelum, ""],
    ["Kerusakan fasilitas aktif", s.kerusakanAktif, `${s.kerusakanBerat} tingkat berat`],
    ["Izin menunggu", s.izinMenunggu, ""],
    ["Tumpukan sampah belum diangkut", s.sampahAktif, ""],
    ["Pelanggaran parkir aktif", s.pelanggaranAktif, ""],
    ["Asset bermasalah (serah terima)", s.assetMasalah, `${s.approvalPending} menunggu approval`],
    ["Security terlambat (7 hari)", s.telatMinggu, ""],
  ];
}

function sections(d) {
    return [
    { name: "Warga & Rumah", head: ["Rumah", "RW", "Status", "Pemilik", "No KK", "No KTP", "HP Pemilik", "Pengontrak / Penunggu", "Penghuni", "Kendaraan", "Kontrak / Ditinggal sejak", "Domisili baru", "IPL"],
      rows: d.rumah.map((h) => [h.id, h.rw, STAT[h.status], h.owner, h.kk, h.ktp, h.hp, h.status === "ngontrak" ? `${h.penyewa} (${h.penyewaHp})` : h.status === "ditinggal" ? `${h.penunggu} (${h.penungguHp})` : "", h.penghuni, veh(h), h.status === "ngontrak" ? `${fmtDate(h.kontrakMulai)} - ${fmtDate(h.kontrakSelesai)}` : h.status === "ditinggal" ? fmtDate(h.mulaiDitinggal) : "", h.status === "ditinggal" ? `${h.kota}, ${h.provinsi}` : "", h.iplStatus === "lunas" ? "Lunas" : `Menunggak ${h.tunggakan} bln`]) },
    { name: "IPL Tunggakan", head: ["Rumah", "RW", "Nama", "Bulan", "Jumlah"], rows: d.rumah.filter((h) => h.iplStatus !== "lunas").sort((a, b) => b.tunggakan - a.tunggakan).map((h) => [h.id, h.rw, nm(h), h.tunggakan, rp(h.tunggakan * 100000)]) },
    { name: "Pengeluaran", head: ["Tanggal", "Kategori", "Keterangan", "Nominal", "Bukti"], rows: d.pengeluaran.map((x) => [fmtDate(x.tanggal), x.kategori, x.ket, rp(x.nominal), x.bukti || "-"]) },
    { name: "Tamu", head: ["Nama", "Plat", "Jenis", "Tujuan", "Rumah", "Masuk", "Keluar"], rows: d.tamu.map((t) => [t.nama, t.plat, t.jenis, t.tujuan, t.rumahTujuan, fmtDT(t.masuk), t.keluar ? fmtDT(t.keluar) : "Di dalam"]) },
    { name: "Pengumuman", head: ["Tanggal", "Kategori", "Judul", "Penulis"], rows: d.pengumuman.map((a) => [fmtDate(a.at), a.kategori, a.judul, a.penulis]) },
    { name: "Absensi Security", head: ["Tanggal", "Group", "Petugas", "Masuk", "Keluar", "Status"], rows: d.absenSecurity.map((a) => [fmtDate(a.tanggal), a.group, a.nama, a.masuk, a.keluar || "-", a.telat ? `Terlambat ${a.menit} mnt` : "Tepat waktu"]) },
    { name: "Absensi Kebersihan", head: ["Tanggal", "Group", "Petugas", "Area", "Masuk", "Keluar", "Status"], rows: d.absenKebersihan.map((a) => [fmtDate(a.tanggal), a.group, a.nama, a.area, a.masuk, a.keluar || "-", a.telat ? `Terlambat ${a.menit} mnt` : "Tepat waktu"]) },
    { name: "Pengaduan", head: ["Tanggal", "Pelapor", "Rumah", "Kategori", "Judul", "Status", "Catatan"], rows: d.pengaduan.map((p) => [fmtDate(p.at), p.pelapor, p.rumah, p.kategori, p.judul, p.status, p.catatan || ""]) },
    { name: "Serah Terima Security", head: ["Mulai", "Group", "Petugas", "Status", "Masalah asset", "Keterangan", "Disetujui oleh"], rows: d.shiftSecurity.map((x) => [fmtDT(x.mulai), x.group, x.petugas, x.status, x.masalah.join("; ") || "-", x.kurangKet || "-", x.approval ? `${x.approval.nama} (${x.approval.group})` : "-"]) },
    { name: "Serah Terima Kebersihan", head: ["Mulai", "Group", "Petugas", "Status", "Masalah asset", "Keterangan", "Disetujui oleh"], rows: d.shiftKebersihan.map((x) => [fmtDT(x.mulai), x.group, x.petugas, x.status, x.masalah.join("; ") || "-", x.kurangKet || "-", x.approval ? `${x.approval.nama} (${x.approval.group})` : "-"]) },
    { name: "Parkir", head: ["Tanggal", "Plat", "Jenis", "Lokasi", "Pelanggaran", "Status"], rows: d.pelanggaran.map((p) => [fmtDate(p.at), p.plat, p.jenisKendaraan, p.lokasi, p.pelanggaran, p.status]) },
    { name: "Laporan Sampah", head: ["Tanggal", "Lokasi", "RW", "Ukuran", "Status"], rows: d.sampahLaporan.map((p) => [fmtDate(p.at), p.lokasi, p.rw, p.ukuran, p.status]) },
    { name: "Kerusakan Fasilitas", head: ["Tanggal", "Fasilitas", "Lokasi", "Tingkat", "Status"], rows: d.kerusakan.map((p) => [fmtDate(p.at), p.fasilitas, p.lokasi, p.tingkat, p.status]) },
    { name: "Izin", head: ["Tanggal", "Pemohon", "Rumah", "Jenis", "Periode", "Status"], rows: d.izin.map((p) => [fmtDate(p.at), p.pemohon, p.rumah, p.jenis, `${fmtDate(p.mulai)} - ${fmtDate(p.selesai)}`, p.status]) },
  ];
}

export async function exportExcel(d) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  const sum = XLSX.utils.aoa_to_sheet([["Laporan Pesona Khayangan Juanda"], ["Dibuat " + fmtDT(new Date().toISOString())], [], ["Indikator", "Nilai", "Keterangan"], ...summaryRows(d), [], [FOOTER]]);
  sum["!cols"] = [{ wch: 36 }, { wch: 20 }, { wch: 34 }];
  XLSX.utils.book_append_sheet(wb, sum, "Ringkasan");
  sections(d).forEach((s) => {
    const ws = XLSX.utils.aoa_to_sheet([s.head, ...s.rows]);
    ws["!cols"] = s.head.map((h, i) => ({ wch: Math.min(40, Math.max(h.length + 2, ...s.rows.slice(0, 60).map((r) => String(r[i] ?? "").length + 2))) }));
    XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 31));
  });
  XLSX.writeFile(wb, `laporan-pesona-khayangan-juanda-${stamp()}.xlsx`);
}

export async function exportPDF(d) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const navy = [18, 41, 74];
  doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(...navy);
  doc.text("Laporan Pesona Khayangan Juanda", 40, 50);
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(110);
  doc.text("RW 29 dan RW 31 - dibuat " + fmtDT(new Date().toISOString()), 40, 68);
  autoTable(doc, { startY: 86, head: [["Indikator", "Nilai", "Keterangan"]], body: summaryRows(d), headStyles: { fillColor: navy }, styles: { fontSize: 9 }, alternateRowStyles: { fillColor: [237, 244, 238] } });
  const limit = { "Warga & Rumah": 60, Tamu: 40, "Absensi Security": 40, "Absensi Kebersihan": 30 };
  sections(d).forEach((s) => {
    if (!s.rows.length) return;
    const max = limit[s.name] || 80; const rows = s.rows.slice(0, max);
    doc.addPage();
    doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(...navy);
    doc.text(s.name, 40, 44);
    if (s.rows.length > max) { doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(110); doc.text(`Menampilkan ${max} dari ${s.rows.length} baris. Data lengkap ada di file Excel.`, 40, 58); }
    autoTable(doc, { startY: 68, head: [s.head], body: rows.map((r) => r.map((c) => String(c ?? ""))), headStyles: { fillColor: navy }, styles: { fontSize: 7.5, cellPadding: 3 }, alternateRowStyles: { fillColor: [237, 244, 238] }, margin: { left: 40, right: 40 } });
  });
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150);
    doc.text(FOOTER, 40, doc.internal.pageSize.getHeight() - 20);
    doc.text(`${i} / ${n}`, doc.internal.pageSize.getWidth() - 70, doc.internal.pageSize.getHeight() - 20);
  }
  doc.save(`laporan-pesona-khayangan-juanda-${stamp()}.pdf`);
}
