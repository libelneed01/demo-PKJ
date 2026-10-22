'use client';
import {useState} from 'react';
import {GROUPS} from '../lib/seed';
import {Badge,Card,In,Sel,Btn,Empty} from './ui';
const F={Tinggal:[['nama','Nama pemilik'],['kk','No KK'],['ktp','No KTP'],['blok','Blok/No rumah'],['rw','RW'],['jml','Jumlah penghuni'],['kendaraan','Kendaraan + plat'],['hp','No HP']],
Ngontrak:[['nama','Nama pengontrak'],['ktp','No KTP'],['jml','Jumlah orang'],['kendaraan','Kendaraan dibawa'],['pemilik','Nama pemilik rumah'],['blok','Blok/No rumah'],['mulai','Mulai kontrak','date'],['selesai','Selesai kontrak','date'],['hp','HP pengontrak'],['hpPemilik','HP pemilik']],
Ditinggal:[['nama','Nama pemilik'],['kk','KK/KTP'],['blok','Blok/No rumah'],['kota','Kota + provinsi alamat baru'],['penunggu','Nama penunggu'],['hpPenunggu','No HP penunggu'],['mulai','Tanggal mulai ditinggal','date']]};
const TW={Tinggal:'Hijau',Ngontrak:'Kuning',Ditinggal:'Merah'};
const nowT=()=>new Date().toTimeString().slice(0,5);

export function Warga({ctx}){const {db,up,say}=ctx;const [st,setSt]=useState('Tinggal');const [f,setF]=useState({});const [eid,setEid]=useState(null);const [q,setQ]=useState('');const [fs,setFs]=useState('');const [d,setD]=useState(null);const [show,setShow]=useState(false);
 const save=()=>{if(!f.nama||!f.blok)return say('Nama dan blok wajib diisi');
  if(eid)up('warga',l=>l.map(x=>x.id===eid?{...f,id:eid,status:st}:x));else up('warga',l=>[{...f,id:Date.now(),status:st},...l]);
  setF({});setEid(null);setShow(false);say('Data warga tersimpan')};
 const list=db.warga.filter(w=>(!fs||w.status===fs)&&((w.nama||'')+(w.blok||'')).toLowerCase().includes(q.toLowerCase()));
 return <div className="grid gap-4"><div className="flex gap-2 flex-wrap items-end"><div className="flex-1 min-w-40"><In l="Cari nama/blok" v={q} on={setQ}/></div><Sel l="Filter status" v={fs} on={setFs} o={Object.keys(F)}/><Btn className="mb-2" onClick={()=>{setF({});setEid(null);setSt('Tinggal');setShow(true)}}>+ Tambah</Btn></div>
 {show&&<Card><Sel l="Status hunian" v={st} on={v=>setSt(v||'Tinggal')} o={Object.keys(F)}/>{F[st].map(([k,l,t])=><In key={k} l={l} type={t} v={f[k]||''} on={v=>setF({...f,[k]:v})}/>)}<div className="flex gap-2"><Btn onClick={save}>Simpan</Btn><Btn c="bg-slate-400" onClick={()=>setShow(false)}>Batal</Btn></div></Card>}
 <Card>{list.length?list.map(w=><div key={w.id} className="border-t py-2 text-sm flex justify-between items-center"><button onClick={()=>setD(w)} className="text-left">{w.nama} · {w.blok}</button><div className="flex gap-2 items-center"><Badge s={TW[w.status]}/><span className="text-xs">{w.status}</span><button className="underline text-xs" onClick={()=>{setSt(w.status);setF(w);setEid(w.id);setShow(true)}}>Edit</button></div></div>):<Empty/>}</Card>
 {d&&<div className="fixed inset-0 bg-black/40 grid place-items-center z-40" onClick={()=>setD(null)}><Card className="w-80 text-sm max-h-[80vh] overflow-y-auto"><p className="font-semibold mb-2">{d.status}</p>{F[d.status].map(([k,l])=><p key={k}>{l}: {d[k]||'-'}</p>)}</Card></div>}</div>}

export function Absensi({type,ctx}){const {db,up,say}=ctx;const [g,setG]=useState('');const [rw,setRw]=useState('');const [jam,setJam]=useState('');const batas='07:15';
 const cin=()=>{if(!g)return say('Pilih group');if(type==='Kebersihan'&&!rw)return say('Wajib pilih RW 29 / RW 31');
  if(db.absensi.some(a=>a.type===type&&a.group===g&&!a.keluar))return say(g+' sudah check-in');
  const j=jam||nowT();up('absensi',l=>[{id:Date.now(),type,group:g,rw,masuk:j,keluar:null,telat:j>batas},...l]);setJam('');say(j>batas?'Check-in tercatat: TERLAMBAT':'Check-in tercatat tepat waktu')};
 const list=db.absensi.filter(a=>a.type===type);
 return <div className="grid md:grid-cols-2 gap-4"><Card><Sel l="Group" v={g} on={setG} o={GROUPS[type]}/>{type==='Kebersihan'&&<Sel l="Area RW (wajib)" v={rw} on={setRw} o={['RW 29','RW 31']}/>}
 <In l={`Jam masuk (kosong = sekarang, batas ${batas})`} type="time" v={jam} on={setJam}/><Btn onClick={cin}>Check-in</Btn></Card>
 <Card><p className="font-medium mb-1">Riwayat</p>{list.length?list.map(a=><div key={a.id} className="border-t py-2 text-sm flex justify-between items-center"><span>{a.group}{a.rw?' · '+a.rw:''}<br/><span className="text-xs text-slate-500">{a.masuk}{a.keluar?' - '+a.keluar:' (bertugas)'}</span></span>
 <span className="flex gap-2 items-center"><Badge s={a.telat?'Kuning':'Hijau'}/><span className="text-xs">{a.telat?'Terlambat':'Tepat'}</span>{!a.keluar&&<Btn c="bg-yellow-600" onClick={()=>{up('absensi',l=>l.map(x=>x.id===a.id?{...x,keluar:nowT()}:x));say('Check-out tercatat')}}>Check-out</Btn>}</span></div>):<Empty/>}</Card></div>}

export function Parkir({ctx}){const {db,up,say}=ctx;const [k,setK]=useState({plat:'',pemilik:'',blok:''});const [p,setP]=useState({plat:'',jenis:'',catatan:''});
 return <div className="grid md:grid-cols-2 gap-4"><div className="grid gap-4 content-start"><Card><p className="font-medium mb-2">Master kendaraan warga</p><In l="Plat" v={k.plat} on={v=>setK({...k,plat:v})}/><In l="Pemilik" v={k.pemilik} on={v=>setK({...k,pemilik:v})}/><In l="Blok/No rumah" v={k.blok} on={v=>setK({...k,blok:v})}/>
 <Btn onClick={()=>{if(!k.plat||!k.pemilik)return say('Plat dan pemilik wajib diisi');up('kendaraan',l=>[{id:Date.now(),...k},...l]);setK({plat:'',pemilik:'',blok:''});say('Kendaraan ditambahkan')}}>Simpan</Btn></Card>
 <Card><p className="font-medium mb-2">Catat pelanggaran</p><Sel l="Plat" v={p.plat} on={v=>setP({...p,plat:v})} o={db.kendaraan.map(x=>x.plat)}/><Sel l="Jenis" v={p.jenis} on={v=>setP({...p,jenis:v})} o={['Parkir di jalan','Menghalangi akses','Parkir di fasilitas umum','Lainnya']}/><In l="Catatan" v={p.catatan} on={v=>setP({...p,catatan:v})}/>
 <Btn c="bg-red-600" onClick={()=>{if(!p.plat||!p.jenis)return say('Plat dan jenis wajib dipilih');up('pelanggaran',l=>[{id:Date.now(),...p,status:'Baru',waktu:nowT()},...l]);setP({plat:'',jenis:'',catatan:''});say('Pelanggaran dicatat')}}>Catat</Btn></Card></div>
 <div className="grid gap-4 content-start"><Card><p className="font-medium mb-1">Pelanggaran</p>{db.pelanggaran.length?db.pelanggaran.map(x=><div key={x.id} className="border-t py-2 text-sm flex justify-between items-center"><span>{x.plat} · {x.jenis}<br/><span className="text-xs text-slate-500">{x.waktu} {x.catatan}</span></span>{x.status==='Selesai'?<Badge s="Selesai"/>:<Btn onClick={()=>{up('pelanggaran',l=>l.map(y=>y.id===x.id?{...y,status:'Selesai'}:y));say('Ditandai selesai')}}>Tindak</Btn>}</div>):<Empty/>}</Card>
 <Card><p className="font-medium mb-1">Daftar kendaraan ({db.kendaraan.length})</p>{db.kendaraan.length?db.kendaraan.map(x=><p key={x.id} className="border-t py-1 text-sm">{x.plat} · {x.pemilik} · {x.blok} {db.pelanggaran.some(y=>y.plat===x.plat&&y.status!=='Selesai')&&<Badge s="Merah"/>}</p>):<Empty/>}</Card></div></div>}
