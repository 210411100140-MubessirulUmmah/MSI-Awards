-- =====================================================================
-- Hubungkan akun login dengan peran. Jalankan SETELAH schema.sql.
-- 1) Supabase > Authentication > Users > Add user (centang Auto Confirm User)
--    buat 3 akun: admin, juri 1, juri 2 (email + kata sandi bebas, min. 6 karakter).
-- 2) Ganti tiga email di bawah dengan email akun tadi, lalu Run.
-- =====================================================================
insert into public.profiles (id, role, name, title, institution)
select id, 'ADMIN', 'Administrator Sekretariat Awards', 'Head of Evaluation Committee', 'Sekretariat Dewan Juri MSI Group'
from auth.users where email = 'admin@contoh.com'
on conflict (id) do update set role = excluded.role, name = excluded.name, title = excluded.title, institution = excluded.institution;

insert into public.profiles (id, role, name, title, institution)
select id, 'J1', 'Dr. Hendra Prasetya, M.Sc', 'Lead Technology Assessor', 'Komite Riset & Evaluasi Teknologi MSI Group'
from auth.users where email = 'juri1@contoh.com'
on conflict (id) do update set role = excluded.role, name = excluded.name, title = excluded.title, institution = excluded.institution;

insert into public.profiles (id, role, name, title, institution)
select id, 'J2', 'Ir. Maya Anggraeni, MBA', 'Principal Business Strategy Assessor', 'Direktorat Transformasi Bisnis MSI Group'
from auth.users where email = 'juri2@contoh.com'
on conflict (id) do update set role = excluded.role, name = excluded.name, title = excluded.title, institution = excluded.institution;
