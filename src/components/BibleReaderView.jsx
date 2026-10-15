import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, ChevronLeft, ChevronRight, Search, Sparkles, 
  Settings, Sun, Moon, Coffee, ArrowLeft, Bookmark, Copy, 
  Check, Share2, ZoomIn, ZoomOut, Compass, List, X,
  MessageCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const FONTS = [
  { id: 'Merriweather', name: 'Merriweather', font: "'Merriweather', Georgia, serif" },
  { id: 'Literata', name: 'Literata', font: "'Literata', Georgia, serif" },
  { id: 'Lora', name: 'Lora', font: "'Lora', Georgia, serif" },
  { id: 'Inter', name: 'Inter', font: "'Inter', sans-serif" },
  { id: 'Plus Jakarta Sans', name: 'Jakarta Sans', font: "'Plus Jakarta Sans', sans-serif" }
];

export default function BibleReaderView({ onBackToHome, onOpenLibrary }) {
  const [bibleLang, setBibleLang] = useState(() => localStorage.getItem('bible_language') || 'id'); // 'id' | 'en'
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
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('bible_font_size')) || 20);
  const [contentWidth, setContentWidth] = useState(() => localStorage.getItem('bible_content_width') || 'wide'); // 'normal' | 'wide'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copiedVerse, setCopiedVerse] = useState(null);

  // Footnotes & Recovery Version Features
  const [showFootnoteAnchors, setShowFootnoteAnchors] = useState(true);
  const [showOutlines, setShowOutlines] = useState(true);
  const [activeFootnotePopup, setActiveFootnotePopup] = useState(null);
  const [isClosingFootnote, setIsClosingFootnote] = useState(false);
  const [activeNoteKey, setActiveNoteKey] = useState(null);
  const [highlightedVerse, setHighlightedVerse] = useState(null);
  const [transitionAnim, setTransitionAnim] = useState('animate-chapter-fade');
  const [isIntroExpanded, setIsIntroExpanded] = useState(false);

  const contentRef = useRef(null);

  // 1. Fetch Daftar 66 Kitab (menyesuaikan bahasa)
  useEffect(() => {
    const booksUrl = bibleLang === 'en' ? '/bible/en/books.json' : '/bible/books.json';
    fetch(booksUrl)
      .then(res => {
        if (!res.ok && bibleLang === 'en') {
          return fetch('/bible/books.json').then(r => r.json());
        }
        return res.json();
      })
      .then(data => setBooks(data))
      .catch(err => console.error('Gagal memuat index Alkitab:', err));
  }, [bibleLang]);

  // 2. Fetch Data Kitab yang Aktif
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setBookData(null);

    const bookUrl = bibleLang === 'en'
      ? `/bible/en/${selectedBookId}.json?v=${Date.now()}`
      : `/bible/${selectedBookId}.json?v=${Date.now()}`;

    fetch(bookUrl)
      .then(res => {
        if (!res.ok) {
          if (bibleLang === 'en') {
            // fallback if this book is not yet in EN
            return fetch(`/bible/${selectedBookId}.json?v=${Date.now()}`).then(r => r.json());
          }
          throw new Error('Berkas kitab tidak ditemukan');
        }
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
  }, [selectedBookId, bibleLang]);

  // Simpan pasal aktif ke local storage & scroll ke atas saat berganti pasal
  useEffect(() => {
    localStorage.setItem('last_bible_chapter', selectedChapter);
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [selectedChapter]);

  // Listener tombol Escape untuk menutup modal/popover dengan mulus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activeFootnotePopup) {
          handleCloseFootnote();
        } else if (isBookPickerOpen) {
          setIsBookPickerOpen(false);
        } else if (isChapterPickerOpen) {
          setIsChapterPickerOpen(false);
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFootnotePopup, isBookPickerOpen, isChapterPickerOpen, isSettingsOpen]);

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

  // Build a map of verse -> footnotes for quick lookup
  const footnoteMap = useMemo(() => {
    const map = {};
    if (chapterData?.footnotes && Array.isArray(chapterData.footnotes)) {
      for (const fn of chapterData.footnotes) {
        const v = fn.verse;
        if (!map[v]) map[v] = [];
        if (typeof fn === 'string') {
          map[v].push({ verse: v, note_idx: map[v].length + 1, keyword: '', text: fn });
        } else {
          map[v].push({
            verse: v,
            note_idx: fn.note_idx || map[v].length + 1,
            keyword: fn.keyword || '',
            text: fn.text || ''
          });
        }
      }
    }
    return map;
  }, [chapterData]);

  const totalFootnotes = useMemo(() => {
    return chapterData?.footnotes?.length || 0;
  }, [chapterData]);

  // Navigasi Next & Prev Pasal dengan Animasi Halus
  const handlePrevChapter = () => {
    setTransitionAnim('animate-chapter-prev');
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
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
    setTransitionAnim('animate-chapter-next');
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
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

  const handleOpenFootnote = (verseNum, noteIdx, foundNote) => {
    const key = `${verseNum}-${noteIdx}`;
    setActiveNoteKey(key);
    setHighlightedVerse(verseNum);

    // Smooth scroll ke ayat yang bersangkutan agar posisinya nyaman dibaca
    const verseEl = document.getElementById(`verse-${verseNum}`);
    if (verseEl) {
      verseEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    setIsClosingFootnote(false);
    setActiveFootnotePopup({
      verse: verseNum,
      noteIdx: noteIdx,
      keyword: foundNote?.keyword || '',
      text: foundNote?.text || 'Catatan kaki tidak ditemukan.'
    });

    // Lepaskan highlight setelah 3.5 detik
    setTimeout(() => {
      setHighlightedVerse(prev => (prev === verseNum ? null : prev));
    }, 3500);
  };

  const handleCloseFootnote = () => {
    setIsClosingFootnote(true);
    setTimeout(() => {
      setActiveFootnotePopup(null);
      setIsClosingFootnote(false);
      setActiveNoteKey(null);
    }, 180);
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
      outlineText: 'text-amber-950 dark:text-amber-100',
      footnoteBg: 'bg-amber-50/80 border-amber-200/60',
      footnoteText: 'text-amber-900',
      footnoteBadge: 'bg-amber-100 text-amber-700 border-amber-300',
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
      outlineText: 'text-[#5c3a16]',
      footnoteBg: 'bg-[#f0e8d6]/80 border-[#d9cbb3]/60',
      footnoteText: 'text-[#5c3a16]',
      footnoteBadge: 'bg-[#e8dbc4] text-[#7a5a2e] border-[#d4c3a6]',
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
      outlineText: 'text-amber-300',
      footnoteBg: 'bg-zinc-800/60 border-zinc-700/60',
      footnoteText: 'text-amber-200/90',
      footnoteBadge: 'bg-zinc-700 text-amber-400 border-zinc-600',
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

  // Helper render teks ayat dengan penanda catatan kaki interaktif (Recovery Version)
  const renderVerseText = (item) => {
    if (!showFootnoteAnchors || !item.marked_text || !item.marked_text.includes('<fn')) {
      return item.text;
    }

    // Split by <fn n="(\d+)"/>
    const parts = item.marked_text.split(/(<fn n="\d+"\/>)/g);
    return parts.map((part, pIdx) => {
      const match = part.match(/<fn n="(\d+)"\/>/);
      if (match) {
        const noteIdx = Number(match[1]);
        const noteList = footnoteMap[item.verse] || [];
        const foundNote = noteList.find(n => n.note_idx === noteIdx) || noteList[noteIdx - 1];
        
        return (
          <sup
            key={pIdx}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenFootnote(item.verse, noteIdx, foundNote);
            }}
            className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 mx-0.5 -translate-y-1 rounded-full text-[11px] font-bold font-sans cursor-pointer select-none transition-all duration-200 ease-out shadow-2xs ${
              activeNoteKey === `${item.verse}-${noteIdx}`
                ? 'bg-amber-600 text-white scale-110 shadow-md ring-2 ring-amber-400 fn-badge-active'
                : 'bg-amber-500/15 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white hover:scale-115 active:scale-95'
            }`}
            style={{ textDecoration: 'none' }}
            title={`Catatan Kaki ${noteIdx}${foundNote?.keyword ? `: ${foundNote.keyword}` : ''}`}
          >
            {noteIdx}
          </sup>
        );
      }
      return part;
    });
  };

  return (
    <div className={`h-full flex flex-col ${themeStyles.bg} selection:bg-amber-400 selection:text-slate-950 transition-colors duration-200`}>
      
      {/* Top Header / App Bar */}
      <header className={`shrink-0 z-40 backdrop-blur-md border-b ${themeStyles.headerBg} px-3 sm:px-6 py-2.5 flex items-center justify-between transition-colors shadow-sm`}>
        
        {/* Kiri: Tombol Beranda & Selector Kitab */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToHome}
            className={`shrink-0 rounded-xl border ${themeStyles.border} ${themeStyles.text} hover:opacity-80 transition h-8 px-2.5 text-xs font-semibold`}
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-4 h-4 mr-1 sm:mr-1.5" />
            <span className="hidden sm:inline">Beranda</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenLibrary}
            className="shrink-0 rounded-xl text-xs font-semibold text-slate-500 hover:text-amber-700 transition hidden lg:flex items-center gap-1.5 h-8 px-2.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>Katalog Buku</span>
          </Button>

          <div className="h-5 w-px bg-slate-300 dark:bg-zinc-700 mx-0.5 hidden sm:block shrink-0" />

          {/* Quick Picker: Kitab & Pasal */}
          <div className="flex items-center gap-1.5 min-w-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBookPickerOpen(true)}
              className={`rounded-xl font-bold text-xs border ${themeStyles.border} bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 transition h-8 px-2.5 min-w-0`}
            >
              <span className="truncate max-w-[100px] sm:max-w-[160px]">📖 {currentBookInfo.name}</span>
              <Compass className="w-3.5 h-3.5 ml-1 opacity-70 shrink-0" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChapterPickerOpen(true)}
              className={`shrink-0 rounded-xl font-bold text-xs border ${themeStyles.border} ${themeStyles.text} hover:opacity-80 transition h-8 px-2.5`}
            >
              <span>{bibleLang === 'en' ? 'Ch' : 'Ps'} {selectedChapter}</span>
              <List className="w-3.5 h-3.5 ml-1 opacity-70" />
            </Button>
          </div>
        </div>

        {/* Kanan: Navigasi Cepat, Search & Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Prev & Next Chapter Buttons */}
          <div className="flex items-center border rounded-xl overflow-hidden shadow-xs border-slate-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-800/60">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevChapter}
              className={`h-8 w-8 rounded-none ${themeStyles.text} hover:bg-black/5 dark:hover:bg-white/5 transition`}
              title="Pasal Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className={`px-1.5 text-[10px] font-bold font-mono opacity-80 ${themeStyles.text} hidden sm:inline`}>
              {selectedChapter}/{totalChapters}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextChapter}
              className={`h-8 w-8 rounded-none ${themeStyles.text} hover:bg-black/5 dark:hover:bg-white/5 transition`}
              title="Pasal Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Language Selector: ID (Versi Pemulihan) | EN (Recovery Version) */}
          <div className={`flex items-center p-0.5 rounded-xl border ${themeStyles.border} bg-black/5 dark:bg-white/5`}>
            <button
              type="button"
              onClick={() => {
                setBibleLang('id');
                localStorage.setItem('bible_language', 'id');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                bibleLang === 'id'
                  ? 'bg-[#3B4B34] text-white shadow-xs'
                  : `${themeStyles.text} opacity-60 hover:opacity-100`
              }`}
              title="Alkitab Versi Pemulihan (Bahasa Indonesia)"
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => {
                setBibleLang('en');
                localStorage.setItem('bible_language', 'en');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                bibleLang === 'en'
                  ? 'bg-[#3B4B34] text-white shadow-xs'
                  : `${themeStyles.text} opacity-60 hover:opacity-100`
              }`}
              title="Holy Bible Recovery Version (English with Footnotes)"
            >
              EN
            </button>
          </div>

          {/* Tampilan / Setting Font & Tema */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`shrink-0 h-8 w-8 rounded-xl border ${themeStyles.border} ${themeStyles.text} hover:opacity-80 transition shadow-xs`}
            title="Pengaturan Tampilan"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Floating Settings Popover */}
      {isSettingsOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsSettingsOpen(false)} />
          <div className="fixed top-14 right-3 sm:right-5 z-50 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xl w-72 space-y-3">
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
                  className="p-1.5 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition text-slate-600 dark:text-zinc-300"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
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
                  className="p-1.5 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition text-slate-600 dark:text-zinc-300"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
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
                    className={`px-3 py-1.5 rounded-xl text-xs text-left border transition ${
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

            {/* Toggle Recovery Version Features */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tanda Catatan Kaki (¹)</span>
                <button
                  onClick={() => setShowFootnoteAnchors(!showFootnoteAnchors)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    showFootnoteAnchors
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-200 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  {showFootnoteAnchors ? 'Aktif' : 'Mati'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Garis Besar (Outline)</span>
                <button
                  onClick={() => setShowOutlines(!showOutlines)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    showOutlines
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-200 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  {showOutlines ? 'Aktif' : 'Mati'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Reading Viewport */}
      <main 
        ref={contentRef}
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 sm:py-10 scroll-smooth"
        style={{ minHeight: 0 }}
      >
        <div 
          key={`${selectedBookId}-${selectedChapter}`}
          className={`${transitionAnim} ${contentWidth === 'wide' ? 'max-w-5xl' : 'max-w-4xl'} mx-auto w-full ${themeStyles.contentBg} rounded-2xl sm:rounded-3xl p-4 sm:p-10 shadow-sm border ${themeStyles.border} space-y-6 transition-colors`}
        >
          
          {/* Header Pasal */}
          <div className="border-b pb-6 text-center border-slate-200/80 dark:border-zinc-800">
            <h1 
              className={`text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight ${themeStyles.text}`}
              style={{ fontFamily: activeFontFamily }}
            >
              {currentBookInfo.name} <br />
              <span className="text-lg sm:text-2xl font-bold opacity-80">
                {bibleLang === 'en' ? 'Chapter' : 'Pasal'} {selectedChapter}
              </span>
            </h1>
          </div>

          {/* Pengantar & Pokok Kitab (Khusus Pasal 1 jika tersedia) */}
          {selectedChapter === 1 && bookData?.intro && (
            <div className={`rounded-2xl border p-4 sm:p-5 transition-all ${themeStyles.outlineBadge}`}>
              <div 
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setIsIntroExpanded(!isIntroExpanded)}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <h3 className="font-extrabold text-sm sm:text-base">
                    {bibleLang === 'en' ? `Introduction to ${bookData.name} (Recovery Version)` : `Pengantar Kitab ${bookData.name} (Versi Pemulihan)`}
                  </h3>
                </div>
                <button className="text-xs font-bold flex items-center gap-1 opacity-75 hover:opacity-100">
                  <span>{isIntroExpanded ? 'Tutup Ringkasan' : 'Lihat Selengkapnya'}</span>
                  {isIntroExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Pokok Kitab Ringkas */}
              {bookData.intro.Pokok && (
                <div className="mt-2.5 text-xs sm:text-sm font-semibold italic border-l-2 border-amber-500 pl-2.5 text-amber-950 dark:text-amber-200">
                  <span className="font-bold not-italic text-amber-700 dark:text-amber-300">Pokok: </span>
                  {bookData.intro.Pokok}
                </div>
              )}

              {/* Detail Pengantar Lengkap */}
              {isIntroExpanded && (
                <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 space-y-2 text-xs sm:text-sm">
                  {Object.entries(bookData.intro).map(([k, v]) => {
                    if (k === 'Pokok') return null;
                    return (
                      <div key={k} className="grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-2">
                        <span className="font-bold opacity-80 sm:col-span-1">{k}:</span>
                        <span className="sm:col-span-3 leading-relaxed">{v}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Garis Besar Pasal (Jika tidak terpasang per ayat) */}
          {showOutlines && chapterData?.outlines && chapterData.outlines.length > 0 && !filteredVerses.some(v => v.outlines) && (
            <div className="space-y-2 py-3 text-center px-4">
              {chapterData.outlines.map((otl, idx) => (
                <h4 
                  key={idx}
                  className={`text-xs sm:text-sm md:text-base font-bold tracking-wide leading-relaxed ${themeStyles.outlineText}`}
                >
                  {typeof otl === 'string' ? otl : otl.text}
                </h4>
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
            <div className="space-y-1">
              {filteredVerses.map((item) => {
                return (
                  <div key={item.verse}>
                    {/* Garis Besar Rohani di atas ayat (jika ada) */}
                    {showOutlines && item.outlines && item.outlines.length > 0 && (
                      <div className="pt-6 pb-2.5 space-y-1.5 text-center px-4">
                        {item.outlines.map((otl, oIdx) => (
                          <h4
                            key={oIdx}
                            className={`text-xs sm:text-sm md:text-base font-bold tracking-wide leading-relaxed ${themeStyles.outlineText}`}
                          >
                            {otl}
                          </h4>
                        ))}
                      </div>
                    )}

                    {/* Verse Row */}
                    <div
                      id={`verse-${item.verse}`}
                      className={`group relative p-2 sm:p-2.5 rounded-xl transition-all duration-300 ease-out flex items-start gap-2.5 ${
                        highlightedVerse === item.verse
                          ? 'bg-amber-500/15 dark:bg-amber-400/20 ring-2 ring-amber-400/80 shadow-md scale-[1.006]'
                          : themeStyles.verseHover
                      }`}
                    >
                      {/* Badge Nomor Ayat */}
                      <span 
                        className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl font-mono text-[10px] sm:text-xs font-extrabold border flex items-center justify-center select-none shadow-2xs ${themeStyles.verseNum}`}
                      >
                        {item.verse}
                      </span>

                      {/* Teks Ayat */}
                      <div className="flex-1 min-w-0">
                        <p 
                          className={`leading-relaxed ${themeStyles.text}`}
                          style={{ 
                            fontFamily: activeFontFamily,
                            fontSize: `${fontSize}px`,
                            lineHeight: 1.85
                          }}
                        >
                          {renderVerseText(item)}
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
                  </div>
                );
              })}
            </div>
          )}

          {/* Navigasi Bawah Pasal */}
          <div className="pt-6 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-3">
            <button
              onClick={handlePrevChapter}
              className={`px-4 py-2.5 rounded-2xl border ${themeStyles.border} ${themeStyles.text} font-bold text-xs hover:opacity-80 transition flex items-center gap-2 shadow-2xs`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Pasal Sebelumnya</span>
              <span className="sm:hidden">Sblm</span>
            </button>

            <span className={`text-xs ${themeStyles.secondaryText} font-mono hidden sm:inline`}>
              {currentBookInfo.name} {selectedChapter} / {totalChapters}
            </span>

            <button
              onClick={handleNextChapter}
              className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <span className="hidden sm:inline">Pasal Berikutnya</span>
              <span className="sm:hidden">Lanjut</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </main>

      {/* MODAL 1: PEMILIH KITAB (66 KITAB) */}
      {isBookPickerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-modal-backdrop-in"
          onClick={() => setIsBookPickerOpen(false)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 dark:border-zinc-800 my-6 space-y-4 max-h-[85vh] flex flex-col animate-modal-card-in"
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
                  .filter(b => b.name.toLowerCase().includes(bookSearchQuery.toLowerCase()) || (b.name_id && b.name_id.toLowerCase().includes(bookSearchQuery.toLowerCase())))
                  .map(b => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setTransitionAnim('animate-chapter-fade');
                        if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'instant' });
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
                        {b.name_id && bibleLang === 'en' && (
                          <span className="text-[10px] text-amber-700/80 dark:text-amber-300/80 font-medium block">
                            {b.name_id}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500">{b.chapters_count} {bibleLang === 'en' ? 'chs' : 'pasal'}</span>
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
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-modal-backdrop-in"
          onClick={() => setIsChapterPickerOpen(false)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 dark:border-zinc-800 my-6 space-y-4 max-h-[80vh] flex flex-col animate-modal-card-in"
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
                      setTransitionAnim('animate-chapter-fade');
                      if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'instant' });
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

      {/* MODAL 3: POPOVER CATATAN KAKI CEPAT (RECOVERY VERSION MODEL) */}
      {activeFootnotePopup && (
        <div 
          className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 ${
            isClosingFootnote ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in'
          }`}
          onClick={handleCloseFootnote}
        >
          <div 
            className={`bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-amber-300/80 dark:border-amber-700/60 space-y-4 max-h-[85vh] flex flex-col ${
              isClosingFootnote ? 'animate-modal-card-out' : 'animate-modal-card-in'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-white font-mono font-bold text-xs shadow-2xs">
                  Catatan {activeFootnotePopup.noteIdx}
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-zinc-100">
                  {currentBookInfo.name} {selectedChapter}:{activeFootnotePopup.verse}
                </h3>
              </div>
              <button 
                onClick={handleCloseFootnote}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeFootnotePopup.keyword && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-900 dark:text-amber-200">
                <span className="opacity-70">Kata / Frasa:</span>
                <span className="underline decoration-amber-500 font-extrabold">{activeFootnotePopup.keyword}</span>
              </div>
            )}

            <div className="overflow-y-auto pr-1 flex-1">
              <p 
                className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-zinc-200"
                style={{ fontFamily: activeFontFamily }}
              >
                {activeFootnotePopup.text}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  const copyText = `${currentBookInfo.name} ${selectedChapter}:${activeFootnotePopup.verse} [Catatan ${activeFootnotePopup.noteIdx}${activeFootnotePopup.keyword ? ` - ${activeFootnotePopup.keyword}` : ''}]:\n${activeFootnotePopup.text}`;
                  navigator.clipboard.writeText(copyText);
                  alert('Catatan kaki berhasil disalin!');
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Catatan</span>
              </button>

              <button
                onClick={handleCloseFootnote}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
