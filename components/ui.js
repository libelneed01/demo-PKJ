const TONE={Baru:'bg-red-100 text-red-700',Diproses:'bg-yellow-100 text-yellow-800',Selesai:'bg-emerald-100 text-emerald-700',Merah:'bg-red-100 text-red-700',Hijau:'bg-emerald-100 text-emerald-700',Kuning:'bg-yellow-100 text-yellow-800'};
export const rp=n=>'Rp '+n.toLocaleString('id-ID');
export const Badge=({s})=><span className={`px-2 py-0.5 rounded-full text-xs ${TONE[s]||'bg-slate-100 text-slate-700'}`}>{s}</span>;
export const Card=({children,className=''})=><div className={`bg-white rounded-2xl border border-slate-100 shadow-[0_1px_8px_rgba(30,47,63,0.05)] p-4 ${className}`}>{children}</div>;
export const In=({l,v,on,...p})=><label className="block text-sm mb-2">{l}<input className="w-full border rounded-lg p-2 mt-1" value={v} onChange={e=>on(e.target.value)} {...p}/></label>;
export const Sel=({l,v,on,o})=><label className="block text-sm mb-2">{l}<select className="w-full border rounded-lg p-2 mt-1 bg-white" value={v||''} onChange={e=>on(e.target.value)}><option value="">- pilih -</option>{o.map(x=><option key={x}>{x}</option>)}</select></label>;
const BM={'bg-yellow-600':'bg-amber-100 !text-amber-800 hover:bg-amber-200','bg-red-600':'bg-rose-100 !text-rose-700 hover:bg-rose-200','bg-slate-400':'bg-slate-100 !text-slate-600 hover:bg-slate-200'};
export const Btn=({c,className='',...p})=><button {...p} className={`${BM[c]||'bg-[#1E2F3F] hover:bg-[#2c4358]'} text-white rounded-lg px-4 py-2 text-sm disabled:opacity-40 ${className}`}/>;
export const Empty=()=><p className="text-sm text-slate-500 py-6 text-center">Belum ada data.</p>;
