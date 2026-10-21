import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, X, Loader2, ZoomIn, ZoomOut, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseReference } from '@/utils/bibleRefParser';

const PREVIEW_CACHE = {};

const PREVIEW_LANGS = [
  { id: 'id', label: 'ID' },
  { id: 'tb', label: 'TB' },
  { id: 'en', label: 'EN' },
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
  fontFamily = "'Lora', Georgia, serif",
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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-modal-backdrop-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 rounded-3xl max-w-xl sm:max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-amber-300/80 dark:border-amber-700/60 max-h-[85vh] flex flex-col space-y-4 animate-modal-card-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-zinc-100">
                {resolvedPassage 
                  ? `${resolvedPassage.bookName} ${resolvedPassage.chapter}:${resolvedPassage.verseStart}${resolvedPassage.verseEnd !== resolvedPassage.verseStart ? `-${resolvedPassage.verseEnd}` : ''}`
                  : referenceText}
              </h3>
              <p className="text-xs text-amber-700/80 dark:text-amber-300/80 font-medium">
                {isEn ? 'Scripture Cross-Reference' : 'Ayat Rujukan Silang'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Font Size Controls */}
            <div className="flex items-center border border-slate-200 dark:border-zinc-700 rounded-xl p-0.5 bg-slate-50 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => setPreviewFontSize(prev => Math.max(14, prev - 2))}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition"
                title="Perkecil Teks"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold px-1.5 text-slate-600 dark:text-zinc-300">
                {previewFontSize}px
              </span>
              <button
                type="button"
                onClick={() => setPreviewFontSize(prev => Math.min(34, prev + 2))}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition"
                title="Perbesar Teks"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Translation Selector Bar */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 border-b border-slate-100 dark:border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 shrink-0 font-mono">
            {isEn ? 'Version:' : 'Versi:'}
          </span>
          {PREVIEW_LANGS.map(lang => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setTargetLang(lang.id)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition whitespace-nowrap cursor-pointer ${
                targetLang === lang.id
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto pr-1 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="w-7 h-7 text-amber-600 animate-spin" />
              <p className="text-xs text-slate-400 font-medium animate-pulse">
                {isEn ? 'Loading scripture passage...' : 'Memuat ayat rujukan...'}
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs text-center font-medium my-6">
              {error}
            </div>
          ) : resolvedPassage ? (
            <div className="space-y-4">
              {resolvedPassage.verses.map((v) => (
                <div key={v.verse} className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition">
                  <span className="shrink-0 w-8 h-8 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-300 font-mono text-xs font-bold border border-amber-400/30 flex items-center justify-center mt-1 select-none shadow-2xs">
                    {v.verse}
                  </span>
                  <p 
                    className="flex-1 text-slate-800 dark:text-zinc-100 leading-relaxed font-serif"
                    style={{ 
                      fontSize: `${previewFontSize}px`, 
                      fontFamily: fontFamily || "'Lora', Georgia, serif",
                      lineHeight: 1.85 
                    }}
                  >
                    {v.text}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
          {resolvedPassage && onJumpToPassage && (
            <Button
              size="sm"
              onClick={() => {
                onJumpToPassage({
                  bookId: resolvedPassage.bookId,
                  chapter: resolvedPassage.chapter,
                  verse: resolvedPassage.verseStart,
                  lang: targetLang
                });
                onClose();
              }}
              className="rounded-xl text-xs font-bold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-xs px-4"
            >
              <span>{isEn ? 'Open in Reader' : 'Buka Pasal di Pembaca'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl text-xs font-bold ml-auto"
          >
            {isEn ? 'Close' : 'Tutup'}
          </Button>
        </div>
      </div>
    </div>
  );
}
