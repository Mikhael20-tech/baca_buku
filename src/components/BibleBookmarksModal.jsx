import React, { useState } from 'react';
import { Bookmark, Trash2, ChevronRight, X, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BibleBookmarksModal({ 
  isOpen, 
  onClose, 
  bookmarks = [], 
  onRemoveBookmark, 
  onSelectBookmark,
  bibleLang = 'id'
}) {
  const [activeTab, setActiveTab] = useState('bookmarks'); // 'bookmarks' | 'highlights'
  const isEn = bibleLang === 'en';

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-modal-backdrop-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 dark:border-zinc-800 max-h-[85vh] flex flex-col space-y-4 animate-modal-card-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-zinc-100">
                {isEn ? 'Saved Verses & Bookmarks' : 'Ayat Tersimpan & Bookmark'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {bookmarks.length} {isEn ? 'verses bookmarked' : 'ayat ditandai'}
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

        {/* Content List */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-2.5">
          {bookmarks.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Bookmark className="w-10 h-10 mx-auto text-slate-300 dark:text-zinc-700" />
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                {isEn ? 'No bookmarks saved yet.' : 'Belum ada ayat yang ditandai.'}
              </p>
              <p className="text-[11px] text-slate-400">
                {isEn 
                  ? 'Click the bookmark icon on any verse while reading to save it here.' 
                  : 'Klik ikon bookmark pada ayat saat membaca untuk menyimpannya di sini.'}
              </p>
            </div>
          ) : (
            bookmarks.map((bm) => (
              <div 
                key={bm.id}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-600 bg-slate-50/50 dark:bg-zinc-800/40 transition-all flex items-start justify-between gap-3 group"
              >
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => {
                    onSelectBookmark(bm);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold font-mono text-[11px]">
                      {bm.bookName} {bm.chapter}:{bm.verse}
                    </span>
                    {bm.date && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {bm.date}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                    "{bm.text}"
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0 pt-1">
                  <button
                    onClick={() => onRemoveBookmark(bm.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title={isEn ? 'Remove Bookmark' : 'Hapus Bookmark'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      onSelectBookmark(bm);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40 transition"
                    title={isEn ? 'Jump to verse' : 'Buka ayat'}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
          <Button
            size="sm"
            onClick={onClose}
            className="rounded-xl px-5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs dark:bg-zinc-700 dark:hover:bg-zinc-600"
          >
            {isEn ? 'Close' : 'Tutup'}
          </Button>
        </div>
      </div>
    </div>
  );
}
