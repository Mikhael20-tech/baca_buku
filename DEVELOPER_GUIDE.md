# 📘 Developer Guide & Architectural Handbook
## 📚 Baca — Cloud EPUB Reader, Multi-Version Bible Suite & Hymnal Platform

> Panduan lengkap arsitektur, struktur data, dan panduan modifikasi teknis bagi pengembang (*developer*) yang ingin memodifikasi, memelihara, atau mengembangkan aplikasi ini lebih lanjut.

---

## 📑 Daftar Isi
1. [Ikhtisar Proyek & Arsitektur](#1-ikhtisar-proyek--arsitektur)
2. [Teknologi yang Digunakan](#2-teknologi-yang-digunakan)
3. [Struktur Direktori Proyek](#3-struktur-direktori-proyek)
4. [Modul Utama & Komponen Frontend](#4-modul-utama--komponen-frontend)
5. [Struktur Data JSON (Alkitab & Kidung)](#5-struktur-data-json-alkitab--kidung)
6. [Panduan Kustomisasi & Modifikasi](#6-panduan-kustomisasi--modifikasi)
   - [Ganti Nama, Logo, & Favicon](#ganti-nama-logo--favicon)
   - [Ubah Palet Warna & Styling](#ubah-palet-warna--styling)
   - [Menambah / Mengedit Buku Alkitab](#menambah--mengedit-buku-alkitab)
   - [Menambah / Mengedit Dokumen Scofield](#menambah--mengedit-dokumen-scofield)
   - [Menambah / Mengedit Kidung Rohani](#menambah--mengedit-kidung-rohani)
   - [Mengelola Buku EPUB di Katalog](#mengelola-buku-epub-di-katalog)
7. [Integrasi Backend (Supabase & IndexedDB)](#7-integrasi-backend-supabase--indexeddb)
8. [Menjalankan di Lokal & Build Produksi](#8-menjalankan-di-lokal--build-produksi)
9. [Panduan Deploy ke Server (Vercel / VPS / Netlify)](#9-panduan-deploy-ke-server)

---

## 1. Ikhtisar Proyek & Arsitektur

Aplikasi ini merupakan **Platform Web Multifungsi** yang menggabungkan:
1. **Cloud EPUB Reader**: Pembaca buku digital EPUB berbasis `epub.js` dengan penyorotan teks (*highlight* presisi), bookmark, dan catatan pribadi.
2. **Tri-Version Bible Study Suite**:
   * **Bahasa Indonesia (Pemulihan)**: Teks lengkap 66 kitab + garis besar + catatan kaki teologis mendalam.
   * **English (Recovery Version)**: Teks paralel bahasa Inggris.
   * **Scofield Reference Bible (1917)**: Teks KJV otentik dengan catatan kaki C.I. Scofield, margin rujukan silang, penanggalan kronologis Ussher, rantai topik subjek, serta risalah kanonik (*Introduction, Preface, Panoramic View, Pentateuch, From Malachi to Matthew, The Four Gospels*).
   * **Scofield Classic 1917 View**: Tampilan cetak 3-kolom fotorealistik menyerupai naskah asli Oxford University Press 1917.
3. **Kidung Rohani (Hymnal Player & Reader)**: 786 kidung rohani dengan indeks 29 kategori tematik, nada/birama, dan pencarian cepat bait & refrain.
4. **Offline First Architecture**: Semua data Alkitab dan Kidung disimpan dalam file JSON statis di folder `public/`, sehingga aplikasi berjalan sangat kencang tanpa ketergantungan API eksternal yang lambat.

---

## 2. Teknologi yang Digunakan

* **Runtime & Bundler**: [Vite](https://vitejs.dev/) (Cepat, HMR instan)
* **Framework**: [React 19](https://react.dev/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Vanilla CSS untuk tata letak khusus cetak
* **Komponen UI**: [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
* **Ikon**: [Lucide React](https://lucide.dev/)
* **EPUB Engine**: `epubjs`
* **Database & Auth (Opsional)**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
* **Penyimpanan Offline**: Browser `IndexedDB` & `localStorage`

---

## 3. Struktur Direktori Proyek

```text
baca_buku/
├── index.html                   # HTML Entry point (Title, Favicon, Meta Tags)
├── package.json                 # Daftar dependensi dan scripts npm
├── vite.config.js               # Konfigurasi Vite & path alias (@/ -> src/)
├── tailwind.config.js           # Konfigurasi Tailwind CSS
│
├── public/                      # Asset statis & Database JSON mandiri
│   ├── bible/                   # Data Alkitab Bahasa Indonesia (66 kitab .json)
│   │   ├── en/                  # Data Alkitab Bahasa Inggris (66 kitab .json)
│   │   └── scofield/            # Data Alkitab Scofield 1917 (.json)
│   │       ├── frontmatter_scofield_1917.json # Risalah lengkap (6 dokumen)
│   │       ├── scofield_topical_index.json    # Indeks topik rantai Scofield
│   │       └── [kitab].json     # Teks per kitab (Kejadian s/d Wahyu)
│   ├── kidung/                  # Data Kidung Rohani (1 s/d 786)
│   ├── books/                   # Berkas buku .epub lokal
│   └── covers/                  # Gambar sampul buku / kidung
│
├── src/
│   ├── App.jsx                  # Root state & view switcher (Landing, Reader, Bible, Kidung)
│   ├── main.jsx                 # React entry point
│   ├── index.css                # Style global, font custom & tema
│   │
│   ├── components/              # Komponen antarmuka pengguna
│   │   ├── BibleReaderView.jsx          # Pembaca Alkitab Modern (Paralel, Catatan Kaki, Rujukan)
│   │   ├── BibleScofieldClassicView.jsx # Replika Cetak 1917 (3 Kolom Asli, Margin, Kronologi)
│   │   ├── BibleIntroModal.jsx          # Modal Pengantar Kitab & Dokumen Kanonik Scofield
│   │   ├── BibleChainModal.jsx          # Modal Pelacak Indeks Rantai Topik Scofield
│   │   ├── BibleBookmarksModal.jsx      # Modal Ayat Favorit & Bookmark
│   │   ├── BibleGlobalSearchModal.jsx   # Pencarian Global 66 Kitab
│   │   ├── KidungReaderView.jsx         # Pembaca & Pemutar Kidung Rohani
│   │   ├── CloudEpubReader.jsx          # Pembaca EPUB
│   │   ├── Navbar.jsx                   # Navigasi utama
│   │   ├── LandingPage.jsx              # Halaman beranda
│   │   └── ui/                          # Komponen atomic (Button, Dialog, Badge, dll.)
│   │
│   └── lib/                     # Helper & Storage Utilities
│       ├── supabase.js          # Koneksi client Supabase
│       ├── bookStorage.js       # Manajemen IndexedDB lokal
│       └── accessControl.js     # Kontrol akses & tier pengguna
│
└── scripts/                     # Python data-engineering scripts
    ├── build_full_bible_pb_pl.py# Parser & generator data Alkitab
    ├── extract_scofield_frontmatter.py # Ekstraktor dokumen pengantar Scofield
    └── validate_all.py          # Script validator integritas JSON
```

---

## 4. Modul Utama & Komponen Frontend

### A. View Switcher (`src/App.jsx`)
Navigasi halaman diatur melalui state `currentView`:
* `'landing'`: Halaman depan / beranda.
* `'bible'`: Menampilkan `<BibleReaderView />` (pembaca Alkitab).
* `'kidung'`: Menampilkan `<KidungReaderView />` (pembaca Kidung).
* `'reader'`: Menampilkan `<CloudEpubReader />` (pembaca file EPUB).
* `'dashboard'`: Panel profil pengguna & progres membaca.
* `'admin'`: Panel pengelolaan buku bagi admin.

### B. Pembaca Alkitab Modern (`src/components/BibleReaderView.jsx`)
* Mendukung mode tampilan **Bahasa Indonesia**, **Bahasa Inggris**, dan **Scofield 1917**.
* Tampilan paralel *side-by-side* ayat ID & EN.
* Klik angka catatan kaki membuka popover interaktif rujukan silang.
* Fitur salin ayat, generator kartu ayat estetik (*share card*), dan stabilo multi-warna.

### C. Pembaca Scofield Cetak Klasik (`src/components/BibleScofieldClassicView.jsx`)
* Mengadopsi tata letak resmi **Oxford University Press 1917**:
  1. **Kolom Kiri**: Teks ayat paruh pertama.
  2. **Kolom Tengah (Margin)**: Penanggalan kronologi Ussher (*B.C./A.D.*), huruf rujukan silang, dan ringkasan rantai topik.
  3. **Kolom Kanan**: Teks lanjutan ayat paruh kedua.
  4. **Bagian Bawah**: Catatan kaki teologis berwarna merah hati (*Dark Crimson Red #8B0000*).
  5. **Transisi Maleakhi 4 & Matius 1**: Akses langsung ke risalah *From Malachi to Matthew* dan *The Four Gospels*.

---

## 5. Struktur Data JSON (Alkitab & Kidung)

### Format JSON Alkitab (`public/bible/scofield/<kitab>.json`)
```json
{
  "id": "maleakhi",
  "name": "Malachi",
  "chapters_count": 4,
  "intro": {
    "text": "Ringkasan kitab...",
    "html": "<p>Format html...</p>"
  },
  "chapters": {
    "4": {
      "verses": [
        {
          "verse": 1,
          "text": "For, behold, the day cometh, that shall burn as an oven...",
          "outlines": "The day of the Lord"
        }
      ],
      "footnotes": [
        {
          "verse": 6,
          "note_idx": 3,
          "footnote_number": 3,
          "letter": "h",
          "keyword": "From Malachi to Matthew",
          "text": "The close of the Old Testament canon left Israel..."
        }
      ]
    }
  }
}
```

### Format Risalah Scofield (`public/bible/scofield/frontmatter_scofield_1917.json`)
Berisi 6 risalah teologis:
1. `preface`: Preface to the Present Edition (1917).
2. `introduction`: The Original Scofield Introduction (1909).
3. `panoramic_view`: A Panoramic View of the Bible.
4. `the_pentateuch`: The Pentateuch.
5. `from_malachi_to_matthew`: Sejarah masa 400 tahun keheningan profetik.
6. `four_gospels`: Dokumen pengantar kanonik 4 Injil.

---

## 6. Panduan Kustomisasi & Modifikasi

### Ganti Nama, Logo, & Favicon
1. Buka [index.html](file:///d:/Magang/Baca/index.html):
   * Ubah tag `<title>` dan `<meta name="description">`.
   * Ganti favicon di `<link rel="icon" href="/favicon.ico" />`.
2. Buka [src/App.jsx](file:///d:/Magang/Baca/src/App.jsx) atau [src/components/Navbar.jsx](file:///d:/Magang/Baca/src/components/Navbar.jsx):
   * Cari teks `Baca` atau judul logo dan sesuaikan dengan merek baru Anda.

### Ubah Palet Warna & Styling
* Palet warna utama menggunakan Tailwind CSS (dominan `amber-600`, `amber-500`, dan `stone`).
* Jika ingin mengganti tema warna emas/amber menjadi biru modern, cari dan ganti kelas `amber-` dengan `blue-` atau warna yang Anda inginkan di komponen terkait.
* Pengaturan font klasik dapat diubah di [src/index.css](file:///d:/Magang/Baca/src/index.css).

### Menambah / Mengedit Buku Alkitab
Cukup edit file JSON di folder `public/bible/`:
* Tambahkan teks ayat pada properti `"verses"`.
* Tambahkan catatan kaki pada properti `"footnotes"`.
* Tidak perlu mengubah kode React, aplikasi akan otomatis membaca data JSON terbaru.

### Menambah / Mengedit Dokumen Scofield
Buka [public/bible/scofield/frontmatter_scofield_1917.json](file:///d:/Magang/Baca/public/bible/scofield/frontmatter_scofield_1917.json):
* Setiap dokumen memiliki properti `"title"`, `"pages"`, dan array `"paragraphs"`.
* Anda dapat menambah bab atau memperbaiki kalimat langsung di berkas ini.

---

## 7. Integrasi Backend (Supabase & IndexedDB)

Aplikasi dirancang **Hybrid**:
1. **Mode Offline (Default)**: Jika Supabase tidak dikonfigurasi, aplikasi tetap berfungsi 100%. Data bookmark, riwayat membaca, dan catatan tersimpan di `localStorage` dan `IndexedDB`.
2. **Mode Cloud (Supabase)**:
   * Buat akun di [Supabase.com](https://supabase.com).
   * Buat file `.env` di root proyek:
     ```env
     VITE_SUPABASE_URL=https://proyek-anda.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
     ```
   * Jalankan schema database di `supabase/schema.sql`.

---

## 8. Menjalankan di Lokal & Build Produksi

### Kebutuhan Sistem:
* **Node.js** v18.0.0 atau lebih baru
* **npm** atau **pnpm** / **yarn**

### Perintah:
```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan server lokal (pengembangan)
npm run dev
# Akses di browser: http://localhost:5173

# 3. Uji build produksi
npm run build

# 4. Pratinjau build produksi
npm run preview
```

---

## 9. Panduan Deploy ke Server

### A. Deploy ke Vercel (Paling Direkomendasikan)
1. Buat akun di [Vercel](https://vercel.com).
2. Hubungkan repositori GitHub proyek ini.
3. Vercel akan otomatis mendeteksi framework **Vite**.
4. Klik **Deploy**. Web akan live dalam 1-2 menit.

### B. Deploy ke Netlify
1. Hubungkan repositori GitHub ke Netlify.
2. Atur **Build command**: `npm run build`
3. Atur **Publish directory**: `dist`
4. Buat file `public/_redirects` dengan isi `/* /index.html 200` untuk mendukung Single Page Application (SPA).

### C. Deploy ke VPS (Nginx)
1. Jalankan `npm run build` di server.
2. Arahkan direktori root Nginx ke folder `dist/`.
3. Tambahkan konfigurasi `try_files $uri $uri/ /index.html;` agar routing SPA tidak 404 saat refresh.

---

## 💡 Bantuan & Dukungan Teknis
Jika ada pertanyaan atau butuh bantuan integrasi lebih lanjut, seluruh kode telah dilengkapi komentar penjelas yang jelas di setiap fungsi utama komponen. Selamat mengembangkan!
