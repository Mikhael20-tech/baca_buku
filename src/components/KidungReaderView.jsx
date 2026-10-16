import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Music, ChevronLeft, ChevronRight, Search, Copy, Check, 
  Share2, ArrowLeft, ZoomIn, ZoomOut, Hash, BookOpen, 
  X, Sparkles, Sliders, Moon, Sun, Coffee, List, ChevronDown, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const THEMES = [
  { id: 'light', name: 'Kertas Terang', bg: 'bg-[#FBF8F3]', text: 'text-[#1C1917]', cardBg: 'bg-white', border: 'border-[#1C1917]/10', subtext: 'text-[#78716C]', headerBg: 'bg-[#F4EFE6]/95', accent: '#3B4B34' },
  { id: 'sepia', name: 'Sepia Hangat', bg: 'bg-[#F4ECD8]', text: 'text-[#433422]', cardBg: 'bg-[#EFE5CD]', border: 'border-[#433422]/15', subtext: 'text-[#7D6B55]', headerBg: 'bg-[#EBDDC0]/95', accent: '#8C532B' },
  { id: 'dark', name: 'Gelap Malam', bg: 'bg-[#121417]', text: 'text-[#E2E8F0]', cardBg: 'bg-[#1A1D24]', border: 'border-white/10', subtext: 'text-[#94A3B8]', headerBg: 'bg-[#16191E]/95', accent: '#38BDF8' }
];

export const LANG_LABELS = {
  id: { name: 'Indonesia', native: 'Bahasa Indonesia', flag: '🇮🇩' },
  en: { name: 'English', native: 'English', flag: '🇬🇧' },
  zh: { name: '简体中文', native: '简体中文', flag: '🇨🇳' },
  zht: { name: '繁體中文', native: '繁體中文', flag: '🇭🇰' },
  es: { name: 'Español', native: 'Español', flag: '🇪🇸' },
  ko: { name: '한국어', native: '한국어', flag: '🇰🇷' },
  ja: { name: '日本語', native: '日本語', flag: '🇯🇵' },
  de: { name: 'Deutsch', native: 'Deutsch', flag: '🇩🇪' },
  fr: { name: 'Français', native: 'Français', flag: '🇫🇷' },
  pt: { name: 'Português', native: 'Português', flag: '🇧🇷' },
  tl: { name: 'Tagalog', native: 'Tagalog', flag: '🇵🇭' },
  ceb: { name: 'Cebuano', native: 'Bisaya', flag: '🇵🇭' },
  ru: { name: 'Русский', native: 'Русский', flag: '🇷🇺' },
  nl: { name: 'Nederlands', native: 'Nederlands', flag: '🇳🇱' },
  fa: { name: 'فارسی', native: 'فارسی', flag: '🇮🇷' }
};

export default function KidungReaderView({ 
  initialTab = 'kidung', 
  initialSongId = null,
  onBackToHome, 
  onOpenLibrary,
  onOpenBible 
}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Navigasi & state tampilan
  // viewState: 'index' | 'category' | 'reader'
  const [activeTab, setActiveTab] = useState(initialTab); // 'kidung' | 'suplemen'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedLang, setSelectedLang] = useState('id'); // Bahasa terpilih saat membaca
  const [showPhonetic, setShowPhonetic] = useState(() => {
    const saved = localStorage.getItem('kidung_show_phonetic') || localStorage.getItem('kidung_show_pinyin');
    return saved !== 'false';
  }); // Toggle Fonetik Latin (Pinyin untuk Mandarin & Romanji untuk Korea)
  const [isLangModalOpen, setIsLangModalOpen] = useState(false); // Modal dialog pemilih bahasa
  const [searchQuery, setSearchQuery] = useState('');
  const [quickNumQuery, setQuickNumQuery] = useState('');
  
  // Customization: Font size, tema
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('kidung_font_size')) || 17);
  const [themeId, setThemeId] = useState(() => localStorage.getItem('kidung_theme') || 'light');
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const searchInputRef = useRef(null);
  const readerScrollRef = useRef(null);

  // Ambil tema aktif
  const theme = useMemo(() => THEMES.find(t => t.id === themeId) || THEMES[0], [themeId]);

  // Simpan preferensi font, tema & pinyin
  useEffect(() => {
    localStorage.setItem('kidung_font_size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('kidung_theme', themeId);
  }, [themeId]);

  useEffect(() => {
    localStorage.setItem('kidung_show_phonetic', showPhonetic);
    localStorage.setItem('kidung_show_pinyin', showPhonetic);
  }, [showPhonetic]);

  // Load data JSON (dengan cache buster)
  useEffect(() => {
    setIsLoading(true);
    fetch('/kidung/kidung_data.json?v=' + Date.now())
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Gagal memuat data kidung`);
        return res.json();
      })
      .then(json => {
        setData(json);
        setIsLoading(false);
        if (initialSongId) {
          const allSongs = [...(json.kidung || []), ...(json.suplemen || [])];
          const found = allSongs.find(s => s.id === initialSongId || s.formattedNumber === initialSongId);
          if (found) {
            setSelectedSong(found);
            setActiveTab(found.type);
          }
        }
      })
      .catch(err => {
        console.error('Error loading kidung_data.json:', err);
        setLoadError(err.message);
        setIsLoading(false);
      });
  }, [initialSongId]);

  // Simpan preferensi font & tema
  useEffect(() => {
    localStorage.setItem('kidung_font_size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('kidung_theme', themeId);
  }, [themeId]);

  // Scroll to top saat ganti lagu
  useEffect(() => {
    if (selectedSong && readerScrollRef.current) {
      readerScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedSong]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Kategori sesuai tab aktif
  const currentCategories = useMemo(() => {
    if (!data || !data.categories) return [];
    return activeTab === 'kidung' ? (data.categories.kidung || []) : (data.categories.suplemen || []);
  }, [data, activeTab]);

  // Semua lagu sesuai tab aktif
  const currentSongList = useMemo(() => {
    if (!data) return [];
    return activeTab === 'kidung' ? (data.kidung || []) : (data.suplemen || []);
  }, [data, activeTab]);

  // Lagu dalam kategori terpilih
  const categorySongs = useMemo(() => {
    if (!selectedCategory || !currentSongList) return [];
    return currentSongList.filter(s => s.category === selectedCategory.name);
  }, [selectedCategory, currentSongList]);

  // Filter lagu untuk Search
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || !data) return [];

    // Ambil lagu dari tab yang sedang aktif, atau jika user mencari 's.' cari juga di suplemen
    const pool = q.startsWith('s') || q.startsWith('s.')
      ? data.suplemen || []
      : currentSongList;

    // Cek apakah query berupa angka
    const cleanNum = q.replace(/^(no\.|s\.|kidung|k\.)\s*/i, '').trim();
    const isNum = /^\d+$/.test(cleanNum);

    return pool.filter(song => {
      if (isNum) {
        const numStr = String(song.number);
        const dispStr = String(song.displayNumber || '');
        const fmtStr = String(song.formattedNumber || '');
        if (numStr === cleanNum || dispStr.toLowerCase().includes(cleanNum) || fmtStr.toLowerCase().includes(cleanNum)) {
          return true;
        }
      }

      // Cari berdasarkan judul
      if (song.title && song.title.toLowerCase().includes(q)) return true;

      // Cari berdasarkan nomor berformat
      if (song.formattedNumber && song.formattedNumber.toLowerCase().includes(q)) return true;

      // Cari berdasarkan lirik / bait
      if (song.firstLine && song.firstLine.toLowerCase().includes(q)) return true;
      if (song.chorusSnippet && song.chorusSnippet.toLowerCase().includes(q)) return true;

      // Cek seluruh bait
      if (song.stanzas && song.stanzas.some(st => st.lines && st.lines.some(l => l.toLowerCase().includes(q)))) {
        return true;
      }

      return false;
    });
  }, [searchQuery, data, currentSongList]);

  // Quick jump ke nomor tertentu
  const handleQuickJump = (e) => {
    e.preventDefault();
    const raw = quickNumQuery.trim().toLowerCase();
    if (!raw || !data) return;

    const isSuplemenPrefixed = raw.startsWith('s.') || raw.startsWith('s');
    const targetType = isSuplemenPrefixed ? 'suplemen' : activeTab;
    const numPart = raw.replace(/^(no\.|s\.|kidung|k\.)\s*/i, '').trim();
    const targetNum = parseInt(numPart, 10);

    if (isNaN(targetNum)) {
      showToast('Masukkan nomor kidung yang valid (contoh: 2032 atau 53)');
      return;
    }

    const pool = targetType === 'suplemen' ? (data.suplemen || []) : (data.kidung || []);
    const match = pool.find(s => s.number === targetNum);

    if (match) {
      setActiveTab(match.type);
      setSelectedSong(match);
      setQuickNumQuery('');
      setSearchQuery('');
    } else {
      showToast(`Nomor ${targetType === 'suplemen' ? 'S. ' : 'Kidung '}${targetNum} tidak ditemukan.`);
    }
  };

  // Navigasi lagu sebelumnya & berikutnya
  const handlePrevSong = () => {
    if (!selectedSong || !currentSongList.length) return;
    const currentIndex = currentSongList.findIndex(s => s.id === selectedSong.id);
    if (currentIndex > 0) {
      setSelectedSong(currentSongList[currentIndex - 1]);
    } else {
      showToast('Sudah di awal daftar kidung.');
    }
  };

  const handleNextSong = () => {
    if (!selectedSong || !currentSongList.length) return;
    const currentIndex = currentSongList.findIndex(s => s.id === selectedSong.id);
    if (currentIndex < currentSongList.length - 1) {
      setSelectedSong(currentSongList[currentIndex + 1]);
    } else {
      showToast('Sudah di akhir daftar kidung.');
    }
  };

  // Bahasa aktif saat membaca (fallback ke 'id' jika bahasa terpilih tidak tersedia pada lagu ini)
  const activeLang = useMemo(() => {
    if (!selectedSong) return 'id';
    if (selectedLang === 'id') return 'id';
    if (selectedSong.languages && selectedSong.languages[selectedLang]) {
      return selectedLang;
    }
    return 'id';
  }, [selectedSong, selectedLang]);

  // Daftar bahasa yang tersedia untuk lagu yang sedang dibuka
  const availableLangs = useMemo(() => {
    if (!selectedSong) return ['id'];
    return selectedSong.availableLanguages || ['id'];
  }, [selectedSong]);

  // Salin lirik sesuai bahasa yang sedang aktif
  const handleCopyLyrics = () => {
    if (!selectedSong) return;
    const isId = activeLang === 'id';
    const langObj = isId ? null : selectedSong.languages?.[activeLang];
    const isChinese = activeLang === 'zh' || activeLang === 'zht';
    const isKorean = activeLang === 'ko';
    const title = isId ? selectedSong.title : (langObj?.title || selectedSong.title);
    const headerNum = isId 
      ? selectedSong.formattedNumber 
      : `${selectedSong.formattedNumber} (${langObj?.name || activeLang} #${langObj?.hymnNumber || ''})`;

    let text = `${headerNum} : ${title}\n`;
    if (isChinese && showPhonetic && langObj?.pinyinTitle) {
      text += `${langObj.pinyinTitle}\n`;
    } else if (isKorean && showPhonetic && langObj?.romanTitle) {
      text += `${langObj.romanTitle}\n`;
    }
    if (isId && selectedSong.keyMeter) text += `Nada/Birama: ${selectedSong.keyMeter}\n`;
    if (isId && selectedSong.englishRef) text += `${selectedSong.englishRef}\n`;
    text += `\n`;

    const stanzas = isId ? selectedSong.stanzas : (langObj?.stanzas || []);
    let verseCount = 1;
    stanzas?.forEach(st => {
      const isCh = st.isChorus || st.type === 'chorus';
      if (isCh) {
        text += `[${activeLang === 'en' ? 'Chorus' : activeLang === 'es' ? 'Coro' : isChinese ? '副歌' : isKorean ? '후렴' : 'Koor'}]\n`;
      } else {
        const n = st.num || verseCount++;
        text += `${n}. `;
      }

      if (isChinese && showPhonetic && st.pinyinLines) {
        (st.lines || []).forEach((line, lIdx) => {
          text += `${line}\n`;
          if (st.pinyinLines[lIdx]) text += `${st.pinyinLines[lIdx]}\n`;
        });
        text += `\n`;
      } else if (isKorean && showPhonetic && st.romanLines) {
        (st.lines || []).forEach((line, lIdx) => {
          text += `${line}\n`;
          if (st.romanLines[lIdx]) text += `${st.romanLines[lIdx]}\n`;
        });
        text += `\n`;
      } else {
        text += (st.lines || []).join('\n') + `\n\n`;
      }
    });

    navigator.clipboard.writeText(text.trim()).then(() => {
      setCopied(true);
      showToast(`Lirik (${isId ? 'Indonesia' : langObj?.name || activeLang}) disalin ke papan klip!`);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Loading indicator
  if (isLoading) {
    return (
      <div className={`fixed inset-0 z-50 ${theme.bg} ${theme.text} flex flex-col items-center justify-center p-6`}>
        <div className="w-16 h-16 rounded-3xl bg-[#3B4B34]/15 border border-[#3B4B34]/30 flex items-center justify-center animate-pulse mb-4">
          <Music className="w-8 h-8 text-[#3B4B34]" />
        </div>
        <h2 className="text-xl font-bold font-serif mb-1">Kidung Rohani &amp; Suplemen</h2>
        <p className="text-xs text-[#78716C] animate-pulse">Memuat 1.158 kidung &amp; 8.800+ lirik multilingual...</p>
      </div>
    );
  }

  // Error fallback
  if (loadError) {
    return (
      <div className={`fixed inset-0 z-50 ${theme.bg} ${theme.text} flex flex-col items-center justify-center p-6 text-center`}>
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          <Music className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold mb-2">Gagal Memuat Indeks Kidung</h2>
        <p className="text-xs text-[#78716C] max-w-md mb-6">{loadError}</p>
        <Button onClick={onBackToHome} className="bg-[#3B4B34] text-white rounded-full px-6">
          Kembali ke Beranda
        </Button>
      </div>
    );
  }

  // =========================================================================
  // RENDER: 1. SONG READER VIEW (Tampilan Baca Lirik Lagu - Multilingual)
  // =========================================================================
  if (selectedSong) {
    const isId = activeLang === 'id';
    const langObj = isId ? null : selectedSong.languages?.[activeLang];
    const currentTitle = isId ? selectedSong.title : (langObj?.title || selectedSong.title);
    const stanzasToDisplay = isId ? (selectedSong.stanzas || []) : (langObj?.stanzas || []);

    // Hitung penomoran bait berurutan untuk lirik asing
    let runningVerseNumber = 1;

    return (
      <div className={`fixed inset-0 z-50 ${theme.bg} ${theme.text} flex flex-col font-sans select-text`}>
        
        {/* Toast Notifikasi */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1C1917] text-[#F4EFE6] px-5 py-3 rounded-2xl shadow-2xl border border-white/10 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header Bar */}
        <header className={`sticky top-0 z-30 ${theme.headerBg} backdrop-blur-md border-b ${theme.border} px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 shadow-xs`}>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSelectedSong(null)}
              className="p-2 -ml-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition flex items-center gap-1.5 text-sm font-semibold shrink-0"
              title="Kembali ke Daftar Kidung"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Daftar</span>
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Music className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold font-serif truncate">
                    {selectedSong.type === 'suplemen' ? 'Suplemen' : 'Kidung'}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                    {selectedSong.formattedNumber}
                  </span>
                </div>
                <p className="text-[10px] text-[#78716C] truncate">{selectedSong.category}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions (Font Size, Prev/Next, Copy) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Prev & Next Navigation */}
            <div className="flex items-center border border-black/10 dark:border-white/10 rounded-xl overflow-hidden bg-white/60 dark:bg-black/30">
              <button
                onClick={handlePrevSong}
                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 transition"
                title="Lagu Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10" />
              <button
                onClick={handleNextSong}
                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 transition"
                title="Lagu Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Font Size Adjusters */}
            <div className="hidden sm:flex items-center border border-black/10 dark:border-white/10 rounded-xl overflow-hidden bg-white/60 dark:bg-black/30">
              <button
                onClick={() => setFontSize(prev => Math.max(14, prev - 1))}
                className="px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/10 transition text-xs font-bold"
                title="Perkecil Font"
              >
                A-
              </button>
              <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10" />
              <button
                onClick={() => setFontSize(prev => Math.min(26, prev + 1))}
                className="px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/10 transition text-xs font-bold"
                title="Perbesar Font"
              >
                A+
              </button>
            </div>

            {/* Salin Lirik */}
            <button
              onClick={handleCopyLyrics}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition text-xs flex items-center gap-1 border border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/30"
              title="Salin Lirik Lengkap"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span className="hidden md:inline font-medium">Salin</span>
            </button>
          </div>
        </header>

        {/* Reader Lyrics Body */}
        <div 
          ref={readerScrollRef}
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-10"
        >
          <div className="max-w-[680px] mx-auto">
            
            {/* MULTILINGUAL LANGUAGE SELECTOR BAR (UX Nyaman & Mudah Dipilih) */}
            {availableLangs.length > 1 && (
              <div className="mb-6 pb-3 border-b border-black/10 dark:border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2.5 py-1">
                  
                  {/* Bagian Kiri: Tombol Buka Menu Semua Bahasa + Shortcut Cepat */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {/* Tombol Utama Pembuka Modal Semua Bahasa */}
                    <button
                      onClick={() => setIsLangModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-[#1C1917] dark:text-[#F4EFE6] border border-amber-500/35 transition flex items-center gap-2 font-bold text-xs sm:text-sm shadow-xs group"
                      title="Klik untuk melihat dan memilih semua bahasa yang tersedia"
                    >
                      <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:rotate-12 transition-transform" />
                      <span className="text-base">{LANG_LABELS[activeLang]?.flag || '🌐'}</span>
                      <span>{LANG_LABELS[activeLang]?.name || activeLang}</span>
                      {activeLang !== 'id' && selectedSong.languages?.[activeLang]?.hymnNumber && (
                        <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10 text-[#78716C] dark:text-stone-300">
                          #{selectedSong.languages[activeLang].hymnNumber}
                        </span>
                      )}
                      <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold hidden sm:inline ml-0.5">
                        ({availableLangs.length} bahasa)
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-stone-500 ml-0.5" />
                    </button>

                    {/* Shortcut Cepat: Bahasa Indonesia (jika sedang di bahasa asing) */}
                    {activeLang !== 'id' && (
                      <button
                        onClick={() => setSelectedLang('id')}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-black/5 dark:bg-white/10 text-stone-700 dark:text-stone-300 hover:bg-black/10 dark:hover:bg-white/15 transition flex items-center gap-1"
                        title="Kembali ke Bahasa Indonesia"
                      >
                        <span>🇮🇩</span>
                        <span>ID</span>
                      </button>
                    )}

                    {/* Shortcut Cepat: English (jika tersedia dan belum aktif) */}
                    {availableLangs.includes('en') && activeLang !== 'en' && (
                      <button
                        onClick={() => setSelectedLang('en')}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-black/5 dark:bg-white/10 text-stone-700 dark:text-stone-300 hover:bg-black/10 dark:hover:bg-white/15 transition flex items-center gap-1"
                        title="Buka versi English"
                      >
                        <span>🇬🇧</span>
                        <span>EN</span>
                      </button>
                    )}

                    {/* Shortcut Cepat: Chinese (jika tersedia dan belum aktif) */}
                    {availableLangs.includes('zh') && activeLang !== 'zh' && (
                      <button
                        onClick={() => setSelectedLang('zh')}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-black/5 dark:bg-white/10 text-stone-700 dark:text-stone-300 hover:bg-black/10 dark:hover:bg-white/15 transition flex items-center gap-1"
                        title="Buka versi 简体中文"
                      >
                        <span>🇨🇳</span>
                        <span>中文</span>
                      </button>
                    )}

                    {/* Shortcut Cepat: Spanish (jika tersedia dan belum aktif) */}
                    {availableLangs.includes('es') && activeLang !== 'es' && (
                      <button
                        onClick={() => setSelectedLang('es')}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-black/5 dark:bg-white/10 text-stone-700 dark:text-stone-300 hover:bg-black/10 dark:hover:bg-white/15 transition flex items-center gap-1"
                        title="Buka versi Español"
                      >
                        <span>🇪🇸</span>
                        <span>ES</span>
                      </button>
                    )}

                    {/* Tombol Lihat Semua Bahasa Lain */}
                    <button
                      onClick={() => setIsLangModalOpen(true)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 transition flex items-center gap-1"
                    >
                      <span>Lainnya...</span>
                    </button>
                  </div>

                  {/* Bagian Kanan: Toggle Fonetik Latin (Pinyin untuk Mandarin, Romanji untuk Korea) */}
                  {(activeLang === 'zh' || activeLang === 'zht') && (
                    <button
                      onClick={() => setShowPhonetic(prev => !prev)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border shadow-xs ${
                        showPhonetic
                          ? 'bg-amber-500/25 text-amber-900 dark:text-amber-200 border-amber-500/50'
                          : 'bg-black/5 dark:bg-white/10 text-[#78716C] border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/15'
                      }`}
                      title="Nyalakan / Matikan Fonetik Pinyin"
                    >
                      <span className="font-serif font-black text-xs">拼</span>
                      <span>Pinyin: {showPhonetic ? 'ON' : 'OFF'}</span>
                    </button>
                  )}

                  {activeLang === 'ko' && (
                    <button
                      onClick={() => setShowPhonetic(prev => !prev)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border shadow-xs ${
                        showPhonetic
                          ? 'bg-amber-500/25 text-amber-900 dark:text-amber-200 border-amber-500/50'
                          : 'bg-black/5 dark:bg-white/10 text-[#78716C] border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/15'
                      }`}
                      title="Nyalakan / Matikan Romanisasi Latin (Romanji Korea)"
                    >
                      <span className="font-serif font-bold text-xs">한</span>
                      <span>Romanji: {showPhonetic ? 'ON' : 'OFF'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* MODAL DIALOG PEMILIH BAHASA (Lapang, Nyaman & Mudah Diklik) */}
            {isLangModalOpen && (
              <div 
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
                onClick={() => setIsLangModalOpen(false)}
              >
                <div 
                  className={`w-full max-w-lg rounded-3xl ${theme.cardBg} border ${theme.border} shadow-2xl p-5 sm:p-6 space-y-4 max-h-[85vh] flex flex-col`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header Modal */}
                  <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm sm:text-base font-serif">Pilih Bahasa Kidung</h3>
                        <p className="text-[11px] text-[#78716C]">Tersedia {availableLangs.length} bahasa untuk kidung ini</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsLangModalOpen(false)}
                      className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-[#78716C] transition"
                      title="Tutup"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Grid Bahasa yang Luas & Nyaman Diklik */}
                  <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-1">
                    {availableLangs.map((lKey) => {
                      const info = LANG_LABELS[lKey] || { name: lKey, native: lKey, flag: '🌐' };
                      const isActive = activeLang === lKey;
                      const hymnNum = lKey !== 'id' ? selectedSong.languages?.[lKey]?.hymnNumber : null;
                      const titlePreview = lKey === 'id' ? selectedSong.title : selectedSong.languages?.[lKey]?.title;

                      return (
                        <div
                          key={lKey}
                          onClick={() => {
                            setSelectedLang(lKey);
                            setIsLangModalOpen(false);
                          }}
                          className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 text-left ${
                            isActive
                              ? 'bg-amber-500/20 border-amber-500/50 ring-2 ring-amber-500/25 shadow-xs'
                              : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 hover:bg-amber-500/10 hover:border-amber-500/30'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-2xl shrink-0 select-none">{info.flag}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs sm:text-sm font-bold truncate ${isActive ? 'text-amber-800 dark:text-amber-300' : ''}`}>
                                  {info.name}
                                </span>
                                {hymnNum && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10 text-[#78716C] shrink-0">
                                    #{hymnNum}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#78716C] truncate">
                                {info.native !== info.name ? info.native : (titlePreview || '')}
                              </p>
                            </div>
                          </div>

                          {isActive && (
                            <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer Modal */}
                  <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs text-[#78716C]">
                    <span>Penomoran kidung diselaraskan otomatis</span>
                    <button
                      onClick={() => setIsLangModalOpen(false)}
                      className="px-4 py-1.5 rounded-xl bg-black/10 dark:bg-white/10 text-stone-700 dark:text-stone-300 font-bold hover:bg-black/15 transition"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Header Nomor Lagu & Judul */}
            <div className="mb-8 pb-5 border-b border-black/10 dark:border-white/10">
              {isId ? (
                <>
                  {/* Nomor Lagu Besar Indonesia */}
                  <div className="text-xl sm:text-2xl font-extrabold text-amber-700 dark:text-amber-400 font-serif tracking-tight mb-1">
                    {selectedSong.formattedNumber}
                  </div>

                  {/* Judul Lagu */}
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight leading-snug mb-2">
                    {selectedSong.title}
                  </h1>

                  {/* Metrum, Nada Dasar, Penulis, Ing. Ref */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#78716C] font-mono">
                    {selectedSong.keyMeter && (
                      <span className="font-semibold text-stone-800 dark:text-stone-200 bg-amber-500/10 px-2 py-0.5 rounded">
                        {selectedSong.keyMeter}
                      </span>
                    )}
                    {selectedSong.meter && (
                      <span>Metrum: {selectedSong.meter}</span>
                    )}
                    {selectedSong.author && (
                      <span>Pengarang: ({selectedSong.author})</span>
                    )}
                    {selectedSong.englishRef && (
                      <span>({selectedSong.englishRef})</span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Tampilan Header Bahasa Lain */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-lg sm:text-xl font-extrabold text-amber-700 dark:text-amber-400 font-serif tracking-tight">
                      {selectedSong.formattedNumber}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-mono">
                      {langObj?.name} #{langObj?.hymnNumber}
                    </span>
                  </div>

                  {/* Judul Bahasa Lain */}
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight leading-snug mb-1">
                    {currentTitle}
                  </h1>

                  {/* Fonetik Judul: Pinyin untuk Mandarin, Romanji untuk Korea */}
                  {showPhonetic && (
                    <>
                      {(activeLang === 'zh' || activeLang === 'zht') && langObj?.pinyinTitle && (
                        <p className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-400 font-sans tracking-wide mb-2">
                          {langObj.pinyinTitle}
                        </p>
                      )}
                      {activeLang === 'ko' && langObj?.romanTitle && (
                        <p className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-400 font-sans tracking-wide mb-2">
                          {langObj.romanTitle}
                        </p>
                      )}
                    </>
                  )}

                  {/* Rujukan Bahasa Asli Indonesia */}
                  <p className="text-xs text-[#78716C] font-sans">
                    Versi Indonesia: <span className="font-semibold text-stone-700 dark:text-stone-300">{selectedSong.title}</span>
                  </p>
                </>
              )}
            </div>

            {/* Bait-bait Lagu & Koor */}
            <div 
              className="space-y-6 select-text leading-relaxed font-sans"
              style={{ fontSize: `${fontSize}px` }}
              dir={activeLang === 'fa' ? 'rtl' : 'ltr'}
            >
              {stanzasToDisplay && stanzasToDisplay.length > 0 ? (
                stanzasToDisplay.map((stanza, idx) => {
                  const isChorus = stanza.isChorus || stanza.type === 'chorus';
                  const verseNum = isChorus ? null : (stanza.num || runningVerseNumber++);
                  const isChinese = activeLang === 'zh' || activeLang === 'zht';
                  const isKorean = activeLang === 'ko';

                  // Label koor disesuaikan dengan bahasa masing-masing
                  const chorusLabel = 
                    activeLang === 'en' ? 'Chorus:' :
                    activeLang === 'es' ? 'Coro:' :
                    activeLang === 'fr' || activeLang === 'de' ? 'Refrain:' :
                    activeLang === 'pt' ? 'Refrão:' :
                    isChinese ? '副歌:' :
                    isKorean ? '후렴:' :
                    'Koor:';

                  if (isChorus) {
                    return (
                      <div key={idx} className={`my-6 ${activeLang === 'fa' ? 'pr-7 sm:pr-9' : 'pl-7 sm:pl-9'}`}>
                        <div className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1.5 select-none font-sans">
                          {chorusLabel}
                        </div>
                        <div className="space-y-2">
                          {stanza.lines?.map((line, lIdx) => {
                            const cleanLine = typeof line === 'string' ? line.replace(/[\u035c\u0361\u203f\u2040]/g, '').replace(/\xa0/g, ' ') : line;
                            const phoneticLine = 
                              (showPhonetic && isChinese && stanza.pinyinLines) ? stanza.pinyinLines[lIdx] :
                              (showPhonetic && isKorean && stanza.romanLines) ? stanza.romanLines[lIdx] :
                              null;

                            return (
                              <div key={lIdx} className="space-y-0.5">
                                <p className="leading-relaxed font-normal">{cleanLine}</p>
                                {phoneticLine && (
                                  <p className="text-xs sm:text-[13px] text-amber-700 dark:text-amber-400 font-sans tracking-wide opacity-90 select-text">
                                    {phoneticLine}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className="flex items-start gap-2.5 sm:gap-3.5 my-5">
                      {verseNum ? (
                        <span className="font-bold text-stone-700 dark:text-stone-300 select-none shrink-0 font-serif w-6 text-right pt-0.5">
                          {verseNum}.
                        </span>
                      ) : (
                        <span className="w-6 shrink-0" />
                      )}
                      <div className="flex-1 space-y-2">
                        {stanza.lines?.map((line, lIdx) => {
                          const cleanLine = typeof line === 'string' ? line.replace(/[\u035c\u0361\u203f\u2040]/g, '').replace(/\xa0/g, ' ') : line;
                          const phoneticLine = 
                            (showPhonetic && isChinese && stanza.pinyinLines) ? stanza.pinyinLines[lIdx] :
                            (showPhonetic && isKorean && stanza.romanLines) ? stanza.romanLines[lIdx] :
                            null;

                          return (
                            <div key={lIdx} className="space-y-0.5">
                              <p className="leading-relaxed font-normal">{cleanLine}</p>
                              {phoneticLine && (
                                <p className="text-xs sm:text-[13px] text-amber-700 dark:text-amber-400 font-sans tracking-wide opacity-90 select-text">
                                  {phoneticLine}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-[#78716C]">
                  Lirik kidung dalam bahasa ini belum tersedia.
                </div>
              )}
            </div>

            {/* Bottom Navigation Toolbar */}
            <div className="mt-14 pt-8 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs text-[#78716C]">
              <button
                onClick={handlePrevSong}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <button
                onClick={() => setSelectedSong(null)}
                className="px-4 py-2 rounded-xl font-bold text-amber-700 dark:text-amber-400 hover:underline"
              >
                Daftar Kategori Indeks
              </button>

              <button
                onClick={handleNextSong}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition font-semibold"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: 2. SONG LIST VIEW (Dalam Kategori atau Hasil Pencarian - Screenshot 4)
  // =========================================================================
  const isSearchActive = searchQuery.trim().length > 0;
  const isCategoryActive = selectedCategory !== null;

  if (isSearchActive || isCategoryActive) {
    const listTitle = isSearchActive 
      ? `Hasil Pencarian "${searchQuery}"`
      : selectedCategory.name;
    const listSubtitle = isSearchActive
      ? `${searchResults.length} kidung ditemukan`
      : `Rentang ${selectedCategory.range} • ${categorySongs.length} Kidung`;
    const songsToDisplay = isSearchActive ? searchResults : categorySongs;

    return (
      <div className={`fixed inset-0 z-50 ${theme.bg} ${theme.text} flex flex-col font-sans select-none`}>
        
        {/* Header Bar (Screenshot 4 style: < [icon] Kidung) */}
        <header className={`sticky top-0 z-30 ${theme.headerBg} backdrop-blur-md border-b ${theme.border} px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-xs`}>
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => {
                if (isSearchActive) setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="p-1.5 -ml-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition text-sm font-semibold flex items-center gap-1 shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Indeks</span>
            </button>

            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Music className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold font-serif truncate">
                {listTitle}
              </h2>
              <p className="text-[11px] text-[#78716C] truncate">{listSubtitle}</p>
            </div>
          </div>

          {/* Search box inline */}
          <div className="relative w-40 sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lirik, nomor..."
              className="pl-8 pr-7 py-1 text-xs rounded-full bg-white/70 dark:bg-black/30 border-black/10 dark:border-white/10 h-8"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-black dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Songs List (Screenshot 4 style) */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4">
          <div className="max-w-[760px] mx-auto divide-y divide-black/5 dark:divide-white/5">
            {songsToDisplay.length > 0 ? (
              songsToDisplay.map((song) => (
                <div
                  key={song.id}
                  onClick={() => setSelectedSong(song)}
                  className="py-3.5 px-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer group flex items-start gap-3 sm:gap-4"
                >
                  {/* Nomor Kidung di Kiri (S. 2024 atau No. 001) */}
                  <div className="font-bold text-xs sm:text-sm text-amber-700 dark:text-amber-400 font-serif shrink-0 w-16 sm:w-20 pt-0.5">
                    {song.formattedNumber}
                  </div>

                  {/* Lirik Baris Pertama & Koor (Screenshot 4) */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs sm:text-sm text-[#1C1917] dark:text-[#E2E8F0] font-medium leading-relaxed group-hover:text-amber-800 dark:group-hover:text-amber-300 transition line-clamp-2">
                      {song.firstLine || song.title}
                    </p>

                    {song.chorusSnippet && (
                      <p className="text-[11px] sm:text-xs text-[#78716C] leading-relaxed line-clamp-1">
                        <span className="font-bold text-amber-700/90 dark:text-amber-400/90">Koor:</span> "{song.chorusSnippet}"
                      </p>
                    )}
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#78716C] shrink-0 opacity-0 group-hover:opacity-100 transition self-center" />
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-[#78716C]">
                <Music className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold mb-1">Tidak ada kidung yang cocok</p>
                <p className="text-xs">Coba masukkan nomor lain atau kata kunci berbeda.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: 3. INDEX CATEGORIES VIEW (Screenshot 5 & 1 & 2 Style)
  // =========================================================================
  return (
    <div className={`fixed inset-0 z-50 ${theme.bg} ${theme.text} flex flex-col font-sans select-none overflow-hidden`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1917] text-[#F4EFE6] px-5 py-3 rounded-2xl shadow-2xl border border-white/10 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navbar */}
      <header className={`sticky top-0 z-30 ${theme.headerBg} backdrop-blur-md border-b ${theme.border} px-4 sm:px-8 py-3 flex items-center justify-between gap-4 shadow-xs`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="w-9 h-9 rounded-2xl bg-[#3B4B34] text-[#F4EFE6] flex items-center justify-center shadow-md shadow-[#3B4B34]/20 btn-lift"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-4 h-4 text-amber-200" />
          </button>
          <div>
            <h1 className="font-extrabold text-xl font-serif tracking-tight">Kidung</h1>
          </div>
        </div>

        {/* Quick Nav Links (Alkitab & Katalog) */}
        <div className="flex items-center gap-2">
          {onOpenBible && (
            <button
              onClick={onOpenBible}
              className="px-3 py-1.5 rounded-full text-xs font-bold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition hidden md:flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Alkitab</span>
            </button>
          )}
          {onOpenLibrary && (
            <button
              onClick={onOpenLibrary}
              className="px-3 py-1.5 rounded-full text-xs font-bold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition hidden md:flex items-center gap-1.5"
            >
              <List className="w-3.5 h-3.5" />
              <span>Katalog</span>
            </button>
          )}

          {/* Ganti Tema */}
          <div className="flex items-center border border-black/10 dark:border-white/10 rounded-full p-0.5 bg-white/60 dark:bg-black/30">
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => setThemeId(t.id)}
                className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition ${
                  themeId === t.id ? 'bg-[#3B4B34] text-white' : 'text-[#78716C] hover:text-black dark:hover:text-white'
                }`}
                title={t.name}
              >
                {t.id === 'light' ? '☀' : t.id === 'sepia' ? '☕' : '🌙'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        <div className="max-w-[760px] mx-auto space-y-6">

          {/* Quick Number Search Box & Keyword Search */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Lompat Cepat ke Nomor */}
            <form onSubmit={handleQuickJump} className="sm:col-span-5 relative">
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400" />
                <Input
                  value={quickNumQuery}
                  onChange={(e) => setQuickNumQuery(e.target.value)}
                  placeholder="Ketik nomor (cth. 2032, 53)..."
                  className="pl-9 pr-14 py-2 text-xs rounded-2xl bg-white dark:bg-[#1A1D24] border-black/10 dark:border-white/10 shadow-xs h-10 font-mono"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-amber-600 text-white text-[11px] font-bold hover:bg-amber-700 transition"
                >
                  Buka
                </button>
              </div>
            </form>

            {/* Pencarian Lirik & Judul */}
            <div className="sm:col-span-7 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari lirik, judul, tema rohani..."
                className="pl-10 pr-8 py-2 text-xs rounded-2xl bg-white dark:bg-[#1A1D24] border-black/10 dark:border-white/10 shadow-xs h-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-black dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* TAB BAR BERALIH: [ Kidung ] [ Suplemen ] (Screenshot 5 Style) */}
          <div className="flex justify-center pt-2">
            <div className="inline-flex p-1 rounded-2xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 w-full max-w-[460px]">
              <button
                onClick={() => {
                  setActiveTab('kidung');
                  setSelectedCategory(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === 'kidung'
                    ? 'bg-white dark:bg-[#252830] text-[#1C1917] dark:text-white shadow-sm'
                    : 'text-[#78716C] hover:text-[#1C1917] dark:hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Kidung (1 – 786)</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('suplemen');
                  setSelectedCategory(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === 'suplemen'
                    ? 'bg-[#38BDF8] text-white shadow-sm'
                    : 'text-[#78716C] hover:text-[#1C1917] dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Suplemen (S. 0001 – S. 2032)</span>
              </button>
            </div>
          </div>

          {/* Banner Indeks Kategori Info */}
          <div className="flex items-center justify-between text-xs px-2 text-[#78716C]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              {activeTab === 'kidung' ? 'Daftar Indeks Kidung' : 'Daftar Isi Suplemen'}
            </span>
            <span>{currentCategories.length} Kategori Utama</span>
          </div>

          {/* TABLE OF CONTENTS: DAFTAR KATEGORI (Screenshot 5 & 1 & 2 Style) */}
          <div className="bg-white dark:bg-[#1A1D24] rounded-3xl border border-black/10 dark:border-white/10 shadow-xs divide-y divide-black/5 dark:divide-white/5 overflow-hidden">
            {currentCategories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className="py-3.5 px-4 sm:px-6 hover:bg-amber-500/5 dark:hover:bg-white/5 transition cursor-pointer flex items-center justify-between gap-4 group"
              >
                {/* Nama Kategori */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-amber-500/40 group-hover:bg-amber-500 transition shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-[#E2E8F0] group-hover:text-amber-700 dark:group-hover:text-amber-400 transition truncate">
                    {cat.name}
                  </span>
                </div>

                {/* Nomor Rentang di Kanan (Screenshot 5 style) */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs sm:text-sm font-mono text-[#78716C] group-hover:text-[#1C1917] dark:group-hover:text-white transition">
                    {cat.range}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#78716C] group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Footer Info */}
          <div className="text-center py-6 text-xs text-[#78716C] space-y-1">
            <p className="text-[11px] opacity-75">Koleksi Kidung Rohani &amp; Kidung Suplemen Lengkap</p>
          </div>

        </div>
      </div>
    </div>
  );
}
