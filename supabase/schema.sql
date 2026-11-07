-- =====================================================================
-- MSI Group Awards: skema database (Supabase / PostgreSQL)
-- Jalankan seluruh berkas ini sekali di Supabase: SQL Editor > New query > Run.
-- Aman dijalankan ulang (tabel yang sudah ada tidak dibuat ulang).
-- =====================================================================

-- ---------- Tabel ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('ADMIN', 'J1', 'J2')),
  name        text not null,
  title       text not null default '',
  institution text not null default ''
);

create table if not exists public.participants (
  id               text primary key check (id ~ '^[A-Za-z0-9-]{1,12}$'),
  company_name     text not null check (length(trim(company_name)) > 0),
  innovation_title text not null check (length(trim(innovation_title)) > 0),
  category         text not null,
  lead_presenter   text not null default '',
  created_at       timestamptz not null default now()
);

create table if not exists public.evaluations (
  participant_id text not null references public.participants(id) on delete cascade,
  judge_id       text not null check (judge_id in ('J1', 'J2')),
  strategi       numeric(3,1) not null check (strategi between 0 and 5),
  implementasi   numeric(3,1) not null check (implementasi between 0 and 5),
  hasil          numeric(3,1) not null check (hasil between 0 and 5),
  notes          text not null default '' check (length(notes) <= 600),
  updated_at     timestamptz not null default now(),
  primary key (participant_id, judge_id)
);

create table if not exists public.weights (
  id           int primary key default 1 check (id = 1),   -- hanya satu baris
  strategi     numeric(5,2) not null default 40 check (strategi between 0 and 100),
  implementasi numeric(5,2) not null default 35 check (implementasi between 0 and 100),
  hasil        numeric(5,2) not null default 25 check (hasil between 0 and 100),
  constraint weights_total_100 check (abs(strategi + implementasi + hasil - 100) < 0.001)
);
insert into public.weights (id) values (1) on conflict do nothing;

create table if not exists public.audit_log (
  id         bigserial primary key,
  created_at timestamptz not null default now(),
  actor      text not null,
  action     text not null,
  detail     text not null default ''
);

-- ---------- Fungsi bantu ----------
create or replace function public.app_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.actor_name()
returns text language sql stable security definer set search_path = public as $$
  select coalesce((select name || ' (' || role || ')' from public.profiles where id = auth.uid()), 'Sistem')
$$;

-- ---------- Riwayat perubahan otomatis (tidak bisa dipalsukan dari aplikasi) ----------
create or replace function public.audit_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare act text; det text;
begin
  if current_setting('app.silent', true) = '1' then return null; end if;

  if TG_TABLE_NAME = 'evaluations' then
    if TG_OP = 'DELETE' then
      act := 'Hapus nilai';
      det := OLD.participant_id || ' oleh ' || OLD.judge_id || ' dikosongkan';
    else
      act := case when TG_OP = 'INSERT' then 'Isi nilai' else 'Ubah nilai' end;
      det := NEW.participant_id || ' oleh ' || NEW.judge_id || ': S ' || trim_scale(NEW.strategi)
             || ' / I ' || trim_scale(NEW.implementasi) || ' / H ' || trim_scale(NEW.hasil);
      if TG_OP = 'UPDATE' then
        det := det || ' (sebelumnya S ' || trim_scale(OLD.strategi) || ' / I '
               || trim_scale(OLD.implementasi) || ' / H ' || trim_scale(OLD.hasil) || ')';
      end if;
    end if;
  elsif TG_TABLE_NAME = 'weights' then
    act := 'Ubah bobot';
    det := trim_scale(OLD.strategi) || '-' || trim_scale(OLD.implementasi) || '-' || trim_scale(OLD.hasil)
           || ' menjadi ' || trim_scale(NEW.strategi) || '-' || trim_scale(NEW.implementasi) || '-' || trim_scale(NEW.hasil);
  elsif TG_TABLE_NAME = 'participants' then
    if TG_OP = 'INSERT' then act := 'Tambah peserta'; det := NEW.id || ' · ' || NEW.company_name;
    elsif TG_OP = 'UPDATE' then act := 'Ubah peserta'; det := NEW.id || ' · ' || NEW.company_name;
    else act := 'Hapus peserta'; det := OLD.id || ' · ' || OLD.company_name; end if;
  end if;

  insert into public.audit_log (actor, action, detail) values (public.actor_name(), act, det);
  return null;
end $$;

drop trigger if exists trg_audit_evaluations on public.evaluations;
create trigger trg_audit_evaluations after insert or update or delete on public.evaluations
  for each row execute function public.audit_change();
drop trigger if exists trg_audit_weights on public.weights;
create trigger trg_audit_weights after update on public.weights
  for each row execute function public.audit_change();
drop trigger if exists trg_audit_participants on public.participants;
create trigger trg_audit_participants after insert or update or delete on public.participants
  for each row execute function public.audit_change();

-- ---------- Data acuan awal & reset ----------
create or replace function public.seed_awards()
returns void language plpgsql security definer set search_path = public as $$
begin
  perform set_config('app.silent', '1', true);
  delete from public.evaluations;
  delete from public.participants;
  insert into public.participants (id, company_name, innovation_title, category, lead_presenter) values
    ('S01', 'PT Sinergi Optima Prima', 'Sistem Otomasi Logistik Cerdas Berbasis IoT & AI', 'Supply Chain & Operational Excellence', 'Budi Santoso, ST'),
    ('S02', 'PT Solusi Nusantara Digital', 'Platform Prediktif Pemeliharaan Aset Industri Terintegrasi', 'Digital Transformation & Industry 4.0', 'Dra. Rina Kusuma'),
    ('S03', 'PT Sukses Mandiri Integra', 'Arsitektur Enterprise Analytics Real-Time & ESG Tracker', 'Sustainable Business Innovation', 'Ahmad Fauzi, M.Kom');
  insert into public.evaluations (participant_id, judge_id, strategi, implementasi, hasil, notes) values
    ('S01', 'J1', 4, 3, 4, 'Strategi implementasi matang, eksekusi lapangan perlu percepatan skalabilitas.'),
    ('S01', 'J2', 4, 4, 3, 'Dukungan implementasi organisasi sangat solid, metrik dampak akhir masih dapat ditingkatkan.'),
    ('S02', 'J1', 3, 4, 4, 'Arsitektur sistem andal dan modular, namun diferensiasi roadmap strategi masih generik.'),
    ('S02', 'J2', 4, 3, 4, 'Kajian strategi bisnis komprehensif, implementasi membutuhkan automasi mitigasi risiko tambahan.'),
    ('S03', 'J1', 5, 4, 3, 'Visi strategi sangat luar biasa dan terdepan. Adopsi sistem berjalan sangat lancar.'),
    ('S03', 'J2', 4, 4, 4, 'Keseimbangan prima antara perencanaan strategis, eksekusi operasional, dan kepuasan pengguna.');
  update public.weights set strategi = 40, implementasi = 35, hasil = 25 where id = 1;
  perform set_config('app.silent', '0', true);
end $$;

create or replace function public.reset_awards()
returns void language plpgsql security definer set search_path = public as $$
begin
  if public.app_role() is distinct from 'ADMIN' then
    raise exception 'Hanya administrator yang dapat mengembalikan data awal';
  end if;
  perform public.seed_awards();
  insert into public.audit_log (actor, action, detail)
  values (public.actor_name(), 'Reset data', 'Peserta, nilai, dan bobot dikembalikan ke data acuan awal');
end $$;

create or replace function public.log_event(p_action text, p_detail text default '')
returns void language plpgsql security definer set search_path = public as $$
begin
  if public.app_role() is distinct from 'ADMIN' then
    raise exception 'Hanya administrator';
  end if;
  insert into public.audit_log (actor, action, detail)
  values (public.actor_name(), left(p_action, 80), left(coalesce(p_detail, ''), 300));
end $$;

-- Isi data awal hanya jika tabel peserta masih kosong
do $$ begin
  if not exists (select 1 from public.participants) then perform public.seed_awards(); end if;
end $$;

-- ---------- Hak akses fungsi ----------
revoke all on function public.seed_awards() from public, anon, authenticated;
revoke all on function public.reset_awards() from public, anon;
revoke all on function public.log_event(text, text) from public, anon;
grant execute on function public.reset_awards() to authenticated;
grant execute on function public.log_event(text, text) to authenticated;

-- ---------- Row Level Security: aturan akses ditegakkan di database ----------
alter table public.profiles     enable row level security;
alter table public.participants enable row level security;
alter table public.evaluations  enable row level security;
alter table public.weights      enable row level security;
alter table public.audit_log    enable row level security;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated
  using (id = auth.uid() or public.app_role() = 'ADMIN');

drop policy if exists participants_read on public.participants;
create policy participants_read on public.participants for select to authenticated using (true);
drop policy if exists participants_admin_write on public.participants;
create policy participants_admin_write on public.participants for all to authenticated
  using (public.app_role() = 'ADMIN') with check (public.app_role() = 'ADMIN');

-- Juri hanya melihat dan mengubah nilainya sendiri (penilaian buta); admin hanya membaca.
drop policy if exists evaluations_read on public.evaluations;
create policy evaluations_read on public.evaluations for select to authenticated
  using (public.app_role() = 'ADMIN' or judge_id = public.app_role());
drop policy if exists evaluations_judge_insert on public.evaluations;
create policy evaluations_judge_insert on public.evaluations for insert to authenticated
  with check (judge_id = public.app_role() and public.app_role() in ('J1', 'J2'));
drop policy if exists evaluations_judge_update on public.evaluations;
create policy evaluations_judge_update on public.evaluations for update to authenticated
  using (judge_id = public.app_role()) with check (judge_id = public.app_role());
drop policy if exists evaluations_judge_delete on public.evaluations;
create policy evaluations_judge_delete on public.evaluations for delete to authenticated
  using (judge_id = public.app_role());

drop policy if exists weights_read on public.weights;
create policy weights_read on public.weights for select to authenticated using (true);
drop policy if exists weights_admin_update on public.weights;
create policy weights_admin_update on public.weights for update to authenticated
  using (public.app_role() = 'ADMIN') with check (public.app_role() = 'ADMIN');

drop policy if exists audit_admin_read on public.audit_log;
create policy audit_admin_read on public.audit_log for select to authenticated
  using (public.app_role() = 'ADMIN');

-- ---------- Realtime (data tampil langsung di semua perangkat) ----------
do $$
declare t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['participants', 'evaluations', 'weights', 'audit_log'] loop
      begin
        execute format('alter publication supabase_realtime add table public.%I', t);
      exception when duplicate_object then null;
      end;
    end loop;
  end if;
end $$;
