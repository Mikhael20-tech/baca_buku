import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Compass, BookOpen } from 'lucide-react';
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
  fontSize = 16.5,
  onOpenFootnote,
  onOpenIndex,
  onPrevChapter,
  onNextChapter,
  canPrev,
  canNext
}) {
  const [selectedNoteIdx, setSelectedNoteIdx] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Parse full book introduction into styled paragraphs
  const introParagraphs = useMemo(() => {
    if (!bookData?.intro) return [];
    const htmlStr = bookData.intro.html || '';
    if (htmlStr) {
      const cleaned = htmlStr.replace(/<p[^>]*>\s*Book Introduction[^<]*<\/p>/gi, '');
      const rawParas = cleaned.split(/<\/p>/i);
      const list = [];
      for (let p of rawParas) {
        p = p.replace(/<p[^>]*>/gi, '').trim();
        if (!p) continue;
        p = p.replace(/<ref>(.*?)<\/ref>/gi, '<span style="color:#00008B;font-weight:600;">$1</span>');
        list.push(p);
      }
      if (list.length > 0) return list;
    }
    if (bookData.intro.text) {
      return [bookData.intro.text];
    }
    return [];
  }, [bookData]);

  if (!bookData) return null;

  const currentChapterData = bookData.chapters?.[String(selectedChapter)] || { verses: [], footnotes: [] };
  const verses = currentChapterData.verses || [];
  const footnotes = currentChapterData.footnotes || [];
  const bookName = bookData.name || 'Genesis';
  const bookId = bookData.id || 'kejadian';
  const chronology = BOOK_CHRONOLOGY[bookId] || 'B.C.';

  // Split verses into 2 columns (Left and Right)
  const half = Math.ceil(verses.length / 2);
  const leftVerses = verses.slice(0, half);
  const rightVerses = verses.slice(half);

  // Extract middle column notes from footnotes (prioritize true margin notes with fn.letter)
  const middleRefs = [];
  const letteredNotes = footnotes.filter(fn => !!fn.letter);
  if (letteredNotes.length > 0) {
    letteredNotes.forEach(fn => {
      middleRefs.push({
        letter: fn.letter,
        verse: fn.verse,
        note_idx: fn.note_idx,
        keyword: fn.keyword,
        refs: fn.references || [],
        text: fn.text
      });
    });
  } else {
    footnotes.forEach((fn, idx) => {
      const letter = fn.letter || String.fromCharCode(97 + (idx % 26)); // a, b, c...
      middleRefs.push({
        letter: letter,
        verse: fn.verse,
        note_idx: fn.note_idx,
        keyword: fn.keyword,
        refs: fn.references || [],
        text: fn.text
      });
    });
  }

  // Render KJV verse text with <i> translator additions and authentic Scofield superscripts
  const renderScofieldVerseText = (vItem) => {
    let raw = vItem.marked_text || vItem.text;
    if (!raw) return null;

    // Convert *word* to <i>word</i> (KJV italics translator additions)
    raw = raw.replace(/\*([^*]+)\*/g, '<i class="sco-trans-word">$1</i>');

    const parts = raw.split(/(<fn n="[^"]+"\/>)/g);
    return parts.map((part, pIdx) => {
      const match = part.match(/<fn n="([^"]+)"\/>/);
      if (match) {
        const rawVal = match[1];
        const isNumeric = /^\d+$/.test(rawVal);
        const fnObj = isNumeric 
          ? footnotes.find(f => f.note_idx === Number(rawVal) || f.footnote_number === Number(rawVal))
          : footnotes.find(f => f.letter === rawVal || f.note_idx === Number(rawVal));
        const isSelected = fnObj && selectedNoteIdx === fnObj.note_idx;
        const isLetter = !!fnObj?.letter || !isNumeric;
        const displayLabel = isLetter ? (fnObj?.letter || rawVal) : (fnObj?.footnote_number || rawVal);
        const noteIdx = fnObj?.note_idx || (isNumeric ? Number(rawVal) : pIdx);

        return (
          <sup
            key={pIdx}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNoteIdx(noteIdx);
              if (onOpenFootnote && fnObj) {
                onOpenFootnote(vItem.verse, noteIdx, fnObj);
              }
              const noteEl = document.getElementById(`scofield-fn-${noteIdx}`);
              if (noteEl) {
                noteEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }}
            className={isLetter 
              ? `sco-sup-letter ${isSelected ? 'sco-sup-selected' : ''}`
              : `sco-sup-fn ${isSelected ? 'sco-sup-selected' : ''}`
            }
            title={fnObj?.keyword ? `Scofield: ${fnObj.keyword}` : `Scofield Note ${displayLabel}`}
          >
            {displayLabel}
          </sup>
        );
      }
      return (
        <span 
          key={pIdx} 
          dangerouslySetInnerHTML={{ __html: part }} 
        />
      );
    });
  };

  const firstVerseNum = verses[0]?.verse || 1;
  const lastVerseNum = verses[verses.length - 1]?.verse || 1;

  return (
    <div className="sco-outer-wrap">
      {/* SCOFIELD SAMPLE DISPLAY EXACT STYLES */}
      <style>{`
        .sco-outer-wrap {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 16px 8px 60px;
          background-color: #f4efe6;
          min-height: 85vh;
          font-family: 'Times New Roman', Times, Georgia, serif;
        }

        .sco-page-card {
          background: #ffffff;
          box-shadow: 0 1px 16px rgba(0,0,0,0.12);
          border: 1px solid #dcd3c4;
          width: 100%;
          max-width: 860px;
          padding: 24px 28px;
          color: #111111;
          font-size: ${Math.max(15, fontSize)}px;
          line-height: 1.55;
          position: relative;
        }

        /* Running Page Header */
        .sco-hdr {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          border-bottom: 1px solid #000000;
          padding-bottom: 4px;
          margin-bottom: 12px;
          font-size: 13px;
          user-select: none;
        }

        .sco-hdr-ref {
          font-family: 'Times New Roman', Times, Georgia, serif;
          font-size: 14px;
          font-weight: normal;
          color: #111111;
          min-width: 60px;
        }

        .sco-hdr-title {
          font-size: 18px;
          font-weight: bold;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          text-align: center;
          color: #111111;
        }

        /* Action Toolbar */
        .sco-top-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #fbf8f2;
          border: 1px solid #e2dacd;
          border-radius: 6px;
          padding: 4px 10px;
          margin-bottom: 14px;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 12px;
        }

        /* Three-Column Grid */
        .sco-columns {
          display: grid;
          grid-template-columns: 1fr 130px 1fr;
          gap: 0;
          align-items: start;
        }

        /* Text Columns */
        .sco-col-text {
          padding: 2px 10px;
        }

        /* Verses: inline numbers, indent, text justified */
        .sco-verse {
          display: block;
          text-align: justify;
          text-justify: inter-word;
          text-indent: 0.4em;
          margin-bottom: 2px;
        }

        .sco-vn {
          font-weight: normal;
          font-size: 0.95em;
          margin-right: 0.35em;
          color: #111111;
          user-select: none;
        }

        /* Outline Headings: centered, bold italic, brown #7B3F00 */
        .sco-outline {
          font-style: italic;
          font-weight: bold;
          text-align: center;
          margin: 10px 0 4px;
          color: #7B3F00;
          font-size: 0.95em;
          line-height: 1.35;
        }

        /* KJV translator additions (italics) in blue #00008B */
        .sco-verse i, .sco-trans-word {
          color: #00008B;
          font-style: italic;
        }

        /* Center Margin Column: 130px, borders, blue #00008B */
        .sco-col-margin {
          width: 130px;
          font-size: 12.5px;
          line-height: 1.35;
          padding: 0 6px;
          border-left: 1px solid #888888;
          border-right: 1px solid #888888;
          font-style: italic;
          position: relative;
          color: #00008B;
          min-height: 100%;
        }

        .sco-date {
          text-align: center;
          font-weight: bold;
          font-style: normal;
          margin-bottom: 8px;
          letter-spacing: 0.05em;
          color: #111111;
          font-size: 12px;
          border-bottom: 1px dashed #cccccc;
          padding-bottom: 3px;
        }

        .sco-margin-entry {
          margin-bottom: 6px;
          cursor: pointer;
          position: relative;
          padding: 2px 4px;
          border-radius: 3px;
          transition: background 0.15s;
        }
        .sco-margin-entry:hover {
          background-color: #eae3d5;
        }

        /* Magnifier Tooltip on Hover */
        .sco-margin-tip {
          display: none;
          position: absolute;
          right: calc(100% + 8px);
          top: -4px;
          width: 240px;
          background: #1a1a3a;
          color: #e8e8f0;
          font-size: 13px;
          font-style: normal;
          line-height: 1.45;
          padding: 8px 10px;
          border-radius: 5px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.35);
          z-index: 100;
          pointer-events: none;
        }
        .sco-margin-tip::after {
          content: '';
          position: absolute;
          top: 10px;
          left: 100%;
          border: 6px solid transparent;
          border-left-color: #1a1a3a;
        }
        .sco-margin-entry:hover .sco-margin-tip,
        .sco-margin-entry.active-tip .sco-margin-tip {
          display: block;
        }

        /* Superscript Footnote / Margin Numbers */
        .sco-sup-fn {
          font-size: 0.72em;
          vertical-align: baseline;
          position: relative;
          top: -0.35em;
          line-height: 0;
          cursor: pointer;
          font-style: normal;
          font-weight: bold;
          color: #8B0000;
          padding: 0 1.5px;
          transition: transform 0.15s, color 0.15s;
        }
        .sco-sup-fn:hover {
          color: #b30000;
          text-decoration: underline;
        }
        .sco-sup-letter {
          font-size: 0.72em;
          vertical-align: baseline;
          position: relative;
          top: -0.35em;
          line-height: 0;
          cursor: pointer;
          font-style: italic;
          font-weight: bold;
          color: #00008B;
          padding: 0 1.5px;
          transition: transform 0.15s, color 0.15s;
        }
        .sco-sup-letter:hover {
          color: #0000cd;
          text-decoration: underline;
        }
        .sco-sup-selected {
          color: #ffffff !important;
          background-color: #8B0000;
          padding: 1px 3px;
          border-radius: 3px;
        }

        /* Footnotes Panel (Bottom) */
        .sco-footnotes {
          border-top: 1px solid #000000;
          margin-top: 14px;
          padding-top: 8px;
          font-size: 13px;
          line-height: 1.5;
          text-align: justify;
          text-justify: inter-word;
          color: #8B0000;
        }

        .sco-fn-entry {
          text-indent: 12px;
          margin-bottom: 5px;
          padding: 3px 6px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .sco-fn-entry:hover {
          background-color: #fdf2f2;
        }
        .sco-fn-entry.selected-fn {
          background-color: #fbe0e0;
          border-left: 3px solid #8B0000;
        }

        .sco-fn-num {
          font-weight: bold;
          margin-right: 4px;
        }

        /* Responsive Mobile Layout */
        @media screen and (max-width: 720px) {
          .sco-page-card {
            padding: 16px 12px;
            font-size: 15px;
          }
          .sco-columns {
            grid-template-columns: 1fr;
          }
          .sco-col-margin {
            width: 100%;
            border-left: none;
            border-right: none;
            border-top: 1px solid #888888;
            border-bottom: 1px solid #888888;
            margin: 12px 0;
            padding: 8px 4px;
            position: static;
          }
          .sco-margin-tip {
            left: 0;
            right: 0;
            width: auto;
            top: auto;
            bottom: calc(100% + 4px);
          }
          .sco-margin-tip::after {
            display: none;
          }
          .sco-hdr-title {
            font-size: 15px;
            letter-spacing: 0.15em;
          }
        }
      `}</style>

      {/* Kontainer Lembar Kertas Scofield 1917 */}
      <div className="sco-page-card">
        
        {/* 1. RUNNING PAGE HEADER OTENTIK: [Chapter Verse] BOOK. [Chapter Verse] */}
        <div className="sco-hdr">
          <span className="sco-hdr-ref text-left">
            {selectedChapter} {firstVerseNum}]
          </span>
          <span className="sco-hdr-title">
            {bookName.toUpperCase()}.
          </span>
          <span className="sco-hdr-ref text-right">
            [{selectedChapter} {lastVerseNum}
          </span>
        </div>

        {/* 2. TOOLBAR NAVIGASI PASAL & INDEKS TOPIKAL */}
        <div className="sco-top-toolbar">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded text-[11px] font-mono">
              {chronology}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenIndex}
              className="h-6 px-2 text-[11px] text-amber-950 bg-amber-50 hover:bg-amber-100 border-amber-300 rounded font-bold flex items-center gap-1 shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5 text-amber-800" />
              <span>Indeks Rantai</span>
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <button 
              onClick={onPrevChapter}
              disabled={!canPrev}
              className="px-2 py-0.5 text-xs rounded border border-stone-300 bg-white hover:bg-stone-100 disabled:opacity-30 cursor-pointer font-bold flex items-center gap-0.5 text-stone-800"
              title="Previous Chapter"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </button>
            <span className="px-2 font-mono font-bold text-stone-900 text-xs">
              Ch. {selectedChapter}
            </span>
            <button 
              onClick={onNextChapter}
              disabled={!canNext}
              className="px-2 py-0.5 text-xs rounded border border-stone-300 bg-white hover:bg-stone-100 disabled:opacity-30 cursor-pointer font-bold flex items-center gap-0.5 text-stone-800"
              title="Next Chapter"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. PENGANTAR LENGKAP KITAB (PASAL 1) */}
        {selectedChapter === 1 && introParagraphs.length > 0 && (
          <div className="mb-6 pb-5 border-b-2 border-stone-800 bg-[#faf6ee] p-4 sm:p-6 rounded border border-stone-300">
            <div className="text-center text-[11px] tracking-[0.25em] uppercase font-bold text-stone-600 mb-1">
              THE SCOFIELD REFERENCE BIBLE (1917)
            </div>
            <h1 className="text-center font-bold text-2xl tracking-widest uppercase mb-1 text-stone-950">
              {bookName}
            </h1>
            <div className="text-center font-bold text-xs uppercase tracking-wider text-amber-950 border-b border-stone-300 pb-2 mb-3 font-mono">
              BOOK INTRODUCTION
            </div>
            <div className="space-y-3 text-justify text-sm sm:text-[15px] leading-relaxed text-stone-900">
              {introParagraphs.map((paraHtml, pIdx) => (
                <p 
                  key={pIdx} 
                  dangerouslySetInnerHTML={{ __html: paraHtml }} 
                />
              ))}
            </div>
          </div>
        )}

        {/* 4. TATA LETAK 3 KOLOM RESMI SCOFIELD 1917 */}
        <div className="sco-columns">
          
          {/* KOLOM KIRI (Left Text Column) */}
          <div className="sco-col-text">
            <div className="text-center font-bold text-xs tracking-widest border-b border-stone-300 pb-1 mb-2 text-stone-900 uppercase">
              Chapter {selectedChapter}.
            </div>
            {leftVerses.map(v => (
              <div key={v.verse} id={`classic-verse-${v.verse}`}>
                {v.outlines && (
                  <div className="sco-outline">{v.outlines}</div>
                )}
                <div className="sco-verse">
                  <span className="sco-vn">{v.verse}</span>
                  {renderScofieldVerseText(v)}
                </div>
              </div>
            ))}
          </div>

          {/* KOLOM TENGAH (Center Margin Notes: 130px, Navy Blue, Chronology, Cross-Refs) */}
          <div className="sco-col-margin">
            <div className="sco-date">
              {chronology}.
            </div>

            <div className="space-y-1">
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
                    className={`sco-margin-entry ${selectedNoteIdx === mr.note_idx ? 'bg-amber-200/70' : ''}`}
                  >
                    <span className="font-bold text-stone-900 mr-1 not-italic text-[11px]">
                      {mr.verse}
                    </span>
                    <i>{mr.letter}</i>{' '}
                    <span className="text-[11.5px]">
                      {mr.text && mr.text.length < 50
                        ? mr.text
                        : (mr.keyword ? `${mr.keyword}${mr.refs.length ? ', ' + mr.refs.slice(0, 2).join('; ') : ''}` : `v.${mr.verse}`)}
                    </span>

                    {/* Tooltip Kaca Pembesar (Magnifier Tooltip) seperti di scofieldbible.org */}
                    <div className="sco-margin-tip">
                      <div className="font-bold text-amber-300 text-xs mb-1">
                        Verse {mr.verse} [{mr.letter}] — Note {mr.note_idx}
                      </div>
                      {mr.keyword && (
                        <div className="italic text-stone-200 text-xs mb-1">
                          "{mr.keyword}"
                        </div>
                      )}
                      {mr.refs.length > 0 && (
                        <div className="text-[11px] font-mono text-stone-300 border-t border-stone-700 pt-1">
                          Refs: {mr.refs.join('; ')}
                        </div>
                      )}
                      <div className="text-[11px] text-stone-300 mt-1 line-clamp-3">
                        {mr.text}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center italic text-stone-400 py-4 text-xs">
                  — Margin —
                </div>
              )}
            </div>
          </div>

          {/* KOLOM KANAN (Right Text Column) */}
          <div className="sco-col-text">
            <div className="hidden sm:block text-center font-bold text-[11px] tracking-wider text-stone-500 border-b border-stone-300 pb-1 mb-2 uppercase">
              Continued
            </div>
            {rightVerses.map(v => (
              <div key={v.verse} id={`classic-verse-${v.verse}`}>
                {v.outlines && (
                  <div className="sco-outline">{v.outlines}</div>
                )}
                <div className="sco-verse">
                  <span className="sco-vn">{v.verse}</span>
                  {renderScofieldVerseText(v)}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* 5. FOOTNOTES PANEL DI BAWAH (Dark Crimson Red #8B0000, 1px Border) */}
        {footnotes.length > 0 && (
          <div className="sco-footnotes">
            <div className="text-[11px] uppercase tracking-wider font-bold text-stone-700 mb-1 border-b border-stone-300 pb-1 flex justify-between items-center">
              <span>Scofield Reference Notes ({footnotes.length})</span>
              <span className="text-[10px] text-stone-500 font-normal">Klik catatan untuk membaca</span>
            </div>

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
                  className={`sco-fn-entry ${isSelected ? 'selected-fn' : ''}`}
                >
                  <span className="sco-fn-num">{fn.footnote_number || (fn.letter ? `[${fn.letter}]` : fn.note_idx)}</span>
                  <span className="font-bold">({selectedChapter}:{fn.verse}) </span>
                  {fn.keyword && <span className="font-bold">{fn.keyword}: </span>}
                  <span>
                    {isSelected 
                      ? fn.text 
                      : (fn.text.slice(0, 240) + (fn.text.length > 240 ? '... [Klik untuk baca selengkapnya]' : ''))
                    }
                  </span>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
