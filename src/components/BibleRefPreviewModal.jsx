import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseReference } from '@/utils/bibleRefParser';

const PREVIEW_CACHE = {};

export default function BibleRefPreviewModal({
  referenceText,
  isOpen,
  onClose,
  bibleLang = 'id',
  books = [],
  onJumpToPassage
}) {
  const [loading, setLoading] = useState(true);
  const [resolvedPassage, setResolvedPassage] = useState(null);
  const [error, setError] = useState(null);

  const isEn = bibleLang === 'en';

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

    const targetBook = books.find(b => b.id === parsed.bookId) || { name: parsed.raw, id: parsed.bookId };
    const cacheKey = `${bibleLang}-${parsed.bookId}`;

    const loadPassage = async () => {
      try {
        let bookData = PREVIEW_CACHE[cacheKey];
        if (!bookData) {
          const url = isEn ? `/bible/en/${parsed.bookId}.json` : `/bible/${parsed.bookId}.json`;
          const res = await fetch(url);
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
  }, [referenceText, isOpen, bibleLang, books]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-modal-backdrop-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-amber-300/80 dark:border-amber-700/60 max-h-[80vh] flex flex-col space-y-3.5 animate-modal-card-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-zinc-100">
                {resolvedPassage 
                  ? `${resolvedPassage.bookName} ${resolvedPassage.chapter}:${resolvedPassage.verseStart}${resolvedPassage.verseEnd !== resolvedPassage.verseStart ? `-${resolvedPassage.verseEnd}` : ''}`
                  : referenceText}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEn ? 'Footnote Cross-Reference' : 'Rujukan Silang Catatan Kaki'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto pr-1 flex-1 py-1">
          {loading ? (
            <div className="py-12 text-center space-y-2">
              <Loader2 className="w-7 h-7 text-amber-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">
                {isEn ? 'Fetching reference...' : 'Memuat ayat rujukan...'}
              </p>
            </div>
          ) : error ? (
            <div className="py-10 text-center text-xs text-rose-500 font-medium">
              {error}
            </div>
          ) : resolvedPassage ? (
            <div className="space-y-2.5">
              {resolvedPassage.verses.map((v) => (
                <div key={v.verse} className="flex items-start gap-2.5 text-xs sm:text-sm">
                  <span className="shrink-0 w-6 h-6 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-300 font-mono text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {v.verse}
                  </span>
                  <p className="flex-1 text-slate-700 dark:text-zinc-200 leading-relaxed font-serif">
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
                  verse: resolvedPassage.verseStart
                });
                onClose();
              }}
              className="rounded-xl text-xs font-bold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
            >
              <span>{isEn ? 'Open Chapter' : 'Buka di Pembaca'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold ml-auto"
          >
            {isEn ? 'Close' : 'Tutup'}
          </Button>
        </div>
      </div>
    </div>
  );
}
