"use client";
import { useApp } from "@/lib/store";
import { ROLES, MIN_KAS, IPL_NOMINAL } from "@/lib/config";
import { stats, tamuPerHari, kasChart, kasInfo } from "@/lib/stats";
import { rp, fmtDate } from "@/lib/format";
import { Card, Stat, BarChart, DonutChart, Badge, Icon, Button, tones } from "../ui";

const Section = ({ title, children }) => (
  <section className="mb-8"><h2 className="mb-3 text-sm font-bold text-navy">{title}</h2><div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{children}</div></section>
);
const lvl = (n, hi = 3) => (n === 0 ? "green" : n >= hi ? "red" : "yellow");

function KasHero({ k, go, to = "keuangan" }) {
  const pct = Math.min(100, (k.saldo / (MIN_KAS * 2)) * 100);
  return (
    <div className="mb-8 overflow-hidden rounded-3xl bg-navy p-6 text-white shadow-card sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-sm text-white/70">Saldo kas komplek</p><p className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">{rp(k.saldo)}</p><p className="mt-2 text-sm text-white/70">Batas minimum {rp(MIN_KAS)}</p></div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ${k.tone === "green" ? "bg-emerald-400/20 text-emerald-200" : k.tone === "yellow" ? "bg-amber-400/20 text-amber-200" : "bg-rose-400/25 text-rose-200"}`}><i className={`h-2 w-2 rounded-full ${tones.DOT[k.tone]}`} />{k.label}</span>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15"><div className={`h-full rounded-full ${tones.DOT[k.tone]}`} style={{ width: pct + "%" }} /></div>
      <button onClick={() => go(to, { tab: "neraca" })} className="mt-4 text-sm font-semibold text-mint-200 hover:text-white">Lihat neraca kas</button>
    </div>
  );
}

function Alerts({ list, go }) {
  if (!list.length) return null;
  return (
    <div className="mb-8 space-y-2">
      {list.map((x, i) => (
        <button key={i} onClick={() => go(x.v, x.p || {})} className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left text-sm shadow-card hover:ring-2 hover:ring-mint-200">
          <Badge tone={x.t}>{x.t === "red" ? "Bahaya" : "Perhatian"}</Badge><span className="min-w-0 flex-1 text-navy">{x.m}</span><Icon n="chevron" className="h-4 w-4 text-slate-400" />
        </button>
      ))}
    </div>
  );
}

function RWDash({ s, go, data }) {
  const k = s.kas;
  const alerts = [];
  if (k.tone !== "green") alerts.push({ t: k.tone, m: `Saldo kas ${k.label.toLowerCase()}.`, v: "keuangan", p: { tab: "neraca" } });
  if (s.assetMasalah) alerts.push({ t: "red", m: `${s.assetMasalah} serah terima shift bermasalah (asset kurang atau rusak).`, v: s.sh.security.bermasalah ? "assetSecurity" : "assetKebersihan", p: { tab: "approval" } });
  if (s.approvalPending) alerts.push({ t: "yellow", m: `${s.approvalPending} serah terima shift belum di-approve group berikutnya.`, v: s.sh.security.menunggu ? "assetSecurity" : "assetKebersihan", p: { tab: "approval" } });
  if (s.kerusakanBerat) alerts.push({ t: "red", m: `${s.kerusakanBerat} kerusakan tingkat berat belum selesai.`, v: "kerusakan", p: { status: "Belum selesai" } });
  const comp = [{ name: "Tinggal", value: s.tinggal, color: "#3DBE8F" }, { name: "Ngontrak", value: s.ngontrak, color: "#12294A" }, { name: "Ditinggal", value: s.ditinggal, color: "#F5B83D" }];
  return (
    <>
      <KasHero k={k} go={go} />
      <Alerts list={alerts} go={go} />
      <Section title="Layanan & laporan">
        <Stat label="Tamu di dalam" value={s.tamuDalam} sub={`${s.tamuMinggu} tamu minggu ini`} icon="car" tone={s.tamuDalam > 10 ? "yellow" : "green"} onClick={() => go("tamu", {})} />
        <Stat label="Pengaduan belum selesai" value={s.pengaduanBelum} icon="msg" tone={lvl(s.pengaduanBelum, 6)} onClick={() => go("pengaduan", { status: "Belum selesai" })} />
        <Stat label="Kerusakan belum selesai" value={s.kerusakanAktif} sub={`${s.kerusakanBerat} tingkat berat`} icon="tool" tone={s.kerusakanBerat ? "red" : lvl(s.kerusakanAktif, 6)} onClick={() => go("kerusakan", { status: "Belum selesai" })} />
        <Stat label="Sampah belum selesai" value={s.sampahAktif} icon="trash" tone={lvl(s.sampahAktif, 4)} onClick={() => go("sampah", { tab: "laporan", status: "Belum selesai" })} />
        <Stat label="Izin menunggu" value={s.izinMenunggu} sub="Belum disetujui penuh" icon="building" tone={s.izinMenunggu ? "yellow" : "green"} onClick={() => go("izin", { status: "Menunggu persetujuan" })} />
      </Section>
      <Section title="Petugas & asset">
        <Stat label="Security hadir hari ini" value={`${s.hadirSecurity}/3`} sub={`${s.telatSecurityHariIni} terlambat`} icon="shield" tone={s.hadirSecurity >= 3 ? "green" : "yellow"} onClick={() => go("absenSecurity", {})} />
        <Stat label="Kebersihan hadir hari ini" value={`${s.hadirKebersihan}/2`} sub={`RW 29: ${s.hadirRW29}, RW 31: ${s.hadirRW31}`} icon="broom" tone={s.hadirKebersihan >= 2 ? "green" : "yellow"} onClick={() => go("absenKebersihan", {})} />
        <Stat label="Asset bermasalah" value={s.assetMasalah} sub="Kurang atau rusak" icon="box" tone={s.assetMasalah ? "red" : "green"} onClick={() => go(s.sh.kebersihan.bermasalah && !s.sh.security.bermasalah ? "assetKebersihan" : "assetSecurity", { tab: "approval" })} />
        <Stat label="Serah terima belum di-approve" value={s.approvalPending} sub={`Security ${s.sh.security.menunggu}, Kebersihan ${s.sh.kebersihan.menunggu}`} icon="clock" tone={lvl(s.approvalPending, 3)} onClick={() => go(s.sh.security.menunggu || !s.sh.kebersihan.menunggu ? "assetSecurity" : "assetKebersihan", { tab: "approval" })} />
      </Section>
      <Section title="Keuangan IPL">
        <Stat label="IPL lunas" value={k.lunas} sub={`${k.pct}% dari ${k.total} rumah`} icon="check" tone="green" onClick={() => go("keuangan", { tab: "ringkasan" })} />
        <Stat label="IPL terlambat" value={k.terlambat} sub="Telat 1 bulan" icon="clock" tone="yellow" onClick={() => go("keuangan", { tab: "tunggakan", level: "terlambat" })} />
        <Stat label="IPL menunggak" value={k.menunggak} sub="Telat 2 bulan atau lebih" icon="alert" tone={k.menunggak > 100 ? "red" : "yellow"} onClick={() => go("keuangan", { tab: "tunggakan", level: "menunggak" })} />
        <Stat label="Saldo kas" value={rp(k.saldo)} sub={k.label} icon="wallet" tone={k.tone} onClick={() => go("keuangan", { tab: "neraca" })} />
      </Section>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card><h3 className="mb-3 text-sm font-bold text-navy">Komposisi warga</h3><DonutChart data={comp} center={s.totalRumah} /></Card>
        <Card className="lg:col-span-2"><h3 className="mb-3 text-sm font-bold text-navy">Pemasukan vs pengeluaran</h3><BarChart data={kasChart(data)} money /></Card>
        <Card className="lg:col-span-3"><h3 className="mb-3 text-sm font-bold text-navy">Tamu 7 hari terakhir</h3><BarChart data={tamuPerHari(data)} height={190} /></Card>
      </div>
    </>
  );
}

function KeamananDash({ s, go, data }) {
  const a = [];
  if (s.sh.security.bermasalah) a.push({ t: "red", m: "Ada serah terima shift dengan asset kurang atau rusak.", v: "assetSecurity", p: { tab: "approval" } });
  if (s.sh.security.menunggu) a.push({ t: "yellow", m: `${s.sh.security.menunggu} serah terima shift menunggu approval.`, v: "assetSecurity", p: { tab: "approval" } });
  if (s.sh.security.bertugas) a.push({ t: "yellow", m: `${s.sh.security.bertugas} group masih membawa asset (belum dikembalikan).`, v: "assetSecurity", p: { tab: "bertugas" } });
  return (
    <>
      <Alerts list={a} go={go} />
      <Section title="Keamanan hari ini">
        <Stat label="Tamu di dalam" value={s.tamuDalam} icon="car" tone={s.tamuDalam > 10 ? "yellow" : "green"} onClick={() => go("tamu", {})} />
        <Stat label="Security hadir" value={`${s.hadirSecurity}/3`} sub={`${s.telatSecurityHariIni} terlambat hari ini`} icon="shield" tone={s.hadirSecurity >= 3 ? "green" : "yellow"} onClick={() => go("absenSecurity", {})} />
        <Stat label="Security terlambat" value={s.telatMinggu} sub="7 hari terakhir" icon="clock" tone={lvl(s.telatMinggu, 4)} onClick={() => go("absenSecurity", {})} />
        <Stat label="Pelanggaran parkir" value={s.pelanggaranAktif} icon="parking" tone={lvl(s.pelanggaranAktif, 5)} onClick={() => go("parkir", { tab: "pelanggaran" })} />
      </Section>
      <Section title="Asset & serah terima">
        <Stat label="Asset belum dikembalikan" value={s.sh.security.bertugas} sub="Shift sedang berjalan" icon="box" tone={s.sh.security.bertugas ? "yellow" : "green"} onClick={() => go("assetSecurity", { tab: "bertugas" })} />
        <Stat label="Asset belum lengkap" value={s.sh.security.bermasalah} sub="Kurang atau rusak" icon="alert" tone={s.sh.security.bermasalah ? "red" : "green"} onClick={() => go("assetSecurity", { tab: "approval" })} />
        <Stat label="Menunggu approval" value={s.sh.security.menunggu} sub="Serah terima shift" icon="clock" tone={s.sh.security.menunggu ? "yellow" : "green"} onClick={() => go("assetSecurity", { tab: "approval" })} />
        <Stat label="Shift selesai bersih" value={s.sh.security.bersih7} sub="7 hari terakhir" icon="check" tone="green" onClick={() => go("assetSecurity", { tab: "riwayat" })} />
      </Section>
      <Section title="Laporan">
        <Stat label="Pengaduan keamanan" value={s.pengaduanKeamanan} sub="Belum selesai" icon="msg" tone={lvl(s.pengaduanKeamanan, 3)} onClick={() => go("pengaduan", { kategori: "Keamanan", status: "Belum selesai" })} />
        <Stat label="Izin menunggu review" value={s.izinReviewKeamanan} sub="Tahap Keamanan" icon="building" tone={s.izinReviewKeamanan ? "yellow" : "green"} onClick={() => go("izin", { status: "Menunggu review Keamanan" })} />
      </Section>
      <Card><h3 className="mb-3 text-sm font-bold text-navy">Tamu 7 hari terakhir</h3><BarChart data={tamuPerHari(data)} height={190} /></Card>
    </>
  );
}

function KebersihanDash({ s, go, data }) {
  const a = [];
  if (s.sh.kebersihan.bermasalah) a.push({ t: "red", m: "Ada serah terima shift kebersihan dengan asset kurang atau rusak.", v: "assetKebersihan", p: { tab: "approval" } });
  if (s.sh.kebersihan.menunggu) a.push({ t: "yellow", m: `${s.sh.kebersihan.menunggu} serah terima shift kebersihan menunggu approval.`, v: "assetKebersihan", p: { tab: "approval" } });
  const st = ["Dilaporkan", "Dijadwalkan", "Diangkut"].map((x) => ({ label: x, a: data.sampahLaporan.filter((r) => r.status === x).length }));
  return (
    <>
      <Alerts list={a} go={go} />
      <Section title="Kehadiran hari ini">
        <Stat label="Hadir RW 29" value={s.hadirRW29} icon="broom" tone={s.hadirRW29 ? "green" : "yellow"} onClick={() => go("absenKebersihan", {})} />
        <Stat label="Hadir RW 31" value={s.hadirRW31} icon="broom" tone={s.hadirRW31 ? "green" : "yellow"} onClick={() => go("absenKebersihan", {})} />
      </Section>
      <Section title="Asset & serah terima">
        <Stat label="Asset belum dikembalikan" value={s.sh.kebersihan.bertugas} sub="Shift sedang berjalan" icon="box" tone={s.sh.kebersihan.bertugas ? "yellow" : "green"} onClick={() => go("assetKebersihan", { tab: "bertugas" })} />
        <Stat label="Asset bermasalah" value={s.sh.kebersihan.bermasalah} sub="Kurang atau rusak" icon="alert" tone={s.sh.kebersihan.bermasalah ? "red" : "green"} onClick={() => go("assetKebersihan", { tab: "approval" })} />
        <Stat label="Serah terima menunggu" value={s.sh.kebersihan.menunggu} sub="Perlu approval" icon="clock" tone={s.sh.kebersihan.menunggu ? "yellow" : "green"} onClick={() => go("assetKebersihan", { tab: "approval" })} />
        <Stat label="Shift selesai bersih" value={s.sh.kebersihan.bersih7} sub="7 hari terakhir" icon="check" tone="green" onClick={() => go("assetKebersihan", { tab: "riwayat" })} />
      </Section>
      <Section title="Lingkungan">
        <Stat label="Sampah belum selesai" value={s.sampahAktif} icon="trash" tone={lvl(s.sampahAktif, 4)} onClick={() => go("sampah", { tab: "laporan", status: "Belum selesai" })} />
        <Stat label="Kerusakan terkait kebersihan" value={s.kerusakanKebersihan} sub="Taman, drainase, got" icon="tool" tone={lvl(s.kerusakanKebersihan, 3)} onClick={() => go("kerusakan", { status: "Belum selesai" })} />
      </Section>
      <Card><h3 className="mb-3 text-sm font-bold text-navy">Laporan sampah menurut status</h3><BarChart data={st} height={190} /></Card>
    </>
  );
}

function BendaharaDash({ s, go, data }) {
  const k = s.kas;
  const pay = data.pembayaran.filter((p) => p.status === "Lunas").length;
  return (
    <>
      <KasHero k={k} go={go} />
      <Section title="IPL & kas">
        <Stat label="Tunggakan IPL" value={k.belumLunas} sub={`${rp(k.belumLunas * IPL_NOMINAL)} belum masuk`} icon="alert" tone={k.belumLunas > 150 ? "red" : "yellow"} onClick={() => go("keuangan", { tab: "tunggakan" })} />
        <Stat label="Pembayaran masuk" value={rp(k.masuk)} sub={`${k.lunas} rumah lunas (${k.pct}%)`} icon="check" tone="green" onClick={() => go("keuangan", { tab: "ringkasan" })} />
        <Stat label="Pengeluaran" value={rp(k.keluar)} icon="wallet" onClick={() => go("keuangan", { tab: "pengeluaran" })} />
        <Stat label="Bukti transfer menunggu" value={data.pembayaran.filter((p) => p.status === "Menunggu verifikasi").length} sub={`${pay} pembayaran tercatat`} icon="file" tone="yellow" onClick={() => go("keuangan", { tab: "bukti" })} />
      </Section>
      <Card><h3 className="mb-3 text-sm font-bold text-navy">Pemasukan vs pengeluaran</h3><BarChart data={kasChart(data)} money /></Card>
    </>
  );
}

function WargaDash({ go, data, session }) {
  const h = data.rumah.find((x) => x.id === session.houseId);
  const myAdu = data.pengaduan.filter((x) => x.rumah === session.houseId);
  const myIzin = data.izin.filter((x) => x.rumah === session.houseId);
  const status = !h ? null : h.iplStatus === "lunas" ? ["green", "Lunas", "Tidak ada tagihan"] : h.tunggakan <= 1 ? ["yellow", "Terlambat", `Tagihan ${rp(IPL_NOMINAL)}`] : ["red", "Menunggak", `${h.tunggakan} bulan, ${rp(h.tunggakan * IPL_NOMINAL)}`];
  const acts = [["Bayar IPL", "wallet", "iplSaya", {}], ["Buat pengaduan", "msg", "pengaduan", { add: true }], ["Lapor sampah", "trash", "sampah", { tab: "laporan", add: true }], ["Lapor kerusakan", "tool", "kerusakan", { add: true }], ["Ajukan izin", "building", "izin", { add: true }], ["Kontak penting", "phone", "kontak", {}]];
  return (
    <>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {h && <Stat label={`IPL rumah ${h.id}`} value={status[1]} sub={status[2]} icon="wallet" tone={status[0]} onClick={() => go("iplSaya", {})} />}
        <Stat label="Pengaduan saya" value={myAdu.length} sub={`${myAdu.filter((x) => x.status !== "Selesai").length} belum selesai`} icon="msg" tone={myAdu.some((x) => x.status === "Baru") ? "yellow" : "green"} onClick={() => go("pengaduan", {})} />
        <Stat label="Izin saya" value={myIzin.length} sub={`${myIzin.filter((x) => !x.ditolak && x.tahap < 4).length} diproses`} icon="building" onClick={() => go("izin", {})} />
        <Stat label="Pengumuman" value={data.pengumuman.length} sub="Lihat semua" icon="megaphone" onClick={() => go("pengumuman", {})} />
      </div>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {acts.map(([l, i, v, p]) => (
          <button key={l} onClick={() => go(v, p)} className="flex flex-col items-start gap-3 rounded-2xl bg-white p-4 text-left text-sm font-semibold text-navy shadow-card transition hover:-translate-y-0.5 hover:ring-2 hover:ring-mint-200"><span className="rounded-xl bg-mint-50 p-2 text-mint-700"><Icon n={i} /></span>{l}</button>
        ))}
      </div>
      <Card>
        <h3 className="mb-3 text-sm font-bold text-navy">Pengumuman terbaru</h3>
        <div className="space-y-3">{[...data.pengumuman].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 3).map((a) => (
          <button key={a.id} onClick={() => go("pengumuman", {})} className="block w-full rounded-xl bg-slate-50 p-3 text-left hover:bg-mint-50"><p className="text-sm font-semibold text-navy">{a.judul}</p><p className="mt-0.5 text-xs text-slate-500">{a.kategori} - {fmtDate(a.at)}</p></button>
        ))}</div>
      </Card>
    </>
  );
}

export default function Dashboard() {
  const { data, role, go, session } = useApp();
  const s = stats(data);
  const hr = new Date().getHours();
  const greet = hr < 11 ? "Selamat pagi" : hr < 15 ? "Selamat siang" : hr < 18 ? "Selamat sore" : "Selamat malam";
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[28px]">{role === "warga" ? "Dashboard Warga" : greet + ", " + ROLES[role]}</h1>
        <p className="mt-1 text-sm text-slate-500">{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}. Klik angka mana pun untuk melihat detailnya.</p>
      </div>
      {role === "rw" && <RWDash s={s} go={go} data={data} />}
      {role === "keamanan" && <KeamananDash s={s} go={go} data={data} />}
      {role === "kebersihan" && <KebersihanDash s={s} go={go} data={data} />}
      {role === "bendahara" && <BendaharaDash s={s} go={go} data={data} />}
      {role === "warga" && <WargaDash go={go} data={data} session={session} />}
    </div>
  );
}
