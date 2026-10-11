-- ============================================================
-- SKEMA LENGKAP SUPABASE: WEB EPUB READER & ADMIN PORTAL
-- Jalankan script ini secara langsung di SQL Editor Supabase
-- ============================================================

-- ============================================================
-- 1. EXTENSIONS & ENUMS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('admin', 'reader');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.account_status AS ENUM ('active', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.annotation_type AS ENUM ('highlight', 'underline', 'note');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- 2. TABEL PROFILES (Terhubung ke Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role public.user_role DEFAULT 'reader' NOT NULL,
  status public.account_status DEFAULT 'active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Otomatis buat profil saat pengguna register via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'reader'),
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- 3. TABEL BOOKS (Koleksi Buku EPUB)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT DEFAULT 'Umum',
  description TEXT,
  cover_url TEXT,
  file_path TEXT NOT NULL, -- Path file di Supabase Storage bucket 'books'
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. TABEL ANNOTATIONS (Highlight, Underline & Catatan Kalimat)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cfi_range TEXT NOT NULL,           -- Posisi Canonical Fragment Identifier EPUB
  selected_text TEXT NOT NULL,       -- Kalimat kutipan yang disorot
  type public.annotation_type NOT NULL DEFAULT 'highlight',
  color TEXT DEFAULT '#fef08a',      -- Hex color code
  comment TEXT,                      -- Isi catatan pribadi (opsional)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_annotations_book_user ON public.annotations(book_id, user_id);

-- ============================================================
-- 5. TABEL READING PROGRESS (Posisi Terakhir & Persentase)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_cfi TEXT NOT NULL,
  percentage NUMERIC(5, 2) DEFAULT 0.00,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, user_id)
);

-- ============================================================
-- 6. ATURAN ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

-- Helper Function: Verifikasi apakah eksekutor adalah Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Kebijakan Profiles
DROP POLICY IF EXISTS "Pengguna aktif dapat melihat semua profil" ON public.profiles;
CREATE POLICY "Pengguna aktif dapat melihat semua profil"
  ON public.profiles FOR SELECT TO authenticated
  USING (status = 'active');

DROP POLICY IF EXISTS "Admin dapat mengubah data profil pengguna" ON public.profiles;
CREATE POLICY "Admin dapat mengubah data profil pengguna"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin());

-- Kebijakan Books
DROP POLICY IF EXISTS "Pengguna aktif dapat membaca katalog buku" ON public.books;
CREATE POLICY "Pengguna aktif dapat membaca katalog buku"
  ON public.books FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'active'));

DROP POLICY IF EXISTS "Hanya Admin yang dapat menambah buku" ON public.books;
CREATE POLICY "Hanya Admin yang dapat menambah buku"
  ON public.books FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Hanya Admin yang dapat memperbarui buku" ON public.books;
CREATE POLICY "Hanya Admin yang dapat memperbarui buku"
  ON public.books FOR UPDATE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Hanya Admin yang dapat menghapus buku" ON public.books;
CREATE POLICY "Hanya Admin yang dapat menghapus buku"
  ON public.books FOR DELETE TO authenticated
  USING (public.is_admin());

-- Kebijakan Annotations
DROP POLICY IF EXISTS "Pengguna hanya dapat melihat anotasinya sendiri" ON public.annotations;
CREATE POLICY "Pengguna hanya dapat melihat anotasinya sendiri"
  ON public.annotations FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Pengguna hanya dapat membuat anotasi untuk dirinya sendiri" ON public.annotations;
CREATE POLICY "Pengguna hanya dapat membuat anotasi untuk dirinya sendiri"
  ON public.annotations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Pengguna hanya dapat memperbarui anotasinya sendiri" ON public.annotations;
CREATE POLICY "Pengguna hanya dapat memperbarui anotasinya sendiri"
  ON public.annotations FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Pengguna hanya dapat menghapus anotasinya sendiri" ON public.annotations;
CREATE POLICY "Pengguna hanya dapat menghapus anotasinya sendiri"
  ON public.annotations FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Kebijakan Reading Progress
DROP POLICY IF EXISTS "Pengguna hanya dapat mengelola progres bacanya sendiri" ON public.reading_progress;
CREATE POLICY "Pengguna hanya dapat mengelola progres bacanya sendiri"
  ON public.reading_progress FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 7. KEBIJAKAN STORAGE BUCKETS (books & book-covers)
-- ============================================================
-- Buat bucket melalui menu Storage Supabase:
-- 1. 'books' -> Private Bucket
-- 2. 'book-covers' -> Public Bucket

DROP POLICY IF EXISTS "Admin mengunggah file buku" ON storage.objects;
CREATE POLICY "Admin mengunggah file buku"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'books' AND public.is_admin());

DROP POLICY IF EXISTS "Pengguna membaca file buku" ON storage.objects;
CREATE POLICY "Pengguna membaca file buku"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'books' AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'active'
  ));

DROP POLICY IF EXISTS "Admin menghapus file buku" ON storage.objects;
CREATE POLICY "Admin menghapus file buku"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'books' AND public.is_admin());

DROP POLICY IF EXISTS "Public membaca book-covers" ON storage.objects;
CREATE POLICY "Public membaca book-covers"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'book-covers');

DROP POLICY IF EXISTS "Admin mengunggah book-covers" ON storage.objects;
CREATE POLICY "Admin mengunggah book-covers"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'book-covers' AND public.is_admin());
