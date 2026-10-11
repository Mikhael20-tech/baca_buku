import React, { useEffect, useRef, useState, useCallback } from 'react';
import ePub from 'epubjs';
import { supabase, getSignedBookUrl, isSupabaseConfigured } from '../lib/supabase';
import { getBookFromIndexedDB } from '../lib/bookStorage';
import { Highlight } from 'marks-pane';
import { 
  Underline, StickyNote, X, ChevronLeft, ChevronRight, 
  Bookmark, Sun, Moon, Coffee, ZoomIn, ZoomOut, Type, Trash2, ArrowLeft,
  Loader2, AlertCircle
} from 'lucide-react';

// Patch Marks-Pane Highlight agar tidak menyorot ruang kosong / line-break <br>
if (Highlight && !Highlight._bacaPatched) {
  Highlight._bacaPatched = true;

  Highlight.prototype.filteredRanges = function () {
    try {
      const range = this.range;
      if (!range) return [];

      const root = range.commonAncestorContainer;
      const doc = root.ownerDocument || document;

      // Jika hanya satu text node tunggal
      if (root.nodeType === Node.TEXT_NODE) {
        return Array.from(range.getClientRects()).filter(r => r.width > 1 && r.height > 1);
      }

      // Ambil seluruh node teks nyata di dalam seleksi (hindari tag <br> dan blok kosong)
      const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
          if (!range.intersectsNode(node)) return NodeFilter.FILTER_REJECT;
          return node.textContent.trim().length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      });

      const textNodes = [];
      let curr;
      while ((curr = walker.nextNode())) {
        textNodes.push(curr);
      }

      if (textNodes.length === 0) {
        return Array.from(range.getClientRects()).filter(r => r.width > 1 && r.height > 1);
      }

      const rects = [];
      for (const node of textNodes) {
        const subRange = doc.createRange();
        const start = (node === range.startContainer) ? range.startOffset : 0;
        const end = (node === range.endContainer) ? range.endOffset : node.textContent.length;

        if (start < end) {
          subRange.setStart(node, start);
          subRange.setEnd(node, end);
          const subRects = Array.from(subRange.getClientRects());
          for (const r of subRects) {
            if (r.width > 1 && r.height > 1) {
              rects.push(r);
            }
          }
        }
      }

      return rects.length > 0 
        ? rects 
        : Array.from(range.getClientRects()).filter(r => r.width > 1 && r.height > 1);
    } catch {
      return Array.from(this.range ? this.range.getClientRects() : []).filter(r => r.width > 1);
    }
  };
}

const FONTS = [
  { id: 'Merriweather', name: 'Merriweather', type: 'Serif Klasik' },
  { id: 'Literata', name: 'Literata', type: 'Serif (Play Books)' },
  { id: 'Lora', name: 'Lora', type: 'Serif Hangat' },
  { id: 'Inter', name: 'Inter', type: 'Sans Modern' },
  { id: 'Plus Jakarta Sans', name: 'Jakarta Sans', type: 'Sans Bersih' },
  { id: 'OpenDyslexic', name: 'OpenDyslexic', type: 'Ramah Disleksia' }
];

export default function CloudEpubReader({ book, userId, onBack }) {
  const viewerRef = useRef(null);
  const bookInstance = useRef(null);
  const renditionInstance = useRef(null);

  // Status Reader
  const [activeFont, setActiveFont] = useState(() => localStorage.getItem('reader_font') || 'Merriweather');
  const [fontSize, setFontSize] = useState(100); // 100%
  const [theme, setTheme] = useState(() => localStorage.getItem('reader_theme') || 'sepia'); // 'light' | 'sepia' | 'dark'
  const themeRef = useRef(theme);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readError, setReadError] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);

  // Floating Annotation Toolbar State
  const [toolbar, setToolbar] = useState({ visible: false, x: 0, y: 0, cfiRange: null, text: '' });
  const [isNoteInputOpen, setIsNoteInputOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  // 1. Bersihkan seleksi native browser di dalam iframe
  const clearSelection = useCallback(() => {
    const iframe = viewerRef.current?.querySelector('iframe');
    if (iframe?.contentWindow) {
      iframe.contentWindow.getSelection()?.removeAllRanges();
    }
    setToolbar({ visible: false, x: 0, y: 0, cfiRange: null, text: '' });
    setIsNoteInputOpen(false);
    setNoteContent('');
  }, []);

  // 2. Fetch data anotasi dari Supabase (atau LocalStorage jika Demo Mode)
  const loadAnnotations = useCallback(async () => {
    try {
      if (!isSupabaseConfigured() || !userId) {
        const localAnnos = JSON.parse(localStorage.getItem(`annos_${book.id}_${userId || 'guest'}`) || '[]');
        setAnnotations(localAnnos);
        if (renditionInstance.current) {
          localAnnos.forEach(item => {
            try {
              if (item.type === 'highlight' || item.type === 'note') {
                renditionInstance.current.annotations.highlight(item.cfi_range, {}, () => {}, '', {
                  fill: item.color || '#fef08a',
                  'fill-opacity': '0.38',
                  'mix-blend-mode': 'multiply'
                });
              } else if (item.type === 'underline') {
                renditionInstance.current.annotations.underline(item.cfi_range);
              }
            } catch (e) {
              console.debug('Anotasi render pass:', e);
            }
          });
        }
        return;
      }

      const { data, error } = await supabase
        .from('annotations')
        .select('*')
        .eq('book_id', book.id)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAnnotations(data);
        // Terapkan ke rendition aktif
        if (renditionInstance.current) {
          data.forEach(item => {
            try {
              if (item.type === 'highlight' || item.type === 'note') {
                renditionInstance.current.annotations.highlight(item.cfi_range, {}, () => {}, '', {
                  fill: item.color || '#fef08a',
                  'fill-opacity': '0.38',
                  'mix-blend-mode': 'multiply'
                });
              } else if (item.type === 'underline') {
                renditionInstance.current.annotations.underline(item.cfi_range);
              }
            } catch (e) {
              console.debug('Anotasi render pass:', e);
            }
          });
        }
      }
    } catch (err) {
      console.warn('Gagal memuat anotasi:', err);
    }
  }, [book.id, userId]);

  // 3. Inisialisasi EPUB Engine
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setReadError(null);

    async function initReader() {
      try {
        let bookSource;

        // 1. Cek apakah file tersimpan di IndexedDB browser lokal
        if (book.file_path && book.file_path.startsWith('idb://')) {
          const id = book.file_path.replace('idb://', '');
          const buffer = await getBookFromIndexedDB(id);
          if (!buffer) throw new Error('Berkas buku di penyimpanan lokal tidak ditemukan atau sudah dibersihkan.');
          bookSource = buffer;
        } else if (book.id && book.id.startsWith('local-')) {
          const buffer = await getBookFromIndexedDB(book.id);
          if (buffer) {
            bookSource = buffer;
          } else {
            // Coba ambil dari path/blob URL
            const url = await getSignedBookUrl(book.file_path);
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('Gagal mengambil berkas buku lokal.');
            bookSource = await resp.arrayBuffer();
          }
        } else {
          // 2. Berkas dari Supabase Cloud / Remote URL
          const url = await getSignedBookUrl(book.file_path);
          try {
            const resp = await fetch(url);
            if (resp.ok) {
              bookSource = await resp.arrayBuffer();
            } else {
              bookSource = url;
            }
          } catch {
            bookSource = url;
          }
        }

        if (!isMounted) return;

        const epubBook = ePub(bookSource);
        bookInstance.current = epubBook;

        // Berikan batas waktu loading (timeout 10 detik) agar tidak loading selamanya
        const readyPromise = epubBook.ready;
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Waktu memuat buku habis (10 detik). Berkas EPUB mungkin rusak atau struktur tidak standar.')), 10000)
        );

        await Promise.race([readyPromise, timeoutPromise]);
        if (!isMounted) return;

        // Siapkan viewer kontainer
        if (!viewerRef.current) return;
        viewerRef.current.innerHTML = '';

        const rendition = epubBook.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          flow: 'paginated',
          spread: 'auto'
        });
        renditionInstance.current = rendition;

        // Daftarkan tema bawaan ke Rendition
        rendition.themes.register('light', {
          body: { background: 'transparent !important', color: '#0f172a !important' },
          'p, span, div, h1, h2, h3, h4, h5, h6, li, a, blockquote, em, strong, b, i': { color: '#0f172a !important' }
        });
        rendition.themes.register('sepia', {
          body: { background: 'transparent !important', color: '#3c2f21 !important' },
          'p, span, div, h1, h2, h3, h4, h5, h6, li, a, blockquote, em, strong, b, i': { color: '#3c2f21 !important' }
        });
        rendition.themes.register('dark', {
          body: { background: 'transparent !important', color: '#f4f4f5 !important' },
          'p, span, div, h1, h2, h3, h4, h5, h6, li, a, blockquote, em, strong, b, i': { color: '#f4f4f5 !important' }
        });

        // Register hook isi iframe: Injeksi fonts & atasi benturan context menu serta tema
        rendition.hooks.content.register((contents) => {
          const doc = contents.document;

          // Cegah klik kanan dan menu context bawaan
          doc.addEventListener('contextmenu', (e) => e.preventDefault());

          // Injeksi Google Fonts & OpenDyslexic CDN
          contents.addStylesheet(
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Literata:opsz,wght@7..72,400;7..72,600&family=Lora:wght@400;600&family=Merriweather:wght@400;700&family=Plus+Jakarta+Sans:wght@400;600&display=swap'
          );
          contents.addStylesheet(
            'https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/open-dyslexic.css'
          );

          // Matikan callout bawaan iOS/Android agar tidak menimpa toolbar kustom
          contents.addStylesheetRules({
            body: {
              '-webkit-touch-callout': 'none !important',
              'user-select': 'text !important',
              '-webkit-user-select': 'text !important',
              'padding': '0 24px !important'
            },
            '.epubjs-hl': {
              'rx': '3px !important',
              'ry': '3px !important'
            }
          });

          // Terapkan penimpaan gaya teks tema secara langsung ke dokumen iframe
          const currentTheme = themeRef.current;
          const isDark = currentTheme === 'dark';
          const textColor = isDark ? '#f4f4f5' : (currentTheme === 'sepia' ? '#3c2f21' : '#0f172a');
          let styleEl = doc.getElementById('baca-custom-theme-style');
          if (!styleEl) {
            styleEl = doc.createElement('style');
            styleEl.id = 'baca-custom-theme-style';
            doc.head?.appendChild(styleEl);
          }
          styleEl.textContent = `
            html, body {
              background-color: transparent !important;
              color: ${textColor} !important;
            }
            h1, h2, h3, h4, h5, h6, p, span, div, li, a, em, strong, b, i, small, blockquote, td, th, caption, pre, code {
              color: ${textColor} !important;
            }
            svg text {
              fill: ${textColor} !important;
            }
            img {
              filter: ${isDark ? 'brightness(0.85) contrast(1.05)' : 'none'};
            }
            .epubjs-hl {
              mix-blend-mode: ${isDark ? 'screen' : 'multiply'} !important;
              fill-opacity: ${isDark ? '0.5' : '0.38'} !important;
            }
          `;
        });

        // Event Seleksi Teks
        rendition.on('selected', (cfiRange, contents) => {
          const selection = contents.window.getSelection();
          if (!selection || selection.isCollapsed) return;

          const text = selection.toString().trim();
          if (text.length < 2) return;

          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const iframeEl = contents.document.defaultView.frameElement;
          const iframeRect = iframeEl ? iframeEl.getBoundingClientRect() : { left: 0, top: 0 };

          setToolbar({
            visible: true,
            x: iframeRect.left + rect.left + rect.width / 2,
            y: iframeRect.top + rect.top - 10,
            cfiRange,
            text
          });
          setIsNoteInputOpen(false);
        });

        // Event Perubahan Posisi Halaman (Auto-save Progress)
        rendition.on('relocated', async (location) => {
          try {
            const cfi = location.start.cfi;
            const percentage = epubBook.locations?.percentageFromCfi(cfi) || 0;
            const pctVal = Number((percentage * 100).toFixed(2));
            setProgressPercent(pctVal);

            if (isSupabaseConfigured() && userId) {
              await supabase.from('reading_progress').upsert({
                book_id: book.id,
                user_id: userId,
                last_read_cfi: cfi,
                percentage: pctVal,
                updated_at: new Date().toISOString()
              });
            } else {
              localStorage.setItem(`progress_${book.id}_${userId || 'guest'}`, JSON.stringify({
                cfi,
                percentage: pctVal
              }));
            }
          } catch (relocErr) {
            console.debug('Progress sync note:', relocErr);
          }
        });

        // Generate locations untuk hitung persentase
        epubBook.locations.generate(1000).catch(() => {});

        // Ambil posisi baca terakhir
        let lastCfi = null;
        if (isSupabaseConfigured() && userId) {
          const { data: progress } = await supabase
            .from('reading_progress')
            .select('last_read_cfi, percentage')
            .eq('book_id', book.id)
            .eq('user_id', userId)
            .single();

          if (progress?.last_read_cfi) {
            lastCfi = progress.last_read_cfi;
            setProgressPercent(Number(progress.percentage || 0));
          }
        } else {
          const localProg = JSON.parse(localStorage.getItem(`progress_${book.id}_${userId || 'guest'}`) || 'null');
          if (localProg?.cfi) {
            lastCfi = localProg.cfi;
            setProgressPercent(localProg.percentage || 0);
          }
        }

        if (lastCfi) {
          await rendition.display(lastCfi);
        } else {
          await rendition.display();
        }

        // Terapkan font, ukuran font, & tema aktif
        rendition.themes.font(activeFont);
        rendition.themes.fontSize(`${fontSize}%`);
        rendition.themes.select(themeRef.current);
        applyThemeStyles(themeRef.current);
        loadAnnotations();
        setIsLoading(false);
      } catch (err) {
        console.error('Error inisialisasi EPUB:', err);
        if (isMounted) {
          setReadError(err.message || 'Gagal memuat buku EPUB. Pastikan format file valid.');
          setIsLoading(false);
        }
      }
    }

    initReader();

    return () => {
      isMounted = false;
      if (bookInstance.current) {
        try {
          bookInstance.current.destroy();
        } catch {
          // cleanup
        }
      }
    };
  }, [book.id, book.file_path, userId, loadAnnotations, activeFont]);

  // Terapkan gaya tema ke seluruh iframe rendition
  const applyThemeStyles = useCallback((targetTheme) => {
    if (!renditionInstance.current) return;
    try {
      renditionInstance.current.themes.select(targetTheme);
    } catch (e) {
      console.debug('themes.select pass:', e);
    }

    const isDark = targetTheme === 'dark';
    const textColor = isDark ? '#f4f4f5' : (targetTheme === 'sepia' ? '#3c2f21' : '#0f172a');
    const bgColor = 'transparent';

    try {
      const contentsList = renditionInstance.current.getContents?.() || [];
      contentsList.forEach((contents) => {
        const doc = contents.document;
        if (!doc) return;
        let styleEl = doc.getElementById('baca-custom-theme-style');
        if (!styleEl) {
          styleEl = doc.createElement('style');
          styleEl.id = 'baca-custom-theme-style';
          doc.head?.appendChild(styleEl);
        }
        styleEl.textContent = `
          html, body {
            background-color: ${bgColor} !important;
            color: ${textColor} !important;
          }
          h1, h2, h3, h4, h5, h6, p, span, div, li, a, em, strong, b, i, small, blockquote, td, th, caption, pre, code {
            color: ${textColor} !important;
          }
          svg text {
            fill: ${textColor} !important;
          }
          img {
            filter: ${isDark ? 'brightness(0.85) contrast(1.05)' : 'none'};
          }
          .epubjs-hl {
            mix-blend-mode: ${isDark ? 'screen' : 'multiply'} !important;
            fill-opacity: ${isDark ? '0.5' : '0.38'} !important;
          }
        `;
      });
    } catch (err) {
      console.debug('Error applyThemeStyles:', err);
    }
  }, []);

  // Handler Ganti Tema (Light, Sepia, Dark)
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    themeRef.current = newTheme;
    localStorage.setItem('reader_theme', newTheme);
    applyThemeStyles(newTheme);
  };

  // Handler Ganti Font
  const handleFontChange = (fontId) => {
    setActiveFont(fontId);
    localStorage.setItem('reader_font', fontId);
    if (renditionInstance.current) {
      renditionInstance.current.themes.font(fontId);
    }
  };

  // Handler Zoom Ukuran Huruf
  const handleFontSizeChange = (delta) => {
    setFontSize((prev) => {
      const nextSize = Math.max(70, Math.min(200, prev + delta));
      if (renditionInstance.current) {
        renditionInstance.current.themes.fontSize(`${nextSize}%`);
      }
      return nextSize;
    });
  };

  // Simpan Highlight / Underline / Catatan ke Database Cloud
  const handleSaveAnnotation = async (type, color = '#fef08a') => {
    if (!toolbar.cfiRange) return;

    // Render seketika ke viewer
    if (renditionInstance.current) {
      if (type === 'highlight' || type === 'note') {
        renditionInstance.current.annotations.highlight(toolbar.cfiRange, {}, () => {}, '', { 
          fill: color,
          'fill-opacity': '0.38',
          'mix-blend-mode': 'multiply'
        });
      } else if (type === 'underline') {
        renditionInstance.current.annotations.underline(toolbar.cfiRange);
      }
    }

    const comment = type === 'note' ? noteContent.trim() : null;

    if (isSupabaseConfigured() && userId) {
      // Insert ke PostgreSQL Supabase
      await supabase.from('annotations').insert({
        book_id: book.id,
        user_id: userId,
        cfi_range: toolbar.cfiRange,
        selected_text: toolbar.text,
        type,
        color,
        comment
      });
    } else {
      // Demo mode lokal
      const newAnno = {
        id: `local-anno-${Date.now()}`,
        book_id: book.id,
        user_id: userId || 'guest',
        cfi_range: toolbar.cfiRange,
        selected_text: toolbar.text,
        type,
        color,
        comment,
        created_at: new Date().toISOString()
      };
      const key = `annos_${book.id}_${userId || 'guest'}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([newAnno, ...existing]));
    }

    clearSelection();
    loadAnnotations();
  };

  // Hapus Anotasi
  const handleDeleteAnnotation = async (annoId, cfiRange) => {
    if (renditionInstance.current) {
      try {
        renditionInstance.current.annotations.remove(cfiRange, 'highlight');
        renditionInstance.current.annotations.remove(cfiRange, 'underline');
      } catch {
        // ignore remove err
      }
    }

    if (isSupabaseConfigured() && userId) {
      await supabase.from('annotations').delete().eq('id', annoId);
    } else {
      const key = `annos_${book.id}_${userId || 'guest'}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify(existing.filter(a => a.id !== annoId)));
    }

    setAnnotations(prev => prev.filter(a => a.id !== annoId));
  };

  // Style container pembaca
  const themeClasses = {
    light: 'bg-white text-slate-900',
    sepia: 'bg-[#fbf7ed] text-[#3c2f21]',
    dark: 'bg-[#18181b] text-[#f4f4f5]'
  };

  return (
    <div className={`relative w-full h-screen flex flex-col font-sans select-none overflow-hidden transition-colors duration-300 ${themeClasses[theme]}`}>
      
      {/* Header Pengaturan & Navigasi */}
      <header className="h-16 px-4 md:px-6 border-b border-current/10 flex items-center justify-between z-20 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-black/5 hover:bg-black/10 transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Katalog</span>
          </button>
          <div className="max-w-[180px] sm:max-w-xs md:max-w-md">
            <h2 className="font-bold text-xs sm:text-sm leading-tight truncate">{book.title}</h2>
            <div className="flex items-center gap-2">
              <p className="text-[11px] opacity-70 truncate">{book.author}</p>
              {progressPercent > 0 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  {progressPercent}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar Pengaturan Baca */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Pilihan Font */}
          <div className="hidden sm:flex items-center gap-1.5 bg-black/5 px-2.5 py-1 rounded-xl">
            <Type className="w-3.5 h-3.5 opacity-60" />
            <select
              value={activeFont}
              onChange={(e) => handleFontChange(e.target.value)}
              className="text-xs bg-transparent border-none focus:outline-none font-semibold cursor-pointer"
            >
              {FONTS.map(f => (
                <option key={f.id} value={f.id} className="text-slate-900">
                  {f.name} ({f.type})
                </option>
              ))}
            </select>
          </div>

          {/* Pengatur Ukuran Font */}
          <div className="flex items-center bg-black/5 rounded-xl p-1">
            <button
              onClick={() => handleFontSizeChange(-10)}
              className="p-1 hover:bg-black/10 rounded-lg transition"
              title="Perkecil Ukuran"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold px-1.5">{fontSize}%</span>
            <button
              onClick={() => handleFontSizeChange(10)}
              className="p-1 hover:bg-black/10 rounded-lg transition"
              title="Perbesar Ukuran"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pilihan Tema */}
          <div className="flex items-center bg-black/5 rounded-xl p-1">
            <button
              onClick={() => handleThemeChange('light')}
              className={`p-1.5 rounded-lg transition ${theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'opacity-70 hover:opacity-100'}`}
              title="Tema Terang"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleThemeChange('sepia')}
              className={`p-1.5 rounded-lg transition ${theme === 'sepia' ? 'bg-[#fbf7ed] text-[#b45309] shadow-sm' : 'opacity-70 hover:opacity-100'}`}
              title="Tema Sepia"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`p-1.5 rounded-lg transition ${theme === 'dark' ? 'bg-zinc-800 text-amber-300 shadow-sm' : 'opacity-70 hover:opacity-100'}`}
              title="Tema Gelap"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Drawer Anotasi */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition ${
              isSidebarOpen ? 'bg-amber-600 text-white' : 'bg-black/5 hover:bg-black/10'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Catatan</span>
            <span>({annotations.length})</span>
          </button>
        </div>
      </header>

      {/* Area Pembaca & Drawer */}
      <div className="flex-1 w-full h-full relative flex overflow-hidden">
        
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-inherit">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-3" />
            <p className="text-xs font-semibold opacity-70">Memuat berkas EPUB...</p>
          </div>
        )}

        {/* Error State */}
        {readError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-inherit p-6 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
            <h4 className="font-bold text-sm text-red-600 mb-1">Gagal Membuka Buku</h4>
            <p className="text-xs opacity-75 max-w-sm mb-4">{readError}</p>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-amber-700 transition"
            >
              Kembali ke Katalog
            </button>
          </div>
        )}

        {/* Tombol Navigasi Halaman Kiri */}
        <button
          onClick={() => renditionInstance.current?.prev()}
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 p-2.5 sm:p-3 bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-100 rounded-full shadow-lg backdrop-blur transition hover:scale-110 active:scale-95"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Kontainer Rendition EPUB */}
        <div className="flex-1 w-full h-full relative flex items-center justify-center">
          <div ref={viewerRef} className="w-full h-full epub-container max-w-5xl mx-auto" />
        </div>

        {/* Tombol Navigasi Halaman Kanan */}
        <button
          onClick={() => renditionInstance.current?.next()}
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 p-2.5 sm:p-3 bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-100 rounded-full shadow-lg backdrop-blur transition hover:scale-110 active:scale-95"
          title="Halaman Selanjutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Sidebar Drawer Anotasi */}
        {isSidebarOpen && (
          <aside className="w-80 max-w-[85vw] bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 p-5 shadow-2xl flex flex-col z-20 text-slate-800 dark:text-zinc-100 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-600" /> Daftar Catatan Pribadi
              </h3>
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
              {annotations.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-zinc-500">
                  Belum ada kutipan atau catatan.<br />Sorot teks kalimat untuk membuat catatan baru.
                </div>
              ) : (
                annotations.map((a) => (
                  <div key={a.id} className="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span 
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase text-slate-900"
                        style={{ backgroundColor: a.color || '#fef08a' }}
                      >
                        {a.type}
                      </span>
                      <button
                        onClick={() => handleDeleteAnnotation(a.id, a.cfi_range)}
                        className="text-slate-400 hover:text-red-600 p-1 transition"
                        title="Hapus Anotasi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="italic text-slate-700 dark:text-zinc-300 border-l-2 border-amber-400 pl-2 text-xs leading-relaxed">
                      "{a.selected_text}"
                    </p>

                    {a.comment && (
                      <div className="bg-white dark:bg-zinc-800 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700">
                        <span className="font-bold text-[10px] text-amber-600 dark:text-amber-400 block uppercase mb-0.5">Catatan:</span>
                        <p className="text-slate-800 dark:text-zinc-200">{a.comment}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Floating Toolbar Melayang (Custom Annotation Toolbar) */}
      {toolbar.visible && (
        <div
          style={{
            position: 'fixed',
            left: `${toolbar.x}px`,
            top: `${toolbar.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
          className="z-50 bg-slate-900 text-white rounded-2xl shadow-2xl p-2 flex flex-col gap-2 border border-slate-700 animate-in fade-in zoom-in-95 duration-150"
        >
          {!isNoteInputOpen ? (
            <div className="flex items-center gap-1.5">
              {/* Highlight Kuning */}
              <button
                onClick={() => handleSaveAnnotation('highlight', '#fef08a')}
                className="w-6 h-6 rounded-lg bg-yellow-200 hover:scale-110 transition-transform shadow"
                title="Sorot Kuning"
              />

              {/* Highlight Hijau */}
              <button
                onClick={() => handleSaveAnnotation('highlight', '#bbf7d0')}
                className="w-6 h-6 rounded-lg bg-green-200 hover:scale-110 transition-transform shadow"
                title="Sorot Hijau"
              />

              {/* Highlight Pink */}
              <button
                onClick={() => handleSaveAnnotation('highlight', '#fbcfe8')}
                className="w-6 h-6 rounded-lg bg-pink-200 hover:scale-110 transition-transform shadow"
                title="Sorot Pink"
              />

              <div className="w-[1px] h-4 bg-slate-700 mx-1" />

              {/* Underline */}
              <button
                onClick={() => handleSaveAnnotation('underline')}
                className="px-2 py-1 hover:bg-slate-800 text-xs font-semibold rounded flex items-center gap-1 text-blue-300 transition"
              >
                <Underline className="w-3.5 h-3.5" /> Garis Bawah
              </button>

              {/* Beri Catatan */}
              <button
                onClick={() => setIsNoteInputOpen(true)}
                className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-xs font-semibold rounded flex items-center gap-1 text-white shadow-sm transition"
              >
                <StickyNote className="w-3.5 h-3.5" /> Catatan
              </button>

              <button 
                onClick={clearSelection} 
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 w-64 p-1 text-xs">
              <p className="text-[11px] text-amber-300 italic line-clamp-1">"{toolbar.text}"</p>
              <textarea
                rows={3}
                placeholder="Tuliskan catatan atau refleksi..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full text-slate-900 p-2.5 rounded-xl border focus:outline-none text-xs"
                autoFocus
              />
              <div className="flex justify-end gap-1.5">
                <button
                  onClick={() => setIsNoteInputOpen(false)}
                  className="px-3 py-1 text-slate-300 hover:text-white transition"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleSaveAnnotation('note', '#fed7aa')}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 font-semibold rounded-lg text-white transition shadow"
                >
                  Simpan Catatan
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
