"use client";
import { useApp } from "@/lib/store";
import { ROLES, MIN_KAS, IPL_NOMINAL, rtKeyOf, groupName, RT_LIST, rtLabel } from "@/lib/config";
import { stats, tamuPerHari, kasChart } from "@/lib/stats";
import { rp, fmtDate, fmtTime } from "@/lib/format";
import { rtStats, waLink } from "@/lib/wa";
import { Card, KPI, ListCard, Attention, BarChart, DonutChart, Badge, Icon, Button, ProgressBar, Select, tones } from "../ui";

const lvl = (n, hi = 3) => (n === 0 ? "green" : n >= hi ? "red" : "yellow");
const Row = (label, value, tone, onClick, sub) => ({ label, value, tone, onClick, sub });
const Grid = ({ cols = 4, children }) => <div className={`mb-6 grid grid-cols-2 gap-3 sm:gap-4 ${cols === 4 ? "lg:grid-cols-4" : cols === 3 ? "lg:grid-cols-3" : ""}`}>{children}</div>;
const Two = ({ children }) => <div className="mb-6 grid gap-4 lg:grid-cols-2">{children}</div>;

function Head({ title, sub, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-mint-700">{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-navy sm:text-[30px]">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{sub}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

function KasHero({ k, go }) {
  const pct = Math.min(100, (k.saldo / (MIN_KAS * 2)) * 100);
  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 to-navy-600 p-6 text-white shadow-card sm:p-8">
      <span className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-mint-500/25 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-sm text-white/70">Saldo kas komplek</p><p className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl">{rp(k.saldo)}</p><p className="mt-2 text-sm text-white/70">Batas minimum {rp(MIN_KAS)}</p></div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ${k.tone === "green" ? "bg-emerald-400/20 text-emerald-200" : k.tone === "yellow" ? "bg-amber-400/20 text-amber-200" : "bg-rose-400/25 text-rose-200"}`}><i className={`h-2 w-2 rounded-full ${tones.DOT[k.tone]}`} />{k.label}</span>
      </div>
      <div className="relative mt-6 h-2 overflow-hidden rounded-full bg-white/15"><div className={`h-full rounded-full ${tones.DOT[k.tone]}`} style={{ width: pct + "%" }} /></div>
      <button onClick={() => go("keuangan", { tab: "neraca" })} className="relative mt-4 text-sm font-semibold text-mint-200 hover:text-white">Lihat neraca kas</button>
    </div>
  );
}

function RTRekap({ data, go, only }) {
  const rows = rtStats(data).filter((r) => !only || r.key === only);
  const total = rows.reduce((a, r) => a + r.terkumpul, 0);
  return (
    <Card className="mb-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div><h2 className="text-[15px] font-bold text-navy">IPL per RT bulan ini</h2><p className="text-xs text-slate-500">Terhubung dengan pembayaran dan rekap grup WhatsApp. Terkumpul {rp(total)}.</p></div>
        <Button variant="soft" icon="msg" onClick={() => go("waIpl", {})}>Buka IPL WhatsApp</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((r) => (
          <button key={r.key} onClick={() => go("waIpl", { thread: "g:" + r.key })} className="rounded-2xl bg-slate-50 p-4 text-left transition hover:bg-mint-50">
            <div className="flex items-center justify-between gap-2"><p className="text-sm font-bold text-navy">{r.label}</p><p className="text-sm font-bold text-navy">{r.pct}%</p></div>
            <div className="mt-2"><ProgressBar value={r.pct} tone={r.pct >= 80 ? "green" : r.pct >= 60 ? "yellow" : "red"} /></div>
            <p className="mt-2 flex flex-wrap gap-x-3 text-xs text-slate-600"><span>Lunas {r.lunas}/{r.total}</span><span>Telat {r.terlambat}</span><span>Tunggak {r.menunggak}</span><span className="font-semibold text-navy">{rp(r.terkumpul)}</span></p>
          </button>
        ))}
      </div>
    </Card>
  );
}

function RWDash({ s, go, data }) {
  const k = s.kas;
  const al = [];
  if (k.tone !== "green") al.push({ t: k.tone, m: `Saldo kas ${k.label.toLowerCase()}.`, v: "keuangan", p: { tab: "neraca" } });
  if (s.assetMasalah) al.push({ t: "red", m: `${s.assetMasalah} serah terima shift bermasalah (asset kurang atau rusak).`, v: s.sh.security.bermasalah ? "assetSecurity" : "assetKebersihan", p: { tab: "approval" } });
  if (s.approvalPending) al.push({ t: "yellow", m: `${s.approvalPending} serah terima shift belum di-approve group berikutnya.`, v: s.sh.security.menunggu ? "assetSecurity" : "assetKebersihan", p: { tab: "approval" } });
  if (s.kerusakanBerat) al.push({ t: "red", m: `${s.kerusakanBerat} kerusakan tingkat berat belum selesai.`, v: "kerusakan", p: { status: "Belum selesai" } });
  if (s.pengaduanBelum > 5) al.push({ t: "yellow", m: `${s.pengaduanBelum} pengaduan warga belum selesai.`, v: "pengaduan", p: { status: "Belum selesai" } });
  const comp = [{ name: "Tinggal", value: s.tinggal, color: "#3DBE8F" }, { name: "Ngontrak", value: s.ngontrak, color: "#12294A" }, { name: "Ditinggal", value: s.ditinggal, color: "#F5B83D" }];
  return (
    <>
      <Head title="Ringkasan komplek" sub={al.length ? `${al.length} hal perlu perhatian hari ini.` : "Semua terpantau aman hari ini."} actions={<><Button variant="mint" icon="sparkle" onClick={() => go("ai", {})}>Analisis AI</Button><Button variant="ghost" icon="download" onClick={() => go("export", {})}>Export</Button></>} />
      <Attention list={al} go={go} />
      <Grid>
        <KPI label="Saldo kas" value={rp(k.saldo)} sub={k.label} tone={k.tone} icon="wallet" progress={Math.min(100, (k.saldo / (MIN_KAS * 2)) * 100)} onClick={() => go("keuangan", { tab: "neraca" })} />
        <KPI label="IPL terkumpul" value={k.pct + "%"} sub={`${k.lunas} dari ${k.total} rumah lunas`} tone={k.pct >= 80 ? "green" : k.pct >= 60 ? "yellow" : "red"} icon="check" progress={k.pct} onClick={() => go("keuangan", { tab: "ringkasan" })} />
        <KPI label="Tamu di dalam" value={s.tamuDalam} sub={`${s.tamuMinggu} tamu minggu ini`} tone={s.tamuDalam > 10 ? "yellow" : "green"} icon="car" onClick={() => go("tamu", {})} />
        <KPI label="Pengaduan belum selesai" value={s.pengaduanBelum} sub="Klik untuk menindaklanjuti" tone={lvl(s.pengaduanBelum, 6)} icon="msg" onClick={() => go("pengaduan", { status: "Belum selesai" })} />
      </Grid>
      <Two>
        <ListCard title="Keuangan IPL" desc="Status pembayaran bulan ini" rows={[
          Row("Lunas", k.lunas, "green", () => go("keuangan", { tab: "ringkasan" }), `${k.pct}% dari ${k.total} rumah`),
          Row("Terlambat", k.terlambat, "yellow", () => go("keuangan", { tab: "tunggakan", level: "terlambat" }), "Telat 1 bulan"),
          Row("Menunggak", k.menunggak, k.menunggak > 100 ? "red" : "yellow", () => go("keuangan", { tab: "tunggakan", level: "menunggak" }), "Telat 2 bulan atau lebih"),
          Row("Pengeluaran bulan ini", rp(k.keluar), "navy", () => go("keuangan", { tab: "pengeluaran" })),
        ]} />
        <ListCard title="Petugas & asset" desc="Kehadiran dan serah terima shift" rows={[
          Row("Security hadir hari ini", `${s.hadirSecurity}/3`, s.hadirSecurity >= 3 ? "green" : "yellow", () => go("absenSecurity", {}), `${s.telatSecurityHariIni} terlambat`),
          Row("Kebersihan hadir hari ini", `${s.hadirKebersihan}/2`, s.hadirKebersihan >= 2 ? "green" : "yellow", () => go("absenKebersihan", {}), `RW 29: ${s.hadirRW29}, RW 31: ${s.hadirRW31}`),
          Row("Asset bermasalah", s.assetMasalah, s.assetMasalah ? "red" : "green", () => go(s.sh.kebersihan.bermasalah && !s.sh.security.bermasalah ? "assetKebersihan" : "assetSecurity", { tab: "approval" }), "Kurang atau rusak"),
          Row("Serah terima belum di-approve", s.approvalPending, lvl(s.approvalPending, 3), () => go(s.sh.security.menunggu || !s.sh.kebersihan.menunggu ? "assetSecurity" : "assetKebersihan", { tab: "approval" }), `Security ${s.sh.security.menunggu}, Kebersihan ${s.sh.kebersihan.menunggu}`),
        ]} />
        <ListCard title="Laporan & layanan warga" desc="Yang masih terbuka" rows={[
          Row("Kerusakan belum selesai", s.kerusakanAktif, s.kerusakanBerat ? "red" : lvl(s.kerusakanAktif, 6), () => go("kerusakan", { status: "Belum selesai" }), `${s.kerusakanBerat} tingkat berat`),
          Row("Sampah belum selesai", s.sampahAktif, lvl(s.sampahAktif, 4), () => go("sampah", { tab: "laporan", status: "Belum selesai" })),
          Row("Izin menunggu", s.izinMenunggu, s.izinMenunggu ? "yellow" : "green", () => go("izin", { status: "Menunggu persetujuan" }), "Belum disetujui penuh"),
        ]} />
        <Card><h3 className="mb-1 text-[15px] font-bold text-navy">Komposisi warga</h3><p className="mb-3 text-xs text-slate-500">Dari {s.totalRumah} rumah. Klik di tabel warga untuk detail.</p><DonutChart data={comp} center={s.totalRumah} height={200} /></Card>
      </Two>
      <RTRekap data={data} go={go} />
      <Two>
        <Card><h3 className="mb-1 text-[15px] font-bold text-navy">Pemasukan vs pengeluaran</h3><p className="mb-3 text-xs text-slate-500">6 bulan terakhir</p><BarChart data={kasChart(data)} money /></Card>
        <Card><h3 className="mb-1 text-[15px] font-bold text-navy">Tamu 7 hari terakhir</h3><p className="mb-3 text-xs text-slate-500">Jumlah tamu masuk per hari</p><BarChart data={tamuPerHari(data)} /></Card>
      </Two>
    </>
  );
}

function RTDash({ data, go, session, setSession }) {
  const key = session.rt || "29-01";
  const r = rtStats(data).find((x) => x.key === key);
  const belum = data.rumah.filter((h) => rtKeyOf(h) === key && h.iplStatus !== "lunas").sort((a, b) => b.tunggakan - a.tunggakan).slice(0, 8);
  const pesan = (data.waPesan || []).filter((m) => m.thread === "g:" + key).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 4);
  const open = () => go("waIpl", { thread: "g:" + key });
  return (
    <>
      <Head title={`Dashboard ${rtLabel(key)}`} sub={`Grup WhatsApp: ${groupName(key)}`} actions={<div className="min-w-[200px]"><Select value={key} onChange={(e) => setSession({ rt: e.target.value })} options={RT_LIST.map((x) => ({ value: x.key, label: rtLabel(x.key) }))} /></div>} />
      <Grid>
        <KPI label="Rumah di RT ini" value={r.total} icon="building" onClick={open} />
        <KPI label="Sudah bayar" value={r.lunas} sub={`${r.pct}% terkumpul`} tone="green" icon="check" progress={r.pct} onClick={open} />
        <KPI label="Terlambat" value={r.terlambat} sub="Telat 1 bulan" tone="yellow" icon="clock" onClick={open} />
        <KPI label="Menunggak" value={r.menunggak} sub="2 bulan atau lebih" tone={r.menunggak > 10 ? "red" : "yellow"} icon="alert" onClick={open} />
      </Grid>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-5 shadow-card"><div><p className="text-sm text-slate-500">Total pembayaran terkumpul bulan ini</p><p className="text-3xl font-extrabold tracking-tight text-navy">{rp(r.terkumpul)}</p></div><Button variant="mint" icon="msg" onClick={open}>Buka grup WhatsApp</Button></div>
      <Two>
        <ListCard title="Perlu diingatkan" desc="Rumah dengan tunggakan terbesar" rows={belum.length ? belum.map((h) => Row(`${h.id} - ${h.status === "ngontrak" ? h.penyewa : h.owner}`, `${h.tunggakan} bln`, h.tunggakan <= 1 ? "yellow" : "red", () => window.open(waLink(h.status === "ngontrak" ? h.penyewaHp : h.hp, `Yth. Bapak/Ibu, IPL rumah BLOK ${h.blok} NO ${h.no} tertunggak ${h.tunggakan} bulan (${rp(h.tunggakan * IPL_NOMINAL)}). Mohon dibayar lewat scan QR di grup ${groupName(key)}. Terima kasih.`), "_blank"), "Ketuk untuk kirim pengingat via WhatsApp")) : [Row("Semua rumah sudah lunas", "OK", "green")]} />
        <Card><h3 className="mb-3 text-[15px] font-bold text-navy">Aktivitas grup terbaru</h3><ul className="space-y-2">{pesan.map((m) => <li key={m.id} className="rounded-2xl bg-[#D9FDD3] p-3 text-xs text-slate-700"><span className="font-semibold text-emerald-800">{fmtTime(m.at)}</span> {m.text.replace(/\*/g, "").split("\n")[0].slice(0, 110)}</li>)}</ul></Card>
      </Two>
    </>
  );
}

function KeamananDash({ s, go, data }) {
  const al = [];
  if (s.sh.security.bermasalah) al.push({ t: "red", m: "Ada serah terima shift dengan asset kurang atau rusak.", v: "assetSecurity", p: { tab: "approval" } });
  if (s.sh.security.menunggu) al.push({ t: "yellow", m: `${s.sh.security.menunggu} serah terima shift menunggu approval.`, v: "assetSecurity", p: { tab: "approval" } });
  if (s.sh.security.bertugas) al.push({ t: "yellow", m: `${s.sh.security.bertugas} group masih membawa asset (belum dikembalikan).`, v: "assetSecurity", p: { tab: "bertugas" } });
  if (s.pelanggaranAktif > 4) al.push({ t: "yellow", m: `${s.pelanggaranAktif} pelanggaran parkir masih aktif.`, v: "parkir", p: { tab: "pelanggaran" } });
  return (
    <>
      <Head title="Pos jaga hari ini" sub={al.length ? `${al.length} hal perlu perhatian.` : "Semua terpantau aman."} actions={<Button variant="mint" icon="car" onClick={() => go("tamu", {})}>Catat tamu</Button>} />
      <Attention list={al} go={go} />
      <Grid>
        <KPI label="Tamu di dalam" value={s.tamuDalam} icon="car" tone={s.tamuDalam > 10 ? "yellow" : "green"} onClick={() => go("tamu", {})} />
        <KPI label="Security hadir" value={`${s.hadirSecurity}/3`} sub={`${s.telatSecurityHariIni} terlambat hari ini`} icon="shield" tone={s.hadirSecurity >= 3 ? "green" : "yellow"} onClick={() => go("absenSecurity", {})} />
        <KPI label="Menunggu approval" value={s.sh.security.menunggu} sub="Serah terima shift" icon="clock" tone={s.sh.security.menunggu ? "yellow" : "green"} onClick={() => go("assetSecurity", { tab: "approval" })} />
        <KPI label="Pengaduan keamanan" value={s.pengaduanKeamanan} sub="Belum selesai" icon="msg" tone={lvl(s.pengaduanKeamanan, 3)} onClick={() => go("pengaduan", { kategori: "Keamanan", status: "Belum selesai" })} />
      </Grid>
      <Two>
        <ListCard title="Asset & serah terima" desc="Security" rows={[
          Row("Asset belum dikembalikan", s.sh.security.bertugas, s.sh.security.bertugas ? "yellow" : "green", () => go("assetSecurity", { tab: "bertugas" }), "Shift sedang berjalan"),
          Row("Asset belum lengkap", s.sh.security.bermasalah, s.sh.security.bermasalah ? "red" : "green", () => go("assetSecurity", { tab: "approval" }), "Kurang atau rusak"),
          Row("Shift selesai bersih", s.sh.security.bersih7, "green", () => go("assetSecurity", { tab: "riwayat" }), "7 hari terakhir"),
        ]} />
        <ListCard title="Pantauan lainnya" rows={[
          Row("Security terlambat", s.telatMinggu, lvl(s.telatMinggu, 4), () => go("absenSecurity", {}), "7 hari terakhir"),
          Row("Pelanggaran parkir aktif", s.pelanggaranAktif, lvl(s.pelanggaranAktif, 5), () => go("parkir", { tab: "pelanggaran" })),
          Row("Izin menunggu review Keamanan", s.izinReviewKeamanan, s.izinReviewKeamanan ? "yellow" : "green", () => go("izin", { status: "Menunggu review Keamanan" })),
        ]} />
      </Two>
      <Card><h3 className="mb-1 text-[15px] font-bold text-navy">Tamu 7 hari terakhir</h3><p className="mb-3 text-xs text-slate-500">Jumlah tamu masuk per hari</p><BarChart data={tamuPerHari(data)} height={200} /></Card>
    </>
  );
}

function KebersihanDash({ s, go, data }) {
  const al = [];
  if (s.sh.kebersihan.bermasalah) al.push({ t: "red", m: "Ada serah terima shift kebersihan dengan asset kurang atau rusak.", v: "assetKebersihan", p: { tab: "approval" } });
  if (s.sh.kebersihan.menunggu) al.push({ t: "yellow", m: `${s.sh.kebersihan.menunggu} serah terima shift kebersihan menunggu approval.`, v: "assetKebersihan", p: { tab: "approval" } });
  if (s.sampahAktif > 3) al.push({ t: "yellow", m: `${s.sampahAktif} tumpukan sampah belum selesai.`, v: "sampah", p: { tab: "laporan", status: "Belum selesai" } });
  const st = ["Dilaporkan", "Dijadwalkan", "Diangkut"].map((x) => ({ label: x, a: data.sampahLaporan.filter((r) => r.status === x).length }));
  return (
    <>
      <Head title="Lingkungan hari ini" sub={al.length ? `${al.length} hal perlu perhatian.` : "Semua terpantau aman."} actions={<Button variant="mint" icon="broom" onClick={() => go("absenKebersihan", {})}>Absensi</Button>} />
      <Attention list={al} go={go} />
      <Grid>
        <KPI label="Hadir RW 29" value={s.hadirRW29} icon="broom" tone={s.hadirRW29 ? "green" : "yellow"} onClick={() => go("absenKebersihan", {})} />
        <KPI label="Hadir RW 31" value={s.hadirRW31} icon="broom" tone={s.hadirRW31 ? "green" : "yellow"} onClick={() => go("absenKebersihan", {})} />
        <KPI label="Sampah belum selesai" value={s.sampahAktif} icon="trash" tone={lvl(s.sampahAktif, 4)} onClick={() => go("sampah", { tab: "laporan", status: "Belum selesai" })} />
        <KPI label="Kerusakan terkait kebersihan" value={s.kerusakanKebersihan} sub="Taman, drainase, got" icon="tool" tone={lvl(s.kerusakanKebersihan, 3)} onClick={() => go("kerusakan", { status: "Belum selesai" })} />
      </Grid>
      <Two>
        <ListCard title="Asset & serah terima" desc="Kebersihan" rows={[
          Row("Asset belum dikembalikan", s.sh.kebersihan.bertugas, s.sh.kebersihan.bertugas ? "yellow" : "green", () => go("assetKebersihan", { tab: "bertugas" }), "Shift sedang berjalan"),
          Row("Asset bermasalah", s.sh.kebersihan.bermasalah, s.sh.kebersihan.bermasalah ? "red" : "green", () => go("assetKebersihan", { tab: "approval" }), "Kurang atau rusak"),
          Row("Serah terima menunggu approval", s.sh.kebersihan.menunggu, s.sh.kebersihan.menunggu ? "yellow" : "green", () => go("assetKebersihan", { tab: "approval" })),
          Row("Shift selesai bersih", s.sh.kebersihan.bersih7, "green", () => go("assetKebersihan", { tab: "riwayat" }), "7 hari terakhir"),
        ]} />
        <Card><h3 className="mb-1 text-[15px] font-bold text-navy">Laporan sampah menurut status</h3><p className="mb-3 text-xs text-slate-500">Dari laporan warga</p><BarChart data={st} height={210} /></Card>
      </Two>
    </>
  );
}

function BendaharaDash({ s, go, data }) {
  const k = s.kas;
  const tunggu = data.pembayaran.filter((p) => p.status === "Menunggu verifikasi").length;
  const al = [];
  if (k.tone !== "green") al.push({ t: k.tone, m: `Saldo kas ${k.label.toLowerCase()}.`, v: "keuangan", p: { tab: "neraca" } });
  if (tunggu) al.push({ t: "yellow", m: `${tunggu} bukti transfer menunggu verifikasi.`, v: "keuangan", p: { tab: "bukti" } });
  return (
    <>
      <Head title="Keuangan komplek" sub="IPL, pengeluaran, dan kesehatan kas" actions={<Button variant="ghost" icon="download" onClick={() => go("export", {})}>Export</Button>} />
      <KasHero k={k} go={go} />
      <Attention list={al} go={go} />
      <Grid>
        <KPI label="Tunggakan IPL" value={k.belumLunas} sub={`${rp(k.belumLunas * IPL_NOMINAL)} belum masuk`} tone={k.belumLunas > 150 ? "red" : "yellow"} icon="alert" onClick={() => go("keuangan", { tab: "tunggakan" })} />
        <KPI label="Pembayaran masuk" value={rp(k.masuk)} sub={`${k.lunas} rumah lunas`} tone="green" icon="check" progress={k.pct} onClick={() => go("keuangan", { tab: "ringkasan" })} />
        <KPI label="Pengeluaran" value={rp(k.keluar)} icon="wallet" onClick={() => go("keuangan", { tab: "pengeluaran" })} />
        <KPI label="Bukti menunggu" value={tunggu} sub="Perlu verifikasi" tone={tunggu ? "yellow" : "green"} icon="file" onClick={() => go("keuangan", { tab: "bukti" })} />
      </Grid>
      <RTRekap data={data} go={go} />
      <Card><h3 className="mb-1 text-[15px] font-bold text-navy">Pemasukan vs pengeluaran</h3><p className="mb-3 text-xs text-slate-500">6 bulan terakhir</p><BarChart data={kasChart(data)} money /></Card>
    </>
  );
}

function WargaDash({ go, data, session }) {
  const h = data.rumah.find((x) => x.id === session.houseId);
  const myAdu = data.pengaduan.filter((x) => x.rumah === session.houseId);
  const myIzin = data.izin.filter((x) => x.rumah === session.houseId);
  const st = !h ? null : h.iplStatus === "lunas" ? ["green", "Lunas", "Tidak ada tagihan bulan ini. Terima kasih!"] : h.tunggakan <= 1 ? ["yellow", "Terlambat", `Tagihan ${rp(IPL_NOMINAL)} perlu dibayar`] : ["red", "Menunggak", `${h.tunggakan} bulan tertunggak, total ${rp(h.tunggakan * IPL_NOMINAL)}`];
  const acts = [["Bayar IPL", "wallet", "iplSaya", {}], ["Buat pengaduan", "msg", "pengaduan", { add: true }], ["Lapor sampah", "trash", "sampah", { tab: "laporan", add: true }], ["Lapor kerusakan", "tool", "kerusakan", { add: true }], ["Ajukan izin", "building", "izin", { add: true }], ["Kontak penting", "phone", "kontak", {}]];
  return (
    <>
      <Head title={h ? `Halo, rumah ${h.id}` : "Dashboard Warga"} sub="Semua urusan komplek dalam satu tempat." />
      {h && (
        <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 to-navy-600 p-6 text-white shadow-card sm:p-8">
          <span className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-mint-500/25 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div><p className="text-sm text-white/70">Status IPL rumah saya</p><p className="mt-1 text-4xl font-extrabold tracking-tight">{st[1]}</p><p className="mt-1 text-sm text-white/75">{st[2]}</p></div>
            <Button variant="mint" icon="wallet" onClick={() => go("iplSaya", {})}>{h.iplStatus === "lunas" ? "Lihat IPL saya" : "Bayar sekarang"}</Button>
          </div>
        </div>
      )}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {acts.map(([l, i, v, p]) => (
          <button key={l} onClick={() => go(v, p)} className="flex flex-col items-center gap-2.5 rounded-3xl bg-white p-4 text-center text-xs font-semibold text-navy shadow-card transition hover:-translate-y-0.5 hover:ring-2 hover:ring-mint-200"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-mint-50 text-mint-700"><Icon n={i} className="h-5 w-5" /></span>{l}</button>
        ))}
      </div>
      <Two>
        <ListCard title="Pengaduan & izin saya" rows={[
          Row("Pengaduan saya", myAdu.length, myAdu.some((x) => x.status === "Baru") ? "yellow" : "green", () => go("pengaduan", {}), `${myAdu.filter((x) => x.status !== "Selesai").length} belum selesai`),
          Row("Izin saya", myIzin.length, "navy", () => go("izin", {}), `${myIzin.filter((x) => !x.ditolak && x.tahap < 4).length} sedang diproses`),
          Row("Jadwal angkut sampah", "Lihat", "navy", () => go("sampah", { tab: "jadwal" })),
        ]} />
        <ListCard title="Pengumuman terbaru" action={<button onClick={() => go("pengumuman", {})} className="text-xs font-semibold text-mint-700">Semua</button>} rows={[...data.pengumuman].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 3).map((a) => Row(a.judul, fmtDate(a.at), a.kategori === "Darurat" ? "red" : "navy", () => go("pengumuman", {}), a.kategori))} />
      </Two>
    </>
  );
}

export default function Dashboard() {
  const { data, role, go, session, setSession } = useApp();
  const s = stats(data);
  return (
    <div>
      {role === "rw" && <RWDash s={s} go={go} data={data} />}
      {role === "rt" && <RTDash data={data} go={go} session={session} setSession={setSession} />}
      {role === "keamanan" && <KeamananDash s={s} go={go} data={data} />}
      {role === "kebersihan" && <KebersihanDash s={s} go={go} data={data} />}
      {role === "bendahara" && <BendaharaDash s={s} go={go} data={data} />}
      {role === "warga" && <WargaDash go={go} data={data} session={session} />}
    </div>
  );
}
