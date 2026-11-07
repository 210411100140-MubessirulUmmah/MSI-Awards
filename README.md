# MSI Group Awards: Sistem Penilaian Dewan Juri

Aplikasi web penilaian awards. Data disimpan di database **Supabase (PostgreSQL)**, sehingga nilai yang diisi juri di satu perangkat langsung tampil di perangkat admin (realtime).

## Fitur
- Login per akun (admin, Juri 1, Juri 2) dengan aturan akses yang ditegakkan di database (Row Level Security)
- Juri hanya melihat dan mengubah nilainya sendiri (penilaian buta); admin melihat semua dan mengatur bobot
- Skor 0 sampai 5, bobot dinamis (total harus 100), validasi di aplikasi **dan** di database
- Rekapitulasi, dashboard, peringkat (seri berbagi peringkat), ekspor CSV, berita acara cetak
- Riwayat perubahan otomatis (dicatat trigger database, tidak bisa dipalsukan dari aplikasi)

## Aturan perhitungan
- Nilai juri = jumlah (skor ÷ 5 × bobot) tiap kriteria.
- Nilai perusahaan = rata-rata nilai juri yang belum dibulatkan, lalu dibulatkan 1 desimal.
- Juri belum mengisi: peserta berstatus Belum Lengkap / Dalam Proses, tanpa nilai akhir dan peringkat (bukan nol).

## Setup (sekali saja)
1. **Buat project** di https://supabase.com (paket gratis cukup).
2. **Buat tabel dan aturan akses:** SQL Editor > New query > tempel isi `supabase/schema.sql` > Run.
3. **Buat 3 akun:** Authentication > Users > Add user (centang *Auto Confirm User*), mis. `admin@...`, `juri1@...`, `juri2@...` dengan kata sandi min. 6 karakter.
4. **Tetapkan peran:** buka `supabase/profiles.sql`, ganti tiga email dengan email akun tadi, lalu Run di SQL Editor.
5. **Salin kunci:** Project Settings > API. Salin `.env.example` menjadi `.env`, isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` (kunci *anon public*).
6. Jalankan:
   ```
   npm install
   npm run dev      # http://localhost:3000
   ```

## Agar bisa dibuka dari perangkat lain
Data sudah di cloud, jadi tinggal membuka aplikasinya. Paling mudah: deploy ke Vercel (Import project, lalu isi dua *Environment Variables* yang sama dengan `.env`), kemudian bagikan alamatnya ke juri.

## Keamanan
- Kunci `anon` memang publik. Data dilindungi aturan RLS di `supabase/schema.sql`.
- **Jangan pernah** memakai kunci `service_role` di aplikasi ini.
- Jangan commit berkas `.env`.

## Perintah
`npm run build` (produksi), `npm run lint` (cek tipe).
