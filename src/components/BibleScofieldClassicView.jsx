import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Traditional Ussher biblical chronology dates
const BOOK_CHRONOLOGY = {
  kejadian: 'B.C. 4004',
  keluaran: 'B.C. 1491',
  imamat: 'B.C. 1490',
  bilangan: 'B.C. 1490',
  ulangan: 'B.C. 1451',
  yosua: 'B.C. 1451',
  'hakim-hakim': 'B.C. 1425',
  rut: 'B.C. 1322',
  '1-samuel': 'B.C. 1171',
  '2-samuel': 'B.C. 1056',
  '1-raja-raja': 'B.C. 1015',
  '2-raja-raja': 'B.C. 896',
  '1-tawarikh': 'B.C. 1015',
  '2-tawarikh': 'B.C. 1015',
  ezra: 'B.C. 536',
  nehemia: 'B.C. 446',
  ester: 'B.C. 521',
  ayub: 'B.C. 1520',
  mazmur: 'B.C. 1060',
  amsal: 'B.C. 1000',
  pengkhotbah: 'B.C. 977',
  'kidung-agung': 'B.C. 1014',
  yesaya: 'B.C. 760',
  yeremia: 'B.C. 629',
  ratapan: 'B.C. 588',
  yehezkiel: 'B.C. 595',
  daniel: 'B.C. 607',
  hosea: 'B.C. 785',
  yoel: 'B.C. 800',
  amos: 'B.C. 787',
  obaja: 'B.C. 587',
  yunus: 'B.C. 862',
  mikha: 'B.C. 750',
  nahum: 'B.C. 713',
  habakuk: 'B.C. 626',
  zefanya: 'B.C. 630',
  hagai: 'B.C. 520',
  zakharia: 'B.C. 520',
  maleakhi: 'B.C. 397',
  matius: 'A.D. 38',
  markus: 'A.D. 65',
  lukas: 'A.D. 63',
  yohanes: 'A.D. 90',
  'kisah-para-rasul': 'A.D. 63',
  roma: 'A.D. 60',
  '1-korintus': 'A.D. 59',
  '2-korintus': 'A.D. 60',
  galatia: 'A.D. 58',
  efesus: 'A.D. 64',
  filipi: 'A.D. 64',
  kolose: 'A.D. 64',
  '1-tesalonika': 'A.D. 54',
  '2-tesalonika': 'A.D. 54',
  '1-timotius': 'A.D. 65',
  '2-timotius': 'A.D. 66',
  titus: 'A.D. 65',
  filemon: 'A.D. 64',
  ibrani: 'A.D. 64',
  yakobus: 'A.D. 60',
  '1-petrus': 'A.D. 60',
  '2-petrus': 'A.D. 66',
  '1-yohanes': 'A.D. 90',
  '2-yohanes': 'A.D. 90',
  '3-yohanes': 'A.D. 90',
  yudas: 'A.D. 66',
  wahyu: 'A.D. 96'
};

export default function BibleScofieldClassicView({
  bookData,
  selectedChapter,
  fontSize = 18,
  onOpenFootnote,
  onOpenIndex,
  onPrevChapter,
  onNextChapter,
  canPrev,
  canNext
}) {
  const [selectedNoteIdx, setSelectedNoteIdx] = useState(null);

  if (!bookData) return null;

  const currentChapterData = bookData.chapters?.[String(selectedChapter)] || { verses: [], footnotes: [] };
  const verses = currentChapterData.verses || [];
  const footnotes = currentChapterData.footnotes || [];
  const bookName = bookData.name || 'Genesis';
  const bookId = bookData.id || 'kejadian';
  const chronology = BOOK_CHRONOLOGY[bookId] || 'B.C.';

  // Split verses into 2 text columns: Left (half) and Right (half)
  const half = Math.ceil(verses.length / 2);
  const leftVerses = verses.slice(0, half);
  const rightVerses = verses.slice(half);

  // Group middle column references from footnotes
  const middleRefs = [];
  footnotes.forEach((fn) => {
    if ((fn.references && fn.references.length > 0) || fn.keyword) {
      middleRefs.push({
        verse: fn.verse,
        note_idx: fn.note_idx,
        keyword: fn.keyword,
        refs: fn.references || []
      });
    }
  });

  // Parse full book introduction into styled paragraphs
  const introParagraphs = React.useMemo(() => {
    if (!bookData?.intro) return [];
    const htmlStr = bookData.intro.html || '';
    if (htmlStr) {
      // Remove generic title paragraph like <p style="font-weight:bold;">Book Introduction - ...</p>
      const cleaned = htmlStr.replace(/<p[^>]*>\s*Book Introduction[^<]*<\/p>/gi, '');
      const rawParas = cleaned.split(/<\/p>/i);
      const list = [];
      for (let p of rawParas) {
        p = p.replace(/<p[^>]*>/gi, '').trim();
        if (!p) continue;
        p = p.replace(/<ref>(.*?)<\/ref>/gi, '<span class="font-mono text-amber-900 font-bold">$1</span>');
        list.push(p);
      }
      if (list.length > 0) return list;
    }
    if (bookData.intro.text) {
      return [bookData.intro.text];
    }
    return [];
  }, [bookData]);

  const renderClassicVerseText = (vItem) => {
    if (!vItem.marked_text || !vItem.marked_text.includes('<fn')) {
      return vItem.text;
    }

    const parts = vItem.marked_text.split(/(<fn n="\d+"\/>)/g);
    return parts.map((part, pIdx) => {
      const match = part.match(/<fn n="(\d+)"\/>/);
      if (match) {
        const noteIdx = Number(match[1]);
        const isSelected = selectedNoteIdx === noteIdx;
        return (
          <sup
            key={pIdx}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNoteIdx(noteIdx);
              const fnObj = footnotes.find(f => f.note_idx === noteIdx);
              if (onOpenFootnote && fnObj) {
                onOpenFootnote(vItem.verse, noteIdx, fnObj);
              }
              const noteEl = document.getElementById(`scofield-fn-${noteIdx}`);
              if (noteEl) {
                noteEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }}
            className={`font-serif font-black mx-1 cursor-pointer select-none transition inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs leading-none -translate-y-1 shadow-2xs ${
              isSelected 
                ? 'bg-red-800 text-white ring-2 ring-red-900 scale-110' 
                : 'bg-red-100 hover:bg-red-200 text-red-900 border border-red-300 font-bold'
            }`}
            title={`Scofield Note ${noteIdx}`}
          >
            [{noteIdx}]
          </sup>
        );
      }
      return part;
    });
  };

  const actualFontSize = Math.max(16, fontSize);

  return (
    <div className="w-full flex justify-center py-2 sm:py-4 font-serif">
      {/* Kontainer Kertas Buku Cetak 1917 */}
      <div className="w-full max-w-5xl bg-[#fdfaf3] text-[#1a1612] shadow-2xl border-2 border-stone-400 rounded-2xl flex flex-col overflow-hidden min-h-[85vh]">
        
        {/* 1. HEADER ATAS HALAMAN (Buku Klasik 1917) - 100% Responsif */}
        <header className="border-b-2 border-stone-900 mx-3 sm:mx-8 pt-3 sm:pt-4 pb-2.5 sm:pb-3 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs tracking-widest uppercase select-none">
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-stone-900 bg-amber-200/80 border border-amber-400 px-2 py-0.5 rounded-md font-mono text-[11px] sm:text-xs shrink-0">
                {chronology}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenIndex}
                className="h-7 px-2 sm:px-2.5 text-[11px] sm:text-xs text-amber-950 bg-amber-100 hover:bg-amber-200 border-amber-400 rounded-lg font-sans font-bold flex items-center gap-1 shadow-2xs shrink-0"
              >
                <Compass className="w-3.5 h-3.5 text-amber-800" />
                <span>Indeks Topikal</span>
              </Button>
            </div>

            {/* Tombol Prev/Next Muncul di Samping Baris Atas Pada Mobile */}
            <div className="flex sm:hidden items-center gap-1 border border-stone-400 rounded-lg bg-stone-100 p-0.5 shrink-0">
              <button 
                onClick={onPrevChapter}
                disabled={!canPrev}
                className="p-1 rounded hover:bg-stone-200 disabled:opacity-30 cursor-pointer text-stone-900"
                title="Previous Chapter"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-stone-800 font-mono text-[11px] font-bold px-1">
                {selectedChapter}
              </span>
              <button 
                onClick={onNextChapter}
                disabled={!canNext}
                className="p-1 rounded hover:bg-stone-200 disabled:opacity-30 cursor-pointer text-stone-900"
                title="Next Chapter"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Running Page Header Sesuai Format Cetak Scofield 1917 PDF: [Ch:V1] BOOK [Ch:V2] */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 font-serif text-stone-950 font-bold">
            <span className="text-[11px] sm:text-xs font-mono text-stone-600 bg-stone-200/60 px-1.5 py-0.5 rounded hidden xs:inline">
              {selectedChapter}:{verses[0]?.verse || 1}
            </span>
            <h2 className="font-extrabold text-xs sm:text-base md:text-lg tracking-wider sm:tracking-[0.25em] text-center text-stone-950 uppercase truncate max-w-[200px] sm:max-w-none">
              {bookName.toUpperCase()} — CHAPTER {selectedChapter}
            </h2>
            <span className="text-[11px] sm:text-xs font-mono text-stone-600 bg-stone-200/60 px-1.5 py-0.5 rounded hidden xs:inline">
              {selectedChapter}:{verses[verses.length - 1]?.verse || 1}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <span className="text-stone-800 font-mono text-xs font-bold bg-amber-200/60 px-2 py-0.5 rounded border border-amber-300">
              {chronology}
            </span>
            <div className="flex items-center gap-1 border border-stone-400 rounded-lg bg-stone-100 p-0.5">
              <button 
                onClick={onPrevChapter}
                disabled={!canPrev}
                className="p-1 rounded hover:bg-stone-200 disabled:opacity-30 cursor-pointer text-stone-900"
                title="Previous Chapter"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={onNextChapter}
                disabled={!canNext}
                className="p-1 rounded hover:bg-stone-200 disabled:opacity-30 cursor-pointer text-stone-900"
                title="Next Chapter"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* 2. AREA UTAMA: PENGANTAR LENGKAP (Pasal 1) + 3 BAGIAN / KOLOM */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-7 py-6">
          
          {/* PENGANTAR LENGKAP KITAB (FULL BOOK INTRODUCTION ON CHAPTER 1) */}
          {selectedChapter === 1 && introParagraphs.length > 0 && (
            <section className="border-b-2 border-stone-800 pb-6 mb-7 bg-amber-50/60 p-5 sm:p-7 rounded-2xl border border-stone-300 shadow-xs">
              <p className="text-center tracking-[0.25em] text-[11px] uppercase mb-1 text-stone-600 font-bold font-sans">
                THE SCOFIELD REFERENCE BIBLE (1917)
              </p>
              <h1 className="text-center font-bold text-2xl sm:text-3xl tracking-widest mb-1.5 font-serif text-stone-950">
                {bookName.toUpperCase()}
              </h1>
              <p className="text-center font-extrabold text-xs uppercase tracking-wider mb-4 text-amber-950 border-b border-stone-300 pb-2 font-mono">
                BOOK INTRODUCTION & EXPOSITION
              </p>
              <div className="space-y-3.5 text-stone-900 leading-relaxed font-serif text-sm sm:text-base text-justify">
                {introParagraphs.map((paraHtml, pIdx) => (
                  <p 
                    key={pIdx} 
                    className="leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: paraHtml }}
                  />
                ))}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 text-justify">
            
            {/* BAGIAN 1 / KOLOM KIRI (Ayat 1 s/d Pertengahan) */}
            <div className="md:col-span-5 md:pr-3 space-y-4">
              <div className="text-center font-bold text-sm tracking-widest border-b border-stone-300 pb-2 mb-3 text-stone-900 font-serif">
                CHAPTER {selectedChapter}.
              </div>

              {leftVerses.map(v => (
                <div key={v.verse} id={`classic-verse-${v.verse}`} className="leading-relaxed">
                  <p 
                    className="text-[#1a1612] font-serif"
                    style={{ fontSize: `${actualFontSize}px`, lineHeight: 1.85 }}
                  >
                    <span className="font-bold mr-1.5 font-serif text-amber-950 text-base select-none">
                      {v.verse}
                    </span>
                    <span>
                      {renderClassicVerseText(v)}
                    </span>
                  </p>
                </div>
              ))}
            </div>

            {/* BAGIAN 2 / KOLOM TENGAH (Tahun Ussher & Rujukan Kolom Tengah) */}
            <div className="hidden md:block md:col-span-2 text-xs leading-normal text-stone-800 space-y-3 px-2 border-x border-stone-300 text-center">
              <div className="font-extrabold text-xs border-b border-stone-400 pb-1 text-stone-900 font-mono">
                {chronology}
              </div>

              <div className="space-y-3 pt-1 text-left">
                {middleRefs.length > 0 ? (
                  middleRefs.map((mr, mIdx) => (
                    <div 
                      key={mIdx}
                      onClick={() => {
                        setSelectedNoteIdx(mr.note_idx);
                        const fnObj = footnotes.find(f => f.note_idx === mr.note_idx);
                        if (onOpenFootnote && fnObj) onOpenFootnote(mr.verse, mr.note_idx, fnObj);
                        const noteEl = document.getElementById(`scofield-fn-${mr.note_idx}`);
                        if (noteEl) noteEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }}
                      className="p-1.5 rounded-lg bg-amber-50/70 hover:bg-amber-100 transition cursor-pointer border border-stone-200"
                    >
                      <div className="flex items-center gap-1 font-bold text-red-900 font-serif text-xs">
                        <span>v. {mr.verse}</span>
                        <span className="text-[11px]">[{mr.note_idx}]</span>
                      </div>
                      {mr.keyword && (
                        <div className="italic text-[11px] font-semibold text-stone-900 truncate">
                          {mr.keyword}
                        </div>
                      )}
                      {mr.refs.length > 0 && (
                        <div className="text-[11px] font-mono text-amber-950 font-medium mt-0.5 break-words">
                          {mr.refs.slice(0, 3).join('; ')}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-xs italic text-stone-400 py-6 text-center">
                    — Margin Refs —
                  </div>
                )}
              </div>
            </div>

            {/* BAGIAN 3 / KOLOM KANAN (Ayat Pertengahan s/d Akhir) */}
            <div className="md:col-span-5 md:pl-3 space-y-4">
              <div className="hidden md:block text-center font-bold text-xs tracking-wider text-stone-600 border-b border-stone-300 pb-2 mb-3 font-serif">
                CONTINUED
              </div>

              {rightVerses.map(v => (
                <div key={v.verse} id={`classic-verse-${v.verse}`} className="leading-relaxed">
                  <p 
                    className="text-[#1a1612] font-serif"
                    style={{ fontSize: `${actualFontSize}px`, lineHeight: 1.85 }}
                  >
                    <span className="font-bold mr-1.5 font-serif text-amber-950 text-base select-none">
                      {v.verse}
                    </span>
                    <span>
                      {renderClassicVerseText(v)}
                    </span>
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* 3. PANEL CATATAN KAKI BAWAH HALAMAN (Scofield Footnotes Footer) */}
        <footer className="border-t-2 border-stone-900 mx-4 sm:mx-8 py-3.5 bg-[#f9f4e8] max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between pb-1.5 mb-2.5 border-b border-stone-300 text-xs font-bold text-stone-900 uppercase tracking-wider">
            <span>The Scofield Reference Notes ({footnotes.length} Notes in Ch. {selectedChapter})</span>
            <span className="text-[11px] font-medium text-stone-600">Klik nomor catatan untuk detail</span>
          </div>

          {footnotes.length === 0 ? (
            <p className="text-center text-xs text-stone-500 italic py-3">
              Tidak ada catatan kaki Scofield pada pasal ini.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-justify">
              {footnotes.map((fn) => {
                const isSelected = selectedNoteIdx === fn.note_idx;
                return (
                  <div
                    key={fn.note_idx}
                    id={`scofield-fn-${fn.note_idx}`}
                    onClick={() => {
                      setSelectedNoteIdx(fn.note_idx);
                      if (onOpenFootnote) onOpenFootnote(fn.verse, fn.note_idx, fn);
                    }}
                    className={`p-2.5 rounded-lg transition cursor-pointer text-xs sm:text-[13px] leading-relaxed border ${
                      isSelected 
                        ? "bg-amber-200/90 border-amber-600 ring-1 ring-amber-600 shadow-xs" 
                        : "bg-white/80 hover:bg-amber-100/70 border-stone-300"
                    }`}
                  >
                    <sup className="font-bold text-red-900 text-sm mr-1.5">
                      [{fn.note_idx}]
                    </sup>
                    <span className="font-bold text-stone-950 font-serif">
                      ({selectedChapter}:{fn.verse}) {fn.keyword ? `${fn.keyword}: ` : ''}
                    </span>
                    <span className="text-[#1a1612] font-serif">
                      {isSelected ? fn.text : (fn.text.slice(0, 240) + (fn.text.length > 240 ? '... (Klik selengkapnya)' : ''))}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </footer>

      </div>
    </div>
  );
}
