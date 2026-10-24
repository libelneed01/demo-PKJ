"use client";
import { createContext, useContext, useEffect, useReducer, useState, useCallback, useMemo } from "react";
import { buildSeed } from "./data";

const Ctx = createContext(null);
const KEY = "pkj-data-v1";
const SKEY = "pkj-session-v1";
export const uid = (p) => p + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function reducer(s, a) {
  switch (a.type) {
    case "INIT": return { ...s, ready: true, data: a.data, session: a.session };
    case "LOGIN": return { ...s, session: a.session, nav: { view: "dashboard", params: {} } };
    case "SESSION": return { ...s, session: { ...s.session, ...a.patch } };
    case "LOGOUT": return { ...s, session: null };
    case "NAV": return { ...s, nav: { view: a.view, params: a.params || {} } };
    case "DATA": return { ...s, data: a.fn(s.data) };
    case "REPLACE": return { ...s, data: a.data };
    default: return s;
  }
}

export function AppProvider({ children }) {
  const [s, d] = useReducer(reducer, { ready: false, data: null, session: null, nav: { view: "dashboard", params: {} } });
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    let data = null, session = null;
    try {
      const raw = localStorage.getItem(KEY); if (raw) data = JSON.parse(raw);
      const se = sessionStorage.getItem(SKEY); if (se) session = JSON.parse(se);
    } catch (e) {}
    if (!data || !Array.isArray(data.rumah)) data = buildSeed();
    d({ type: "INIT", data, session });
  }, []);
  useEffect(() => {
    if (!s.ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(s.data)); } catch (e) {}
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
    data: s.data, session: s.session, role: s.session ? s.session.role : null, ready: s.ready, nav: s.nav, toasts, toast,
    login: (session) => d({ type: "LOGIN", session }),
    logout: () => d({ type: "LOGOUT" }),
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
