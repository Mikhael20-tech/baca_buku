import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Download, Copy, Check, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CARD_THEMES = [
  {
    id: 'amber',
    name: 'Klasik Emas',
    bg: 'from-[#2C2416] via-[#1A1610] to-[#0D0B08]',
    canvasBg: ['#2C2416', '#1A1610', '#0D0B08'],
    textColor: '#FDFBF7',
    subColor: '#F59E0B',
    accentColor: '#D97706'
  },
  {
    id: 'emerald',
    name: 'Hijau Zamrud',
    bg: 'from-[#064E3B] via-[#022C22] to-[#01140F]',
    canvasBg: ['#064E3B', '#022C22', '#01140F'],
    textColor: '#ECFDF5',
    subColor: '#34D399',
    accentColor: '#059669'
  },
  {
    id: 'navy',
    name: 'Biru Samudera',
    bg: 'from-[#1E3A8A] via-[#0F172A] to-[#020617]',
    canvasBg: ['#1E3A8A', '#0F172A', '#020617'],
    textColor: '#F8FAFC',
    subColor: '#60A5FA',
    accentColor: '#2563EB'
  },
  {
    id: 'royal',
    name: 'Ungu Ningrat',
    bg: 'from-[#4C1D95] via-[#2E1065] to-[#0F051D]',
    canvasBg: ['#4C1D95', '#2E1065', '#0F051D'],
    textColor: '#FAF5FF',
    subColor: '#C084FC',
    accentColor: '#9333EA'
  },
  {
    id: 'parchment',
    name: 'Kertas Kuno',
    bg: 'from-[#FDFBF7] via-[#F4EFE6] to-[#E8DEC8]',
    canvasBg: ['#FDFBF7', '#F4EFE6', '#E8DEC8'],
    textColor: '#292524',
    subColor: '#78350F',
    accentColor: '#B45309'
  },
  {
    id: 'charcoal',
    name: 'Hitam Obsidian',
    bg: 'from-[#262626] via-[#171717] to-[#0A0A0A]',
    canvasBg: ['#262626', '#171717', '#0A0A0A'],
    textColor: '#FAFAFA',
    subColor: '#E2E8F0',
    accentColor: '#10b981'
  }
];

const TRANSLATION_LABELS = {
  id: 'Alkitab Versi Pemulihan (AVP)',
  tb: 'Terjemahan Baru (TB - LAI)',
  en: 'Holy Bible Recovery Version (RCV)',
  kjv: 'King James Version (KJV 1769)',
  asv: 'American Standard Version (ASV 1901)',
  net: 'New English Translation (NET Bible)',
  scofield: 'The Scofield Reference Bible 1917'
};

const LANG_OPTIONS = [
  { id: 'id', label: 'AVP' },
  { id: 'tb', label: 'TB' },
  { id: 'en', label: 'RCV' },
  { id: 'kjv', label: 'KJV' },
  { id: 'asv', label: 'ASV' },
  { id: 'net', label: 'NET' },
  { id: 'scofield', label: 'Scofield' }
];

export default function BibleVerseCardModal({ isOpen, onClose, verseData, bibleLang = 'id' }) {
  const [selectedTheme, setSelectedTheme] = useState('amber');
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cardLang, setCardLang] = useState(bibleLang);
  const [dynamicText, setDynamicText] = useState('');
  const canvasRef = useRef(null);

  const isEn = ['en', 'kjv', 'asv', 'net', 'scofield'].includes(cardLang);

  const cleanVerseText = (text) => {
    if (!text) return '';
    return text.replace(/<fn n="\d+"\/>/g, '').replace(/\s+/g, ' ').trim();
  };

  useEffect(() => {
    if (isOpen) {
      setCardLang(bibleLang);
      setDynamicText(verseData?.text || '');
    }
  }, [isOpen, bibleLang, verseData]);

  // Handle switching translation inside the card generator
  useEffect(() => {
    if (!isOpen || !verseData?.bookId) return;

    if (cardLang === bibleLang && verseData.text) {
      setDynamicText(verseData.text);
      return;
    }

    const loadDifferentTranslation = async () => {
      try {
        const url = ['tb', 'kjv', 'asv', 'net', 'scofield', 'en'].includes(cardLang)
          ? `/bible/${cardLang}/${verseData.bookId}.json`
          : `/bible/${verseData.bookId}.json`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const chap = data?.chapters?.[verseData.chapter] || data?.chapters?.[String(verseData.chapter)];
          const vObj = chap?.verses?.find(v => v.verse === verseData.verse);
          if (vObj?.text) {
            setDynamicText(vObj.text);
          }
        }
      } catch (err) {
        console.warn('Gagal memuat teks terjemahan kartu:', err);
      }
    };

    loadDifferentTranslation();
  }, [cardLang, isOpen, verseData, bibleLang]);

  const verseText = cleanVerseText(dynamicText || verseData?.text || '');
  const citation = `${verseData?.bookName || ''} ${verseData?.chapter || ''}:${verseData?.verse || ''}`;
  const versionTag = TRANSLATION_LABELS[cardLang] || TRANSLATION_LABELS.id;

  // Render canvas untuk download gambar kualitas tinggi (1080x1080)
  const handleDownloadImage = () => {
    setIsDownloading(true);
    const canvas = canvasRef.current;
    if (!canvas) {
      setIsDownloading(false);
      return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1080;

    const theme = CARD_THEMES.find(t => t.id === selectedTheme) || CARD_THEMES[0];

    // 1. Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, theme.canvasBg[0]);
    gradient.addColorStop(0.5, theme.canvasBg[1]);
    gradient.addColorStop(1, theme.canvasBg[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // 2. Ornamen Bingkai Tipis Mewah
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 50, 980, 980);

    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(65, 65, 950, 950);

    // Sudut Filigree Ornaments
    const cornerSize = 40;
    ctx.strokeStyle = theme.subColor;
    ctx.lineWidth = 4;
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(40, 40 + cornerSize);
    ctx.lineTo(40, 40);
    ctx.lineTo(40 + cornerSize, 40);
    ctx.stroke();
    // Top-Right
    ctx.beginPath();
    ctx.moveTo(1040 - cornerSize, 40);
    ctx.lineTo(1040, 40);
    ctx.lineTo(1040, 40 + cornerSize);
    ctx.stroke();
    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(40, 1040 - cornerSize);
    ctx.lineTo(40, 1040);
    ctx.lineTo(40 + cornerSize, 1040);
    ctx.stroke();
    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(1040 - cornerSize, 1040);
    ctx.lineTo(1040, 1040);
    ctx.lineTo(1040, 1040 - cornerSize);
    ctx.stroke();

    // 3. Ornamen Bintang Simbolik
    ctx.fillStyle = theme.subColor;
    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ ✦ ✦', 540, 150);

    // 4. Wrapping Text Ayat
    ctx.fillStyle = theme.textColor;
    let baseFontSize = 46;
    if (verseText.length > 250) baseFontSize = 36;
    if (verseText.length > 400) baseFontSize = 30;

    ctx.font = `italic 600 ${baseFontSize}px 'Bodoni Moda', 'Playfair Display', Georgia, serif`;
    ctx.textAlign = 'center';

    const words = `"${verseText}"`.split(' ');
    const lines = [];
    let currentLine = '';
    const maxWidth = 860;

    words.forEach(word => {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    });
    lines.push(currentLine.trim());

    // Hitung posisi Y vertikal di tengah
    const lineHeight = baseFontSize * 1.6;
    const totalBlockHeight = lines.length * lineHeight;
    let startY = (1080 - totalBlockHeight) / 2 + (baseFontSize * 0.4);

    lines.forEach(line => {
      ctx.fillText(line, 540, startY);
      startY += lineHeight;
    });

    // 5. Garis Pembatas
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(460, 890);
    ctx.lineTo(620, 890);
    ctx.stroke();

    // 6. Sitasi Ayat
    ctx.fillStyle = theme.subColor;
    ctx.font = "bold 38px 'Bodoni Moda', 'Cinzel', Georgia, serif";
    ctx.fillText(citation, 540, 945);

    // 7. Label Versi Alkitab & Watermark
    ctx.fillStyle = theme.textColor;
    ctx.globalAlpha = 0.7;
    ctx.font = "18px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`${versionTag}  •  Baca Alkitab`, 540, 990);
    ctx.globalAlpha = 1.0;

    // Export gambar
    try {
      const link = document.createElement('a');
      link.download = `Kartu-Ayat-${citation.replace(/[: ]/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyTextQuote = () => {
    const textQuote = `"${verseText}"\n\n— ${citation} (${versionTag})\nDibagikan dari Baca Alkitab`;
    navigator.clipboard.writeText(textQuote);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) return null;

  const currentThemeObj = CARD_THEMES.find(t => t.id === selectedTheme) || CARD_THEMES[0];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 animate-modal-backdrop-in"
      onClick={onClose}
    >
      <div 
        className="bg-[#FAF7F2]/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl backdrop-saturate-180 rounded-[32px] max-w-xl w-full p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-white/80 dark:border-white/15 flex flex-col space-y-4 max-h-[92vh] overflow-y-auto animate-modal-card-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Apple Grabber Bar */}
        <div className="w-10 h-1 rounded-full bg-[#1C1917]/20 dark:bg-white/25 mx-auto -mt-2 mb-1 shrink-0" />

        {/* Minimalist Header */}
        <div className="flex items-start justify-between pb-3 border-b border-black/5 dark:border-white/10 gap-3">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#3B4B34]/10 dark:bg-emerald-500/15 text-[#3B4B34] dark:text-emerald-400 border border-[#3B4B34]/20 font-sans font-semibold text-[10px] tracking-wider uppercase inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              {isEn ? 'Verse Card Generator' : 'Bagikan Kartu Ayat'}
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

        {/* Translation Selector Bar */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5 px-1 bg-white/50 dark:bg-black/30 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-full shadow-inner">
          <span className="text-[10px] uppercase font-bold text-[#1C1917]/50 dark:text-zinc-400 px-2 font-sans tracking-wider shrink-0">
            {isEn ? 'Version' : 'Versi'}
          </span>
          {LANG_OPTIONS.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setCardLang(opt.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-sans font-semibold tracking-wider uppercase transition whitespace-nowrap cursor-pointer ${
                cardLang === opt.id
                  ? 'bg-[#3B4B34] text-[#F4EFE6] shadow-xs'
                  : 'text-[#1C1917]/60 dark:text-white/60 hover:text-[#1C1917] dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Live Card Preview */}
        <div className="flex justify-center py-2">
          <div className={`w-full max-w-md aspect-square rounded-3xl bg-gradient-to-br ${currentThemeObj.bg} p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-xl border border-white/20 relative overflow-hidden select-none`}>
            {/* Corner Filigree Ornaments */}
            <div className="absolute top-3.5 left-3.5 w-4 h-4 border-t-2 border-l-2 border-white/40 rounded-tl-sm"></div>
            <div className="absolute top-3.5 right-3.5 w-4 h-4 border-t-2 border-r-2 border-white/40 rounded-tr-sm"></div>
            <div className="absolute bottom-3.5 left-3.5 w-4 h-4 border-b-2 border-l-2 border-white/40 rounded-bl-sm"></div>
            <div className="absolute bottom-3.5 right-3.5 w-4 h-4 border-b-2 border-r-2 border-white/40 rounded-br-sm"></div>

            {/* Emblem */}
            <div className="pt-2 text-xs opacity-75 tracking-widest text-[#F4EFE6]">
              ✦ ✦ ✦
            </div>

            {/* Verse Text */}
            <div className="my-auto px-2">
              <p 
                className="font-bodoni italic font-bold leading-relaxed text-sm sm:text-base md:text-lg drop-shadow-xs"
                style={{ 
                  color: currentThemeObj.textColor
                }}
              >
                "{verseText}"
              </p>
            </div>

            {/* Citation & Badge */}
            <div className="pb-2 space-y-1">
              <div className="w-16 h-px bg-white/30 mx-auto mb-2"></div>
              <h4 className="font-bodoni font-bold text-sm tracking-wide" style={{ color: currentThemeObj.subColor }}>
                {citation}
              </h4>
              <span className="text-[10px] tracking-widest uppercase opacity-75 font-sans block" style={{ color: currentThemeObj.textColor }}>
                {versionTag}
              </span>
            </div>
          </div>
        </div>

        {/* Hidden Canvas for High-Resolution Export */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Theme Selectors */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#1C1917]/70 dark:text-zinc-300 block font-sans">
            {isEn ? 'Choose Style / Theme:' : 'Pilih Tema Kartu:'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CARD_THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(t.id)}
                className={`py-2 px-3 rounded-2xl border text-xs font-sans font-semibold transition flex items-center justify-center gap-2 cursor-pointer ${
                  selectedTheme === t.id
                    ? 'border-[#3B4B34] bg-white/90 dark:bg-white/15 text-[#1C1917] dark:text-[#F4EFE6] shadow-2xs ring-1 ring-[#3B4B34]'
                    : 'border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 text-[#1C1917]/70 dark:text-white/70 hover:bg-white/70 dark:hover:bg-white/10'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${t.bg} shadow-2xs shrink-0`}></span>
                <span className="truncate">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-black/5 dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button
            onClick={handleCopyTextQuote}
            className="px-4 py-2.5 rounded-full border border-white/80 dark:border-white/10 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-xl hover:bg-white dark:hover:bg-zinc-700 text-xs font-sans font-semibold text-[#1C1917] dark:text-zinc-200 transition cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1.5"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? (isEn ? 'Text Copied!' : 'Teks Tersalin!') : (isEn ? 'Copy Quote Text' : 'Salin Teks Kutipan')}</span>
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="px-5 py-2.5 rounded-full bg-[#3B4B34] hover:bg-[#2C3827] text-[#F4EFE6] text-xs font-sans font-semibold shadow-md shadow-[#3B4B34]/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? (isEn ? 'Generating...' : 'Memproses...') : (isEn ? 'Download Image (PNG)' : 'Unduh Gambar (PNG)')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
