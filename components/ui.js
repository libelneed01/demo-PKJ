"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useApp } from "@/lib/store";
import { FOOTER, PANEL } from "@/lib/config";
import { rp } from "@/lib/format";
import { ResponsiveContainer, BarChart as RBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

const P = {
  home: "M3 11l9-8 9 8M5 10v10h14V10",
  users: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M22 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8",
  car: "M5 17h14M3 13l2-6h14l2 6v4H3zM7 17v2M17 17v2",
  wallet: "M3 7h18v12H3zM3 7l3-4h12l3 4M16 13h2",
  megaphone: "M3 11v2l14 6V5zM17 8a3 3 0 010 8M6 14v5",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  broom: "M14 3l7 7M3 21l6-6M10 14l4-4 4 4-4 4z",
  msg: "M21 15a2 2 0 01-2 2H8l-5 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  box: "M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8",
  parking: "M5 3h14v18H5zM9 17V7h4a3 3 0 010 6H9",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
  tool: "M14 6a4 4 0 005 5l-9 9a2.1 2.1 0 01-3-3l9-9a4 4 0 00-2-2z",
  building: "M4 21V5l8-2v18M12 9h8v12M7 8h2M7 12h2M7 16h2",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z",
  sparkle: "M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z",
  download: "M12 3v12M7 10l5 5 5-5M4 21h16",
  settings: "M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2",
  clock: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2",
  menu: "M4 6h16M4 12h16M4 18h16",
  x: "M6 6l12 12M18 6L6 18",
  logout: "M9 4H5v16h4M16 8l4 4-4 4M20 12H9",
  search: "M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-5-5",
  plus: "M12 5v14M5 12h14",
  check: "M5 12l5 5 9-10",
  alert: "M12 3l10 18H2zM12 10v5M12 18v.1",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 100 6 3 3 0 000-6",
  eyeOff: "M3 3l18 18M10.6 6.1A9.8 9.8 0 0112 6c6 0 10 6 10 6a17 17 0 01-3.2 3.8M6.5 7.5A17 17 0 002 12s4 7 10 7a9.6 9.6 0 004-.9",
  chevron: "M9 6l6 6-6 6",
  file: "M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6",
};

export function Icon({ n, className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={P[n] || P.alert} />
    </svg>
  );
}

export function Logo({ size = 36 }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/logo-icon.png" alt="Logo Pesona Khayangan Juanda" width={size} height={size} style={{ width: size, height: size, objectFit: "contain" }} />;
}

export function Brand({ size = 40, text = true }) {
  return (
    <span className="flex items-center gap-3">
      <Logo size={size} />
      {text && (
        <span className="leading-none">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Pesona Khayangan</span>
          <span className="mt-1 block text-lg font-extrabold tracking-wide text-navy">JUANDA</span>
        </span>
      )}
    </span>
  );
}

const TONE = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  yellow: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-rose-50 text-rose-700 ring-rose-200",
  navy: "bg-navy-50 text-navy-700 ring-navy-100",
  gray: "bg-slate-100 text-slate-600 ring-slate-200",
};
const DOT = { green: "bg-emerald-500", yellow: "bg-amber-500", red: "bg-rose-500", navy: "bg-navy-600", gray: "bg-slate-400" };
const BAR = { green: "border-l-emerald-500", yellow: "border-l-amber-400", red: "border-l-rose-500", navy: "border-l-navy-600", gray: "border-l-slate-300" };
const TEXT = { green: "text-emerald-600", yellow: "text-amber-600", red: "text-rose-600", navy: "text-navy", gray: "text-slate-500" };
export const tones = { TONE, DOT, TEXT };

export function Badge({ tone = "gray", children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${TONE[tone]}`}>
      <i className={`h-1.5 w-1.5 rounded-full ${DOT[tone]}`} />{children}
    </span>
  );
}

export function Card({ children, className = "", pad = "p-5 sm:p-6" }) {
  return <div className={`rounded-3xl bg-white shadow-card ${pad} ${className}`}>{children}</div>;
}

export function PageHeader({ title, desc, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[28px]">{title}</h1>
        {desc && <p className="mt-1 max-w-2xl text-sm text-slate-500">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, sub, tone = "navy", icon, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag onClick={onClick} className={`group w-full rounded-3xl border-l-4 bg-white p-4 text-left shadow-card sm:p-5 ${BAR[tone]} ${onClick ? "transition hover:-translate-y-0.5 hover:shadow-lg" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-slate-500">{label}</p>
        {icon && <span className="rounded-lg bg-mint-50 p-1.5 text-mint-700"><Icon n={icon} className="h-4 w-4" /></span>}
      </div>
      <p className={`mt-2 text-2xl font-bold tracking-tight sm:text-[28px] ${tone === "navy" ? "text-navy" : TEXT[tone]}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </Tag>
  );
}

const ICONBG = { green: "bg-emerald-50 text-emerald-600", yellow: "bg-amber-50 text-amber-600", red: "bg-rose-50 text-rose-600", navy: "bg-navy-50 text-navy", gray: "bg-slate-100 text-slate-500" };

export function KPI({ label, value, sub, tone = "navy", icon = "home", progress, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag onClick={onClick} className={`group w-full rounded-3xl bg-white p-5 text-left shadow-card ${onClick ? "transition hover:-translate-y-0.5 hover:shadow-lg" : ""}`}>
      <div className="flex items-center justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-2xl ${ICONBG[tone]}`}><Icon n={icon} className="h-5 w-5" /></span>
        {onClick && <Icon n="chevron" className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-mint-600" />}
      </div>
      <p className="mt-4 text-[13px] font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-[26px] font-extrabold leading-tight tracking-tight ${tone === "navy" ? "text-navy" : TEXT[tone]}`}>{value}</p>
      {progress !== undefined && <div className="mt-3"><ProgressBar value={progress} tone={tone === "navy" ? "green" : tone} /></div>}
      {sub && <p className="mt-2 text-xs text-slate-500">{sub}</p>}
    </Tag>
  );
}

export function ListCard({ title, desc, rows, action, className = "" }) {
  return (
    <div className={`rounded-3xl bg-white shadow-card ${className}`}>
      <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6">
        <div><h3 className="text-[15px] font-bold text-navy">{title}</h3>{desc && <p className="mt-0.5 text-xs text-slate-500">{desc}</p>}</div>{action}
      </div>
      <ul className="mt-3 divide-y divide-slate-100 pb-2">
        {rows.map((r) => (
          <li key={r.label}>
            <button onClick={r.onClick} disabled={!r.onClick} className="flex w-full items-center gap-3 px-5 py-3 text-left transition enabled:hover:bg-mint-50/70 sm:px-6">
              <i className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[r.tone || "gray"]}`} />
              <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-navy">{r.label}</span>{r.sub && <span className="block text-xs text-slate-500">{r.sub}</span>}</span>
              <span className={`text-sm font-bold ${r.tone && r.tone !== "gray" && r.tone !== "navy" ? TEXT[r.tone] : "text-navy"}`}>{r.value}</span>
              {r.onClick && <Icon n="chevron" className="h-4 w-4 shrink-0 text-slate-300" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Attention({ list, go }) {
  if (!list.length) return (
    <div className="mb-6 flex items-center gap-4 rounded-3xl bg-white p-5 shadow-card">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><Icon n="check" className="h-6 w-6" /></span>
      <div><p className="text-sm font-bold text-navy">Semua terpantau aman</p><p className="text-xs text-slate-500">Tidak ada hal mendesak yang perlu ditangani saat ini.</p></div>
    </div>
  );
  return (
    <div className="mb-6 rounded-3xl bg-white p-2 shadow-card">
      <p className="px-4 pb-1 pt-3 text-sm font-bold text-navy">Perlu perhatian ({list.length})</p>
      <ul>
        {list.map((x, i) => (
          <li key={i}>
            <button onClick={() => go(x.v, x.p || {})} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-mint-50/70">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${ICONBG[x.t]}`}><Icon n="alert" className="h-[18px] w-[18px]" /></span>
              <span className="min-w-0 flex-1 text-sm text-navy">{x.m}</span>
              <span className="text-xs font-semibold text-mint-700">Lihat</span><Icon n="chevron" className="h-4 w-4 text-slate-300" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Button({ variant = "primary", className = "", icon, children, ...p }) {
  const v = {
    primary: "bg-navy text-white hover:bg-navy-700 disabled:bg-slate-300",
    mint: "bg-mint-500 text-white hover:bg-mint-600 disabled:bg-slate-300",
    ghost: "bg-white text-navy ring-1 ring-inset ring-slate-200 hover:bg-slate-50 disabled:opacity-50",
    danger: "bg-rose-600 text-white hover:bg-rose-700 disabled:bg-slate-300",
    soft: "bg-mint-50 text-mint-700 hover:bg-mint-100 disabled:opacity-50",
  }[variant];
  return (
    <button {...p} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed ${v} ${className}`}>
      {icon && <Icon n={icon} className="h-4 w-4" />}{children}
    </button>
  );
}

export function Modal({ open, onClose, title, children, wide, footer }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && onClose && onClose();
    window.addEventListener("keydown", h);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-navy-900/50 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`flex max-h-[92dvh] w-full flex-col rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl ${wide ? "sm:max-w-3xl" : "sm:max-w-xl"}`}>
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-bold text-navy">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Tutup"><Icon n="x" /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-4 sm:px-6">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

const INPUT = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-mint-500 focus:outline-none focus:ring-4 focus:ring-mint-100";
export const inputCls = INPUT;

export function Field({ label, error, hint, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[13px] font-semibold text-navy">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>}
    </label>
  );
}
export const Input = (p) => <input {...p} className={`${INPUT} ${p.className || ""}`} />;
export const Textarea = (p) => <textarea rows={3} {...p} className={`${INPUT} ${p.className || ""}`} />;
export const Select = ({ options = [], placeholder, ...p }) => (
  <select {...p} className={`${INPUT} ${p.className || ""}`}>
    {placeholder !== undefined && <option value="">{placeholder}</option>}
    {options.map((o) => (typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
  </select>
);

export function FileInput({ value, onChange, modul = "Umum", label = "Pilih file (simulasi)" }) {
  const { addUpload } = useApp();
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-3.5 py-2.5">
      <label className="cursor-pointer rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-navy ring-1 ring-inset ring-slate-200 hover:bg-slate-50">
        {label}
        <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => {
          const f = e.target.files && e.target.files[0];
          if (f) { onChange(f.name); addUpload(modul, f.name, f.size); }
        }} />
      </label>
      <span className="min-w-0 truncate text-xs text-slate-500">{value ? <span className="inline-flex items-center gap-1 text-emerald-700"><Icon n="check" className="h-3.5 w-3.5" />{value}</span> : "Belum ada file. Tidak diunggah ke server."}</span>
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder = "Cari…" }) {
  return (
    <div className="relative min-w-[200px] flex-1">
      <Icon n="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${INPUT} pl-10`} />
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${value === t.id ? "bg-navy text-white shadow" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"}`}>
          {t.label}{t.count !== undefined && <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[11px] ${value === t.id ? "bg-white/20" : "bg-slate-100"}`}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Pagination({ page, total, size, onPage }) {
  const pages = Math.max(1, Math.ceil(total / size));
  if (total <= size) return null;
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
      <span>{(page - 1) * size + 1}-{Math.min(page * size, total)} dari {total}</span>
      <div className="flex gap-2">
        <Button variant="ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>Sebelumnya</Button>
        <Button variant="ghost" disabled={page >= pages} onClick={() => onPage(page + 1)}>Berikutnya</Button>
      </div>
    </div>
  );
}

export function DataTable({ columns, rows, onRow, empty = "Belum ada data." }) {
  if (!rows.length) return <Empty text={empty} />;
  return (
    <div className="-mx-5 overflow-x-auto sm:-mx-6">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs text-slate-500">
            {columns.map((c) => <th key={c.label} className="whitespace-nowrap px-5 py-3 font-semibold first:pl-5 sm:first:pl-6">{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} onClick={onRow ? () => onRow(r) : undefined} className={`border-b border-slate-50 last:border-0 ${onRow ? "cursor-pointer hover:bg-mint-50/50" : ""}`}>
              {columns.map((c) => <td key={c.label} className="px-5 py-3.5 align-top first:pl-5 sm:first:pl-6">{c.render ? c.render(r) : r[c.key] || "-"}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Empty({ text }) {
  return <div className="rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">{text}</div>;
}

export function ProgressBar({ value, tone = "green" }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${DOT[tone]}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function BarChart({ data, aLabel = "Pemasukan", bLabel = "Pengeluaran", money = false, height = 230 }) {
  const two = data.some((d) => d.b !== undefined);
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RBar data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#E8EEF0" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#5B6877" }} />
          <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: "#7A8794" }} tickFormatter={(v) => (money ? Math.round(v / 1e6) + "jt" : v)} />
          <Tooltip cursor={{ fill: "rgba(61,190,143,.08)" }} formatter={(v) => (money ? rp(v) : v)} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(18,41,74,.15)", fontSize: 12 }} />
          {two && <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />}
          <Bar dataKey="a" name={two ? aLabel : "Jumlah"} fill="#3DBE8F" radius={[6, 6, 0, 0]} maxBarSize={32} />
          {two && <Bar dataKey="b" name={bLabel} fill="#12294A" radius={[6, 6, 0, 0]} maxBarSize={32} />}
        </RBar>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({ data, height = 220, center }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  return (
    <div>
      <div className="relative" style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={2} stroke="none">
              {data.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
            <Tooltip formatter={(v, n) => [v + " rumah", n]} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(18,41,74,.15)", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-2xl font-bold text-navy">{center ?? total}</p><p className="text-xs text-slate-500">total</p></div></div>
      </div>
      <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-600">
        {data.map((d) => <li key={d.name} className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />{d.name} ({d.value})</li>)}
      </ul>
    </div>
  );
}

export function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div key={t.id} className={`pointer-events-auto flex max-w-md items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl ${t.tone === "red" ? "bg-rose-600" : t.tone === "yellow" ? "bg-amber-500" : "bg-navy"}`}>
          <Icon n={t.tone === "green" ? "check" : "alert"} className="h-4 w-4 shrink-0" />{t.msg}
        </div>
      ))}
    </div>
  );
}

export function Footer() {
  const { login, toast } = useApp();
  const [open, setOpen] = useState(false);
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (id.trim().toLowerCase() === PANEL.id && pw === PANEL.pass) { setOpen(false); setId(""); setPw(""); login({ role: "pengelola", name: "Pengelola" }); toast("Panel pengelola data demo dibuka"); }
    else setErr("ID atau password tidak sesuai.");
  };
  return (
    <>
      <footer className="flex items-center justify-center gap-2 px-4 py-8 text-xs text-gray-400">
        <span>{FOOTER}</span>
        <button onClick={() => { setErr(""); setOpen(true); }} className="rounded p-1 text-gray-300 opacity-60 hover:opacity-100" aria-label="Pengaturan"><Icon n="settings" className="h-3 w-3" /></button>
      </footer>
      <Modal open={open} onClose={() => setOpen(false)} title="Akses pengelola" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Batal</Button><Button onClick={submit} disabled={!id || !pw}>Masuk</Button></>}>
        <form onSubmit={submit} className="space-y-4">
          <Field label="User ID"><Input value={id} onChange={(e) => { setId(e.target.value); setErr(""); }} autoComplete="off" autoFocus /></Field>
          <Field label="Password" error={err}><Input type="password" value={pw} onChange={(e) => { setPw(e.target.value); setErr(""); }} autoComplete="off" /></Field>
          <button type="submit" className="hidden" />
        </form>
      </Modal>
    </>
  );
}

export function Confirm({ open, title, desc, onOk, onClose, okText = "Ya, lanjutkan", requireText }) {
  const [v, setV] = useState("");
  useEffect(() => { if (open) setV(""); }, [open]);
  const ok = !requireText || v === requireText;
  return (
    <Modal open={open} onClose={onClose} title={title} footer={<><Button variant="ghost" onClick={onClose}>Batal</Button><Button variant="danger" disabled={!ok} onClick={() => { onOk(); onClose(); }}>{okText}</Button></>}>
      <p className="text-sm text-slate-600">{desc}</p>
      {requireText && (
        <Field label={`Ketik "${requireText}" untuk konfirmasi`} className="mt-4">
          <Input value={v} onChange={(e) => setV(e.target.value)} autoFocus />
        </Field>
      )}
    </Modal>
  );
}
