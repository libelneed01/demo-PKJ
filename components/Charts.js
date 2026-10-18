"use client";
import { useState } from "react";
export const rupiah = (n) => "Rp " + n.toLocaleString("id-ID");

export function Stat({ label, value, tone, color, hint, onClick }) {
  const C = onClick ? "button" : "div";
  return (
    <C onClick={onClick} className={`card text-left ${onClick ? "hover:ring-moss focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass" : ""}`}>
      <p className={`text-2xl font-extrabold ${tone || "text-pine"}`} style={color ? { color } : undefined}>{value}</p>
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
            <div className="h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full" style={{ width: (d.value / m) * 100 + "%", background: d.color || "#2FA37A" }} /></div>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function Trend({ points, unit = "", color = "#2FA37A" }) {
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

export function ExportBtn({ rows, name }) {
  const go = () => {
    if (!rows.length) return;
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(","), ...rows.map((r) => keys.map((k) => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = name + ".csv"; a.click();
  };
  return <button type="button" onClick={go} className="rounded-full bg-moss px-4 py-1.5 text-sm font-semibold text-white hover:bg-pine">⬇ Export</button>;
}

const Legend = ({ items }) => <div className="mt-2 flex flex-wrap gap-3 text-xs">{items.map((s) => <span key={s.name}><i className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />{s.name}</span>)}</div>;

export function Gauge({ value, label, target }) {
  const c = value >= target ? "#2FA37A" : value >= target - 10 ? "#E0A526" : "#E26D6D", L = Math.PI * 40;
  return (
    <div className="text-center">
      <svg viewBox="0 0 100 58" className="mx-auto w-32" role="img" aria-label={`${label} ${value}%`}>
        <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="#E2E8F0" strokeWidth="10" strokeLinecap="round" />
        <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke={c} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(Math.min(value, 100) / 100) * L} ${L}`} />
        <text x="50" y="48" textAnchor="middle" fontSize="16" fontWeight="800" fill="#0B2545">{value}%</text>
      </svg>
      <p className="text-sm font-semibold text-pine">{label}</p><p className="text-xs text-slate-400">Target {target}%</p>
    </div>
  );
}

export function Cols({ data, series, unit = "" }) {
  const max = Math.max(...data.flatMap((d) => d.v), 1);
  return (
    <div>
      <div className="flex gap-3">
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center">
            <div className="flex h-36 w-full items-end justify-center gap-1">
              {d.v.map((v, i) => <div key={i} title={`${series[i].name} ${d.label}: ${v}${unit}`} className="w-3 rounded-t sm:w-5" style={{ height: (v / max) * 100 + "%", background: series[i].color }} />)}
            </div>
            <span className="mt-1 text-[11px] text-slate-500">{d.label}</span>
          </div>
        ))}
      </div>
      <Legend items={series} />
    </div>
  );
}

export function Lines({ labels, series }) {
  const all = series.flatMap((s) => s.values), min = Math.min(...all) - 2, max = Math.max(...all) + 2;
  const x = (i) => 20 + i * (260 / (labels.length - 1)), y = (v) => 100 - ((v - min) / (max - min)) * 80;
  return (
    <div>
      <svg viewBox="0 0 300 125" className="w-full" role="img" aria-label="Grafik garis">
        {series.map((s) => (
          <g key={s.name}>
            <polyline fill="none" stroke={s.color} strokeWidth="2.5" points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
            {s.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="4" fill={s.color}><title>{`${s.name} ${labels[i]}: ${v}`}</title></circle>)}
          </g>
        ))}
        {labels.map((l, i) => <text key={l} x={x(i)} y="118" textAnchor="middle" fontSize="9" fill="#64748b">{l}</text>)}
      </svg>
      <Legend items={series} />
    </div>
  );
}

export function Stack({ data, parts }) {
  return (
    <div>
      <ul className="space-y-2">
        {data.map((d) => {
          const t = d.v.reduce((a, b) => a + b, 0);
          return (
            <li key={d.label} className="flex items-center gap-2 text-xs">
              <span className="w-12 text-slate-500">{d.label}</span>
              <div className="flex h-4 flex-1 overflow-hidden rounded-full bg-slate-100">{d.v.map((v, i) => <div key={i} title={`${parts[i].name}: ${v}`} style={{ width: (v / t) * 100 + "%", background: parts[i].color }} />)}</div>
              <b className="w-8 text-right">{t}</b>
            </li>
          );
        })}
      </ul>
      <Legend items={parts} />
    </div>
  );
}

export function Heat({ rows, cols, cell }) {
  const m = Math.max(1, ...rows.flatMap((r) => cols.map((c) => cell(r, c))));
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-center text-xs">
        <thead><tr><th />{cols.map((c) => <th key={c} className="py-1 font-normal text-slate-400">{c}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <td className="whitespace-nowrap pr-2 text-left text-slate-500">{r}</td>
              {cols.map((c) => { const n = cell(r, c); return <td key={c} title={`${r}, ${c}: ${n} kejadian`} className="h-8 border border-white font-semibold" style={{ background: n ? `rgba(226,109,109,${0.15 + (0.85 * n) / m})` : "#F4F7FB", color: n / m > 0.6 ? "#fff" : "#0B2545" }}>{n || ""}</td>; })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
