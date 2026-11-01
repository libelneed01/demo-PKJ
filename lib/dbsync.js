// Pembungkus Supabase untuk tabel app_records. Menerima klien `sb` supaya bisa diuji dengan klien palsu.
const TABLE = "app_records";
const chunk = (a, n) => { const o = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; };

export async function loadAll(sb) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from(TABLE).select("col,id,data,ord").order("col").order("ord").order("id").range(from, from + 999);
    if (error) throw error;
    out.push(...data);
    if (data.length < 1000) break;
  }
  return out;
}

export async function pushOps(sb, ops, opt = {}) {
  for (const c of chunk(ops.news, 400)) {
    const { error } = await sb.from(TABLE).upsert(c.map(({ col, id, data, ord }) => ({ col, id, data, ord })), { onConflict: "col,id", ignoreDuplicates: !!opt.ignoreDuplicates });
    if (error) throw error;
  }
  for (const c of chunk(ops.changes, 400)) {
    const { error } = await sb.from(TABLE).upsert(c.map(({ col, id, data }) => ({ col, id, data })), { onConflict: "col,id" });
    if (error) throw error;
  }
  const byCol = {};
  ops.dels.forEach((d) => { (byCol[d.col] = byCol[d.col] || []).push(d.id); });
  for (const col of Object.keys(byCol)) {
    for (const ids of chunk(byCol[col], 100)) {
      const { error } = await sb.from(TABLE).delete().eq("col", col).in("id", ids);
      if (error) throw error;
    }
  }
}
