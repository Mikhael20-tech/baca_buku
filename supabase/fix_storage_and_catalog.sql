-- ============================================================
-- SCRIPT AKTIVASI UPLOAD CLOUD SUPABASE UNTUK ADMIN & PELANGGAN
-- Jalankan script ini di Dashboard Supabase -> SQL Editor -> New Query -> Run
-- ============================================================

-- 1. Pastikan bucket 'books' dan 'book-covers' dibuat dan dapat diakses
INSERT INTO storage.buckets (id, name, public) 
VALUES ('books', 'books', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Beri izin upload dan baca file buku di Supabase Storage
DROP POLICY IF EXISTS "Public membaca buku" ON storage.objects;
CREATE POLICY "Public membaca buku"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id IN ('books', 'book-covers'));

DROP POLICY IF EXISTS "Admin mengunggah file buku" ON storage.objects;
CREATE POLICY "Admin mengunggah file buku"
  ON storage.objects FOR INSERT TO public
  WITH CHECK (bucket_id IN ('books', 'book-covers'));

DROP POLICY IF EXISTS "Admin memperbarui file buku" ON storage.objects;
CREATE POLICY "Admin memperbarui file buku"
  ON storage.objects FOR UPDATE TO public
  USING (bucket_id IN ('books', 'book-covers'));

DROP POLICY IF EXISTS "Admin menghapus file buku" ON storage.objects;
CREATE POLICY "Admin menghapus file buku"
  ON storage.objects FOR DELETE TO public
  USING (bucket_id IN ('books', 'book-covers'));

-- 3. Beri izin tabel 'books' agar semua pelanggan bisa membaca & admin bisa menambah buku
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Semua pelanggan dapat membaca katalog buku" ON public.books;
CREATE POLICY "Semua pelanggan dapat membaca katalog buku"
  ON public.books FOR SELECT TO public
  USING (true);

DROP POLICY IF EXISTS "Admin dapat menambah buku ke katalog" ON public.books;
CREATE POLICY "Admin dapat menambah buku ke katalog"
  ON public.books FOR INSERT TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin dapat memperbarui buku" ON public.books;
CREATE POLICY "Admin dapat memperbarui buku"
  ON public.books FOR UPDATE TO public
  USING (true);

DROP POLICY IF EXISTS "Admin dapat menghapus buku dari katalog" ON public.books;
CREATE POLICY "Admin dapat menghapus buku dari katalog"
  ON public.books FOR DELETE TO public
  USING (true);
