'use client';
import {useState} from 'react';
import {ResponsiveContainer,AreaChart,Area,BarChart,Bar,XAxis,YAxis,Tooltip,Legend,CartesianGrid} from 'recharts';
import {Card} from './ui';
const NAVY='#1E2F3F',EM='#2f9e7e',AMB='#e0a82e',ROSE='#d9625a';
const R=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const MO=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const ML=Array.from({length:36},(_,i)=>MO[(10+i)%12]+' '+(23+Math.floor((10+i)/12)));
const WL=Array.from({length:26},(_,j)=>{const d=new Date(2026,9,22-(25-j)*7);return d.getDate()+' '+MO[d.getMonth()]});
// [label,unit,agg,base,trend3th,season,noise,good,target]
const M={pengaduan:['Pengaduan masuk','','sum',46,-14,.12,.25,'down'],sla:['Selesai tepat SLA','%','avg',68,22,.02,.06,'up',90],ttr:['Waktu penyelesaian','hari','avg',5.6,-2.6,.06,.15,'down'],
izin:['Izin diproses','','sum',12,5,.2,.3,null],kerusakan:['Kerusakan dilaporkan','','sum',13,-5,.15,.3,'down'],collect:['IPL tertagih','%','avg',74,15,.02,.05,'up',90],
tamu:['Tamu masuk','','sum',380,90,.1,.15,null],parkir:['Pelanggaran parkir','','sum',34,-16,.15,.3,'down'],pengK:['Pengaduan keamanan','','sum',11,-5,.2,.35,'down'],
telat:['Security terlambat','%','avg',22,-12,.1,.3,'down'],assetS:['Asset security lengkap','%','avg',78,16,.02,.05,'up',95],handover:['Serah terima tepat waktu','%','avg',70,20,.02,.06,'up',90],
hadirK:['Kehadiran kebersihan','%','avg',84,11,.02,.04,'up',95],sampah:['Sampah menumpuk','','sum',27,-12,.18,.3,'down'],ttrS:['Waktu tangani sampah','jam','avg',14,-7,.08,.15,'down'],
rusakF:['Kerusakan fasilitas','','sum',8,-3,.15,.35,'down'],assetK:['Asset kebersihan lengkap','%','avg',74,19,.02,.05,'up',95],area:['Area selesai dibersihkan','%','avg',79,13,.02,.05,'up',95],
masuk:['Pemasukan IPL','juta','sum',52,14,.06,.08,'up'],keluar:['Pengeluaran','juta','sum',33,-6,.1,.15,'down'],tung:['Rumah menunggak','','avg',118,-68,.06,.1,'down'],saldo:['Saldo kas','juta','avg',22,21,.03,.06,'up'],
esc1:['Selesai di RT','','sum',30,10,.1,.2,'up'],esc2:['Naik ke RW','','sum',9,-3,.1,.3,'down'],esc3:['Naik ke Keamanan/Eksternal','','sum',4,-2,.1,.4,'down'],
i1:['Parkir liar','','sum',24,-10,.15,.3],i2:['Tamu tanpa konfirmasi','','sum',16,-7,.1,.3],i3:['Lampu jalan mati','','sum',10,-2,.2,.4],i4:['Sampah menumpuk','','sum',17,-6,.18,.3],
i5:['Kebisingan malam','','sum',12,2,.2,.4],i6:['Kendaraan mencurigakan','','sum',6,1,.1,.5],i7:['Fasilitas rusak','','sum',9,-3,.15,.4],i8:['Kehilangan barang','','sum',4,-1,.1,.6]};
const INC=['i1','i2','i3','i4','i5','i6','i7','i8'];
const D=Object.fromEntries(Object.keys(M).map(k=>{const [,u,ag,b,tr,se,no]=M[k];const r=R([...k].reduce((a,c)=>a*31+c.charCodeAt(0),7));
 const f=(t,sc)=>{let v=(b+tr*t/35)*(1+se*Math.sin(2*Math.PI*t/12))*(1+no*(r()-.5));if(u==='%')v=Math.min(99,v);return Math.max(0,v/(ag==='sum'?sc:1))};
 return [k,{m:Array.from({length:36},(_,i)=>f(i,1)),w:Array.from({length:26},(_,j)=>f(35-(25-j)/4.33,4.33))}]}));
const chunk=(a,n,ag)=>Array.from({length:a.length/n},(_,i)=>{const t=a.slice(i*n,i*n+n).reduce((x,y)=>x+y,0);return ag==='sum'?t:t/n});
const ser=(k,mode)=>{const ag=M[k][2],{m,w}=D[k];
 const [a,lag,lab]={Mingguan:[w,0,WL],Bulanan:[m,12,ML],'3 Bulanan':[chunk(m,3,ag),4,ML.filter((_,i)=>i%3===2)],Semester:[chunk(m,6,ag),2,ML.filter((_,i)=>i%6===5)]}[mode];
 return a.map((v,i)=>({l:lab[i],v:+v.toFixed(1),p:lag&&i>=lag?+a[i-lag].toFixed(1):null}))};
const fmt=v=>v>=100?Math.round(v).toLocaleString('id-ID'):String(+v.toFixed(1));
const SC={Keseluruhan:['pengaduan','sla','ttr','izin','kerusakan','collect'],Keamanan:['tamu','parkir','pengK','telat','assetS','handover'],Kebersihan:['hadirK','sampah','ttrS','rusakF','assetK','area'],Keuangan:['masuk','keluar','collect','tung','saldo']};
const W={Mingguan:1,Bulanan:1,'3 Bulanan':3,Semester:6};
const HEAT=(()=>{const r=R(11);return ['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map((d,i)=>[d,[1,1.3,2.2].map(s=>Math.round((3+r()*5)*s*(i>=5?1.4:1)))])})();
const BLOK=[['Blok C',31],['Blok A',24],['Blok D',19],['Blok B',14],['Blok E',9]].map(([n,v])=>({n,v}));
const H=({t,s})=><div className="mt-2"><p className="font-semibold text-[#1E2F3F]">{t}</p><p className="text-xs text-slate-500">{s}</p></div>;

export default function KPI({role,ctx}){const {db}=ctx;
 const scopes=role==='Pengurus RW'?Object.keys(SC):[role==='Pengurus Keamanan'?'Keamanan':role==='Pengurus Kebersihan'?'Kebersihan':'Keuangan'];
 const [sc,setSc]=useState(scopes[0]);const [mode,setMode]=useState('Bulanan');const [sel,setSel]=useState(null);
 const keys=SC[sc],cur=sel&&keys.includes(sel)?sel:keys[0];
 const tile=k=>{const s=ser(k,mode),L=s[s.length-1],P=s[s.length-2],d=P.v?(L.v-P.v)/P.v*100:0,[lb,u,,,,,,gd,tg]=M[k];const good=gd?(gd==='up'?d>=0:d<=0):null;const col=good===false?ROSE:EM;
  return <button key={k} onClick={()=>setSel(k)} className={`text-left bg-white rounded-2xl p-4 border ${k===cur?'border-[#2f9e7e] ring-1 ring-[#2f9e7e]':'border-slate-100'}`}>
  <p className="text-xs text-slate-500">{lb}</p><div className="flex items-end justify-between gap-1"><p className="text-2xl font-semibold text-[#1E2F3F]">{fmt(L.v)}<span className="text-xs text-slate-400"> {u}</span></p>
  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${good===null?'bg-slate-100 text-slate-600':good?'bg-emerald-100 text-emerald-700':'bg-rose-100 text-rose-700'}`}>{d>=0?'▲':'▼'} {Math.abs(d).toFixed(1)}%</span></div>
  <div className="h-10 mt-1"><ResponsiveContainer><AreaChart data={s.slice(-12)}><Area dataKey="v" stroke={col} fill={col} fillOpacity={.15} strokeWidth={2} dot={false} isAnimationActive={false}/></AreaChart></ResponsiveContainer></div>
  {tg&&<div className="mt-1"><div className="h-1.5 bg-slate-100 rounded-full"><div className="h-1.5 rounded-full" style={{width:Math.min(100,L.v/tg*100)+'%',background:L.v>=tg?EM:AMB}}/></div><p className="text-[10px] text-slate-400 mt-0.5">Target {tg}{u}</p></div>}</button>};
 const cs=ser(cur,mode),CL=cs[cs.length-1],CP=cs[cs.length-2],ym=ser(cur,'Bulanan').map(x=>x.v),avg=ym.reduce((a,b)=>a+b,0)/36,mx=Math.max(...ym),mn=Math.min(...ym);
 const yoy=CL.p?((CL.v-CL.p)/CL.p*100):null;const [cl,cu]=M[cur];
 const e=['esc1','esc2','esc3'].map(k=>ser(k,mode));const esd=e[0].map((d,i)=>({l:d.l,'Selesai di RT':d.v,'Naik ke RW':e[1][i].v,'Eksternal/Keamanan':e[2][i].v}));
 const el=esd[esd.length-1],er=((el['Naik ke RW']+el['Eksternal/Keamanan'])/(el['Selesai di RT']+el['Naik ke RW']+el['Eksternal/Keamanan'])*100);
 const inc=INC.map(k=>{const a=mode==='Mingguan'?D[k].w:D[k].m,w=W[mode],sm=x=>Math.round(x.reduce((p,c)=>p+c,0));return {n:M[k][0],'Periode ini':sm(a.slice(-w)),'Periode lalu':sm(a.slice(-2*w,-w))}}).sort((a,b)=>b['Periode ini']-a['Periode ini']);
 const q=[0,1,2].map(i=>db.izin.filter(x=>!x.ditolak&&x.stage===i).length);const qd=[{n:'Izin di RT',v:q[0]},{n:'Izin di RW',v:q[1]},{n:'Izin di Keamanan',v:q[2]},{n:'Pengaduan terbuka',v:db.pengaduan.filter(x=>x.status!=='Selesai').length},{n:'Kerusakan terbuka',v:db.kerusakan.filter(x=>x.status!=='Selesai').length}];
 const Pill=({a,on,t})=><button onClick={on} className={`px-3 py-1.5 rounded-full text-sm border whitespace-nowrap ${a?'bg-[#1E2F3F] text-white border-[#1E2F3F]':'bg-white text-slate-600 border-slate-200'}`}>{t}</button>;
 return <div className="grid gap-4">
 <div className="flex flex-wrap gap-2 items-center justify-between"><div className="flex gap-2 overflow-x-auto">{scopes.length>1&&scopes.map(s=><Pill key={s} a={sc===s} on={()=>{setSc(s);setSel(null)}} t={s}/>)}</div>
 <div className="flex gap-2 overflow-x-auto">{Object.keys(W).map(m=><Pill key={m} a={mode===m} on={()=>setMode(m)} t={m}/>)}</div></div>
 <p className="text-xs text-slate-500">Data historis Nov 2023 - Okt 2026 (dummy). Panah menunjukkan perubahan vs periode sebelumnya; hijau = membaik, merah = memburuk. Mingguan menampilkan 26 minggu terakhir.</p>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{keys.map(tile)}</div>
 <Card><div className="flex flex-wrap justify-between gap-2"><div><p className="font-semibold text-[#1E2F3F]">{cl}{cu?' ('+cu+')':''} · {mode}</p><p className="text-xs text-slate-500">Garis putus-putus = {mode==='Mingguan'?'tidak ada pembanding tahun lalu':'periode sama tahun lalu'}</p></div>
 <div className="text-xs text-right"><p>Vs periode lalu: <b>{CP.v?((CL.v-CP.v)/CP.v*100).toFixed(1):0}%</b></p>{yoy!==null&&<p>Vs tahun lalu: <b>{yoy.toFixed(1)}%</b></p>}</div></div>
 <div className="h-64 mt-2"><ResponsiveContainer><AreaChart data={cs}><defs><linearGradient id="gk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={EM} stopOpacity={.45}/><stop offset="100%" stopColor={EM} stopOpacity={.02}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e5ebe6"/><XAxis dataKey="l" tick={{fontSize:10}} interval="preserveStartEnd"/><YAxis tick={{fontSize:10}} width={36}/><Tooltip/><Legend/>
 <Area name="Periode ini" dataKey="v" stroke={EM} strokeWidth={3} fill="url(#gk)"/><Area name="Tahun lalu" dataKey="p" stroke="#94a3b8" strokeDasharray="5 4" fill="none" strokeWidth={2}/></AreaChart></ResponsiveContainer></div>
 <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">{[['Rata-rata 3 thn',fmt(avg)],['Tertinggi',fmt(mx)],['Terendah',fmt(mn)]].map(([a,b])=><div key={a} className="bg-slate-50 rounded-xl p-2"><p className="text-slate-500">{a}</p><p className="text-lg font-semibold text-[#1E2F3F]">{b}</p></div>)}</div></Card>
 <H t="KPI Eskalasi Penyelesaian" s="Seberapa cepat dan di level mana masalah selesai"/>
 <div className="grid md:grid-cols-3 gap-3">{tile('sla')}{tile('ttr')}<div className="bg-white rounded-2xl p-4 border border-slate-100"><p className="text-xs text-slate-500">Tingkat eskalasi</p><p className="text-2xl font-semibold text-[#1E2F3F]">{er.toFixed(1)}<span className="text-xs text-slate-400"> %</span></p><p className="text-[11px] text-slate-500 mt-1">Kasus yang naik dari RT ke RW / Keamanan / Eksternal. Makin rendah makin baik.</p></div></div>
 <div className="grid md:grid-cols-2 gap-3"><Card><p className="text-sm font-medium mb-2">Selesai di level mana ({mode})</p><div className="h-56"><ResponsiveContainer><BarChart data={esd}><XAxis dataKey="l" tick={{fontSize:10}} interval="preserveStartEnd"/><YAxis tick={{fontSize:10}} width={30}/><Tooltip/><Legend/><Bar dataKey="Selesai di RT" stackId="a" fill={EM}/><Bar dataKey="Naik ke RW" stackId="a" fill={AMB}/><Bar dataKey="Eksternal/Keamanan" stackId="a" fill={ROSE}/></BarChart></ResponsiveContainer></div></Card>
 <Card><p className="text-sm font-medium mb-2">Antrean eskalasi saat ini (data live)</p><div className="h-56"><ResponsiveContainer><BarChart data={qd} layout="vertical"><XAxis type="number" allowDecimals={false} tick={{fontSize:10}}/><YAxis type="category" dataKey="n" width={110} tick={{fontSize:11}}/><Tooltip/><Bar dataKey="v" fill={NAVY} radius={[0,6,6,0]}/></BarChart></ResponsiveContainer></div></Card></div>
 <H t="Kejadian Paling Sering" s={`Perbandingan ${mode.toLowerCase()} ini vs sebelumnya`}/>
 <div className="grid md:grid-cols-2 gap-3"><Card><div className="h-72"><ResponsiveContainer><BarChart data={inc} layout="vertical"><XAxis type="number" allowDecimals={false} tick={{fontSize:10}}/><YAxis type="category" dataKey="n" width={130} tick={{fontSize:11}}/><Tooltip/><Legend/><Bar dataKey="Periode ini" fill={NAVY} radius={[0,6,6,0]}/><Bar dataKey="Periode lalu" fill="#c5d3cc" radius={[0,6,6,0]}/></BarChart></ResponsiveContainer></div></Card>
 <div className="grid gap-3"><Card><p className="text-sm font-medium mb-2">Waktu rawan (hari x shift)</p><div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-1 text-xs text-center"><span/>{['Pagi','Siang','Malam'].map(s=><span key={s} className="text-slate-500">{s}</span>)}
 {HEAT.map(([d,v])=>[<span key={d} className="text-slate-500 self-center">{d}</span>,...v.map((x,i)=><span key={d+i} className="rounded-md py-1.5 font-medium" style={{background:`rgba(217,98,90,${Math.min(.9,x/22+.08)})`,color:x>12?'#fff':NAVY}}>{x}</span>)])}</div></Card>
 <Card><p className="text-sm font-medium mb-2">Lokasi paling rawan (12 bulan)</p><div className="h-28"><ResponsiveContainer><BarChart data={BLOK} layout="vertical"><XAxis type="number" hide/><YAxis type="category" dataKey="n" width={50} tick={{fontSize:11}}/><Tooltip/><Bar dataKey="v" fill={AMB} radius={[0,6,6,0]}/></BarChart></ResponsiveContainer></div></Card></div></div></div>}
