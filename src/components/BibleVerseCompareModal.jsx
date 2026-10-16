import React, { useState } from 'react';
import { X, Columns, Copy, Check, BookOpen } from 'lucide-react';
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
  scofieldVerse,
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
  const scofieldText = cleanText(scofieldVerse?.text || '');
  const citation = `${isEn ? (bookNameEn || bookName) : bookName} ${chapter}:${verseNum}`;

  const handleCopy = (type, text, label) => {
    const formatted = `${citation} (${label}):\n"${text}"`;
    navigator.clipboard.writeText(formatted);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyAll = () => {
    let formatted = `${citation}\n[ID • Pemulihan]:\n"${idText}"\n\n[EN • Recovery Version]:\n"${enText}"`;
    if (scofieldText) {
      formatted += `\n\n[Scofield 1917 • KJV]:\n"${scofieldText}"`;
    }
    navigator.clipboard.writeText(formatted);
    setCopiedType('all');
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-modal-backdrop-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-amber-300/80 dark:border-amber-700/60 flex flex-col space-y-4 max-h-[88vh] animate-modal-card-in"
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

          {/* Scofield Reference Bible 1917 (KJV) */}
          <div className="p-4 rounded-2xl bg-[#fcfaf2] dark:bg-stone-900/80 border border-amber-300 dark:border-stone-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-stone-900 dark:text-amber-200 bg-amber-200/80 dark:bg-stone-800 px-2 py-0.5 rounded-md border border-amber-400 dark:border-stone-600">
                  The Scofield Reference Bible (1917 KJV)
                </span>
                {scofieldVerse?.footnotes && scofieldVerse.footnotes.length > 0 && (
                  <span className="text-[10px] font-bold text-red-800 dark:text-red-400 bg-red-100 dark:bg-red-950/70 px-1.5 py-0.5 rounded border border-red-300 font-mono">
                    {scofieldVerse.footnotes.length} Note{scofieldVerse.footnotes.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleCopy('scofield', scofieldText, 'Scofield 1917')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center gap-1 transition"
              >
                {copiedType === 'scofield' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'scofield' ? (isEn ? 'Copied' : 'Tersalin') : (isEn ? 'Copy' : 'Salin')}</span>
              </button>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-stone-900 dark:text-zinc-200 font-serif">
              {scofieldText || '—'}
            </p>

            {/* If Scofield footnotes exist on this verse */}
            {scofieldVerse?.footnotes && scofieldVerse.footnotes.length > 0 && (
              <div className="pt-2 border-t border-amber-200/80 dark:border-stone-700/80 space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-600 dark:text-stone-400 font-mono">
                  Scofield Commentary:
                </span>
                {scofieldVerse.footnotes.map((fn, fIdx) => (
                  <div key={fIdx} className="text-xs text-stone-700 dark:text-stone-300 font-serif pl-2 border-l-2 border-amber-400">
                    <span className="font-bold text-red-900 dark:text-red-400 mr-1">[{fn.note_idx}]</span>
                    {fn.keyword && <span className="font-bold mr-1">{fn.keyword}:</span>}
                    <span>{fn.text.slice(0, 160)}{fn.text.length > 160 ? '...' : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={handleCopyAll}
            className="rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            {copiedType === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedType === 'all' ? (isEn ? 'All Copied!' : 'Semua Versi Tersalin!') : (isEn ? 'Copy All 3 Translations' : 'Salin 3 Terjemahan')}</span>
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
