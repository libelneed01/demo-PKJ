"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { SEC_GROUPS, CLEAN_GROUPS } from "@/lib/data";
import { KONDISI, KONDISI_TONE, SHIFT_TONE, CATATAN, diffReturn, catatanLengkap, adaKurang, shiftStats } from "@/lib/shift";
import { fmtDT, fmtTime } from "@/lib/format";
import { Card, Button, Modal, Field, Input, Select, Textarea, Badge, PageHeader, Stat, Tabs, DataTable, Icon, Empty } from "../ui";

const CFG = {
  security: { title: "Asset & Serah Terima Security", col: "shiftSecurity", assets: "assetSecurity", groups: SEC_GROUPS, who: "group" },
  kebersihan: { title: "Asset & Serah Terima Kebersihan", col: "shiftKebersihan", assets: "assetKebersihan", groups: CLEAN_GROUPS, who: "petugas" },
};
const KOND_SEL = KONDISI.map((k) => ({ value: k, label: k }));

function ShiftBadge({ s }) {
  const bad = s.masalah.length > 0 && (s.status === "Menunggu Approval" || s.status === "Ditolak");
  return <Badge tone={bad ? "red" : SHIFT_TONE[s.status]}>{bad ? `${s.status}: ada masalah` : s.status}</Badge>;
}

function ShiftDetail({ s, kind }) {
  const diffMap = {};
  (s.returns || []).forEach((r) => { diffMap[r.id] = r; });
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2"><ShiftBadge s={s} /><span className="text-xs text-slate-500">{s.group} - {s.petugas}</span></div>
      <dl className="grid gap-3 sm:grid-cols-3 text-sm">
        <div><dt className="text-xs text-slate-500">Mulai</dt><dd className="font-medium text-navy">{fmtDT(s.mulai)}</dd></div>
        <div><dt className="text-xs text-slate-500">Selesai</dt><dd className="font-medium text-navy">{s.selesai ? fmtDT(s.selesai) : "Masih bertugas"}</dd></div>
        <div><dt className="text-xs text-slate-500">Approval</dt><dd className="font-medium text-navy">{s.approval ? `${s.approval.nama} (${s.approval.group}), ${fmtTime(s.approval.at)}` : s.tolak ? `Ditolak oleh ${s.tolak.nama}` : "Belum"}</dd></div>
      </dl>
      <div>
        <p className="mb-2 text-sm font-bold text-navy">Asset</p>
        <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-100">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead><tr className="bg-slate-50 text-xs text-slate-500"><th className="px-4 py-2.5">Asset</th><th className="px-4 py-2.5">Dibawa</th><th className="px-4 py-2.5">Dikembalikan</th></tr></thead>
            <tbody>
              {s.items.map((i) => {
                const r = diffMap[i.id];
                return (
                  <tr key={i.id} className="border-t border-slate-50">
                    <td className="px-4 py-2.5 font-medium text-navy">{i.nama}{!i.wajib && <span className="ml-2 text-xs font-normal text-slate-400">opsional</span>}</td>
                    <td className="px-4 py-2.5"><Badge tone={KONDISI_TONE[i.kondisi]}>{i.kondisi}</Badge></td>
                    <td className="px-4 py-2.5">{!s.returns ? <span className="text-xs text-slate-400">Belum</span> : !r.kembali ? <Badge tone="red">Tidak kembali</Badge> : <Badge tone={KONDISI_TONE[r.kondisi]}>{r.kondisi}</Badge>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {s.masalah.length > 0 && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700"><b>Masalah:</b> {s.masalah.join("; ")}.{s.kurangKet && <><br /><b>Keterangan:</b> {s.kurangKet}</>}</div>}
      </div>
      {s.catatan && (
        <div>
          <p className="mb-2 text-sm font-bold text-navy">Catatan serah terima shift</p>
          <dl className="space-y-3 rounded-2xl bg-slate-50 p-4">{CATATAN[kind].map((f) => <div key={f.k}><dt className="text-xs text-slate-500">{f.l}</dt><dd className="mt-0.5 text-sm text-navy">{s.catatan[f.k] || "-"}</dd></div>)}</dl>
        </div>
      )}
      {s.tolak && <div className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700"><b>Ditolak:</b> {s.tolak.alasan}</div>}
      {s.approval && s.approval.ket && <p className="text-sm text-slate-600"><b>Keterangan penerima:</b> {s.approval.ket}</p>}
    </div>
  );
}

function AssetPage({ kind, params }) {
  const C = CFG[kind];
  const { data, add, update, toast } = useApp();
  const list = data[C.col] || [];
  const assets = data[C.assets] || [];
  const st = shiftStats(data)[kind];
  const bertugas = list.filter((s) => s.status === "Bertugas");
  const menunggu = list.filter((s) => s.status === "Menunggu Approval" || s.status === "Ditolak");
  const [tab, setTab] = useState(params.tab || (menunggu.length ? "approval" : bertugas.length ? "bertugas" : "mulai"));
  const [detail, setDetail] = useState(null);
  const [ending, setEnding] = useState(null);
  const [appr, setAppr] = useState(null);
  const groupNames = Object.keys(C.groups);
  const cur = detail ? list.find((s) => s.id === detail) : null;

  // ---------- mulai shift ----------
  const [group, setGroup] = useState(groupNames.find((g) => !bertugas.some((s) => s.group === g)) || groupNames[0]);
  const [petugas, setPetugas] = useState("");
  const [chk, setChk] = useState({});
  const busy = bertugas.some((s) => s.group === group);
  const missing = [!petugas && "petugas", ...assets.filter((a) => a.wajib && !(chk[a.id] && chk[a.id].ambil)).map((a) => a.nama)].filter(Boolean);
  const canStart = missing.length === 0 && !busy;
  const toggle = (id, v) => setChk((c) => ({ ...c, [id]: { kondisi: "Baik", ...c[id], ambil: v } }));
  const setKond = (id, v) => setChk((c) => ({ ...c, [id]: { ...c[id], kondisi: v } }));
  const start = () => {
    if (!canStart) return toast("Asset wajib belum lengkap, shift belum bisa dimulai", "yellow");
    const items = assets.filter((a) => chk[a.id] && chk[a.id].ambil).map((a) => ({ id: a.id, nama: a.nama, wajib: a.wajib, kondisi: chk[a.id].kondisi || "Baik" }));
    add(C.col, { kind, group, petugas, mulai: new Date().toISOString(), items, status: "Bertugas", selesai: null, returns: null, kurangKet: "", catatan: null, masalah: [], approval: null, tolak: null });
    const rusak = items.filter((i) => i.kondisi !== "Baik").length;
    toast(rusak ? `Shift dimulai. ${rusak} asset dibawa dalam kondisi rusak.` : "Shift dimulai. Asset tercatat dibawa.", rusak ? "yellow" : "green");
    setChk({}); setPetugas(""); setTab("bertugas");
  };

  return (
    <div>
      <PageHeader title={C.title} desc="Ambil asset saat mulai shift, kembalikan saat selesai, isi catatan serah terima, lalu group berikutnya melakukan approval." />
      {(st.bermasalah > 0 || st.menunggu > 0) && (
        <div className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${st.bermasalah ? "border-rose-200 bg-rose-50 text-rose-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
          <Icon n="alert" className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm">{st.bermasalah ? `${st.bermasalah} serah terima punya asset kurang atau rusak dan belum di-approve.` : `${st.menunggu} serah terima menunggu approval group berikutnya.`}</p>
        </div>
      )}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Sedang bertugas" value={st.bertugas} sub="Asset masih dibawa" icon="clock" tone={st.bertugas ? "yellow" : "green"} onClick={() => setTab("bertugas")} />
        <Stat label="Menunggu approval" value={st.menunggu} icon="box" tone={st.menunggu ? "yellow" : "green"} onClick={() => setTab("approval")} />
        <Stat label="Bermasalah" value={st.bermasalah} sub="Kurang atau rusak" icon="alert" tone={st.bermasalah ? "red" : "green"} onClick={() => setTab("approval")} />
        <Stat label="Selesai bersih" value={st.bersih7} sub="7 hari terakhir" icon="check" tone="green" onClick={() => setTab("riwayat")} />
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "mulai", label: "Mulai shift" }, { id: "bertugas", label: "Sedang bertugas", count: bertugas.length }, { id: "approval", label: "Menunggu approval", count: menunggu.length }, { id: "riwayat", label: "Riwayat serah terima", count: list.length }]} />

      {tab === "mulai" && (
        <Card>
          <h2 className="mb-1 text-base font-bold text-navy">Mulai shift: ambil asset</h2>
          <p className="mb-5 text-xs text-slate-500">Centang asset yang diambil dan isi kondisinya. Asset wajib harus lengkap sebelum bertugas.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Group *"><Select value={group} onChange={(e) => { setGroup(e.target.value); setPetugas(""); }} options={groupNames.map((g) => ({ value: g, label: `${g} (${C.groups[g].start} - ${C.groups[g].end})${bertugas.some((s) => s.group === g) ? " - sedang bertugas" : ""}` }))} /></Field>
            <Field label={C.who === "group" ? "Petugas penanggung jawab *" : "Petugas penanggung jawab *"}><Select value={petugas} onChange={(e) => setPetugas(e.target.value)} options={C.groups[group].anggota} placeholder="Pilih petugas" /></Field>
          </div>
          {busy && <p className="mt-3 text-sm font-medium text-rose-600">{group} masih tercatat bertugas. Akhiri shift sebelumnya dulu.</p>}
          <div className="mt-5 space-y-2">
            {assets.map((a) => {
              const c = chk[a.id] || {};
              return (
                <div key={a.id} className={`flex flex-wrap items-center gap-3 rounded-2xl p-3.5 ring-1 ring-inset ${c.ambil ? "bg-mint-50 ring-mint-200" : "bg-white ring-slate-200"}`}>
                  <label className="flex min-w-[170px] flex-1 cursor-pointer items-center gap-3">
                    <input type="checkbox" checked={!!c.ambil} onChange={(e) => toggle(a.id, e.target.checked)} className="h-5 w-5 accent-emerald-600" />
                    <span className="text-sm font-semibold text-navy">{a.nama}</span>
                    <Badge tone={a.wajib ? "navy" : "gray"}>{a.wajib ? "Wajib" : "Opsional"}</Badge>
                  </label>
                  <div className="w-full sm:w-44"><Select disabled={!c.ambil} value={c.kondisi || "Baik"} onChange={(e) => setKond(a.id, e.target.value)} options={KOND_SEL} /></div>
                </div>
              );
            })}
          </div>
          {missing.length > 0 && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Belum bisa mulai tugas. Lengkapi: {missing.join(", ")}.</p>}
          <Button variant="mint" className="mt-5 w-full sm:w-auto" disabled={!canStart} onClick={start}>Simpan asset dibawa & mulai tugas</Button>
        </Card>
      )}

      {tab === "bertugas" && (
        bertugas.length === 0 ? <Empty text="Tidak ada shift yang sedang berjalan. Mulai shift dari tab Mulai shift." /> : (
          <div className="grid gap-4 md:grid-cols-2">
            {bertugas.map((s) => (
              <Card key={s.id}>
                <div className="flex items-start justify-between gap-2"><div><p className="text-base font-bold text-navy">{s.group}</p><p className="text-xs text-slate-500">{s.petugas} - mulai {fmtDT(s.mulai)}</p></div><ShiftBadge s={s} /></div>
                <div className="mt-4 flex flex-wrap gap-2">{s.items.map((i) => <Badge key={i.id} tone={KONDISI_TONE[i.kondisi]}>{i.nama}</Badge>)}</div>
                <div className="mt-5 flex flex-wrap gap-2"><Button onClick={() => setEnding(s.id)}>Akhiri shift & serah terima</Button><Button variant="ghost" onClick={() => setDetail(s.id)}>Detail</Button></div>
              </Card>
            ))}
          </div>
        )
      )}

      {tab === "approval" && (
        menunggu.length === 0 ? <Empty text="Tidak ada serah terima yang menunggu approval." /> : (
          <div className="space-y-4">
            {menunggu.map((s) => (
              <Card key={s.id} className={s.masalah.length ? "ring-2 ring-rose-200" : ""}>
                <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-base font-bold text-navy">{s.group} menyerahkan shift</p><p className="text-xs text-slate-500">{s.petugas} - selesai {fmtDT(s.selesai)}</p></div><ShiftBadge s={s} /></div>
                {s.masalah.length > 0 && <p className="mt-3 text-sm text-rose-700"><b>Masalah:</b> {s.masalah.join("; ")}</p>}
                <div className="mt-4 flex flex-wrap gap-2"><Button variant="mint" onClick={() => setAppr(s.id)}>Tinjau & approve</Button><Button variant="ghost" onClick={() => setDetail(s.id)}>Lihat detail</Button></div>
              </Card>
            ))}
          </div>
        )
      )}

      {tab === "riwayat" && (
        <Card>
          <DataTable onRow={(s) => setDetail(s.id)} empty="Belum ada riwayat." rows={[...list].sort((a, b) => b.mulai.localeCompare(a.mulai)).slice(0, 25)} columns={[
            { label: "Shift", render: (s) => <div><p className="font-semibold text-navy">{s.group}</p><p className="text-xs text-slate-500">{s.petugas}</p></div> },
            { label: "Mulai", render: (s) => fmtDT(s.mulai) }, { label: "Masalah", render: (s) => (s.masalah.length ? <span className="text-xs text-rose-600">{s.masalah.length} item</span> : <span className="text-xs text-slate-400">-</span>) },
            { label: "Status", render: (s) => <ShiftBadge s={s} /> },
          ]} />
        </Card>
      )}

      <Modal open={!!cur} onClose={() => setDetail(null)} wide title={cur ? `Serah terima ${cur.group}` : ""}>{cur && <ShiftDetail s={cur} kind={kind} />}</Modal>
      {ending && <EndShift kind={kind} s={list.find((x) => x.id === ending)} onClose={() => setEnding(null)} onDone={() => { setEnding(null); setTab("approval"); }} />}
      {appr && <Approve kind={kind} s={list.find((x) => x.id === appr)} groups={C.groups} onClose={() => setAppr(null)} />}
    </div>
  );
}

function EndShift({ kind, s, onClose, onDone }) {
  const { data, update, toast } = useApp();
  const C = CFG[kind];
  const tamuLuar = data.tamu.filter((t) => !t.keluar);
  const initCat = {}; CATATAN[kind].forEach((f) => { initCat[f.k] = f.k === "tamu" ? (tamuLuar.length ? `${tamuLuar.length} tamu belum keluar: ${tamuLuar.map((t) => `${t.nama} (${t.plat})`).join(", ")}` : "Semua tamu sudah keluar.") : ""; });
  const [ret, setRet] = useState(() => Object.fromEntries(s.items.map((i) => [i.id, { kembali: true, kondisi: i.kondisi }])));
  const [cat, setCat] = useState(initCat);
  const [ket, setKet] = useState("");
  const [tried, setTried] = useState(false);
  const diff = diffReturn(s.items, ret);
  const kurang = diff.some((d) => d.jenis === "kurang");
  const errCat = CATATAN[kind].filter((f) => String(cat[f.k] || "").trim().length < 2);
  const errKet = (kurang || diff.length > 0) && ket.trim().length < 10;
  const submit = () => {
    setTried(true);
    if (errCat.length) return toast("Catatan serah terima shift wajib diisi lengkap", "yellow");
    if (errKet) return toast("Isi keterangan jelas untuk asset yang kurang atau rusak", "yellow");
    const returns = s.items.map((i) => ({ id: i.id, nama: i.nama, kembali: ret[i.id].kembali, kondisi: ret[i.id].kembali ? ret[i.id].kondisi : i.kondisi }));
    update(C.col, s.id, { status: "Menunggu Approval", selesai: new Date().toISOString(), returns, catatan: cat, masalah: diff.map((d) => d.teks), kurangKet: ket.trim() });
    toast(diff.length ? "Serah terima dikirim dengan masalah asset. Menunggu approval." : "Serah terima dikirim. Menunggu approval group berikutnya.", diff.length ? "yellow" : "green");
    onDone();
  };
  return (
    <Modal open onClose={onClose} wide title={`Akhiri shift ${s.group}`} footer={<><Button variant="ghost" onClick={onClose}>Batal</Button><Button onClick={submit}>Kirim serah terima</Button></>}>
      <div className="space-y-6">
        <div>
          <p className="mb-1 text-sm font-bold text-navy">1. Pengembalian asset</p>
          <p className="mb-3 text-xs text-slate-500">Sistem membandingkan dengan asset yang dibawa saat mulai shift.</p>
          <div className="space-y-2">
            {s.items.map((i) => {
              const r = ret[i.id];
              return (
                <div key={i.id} className="flex flex-wrap items-center gap-3 rounded-2xl p-3 ring-1 ring-inset ring-slate-200">
                  <label className="flex min-w-[170px] flex-1 cursor-pointer items-center gap-3"><input type="checkbox" checked={r.kembali} onChange={(e) => setRet({ ...ret, [i.id]: { ...r, kembali: e.target.checked } })} className="h-5 w-5 accent-emerald-600" /><span className="text-sm font-semibold text-navy">{i.nama}</span><span className="text-xs text-slate-500">dibawa: {i.kondisi}</span></label>
                  <div className="w-full sm:w-44">{r.kembali ? <Select value={r.kondisi} onChange={(e) => setRet({ ...ret, [i.id]: { ...r, kondisi: e.target.value } })} options={KOND_SEL} /> : <Badge tone="red">Tidak dikembalikan</Badge>}</div>
                </div>
              );
            })}
          </div>
          {diff.length > 0 ? (
            <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700"><b>Status merah.</b> {diff.map((d) => d.teks).join("; ")}.</div>
          ) : <div className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">Semua asset kembali lengkap dan kondisi tidak memburuk.</div>}
          {diff.length > 0 && <Field label="Keterangan kekurangan / kerusakan *" className="mt-3" error={tried && errKet ? "Jelaskan penyebabnya (minimal 10 karakter)" : ""}><Textarea value={ket} onChange={(e) => setKet(e.target.value)} placeholder="Contoh: HT dipinjam pos RW 31, akan dikembalikan besok pagi" /></Field>}
        </div>
        <div>
          <p className="mb-1 text-sm font-bold text-navy">2. Catatan serah terima shift (wajib)</p>
          <div className="space-y-3">
            {CATATAN[kind].map((f) => (
              <Field key={f.k} label={f.l + " *"} error={tried && String(cat[f.k] || "").trim().length < 2 ? "Wajib diisi. Tulis 'Tidak ada' bila memang kosong." : ""}>
                <Textarea rows={2} value={cat[f.k]} onChange={(e) => setCat({ ...cat, [f.k]: e.target.value })} />
                <button type="button" onClick={() => setCat({ ...cat, [f.k]: "Tidak ada." })} className="mt-1 text-xs font-semibold text-mint-700">Isi: Tidak ada</button>
              </Field>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Approve({ kind, s, groups, onClose }) {
  const { update, toast } = useApp();
  const [grp, setGrp] = useState("");
  const [nama, setNama] = useState("");
  const [ket, setKet] = useState("");
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [rej, setRej] = useState("");
  const kurang = adaKurang(s);
  const catOk = catatanLengkap(kind, s.catatan);
  const assetOk = s.masalah.length === 0 || s.kurangKet.trim().length >= 10;
  const beda = !!grp && grp !== s.group;
  const ok = catOk && assetOk && beda && !!nama && c1 && c2;
  const approve = () => {
    if (!ok) return toast("Syarat approval belum terpenuhi", "yellow");
    const status = s.masalah.length ? "Disetujui dengan catatan" : "Disetujui";
    update(CFG[kind].col, s.id, { status, approval: { group: grp, nama, at: new Date().toISOString(), ket: ket.trim() }, tolak: null });
    toast(status === "Disetujui" ? "Serah terima disetujui. Shift selesai bersih." : "Serah terima disetujui dengan catatan masalah.", status === "Disetujui" ? "green" : "yellow");
    onClose();
  };
  const reject = () => {
    if (rej.trim().length < 5) return toast("Isi alasan penolakan", "yellow");
    update(CFG[kind].col, s.id, { status: "Ditolak", tolak: { group: grp || "-", nama: nama || "-", alasan: rej.trim(), at: new Date().toISOString() } });
    toast("Serah terima ditolak, group lama perlu klarifikasi", "red"); onClose();
  };
  const Req = ({ ok, children }) => <li className={`flex items-center gap-2 text-sm ${ok ? "text-emerald-700" : "text-rose-600"}`}><Icon n={ok ? "check" : "x"} className="h-4 w-4 shrink-0" />{children}</li>;
  return (
    <Modal open onClose={onClose} wide title={`Approval serah terima ${s.group}`} footer={<><Button variant="ghost" onClick={onClose}>Tutup</Button><Button variant="danger" onClick={reject}>Tolak</Button><Button variant="mint" disabled={!ok} onClick={approve}>Approve serah terima</Button></>}>
      <div className="space-y-6">
        <ShiftDetail s={s} kind={kind} />
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="mb-3 text-sm font-bold text-navy">Syarat approval</p>
          <ul className="space-y-1.5">
            <Req ok={catOk}>Catatan serah terima sudah diisi lengkap</Req>
            <Req ok={assetOk}>{kurang || s.masalah.length ? "Asset kurang atau rusak disertai keterangan jelas" : "Asset lengkap"}</Req>
            <Req ok={beda}>Penerima berasal dari group yang berbeda dengan group lama</Req>
          </ul>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Group penerima (group baru) *"><Select value={grp} onChange={(e) => { setGrp(e.target.value); setNama(""); }} options={Object.keys(groups)} placeholder="Pilih group" /></Field>
          <Field label="Nama penerima *"><Select value={nama} disabled={!grp} onChange={(e) => setNama(e.target.value)} options={grp ? groups[grp].anggota : []} placeholder="Pilih nama" /></Field>
          <Field label="Keterangan penerima (opsional)" className="sm:col-span-2"><Input value={ket} onChange={(e) => setKet(e.target.value)} /></Field>
          <label className="flex cursor-pointer items-start gap-3 sm:col-span-2"><input type="checkbox" checked={c1} onChange={(e) => setC1(e.target.checked)} className="mt-0.5 h-5 w-5 accent-emerald-600" /><span className="text-sm text-navy">Saya sudah membaca catatan serah terima shift.</span></label>
          <label className="flex cursor-pointer items-start gap-3 sm:col-span-2"><input type="checkbox" checked={c2} onChange={(e) => setC2(e.target.checked)} className="mt-0.5 h-5 w-5 accent-emerald-600" /><span className="text-sm text-navy">Saya sudah mengecek asset sesuai daftar di atas.</span></label>
          <Field label="Alasan penolakan (hanya bila menolak)" className="sm:col-span-2"><Input value={rej} onChange={(e) => setRej(e.target.value)} /></Field>
        </div>
      </div>
    </Modal>
  );
}

export const AssetSecurity = ({ params }) => <AssetPage kind="security" params={params} />;
export const AssetKebersihan = ({ params }) => <AssetPage kind="kebersihan" params={params} />;
