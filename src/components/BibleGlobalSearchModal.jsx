import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

// In-memory cache for downloaded book data during search
const BOOK_CACHE = {};

export default function BibleGlobalSearchModal({
  isOpen,
  onClose,
  books = [],
  currentBookId,
  bibleLang = 'id',
  onSelectResult
}) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('ALL'); // 'ALL' | 'PL' | 'PB' | 'CURRENT'
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [progressText, setProgressText] = useState('');
  const searchAbortRef = useRef(false);

  const isEn = bibleLang === 'en';

  useEffect(() => {
    if (!isOpen) {
      searchAbortRef.current = true;
      setIsSearching(false);
    }
  }, [isOpen]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length < 2) return;

    searchAbortRef.current = false;
    setIsSearching(true);
    setResults([]);
    setProgressText(isEn ? 'Searching...' : 'Mencari firman...');

    // Filter books based on scope
    let targetBooks = [...books];
    if (scope === 'CURRENT') {
      targetBooks = books.filter(b => b.id === currentBookId);
    } else if (scope === 'PL') {
      targetBooks = books.filter(b => b.testament === 'PL');
    } else if (scope === 'PB') {
      targetBooks = books.filter(b => b.testament === 'PB');
    }

    const matches = [];
    const maxResults = 100;

    for (let i = 0; i < targetBooks.length; i++) {
      if (searchAbortRef.current) break;
      const b = targetBooks[i];
      setProgressText(`${isEn ? 'Searching in' : 'Memeriksa'} ${b.name} (${i + 1}/${targetBooks.length})...`);

      try {
        const cacheKey = `${bibleLang}-${b.id}`;
        let bookData = BOOK_CACHE[cacheKey];

        if (!bookData) {
          const url = isEn ? `/bible/en/${b.id}.json` : `/bible/${b.id}.json`;
          const res = await fetch(url);
          if (res.ok) {
            bookData = await res.json();
            BOOK_CACHE[cacheKey] = bookData;
          }
        }

        if (bookData && bookData.chapters) {
          for (const chapKey of Object.keys(bookData.chapters)) {
            if (matches.length >= maxResults) break;
            const chap = bookData.chapters[chapKey];
            if (chap && chap.verses) {
              for (const v of chap.verses) {
                if (matches.length >= maxResults) break;
                if (v.text && v.text.toLowerCase().includes(cleanQuery)) {
                  matches.push({
                    bookId: b.id,
                    bookName: b.name,
                    chapter: Number(chapKey),
                    verse: v.verse,
                    text: v.text
                  });
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('Error reading book for search:', b.id, err);
      }

      // Periodically update UI with matches found so far
      if (matches.length > 0 && i % 3 === 0) {
        setResults([...matches]);
      }
    }

    setIsSearching(false);
    setProgressText('');
    setResults(matches);
  };

  const highlightKeyword = (text, keyword) => {
    if (!keyword.trim()) return text;
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return parts.map((part, idx) => 
      part.toLowerCase() === keyword.toLowerCase() ? (
        <mark key={idx} className="bg-amber-300 dark:bg-amber-500/40 text-amber-950 dark:text-amber-100 rounded px-1 font-bold">
          {part}
        </mark>
      ) : part
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-modal-backdrop-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 dark:border-zinc-800 max-h-[88vh] flex flex-col space-y-4 animate-modal-card-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-zinc-100">
                {isEn ? 'Global Scripture Search' : 'Pencarian Firman Alkitab'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEn ? 'Search words or phrases across all 66 books' : 'Cari kata atau frasa di 66 kitab Alkitab'}
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

        {/* Search Input & Scope Bar */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isEn ? "Type keyword (e.g., grace, kingdom, faith)..." : "Ketik kata kunci (misal: kasih karunia, kerajaan, iman)..."}
              className="w-full pl-10 pr-24 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
            />
            <Button
              type="submit"
              disabled={isSearching || query.trim().length < 2}
              size="sm"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl text-xs font-bold px-3.5 bg-amber-600 hover:bg-amber-700 text-white h-7 shadow-xs"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (isEn ? 'Search' : 'Cari')}
            </Button>
          </div>

          {/* Scope Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
            <span className="text-[11px] text-slate-400 mr-1 shrink-0 font-medium">
              {isEn ? 'Scope:' : 'Cakupan:'}
            </span>
            <button
              type="button"
              onClick={() => setScope('ALL')}
              className={`px-3 py-1 rounded-xl transition ${
                scope === 'ALL'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
              }`}
            >
              {isEn ? 'All (66)' : 'Semua Kitab (66)'}
            </button>
            <button
              type="button"
              onClick={() => setScope('PL')}
              className={`px-3 py-1 rounded-xl transition ${
                scope === 'PL'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
              }`}
            >
              {isEn ? 'Old Testament (39)' : 'Perjanjian Lama (39)'}
            </button>
            <button
              type="button"
              onClick={() => setScope('PB')}
              className={`px-3 py-1 rounded-xl transition ${
                scope === 'PB'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
              }`}
            >
              {isEn ? 'New Testament (27)' : 'Perjanjian Baru (27)'}
            </button>
            <button
              type="button"
              onClick={() => setScope('CURRENT')}
              className={`px-3 py-1 rounded-xl transition ${
                scope === 'CURRENT'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
              }`}
            >
              {isEn ? 'This Book' : 'Kitab Ini Saja'}
            </button>
          </div>
        </form>

        {/* Searching Status */}
        {isSearching && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-amber-600" />
            <span className="truncate">{progressText}</span>
          </div>
        )}

        {/* Results List */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-2">
          {results.length > 0 && (
            <div className="text-[11px] font-bold text-slate-400 pb-1 flex items-center justify-between">
              <span>{isEn ? `Found ${results.length} matches` : `Ditemukan ${results.length} ayat cocok`}</span>
              {results.length >= 100 && (
                <span className="text-amber-600 dark:text-amber-400">
                  {isEn ? '(Showing first 100)' : '(Dibatasi 100 pertama)'}
                </span>
              )}
            </div>
          )}

          {results.map((res, rIdx) => (
            <div
              key={`${res.bookId}-${res.chapter}-${res.verse}-${rIdx}`}
              onClick={() => {
                onSelectResult(res);
                onClose();
              }}
              className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-600 bg-slate-50/50 dark:bg-zinc-800/40 hover:bg-amber-50/40 transition-all cursor-pointer group flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold font-mono text-[11px]">
                    {res.bookName} {res.chapter}:{res.verse}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-zinc-200 leading-relaxed">
                  {highlightKeyword(res.text, query)}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-transform shrink-0 pt-1" />
            </div>
          ))}

          {!isSearching && results.length === 0 && query.trim().length >= 2 && (
            <div className="py-16 text-center space-y-1">
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">
                {isEn ? 'No verses found for this query.' : 'Tidak ada ayat yang ditemukan untuk kata kunci ini.'}
              </p>
              <p className="text-[11px] text-slate-400">
                {isEn ? 'Try another keyword or expand your search scope.' : 'Coba gunakan kata kunci lain atau perluas cakupan pencarian.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
