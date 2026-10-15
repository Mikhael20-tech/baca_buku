import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, ChevronLeft, ChevronRight, Search, Sparkles, 
  Settings, Sun, Moon, Coffee, ArrowLeft, Bookmark, Copy, 
  Check, Share2, ZoomIn, ZoomOut, Compass, List, X,
  MessageCircle, ChevronDown, ChevronUp, Info, Maximize2, Minimize2,
  Highlighter, Columns
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import BibleIntroModal from './BibleIntroModal';
import BibleBookmarksModal from './BibleBookmarksModal';
import BibleGlobalSearchModal from './BibleGlobalSearchModal';
import BibleRefPreviewModal from './BibleRefPreviewModal';

const FONTS = [
  { id: 'Merriweather', name: 'Merriweather', font: "'Merriweather', Georgia, serif" },
  { id: 'Literata', name: 'Literata', font: "'Literata', Georgia, serif" },
  { id: 'Lora', name: 'Lora', font: "'Lora', Georgia, serif" },
  { id: 'Inter', name: 'Inter', font: "'Inter', sans-serif" },
  { id: 'Plus Jakarta Sans', name: 'Jakarta Sans', font: "'Plus Jakarta Sans', sans-serif" }
];

export default function BibleReaderView({ onBackToHome, onOpenLibrary }) {
  const [bibleLang, setBibleLang] = useState(() => localStorage.getItem('bible_language') || 'id'); // 'id' | 'en'
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('bible_view_mode') || 'single'); // 'single' | 'parallel'
  
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(() => localStorage.getItem('last_bible_book') || 'matius');
  const [selectedChapter, setSelectedChapter] = useState(() => Number(localStorage.getItem('last_bible_chapter')) || 1);
  const [bookData, setBookData] = useState(null);
  const [parallelBookData, setParallelBookData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchVerse, setSearchVerse] = useState('');
  
  // Navigation & Feature Modals
  const [isBookPickerOpen, setIsBookPickerOpen] = useState(false);
  const [isChapterPickerOpen, setIsChapterPickerOpen] = useState(false);
  const [isIntroModalOpen, setIsIntroModalOpen] = useState(false);
  const [isBookmarksModalOpen, setIsBookmarksModalOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [previewReference, setPreviewReference] = useState(null);
  
  const [bookPickerTab, setBookPickerTab] = useState('PL'); // 'PL' | 'PB'
  const [bookSearchQuery, setBookSearchQuery] = useState('');

  // Reader Settings & Mode
  const [theme, setTheme] = useState(() => localStorage.getItem('bible_theme') || 'sepia'); // 'light' | 'sepia' | 'dark'
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('bible_font') || 'Lora');
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('bible_font_size')) || 20);
  const [contentWidth, setContentWidth] = useState(() => localStorage.getItem('bible_content_width') || 'wide'); // 'normal' | 'wide'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const [copiedVerse, setCopiedVerse] = useState(null);

  // Highlights & Bookmarks Storage
  const [highlights, setHighlights] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bible_highlights') || '{}');
    } catch {
      return {};
    }
  });

  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bible_bookmarks') || '[]');
    } catch {
      return [];
    }
  });

  const [activeVerseMenu, setActiveVerseMenu] = useState(null);

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
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // 1. Fetch Daftar 66 Kitab
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

  // 2. Fetch Data Kitab Utama & Paralel
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setBookData(null);
    setParallelBookData(null);

    const primaryUrl = bibleLang === 'en'
      ? `/bible/en/${selectedBookId}.json?v=${Date.now()}`
      : `/bible/${selectedBookId}.json?v=${Date.now()}`;

    const fetchPrimary = fetch(primaryUrl).then(res => {
      if (!res.ok) {
        if (bibleLang === 'en') {
          return fetch(`/bible/${selectedBookId}.json?v=${Date.now()}`).then(r => r.json());
        }
        throw new Error('Berkas kitab tidak ditemukan');
      }
      return res.json();
    });

    const promises = [fetchPrimary];

    if (viewMode === 'parallel') {
      const parallelUrl = bibleLang === 'en'
        ? `/bible/${selectedBookId}.json?v=${Date.now()}`
        : `/bible/en/${selectedBookId}.json?v=${Date.now()}`;

      const fetchParallel = fetch(parallelUrl)
        .then(res => res.ok ? res.json() : null)
        .catch(() => null);

      promises.push(fetchParallel);
    }

    Promise.all(promises)
      .then(([primary, parallel]) => {
        if (!isMounted) return;
        setBookData(primary);
        if (parallel) setParallelBookData(parallel);
        setIsLoading(false);

        const availableChaps = Object.keys(primary.chapters || {}).map(Number);
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
  }, [selectedBookId, bibleLang, viewMode]);

  // Simpan pasal aktif & scroll ke atas saat ganti pasal
  useEffect(() => {
    localStorage.setItem('last_bible_chapter', selectedChapter);
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [selectedChapter]);

  // Simpan Highlights & Bookmarks
  useEffect(() => {
    localStorage.setItem('bible_highlights', JSON.stringify(highlights));
  }, [highlights]);

  useEffect(() => {
    localStorage.setItem('bible_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('bible_view_mode', viewMode);
  }, [viewMode]);

  // Keyboard navigation (ArrowLeft & ArrowRight) & Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'Escape') {
        if (previewReference) {
          setPreviewReference(null);
        } else if (activeFootnotePopup) {
          handleCloseFootnote();
        } else if (isIntroModalOpen) {
          setIsIntroModalOpen(false);
        } else if (isBookmarksModalOpen) {
          setIsBookmarksModalOpen(false);
        } else if (isGlobalSearchOpen) {
          setIsGlobalSearchOpen(false);
        } else if (isBookPickerOpen) {
          setIsBookPickerOpen(false);
        } else if (isChapterPickerOpen) {
          setIsChapterPickerOpen(false);
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (isDistractionFree) {
          setIsDistractionFree(false);
        }
      } else if (e.key === 'ArrowLeft') {
        handlePrevChapter();
      } else if (e.key === 'ArrowRight') {
        handleNextChapter();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeFootnotePopup, previewReference, isIntroModalOpen, 
    isBookmarksModalOpen, isGlobalSearchOpen, isBookPickerOpen, 
    isChapterPickerOpen, isSettingsOpen, isDistractionFree, selectedChapter, books
  ]);

  // Touch Swipe Handlers for Mobile Chapter Navigation
  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
    touchStartY.current = e.changedTouches[0].screenY;
  };

  const handleTouchEnd = (e) => {
    const diffX = e.changedTouches[0].screenX - touchStartX.current;
    const diffY = e.changedTouches[0].screenY - touchStartY.current;
    if (Math.abs(diffX) > 80 && Math.abs(diffY) < 60) {
      if (diffX < 0) {
        handleNextChapter(); // Swipe left -> Next
      } else {
        handlePrevChapter(); // Swipe right -> Prev
      }
    }
  };

  // Simpan pengaturan tampilan
  useEffect(() => {
    localStorage.setItem('bible_theme', theme);
    localStorage.setItem('bible_font', fontFamily);
    localStorage.setItem('bible_font_size', fontSize);
  }, [theme, fontFamily, fontSize]);

  const currentBookInfo = useMemo(() => {
    return books.find(b => b.id === selectedBookId) || { name: 'Memuat...', testament: 'PL', chapters_count: 1 };
  }, [books, selectedBookId]);

  const chapterData = useMemo(() => {
    if (!bookData?.chapters) return null;
    return bookData.chapters[selectedChapter] || bookData.chapters[String(selectedChapter)] || null;
  }, [bookData, selectedChapter]);

  const parallelChapterData = useMemo(() => {
    if (!parallelBookData?.chapters) return null;
    return parallelBookData.chapters[selectedChapter] || parallelBookData.chapters[String(selectedChapter)] || null;
  }, [parallelBookData, selectedChapter]);

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

  const parallelFootnoteMap = useMemo(() => {
    const map = {};
    if (parallelChapterData?.footnotes && Array.isArray(parallelChapterData.footnotes)) {
      for (const fn of parallelChapterData.footnotes) {
        const v = fn.verse;
        if (!map[v]) map[v] = [];
        map[v].push({
          verse: v,
          note_idx: fn.note_idx || map[v].length + 1,
          keyword: fn.keyword || '',
          text: fn.text || ''
        });
      }
    }
    return map;
  }, [parallelChapterData]);

  // Navigasi Next & Prev Pasal
  const handlePrevChapter = () => {
    setTransitionAnim('animate-chapter-prev');
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
    if (selectedChapter > 1) {
      setSelectedChapter(prev => prev - 1);
    } else {
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
      const currentIdx = books.findIndex(b => b.id === selectedBookId);
      if (currentIdx < books.length - 1) {
        const nextBook = books[currentIdx + 1];
        setSelectedBookId(nextBook.id);
        setSelectedChapter(1);
      }
    }
  };

  const handleOpenFootnote = (verseNum, noteIdx, foundNote, isParallelCol = false) => {
    const key = `${verseNum}-${noteIdx}`;
    setActiveNoteKey(key);
    setHighlightedVerse(verseNum);

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

  // Highlights & Bookmarks Actions
  const handleSetHighlight = (vNum, color) => {
    const key = `${selectedBookId}-${selectedChapter}-${vNum}`;
    setHighlights(prev => {
      const updated = { ...prev };
      if (!color) {
        delete updated[key];
      } else {
        updated[key] = color;
      }
      return updated;
    });
    setActiveVerseMenu(null);
  };

  const handleToggleBookmark = (vNum, text) => {
    const id = `${selectedBookId}-${selectedChapter}-${vNum}`;
    setBookmarks(prev => {
      const exists = prev.some(b => b.id === id);
      if (exists) {
        return prev.filter(b => b.id !== id);
      } else {
        const newBm = {
          id,
          bookId: selectedBookId,
          bookName: currentBookInfo.name,
          chapter: selectedChapter,
          verse: vNum,
          text: text,
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        };
        return [newBm, ...prev];
      }
    });
    setActiveVerseMenu(null);
  };

  const handleRemoveBookmark = (id) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const handleSelectBookmarkOrSearchResult = (target) => {
    setSelectedBookId(target.bookId);
    setSelectedChapter(target.chapter);
    setTimeout(() => {
      const el = document.getElementById(`verse-${target.verse}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedVerse(target.verse);
        setTimeout(() => setHighlightedVerse(null), 3000);
      }
    }, 400);
  };

  // Theme Styles
  const themeStyles = {
    light: {
      bg: 'bg-slate-50',
      contentBg: 'bg-white',
      text: 'text-slate-900',
      secondaryText: 'text-slate-500',
      border: 'border-slate-200',
      headerBg: 'bg-white/95 border-slate-200/80',
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
      headerBg: 'bg-[#fcf8f0]/95 border-[#e6dbcd]/80',
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
      headerBg: 'bg-zinc-900/95 border-zinc-800/80',
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

  // Helper render teks catatan kaki dengan referensi yang bisa diklik
  const renderFootnoteTextWithLinks = (text) => {
    if (!text) return null;
    const regex = /(\b(?:[1-3]\s*[A-Za-z]+|[A-Za-z]+)\.?\s+\d+:\d+(?:-\d+)?\b)/g;
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      if (part.match(regex)) {
        return (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setPreviewReference(part);
            }}
            className="inline-flex items-center px-2 py-0.5 mx-0.5 rounded-lg font-mono text-xs sm:text-sm font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-300/80 dark:border-amber-700/80 underline decoration-amber-500 hover:decoration-amber-700 transition select-none cursor-pointer shadow-2xs"
            title={`Lihat ayat rujukan: ${part}`}
          >
            {part}
          </button>
        );
      }
      return part;
    });
  };

  // Helper render teks ayat dengan penanda catatan kaki interaktif (Recovery Version)
  const renderVerseText = (item, sourceLang = bibleLang) => {
    if (!showFootnoteAnchors || !item.marked_text || !item.marked_text.includes('<fn')) {
      return item.text;
    }

    const currentMap = sourceLang === 'id' ? footnoteMap : parallelFootnoteMap;
    const parts = item.marked_text.split(/(<fn n="\d+"\/>)/g);
    return parts.map((part, pIdx) => {
      const match = part.match(/<fn n="(\d+)"\/>/);
      if (match) {
        const noteIdx = Number(match[1]);
        const noteList = currentMap[item.verse] || [];
        const foundNote = noteList.find(n => n.note_idx === noteIdx) || noteList[noteIdx - 1];
        
        return (
          <sup
            key={pIdx}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenFootnote(item.verse, noteIdx, foundNote, sourceLang !== bibleLang);
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

  const getHighlightStyle = (vNum) => {
    const key = `${selectedBookId}-${selectedChapter}-${vNum}`;
    const color = highlights[key];
    if (!color) return '';
    if (color === 'yellow') return 'bg-amber-200/60 dark:bg-amber-900/40 border-l-4 border-amber-500 rounded-r-xl';
    if (color === 'green') return 'bg-emerald-200/60 dark:bg-emerald-900/40 border-l-4 border-emerald-500 rounded-r-xl';
    if (color === 'blue') return 'bg-sky-200/60 dark:bg-sky-900/40 border-l-4 border-sky-500 rounded-r-xl';
    if (color === 'rose') return 'bg-rose-200/60 dark:bg-rose-900/40 border-l-4 border-rose-500 rounded-r-xl';
    return '';
  };

  const isVerseBookmarked = (vNum) => {
    const id = `${selectedBookId}-${selectedChapter}-${vNum}`;
    return bookmarks.some(b => b.id === id);
  };

  return (
    <div 
      className={`h-full flex flex-col ${themeStyles.bg} selection:bg-amber-400 selection:text-slate-950 transition-colors duration-200`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* Top Header / App Bar (Hidden in Distraction-Free Fullscreen Mode) */}
      {!isDistractionFree ? (
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
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
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

            {/* Quick Picker: Kitab, Pasal & Info Kitab */}
            <div className="flex items-center gap-1.5 min-w-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (currentBookInfo?.testament) {
                    setBookPickerTab(currentBookInfo.testament);
                  }
                  setIsBookPickerOpen(true);
                }}
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

              {bookData?.intro && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsIntroModalOpen(true)}
                  className={`h-8 w-8 rounded-xl ${themeStyles.text} hover:bg-black/5 dark:hover:bg-white/5 transition shrink-0`}
                  title={bibleLang === 'en' ? 'Book Introduction & Background' : 'Pengantar & Pokok Kitab'}
                >
                  <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </Button>
              )}
            </div>
          </div>

          {/* Kanan: Navigasi Cepat, Search, Mode Paralel & Settings */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Prev & Next Chapter Buttons */}
            <div className="flex items-center border rounded-xl overflow-hidden shadow-xs border-slate-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-800/60">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevChapter}
                className={`h-8 w-8 rounded-none ${themeStyles.text} hover:bg-black/5 dark:hover:bg-white/5 transition`}
                title="Pasal Sebelumnya (ArrowLeft)"
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
                title="Pasal Berikutnya (ArrowRight)"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Global Search Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsGlobalSearchOpen(true)}
              className={`h-8 w-8 rounded-xl border ${themeStyles.border} ${themeStyles.text} hover:opacity-80 transition shadow-xs`}
              title="Pencarian Firman 66 Kitab (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </Button>

            {/* Bookmarks Modal Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsBookmarksModalOpen(true)}
              className={`h-8 w-8 rounded-xl relative border ${themeStyles.border} ${themeStyles.text} hover:opacity-80 transition shadow-xs`}
              title="Ayat Tersimpan & Bookmark"
            >
              <Bookmark className="w-4 h-4" />
              {bookmarks.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                  {bookmarks.length}
                </span>
              )}
            </Button>

            {/* Language & Parallel View Selector */}
            <div className={`flex items-center p-0.5 rounded-xl border ${themeStyles.border} bg-black/5 dark:bg-white/5`}>
              <button
                type="button"
                onClick={() => {
                  setViewMode('single');
                  setBibleLang('id');
                  localStorage.setItem('bible_language', 'id');
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  viewMode === 'single' && bibleLang === 'id'
                    ? 'bg-[#3B4B34] text-white shadow-xs'
                    : `${themeStyles.text} opacity-60 hover:opacity-100`
                }`}
                title="Alkitab Versi Pemulihan (ID)"
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('single');
                  setBibleLang('en');
                  localStorage.setItem('bible_language', 'en');
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  viewMode === 'single' && bibleLang === 'en'
                    ? 'bg-[#3B4B34] text-white shadow-xs'
                    : `${themeStyles.text} opacity-60 hover:opacity-100`
                }`}
                title="Recovery Version (EN)"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setViewMode(prev => prev === 'parallel' ? 'single' : 'parallel')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  viewMode === 'parallel'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : `${themeStyles.text} opacity-60 hover:opacity-100`
                }`}
                title="Mode Berdampingan (ID & EN Paralel)"
              >
                <Columns className="w-3 h-3" />
                <span className="hidden md:inline">Paralel</span>
              </button>
            </div>

            {/* Fullscreen / Distraction-Free Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDistractionFree(true)}
              className={`shrink-0 h-8 w-8 rounded-xl border ${themeStyles.border} ${themeStyles.text} hover:opacity-80 transition shadow-xs hidden sm:flex`}
              title="Layar Penuh (Fokus Membaca)"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>

            {/* Settings Popover */}
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
      ) : (
        /* Floating Capsule Control in Distraction-Free Fullscreen Mode */
        <div className="fixed top-3 right-4 z-50 flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 dark:bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-xl transition-all">
          <span className="text-xs font-bold px-2">
            📖 {currentBookInfo.name} {selectedChapter}
          </span>
          <button
            onClick={handlePrevChapter}
            className="p-1 hover:bg-white/20 rounded-lg transition"
            title="Pasal Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextChapter}
            className="p-1 hover:bg-white/20 rounded-lg transition"
            title="Pasal Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-white/20 my-auto" />
          <button
            onClick={() => setIsDistractionFree(false)}
            className="p-1 hover:bg-white/20 rounded-lg transition"
            title="Keluar Layar Penuh (Esc)"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      )}

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

            {/* Toggle Fitur Versi Pemulihan */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fitur Pemulihan</label>
              <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                <span className="text-slate-700 dark:text-zinc-300">Catatan Kaki (Footnotes)</span>
                <input
                  type="checkbox"
                  checked={showFootnoteAnchors}
                  onChange={(e) => setShowFootnoteAnchors(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
              </label>
              <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                <span className="text-slate-700 dark:text-zinc-300">Garis Besar Rohani (Outlines)</span>
                <input
                  type="checkbox"
                  checked={showOutlines}
                  onChange={(e) => setShowOutlines(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
              </label>
            </div>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <main 
        ref={contentRef}
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 md:py-10 transition-colors"
      >
        <div className={`mx-auto transition-all ${contentWidth === 'wide' ? 'max-w-4xl' : 'max-w-2xl'} space-y-6 ${transitionAnim}`}>
          
          {/* Header Judul Kitab & Pasal */}
          <div className="text-center space-y-2 pb-4 border-b border-slate-200/60 dark:border-zinc-800">
            <span className="text-[11px] font-bold tracking-widest uppercase font-mono px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 inline-block">
              {currentBookInfo.testament === 'PL' ? 'Perjanjian Lama' : 'Perjanjian Baru'}
              {viewMode === 'parallel' && ' • Mode Paralel (ID & EN)'}
            </span>
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight ${themeStyles.text}`}>
              {currentBookInfo.name}
              <span className="ml-2.5 text-amber-600 dark:text-amber-400 font-mono font-normal">
                {selectedChapter}
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

              {(bookData.intro.Pokok || bookData.intro.Subject) && (
                <div className="mt-2.5 text-xs sm:text-sm font-semibold italic border-l-2 border-amber-500 pl-2.5 text-amber-950 dark:text-amber-200">
                  <span className="font-bold not-italic text-amber-700 dark:text-amber-300">
                    {bookData.intro.Subject ? 'Subject: ' : 'Pokok: '}
                  </span>
                  {bookData.intro.Subject || bookData.intro.Pokok}
                </div>
              )}

              {isIntroExpanded && (
                <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 space-y-2 text-xs sm:text-sm">
                  {Object.entries(bookData.intro).map(([k, v]) => {
                    if (k === 'Pokok' || k === 'Subject') return null;
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

          {/* Garis Besar Pasal Utama */}
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
            <div className="space-y-2">
              {filteredVerses.map((item, idx) => {
                const enItem = parallelChapterData?.verses?.find(ev => ev.verse === item.verse);
                const isBookmarked = isVerseBookmarked(item.verse);
                const highlightClass = getHighlightStyle(item.verse);

                return (
                  <div key={`${bibleLang}-${selectedBookId}-${selectedChapter}-${item.verse}-${idx}`} className="relative">
                    {/* Garis Besar Rohani di atas ayat */}
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
                      onClick={() => setActiveVerseMenu(activeVerseMenu === item.verse ? null : item.verse)}
                      className={`group relative p-2 sm:p-2.5 rounded-xl transition-all duration-300 ease-out cursor-pointer ${
                        highlightedVerse === item.verse
                          ? 'bg-amber-500/20 ring-2 ring-amber-400/80 shadow-md scale-[1.006]'
                          : highlightClass || themeStyles.verseHover
                      }`}
                    >
                      {/* Mode Paralel (Side-by-Side: ID & EN) */}
                      {viewMode === 'parallel' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                          {/* Kolom Kiri: Bahasa Indonesia */}
                          <div className="flex items-start gap-2.5">
                            <span className={`shrink-0 w-7 h-7 rounded-lg font-mono text-[10px] sm:text-xs font-extrabold border flex items-center justify-center select-none shadow-2xs ${themeStyles.verseNum}`}>
                              {item.verse}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block mb-0.5 font-mono">
                                ID • Pemulihan
                              </span>
                              <p 
                                className={`leading-relaxed ${themeStyles.text}`}
                                style={{ fontFamily: activeFontFamily, fontSize: `${fontSize}px`, lineHeight: 1.85 }}
                              >
                                {renderVerseText(item, 'id')}
                              </p>
                            </div>
                          </div>

                          {/* Kolom Kanan: Bahasa Inggris */}
                          <div className="border-t md:border-t-0 md:border-l border-slate-200 dark:border-zinc-800 pt-2 md:pt-0 md:pl-4 flex items-start gap-2.5">
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block mb-0.5 font-mono">
                                EN • Recovery Version
                              </span>
                              <p 
                                className={`leading-relaxed ${themeStyles.text}`}
                                style={{ fontFamily: activeFontFamily, fontSize: `${fontSize}px`, lineHeight: 1.85 }}
                              >
                                {enItem ? renderVerseText(enItem, 'en') : '—'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Mode Tunggal (Normal) */
                        <div className="flex items-start gap-2.5">
                          <span className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl font-mono text-[10px] sm:text-xs font-extrabold border flex items-center justify-center select-none shadow-2xs ${themeStyles.verseNum}`}>
                            {item.verse}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p 
                              className={`leading-relaxed ${themeStyles.text}`}
                              style={{ 
                                fontFamily: activeFontFamily,
                                fontSize: `${fontSize}px`,
                                lineHeight: 1.85
                              }}
                            >
                              {renderVerseText(item, bibleLang)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Floating Micro-Toolbar for Verse (Highlights, Bookmark, Copy) */}
                      {activeVerseMenu === item.verse && (
                        <div 
                          className="absolute -top-10 left-4 z-30 flex items-center gap-1.5 p-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full shadow-xl animate-fade-in"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Color Palette */}
                          <button
                            onClick={() => handleSetHighlight(item.verse, 'yellow')}
                            className="w-5 h-5 rounded-full bg-amber-400 hover:scale-110 transition border border-amber-500/50"
                            title="Stabilo Kuning"
                          />
                          <button
                            onClick={() => handleSetHighlight(item.verse, 'green')}
                            className="w-5 h-5 rounded-full bg-emerald-400 hover:scale-110 transition border border-emerald-500/50"
                            title="Stabilo Hijau"
                          />
                          <button
                            onClick={() => handleSetHighlight(item.verse, 'blue')}
                            className="w-5 h-5 rounded-full bg-sky-400 hover:scale-110 transition border border-sky-500/50"
                            title="Stabilo Biru"
                          />
                          <button
                            onClick={() => handleSetHighlight(item.verse, 'rose')}
                            className="w-5 h-5 rounded-full bg-rose-400 hover:scale-110 transition border border-rose-500/50"
                            title="Stabilo Merah Muda"
                          />
                          <button
                            onClick={() => handleSetHighlight(item.verse, null)}
                            className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-700 hover:scale-110 transition flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-zinc-300"
                            title="Hapus Stabilo"
                          >
                            ✕
                          </button>

                          <div className="w-px h-4 bg-slate-200 dark:bg-zinc-700 mx-0.5" />

                          {/* Bookmark Toggle */}
                          <button
                            onClick={() => handleToggleBookmark(item.verse, item.text)}
                            className={`p-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700 transition ${
                              isBookmarked ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'
                            }`}
                            title={isBookmarked ? 'Hapus Bookmark' : 'Tandai Ayat (Bookmark)'}
                          >
                            <Bookmark className="w-3.5 h-3.5 fill-current" />
                          </button>

                          {/* Copy Verse */}
                          <button
                            onClick={() => handleCopyVerse(item.verse, item.text)}
                            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 transition"
                            title="Salin Ayat"
                          >
                            {copiedVerse === item.verse ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
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
              className={`px-4 py-2.5 rounded-2xl border ${themeStyles.border} ${themeStyles.text} font-bold text-xs hover:opacity-80 transition flex items-center gap-2 shadow-2xs cursor-pointer`}
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
              className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
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
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-100">
                  {bibleLang === 'en' ? 'Select Book (66 Books)' : 'Pilih Kitab (66 Kitab Lengkap)'}
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
                  onClick={() => setBookPickerTab('PL')}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                    bookPickerTab === 'PL' ? 'bg-white dark:bg-zinc-700 text-blue-700 dark:text-blue-300 shadow-2xs' : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  {bibleLang === 'en' ? 'Old Testament (39)' : 'Perjanjian Lama (39)'}
                </button>
                <button
                  onClick={() => setBookPickerTab('PB')}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                    bookPickerTab === 'PB' ? 'bg-white dark:bg-zinc-700 text-amber-700 dark:text-amber-300 shadow-2xs' : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  {bibleLang === 'en' ? 'New Testament (27)' : 'Perjanjian Baru (27)'}
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
              <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-100">
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

      {/* MODAL 3: POPOVER CATATAN KAKI CEPAT (DENGAN RUJUKAN SILANG INTERAKTIF) */}
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
              <div 
                className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-zinc-200 whitespace-pre-line"
                style={{ 
                  fontFamily: activeFontFamily,
                  fontSize: `${Math.max(15, fontSize - 2)}px`,
                  lineHeight: 1.85 
                }}
              >
                {renderFootnoteTextWithLinks(activeFootnotePopup.text)}
              </div>
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

      {/* MODAL 4: PENGANTAR KITAB LENGKAP */}
      <BibleIntroModal
        isOpen={isIntroModalOpen}
        onClose={() => setIsIntroModalOpen(false)}
        bookData={bookData}
        bibleLang={bibleLang}
      />

      {/* MODAL 5: AYAT TERSIMPAN & BOOKMARK */}
      <BibleBookmarksModal
        isOpen={isBookmarksModalOpen}
        onClose={() => setIsBookmarksModalOpen(false)}
        bookmarks={bookmarks}
        onRemoveBookmark={handleRemoveBookmark}
        onSelectBookmark={handleSelectBookmarkOrSearchResult}
        bibleLang={bibleLang}
      />

      {/* MODAL 6: PENCARIAN GLOBAL 66 KITAB */}
      <BibleGlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        books={books}
        currentBookId={selectedBookId}
        bibleLang={bibleLang}
        onSelectResult={handleSelectBookmarkOrSearchResult}
      />

      {/* MODAL 7: PREVIEW RUJUKAN SILANG DARI CATATAN KAKI */}
      <BibleRefPreviewModal
        isOpen={Boolean(previewReference)}
        referenceText={previewReference}
        onClose={() => setPreviewReference(null)}
        bibleLang={bibleLang}
        books={books}
        fontSize={fontSize}
        fontFamily={activeFontFamily}
        onJumpToPassage={handleSelectBookmarkOrSearchResult}
      />

    </div>
  );
}
