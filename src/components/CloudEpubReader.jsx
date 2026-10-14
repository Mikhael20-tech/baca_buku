import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ePub from 'epubjs';
import { supabase, getSignedBookUrl, isSupabaseConfigured } from '../lib/supabase';
import { getBookFromIndexedDB } from '../lib/bookStorage';
import { Highlight } from 'marks-pane';
import { 
  Underline, StickyNote, X, ChevronLeft, ChevronRight, 
  Bookmark, Sun, Moon, Coffee, ZoomIn, ZoomOut, Type, Trash2, ArrowLeft,
  Loader2, AlertCircle, List, Search, Sliders,
  BookOpen, Scroll, Volume2, VolumeX, ChevronDown, ChevronUp,
  Columns2, FileText, AlignJustify
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Patch window.addEventListener agar saat epub.js mendaftarkan 'unload', dialihkan secara aman ke 'pagehide'
// Ini mencegah peringatan browser Chrome: "[Violation] Permissions policy violation: unload is not allowed in this document"
if (typeof window !== 'undefined' && !window._bacaUnloadPatched) {
  window._bacaUnloadPatched = true;
  const originalWindowAddEventListener = window.addEventListener;
  window.addEventListener = function (type, listener, options) {
    if (type === 'unload') {
      return originalWindowAddEventListener.call(window, 'pagehide', listener, options);
    }
    return originalWindowAddEventListener.call(window, type, listener, options);
  };
}

// Patch epub.js IframeView agar tidak memasang sandbox yang berbenturan (allow-scripts + allow-same-origin)
// yang memicu peringatan browser "An iframe which has both allow-scripts and allow-same-origin..."
try {
  const IframeView = ePub?.Rendition?.prototype?.requireView?.('iframe');
  if (IframeView && !IframeView._bacaSandboxPatched) {
    IframeView._bacaSandboxPatched = true;
    const origCreate = IframeView.prototype.create;
    IframeView.prototype.create = function () {
      const iframe = origCreate.apply(this, arguments);
      if (iframe && iframe.removeAttribute) {
        iframe.removeAttribute('sandbox');
      }
      return iframe;
    };
  }
} catch {
  // pass
}

// Patch DOMParser agar entitas HTML seperti &mdash;, &nbsp;, &ndash; otomatis dikonversi ke entitas numerik XML (&#8212;, dll)
// serta otomatis menutup tag <div> yang tidak sengaja terbuka agar tidak memicu error parser browser "Opening and ending tag mismatch"
if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined' && !window._bacaDOMParserPatched) {
  window._bacaDOMParserPatched = true;
  const origParseFromString = DOMParser.prototype.parseFromString;
  DOMParser.prototype.parseFromString = function (str, type) {
    if (typeof str === 'string' && (type === 'application/xhtml+xml' || type === 'text/xml' || type === 'application/xml')) {
      if (str.includes('&mdash;') || str.includes('&nbsp;') || str.includes('&ndash;') || str.includes('&hellip;')) {
        str = str
          .replace(/&mdash;/g, '&#8212;')
          .replace(/&ndash;/g, '&#8211;')
          .replace(/&hellip;/g, '&#8230;')
          .replace(/&nbsp;/g, '&#160;');
      }
      // Perbaiki mismatch tag jika ada <div ...> yang belum tertutup sebelum </body>
      const openDivs = (str.match(/<div[\s>]/gi) || []).length;
      const closeDivs = (str.match(/<\/div>/gi) || []).length;
      if (openDivs > closeDivs && /<\/body>/i.test(str)) {
        str = str.replace(/<\/body>/i, '</div>'.repeat(openDivs - closeDivs) + '</body>');
      }
    }
    return origParseFromString.call(this, str, type);
  };
}

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

const FONT_FAMILIES = {
  'Merriweather': "'Merriweather', Georgia, serif",
  'Literata': "'Literata', Georgia, serif",
  'Lora': "'Lora', Georgia, serif",
  'Inter': "'Inter', system-ui, -apple-system, sans-serif",
  'Plus Jakarta Sans': "'Plus Jakarta Sans', system-ui, sans-serif",
  'OpenDyslexic': "'OpenDyslexic', sans-serif"
};

// Helper untuk mendeteksi apakah buku adalah FKKP (Firman Kudus untuk Kebangunan Pagi)
export const isFKKPBook = (b) => {
  if (!b) return false;
  const title = (b.title || '').toLowerCase();
  const category = (b.category || '').toLowerCase();
  const id = (b.id || '').toLowerCase();
  const desc = (b.description || '').toLowerCase();
  return (
    title.includes('fkkp') ||
    title.includes('kebangunan pagi') ||
    category.includes('fkkp') ||
    category.includes('kebangunan pagi') ||
    id.includes('fkkp') ||
    desc.includes('fkkp')
  );
};

// Helper validasi UUID untuk kolom UUID di database Supabase (menghindari error 400 Bad Request jika user demo)
export const isValidUUID = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export default function CloudEpubReader({ book, userId, onBack }) {
  const viewerRef = useRef(null);
  const bookInstance = useRef(null);
  const renditionInstance = useRef(null);

  // Status Reader
  const [activeFont, setActiveFont] = useState(() => localStorage.getItem('reader_font') || 'Merriweather');
  const fontRef = useRef(activeFont);
  useEffect(() => {
    fontRef.current = activeFont;
  }, [activeFont]);

  const [fontSize, setFontSize] = useState(100); // 100%
  const [theme, setTheme] = useState(() => localStorage.getItem('reader_theme') || 'sepia'); // 'light' | 'sepia' | 'dark'
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Mode Membaca: FKKP otomatis default 'scrolled' (gulir vertikal ke bawah), buku lain default 'paginated' (buku lembaran ala alkitab)
  const isFKKP = useMemo(() => isFKKPBook(book), [book]);

  // Mode Membaca: Gulir vertikal ke bawah kontinu ('scrolled') sebagai default untuk seluruh buku
  const [readingMode, setReadingMode] = useState(() => {
    const userChoice = sessionStorage.getItem(`user_toggled_mode_${book?.id}`);
    if (userChoice) return userChoice;
    return 'scrolled';
  });

  const modeRef = useRef(readingMode);
  useEffect(() => {
    modeRef.current = readingMode;
  }, [readingMode]);

  // Update mode saat berganti buku
  useEffect(() => {
    if (!book?.id) return;
    const userChoice = sessionStorage.getItem(`user_toggled_mode_${book.id}`);
    const targetMode = userChoice || 'scrolled';
    if (targetMode !== readingMode) {
      setReadingMode(targetMode);
      modeRef.current = targetMode;
    }
  }, [book?.id]);

  // Efek Suara Lembaran Kertas
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => localStorage.getItem('reader_sound') !== 'false');
  const soundEnabledRef = useRef(isSoundEnabled);
  useEffect(() => {
    soundEnabledRef.current = isSoundEnabled;
    localStorage.setItem('reader_sound', String(isSoundEnabled));
  }, [isSoundEnabled]);

  // Jarak Baris / Kerapatan Teks (Default: 1.85 Lega, tidak memet)
  const [lineHeight, setLineHeight] = useState(() => Number(localStorage.getItem('reader_line_height')) || 1.85);
  const lineHeightRef = useRef(lineHeight);
  useEffect(() => {
    lineHeightRef.current = lineHeight;
    localStorage.setItem('reader_line_height', String(lineHeight));
  }, [lineHeight]);

  // Tata Letak Kolom Buku: 'auto' (2 Kolom) vs 'none' (1 Kolom Penuh Lega)
  const [pageSpread, setPageSpread] = useState(() => localStorage.getItem('reader_page_spread') || 'auto');
  const pageSpreadRef = useRef(pageSpread);
  useEffect(() => {
    pageSpreadRef.current = pageSpread;
    localStorage.setItem('reader_page_spread', pageSpread);
  }, [pageSpread]);

  // Animasi Transisi Geser Halus (Smooth Slide ala Google Play Books / Apple Books)
  const [slideAnimationClass, setSlideAnimationClass] = useState('');
  const isNavigatingRef = useRef(false);

  // Drawer Anotasi & Daftar Isi (TOC)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [toc, setToc] = useState([]);
  const [tocSearch, setTocSearch] = useState('');

  // Status Anotasi & Progres
  const [annotations, setAnnotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readError, setReadError] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isProgressPopoverOpen, setIsProgressPopoverOpen] = useState(false);

  // Floating Annotation Toolbar State
  const [toolbar, setToolbar] = useState({ visible: false, x: 0, y: 0, cfiRange: null, text: '' });
  const [isNoteInputOpen, setIsNoteInputOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  // Popup saat mengklik highlight yang sudah ada di dalam buku
  const [selectedAnnoPopup, setSelectedAnnoPopup] = useState(null);

  // Popup Modal Interaktif Catatan Kaki Alkitab
  const [activeFootnote, setActiveFootnote] = useState(null);

  // Helper efek audio desiran lembaran kertas buku fisik (sintesis Web Audio API)
  const playPageTurnSound = useCallback(() => {
    if (!soundEnabledRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const bufferSize = Math.floor(ctx.sampleRate * 0.12);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.12);
      filter.Q.value = 1.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + 0.12);
    } catch {
      // pass
    }
  }, []);

  // Handler Halaman Selanjutnya dengan Animasi Geser Halus (Smooth Slide Next)
  const handleNextPage = useCallback(() => {
    if (!renditionInstance.current) return;
    if (modeRef.current === 'scrolled') {
      if (viewerRef.current) {
        viewerRef.current.scrollBy({ top: window.innerHeight * 0.7, behavior: 'smooth' });
      }
      return;
    }

    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    playPageTurnSound();

    // 1. Geser keluar ke kiri
    setSlideAnimationClass('page-slide-next-exit');

    setTimeout(async () => {
      try {
        await renditionInstance.current.next();
      } catch {
        // pass
      }
      // 2. Geser masuk dari kanan
      setSlideAnimationClass('page-slide-next-enter');

      setTimeout(() => {
        setSlideAnimationClass('');
        isNavigatingRef.current = false;
      }, 240);
    }, 150);
  }, [playPageTurnSound]);

  // Handler Halaman Sebelumnya dengan Animasi Geser Halus (Smooth Slide Prev)
  const handlePrevPage = useCallback(() => {
    if (!renditionInstance.current) return;
    if (modeRef.current === 'scrolled') {
      if (viewerRef.current) {
        viewerRef.current.scrollBy({ top: -window.innerHeight * 0.7, behavior: 'smooth' });
      }
      return;
    }

    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    playPageTurnSound();

    // 1. Geser keluar ke kanan
    setSlideAnimationClass('page-slide-prev-exit');

    setTimeout(async () => {
      try {
        await renditionInstance.current.prev();
      } catch {
        // pass
      }
      // 2. Geser masuk dari kiri
      setSlideAnimationClass('page-slide-prev-enter');

      setTimeout(() => {
        setSlideAnimationClass('');
        isNavigatingRef.current = false;
      }, 240);
    }, 150);
  }, [playPageTurnSound]);

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

  // Handler saat highlight yang sudah ada di klik di dalam buku
  const handleAnnotationClick = useCallback((e, item) => {
    e?.stopPropagation?.();
    const iframe = viewerRef.current?.querySelector('iframe');
    const iframeRect = iframe ? iframe.getBoundingClientRect() : { left: 0, top: 0 };
    const clientX = e?.clientX !== undefined ? (iframeRect.left + e.clientX) : (window.innerWidth / 2);
    const clientY = e?.clientY !== undefined ? (iframeRect.top + e.clientY) : (window.innerHeight / 2);

    setSelectedAnnoPopup({
      x: clientX,
      y: clientY,
      item
    });
    setToolbar({ visible: false, x: 0, y: 0, cfiRange: null, text: '' });
  }, []);

  // Helper render 1 item anotasi ke rendition (dengan pencegahan tumpukan/dobel)
  const renderAnnotationItem = useCallback((item) => {
    if (!renditionInstance.current || !item?.cfi_range) return;
    try {
      // Hapus versi lama pada cfiRange ini agar tidak terjadi penumpukan warna yang bikin buram
      try {
        renditionInstance.current.annotations.remove(item.cfi_range, 'highlight');
        renditionInstance.current.annotations.remove(item.cfi_range, 'underline');
      } catch {
        // pass
      }

      const isDark = themeRef.current === 'dark';

      if (item.type === 'highlight' || item.type === 'note') {
        renditionInstance.current.annotations.highlight(
          item.cfi_range,
          { id: item.id },
          (e) => {
            handleAnnotationClick(e, item);
          },
          'epub-user-highlight',
          {
            fill: item.color || '#fef08a',
            'fill-opacity': isDark ? '0.45' : '0.32',
            'mix-blend-mode': isDark ? 'screen' : 'multiply'
          }
        );
      } else if (item.type === 'underline') {
        renditionInstance.current.annotations.underline(item.cfi_range);
      }
    } catch (e) {
      console.debug('Anotasi render pass:', e);
    }
  }, [handleAnnotationClick]);

  // 2. Fetch data anotasi dari Supabase (atau LocalStorage jika Demo Mode)
  const loadAnnotations = useCallback(async () => {
    try {
      if (!isSupabaseConfigured() || !isValidUUID(userId) || !isValidUUID(book.id)) {
        const localAnnos = JSON.parse(localStorage.getItem(`annos_${book.id}_${userId || 'guest'}`) || '[]');
        setAnnotations(localAnnos);
        if (renditionInstance.current) {
          localAnnos.forEach(renderAnnotationItem);
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
        if (renditionInstance.current) {
          data.forEach(renderAnnotationItem);
        }
      }
    } catch (err) {
      console.warn('Gagal memuat anotasi:', err);
    }
  }, [book.id, userId, renderAnnotationItem]);

  // Terapkan gaya tema & font ke seluruh iframe rendition
  const applyReaderStyles = useCallback((targetTheme = themeRef.current, targetFont = fontRef.current, targetLineHeight = lineHeightRef.current) => {
    if (!renditionInstance.current) return;

    // Untuk buku FKKP: UI dan UX font dll 100% mengikuti epub aslinya tanpa diubah
    if (isFKKP) {
      try {
        const contentsList = renditionInstance.current.getContents?.() || [];
        contentsList.forEach((contents) => {
          const doc = contents.document;
          if (!doc) return;
          const styleEl = doc.getElementById('baca-custom-theme-style');
          if (styleEl) {
            styleEl.textContent = `
              html, body {
                background-color: transparent !important;
              }
            `;
          }
        });
      } catch (e) {
        console.debug('FKKP applyReaderStyles pass:', e);
      }
      return;
    }

    try {
      renditionInstance.current.themes.select(targetTheme);
      renditionInstance.current.themes.font(targetFont);
    } catch (e) {
      console.debug('themes.select pass:', e);
    }

    const isDark = targetTheme === 'dark';
    const isSepia = targetTheme === 'sepia';
    const textColor = isDark ? '#f4f4f5' : (isSepia ? '#3c2f21' : '#0f172a');
    const boxBgColor = isDark ? '#27272a' : (isSepia ? '#f3ece0' : '#f8fafc');
    const boxBorderColor = isDark ? '#3f3f46' : (isSepia ? '#e6dac6' : '#e2e8f0');
    const fontFamily = FONT_FAMILIES[targetFont] || `'${targetFont}', sans-serif`;

    try {
      const contentsList = renditionInstance.current.getContents?.() || [];
      contentsList.forEach((contents) => {
        const doc = contents.document;
        if (!doc) return;

        // Pastikan link Google Fonts ada di head
        if (!doc.getElementById('baca-fonts-link')) {
          const fontLink = doc.createElement('link');
          fontLink.id = 'baca-fonts-link';
          fontLink.rel = 'stylesheet';
          fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Literata:opsz,wght@7..72,400;7..72,600&family=Lora:wght@400;600&family=Merriweather:wght@400;700&family=Plus+Jakarta+Sans:wght@400;600&display=swap';
          doc.head?.appendChild(fontLink);
        }

        if (!doc.getElementById('baca-dyslexic-link')) {
          const dyslexicLink = doc.createElement('link');
          dyslexicLink.id = 'baca-dyslexic-link';
          dyslexicLink.rel = 'stylesheet';
          dyslexicLink.href = 'https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/open-dyslexic.css';
          doc.head?.appendChild(dyslexicLink);
        }

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
            font-family: ${fontFamily} !important;
            line-height: ${targetLineHeight} !important;
            letter-spacing: 0.015em !important;
            word-spacing: 0.04em !important;
            -webkit-font-smoothing: antialiased !important;
          }
          * {
            color: ${textColor} !important;
          }
          /* Biarkan epub.js mengatur column-gap secara presisi tanpa intervensi manual */
          /* Paksa seluruh paragraf, judul, dan teks memakai font yang dipilih */
          p, span, div, h1, h2, h3, h4, h5, h6, li, a, em, strong, b, i, small, blockquote, td, th {
            font-family: ${fontFamily} !important;
          }
          /* Paragraf dan teks dibuat lega, tidak memet atau mepet */
          p {
            line-height: ${targetLineHeight} !important;
            margin-top: 0 !important;
            margin-bottom: 1.35em !important;
            text-align: left !important;
            hyphens: none !important;
            -webkit-hyphens: none !important;
            word-break: normal !important;
          }
          span, div, li, a, em, strong, b, i, small, blockquote {
            line-height: ${targetLineHeight} !important;
          }
          h1, h2, h3, h4, h5, h6 {
            line-height: 1.35 !important;
            letter-spacing: -0.015em !important;
          }
          h1 {
            font-size: 1.75em !important;
            font-weight: 800 !important;
            border-bottom: 2.5px solid ${isDark ? '#d97706' : (isSepia ? '#d97706' : '#f59e0b')} !important;
            padding-bottom: 0.35em !important;
            margin-top: 1.2em !important;
            margin-bottom: 0.85em !important;
            color: ${isDark ? '#fbbf24' : (isSepia ? '#78350f' : '#0f172a')} !important;
          }
          h2 {
            font-size: 1.25em !important;
            font-weight: 700 !important;
            border-bottom: 1px solid ${isDark ? '#3f3f46' : (isSepia ? '#d6c7b2' : '#e2e8f0')} !important;
            padding-bottom: 0.25em !important;
            margin-top: 1.6em !important;
            margin-bottom: 0.65em !important;
            color: ${isDark ? '#e4e4e7' : (isSepia ? '#573f27' : '#334155')} !important;
          }
          h3 {
            font-size: 1.1em !important;
            font-weight: 600 !important;
            margin-top: 1.3em !important;
            margin-bottom: 0.5em !important;
            color: ${isDark ? '#cbd5e1' : (isSepia ? '#6b4f35' : '#475569')} !important;
          }
          .verse-quote, blockquote {
            margin: 1.4em 0 !important;
            padding: 0.9em 1.25em !important;
            border-left: 3.5px solid ${isDark ? '#f59e0b' : '#d97706'} !important;
            background-color: ${isDark ? 'rgba(245, 158, 11, 0.12)' : (isSepia ? 'rgba(217, 119, 6, 0.08)' : 'rgba(245, 158, 11, 0.06)')} !important;
            border-radius: 0 10px 10px 0 !important;
            font-style: italic !important;
            color: ${isDark ? '#fef3c7' : (isSepia ? '#78350f' : '#92400e')} !important;
            text-indent: 0 !important;
            line-height: ${targetLineHeight} !important;
          }
          .verse-quote p, blockquote p {
            text-indent: 0 !important;
            margin-bottom: 0 !important;
            color: inherit !important;
            font-style: italic !important;
          }
          ${modeRef.current === 'scrolled' ? `
            body {
              max-width: 760px !important;
              margin: 0 auto !important;
              padding: 2.5rem 1.8rem 8rem 1.8rem !important;
              column-count: 1 !important;
              column-width: auto !important;
            }
          ` : ''}
          /* Jangan beri latar belakang putih pada teks biasa */
          p, span, li, a, em, strong, b, i, small {
            background-color: transparent !important;
            color: ${textColor} !important;
          }
          /* Kotak ayat alkitab / tabel / callout / blockquote */
          table, tr, td, th, blockquote, pre, code, fieldset,
          div[style*="background"], p[style*="background"],
          [class*="box"], [class*="quote"], [class*="table"], [class*="card"], [class*="frame"] {
            background-color: ${boxBgColor} !important;
            color: ${textColor} !important;
            border-color: ${boxBorderColor} !important;
            line-height: ${targetLineHeight} !important;
          }
          table td, table th {
            border-color: ${boxBorderColor} !important;
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
            fill-opacity: ${isDark ? '0.45' : '0.32'} !important;
            rx: 3px !important;
            ry: 3px !important;
            cursor: pointer !important;
          }
          /* Penanda Catatan Kaki Alkitab Interaktif */
          .footnote-ref {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            text-decoration: none !important;
            font-family: system-ui, -apple-system, sans-serif !important;
            font-weight: 700 !important;
            color: ${isDark ? '#60a5fa' : '#2563eb'} !important;
            background-color: ${isDark ? '#1e293b' : '#eff6ff'} !important;
            border: 1px solid ${isDark ? '#3b82f6' : '#bfdbfe'} !important;
            border-radius: 5px !important;
            padding: 1px 5px !important;
            margin: 0 3px !important;
            vertical-align: 0.25em !important;
            font-size: 0.72em !important;
            line-height: 1.2 !important;
            box-shadow: 0 1px 2px rgba(0,0,0,0.06) !important;
            transition: all 0.15s ease !important;
          }
          .footnote-ref:hover {
            background-color: ${isDark ? '#2563eb' : '#dbeafe'} !important;
            color: ${isDark ? '#ffffff' : '#1d4ed8'} !important;
            border-color: ${isDark ? '#60a5fa' : '#3b82f6'} !important;
            transform: scale(1.08) !important;
          }
          .footnote-ref sup {
            color: inherit !important;
            background: transparent !important;
            font-size: inherit !important;
            vertical-align: baseline !important;
            font-weight: 700 !important;
          }
          .verse-num {
            font-weight: 800 !important;
            color: ${isDark ? '#60a5fa' : '#2563eb'} !important;
            margin-right: 0.35em !important;
          }
          .fn-badge {
            display: inline-block !important;
            font-family: system-ui, sans-serif !important;
            font-size: 0.8em !important;
            font-weight: 700 !important;
            color: ${isDark ? '#93c5fd' : '#1e40af'} !important;
            background-color: ${isDark ? '#1e293b' : '#dbeafe'} !important;
            padding: 0.2em 0.6em !important;
            border-radius: 4px !important;
            margin-bottom: 0.4em !important;
          }
        `;
      });
    } catch (err) {
      console.debug('Error applyReaderStyles:', err);
    }
  }, []);

  // 2.5 Setup Rendition Helper (Mendukung Mode Buku Lembaran 3D & Mode Gulir Vertikal Kontinu)
  const setupRendition = useCallback(async (epubBook, mode, targetLocation) => {
    if (!viewerRef.current) return;
    viewerRef.current.innerHTML = '';

    const isMobileScreen = window.innerWidth < 768;
    const isScrolled = mode === 'scrolled';
    const effectiveSpread = isScrolled ? 'none' : (pageSpreadRef.current === 'none' ? 'none' : (isMobileScreen ? 'none' : 'auto'));

    const rendition = epubBook.renderTo(viewerRef.current, {
      width: '100%',
      height: '100%',
      flow: isScrolled ? 'scrolled' : 'paginated',
      spread: effectiveSpread,
      gap: isScrolled ? 0 : 48,
      allowScriptedContent: false
    });
    renditionInstance.current = rendition;

    // Daftarkan tema bawaan ke Rendition
    if (!isFKKP) {
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
    } else {
      // Untuk FKKP: Pertahankan 100% gaya dan warna bawaan EPUB asli tanpa penimpaan elemen teks
      rendition.themes.register('light', {
        body: { background: 'transparent !important' }
      });
      rendition.themes.register('sepia', {
        body: { background: 'transparent !important' }
      });
      rendition.themes.register('dark', {
        body: { background: 'transparent !important' }
      });
    }

    // Register hook isi iframe: Injeksi fonts & atasi benturan context menu serta tema
    rendition.hooks.content.register((contents) => {
      const win = contents.window;
      if (win) {
        // Redirection window.unload ke pagehide untuk meredam peringatan izin Chrome unload
        const origAddEventListener = win.addEventListener;
        win.addEventListener = function (type, listener, options) {
          if (type === 'unload') {
            return origAddEventListener.call(win, 'pagehide', listener, options);
          }
          return origAddEventListener.call(win, type, listener, options);
        };
      }

      const doc = contents.document;

      // Runtime DOM Typo & Typography Cleaner (Menjamin teks bebas dari artifact OCR & hyphenation glitch)
      // Hanya dijalankan untuk buku non-FKKP agar konten dan naskah asli FKKP 100% utuh tanpa diubah
      if (!isFKKP) {
        try {
          if (doc && doc.body) {
            const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false);
            let textNode;
            while ((textNode = walker.nextNode())) {
              let val = textNode.nodeValue;
              if (!val || val.length < 2) continue;
              if (
                val.includes('?-') || 
                val.includes('-?') ||
                val.includes('?') ||
                val.includes('balk') || 
                val.includes('Balk') ||
                val.includes('akhimya') ||
                val.includes('pemah') ||
                val.includes('KaIau') ||
                val.includes('kaIau') ||
                val.includes('men yembah') ||
                /\d+:\d{3,4}/.test(val)
              ) {
                let cleaned = val
                  .replace(/([a-zA-Z]+)\s*\?+[\-‑–—]+\s*([a-zA-Z0-9]+)/g, (m, w1, w2) => {
                    if (w1.toLowerCase() === w2.toLowerCase()) return `${w1}-${w2}`;
                    if (w1.toLowerCase() === 'ke' && /^\d+$/.test(w2)) return `${w1}-${w2}`;
                    return `${w1}${w2}`;
                  })
                  .replace(/([a-zA-Z]+)\s*[\-‑–—]+\?+\s*([a-zA-Z0-9]+)/g, (m, w1, w2) => {
                    if (w1.toLowerCase() === w2.toLowerCase()) return `${w1}-${w2}`;
                    if (w1.toLowerCase() === 'ke' && /^\d+$/.test(w2)) return `${w1}-${w2}`;
                    return `${w1}${w2}`;
                  })
                  .replace(/([a-zA-Z]{2,})\?+(lah|kah|kan|an|nya|ku|mu)\b/gi, '$1$2')
                  .replace(/([a-zA-Z]{2,})\?+([a-zA-Z]{2,})/g, (m, w1, w2) => {
                    if (w1.toLowerCase() === w2.toLowerCase()) return `${w1}-${w2}`;
                    return `${w1}${w2}`;
                  })
                  .replace(/\?-/g, '')
                  .replace(/-?\?/g, '')
                  .replace(/\bbalk\b/g, 'baik')
                  .replace(/\bBalk\b/g, 'Baik')
                  .replace(/\bakhimya\b/g, 'akhirnya')
                  .replace(/\bAkhimya\b/g, 'Akhirnya')
                  .replace(/\bpemah\b/g, 'pernah')
                  .replace(/\bPemah\b/g, 'Pernah')
                  .replace(/\bKaIau\b/g, 'Kalau')
                  .replace(/\bkaIau\b/g, 'kalau')
                  .replace(/\bmen yembah\b/g, 'menyembah')
                  .replace(/\bMen yembah\b/g, 'Menyembah')
                  .replace(/\b(\d+):(\d{2})(\d{2})\b/g, (m, ch, v1, v2) => {
                    const n1 = parseInt(v1, 10);
                    const n2 = parseInt(v2, 10);
                    if (n1 > 0 && n2 > 0 && n1 < n2 && n2 <= n1 + 30) return `${ch}:${n1}-${n2}`;
                    return m;
                  })
                  .replace(/\b(\d+):(\d{1})(\d{2})\b/g, (m, ch, v1, v2) => {
                    const n1 = parseInt(v1, 10);
                    const n2 = parseInt(v2, 10);
                    if (n1 > 0 && n2 > 0 && n1 < n2 && n2 <= n1 + 10) return `${ch}:${n1}-${n2}`;
                    return m;
                  });

                if (cleaned !== val) {
                  textNode.nodeValue = cleaned;
                }
              }
            }
          }
        } catch (e) {
          console.debug('Error in runtime typo cleaner:', e);
        }
      }

      // Cegah klik kanan dan menu context bawaan
      doc.addEventListener('contextmenu', (e) => e.preventDefault());

      // Intersepsi Klik pada Penanda Catatan Kaki (Footnote Popover) dengan fase capture
      const handleFnClick = (e) => {
        const fnLink = e.target.closest?.('.footnote-ref') || e.target.closest?.('a[data-fn]');
        if (fnLink) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation?.();
          const title = fnLink.getAttribute('data-title') || 'Catatan Kaki';
          const content = fnLink.getAttribute('data-fn') || fnLink.textContent;
          setActiveFootnote({ title, content });
        }
      };

      doc.addEventListener('click', handleFnClick, true);
      doc.addEventListener('touchend', handleFnClick, true);

      // Keyboard navigation di dalam dokumen iframe
      doc.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
          e.preventDefault();
          handleNextPage();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
          e.preventDefault();
          handlePrevPage();
        }
      });

      // Injeksi Google Fonts & OpenDyslexic CDN (hanya untuk buku non-FKKP)
      if (!isFKKP) {
        contents.addStylesheet(
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Literata:opsz,wght@7..72,400;7..72,600&family=Lora:wght@400;600&family=Merriweather:wght@400;700&family=Plus+Jakarta+Sans:wght@400;600&display=swap'
        );
        contents.addStylesheet(
          'https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/open-dyslexic.css'
        );
      }

      // Matikan callout bawaan iOS/Android agar tidak menimpa toolbar kustom
      contents.addStylesheetRules({
        body: {
          '-webkit-touch-callout': 'none !important',
          'user-select': 'text !important',
          '-webkit-user-select': 'text !important',
          ...(isScrolled && !isFKKP ? { 'padding': '32px 48px 100px 48px !important' } : {})
        },
        '.epubjs-hl': {
          'rx': '3px !important',
          'ry': '3px !important'
        }
      });

      // Dukungan Touch Swipe untuk Layar HP & Tablet
      let touchStartX = 0;
      let touchStartY = 0;

      doc.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      doc.addEventListener('touchend', (e) => {
        if (modeRef.current === 'scrolled') return; // Scroll vertikal alami di mode scrolled
        if (e.changedTouches && e.changedTouches.length === 1) {
          const deltaX = e.changedTouches[0].clientX - touchStartX;
          const deltaY = e.changedTouches[0].clientY - touchStartY;

          // Swipe horizontal lebih dari 45px dan tidak didominasi gerakan vertikal
          if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
            if (deltaX < 0) {
              handleNextPage();
            } else {
              handlePrevPage();
            }
          }
        }
      }, { passive: true });

      // Terapkan penimpaan gaya teks tema & font ke dokumen iframe
      applyReaderStyles(themeRef.current, fontRef.current);
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
      setSelectedAnnoPopup(null);
    });

    // Event Perubahan Posisi Halaman (Auto-save Progress)
    rendition.on('relocated', async (location) => {
      try {
        const cfi = location.start.cfi;
        const percentage = epubBook.locations?.percentageFromCfi(cfi) || 0;
        const pctVal = Number((percentage * 100).toFixed(2));
        setProgressPercent(pctVal);

        if (isSupabaseConfigured() && isValidUUID(userId) && isValidUUID(book.id)) {
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

    // Tampilkan posisi baca yang ditargetkan
    if (targetLocation) {
      await rendition.display(targetLocation);
    } else {
      await rendition.display();
    }

    // Terapkan font, ukuran font, & tema aktif
    if (!isFKKP) {
      rendition.themes.font(fontRef.current);
      rendition.themes.select(themeRef.current);
    }
    rendition.themes.fontSize(`${fontSize}%`);
    applyReaderStyles(themeRef.current, fontRef.current);

    loadAnnotations();
  }, [applyReaderStyles, book.id, fontSize, handleNextPage, handlePrevPage, isFKKP, loadAnnotations, userId]);

  // 3. Inisialisasi EPUB Engine
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setReadError(null);

    async function initReader() {
      try {
        let bookSource = null;

        // Cek apakah file tersimpan di browser lokal (IndexedDB)
        if (book.file_path && book.file_path.startsWith('idb://')) {
          const stored = await getBookFromIndexedDB(book.id);
          if (stored && stored.data) {
            bookSource = stored.data;
          } else {
            throw new Error('Berkas buku lokal tidak ditemukan di IndexedDB.');
          }
        } 
        // Jika file adalah File atau ArrayBuffer langsung
        else if (book.file instanceof File || book.file instanceof ArrayBuffer) {
          bookSource = book.file;
        } 
        // File tersimpan di Cloud Storage Supabase
        else {
          let url = book.file_path;
          try {
            if (isSupabaseConfigured()) {
              const signed = await getSignedBookUrl(book.file_path);
              if (signed) url = signed;
            }
          } catch {
            url = book.file_path;
          }

          // Coba fetch sebagai ArrayBuffer dengan cache-busting agar selalu mendapatkan berkas buku terbaru
          try {
            const fetchUrl = (typeof url === 'string' && (url.startsWith('http') || url.startsWith('/')))
              ? `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`
              : url;
            const resp = await fetch(fetchUrl, { cache: 'no-store' });
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

        // Berikan batas waktu loading yang cukup longgar (timeout 40 detik)
        const readyPromise = epubBook.ready;
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Waktu memuat buku habis (40 detik). Berkas EPUB mungkin terlalu besar atau koneksi lambat.')), 40000)
        );

        await Promise.race([readyPromise, timeoutPromise]);
        if (!isMounted) return;

        // Ambil Navigasi / Daftar Isi (TOC)
        epubBook.loaded.navigation.then((nav) => {
          if (nav && nav.toc && nav.toc.length > 0) {
            setToc(nav.toc);
          } else if (epubBook.spine && epubBook.spine.items) {
            const fallbackToc = epubBook.spine.items.map((item, idx) => ({
              id: item.idref || `spine-${idx}`,
              href: item.href,
              label: `Bab / Bagian ${idx + 1}`
            }));
            setToc(fallbackToc);
          }
        }).catch((err) => {
          console.debug('TOC load info:', err);
        });

        // Ambil posisi baca terakhir
        let lastCfi = null;
        if (isSupabaseConfigured() && isValidUUID(userId) && isValidUUID(book.id)) {
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

        // Generate locations untuk hitung persentase
        epubBook.locations.generate(1000).catch(() => {});

        // Setup Rendition awal
        await setupRendition(epubBook, modeRef.current, lastCfi);

        // Event resize otomatis saat orientasi HP / tablet diputar
        const handleResize = () => {
          if (renditionInstance.current) {
            const isSmall = window.innerWidth < 768;
            try {
              if (modeRef.current === 'paginated') {
                const effSpread = (pageSpreadRef.current === 'none' || isSmall) ? 'none' : 'auto';
                renditionInstance.current.spread(effSpread);
              }
              renditionInstance.current.resize();
            } catch (e) {
              console.debug('Resize handler:', e);
            }
          }
        };
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

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
  }, [book.id, book.file_path, userId, setupRendition]);

  // Handler Ganti Mode Membaca (Buku Lembaran 3D vs Gulir Vertikal Kontinu)
  const handleReadingModeChange = async (newMode) => {
    if (newMode === readingMode) return;
    setReadingMode(newMode);
    modeRef.current = newMode;
    if (book?.id) {
      sessionStorage.setItem(`user_toggled_mode_${book.id}`, newMode);
      localStorage.setItem(`reader_mode_${book.id}`, newMode);
    }
    localStorage.setItem('reader_reading_mode', newMode);

    let currentCfi = null;
    try {
      currentCfi = renditionInstance.current?.currentLocation()?.start?.cfi;
    } catch {
      // pass
    }

    if (bookInstance.current && viewerRef.current) {
      setIsLoading(true);
      try {
        if (renditionInstance.current) {
          try {
            renditionInstance.current.destroy();
          } catch {
            // pass
          }
        }
        await setupRendition(bookInstance.current, newMode, currentCfi);
      } catch (err) {
        console.error('Gagal ganti mode baca:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handler Ganti Kerapatan Baris (Line Height)
  const handleLineHeightChange = (val) => {
    setLineHeight(val);
    lineHeightRef.current = val;
    localStorage.setItem('reader_line_height', String(val));
    applyReaderStyles(themeRef.current, fontRef.current, val);
  };

  // Handler Ganti Tata Letak Kolom (1 Kolom Lega vs 2 Kolom)
  const handlePageSpreadChange = (spreadVal) => {
    setPageSpread(spreadVal);
    pageSpreadRef.current = spreadVal;
    localStorage.setItem('reader_page_spread', spreadVal);
    if (renditionInstance.current && modeRef.current === 'paginated') {
      try {
        const isSmall = window.innerWidth < 768;
        const effective = (spreadVal === 'none' || isSmall) ? 'none' : 'auto';
        renditionInstance.current.spread(effective);
        renditionInstance.current.resize();
      } catch (err) {
        console.warn('Gagal ganti spread:', err);
      }
    }
  };

  // Listener Keyboard Shortcut di jendela utama
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        handlePrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextPage, handlePrevPage]);

  // Handler Ganti Tema (Light, Sepia, Dark)
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    themeRef.current = newTheme;
    localStorage.setItem('reader_theme', newTheme);
    applyReaderStyles(newTheme, fontRef.current);
  };

  // Handler Ganti Font (Segera perbarui seluruh teks di buku)
  const handleFontChange = (fontId) => {
    setActiveFont(fontId);
    fontRef.current = fontId;
    localStorage.setItem('reader_font', fontId);
    applyReaderStyles(themeRef.current, fontId);
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

  // Navigasi ke bab tertentu dari Daftar Isi
  const handleJumpToChapter = async (href) => {
    if (!renditionInstance.current) return;
    try {
      await renditionInstance.current.display(href);
      setIsTocOpen(false);
    } catch (err) {
      console.warn('Gagal lompat ke bab:', err);
    }
  };

  // Navigasi ke persentase / slider halaman tertentu
  const handleJumpToPercentage = (pct) => {
    if (!bookInstance.current || !renditionInstance.current) return;
    try {
      const cfi = bookInstance.current.locations.cfiFromPercentage(pct / 100);
      if (cfi) {
        renditionInstance.current.display(cfi);
      }
    } catch (err) {
      console.warn('Gagal lompat ke persentase:', err);
    }
  };

  // Hapus Anotasi (dari viewer, state, dan DB / localStorage)
  const handleDeleteAnnotation = async (annoId, cfiRange) => {
    if (renditionInstance.current && cfiRange) {
      try {
        renditionInstance.current.annotations.remove(cfiRange, 'highlight');
        renditionInstance.current.annotations.remove(cfiRange, 'underline');
      } catch (err) {
        console.debug('Remove annotation from rendition:', err);
      }
    }

    setAnnotations((prev) => prev.filter((a) => a.id !== annoId));
    setSelectedAnnoPopup(null);

    if (isSupabaseConfigured() && isValidUUID(userId)) {
      await supabase.from('annotations').delete().eq('id', annoId);
    } else {
      const key = `annos_${book.id}_${userId || 'guest'}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify(existing.filter((a) => a.id !== annoId)));
    }
  };

  // Update Warna Anotasi yang Ada
  const handleUpdateAnnotationColor = async (item, newColor) => {
    if (!item) return;
    const updated = { ...item, color: newColor };
    renderAnnotationItem(updated);

    setAnnotations((prev) => prev.map((a) => (a.id === item.id ? updated : a)));
    setSelectedAnnoPopup(null);

    if (isSupabaseConfigured() && isValidUUID(userId)) {
      await supabase.from('annotations').update({ color: newColor }).eq('id', item.id);
    } else {
      const key = `annos_${book.id}_${userId || 'guest'}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify(existing.map((a) => (a.id === item.id ? updated : a))));
    }
  };

  // Simpan Highlight / Underline / Catatan ke Database Cloud (Anti Dobel / Anti Menumpuk)
  const handleSaveAnnotation = async (type, color = '#fef08a') => {
    if (!toolbar.cfiRange) return;

    // Cek apakah ada anotasi yang sudah ada pada cfiRange ini
    const existingAnno = annotations.find(a => a.cfi_range === toolbar.cfiRange);
    if (existingAnno) {
      // Jika warna dan tipe persis sama, jangan ditumpuk!
      if (existingAnno.type === type && existingAnno.color === color && !noteContent.trim()) {
        clearSelection();
        return;
      }
      // Hapus anotasi sebelumnya agar tidak bertumpuk
      await handleDeleteAnnotation(existingAnno.id, existingAnno.cfi_range);
    }

    const comment = type === 'note' ? noteContent.trim() : null;
    const newAnnoId = `anno-${Date.now()}`;
    const newAnno = {
      id: newAnnoId,
      book_id: book.id,
      user_id: userId || 'guest',
      cfi_range: toolbar.cfiRange,
      selected_text: toolbar.text,
      type,
      color,
      comment,
      created_at: new Date().toISOString()
    };

    // Render ke viewer seketika (menggantikan versi lama)
    renderAnnotationItem(newAnno);

    if (isSupabaseConfigured() && isValidUUID(userId) && isValidUUID(book.id)) {
      const { data: inserted } = await supabase.from('annotations').insert({
        book_id: book.id,
        user_id: userId,
        cfi_range: toolbar.cfiRange,
        selected_text: toolbar.text,
        type,
        color,
        comment
      }).select().single();
      if (inserted) {
        setAnnotations(prev => [inserted, ...prev.filter(a => a.cfi_range !== toolbar.cfiRange)]);
      } else {
        setAnnotations(prev => [newAnno, ...prev.filter(a => a.cfi_range !== toolbar.cfiRange)]);
      }
    } else {
      const key = `annos_${book.id}_${userId || 'guest'}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = existing.filter(a => a.cfi_range !== toolbar.cfiRange);
      localStorage.setItem(key, JSON.stringify([newAnno, ...filtered]));
      setAnnotations([newAnno, ...filtered]);
    }

    clearSelection();
  };

  // Rekursif penyaringan Daftar Isi berdasarkan pencarian
  const filterTocItems = (items, query) => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    const results = [];
    items.forEach((item) => {
      const labelMatches = item.label?.toLowerCase().includes(q);
      const subMatches = item.subitems ? filterTocItems(item.subitems, query) : [];
      if (labelMatches || subMatches.length > 0) {
        results.push({
          ...item,
          subitems: subMatches
        });
      }
    });
    return results;
  };

  const filteredToc = filterTocItems(toc, tocSearch);

  // Render rekursif Daftar Isi
  const renderTocList = (items, depth = 0) => {
    return items.map((item, idx) => (
      <div key={item.id || `${item.href}-${idx}`}>
        <button
          onClick={() => handleJumpToChapter(item.href)}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          className="w-full text-left py-2 pr-3 rounded-xl hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition flex items-center justify-between group"
        >
          <span className="truncate font-medium group-hover:font-semibold">
            {item.label?.trim() || `Bagian ${idx + 1}`}
          </span>
        </button>
        {item.subitems && item.subitems.length > 0 && renderTocList(item.subitems, depth + 1)}
      </div>
    ));
  };

  // Cek apakah seleksi yang aktif saat ini sudah memiliki highlight sebelumnya
  const currentSelectionAnno = toolbar.cfiRange 
    ? annotations.find(a => a.cfi_range === toolbar.cfiRange) 
    : null;

  // Style container pembaca
  const themeClasses = {
    light: 'bg-white text-slate-900',
    sepia: 'bg-[#fbf7ed] text-[#3c2f21]',
    dark: 'bg-[#18181b] text-[#f4f4f5]'
  };

  return (
    <div className={`relative w-full h-screen flex flex-col font-sans select-none overflow-hidden transition-colors duration-300 ${themeClasses[theme]}`}>
      
      {/* Header Pengaturan & Navigasi */}
      <header className="h-16 px-3 sm:px-6 border-b border-current/10 flex items-center justify-between z-20 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 px-2.5 sm:px-3 text-xs font-semibold rounded-xl bg-black/5 hover:bg-black/10 transition flex items-center gap-1.5"
            title="Kembali ke Perpustakaan"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Katalog</span>
          </Button>

          {/* Tombol Daftar Isi */}
          <Button
            variant={isTocOpen ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setIsTocOpen(prev => !prev);
              setIsSidebarOpen(false);
            }}
            className={`h-8 px-2.5 sm:px-3 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
              isTocOpen ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm' : 'bg-black/5 hover:bg-black/10'
            }`}
            title="Daftar Isi Bab & Navigasi"
          >
            <List className="w-3.5 h-3.5" />
            <span>Daftar Isi</span>
          </Button>

          <div className="max-w-[130px] sm:max-w-xs md:max-w-md">
            <div className="flex items-center gap-1.5 min-w-0">
              <h2 className="font-bold text-xs sm:text-sm leading-tight truncate">{book.title}</h2>
              {isFKKP && (
                <Badge variant="outline" className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  FKKP • Gulir
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[11px] opacity-70 truncate hidden sm:block">{book.author}</p>
              {progressPercent > 0 && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsProgressPopoverOpen(prev => !prev)}
                    className="h-6 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 transition flex items-center gap-1 cursor-pointer"
                    title="Buka pengatur posisi halaman"
                  >
                    <Sliders className="w-2.5 h-2.5" />
                    <span>{progressPercent}%</span>
                  </Button>

                  {/* Popover Slider Lompat Halaman dari Header (Tidak menghalangi teks bacaan) */}
                  {isProgressPopoverOpen && (
                    <div className="absolute top-7 left-0 z-50 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 p-3 rounded-2xl shadow-2xl flex flex-col gap-2 min-w-[240px] text-slate-800 dark:text-zinc-100 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span>Lompat ke Posisi</span>
                        <span className="text-amber-600 font-bold">{progressPercent}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progressPercent}
                        onChange={(e) => setProgressPercent(Number(e.target.value))}
                        onMouseUp={(e) => {
                          handleJumpToPercentage(Number(e.target.value));
                          setIsProgressPopoverOpen(false);
                        }}
                        onTouchEnd={(e) => {
                          handleJumpToPercentage(Number(e.target.value));
                          setIsProgressPopoverOpen(false);
                        }}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                      <div className="flex items-center justify-between text-[10px] opacity-60">
                        <span>Awal (0%)</span>
                        <span>Akhir (100%)</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar Pengaturan Baca */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Pilihan Font Responsif HP & Desktop (Khusus buku umum; FKKP memakai format aslinya) */}
          {!isFKKP ? (
            <div className="flex items-center gap-1 bg-black/5 px-2 py-1 rounded-xl">
              <Type className="w-3.5 h-3.5 opacity-60 shrink-0" />
              <select
                value={activeFont}
                onChange={(e) => handleFontChange(e.target.value)}
                className="text-[11px] sm:text-xs bg-transparent border-none focus:outline-none font-semibold cursor-pointer text-inherit max-w-[70px] sm:max-w-none"
              >
                {FONTS.map(f => (
                  <option key={f.id} value={f.id} className="text-slate-900 bg-white">
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl text-amber-800 dark:text-amber-200" title="Format dan font 100% mengikuti naskah asli EPUB FKKP">
              <Type className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-[11px] font-bold whitespace-nowrap">Format Asli FKKP</span>
            </div>
          )}

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

          {/* Pilihan Mode Baca: Lembaran Buku 3D vs Gulir Vertikal Kontinu */}
          <div className="flex items-center bg-black/5 rounded-xl p-1">
            <button
              onClick={() => handleReadingModeChange('paginated')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                readingMode === 'paginated' 
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs' 
                  : 'opacity-65 hover:opacity-100'
              }`}
              title="Mode Lembaran Buku (Animasi Membalik 3D)"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Buku</span>
            </button>
            <button
              onClick={() => handleReadingModeChange('scrolled')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                readingMode === 'scrolled' 
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs' 
                  : 'opacity-65 hover:opacity-100'
              }`}
              title="Mode Gulir (Continuous Vertical Scroll)"
            >
              <Scroll className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Gulir</span>
            </button>
          </div>

          {/* Toggle Efek Suara Lembaran Kertas Buku */}
          {readingMode === 'paginated' && (
            <button
              onClick={() => setIsSoundEnabled(prev => !prev)}
              className={`p-1.5 rounded-xl transition ${
                isSoundEnabled
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25'
                  : 'bg-black/5 opacity-50 hover:opacity-100 text-inherit'
              }`}
              title={isSoundEnabled ? 'Suara Lembaran Kertas: Aktif' : 'Suara Lembaran Kertas: Nonaktif'}
            >
              {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Pilihan 1 Halaman vs 2 Halaman (jika di mode Buku) */}
          {readingMode === 'paginated' && (
            <div className="flex items-center bg-black/5 rounded-xl p-1">
              <button
                onClick={() => handlePageSpreadChange('none')}
                className={`p-1.5 rounded-lg transition ${
                  pageSpread === 'none' 
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs' 
                    : 'opacity-65 hover:opacity-100'
                }`}
                title="1 Halaman Penuh (Satu Kolom Lega)"
              >
                <FileText className="w-3.5 h-3.5 text-amber-600" />
              </button>
              <button
                onClick={() => handlePageSpreadChange('auto')}
                className={`p-1.5 rounded-lg transition ${
                  pageSpread === 'auto' 
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs' 
                    : 'opacity-65 hover:opacity-100'
                }`}
                title="2 Halaman (Dua Kolom Buku)"
              >
                <Columns2 className="w-3.5 h-3.5 text-amber-600" />
              </button>
            </div>
          )}

          {/* Pilihan Kerapatan Baris (Line Height Spacing) */}
          <div className="flex items-center bg-black/5 rounded-xl p-0.5">
            <button
              onClick={() => handleLineHeightChange(lineHeight >= 2.1 ? 1.6 : (lineHeight <= 1.65 ? 1.85 : 2.1))}
              className="px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 opacity-80 hover:opacity-100 transition"
              title="Atur Jarak Baris (Normal / Lega / Sangat Lega)"
            >
              <AlignJustify className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden xl:inline">Jarak:</span>
              <span>{lineHeight <= 1.65 ? 'Normal' : lineHeight <= 1.9 ? 'Lega' : 'Sangat Lega'}</span>
            </button>
          </div>

          {/* Drawer Anotasi */}
          <button
            onClick={() => {
              setIsSidebarOpen(prev => !prev);
              setIsTocOpen(false);
            }}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition ${
              isSidebarOpen ? 'bg-amber-600 text-white' : 'bg-black/5 hover:bg-black/10'
            }`}
            title="Daftar Catatan & Sorotan"
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

        {/* Sidebar Drawer Daftar Isi (TOC) */}
        {isTocOpen && (
          <aside className="w-80 max-w-[85vw] bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 p-4 sm:p-5 shadow-2xl flex flex-col z-30 text-slate-800 dark:text-zinc-100 animate-in slide-in-from-left duration-200 absolute inset-y-0 left-0">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <List className="w-4 h-4 text-amber-600" /> Daftar Isi Buku
              </h3>
              <button 
                onClick={() => setIsTocOpen(false)} 
                className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input Pencarian Bab */}
            <div className="relative my-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                placeholder="Cari bab, minggu, hari, kidung..."
                value={tocSearch}
                onChange={(e) => setTocSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-zinc-100"
              />
            </div>

            {/* Daftar Bab / Hirarki */}
            <div className="flex-1 overflow-y-auto space-y-1 py-1 pr-1 text-xs">
              {filteredToc.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-zinc-500">
                  {toc.length === 0 ? 'Daftar isi sedang dimuat atau tidak tersedia.' : 'Tidak ditemukan bab yang cocok.'}
                </div>
              ) : (
                renderTocList(filteredToc)
              )}
            </div>

            {/* Slider di bagian bawah Daftar Isi */}
            <div className="pt-3 mt-2 border-t border-slate-200 dark:border-zinc-800 shrink-0">
              <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                <span>Lompat Bebas</span>
                <span className="text-amber-600 font-bold">{progressPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercent}
                onChange={(e) => setProgressPercent(Number(e.target.value))}
                onMouseUp={(e) => handleJumpToPercentage(Number(e.target.value))}
                onTouchEnd={(e) => handleJumpToPercentage(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>
          </aside>
        )}

        {/* Tombol Navigasi Halaman Kiri (Mode Lembaran Buku) */}
        {readingMode === 'paginated' && (
          <button
            onClick={handlePrevPage}
            className="absolute left-1.5 sm:left-3 md:left-6 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 md:p-3 bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-100 rounded-full shadow-lg backdrop-blur transition hover:scale-110 active:scale-95 opacity-70 hover:opacity-100 border border-slate-200/50 dark:border-zinc-700/50"
            title="Halaman Sebelumnya (←)"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Kontainer Rendition EPUB dengan Gulir Vertikal Halus */}
        <div className="flex-1 w-full h-full relative flex items-center justify-center overflow-hidden p-1 sm:p-3 md:p-5">
          <div
            className={`w-full h-full relative transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden ${
              readingMode === 'scrolled'
                ? 'max-w-4xl mx-auto shadow-xl ring-1 ring-black/5 dark:ring-white/10'
                : pageSpread === 'none'
                ? 'max-w-3xl mx-auto shadow-xl ring-1 ring-slate-200/80 dark:ring-zinc-800'
                : 'max-w-5xl mx-auto shadow-xl ring-1 ring-slate-200/80 dark:ring-zinc-800'
            } ${
              theme === 'sepia'
                ? 'bg-[#fcf8f0]'
                : theme === 'dark'
                ? 'bg-zinc-900'
                : 'bg-white'
            }`}
          >
            {/* Kontainer Rendition Buku */}
            <div
              ref={viewerRef}
              className={`w-full h-full epub-container ${
                readingMode === 'scrolled'
                  ? 'is-scrolled overflow-y-auto'
                  : `is-paginated epub-slide-transition ${slideAnimationClass}`
              }`}
            />
          </div>
        </div>

        {/* Tombol Navigasi Halaman Kanan (Mode Lembaran Buku) */}
        {readingMode === 'paginated' && (
          <button
            onClick={handleNextPage}
            className="absolute right-1.5 sm:right-3 md:right-6 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 md:p-3 bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-100 rounded-full shadow-lg backdrop-blur transition hover:scale-110 active:scale-95 opacity-70 hover:opacity-100 border border-slate-200/50 dark:border-zinc-700/50"
            title="Halaman Selanjutnya (→)"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Kontrol Navigasi Gulir Vertikal Cepat (saat Mode Gulir aktif) */}
        {readingMode === 'scrolled' && (
          <div className="absolute right-3 sm:right-6 bottom-6 z-30 flex flex-col gap-2">
            <button
              onClick={() => {
                if (viewerRef.current) {
                  viewerRef.current.scrollBy({ top: -window.innerHeight * 0.75, behavior: 'smooth' });
                }
              }}
              className="p-2.5 rounded-full bg-white/90 dark:bg-zinc-800/90 text-slate-700 dark:text-zinc-200 shadow-xl border border-slate-200/80 dark:border-zinc-700 backdrop-blur hover:scale-105 active:scale-95 transition cursor-pointer"
              title="Gulir ke Atas (Page Up)"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (viewerRef.current) {
                  viewerRef.current.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' });
                }
              }}
              className="p-2.5 rounded-full bg-white/90 dark:bg-zinc-800/90 text-slate-700 dark:text-zinc-200 shadow-xl border border-slate-200/80 dark:border-zinc-700 backdrop-blur hover:scale-105 active:scale-95 transition cursor-pointer"
              title="Gulir ke Bawah (Page Down)"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

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
                        title="Hapus Anotasi Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p 
                      onClick={() => {
                        if (renditionInstance.current && a.cfi_range) {
                          renditionInstance.current.display(a.cfi_range);
                        }
                      }}
                      className="italic text-slate-700 dark:text-zinc-300 border-l-2 border-amber-400 pl-2 text-xs leading-relaxed cursor-pointer hover:opacity-80"
                      title="Klik untuk lompat ke halaman ini"
                    >
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

      {/* Floating Toolbar Melayang Saat Menyeleksi Teks */}
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

              {/* Highlight Biru */}
              <button
                onClick={() => handleSaveAnnotation('highlight', '#bfdbfe')}
                className="w-6 h-6 rounded-lg bg-blue-200 hover:scale-110 transition-transform shadow"
                title="Sorot Biru"
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

              {/* Tombol Hapus Sorotan jika seleksi ini sudah pernah disorot */}
              {currentSelectionAnno && (
                <button
                  onClick={() => {
                    handleDeleteAnnotation(currentSelectionAnno.id, currentSelectionAnno.cfi_range);
                    clearSelection();
                  }}
                  className="px-2 py-1 bg-red-600/90 hover:bg-red-600 text-xs font-semibold rounded flex items-center gap-1 text-white shadow-sm transition"
                  title="Hapus Sorotan Teks Ini"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </button>
              )}

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

      {/* Floating Popup Saat Mengklik Highlight Langsung di Buku */}
      {selectedAnnoPopup && (
        <div
          style={{
            position: 'fixed',
            left: `${Math.min(window.innerWidth - 160, Math.max(160, selectedAnnoPopup.x))}px`,
            top: `${Math.max(80, selectedAnnoPopup.y - 12)}px`,
            transform: 'translate(-50%, -100%)'
          }}
          className="z-50 bg-slate-900 text-white rounded-2xl shadow-2xl p-2.5 flex flex-col gap-2 border border-slate-700 animate-in fade-in zoom-in-95 duration-150 max-w-xs"
        >
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-bold flex items-center gap-1 text-amber-400">
              <Bookmark className="w-3.5 h-3.5" /> Sorotan Teks
            </span>
            <button
              onClick={() => setSelectedAnnoPopup(null)}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {selectedAnnoPopup.item.comment && (
            <p className="text-[11px] bg-slate-800 p-2 rounded-xl text-slate-200 border border-slate-700">
              "{selectedAnnoPopup.item.comment}"
            </p>
          )}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              {['#fef08a', '#bbf7d0', '#fbcfe8', '#bfdbfe'].map(c => (
                <button
                  key={c}
                  onClick={() => handleUpdateAnnotationColor(selectedAnnoPopup.item, c)}
                  className="w-5 h-5 rounded-md hover:scale-110 transition shadow"
                  style={{ backgroundColor: c }}
                  title="Ganti Warna"
                />
              ))}
            </div>
            <button
              onClick={() => handleDeleteAnnotation(selectedAnnoPopup.item.id, selectedAnnoPopup.item.cfi_range)}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1 shadow transition"
              title="Hapus Sorotan Ini"
            >
              <Trash2 className="w-3 h-3" /> Hapus
            </button>
          </div>
        </div>
      )}

      {/* Modal Popover Interaktif Catatan Kaki Alkitab */}
      {activeFootnote && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setActiveFootnote(null)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
                <Bookmark className="w-5 h-5" />
                <h3 className="font-bold text-base sm:text-lg">{activeFootnote.title}</h3>
              </div>
              <button 
                onClick={() => setActiveFootnote(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-slate-700 dark:text-zinc-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-serif">
              {activeFootnote.content}
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => setActiveFootnote(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm shadow-xs transition"
              >
                Tutup Catatan Kaki
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
