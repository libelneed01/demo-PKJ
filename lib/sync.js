// Logika sinkronisasi murni (tanpa React / Supabase) agar mudah diuji.
// Data aplikasi = objek berisi koleksi (array baris ber-id) dan nilai tunggal (mis. waConfig, kasAwal).
// Di database semuanya disimpan di satu tabel app_records (col, id, data jsonb, ord).
export const SINGLE = "_single";

const memo = new WeakMap();
// stringify kanonik (kunci diurutkan) supaya perbandingan tidak terpengaruh urutan kunci jsonb
export function canon(v) {
  if (v === null || typeof v !== "object") { const j = JSON.stringify(v); return j === undefined ? "null" : j; }
  const hit = memo.get(v);
  if (hit !== undefined) return hit;
  const out = Array.isArray(v)
    ? "[" + v.map(canon).join(",") + "]"
    : "{" + Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}";
  memo.set(v, out);
  return out;
}

export function flatten(data) {
  const out = new Map();
  Object.keys(data).forEach((k) => {
    const v = data[k];
    if (Array.isArray(v)) v.forEach((row, i) => { const id = String(row && row.id !== undefined ? row.id : `${k}~${i}`); out.set(k + "|" + id, { col: k, id, data: row, idx: i }); });
    else if (v !== undefined) out.set(SINGLE + "|" + k, { col: SINGLE, id: k, data: { v }, idx: 0, single: true });
  });
  return out;
}

export function cacheFromData(data) {
  const m = new Map();
  flatten(data).forEach((r, key) => m.set(key, canon(r.data)));
  return m;
}

// Bandingkan state lokal dengan cache (keadaan terakhir yang diketahui di server)
export function diffData(cache, data) {
  const flat = flatten(data);
  const news = [], changes = [], dels = [];
  const seeding = cache.size === 0;
  const now = Date.now();
  let neg = 0, pos = 0;
  flat.forEach((r, key) => {
    const c = canon(r.data);
    const prev = cache.get(key);
    if (prev === c) return;
    if (prev === undefined) {
      const ord = r.single ? 0 : seeding ? r.idx : r.idx === 0 ? -(now + neg++) : now + pos++;
      news.push({ col: r.col, id: r.id, data: r.data, ord, canon: c });
    } else changes.push({ col: r.col, id: r.id, data: r.data, canon: c });
  });
  cache.forEach((prev, key) => {
    if (!flat.has(key)) { const i = key.indexOf("|"); dels.push({ col: key.slice(0, i), id: key.slice(i + 1), prev }); }
  });
  return { news, changes, dels };
}

export const emptyOps = (o) => !o.news.length && !o.changes.length && !o.dels.length;

// rows harus sudah terurut (col, ord, id)
export function rowsToData(rows) {
  const data = {};
  rows.forEach((r) => {
    if (r.col === SINGLE) data[r.id] = r.data ? r.data.v : undefined;
    else (data[r.col] = data[r.col] || []).push(r.data);
  });
  return data;
}

// Terapkan perubahan dari pengguna lain
export function applyRemote(data, ev) {
  if (ev.type === "DELETE") {
    if (ev.col === SINGLE) return data;
    const arr = data[ev.col];
    return Array.isArray(arr) ? { ...data, [ev.col]: arr.filter((r) => String(r.id) !== ev.id) } : data;
  }
  if (ev.col === SINGLE) return { ...data, [ev.id]: ev.data ? ev.data.v : undefined };
  const arr = Array.isArray(data[ev.col]) ? data[ev.col] : [];
  const i = arr.findIndex((r) => String(r.id) === ev.id);
  if (i >= 0) return { ...data, [ev.col]: arr.map((r, k) => (k === i ? ev.data : r)) };
  return { ...data, [ev.col]: ev.ord < 0 ? [ev.data, ...arr] : [...arr, ev.data] };
}
