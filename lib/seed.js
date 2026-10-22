export const GROUPS={Security:['Group A','Group B','Group C'],Kebersihan:['Tim 1','Tim 2']};
export const ASSETS={Security:[['Handy Talky',1],['Senter',1],['Pentungan',1],['Rompi',1],['Jas Hujan',1],['Peluit',1],['Borgol (opsional)',0]],
Kebersihan:[['Troli/keranjang',1],['Sapu',1],['Pel',1],['Karung sampah',1],['Sarung tangan',1],['Rompi kebersihan',1],['Jas hujan',1]]};
export const NOTES={Security:['Kejadian penting selama shift','Area rawan yang perlu diawasi','Tamu yang belum keluar','Kendaraan mencurigakan / catatan parkir','Instruksi untuk group berikutnya'],
Kebersihan:['Area yang sudah dibersihkan','Area yang belum selesai','Titik sampah bermasalah','Kerusakan fasilitas ditemukan','Instruksi untuk petugas berikutnya']};
const g=(id,judul,detail,status,catatan='')=>({id,judul,detail,status,catatan});
export const seed=()=>({
 tamu:[{id:1,nama:'Budi Hartono',plat:'B 1234 XYZ',jenis:'Mobil pribadi',tujuan:'A5/12',catatan:'',masuk:'08:10',keluar:null},
 {id:2,nama:'Andi (Gojek)',plat:'B 5566 KLM',jenis:'Ojek online',tujuan:'C2/03',catatan:'Antar paket',masuk:'09:30',keluar:'09:42'},
 {id:3,nama:'Siti Rahma',plat:'D 888 AB',jenis:'Taxi online',tujuan:'B7/21',catatan:'',masuk:'10:05',keluar:null}],
 pengaduan:[g(1,'Lampu jalan mati Blok B','Depan B7 gelap sejak 3 hari','Baru'),g(2,'Anjing berkeliaran','Sekitar taman utama','Diproses','Sudah ditegur pemilik'),g(3,'Suara bising malam','Blok D','Selesai','Sudah mediasi')],
 kerusakan:[g(1,'Paving retak','Jalan utama, tingkat sedang','Baru'),g(2,'Pintu pos rusak','Pos kebersihan, ringan','Diproses')],
 sampah:[g(1,'Tumpukan sampah Blok C','Dekat TPS sementara','Baru'),g(2,'Jadwal angkut Senin-Kamis','Rutin','Selesai')],
 izin:[{id:1,judul:'Renovasi dapur A5/12',jenis:'Renovasi',stage:1,ditolak:false,log:['RT: setuju']},{id:2,judul:'Pengajian akbar Blok C',jenis:'Pengajian',stage:0,ditolak:false,log:[]}],
 pengumuman:[{id:1,judul:'Kerja bakti Minggu',isi:'Pukul 07.00 di taman utama',koord:true}],
 shifts:[{id:1,type:'Security',group:'Group A',taken:{'Handy Talky':'Baik','Senter':'Baik','Pentungan':'Baik','Rompi':'Baik','Jas Hujan':'Baik','Peluit':'Baik'},
  ret:{'Handy Talky':'Baik','Senter':'Rusak Ringan','Pentungan':'Baik','Rompi':'Baik','Jas Hujan':'Baik','Peluit':'Tidak dikembalikan'},
  notes:['Aman','Blok D gelap','1 tamu belum keluar','-','Cek Blok D'],ket:'Peluit hilang',bad:true,status:'Menunggu Approval'}],
 warga:[{id:1,status:'Tinggal',nama:'Budi Hartono',kk:'3201001',ktp:'3201002',blok:'A5/12',rw:'29',jml:'4',kendaraan:'Avanza B 1234 XYZ',hp:'0812111'},
 {id:2,status:'Ngontrak',nama:'Rina Sari',ktp:'3201003',jml:'3',kendaraan:'Motor D 777 CD',pemilik:'H. Anwar',blok:'B7/21',mulai:'2026-01-01',selesai:'2026-12-31',hp:'0813222',hpPemilik:'0815333'},
 {id:3,status:'Ditinggal',nama:'Dedi Kurnia',kk:'3201004',blok:'C2/03',kota:'Surabaya, Jawa Timur',penunggu:'Pak Ujang',hpPenunggu:'0817444',mulai:'2026-03-10'}],
 absensi:[{id:1,type:'Security',group:'Group A',rw:'',masuk:'06:55',keluar:null,telat:false},{id:2,type:'Kebersihan',group:'Tim 1',rw:'RW 29',masuk:'07:30',keluar:null,telat:true}],
 kendaraan:[{id:1,plat:'B 1234 XYZ',pemilik:'Budi Hartono',blok:'A5/12'},{id:2,plat:'D 777 CD',pemilik:'Rina Sari',blok:'B7/21'},{id:3,plat:'B 9090 TT',pemilik:'Dedi Kurnia',blok:'C2/03'}],
 pelanggaran:[{id:1,plat:'B 9090 TT',jenis:'Menghalangi akses',catatan:'Depan gerbang C',status:'Baru',waktu:'07:50'}],
 tunggakan:Array.from({length:50},(_,i)=>({id:i+1,blok:'ABCDE'[i%5]+((i%9)+1)+'/'+(10+i),pemilik:'Warga '+(i+1),rw:i%2?'RW 31':'RW 29',bulan:1+(i%4)})),
 pengeluaran:[{id:1,tgl:'03 Okt',ket:'Gaji security',jml:9000000},{id:2,tgl:'05 Okt',ket:'Gaji kebersihan',jml:6000000},{id:3,tgl:'12 Okt',ket:'Perbaikan lampu jalan',jml:1500000}],
 bukti:[{id:1,blok:'A1/10',jml:250000,file:'bukti-transfer.jpg',status:'Menunggu'}],
 ipl:{lunas:480,telat:70,tunggak:50},
 kas:{saldo:42500000,masuk:68000000,keluar:25500000},
 bulanan:[{b:'Mei',masuk:60,keluar:30},{b:'Jun',masuk:64,keluar:28},{b:'Jul',masuk:62,keluar:35},{b:'Agu',masuk:66,keluar:27},{b:'Sep',masuk:68,keluar:25}],
});
