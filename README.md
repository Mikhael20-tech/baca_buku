# 📚 Baca — Cloud EPUB Reader, Multi-Version Bible Suite & Hymnal Platform

[![Vite](https://img.shields.io/badge/Vite-v8.3-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

Aplikasi Web modern berstandar industri untuk membaca **Buku Digital (EPUB)**, melakukan studi mendalam **Alkitab Multi-Versi (ID Pemulihan, EN Recovery, & Scofield Reference Bible 1917)**, serta menjelajahi **Kidung Rohani (786 Kidung)**.

Dilengkapi dengan replika cetak **Scofield Classic 1917 (3 Kolom Otentik Oxford University Press)**, sistem anotasi stabilo presisi, sinkronisasi cloud Supabase, serta dukungan **100% Offline via IndexedDB**.

> 📖 **Panduan Pengembang Lengkap**: Untuk arsitektur teknis, panduan kustomisasi, dan cara memodifikasi aplikasi ini, silakan baca [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md).

---

## ✨ Fitur-Fitur Unggulan

### 1. 📖 Alkitab Multi-Versi & Scofield Study Bible
* **Tiga Terjemahan Paralel**:
  * **Bahasa Indonesia (Pemulihan)**: Lengkap 66 kitab dengan garis besar terstruktur dan catatan kaki teologis.
  * **English (Recovery Version)**: Teks pembanding bahasa Inggris.
  * **Scofield Reference Bible (1917)**: Teks King James Version (KJV) dengan catatan C.I. Scofield, rujukan silang rantai topik, dan penanggalan Ussher.
* **📜 Tampilan Cetak Scofield 1917 Klasik (*Classic View*)**:
  * Tata letak **3 kolom otentik**: Kolom kiri & kanan untuk teks firman, kolom tengah 130px untuk kronologi & rujukan silang, serta panel catatan kaki merah hati (*Dark Crimson Red #8B0000*).
  * **Risalah Kanonik Lengkap**: Preface 1917, Introduction 1909, Panoramic View, The Pentateuch, *From Malachi to Matthew (400 Silent Years)*, dan *The Four Gospels*.
  * Pelacak **Indeks Rantai Topik** (*Chain Topics Tracker*).
* **Fitur Interaktif Studi**:
  * Popover catatan kaki instan dengan tautan rujukan silang antar-kitab.
  * Pembuat Kartu Ayat Estetik (*Share Verse Card Generator*) siap unduh/bagikan.
  * Pembanding 3 Versi sekaligus dalam satu dialog (*Compare Verses*).
  * Penanda ayat favorit (*Bookmarks*) & pencarian global di 66 kitab.

### 2. 🎵 Kidung Rohani (Hymnal Player & Reader)
* Koleksi lengkap **786 Kidung Rohani** Indonesia.
* Indeks tematik **29 kategori** pujian dan penyembahan.
* Navigasi cepat nomor kidung, lirik bait, koor/refrain, nada, dan birama.
* Pencarian teks lirik instan.

### 3. 📚 Cloud EPUB Reader Modern
* Didukung mesin render performa tinggi `epub.js`.
* Navigasi bab & paginasi mulus.
* Pilihan tipografi premium (*Merriweather, Literata, Lora, Inter, Plus Jakarta Sans, OpenDyslexic*).
* Tiga tema membaca: **Terang (*Light*)**, **Sepia Hangat (*Eye-care*)**, dan **Gelap (*Dark Mode*)**.
* Penyorotan teks multi-warna (*highlight*) dengan pembungkus teks presisi (*accurate text bounding*).

### 4. ⚡ Arsitektur Cepat & Dukungan Offline (IndexedDB)
* **Zero Latency**: Semua data Alkitab dan Kidung disimpan dalam file JSON mandiri di folder `public/`, dapat diakses instan tanpa membebani server backend.
* **Offline First**: Tetap berfungsi penuh tanpa koneksi internet melalui penyimpanan browser lokal (`IndexedDB` & `localStorage`).
* **Cloud Sync (Supabase)**: Opsional untuk sinkronisasi profil, buku kustom, dan catatan lintas perangkat.

---

## 🚀 Memulai Proyek (Quick Start)

### 1. Klon Repositori
```bash
git clone https://github.com/Mikhael20-tech/baca_buku.git
cd baca_buku
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka browser pada alamat: `http://localhost:5173`

### 4. Build untuk Produksi
```bash
npm run build
```
Hasil build akan berada di direktori `dist/` dan siap diunggah ke hosting mana pun.

---

## 📂 Struktur Utama Proyek

```text
├── public/                      # Asset statis & Database JSON mandiri
│   ├── bible/                   # Data Alkitab Indonesia (66 kitab .json)
│   │   ├── en/                  # Data Alkitab Inggris (66 kitab .json)
│   │   └── scofield/            # Data Scofield 1917 & Risalah Dokumen Kanonik
│   ├── kidung/                  # Data Kidung Rohani (1 s/d 786)
│   └── books/                   # Berkas buku EPUB
├── src/
│   ├── App.jsx                  # Root state & view controller
│   ├── components/              # Komponen antarmuka (Bible, Classic, Kidung, EPUB)
│   └── lib/                     # Utilitas penyimpanan & akses
└── DEVELOPER_GUIDE.md           # Panduan lengkap kustomisasi & pengembangan
```

---

## 🛠️ Stack Teknologi
* **Frontend**: React 19, Vite, Tailwind CSS v4
* **Icons**: Lucide React
* **Components**: Radix UI / shadcn/ui
* **EPUB Engine**: `epubjs` + `marks-pane`
* **Penyimpanan**: IndexedDB + Supabase (Opsional)

---

## 📄 Lisensi
Didistribusikan di bawah lisensi [MIT](LICENSE). Bebas digunakan, dimodifikasi, dan dikembangkan untuk keperluan pribadi maupun komersial.
