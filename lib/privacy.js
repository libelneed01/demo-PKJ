import { rtKeyOf } from "./config";

// Tingkat kerahasiaan pengaduan
export const SIFAT_OPTS = [
  { value: "Umum", label: "Umum - boleh dilihat semua warga, nama disamarkan" },
  { value: "Pengurus", label: "Pribadi - hanya pengurus terkait" },
  { value: "Rahasia", label: "Rahasia - hanya Pengurus RT dan RW" },
];
export const SIFAT_TONE = { Umum: "gray", Pengurus: "navy", Rahasia: "yellow" };
export const SIFAT_LABEL = { Umum: "Umum", Pengurus: "Pribadi", Rahasia: "Rahasia" };
// kategori yang boleh dibaca seksi untuk pengaduan tingkat "Pengurus"
const SEKSI = { keamanan: ["Keamanan", "Kebisingan"], kebersihan: ["Kebersihan", "Fasilitas"] };

// Milik sendiri: dicocokkan lewat akun (uid) bila ada; data lama tanpa uid dicocokkan lewat rumah
export const isOwn = (r, session) => !!session && (r._uid ? !!session.uid && r._uid === session.uid : !!session.houseId && r.rumah === session.houseId);
const sameRT = (r, ctx) => {
  const h = (ctx.data.rumah || []).find((x) => x.id === r.rumah);
  return !h || rtKeyOf(h) === ((ctx.session && ctx.session.rt) || "29-01");
};

export function canSeePengaduan(r, ctx) {
  const s = r.sifat || "Pengurus";   // data lama tanpa sifat dianggap pribadi (aman)
  const { role, session } = ctx;
  if (role === "pengelola" || role === "rw") return true;
  if (s === "Umum") return true;
  if (role === "warga") return isOwn(r, session);
  if (role === "rt") return sameRT(r, ctx);
  if (SEKSI[role]) return s === "Pengurus" && SEKSI[role].includes(r.kategori);
  return false;
}

// Samarkan identitas bila penampil bukan pelapor, RW, atau RT wilayahnya
export function maskPengaduan(r, ctx) {
  const { role, session } = ctx;
  if (role === "pengelola" || role === "rw") return r;
  if (role === "warga" && isOwn(r, session)) return r;
  if (role === "rt" && sameRT(r, ctx)) return r;
  const blok = r.rumah ? "Blok " + String(r.rumah).split("-")[0] : "-";
  return { ...r, pelapor: "Warga (disamarkan)", rumah: SEKSI[role] && (r.sifat || "Pengurus") !== "Umum" ? blok : "-", terlapor: "" };
}
