"use client";
import { useState } from "react";

const AKUN = { pengurus: { pass: "AO3", acct: "pengurus" }, warga: { pass: "AD10", acct: "warga" } };

export default function Login({ onLogin }) {
  const [u, setU] = useState(""), [p, setP] = useState(""), [show, setShow] = useState(false), [err, setErr] = useState("");
  const submit = (e) => {
    e.preventDefault();
    const a = AKUN[u.trim().toLowerCase()];
    if (a && a.pass === p) onLogin(a.acct); else setErr("ID pengguna atau kata sandi salah.");
  };
  const field = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200";
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <form onSubmit={submit} className="space-y-5">
        <img src="/logo.png" alt="Logo Pesona Khayangan Juanda" className="mx-auto h-40 w-auto" />
        <h1 className="sr-only">Masuk ke Pesona Khayangan Juanda</h1>
        <label className="block text-sm font-semibold text-slate-600">ID Pengguna
          <input className={`${field} mt-2`} placeholder="Masukkan ID pengguna Anda" autoComplete="username" value={u} onChange={(e) => { setU(e.target.value); setErr(""); }} />
        </label>
        <label className="block text-sm font-semibold text-slate-600">Kata Sandi
          <div className="relative mt-2">
            <input className={`${field} pr-12`} type={show ? "text" : "password"} placeholder="Masukkan kata sandi Anda" autoComplete="current-password" value={p} onChange={(e) => { setP(e.target.value); setErr(""); }} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />{show && <path d="M3 3l18 18" />}</svg>
            </button>
          </div>
        </label>
        {err && <p role="alert" className="text-sm font-semibold text-red-500">{err}</p>}
        <button disabled={!u || !p} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#14293A] py-3.5 font-bold text-white transition hover:bg-pine active:scale-[0.99] disabled:opacity-40">Masuk ke Sistem <span aria-hidden>→</span></button>
        <p className="text-center text-sm text-slate-500">Terkendala akses atau akun terkunci? Hubungi <b className="text-slate-700">Administrator IT</b> organisasi Anda.</p>
        <details className="rounded-xl bg-mist p-3 text-xs text-slate-500">
          <summary className="cursor-pointer font-semibold text-moss">Akun demo</summary>
          <p className="mt-2">Pengurus warga: ID <b>Pengurus</b>, sandi <b>AO3</b></p>
          <p>Warga: ID <b>warga</b>, sandi <b>AD10</b></p>
        </details>
      </form>
    </main>
  );
}
