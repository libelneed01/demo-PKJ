"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { SEC_GROUPS, CLEAN_GROUPS, TOLERANSI } from "@/lib/data";
import { nowHM, toMin, ymd, fmtDate } from "@/lib/format";
import { Card, Button, Field, Input, Select, Badge, PageHeader, Stat, DataTable, Empty, Pagination } from "../ui";

function Absensi({ kind }) {
  const sec = kind === "security";
  const GROUPS = sec ? SEC_GROUPS : CLEAN_GROUPS;
  const col = sec ? "absenSecurity" : "absenKebersihan";
  const { data, add, update, toast } = useApp();
  const names = Object.keys(GROUPS);
  const [group, setGroup] = useState(names[0]);
  const [nama, setNama] = useState("");
  const [area, setArea] = useState("");
  const [jam, setJam] = useState(nowHM());
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);

  const today = ymd(new Date());
  const rows = data[col];
  const aktif = rows.filter((r) => r.tanggal === today && !r.keluar);
  const week = new Date(); week.setDate(week.getDate() - 7);
  const wk = rows.filter((r) => new Date(r.tanggal) >= week);
  const telat = wk.filter((r) => r.telat).length;
  const cfg = GROUPS[group];

  const checkIn = () => {
    if (!nama) return toast("Pilih nama petugas", "yellow");
    if (!sec && !area) return toast("Pilih area RW 29 atau RW 31 sebelum check-in", "yellow");
    if (rows.some((r) => r.tanggal === today && r.nama === nama && !r.keluar)) return toast(`${nama} sudah check-in dan belum check-out`, "yellow");
    const menit = Math.max(0, toMin(jam) - toMin(cfg.start));
    const telatFlag = menit > TOLERANSI;
    add(col, { group, nama, tanggal: today, masuk: jam, keluar: null, menit, telat: telatFlag, area: sec ? "" : area });
    toast(telatFlag ? `${nama} check-in TERLAMBAT ${menit} menit` : `${nama} check-in tepat waktu`, telatFlag ? "yellow" : "green");
    setNama("");
  };
  const checkOut = (r) => { update(col, r.id, { keluar: jam }); toast(`${r.nama} check-out pukul ${jam}`); };

  let hist = [...rows].sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.masuk.localeCompare(a.masuk));
  if (filter) hist = hist.filter((r) => r.group === filter);

  return (
    <div>
      <PageHeader title={sec ? "Absensi Security" : "Absensi Kebersihan"} desc={sec ? "3 group bergiliran jaga. Terlambat jika check-in lebih dari 10 menit setelah jam mulai shift." : "2 group petugas kebersihan. Wajib memilih area RW saat check-in."} />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Bertugas sekarang" value={aktif.length} icon="clock" tone="green" />
        <Stat label="Check-in hari ini" value={rows.filter((r) => r.tanggal === today).length} sub={`dari ${names.length} group`} icon="check" />
        <Stat label="Terlambat 7 hari" value={telat} tone={telat > 3 ? "red" : telat ? "yellow" : "green"} icon="alert" />
        <Stat label="Tepat waktu" value={wk.length ? Math.round(((wk.length - telat) / wk.length) * 100) + "%" : "-"} tone="green" icon="shield" />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-base font-bold text-navy">Check-in</h2>
          <div className="space-y-4">
            <Field label="Group"><Select value={group} onChange={(e) => { setGroup(e.target.value); setNama(""); }} options={names.map((n) => ({ value: n, label: `${n} (${GROUPS[n].start} - ${GROUPS[n].end})` }))} /></Field>
            <Field label="Nama petugas *"><Select value={nama} onChange={(e) => setNama(e.target.value)} options={cfg.anggota} placeholder="Pilih petugas" /></Field>
            {!sec && (
              <Field label="Area kerja *">
                <div className="grid grid-cols-2 gap-2">
                  {["RW 29", "RW 31"].map((a) => (
                    <button type="button" key={a} onClick={() => setArea(a)} className={`rounded-xl px-3 py-2.5 text-sm font-semibold ring-1 ring-inset ${area === a ? "bg-navy text-white ring-navy" : "bg-white text-navy ring-slate-200"}`}>{a}</button>
                  ))}
                </div>
              </Field>
            )}
            <Field label="Jam (simulasi)" hint="Ubah jam untuk mencoba deteksi keterlambatan."><Input type="time" value={jam} onChange={(e) => setJam(e.target.value)} /></Field>
            <Button variant="mint" className="w-full" onClick={checkIn}>Check-in</Button>
          </div>
        </Card>
        <Card className="lg:col-span-3">
          <h2 className="mb-4 text-base font-bold text-navy">Sedang bertugas</h2>
          {aktif.length === 0 ? <Empty text="Belum ada petugas yang check-in hari ini." /> : (
            <div className="space-y-3">
              {aktif.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                  <div><p className="font-semibold text-navy">{r.nama}</p><p className="text-xs text-slate-500">{r.group}{r.area ? ` - ${r.area}` : ""} - masuk {r.masuk}</p>
                    <div className="mt-1.5">{r.telat ? <Badge tone="yellow">Terlambat {r.menit} menit</Badge> : <Badge tone="green">Tepat waktu</Badge>}</div></div>
                  <Button variant="ghost" onClick={() => checkOut(r)}>Check-out</Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-navy">Riwayat absensi</h2>
          <Select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} placeholder="Semua group" options={names} className="!w-auto min-w-[150px]" />
        </div>
        <DataTable rows={hist.slice((page - 1) * 10, page * 10)} columns={[
          { label: "Tanggal", render: (r) => fmtDate(r.tanggal) }, { label: "Group", key: "group" }, { label: "Petugas", key: "nama" },
          ...(sec ? [] : [{ label: "Area", key: "area" }]),
          { label: "Masuk", key: "masuk" }, { label: "Keluar", render: (r) => r.keluar || "-" },
          { label: "Status", render: (r) => (r.telat ? <Badge tone={r.menit > 30 ? "red" : "yellow"}>Terlambat {r.menit} mnt</Badge> : <Badge tone="green">Tepat waktu</Badge>) },
        ]} />
        <Pagination page={page} total={hist.length} size={10} onPage={setPage} />
      </Card>
    </div>
  );
}

export const AbsenSecurity = () => <Absensi kind="security" />;
export const AbsenKebersihan = () => <Absensi kind="kebersihan" />;
