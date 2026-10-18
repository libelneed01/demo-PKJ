"use client";
import { useState } from "react";
export const rupiah = (n) => "Rp " + n.toLocaleString("id-ID");

export function Stat({ label, value, tone, hint, onClick }) {
  const C = onClick ? "button" : "div";
  return (
    <C onClick={onClick} className={`card text-left ${onClick ? "hover:ring-moss focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass" : ""}`}>
      <p className={`text-2xl font-extrabold ${tone || "text-pine"}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </C>
  );
}

export const Hint = ({ children }) => (
  <details className="mt-3 text-xs text-slate-500">
    <summary className="cursor-pointer font-semibold text-moss">Keterangan</summary>
    <div className="mt-1 space-y-1">{children}</div>
  </details>
);

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/40 p-3 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-lg font-extrabold text-pine">{title}</h3>
          <button className="btn-ghost" onClick={onClose}>Tutup</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Donut({ data, center }) {
  const [h, setH] = useState(null);
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const R = 40, C = 2 * Math.PI * R;
  let acc = 0;
  const cur = h !== null ? data[h] : null;
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label="Diagram donat">
          {data.map((d, i) => {
            const len = (d.value / total) * C;
            const el = <circle key={d.label} cx="50" cy="50" r={R} fill="none" stroke={d.color} strokeWidth={h === i ? 17 : 12} strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc} onMouseEnter={() => setH(i)} onMouseLeave={() => setH(null)} onClick={() => setH(i)} className="cursor-pointer transition-all" />;
            acc += len;
            return el;
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-lg font-extrabold text-pine">{cur ? cur.value.toLocaleString("id-ID") : total.toLocaleString("id-ID")}</p>
          <p className="text-[10px] text-slate-500">{cur ? `${cur.label} (${Math.round((cur.value / total) * 100)}%)` : center}</p>
        </div>
      </div>
      <ul className="flex-1 space-y-1 text-sm">
        {data.map((d, i) => (
          <li key={d.label} onMouseEnter={() => setH(i)} onMouseLeave={() => setH(null)} className={`flex items-center gap-2 rounded px-1 ${h === i ? "bg-mist" : ""}`}>
            <span className="h-3 w-3 rounded-full" style={{ background: d.color }} />
            <span className="flex-1">{d.label}</span>
            <b>{d.value.toLocaleString("id-ID")}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Bars({ data, max, unit = "", onPick }) {
  const m = max || Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-2">
      {data.map((d) => (
        <li key={d.label}>
          <button type="button" onClick={() => onPick && onPick(d)} className="block w-full text-left" title={`${d.label}: ${d.value}${unit}`}>
            <div className="flex justify-between text-xs"><span>{d.label}</span><span className="font-semibold">{d.value}{unit}{d.sub ? ` · ${d.sub}` : ""}</span></div>
            <div className="h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full" style={{ width: (d.value / m) * 100 + "%", background: d.color || "#1F5A43" }} /></div>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function Trend({ points, unit = "", color = "#1F5A43" }) {
  const [h, setH] = useState(null);
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals) - 2, max = Math.max(...vals) + 2;
  const x = (i) => 20 + i * (260 / (points.length - 1));
  const y = (v) => 100 - ((v - min) / (max - min)) * 80;
  const cur = h !== null ? points[h] : points[points.length - 1];
  return (
    <div>
      <p className="mb-1 text-sm"><b className="text-pine">{cur.value}{unit}</b> <span className="text-slate-500">· {cur.label}</span></p>
      <svg viewBox="0 0 300 125" className="w-full" role="img" aria-label="Grafik tren">
        <polyline fill="none" stroke={color} strokeWidth="2.5" points={points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ")} />
        {points.map((p, i) => (
          <g key={p.label} onMouseEnter={() => setH(i)} onMouseLeave={() => setH(null)} onClick={() => setH(i)} className="cursor-pointer">
            <circle cx={x(i)} cy={y(p.value)} r={h === i ? 6 : 4} fill={color} />
            <circle cx={x(i)} cy={y(p.value)} r="14" fill="transparent" />
            <text x={x(i)} y="118" textAnchor="middle" fontSize="9" fill="#64748b">{p.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
