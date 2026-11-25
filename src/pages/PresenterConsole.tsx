import React, { useState, useEffect, useCallback } from 'react';
import { useStageSync } from '../hooks/useStageSync';
import { chunkTextToSlides } from '../utils/chunkLyrics';
import { SongSetItem, DisplayMode } from '../types/stage';
import { Plus, Search, ExternalLink, ArrowLeft, Trash2, Music, MessageSquarePlus, Palette, Radio, Megaphone } from 'lucide-react';

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
          // Reset jika masih berisi format lama dengan '#' atau subtitle 'Matius'
          if (parsed[0]?.title?.includes('#') || parsed[0]?.subtitle?.includes('Matius')) {
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
          if (parsed[0]?.title?.includes('#') || parsed[0]?.subtitle?.includes('Matius')) {
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
    let rawText = '';
    if (songData.lyrics && Array.isArray(songData.lyrics)) {
      rawText = songData.lyrics
        .map((st: any) => (Array.isArray(st.lines) ? st.lines.join('\n') : String(st.text || '')))
        .join('\n\n');
    } else if (typeof songData.text === 'string') {
      rawText = songData.text;
    }

    const rawNum = songData.formattedNumber || songData.displayNumber || String(songData.number || songData.id || '');
    const cleanNum = rawNum.replace(/^(No\.\s*|S\.\s*|#\s*)/i, '').replace(/^0+/, '') || rawNum;
    const songType = songData.type === 'suplemen' ? 'Suplemen' : 'Kidung';
    const songTitle = songData.title || songData.firstLine || '';
    const formattedTitle = `${songType} ${cleanNum}${songTitle ? ` - ${songTitle}` : ''}`.trim();

    const newSong: SongSetItem = {
      id: `kidung-${songData.id || songData.formattedNumber || Date.now()}`,
      title: formattedTitle,
      subtitle: songData.category || songData.theme || '',
      rawText: rawText || 'Bait lagu belum tersedia',
      slides: chunkTextToSlides(rawText || 'Bait lagu belum tersedia', 4),
    };

    setSetlist((prev) => [...prev, newSong]);
    setSelectedSong(newSong);
    setActiveSlideIdx(0);
    setIsSearchOpen(false);
    setSearchKidungQuery('');
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
        updatedAt: Date.now(),
      });
    },
    [broadcastState, roomId, stageTheme]
  );

  const setDisplayMode = useCallback(
    (mode: DisplayMode) => {
      broadcastState({
        ...state,
        mode,
        theme: stageTheme,
        updatedAt: Date.now(),
      });
    },
    [broadcastState, state, stageTheme]
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

  const filteredKidung = allKidungData.filter((k) => {
    if (!searchKidungQuery.trim()) return true;
    const q = searchKidungQuery.toLowerCase();
    return (
      String(k.formattedNumber || k.id).includes(q) ||
      (k.title && k.title.toLowerCase().includes(q)) ||
      (k.category && k.category.toLowerCase().includes(q))
    );
  }).slice(0, 30);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none">
      {/* Top Bar */}
      <header className="h-14 border-b border-zinc-800 px-4 flex items-center justify-between bg-zinc-900/90 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="p-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 transition"
              title="Kembali ke Aplikasi Utama"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <span className="font-semibold tracking-tight text-sm sm:text-base flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Stage — Presenter Console
          </span>
          <div className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            <span className="text-zinc-500">Room:</span>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="bg-transparent border-none outline-none text-emerald-400 font-mono w-24 text-xs font-semibold"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Pilihan Tema Layar Output */}
          <div className="hidden lg:flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded text-xs">
            <Palette className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400">Tema:</span>
            <select
              value={stageTheme}
              onChange={(e) => handleThemeChange(e.target.value as any)}
              className="bg-transparent border-none outline-none text-zinc-200 text-xs font-semibold cursor-pointer"
            >
              <option value="default" className="bg-zinc-800 text-white">Default (Tengah)</option>
              <option value="amber-gold" className="bg-zinc-800 text-amber-300">Emas Elegan</option>
              <option value="lower-third" className="bg-zinc-800 text-cyan-300">Lower-Third (Stream)</option>
            </select>
          </div>

          <button
            onClick={() => setIsQuickTextOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-medium border border-zinc-700 transition"
            title="Ketik pengumuman atau ayat cepat untuk langsung ditayangkan"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Teks Spontan</span>
          </button>

          <button
            onClick={() => setIsTickerModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition ${
              state.tickerActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
            }`}
            title="Buka pengatur teks berjalan (running text)"
          >
            <Radio className={`w-3.5 h-3.5 ${state.tickerActive ? 'text-amber-400 animate-pulse' : 'text-zinc-400'}`} />
            <span className="hidden sm:inline">Teks Berjalan</span>
            {state.tickerActive && (
              <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.2 rounded font-extrabold">ON</span>
            )}
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            Tambah Kidung
          </button>
          <button
            onClick={openLiveWindow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Buka Layar Proyektor (/live)
          </button>
        </div>
      </header>

      {/* 3-Column Workspace */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden h-[calc(100vh-3.5rem)]">
        {/* Panel 1: Setlist */}
        <aside className="col-span-12 md:col-span-3 border-r border-zinc-800 p-4 overflow-y-auto bg-zinc-900/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Setlist Antrean</h2>
              <span className="text-[10px] text-zinc-500 font-mono">{setlist.length} Item</span>
            </div>
            <div className="space-y-2">
              {setlist.map((song) => {
                const isSelected = song.id === selectedSong.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => goToSlide(song, 0, 'LIVE')}
                    className={`w-full text-left p-3 rounded-lg border transition cursor-pointer relative group flex items-start justify-between ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-sm truncate">{song.title}</div>
                      {song.subtitle && <div className="text-xs text-zinc-400 mt-0.5 truncate">{song.subtitle}</div>}
                      <div className="text-[10px] text-zinc-500 mt-1 font-mono">{song.slides.length} Slide</div>
                    </div>
                    {setlist.length > 1 && (
                      <button
                        onClick={(e) => removeSongFromSetlist(e, song.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition"
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
            <div>💡 Tips Operator:</div>
            <div>• BroadcastChannel aktif (~0ms lokal).</div>
            <div>• Sinkronisasi otomatis ke proyektor.</div>
          </div>
        </aside>

        {/* Panel 2: Slide Grid */}
        <main className="col-span-12 md:col-span-6 p-6 overflow-y-auto bg-zinc-950">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                {selectedSong.title}
              </h1>
              {selectedSong.subtitle && <p className="text-xs text-zinc-400 mt-0.5">{selectedSong.subtitle}</p>}
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
              Slide {activeSlideIdx + 1} dari {selectedSong.slides.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
            {selectedSong.slides.map((slide, idx) => {
              const isLive = state.activeSongId === selectedSong.id && state.slideIndex === idx && state.mode === 'LIVE';
              return (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(selectedSong, idx, 'LIVE')}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between min-h-[140px] relative ${
                    isLive
                      ? 'bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/40 shadow-md'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-xs font-semibold text-zinc-400">{slide.label}</span>
                    {isLive && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-600 text-white animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-line leading-relaxed text-zinc-200 font-medium">
                    {slide.content}
                  </p>
                </button>
              );
            })}
          </div>
        </main>

        {/* Panel 3: Live Preview & Quick Controls */}
        <aside className="col-span-12 md:col-span-3 border-l border-zinc-800 p-4 bg-zinc-900/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Pratinjau Layar (Live Preview)</h2>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                state.mode === 'LIVE' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-zinc-800 text-zinc-500'
              }`}>
                {state.mode}
              </span>
            </div>

            <div className="aspect-video w-full rounded-lg bg-black border border-zinc-800 p-4 flex items-center justify-center text-center overflow-hidden relative shadow-inner">
              {state.mode === 'BLACKOUT' && (
                <span className="text-xs text-zinc-600 font-mono">[Layar Hitam / Blackout]</span>
              )}
              {state.mode === 'CLEAR' && (
                <span className="text-xs text-zinc-500 font-mono">[Teks Disembunyikan (Clear)]</span>
              )}
              {state.mode === 'LIVE' && (
                <p className="text-xs whitespace-pre-line text-white font-semibold leading-relaxed">
                  {state.content || 'Belum ada slide yang aktif'}
                </p>
              )}
              {state.tickerActive && state.tickerText && state.mode !== 'BLACKOUT' && (
                <div className="absolute bottom-0 inset-x-0 bg-black/95 border-t border-amber-500/30 px-2 py-0.5 text-[10px] text-amber-300 flex items-center gap-1.5 overflow-hidden z-10">
                  <span className="font-bold shrink-0 uppercase text-[8px] bg-amber-500/30 text-amber-300 px-1 rounded">TICKER</span>
                  <div className="truncate text-zinc-300 text-[10px]">{state.tickerText}</div>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <button
                onClick={() => setDisplayMode('LIVE')}
                className={`py-2 rounded-lg text-xs font-bold border transition ${
                  state.mode === 'LIVE'
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                LIVE (L)
              </button>
              <button
                onClick={() => setDisplayMode('CLEAR')}
                className={`py-2 rounded-lg text-xs font-bold border transition ${
                  state.mode === 'CLEAR'
                    ? 'bg-amber-600 border-amber-500 text-white shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                CLEAR (C)
              </button>
              <button
                onClick={() => setDisplayMode('BLACKOUT')}
                className={`py-2 rounded-lg text-xs font-bold border transition ${
                  state.mode === 'BLACKOUT'
                    ? 'bg-red-600 border-red-500 text-white shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                BLACK (B)
              </button>
            </div>

            {/* Panel Kontrol Cepat Teks Berjalan (Ticker) */}
            <div className="mt-4 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5 tracking-wide">
                  <span className={`w-2 h-2 rounded-full ${state.tickerActive ? 'bg-amber-400 animate-pulse' : 'bg-zinc-600'}`} />
                  Teks Berjalan
                </span>
                <button
                  onClick={toggleTicker}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${
                    state.tickerActive
                      ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
                  }`}
                >
                  {state.tickerActive ? 'TAYANG (ON)' : 'MATI (OFF)'}
                </button>
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={tickerInput}
                  onChange={(e) => setTickerInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyTickerText()}
                  placeholder="Ketik pengumuman berjalan..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 placeholder-zinc-500 outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => applyTickerText()}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shrink-0 transition"
                  title="Tayangkan ke layar proyektor"
                >
                  Kirim
                </button>
              </div>

              {/* Tombol Preset Cepat */}
              <div className="flex flex-col gap-1 mt-0.5">
                {QUICK_TICKER_PRESETS.slice(0, 2).map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setTickerInput(preset);
                      applyTickerText(preset);
                    }}
                    className="text-[10px] text-zinc-400 hover:text-amber-300 bg-zinc-900/90 px-2 py-1 rounded border border-zinc-800/80 hover:border-zinc-700 transition truncate text-left"
                    title={preset}
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-xs text-zinc-500 border-t border-zinc-800/80 pt-3 space-y-1 font-mono">
            <div className="text-zinc-400 font-semibold mb-1">Pintasan Keyboard:</div>
            <div>• <kbd className="px-1 py-0.5 bg-zinc-800 rounded">Spasi</kbd> / <kbd className="px-1 py-0.5 bg-zinc-800 rounded">→</kbd> : Slide Selanjutnya</div>
            <div>• <kbd className="px-1 py-0.5 bg-zinc-800 rounded">←</kbd> : Slide Sebelumnya</div>
            <div>• <kbd className="px-1 py-0.5 bg-zinc-800 rounded">B</kbd> : Toggle Blackout</div>
            <div>• <kbd className="px-1 py-0.5 bg-zinc-800 rounded">C</kbd> : Toggle Clear Teks</div>
            <div>• <kbd className="px-1 py-0.5 bg-zinc-800 rounded">L</kbd> : Tampilkan Live</div>
          </div>
        </aside>
      </div>

      {/* Modal Dialog Cari & Tambah Kidung */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-amber-500" />
                Tambah Kidung ke Setlist
              </h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari nomor atau judul kidung (misal: 154, kasih, batu karang)..."
                value={searchKidungQuery}
                onChange={(e) => setSearchKidungQuery(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500"
              />
            </div>

            <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1">
              {isLoadingKidung ? (
                <div className="p-8 text-center text-xs text-zinc-500">Memuat basis data kidung...</div>
              ) : filteredKidung.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">Kidung tidak ditemukan.</div>
              ) : (
                filteredKidung.map((k) => (
                  <button
                    key={`${k.type || 'kidung'}-${k.id}`}
                    onClick={() => addSongToSetlist(k)}
                    className="w-full text-left p-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {k.type === 'suplemen' ? 'Suplemen' : 'Kidung'} #{k.formattedNumber || k.id}
                        {k.title ? ` — ${k.title}` : ''}
                      </div>
                      {k.category && <div className="text-xs text-zinc-400 mt-0.5">{k.category}</div>}
                    </div>
                    <Plus className="w-4 h-4 text-emerald-400 shrink-0" />
                  </button>
                ))
              )}
            </div>
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
    </div>
  );
}

