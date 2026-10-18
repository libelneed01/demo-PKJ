"use client";
import { useEffect, useState } from "react";

export function Feed({ name, seed = 0 }) {
  const [t, setT] = useState("");
  useEffect(() => { const f = () => setT(new Date().toLocaleString("id-ID")); f(); const i = setInterval(f, 1000); return () => clearInterval(i); }, []);
  const car = ["#0B2545", "#E26D6D", "#94A3B8", "#E0A526"][seed % 4];
  return (
    <svg viewBox="0 0 320 180" className="w-full rounded-t-xl" role="img" aria-label={`Kamera ${name}`}>
      <rect width="320" height="180" fill="#BFD7EA" /><rect y="84" width="320" height="8" fill="#7A9E62" /><rect y="92" width="320" height="88" fill="#5B6770" />
      <rect x="30" y="40" width="80" height="46" fill="#CBD5E1" /><rect x="44" y="52" width="16" height="16" fill="#8FB0CF" /><rect x="76" y="52" width="16" height="16" fill="#8FB0CF" />
      <rect x="200" y="30" width="6" height="56" fill="#94A3B8" /><rect y="128" width="320" height="3" fill="#F1F5F9" opacity=".6" /><rect y="152" width="320" height="6" fill="#E0A526" />
      <g><animateTransform attributeName="transform" type="translate" from="-90 0" to="340 0" dur={`${7 + seed * 2}s`} repeatCount="indefinite" />
        <rect x="0" y="108" width="60" height="18" rx="5" fill={car} /><rect x="12" y="98" width="34" height="14" rx="4" fill={car} />
        <circle cx="14" cy="128" r="6" fill="#1E293B" /><circle cx="46" cy="128" r="6" fill="#1E293B" /></g>
      <rect width="320" height="18" fill="#000" opacity=".5" /><text x="6" y="13" fontSize="9" fill="#fff">{name}</text><text x="314" y="13" textAnchor="end" fontSize="9" fill="#fff">{t}</text>
      <circle cx="12" cy="168" r="4" fill="#E26D6D" /><text x="20" y="171" fontSize="9" fill="#fff">LIVE</text>
    </svg>
  );
}
