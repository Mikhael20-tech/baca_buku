import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, X, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseReference } from '@/utils/bibleRefParser';

const PREVIEW_CACHE = {};

const PREVIEW_LANGS = [
  { id: 'id', label: 'AVP' },
  { id: 'tb', label: 'TB' },
  { id: 'en', label: 'RCV' },
  { id: 'kjv', label: 'KJV' },
  { id: 'asv', label: 'ASV' },
  { id: 'net', label: 'NET' },
  { id: 'scofield', label: 'Scofield' }
];

export default function BibleRefPreviewModal({
  referenceText,
  isOpen,
  onClose,
  bibleLang = 'id',
  books = [],
  fontSize = 20,
  fontFamily = "'Bodoni Moda', 'Plus Jakarta Sans', serif",
  onJumpToPassage
}) {
  const [targetLang, setTargetLang] = useState(bibleLang);
  const [loading, setLoading] = useState(true);
  const [resolvedPassage, setResolvedPassage] = useState(null);
  const [error, setError] = useState(null);
  const [previewFontSize, setPreviewFontSize] = useState(fontSize || 20);

  const isEn = ['en', 'kjv', 'asv', 'net', 'scofield'].includes(targetLang);

  // Sync targetLang with bibleLang when modal opens
  useEffect(() => {
    if (isOpen) {
      setTargetLang(bibleLang);
    }
  }, [isOpen, bibleLang]);

  useEffect(() => {
    if (fontSize) {
      setPreviewFontSize(Math.max(18, fontSize));
    }
  }, [fontSize, isOpen]);

  useEffect(() => {
    if (!isOpen || !referenceText) {
      setResolvedPassage(null);
      return;
    }

    const parsed = parseReference(referenceText);
    if (!parsed) {
      setError(isEn ? 'Invalid reference format' : 'Format rujukan tidak dikenali');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const cacheKey = `${targetLang}-${parsed.bookId}`;

    const loadPassage = async () => {
      try {
        let bookData = PREVIEW_CACHE[cacheKey];
        if (!bookData) {
          const url = ['tb', 'kjv', 'asv', 'net', 'scofield', 'en'].includes(targetLang)
            ? `/bible/${targetLang}/${parsed.bookId}.json`
            : `/bible/${parsed.bookId}.json`;

          let res = await fetch(url);
          if (!res.ok) {
            // Fallback to id if targetLang file fails
            res = await fetch(`/bible/${parsed.bookId}.json`);
          }
          if (!res.ok) throw new Error('Book not found');
          bookData = await res.json();
          PREVIEW_CACHE[cacheKey] = bookData;
        }

        const chap = bookData?.chapters?.[parsed.chapter] || bookData?.chapters?.[String(parsed.chapter)];
        if (!chap || !chap.verses) {
          throw new Error('Chapter not found');
        }

        const targetVerses = chap.verses.filter(
          v => v.verse >= parsed.verseStart && v.verse <= parsed.verseEnd
        );

        const targetBook = books.find(b => b.id === parsed.bookId) || { name: bookData.name || parsed.raw, id: parsed.bookId };

        setResolvedPassage({
          bookId: parsed.bookId,
          bookName: bookData.name || targetBook.name,
          chapter: parsed.chapter,
          verseStart: parsed.verseStart,
          verseEnd: parsed.verseEnd,
          verses: targetVerses
        });
      } catch (err) {
        setError(isEn ? 'Scripture text could not be loaded.' : 'Ayat rujukan tidak dapat dimuat.');
      } finally {
        setLoading(false);
      }
    };

    loadPassage();
  }, [referenceText, isOpen, targetLang, books]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 animate-modal-backdrop-in"
      onClick={onClose}
    >
      <div 
        className="bg-[#FAF7F2]/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl backdrop-saturate-180 rounded-[32px] max-w-lg sm:max-w-xl w-full p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-white/80 dark:border-white/15 space-y-4 max-h-[85vh] flex flex-col animate-modal-card-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Apple Grabber Bar */}
        <div className="w-10 h-1 rounded-full bg-[#1C1917]/20 dark:bg-white/25 mx-auto -mt-2 mb-1 shrink-0" />

        {/* Minimalist Header */}
        <div className="flex items-start justify-between pb-3 border-b border-black/5 dark:border-white/10 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#3B4B34]/10 dark:bg-emerald-500/15 text-[#3B4B34] dark:text-emerald-400 border border-[#3B4B34]/20 font-sans font-semibold text-[10px] tracking-wider uppercase inline-flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" />
                {isEn ? 'Cross Reference' : 'Ayat Rujukan Silang'}
              </span>
            </div>
            <h3 className="font-bodoni font-bold text-xl sm:text-2xl text-[#1C1917] dark:text-[#F4EFE6] tracking-tight">
              {resolvedPassage 
                ? `${resolvedPassage.bookName} ${resolvedPassage.chapter}:${resolvedPassage.verseStart}${resolvedPassage.verseEnd !== resolvedPassage.verseStart ? `-${resolvedPassage.verseEnd}` : ''}`
                : referenceText}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Font Size Controls */}
            <div className="flex items-center border border-white/80 dark:border-white/10 rounded-full px-2 py-0.5 bg-white/60 dark:bg-white/10 backdrop-blur-md shadow-2xs">
              <button
                type="button"
                onClick={() => setPreviewFontSize(prev => Math.max(14, prev - 2))}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#1C1917]/70 dark:text-white/70 transition cursor-pointer"
                title="Perkecil Teks"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-sans font-semibold px-1.5 text-[#1C1917]/80 dark:text-white/80 tabular-nums">
                {previewFontSize}px
              </span>
              <button
                type="button"
                onClick={() => setPreviewFontSize(prev => Math.min(34, prev + 2))}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#1C1917]/70 dark:text-white/70 transition cursor-pointer"
                title="Perbesar Teks"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Apple Circular Close Button */}
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/60 dark:bg-white/15 backdrop-blur-md border border-white/80 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/20 text-[#1C1917]/70 dark:text-white/70 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Translation Selector Bar (Apple Segmented Style) */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5 px-1 bg-white/50 dark:bg-black/30 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-full shadow-inner">
          <span className="text-[10px] uppercase font-bold text-[#1C1917]/50 dark:text-zinc-400 px-2 font-sans tracking-wider shrink-0">
            {isEn ? 'Version' : 'Versi'}
          </span>
          {PREVIEW_LANGS.map(lang => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setTargetLang(lang.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-sans font-semibold tracking-wider uppercase transition whitespace-nowrap cursor-pointer ${
                targetLang === lang.id
                  ? 'bg-[#3B4B34] text-[#F4EFE6] shadow-xs'
                  : 'text-[#1C1917]/60 dark:text-white/60 hover:text-[#1C1917] dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto pr-1 flex-1 py-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="w-6 h-6 text-[#3B4B34] dark:text-emerald-400 animate-spin" />
              <p className="text-xs text-[#1C1917]/60 dark:text-zinc-400 font-sans font-medium animate-pulse">
                {isEn ? 'Loading scripture passage...' : 'Memuat ayat rujukan...'}
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs text-center font-medium my-4">
              {error}
            </div>
          ) : resolvedPassage ? (
            <div className="space-y-4">
              {resolvedPassage.verses.map((v) => (
                <div 
                  key={v.verse} 
                  className="flex items-start gap-3 p-3 rounded-2xl hover:bg-white/40 dark:hover:bg-white/5 transition"
                >
                  <span className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#3B4B34]/10 dark:bg-emerald-500/15 text-[#3B4B34] dark:text-emerald-400 font-sans font-semibold tracking-tight tabular-nums flex items-center justify-center mt-0.5 select-none shadow-2xs text-xs sm:text-sm">
                    {v.verse}
                  </span>
                  <p 
                    className="flex-1 text-[#1C1917] dark:text-[#F4EFE6] font-bodoni leading-relaxed"
                    style={{ 
                      fontSize: `${previewFontSize}px`, 
                      lineHeight: 1.8 
                    }}
                  >
                    {v.text}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Minimalist Footer Actions */}
        <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-2">
          {resolvedPassage && onJumpToPassage && (
            <button
              onClick={() => {
                onJumpToPassage({
                  bookId: resolvedPassage.bookId,
                  chapter: resolvedPassage.chapter,
                  verse: resolvedPassage.verseStart,
                  lang: targetLang
                });
                onClose();
              }}
              className="px-5 py-2.5 rounded-full bg-[#3B4B34] hover:bg-[#2C3827] text-[#F4EFE6] text-xs font-sans font-semibold shadow-md shadow-[#3B4B34]/20 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>{isEn ? 'Open in Reader' : 'Buka Pasal di Pembaca'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-full border border-white/80 dark:border-white/10 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-xl hover:bg-white dark:hover:bg-zinc-700 text-xs font-sans font-semibold text-[#1C1917] dark:text-zinc-200 transition cursor-pointer shadow-2xs active:scale-95 ml-auto"
          >
            {isEn ? 'Close' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
}
