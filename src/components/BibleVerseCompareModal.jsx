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

  const translations = [
    { id: 'id', label: 'Alkitab Versi Pemulihan (AVP)', short: 'AVP', text: idText, primary: true },
    { id: 'tb', label: 'Terjemahan Baru (TB • LAI)', short: 'TB', text: tbText },
    { id: 'en', label: 'Recovery Version (RCV)', short: 'RCV', text: enText },
    { id: 'kjv', label: 'King James Version (KJV 1769)', short: 'KJV', text: kjvText },
    { id: 'asv', label: 'American Standard Version (ASV 1901)', short: 'ASV', text: asvText },
    { id: 'net', label: 'New English Translation (NET)', short: 'NET', text: netText },
    { 
      id: 'scofield', 
      label: 'The Scofield Reference Bible (1917 KJV)', 
      short: 'Scofield', 
      text: scofieldText,
      footnotes: scofieldVerse?.footnotes
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 animate-modal-backdrop-in"
      onClick={onClose}
    >
      <div 
        className="bg-[#FAF7F2]/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl backdrop-saturate-180 rounded-[32px] max-w-2xl w-full p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-white/80 dark:border-white/15 flex flex-col space-y-4 max-h-[88vh] animate-modal-card-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Apple Grabber Bar */}
        <div className="w-10 h-1 rounded-full bg-[#1C1917]/20 dark:bg-white/25 mx-auto -mt-2 mb-1 shrink-0" />

        {/* Minimalist Header */}
        <div className="flex items-start justify-between pb-3 border-b border-black/5 dark:border-white/10 gap-3">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#3B4B34]/10 dark:bg-emerald-500/15 text-[#3B4B34] dark:text-emerald-400 border border-[#3B4B34]/20 font-sans font-semibold text-[10px] tracking-wider uppercase inline-flex items-center gap-1.5">
              <Columns className="w-3 h-3" />
              {isEn ? 'Parallel Comparison' : 'Bandingkan Terjemahan'}
            </span>
            <h3 className="font-bodoni font-bold text-xl sm:text-2xl text-[#1C1917] dark:text-[#F4EFE6] tracking-tight">
              {citation}
            </h3>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/60 dark:bg-white/15 backdrop-blur-md border border-white/80 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/20 text-[#1C1917]/70 dark:text-white/70 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Translation Cards */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-3 scrollbar-thin">
          {translations.map((item) => (
            <div 
              key={item.id}
              className={`p-4 rounded-2xl border transition-all ${
                item.primary
                  ? 'bg-white/80 dark:bg-white/10 border-[#3B4B34]/30 dark:border-white/20 shadow-xs'
                  : 'bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider font-sans px-2.5 py-0.5 rounded-full border ${
                  item.primary
                    ? 'bg-[#3B4B34] text-[#F4EFE6] border-[#3B4B34]'
                    : 'bg-white/60 dark:bg-white/10 text-[#1C1917]/70 dark:text-white/70 border-white/60 dark:border-white/10'
                }`}>
                  {item.label}
                </span>

                <button
                  onClick={() => handleCopy(item.id, item.text, item.short)}
                  className="text-xs font-sans font-medium text-[#1C1917]/60 dark:text-white/60 hover:text-[#1C1917] dark:hover:text-white flex items-center gap-1 transition cursor-pointer px-2 py-0.5 rounded-full hover:bg-white/60 dark:hover:bg-white/10"
                >
                  {copiedType === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === item.id ? (isEn ? 'Copied' : 'Tersalin') : (isEn ? 'Copy' : 'Salin')}</span>
                </button>
              </div>

              <p className="text-sm sm:text-base leading-relaxed text-[#1C1917] dark:text-[#F4EFE6] font-bodoni">
                {item.text || '—'}
              </p>

              {/* Scofield commentary notes */}
              {item.footnotes && item.footnotes.length > 0 && (
                <div className="pt-2.5 mt-2.5 border-t border-black/5 dark:border-white/10 space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#1C1917]/50 dark:text-white/50 font-sans">
                    Scofield Notes:
                  </span>
                  {item.footnotes.map((fn, fIdx) => (
                    <div key={fIdx} className="text-xs text-[#1C1917]/80 dark:text-white/80 font-bodoni pl-2.5 border-l-2 border-[#3B4B34]/40">
                      <span className="font-semibold text-[#3B4B34] dark:text-emerald-400 mr-1">[{fn.note_idx}]</span>
                      {fn.keyword && <span className="font-semibold mr-1">{fn.keyword}:</span>}
                      <span>{fn.text.slice(0, 180)}{fn.text.length > 180 ? '...' : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Minimalist Footer */}
        <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-2">
          <button
            onClick={handleCopyAll}
            className="px-4 py-2.5 rounded-full border border-white/80 dark:border-white/10 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-xl hover:bg-white dark:hover:bg-zinc-700 text-xs font-sans font-semibold text-[#1C1917] dark:text-zinc-200 transition cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1.5"
          >
            {copiedType === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedType === 'all' ? (isEn ? 'All Copied!' : 'Semua Versi Tersalin!') : (isEn ? 'Copy All Translations' : 'Salin Semua Terjemahan')}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#3B4B34] hover:bg-[#2C3827] text-[#F4EFE6] text-xs font-sans font-semibold shadow-md shadow-[#3B4B34]/20 transition cursor-pointer active:scale-95"
          >
            {isEn ? 'Close' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
}
