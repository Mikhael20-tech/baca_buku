import React, { useState } from 'react';
import { X, Columns, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BibleVerseCompareModal({
  isOpen,
  onClose,
  verseNum,
  bookName,
  bookNameEn,
  chapter,
  idVerse,
  enVerse,
  bibleLang = 'id'
}) {
  const [copiedType, setCopiedType] = useState(null);
  const isEn = bibleLang === 'en';

  if (!isOpen || !verseNum) return null;

  const cleanText = (text) => {
    if (!text) return '';
    return text.replace(/<fn n="\d+"\/>/g, '').replace(/\s+/g, ' ').trim();
  };

  const idText = cleanText(idVerse?.text || '');
  const enText = cleanText(enVerse?.text || '');
  const citation = `${isEn ? (bookNameEn || bookName) : bookName} ${chapter}:${verseNum}`;

  const handleCopy = (type, text, label) => {
    const formatted = `${citation} (${label}):\n"${text}"`;
    navigator.clipboard.writeText(formatted);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyBoth = () => {
    const formatted = `${citation}\n[ID • Pemulihan]:\n"${idText}"\n\n[EN • Recovery Version]:\n"${enText}"`;
    navigator.clipboard.writeText(formatted);
    setCopiedType('both');
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-modal-backdrop-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-amber-300/80 dark:border-amber-700/60 flex flex-col space-y-4 max-h-[85vh] animate-modal-card-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Columns className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-zinc-100">
                {isEn ? 'Compare Translations' : 'Bandingkan Terjemahan'}
              </h3>
              <p className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                {citation}
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

        {/* Translation Cards */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-3.5">
          {/* Bahasa Indonesia */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                Bahasa Indonesia (Versi Pemulihan)
              </span>
              <button
                onClick={() => handleCopy('id', idText, 'ID Pemulihan')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center gap-1 transition"
              >
                {copiedType === 'id' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'id' ? (isEn ? 'Copied' : 'Tersalin') : (isEn ? 'Copy' : 'Salin')}</span>
              </button>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-zinc-200 font-serif">
              {idText || '—'}
            </p>
          </div>

          {/* English Recovery Version */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/60 px-2 py-0.5 rounded-md border border-amber-300/80 dark:border-amber-700">
                English (Holy Bible Recovery Version)
              </span>
              <button
                onClick={() => handleCopy('en', enText, 'EN Recovery Version')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center gap-1 transition"
              >
                {copiedType === 'en' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'en' ? (isEn ? 'Copied' : 'Tersalin') : (isEn ? 'Copy' : 'Salin')}</span>
              </button>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-zinc-200 font-serif">
              {enText || '—'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={handleCopyBoth}
            className="rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            {copiedType === 'both' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedType === 'both' ? (isEn ? 'Both Copied!' : 'Kedua Versi Tersalin!') : (isEn ? 'Copy Both Translations' : 'Salin Kedua Terjemahan')}</span>
          </Button>

          <Button
            onClick={onClose}
            className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
          >
            {isEn ? 'Close' : 'Tutup'}
          </Button>
        </div>
      </div>
    </div>
  );
}
