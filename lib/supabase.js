import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const DB_ENABLED = Boolean(url && key);

let client = null;
export function getSupabase() {
  if (!DB_ENABLED) return null;
  if (!client) client = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true }, realtime: { params: { eventsPerSecond: 20 } } });
  return client;
}
