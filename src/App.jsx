import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BookOpen, Search, UploadCloud, Database, ShieldCheck, UserCheck, 
  Trash2, Play, Info, Sparkles, CheckCircle2, Copy, 
  ExternalLink, X, BookmarkCheck, ArrowRight, BookMarked
} from 'lucide-react';
import { supabase, isSupabaseConfigured, isValidUUID } from './lib/supabase';
import { deleteBookFromIndexedDB } from './lib/bookStorage';
import CloudEpubReader from './components/CloudEpubReader';
import AdminUploadModal from './components/AdminUploadModal';
import AuthModal from './components/AuthModal';
import LandingPage from './components/LandingPage';
import KarakterSeriesModal from './components/KarakterSeriesModal';
import PembinaanTopicsModal from './components/PembinaanTopicsModal';
import BibleSelectorModal from './components/BibleSelectorModal';
import BibleReaderView from './components/BibleReaderView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const INITIAL_DEMO_BOOKS = [
  {
    id: 'fkkp-kebangunan-pagi-m1',
    title: 'FKKP: Menikmati Kristus sebagai Hayat (Minggu 1)',
    author: 'Yasperin / Living Stream Ministry',
    category: 'FKKP (Kebangunan Pagi)',
    description: 'Firman Kudus untuk Kebangunan Pagi (FKKP) — Panduan doa-makan firman harian (Senin s/d Sabtu). Otomatis dibaca dengan mode gulir vertikal ke bawah.',
    cover_gradient: 'from-amber-600 via-orange-800 to-amber-950',
    cover_icon: '🌅',
    file_path: '/books/fkkp-kebangunan-pagi-minggu-1.epub',
    created_at: new Date('2026-01-06').toISOString()
  },
  {
    id: 'buku-karakter-wl',
    title: 'Buku Karakter: 30 Butir (Pilih Seri 1 – 30)',
    author: 'Witness Lee',
    category: 'Pembinaan Karakter',
    description: 'Klik untuk memilih Seri 1 s/d Seri 30 pembentukan karakter rohani atau baca 30 butir karakter lengkap karya Witness Lee.',
    cover_gradient: 'from-blue-600 via-indigo-800 to-slate-900',
    cover_icon: '💎',
    file_path: '/books/buku-karakter-witness-lee.epub',
    has_series: true,
    created_at: new Date('2026-01-05').toISOString()
  },
  {
    id: 'pembinaan-dasar-wn',
    title: 'Pembinaan Dasar: 46 Pelajaran (Pilih Topik 1 – 46)',
    author: 'Watchman Nee',
    category: 'Pembinaan Dasar',
    description: 'Klik untuk memilih topik pelajaran pembinaan dasar orang percaya baru (Bangun Pagi, Berdoa, Membaca Alkitab, Baptisan, dll.) karya Watchman Nee.',
    cover_gradient: 'from-emerald-700 via-teal-900 to-slate-950',
    cover_icon: '🌱',
    file_path: '/books/pembinaan-dasar-watchman-nee.epub',
    has_series: true,
    created_at: new Date('2026-01-04').toISOString()
  },
  {
    id: 'martir-salib-wn',
    title: 'Kisah Martir dan Salib Kristus',
    author: 'Watchman Nee',
    category: 'Biografi & Teladan Hayat',
    description: 'Catatan kesaksian iman, penderitaan di penjara, dan penyerahan diri Saudara Watchman Nee demi kesetiaan kepada salib Kristus dan pemulihan Tuhan.',
    cover_gradient: 'from-rose-600 via-purple-900 to-stone-950',
    cover_icon: '✝️',
    file_path: '/books/martir-dan-salib-watchman-nee.epub',
    created_at: new Date('2026-01-02').toISOString()
  },
  {
    id: 'demo-meditasi',
    title: 'Meditasi: Menemukan Kedamaian Stoa',
    author: 'Marcus Aurelius',
    category: 'Filsafat & Pengembangan Diri',
    description: 'Kumpulan perenungan pribadi Kaisar Romawi Marcus Aurelius mengenai kebajikan, ketabahan batin (ataraxia), dan kebijaksanaan hidup menghadapi tantangan duniawi.',
    cover_gradient: 'from-amber-600 via-amber-800 to-stone-900',
    cover_icon: '🏛️',
    file_path: '/books/meditasi-marcus-aurelius.epub',
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'demo-sang-pangeran',
    title: 'Sang Pangeran (Il Principe)',
    author: 'Niccolo Machiavelli',
    category: 'Filsafat & Politik',
    description: 'Risalah politik abad ke-16 tentang strategi kepemimpinan, seni mempertahankan kekuasaan, dan realisme politik yang legendaris.',
    cover_gradient: 'from-rose-700 via-red-900 to-stone-950',
    cover_icon: '👑',
    file_path: '/books/sang-pangeran-machiavelli.epub',
    created_at: new Date('2026-01-01').toISOString()
  }
];

export default function App() {
  const [currentBook, setCurrentBook] = useState(null);
  const [viewMode, setViewMode] = useState('landing'); // 'landing' | 'library'
  const [books, setBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [userRole, setUserRole] = useState('admin'); // 'admin' | 'reader'
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDetailBook, setSelectedDetailBook] = useState(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Modal Khusus Pemilih Seri Karakter & Pemilih Topik Pembinaan Dasar
  const [isKarakterSeriesModalOpen, setIsKarakterSeriesModalOpen] = useState(false);
  const [isPembinaanModalOpen, setIsPembinaanModalOpen] = useState(false);
  const [isBibleSelectorModalOpen, setIsBibleSelectorModalOpen] = useState(false);

  // Handler memilih Seri Buku Karakter
  const handleSelectKarakterSeries = (seri) => {
    setIsKarakterSeriesModalOpen(false);
    if (seri.id === 'all') {
      setCurrentBook({
        id: 'buku-karakter-wl-full',
        title: 'Buku Karakter: 30 Butir Lengkap',
        author: 'Witness Lee',
        file_path: '/books/buku-karakter-witness-lee.epub',
        cover_icon: '💎'
      });
    } else {
      setCurrentBook({
        id: `buku-karakter-seri-${seri.id}`,
        title: `Buku Karakter Seri ${seri.id}: ${seri.title}`,
        author: 'Witness Lee',
        file_path: `/books/buku-karakter-seri-${seri.id}.epub`,
        cover_icon: '💎'
      });
    }
  };

  // Handler memilih Topik Pembinaan Dasar
  const handleSelectPembinaanTopic = (topik) => {
    setIsPembinaanModalOpen(false);
    if (topik.id === 'all') {
      setCurrentBook({
        id: 'pembinaan-dasar-wn-full',
        title: 'Pembinaan Dasar Kaum Beriman (Volume Lengkap)',
        author: 'Watchman Nee',
        file_path: '/books/pembinaan-dasar-watchman-nee.epub',
        cover_icon: '🌱'
      });
    } else {
      setCurrentBook({
        id: `pembinaan-dasar-topik-${topik.id}`,
        title: `Pembinaan Dasar: Pelajaran ${topik.id} - ${topik.title}`,
        author: 'Watchman Nee',
        file_path: `/books/pembinaan-dasar-topik-${topik.id}.epub`,
        cover_icon: '🌱'
      });
    }
  };

  // Handler memilih Kitab Alkitab
  const handleSelectBibleBook = (type, bookName) => {
    setIsBibleSelectorModalOpen(false);
    if (type === 'MATIUS_CATATAN') {
      setCurrentBook({
        id: 'alkitab-pb-pemulihan',
        title: 'Injil Matius: Versi Pemulihan (Catatan Kaki Lengkap)',
        author: 'Yasperin / Living Stream Ministry',
        file_path: '/books/alkitab-pb-pemulihan.epub',
        cover_icon: '📖'
      });
    } else if (type === 'PL_FULL' || type === 'PL_BOOK') {
      setCurrentBook({
        id: 'alkitab-pl-lengkap',
        title: bookName ? `Kitab ${bookName} (Perjanjian Lama)` : 'Alkitab: Perjanjian Lama (39 Kitab Lengkap)',
        author: 'Yasperin / Living Stream Ministry',
        file_path: '/books/alkitab-perjanjian-lama.epub',
        cover_icon: '📜'
      });
    } else {
      setCurrentBook({
        id: 'alkitab-pb-lengkap',
        title: bookName ? `Kitab ${bookName} (Perjanjian Baru)` : 'Alkitab: Perjanjian Baru (27 Kitab Lengkap)',
        author: 'Yasperin / Living Stream Ministry',
        file_path: '/books/alkitab-perjanjian-baru.epub',
        cover_icon: '📖'
      });
    }
  };

  // Handler membuka buku (apakah langsung baca atau buka modal pemilih seri/topik)
  const handleOpenBook = (book) => {
    if (book.id === 'buku-karakter-wl' || book.id?.startsWith('buku-karakter')) {
      setIsKarakterSeriesModalOpen(true);
    } else if (book.id === 'pembinaan-dasar-wn' || book.id?.startsWith('pembinaan-dasar')) {
      setIsPembinaanModalOpen(true);
    } else if (book.is_bible || book.id?.startsWith('alkitab-')) {
      setViewMode('bible');
    } else {
      setCurrentBook(book);
    }
  };

  // Sesi pengguna demo atau terautentikasi
  const [user, setUser] = useState({
    id: 'user-demo-baca',
    email: 'baca@perpustakaan.cloud',
    full_name: 'Budi Pembaca'
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  }, []);

  // Memuat data buku dari Supabase atau LocalStorage fallback
  const fetchBooks = useCallback(async () => {
    setIsLoadingBooks(true);
    try {
      const hiddenIds = JSON.parse(localStorage.getItem('baca_hidden_books') || '[]');
      const isVisibleItem = (b) => 
        !b.is_bible && 
        !b.id?.startsWith('alkitab-') && 
        b.category !== 'Alkitab & Firman' &&
        !hiddenIds.includes(b.id);

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          // Gabungkan dengan INITIAL_DEMO_BOOKS agar koleksi lokal bawaan selalu tersedia
          const combined = [...data, ...INITIAL_DEMO_BOOKS];
          const uniqueBooks = combined
            .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
            .filter(isVisibleItem);
          setBooks(uniqueBooks);
          setIsLoadingBooks(false);
          return;
        }
      }

      // Mode Demo / Local Storage Fallback
      const localBooks = JSON.parse(localStorage.getItem('baca_demo_books') || '[]');
      const cleanedLocal = localBooks.filter(isVisibleItem);
      localStorage.setItem('baca_demo_books', JSON.stringify(cleanedLocal));

      const combined = [...cleanedLocal, ...INITIAL_DEMO_BOOKS];
      
      // Hapus duplikasi berdasarkan ID dan pastikan Alkitab/buku tersembunyi tidak masuk ke katalog buku
      const uniqueBooks = combined
        .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
        .filter(isVisibleItem);
      setBooks(uniqueBooks);
    } catch (err) {
      console.warn('Gagal fetch buku:', err);
      const hiddenIds = JSON.parse(localStorage.getItem('baca_hidden_books') || '[]');
      setBooks(INITIAL_DEMO_BOOKS.filter(b => !hiddenIds.includes(b.id)));
    } finally {
      setIsLoadingBooks(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();

    // Cek sesi autentikasi Supabase jika aktif
    if (isSupabaseConfigured()) {
      supabase.auth.getUser().then(({ data: { user: authUser } }) => {
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.email.split('@')[0]
          });
          setIsLoggedIn(true);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0]
          });
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setUser({
            id: 'user-demo-baca',
            email: 'baca@perpustakaan.cloud',
            full_name: 'Budi Pembaca'
          });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [fetchBooks]);

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
      showToast('Berhasil keluar dari akun Supabase.');
    }
  };

  // Handler Hapus Buku (Khusus Admin)
  const handleDeleteBook = async (bookId, e) => {
    e.stopPropagation();
    if (!window.confirm('Apakah Anda yakin ingin menghapus buku ini dari katalog?')) return;

    try {
      if (isSupabaseConfigured() && isValidUUID(bookId)) {
        const { error } = await supabase.from('books').delete().eq('id', bookId);
        if (error) throw error;
      } else {
        // Hapus dari localStorage & IndexedDB
        await deleteBookFromIndexedDB(bookId);
        const localBooks = JSON.parse(localStorage.getItem('baca_demo_books') || '[]');
        const updated = localBooks.filter(b => b.id !== bookId);
        localStorage.setItem('baca_demo_books', JSON.stringify(updated));

        // Tandai sebagai buku tersembunyi agar buku bawaan tidak muncul kembali saat reload
        const hiddenBooks = JSON.parse(localStorage.getItem('baca_hidden_books') || '[]');
        if (!hiddenBooks.includes(bookId)) {
          hiddenBooks.push(bookId);
          localStorage.setItem('baca_hidden_books', JSON.stringify(hiddenBooks));
        }
      }

      setBooks(prev => prev.filter(b => b.id !== bookId));
      showToast('Buku berhasil dihapus dari perpustakaan.');
    } catch (err) {
      alert('Gagal menghapus buku: ' + (err.message || 'Terjadi kesalahan'));
    }
  };

  // Daftar Kategori Unik
  const categories = useMemo(() => {
    const set = new Set(['Semua']);
    books.forEach(b => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set);
  }, [books]);

  // Filter Buku berdasarkan Search & Kategori
  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const matchSearch = 
        b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'Semua' || b.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [books, searchQuery, selectedCategory]);

  const copyEnvSample = () => {
    const template = `VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;
    navigator.clipboard.writeText(template);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  // ----------------------------------------------------
  // Jika sedang membaca buku -> Tampilkan Full Reader View
  // ----------------------------------------------------
  if (currentBook) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <CloudEpubReader 
          book={currentBook} 
          userId={user.id} 
          onBack={() => setCurrentBook(null)} 
        />
      </div>
    );
  }

  // ----------------------------------------------------
  // Jika sedang membaca Alkitab (66 Kitab Lengkap)
  // ----------------------------------------------------
  if (!currentBook && viewMode === 'bible') {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <BibleReaderView 
          onBackToHome={() => setViewMode('landing')} 
          onOpenLibrary={() => setViewMode('library')} 
        />
      </div>
    );
  }

  // ----------------------------------------------------
  // Halaman Page Awal (Landing Page)
  // ----------------------------------------------------
  if (!currentBook && viewMode === 'landing') {
    return (
      <>
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-sm flex items-center gap-2 animate-in slide-in-from-bottom duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <LandingPage
          onEnterLibrary={() => setViewMode('library')}
          onOpenBible={() => setViewMode('bible')}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          isSupabaseActive={isSupabaseConfigured()}
        />

        {/* Supabase Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={(authUser) => {
            setUserRole('admin');
            setIsLoggedIn(true);
            setViewMode('library');
            showToast(`Selamat datang, ${authUser.user_metadata?.full_name || authUser.email}! Akun Admin aktif.`);
            fetchBooks();
          }}
        />
      </>
    );
  }

  // ----------------------------------------------------
  // Tampilan Utama: Perpustakaan & Portal Admin
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-sm flex items-center gap-2 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Button 
              variant="default"
              size="icon"
              onClick={() => setViewMode('landing')}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 shadow-lg shadow-amber-500/20 text-white hover:scale-105 transition"
              title="Kembali ke Beranda"
            >
              <BookOpen className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('landing')}
                  className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-100 hover:text-amber-700 transition text-left"
                >
                  Baca
                </button>
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300">
                  Cloud EPUB
                </Badge>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setViewMode('landing')}
                  className="text-[11px] font-semibold text-muted-foreground hover:text-foreground h-auto p-0"
                >
                  Beranda
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">Perpustakaan Digital & Reader Berbasis Supabase</p>
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Switch to Bible Section */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('bible')}
              className="rounded-full text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
              title="Buka Aplikasi Alkitab Versi Pemulihan (Kejadian - Wahyu)"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1 text-amber-700 dark:text-amber-400" />
              <span>Baca Alkitab</span>
            </Button>
            
            {/* Supabase Connection Status Pill */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSupabaseModalOpen(true)}
              className={`rounded-full text-xs font-medium border transition ${
                isSupabaseConfigured()
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800'
              }`}
            >
              <Database className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">
                {isSupabaseConfigured() ? 'Supabase Live' : 'Mode Demo / Offline'}
              </span>
              <span className={`w-2 h-2 rounded-full ml-1.5 ${isSupabaseConfigured() ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            </Button>

            {/* Role Switcher */}
            <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-full flex items-center border border-slate-200 dark:border-slate-700 text-xs">
              <Button
                variant={userRole === 'reader' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setUserRole('reader')}
                className={`h-7 px-3 rounded-full text-xs font-medium transition ${
                  userRole === 'reader' 
                    ? 'bg-white text-slate-900 dark:bg-slate-700 dark:text-slate-100 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
                title="Mode Pembaca: Baca & buat anotasi"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                <span className="hidden md:inline">Pembaca</span>
              </Button>
              <Button
                variant={userRole === 'admin' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setUserRole('admin')}
                className={`h-7 px-3 rounded-full text-xs font-medium transition ${
                  userRole === 'admin' 
                    ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
                title="Mode Admin: Unggah dan kelola koleksi buku"
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                <span className="hidden md:inline">Admin</span>
              </Button>
            </div>

            {/* User Account / Login Button */}
            {isSupabaseConfigured() && (
              isLoggedIn ? (
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 pl-3 pr-1.5 py-1 rounded-full text-xs border border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] max-w-[100px] sm:max-w-[140px] truncate">
                    {user.full_name || user.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="h-6 px-2 text-[10px] rounded-full"
                  >
                    Keluar
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="rounded-full text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400"
                >
                  Masuk Akun
                </Button>
              )
            )}

            {/* Upload Button */}
            {userRole === 'admin' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsUploadModalOpen(true)}
                className="rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900"
              >
                <UploadCloud className="w-4 h-4 mr-1 text-amber-400" />
                <span className="hidden sm:inline">Unggah EPUB</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-stone-900 to-amber-950 text-white p-8 sm:p-10 shadow-xl border border-slate-800">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-medium border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dukungan epub.js modern, font disleksia, & highlight warna</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Selamat datang di Perpustakaan <span className="text-amber-400">Baca</span>.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Jelajahi karya klasik, tandai kutipan favorit, buat catatan pribadi, dan simpan progres membaca Anda secara otomatis di cloud.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Badge variant="outline" className="bg-white/5 border-white/20 text-slate-300 text-xs font-normal py-1 px-3">
                <BookmarkCheck className="w-4 h-4 mr-1.5 text-amber-400" />
                <span>{books.length} Buku Siap Dibaca</span>
              </Badge>
              <Badge variant="outline" className="bg-white/5 border-white/20 text-slate-300 text-xs font-normal py-1 px-3">
                <BookMarked className="w-4 h-4 mr-1.5 text-amber-400" />
                <span>Highlight & Catatan Tersimpan</span>
              </Badge>
            </div>
          </div>

          {/* Decorative background glow */}
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-amber-500/15 to-transparent pointer-events-none" />
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
            <Input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari judul buku atau penulis..."
              className="pl-10 pr-9 bg-white dark:bg-slate-800 rounded-xl text-xs h-10 border-border"
            />
            {searchQuery && (
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Catalog Grid */}
        {isLoadingBooks ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground font-medium">Memuat katalog buku...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <Card className="py-16 text-center space-y-3 p-8 border-dashed">
            <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <h3 className="text-base font-bold text-foreground">Tidak ada buku ditemukan</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Tidak ada buku yang cocok dengan pencarian &quot;{searchQuery}&quot;. Coba ubah kata kunci atau unggah buku baru.
            </p>
            {userRole === 'admin' && (
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                <UploadCloud className="w-4 h-4 mr-1.5" />
                Unggah File EPUB
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map(book => (
              <Card
                key={book.id}
                onClick={() => handleOpenBook(book)}
                className="group relative border-border/80 hover:border-amber-500/80 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                {/* Book Cover Area */}
                <div>
                  <div className={`relative aspect-[3/4] rounded-2xl overflow-hidden mb-4 shadow-md group-hover:shadow-lg transition flex items-center justify-center p-4 bg-gradient-to-tr ${
                    book.cover_gradient || 'from-slate-700 via-stone-800 to-amber-950'
                  }`}>
                    {book.cover_url ? (
                      <img 
                        src={book.cover_url} 
                        alt={book.title} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="text-center text-white space-y-3 p-4">
                        <span className="text-4xl filter drop-shadow">{book.cover_icon || '📖'}</span>
                        <h4 className="font-bold text-sm leading-tight line-clamp-3 text-slate-100 font-serif">
                          {book.title}
                        </h4>
                        <p className="text-[11px] text-amber-200 font-medium tracking-wide">
                          {book.author}
                        </p>
                      </div>
                    )}

                    {/* Badge Category */}
                    <Badge variant="secondary" className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold border-white/20">
                      {book.category || 'Umum'}
                    </Badge>

                    {/* Hover Play Button Overlay */}
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition duration-200">
                        <Play className="w-5 h-5 ml-0.5 fill-current" />
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <h3 className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-amber-600 transition">
                    {book.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    Oleh {book.author}
                  </p>
                  {book.description && (
                    <p className="text-[11px] text-muted-foreground/80 mt-2 line-clamp-2 leading-relaxed">
                      {book.description}
                    </p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDetailBook(book);
                    }}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="Informasi Buku"
                  >
                    <Info className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center gap-1.5">
                    {userRole === 'admin' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteBook(book.id, e)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Hapus dari katalog"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}

                    <span className="inline-flex items-center gap-1 font-semibold text-amber-600 group-hover:text-amber-700 transition">
                      Baca <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Baca - Cloud EPUB Reader & Annotation System</p>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSupabaseModalOpen(true)}
              className="hover:text-slate-600 transition underline underline-offset-4"
            >
              Status & Panduan Supabase
            </button>
          </div>
        </div>
      </footer>

      {/* Admin Upload Modal */}
      <AdminUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onUploadSuccess={(newBook) => {
          setBooks(prev => [newBook, ...prev]);
          showToast(`Buku "${newBook.title}" berhasil ditambahkan ke katalog!`);
        }}
      />

      {/* Supabase Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(authUser) => {
          showToast(`Selamat datang, ${authUser.user_metadata?.full_name || authUser.email}!`);
          fetchBooks();
        }}
      />

      {/* Book Detail Modal */}
      <Dialog open={!!selectedDetailBook} onOpenChange={(open) => !open && setSelectedDetailBook(null)}>
        {selectedDetailBook && (
          <DialogContent className="max-w-md p-6">
            <DialogHeader className="space-y-2">
              <div>
                <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300">
                  {selectedDetailBook.category || 'Umum'}
                </Badge>
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {selectedDetailBook.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Penulis: {selectedDetailBook.author}
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 bg-muted/50 rounded-2xl text-xs text-muted-foreground leading-relaxed border border-border">
              <p className="font-semibold text-foreground mb-1">Sinopsis / Ringkasan:</p>
              {selectedDetailBook.description || 'Tidak ada deskripsi tambahan.'}
            </div>

            <div className="space-y-1 text-[11px] text-muted-foreground">
              <p>Path File: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">{selectedDetailBook.file_path}</code></p>
              <p>Ditambahkan: {selectedDetailBook.created_at ? new Date(selectedDetailBook.created_at).toLocaleDateString('id-ID') : '-'}</p>
            </div>

            <DialogFooter className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDetailBook(null)}
              >
                Tutup
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const b = selectedDetailBook;
                  setSelectedDetailBook(null);
                  handleOpenBook(b);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
              >
                <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                Baca Buku Ini
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Supabase Integration Guide Modal */}
      <Dialog open={isSupabaseModalOpen} onOpenChange={setIsSupabaseModalOpen}>
        <DialogContent className="max-w-xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b border-border space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-base font-bold text-foreground">
                  Panduan Integrasi Supabase Cloud
                </DialogTitle>
                <DialogDescription className="text-[11px] text-muted-foreground">
                  Status sinkronisasi & langkah deployment backend
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Connection Status Box */}
          <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            isSupabaseConfigured()
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-amber-50/80 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured() ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <div>
                <p className="font-bold">
                  {isSupabaseConfigured() ? 'Supabase Terhubung!' : 'Sedang Berjalan dalam Mode Demo'}
                </p>
                <p className="text-[11px] opacity-80">
                  {isSupabaseConfigured() 
                    ? 'Semua anotasi, pembacaan, dan berkas EPUB tersinkronisasi ke cloud.' 
                    : 'Kredensial .env belum diisi. Data tersimpan di memori browser lokal.'}
                </p>
              </div>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-4 text-xs text-foreground">
            <h4 className="font-bold text-sm">Langkah Menghubungkan Supabase Cloud:</h4>
            
            <div className="space-y-3">
              <div className="p-3.5 bg-muted/40 rounded-2xl border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">1. Atur Kredensial di file .env</span>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={copyEnvSample}
                    className="h-7 text-[11px] font-semibold text-amber-600 hover:text-amber-700 p-1"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    {copiedEnv ? 'Tersalin!' : 'Salin Contoh'}
                  </Button>
                </div>
                <pre className="p-2.5 bg-slate-900 text-amber-300 dark:bg-slate-950 rounded-xl font-mono text-[11px] overflow-x-auto">
{`VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>`}
                </pre>
              </div>

              <div className="p-3.5 bg-muted/40 rounded-2xl border border-border space-y-1.5">
                <p className="font-bold text-foreground">2. Jalankan Skrip Database</p>
                <p className="text-muted-foreground text-[11px]">
                  Buka menu <b>SQL Editor</b> di Supabase, lalu jalankan seluruh isi berkas <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">supabase/schema.sql</code> untuk membuat tabel <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">books</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">annotations</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">reading_progress</code>, dan RLS policies.
                </p>
              </div>

              <div className="p-3.5 bg-muted/40 rounded-2xl border border-border space-y-1.5">
                <p className="font-bold text-foreground">3. Siapkan Storage Buckets</p>
                <p className="text-muted-foreground text-[11px]">
                  Di menu <b>Storage</b> Supabase, pastikan ada 2 bucket:
                </p>
                <ul className="list-disc list-inside text-[11px] space-y-0.5 text-muted-foreground pl-1">
                  <li><b>books</b>: Private Bucket (hanya dapat diakses melalui Signed URL)</li>
                  <li><b>book-covers</b>: Public Bucket (untuk gambar sampul)</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 flex sm:flex-row items-center justify-between border-t border-border gap-2">
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Buka Supabase Dashboard <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Button
              onClick={() => setIsSupabaseModalOpen(false)}
              className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
            >
              Tutup Panduan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Pemilih Seri Buku Karakter */}
      <KarakterSeriesModal
        isOpen={isKarakterSeriesModalOpen}
        onClose={() => setIsKarakterSeriesModalOpen(false)}
        onSelectSeries={handleSelectKarakterSeries}
      />

      {/* Modal Pemilih Topik Pembinaan Dasar */}
      <PembinaanTopicsModal
        isOpen={isPembinaanModalOpen}
        onClose={() => setIsPembinaanModalOpen(false)}
        onSelectTopic={handleSelectPembinaanTopic}
      />

      {/* Modal Pemilih Kitab Alkitab (Kejadian - Wahyu) */}
      <BibleSelectorModal
        isOpen={isBibleSelectorModalOpen}
        onClose={() => setIsBibleSelectorModalOpen(false)}
        onSelectBibleBook={handleSelectBibleBook}
      />
    </div>
  );
}
