-- =====================================================================
-- Pesona Khayangan Juanda - Tahap 1: database bersama + jejak audit
-- Jalankan SELURUH isi file ini di Supabase: SQL Editor > New query > Run.
-- Aman dijalankan berulang kali.
-- =====================================================================

-- 1) Penyimpanan data aplikasi (satu tabel generik, satu baris per catatan)
create table if not exists public.app_records (
  col        text        not null,
  id         text        not null,
  data       jsonb       not null,
  ord        bigint      not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid        default auth.uid(),
  primary key (col, id)
);
create index if not exists app_records_col_ord_idx on public.app_records (col, ord);

-- 2) Profil pengguna (peran yang dipilih penguji; tahap berikutnya diganti login sungguhan)
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'guest',
  name       text,
  rt         text,
  house_id   text,
  updated_at timestamptz not null default now()
);

-- 3) Jejak audit (diisi otomatis oleh trigger, tidak bisa ditulis dari aplikasi)
create table if not exists public.audit_log (
  id         bigserial primary key,
  at         timestamptz not null default now(),
  actor      uuid,
  actor_role text,
  col        text,
  row_id     text,
  action     text,
  old_data   jsonb,
  new_data   jsonb
);
create index if not exists audit_log_at_idx on public.audit_log (at desc);

-- 4) Trigger: catat waktu dan pengubah di sisi server
create or replace function public.touch_record() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;
drop trigger if exists trg_touch_record on public.app_records;
create trigger trg_touch_record before update on public.app_records
  for each row execute function public.touch_record();

-- 5) Trigger: jejak audit. Pengisian data awal oleh peran 'guest' tidak dicatat.
create or replace function public.audit_record() returns trigger
language plpgsql security definer set search_path = public as $$
declare r text;
begin
  select role into r from public.profiles where id = auth.uid();
  if coalesce(r, 'guest') = 'guest' then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;
  if tg_op = 'DELETE' then
    insert into public.audit_log (actor, actor_role, col, row_id, action, old_data)
    values (auth.uid(), r, old.col, old.id, 'DELETE', old.data);
    return old;
  elsif tg_op = 'UPDATE' then
    if old.data is distinct from new.data then
      insert into public.audit_log (actor, actor_role, col, row_id, action, old_data, new_data)
      values (auth.uid(), r, new.col, new.id, 'UPDATE', old.data, new.data);
    end if;
    return new;
  else
    insert into public.audit_log (actor, actor_role, col, row_id, action, new_data)
    values (auth.uid(), r, new.col, new.id, 'INSERT', new.data);
    return new;
  end if;
end $$;
drop trigger if exists trg_audit_record on public.app_records;
create trigger trg_audit_record after insert or update or delete on public.app_records
  for each row execute function public.audit_record();

-- 6) Row Level Security
alter table public.app_records enable row level security;
alter table public.profiles    enable row level security;
alter table public.audit_log   enable row level security;

-- Aturan baca: pengaduan dibatasi menurut tingkat kerahasiaan (kolom data->>'sifat')
--   Umum     : semua pengguna
--   Pengurus : pelapor, RW, RT, dan seksi terkait (Keamanan: Keamanan/Kebisingan, Kebersihan: Kebersihan/Fasilitas)
--   Rahasia  : pelapor, RW, RT
-- Koleksi lain terbuka untuk semua pengguna yang sudah punya profil (tahap demo).
create or replace function public.can_read_record(c text, d jsonb) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare r text; s text;
begin
  if c <> 'pengaduan' then return true; end if;
  s := coalesce(d->>'sifat', 'Pengurus');
  if s = 'Umum' then return true; end if;
  if d->>'_uid' = auth.uid()::text then return true; end if;
  select role into r from public.profiles where id = auth.uid();
  if r in ('rw', 'rt', 'pengelola') then return true; end if;
  if s = 'Pengurus' and r = 'keamanan'   and d->>'kategori' in ('Keamanan', 'Kebisingan') then return true; end if;
  if s = 'Pengurus' and r = 'kebersihan' and d->>'kategori' in ('Kebersihan', 'Fasilitas') then return true; end if;
  return false;
end $$;

drop policy if exists app_read  on public.app_records;
drop policy if exists app_write on public.app_records;
drop policy if exists app_ins   on public.app_records;
drop policy if exists app_upd   on public.app_records;
drop policy if exists app_del   on public.app_records;
create policy app_read on public.app_records for select to authenticated
  using (public.can_read_record(col, data));
create policy app_ins on public.app_records for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy app_upd on public.app_records for update to authenticated
  using      (public.can_read_record(col, data) and exists (select 1 from public.profiles p where p.id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy app_del on public.app_records for delete to authenticated
  using (public.can_read_record(col, data) and exists (select 1 from public.profiles p where p.id = auth.uid()));

drop policy if exists prof_read on public.profiles;
drop policy if exists prof_ins  on public.profiles;
drop policy if exists prof_upd  on public.profiles;
create policy prof_read on public.profiles for select to authenticated using (true);
create policy prof_ins  on public.profiles for insert to authenticated with check (id = auth.uid());
create policy prof_upd  on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists audit_read on public.audit_log;
create policy audit_read on public.audit_log for select to authenticated using (true);

-- 7) Realtime: perubahan satu pengguna langsung tampil di pengguna lain
do $$ begin
  alter publication supabase_realtime add table public.app_records;
exception when duplicate_object then null;
end $$;
