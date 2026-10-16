# Panduan Pengembangan Web: Scofield Reference Bible (Edisi 1917)

Dokumentasi ini berisi langkah-langkah lengkap untuk membangun aplikasi web Alkitab Scofield Edisi 1917 yang meniru tata letak fisik buku aslinya (*page-for-page layout*: Pengantar Kitab, 2 Kolom Ayat, 1 Kolom Tengah Referensi/Tahun, Subjudul di sela-sela ayat, dan Panel Catatan Kaki di bagian bawah halaman).

---

## 1. Daftar File Bahan Baku (Wajib Diunduh)

Buat folder `raw-data/` di dalam proyek Anda dan unduh keempat file berikut:

### A. Database Catatan & Indeks Scofield (dari BibleSupport)
Dari halaman unduhan *Scofield Reference Bible Notes with Topical Index (Updated)* di [BibleSupport.com](http://www.biblesupport.com/e-sword-downloads/file/7484-scofield-ci-scofield-reference-bible-notes-with-topical-index-updated/), pilih dua file berformat HTML-SQLite berikut:
1. **`scofield_reference_notes.cmti` (2.49 MB)**
   * **Penting:** Pilih yang berekstensi `.cmti` (format HTML bersih), **bukan** `.cmtx` (format RTF).
   * Setelah diunduh, ubah namanya (*rename*) menjadi: `scofield_notes.sqlite`.
2. **`scofield_reference_index.dcti` (387 KB)**
   * Berisi *Topical / Chain-Reference Index* khas Scofield.
   * Setelah diunduh, ubah namanya (*rename*) menjadi: `scofield_index.sqlite`.

### B. Teks Alkitab Utama (King James Version - JSON)
* **Link Unduh:** [KJV.json (GitHub - Scrollmapper)](https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/KJV.json)
* **Cara Simpan:** Tekan `Ctrl + S` pada browser dan simpan dengan nama `kjv.json`.

### C. Buku Cetak Asli Tahun 1917 (Patokan Visual & Halaman)
* **Link Unduh:** [The Scofield Reference Bible 1917 (Internet Archive)](https://archive.org/details/scofieldreferenc0000revc)
* **Cara Simpan:** Di bagian *Download Options* sebelah kanan, unduh file **PDF** sebagai referensi visual tata letak halaman (Halaman 1 s/d 1362).

---

## 2. Struktur Tabel di Dalam `scofield_notes.sqlite`

Anda dapat membuka file `scofield_notes.sqlite` menggunakan aplikasi **DB Browser for SQLite** atau ekstensi **SQLite Viewer** di VS Code. Di dalamnya terdapat 3 tabel utama:

| Nama Tabel | Kolom Utama | Fungsi dalam Tata Letak Buku |
| :--- | :--- | :--- |
| **`BookCommentary`** | `Book`, `Comments` | Menyimpan **Pengantar Kitab (*Book Introduction*)**, penulis, tema utama, dan pembagian garis besar kitab. |
| **`ChapterCommentary`** | `Book`, `Chapter`, `Comments` | Menyimpan **Subjudul / Garis Besar Pasal** dan ringkasan dispensasi di awal pasal. |
| **`VerseCommentary`** | `Book`, `Chapter`, `VerseBegin`, `VerseEnd`, `Comments` | Menyimpan **Catatan Kaki (*Footnotes*)**, subjudul di sela-sela ayat, serta referensi silang kolom tengah dalam format HTML. |

---

## 3. Persiapan Proyek (Next.js + Tailwind CSS)

Jalankan perintah berikut di terminal Anda untuk membuat proyek web:

```bash
npx create-next-app@latest scofield-1917
# Pilih: TypeScript (Yes), Tailwind CSS (Yes), ESLint (Yes), App Router (Yes)

cd scofield-1917
npm install better-sqlite3
npm install -D @types/better-sqlite3
```

Buat folder `raw-data/` di akar proyek (*root directory*) dan masukkan file:
* `raw-data/kjv.json`
* `raw-data/scofield_notes.sqlite`
* `raw-data/scofield_index.sqlite`

---

## 4. Script Penggabung Data (`scripts/build-pages.js`)

Buat file `scripts/build-pages.js` untuk mengekstrak data dari `kjv.json` dan `scofield_notes.sqlite` menjadi struktur JSON per pasal/halaman yang siap dirender oleh komponen UI:

```javascript
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// 1. Buka koneksi ke SQLite Scofield dan baca KJV JSON
const db = new Database(path.join(__dirname, '../raw-data/scofield_notes.sqlite'), { readonly: true });
const kjvData = JSON.parse(fs.readFileSync(path.join(__dirname, '../raw-data/kjv.json'), 'utf8'));

function getChapterData(bookId, chapterNum) {
  // Ambil Pengantar Kitab (jika pasal 1)
  let bookIntro = null;
  if (chapterNum === 1) {
    const introRow = db.prepare('SELECT Comments FROM BookCommentary WHERE Book = ?').get(bookId);
    if (introRow) bookIntro = introRow.Comments;
  }

  // Ambil Pengantar / Garis Besar Pasal
  const chapterRow = db.prepare('SELECT Comments FROM ChapterCommentary WHERE Book = ? AND Chapter = ?').get(bookId, chapterNum);
  const chapterIntro = chapterRow ? chapterRow.Comments : null;

  // Ambil Semua Catatan Kaki Scofield pada Pasal tersebut
  const verseNotes = db.prepare(
    'SELECT VerseBegin, VerseEnd, Comments FROM VerseCommentary WHERE Book = ? AND Chapter = ? ORDER BY VerseBegin ASC'
  ).all(bookId, chapterNum);

  // Petakan catatan berdasarkan nomor ayat
  const notesMap = {};
  verseNotes.forEach((row, idx) => {
    if (!notesMap[row.VerseBegin]) notesMap[row.VerseBegin] = [];
    notesMap[row.VerseBegin].push({
      noteNumber: idx + 1,
      verseRef: `${chapterNum}:${row.VerseBegin}`,
      htmlContent: row.Comments
    });
  });

  // Ambil teks ayat KJV (contoh menyesuaikan struktur JSON Scrollmapper)
  const bookObj = kjvData.books[bookId - 1];
  const chapterObj = bookObj.chapters[chapterNum - 1];

  const verses = chapterObj.verses.map((v) => ({
    verse: v.verse,
    text: v.text,
    notes: notesMap[v.verse] || []
  }));

  return {
    bookId,
    bookName: bookObj.name,
    chapter: chapterNum,
    bookIntro,
    chapterIntro,
    verses,
    footnotes: verseNotes.map((row, idx) => ({
      id: idx + 1,
      verseRef: `${chapterNum}:${row.VerseBegin}`,
      html: row.Comments
    }))
  };
}

// Contoh: Ekstrak Kejadian Pasal 1 ke folder public/data/gen-1.json
const outputDir = path.join(__dirname, '../public/data');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const gen1 = getChapterData(1, 1);
fs.writeFileSync(path.join(outputDir, 'gen-1.json'), JSON.stringify(gen1, null, 2));
console.log('Berhasil mengekstrak data Kejadian 1 ke public/data/gen-1.json');
```

---

## 5. Struktur Visual Halaman Buku Scofield 1917

```text
+-----------------------------------------------------------------------+
| B.C. 4004                GENESIS — CHAPTER 1                   Page 3 |
+-----------------------------------------------------------------------+
|                    THE FIRST BOOK OF MOSES, CALLED                    |
|                                GENESIS                                |
| [BOOK INTRODUCTION]                                                   |
| GENESIS is the book of beginnings. It records not only the beginning  |
| of the heavens and the earth...                                       |
+--------------------------+------------------+-------------------------+
|       KOLOM KIRI         |   KOLOM TENGAH   |       KOLOM KANAN       |
|      (Teks Ayat)         |  (Ref. & Tahun)  |       (Teks Ayat)       |
+--------------------------+------------------+-------------------------+
| CHAPTER 1.               | B.C. 4004        | First Day: Light        |
| 1. The Original Creation |                  | diffused.               |
|                          | a. Heb. Elohim,  |                         |
| 1 IN the beginning [a]   |    see Matt.     | 3 And God said, Let     |
| God [1] created [2] the  |    28:19, note.  | there be light: and     |
| heaven and the earth.    |                  | there was light.        |
|                          | b. Jer. 4:23-26; |                         |
| 2. Earth made waste...   |    Isa. 24:1.    | 4 And God saw the light,|
| 2 And the earth [b] was  |                  | that it was good...     |
| [3] without form...      |                  |                         |
+--------------------------+------------------+-------------------------+
|                 GARIS PEMISAH CATATAN KAKI (FOOTNOTES)                |
+-----------------------------------------------------------------------+
| [1] (1:1) Summary of the truth concerning God: The revelation of God  |
|     to man in the Scriptures begins with the creative act...          |
| [2] (1:1) Three creative acts of God are recorded in this chapter...  |
| [3] (1:2) Jeremiah 4:23-26, Isaiah 24:1 and 45:18 clearly indicate... |
+-----------------------------------------------------------------------+
```

---

## 6. Komponen UI Halaman Buku (`app/page.tsx`)

Gunakan font serif klasik seperti **EB Garamond** di `app/layout.tsx`, lalu pasang komponen tata letak buku berikut di `app/page.tsx`:

```tsx
"use client";

import React, { useState } from "react";

export default function ScofieldBookPage() {
  const [selectedNote, setSelectedNote] = useState<number | null>(1);

  return (
    <div className="min-h-screen bg-stone-900 py-6 px-4 flex justify-center items-center font-serif">
      {/* Kontainer Kertas Buku Klasik 1917 */}
      <div className="w-full max-w-5xl h-[92vh] bg-[#fdfaf3] text-stone-900 shadow-2xl border border-stone-400 flex flex-col overflow-hidden">
        
        {/* 1. HEADER ATAS HALAMAN */}
        <header className="border-b-2 border-stone-800 mx-8 pt-4 pb-1 flex justify-between items-baseline text-xs tracking-widest uppercase">
          <span className="font-semibold">B.C. 4004</span>
          <h1 className="font-bold text-base tracking-[0.2em]">GENESIS</h1>
          <span>Page 3</span>
        </header>

        {/* 2. AREA UTAMA: PENGANTAR + 3 KOLOM (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-8 py-4">
          
          {/* Pengantar Kitab (Book Introduction) */}
          <section className="border-b border-stone-400 pb-4 mb-4 text-xs leading-relaxed text-justify">
            <p className="text-center tracking-widest text-[11px] uppercase mb-0.5">
              THE FIRST BOOK OF MOSES, CALLED
            </p>
            <h2 className="text-center font-bold text-2xl tracking-wider mb-1">
              GENESIS
            </h2>
            <p className="text-center font-bold text-[11px] mb-3">
              WRITTEN BY MOSES
            </p>
            <p>
              <span className="font-bold">GENESIS</span> is the book of beginnings. It records not only the beginning of the heavens and the earth, and of plant, animal, and human life, but also of all human institutions and relationships. Typically, it speaks of the new birth, the new creation, where all was chaos and ruin...
            </p>
          </section>

          {/* GRID 3 KOLOM: Kiri (5/12) | Tengah (2/12) | Kanan (5/12) */}
          <div className="grid grid-cols-12 gap-3 text-sm">
            
            {/* KOLOM KIRI (Ayat + Subjudul Scofield) */}
            <div className="col-span-5 pr-3 border-r border-stone-400 text-justify leading-relaxed">
              <h3 className="font-bold text-center tracking-wider mb-2">
                CHAPTER 1.
              </h3>

              <p className="italic font-semibold text-xs my-1.5 text-stone-800">
                1. The Original Creation.
              </p>

              <p className="mb-2.5">
                <span className="font-bold mr-1">1</span>
                IN the beginning{" "}
                <sup className="italic text-blue-900 font-semibold">[a]</sup>God
                <sup
                  onClick={() => setSelectedNote(1)}
                  className="font-bold text-red-800 cursor-pointer hover:underline ml-0.5"
                >
                  1
                </sup>{" "}
                created
                <sup
                  onClick={() => setSelectedNote(2)}
                  className="font-bold text-red-800 cursor-pointer hover:underline ml-0.5"
                >
                  2
                </sup>{" "}
                the heaven and the earth.
              </p>

              <p className="italic font-semibold text-xs my-1.5 text-stone-800">
                2. Earth made waste and empty by judgment (Jer. 4:23-26).
              </p>

              <p className="mb-2.5">
                <span className="font-bold mr-1">2</span>
                And the earth{" "}
                <sup className="italic text-blue-900 font-semibold">[b]</sup>was
                <sup
                  onClick={() => setSelectedNote(3)}
                  className="font-bold text-red-800 cursor-pointer hover:underline ml-0.5"
                >
                  3
                </sup>{" "}
                without form, and void; and darkness <span className="italic">was</span> upon the face of the deep. And the Spirit of God moved upon the face of the waters.
              </p>
            </div>

            {/* KOLOM TENGAH (Tahun Ussher & Referensi Silang) */}
            <div className="col-span-2 text-[11px] leading-tight text-stone-700 space-y-2 px-1">
              <div className="font-bold text-center border-b border-stone-400 pb-1">
                B.C. 4004
              </div>
              <div>
                <span className="italic font-bold text-blue-900">a </span>
                Heb. <span className="italic">Elohim</span>, see Matt. 28:19, note.
              </div>
              <div>
                <span className="italic font-bold text-blue-900">b </span>
                Jer. 4:23-26; Isa. 24:1; 45:18.
              </div>
              <div>
                <span className="italic font-bold text-blue-900">c </span>
                2 Cor. 4:6.
              </div>
            </div>

            {/* KOLOM KANAN (Ayat Lanjutan) */}
            <div className="col-span-5 pl-3 border-l border-stone-400 text-justify leading-relaxed">
              <p className="italic font-semibold text-xs mb-1.5 text-stone-800">
                First Day: Light diffused.
              </p>

              <p className="mb-2.5">
                <span className="font-bold mr-1">3</span>
                And God said,{" "}
                <sup className="italic text-blue-900 font-semibold">[c]</sup>Let there be light: and there was light.
              </p>

              <p className="mb-2.5">
                <span className="font-bold mr-1">4</span>
                And God saw the light, that <span className="italic">it was</span> good: and God divided the light from the darkness.
              </p>

              <p className="mb-2.5">
                <span className="font-bold mr-1">5</span>
                And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.
              </p>
            </div>

          </div>
        </div>

        {/* 3. PANEL CATATAN KAKI BAWAH HALAMAN (Footnotes Area) */}
        <footer className="h-52 border-t-2 border-stone-800 mx-8 py-3 bg-[#f9f4e8] overflow-y-auto text-[11.5px] leading-snug text-justify">
          <div className="columns-2 gap-6">
            <div
              className={`mb-2 p-1 rounded transition ${
                selectedNote === 1 ? "bg-amber-200/70 ring-1 ring-amber-600" : ""
              }`}
            >
              <sup className="font-bold text-red-800 mr-1">1</sup>
              <span className="font-bold">(1:1) Summary of the truth concerning God:</span>{" "}
              The revelation of God to man in the Scriptures begins with the creative act. By the name <span className="italic">Elohim</span> (plural of majesty, implying the Trinity)...
            </div>

            <div
              className={`mb-2 p-1 rounded transition ${
                selectedNote === 2 ? "bg-amber-200/70 ring-1 ring-amber-600" : ""
              }`}
            >
              <sup className="font-bold text-red-800 mr-1">2</sup>
              <span className="font-bold">(1:1) Three creative acts</span> of God are recorded in this chapter: (1) the heavens and the earth, v. 1; (2) animal life, v. 21; and (3) human life, vs. 26, 27. The first creative act refers to the dateless past...
            </div>

            <div
              className={`mb-2 p-1 rounded transition ${
                selectedNote === 3 ? "bg-amber-200/70 ring-1 ring-amber-600" : ""
              }`}
            >
              <sup className="font-bold text-red-800 mr-1">3</sup>
              <span className="font-bold">(1:2)</span> Jeremiah 4:23-26, Isaiah 24:1 and 45:18 clearly indicate that the earth had undergone a cataclysmic change as the result of a divine judgment. The face of the earth bears everywhere the marks of such a catastrophe...
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
```

---

## 7. Daftar Periksa Langkah Kerja (Checklist)

- [ ] **Langkah 1:** Unduh `scofield_reference_notes.cmti` dan `scofield_reference_index.dcti` dari BibleSupport, lalu ubah ekstensinya menjadi `.sqlite`.
- [ ] **Langkah 2:** Unduh `KJV.json` dari GitHub.
- [ ] **Langkah 3:** Buka `scofield_notes.sqlite` di *DB Browser for SQLite* atau *VS Code SQLite Viewer* untuk mengenali struktur HTML pada kolom `Comments`.
- [ ] **Langkah 4:** Jalankan `node scripts/build-pages.js` untuk menggabungkan teks KJV dengan catatan kaki Scofield.
- [ ] **Langkah 5:** Jalankan `npm run dev` pada proyek Next.js dan sesuaikan detail tipografi berdasarkan PDF asli Scofield 1917.