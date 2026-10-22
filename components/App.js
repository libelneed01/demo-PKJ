'use client';
import {useState} from 'react';
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,PieChart,Pie,Cell,Legend} from 'recharts';
import {seed,GROUPS,ASSETS,NOTES} from '../lib/seed';
import {rp,Badge,Card,In,Sel,Btn,Empty} from './ui';
import {Warga,Absensi,Parkir,Keu} from './Modul';
import Login from './Login';
import KPI from './KPI';

const SEC='Asset & Serah Terima Security',KEB='Asset & Serah Terima Kebersihan';
const NAV={
 'Pengurus RW':['Dashboard','Dashboard KPI','Warga & Rumah','Tamu','Keuangan','Pengumuman','Pengaduan','Izin','Kerusakan','Sampah','AI Analisis','Export','Kontak'],
 'Pengurus Keamanan':['Dashboard','Dashboard KPI','Tamu','Absensi Security',SEC,'Parkir','Pengaduan','Izin','Pengumuman','Kontak'],
 'Pengurus Kebersihan':['Dashboard','Dashboard KPI','Absensi Kebersihan',KEB,'Sampah','Kerusakan','Pengaduan','Kontak'],
 'Bendahara':['Dashboard','Dashboard KPI','Keuangan','Export','Kontak'],
 'Warga':['Dashboard Warga','IPL Saya','Buat Pengaduan','Ajukan Izin','Lapor Sampah','Lapor Kerusakan','Pengumuman','Kontak']};
const KEY={'Pengaduan':'pengaduan','Buat Pengaduan':'pengaduan','Sampah':'sampah','Lapor Sampah':'sampah','Kerusakan':'kerusakan','Lapor Kerusakan':'kerusakan'};
const open=l=>l.filter(x=>x.status!=='Selesai').length;

export default function App(){
 const [db,setDb]=useState(seed);const [role,setRole]=useState(null);const [page,setPage]=useState('');
 const [toast,setToast]=useState('');const [menu,setMenu]=useState(false);const [gear,setGear]=useState(false);const [panel,setPanel]=useState(false);
 const say=m=>{setToast(m);setTimeout(()=>setToast(''),2200)};
 const up=(k,fn)=>setDb(d=>({...d,[k]:fn(d[k])}));
 const ctx={db,up,say,go:setPage,setDb};
 const Logo=()=><img src="/logo.png" alt="Pesona Khayangan Juanda" className="h-14 w-auto"/>;
 let body;
 if(panel) body=<div className="max-w-2xl mx-auto p-4"><div className="flex justify-between mb-4"><h1 className="text-lg font-semibold">Panel Pengelola Data Demo</h1><button className="text-sm underline" onClick={()=>setPanel(false)}>Kembali</button></div><Panel ctx={ctx}/></div>; 
 else if(!role) body=<Login roles={Object.keys(NAV)} onLogin={r=>{setRole(r);setPage(NAV[r][0])}}/>;
 else body=<div className="flex flex-1">
  <aside className={`${menu?'block':'hidden'} md:block fixed md:static inset-y-0 left-0 z-20 w-64 bg-white/95 text-slate-700 border-r border-slate-200 p-3 overflow-y-auto`}>
   <div className="p-2 mb-4 border-b border-slate-100 pb-4"><Logo/></div>
   <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-2 px-2">{role}</p>
   {NAV[role].map(n=><button key={n} onClick={()=>{setPage(n);setMenu(false)}} className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${page===n?'bg-emerald-50 text-emerald-900 font-medium':'hover:bg-slate-50'}`}>{n}</button>)}
   <button onClick={()=>{setRole(null);setMenu(false)}} className="block w-full text-left px-3 py-2 mt-4 text-sm text-slate-400">Keluar</button>
  </aside>
  <main className="flex-1 p-4 max-w-5xl w-full mx-auto"><div className="md:hidden flex items-center justify-between mb-3"><button className="bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-1 text-sm" onClick={()=>setMenu(!menu)}>☰ Menu</button><img src="/logo.png" alt="" className="h-10 w-auto"/></div>
   <h1 className="text-xl font-semibold mb-4">{page}</h1><Page page={page} role={role} ctx={ctx}/></main></div>;
 return <div className="min-h-screen flex flex-col">{body}
  <footer className="text-center text-xs text-slate-500 py-4">Prototype Demo dibuat oleh : A0/3 - dibuat karena iseng <button aria-label="opsi" onClick={()=>setGear(true)} className="opacity-30 text-[10px] ml-1">⚙</button></footer>
  {gear&&<Gate close={()=>setGear(false)} ok={()=>{setGear(false);setPanel(true)}}/>}
  {toast&&<div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1E2F3F] text-white px-4 py-2 rounded-full text-sm shadow-lg z-50">{toast}</div>}</div>;
}

function Gate({close,ok}){const [u,setU]=useState('');const [p,setP]=useState('');const [e,setE]=useState(false);
 return <div className="fixed inset-0 bg-black/40 grid place-items-center z-40"><Card className="w-80"><In l="User ID" v={u} on={setU}/><In l="Password" type="password" v={p} on={setP}/>{e&&<p className="text-red-600 text-sm mb-2">Kredensial salah</p>}
 <div className="flex gap-2"><Btn onClick={()=>u==='brobar'&&p==='110375'?ok():setE(true)}>Masuk</Btn><Btn c="bg-slate-400" onClick={close}>Batal</Btn></div></Card></div>}

function Panel({ctx}){const {db,setDb,say}=ctx;const mods=['tamu','pengaduan','kerusakan','sampah','izin','pengumuman','shifts','warga','absensi','kendaraan','pelanggaran','tunggakan','pengeluaran','bukti'];
 const del=k=>{if(confirm('Hapus data modul '+k+'?')){setDb(d=>({...d,[k]:[]}));say('Data dihapus')}};
 return <div className="grid gap-3"><Card>{mods.map(k=><div key={k} className="flex justify-between items-center py-1 text-sm"><span>{k}: {db[k].length} data</span><button className="text-red-600 underline" onClick={()=>del(k)}>Hapus</button></div>)}</Card>
 <div className="flex gap-2"><Btn c="bg-red-600" onClick={()=>{if(confirm('Hapus SEMUA data testing?')){setDb(d=>({...d,...Object.fromEntries(mods.map(k=>[k,[]]))}));say('Semua data testing dihapus')}}}>Hapus semua data testing</Btn>
 <Btn c="bg-[#0B1F3A]" onClick={()=>{if(confirm('Reset ke data dummy awal?')){setDb(seed());say('Data direset')}}}>Reset ke data awal</Btn></div></div>}

function Page({page,role,ctx}){
 if(page==='Dashboard'||page==='Dashboard Warga') return <Dash role={role} ctx={ctx}/>;
 if(page==='Dashboard KPI') return <KPI role={role} ctx={ctx}/>;
 if(page==='Tamu') return <Tamu ctx={ctx}/>;
 if(page==='Keuangan') return <Keu ctx={ctx} role={role}/>;
 if(page===SEC) return <Serah type="Security" ctx={ctx}/>;
 if(page===KEB) return <Serah type="Kebersihan" ctx={ctx}/>;
 if(page==='Pengumuman') return <Pengumuman ctx={ctx} warga={role==='Warga'}/>;
 if(page==='Izin'||page==='Ajukan Izin') return <Izin ctx={ctx}/>;
 if(KEY[page]) return <Generic k={KEY[page]} ctx={ctx} manage={role!=='Warga'}/>;
 if(page==='IPL Saya') return <Card><p>Rumah B7/21 - IPL bulan ini: <Badge s="Hijau"/> Lunas</p><Btn className="mt-3" onClick={()=>ctx.say('Pembayaran online (simulasi) berhasil')}>Bayar IPL bulan depan</Btn></Card>;
 if(page==='Kontak') return <div className="grid sm:grid-cols-2 gap-3">{[['Koordinator Keamanan - Bang Jago','0812-3456-7890'],['Ketua RW','0811-1111-2222'],['Pos Security','0813-4444-5555'],['Ambulans','118']].map(([n,t])=><Card key={n}><p className="font-medium">{n}</p><p className="text-slate-600">{t}</p></Card>)}</div>;
 if(page==='AI Analisis') return <AI ctx={ctx}/>;
 if(page==='Export') return <Exp ctx={ctx}/>;
 if(page==='Warga & Rumah') return <Warga ctx={ctx}/>;
 if(page==='Absensi Security') return <Absensi type="Security" ctx={ctx}/>;
 if(page==='Absensi Kebersihan') return <Absensi type="Kebersihan" ctx={ctx}/>;
 if(page==='Parkir') return <Parkir ctx={ctx}/>;
 return <Card><p className="text-sm text-slate-600">Modul "{page}" belum dimuat di versi inti ini.</p></Card>;
}

function Dash({role,ctx}){const {db,go}=ctx;const [dr,setDr]=useState(null);
 const L=x=>x.map(y=>`${y.judul} - ${y.detail} (${y.status})`);const bl=x=>x.filter(y=>y.status!=='Selesai');
 const dl=l=>{
  if(/^Warga /.test(l))return db.warga.filter(w=>w.status===l.slice(6)).map(w=>`${w.nama} · ${w.blok}`);
  if(/rumah saya/.test(l))return ['Rumah B7/21: IPL bulan ini Lunas'];
  if(/^Tamu/.test(l))return db.tamu.filter(t=>!t.keluar||l==='Tamu hari ini').map(t=>`${t.nama} · ${t.plat} · ${t.jenis} · masuk ${t.masuk}${t.keluar?' · keluar '+t.keluar:''} · tujuan ${t.tujuan}`);
  if(/^Pengaduan/.test(l))return L(bl(db.pengaduan));
  if(/^Kerusakan/.test(l))return L(bl(db.kerusakan));
  if(/^Sampah/.test(l))return L(bl(db.sampah));
  if(/^Izin/.test(l))return db.izin.filter(i=>i.stage<3&&!i.ditolak).map(i=>`${i.judul} (${i.jenis}) - menunggu ${ST[i.stage]}`);
  if(/^Pengumuman/.test(l))return db.pengumuman.map(p=>`${p.judul}: ${p.isi}`);
  if(/Asset/.test(l))return db.shifts.filter(s=>s.bad&&s.status!=='Selesai').map(s=>`${s.type} ${s.group}: ${s.ket||'asset bermasalah'}`);
  if(/Serah terima/.test(l))return db.shifts.filter(s=>s.status==='Menunggu Approval').map(s=>`${s.type} ${s.group} - ${s.ket||'catatan lengkap, menunggu approval'}`);
  if(/hadir|Hadir/.test(l)){const t=/Kebersihan|RW/.test(l)?'Kebersihan':'Security';const r=(l.match(/RW \d+/)||[])[0];return db.absensi.filter(a=>a.type===t&&(!r||a.rw===r)).map(a=>`${a.group}${a.rw?' · '+a.rw:''} · masuk ${a.masuk}${a.telat?' (TERLAMBAT)':''}${a.keluar?' · keluar '+a.keluar:' · bertugas'}`)}
  if(/parkir/.test(l))return bl(db.pelanggaran).map(x=>`${x.plat} - ${x.jenis} (${x.waktu}) ${x.catatan}`);
  if(/^IPL (Lunas|Terlambat)/.test(l))return ['Jumlah: '+(l.includes('Lunas')?db.ipl.lunas:db.ipl.telat)+' rumah dari 600'];
  if(/IPL|Tunggakan/.test(l))return [...db.tunggakan.slice(0,10).map(x=>`${x.blok} · ${x.pemilik} · ${x.rw} · ${x.bulan} bulan`),'... dan '+Math.max(0,db.tunggakan.length-10)+' rumah lainnya'];
  return ['Saldo kas: '+rp(db.kas.saldo),'Total pemasukan: '+rp(db.kas.masuk),'Total pengeluaran: '+rp(db.kas.keluar),'Batas minimum: Rp 15.000.000',...db.pengeluaran.map(x=>`${x.tgl} · ${x.ket} · ${rp(x.jml)}`)]};
 const sh=t=>db.shifts.filter(s=>s.type===t);const hd=(t,r)=>db.absensi.filter(x=>x.type===t&&!x.keluar&&(!r||x.rw===r)).length;const tl=db.absensi.filter(x=>x.type==='Security'&&x.telat).length;
 const m={tamu:db.tamu.filter(t=>!t.keluar).length,adu:open(db.pengaduan),rus:open(db.kerusakan),sam:open(db.sampah),izin:db.izin.filter(i=>i.stage<3&&!i.ditolak).length,
  pS:sh('Security').filter(s=>s.status==='Menunggu Approval').length,bS:sh('Security').filter(s=>s.bad&&s.status!=='Selesai').length,
  pK:sh('Kebersihan').filter(s=>s.status==='Menunggu Approval').length,bK:sh('Kebersihan').filter(s=>s.bad&&s.status!=='Selesai').length};
 const S={'Pengurus RW':[['Tamu di dalam',m.tamu,'Tamu'],['Pengaduan belum selesai',m.adu,'Pengaduan'],['Kerusakan belum selesai',m.rus,'Kerusakan'],['Sampah belum selesai',m.sam,'Sampah'],['Izin menunggu',m.izin,'Izin'],['Security hadir',hd('Security'),'Absensi Security'],['Kebersihan hadir',hd('Kebersihan'),'Absensi Kebersihan'],['Asset bermasalah',m.bS+m.bK,SEC],['Serah terima belum di-approve',m.pS+m.pK,SEC],['IPL menunggak',db.ipl.tunggak,'Keuangan'],['Saldo kas',rp(db.kas.saldo),'Keuangan']],
 'Pengurus Keamanan':[['Tamu di dalam',m.tamu,'Tamu'],['Asset belum lengkap',m.bS,SEC],['Serah terima menunggu approval',m.pS,SEC],['Security hadir / terlambat',hd('Security')+' / '+tl,'Absensi Security'],['Pelanggaran parkir',open(db.pelanggaran),'Parkir'],['Izin menunggu review',m.izin,'Izin'],['Pengaduan',m.adu,'Pengaduan']],
 'Pengurus Kebersihan':[['Hadir RW 29',hd('Kebersihan','RW 29'),'Absensi Kebersihan'],['Hadir RW 31',hd('Kebersihan','RW 31'),'Absensi Kebersihan'],['Asset bermasalah',m.bK,KEB],['Serah terima menunggu',m.pK,KEB],['Sampah belum selesai',m.sam,'Sampah'],['Kerusakan',m.rus,'Kerusakan']],
 'Bendahara':[['Saldo kas',rp(db.kas.saldo),'Keuangan'],['Tunggakan IPL',db.ipl.tunggak,'Keuangan'],['Pembayaran masuk',rp(db.kas.masuk),'Keuangan'],['Pengeluaran',rp(db.kas.keluar),'Keuangan']],
 'Warga':[['Status IPL rumah saya','Lunas','IPL Saya'],['Pengaduan saya',m.adu,'Buat Pengaduan'],['Izin saya',m.izin,'Ajukan Izin'],['Pengumuman terbaru',db.pengumuman.length,'Pengumuman']]}[role];
 const warn=(m.pS+m.pK+m.bS+m.bK)>0&&role!=='Warga'&&role!=='Bendahara';
 const pie=[{n:'Lunas',v:db.ipl.lunas,c:'#7aa595'},{n:'Terlambat',v:db.ipl.telat,c:'#d9b86a'},{n:'Menunggak',v:db.ipl.tunggak,c:'#c9776f'}];
 const bar=['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map((d,i)=>({d,v:[12,9,14,11,16,22,db.tamu.length+8][i]}));
 return <div className="grid gap-4">{dr&&<div className="fixed inset-0 bg-black/40 grid place-items-center z-40 p-4" onClick={()=>setDr(null)}><Card className="w-full max-w-md max-h-[80vh] overflow-y-auto text-sm"><div onClick={e=>e.stopPropagation()}><p className="font-semibold mb-2">{dr.l}</p>{dl(dr.l).length?dl(dr.l).map((x,i)=><p key={i} className="border-t py-1.5">{x}</p>):<Empty/>}<div className="flex gap-2 mt-3"><Btn onClick={()=>{go(dr.page);setDr(null)}}>Buka modul lengkap</Btn><Btn c="bg-slate-400" onClick={()=>setDr(null)}>Tutup</Btn></div></div></Card></div>}{warn&&<div className="bg-red-50 border border-red-300 text-red-700 rounded-xl p-3 text-sm">Peringatan: ada asset bermasalah / serah terima shift belum di-approve.</div>}
 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{S.map(([l,v,p])=><button key={l} onClick={()=>setDr({l,page:p})} className="bg-white rounded-2xl p-4 text-left shadow-sm hover:ring-1 ring-slate-300"><p className="text-2xl font-semibold text-slate-800">{v}</p><p className="text-xs text-slate-600">{l}</p></button>)}</div>
 {role==='Warga'&&<div className="flex flex-wrap gap-2">{['Buat Pengaduan','Ajukan Izin','Lapor Sampah','Lapor Kerusakan'].map(x=><Btn key={x} onClick={()=>go(x)}>{x}</Btn>)}</div>}
 {role!=='Warga'&&<div className="grid md:grid-cols-2 gap-3"><Card><p className="text-sm font-medium mb-2">Tamu minggu ini</p><div className="h-48"><ResponsiveContainer><BarChart data={bar}><XAxis dataKey="d"/><YAxis/><Tooltip/><Bar dataKey="v" fill="#7aa595" radius={4} cursor="pointer" onClick={()=>setDr({l:'Tamu hari ini',page:'Tamu'})}/></BarChart></ResponsiveContainer></div></Card>
 <Card><p className="text-sm font-medium mb-2">Status IPL</p><div className="h-48"><ResponsiveContainer><PieChart><Pie data={pie} dataKey="v" nameKey="n" outerRadius={65} cursor="pointer" onClick={d=>setDr({l:'IPL '+(d.n||d.payload?.n),page:'Keuangan'})}>{pie.map(x=><Cell key={x.n} fill={x.c}/>)}</Pie><Legend/><Tooltip/></PieChart></ResponsiveContainer></div></Card>{role==='Pengurus RW'&&<Card><p className="text-sm font-medium mb-2">Komposisi warga</p><div className="h-48"><ResponsiveContainer><PieChart><Pie data={['Tinggal','Ngontrak','Ditinggal'].map((n,i)=>({n,v:db.warga.filter(w=>w.status===n).length,c:['#7aa595','#d9b86a','#c9776f'][i]}))} dataKey="v" nameKey="n" outerRadius={65} cursor="pointer" onClick={d=>setDr({l:'Warga '+(d.n||d.payload?.n),page:'Warga & Rumah'})}>{['#7aa595','#d9b86a','#c9776f'].map(c=><Cell key={c} fill={c}/>)}</Pie><Legend/><Tooltip/></PieChart></ResponsiveContainer></div></Card>}</div>}</div>}

function Tamu({ctx}){const {db,up,say}=ctx;const e={nama:'',plat:'',jenis:'Mobil pribadi',tujuan:'',catatan:''};const [f,setF]=useState(e);const [q,setQ]=useState('');const [d,setD]=useState(null);const s=k=>v=>setF({...f,[k]:v});
 const save=()=>{if(!f.nama||!f.plat||!f.tujuan)return say('Nama, plat, dan tujuan wajib diisi');up('tamu',l=>[{...f,id:Date.now(),masuk:new Date().toTimeString().slice(0,5),keluar:null},...l]);setF(e);say('Tamu tersimpan')};
 const list=db.tamu.filter(t=>(t.nama+t.plat).toLowerCase().includes(q.toLowerCase()));
 return <div className="grid md:grid-cols-2 gap-4"><Card><In l="Nama" v={f.nama} on={s('nama')}/><In l="Plat" v={f.plat} on={s('plat')}/><Sel l="Jenis" v={f.jenis} on={s('jenis')} o={['Mobil pribadi','Motor pribadi','Taxi online','Ojek online']}/><In l="Tujuan" v={f.tujuan} on={s('tujuan')}/><In l="Catatan" v={f.catatan} on={s('catatan')}/>
 <p className="text-xs text-slate-500 mb-2">Foto KTP & kendaraan: placeholder. Jam masuk otomatis.</p><Btn onClick={save}>Simpan</Btn></Card>
 <Card><In l="Cari" v={q} on={setQ}/>{list.length?list.map(t=><div key={t.id} className="border-t py-2 text-sm flex justify-between items-center"><button className="text-left" onClick={()=>setD(t)}>{t.nama} · {t.plat}<br/><span className="text-xs text-slate-500">{t.masuk}{t.keluar?' - '+t.keluar:''}</span></button>
 {t.keluar?<Badge s="Selesai"/>:<Btn c="bg-yellow-600" onClick={()=>{up('tamu',l=>l.map(x=>x.id===t.id?{...x,keluar:new Date().toTimeString().slice(0,5)}:x));say('Tamu keluar dicatat')}}>Keluar</Btn>}</div>):<Empty/>}</Card>
 {d&&<div className="fixed inset-0 bg-black/40 grid place-items-center z-40" onClick={()=>setD(null)}><Card className="w-80 text-sm"><p className="font-semibold mb-2">{d.nama}</p><p>Plat: {d.plat}</p><p>Jenis: {d.jenis}</p><p>Tujuan: {d.tujuan}</p><p>Masuk: {d.masuk} / Keluar: {d.keluar||'-'}</p><p>Catatan: {d.catatan||'-'}</p></Card></div>}</div>}

function Generic({k,ctx,manage}){const {db,up,say}=ctx;const [f,setF]=useState({judul:'',detail:''});const [q,setQ]=useState('');const [c,setC]=useState('');const [tg,setTg]=useState('');const [dm,setDm]=useState(null);
 const add=()=>{if(!f.judul)return say('Judul wajib diisi');if(k==='kerusakan'&&!tg)return say('Pilih tingkat kerusakan');up(k,l=>[{id:Date.now(),...f,detail:f.detail+(k==='kerusakan'?' · Tingkat: '+tg+' · foto: placeholder':''),status:'Baru',catatan:''},...l]);setF({judul:'',detail:''});setTg('');say('Laporan terkirim')};
 const set=(id,status)=>{up(k,l=>l.map(x=>x.id===id?{...x,status,catatan:c||x.catatan}:x));setC('');say('Status diperbarui')};
 const list=db[k].filter(x=>x.judul.toLowerCase().includes(q.toLowerCase()));
 return <div className="grid md:grid-cols-2 gap-4"><Card><In l="Judul" v={f.judul} on={v=>setF({...f,judul:v})}/><In l="Detail / lokasi" v={f.detail} on={v=>setF({...f,detail:v})}/>{k==='kerusakan'&&<Sel l="Tingkat kerusakan" v={tg} on={setTg} o={['Ringan','Sedang','Berat']}/>}{k==='sampah'&&<p className="text-xs text-slate-500 mb-2">Jadwal angkut rutin: Senin &amp; Kamis, 06.00.</p>}<Btn onClick={add}>Kirim</Btn></Card>
 <Card><In l="Cari" v={q} on={setQ}/>{list.length?list.map(x=><div key={x.id} className="border-t py-2 text-sm"><div className="flex justify-between"><button className="font-semibold text-left" onClick={()=>setDm(x)}>{x.judul}</button><Badge s={x.status}/></div><p className="text-slate-600">{x.detail}</p>{x.catatan&&<p className="text-xs">Progres: {x.catatan}</p>}
 {manage&&x.status!=='Selesai'&&<div className="mt-1 flex gap-2"><input className="border rounded p-1 flex-1 text-xs" placeholder="Catatan progres" value={c} onChange={e=>setC(e.target.value)}/><Btn c="bg-yellow-600" onClick={()=>set(x.id,'Diproses')}>Proses</Btn><Btn onClick={()=>set(x.id,'Selesai')}>Selesai</Btn></div>}</div>):<Empty/>}</Card>{dm&&<div className="fixed inset-0 bg-black/40 grid place-items-center z-40" onClick={()=>setDm(null)}><Card className="w-80 text-sm"><p className="font-semibold">{dm.judul}</p><p className="my-1"><Badge s={dm.status}/></p><p>{dm.detail||'-'}</p><p className="text-xs mt-2">Catatan progres: {dm.catatan||'Belum ada catatan'}</p></Card></div>}</div>}

const ST=['RT','RW','Keamanan','Selesai'];
function Izin({ctx}){const {db,up,say}=ctx;const [f,setF]=useState({judul:'',jenis:'Renovasi'});const [c,setC]=useState('');
 const act=(id,ok)=>{up('izin',l=>l.map(x=>x.id===id?{...x,stage:ok?x.stage+1:x.stage,ditolak:!ok,log:[...x.log,`${ST[x.stage]}: ${ok?'setuju':'tolak'}${c?' - '+c:''}`]}:x));setC('');say(ok?'Disetujui':'Ditolak')};
 return <div className="grid md:grid-cols-2 gap-4"><Card><In l="Judul" v={f.judul} on={v=>setF({...f,judul:v})}/><Sel l="Jenis" v={f.jenis} on={v=>setF({...f,jenis:v})} o={['Renovasi','Ulang tahun','Pengajian','Arisan','Lainnya']}/>
 <Btn onClick={()=>{if(!f.judul)return say('Judul wajib diisi');up('izin',l=>[{id:Date.now(),...f,stage:0,ditolak:false,log:[]},...l]);setF({judul:'',jenis:'Renovasi'});say('Izin diajukan')}}>Ajukan</Btn></Card>
 <Card>{db.izin.length?db.izin.map(x=><div key={x.id} className="border-t py-2 text-sm"><b>{x.judul}</b> <Badge s={x.ditolak?'Merah':x.stage===3?'Hijau':'Kuning'}/> <span className="text-xs">{x.ditolak?'Ditolak':x.stage===3?'Selesai':'Menunggu '+ST[x.stage]}</span>
 {x.log.map((l,i)=><p key={i} className="text-xs text-slate-500">{l}</p>)}
 {!x.ditolak&&x.stage<3&&<div className="mt-1 flex gap-2"><input className="border rounded p-1 flex-1 text-xs" placeholder="Catatan" value={c} onChange={e=>setC(e.target.value)}/><Btn onClick={()=>act(x.id,true)}>Setuju</Btn><Btn c="bg-red-600" onClick={()=>act(x.id,false)}>Tolak</Btn></div>}</div>):<Empty/>}</Card></div>}

function Pengumuman({ctx,warga}){const {db,up,say}=ctx;const [f,setF]=useState({judul:'',isi:'',koord:false});
 return <div className="grid md:grid-cols-2 gap-4">{!warga&&<Card><In l="Judul" v={f.judul} on={v=>setF({...f,judul:v})}/><In l="Isi" v={f.isi} on={v=>setF({...f,isi:v})}/>
 <label className="text-sm flex gap-2 mb-1"><input type="checkbox" checked={f.koord} onChange={e=>setF({...f,koord:e.target.checked})}/>Sudah menghubungi Koordinator Keamanan</label><p className="text-xs text-slate-500 mb-2">Koordinator: Bang Jago (0812-3456-7890)</p>
 <Btn disabled={!f.judul||!f.isi||!f.koord} onClick={()=>{up('pengumuman',l=>[{id:Date.now(),...f},...l]);setF({judul:'',isi:'',koord:false});say('Pengumuman terbit')}}>Terbitkan</Btn></Card>}
 <Card>{db.pengumuman.length?db.pengumuman.map(p=><div key={p.id} className="border-t py-2 text-sm"><b>{p.judul}</b><p>{p.isi}</p></div>):<Empty/>}</Card></div>}

function Serah({type,ctx}){const {db,up,say}=ctx;const A=ASSETS[type],N=NOTES[type],G=GROUPS[type];
 const list=db.shifts.filter(s=>s.type===type);const act=list.find(s=>s.status==='Bertugas');
 const [grp,setGrp]=useState('');const [take,setTake]=useState({});const [ret,setRet]=useState({});const [notes,setNotes]=useState(N.map(()=>''));const [ket,setKet]=useState('');const [nxt,setNxt]=useState({});
 const COND=['Baik','Rusak Ringan','Rusak Berat'];
 const start=()=>{if(!grp)return say('Pilih group');const miss=A.filter(([n,w])=>w&&!take[n]);if(miss.length)return say('Asset wajib belum lengkap: '+miss.map(m=>m[0]).join(', '));
  up('shifts',l=>[{id:Date.now(),type,group:grp,taken:take,status:'Bertugas'},...l]);setTake({});setGrp('');say('Shift dimulai, asset dibawa tersimpan')};
 const end=()=>{const ks=Object.keys(act.taken);if(ks.some(k=>!ret[k]))return say('Isi kondisi pengembalian semua asset');if(notes.some(n=>!n.trim()))return say('Catatan serah terima wajib diisi semua');
  const bad=ks.some(k=>ret[k]!=='Baik');if(bad&&!ket.trim())return say('Ada asset kurang/rusak: isi keterangan');
  up('shifts',l=>l.map(s=>s.id===act.id?{...s,ret,notes,ket,bad,status:'Menunggu Approval'}:s));setRet({});setNotes(N.map(()=>''));setKet('');say('Menunggu approval group baru')};
 const appr=s=>{const g=nxt[s.id];if(!g)return say('Pilih group penerima');if(g===s.group)return say('Group penerima harus berbeda');if(s.notes.some(n=>!n))return say('Catatan kosong');
  up('shifts',l=>l.map(x=>x.id===s.id?{...x,status:'Selesai',by:g}:x));say('Serah terima disetujui')};
 return <div className="grid gap-4">
 {!act?<Card><p className="font-medium mb-2">Mulai shift: ambil asset</p><Sel l="Group" v={grp} on={setGrp} o={G}/>{A.map(([n,w])=><div key={n} className="flex justify-between items-center text-sm border-t py-1"><label><input type="checkbox" checked={!!take[n]} onChange={e=>setTake({...take,[n]:e.target.checked?'Baik':undefined})}/> {n}{w?' *':''}</label>
  {take[n]&&<select className="border rounded p-1" value={take[n]} onChange={e=>setTake({...take,[n]:e.target.value})}>{COND.map(c=><option key={c}>{c}</option>)}</select>}</div>)}<p className="text-xs text-slate-500 my-2">* wajib</p><Btn onClick={start}>Mulai tugas</Btn></Card>
 :<Card><p className="font-medium mb-2">Akhiri shift {act.group}: kembalikan asset</p>{Object.keys(act.taken).map(k=><Sel key={k} l={k+' (dibawa: '+act.taken[k]+')'} v={ret[k]} on={v=>setRet({...ret,[k]:v})} o={[...COND,'Tidak dikembalikan']}/>)}
  {N.map((n,i)=><In key={n} l={n} v={notes[i]} on={v=>setNotes(notes.map((x,j)=>j===i?v:x))}/>)}<In l="Keterangan jika asset kurang/rusak" v={ket} on={setKet}/><Btn onClick={end}>Kirim serah terima</Btn></Card>}
 <Card><p className="font-medium mb-2">Riwayat serah terima</p>{list.length?list.map(s=><div key={s.id} className="border-t py-2 text-sm"><div className="flex justify-between"><b>{s.group}</b><Badge s={s.status==='Selesai'?(s.bad?'Kuning':'Hijau'):s.status==='Bertugas'?'Kuning':'Merah'}/></div>
  <p className="text-xs">Status: {s.status}{s.by?' · diterima '+s.by:''}{s.bad?' · ASSET BERMASALAH':''}</p>
  {s.notes&&<ul className="text-xs text-slate-600 mt-1">{N.map((n,i)=><li key={n}>{n}: {s.notes[i]}</li>)}{s.ket&&<li>Keterangan: {s.ket}</li>}</ul>}
  {s.status==='Menunggu Approval'&&<div className="flex gap-2 mt-2 items-end"><Sel l="Group penerima" v={nxt[s.id]} on={v=>setNxt({...nxt,[s.id]:v})} o={G}/><Btn onClick={()=>appr(s)}>Approve</Btn></div>}</div>):<Empty/>}</Card></div>}

function AI({ctx}){const {db}=ctx;const [r,setR]=useState(null);
 return <Card><Btn onClick={()=>setR([`IPL menunggak ${db.ipl.tunggak} rumah (${(db.ipl.tunggak/6).toFixed(1)}% dari 600).`,`${db.tamu.filter(t=>!t.keluar).length} tamu masih di dalam komplek.`,`${open(db.pengaduan)} pengaduan dan ${open(db.kerusakan)} kerusakan belum selesai.`,'Saran: prioritaskan penagihan Blok D dan perbaikan lampu jalan.'])}>Analisis (simulasi)</Btn>{r&&<ul className="list-disc ml-5 mt-3 text-sm">{r.map(x=><li key={x}>{x}</li>)}</ul>}</Card>}

function Exp({ctx}){const {db,say}=ctx;
 const xl=async()=>{const X=await import('xlsx');const wb=X.utils.book_new();X.utils.book_append_sheet(wb,X.utils.json_to_sheet(db.tamu),'Tamu');X.utils.book_append_sheet(wb,X.utils.json_to_sheet(db.pengaduan),'Pengaduan');X.utils.book_append_sheet(wb,X.utils.json_to_sheet([db.ipl]),'IPL');X.writeFile(wb,'pesona-khayangan.xlsx');say('Excel diunduh')};
 const pdf=async()=>{const {jsPDF}=await import('jspdf');const d=new jsPDF();d.text('Ringkasan Pesona Khayangan Juanda',10,15);d.text(`Saldo kas: ${rp(db.kas.saldo)}`,10,30);d.text(`IPL menunggak: ${db.ipl.tunggak}`,10,40);d.text(`Tamu: ${db.tamu.length}`,10,50);d.save('ringkasan.pdf');say('PDF diunduh')};
 return <Card><Btn onClick={xl}>Unduh Excel</Btn> <Btn c="bg-[#0B1F3A]" onClick={pdf}>Unduh PDF ringkasan</Btn></Card>}
