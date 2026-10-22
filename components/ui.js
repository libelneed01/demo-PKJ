const TONE={Baru:'bg-red-100 text-red-700',Diproses:'bg-yellow-100 text-yellow-800',Selesai:'bg-emerald-100 text-emerald-700',Merah:'bg-red-100 text-red-700',Hijau:'bg-emerald-100 text-emerald-700',Kuning:'bg-yellow-100 text-yellow-800'};
export const rp=n=>'Rp '+n.toLocaleString('id-ID');
export const Badge=({s})=><span className={`px-2 py-0.5 rounded-full text-xs ${TONE[s]||'bg-slate-100 text-slate-700'}`}>{s}</span>;
export const Card=({children,className=''})=><div className={`bg-white rounded-2xl shadow-sm p-4 ${className}`}>{children}</div>;
export const In=({l,v,on,...p})=><label className="block text-sm mb-2">{l}<input className="w-full border rounded-lg p-2 mt-1" value={v} onChange={e=>on(e.target.value)} {...p}/></label>;
export const Sel=({l,v,on,o})=><label className="block text-sm mb-2">{l}<select className="w-full border rounded-lg p-2 mt-1 bg-white" value={v||''} onChange={e=>on(e.target.value)}><option value="">- pilih -</option>{o.map(x=><option key={x}>{x}</option>)}</select></label>;
export const Btn=({c='bg-emerald-600',...p})=><button {...p} className={`${c} text-white rounded-lg px-4 py-2 text-sm disabled:opacity-40`}/>;
export const Empty=()=><p className="text-sm text-slate-500 py-6 text-center">Belum ada data.</p>;
