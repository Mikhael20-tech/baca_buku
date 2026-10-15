import React from 'react';
import { Sparkles, X, BookOpen, Clock, MapPin, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BibleIntroModal({ isOpen, onClose, bookData, bibleLang }) {
  if (!isOpen || !bookData || !bookData.intro) return null;

  const intro = bookData.intro;
  const isEn = bibleLang === 'en';

  const subject = isEn ? intro.Subject : (intro.Pokok || intro.Subject);
  const author = isEn ? intro.Author : (intro.Penulis || intro.Author);
  const time = isEn ? intro['Time of Writing'] : (intro['Waktu Penulisan'] || intro['Time of Writing']);
  const place = isEn ? intro['Place of Writing'] : (intro['Tempat penulisan'] || intro['Tempat Penulisan'] || intro['Place of Writing']);
  const recipients = isEn ? intro.Recipients : (intro.Penerima || intro.Recipients);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-modal-backdrop-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-amber-300/80 dark:border-amber-700/60 max-h-[85vh] flex flex-col space-y-4 animate-modal-card-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-zinc-100">
                {isEn ? `Book Overview: ${bookData.name}` : `Pengantar Kitab: ${bookData.name}`}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {isEn ? 'Holy Bible Recovery Version • Footnotes & Outlines' : 'Alkitab Versi Pemulihan • Catatan Kaki & Garis Besar'}
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

        {/* Content Body */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4 text-xs sm:text-sm">
          {/* Pokok / Subject (Highlighted Card) */}
          {subject && (
            <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-950 dark:text-amber-200 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400 block">
                {isEn ? 'Central Subject / Theme' : 'Pokok Utama Kitab'}
              </span>
              <p className="font-serif italic font-bold leading-relaxed text-sm sm:text-base">
                "{subject}"
              </p>
            </div>
          )}

          {/* Grid Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {author && (
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px] font-bold">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isEn ? 'Author' : 'Penulis'}</span>
                </div>
                <p className="text-slate-800 dark:text-zinc-200 font-medium leading-relaxed">
                  {author}
                </p>
              </div>
            )}

            {time && (
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px] font-bold">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isEn ? 'Time of Writing' : 'Waktu Penulisan'}</span>
                </div>
                <p className="text-slate-800 dark:text-zinc-200 font-medium leading-relaxed">
                  {time}
                </p>
              </div>
            )}

            {place && (
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px] font-bold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isEn ? 'Place of Writing' : 'Tempat Penulisan'}</span>
                </div>
                <p className="text-slate-800 dark:text-zinc-200 font-medium leading-relaxed">
                  {place}
                </p>
              </div>
            )}

            {recipients && (
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px] font-bold">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>{isEn ? 'Recipients' : 'Penerima'}</span>
                </div>
                <p className="text-slate-800 dark:text-zinc-200 font-medium leading-relaxed">
                  {recipients}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
          <Button
            size="sm"
            onClick={onClose}
            className="rounded-xl px-5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
          >
            {isEn ? 'Close' : 'Tutup Pengantar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
