import React, { useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Compass, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Estimates traditional Ussher biblical chronology dates for major eras
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
  onOpenFootnote,
  onOpenIndex,
  onOpenBookIntro,
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
  const bookIntro = bookData.intro;
  const bookName = bookData.name || 'Genesis';
  const bookId = bookData.id || 'kejadian';
  const chronology = BOOK_CHRONOLOGY[bookId] || 'B.C.';

  // Split verses for 2 columns
  const half = Math.ceil(verses.length / 2);
  const leftVerses = verses.slice(0, half);
  const rightVerses = verses.slice(half);

  // Group middle column references from footnotes
  const marginRefs = [];
  footnotes.forEach((fn) => {
    if (fn.references && fn.references.length > 0) {
      marginRefs.push({
        verse: fn.verse,
        note_idx: fn.note_idx,
        keyword: fn.keyword,
        refs: fn.references.slice(0, 3)
      });
    }
  });

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
              // Also scroll bottom footnote panel
              const noteEl = document.getElementById(`scofield-fn-${noteIdx}`);
              if (noteEl) {
                noteEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }}
            className={`font-serif font-black mx-0.5 cursor-pointer select-none transition ${
              isSelected 
                ? 'bg-amber-300 text-red-950 px-1 py-0.2 rounded ring-1 ring-red-800' 
                : 'text-red-900 hover:text-red-700 hover:underline'
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

  return (
    <div className="w-full flex justify-center py-2 sm:py-4 px-2 sm:px-4 font-serif">
      {/* Kontainer Kertas Buku Klasik 1917 */}
      <div className="w-full max-w-5xl bg-[#fdfaf3] text-stone-900 shadow-2xl border-2 border-stone-400 rounded-lg flex flex-col overflow-hidden min-h-[82vh]">
        
        {/* 1. HEADER ATAS HALAMAN (Buku Klasik 1917) */}
        <header className="border-b-2 border-stone-800 mx-4 sm:mx-8 pt-4 pb-2 flex justify-between items-baseline text-[11px] sm:text-xs tracking-widest uppercase select-none">
          <div className="flex items-center gap-3">
            <span className="font-bold text-stone-700">{chronology}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenIndex}
              className="h-6 px-2 text-[10px] text-amber-900 bg-amber-100/70 hover:bg-amber-200 border border-amber-300/80 rounded-md font-sans tracking-normal font-bold flex items-center gap-1"
            >
              <Compass className="w-3 h-3" />
              <span>Topical Index</span>
            </Button>
          </div>

          <h2 className="font-bold text-sm sm:text-base tracking-[0.25em] text-center text-stone-900">
            {bookName.toUpperCase()} — CHAPTER {selectedChapter}
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-stone-600 font-mono">Ch. {selectedChapter}</span>
            <div className="flex items-center gap-1">
              <button 
                onClick={onPrevChapter}
                disabled={!canPrev}
                className="p-1 rounded hover:bg-stone-200 disabled:opacity-30 cursor-pointer"
                title="Previous Chapter"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={onNextChapter}
                disabled={!canNext}
                className="p-1 rounded hover:bg-stone-200 disabled:opacity-30 cursor-pointer"
                title="Next Chapter"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* 2. AREA UTAMA: PENGANTAR (Pasal 1) + 3 KOLOM */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5">
          
          {/* Pengantar Kitab (Book Introduction) */}
          {selectedChapter === 1 && bookIntro?.text && (
            <section className="border-b-2 border-stone-400 pb-5 mb-5 text-xs sm:text-[13px] leading-relaxed text-justify bg-amber-50/40 p-4 rounded-md">
              <p className="text-center tracking-widest text-[11px] uppercase mb-1 text-stone-600 font-semibold">
                THE SCOFIELD REFERENCE BIBLE (1917)
              </p>
              <h1 className="text-center font-bold text-2xl sm:text-3xl tracking-widest mb-1 font-serif text-stone-900">
                {bookName.toUpperCase()}
              </h1>
              <p className="text-center font-bold text-[11px] uppercase tracking-wider mb-3 text-stone-700">
                BOOK INTRODUCTION & EXPOSITION
              </p>
              <p className="text-stone-800 leading-relaxed font-serif first-letter:text-3xl first-letter:font-bold first-letter:mr-1 first-letter:float-left">
                {bookIntro.text.slice(0, 500)}...
              </p>
              <div className="text-center mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenBookIntro}
                  className="h-7 text-xs font-sans font-bold border-stone-400 hover:bg-stone-200 text-stone-800"
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1" />
                  Read Full Book Introduction
                </Button>
              </div>
            </section>
          )}

          {/* GRID TATA LETAK 1917: Kiri (Kolom Teks 1) | Tengah (Margin Ref) | Kanan (Kolom Teks 2) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 text-sm">
            
            {/* KOLOM KIRI (Ayat 1 s/d Pertengahan) */}
            <div className="md:col-span-5 md:pr-4 md:border-r border-stone-300 text-justify leading-relaxed space-y-3">
              <div className="text-center font-bold text-sm tracking-widest border-b border-stone-300 pb-1 mb-2">
                CHAPTER {selectedChapter}.
              </div>

              {leftVerses.map(v => (
                <div key={v.verse} id={`classic-verse-${v.verse}`} className="leading-relaxed">
                  <span className="font-bold mr-1.5 font-serif text-stone-900 text-sm">
                    {v.verse}
                  </span>
                  <span className="text-stone-800 font-serif">
                    {renderClassicVerseText(v)}
                  </span>
                </div>
              ))}
            </div>

            {/* KOLOM TENGAH (Referensi Silang & Rantai Scofield) */}
            <div className="hidden md:block md:col-span-2 text-[11px] leading-tight text-stone-700 space-y-3 px-1 text-center">
              <div className="font-bold text-xs border-b border-stone-400 pb-1 text-stone-800">
                {chronology}
              </div>
              <div className="space-y-3 pt-1">
                {marginRefs.length > 0 ? (
                  marginRefs.slice(0, 8).map((mr, mIdx) => (
                    <div 
                      key={mIdx}
                      onClick={() => {
                        setSelectedNoteIdx(mr.note_idx);
                        const fnObj = footnotes.find(f => f.note_idx === mr.note_idx);
                        if (onOpenFootnote && fnObj) onOpenFootnote(mr.verse, mr.note_idx, fnObj);
                      }}
                      className="p-1 rounded hover:bg-amber-100/60 transition cursor-pointer text-left border-b border-stone-200 pb-1.5"
                    >
                      <div className="font-bold text-red-900 font-serif">
                        v. {mr.verse} [{mr.note_idx}]
                      </div>
                      {mr.keyword && (
                        <div className="italic text-[10px] text-stone-800 truncate">
                          {mr.keyword}
                        </div>
                      )}
                      <div className="text-[10px] font-mono text-amber-900 mt-0.5">
                        {mr.refs.join('; ')}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[10px] italic text-stone-400 py-4">
                    — Margin Refs —
                  </div>
                )}
              </div>
            </div>

            {/* KOLOM KANAN (Ayat Pertengahan s/d Akhir) */}
            <div className="md:col-span-5 md:pl-4 md:border-l border-stone-300 text-justify leading-relaxed space-y-3">
              <div className="hidden md:block text-center font-bold text-xs tracking-wider text-stone-500 border-b border-stone-300 pb-1 mb-2">
                CONTINUED
              </div>

              {rightVerses.map(v => (
                <div key={v.verse} id={`classic-verse-${v.verse}`} className="leading-relaxed">
                  <span className="font-bold mr-1.5 font-serif text-stone-900 text-sm">
                    {v.verse}
                  </span>
                  <span className="text-stone-800 font-serif">
                    {renderClassicVerseText(v)}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* 3. PANEL CATATAN KAKI BAWAH HALAMAN (Scofield Footnotes Footer) */}
        <footer className="border-t-2 border-stone-800 mx-4 sm:mx-8 py-3 bg-[#f9f4e8] text-[12px] leading-snug text-justify max-h-56 overflow-y-auto">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-stone-300 text-[11px] font-bold text-stone-700 uppercase tracking-wider">
            <span>The Scofield Reference Notes ({footnotes.length} Notes in Ch. {selectedChapter})</span>
            <span className="text-[10px] font-normal text-stone-500">Click a note number to inspect</span>
          </div>

          {footnotes.length === 0 ? (
            <p className="text-center text-xs text-stone-500 italic py-3">
              No Scofield footnotes on this chapter.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className={`p-2 rounded-md transition cursor-pointer ${
                      isSelected 
                        ? "bg-amber-200/90 ring-1 ring-amber-700 shadow-xs" 
                        : "hover:bg-amber-100/50"
                    }`}
                  >
                    <sup className="font-bold text-red-900 text-xs mr-1">
                      [{fn.note_idx}]
                    </sup>
                    <span className="font-bold text-stone-900">
                      ({selectedChapter}:{fn.verse}) {fn.keyword ? `${fn.keyword}: ` : ''}
                    </span>
                    <span className="text-stone-800 font-serif">
                      {fn.text.slice(0, 180)}{fn.text.length > 180 ? '...' : ''}
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
