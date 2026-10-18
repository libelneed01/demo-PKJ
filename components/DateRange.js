"use client";
import { useState } from "react";
import { TODAY } from "@/lib/data";

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
export const shift = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
const fmt = (s) => parse(s).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
export const ALL = { from: "", to: "", preset: "all" };
export const lastDays = (n) => ({ from: shift(TODAY, -(n - 1)), to: TODAY, preset: n });
export const bulanIni = () => ({ from: TODAY.slice(0, 8) + "01", to: TODAY, preset: "m0" });
const bulanLalu = () => { const to = shift(TODAY.slice(0, 8) + "01", -1); return { from: to.slice(0, 8) + "01", to, preset: "m1" }; };
export const inRange = (tgl, r) => !r.from || (tgl >= r.from && tgl <= r.to);
export const eachDay = (r) => { const out = []; for (let d = r.from; d && d <= r.to && out.length < 366; d = shift(d, 1)) out.push(d); return out; };
const nm = (m, n) => { const [y, mo] = m.split("-").map(Number); return iso(new Date(y, mo - 1 + n, 1)).slice(0, 7); };
const grid = (m) => { const [y, mo] = m.split("-").map(Number); const s = new Date(y, mo - 1, 1 - new Date(y, mo - 1, 1).getDay()); return Array.from({ length: 42 }, (_, i) => { const d = new Date(s); d.setDate(s.getDate() + i); return iso(d); }); };

export default function DateRange({ value, onChange, future = false, noAll = false }) {
  const [open, setOpen] = useState(false), [step, setStep] = useState(0);
  const [base, setBase] = useState((value.from || shift(TODAY, -30)).slice(0, 7));
  const P = [
    ...(noAll ? [] : [["all", "Semua tanggal", ALL]]), ["m0", "Bulan ini", bulanIni()], ["m1", "Bulan lalu", bulanLalu()],
    ...[15, 30, 90, 365].map((n) => [n, `${n} hari terakhir`, lastDays(n)]),
    ...(future ? [["n30", "30 hari ke depan", { from: TODAY, to: shift(TODAY, 30), preset: "n30" }]] : []),
  ];
  const pick = (d) => {
    if (step === 0) { onChange({ from: d, to: d, preset: "custom" }); setStep(1); }
    else { const [a, b] = [value.from, d].sort(); onChange({ from: a, to: b, preset: "custom" }); setStep(0); }
  };
  const setField = (k) => (e) => {
    const v = e.target.value; if (!v) return;
    const r = { ...value, [k]: v, preset: "custom" };
    if (!r.from) r.from = v; if (!r.to) r.to = v;
    if (r.from > r.to) r[k === "from" ? "to" : "from"] = v;
    onChange(r);
  };
  const Cal = ({ m, side }) => (
    <div className="rounded-xl border border-slate-100 p-3">
      <div className="mb-2 flex items-center justify-between">
        {side === 0 ? <button type="button" aria-label="Bulan sebelumnya" onClick={() => setBase(nm(base, -1))} className="h-8 w-8 rounded-full bg-mist text-moss">←</button> : <span className="w-8" />}
        <b className="text-sm text-pine">{parse(m + "-01").toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</b>
        {side === 1 ? <button type="button" aria-label="Bulan berikutnya" onClick={() => setBase(nm(base, 1))} className="h-8 w-8 rounded-full bg-mist text-moss">→</button> : <span className="w-8" />}
      </div>
      <div className="grid grid-cols-7 text-center text-xs font-bold text-pine">{["M", "S", "S", "R", "K", "J", "S"].map((x, i) => <span key={i} className="py-1">{x}</span>)}</div>
      <div className="grid grid-cols-7 text-center">
        {grid(m).map((d) => {
          const inR = value.from && d >= value.from && d <= value.to, end = d === value.from || d === value.to, cur = d.slice(0, 7) === m;
          return (
            <button type="button" key={d} onClick={() => pick(d)} aria-label={fmt(d)} className={`relative h-9 text-sm ${end ? "bg-[#1E7A52] font-bold text-white" : inR ? "bg-[#B8F2DA] text-pine" : cur ? "text-slate-700 hover:bg-mist" : "text-slate-300"}`}>
              {+d.slice(8)}{d === TODAY && <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-600" />}
            </button>
          );
        })}
      </div>
      <button type="button" onClick={() => setBase(nm(TODAY.slice(0, 7), -1))} className="mt-2 rounded bg-mist px-3 py-1 text-xs font-semibold text-slate-500">Ke hari ini</button>
    </div>
  );
  return (
    <div className="inline-block">
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className="rounded-full border-2 border-pine px-4 py-1.5 text-sm font-semibold text-pine">
        {value.from ? `${fmt(value.from)} – ${fmt(value.to)}` : "Semua tanggal"} ▾
      </button>
      {open && (
        <div className="fixed inset-0 z-[950] flex items-start justify-center bg-black/30 p-3 pt-16" onClick={() => setOpen(false)}>
          <div role="dialog" aria-label="Pilih rentang tanggal" onClick={(e) => e.stopPropagation()} className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-4 shadow-xl md:flex md:gap-4">
            <ul className="mb-3 flex gap-1 overflow-x-auto md:mb-0 md:w-44 md:shrink-0 md:flex-col md:border-r md:border-slate-100 md:pr-2">
              {[...P, ["custom", "Kustom", null]].map(([k, l, r]) => (
                <li key={k}><button type="button" onClick={() => { const nr = r || (value.from ? { ...value, preset: "custom" } : lastDays(30)); onChange({ ...nr, preset: k }); if (nr.from) setBase(nr.from.slice(0, 7)); setStep(0); }} className={`w-full whitespace-nowrap border-l-2 px-3 py-2 text-left text-sm ${value.preset === k ? "border-[#1E7A52] font-bold text-pine" : "border-transparent text-slate-600 hover:bg-mist"}`}>{l}</button></li>
              ))}
            </ul>
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
                <label>Tanggal mulai<input type="date" className="input mt-1 !bg-slate-100" value={value.from} onChange={setField("from")} /></label>
                <label>Tanggal akhir<input type="date" className="input mt-1 !bg-slate-100" value={value.to} onChange={setField("to")} /></label>
              </div>
              <div className="grid gap-3 md:grid-cols-2"><Cal m={base} side={0} /><Cal m={nm(base, 1)} side={1} /></div>
              <p className="text-xs text-slate-400">Ketuk dua tanggal untuk memilih rentang: tanggal awal lalu tanggal akhir.</p>
              <button type="button" className="btn w-full" onClick={() => setOpen(false)}>Terapkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
