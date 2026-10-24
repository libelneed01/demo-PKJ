"use client";
import { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { IPL_NOMINAL, RT_LIST, rtKeyOf, rtLabel, groupName } from "@/lib/config";
import { rtStats, textPengumuman, textRekap, applyPayment, periode, waLink, waShare, nomorWA } from "@/lib/wa";
import { rp, fmtDT, fmtTime } from "@/lib/format";
import { Card, Button, Field, Input, Select, Textarea, Badge, PageHeader, Tabs, Icon, Modal, Empty } from "../ui";

// QR contoh (bukan QRIS asli) digambar deterministik dari teks
function FakeQR({ seed = "PKJ", size = 168 }) {
  const N = 25;
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const rnd = () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; };
  const cells = [];
  const finder = (x, y) => (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!finder(x, y) && rnd() > 0.52) cells.push(<rect key={x + "-" + y} x={x} y={y} width="1" height="1" />);
  const F = ({ x, y }) => (<g transform={`translate(${x},${y})`}><rect width="7" height="7" /><rect x="1" y="1" width="5" height="5" fill="#fff" /><rect x="2" y="2" width="3" height="3" /></g>);
  return (
    <svg viewBox={`-1 -1 ${N + 2} ${N + 2}`} width={size} height={size} fill="#12294A" className="rounded-xl bg-white p-1 ring-1 ring-slate-200" role="img" aria-label="QR pembayaran contoh">
      {cells}<F x={0} y={0} /><F x={N - 7} y={0} /><F x={0} y={N - 7} />
    </svg>
  );
}
function QR({ rtKey, size }) {
  const { data } = useApp();
  const img = data.waConfig.qr && data.waConfig.qr[rtKey];
  return img ? <img src={img} alt="QR pembayaran" style={{ width: size, height: size }} className="rounded-xl object-contain ring-1 ring-slate-200" /> : <FakeQR seed={"PKJ-" + rtKey} size={size} />; // eslint-disable-line @next/next/no-img-element
}

const typeLabel = { pengumuman: ["navy", "Pengumuman"], notif_group: ["green", "Notifikasi grup"], notif_pribadi: ["green", "Notifikasi pribadi"], rekap: ["yellow", "Rekapitulasi"] };

// ---------- Simulasi pembayaran scan QR ----------
export function QrPay({ fixedId, onPaid }) {
  const { data, mutate, toast, role, go } = useApp();
  const cfg = data.waConfig;
  const [houseId, setHouseId] = useState(fixedId || "");
  const [n, setN] = useState(cfg.opsiBulan[0] || 1);
  const [hp, setHp] = useState(cfg.nomorTester || "");
  const [proc, setProc] = useState("");
  const [done, setDone] = useState(null);
  const h = data.rumah.find((x) => x.id === houseId.trim().toUpperCase());
  const key = h ? rtKeyOf(h) : "29-01";
  const per = h ? periode(h, Number(n)) : null;

  const pay = () => {
    if (!h) return toast("Pilih rumah yang valid terlebih dahulu", "yellow");
    if (!nomorWA(hp)) return toast("Isi nomor WhatsApp pembayar untuk notifikasi pribadi", "yellow");
    setProc("proses");
    setTimeout(() => {
      mutate((x) => applyPayment(x, { houseId: h.id, n: Number(n), metode: "QRIS", sumber: "Scan QR", hp }));
      setDone({ h, n: Number(n), per, hp: nomorWA(hp), key });
      setProc("");
      toast("Pembayaran berhasil. Notifikasi WhatsApp dikirim (simulasi).");
      onPaid && onPaid();
    }, 1500);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="text-base font-bold text-navy">Bayar IPL dengan scan QR</h3>
        <p className="mb-4 text-xs text-slate-500">Simulasi. Tidak ada uang sungguhan yang diproses.</p>
        <div className="space-y-4">
          {!fixedId && (<>
            <Field label="Blok & nomor rumah *" hint="Contoh: A-12 atau G-45"><Input list="rumah-list-wa" value={houseId} onChange={(e) => { setHouseId(e.target.value); setDone(null); }} placeholder="Ketik blok-nomor" /></Field>
            <datalist id="rumah-list-wa">{data.rumah.map((x) => <option key={x.id} value={x.id} />)}</datalist>
          </>)}
          {houseId && !h && <p className="text-xs text-rose-600">Rumah tidak ditemukan.</p>}
          {h && (
            <div className="rounded-xl bg-slate-50 p-4 text-sm">
              <p className="font-semibold text-navy">{h.id} - {h.status === "ngontrak" ? h.penyewa : h.owner}</p>
              <p className="mt-0.5 text-xs text-slate-500">{rtLabel(key)}</p>
              <p className="mt-2">{h.iplStatus === "lunas" ? <Badge tone="green">IPL bulan ini lunas</Badge> : <Badge tone={h.tunggakan <= 1 ? "yellow" : "red"}>Tertunggak {h.tunggakan} bulan ({rp(h.tunggakan * IPL_NOMINAL)})</Badge>}</p>
            </div>
          )}
          <Field label="Jumlah bulan yang dibayar"><Select value={n} onChange={(e) => { setN(e.target.value); setDone(null); }} options={cfg.opsiBulan.map((b) => ({ value: b, label: `${b} bulan - ${rp(b * IPL_NOMINAL)}` }))} /></Field>
          {per && <p className="rounded-xl bg-mint-50 p-3 text-sm text-navy">Periode yang dibayar: <b>{per.short}</b></p>}
          <Field label="Nomor WhatsApp pembayar *" hint="Notifikasi pribadi dikirim ke nomor ini."><Input value={hp} onChange={(e) => setHp(e.target.value)} placeholder="08xxxxxxxxxx" /></Field>
        </div>
      </Card>
      <Card className="text-center">
        <p className="text-sm font-semibold text-navy">Scan QR untuk membayar {rp(Number(n) * IPL_NOMINAL)}</p>
        <div className="my-4 flex justify-center"><QR rtKey={key} size={190} /></div>
        <p className="text-xs text-slate-500">QR contoh untuk {groupName(key)}. Ganti dengan QR asli di tab Pengaturan.</p>
        <Button variant="mint" className="mt-5 w-full" onClick={pay} disabled={!h || proc === "proses"}>{proc === "proses" ? "Memverifikasi pembayaran…" : "Saya sudah scan & bayar (simulasi)"}</Button>
      </Card>
      <Modal open={!!done} onClose={() => setDone(null)} title="Pembayaran tercatat" footer={<><Button variant="ghost" onClick={() => setDone(null)}>Tutup</Button>{role !== "warga" && role !== "keamanan" && role !== "kebersihan" && done && <Button onClick={() => { const k = done.key; setDone(null); go("waIpl", { thread: "g:" + k }); }}>Lihat di WhatsApp</Button>}</>}>
        {done && (
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2 font-semibold text-emerald-700"><Icon n="check" className="h-5 w-5" />{rp(done.n * IPL_NOMINAL)} untuk {done.per.short}</p>
            <p className="text-slate-600">Pesan otomatis yang dibuat:</p>
            <ul className="list-disc space-y-1 pl-5 text-slate-600"><li>Notifikasi ke grup <b>{groupName(done.key)}</b></li><li>Notifikasi pribadi ke <b>+{done.hp}</b></li><li>Rekapitulasi total pembayaran bulan ini di grup</li></ul>
            <a href={waLink(done.hp, `Terima kasih, IPL Anda sudah terbayar sebesar ${rp(done.n * IPL_NOMINAL)} untuk ${done.per.short}.`)} target="_blank" rel="noreferrer" className="inline-block text-sm font-semibold text-mint-700 hover:underline">Kirim notifikasi pribadi lewat WhatsApp sungguhan</a>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ---------- Tampilan chat WhatsApp (simulasi) ----------
function Bubble({ m, cfg }) {
  const [t] = typeLabel[m.type] ? [typeLabel[m.type]] : [["gray", m.type]];
  const [copied, setCopied] = useState(false);
  const isDM = m.thread.startsWith("d:");
  const link = isDM ? waLink(m.thread.slice(2), m.text) : waShare(m.text);
  return (
    <div className="flex justify-end">
      <div className="max-w-[88%] rounded-2xl rounded-tr-sm bg-[#D9FDD3] px-3.5 py-2.5 shadow-sm">
        <div className="mb-1 flex items-center justify-between gap-3"><span className="text-[11px] font-bold text-emerald-800">Bot IPL PKJ</span><Badge tone={t[0]}>{t[1]}</Badge></div>
        <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-slate-800">{m.text.replace(/\*(.+?)\*/g, "$1")}</p>
        {m.type === "pengumuman" && <div className="mt-2"><QR rtKey={m.thread.slice(2)} size={120} /></div>}
        <div className="mt-1.5 flex items-center justify-between gap-3 text-[11px] text-slate-500">
          <span className="flex gap-3">
            <button onClick={() => { navigator.clipboard && navigator.clipboard.writeText(m.text); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="font-semibold text-emerald-800 hover:underline">{copied ? "Tersalin" : "Salin"}</button>
            <a href={link} target="_blank" rel="noreferrer" className="font-semibold text-emerald-800 hover:underline">Kirim lewat WhatsApp</a>
          </span>
          <span>{fmtTime(m.at)}</span>
        </div>
      </div>
    </div>
  );
}

function Chat({ initial, allowedKeys }) {
  const { data, mutate, toast, role } = useApp();
  const cfg = data.waConfig;
  const [thread, setThread] = useState(initial);
  const [mobileOpen, setMobileOpen] = useState(!!initial && false);
  const canSend = role === "rw" || role === "rt" || role === "bendahara";
  const groups = RT_LIST.filter((r) => !allowedKeys || allowedKeys.includes(r.key));
  const dms = useMemo(() => {
    const seen = {};
    (data.waPesan || []).filter((m) => m.thread.startsWith("d:")).forEach((m) => { seen[m.thread] = m; });
    return Object.values(seen).sort((a, b) => b.at.localeCompare(a.at));
  }, [data.waPesan]);
  const last = (th) => { const l = (data.waPesan || []).filter((m) => m.thread === th); return l.sort((a, b) => a.at.localeCompare(b.at))[l.length - 1]; };
  const msgs = (data.waPesan || []).filter((m) => m.thread === thread).sort((a, b) => a.at.localeCompare(b.at));
  const isGroup = thread.startsWith("g:");
  const key = isGroup ? thread.slice(2) : "";
  const title = isGroup ? groupName(key) : (dms.find((d) => d.thread === thread) || {}).title || "Pribadi";
  const push = (type) => {
    const now = new Date();
    const text = type === "rekap" ? textRekap(data, key, now) : textPengumuman(cfg, key, now);
    mutate((x) => ({ ...x, waPesan: [...x.waPesan, { id: "wa-" + now.getTime(), thread, type, text, at: now.toISOString(), _t: true }] }));
    toast(type === "rekap" ? "Rekap dikirim ke grup (simulasi)" : "Pengumuman dikirim ke grup (simulasi)");
  };

  return (
    <div className="grid overflow-hidden rounded-3xl bg-white shadow-card lg:grid-cols-[300px_1fr]" style={{ minHeight: 520 }}>
      <div className={`${mobileOpen ? "hidden lg:block" : ""} border-slate-100 lg:border-r`}>
        <p className="px-4 pb-2 pt-4 text-xs font-bold uppercase tracking-wide text-slate-400">Grup per RT</p>
        {groups.map((r) => { const l = last("g:" + r.key); return (
          <button key={r.key} onClick={() => { setThread("g:" + r.key); setMobileOpen(true); }} className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 ${thread === "g:" + r.key ? "bg-mint-50" : ""}`}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs font-bold text-white">{r.rt}</span>
            <span className="min-w-0"><span className="block truncate text-sm font-semibold text-navy">{groupName(r.key)}</span><span className="block truncate text-xs text-slate-500">{l ? l.text.replace(/\*/g, "").slice(0, 44) : "Belum ada pesan"}</span></span>
          </button>); })}
        <p className="px-4 pb-2 pt-4 text-xs font-bold uppercase tracking-wide text-slate-400">Pesan pribadi</p>
        {dms.length === 0 && <p className="px-4 pb-4 text-xs text-slate-400">Belum ada. Muncul setelah ada pembayaran.</p>}
        {dms.map((d) => (
          <button key={d.thread} onClick={() => { setThread(d.thread); setMobileOpen(true); }} className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 ${thread === d.thread ? "bg-mint-50" : ""}`}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-300 text-white"><Icon n="users" className="h-4 w-4" /></span>
            <span className="min-w-0"><span className="block truncate text-sm font-semibold text-navy">{d.title}</span><span className="block truncate text-xs text-slate-500">{(last(d.thread) || d).text.slice(0, 40)}</span></span>
          </button>
        ))}
      </div>
      <div className={`${mobileOpen ? "" : "hidden lg:flex"} flex flex-col bg-[#EFEAE2]`}>
        <div className="flex items-center justify-between gap-2 bg-white px-4 py-3 shadow-sm">
          <div className="flex min-w-0 items-center gap-2">
            <button className="rounded-lg p-1 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Kembali"><Icon n="chevron" className="h-5 w-5 rotate-180" /></button>
            <div className="min-w-0"><p className="truncate text-sm font-bold text-navy">{title}</p><p className="text-xs text-slate-500">{isGroup ? "Grup WhatsApp (simulasi)" : "Pesan pribadi dari Bot IPL PKJ"}</p></div>
          </div>
          {isGroup && canSend && <div className="flex gap-2"><Button variant="ghost" onClick={() => push("pengumuman")}>Kirim pengumuman</Button><Button variant="soft" onClick={() => push("rekap")}>Kirim rekap</Button></div>}
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: 520 }}>
          {msgs.length === 0 ? <Empty text="Belum ada pesan pada percakapan ini." /> : msgs.map((m) => <Bubble key={m.id} m={m} cfg={cfg} />)}
        </div>
        <p className="bg-white px-4 py-2.5 text-center text-xs text-slate-400">Pesan dikirim otomatis oleh bot. Simulasi, belum terhubung ke WhatsApp sungguhan.</p>
      </div>
    </div>
  );
}

// ---------- Pengaturan ----------
function Setup() {
  const { data, mutate, toast, role } = useApp();
  const cfg = data.waConfig;
  const [f, setF] = useState({ ...cfg });
  const [rtSel, setRtSel] = useState(RT_LIST[0].key);
  const canEdit = role === "rw" || role === "bendahara" || role === "rt";
  const save = () => { mutate((x) => ({ ...x, waConfig: { ...x.waConfig, ...f } })); toast("Pengaturan WhatsApp disimpan"); };
  const toggleBulan = (b) => setF((v) => ({ ...v, opsiBulan: v.opsiBulan.includes(b) ? v.opsiBulan.filter((x) => x !== b) : [...v.opsiBulan, b].sort((a, c) => a - c) }));
  const onQr = (e) => {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    if (file.size > 400000) return toast("Ukuran gambar QR maksimal 400 KB", "yellow");
    const rd = new FileReader();
    rd.onload = () => { mutate((x) => ({ ...x, waConfig: { ...x.waConfig, qr: { ...(x.waConfig.qr || {}), [rtSel]: rd.result } } })); setF((v) => ({ ...v, qr: { ...(v.qr || {}), [rtSel]: rd.result } })); toast(`QR ${rtLabel(rtSel)} diganti`); };
    rd.readAsDataURL(file);
  };
  const broadcast = () => {
    const now = new Date();
    mutate((x) => ({ ...x, waConfig: { ...x.waConfig, ...f }, waPesan: [...x.waPesan, ...RT_LIST.map((r, i) => ({ id: "wa-b" + now.getTime() + i, thread: "g:" + r.key, type: "pengumuman", text: textPengumuman({ ...x.waConfig, ...f }, r.key, now), at: new Date(now.getTime() + i).toISOString(), _t: true }))] }));
    toast(`Pengumuman dikirim ke ${RT_LIST.length} grup RT (simulasi)`);
  };
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <h3 className="mb-4 text-base font-bold text-navy">Isi pengumuman di grup</h3>
        <div className="space-y-4">
          <Field label="Narasi pengumuman" hint="Pakai {grup} dan {bulan} sebagai pengganti otomatis."><Textarea rows={4} value={f.narasi} disabled={!canEdit} onChange={(e) => setF({ ...f, narasi: e.target.value })} /></Field>
          <Field label="Tata cara pembayaran (scan QR)"><Textarea rows={6} value={f.tata} disabled={!canEdit} onChange={(e) => setF({ ...f, tata: e.target.value })} /></Field>
          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-navy">Nilai pembayaran dan jumlah bulan</p>
            <p className="mb-2 text-xs text-slate-500">IPL {rp(IPL_NOMINAL)} per bulan. Pilihan jumlah bulan yang ditawarkan:</p>
            <div className="flex flex-wrap gap-2">{[1, 2, 3, 6, 12].map((b) => <button key={b} disabled={!canEdit} onClick={() => toggleBulan(b)} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ring-inset ${f.opsiBulan.includes(b) ? "bg-navy text-white ring-navy" : "bg-white text-slate-600 ring-slate-200"}`}>{b} bulan</button>)}</div>
          </div>
          {canEdit && <div className="flex flex-wrap gap-2"><Button onClick={save}>Simpan pengaturan</Button><Button variant="mint" onClick={broadcast}>Kirim pengumuman ke semua grup RT</Button></div>}
        </div>
      </Card>
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <h3 className="mb-1 text-base font-bold text-navy">Nomor WhatsApp demo</h3>
          <p className="mb-4 text-xs text-slate-500">Dipakai untuk tombol kirim lewat WhatsApp sungguhan.</p>
          <div className="space-y-4">
            <Field label="Nomor 1 - pengirim / pengurus"><Input value={f.nomorAdmin} disabled={!canEdit} onChange={(e) => setF({ ...f, nomorAdmin: e.target.value })} placeholder="08xxxxxxxxxx" /></Field>
            <Field label="Nomor 2 - pembayar (penguji)"><Input value={f.nomorTester} disabled={!canEdit} onChange={(e) => setF({ ...f, nomorTester: e.target.value })} placeholder="08xxxxxxxxxx" /></Field>
            {nomorWA(f.nomorTester) && <a href={waLink(f.nomorTester, "Tes notifikasi IPL PKJ: pesan ini dikirim dari prototype Pesona Khayangan Juanda.")} target="_blank" rel="noreferrer" className="text-sm font-semibold text-mint-700 hover:underline">Tes kirim ke nomor 2 lewat WhatsApp</a>}
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 text-base font-bold text-navy">QR pembayaran</h3>
          <Select value={rtSel} onChange={(e) => setRtSel(e.target.value)} options={RT_LIST.map((r) => ({ value: r.key, label: groupName(r.key) }))} />
          <div className="my-4 flex justify-center"><QR rtKey={rtSel} size={150} /></div>
          {canEdit && <label className="block cursor-pointer rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-center text-xs font-semibold text-navy hover:bg-slate-50">Unggah gambar QR asli RT ini (maks 400 KB)<input type="file" accept="image/*" className="hidden" onChange={onQr} /></label>}
        </Card>
        <Card>
          <h3 className="mb-2 text-base font-bold text-navy">Pratinjau pengumuman</h3>
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-[#D9FDD3] p-3 text-xs leading-relaxed text-slate-800">{textPengumuman(f, rtSel).replace(/\*/g, "")}</pre>
        </Card>
      </div>
    </div>
  );
}

export default function WaIpl({ params }) {
  const { session, role } = useApp();
  const own = role === "rt" ? [session.rt || "29-01"] : null;
  const [tab, setTab] = useState(params.tab || "chat");
  const initial = params.thread || "g:" + (own ? own[0] : "29-01");
  const [seed, setSeed] = useState(0);
  return (
    <div>
      <PageHeader title="IPL WhatsApp" desc="Simulasi grup WhatsApp IPL PKJ per RT: pengumuman, pembayaran scan QR, notifikasi grup dan pribadi, serta rekapitulasi otomatis." />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "chat", label: "Grup & pesan" }, { id: "bayar", label: "Simulasi bayar via QR" }, { id: "setup", label: "Pengaturan" }]} />
      {tab === "chat" && <Chat key={seed} initial={initial} allowedKeys={own} />}
      {tab === "bayar" && <QrPay onPaid={() => setSeed((s) => s + 1)} />}
      {tab === "setup" && <Setup />}
    </div>
  );
}
