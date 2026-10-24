export const KONDISI = ["Baik", "Rusak Ringan", "Rusak Berat"];
export const rank = (k) => KONDISI.indexOf(k);
export const SHIFT_TONE = { Bertugas: "navy", "Menunggu Approval": "yellow", Disetujui: "green", "Disetujui dengan catatan": "yellow", Ditolak: "red" };
export const KONDISI_TONE = { Baik: "green", "Rusak Ringan": "yellow", "Rusak Berat": "red" };

export const CATATAN = {
  security: [
    { k: "kejadian", l: "Kejadian penting selama shift" }, { k: "rawan", l: "Area rawan yang perlu diawasi" },
    { k: "tamu", l: "Tamu yang belum keluar" }, { k: "kendaraan", l: "Kendaraan mencurigakan / catatan parkir" },
    { k: "instruksi", l: "Instruksi untuk group berikutnya" },
  ],
  kebersihan: [
    { k: "dibersihkan", l: "Area yang sudah dibersihkan" }, { k: "belum", l: "Area yang belum selesai" },
    { k: "titik", l: "Titik sampah bermasalah" }, { k: "kerusakan", l: "Kerusakan fasilitas yang ditemukan" },
    { k: "instruksi", l: "Instruksi untuk petugas berikutnya" },
  ],
};

// bandingkan aset yang dibawa dengan yang dikembalikan
export function diffReturn(items, returns) {
  const masalah = [];
  items.forEach((i) => {
    const r = returns[i.id];
    if (!r || !r.kembali) masalah.push({ nama: i.nama, jenis: "kurang", sev: i.wajib ? "red" : "yellow", teks: `${i.nama} tidak dikembalikan` });
    else if (rank(r.kondisi) > rank(i.kondisi)) masalah.push({ nama: i.nama, jenis: "rusak", sev: r.kondisi === "Rusak Berat" ? "red" : "yellow", teks: `${i.nama} ${r.kondisi.toLowerCase()}` });
  });
  return masalah;
}

export const catatanLengkap = (kind, c) => !!c && CATATAN[kind].every((f) => String(c[f.k] || "").trim().length >= 2);
export const adaKurang = (s) => (s.returns || []).some((r) => !r.kembali);

export function shiftStats(data) {
  const out = {};
  [["security", data.shiftSecurity || []], ["kebersihan", data.shiftKebersihan || []]].forEach(([k, list]) => {
    const week = Date.now() - 7 * 86400000;
    out[k] = {
      bertugas: list.filter((s) => s.status === "Bertugas").length,
      menunggu: list.filter((s) => s.status === "Menunggu Approval").length,
      bermasalah: list.filter((s) => (s.status === "Menunggu Approval" || s.status === "Ditolak") && s.masalah.length).length,
      ditolak: list.filter((s) => s.status === "Ditolak").length,
      bersih7: list.filter((s) => s.status === "Disetujui" && new Date(s.mulai).getTime() >= week).length,
      rusakAktif: list.filter((s) => s.status === "Bertugas" && s.items.some((i) => i.kondisi !== "Baik")).length,
    };
  });
  return out;
}
