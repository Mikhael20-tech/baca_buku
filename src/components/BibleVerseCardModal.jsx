import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Copy, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CARD_THEMES = [
  {
    id: 'amber',
    name: 'Royal Amber',
    bg: 'from-amber-600 via-amber-700 to-amber-900',
    canvasBg: ['#d97706', '#b45309', '#78350f'],
    textColor: '#ffffff',
    subColor: '#fef3c7',
    accentColor: '#f59e0b'
  },
  {
    id: 'dark',
    name: 'Midnight Sacred',
    bg: 'from-zinc-900 via-slate-900 to-black',
    canvasBg: ['#18181b', '#0f172a', '#000000'],
    textColor: '#f4f4f5',
    subColor: '#fef08a',
    accentColor: '#eab308'
  },
  {
    id: 'sepia',
    name: 'Parchment Sepia',
    bg: 'from-[#f5edd6] via-[#ebd9b8] to-[#dfc79e]',
    canvasBg: ['#f5edd6', '#ebd9b8', '#dfc79e'],
    textColor: '#291809',
    subColor: '#78350f',
    accentColor: '#92400e'
  },
  {
    id: 'emerald',
    name: 'Emerald Life',
    bg: 'from-emerald-800 via-emerald-900 to-slate-950',
    canvasBg: ['#065f46', '#064e3b', '#022c22'],
    textColor: '#ecfdf5',
    subColor: '#a7f3d0',
    accentColor: '#10b981'
  }
];

export default function BibleVerseCardModal({ isOpen, onClose, verseData, bibleLang = 'id' }) {
  const [selectedTheme, setSelectedTheme] = useState('amber');
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef(null);

  const isEn = bibleLang === 'en';

  // Bersihkan teks ayat dari tag catatan kaki <fn n="..."/>
  const cleanVerseText = (text) => {
    if (!text) return '';
    return text.replace(/<fn n="\d+"\/>/g, '').replace(/\s+/g, ' ').trim();
  };

  const verseText = cleanVerseText(verseData?.text || '');
  const citation = `${verseData?.bookName || ''} ${verseData?.chapter || ''}:${verseData?.verse || ''}`;
  const versionTag = isEn ? 'Recovery Version' : 'Alkitab Versi Pemulihan';

  // Render canvas untuk download gambar kualitas tinggi (1080x1080)
  useEffect(() => {
    if (!isOpen || !verseData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    const theme = CARD_THEMES.find(t => t.id === selectedTheme) || CARD_THEMES[0];

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, theme.canvasBg[0]);
    gradient.addColorStop(0.5, theme.canvasBg[1]);
    gradient.addColorStop(1, theme.canvasBg[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative Ornamental Border
    ctx.strokeStyle = theme.accentColor + '55';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, width - 120, height - 120);

    ctx.strokeStyle = theme.accentColor + '88';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(75, 75, width - 150, height - 150);

    // Corner Accents
    const drawCorner = (x, y, dx, dy) => {
      ctx.beginPath();
      ctx.moveTo(x, y + dy * 30);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx * 30, y);
      ctx.strokeStyle = theme.accentColor;
      ctx.lineWidth = 4;
      ctx.stroke();
    };
    drawCorner(85, 85, 1, 1);
    drawCorner(width - 85, 85, -1, 1);
    drawCorner(85, height - 85, 1, -1);
    drawCorner(width - 85, height - 85, -1, -1);

    // Header Emblem / Star
    ctx.font = '28px serif';
    ctx.fillStyle = theme.accentColor;
    ctx.textAlign = 'center';
    ctx.fillText('✦ ✦ ✦', width / 2, 160);

    // Quote Marks
    ctx.font = 'italic 120px "Cinzel", Georgia, serif';
    ctx.fillStyle = theme.accentColor + '35';
    ctx.fillText('“', width / 2, 270);

    // Main Verse Text (Word-Wrapped)
    let fontSize = 48;
    if (verseText.length > 250) fontSize = 38;
    else if (verseText.length > 180) fontSize = 42;
    else if (verseText.length < 90) fontSize = 54;

    ctx.font = `italic ${fontSize}px "Cinzel", "Playfair Display", "Cormorant Garamond", Georgia, serif`;
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = 'center';

    const maxTextWidth = width - 240;
    const lineHeight = fontSize * 1.55;
    const words = verseText.split(' ');
    let line = '';
    const lines = [];

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && i > 0) {
        lines.push(line.trim());
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    // Hitung posisi Y agar teks berada di tengah vertikal yang seimbang
    const totalTextHeight = lines.length * lineHeight;
    let startY = (height / 2) - (totalTextHeight / 2) + 20;
    if (startY < 320) startY = 320;

    lines.forEach((l, idx) => {
      ctx.fillText(l, width / 2, startY + (idx * lineHeight));
    });

    // Divider Line
    const dividerY = Math.min(840, startY + totalTextHeight + 60);
    ctx.beginPath();
    ctx.moveTo(width / 2 - 120, dividerY);
    ctx.lineTo(width / 2 + 120, dividerY);
    ctx.strokeStyle = theme.accentColor + '88';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Citation
    ctx.font = 'bold 36px "Cinzel", Georgia, serif';
    ctx.fillStyle = theme.subColor;
    ctx.fillText(citation, width / 2, dividerY + 60);

    // Version Tag
    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = theme.textColor + 'aa';
    ctx.letterSpacing = '3px';
    ctx.fillText(versionTag.toUpperCase(), width / 2, dividerY + 105);

  }, [isOpen, selectedTheme, verseText, citation, versionTag]);

  if (!isOpen || !verseData) return null;

  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${citation.replace(/[: ]/g, '_')}_RecoveryVersion.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyTextQuote = () => {
    const formatted = `"${verseText}"\n\n— ${citation} (${versionTag})`;
    navigator.clipboard.writeText(formatted);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2200);
  };

  const currentThemeObj = CARD_THEMES.find(t => t.id === selectedTheme) || CARD_THEMES[0];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-modal-backdrop-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-amber-300/80 dark:border-amber-700/60 flex flex-col space-y-4 max-h-[92vh] overflow-y-auto animate-modal-card-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-zinc-100">
                {isEn ? 'Share Verse Card' : 'Bagikan Kartu Ayat'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
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

        {/* Live Card Preview */}
        <div className="flex justify-center">
          <div className={`w-full max-w-md aspect-square rounded-2xl bg-gradient-to-br ${currentThemeObj.bg} p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-xl border border-white/20 relative overflow-hidden select-none`}>
            {/* Corner Filigree Ornaments */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/40"></div>
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-white/40"></div>
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-white/40"></div>
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/40"></div>

            {/* Emblem */}
            <div className="pt-2 text-xs opacity-75 tracking-widest text-amber-300">
              ✦ ✦ ✦
            </div>

            {/* Verse Text */}
            <div className="my-auto px-2">
              <p 
                className="font-serif italic font-bold leading-relaxed text-sm sm:text-base md:text-lg drop-shadow-xs"
                style={{ 
                  color: currentThemeObj.textColor,
                  fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" 
                }}
              >
                "{verseText}"
              </p>
            </div>

            {/* Citation & Badge */}
            <div className="pb-2 space-y-1">
              <div className="w-16 h-px bg-white/30 mx-auto mb-2"></div>
              <h4 className="font-serif font-bold text-sm tracking-wide" style={{ color: currentThemeObj.subColor }}>
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
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
            {isEn ? 'Choose Style / Theme:' : 'Pilih Tema Kartu:'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CARD_THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(t.id)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  selectedTheme === t.id
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/50'
                    : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                <span className={`w-3 h-3 rounded-full bg-gradient-to-br ${t.bg}`}></span>
                <span className="truncate">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <Button
            variant="outline"
            onClick={handleCopyTextQuote}
            className="rounded-xl text-xs font-bold flex items-center justify-center gap-2 h-10"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? (isEn ? 'Text Copied!' : 'Teks Tersalin!') : (isEn ? 'Copy Quote Text' : 'Salin Teks Kutipan')}</span>
          </Button>

          <Button
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 h-10 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? (isEn ? 'Generating...' : 'Memproses...') : (isEn ? 'Download Image (PNG)' : 'Unduh Gambar (PNG)')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
