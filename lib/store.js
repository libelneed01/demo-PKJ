"use client";
import { createContext, useContext, useEffect, useReducer, useState, useCallback, useMemo, useRef } from "react";
import { buildSeed } from "./data";
import { DB_ENABLED, getSupabase } from "./supabase";
import { canon, cacheFromData, diffData, emptyOps, rowsToData, applyRemote } from "./sync";
import { loadAll, pushOps } from "./dbsync";

const Ctx = createContext(null);
const KEY = "pkj-data-v3";
const SKEY = "pkj-session-v1";
export const uid = (p) => p + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function reducer(s, a) {
  switch (a.type) {
    case "INIT": return { ...s, ready: true, data: a.data, session: a.session };
    case "LOGIN": return { ...s, session: a.session, hist: [], nav: { view: "dashboard", params: {} } };
    case "SESSION": return { ...s, session: { ...s.session, ...a.patch } };
    case "LOGOUT": return { ...s, session: null, hist: [] };
    case "NAV": return { ...s, hist: [...s.hist.slice(-9), s.nav], nav: { view: a.view, params: a.params || {} } };
    case "BACK": return s.hist.length ? { ...s, nav: s.hist[s.hist.length - 1], hist: s.hist.slice(0, -1) } : s;
    case "DATA": return { ...s, data: a.fn(s.data) };
    case "REPLACE": return { ...s, data: a.data };
    case "REMOTE": return s.data ? { ...s, data: applyRemote(s.data, a.ev) } : s;
    case "STATUS": return s.dbStatus === a.status ? s : { ...s, dbStatus: a.status };
    default: return s;
  }
}

function fillMissing(data, seed) {
  Object.keys(seed).forEach((k) => { if (data[k] === undefined || data[k] === null) data[k] = seed[k]; });
  return data;
}

export function AppProvider({ children }) {
  const [s, d] = useReducer(reducer, { ready: false, data: null, session: null, hist: [], nav: { view: "dashboard", params: {} }, dbStatus: DB_ENABLED ? "menghubungkan" : "lokal" });
  const [toasts, setToasts] = useState([]);
  const cache = useRef(new Map());   // keadaan terakhir yang diketahui di server (kunci "col|id" -> json kanonik)
  const syncOn = useRef(false);      // true bila mode database aktif dan data awal sudah dimuat
  const started = useRef(false);
  const timer = useRef(null);
  const me = useRef(null);           // id pengguna anonim Supabase

  const fromLocal = (session) => {
    let data = null;
    try { const raw = localStorage.getItem(KEY); if (raw) data = JSON.parse(raw); localStorage.removeItem("pkj-data-v1"); } catch (e) {}
    const seed = buildSeed();
    data = !data || !Array.isArray(data.rumah) ? seed : fillMissing(data, seed);
    d({ type: "INIT", data, session });
  };

  // ---------- Muat data awal ----------
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let session = null;
    try { const se = sessionStorage.getItem(SKEY); if (se) session = JSON.parse(se); } catch (e) {}
    if (!DB_ENABLED) { fromLocal(session); return; }

    (async () => {
      const sb = getSupabase();
      try {
        let { data: { session: au } } = await sb.auth.getSession();
        if (!au) { const r = await sb.auth.signInAnonymously(); if (r.error) throw r.error; au = r.data.session; }
        me.current = au.user.id;
        await sb.from("profiles").upsert({ id: au.user.id, role: "guest" }, { onConflict: "id", ignoreDuplicates: true });
        if (session) await sb.from("profiles").upsert({ id: au.user.id, role: session.role, name: session.name || null, rt: session.rt || null, house_id: session.houseId || null });

        let rows = await loadAll(sb);
        if (rows.length === 0) {                       // database masih kosong: isi data dummy awal
          await pushOps(sb, diffData(new Map(), buildSeed()), { ignoreDuplicates: true });
          rows = await loadAll(sb);
        }
        const data = rowsToData(rows);
        cache.current = cacheFromData(data);          // cache dibangun SEBELUM melengkapi koleksi baru
        fillMissing(data, buildSeed());                // koleksi baru yang belum ada di DB akan terdorong otomatis
        syncOn.current = true;
        d({ type: "INIT", data, session });
        d({ type: "STATUS", status: "online" });

        sb.channel("pkj-app-records")
          .on("postgres_changes", { event: "*", schema: "public", table: "app_records" }, (p) => {
            if (p.eventType === "DELETE") {
              const { col, id } = p.old || {};
              if (col === undefined) return;
              const k = col + "|" + id;
              if (!cache.current.has(k)) return;
              cache.current.delete(k);
              d({ type: "REMOTE", ev: { type: "DELETE", col, id: String(id) } });
            } else {
              const r = p.new; const k = r.col + "|" + r.id; const c = canon(r.data);
              if (cache.current.get(k) === c) return;   // gema dari perubahan kita sendiri
              cache.current.set(k, c);
              d({ type: "REMOTE", ev: { type: "UPSERT", col: r.col, id: String(r.id), data: r.data, ord: r.ord } });
            }
          })
          .subscribe((st) => { if (st === "SUBSCRIBED") d({ type: "STATUS", status: "online" }); else if (st === "CHANNEL_ERROR" || st === "TIMED_OUT") d({ type: "STATUS", status: "error" }); });
      } catch (e) {
        console.error("Database tidak tersedia, memakai mode lokal:", e);
        syncOn.current = false;
        d({ type: "STATUS", status: "error" });
        fromLocal(session);
      }
    })();
  }, []); // eslint-disable-line

  // ---------- Simpan perubahan ----------
  useEffect(() => {
    if (!s.ready || !s.data) return;
    if (!syncOn.current) { try { localStorage.setItem(KEY, JSON.stringify(s.data)); } catch (e) {} return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const ops = diffData(cache.current, s.data);
      if (emptyOps(ops)) return;
      [...ops.news, ...ops.changes].forEach((o) => cache.current.set(o.col + "|" + o.id, o.canon));
      ops.dels.forEach((o) => cache.current.delete(o.col + "|" + o.id));
      try { await pushOps(getSupabase(), ops); d({ type: "STATUS", status: "online" }); }
      catch (e) {
        console.error("Gagal menyimpan ke database:", e);
        [...ops.news].forEach((o) => cache.current.delete(o.col + "|" + o.id));               // coba lagi di perubahan berikutnya
        ops.changes.forEach((o) => cache.current.delete(o.col + "|" + o.id));
        ops.dels.forEach((o) => cache.current.set(o.col + "|" + o.id, o.prev));
        d({ type: "STATUS", status: "error" });
      }
    }, 300);
    return () => clearTimeout(timer.current);
  }, [s.data, s.ready]);

  useEffect(() => {
    if (!s.ready) return;
    try { s.session ? sessionStorage.setItem(SKEY, JSON.stringify(s.session)) : sessionStorage.removeItem(SKEY); } catch (e) {}
  }, [s.session, s.ready]);

  const toast = useCallback((msg, tone = "green") => {
    const id = Math.random();
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const api = useMemo(() => ({
    data: s.data, session: s.session, role: s.session ? s.session.role : null, ready: s.ready, nav: s.nav, toasts, toast, dbStatus: s.dbStatus,
    login: (session) => {
      d({ type: "LOGIN", session });
      if (DB_ENABLED && me.current) getSupabase().from("profiles").upsert({ id: me.current, role: session.role, name: session.name || null, rt: session.rt || null, house_id: session.houseId || null }).then(() => {});
    },
    logout: () => d({ type: "LOGOUT" }),
    back: () => { d({ type: "BACK" }); if (typeof window !== "undefined") window.scrollTo(0, 0); },
    canBack: s.hist.length > 0,
    setSession: (patch) => d({ type: "SESSION", patch }),
    go: (view, params) => { d({ type: "NAV", view, params }); if (typeof window !== "undefined") window.scrollTo(0, 0); },
    mutate: (fn) => d({ type: "DATA", fn }),
    add: (col, item) => {
      const it = { id: uid(col.slice(0, 3)), _t: true, at: new Date().toISOString(), ...item };
      d({ type: "DATA", fn: (x) => ({ ...x, [col]: [it, ...x[col]] }) });
      return it;
    },
    update: (col, id, patch) => d({ type: "DATA", fn: (x) => ({ ...x, [col]: x[col].map((i) => (i.id === id ? { ...i, ...patch } : i)) }) }),
    remove: (col, id) => d({ type: "DATA", fn: (x) => ({ ...x, [col]: x[col].filter((i) => i.id !== id) }) }),
    addUpload: (modul, name, size) => {
      const u = { id: uid("upl"), modul, name, size: size || 0, at: new Date().toISOString(), _t: true };
      d({ type: "DATA", fn: (x) => ({ ...x, uploads: [u, ...x.uploads] }) });
    },
    resetAll: () => d({ type: "REPLACE", data: buildSeed() }),
    clearTesting: () => d({ type: "DATA", fn: (x) => { const o = { ...x }; Object.keys(x).forEach((k) => { if (Array.isArray(x[k])) o[k] = x[k].filter((i) => !i._t); }); return o; } }),
    clearTestingCols: (cols) => d({ type: "DATA", fn: (x) => { const o = { ...x }; cols.forEach((c) => { o[c] = (x[c] || []).filter((i) => !i._t); }); return o; } }),
    clearCols: (cols) => d({ type: "DATA", fn: (x) => { const o = { ...x }; cols.forEach((c) => { o[c] = []; }); return o; } }),
  }), [s, toasts, toast]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);
