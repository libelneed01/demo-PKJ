"use client";
import { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { JENIS, JENIS_TONE, monthList, monthKey, staffStats, eval6, danruInfo, belumDanru, applyRotasi, monthsSince } from "@/lib/kpi";
import { fmtDate, ymd } from "@/lib/format";
import { Card, Button, Modal, Field, Input, Select, Textarea, FileInput, Badge, PageHeader, Stat, Tabs, DataTable, BarChart, ProgressBar, Icon, Empty } from "../ui";

const UNIT = { security: "Security", kebersihan: "Kebersihan" };
const gradeTone = { A: "green", B: "green", C: "yellow", D: "red" };

function Rekom({ r, ev }) {
  if (r.binaan) return <Badge tone="red">Pembinaan</Badge>;
  if (ev && ev.layakNaik) return <Badge tone="green">Layak naik gaji</Badge>;
  if (r.bonus) return <Badge tone="green">Layak bonus</Badge>;
  return <Badge tone="gray">Pertahankan</Badge>;
}

export default function Kinerja({ params }) {
  const { data, role, add, update, mutate, toast } = useApp();
  const months = monthList(6);
  const allowed = role === "keamanan" ? ["security"] : role === "kebersihan" ? ["kebersihan"] : ["security", "kebersihan"];
  const canEdit = role === "rw" || role === "keamanan" || role === "kebersihan";
  const [tab, setTab] = useState(params.tab || "kpi");
  const [month, setMonth] = useState(params.month || monthKey(new Date()));
  const [unit, setUnit] = useState(allowed.length === 1 ? allowed[0] : "all");
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(null);
  const [errs, setErrs] = useState({});
  const [rot, setRot] = useState(null);

  const rows = useMemo(() => staffStats(data, month).filter((r) => allowed.includes(r.p.unit) && (unit === "all" || r.p.unit === unit)), [data, month, unit, role]); // eslint-disable-line
  const ev6 = useMemo(() => Object.fromEntries(rows.map((r) => [r.p.id, eval6(data, r.p)])), [rows, data]);
  const mLabel = (months.find((m) => m.key === month) || {}).label || month;
  const avgTotal = rows.length ? Math.round(rows.reduce((a, b) => a + b.total, 0) / rows.length) : 0;
  const cur = detail ? rows.find((r) => r.p.id === detail) || staffStats(data, month).find((r) => r.p.id === detail) : null;

  const lateRows = [...rows].filter((r) => r.telat > 0).sort((a, b) => b.telat - a.telat || b.menit - a.menit);
  const events = (data.ketidakhadiran || []).filter((e) => String(e.tanggal).startsWith(month) && allowed.includes(e.unit) && (unit === "all" || e.unit === unit)).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  const cnt = (j) => events.filter((e) => e.jenis === j).length;
  const staffOpts = (data.petugas || []).filter((p) => allowed.includes(p.unit)).map((p) => ({ value: p.id, label: `${p.nama} (${UNIT[p.unit]} - ${p.group})` }));

  const saveAbsen = () => {
    const e = {};
    if (!form.petugasId) e.petugasId = "Pilih petugas";
    if (!form.tanggal) e.tanggal = "Wajib diisi";
    if (!form.jenis) e.jenis = "Pilih jenis";
    if (!form.keterangan.trim()) e.keterangan = "Wajib diisi";
    if (form.jenis === "Sakit dengan surat" && !form.surat) e.surat = "Unggah surat dokter untuk jenis ini";
    setErrs(e); if (Object.keys(e).length) return toast("Lengkapi data ketidakhadiran", "yellow");
    const p = data.petugas.find((x) => x.id === form.petugasId);
    add("ketidakhadiran", { petugasId: p.id, nama: p.nama, unit: p.unit, group: p.group, tanggal: form.tanggal, jenis: form.jenis, keterangan: form.keterangan.trim(), surat: form.jenis === "Sakit dengan surat" ? form.surat : "" });
    setForm(null); toast(`${form.jenis} dicatat untuk ${p.nama}`, form.jenis === "Sakit dengan surat" ? "green" : "yellow");
  };

  const groups = [];
  allowed.forEach((u) => [...new Set(data.petugas.filter((p) => p.unit === u).map((p) => p.group))].forEach((g) => groups.push({ unit: u, group: g })));
  const rotInfo = rot ? danruInfo(data, rot.unit, rot.group) : null;
  const doRotasi = () => {
    if (!rot.newId) return toast("Pilih danru pengganti", "yellow");
    const nama = data.petugas.find((p) => p.id === rot.newId).nama;
    mutate((x) => applyRotasi(x, { unit: rot.unit, group: rot.group, newId: rot.newId }));
    toast(`${nama} resmi menjadi Danru ${rot.group}`); setRot(null);
  };
  const antre = belumDanru(data).filter((b) => allowed.includes(b.p.unit) && (unit === "all" || b.p.unit === unit));
  const riwayat = data.petugas.filter((p) => allowed.includes(p.unit)).flatMap((p) => (p.riwayatDanru || []).map((h, i) => ({ id: p.id + i, nama: p.nama, group: h.group, unit: p.unit, mulai: h.mulai, selesai: h.selesai }))).sort((a, b) => b.selesai.localeCompare(a.selesai));

  return (
    <div>
      <PageHeader title="KPI & Rotasi Petugas" desc="Keterlambatan, ketidakhadiran, nilai KPI untuk bonus dan kenaikan gaji, serta rotasi Danru setiap 6 bulan." />
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="min-w-[170px]"><Select value={month} onChange={(e) => setMonth(e.target.value)} options={months.map((m) => ({ value: m.key, label: m.label }))} /></div>
        {allowed.length > 1 && <div className="min-w-[170px]"><Select value={unit} onChange={(e) => setUnit(e.target.value)} options={[{ value: "all", label: "Security & Kebersihan" }, { value: "security", label: "Security" }, { value: "kebersihan", label: "Kebersihan" }]} /></div>}
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "kpi", label: "Ringkasan KPI" }, { id: "telat", label: "Keterlambatan", count: lateRows.length }, { id: "absen", label: "Ketidakhadiran", count: events.length }, { id: "rotasi", label: "Rotasi Danru" }]} />

      {tab === "kpi" && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Rata-rata KPI" value={avgTotal} sub={`${rows.length} petugas, ${mLabel}`} icon="sparkle" tone={avgTotal >= 85 ? "green" : avgTotal >= 70 ? "yellow" : "red"} />
            <Stat label="Layak bonus" value={rows.filter((r) => r.bonus).length} sub="KPI 85+, telat maks 1, tanpa alpa" icon="check" tone="green" />
            <Stat label="Layak naik gaji" value={rows.filter((r) => ev6[r.p.id] && ev6[r.p.id].layakNaik).length} sub="Rata-rata 6 bulan 85+" icon="wallet" tone="green" />
            <Stat label="Perlu pembinaan" value={rows.filter((r) => r.binaan).length} sub="KPI di bawah 70 atau alpa" icon="alert" tone={rows.some((r) => r.binaan) ? "red" : "green"} />
          </div>
          <Card>
            <DataTable onRow={(r) => setDetail(r.p.id)} rows={[...rows].sort((a, b) => b.total - a.total).map((r) => ({ ...r, id: r.p.id }))} columns={[
              { label: "Petugas", render: (r) => <div><p className="font-semibold text-navy">{r.p.nama} {r.p.jabatan === "Danru" && <Badge tone="navy">Danru</Badge>}</p><p className="text-xs text-slate-500">{UNIT[r.p.unit]} - {r.p.group}</p></div> },
              { label: "Danru (komandan regu)", render: (r) => (r.danru ? r.danru.nama : "-") },
              { label: "Terlambat", render: (r) => <span className={r.telat >= 3 ? "font-bold text-rose-600" : ""}>{r.telat}x</span> },
              { label: "Sakit surat / tanpa", render: (r) => `${r.sakitSurat} / ${r.sakitTanpa}` }, { label: "Alpa", render: (r) => r.alpa },
              { label: "KPI", render: (r) => <div className="w-28"><div className="mb-1 flex justify-between text-xs"><b className="text-navy">{r.total}</b><Badge tone={gradeTone[r.grade]}>{r.grade}</Badge></div><ProgressBar value={r.total} tone={gradeTone[r.grade]} /></div> },
              { label: "Rekomendasi", render: (r) => <Rekom r={r} ev={ev6[r.p.id]} /> },
            ]} />
          </Card>
          <Card className="mt-4 text-sm text-slate-600">
            <p className="mb-2 font-bold text-navy">Rumus KPI (usulan, bisa disesuaikan)</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Ketepatan waktu 35 poin: dikurangi 5 poin per keterlambatan dan 1 poin per 30 menit terlambat.</li>
              <li>Kehadiran 35 poin: dikurangi alpa 12, sakit tanpa surat 7, izin 2, sakit dengan surat 1.</li>
              <li>Penilaian Danru 30 poin: nilai 0-100 dari Danru dikali 30%.</li>
              <li>Bonus: KPI bulan 85+, terlambat maksimal 1 kali, tanpa alpa dan tanpa sakit tanpa surat. Naik gaji (evaluasi 6 bulan): rata-rata KPI 85+, tanpa alpa, sakit tanpa surat maksimal 1, terlambat maksimal 6 kali. Pembinaan: KPI di bawah 70, alpa 2 kali atau lebih, atau sakit tanpa surat 3 kali atau lebih.</li>
            </ul>
          </Card>
        </>
      )}

      {tab === "telat" && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Petugas terlambat" value={lateRows.length} sub={`dari ${rows.length} petugas`} icon="clock" tone={lateRows.length > rows.length / 2 ? "red" : "yellow"} />
            <Stat label="Total kejadian" value={rows.reduce((a, b) => a + b.telat, 0)} sub={mLabel} icon="alert" tone="yellow" />
            <Stat label="Sering terlambat" value={rows.filter((r) => r.telat >= 3).length} sub="3 kali atau lebih" icon="shield" tone={rows.some((r) => r.telat >= 3) ? "red" : "green"} />
            <Stat label="Paling sering" value={lateRows[0] ? lateRows[0].p.nama.split(" ")[0] : "-"} sub={lateRows[0] ? `${lateRows[0].telat}x, ${lateRows[0].menit} menit` : "Tidak ada"} icon="users" />
          </div>
          <Card className="mb-4">
            {lateRows.length === 0 ? <Empty text="Tidak ada keterlambatan pada bulan ini." /> : (
              <DataTable onRow={(r) => setDetail(r.p.id)} rows={lateRows.map((r) => ({ ...r, id: r.p.id }))} columns={[
                { label: "Petugas", render: (r) => <div><p className="font-semibold text-navy">{r.p.nama}</p><p className="text-xs text-slate-500">{UNIT[r.p.unit]} - {r.p.group}</p></div> },
                { label: "Danru (komandan regu)", render: (r) => (r.danru ? r.danru.nama : "-") },
                { label: "Jumlah terlambat", render: (r) => <Badge tone={r.telat >= 5 ? "red" : r.telat >= 3 ? "yellow" : "gray"}>{r.telat} kali</Badge> },
                { label: "Total menit", render: (r) => `${r.menit} menit` }, { label: "Terakhir", render: (r) => fmtDate(r.lastLate) },
              ]} />
            )}
          </Card>
          {lateRows.length > 0 && <Card><h3 className="mb-3 text-[15px] font-bold text-navy">Frekuensi terlambat per petugas</h3><BarChart data={lateRows.slice(0, 8).map((r) => ({ label: r.p.nama.split(" ")[0], a: r.telat }))} height={220} /></Card>}
        </>
      )}

      {tab === "absen" && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Sakit dengan surat" value={cnt("Sakit dengan surat")} sub="Ada surat dokter" icon="file" tone="green" />
            <Stat label="Sakit tanpa surat" value={cnt("Sakit tanpa surat")} sub="Tidak ada surat" icon="alert" tone={cnt("Sakit tanpa surat") ? "red" : "green"} />
            <Stat label="Izin" value={cnt("Izin")} icon="clock" tone="navy" />
            <Stat label="Alpa" value={cnt("Alpa")} sub="Tanpa keterangan" icon="alert" tone={cnt("Alpa") ? "red" : "green"} />
          </div>
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[15px] font-bold text-navy">Ketidakhadiran {mLabel}</h3>
              {canEdit && <Button icon="plus" onClick={() => { setForm({ petugasId: "", tanggal: ymd(new Date()), jenis: "", keterangan: "", surat: "" }); setErrs({}); }}>Catat ketidakhadiran</Button>}
            </div>
            <DataTable rows={events} empty="Tidak ada ketidakhadiran tercatat pada bulan ini." columns={[
              { label: "Tanggal", render: (e) => fmtDate(e.tanggal) },
              { label: "Petugas", render: (e) => <div><p className="font-semibold text-navy">{e.nama}</p><p className="text-xs text-slate-500">{UNIT[e.unit]} - {e.group}</p></div> },
              { label: "Danru", render: (e) => { const d = (data.petugas || []).find((p) => p.unit === e.unit && p.group === e.group && p.jabatan === "Danru"); return d ? d.nama : "-"; } },
              { label: "Jenis", render: (e) => <Badge tone={JENIS_TONE[e.jenis]}>{e.jenis}</Badge> },
              { label: "Surat", render: (e) => (e.surat ? <span className="inline-flex items-center gap-1 text-xs text-emerald-700"><Icon n="file" className="h-3.5 w-3.5" />{e.surat}</span> : <span className="text-xs text-slate-400">Tidak ada</span>) },
              { label: "Keterangan", key: "keterangan" },
            ]} />
          </Card>
        </>
      )}

      {tab === "rotasi" && (
        <>
          <p className="mb-4 text-sm text-slate-500">Danru diganti setiap 6 bulan. Prioritas pengganti: yang belum pernah menjadi Danru, lalu KPI 6 bulan tertinggi.</p>
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            {groups.filter((g) => unit === "all" || g.unit === unit).map((g) => {
              const i = danruInfo(data, g.unit, g.group);
              return (
                <Card key={g.unit + g.group}>
                  <div className="flex items-start justify-between gap-2"><div><p className="text-xs text-slate-500">{UNIT[g.unit]}</p><p className="text-base font-bold text-navy">{g.group}</p></div><Badge tone={i.status}>{i.status === "red" ? "Jatuh tempo rotasi" : i.status === "yellow" ? "Segera rotasi" : "Aman"}</Badge></div>
                  <p className="mt-4 text-xs text-slate-500">Danru (komandan regu)</p>
                  <p className="text-lg font-bold text-navy">{i.danru ? i.danru.nama : "Belum ada"}</p>
                  {i.danru && <p className="mt-1 text-xs text-slate-500">Menjabat {i.bulan} bulan sejak {fmtDate(i.danru.danruMulai)}. Rotasi berikutnya {fmtDate(i.due)}.</p>}
                  {i.danru && <div className="mt-3"><ProgressBar value={Math.min(100, (i.bulan / 6) * 100)} tone={i.status} /></div>}
                  <p className="mb-1.5 mt-4 text-xs font-semibold text-slate-500">Kandidat pengganti</p>
                  <ul className="space-y-1.5">{i.kandidat.slice(0, 3).map((k) => <li key={k.p.id} className="flex items-center justify-between gap-2 text-sm"><span className="text-navy">{k.p.nama}</span><span className="flex items-center gap-2">{!k.pernah && <Badge tone="green">Belum pernah</Badge>}<span className="text-xs text-slate-500">KPI {k.avg}</span></span></li>)}</ul>
                  {canEdit && <Button className="mt-4" variant={i.status === "green" ? "ghost" : "mint"} onClick={() => setRot({ unit: g.unit, group: g.group, newId: i.kandidat[0] ? i.kandidat[0].p.id : "" })}>Rotasi Danru</Button>}
                </Card>
              );
            })}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="mb-1 text-[15px] font-bold text-navy">Belum pernah jadi Danru ({antre.length})</h3>
              <p className="mb-3 text-xs text-slate-500">Antrean rotasi, diurutkan dari masa kerja terlama.</p>
              <DataTable rows={antre.map((b) => ({ ...b, id: b.p.id }))} columns={[{ label: "Petugas", render: (b) => <div><p className="font-semibold text-navy">{b.p.nama}</p><p className="text-xs text-slate-500">{UNIT[b.p.unit]} - {b.p.group}</p></div> }, { label: "Masa kerja", render: (b) => `${b.masa} bln` }, { label: "KPI 6 bln", render: (b) => <Badge tone={b.avg >= 85 ? "green" : b.avg >= 70 ? "yellow" : "red"}>{b.avg}</Badge> }]} />
            </Card>
            <Card>
              <h3 className="mb-1 text-[15px] font-bold text-navy">Riwayat Danru</h3>
              <p className="mb-3 text-xs text-slate-500">Yang pernah menjabat dan sudah dirotasi.</p>
              <DataTable rows={riwayat} empty="Belum ada riwayat rotasi." columns={[{ label: "Petugas", render: (h) => <div><p className="font-semibold text-navy">{h.nama}</p><p className="text-xs text-slate-500">{h.group}</p></div> }, { label: "Masa jabatan", render: (h) => `${fmtDate(h.mulai)} - ${fmtDate(h.selesai)}` }, { label: "Lama", render: (h) => `${monthsSince(h.mulai, new Date(h.selesai))} bln` }]} />
            </Card>
          </div>
        </>
      )}

      <Modal open={!!cur} onClose={() => setDetail(null)} wide title={cur ? cur.p.nama : ""}>
        {cur && (() => { const e6 = eval6(data, cur.p); return (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2"><Badge tone={gradeTone[cur.grade]}>KPI {cur.total} ({cur.grade})</Badge><Rekom r={cur} ev={e6} /><span className="text-xs text-slate-500">{UNIT[cur.p.unit]} - {cur.p.group} - Danru: {cur.danru ? cur.danru.nama : "-"}</span></div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[["Ketepatan waktu", cur.skorWaktu, 35, `${cur.telat}x terlambat, ${cur.menit} menit`], ["Kehadiran", cur.skorHadir, 35, `Sakit tanpa surat ${cur.sakitTanpa}, alpa ${cur.alpa}, izin ${cur.izin}`], ["Penilaian Danru", cur.skorDanru, 30, `Nilai ${cur.p.nilaiDanru}`]].map(([l, v, m, sub]) => (
                <div key={l} className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{l}</p><p className="text-2xl font-extrabold text-navy">{v}<span className="text-sm font-medium text-slate-400"> / {m}</span></p><div className="mt-2"><ProgressBar value={(v / m) * 100} tone={v / m >= 0.85 ? "green" : v / m >= 0.6 ? "yellow" : "red"} /></div><p className="mt-2 text-xs text-slate-500">{sub}</p></div>
              ))}
            </div>
            <div><p className="mb-2 text-sm font-bold text-navy">KPI 6 bulan terakhir (rata-rata {e6.avg})</p><BarChart data={e6.months.map((m) => ({ label: m.short, a: m.total }))} height={170} /></div>
            <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">Evaluasi kenaikan gaji 6 bulan: rata-rata KPI {e6.avg}, alpa {e6.alpa}, sakit tanpa surat {e6.sakitTanpa}, terlambat {e6.telat} kali. {e6.layakNaik ? "Memenuhi syarat naik gaji." : "Belum memenuhi syarat naik gaji."}</p>
            {cur.events.length > 0 && <div><p className="mb-2 text-sm font-bold text-navy">Ketidakhadiran bulan ini</p><ul className="space-y-1.5">{cur.events.map((e) => <li key={e.id} className="flex flex-wrap items-center gap-2 text-sm"><Badge tone={JENIS_TONE[e.jenis]}>{e.jenis}</Badge><span className="text-slate-600">{fmtDate(e.tanggal)} - {e.keterangan}{e.surat ? ` (${e.surat})` : ""}</span></li>)}</ul></div>}
            {canEdit && <NilaiDanru p={cur.p} onSave={(v) => { update("petugas", cur.p.id, { nilaiDanru: v }); toast("Penilaian Danru disimpan"); }} />}
          </div>
        ); })()}
      </Modal>

      <Modal open={!!form} onClose={() => setForm(null)} title="Catat ketidakhadiran" footer={<><Button variant="ghost" onClick={() => setForm(null)}>Batal</Button><Button onClick={saveAbsen}>Simpan</Button></>}>
        {form && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Petugas *" error={errs.petugasId} className="sm:col-span-2"><Select value={form.petugasId} onChange={(e) => setForm({ ...form, petugasId: e.target.value })} options={staffOpts} placeholder="Pilih petugas" /></Field>
            <Field label="Tanggal *" error={errs.tanggal}><Input type="date" max={ymd(new Date())} value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} /></Field>
            <Field label="Jenis *" error={errs.jenis}><Select value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })} options={JENIS} placeholder="Pilih jenis" /></Field>
            <Field label="Keterangan *" error={errs.keterangan} className="sm:col-span-2"><Textarea rows={2} value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} /></Field>
            {form.jenis === "Sakit dengan surat" && <Field label="Surat dokter *" error={errs.surat} className="sm:col-span-2"><FileInput value={form.surat} onChange={(v) => setForm({ ...form, surat: v })} modul="KPI Petugas" /></Field>}
            {form.jenis === "Sakit tanpa surat" && <p className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 sm:col-span-2">Dicatat tanpa surat dokter dan akan mengurangi poin kehadiran KPI.</p>}
          </div>
        )}
      </Modal>

      <Modal open={!!rot} onClose={() => setRot(null)} title={rot ? `Rotasi Danru ${rot.group}` : ""} footer={<><Button variant="ghost" onClick={() => setRot(null)}>Batal</Button><Button variant="mint" onClick={doRotasi}>Konfirmasi rotasi</Button></>}>
        {rot && rotInfo && (
          <div className="space-y-4 text-sm">
            <p className="text-slate-600">Danru saat ini <b className="text-navy">{rotInfo.danru ? rotInfo.danru.nama : "-"}</b> menjabat {rotInfo.bulan} bulan. Masa jabatannya akan masuk riwayat.</p>
            <Field label="Danru pengganti *"><Select value={rot.newId} onChange={(e) => setRot({ ...rot, newId: e.target.value })} options={rotInfo.kandidat.map((k) => ({ value: k.p.id, label: `${k.p.nama} - ${k.pernah ? "pernah jadi Danru" : "belum pernah jadi Danru"}, KPI ${k.avg}` }))} placeholder="Pilih pengganti" /></Field>
          </div>
        )}
      </Modal>
    </div>
  );
}

function NilaiDanru({ p, onSave }) {
  const [v, setV] = useState(p.nilaiDanru || 0);
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-slate-50 p-4">
      <Field label="Penilaian Danru (0-100)" className="w-48"><Input type="number" min="0" max="100" value={v} onChange={(e) => setV(Math.max(0, Math.min(100, Number(e.target.value))))} /></Field>
      <Button variant="mint" onClick={() => onSave(Number(v))}>Simpan nilai</Button>
    </div>
  );
}
