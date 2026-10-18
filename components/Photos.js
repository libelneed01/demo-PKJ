const Frame = ({ children, label }) => <svg viewBox="0 0 320 200" className="w-full rounded-xl ring-1 ring-slate-200" role="img" aria-label={label}>{children}</svg>;

export function Ktp({ nama, nik }) {
  return (
    <Frame label={`Foto KTP ${nama}`}>
      <rect width="320" height="200" fill="#DCEBFA" />
      <rect y="0" width="320" height="34" fill="#4A7FC1" />
      <text x="160" y="15" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">PROVINSI JAWA TIMUR</text>
      <text x="160" y="28" textAnchor="middle" fontSize="9" fill="#fff">KABUPATEN SIDOARJO</text>
      <text x="14" y="58" fontSize="9" fill="#334155">NIK</text><text x="50" y="58" fontSize="12" fontWeight="700" fill="#0B2545">{nik}</text>
      <text x="14" y="82" fontSize="9" fill="#334155">Nama</text><text x="50" y="82" fontSize="11" fontWeight="700" fill="#0B2545">{nama.toUpperCase()}</text>
      <text x="14" y="104" fontSize="9" fill="#334155">Alamat</text><text x="50" y="104" fontSize="10" fill="#0B2545">PESONA KHAYANGAN JUANDA</text>
      <text x="14" y="124" fontSize="9" fill="#334155">Agama</text><text x="50" y="124" fontSize="10" fill="#0B2545">ISLAM</text>
      <rect x="226" y="48" width="80" height="104" rx="4" fill="#B6D2EE" /><circle cx="266" cy="88" r="20" fill="#7B9CC0" /><path d="M232 152 q34 -50 68 0z" fill="#7B9CC0" />
      <text x="14" y="188" fontSize="7" fill="#64748B">Dokumen contoh untuk demo</text>
    </Frame>
  );
}

export function Kendaraan({ jenis, plat }) {
  const online = jenis.includes("Online"), body = online ? "#2FA37A" : jenis.startsWith("Mobil") ? "#0B2545" : "#4A7FC1";
  const car = jenis.startsWith("Mobil") || jenis.startsWith("Taxi");
  return (
    <Frame label={`Foto ${jenis} ${plat}`}>
      <rect width="320" height="200" fill="#EAF1F8" /><rect y="150" width="320" height="50" fill="#CBD5E1" />
      {car ? (
        <g>
          <path d="M36 140 L56 100 Q66 84 92 84 H212 Q238 84 254 104 L284 128 Q294 134 294 144 V152 H36Z" fill={body} />
          <path d="M72 100 L88 92 H138 V122 H62Z M148 92 H210 Q224 92 236 106 L246 122 H148Z" fill="#DCEBFA" />
          <circle cx="90" cy="152" r="22" fill="#1E293B" /><circle cx="90" cy="152" r="9" fill="#94A3B8" />
          <circle cx="240" cy="152" r="22" fill="#1E293B" /><circle cx="240" cy="152" r="9" fill="#94A3B8" />
        </g>
      ) : (
        <g>
          <circle cx="88" cy="146" r="28" fill="none" stroke="#1E293B" strokeWidth="9" /><circle cx="240" cy="146" r="28" fill="none" stroke="#1E293B" strokeWidth="9" />
          <path d="M88 146 L130 100 H190 L240 146 M190 100 L204 70 H228 M120 100 H180 L196 118 H130Z" fill="none" stroke={body} strokeWidth="9" strokeLinejoin="round" />
          <rect x="112" y="86" width="64" height="14" rx="6" fill="#1E293B" />
        </g>
      )}
      <rect x="120" y="170" width="80" height="20" rx="4" fill="#fff" stroke="#334155" /><text x="160" y="185" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0B2545">{plat}</text>
    </Frame>
  );
}
