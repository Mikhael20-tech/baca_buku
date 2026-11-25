import React, { useState, useEffect, useCallback } from 'react';
import { useStageSync } from '../hooks/useStageSync';
import { chunkTextToSlides } from '../utils/chunkLyrics';
import { SongSetItem, DisplayMode, SlideItem } from '../types/stage';
import { Plus, Search, ExternalLink, ArrowLeft, Trash2, Music, MessageSquarePlus, Palette, Radio, Megaphone, Type, Sliders, Monitor, BookOpen, ChevronDown, Check } from 'lucide-react';

const QUICK_TICKER_PRESETS = [
  'Selamat datang dalam persekutuan & ibadah hari ini. Tuhan Yesus memberkati.',
  'Pengumuman: Doa bersama diadakan setiap hari Selasa pukul 19:30 WIB.',
  'Mohon mengheningkan atau menonaktifkan nada dering ponsel selama jalannya ibadah.',
  'Perjamuan Kudus akan diadakan pada akhir ibadah hari ini.',
];

const SAMPLE_SETLIST: SongSetItem[] = [
  {
    id: 'kidung-154',
    title: 'Kidung 154 - Memuji Tuhan: Kealmuhitan-Nya',
    subtitle: '',
    rawText: `Se-be-lum wak-tu ber-mu-la, se-be-lum za-man mu-lai;\nAl-lah dan Fir-man be-ser-ta, Fir-man itu Al-lah.\nAl-lah dan Fir-man ber-sa-tu, Al-lah dan Fir-man e-sa;\nDi da-lam Dia a-da ha-yat, ha-yat itu t'rang ma-nu-sia.\n\nFir-man te-lah men-ja-di da-ging, ber-ke-mah di an-ta-ra ki-ta;\nPe-nuh ka-sih ka-ru-nia dan re-a-li-tas, ki-ta pan-dang mu-lia-Nya.\nDia-lah Anak Tung-gal Ba-pa, me-nya-ta-kan Al-lah Ba-pa;\nDa-lam Dia ki-ta me-ne-ri-ma, ka-sih ka-ru-nia ber-lim-pah.`,
    slides: [],
  },
  {
    id: 'kidung-137',
    title: 'Kidung 137 - Memuji Tuhan: Kasih Karunia-Nya',
    subtitle: '',
    rawText: `Mu-lia, hor-mat, Dia kor-ban-kan da-tang du-nia me-ren-dah,\nMen-ja-di ma-nu-sia se-ja-ti, me-nga-la-mi s'ga-la du-ka.\nSa-lib a-ib Dia tang-gung-kan, te-bus ki-ta da-ri do-sa,\nO, ka-sih-Nya tak ter-du-ga, ka-sih ka-ru-nia sem-pur-na.\n\nHal-le-lu-ya! Ter-pu-ji-lah, Kris-tus bang-kit me-me-nang-kan!\nDa-lam Roh Dia ma-suk ki-ta, ja-di ha-yat ser-ta t'rang.\nKi-ta me-nik-ma-ti Di-a, ber-se-ku-tu da-lam ka-sih,\nSam-pai Tu-han da-tang pu-la, ki-ta ma-suk mu-lia-Nya.`,
    slides: [],
  },
].map((item) => ({
  ...item,
  slides: chunkTextToSlides(item.rawText, 4),
}));

export default function PresenterConsole({ onBackToApp }: { onBackToApp?: () => void }) {
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [roomId, setRoomId] = useState(urlParams?.get('room') || 'main-hall');

  const { state, broadcastState } = useStageSync(roomId, true);
  const [setlist, setSetlist] = useState<SongSetItem[]>(() => {
    try {
      const saved = localStorage.getItem('stage_presenter_setlist_v2') || localStorage.getItem('stage_presenter_setlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Reset jika masih berisi format lama dengan '#' atau subtitle 'Matius' atau lirik rusak
          const hasBrokenSong = parsed.some(
            (s: any) =>
              s?.title?.includes('#') ||
              s?.subtitle?.includes('Matius') ||
              s?.rawText === 'Bait lagu belum tersedia' ||
              s?.slides?.[0]?.content === 'Bait lagu belum tersedia'
          );
          if (hasBrokenSong) {
            return SAMPLE_SETLIST;
          }
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return SAMPLE_SETLIST;
  });
  const [selectedSong, setSelectedSong] = useState<SongSetItem>(() => {
    try {
      const saved = localStorage.getItem('stage_presenter_setlist_v2') || localStorage.getItem('stage_presenter_setlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasBrokenSong = parsed.some(
            (s: any) =>
              s?.title?.includes('#') ||
              s?.subtitle?.includes('Matius') ||
              s?.rawText === 'Bait lagu belum tersedia' ||
              s?.slides?.[0]?.content === 'Bait lagu belum tersedia'
          );
          if (hasBrokenSong) {
            return SAMPLE_SETLIST[0];
          }
          return parsed[0];
        }
      }
    } catch (e) {
      // ignore
    }
    return SAMPLE_SETLIST[0];
  });
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [stageTheme, setStageTheme] = useState<'default' | 'lower-third' | 'amber-gold'>('default');
  const [isQuickTextOpen, setIsQuickTextOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState('PENGUMUMAN');
  const [quickBody, setQuickBody] = useState('');

  // Kontrol Teks Berjalan (Ticker) Pengumuman
  const [tickerInput, setTickerInput] = useState(() => {
    try {
      return localStorage.getItem('stage_ticker_saved_text') || 'Selamat datang dalam persekutuan & ibadah hari ini. Tuhan Yesus memberkati.';
    } catch (e) {
      return 'Selamat datang dalam persekutuan & ibadah hari ini. Tuhan Yesus memberkati.';
    }
  });
  const [tickerSpeed, setTickerSpeed] = useState<number>(28);
  const [isTickerModalOpen, setIsTickerModalOpen] = useState(false);

  const toggleTicker = () => {
    const nextActive = !state.tickerActive;
    const textToBroadcast = tickerInput.trim() || state.tickerText || 'Selamat datang dalam ibadah.';
    broadcastState({
      ...state,
      tickerActive: nextActive,
      tickerText: textToBroadcast,
      tickerSpeed,
      updatedAt: Date.now(),
    });
  };

  const applyTickerText = (customText?: string) => {
    const textToBroadcast = (customText !== undefined ? customText : tickerInput).trim();
    if (!textToBroadcast) return;
    try {
      localStorage.setItem('stage_ticker_saved_text', textToBroadcast);
    } catch (e) {
      // ignore
    }
    broadcastState({
      ...state,
      tickerText: textToBroadcast,
      tickerActive: true,
      tickerSpeed,
      updatedAt: Date.now(),
    });
  };

  const stopTicker = () => {
    broadcastState({
      ...state,
      tickerActive: false,
      updatedAt: Date.now(),
    });
  };

  // Kontrol Ukuran Font Lirik & Badge Judul di Layar Proyektor
  const [contentFontSize, setContentFontSize] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('stage_content_font_size'));
      return saved && saved <= 72 ? saved : 48;
    } catch {
      return 48;
    }
  });

  const [badgeFontSize, setBadgeFontSize] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('stage_badge_font_size')) || 16;
    } catch {
      return 16;
    }
  });

  const [isFontSizeModalOpen, setIsFontSizeModalOpen] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'queue' | 'slides' | 'controls'>('slides');

  const updateFontSizes = (newContentSize?: number, newBadgeSize?: number) => {
    const cSize = newContentSize ?? contentFontSize;
    const bSize = newBadgeSize ?? badgeFontSize;
    setContentFontSize(cSize);
    setBadgeFontSize(bSize);
    try {
      localStorage.setItem('stage_content_font_size', String(cSize));
      localStorage.setItem('stage_badge_font_size', String(bSize));
    } catch {
      // ignore
    }
    broadcastState({
      ...state,
      fontSize: cSize,
      badgeFontSize: bSize,
      updatedAt: Date.now(),
    });
  };

  // Simpan setlist ke localStorage agar persiapan operator tidak hilang saat refresh
  useEffect(() => {
    try {
      localStorage.setItem('stage_presenter_setlist_v2', JSON.stringify(setlist));
      localStorage.setItem('stage_presenter_setlist', JSON.stringify(setlist));
    } catch (e) {
      // ignore
    }
  }, [setlist]);

  // Pencarian & penambahan kidung dari database
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchKidungQuery, setSearchKidungQuery] = useState('');
  const [allKidungData, setAllKidungData] = useState<any[]>([]);
  const [isLoadingKidung, setIsLoadingKidung] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [addModalTab, setAddModalTab] = useState<'kidung' | 'bible'>('kidung');
  const [kidungFilter, setKidungFilter] = useState<'all' | 'kidung' | 'suplemen'>('all');

  // Bible Picker State for Live Stage
  const [bibleBooks, setBibleBooks] = useState<any[]>([]);
  const [bibleVersion, setBibleVersion] = useState<'id' | 'tb' | 'en' | 'kjv' | 'asv' | 'net' | 'scofield'>('id');
  const [selectedBibleBookId, setSelectedBibleBookId] = useState<string>('yohanes');
  const [selectedBibleChapter, setSelectedBibleChapter] = useState<number>(3);
  const [bibleChapterVerses, setBibleChapterVerses] = useState<any[]>([]);
  const [bibleVerseStart, setBibleVerseStart] = useState<number>(16);
  const [bibleVerseEnd, setBibleVerseEnd] = useState<number>(16);
  const [isLoadingBible, setIsLoadingBible] = useState(false);
  const [openBibleDropdown, setOpenBibleDropdown] = useState<'book' | 'chapter' | 'start' | 'end' | null>(null);
  const [bibleBookSearch, setBibleBookSearch] = useState('');

  // Load Bible books metadata when modal opens on Bible tab
  useEffect(() => {
    if (isSearchOpen && addModalTab === 'bible' && bibleBooks.length === 0) {
      fetch('/bible/books.json')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setBibleBooks(data);
        })
        .catch(() => {});
    }
  }, [isSearchOpen, addModalTab, bibleBooks.length]);

  // Load selected Bible book & chapter verses
  useEffect(() => {
    if (!isSearchOpen || addModalTab !== 'bible' || !selectedBibleBookId) return;
    setIsLoadingBible(true);
    const prefix = bibleVersion === 'id' ? '/bible' : `/bible/${bibleVersion}`;
    fetch(`${prefix}/${selectedBibleBookId}.json`)
      .then((r) => r.json())
      .then((bookJson) => {
        const chap = bookJson?.chapters?.[selectedBibleChapter] || bookJson?.chapters?.[String(selectedBibleChapter)];
        const verses = Array.isArray(chap?.verses) ? chap.verses : [];
        setBibleChapterVerses(verses);
        if (verses.length > 0) {
          const maxV = verses[verses.length - 1].verse || verses.length;
          setBibleVerseStart((prev) => Math.min(prev, maxV));
          setBibleVerseEnd((prev) => Math.min(Math.max(prev, 1), maxV));
        }
        setIsLoadingBible(false);
      })
      .catch(() => {
        setBibleChapterVerses([]);
        setIsLoadingBible(false);
      });
  }, [isSearchOpen, addModalTab, selectedBibleBookId, selectedBibleChapter, bibleVersion]);

  // Ambil data kidung saat modal pencarian dibuka
  useEffect(() => {
    if (isSearchOpen && allKidungData.length === 0) {
      setIsLoadingKidung(true);
      fetch('/kidung/kidung_data.json?v=2')
        .then((res) => res.json())
        .then((json) => {
          const combined = [...(json.kidung || []), ...(json.suplemen || [])];
          setAllKidungData(combined);
          setIsLoadingKidung(false);
        })
        .catch((err) => {
          console.warn('Gagal memuat katalog kidung:', err);
          setIsLoadingKidung(false);
        });
    }
  }, [isSearchOpen, allKidungData.length]);

  const addSongToSetlist = (songData: any) => {
    const rawNum = songData.formattedNumber || songData.displayNumber || String(songData.number || songData.id || '');
    const cleanNum = rawNum.replace(/^(No\.\s*|S\.\s*|#\s*)/i, '').replace(/^0+/, '') || rawNum;
    const songType = songData.type === 'suplemen' ? 'Suplemen' : 'Kidung';
    const songTitle = songData.title || songData.firstLine || '';
    const formattedTitle = `${songType} ${cleanNum}${songTitle ? ` - ${songTitle}` : ''}`.trim();

    // Ambil bait lirik baik dari 'stanzas' (format database kidung) maupun 'lyrics'
    const stanzaList: any[] = songData.stanzas || songData.lyrics || [];
    let slides: SlideItem[] = [];
    let rawTextParts: string[] = [];

    if (Array.isArray(stanzaList) && stanzaList.length > 0) {
      let verseCounter = 1;
      stanzaList.forEach((st: any, idx: number) => {
        const lines: string[] = Array.isArray(st.lines)
          ? st.lines.filter((l: string) => typeof l === 'string' && l.trim().length > 0)
          : (typeof st.text === 'string' ? st.text.split('\n') : []);

        if (lines.length === 0) return;
        // Lewati catatan kaki seperti "1 = Allah Tritunggal"
        if (lines.length === 1 && /^\d+\s*=\s*/.test(lines[0].trim())) return;

        const isChorus = Boolean(st.isChorus || st.type === 'chorus');
        const label = isChorus ? 'Koor' : `Bait ${st.num || verseCounter++}`;
        const content = lines.join('\n');

        rawTextParts.push(content);

        // Jika satu bait panjang (> 4 baris), pecah per 4 baris
        if (lines.length > 4) {
          for (let i = 0; i < lines.length; i += 4) {
            const chunk = lines.slice(i, i + 4);
            const part = Math.floor(i / 4) + 1;
            slides.push({
              id: `slide-${idx}-${part}`,
              label: `${label} (${part})`,
              content: chunk.join('\n'),
            });
          }
        } else {
          slides.push({
            id: `slide-${idx}-0`,
            label,
            content,
          });
        }
      });
    }

    if (slides.length === 0) {
      let fallback = '';
      if (typeof songData.text === 'string' && songData.text.trim()) {
        fallback = songData.text;
      } else if (typeof songData.firstLine === 'string' && songData.firstLine.trim()) {
        fallback = songData.firstLine;
      } else {
        fallback = 'Bait lagu belum tersedia';
      }
      slides = chunkTextToSlides(fallback, 4);
      rawTextParts = [fallback];
    }

    const newSong: SongSetItem = {
      id: `kidung-${songData.id || songData.formattedNumber || 'item'}-${Date.now()}`,
      title: formattedTitle,
      subtitle: '', // Kosongkan agar tidak menduplikasi kategori di pill badge live
      rawText: rawTextParts.join('\n\n'),
      slides,
    };

    setSetlist((prev) => [...prev, newSong]);
    setSelectedSong(newSong);
    setActiveSlideIdx(0);
    setIsSearchOpen(false);
    setSearchKidungQuery('');

    // Langsung siarkan bait 1 ke layar proyektor
    broadcastState({
      roomId,
      activeSongId: newSong.id,
      title: newSong.title,
      subtitle: newSong.subtitle,
      content: newSong.slides[0]?.content || '',
      slideIndex: 0,
      totalSlides: newSong.slides.length,
      mode: 'LIVE',
      theme: stageTheme,
      fontSize: contentFontSize,
      badgeFontSize: badgeFontSize,
      tickerActive: state.tickerActive,
      tickerText: state.tickerText,
      tickerSpeed: state.tickerSpeed,
      updatedAt: Date.now(),
    });
  };

  const removeSongFromSetlist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSetlist((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (selectedSong.id === id && filtered.length > 0) {
        setSelectedSong(filtered[0]);
        setActiveSlideIdx(0);
      }
      return filtered;
    });
  };

  const goToSlide = useCallback(
    (song: SongSetItem, index: number, mode: DisplayMode = 'LIVE') => {
      if (!song || song.slides.length === 0) return;
      const clampedIdx = Math.max(0, Math.min(index, song.slides.length - 1));
      const slide = song.slides[clampedIdx];
      setSelectedSong(song);
      setActiveSlideIdx(clampedIdx);

      broadcastState({
        roomId,
        activeSongId: song.id,
        title: song.title,
        subtitle: song.subtitle,
        content: slide ? slide.content : '',
        slideIndex: clampedIdx,
        totalSlides: song.slides.length,
        mode,
        theme: stageTheme,
        fontSize: contentFontSize,
        badgeFontSize: badgeFontSize,
        tickerActive: state.tickerActive,
        tickerText: state.tickerText,
        tickerSpeed: state.tickerSpeed,
        updatedAt: Date.now(),
      });
    },
    [broadcastState, roomId, stageTheme, contentFontSize, badgeFontSize, state.tickerActive, state.tickerText, state.tickerSpeed]
  );

  const setDisplayMode = useCallback(
    (mode: DisplayMode) => {
      broadcastState({
        ...state,
        mode,
        theme: stageTheme,
        fontSize: contentFontSize,
        badgeFontSize: badgeFontSize,
        updatedAt: Date.now(),
      });
    },
    [broadcastState, state, stageTheme, contentFontSize, badgeFontSize]
  );

  const handleThemeChange = (newTheme: 'default' | 'lower-third' | 'amber-gold') => {
    setStageTheme(newTheme);
    broadcastState({
      ...state,
      theme: newTheme,
      updatedAt: Date.now(),
    });
  };

  const broadcastQuickText = () => {
    if (!quickBody.trim()) return;
    const slides = chunkTextToSlides(quickBody, 4);
    const item: SongSetItem = {
      id: `quick-${Date.now()}`,
      title: quickTitle.trim() || 'PENGUMUMAN',
      subtitle: 'Teks / Ayat Langsung',
      rawText: quickBody,
      slides,
    };
    setSetlist((prev) => [item, ...prev]);
    setSelectedSong(item);
    setActiveSlideIdx(0);
    goToSlide(item, 0, 'LIVE');
    setIsQuickTextOpen(false);
    setQuickBody('');
  };

  // Navigasi Keyboard (Panah Kiri/Kanan, Space, B = Blackout, C = Clear, L = Live)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToSlide(selectedSong, activeSlideIdx + 1, 'LIVE');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToSlide(selectedSong, activeSlideIdx - 1, 'LIVE');
      } else if (e.key.toLowerCase() === 'b') {
        setDisplayMode(state.mode === 'BLACKOUT' ? 'LIVE' : 'BLACKOUT');
      } else if (e.key.toLowerCase() === 'c') {
        setDisplayMode(state.mode === 'CLEAR' ? 'LIVE' : 'CLEAR');
      } else if (e.key.toLowerCase() === 'l') {
        setDisplayMode('LIVE');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSlideIdx, goToSlide, selectedSong, setDisplayMode, state.mode]);

  const openLiveWindow = () => {
    const targetUrl = `/live?room=${encodeURIComponent(roomId)}`;
    window.open(targetUrl, 'LiveStageWindow', 'width=1280,height=720,menubar=no,toolbar=no');
  };

  const addBibleToSetlist = () => {
    const startV = Math.min(bibleVerseStart, bibleVerseEnd);
    const endV = Math.max(bibleVerseStart, bibleVerseEnd);
    const picked = bibleChapterVerses.filter((v) => v.verse >= startV && v.verse <= endV);
    if (picked.length === 0) return;

    const bookObj = bibleBooks.find((b) => b.id === selectedBibleBookId);
    const isEnVer = ['en', 'kjv', 'asv', 'net', 'scofield'].includes(bibleVersion);
    const bookLabel = isEnVer ? (bookObj?.nameEn || bookObj?.name || selectedBibleBookId) : (bookObj?.name || selectedBibleBookId);
    const verCode =
      bibleVersion === 'id' ? 'AVP' :
      bibleVersion === 'tb' ? 'TB' :
      bibleVersion === 'en' ? 'RCV' :
      bibleVersion === 'kjv' ? 'KJV' :
      bibleVersion === 'asv' ? 'ASV' :
      bibleVersion === 'net' ? 'NET' :
      'Scofield';
    const refRange = startV === endV ? `${startV}` : `${startV}–${endV}`;
    const title = `${bookLabel} ${selectedBibleChapter}:${refRange} (${verCode})`;

    const slides: SlideItem[] = picked.map((v, idx) => ({
      id: `bible-${selectedBibleBookId}-${selectedBibleChapter}-${v.verse}-${idx}`,
      label: `Ayat ${v.verse}`,
      content: `${v.verse}. ${v.text}`,
    }));

    const item: SongSetItem = {
      id: `bible-${selectedBibleBookId}-${selectedBibleChapter}-${startV}-${endV}-${Date.now()}`,
      title,
      subtitle: 'Ayat Alkitab',
      rawText: picked.map((v) => `${v.verse}. ${v.text}`).join('\n\n'),
      slides,
    };

    setSetlist((prev) => [...prev, item]);
    goToSlide(item, 0, 'LIVE');
    setIsSearchOpen(false);
  };

  const filteredKidung = allKidungData.filter((k) => {
    if (kidungFilter !== 'all' && (k.type || 'kidung') !== kidungFilter) return false;
    if (!searchKidungQuery.trim()) return true;
    const q = searchKidungQuery.trim().toLowerCase();
    const typeLabel = k.type === 'suplemen' ? 'suplemen' : 'kidung';
    return (
      typeLabel.includes(q) ||
      String(k.formattedNumber || k.id || '').toLowerCase().includes(q) ||
      (k.title && k.title.toLowerCase().includes(q)) ||
      (k.firstLine && k.firstLine.toLowerCase().includes(q)) ||
      (k.category && k.category.toLowerCase().includes(q))
    );
  }).slice(0, 40);

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none">
      {/* Top Bar */}
      <header className="h-14 border-b border-white/10 px-3 sm:px-4 flex items-center justify-between bg-zinc-950/85 backdrop-blur-xl z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="p-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition shrink-0"
              title="Kembali ke Aplikasi Utama"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0 animate-pulse" />
            <h1 className="font-bold tracking-tight text-xs sm:text-sm text-white truncate">
              Presenter Console
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/5 text-zinc-300 border border-white/10 shrink-0">
            <span className="text-zinc-500 font-medium">Room:</span>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="bg-transparent border-none outline-none text-emerald-400 font-mono w-20 text-xs font-semibold"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Tombol Pengatur Ukuran Teks */}
          <button
            onClick={() => setIsFontSizeModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 text-xs font-semibold border border-white/10 transition shadow-sm"
            title="Sesuaikan ukuran font lirik dan judul proyektor"
          >
            <Type className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Ukuran Teks</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
              {contentFontSize}px
            </span>
          </button>

          {/* Pilihan Tema Layar Output (Artistic Animated Dropdown) */}
          <div className="relative hidden md:block">
            {isThemeDropdownOpen && (
              <div className="fixed inset-0 z-30" onClick={() => setIsThemeDropdownOpen(false)} />
            )}
            <button
              type="button"
              onClick={() => setIsThemeDropdownOpen((prev) => !prev)}
              className="relative z-40 flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-200 transition-all cursor-pointer active:scale-95"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-zinc-400 hidden lg:inline">Tema:</span>
              <span className={stageTheme === 'amber-gold' ? 'text-amber-300' : stageTheme === 'lower-third' ? 'text-cyan-300' : 'text-white'}>
                {stageTheme === 'amber-gold' ? 'Emas Elegan' : stageTheme === 'lower-third' ? 'Lower-Third' : 'Default (Tengah)'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isThemeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isThemeDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-zinc-900/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] p-1.5 space-y-0.5 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 origin-top-right">
                {[
                  { id: 'default', label: 'Default (Tengah)', desc: 'Latar hitam teks putih', dot: 'bg-white' },
                  { id: 'amber-gold', label: 'Emas Elegan', desc: 'Nuansa emas hangat', dot: 'bg-amber-400' },
                  { id: 'lower-third', label: 'Lower-Third', desc: 'Overlay bawah transparan', dot: 'bg-cyan-400' },
                ].map((item) => {
                  const active = stageTheme === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        handleThemeChange(item.id as any);
                        setIsThemeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                        active ? 'bg-[#3B4B34]/70 text-white shadow-sm ring-1 ring-[#3B4B34]' : 'hover:bg-white/10 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.dot}`} />
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">{item.label}</div>
                          <div className="text-[10px] text-zinc-400 truncate">{item.desc}</div>
                        </div>
                      </div>
                      {active && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsTickerModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              state.tickerActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
            }`}
            title="Buka pengatur teks berjalan (running text)"
          >
            <Radio className={`w-3.5 h-3.5 ${state.tickerActive ? 'text-amber-400 animate-pulse' : 'text-zinc-400'}`} />
            <span className="hidden md:inline">Teks Berjalan</span>
            {state.tickerActive && (
              <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.2 rounded font-extrabold">ON</span>
            )}
          </button>

          <button
            onClick={() => setIsQuickTextOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium border border-white/10 transition"
            title="Ketik teks langsung untuk ditayangkan"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-amber-400" />
            <span>Spontan</span>
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3B4B34] hover:bg-[#475b3e] text-white text-xs font-semibold border border-white/15 transition shadow-sm cursor-pointer"
            title="Tambah Kidung, Suplemen, atau Ayat Alkitab ke Setlist"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tambah Materi</span>
            <span className="sm:hidden">Materi</span>
          </button>

          <button
            onClick={openLiveWindow}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition"
            title="Buka layar proyeksi di jendela baru"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Layar Proyektor</span>
          </button>
        </div>
      </header>

      {/* Responsive Segmented Tabs for Mobile (< md) */}
      <div className="md:hidden flex items-center justify-around border-b border-white/10 bg-zinc-950/90 backdrop-blur px-2 py-2 gap-1.5 z-10 shrink-0">
        <button
          onClick={() => setActiveConsoleTab('queue')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
            activeConsoleTab === 'queue'
              ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/20'
              : 'text-zinc-400 hover:text-white bg-white/5'
          }`}
        >
          <span>Antrean</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-black/40 rounded-full font-mono">{setlist.length}</span>
        </button>
        <button
          onClick={() => setActiveConsoleTab('slides')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
            activeConsoleTab === 'slides'
              ? 'bg-[#3B4B34] text-white shadow-sm ring-1 ring-[#3B4B34]'
              : 'text-zinc-400 hover:text-white bg-white/5'
          }`}
        >
          <span>Slide Lirik</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-black/40 rounded-full font-mono">{selectedSong.slides.length}</span>
        </button>
        <button
          onClick={() => setActiveConsoleTab('controls')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
            activeConsoleTab === 'controls'
              ? 'bg-amber-600/40 text-amber-200 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-white bg-white/5'
          }`}
        >
          <span>Preview & Kontrol</span>
        </button>
      </div>

      {/* 3-Column Workspace */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden h-[calc(100vh-3.5rem)]">
        {/* Panel 1: Setlist */}
        <aside
          className={`border-r border-zinc-800 p-3 md:p-4 overflow-y-auto bg-zinc-900/50 flex-col justify-between md:flex md:col-span-3 md:h-full ${
            activeConsoleTab === 'queue' ? 'flex col-span-12 h-full' : 'hidden'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Setlist Antrean</h2>
              <span className="text-[10px] text-zinc-400 font-mono bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                {setlist.length} Lagu
              </span>
            </div>
            <div className="space-y-2">
              {setlist.map((song, idx) => {
                const isSelected = song.id === selectedSong.id;
                return (
                  <div
                    key={`${song.id}-${idx}`}
                    onClick={() => {
                      goToSlide(song, 0, 'LIVE');
                      setActiveConsoleTab('slides');
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer relative group flex items-start justify-between ${
                      isSelected
                        ? 'bg-[#3B4B34]/30 border-[#3B4B34] text-white shadow-lg ring-1 ring-[#3B4B34]/50'
                        : 'bg-white/[0.03] border-white/10 text-zinc-300 hover:border-white/20 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-sm truncate">{song.title}</div>
                      {song.subtitle && <div className="text-xs text-zinc-400 mt-0.5 truncate">{song.subtitle}</div>}
                      <div className="text-[10px] text-zinc-500 mt-1.5 font-mono">{song.slides.length} Slide</div>
                    </div>
                    {setlist.length > 1 && (
                      <button
                        onClick={(e) => removeSongFromSetlist(e, song.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition"
                        title="Hapus dari Setlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 mt-4 text-[11px] text-zinc-500 space-y-1">
            <div className="font-semibold text-zinc-400">💡 Tips Operator:</div>
            <div>• BroadcastChannel aktif (~0ms lokal).</div>
            <div>• Klik salah satu slide untuk langsung ditayangkan.</div>
          </div>
        </aside>

        {/* Panel 2: Slide Grid */}
        <main
          className={`p-4 sm:p-5 overflow-y-auto bg-zinc-950 flex-col md:block md:col-span-6 md:h-full ${
            activeConsoleTab === 'slides' ? 'flex col-span-12 h-full' : 'hidden'
          }`}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80 gap-3">
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-wide truncate">
                {selectedSong.title}
              </h1>
              {selectedSong.subtitle && <p className="text-xs text-zinc-400 mt-0.5 truncate">{selectedSong.subtitle}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-zinc-300 border border-white/10 font-mono font-medium">
                Slide {activeSlideIdx + 1} dari {selectedSong.slides.length}
              </span>
              <button
                onClick={() => setIsFontSizeModalOpen(true)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-amber-300 transition"
                title="Sesuaikan ukuran font proyektor"
              >
                <Type className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-16 lg:pb-8">
            {selectedSong.slides.map((slide, idx) => {
              const isLive = state.activeSongId === selectedSong.id && state.slideIndex === idx && state.mode === 'LIVE';
              return (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(selectedSong, idx, 'LIVE')}
                  className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between min-h-[140px] relative cursor-pointer ${
                    isLive
                      ? 'bg-[#3B4B34]/35 border-[#3B4B34] ring-2 ring-[#3B4B34]/60 shadow-xl'
                      : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10">
                      {slide.label}
                    </span>
                    {isLive && (
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-red-600 text-white animate-pulse shadow-md tracking-wider">
                        LIVE
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base whitespace-pre-line leading-relaxed text-zinc-200 font-medium font-sans">
                    {slide.content}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Floating Operator Bar on Mobile (< md) */}
          <div className="md:hidden sticky bottom-2 inset-x-0 bg-zinc-950/95 backdrop-blur-xl border border-white/15 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between gap-2 z-20 mt-auto">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => goToSlide(selectedSong, activeSlideIdx - 1, 'LIVE')}
                disabled={activeSlideIdx <= 0}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-30 text-xs font-bold transition"
              >
                ← Prev
              </button>
              <button
                onClick={() => goToSlide(selectedSong, activeSlideIdx + 1, 'LIVE')}
                disabled={activeSlideIdx >= selectedSong.slides.length - 1}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-30 text-xs font-bold transition"
              >
                Next →
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setDisplayMode('LIVE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  state.mode === 'LIVE' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                LIVE
              </button>
              <button
                onClick={() => setDisplayMode('CLEAR')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  state.mode === 'CLEAR' ? 'bg-amber-600 text-white shadow-sm' : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                CLEAR
              </button>
              <button
                onClick={() => setDisplayMode('BLACKOUT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  state.mode === 'BLACKOUT' ? 'bg-red-600 text-white shadow-sm' : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                BLACK
              </button>
            </div>
          </div>
        </main>

        {/* Panel 3: Live Preview & Quick Controls (Zero-Scroll Compact Fit) */}
        <aside
          className={`border-l border-zinc-800 p-3 bg-zinc-900/50 flex-col justify-between overflow-y-auto md:overflow-hidden md:flex md:col-span-3 md:h-full ${
            activeConsoleTab === 'controls' ? 'flex col-span-12 h-full' : 'hidden'
          }`}
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Pratinjau Layar</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                state.mode === 'LIVE' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-zinc-800 text-zinc-500'
              }`}>
                {state.mode}
              </span>
            </div>

            <div className="aspect-[16/8.2] w-full rounded-2xl bg-black border border-white/10 p-3 flex flex-col items-center justify-center text-center overflow-hidden relative shadow-inner">
              {state.mode === 'BLACKOUT' && (
                <span className="text-[11px] text-zinc-600 font-mono">[Layar Hitam / Blackout]</span>
              )}
              {state.mode === 'CLEAR' && (
                <span className="text-[11px] text-zinc-500 font-mono">[Teks Disembunyikan (Clear)]</span>
              )}
              {state.mode === 'LIVE' && (
                <p className="text-[11px] whitespace-pre-line text-white font-semibold leading-snug line-clamp-4">
                  {state.content || 'Belum ada slide yang aktif'}
                </p>
              )}

              {state.mode === 'LIVE' && state.title && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-0.5 rounded-full border border-white/10 text-[9px] text-zinc-300 truncate max-w-[88%] font-medium">
                  {state.title} • {state.slideIndex + 1}/{state.totalSlides}
                </div>
              )}

              {state.tickerActive && state.tickerText && state.mode !== 'BLACKOUT' && (
                <div className="absolute bottom-0 inset-x-0 bg-black/95 border-t border-amber-500/30 px-2 py-0.5 text-[9px] text-amber-300 flex items-center gap-1.5 overflow-hidden z-10">
                  <span className="font-bold shrink-0 uppercase text-[8px] bg-amber-500/30 text-amber-300 px-1 rounded">TICKER</span>
                  <div className="truncate text-zinc-300">{state.tickerText}</div>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setDisplayMode('LIVE')}
                className={`py-1.5 rounded-xl text-[11px] font-bold border transition ${
                  state.mode === 'LIVE'
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                LIVE (L)
              </button>
              <button
                onClick={() => setDisplayMode('CLEAR')}
                className={`py-1.5 rounded-xl text-[11px] font-bold border transition ${
                  state.mode === 'CLEAR'
                    ? 'bg-amber-600 border-amber-500 text-white shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                CLEAR (C)
              </button>
              <button
                onClick={() => setDisplayMode('BLACKOUT')}
                className={`py-1.5 rounded-xl text-[11px] font-bold border transition ${
                  state.mode === 'BLACKOUT'
                    ? 'bg-red-600 border-red-500 text-white shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                BLACK (B)
              </button>
            </div>

            {/* Kontrol Cepat Ukuran Font Proyektor */}
            <div className="p-2.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-amber-400" />
                  Ukuran Teks
                </span>
                <button
                  onClick={() => setIsFontSizeModalOpen(true)}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold"
                >
                  Atur →
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <div className="px-2 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <button
                    onClick={() => updateFontSizes(Math.max(28, contentFontSize - 4), undefined)}
                    className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 font-bold text-[11px]"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-white text-[11px]">{contentFontSize}px</span>
                  <button
                    onClick={() => updateFontSizes(Math.min(96, contentFontSize + 4), undefined)}
                    className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 font-bold text-[11px]"
                  >
                    +
                  </button>
                </div>
                <div className="px-2 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <button
                    onClick={() => updateFontSizes(undefined, Math.max(10, badgeFontSize - 2))}
                    className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 font-bold text-[11px]"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-white text-[11px]">{badgeFontSize}px</span>
                  <button
                    onClick={() => updateFontSizes(undefined, Math.min(32, badgeFontSize + 2))}
                    className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 font-bold text-[11px]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Panel Kontrol Cepat Teks Berjalan (Ticker) */}
            <div className="p-2.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${state.tickerActive ? 'bg-amber-400 animate-pulse' : 'bg-zinc-600'}`} />
                  Teks Berjalan
                </span>
                <button
                  onClick={toggleTicker}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition ${
                    state.tickerActive
                      ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
                  }`}
                >
                  {state.tickerActive ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={tickerInput}
                  onChange={(e) => setTickerInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyTickerText()}
                  placeholder="Ketik pengumuman..."
                  className="w-full px-2.5 py-1 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 placeholder-zinc-500 outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => applyTickerText()}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shrink-0 transition"
                >
                  Kirim
                </button>
              </div>

              <button
                onClick={() => {
                  const preset = QUICK_TICKER_PRESETS[0];
                  setTickerInput(preset);
                  applyTickerText(preset);
                }}
                className="text-[10px] text-zinc-400 hover:text-amber-300 bg-zinc-900/90 px-2 py-1 rounded-lg border border-zinc-800/80 hover:border-zinc-700 transition truncate text-left"
                title={QUICK_TICKER_PRESETS[0]}
              >
                + {QUICK_TICKER_PRESETS[0]}
              </button>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 border-t border-zinc-800/80 pt-2 font-mono">
            <div className="text-zinc-400 font-semibold mb-1">Pintasan Keyboard:</div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
              <div><kbd className="px-1 bg-zinc-800 rounded">Spasi</kbd>/<kbd className="px-1 bg-zinc-800 rounded">→</kbd> Next</div>
              <div><kbd className="px-1 bg-zinc-800 rounded">←</kbd> Prev</div>
              <div><kbd className="px-1 bg-zinc-800 rounded">B</kbd> Blackout</div>
              <div><kbd className="px-1 bg-zinc-800 rounded">C</kbd> Clear • <kbd className="px-1 bg-zinc-800 rounded">L</kbd> Live</div>
            </div>
          </div>
        </aside>
      </div>

      {/* Modal Dialog Cari & Tambah Materi (Kidung, Suplemen & Ayat Alkitab) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-zinc-900/95 backdrop-blur-2xl border border-white/15 rounded-3xl w-full max-w-xl p-5 sm:p-6 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8)] flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 p-1 rounded-2xl bg-black/40 border border-white/10">
                <button
                  type="button"
                  onClick={() => setAddModalTab('kidung')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    addModalTab === 'kidung'
                      ? 'bg-[#3B4B34] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Music className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kidung &amp; Suplemen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddModalTab('bible')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    addModalTab === 'bible'
                      ? 'bg-[#3B4B34] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ayat Alkitab</span>
                </button>
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {addModalTab === 'kidung' ? (
              <>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Cari nomor, judul, atau kata 'Suplemen'..."
                      value={searchKidungQuery}
                      onChange={(e) => setSearchKidungQuery(e.target.value)}
                      autoFocus
                      className="w-full pl-10 pr-4 py-2 rounded-2xl bg-zinc-800/80 border border-white/10 text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex p-1 rounded-2xl bg-black/40 border border-white/10 shrink-0">
                    {[
                      { id: 'all', label: 'Semua' },
                      { id: 'kidung', label: 'Kidung' },
                      { id: 'suplemen', label: 'Suplemen' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setKidungFilter(f.id as any)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                          kidungFilter === f.id ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1">
                  {isLoadingKidung ? (
                    <div className="p-8 text-center text-xs text-zinc-500">Memuat basis data kidung...</div>
                  ) : filteredKidung.length === 0 ? (
                    <div className="p-8 text-center text-xs text-zinc-500">Kidung atau Suplemen tidak ditemukan.</div>
                  ) : (
                    filteredKidung.map((k) => (
                      <button
                        key={`${k.type || 'kidung'}-${k.id}`}
                        onClick={() => addSongToSetlist(k)}
                        className="w-full text-left p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/40 transition flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              k.type === 'suplemen' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {k.type === 'suplemen' ? 'Suplemen' : 'Kidung'} {k.formattedNumber || k.id}
                            </span>
                            <span className="text-sm font-semibold text-white truncate">
                              {k.title || k.firstLine || ''}
                            </span>
                          </div>
                          {k.category && <div className="text-xs text-zinc-400 mt-1 truncate">{k.category}</div>}
                        </div>
                        <Plus className="w-4 h-4 text-emerald-400 shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="mt-4 flex-1 flex flex-col gap-3 overflow-visible">
                {/* Pilih Terjemahan (Semua 7 Versi) */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Terjemahan</span>
                  <div className="flex flex-wrap p-1 rounded-2xl bg-black/40 border border-white/10 gap-1">
                    {[
                      { id: 'id', label: 'AVP' },
                      { id: 'tb', label: 'TB' },
                      { id: 'en', label: 'RCV' },
                      { id: 'kjv', label: 'KJV' },
                      { id: 'asv', label: 'ASV' },
                      { id: 'net', label: 'NET' },
                      { id: 'scofield', label: 'Scofield' },
                    ].map((ver) => (
                      <button
                        key={ver.id}
                        type="button"
                        onClick={() => setBibleVersion(ver.id as any)}
                        className={`flex-1 min-w-[44px] px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                          bibleVersion === ver.id ? 'bg-[#3B4B34] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {ver.label}
                      </button>
                    ))}
                  </div>
                </div>

                {openBibleDropdown && (
                  <div className="fixed inset-0 z-30" onClick={() => setOpenBibleDropdown(null)} />
                )}

                {/* Pilih Kitab & Pasal (Custom Animated Frosted Dropdowns) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 relative z-40">
                  <div className="sm:col-span-2 relative">
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">Kitab</label>
                    <button
                      type="button"
                      onClick={() => setOpenBibleDropdown((prev) => prev === 'book' ? null : 'book')}
                      className="w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-zinc-800/90 hover:bg-zinc-800 border border-white/10 text-xs font-bold text-white transition cursor-pointer"
                    >
                      <span className="truncate">
                        {(() => {
                          const b = bibleBooks.find((x) => x.id === selectedBibleBookId);
                          return b ? (bibleVersion === 'en' ? (b.nameEn || b.name) : b.name) : selectedBibleBookId;
                        })()}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${openBibleDropdown === 'book' ? 'rotate-180' : ''}`} />
                    </button>

                    {openBibleDropdown === 'book' && (
                      <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 rounded-3xl bg-zinc-900/95 backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.85)] p-2.5 space-y-2 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 origin-top-left">
                        <input
                          type="text"
                          value={bibleBookSearch}
                          onChange={(e) => setBibleBookSearch(e.target.value)}
                          placeholder="Cari nama kitab..."
                          autoFocus
                          className="w-full px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500"
                        />
                        <div className="max-h-56 overflow-y-auto grid grid-cols-2 gap-1 pr-1">
                          {bibleBooks
                            .filter((b) => {
                              if (!bibleBookSearch.trim()) return true;
                              const q = bibleBookSearch.toLowerCase();
                              return b.name.toLowerCase().includes(q) || (b.nameEn && b.nameEn.toLowerCase().includes(q));
                            })
                            .map((b) => {
                              const active = selectedBibleBookId === b.id;
                              return (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedBibleBookId(b.id);
                                    setSelectedBibleChapter(1);
                                    setBibleVerseStart(1);
                                    setBibleVerseEnd(1);
                                    setBibleBookSearch('');
                                    setOpenBibleDropdown('chapter');
                                  }}
                                  className={`px-2.5 py-2 rounded-xl text-left text-xs font-semibold truncate transition cursor-pointer ${
                                    active ? 'bg-[#3B4B34] text-white shadow-sm' : 'text-zinc-300 hover:bg-white/10'
                                  }`}
                                >
                                  {bibleVersion === 'en' ? (b.nameEn || b.name) : b.name}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">Pasal</label>
                    <button
                      type="button"
                      onClick={() => setOpenBibleDropdown((prev) => prev === 'chapter' ? null : 'chapter')}
                      className="w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-zinc-800/90 hover:bg-zinc-800 border border-white/10 text-xs font-bold text-white transition cursor-pointer"
                    >
                      <span>Pasal {selectedBibleChapter}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${openBibleDropdown === 'chapter' ? 'rotate-180' : ''}`} />
                    </button>

                    {openBibleDropdown === 'chapter' && (
                      <div className="absolute right-0 top-full mt-2 w-64 rounded-3xl bg-zinc-900/95 backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.85)] p-2.5 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 origin-top-right">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1 pb-2">Pilih Pasal</div>
                        <div className="max-h-56 overflow-y-auto grid grid-cols-5 gap-1.5 pr-1">
                          {Array.from(
                            { length: bibleBooks.find((b) => b.id === selectedBibleBookId)?.chapters || 28 },
                            (_, i) => i + 1
                          ).map((c) => {
                            const active = selectedBibleChapter === c;
                            return (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  setSelectedBibleChapter(c);
                                  setBibleVerseStart(1);
                                  setBibleVerseEnd(1);
                                  setOpenBibleDropdown('start');
                                }}
                                className={`h-9 rounded-xl text-xs font-bold tabular-nums transition cursor-pointer ${
                                  active ? 'bg-[#3B4B34] text-white shadow-sm' : 'bg-white/5 text-zinc-300 hover:bg-white/15'
                                }`}
                              >
                                {c}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pilih Rentang Ayat (Custom Animated Number Grids) */}
                <div className="grid grid-cols-2 gap-2.5 relative z-30">
                  <div className="relative">
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">Dari Ayat</label>
                    <button
                      type="button"
                      onClick={() => setOpenBibleDropdown((prev) => prev === 'start' ? null : 'start')}
                      className="w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-zinc-800/90 hover:bg-zinc-800 border border-white/10 text-xs font-bold text-white transition cursor-pointer"
                    >
                      <span>Ayat {bibleVerseStart}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${openBibleDropdown === 'start' ? 'rotate-180' : ''}`} />
                    </button>

                    {openBibleDropdown === 'start' && (
                      <div className="absolute left-0 top-full mt-2 w-64 rounded-3xl bg-zinc-900/95 backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.85)] p-2.5 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 origin-top-left">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1 pb-2">Dari Ayat</div>
                        <div className="max-h-52 overflow-y-auto grid grid-cols-5 gap-1.5 pr-1">
                          {bibleChapterVerses.map((v) => {
                            const active = bibleVerseStart === v.verse;
                            return (
                              <button
                                key={v.verse}
                                type="button"
                                onClick={() => {
                                  setBibleVerseStart(v.verse);
                                  if (bibleVerseEnd < v.verse) setBibleVerseEnd(v.verse);
                                  setOpenBibleDropdown('end');
                                }}
                                className={`h-9 rounded-xl text-xs font-bold tabular-nums transition cursor-pointer ${
                                  active ? 'bg-[#3B4B34] text-white shadow-sm' : 'bg-white/5 text-zinc-300 hover:bg-white/15'
                                }`}
                              >
                                {v.verse}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">Sampai Ayat</label>
                    <button
                      type="button"
                      onClick={() => setOpenBibleDropdown((prev) => prev === 'end' ? null : 'end')}
                      className="w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-zinc-800/90 hover:bg-zinc-800 border border-white/10 text-xs font-bold text-white transition cursor-pointer"
                    >
                      <span>Ayat {bibleVerseEnd}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${openBibleDropdown === 'end' ? 'rotate-180' : ''}`} />
                    </button>

                    {openBibleDropdown === 'end' && (
                      <div className="absolute right-0 top-full mt-2 w-64 rounded-3xl bg-zinc-900/95 backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.85)] p-2.5 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 origin-top-right">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1 pb-2">Sampai Ayat</div>
                        <div className="max-h-52 overflow-y-auto grid grid-cols-5 gap-1.5 pr-1">
                          {bibleChapterVerses
                            .filter((v) => v.verse >= bibleVerseStart)
                            .map((v) => {
                              const active = bibleVerseEnd === v.verse;
                              return (
                                <button
                                  key={v.verse}
                                  type="button"
                                  onClick={() => {
                                    setBibleVerseEnd(v.verse);
                                    setOpenBibleDropdown(null);
                                  }}
                                  className={`h-9 rounded-xl text-xs font-bold tabular-nums transition cursor-pointer ${
                                    active ? 'bg-[#3B4B34] text-white shadow-sm' : 'bg-white/5 text-zinc-300 hover:bg-white/15'
                                  }`}
                                >
                                  {v.verse}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pratinjau Ayat Terpilih */}
                <div className="flex-1 min-h-[110px] max-h-48 overflow-y-auto p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  {isLoadingBible ? (
                    <div className="text-xs text-zinc-500 text-center py-4">Memuat ayat...</div>
                  ) : bibleChapterVerses.length === 0 ? (
                    <div className="text-xs text-zinc-500 text-center py-4">Ayat tidak tersedia.</div>
                  ) : (
                    bibleChapterVerses
                      .filter((v) => v.verse >= Math.min(bibleVerseStart, bibleVerseEnd) && v.verse <= Math.max(bibleVerseStart, bibleVerseEnd))
                      .map((v) => (
                        <p key={v.verse} className="text-xs text-zinc-200 leading-relaxed">
                          <span className="font-bold text-amber-400 mr-1.5">{v.verse}.</span>
                          {v.text}
                        </p>
                      ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={addBibleToSetlist}
                  disabled={isLoadingBible || bibleChapterVerses.length === 0}
                  className="w-full py-2.5 rounded-2xl bg-[#3B4B34] hover:bg-[#495d40] disabled:opacity-40 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambahkan Ayat ke Setlist &amp; Tayangkan</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Dialog Teks Spontan / Pengumuman */}
      {isQuickTextOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-amber-500" />
                Teks Spontan / Pengumuman Langsung
              </h3>
              <button
                onClick={() => setIsQuickTextOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block mb-1">
                  Judul Teks / Label
                </label>
                <input
                  type="text"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="Misal: PENGUMUMAN, MATIUS 28:19, DOA MALAM"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block mb-1">
                  Isi Teks (Otomatis dipecah per bait/slide jika lebih dari 4 baris)
                </label>
                <textarea
                  rows={5}
                  value={quickBody}
                  onChange={(e) => setQuickBody(e.target.value)}
                  placeholder="Ketik teks yang ingin segera ditampilkan ke layar proyektor..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500 leading-relaxed font-sans"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsQuickTextOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition"
              >
                Batal
              </button>
              <button
                onClick={broadcastQuickText}
                disabled={!quickBody.trim()}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Tayangkan Langsung ke Proyektor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog Teks Berjalan (Ticker) Lengkap */}
      {isTickerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-amber-500 animate-pulse" />
                Pengatur Teks Berjalan (Running Text)
              </h3>
              <button
                onClick={() => setIsTickerModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block mb-1">
                  Isi Teks Pengumuman Berjalan
                </label>
                <textarea
                  rows={3}
                  value={tickerInput}
                  onChange={(e) => setTickerInput(e.target.value)}
                  placeholder="Ketik kalimat pengumuman yang akan berjalan terus-menerus di bagian bawah layar proyektor..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500 leading-relaxed font-sans"
                />
              </div>

              {/* Pilihan Kecepatan */}
              <div>
                <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">
                  Kecepatan Teks Berjalan
                </label>
                <div className="flex gap-2">
                  {[
                    { label: 'Cepat (18s)', val: 18 },
                    { label: 'Normal (28s)', val: 28 },
                    { label: 'Santai (38s)', val: 38 },
                  ].map((spd) => (
                    <button
                      key={spd.val}
                      onClick={() => setTickerSpeed(spd.val)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        tickerSpeed === spd.val
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                      }`}
                    >
                      {spd.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Cepat */}
              <div>
                <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">
                  Template Pengumuman Siap Pakai
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {QUICK_TICKER_PRESETS.map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => setTickerInput(preset)}
                      className="w-full text-left text-xs text-zinc-300 hover:text-amber-300 bg-zinc-800/80 hover:bg-zinc-800 p-2 rounded-lg border border-zinc-700 transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-zinc-800 flex items-center justify-between">
              {state.tickerActive ? (
                <button
                  onClick={() => {
                    stopTicker();
                    setIsTickerModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 text-xs font-bold transition"
                >
                  Hentikan Teks Berjalan (OFF)
                </button>
              ) : (
                <span className="text-xs text-zinc-500">Status: Tidak Tayang</span>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTickerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    applyTickerText();
                    setIsTickerModalOpen(false);
                  }}
                  disabled={!tickerInput.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5" />
                  Tayangkan ke Proyektor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pengaturan Ukuran Teks Proyektor */}
      {isFontSizeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900/95 border border-white/15 rounded-3xl w-full max-w-lg p-6 shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Type className="w-5 h-5 text-amber-400" />
                Ukuran Teks Layar Proyektor
              </h3>
              <button
                onClick={() => setIsFontSizeModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-6">
              {/* Ukuran Lirik Utama */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Ukuran Teks Lirik Lagu (Tengah)
                  </label>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {contentFontSize} px
                  </span>
                </div>
                <input
                  type="range"
                  min={28}
                  max={88}
                  step={2}
                  value={contentFontSize}
                  onChange={(e) => updateFontSizes(Number(e.target.value), undefined)}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                  <span>Kecil (28px)</span>
                  <span>Standar (56px)</span>
                  <span>Ekstra Besar (88px)</span>
                </div>
              </div>

              {/* Ukuran Judul / Badge di Bawah */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Ukuran Teks Judul & Nomor (Bawah Tengah)
                  </label>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {badgeFontSize} px
                  </span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={28}
                  step={1}
                  value={badgeFontSize}
                  onChange={(e) => updateFontSizes(undefined, Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                  <span>Kecil (12px)</span>
                  <span>Standar (16px)</span>
                  <span>Besar (28px)</span>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 rounded-2xl bg-black border border-white/10 flex flex-col items-center justify-center text-center min-h-[140px] relative overflow-hidden">
                <p
                  style={{ fontSize: `${Math.min(contentFontSize, 38)}px` }}
                  className="text-white font-bold leading-tight line-clamp-2"
                >
                  Sa-at pandang karya agung dari hikmat-Mu,
                </p>
                <div
                  style={{ fontSize: `${badgeFontSize}px` }}
                  className="mt-4 px-3.5 py-1 rounded-full bg-black/80 border border-white/20 text-zinc-200 font-medium"
                >
                  Kidung 1 - Memuji Allah Tritunggal • 1/6
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between gap-2.5">
              <button
                onClick={() => {
                  updateFontSizes(56, 16);
                }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition"
              >
                Reset Default
              </button>
              <button
                onClick={() => setIsFontSizeModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
              >
                Simpan & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

