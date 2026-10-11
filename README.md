# 📚 Baca - Web EPUB Reader & Admin Portal

Aplikasi Web Pembaca EPUB (*Electronic Publication*) berbasis Cloud Supabase yang modern, responsif, dan kaya fitur. Dilengkapi dengan sistem anotasi kutipan, penyorotan teks (*highlight* presisi), sinkronisasi progres membaca, serta manajemen buku dengan mode Admin & Pembaca.

---

## ✨ Fitur Utama

- 📖 **EPUB Rendering Modern**:
  - Ditenagai oleh `epub.js` dengan performa tinggi.
  - Navigasi bab & pagination yang mulus.
  - Pilihan tipografi premium: *Merriweather, Literata, Lora, Inter, Plus Jakarta Sans*, dan font ramah disleksia (*OpenDyslexic*).
  - Skala ukuran huruf (*zoom* 70% – 200%).
  - 3 Mode Tema Membaca: **Terang (*Light*)**, **Sepia Hangat (*Eye-care*)**, dan **Gelap (*Dark Mode*)**.
- 🖍️ **Penyorotan & Anotasi Pintar**:
  - Penyorotan teks multi-warna (*Kuning, Hijau, Biru, Merah Muda*).
  - Garis bawah (*underline*).
  - Catatan pribadi (*sticky note*) pada kalimat pilihan.
  - **Accurate Text-Node Range Bounding**: Penyorotan presisi membungkus teks nyata tanpa kotak berlebih pada jeda baris/kidung/puisi.
  - Laci (*drawer*) daftar seluruh anotasi dan catatan buku.
- ☁️ **Integrasi Supabase Cloud**:
  - Penyimpanan file buku terenkripsi di Supabase Storage (Private Bucket).
  - Database PostgreSQL untuk sinkronisasi `profiles`, `books`, `annotations`, dan `reading_progress`.
  - Otomatisasi pendaftaran dan keamanan menggunakan *Row Level Security (RLS)*.
- 💾 **Dukungan Offline & Penyimpanan Lokal (IndexedDB)**:
  - Tetap dapat digunakan secara instan tanpa login Supabase.
  - Berkas buku lokal tersimpan permanen di **IndexedDB browser** (tidak akan hilang saat halaman di-refresh).
- 🛡️ **Role Switcher (Admin & Pembaca)**:
  - Mode **Admin**: Unggah file `.epub` baru dan hapus buku dari katalog.
  - Mode **Pembaca**: Jelajahi buku, buat catatan pribadi, dan nikmati bacaan.

---

## 🚀 Memulai Proyek (Getting Started)

### 1. Klon Repositori
```bash
git clone https://github.com/Mikhael20-tech/baca_buku.git
cd baca_buku
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan (.env)
Salin berkas `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi nilai URL proyek dan Anon Key dari Supabase:
```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-or-publishable-key>
```

### 4. Setup Database Supabase
1. Buka menu **SQL Editor** di Dashboard Supabase.
2. Salin dan jalankan seluruh isi berkas [`supabase/schema.sql`](supabase/schema.sql).
3. Di menu **Storage**, buat 2 bucket:
   - `books` (Private Bucket)
   - `book-covers` (Public Bucket)

### 5. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di `http://localhost:5173`.

---

## 🛠️ Teknologi yang Digunakan
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS + Lucide React Icons
- **EPUB Engine**: `epubjs` + `marks-pane`
- **Backend & Storage**: Supabase (PostgreSQL, Auth, Storage)
- **Local Database**: IndexedDB

---

## 📄 Lisensi
Didistribusikan di bawah lisensi MIT.
