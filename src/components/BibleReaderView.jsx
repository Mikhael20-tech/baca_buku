import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, ChevronLeft, ChevronRight, Search, Sparkles, 
  Settings, Sun, Moon, Coffee, ArrowLeft, Bookmark, Copy, 
  Check, Share2, ZoomIn, ZoomOut, Compass, List, X,
  MessageCircle, ChevronDown, ChevronUp, Info, Maximize2, Minimize2,
  Highlighter, Columns, BookMarked, Hash, FileText, Scroll, Eye, Clock,
  ArrowLeftRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const PARALLEL_TRANSLATIONS = [
  { id: 'id', code: 'AVP', name: 'Alkitab Versi Pemulihan' },
  { id: 'tb', code: 'TB', name: 'Terjemahan Baru LAI' },
  { id: 'en', code: 'RCV', name: 'Recovery Version' },
  { id: 'kjv', code: 'KJV', name: 'King James (1769)' },
  { id: 'asv', code: 'ASV', name: 'American Standard' },
  { id: 'net', code: 'NET', name: 'NET Bible' },
  { id: 'scofield', code: 'SCO', name: 'Scofield 1917' }
];

const getTranslationLabel = (lang) => {
  const found = PARALLEL_TRANSLATIONS.find(t => t.id === lang);
  return found ? `${found.code} • ${found.name}` : (lang ? lang.toUpperCase() : 'ID');
};

import BibleIntroModal from './BibleIntroModal';
import BibleBookmarksModal from './BibleBookmarksModal';
import BibleGlobalSearchModal from './BibleGlobalSearchModal';
import BibleRefPreviewModal from './BibleRefPreviewModal';
import BibleVerseCardModal from './BibleVerseCardModal';
import BiblePersonalNoteModal from './BiblePersonalNoteModal';
import BibleNotesListModal from './BibleNotesListModal';
import BibleVerseCompareModal from './BibleVerseCompareModal';
import BibleScofieldIndexModal from './BibleScofieldIndexModal';
import BibleScofieldClassicView from './BibleScofieldClassicView';
import BibleTruthChartsModal from './BibleTruthChartsModal';

const BIBLE_ABBR_MAP = {
  gen: 'kejadian', genesis: 'kejadian', kej: 'kejadian',
  exo: 'keluaran', exodus: 'keluaran', kel: 'keluaran',
  lev: 'imamat', leviticus: 'imamat', im: 'imamat',
  num: 'bilangan', numbers: 'bilangan', bil: 'bilangan',
  deu: 'ulangan', deuteronomy: 'ulangan', ul: 'ulangan',
  jos: 'yosua', joshua: 'yosua', yos: 'yosua',
  jdg: 'hakim-hakim', judges: 'hakim-hakim', hak: 'hakim-hakim',
  rut: 'rut', ruth: 'rut',
  '1sa': '1-samuel', '1samuel': '1-samuel', '1sam': '1-samuel',
  '2sa': '2-samuel', '2samuel': '2-samuel', '2sam': '2-samuel',
  '1ki': '1-raja-raja', '1kings': '1-raja-raja', '1raj': '1-raja-raja',
  '2ki': '2-raja-raja', '2kings': '2-raja-raja', '2raj': '2-raja-raja',
  '1ch': '1-tawarikh', '1chronicles': '1-tawarikh', '1taw': '1-tawarikh',
  '2ch': '2-tawarikh', '2chronicles': '2-tawarikh', '2taw': '2-tawarikh',
  ezr: 'ezra', ezra: 'ezra',
  neh: 'nehemia', nehemiah: 'nehemia',
  est: 'ester', esther: 'ester',
  job: 'ayub', ayub: 'ayub',
  psa: 'mazmur', psalms: 'mazmur', psalm: 'mazmur', maz: 'mazmur',
  pro: 'amsal', proverbs: 'amsal', ams: 'amsal',
  ecc: 'pengkhotbah', ecclesiastes: 'pengkhotbah', pkh: 'pengkhotbah',
  sol: 'kidung-agung', song: 'kidung-agung', 'song of solomon': 'kidung-agung', kid: 'kidung-agung',
  isa: 'yesaya', isaiah: 'yesaya', yes: 'yesaya',
  jer: 'yeremia', jeremiah: 'yeremia', yer: 'yeremia',
  lam: 'ratapan', lamentations: 'ratapan', rat: 'ratapan',
  eze: 'yehezkiel', ezekiel: 'yehezkiel', yeh: 'yehezkiel',
  dan: 'daniel',
  hos: 'hosea',
  joe: 'yoel', joel: 'yoel',
  amo: 'amos',
  oba: 'obaja', obadiah: 'obaja',
  jon: 'yunus', jonah: 'yunus',
  mic: 'mikha', micah: 'mikha',
  nah: 'nahum',
  hab: 'habakuk', habakkuk: 'habakuk',
  zep: 'zefanya', zephaniah: 'zefanya',
  hag: 'hagai', haggai: 'hagai',
  zec: 'zakharia', zechariah: 'zakharia',
  mal: 'maleakhi', malachi: 'maleakhi',
  mat: 'matius', matthew: 'matius',
  mar: 'markus', mark: 'markus',
  luk: 'lukas', luke: 'lukas',
  joh: 'yohanes', john: 'yohanes', yoh: 'yohanes',
  act: 'kisah-para-rasul', acts: 'kisah-para-rasul', kis: 'kisah-para-rasul',
  rom: 'roma', romans: 'roma',
  '1co': '1-korintus', '1corinthians': '1-korintus', '1kor': '1-korintus',
  '2co': '2-korintus', '2corinthians': '2-korintus', '2kor': '2-korintus',
  gal: 'galatia', galatians: 'galatia',
  eph: 'efesus', ephesians: 'efesus',
  php: 'filipi', philippians: 'filipi',
  col: 'kolose', colossians: 'kolose',
  '1th': '1-tesalonika', '1thessalonians': '1-tesalonika', '1tes': '1-tesalonika',
  '2th': '2-tesalonika', '2thessalonians': '2-tesalonika', '2tes': '2-tesalonika',
  '1ti': '1-timotius', '1timothy': '1-timotius', '1tim': '1-timotius',
  '2ti': '2-timotius', '2timothy': '2-timotius', '2tim': '2-timotius',
  tit: 'titus',
  phm: 'filemon', philemon: 'filemon',
  heb: 'ibrani', hebrews: 'ibrani',
  jas: 'yakobus', james: 'yakobus', yak: 'yakobus',
  '1pe': '1-petrus', '1peter': '1-petrus', '1pet': '1-petrus',
  '2pe': '2-petrus', '2peter': '2-petrus', '2pet': '2-petrus',
  '1jo': '1-yohanes', '1john': '1-yohanes', '1yoh': '1-yohanes',
  '2jo': '2-yohanes', '2john': '2-yohanes', '2yoh': '2-yohanes',
  '3jo': '3-yohanes', '3john': '3-yohanes', '3yoh': '3-yohanes',
  jud: 'yudas', jude: 'yudas',
  rev: 'wahyu', revelation: 'wahyu', wah: 'wahyu'
};

const FONTS = [
  { id: 'Cinzel', name: 'Cinzel (Artistik)', font: "'Cinzel', Georgia, serif" },
  { id: 'Playfair Display', name: 'Playfair (Elegan)', font: "'Playfair Display', Georgia, serif" },
  { id: 'Cormorant Garamond', name: 'Cormorant (Klasik)', font: "'Cormorant Garamond', Georgia, serif" },
  { id: 'Lora', name: 'Lora', font: "'Lora', Georgia, serif" },
  { id: 'Merriweather', name: 'Merriweather', font: "'Merriweather', Georgia, serif" },
  { id: 'Literata', name: 'Literata', font: "'Literata', Georgia, serif" },
  { id: 'Inter', name: 'Inter', font: "'Inter', sans-serif" },
];

const SCOFIELD_DOCS = [
  {
    id: 'preface',
    title: 'Preface to the Present Edition (1917)',
    titleId: 'Kata Pengantar Edisi Revisi 1917',
    desc: 'Penjelasan revisi Oxford 1917, komite konsultasi referensi, dan pengenalan sistem catatan rantai tematik (chain references).',
    descEn: 'Explanation of the 1917 Oxford revision, editorial board, and system of topical chain references.',
    badge: 'Oxford 1917 • Hal. 8',
    icon: Scroll
  },
  {
    id: 'intro',
    title: 'Introduction (To Be Read - 1909)',
    titleId: 'Pengantar 11 Fitur Utama',
    desc: '11 fitur mendasar Scofield Reference Bible, analisis komprehensif, pembagian dispensasi, dan panduan membaca teks Kitab Suci.',
    descEn: '11 distinctive features of the Scofield Bible, panoramic analysis, and guide to dispensational study.',
    badge: 'Edisi 1909 • Hal. 7–8',
    icon: FileText
  },
  {
    id: 'panoramic',
    title: 'A Panoramic View of the Bible',
    titleId: 'Pandangan Panorama Alkitab',
    desc: 'Ikhtisar panorama terpadu seluruh Kitab Suci: Perjanjian Lama sebagai persiapan, dan Perjanjian Baru sebagai penggenapan Kristus.',
    descEn: 'Unified panoramic view of Scripture: Old Testament preparation and New Testament fulfillment in Christ.',
    badge: 'Panorama Biblika • Hal. 9–10',
    icon: Eye
  },
  {
    id: 'pentateuch',
    title: 'The Pentateuch',
    titleId: 'Pengantar 5 Kitab Taurat',
    desc: 'Risalah pengantar khusus 5 Kitab Taurat Musa (Kejadian sampai Ulangan) sebagai fondasi progresif wahyu Allah.',
    descEn: 'Special introduction to the Five Books of Moses (Genesis–Deuteronomy) as progressive revelation foundation.',
    badge: 'Taurat Musa • Hal. 12',
    icon: Compass
  },
  {
    id: 'malachi_to_matthew',
    title: 'From Malachi to Matthew',
    titleId: 'Dari Maleakhi ke Matius (Masa 400 Tahun)',
    desc: 'Jembatan sejarah & rohani masa 400 tahun keheningan profetik: era Persia, Yunani Alexander, Antiokhus Epifanes, kepahlawanan Makabe, hingga era Romawi & lahirnya Kristus.',
    descEn: 'The 400 silent years between the Testaments: Persian, Grecian, Maccabean, and Roman periods leading to Christ.',
    badge: 'Antara PL & PB • Hal. 995–996',
    icon: Clock
  },
  {
    id: 'four_gospels',
    title: 'The Four Gospels',
    titleId: 'Pengantar Empat Injil',
    desc: 'Pengantar umum catatan Injil dan 7 prinsip esensial memahami empat wujud Kristus: Raja (Matius), Hamba (Markus), Manusia Sejati (Lukas), dan Anak Allah (Yohanes).',
    descEn: 'General introduction to the Evangelical record and the sevenfold united testimony of the Gospels.',
    badge: 'Kanonik Injil • Hal. 999–1001',
    icon: BookOpen
  }
];

function getOutlinesList(rawOutlines) {
  if (!rawOutlines) return [];
  if (Array.isArray(rawOutlines)) return rawOutlines;
  if (typeof rawOutlines === 'string') {
    const trimmed = rawOutlines.trim();
    return trimmed ? [trimmed] : [];
  }
  if (typeof rawOutlines === 'object') {
    if (rawOutlines.text) return [rawOutlines.text];
    return [JSON.stringify(rawOutlines)];
  }
  return [String(rawOutlines)];
}

function getOutlineText(otl) {
  if (!otl) return '';
  if (typeof otl === 'string') return otl;
  if (typeof otl === 'object' && otl.text) return otl.text;
  return String(otl);
}

export default function BibleReaderView({ onBackToHome, onOpenLibrary, onOpenBook, allBooks }) {
  const [bibleLang, setBibleLang] = useState(() => localStorage.getItem('bible_language') || 'id'); // 'id' | 'tb' | 'en' | 'kjv' | 'asv' | 'net' | 'scofield'
  const isEnBible = ['en', 'kjv', 'asv', 'net', 'scofield'].includes(bibleLang);
  const [scofieldLayout, setScofieldLayout] = useState(() => localStorage.getItem('bible_scofield_layout') || 'classic'); // 'classic' | 'modern'
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('bible_view_mode') || 'single'); // 'single' | 'parallel'
  const [parallelLeftLang, setParallelLeftLang] = useState(() => localStorage.getItem('bible_parallel_left') || 'id');
  const [parallelRightLang, setParallelRightLang] = useState(() => localStorage.getItem('bible_parallel_right') || 'en');
  const [isScofieldIndexOpen, setIsScofieldIndexOpen] = useState(false);
  const [isTruthChartsOpen, setIsTruthChartsOpen] = useState(false);
  
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
  const [isVersePickerOpen, setIsVersePickerOpen] = useState(false);
  const [isIntroModalOpen, setIsIntroModalOpen] = useState(false);
  const [introModalInitialTab, setIntroModalInitialTab] = useState('book');
  const [isBookmarksModalOpen, setIsBookmarksModalOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [previewReference, setPreviewReference] = useState(null);

  // New Feature Modals: Share Card, Personal Notes, Compare Translation
  const [cardModalVerse, setCardModalVerse] = useState(null);
  const [personalNoteVerse, setPersonalNoteVerse] = useState(null);
  const [isNotesListModalOpen, setIsNotesListModalOpen] = useState(false);
  const [compareVerseData, setCompareVerseData] = useState(null);

  // Personal Notes Storage
  const [personalNotes, setPersonalNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bible_personal_notes') || '{}');
    } catch {
      return {};
    }
  });
  
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
    let booksUrl = '/bible/books.json';
    if (['tb', 'kjv', 'asv', 'net', 'scofield', 'en'].includes(bibleLang)) {
      booksUrl = `/bible/${bibleLang}/books.json`;
    }

    fetch(booksUrl)
      .then(res => {
        if (!res.ok) {
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

    if (viewMode === 'parallel') {
      const getLangUrl = (lang) => {
        if (['tb', 'kjv', 'asv', 'net', 'scofield', 'en'].includes(lang)) {
          return `/bible/${lang}/${selectedBookId}.json?v=2`;
        }
        return `/bible/${selectedBookId}.json?v=2`;
      };

      const fetchLeft = fetch(getLangUrl(parallelLeftLang)).then(r => r.ok ? r.json() : null);
      const fetchRight = fetch(getLangUrl(parallelRightLang)).then(r => r.ok ? r.json() : null);

      Promise.all([fetchLeft, fetchRight])
        .then(([leftData, rightData]) => {
          if (!isMounted) return;
          // In parallel mode: bookData is left, parallelBookData is right
          setBookData(leftData || rightData);
          setParallelBookData(rightData || leftData);
          setIsLoading(false);

          const primary = leftData || rightData;
          const availableChaps = Object.keys(primary?.chapters || {}).map(Number);
          if (!availableChaps.includes(selectedChapter) && availableChaps.length > 0) {
            setSelectedChapter(availableChaps[0]);
          }
        })
        .catch(err => {
          if (!isMounted) return;
          console.error('Gagal memuat isi kitab paralel:', err);
          setIsLoading(false);
        });
    } else {
      setParallelBookData(null);
      let primaryUrl = `/bible/${selectedBookId}.json?v=2`;
      if (['tb', 'kjv', 'asv', 'net', 'scofield', 'en'].includes(bibleLang)) {
        primaryUrl = `/bible/${bibleLang}/${selectedBookId}.json?v=2`;
      }

      fetch(primaryUrl)
        .then(res => {
          if (!res.ok) {
            return fetch(`/bible/${selectedBookId}.json?v=2`).then(r => r.json());
          }
          return res.json();
        })
        .then(data => {
          if (!isMounted) return;
          setBookData(data);
          setIsLoading(false);

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
    }

    localStorage.setItem('last_bible_book', selectedBookId);
    return () => { isMounted = false; };
  }, [selectedBookId, bibleLang, viewMode, parallelLeftLang, parallelRightLang]);

  // 3. Prefetch Kitab Berikutnya Secara Diam-diam di Waktu Senggang (Idle Background Prefetch)
  useEffect(() => {
    if (!books || books.length === 0) return;
    const currentIdx = books.findIndex(b => b.id === selectedBookId);
    if (currentIdx >= 0 && currentIdx < books.length - 1) {
      const nextBook = books[currentIdx + 1];
      const timer = setTimeout(() => {
        let nextUrl = `/bible/${nextBook.id}.json?v=2`;
        if (['tb', 'kjv', 'asv', 'net', 'scofield', 'en'].includes(bibleLang)) {
          nextUrl = `/bible/${bibleLang}/${nextBook.id}.json?v=2`;
        }
        fetch(nextUrl).catch(() => {});
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [selectedBookId, books, bibleLang]);

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

  const handleOpenFootnote = (verseNum, noteIdx, foundNote, noteLang = bibleLang) => {
    const key = `${verseNum}-${noteIdx}`;
    setActiveNoteKey(key);
    setHighlightedVerse(verseNum);

    const verseEl = document.getElementById(`verse-${verseNum}`);
    if (verseEl) {
      verseEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const isNoteEn = noteLang === 'en';
    setIsClosingFootnote(false);
    setActiveFootnotePopup({
      verse: verseNum,
      noteIdx: noteIdx,
      keyword: foundNote?.keyword || '',
      text: foundNote?.text || (isNoteEn ? 'Footnote not found.' : 'Catatan kaki tidak ditemukan.'),
      lang: noteLang
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
          lang: bibleLang,
          date: new Date().toLocaleDateString(isEnBible ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        };
        return [newBm, ...prev];
      }
    });
    setActiveVerseMenu(null);
  };

  const handleRemoveBookmark = (id) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const handleSavePersonalNote = (verseKey, noteText) => {
    const v = personalNoteVerse;
    if (!v) return;
    const newNotes = {
      ...personalNotes,
      [verseKey]: {
        note: noteText,
        bookId: selectedBookId,
        bookName: currentBookInfo.name,
        chapter: selectedChapter,
        verse: v.verse,
        verseText: v.text,
        lang: bibleLang,
        timestamp: Date.now(),
        date: new Date().toLocaleDateString(isEnBible ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      }
    };
    setPersonalNotes(newNotes);
    localStorage.setItem('bible_personal_notes', JSON.stringify(newNotes));
  };

  const handleDeletePersonalNote = (verseKey) => {
    const updated = { ...personalNotes };
    delete updated[verseKey];
    setPersonalNotes(updated);
    localStorage.setItem('bible_personal_notes', JSON.stringify(updated));
  };

  const handleSelectBookmarkOrSearchResult = (target) => {
    if (target.lang && target.lang !== bibleLang) {
      setBibleLang(target.lang);
      localStorage.setItem('bible_language', target.lang);
    }
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

  const handleSelectScofieldReference = (refStr) => {
    if (!refStr) return;
    const match = refStr.match(/^([0-9]?\s*[A-Za-z]+)\.?\s*(\d+)(?::(\d+))?/);
    if (!match) return;
    const rawBook = match[1].toLowerCase().replace(/\s+/g, '');
    const chap = Number(match[2]) || 1;
    const v = match[3] ? Number(match[3]) : null;

    const targetBookId = BIBLE_ABBR_MAP[rawBook] || rawBook;
    if (targetBookId) {
      if (bibleLang !== 'scofield') {
        setBibleLang('scofield');
        localStorage.setItem('bible_language', 'scofield');
      }
      setSelectedBookId(targetBookId);
      setSelectedChapter(chap);
      if (v) {
        setTimeout(() => {
          const el = document.getElementById(`verse-${v}`) || document.getElementById(`classic-verse-${v}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedVerse(v);
            setTimeout(() => setHighlightedVerse(null), 3000);
          }
        }, 500);
      }
    }
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
  const renderFootnoteTextWithLinks = (text, footnoteLang = bibleLang) => {
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
              setPreviewReference({ text: part, lang: footnoteLang });
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

    const currentMap = viewMode === 'parallel'
      ? (sourceLang === parallelRightLang ? parallelFootnoteMap : footnoteMap)
      : footnoteMap;

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
              handleOpenFootnote(item.verse, noteIdx, foundNote, sourceLang);
            }}
            className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 mx-0.5 -translate-y-1 rounded-full text-[11px] font-bold font-sans cursor-pointer select-none transition-all duration-200 ease-out shadow-2xs ${
              activeNoteKey === `${item.verse}-${noteIdx}`
                ? 'bg-amber-600 text-white scale-110 shadow-md ring-2 ring-amber-400 fn-badge-active'
                : 'bg-amber-500/15 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white hover:scale-115 active:scale-95'
            }`}
            style={{ textDecoration: 'none' }}
            title={`${sourceLang === 'en' ? 'Footnote' : 'Catatan Kaki'} ${noteIdx}${foundNote?.keyword ? `: ${foundNote.keyword}` : ''}`}
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
        <header className={`shrink-0 z-40 backdrop-blur-md border-b ${themeStyles.headerBg} transition-colors shadow-sm`}>
          
          {/* ========================================================= */}
          {/* DESKTOP HEADER (MD & LARGER): Satu Baris Lebar & Lega     */}
          {/* ========================================================= */}
          <div className="hidden md:flex items-center justify-between px-3 lg:px-6 py-2.5 gap-2 w-full">
            {/* Kiri: Tombol Beranda & Selector Kitab */}
            <div className="flex items-center gap-1.5 lg:gap-2 min-w-0">
              <Button
                variant="outline"
                size="sm"
                onClick={onBackToHome}
                className={`shrink-0 rounded-xl border ${themeStyles.border} ${themeStyles.text} hover:opacity-80 transition h-8 px-2.5 text-xs font-semibold`}
                title={isEnBible ? 'Back to Home' : 'Kembali ke Beranda'}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span className="hidden xl:inline">{isEnBible ? 'Home' : 'Beranda'}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenLibrary}
                className="shrink-0 rounded-xl text-xs font-semibold text-slate-500 hover:text-amber-700 transition hidden xl:flex items-center gap-1.5 h-8 px-2.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>{isEnBible ? 'Book Catalog' : 'Katalog Buku'}</span>
              </Button>

              <div className="h-5 w-px bg-slate-300 dark:bg-zinc-700 mx-0.5 shrink-0 hidden sm:block" />

              {/* Quick Picker: Kitab, Pasal, Ayat & Info Kitab */}
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
                  className={`rounded-xl font-bold text-xs border ${themeStyles.border} bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 transition h-8 px-2.5 min-w-0 shrink-0`}
                  title={isEnBible ? 'Select Book' : 'Pilih Kitab'}
                >
                  <span className="truncate max-w-[95px] lg:max-w-[140px] xl:max-w-[180px]">📖 {currentBookInfo.name}</span>
                  <Compass className="w-3.5 h-3.5 ml-1 opacity-70 shrink-0" />
                </Button>

                {/* Unified Chapter Navigator: [ ◂ ] Ch. 1/28 [ ▸ ] */}
                <div className="flex items-center border rounded-xl overflow-hidden shadow-xs border-slate-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-800/60 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevChapter}
                    className={`h-8 w-7 rounded-none ${themeStyles.text} hover:bg-black/5 dark:hover:bg-white/5 transition p-0 flex items-center justify-center`}
                    title={isEnBible ? 'Previous Chapter (ArrowLeft)' : 'Pasal Sebelumnya (ArrowLeft)'}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <button
                    type="button"
                    onClick={() => setIsChapterPickerOpen(true)}
                    className={`px-2 h-8 text-xs font-bold font-mono hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center gap-1 cursor-pointer ${themeStyles.text}`}
                    title={isEnBible ? 'Select Chapter' : 'Pilih Pasal'}
                  >
                    <span>{isEnBible ? 'Ch' : 'Ps'} {selectedChapter}/{totalChapters}</span>
                    <List className="w-3 h-3 opacity-60 shrink-0" />
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextChapter}
                    className={`h-8 w-7 rounded-none ${themeStyles.text} hover:bg-black/5 dark:hover:bg-white/5 transition p-0 flex items-center justify-center`}
                    title={isEnBible ? 'Next Chapter (ArrowRight)' : 'Pasal Berikutnya (ArrowRight)'}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsVersePickerOpen(true)}
                  className={`shrink-0 rounded-xl font-bold text-xs border ${themeStyles.border} ${themeStyles.text} hover:opacity-80 transition h-8 px-2 hidden lg:flex items-center`}
                  title={isEnBible ? 'Jump to Verse Number' : 'Loncat ke Nomor Ayat'}
                >
                  <Hash className="w-3.5 h-3.5 mr-0.5 text-amber-600 dark:text-amber-400" />
                  <span className="hidden xl:inline">{isEnBible ? 'Verse' : 'Ayat'}</span>
                </Button>

                {bookData?.intro && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsIntroModalOpen(true)}
                    className={`h-8 w-8 rounded-xl ${themeStyles.text} hover:bg-black/5 dark:hover:bg-white/5 transition shrink-0 hidden xl:flex`}
                    title={isEnBible ? 'Book Introduction & Background' : 'Pengantar & Pokok Kitab'}
                  >
                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </Button>
                )}
              </div>
            </div>

            {/* Kanan: Navigasi Cepat, Search, Mode Paralel & Settings */}
            <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
              {/* Global Search Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsGlobalSearchOpen(true)}
                className={`h-8 w-8 rounded-xl border ${themeStyles.border} ${themeStyles.text} hover:opacity-80 transition shadow-xs`}
                title={isEnBible ? 'Search 66 Books (Ctrl+K)' : 'Pencarian Firman 66 Kitab (Ctrl+K)'}
              >
                <Search className="w-4 h-4" />
              </Button>

              {/* Bookmarks Modal Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsBookmarksModalOpen(true)}
                className={`h-8 w-8 rounded-xl relative border ${themeStyles.border} ${themeStyles.text} hover:opacity-80 transition shadow-xs`}
                title={isEnBible ? 'Saved Verses & Bookmarks' : 'Ayat Tersimpan & Bookmark'}
              >
                <Bookmark className="w-4 h-4" />
                {bookmarks.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                    {bookmarks.length}
                  </span>
                )}
              </Button>

              {/* Personal Notes Modal Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsNotesListModalOpen(true)}
                className={`h-8 w-8 rounded-xl relative border ${themeStyles.border} ${themeStyles.text} hover:opacity-80 transition shadow-xs`}
                title={isEnBible ? 'My Reflection Notes' : 'Catatan Renungan Pribadi'}
              >
                <BookMarked className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                {Object.keys(personalNotes).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-600 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                    {Object.keys(personalNotes).length}
                  </span>
                )}
              </Button>

              {/* Language & Parallel View Selector */}
              <div className={`flex items-center p-0.5 rounded-xl border ${themeStyles.border} bg-black/5 dark:bg-white/5 shrink-0 max-w-[210px] sm:max-w-[280px] xl:max-w-none overflow-x-auto no-scrollbar`}>
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
                  title="Alkitab Versi Pemulihan (AVP)"
                >
                  AVP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('single');
                    setBibleLang('tb');
                    localStorage.setItem('bible_language', 'tb');
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    viewMode === 'single' && bibleLang === 'tb'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : `${themeStyles.text} opacity-60 hover:opacity-100`
                  }`}
                  title="Alkitab Terjemahan Baru LAI (TB)"
                >
                  TB
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
                  title="Holy Bible Recovery Version (RCV)"
                >
                  RCV
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('single');
                    setBibleLang('kjv');
                    localStorage.setItem('bible_language', 'kjv');
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    viewMode === 'single' && bibleLang === 'kjv'
                      ? 'bg-indigo-800 text-white shadow-xs'
                      : `${themeStyles.text} opacity-60 hover:opacity-100`
                  }`}
                  title="King James Version (KJV 1769)"
                >
                  KJV
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('single');
                    setBibleLang('asv');
                    localStorage.setItem('bible_language', 'asv');
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    viewMode === 'single' && bibleLang === 'asv'
                      ? 'bg-teal-800 text-white shadow-xs'
                      : `${themeStyles.text} opacity-60 hover:opacity-100`
                  }`}
                  title="American Standard Version (ASV 1901)"
                >
                  ASV
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('single');
                    setBibleLang('net');
                    localStorage.setItem('bible_language', 'net');
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    viewMode === 'single' && bibleLang === 'net'
                      ? 'bg-sky-800 text-white shadow-xs'
                      : `${themeStyles.text} opacity-60 hover:opacity-100`
                  }`}
                  title="New English Translation (NET Bible)"
                >
                  NET
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('single');
                    setBibleLang('scofield');
                    localStorage.setItem('bible_language', 'scofield');
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    viewMode === 'single' && bibleLang === 'scofield'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : `${themeStyles.text} opacity-60 hover:opacity-100`
                  }`}
                  title="The Scofield Reference Bible 1917"
                >
                  Scofield
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode(prev => prev === 'parallel' ? 'single' : 'parallel')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                    viewMode === 'parallel'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : `${themeStyles.text} opacity-60 hover:opacity-100`
                  }`}
                  title={isEnBible ? 'Parallel View (ID & EN)' : 'Mode Berdampingan (ID & EN Paralel)'}
                >
                  <Columns className="w-3 h-3" />
                  <span className="hidden xl:inline">{isEnBible ? 'Parallel' : 'Paralel'}</span>
                </button>
              </div>

              {/* Fullscreen / Distraction-Free Toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsDistractionFree(true)}
                className={`shrink-0 h-8 w-8 rounded-xl border ${themeStyles.border} ${themeStyles.text} hover:opacity-80 transition shadow-xs hidden xl:flex`}
                title={isEnBible ? 'Fullscreen (Focus Mode)' : 'Layar Penuh (Fokus Membaca)'}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>

              {/* Settings Popover */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`shrink-0 h-8 w-8 rounded-xl border ${themeStyles.border} ${themeStyles.text} hover:opacity-80 transition shadow-xs`}
                title={isEnBible ? 'Display Settings' : 'Pengaturan Tampilan'}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* MOBILE HEADER (< MD): 2 Baris Responsif, Rapi & Anti-Tumpuk */}
          {/* ========================================================= */}
          <div className="flex md:hidden flex-col px-2.5 py-1.5 gap-1.5">
            {/* Baris 1: Tombol Beranda, Kitab + Pasal, Prev/Next, Pengaturan */}
            <div className="flex items-center justify-between gap-1 w-full">
              <div className="flex items-center gap-1.5 min-w-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBackToHome}
                  className={`shrink-0 rounded-xl border ${themeStyles.border} ${themeStyles.text} h-8 w-8 p-0 flex items-center justify-center`}
                  title={isEnBible ? 'Back' : 'Kembali'}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>

                {/* Combined / Compact Book & Chapter Selector */}
                <div className="flex items-center gap-1 min-w-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (currentBookInfo?.testament) {
                        setBookPickerTab(currentBookInfo.testament);
                      }
                      setIsBookPickerOpen(true);
                    }}
                    className={`rounded-xl font-bold text-xs border ${themeStyles.border} bg-amber-500/15 text-amber-800 dark:text-amber-300 h-8 px-2 min-w-0`}
                  >
                    <span className="truncate max-w-[85px] sm:max-w-[110px]">📖 {currentBookInfo.name}</span>
                    <Compass className="w-3 h-3 ml-1 opacity-70 shrink-0" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsChapterPickerOpen(true)}
                    className={`shrink-0 rounded-xl font-bold text-xs border ${themeStyles.border} ${themeStyles.text} h-8 px-2`}
                  >
                    <span>{isEnBible ? 'Ch' : 'Ps'} {selectedChapter}</span>
                    <List className="w-3 h-3 ml-1 opacity-70" />
                  </Button>
                </div>
              </div>

              {/* Prev / Next & Settings */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="flex items-center border rounded-xl overflow-hidden border-slate-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-800/60">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevChapter}
                    className={`h-8 w-7 rounded-none ${themeStyles.text} p-0 flex items-center justify-center`}
                    title="Pasal Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextChapter}
                    className={`h-8 w-7 rounded-none ${themeStyles.text} p-0 flex items-center justify-center`}
                    title="Pasal Berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`shrink-0 h-8 w-8 rounded-xl border ${themeStyles.border} ${themeStyles.text} p-0 flex items-center justify-center`}
                  title="Pengaturan Tampilan"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Baris 2: Versi Alkitab (ID/EN/Scofield) & Toolbar Cepat (Scrollable Halus Tanpa Wrap) */}
            <div className="flex items-center justify-between gap-1.5 w-full overflow-x-auto no-scrollbar py-0.5 flex-nowrap">
              {/* Language Switcher */}
              <div className={`flex items-center p-0.5 rounded-xl border ${themeStyles.border} bg-black/5 dark:bg-white/5 shrink-0 overflow-x-auto max-w-[280px] xs:max-w-xs sm:max-w-none scrollbar-none`}>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('single');
                    setBibleLang('id');
                    localStorage.setItem('bible_language', 'id');
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    viewMode === 'single' && bibleLang === 'id'
                      ? 'bg-[#3B4B34] text-white shadow-xs'
                      : `${themeStyles.text} opacity-60 hover:opacity-100`
                  }`}
                  title="Alkitab Versi Pemulihan (AVP)"
                >
                  AVP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('single');
                    setBibleLang('tb');
                    localStorage.setItem('bible_language', 'tb');
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    viewMode === 'single' && bibleLang === 'tb'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : `${themeStyles.text} opacity-60 hover:opacity-100`
                  }`}
                  title="Alkitab Terjemahan Baru LAI (TB)"
                >
                  TB
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('single');
                    setBibleLang('en');
                    localStorage.setItem('bible_language', 'en');
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    viewMode === 'single' && bibleLang === 'en'
                      ? 'bg-[#3B4B34] text-white shadow-xs'
                      : `${themeStyles.text} opacity-60 hover:opacity-100`
                  }`}
                  title="Holy Bible Recovery Version (RCV)"
                >
                  RCV
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('single');
                    setBibleLang('kjv');
                    localStorage.setItem('bible_language', 'kjv');
                  }}
                  className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    viewMode === 'single' && bibleLang === 'kjv'
                      ? 'bg-indigo-800 text-white shadow-xs'
                      : `${themeStyles.text} opacity-60 hover:opacity-100`
                  }`}
                  title="King James Version (KJV 1769)"
                >
                  KJV
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('single');
                    setBibleLang('asv');
                    localStorage.setItem('bible_language', 'asv');
                  }}
                  className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    viewMode === 'single' && bibleLang === 'asv'
                      ? 'bg-teal-800 text-white shadow-xs'
                      : `${themeStyles.text} opacity-60 hover:opacity-100`
                  }`}
                  title="American Standard Version (ASV 1901)"
                >
                  ASV
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('single');
                    setBibleLang('net');
                    localStorage.setItem('bible_language', 'net');
                  }}
                  className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    viewMode === 'single' && bibleLang === 'net'
                      ? 'bg-sky-800 text-white shadow-xs'
                      : `${themeStyles.text} opacity-60 hover:opacity-100`
                  }`}
                  title="New English Translation (NET Bible)"
                >
                  NET
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('single');
                    setBibleLang('scofield');
                    localStorage.setItem('bible_language', 'scofield');
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    viewMode === 'single' && bibleLang === 'scofield'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : `${themeStyles.text} opacity-60 hover:opacity-100`
                  }`}
                >
                  Scofield
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode(prev => prev === 'parallel' ? 'single' : 'parallel')}
                  className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-0.5 ${
                    viewMode === 'parallel'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : `${themeStyles.text} opacity-60 hover:opacity-100`
                  }`}
                  title="Paralel"
                >
                  <Columns className="w-2.5 h-2.5" />
                  <span>Paralel</span>
                </button>
              </div>

              {/* Quick Action Tools */}
              <div className="flex items-center gap-1 shrink-0">
                {/* 22 Truth Charts */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTruthChartsOpen(true)}
                  className="shrink-0 rounded-xl font-bold text-[10px] border border-amber-400 bg-amber-50/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 h-7 px-2 flex items-center gap-1 shadow-2xs hover:bg-amber-100 dark:hover:bg-amber-900/50 cursor-pointer"
                  title="22 Bagan Kebenaran Ilahi (LSM Truth Charts)"
                >
                  <Compass className="w-3 h-3 text-amber-700 dark:text-amber-300" />
                  <span>Bagan</span>
                </Button>

                {/* Verse Jump */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsVersePickerOpen(true)}
                  className={`shrink-0 rounded-xl font-bold text-[10px] border ${themeStyles.border} ${themeStyles.text} h-7 px-2 flex items-center gap-1`}
                  title="Loncat Ayat"
                >
                  <Hash className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Ayat</span>
                </Button>

                {/* Global Search */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsGlobalSearchOpen(true)}
                  className={`h-7 w-7 rounded-xl border ${themeStyles.border} ${themeStyles.text} shrink-0 flex items-center justify-center`}
                  title="Cari Firman"
                >
                  <Search className="w-3.5 h-3.5" />
                </Button>

                {/* Bookmarks */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsBookmarksModalOpen(true)}
                  className={`h-7 w-7 rounded-xl relative border ${themeStyles.border} ${themeStyles.text} shrink-0 flex items-center justify-center`}
                  title="Bookmark"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {bookmarks.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-white font-mono text-[8px] font-bold flex items-center justify-center">
                      {bookmarks.length}
                    </span>
                  )}
                </Button>

                {/* Notes */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsNotesListModalOpen(true)}
                  className={`h-7 w-7 rounded-xl relative border ${themeStyles.border} ${themeStyles.text} shrink-0 flex items-center justify-center`}
                  title="Catatan"
                >
                  <BookMarked className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  {Object.keys(personalNotes).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-600 text-white font-mono text-[8px] font-bold flex items-center justify-center">
                      {Object.keys(personalNotes).length}
                    </span>
                  )}
                </Button>

                {/* Intro Info */}
                {bookData?.intro && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsIntroModalOpen(true)}
                    className={`h-7 w-7 rounded-xl ${themeStyles.text} hover:bg-black/5 dark:hover:bg-white/5 shrink-0 flex items-center justify-center`}
                    title="Pengantar Kitab"
                  >
                    <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  </Button>
                )}
              </div>
            </div>
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
            title={isEnBible ? 'Previous Chapter' : 'Pasal Sebelumnya'}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextChapter}
            className="p-1 hover:bg-white/20 rounded-lg transition"
            title={isEnBible ? 'Next Chapter' : 'Pasal Berikutnya'}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-white/20 my-auto" />
          <button
            onClick={() => setIsDistractionFree(false)}
            className="p-1 hover:bg-white/20 rounded-lg transition"
            title={isEnBible ? 'Exit Fullscreen (Esc)' : 'Keluar Layar Penuh (Esc)'}
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
              <h4 className="font-bold text-slate-800 dark:text-zinc-100 text-sm">
                {isEnBible ? 'Reader Settings' : 'Tampilan Alkitab'}
              </h4>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tema */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {isEnBible ? 'Background Theme' : 'Warna Latar'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                    theme === 'light' ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-2xs' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" /> {isEnBible ? 'Light' : 'Terang'}
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
                  <Moon className="w-4 h-4 text-amber-400" /> {isEnBible ? 'Dark' : 'Gelap'}
                </button>
              </div>
            </div>

            {/* Ukuran Font */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {isEnBible ? 'Font Size' : 'Ukuran Huruf'}
                </span>
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
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {isEnBible ? 'Font Family' : 'Gaya Font'}
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
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
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {isEnBible ? 'Recovery Features' : 'Fitur Pemulihan'}
              </label>
              <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                <span className="text-slate-700 dark:text-zinc-300">
                  {isEnBible ? 'Footnotes' : 'Catatan Kaki (Footnotes)'}
                </span>
                <input
                  type="checkbox"
                  checked={showFootnoteAnchors}
                  onChange={(e) => setShowFootnoteAnchors(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
              </label>
              <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                <span className="text-slate-700 dark:text-zinc-300">
                  {isEnBible ? 'Spiritual Outlines' : 'Garis Besar Rohani (Outlines)'}
                </span>
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
          
          {/* Header Judul Kitab & Pasal (Artistic Biblical Typography) */}
          <div className="text-center space-y-3 pb-6 border-b border-amber-500/20 dark:border-zinc-800">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-400/10 text-amber-900 dark:text-amber-300 border border-amber-500/25 dark:border-amber-400/20 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80"></span>
              <span className="text-[11px] font-bold tracking-[0.22em] uppercase font-serif">
                {isEnBible
                  ? (currentBookInfo.testament === 'PL' ? 'Old Testament' : 'New Testament')
                  : (currentBookInfo.testament === 'PL' ? 'Perjanjian Lama' : 'Perjanjian Baru')}
                {viewMode === 'parallel' && (isEnBible ? ' • Parallel Mode' : ' • Mode Paralel')}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80"></span>
            </div>

            <h1 
              className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide ${themeStyles.text} flex items-baseline justify-center gap-3 drop-shadow-2xs`}
              style={{ fontFamily: "'Cinzel', 'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
            >
              <span className="tracking-wide">{currentBookInfo.name}</span>
              <span className="text-amber-600 dark:text-amber-400 font-normal italic font-serif text-3xl sm:text-4xl md:text-5xl">
                {selectedChapter}
              </span>
            </h1>

            {/* Classical Artistic Divider */}
            <div className="flex items-center justify-center gap-3 pt-0.5 text-amber-600/40 dark:text-amber-400/30 select-none">
              <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-amber-500/40"></div>
              <span className="text-xs">✦</span>
              <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-amber-500/40"></div>
            </div>
          </div>

          {/* Scofield 1917 Specific Toolbar & View Switcher */}
          {bibleLang === 'scofield' && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 sm:p-3.5 bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/80 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-950 dark:text-amber-200 font-serif">
                  Tata Letak:
                </span>
                <div className="flex items-center p-0.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-800">
                  <button
                    onClick={() => {
                      setScofieldLayout('classic');
                      localStorage.setItem('bible_scofield_layout', 'classic');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold font-serif transition ${
                      scofieldLayout === 'classic'
                        ? 'bg-amber-800 text-white shadow-xs'
                        : 'text-stone-700 dark:text-zinc-300 hover:text-amber-800'
                    }`}
                  >
                    📜 Cetak 1917
                  </button>
                  <button
                    onClick={() => {
                      setScofieldLayout('modern');
                      localStorage.setItem('bible_scofield_layout', 'modern');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold font-serif transition ${
                      scofieldLayout === 'modern'
                        ? 'bg-amber-800 text-white shadow-xs'
                        : 'text-stone-700 dark:text-zinc-300 hover:text-amber-800'
                    }`}
                  >
                    📱 Modern
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsScofieldIndexOpen(true)}
                  className="h-8 rounded-xl bg-white dark:bg-zinc-800 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-100"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>Indeks Topikal</span>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-amber-100 text-amber-900 font-mono">541</Badge>
                </Button>
              </div>
            </div>
          )}

          {/* If Scofield Classic View is selected */}
          {bibleLang === 'scofield' && scofieldLayout === 'classic' ? (
            <BibleScofieldClassicView
              bookData={bookData}
              selectedChapter={selectedChapter}
              fontSize={fontSize}
              showOutlines={showOutlines}
              onOpenFootnote={(vNum, nIdx, fn) => handleOpenFootnote(vNum, nIdx, fn, 'scofield')}
              onOpenIndex={() => setIsScofieldIndexOpen(true)}
              onOpenTruthCharts={() => setIsTruthChartsOpen(true)}
              onOpenBookIntro={(tab) => {
                setIntroModalInitialTab(tab || 'book');
                setIsIntroModalOpen(true);
              }}
              onPrevChapter={handlePrevChapter}
              onNextChapter={handleNextChapter}
              canPrev={selectedChapter > 1 || books.findIndex(b => b.id === selectedBookId) > 0}
              canNext={selectedChapter < totalChapters || books.findIndex(b => b.id === selectedBookId) < books.length - 1}
            />
          ) : (
            <>

          {/* New Testament Entrance Banner (The Four Gospels & Malachi to Matthew) */}
          {selectedBookId === 'matius' && selectedChapter === 1 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/25 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-amber-950 dark:text-amber-200">
                      {isEnBible ? 'New Testament Treatises' : 'Pengantar Perjanjian Baru'}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300">
                      Scofield 1917
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-tight">
                    {isEnBible
                      ? 'The Four Gospels & From Malachi to Matthew (400 Silent Years)'
                      : 'Pengantar 4 Injil & Masa 400 Tahun Keheningan Profetik (Maleakhi ke Matius)'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => {
                    setIntroModalInitialTab('four_gospels');
                    setIsIntroModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer transition"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>The Four Gospels</span>
                </button>
                <button
                  onClick={() => {
                    setIntroModalInitialTab('malachi_to_matthew');
                    setIsIntroModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 text-amber-900 dark:text-amber-200 text-xs font-semibold hover:bg-amber-50 dark:hover:bg-zinc-700 transition cursor-pointer"
                >
                  Maleakhi ke Matius →
                </button>
              </div>
            </div>
          )}

          {/* Pengantar Lengkap Kitab Scofield (Modern Mode Pada Pasal 1) */}
          {selectedChapter === 1 && bookData?.intro && bibleLang === 'scofield' && (
            <div className="rounded-2xl border border-amber-300 dark:border-amber-700/80 p-5 sm:p-6 bg-amber-50/60 dark:bg-amber-950/30 text-stone-900 dark:text-zinc-100 font-serif space-y-3.5 shadow-xs">
              <div className="border-b border-amber-200 dark:border-zinc-800 pb-2.5 text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-amber-800 dark:text-amber-400 block mb-0.5">
                  The Scofield Reference Bible (1917)
                </span>
                <h3 className="font-bold text-xl sm:text-2xl tracking-wide">
                  {bookData.name} — Book Introduction
                </h3>
              </div>
              <div className="space-y-3 text-sm sm:text-base leading-relaxed text-justify">
                {(() => {
                  const htmlStr = bookData.intro.html || '';
                  if (htmlStr) {
                    const cleaned = htmlStr.replace(/<p[^>]*>\s*Book Introduction[^<]*<\/p>/gi, '');
                    const rawParas = cleaned.split(/<\/p>/i);
                    const list = [];
                    for (let p of rawParas) {
                      p = p.replace(/<p[^>]*>/gi, '').trim();
                      if (!p) continue;
                      p = p.replace(/<ref>(.*?)<\/ref>/gi, '<span class="font-mono text-amber-900 dark:text-amber-300 font-bold">$1</span>');
                      list.push(p);
                    }
                    if (list.length > 0) {
                      return list.map((p, idx) => (
                        <p key={idx} dangerouslySetInnerHTML={{ __html: p }} />
                      ));
                    }
                  }
                  return <p>{bookData.intro.text}</p>;
                })()}
              </div>
            </div>
          )}

          {/* Pengantar & Pokok Kitab Lengkap (Versi Pemulihan Pada Pasal 1) */}
          {selectedChapter === 1 && bookData?.intro && bibleLang !== 'scofield' && (
            <div className={`rounded-2xl border p-4 sm:p-6 transition-all shadow-xs ${themeStyles.outlineBadge}`}>
              <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-black/10 dark:border-white/10">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  {isEnBible ? `Introduction to ${bookData.name}` : `Pengantar Kitab ${bookData.name} (Versi Pemulihan)`}
                </h3>
              </div>

              {(bookData.intro.Pokok || bookData.intro.Subject) && (
                <div className="mb-3.5 text-xs sm:text-sm font-semibold italic border-l-2 border-amber-500 pl-3 text-amber-950 dark:text-amber-200">
                  <span className="font-bold not-italic text-amber-700 dark:text-amber-300">
                    {bookData.intro.Subject ? 'Subject: ' : 'Pokok: '}
                  </span>
                  {bookData.intro.Subject || bookData.intro.Pokok}
                </div>
              )}

              <div className="space-y-2.5 text-xs sm:text-sm">
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
            </div>
          )}

          {/* Garis Besar Pasal Utama */}
          {(() => {
            const chapterOutlines = getOutlinesList(chapterData?.outlines);
            const hasVerseOutlines = filteredVerses.some(v => getOutlinesList(v.outlines).length > 0);
            if (!showOutlines || chapterOutlines.length === 0 || hasVerseOutlines) return null;

            return (
              <div className="space-y-2 py-3 text-center px-4">
                {chapterOutlines.map((otl, idx) => (
                  <h4 
                    key={idx}
                    className={`text-xs sm:text-sm md:text-base font-bold tracking-wide leading-relaxed ${themeStyles.outlineText}`}
                  >
                    {getOutlineText(otl)}
                  </h4>
                ))}
              </div>
            );
          })()}

          {/* Bar Kontrol Mode Paralel (Pilih Terjemahan Kiri & Kanan) */}
          {viewMode === 'parallel' && (
            <div className="mb-4 p-2.5 sm:p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-xs flex flex-wrap items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2 flex-1 min-w-[130px]">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 tracking-wider">Kiri:</span>
                <select
                  value={parallelLeftLang}
                  onChange={(e) => {
                    const val = e.target.value;
                    setParallelLeftLang(val);
                    localStorage.setItem('bible_parallel_left', val);
                  }}
                  className="px-2.5 py-1 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 shadow-2xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  {PARALLEL_TRANSLATIONS.map(t => (
                    <option key={t.id} value={t.id}>{t.code} - {t.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  const temp = parallelLeftLang;
                  setParallelLeftLang(parallelRightLang);
                  setParallelRightLang(temp);
                  localStorage.setItem('bible_parallel_left', parallelRightLang);
                  localStorage.setItem('bible_parallel_right', temp);
                }}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-amber-500/15 text-slate-600 dark:text-zinc-300 transition shadow-2xs cursor-pointer active:scale-95 flex items-center gap-1 text-[11px] font-bold"
                title="Tukar Posisi Terjemahan"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">Tukar</span>
              </button>

              <div className="flex items-center gap-2 flex-1 min-w-[130px] justify-end">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 tracking-wider">Kanan:</span>
                <select
                  value={parallelRightLang}
                  onChange={(e) => {
                    const val = e.target.value;
                    setParallelRightLang(val);
                    localStorage.setItem('bible_parallel_right', val);
                  }}
                  className="px-2.5 py-1 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 shadow-2xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  {PARALLEL_TRANSLATIONS.map(t => (
                    <option key={t.id} value={t.id}>{t.code} - {t.name}</option>
                  ))}
                </select>
              </div>
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
                const verseOutlines = getOutlinesList(item.outlines);

                return (
                  <div key={`${bibleLang}-${selectedBookId}-${selectedChapter}-${item.verse}-${idx}`} className="relative">
                    {/* Garis Besar Rohani di atas ayat */}
                    {showOutlines && verseOutlines.length > 0 && (
                      <div className="pt-6 pb-2.5 space-y-1.5 text-center px-4">
                        {verseOutlines.map((otl, oIdx) => (
                          <h4
                            key={oIdx}
                            className={`text-xs sm:text-sm md:text-base font-bold tracking-wide leading-relaxed ${themeStyles.outlineText}`}
                          >
                            {getOutlineText(otl)}
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
                      {/* Mode Paralel (Side-by-Side Kiri & Kanan Dinamis) */}
                      {viewMode === 'parallel' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                          {/* Kolom Kiri */}
                          <div className="flex items-start gap-2.5">
                            <span className={`shrink-0 w-7 h-7 rounded-lg font-mono text-[10px] sm:text-xs font-extrabold border flex items-center justify-center select-none shadow-2xs ${themeStyles.verseNum}`}>
                              {item.verse}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block mb-0.5 font-mono">
                                {getTranslationLabel(parallelLeftLang)}
                              </span>
                              <p 
                                className={`leading-relaxed ${themeStyles.text}`}
                                style={{ fontFamily: activeFontFamily, fontSize: `${fontSize}px`, lineHeight: 1.85 }}
                              >
                                {renderVerseText(item, parallelLeftLang)}
                              </p>
                            </div>
                          </div>

                          {/* Kolom Kanan */}
                          <div className="border-t md:border-t-0 md:border-l border-slate-200 dark:border-zinc-800 pt-2 md:pt-0 md:pl-4 flex items-start gap-2.5">
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block mb-0.5 font-mono">
                                {getTranslationLabel(parallelRightLang)}
                              </span>
                              <p 
                                className={`leading-relaxed ${themeStyles.text}`}
                                style={{ fontFamily: activeFontFamily, fontSize: `${fontSize}px`, lineHeight: 1.85 }}
                              >
                                {enItem ? renderVerseText(enItem, parallelRightLang) : '—'}
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

                      {/* Excerpt Catatan Pribadi (Jika Ada) */}
                      {personalNotes[`${selectedBookId}-${selectedChapter}-${item.verse}`] && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setPersonalNoteVerse(item);
                          }}
                          className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2 cursor-pointer hover:bg-amber-500/15 transition shadow-2xs group"
                        >
                          <BookMarked className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-0.5">
                              {isEnBible ? 'My Note' : 'Catatan Pribadi'}:
                            </span>
                            <p className="line-clamp-2 leading-relaxed">
                              {personalNotes[`${selectedBookId}-${selectedChapter}-${item.verse}`].note}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Floating Micro-Toolbar for Verse (Highlights, Note, Compare, Share, Bookmark, Copy) */}
                      {activeVerseMenu === item.verse && (
                        <div 
                          className="absolute -top-11 left-2 sm:left-4 z-30 flex items-center gap-1 sm:gap-1.5 p-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full shadow-2xl animate-fade-in"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Color Palette */}
                          <button
                            onClick={() => handleSetHighlight(item.verse, 'yellow')}
                            className="w-5 h-5 rounded-full bg-amber-400 hover:scale-110 transition border border-amber-500/50"
                            title={isEnBible ? 'Yellow Highlight' : 'Stabilo Kuning'}
                          />
                          <button
                            onClick={() => handleSetHighlight(item.verse, 'green')}
                            className="w-5 h-5 rounded-full bg-emerald-400 hover:scale-110 transition border border-emerald-500/50"
                            title={isEnBible ? 'Green Highlight' : 'Stabilo Hijau'}
                          />
                          <button
                            onClick={() => handleSetHighlight(item.verse, 'blue')}
                            className="w-5 h-5 rounded-full bg-sky-400 hover:scale-110 transition border border-sky-500/50"
                            title={isEnBible ? 'Blue Highlight' : 'Stabilo Biru'}
                          />
                          <button
                            onClick={() => handleSetHighlight(item.verse, 'rose')}
                            className="w-5 h-5 rounded-full bg-rose-400 hover:scale-110 transition border border-rose-500/50"
                            title={isEnBible ? 'Pink Highlight' : 'Stabilo Merah Muda'}
                          />
                          <button
                            onClick={() => handleSetHighlight(item.verse, null)}
                            className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-700 hover:scale-110 transition flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-zinc-300"
                            title={isEnBible ? 'Clear Highlight' : 'Hapus Stabilo'}
                          >
                            ✕
                          </button>

                          <div className="w-px h-4 bg-slate-200 dark:bg-zinc-700 mx-0.5" />

                          {/* Personal Note Button (Nomor 4) */}
                          <button
                            onClick={() => {
                              setPersonalNoteVerse(item);
                              setActiveVerseMenu(null);
                            }}
                            className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700 transition ${
                              personalNotes[`${selectedBookId}-${selectedChapter}-${item.verse}`]
                                ? 'text-amber-600 dark:text-amber-400 font-bold'
                                : 'text-slate-500 dark:text-zinc-400 hover:text-amber-600'
                            }`}
                            title={isEnBible ? 'Personal Reflection Note' : 'Catatan Renungan Pribadi'}
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* Compare ID, TB, EN, KJV, ASV, NET & Scofield Translation (Nomor 6) */}
                          <button
                            onClick={async () => {
                              const vNum = item.verse;
                              let idV = null;
                              let tbV = null;
                              let enV = enItem || null;
                              let kjvV = null;
                              let asvV = null;
                              let netV = null;
                              let scofieldV = null;

                              if (bibleLang === 'id') idV = item;
                              else if (bibleLang === 'tb') tbV = item;
                              else if (bibleLang === 'en') enV = item;
                              else if (bibleLang === 'kjv') kjvV = item;
                              else if (bibleLang === 'asv') asvV = item;
                              else if (bibleLang === 'net') netV = item;
                              else if (bibleLang === 'scofield') scofieldV = item;

                              const fetches = [];
                              if (!idV) {
                                fetches.push(
                                  fetch(`/bible/${selectedBookId}.json?v=${Date.now()}`)
                                    .then(r => r.ok ? r.json() : null)
                                    .then(d => { idV = d?.chapters?.[selectedChapter]?.verses?.find(v => v.verse === vNum); })
                                    .catch(() => {})
                                );
                              }
                              if (!tbV) {
                                fetches.push(
                                  fetch(`/bible/tb/${selectedBookId}.json?v=${Date.now()}`)
                                    .then(r => r.ok ? r.json() : null)
                                    .then(d => { tbV = d?.chapters?.[selectedChapter]?.verses?.find(v => v.verse === vNum); })
                                    .catch(() => {})
                                );
                              }
                              if (!enV) {
                                fetches.push(
                                  fetch(`/bible/en/${selectedBookId}.json?v=${Date.now()}`)
                                    .then(r => r.ok ? r.json() : null)
                                    .then(d => { enV = d?.chapters?.[selectedChapter]?.verses?.find(v => v.verse === vNum); })
                                    .catch(() => {})
                                );
                              }
                              if (!kjvV) {
                                fetches.push(
                                  fetch(`/bible/kjv/${selectedBookId}.json?v=${Date.now()}`)
                                    .then(r => r.ok ? r.json() : null)
                                    .then(d => { kjvV = d?.chapters?.[selectedChapter]?.verses?.find(v => v.verse === vNum); })
                                    .catch(() => {})
                                );
                              }
                              if (!asvV) {
                                fetches.push(
                                  fetch(`/bible/asv/${selectedBookId}.json?v=${Date.now()}`)
                                    .then(r => r.ok ? r.json() : null)
                                    .then(d => { asvV = d?.chapters?.[selectedChapter]?.verses?.find(v => v.verse === vNum); })
                                    .catch(() => {})
                                );
                              }
                              if (!netV) {
                                fetches.push(
                                  fetch(`/bible/net/${selectedBookId}.json?v=${Date.now()}`)
                                    .then(r => r.ok ? r.json() : null)
                                    .then(d => { netV = d?.chapters?.[selectedChapter]?.verses?.find(v => v.verse === vNum); })
                                    .catch(() => {})
                                );
                              }
                              if (!scofieldV) {
                                fetches.push(
                                  fetch(`/bible/scofield/${selectedBookId}.json?v=${Date.now()}`)
                                    .then(r => r.ok ? r.json() : null)
                                    .then(d => { scofieldV = d?.chapters?.[selectedChapter]?.verses?.find(v => v.verse === vNum); })
                                    .catch(() => {})
                                );
                              }

                              if (fetches.length > 0) {
                                await Promise.all(fetches);
                              }

                              setCompareVerseData({
                                verseNum: vNum,
                                idVerse: idV,
                                tbVerse: tbV,
                                enVerse: enV,
                                kjvVerse: kjvV,
                                asvVerse: asvV,
                                netVerse: netV,
                                scofieldVerse: scofieldV
                              });
                              setActiveVerseMenu(null);
                            }}
                            className="p-1.5 rounded-full text-slate-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-zinc-700 transition"
                            title={isEnBible ? 'Compare 7 Bible Translations' : 'Bandingkan Terjemahan (7 Versi)'}
                          >
                            <Columns className="w-3.5 h-3.5" />
                          </button>

                          {/* Share Verse Card Generator (Nomor 3) */}
                          <button
                            onClick={() => {
                              setCardModalVerse({
                                bookId: selectedBookId,
                                bookName: currentBookInfo.name,
                                chapter: selectedChapter,
                                verse: item.verse,
                                text: item.text
                              });
                              setActiveVerseMenu(null);
                            }}
                            className="p-1.5 rounded-full text-slate-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-zinc-700 transition"
                            title={isEnBible ? 'Share Verse Card' : 'Buat Kartu Ayat Estetik'}
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="w-px h-4 bg-slate-200 dark:bg-zinc-700 mx-0.5" />

                          {/* Bookmark Toggle */}
                          <button
                            onClick={() => handleToggleBookmark(item.verse, item.text)}
                            className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700 transition ${
                              isBookmarked ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'
                            }`}
                            title={isBookmarked ? (isEnBible ? 'Remove Bookmark' : 'Hapus Bookmark') : (isEnBible ? 'Bookmark Verse' : 'Tandai Ayat (Bookmark)')}
                          >
                            <Bookmark className="w-3.5 h-3.5 fill-current" />
                          </button>

                          {/* Copy Verse */}
                          <button
                            onClick={() => handleCopyVerse(item.verse, item.text)}
                            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 transition"
                            title={isEnBible ? 'Copy Verse' : 'Salin Ayat'}
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
          {/* Malachi to Matthew Transition Card at end of Malachi */}
          {selectedBookId === 'maleakhi' && selectedChapter === 4 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-300 dark:border-amber-700/60 space-y-2.5 my-4 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-200">
                    {isEnBible ? 'End of the Old Testament' : 'Akhir Perjanjian Lama'}
                  </h4>
                  <span className="text-[11px] text-amber-800/80 dark:text-amber-400 font-mono">
                    From Malachi to Matthew • Masa 400 Tahun Keheningan Profetik
                  </span>
                </div>
              </div>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-serif">
                {isEnBible
                  ? 'Before reading Matthew, explore the 400 silent years between the Old and New Testaments as explained in the authentic 1917 Scofield Reference Bible.'
                  : 'Sebelum memasuki Injil Matius, pelajari masa 400 tahun keheningan profetik antara Maleakhi dan Matius dalam naskah otentik Scofield 1917.'}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setIntroModalInitialTab('malachi_to_matthew');
                    setIsIntroModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{isEnBible ? 'Read "From Malachi to Matthew"' : 'Baca "From Malachi to Matthew"'}</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedBookId('matius');
                    setSelectedChapter(1);
                    if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 text-amber-900 dark:text-amber-200 text-xs font-semibold hover:bg-amber-50 dark:hover:bg-zinc-700 transition cursor-pointer"
                >
                  {isEnBible ? 'Go to Matthew 1 →' : 'Lanjut ke Matius 1 →'}
                </button>
              </div>
            </div>
          )}
          </>
          )}

          {/* Navigasi Bawah Pasal */}
          <div className="pt-6 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-3">
            <button
              onClick={handlePrevChapter}
              className={`px-4 py-2.5 rounded-2xl border ${themeStyles.border} ${themeStyles.text} font-bold text-xs hover:opacity-80 transition flex items-center gap-2 shadow-2xs cursor-pointer`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{isEnBible ? 'Previous Chapter' : 'Pasal Sebelumnya'}</span>
              <span className="sm:hidden">{isEnBible ? 'Prev' : 'Sblm'}</span>
            </button>

            <span className={`text-xs ${themeStyles.secondaryText} font-mono hidden sm:inline`}>
              {currentBookInfo.name} {selectedChapter} / {totalChapters}
            </span>

            <button
              onClick={handleNextChapter}
              className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <span className="hidden sm:inline">{isEnBible ? 'Next Chapter' : 'Pasal Berikutnya'}</span>
              <span className="sm:hidden">{isEnBible ? 'Next' : 'Lanjut'}</span>
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
                  {isEnBible ? 'Select Book (66 Books)' : 'Pilih Kitab (66 Kitab Lengkap)'}
                </h3>
              </div>
              <button 
                onClick={() => setIsBookPickerOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab PL, PB, Scofield & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex p-1 bg-slate-100 dark:bg-zinc-800 rounded-2xl overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setBookPickerTab('PL')}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    bookPickerTab === 'PL' ? 'bg-white dark:bg-zinc-700 text-blue-700 dark:text-blue-300 shadow-2xs' : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  {isEnBible ? 'Old Testament (39)' : 'Perjanjian Lama (39)'}
                </button>
                <button
                  onClick={() => setBookPickerTab('PB')}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    bookPickerTab === 'PB' ? 'bg-white dark:bg-zinc-700 text-amber-700 dark:text-amber-300 shadow-2xs' : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  {isEnBible ? 'New Testament (27)' : 'Perjanjian Baru (27)'}
                </button>
                <button
                  onClick={() => setBookPickerTab('SCOFIELD')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    bookPickerTab === 'SCOFIELD'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-amber-800 dark:text-amber-400 hover:text-amber-600'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEnBible ? 'Scofield Docs (6)' : 'Dokumen Scofield (6)'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsBookPickerOpen(false);
                    setIsTruthChartsOpen(true);
                  }}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/40 border border-amber-300/60 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-950/20"
                  title="22 Bagan Kebenaran Ilahi (LSM Truth Charts)"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{isEnBible ? 'Truth Charts (22)' : 'Bagan Kebenaran (22)'}</span>
                </button>
              </div>

              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bookSearchQuery}
                  onChange={(e) => setBookSearchQuery(e.target.value)}
                  placeholder={isEnBible ? "Search book or doc..." : "Cari kitab atau dokumen..."}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {/* Grid Kitab / Dokumen Scofield */}
            <div className="overflow-y-auto pr-1 flex-1">
              {bookPickerTab === 'SCOFIELD' ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-300/80 dark:border-amber-800/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                      <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                        The Scofield Reference Bible 1917 — Oxford University Press Documents
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-amber-800/80 dark:text-amber-400 hidden sm:inline">
                      6 Dokumen Otentik
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SCOFIELD_DOCS
                      .filter(d => 
                        !bookSearchQuery ||
                        d.title.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
                        d.titleId.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
                        d.desc.toLowerCase().includes(bookSearchQuery.toLowerCase())
                      )
                      .map(doc => {
                        const IconComp = doc.icon;
                        return (
                          <div
                            key={doc.id}
                            onClick={() => {
                              setIsBookPickerOpen(false);
                              setIntroModalInitialTab(doc.id);
                              setIsIntroModalOpen(true);
                            }}
                            className="p-4 rounded-2xl border border-amber-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-2.5"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <IconComp className="w-5 h-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1.5">
                                  <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 leading-tight">
                                    {doc.title}
                                  </h5>
                                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                                </div>
                                <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-semibold block mt-0.5">
                                  {doc.badge}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                              {isEnBible ? doc.descEn : doc.desc}
                            </p>
                            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-400 font-bold">
                              <span>{isEnBible ? 'Read Document' : 'Buka & Baca'}</span>
                              <span>→</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Pentateuch Banner on Old Testament Tab */}
                  {bookPickerTab === 'PL' && !bookSearchQuery && (
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/25 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                          <Compass className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-amber-950 dark:text-amber-200">The Pentateuch</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300">Scofield 1917</span>
                          </div>
                          <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-tight">
                            {isEnBible
                              ? 'Introductory treatise to the Five Books of Moses (Genesis–Deuteronomy)'
                              : 'Pengantar 5 Kitab Taurat Musa (Kejadian–Ulangan)'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => {
                            setIsBookPickerOpen(false);
                            setIntroModalInitialTab('pentateuch');
                            setIsIntroModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer transition"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{isEnBible ? 'Read Pentateuch' : 'Baca Pentateuch'}</span>
                        </button>
                        <button
                          onClick={() => setBookPickerTab('SCOFIELD')}
                          className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 text-amber-900 dark:text-amber-200 text-xs font-semibold hover:bg-amber-50 dark:hover:bg-zinc-700 transition cursor-pointer"
                        >
                          {isEnBible ? '6 Scofield Docs →' : '6 Dokumen →'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* The Four Gospels & Malachi-to-Matthew Banner on New Testament Tab */}
                  {bookPickerTab === 'PB' && !bookSearchQuery && (
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs mb-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/25 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-amber-950 dark:text-amber-200">The Four Gospels</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300">Scofield 1917</span>
                          </div>
                          <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-tight">
                            {isEnBible
                              ? 'General introduction to the Evangelical record & 7 principles'
                              : 'Pengantar 4 Injil (Matius, Markus, Lukas, Yohanes) & masa 400 tahun'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => {
                            setIsBookPickerOpen(false);
                            setIntroModalInitialTab('four_gospels');
                            setIsIntroModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer transition"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>The Four Gospels</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsBookPickerOpen(false);
                            setIntroModalInitialTab('malachi_to_matthew');
                            setIsIntroModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 text-amber-900 dark:text-amber-200 text-xs font-semibold hover:bg-amber-50 dark:hover:bg-zinc-700 transition cursor-pointer"
                        >
                          Maleakhi ke Matius →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Matching Scofield doc banner if search query matches */}
                  {bookSearchQuery && (
                    SCOFIELD_DOCS.filter(d => 
                      d.title.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
                      d.titleId.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
                      d.desc.toLowerCase().includes(bookSearchQuery.toLowerCase())
                    ).length > 0 && (
                      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span>Ditemukan dokumen Scofield yang cocok</span>
                        </div>
                        <button
                          onClick={() => setBookPickerTab('SCOFIELD')}
                          className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                        >
                          Buka Tab Scofield →
                        </button>
                      </div>
                    )
                  )}

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
                            {b.name_id && isEnBible && (
                              <span className="text-[10px] text-amber-700/80 dark:text-amber-300/80 font-medium block">
                                {b.name_id}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500">{b.chapters_count} {isEnBible ? 'chs' : 'pasal'}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                        </button>
                      ))}

                    {/* From Malachi to Matthew card placed at the very end of Old Testament */}
                    {bookPickerTab === 'PL' && !bookSearchQuery && (
                      <div className="col-span-2 sm:col-span-3 md:col-span-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs mt-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/25 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-amber-950 dark:text-amber-200">
                                {bibleLang === 'en' || bibleLang === 'scofield' ? 'From Malachi to Matthew' : 'Dari Maleakhi ke Matius'}
                              </span>
                              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300">
                                Masa 400 Tahun
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-tight">
                              {bibleLang === 'en' || bibleLang === 'scofield'
                                ? 'The 400 silent years between the Testaments (Persian, Grecian, Maccabean, Roman)'
                                : 'Jembatan sejarah & rohani masa 400 tahun keheningan profetik menuju kelahiran Kristus'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setIsBookPickerOpen(false);
                            setIntroModalInitialTab('malachi_to_matthew');
                            setIsIntroModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer transition shrink-0 w-full sm:w-auto justify-center"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{bibleLang === 'en' || bibleLang === 'scofield' ? 'Read Document' : 'Buka Pengantar'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                {bibleLang === 'en' ? 'Select Chapter' : 'Pilih Pasal'} • {currentBookInfo.name}
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
                  {activeFootnotePopup.lang === 'en' ? `Note ${activeFootnotePopup.noteIdx}` : `Catatan ${activeFootnotePopup.noteIdx}`}
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-zinc-100">
                  {activeFootnotePopup.lang === 'en' ? (currentBookInfo.nameEn || currentBookInfo.name) : currentBookInfo.name} {selectedChapter}:{activeFootnotePopup.verse}
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
                <span className="opacity-70">{activeFootnotePopup.lang === 'en' ? 'Word / Phrase:' : 'Kata / Frasa:'}</span>
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
                {renderFootnoteTextWithLinks(activeFootnotePopup.text, activeFootnotePopup.lang || bibleLang)}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const bookName = activeFootnotePopup.lang === 'en' ? (currentBookInfo.nameEn || currentBookInfo.name) : currentBookInfo.name;
                    const label = activeFootnotePopup.lang === 'en' ? 'Note' : 'Catatan';
                    const copyText = `${bookName} ${selectedChapter}:${activeFootnotePopup.verse} [${label} ${activeFootnotePopup.noteIdx}${activeFootnotePopup.keyword ? ` - ${activeFootnotePopup.keyword}` : ''}]:\n${activeFootnotePopup.text}`;
                    navigator.clipboard.writeText(copyText);
                    alert(activeFootnotePopup.lang === 'en' ? 'Footnote copied to clipboard!' : 'Catatan kaki berhasil disalin!');
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{activeFootnotePopup.lang === 'en' ? 'Copy Note' : 'Salin Catatan'}</span>
                </button>

                {(activeFootnotePopup.keyword?.toLowerCase().includes('malachi to matthew') || activeFootnotePopup.text?.toLowerCase().includes('from malachi to matthew')) && (
                  <button
                    onClick={() => {
                      setIntroModalInitialTab('malachi_to_matthew');
                      setIsIntroModalOpen(true);
                      handleCloseFootnote();
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Buka Risalah Lengkap</span>
                  </button>
                )}
              </div>

              <button
                onClick={handleCloseFootnote}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {activeFootnotePopup.lang === 'en' ? 'Close' : 'Tutup'}
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
        initialTab={introModalInitialTab}
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
        referenceText={typeof previewReference === 'object' ? previewReference?.text : previewReference}
        onClose={() => setPreviewReference(null)}
        bibleLang={typeof previewReference === 'object' ? (previewReference?.lang || bibleLang) : bibleLang}
        books={books}
        fontSize={fontSize}
        fontFamily={activeFontFamily}
        onJumpToPassage={handleSelectBookmarkOrSearchResult}
      />

      {/* MODAL 8: QUICK JUMP TO VERSE NUMBER (Nomor 5) */}
      {isVersePickerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-modal-backdrop-in"
          onClick={() => setIsVersePickerOpen(false)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-amber-300/80 dark:border-amber-700/60 my-6 space-y-4 max-h-[80vh] flex flex-col animate-modal-card-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-100">
                  {bibleLang === 'en' ? 'Jump to Verse' : 'Loncat ke Nomor Ayat'}
                </h3>
              </div>
              <button 
                onClick={() => setIsVersePickerOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {(chapterData?.verses || filteredVerses).map(v => (
                  <button
                    key={v.verse}
                    onClick={() => {
                      setIsVersePickerOpen(false);
                      const el = document.getElementById(`verse-${v.verse}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setHighlightedVerse(v.verse);
                        setTimeout(() => setHighlightedVerse(null), 3000);
                      }
                    }}
                    className="py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-mono font-bold transition flex items-center justify-center shadow-2xs cursor-pointer active:scale-95"
                  >
                    {v.verse}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 9: SHARE VERSE CARD GENERATOR (Nomor 3) */}
      <BibleVerseCardModal
        isOpen={Boolean(cardModalVerse)}
        onClose={() => setCardModalVerse(null)}
        verseData={cardModalVerse}
        bibleLang={bibleLang}
      />

      {/* MODAL 10: TULIS/EDIT CATATAN RENUNGAN PRIBADI (Nomor 4) */}
      <BiblePersonalNoteModal
        isOpen={Boolean(personalNoteVerse)}
        onClose={() => setPersonalNoteVerse(null)}
        verseData={personalNoteVerse ? {
          bookId: selectedBookId,
          bookName: currentBookInfo.name,
          chapter: selectedChapter,
          verse: personalNoteVerse.verse,
          text: personalNoteVerse.text
        } : null}
        initialNote={personalNoteVerse ? personalNotes[`${selectedBookId}-${selectedChapter}-${personalNoteVerse.verse}`]?.note || '' : ''}
        onSaveNote={handleSavePersonalNote}
        onDeleteNote={handleDeletePersonalNote}
        bibleLang={bibleLang}
      />

      {/* MODAL 11: DAFTAR SEMUA CATATAN RENUNGAN PRIBADI (Nomor 4) */}
      <BibleNotesListModal
        isOpen={isNotesListModalOpen}
        onClose={() => setIsNotesListModalOpen(false)}
        notes={personalNotes}
        onSelectNote={handleSelectBookmarkOrSearchResult}
        onDeleteNote={handleDeletePersonalNote}
        bibleLang={bibleLang}
      />

      {/* MODAL 12: QUICK VERSE COMPARE ID, EN & SCOFIELD (Nomor 6) */}
      <BibleVerseCompareModal
        isOpen={Boolean(compareVerseData)}
        onClose={() => setCompareVerseData(null)}
        verseNum={compareVerseData?.verseNum}
        bookName={currentBookInfo.name}
        bookNameEn={currentBookInfo.nameEn || currentBookInfo.name}
        chapter={selectedChapter}
        idVerse={compareVerseData?.idVerse}
        tbVerse={compareVerseData?.tbVerse}
        enVerse={compareVerseData?.enVerse}
        kjvVerse={compareVerseData?.kjvVerse}
        asvVerse={compareVerseData?.asvVerse}
        netVerse={compareVerseData?.netVerse}
        scofieldVerse={compareVerseData?.scofieldVerse}
        bibleLang={bibleLang}
      />

      {/* MODAL 13: SCOFIELD TOPICAL INDEX */}
      <BibleScofieldIndexModal
        isOpen={isScofieldIndexOpen}
        onClose={() => setIsScofieldIndexOpen(false)}
        onSelectReference={handleSelectScofieldReference}
        bibleLang={bibleLang}
      />

      {/* MODAL 14: 22 BAGAN KEBENARAN ILAHI (LSM TRUTH CHARTS) */}
      <BibleTruthChartsModal
        isOpen={isTruthChartsOpen}
        onClose={() => setIsTruthChartsOpen(false)}
        bibleLang={bibleLang}
        onOpenBook={onOpenBook}
        allBooks={allBooks}
        onOpenLibrary={onOpenLibrary}
      />

    </div>
  );
}
