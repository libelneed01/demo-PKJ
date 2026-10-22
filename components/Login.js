'use client';
import {useState} from 'react';
const OK={Pengurus:['AO3','A03','A0/3'],Warga:['AD10']};
const PET=[['#8b6fc4',0],['#c9665a',45],['#9a5a45',90],['#e5a84a',135],['#eed45a',180],['#6db36d',225],['#4aa6a0',270],['#5a8cc8',315]];
export const Mark=({s=80})=><svg viewBox="0 0 100 100" width={s} height={s} className="mx-auto">{PET.map(([c,r])=><rect key={r} x="38" y="6" width="24" height="32" rx="9" fill={c} opacity=".85" transform={`rotate(${r} 50 50)`}/>)}</svg>;
export default function Login({roles,onLogin}){
 const [tab,setTab]=useState('Pengurus');const [role,setRole]=useState('');const [id,setId]=useState('');const [pw,setPw]=useState('');const [show,setShow]=useState(false);const [err,setErr]=useState('');
 const go=e=>{e.preventDefault();if(tab==='Pengurus'&&!role)return setErr('Pilih jabatan pengurus terlebih dahulu');
  if(!OK[tab].includes(pw.trim().toUpperCase()))return setErr('Kata sandi tidak sesuai');onLogin(tab==='Warga'?'Warga':role)};
 const cls="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white focus:outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-100";
 return <div className="flex-1 grid place-items-center p-4"><form onSubmit={go} className="w-full max-w-sm bg-white rounded-3xl border border-slate-100 shadow-[0_8px_40px_rgba(30,47,63,0.07)] p-8">
  <img src="/logo.png" alt="Pesona Khayangan Juanda" className="mx-auto w-48 h-auto"/>
  <p className="text-center text-sm text-slate-500 mt-3 mb-5">Masuk ke ruang kerja terverifikasi Anda</p>
  <div className="grid grid-cols-2 bg-slate-100 rounded-xl p-1 mb-5 text-sm">{['Pengurus','Warga'].map(t=><button type="button" key={t} onClick={()=>{setTab(t);setErr('')}} className={`py-2 rounded-lg ${tab===t?'bg-white shadow-sm text-[#1E2F3F] font-medium':'text-slate-500'}`}>{t}</button>)}</div>
  {tab==='Pengurus'&&<label className="block text-xs font-medium text-slate-600 mb-4">Jabatan<select className={cls+' mt-1.5'} value={role} onChange={e=>setRole(e.target.value)}><option value="">Pilih jabatan</option>{roles.filter(r=>r!=='Warga').map(r=><option key={r}>{r}</option>)}</select></label>}
  <label className="block text-xs font-medium text-slate-600 mb-4">ID Pengguna<input className={cls+' mt-1.5'} placeholder="Nama atau nomor rumah" value={id} onChange={e=>setId(e.target.value)}/></label>
  <label className="block text-xs font-medium text-slate-600 mb-2">Kata Sandi<div className="relative mt-1.5"><input type={show?'text':'password'} className={cls} placeholder="Masukkan kata sandi Anda" value={pw} onChange={e=>{setPw(e.target.value);setErr('')}}/><button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-3 text-slate-400 text-xs">{show?'Sembunyi':'Lihat'}</button></div></label>
  {err&&<p className="text-xs text-rose-600 mb-2">{err}</p>}
  <button className="w-full mt-4 bg-[#1B2B3A] hover:bg-[#2a4157] text-white rounded-xl py-3 text-sm font-medium">Masuk ke Sistem →</button>
  <p className="text-center text-xs text-slate-400 mt-5">Lupa kata sandi? Hubungi pengurus RW.</p></form></div>}
