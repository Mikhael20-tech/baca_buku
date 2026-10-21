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
  tbVerse,
  enVerse,
  kjvVerse,
  asvVerse,
  netVerse,
  scofieldVerse,
  bibleLang = 'id'
}) {
  const [copiedType, setCopiedType] = useState(null);
  const isEn = ['en', 'kjv', 'asv', 'net', 'scofield'].includes(bibleLang);

  if (!isOpen || !verseNum) return null;

  const cleanText = (text) => {
    if (!text) return '';
    return text.replace(/<fn n="\d+"\/>/g, '').replace(/\s+/g, ' ').trim();
  };

  const idText = cleanText(idVerse?.text || '');
  const tbText = cleanText(tbVerse?.text || '');
  const enText = cleanText(enVerse?.text || '');
  const kjvText = cleanText(kjvVerse?.text || '');
  const asvText = cleanText(asvVerse?.text || '');
  const netText = cleanText(netVerse?.text || '');
  const scofieldText = cleanText(scofieldVerse?.text || '');
  const citation = `${isEn ? (bookNameEn || bookName) : bookName} ${chapter}:${verseNum}`;

  const handleCopy = (type, text, label) => {
    const formatted = `${citation} (${label}):\n"${text}"`;
    navigator.clipboard.writeText(formatted);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyAll = () => {
    let formatted = `${citation}`;
    if (idText) formatted += `\n\n[AVP • Alkitab Versi Pemulihan]:\n"${idText}"`;
    if (tbText) formatted += `\n\n[TB • Terjemahan Baru (TB - LAI)]:\n"${tbText}"`;
    if (enText) formatted += `\n\n[RCV • Recovery Version]:\n"${enText}"`;
    if (kjvText) formatted += `\n\n[KJV • King James Version (KJV)]:\n"${kjvText}"`;
    if (asvText) formatted += `\n\n[ASV • American Standard Version (ASV)]:\n"${asvText}"`;
    if (netText) formatted += `\n\n[NET • New English Translation (NET)]:\n"${netText}"`;
    if (scofieldText) formatted += `\n\n[Scofield 1917 • Reference Bible]:\n"${scofieldText}"`;
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
        className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-amber-300/80 dark:border-amber-700/60 flex flex-col space-y-4 max-h-[90vh] animate-modal-card-in"
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
        <div className="overflow-y-auto pr-1 flex-1 space-y-3.5 scrollbar-thin">
          {/* 1. Alkitab Versi Pemulihan (AVP) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                Alkitab Versi Pemulihan (AVP)
              </span>
              <button
                onClick={() => handleCopy('id', idText, 'AVP')}
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

          {/* 2. Bahasa Indonesia: Terjemahan Baru LAI */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-300/80 dark:border-emerald-700">
                Terjemahan Baru (TB • LAI)
              </span>
              <button
                onClick={() => handleCopy('tb', tbText, 'TB LAI')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center gap-1 transition"
              >
                {copiedType === 'tb' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'tb' ? (isEn ? 'Copied' : 'Tersalin') : (isEn ? 'Copy' : 'Salin')}</span>
              </button>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-zinc-200 font-serif">
              {tbText || '—'}
            </p>
          </div>

          {/* 3. Recovery Version (RCV) */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/60 px-2 py-0.5 rounded-md border border-amber-300/80 dark:border-amber-700">
                Recovery Version (RCV)
              </span>
              <button
                onClick={() => handleCopy('en', enText, 'RCV')}
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

          {/* 4. English: King James Version (KJV 1769) */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-indigo-800 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-900/60 px-2 py-0.5 rounded-md border border-indigo-300/80 dark:border-indigo-700">
                King James Version (KJV 1769)
              </span>
              <button
                onClick={() => handleCopy('kjv', kjvText, 'KJV 1769')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center gap-1 transition"
              >
                {copiedType === 'kjv' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'kjv' ? (isEn ? 'Copied' : 'Tersalin') : (isEn ? 'Copy' : 'Salin')}</span>
              </button>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-zinc-200 font-serif">
              {kjvText || '—'}
            </p>
          </div>

          {/* 5. English: American Standard Version (ASV 1901) */}
          <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-teal-800 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-900/60 px-2 py-0.5 rounded-md border border-teal-300/80 dark:border-teal-700">
                American Standard Version (ASV 1901)
              </span>
              <button
                onClick={() => handleCopy('asv', asvText, 'ASV 1901')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center gap-1 transition"
              >
                {copiedType === 'asv' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'asv' ? (isEn ? 'Copied' : 'Tersalin') : (isEn ? 'Copy' : 'Salin')}</span>
              </button>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-zinc-200 font-serif">
              {asvText || '—'}
            </p>
          </div>

          {/* 6. English: New English Translation (NET Bible) */}
          <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-sky-800 dark:text-sky-300 bg-sky-100/80 dark:bg-sky-900/60 px-2 py-0.5 rounded-md border border-sky-300/80 dark:border-sky-700">
                New English Translation (NET Bible)
              </span>
              <button
                onClick={() => handleCopy('net', netText, 'NET Bible')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center gap-1 transition"
              >
                {copiedType === 'net' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'net' ? (isEn ? 'Copied' : 'Tersalin') : (isEn ? 'Copy' : 'Salin')}</span>
              </button>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-zinc-200 font-serif">
              {netText || '—'}
            </p>
          </div>

          {/* 7. English: Scofield Reference Bible 1917 (KJV) */}
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
            <span>{copiedType === 'all' ? (isEn ? 'All Copied!' : 'Semua Versi Tersalin!') : (isEn ? 'Copy All Translations' : 'Salin Semua Terjemahan')}</span>
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
