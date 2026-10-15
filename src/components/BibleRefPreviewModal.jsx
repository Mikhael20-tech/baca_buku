import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, X, Loader2, ZoomIn, ZoomOut, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseReference } from '@/utils/bibleRefParser';

const PREVIEW_CACHE = {};

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
  const [targetLang, setTargetLang] = useState(bibleLang); // 'id' | 'en'
  const [loading, setLoading] = useState(true);
  const [resolvedPassage, setResolvedPassage] = useState(null);
  const [error, setError] = useState(null);
  const [previewFontSize, setPreviewFontSize] = useState(fontSize || 20);

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
      setError(targetLang === 'en' ? 'Invalid reference format' : 'Format rujukan tidak dikenali');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const isEn = targetLang === 'en';
    const cacheKey = `${targetLang}-${parsed.bookId}`;

    const loadPassage = async () => {
      try {
        let bookData = PREVIEW_CACHE[cacheKey];
        if (!bookData) {
          const url = isEn ? `/bible/en/${parsed.bookId}.json` : `/bible/${parsed.bookId}.json`;
          let res = await fetch(url);
          if (!res.ok && isEn) {
            // Fallback to id if en is not found
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
        setError(targetLang === 'en' ? 'Scripture text could not be loaded.' : 'Ayat rujukan tidak dapat dimuat.');
      } finally {
        setLoading(false);
      }
    };

    loadPassage();
  }, [referenceText, isOpen, targetLang, books]);

  if (!isOpen) return null;

  const isEn = targetLang === 'en';

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
            {/* Language Selector: ID | EN */}
            <div className="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setTargetLang('id')}
                className={`px-2 py-0.5 rounded-lg transition ${
                  targetLang === 'id' ? 'bg-[#3B4B34] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400'
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setTargetLang('en')}
                className={`px-2 py-0.5 rounded-lg transition ${
                  targetLang === 'en' ? 'bg-[#3B4B34] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400'
                }`}
              >
                EN
              </button>
            </div>

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

        {/* Body Content */}
        <div className="overflow-y-auto pr-1 flex-1 py-2">
          {loading ? (
            <div className="py-16 text-center space-y-2.5">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                {isEn ? 'Fetching scripture text...' : 'Memuat ayat firman...'}
              </p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-rose-500 font-medium">
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
            size="sm"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold ml-auto px-5"
          >
            {isEn ? 'Close' : 'Tutup'}
          </Button>
        </div>
      </div>
    </div>
  );
}
