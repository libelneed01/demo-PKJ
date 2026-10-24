"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { MIN_KAS, IPL_NOMINAL } from "@/lib/config";
import { kasInfo, kasChart, iplLabel } from "@/lib/stats";
import { rp, fmtDate, fmtDT, ymd } from "@/lib/format";
import { QrPay } from "./WaIpl";
import { applyPayment } from "@/lib/wa";
import { Card, Button, Modal, Field, Input, Select, FileInput, SearchBox, DataTable, Pagination, Badge, PageHeader, Stat, BarChart, DonutChart, Tabs, ProgressBar, Icon, tones } from "../ui";

const KAT = ["Gaji Security", "Gaji Kebersihan", "Listrik Fasum", "Perbaikan", "Operasional", "Perlengkapan", "Rapat", "Taman", "Keamanan", "Lain-lain"];
const METODE = ["QRIS", "Virtual Account BCA", "Virtual Account Mandiri", "Transfer Bank", "GoPay / OVO"];
const LBL = { lunas: ["green", "Lunas"], terlambat: ["yellow", "Terlambat"], menunggak: ["red", "Menunggak"] };

export default function Keuangan({ params }) {
  const { data } = useApp();
  const [tab, setTab] = useState(params.tab || "ringkasan");
  const tabs = [
    { id: "ringkasan", label: "Ringkasan IPL" }, { id: "tunggakan", label: "Tunggakan", count: data.rumah.filter((h) => h.iplStatus !== "lunas").length },
    { id: "pengeluaran", label: "Pengeluaran" }, { id: "neraca", label: "Neraca" }, { id: "online", label: "Pembayaran Online" }, { id: "bukti", label: "Bukti Transfer" },
  ];
  return (
    <div>
      <PageHeader title="Keuangan" desc="IPL, pengeluaran, neraca, dan kesehatan kas komplek." />
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      {tab === "ringkasan" && <Ringkasan params={params} setTab={setTab} />}
      {tab === "tunggakan" && <Tunggakan params={params} />}
      {tab === "pengeluaran" && <Pengeluaran />}
      {tab === "neraca" && <Neraca />}
      {tab === "online" && <Online />}
      {tab === "bukti" && <Bukti />}
    </div>
  );
}

function Ringkasan({ params, setTab }) {
  const { data, go } = useApp();
  const [rw, setRw] = useState(params.rw || "");
  const R = data.rumah.filter((h) => !rw || String(h.rw) === rw);
  const c = (l) => R.filter((h) => iplLabel(h) === l).length;
  const lunas = c("lunas"), tl = c("terlambat"), mg = c("menunggak");
  const pct = R.length ? Math.round((lunas / R.length) * 100) : 0;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-navy">{R.length} rumah, IPL {rp(IPL_NOMINAL)} per bulan</h2>
        <Select value={rw} onChange={(e) => setRw(e.target.value)} placeholder="Semua RW" options={[{ value: "29", label: "RW 29" }, { value: "31", label: "RW 31" }]} className="!w-auto min-w-[130px]" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Lunas" value={lunas} sub={`${pct}% terkumpul`} tone="green" icon="check" />
        <Stat label="Terlambat" value={tl} sub="Telat 1 bulan" tone="yellow" icon="clock" onClick={() => go("keuangan", { tab: "tunggakan", level: "terlambat", rw })} />
        <Stat label="Menunggak" value={mg} sub="Telat 2 bulan atau lebih" tone={mg > 100 ? "red" : "yellow"} icon="alert" onClick={() => go("keuangan", { tab: "tunggakan", level: "menunggak", rw })} />
        <Stat label="IPL terkumpul" value={rp(lunas * IPL_NOMINAL)} sub={`dari ${rp(R.length * IPL_NOMINAL)}`} icon="wallet" />
      </div>
      <Card className="max-w-md"><h3 className="mb-3 text-sm font-bold text-navy">Status IPL</h3><DonutChart data={[{ name: "Lunas", value: lunas, color: "#3DBE8F" }, { name: "Terlambat", value: tl, color: "#F5B83D" }, { name: "Menunggak", value: mg, color: "#E5484D" }]} center={pct + "%"} /></Card>
    </div>
  );
}

function Tunggakan({ params }) {
  const { data, update, add, toast, role } = useApp();
  const [rw, setRw] = useState(params.rw || "");
  const [level, setLevel] = useState(params.level || "");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState(null);
  const canMark = role === "bendahara" || role === "rw";
  let rows = data.rumah.filter((h) => h.iplStatus !== "lunas" && (!rw || String(h.rw) === rw) && (!level || iplLabel(h) === level));
  if (q) rows = rows.filter((h) => [h.id, h.owner, h.penyewa].some((x) => String(x || "").toLowerCase().includes(q.toLowerCase())));
  rows = [...rows].sort((a, b) => b.tunggakan - a.tunggakan || a.id.localeCompare(b.id));
  const cur = sel ? data.rumah.find((h) => h.id === sel) : null;
  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Cari blok atau nama" />
        <Select value={rw} onChange={(e) => { setRw(e.target.value); setPage(1); }} placeholder="Semua RW" options={[{ value: "29", label: "RW 29" }, { value: "31", label: "RW 31" }]} className="!w-auto min-w-[120px]" />
        <Select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }} placeholder="Terlambat & menunggak" options={[{ value: "terlambat", label: "Terlambat" }, { value: "menunggak", label: "Menunggak" }]} className="!w-auto min-w-[190px]" />
      </div>
      <p className="mb-3 text-sm text-slate-500">{rows.length} rumah, total {rp(rows.reduce((a, h) => a + h.tunggakan * IPL_NOMINAL, 0))}</p>
      <DataTable onRow={(h) => setSel(h.id)} rows={rows.slice((page - 1) * 12, page * 12)} columns={[
        { label: "Rumah", render: (h) => <div><p className="font-semibold text-navy">{h.id}</p><p className="text-xs text-slate-500">RW {h.rw}</p></div> },
        { label: "Penghuni / pemilik", render: (h) => (h.status === "ngontrak" ? h.penyewa : h.owner) },
        { label: "Status", render: (h) => <Badge tone={LBL[iplLabel(h)][0]}>{LBL[iplLabel(h)][1]} {h.tunggakan} bln</Badge> },
        { label: "Jumlah", render: (h) => rp(h.tunggakan * IPL_NOMINAL) },
      ]} />
      <Pagination page={page} total={rows.length} size={12} onPage={setPage} />
      <Modal open={!!cur} onClose={() => setSel(null)} title={cur ? `Tunggakan ${cur.id}` : ""} footer={cur && <><Button variant="ghost" onClick={() => toast(`Pengingat (simulasi) dikirim ke ${cur.hp}`)}>Kirim pengingat</Button>{canMark && <Button variant="mint" onClick={() => { update("rumah", cur.id, { iplStatus: "lunas", tunggakan: 0 }); add("pembayaran", { houseId: cur.id, nama: cur.owner, nominal: cur.tunggakan * IPL_NOMINAL, metode: "Tunai (Bendahara)", status: "Lunas", bukti: "" }); toast(`${cur.id} ditandai lunas`); setSel(null); }}>Tandai lunas</Button>}</>}>
        {cur && (
          <dl className="grid gap-3 sm:grid-cols-2">
            {[["Pemilik", cur.owner], ["Pengontrak", cur.penyewa || "-"], ["HP", cur.status === "ngontrak" ? cur.penyewaHp : cur.hp], ["Status hunian", cur.status], ["Bulan tertunggak", cur.tunggakan], ["Total tunggakan", rp(cur.tunggakan * IPL_NOMINAL)]].map(([k, v]) => <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="text-sm font-medium text-navy">{v}</dd></div>)}
          </dl>
        )}
      </Modal>
    </Card>
  );
}

function Pengeluaran() {
  const { data, add, remove, toast, role } = useApp();
  const [f, setF] = useState({ kategori: "", ket: "", nominal: "", tanggal: ymd(new Date()), bukti: "" });
  const [errs, setErrs] = useState({});
  const canAdd = role === "bendahara";
  const k = kasInfo(data);
  const submit = () => {
    const e = {};
    if (!f.kategori) e.kategori = "Pilih kategori";
    if (!f.ket.trim()) e.ket = "Wajib diisi";
    if (!(Number(f.nominal) > 0)) e.nominal = "Isi nominal lebih dari 0";
    if (!f.tanggal) e.tanggal = "Wajib diisi";
    setErrs(e); if (Object.keys(e).length) return;
    const saldoBaru = k.saldo - Number(f.nominal);
    add("pengeluaran", { ...f, nominal: Number(f.nominal) });
    setF({ kategori: "", ket: "", nominal: "", tanggal: ymd(new Date()), bukti: "" });
    if (saldoBaru < MIN_KAS) toast("Peringatan: saldo kas sekarang di bawah batas minimum Rp 15.000.000", "red"); else toast("Pengeluaran dicatat");
  };
  const rows = [...data.pengeluaran].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {canAdd && (
        <Card className="lg:col-span-2">
          <h3 className="mb-4 text-base font-bold text-navy">Input pengeluaran</h3>
          <div className="space-y-4">
            <Field label="Kategori *" error={errs.kategori}><Select value={f.kategori} onChange={(e) => setF({ ...f, kategori: e.target.value })} options={KAT} placeholder="Pilih kategori" /></Field>
            <Field label="Keterangan *" error={errs.ket}><Input value={f.ket} onChange={(e) => setF({ ...f, ket: e.target.value })} /></Field>
            <Field label="Nominal (Rp) *" error={errs.nominal}><Input type="number" min="0" value={f.nominal} onChange={(e) => setF({ ...f, nominal: e.target.value })} /></Field>
            <Field label="Tanggal *" error={errs.tanggal}><Input type="date" value={f.tanggal} onChange={(e) => setF({ ...f, tanggal: e.target.value })} /></Field>
            <Field label="Bukti / nota"><FileInput value={f.bukti} onChange={(v) => setF({ ...f, bukti: v })} modul="Keuangan" /></Field>
            <Button className="w-full" onClick={submit}>Simpan pengeluaran</Button>
          </div>
        </Card>
      )}
      <Card className={canAdd ? "lg:col-span-3" : "lg:col-span-5"}>
        <div className="mb-3 flex items-center justify-between"><h3 className="text-base font-bold text-navy">Daftar pengeluaran</h3><span className="text-sm font-semibold text-navy">{rp(k.keluar)}</span></div>
        {!canAdd && <p className="mb-3 text-xs text-slate-500">Input pengeluaran dilakukan oleh Bendahara.</p>}
        <DataTable rows={rows.slice(0, 20)} columns={[
          { label: "Kategori", render: (r) => <div><p className="font-semibold text-navy">{r.kategori}</p><p className="text-xs text-slate-500">{r.ket}</p></div> },
          { label: "Tanggal", render: (r) => fmtDate(r.tanggal) }, { label: "Nominal", render: (r) => rp(r.nominal) },
          { label: "Bukti", render: (r) => (r.bukti ? <Badge tone="green">Ada</Badge> : <Badge tone="gray">Belum</Badge>) },
          ...(canAdd ? [{ label: "", render: (r) => <button onClick={() => { remove("pengeluaran", r.id); toast("Pengeluaran dihapus"); }} className="text-xs font-semibold text-rose-600">Hapus</button> }] : []),
        ]} />
      </Card>
    </div>
  );
}

function Neraca() {
  const { data } = useApp();
  const k = kasInfo(data);
  const bar = Math.min(100, (k.saldo / (MIN_KAS * 2)) * 100);
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-sm text-slate-500">Saldo kas</p><p className="mt-1 text-4xl font-bold tracking-tight text-navy">{rp(k.saldo)}</p></div>
          <Badge tone={k.tone}>{k.label}</Badge>
        </div>
        <div className="mt-5"><ProgressBar value={bar} tone={k.tone} /><div className="mt-2 flex justify-between text-xs text-slate-500"><span>Rp 0</span><span>Batas minimum {rp(MIN_KAS)}</span><span>{rp(MIN_KAS * 2)}</span></div></div>
        <p className="mt-4 text-sm text-slate-600">{k.tone === "red" ? "Saldo di bawah batas minimum. Tahan pengeluaran non-esensial dan percepat penagihan IPL." : k.tone === "yellow" ? `Saldo hanya ${rp(k.saldo - MIN_KAS)} di atas batas minimum. Pantau pengeluaran berikutnya.` : `Saldo ${rp(k.saldo - MIN_KAS)} di atas batas minimum.`}</p>
      </Card>
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3"><h3 className="mb-3 text-sm font-bold text-navy">Pemasukan vs pengeluaran</h3><BarChart data={kasChart(data)} money /></Card>
        <Card className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-bold text-navy">Neraca bulan ini</h3>
          <dl className="space-y-3 text-sm">
            {[["Saldo awal bulan", k.saldo - k.masuk + k.keluar, ""], ["Pemasukan IPL", k.masuk, "text-emerald-600"], ["Pengeluaran", -k.keluar, "text-rose-600"]].map(([l, v, c]) => (
              <div key={l} className="flex justify-between"><dt className="text-slate-500">{l}</dt><dd className={`font-semibold ${c}`}>{v < 0 ? "- " + rp(-v) : rp(v)}</dd></div>
            ))}
            <div className="flex justify-between border-t border-slate-100 pt-3"><dt className="font-bold text-navy">Saldo kas</dt><dd className={`font-bold ${tones.TEXT[k.tone]}`}>{rp(k.saldo)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Batas minimum</dt><dd className="font-semibold">{rp(MIN_KAS)}</dd></div>
          </dl>
        </Card>
      </div>
    </div>
  );
}

function HouseInput({ value, onChange, fixed, h }) {
  const { data } = useApp();
  return (
    <>
      {!fixed && (<>
        <Field label="Blok & nomor rumah *" hint="Contoh: A-12 atau G-45"><Input list="rumah-list" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Ketik blok-nomor" /></Field>
        <datalist id="rumah-list">{data.rumah.map((x) => <option key={x.id} value={x.id} />)}</datalist>
        {value && !h && <p className="text-xs text-rose-600">Rumah tidak ditemukan.</p>}
      </>)}
      {h && (
        <div className="rounded-xl bg-slate-50 p-4 text-sm">
          <p className="font-semibold text-navy">{h.id} - {h.status === "ngontrak" ? h.penyewa : h.owner}</p>
          <p className="mt-1">{h.iplStatus === "lunas" ? <Badge tone="green">IPL lunas</Badge> : <Badge tone={LBL[iplLabel(h)][0]}>{LBL[iplLabel(h)][1]} {h.tunggakan} bulan: {rp(h.tunggakan * IPL_NOMINAL)}</Badge>}</p>
        </div>
      )}
    </>
  );
}

export function Online({ fixedId }) {
  return <QrPay fixedId={fixedId} />;
}

export function Bukti({ fixedId }) {
  const { data, add, mutate, toast, role } = useApp();
  const [houseId, setHouseId] = useState(fixedId || "");
  const [bukti, setBukti] = useState("");
  const [nominal, setNominal] = useState("");
  const h = data.rumah.find((x) => x.id === houseId.trim().toUpperCase());
  const canVerify = role === "bendahara" || role === "rw";
  const pending = data.pembayaran.filter((p) => p.status === "Menunggu verifikasi" && (!fixedId || p.houseId === fixedId));
  const upload = () => {
    if (!h) return toast("Pilih rumah yang valid terlebih dahulu", "yellow");
    if (!bukti) return toast("Unggah bukti pembayaran dahulu", "yellow");
    if (!(Number(nominal) > 0)) return toast("Isi nominal transfer", "yellow");
    add("pembayaran", { houseId: h.id, nama: h.status === "ngontrak" ? h.penyewa : h.owner, nominal: Number(nominal), metode: "Transfer (bukti)", status: "Menunggu verifikasi", bukti });
    setBukti(""); setNominal(""); toast("Bukti terkirim. Menunggu verifikasi bendahara.");
  };
  const verify = (p) => {
    const n = Math.max(1, Math.round(p.nominal / IPL_NOMINAL));
    mutate((x) => applyPayment(x, { houseId: p.houseId, n, metode: "Transfer (bukti)", sumber: "Bukti transfer", payId: p.id }));
    toast("Pembayaran diverifikasi. Notifikasi WhatsApp dibuat (simulasi).");
  };
  return (
    <div className="space-y-6">
      <Card className="max-w-xl">
        <h3 className="mb-1 text-base font-bold text-navy">Upload bukti transfer</h3>
        <p className="mb-4 text-xs text-slate-500">Sudah transfer manual? Unggah buktinya (file hanya disimulasikan).</p>
        <div className="space-y-4">
          <HouseInput value={houseId} onChange={setHouseId} fixed={!!fixedId} h={h} />
          <Field label="Nominal transfer (Rp) *"><Input type="number" value={nominal} onChange={(e) => setNominal(e.target.value)} placeholder={String(IPL_NOMINAL)} /></Field>
          <Field label="Bukti transfer *"><FileInput value={bukti} onChange={setBukti} modul="Keuangan" /></Field>
          <Button className="w-full" onClick={upload}>Kirim bukti</Button>
        </div>
      </Card>
      {pending.length > 0 && (
        <Card><h3 className="mb-3 text-base font-bold text-navy">Menunggu verifikasi ({pending.length})</h3>
          <DataTable rows={pending} columns={[{ label: "Rumah", key: "houseId" }, { label: "Nama", key: "nama" }, { label: "Nominal", render: (p) => rp(p.nominal) }, { label: "Bukti", key: "bukti" }, { label: "", render: (p) => (canVerify ? <Button variant="soft" onClick={() => verify(p)}>Verifikasi</Button> : <Badge tone="yellow">Menunggu</Badge>) }]} />
        </Card>
      )}
      <Card>
        <h3 className="mb-3 text-base font-bold text-navy">Riwayat pembayaran</h3>
        <DataTable rows={[...data.pembayaran].filter((p) => !fixedId || p.houseId === fixedId).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 10)} empty="Belum ada pembayaran." columns={[
          { label: "Rumah", key: "houseId" }, { label: "Nominal", render: (p) => rp(p.nominal) }, { label: "Metode", key: "metode" },
          { label: "Waktu", render: (p) => fmtDT(p.at) }, { label: "Status", render: (p) => <Badge tone={p.status === "Lunas" ? "green" : "yellow"}>{p.status}</Badge> },
        ]} />
      </Card>
    </div>
  );
}

export function IPLSaya() {
  const { data, session, setSession } = useApp();
  const [tab, setTab] = useState("online");
  const h = data.rumah.find((x) => x.id === session.houseId);
  return (
    <div>
      <PageHeader title="IPL Saya" desc="Cek status IPL rumah Anda, bayar online (simulasi), atau unggah bukti transfer." />
      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <Field label="Rumah saya" className="min-w-[200px]"><Select value={session.houseId} onChange={(e) => setSession({ houseId: e.target.value })} options={data.rumah.map((x) => x.id)} /></Field>
          {h && (<div><p className="text-xs text-slate-500">Status IPL</p><div className="mt-1.5">{h.iplStatus === "lunas" ? <Badge tone="green">Lunas</Badge> : <Badge tone={LBL[iplLabel(h)][0]}>{LBL[iplLabel(h)][1]} {h.tunggakan} bulan, {rp(h.tunggakan * IPL_NOMINAL)}</Badge>}</div></div>)}
        </div>
      </Card>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "online", label: "Bayar online" }, { id: "bukti", label: "Bukti transfer" }]} />
      {tab === "online" ? <Online key={session.houseId} fixedId={session.houseId} /> : <Bukti key={session.houseId} fixedId={session.houseId} />}
    </div>
  );
}
