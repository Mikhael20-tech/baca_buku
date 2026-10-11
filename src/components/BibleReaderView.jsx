import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, ChevronLeft, ChevronRight, Search, Sparkles, 
  Settings, Sun, Moon, Coffee, ArrowLeft, Bookmark, Copy, 
  Check, Share2, ZoomIn, ZoomOut, Compass, List, X
} from 'lucide-react';

const FONTS = [
  { id: 'Merriweather', name: 'Merriweather', font: "'Merriweather', Georgia, serif" },
  { id: 'Literata', name: 'Literata', font: "'Literata', Georgia, serif" },
  { id: 'Lora', name: 'Lora', font: "'Lora', Georgia, serif" },
  { id: 'Inter', name: 'Inter', font: "'Inter', sans-serif" },
  { id: 'Plus Jakarta Sans', name: 'Jakarta Sans', font: "'Plus Jakarta Sans', sans-serif" }
];

export default function BibleReaderView({ onBackToHome, onOpenLibrary }) {
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(() => localStorage.getItem('last_bible_book') || 'matius');
  const [selectedChapter, setSelectedChapter] = useState(() => Number(localStorage.getItem('last_bible_chapter')) || 1);
  const [bookData, setBookData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchVerse, setSearchVerse] = useState('');
  
  // Navigation Modals
  const [isBookPickerOpen, setIsBookPickerOpen] = useState(false);
  const [isChapterPickerOpen, setIsChapterPickerOpen] = useState(false);
  const [bookPickerTab, setBookPickerTab] = useState('PB'); // 'PB' | 'PL'
  const [bookSearchQuery, setBookSearchQuery] = useState('');

  // Reader Settings
  const [theme, setTheme] = useState(() => localStorage.getItem('bible_theme') || 'sepia'); // 'light' | 'sepia' | 'dark'
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('bible_font') || 'Lora');
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('bible_font_size')) || 18);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copiedVerse, setCopiedVerse] = useState(null);

  const contentRef = useRef(null);

  // 1. Fetch Daftar 66 Kitab
  useEffect(() => {
    fetch('/bible/books.json')
      .then(res => res.json())
      .then(data => setBooks(data))
      .catch(err => console.error('Gagal memuat index Alkitab:', err));
  }, []);

  // 2. Fetch Data Kitab yang Aktif
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetch(`/bible/${selectedBookId}.json?v=${Date.now()}`)
      .then(res => {
        if (!res.ok) throw new Error('Berkas kitab tidak ditemukan');
        return res.json();
      })
      .then(data => {
        if (!isMounted) return;
        setBookData(data);
        setIsLoading(false);
        // Validasi pasal
        const availableChaps = Object.keys(data.chapters || {}).map(Number);
        if (!availableChaps.includes(selectedChapter) && availableChaps.length > 0) {
          setSelectedChapter(availableChaps[0]);
        }
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Gagal memuat isi kitab:', err);
        setIsLoading(false);
      });

    localStorage.setItem('last_bible_book', selectedBookId);
    return () => { isMounted = false; };
  }, [selectedBookId]);

  // Simpan pasal aktif ke local storage & scroll ke atas saat berganti pasal
  useEffect(() => {
    localStorage.setItem('last_bible_chapter', selectedChapter);
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedChapter]);

  // Simpan pengaturan tampilan
  useEffect(() => {
    localStorage.setItem('bible_theme', theme);
    localStorage.setItem('bible_font', fontFamily);
    localStorage.setItem('bible_font_size', fontSize);
  }, [theme, fontFamily, fontSize]);

  const currentBookInfo = useMemo(() => {
    return books.find(b => b.id === selectedBookId) || { name: 'Memuat...', testament: 'PB', chapters_count: 1 };
  }, [books, selectedBookId]);

  const chapterData = useMemo(() => {
    if (!bookData?.chapters) return null;
    return bookData.chapters[selectedChapter] || bookData.chapters[String(selectedChapter)] || null;
  }, [bookData, selectedChapter]);

  const totalChapters = currentBookInfo.chapters_count || Object.keys(bookData?.chapters || {}).length || 1;

  // Navigasi Next & Prev Pasal
  const handlePrevChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter(prev => prev - 1);
    } else {
      // Ke kitab sebelumnya jika ada
      const currentIdx = books.findIndex(b => b.id === selectedBookId);
      if (currentIdx > 0) {
        const prevBook = books[currentIdx - 1];
        setSelectedBookId(prevBook.id);
        setSelectedChapter(prevBook.chapters_count || 1);
      }
    }
  };

  const handleNextChapter = () => {
    if (selectedChapter < totalChapters) {
      setSelectedChapter(prev => prev + 1);
    } else {
      // Ke kitab berikutnya jika ada
      const currentIdx = books.findIndex(b => b.id === selectedBookId);
      if (currentIdx < books.length - 1) {
        const nextBook = books[currentIdx + 1];
        setSelectedBookId(nextBook.id);
        setSelectedChapter(1);
      }
    }
  };

  const handleCopyVerse = (vNum, text) => {
    const fullText = `${currentBookInfo.name} ${selectedChapter}:${vNum} — "${text}"`;
    navigator.clipboard.writeText(fullText);
    setCopiedVerse(vNum);
    setTimeout(() => setCopiedVerse(null), 2000);
  };

  // Tema Styles
  const themeStyles = {
    light: {
      bg: 'bg-slate-50',
      contentBg: 'bg-white',
      text: 'text-slate-900',
      secondaryText: 'text-slate-500',
      border: 'border-slate-200',
      headerBg: 'bg-white/90 border-slate-200/80',
      verseNum: 'text-blue-600 bg-blue-50/80 border-blue-200',
      verseHover: 'hover:bg-blue-50/40',
      outlineBadge: 'bg-blue-50 border-blue-200 text-blue-900',
    },
    sepia: {
      bg: 'bg-[#f8f3e8]',
      contentBg: 'bg-[#fcf8f0]',
      text: 'text-[#3c2f21]',
      secondaryText: 'text-[#7a6a56]',
      border: 'border-[#e6dbcd]',
      headerBg: 'bg-[#fcf8f0]/90 border-[#e6dbcd]/80',
      verseNum: 'text-[#8c501e] bg-[#f2e6d5] border-[#dfceb7]',
      verseHover: 'hover:bg-[#f4ebd9]',
      outlineBadge: 'bg-[#f3e7d3] border-[#decbb2] text-[#5c3a16]',
    },
    dark: {
      bg: 'bg-zinc-950',
      contentBg: 'bg-zinc-900',
      text: 'text-zinc-100',
      secondaryText: 'text-zinc-400',
      border: 'border-zinc-800',
      headerBg: 'bg-zinc-900/90 border-zinc-800/80',
      verseNum: 'text-amber-400 bg-zinc-800 border-zinc-700',
      verseHover: 'hover:bg-zinc-800/50',
      outlineBadge: 'bg-zinc-800/80 border-zinc-700 text-amber-300',
    }
  }[theme];

  const activeFontFamily = FONTS.find(f => f.name === fontFamily)?.font || "'Lora', Georgia, serif";

  const filteredVerses = useMemo(() => {
    if (!chapterData?.verses) return [];
    if (!searchVerse.trim()) return chapterData.verses;
    return chapterData.verses.filter(v => 
      v.text.toLowerCase().includes(searchVerse.toLowerCase()) ||
      String(v.verse).includes(searchVerse)
    );
  }, [chapterData, searchVerse]);

  return (
    <div className={`min-h-screen flex flex-col ${themeStyles.bg} selection:bg-amber-400 selection:text-slate-950 transition-colors duration-200`}>
      
      {/* Top Header / App Bar */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${themeStyles.headerBg} px-3 sm:px-6 h-16 flex items-center justify-between transition-colors shadow-2xs`}>
        
        {/* Kiri: Tombol Beranda & Selector Kitab */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onBackToHome}
            className={`p-2 rounded-xl border ${themeStyles.border} ${themeStyles.text} hover:opacity-80 transition flex items-center gap-1.5 text-xs font-semibold`}
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Beranda</span>
          </button>

          <button
            onClick={onOpenLibrary}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-amber-600 transition hidden lg:flex items-center gap-1.5`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Perpustakaan Buku
          </button>

          <div className="h-5 w-px bg-slate-300 dark:bg-zinc-700 mx-1 hidden sm:block" />

          {/* Quick Picker: Kitab & Pasal */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsBookPickerOpen(true)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm border ${themeStyles.border} bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition flex items-center gap-1.5 shadow-2xs`}
            >
              <span>{currentBookInfo.name}</span>
              <Compass className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setIsChapterPickerOpen(true)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm border ${themeStyles.border} ${themeStyles.text} hover:opacity-80 transition flex items-center gap-1 shadow-2xs`}
            >
              <span>Pasal {selectedChapter}</span>
              <List className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>
        </div>

        {/* Kanan: Navigasi Cepat, Search & Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Prev & Next Chapter Buttons */}
          <div className="flex items-center border rounded-xl overflow-hidden shadow-2xs border-slate-300 dark:border-zinc-700">
            <button
              onClick={handlePrevChapter}
              className={`p-2 ${themeStyles.text} hover:bg-black/5 dark:hover:bg-white/5 transition`}
              title="Pasal Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className={`px-2 text-xs font-bold font-mono opacity-60 ${themeStyles.text}`}>
              {selectedChapter}/{totalChapters}
            </span>
            <button
              onClick={handleNextChapter}
              className={`p-2 ${themeStyles.text} hover:bg-black/5 dark:hover:bg-white/5 transition`}
              title="Pasal Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Tampilan / Setting Font & Tema */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 rounded-xl border ${themeStyles.border} ${themeStyles.text} hover:opacity-80 transition`}
            title="Pengaturan Tampilan"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Floating Settings Popover */}
      {isSettingsOpen && (
        <div className="fixed top-18 right-4 sm:right-6 z-50 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-2xl w-80 space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
            <h4 className="font-bold text-slate-800 dark:text-zinc-100 text-sm">Tampilan Alkitab</h4>
            <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tema */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Warna Latar</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  theme === 'light' ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-2xs' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" /> Terang
              </button>
              <button
                onClick={() => setTheme('sepia')}
                className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  theme === 'sepia' ? 'border-[#8c501e] bg-[#f5ebd9] text-[#5c3a16] shadow-2xs' : 'border-[#dfceb7] bg-[#fbf7f0] text-[#7a6a56]'
                }`}
              >
                <Coffee className="w-4 h-4 text-[#8c501e]" /> Sepia
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  theme === 'dark' ? 'border-amber-400 bg-zinc-800 text-amber-300 shadow-2xs' : 'border-zinc-700 bg-zinc-900 text-zinc-400'
                }`}
              >
                <Moon className="w-4 h-4 text-amber-400" /> Gelap
              </button>
            </div>
          </div>

          {/* Ukuran Font */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ukuran Huruf</span>
              <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">{fontSize}px</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
                className="p-2 border border-slate-200 dark:border-zinc-700 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition text-slate-600 dark:text-zinc-300"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="14"
                max="32"
                step="1"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="flex-1 accent-amber-600"
              />
              <button
                onClick={() => setFontSize(prev => Math.min(32, prev + 2))}
                className="p-2 border border-slate-200 dark:border-zinc-700 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition text-slate-600 dark:text-zinc-300"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Jenis Huruf */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gaya Font</label>
            <div className="grid grid-cols-2 gap-1.5">
              {FONTS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFontFamily(f.name)}
                  className={`px-3 py-2 rounded-xl text-xs text-left border transition ${
                    fontFamily === f.name
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold'
                      : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                  style={{ fontFamily: f.font }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Reading Viewport */}
      <main 
        ref={contentRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 sm:py-12 flex justify-center"
      >
        <div className={`max-w-3xl w-full ${themeStyles.contentBg} rounded-3xl p-6 sm:p-12 shadow-sm border ${themeStyles.border} space-y-8 transition-colors`}>
          
          {/* Header Pasal */}
          <div className="border-b pb-6 space-y-2 border-slate-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-amber-600 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Alkitab Versi Pemulihan • {currentBookInfo.testament === 'PL' ? 'Perjanjian Lama' : 'Perjanjian Baru'}</span>
            </div>
            
            <h1 
              className="text-2xl sm:text-4xl font-extrabold tracking-tight"
              style={{ fontFamily: activeFontFamily }}
            >
              {currentBookInfo.name}: Pasal {selectedChapter}
            </h1>
          </div>

          {/* Garis Besar Teologis / Outline */}
          {chapterData?.outlines && chapterData.outlines.length > 0 && (
            <div className="space-y-2 py-1">
              {chapterData.outlines.map((otl, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-2xl border text-xs sm:text-sm font-semibold leading-relaxed ${themeStyles.outlineBadge}`}
                >
                  {otl}
                </div>
              ))}
            </div>
          )}

          {/* Isi Ayat-Ayat */}
          {isLoading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Memuat firman Tuhan...</p>
            </div>
          ) : filteredVerses.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              Ayat tidak ditemukan untuk pencarian ini.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVerses.map((item) => (
                <div
                  key={item.verse}
                  className={`group relative p-2 sm:p-2.5 rounded-2xl transition-all duration-150 flex items-start gap-3 ${themeStyles.verseHover}`}
                >
                  {/* Badge Nomor Ayat */}
                  <span 
                    className={`shrink-0 w-8 h-8 rounded-xl font-mono text-xs font-extrabold border flex items-center justify-center select-none shadow-2xs ${themeStyles.verseNum}`}
                  >
                    {item.verse}
                  </span>

                  {/* Teks Ayat */}
                  <div className="flex-1">
                    <p 
                      className={`leading-relaxed ${themeStyles.text}`}
                      style={{ 
                        fontFamily: activeFontFamily,
                        fontSize: `${fontSize}px`,
                        lineHeight: 1.85
                      }}
                    >
                      {item.text}
                    </p>
                  </div>

                  {/* Tombol Copy / Share Cepat */}
                  <button
                    onClick={() => handleCopyVerse(item.verse, item.text)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition text-xs shrink-0"
                    title="Salin Ayat"
                  >
                    {copiedVerse === item.verse ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Navigasi Bawah Pasal */}
          <div className="pt-8 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-4">
            <button
              onClick={handlePrevChapter}
              className={`px-5 py-2.5 rounded-2xl border ${themeStyles.border} ${themeStyles.text} font-bold text-xs hover:opacity-80 transition flex items-center gap-2 shadow-2xs`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Pasal Sebelumnya</span>
            </button>

            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              {currentBookInfo.name} {selectedChapter} / {totalChapters}
            </span>

            <button
              onClick={handleNextChapter}
              className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <span>Pasal Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </main>

      {/* MODAL 1: PEMILIH KITAB (66 KITAB) */}
      {isBookPickerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setIsBookPickerOpen(false)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 dark:border-zinc-800 my-6 space-y-4 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
                <BookOpen className="w-5 h-5" />
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-zinc-100">
                  Pilih Kitab (66 Kitab)
                </h3>
              </div>
              <button 
                onClick={() => setIsBookPickerOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab PL & PB & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex p-1 bg-slate-100 dark:bg-zinc-800 rounded-2xl">
                <button
                  onClick={() => setBookPickerTab('PB')}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                    bookPickerTab === 'PB' ? 'bg-white dark:bg-zinc-700 text-amber-700 dark:text-amber-300 shadow-2xs' : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  Perjanjian Baru (27)
                </button>
                <button
                  onClick={() => setBookPickerTab('PL')}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                    bookPickerTab === 'PL' ? 'bg-white dark:bg-zinc-700 text-blue-700 dark:text-blue-300 shadow-2xs' : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  Perjanjian Lama (39)
                </button>
              </div>

              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bookSearchQuery}
                  onChange={(e) => setBookSearchQuery(e.target.value)}
                  placeholder="Cari nama kitab..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {/* Grid Kitab */}
            <div className="overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {books
                  .filter(b => b.testament === bookPickerTab)
                  .filter(b => b.name.toLowerCase().includes(bookSearchQuery.toLowerCase()))
                  .map(b => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBookId(b.id);
                        setSelectedChapter(1);
                        setIsBookPickerOpen(false);
                      }}
                      className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                        selectedBookId === b.id
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold shadow-2xs'
                          : 'border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-amber-400 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div>
                        <h5 className="text-xs font-bold leading-tight">{b.name}</h5>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500">{b.chapters_count} pasal</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PEMILIH PASAL CEPAT */}
      {isChapterPickerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setIsChapterPickerOpen(false)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 dark:border-zinc-800 my-6 space-y-4 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100">
                Pilih Pasal • {currentBookInfo.name}
              </h3>
              <button 
                onClick={() => setIsChapterPickerOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {Array.from({ length: totalChapters }, (_, i) => i + 1).map(chapNum => (
                  <button
                    key={chapNum}
                    onClick={() => {
                      setSelectedChapter(chapNum);
                      setIsChapterPickerOpen(false);
                    }}
                    className={`py-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center ${
                      selectedChapter === chapNum
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-amber-50 dark:hover:bg-zinc-800 hover:border-amber-400'
                    }`}
                  >
                    {chapNum}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
