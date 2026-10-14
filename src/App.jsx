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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Modal Khusus Pemilih Seri Karakter & Pemilih Topik Pembinaan Dasar
  const [isKarakterSeriesModalOpen, setIsKarakterSeriesModalOpen] = useState(false);
  const [isPembinaanModalOpen, setIsPembinaanModalOpen] = useState(false);
  const [isBibleSelectorModalOpen, setIsBibleSelectorModalOpen] = useState(false);

  // Sesi pengguna terautentikasi / tamu
  const [user, setUser] = useState({
    id: 'user-demo-baca',
    email: 'baca@perpustakaan.cloud',
    full_name: 'Budi Pembaca'
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Handler memilih Seri Buku Karakter
  const handleSelectKarakterSeries = (seri) => {
    setIsKarakterSeriesModalOpen(false);
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      showToast('Silakan masuk atau daftar akun terlebih dahulu untuk membaca.');
      return;
    }
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
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      showToast('Silakan masuk atau daftar akun terlebih dahulu untuk membaca.');
      return;
    }
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
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      showToast('Silakan masuk atau daftar akun terlebih dahulu untuk membaca Alkitab.');
      return;
    }
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

  // Handler membuka buku (wajib login terlebih dahulu)
  const handleOpenBook = (book) => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      showToast('Silakan Masuk atau Daftar akun terlebih dahulu untuk membaca.');
      return;
    }
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
          onOpenBible={() => {
            if (!isLoggedIn) {
              setIsAuthModalOpen(true);
              showToast('Silakan masuk atau buat akun baru terlebih dahulu untuk membaca Alkitab.');
            } else {
              setViewMode('bible');
            }
          }}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={handleLogout}
        />

        {/* Supabase Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={(authUser) => {
            setIsLoggedIn(true);
            setUser({
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || authUser.email.split('@')[0]
            });
            showToast(`Selamat datang, ${authUser.user_metadata?.full_name || authUser.email}!`);
            fetchBooks();
          }}
        />
      </>
    );
  }

  // ----------------------------------------------------
  // Tampilan Utama: Perpustakaan (Tema Selaras Landing Page)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1C1917] flex flex-col font-sans selection:bg-[#B96A4A]/25 selection:text-[#3B4B34] relative overflow-x-hidden">
      
      {/* Floating Ambient Glow Atmospheric Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="float-slow absolute -top-32 left-1/4 w-[650px] h-[650px] bg-gradient-to-br from-[#8E9C75]/20 via-[#3B4B34]/10 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="float-slow-reverse absolute top-1/3 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-[#B96A4A]/15 via-[#B96A4A]/10 to-transparent rounded-full blur-3xl opacity-50" />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1917] text-[#F4EFE6] px-5 py-3 rounded-2xl shadow-xl border border-[#1C1917]/20 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#8E9C75]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar (Identik dengan Landing Page) */}
      <header className="sticky top-0 z-40 bg-[#F4EFE6]/90 backdrop-blur-md border-b border-[#1C1917]/8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setViewMode('landing')}
              className="w-10 h-10 rounded-2xl bg-[#3B4B34] text-[#F4EFE6] flex items-center justify-center shadow-md shadow-[#3B4B34]/20 btn-lift"
              title="Kembali ke Beranda"
            >
              <Utensils className="w-5 h-5 text-amber-200" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('landing')}
                  className="font-extrabold text-2xl tracking-tight text-[#1C1917] font-serif hover:text-[#3B4B34] transition text-left"
                >
                  Baca.
                </button>
                <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-[#8E9C75]/25 text-[#3B4B34] border border-[#8E9C75]/30 whitespace-nowrap">
                  Mari Makan Tuhan
                </span>
              </div>
              <p className="text-[11px] text-[#78716C] hidden sm:block whitespace-nowrap">Perpustakaan Santapan Hayat &amp; Alkitab Pemulihan</p>
            </div>
          </div>

          {/* Actions & Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Kembali ke Beranda */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('landing')}
              className="rounded-full text-xs font-bold text-[#78716C] hover:text-[#1C1917] hover:bg-[#1C1917]/5 h-9 px-3.5 btn-lift whitespace-nowrap"
            >
              Beranda
            </Button>

            {/* Switch to Bible Section */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!isLoggedIn) {
                  setIsAuthModalOpen(true);
                  showToast('Silakan masuk atau buat akun baru terlebih dahulu untuk membaca Alkitab.');
                } else {
                  setViewMode('bible');
                }
              }}
              className="rounded-full text-xs font-bold border-[#3B4B34]/30 text-[#3B4B34] hover:bg-[#3B4B34]/10 bg-white/70 h-9 px-3.5 shadow-xs btn-lift whitespace-nowrap"
              title="Buka 66 Kitab Alkitab Versi Pemulihan"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1 text-[#3B4B34]" />
              <span>Baca Alkitab</span>
            </Button>

            {/* Upload Button (Khusus Admin) */}
            {userRole === 'admin' && (
              <Button
                size="sm"
                onClick={() => {
                  if (!isLoggedIn) {
                    setIsAuthModalOpen(true);
                    showToast('Silakan masuk akun terlebih dahulu untuk mengunggah.');
                  } else {
                    setIsUploadModalOpen(true);
                  }
                }}
                className="rounded-full text-xs font-bold bg-[#1C1917] hover:bg-[#3B4B34] text-white h-9 px-3.5 shadow-sm btn-lift whitespace-nowrap"
              >
                <UploadCloud className="w-3.5 h-3.5 mr-1 text-amber-300" />
                <span className="hidden sm:inline">Unggah EPUB</span>
              </Button>
            )}

            {/* User Account / Login Button */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2 bg-white/80 px-3 py-1 rounded-full border border-[#1C1917]/10 text-xs shadow-xs">
                <span className="font-semibold text-[#1C1917] text-[11px] max-w-[110px] truncate">
                  {user.full_name || user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="h-6 px-2 text-[10px] rounded-full text-[#78716C] hover:text-[#1C1917]"
                >
                  Keluar
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => setIsAuthModalOpen(true)}
                className="rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-white h-9 px-4 shadow-sm btn-lift whitespace-nowrap"
              >
                <span>Masuk / Daftar</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* Hero Section Banner (Tema Selaras Landing Page) */}
        <div className="relative overflow-hidden rounded-[32px] p-8 sm:p-10 shadow-2xl text-[#F4EFE6] border border-white/10" style={{ background: 'linear-gradient(135deg, #1C2317 0%, #293322 55%, #151A11 100%)' }}>
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8E9C75]/25 border border-[#8E9C75]/40 text-[#8E9C75] text-[11px] font-bold tracking-wider uppercase">
              <Utensils className="w-3.5 h-3.5 text-amber-300" />
              <span>Meja Perjamuan Firman Rohani</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-normal leading-tight">
              Katalog Santapan Hayat & <br />
              <span className="italic font-light text-amber-200">Pelajaran Kaum Beriman.</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#A8A29E] leading-relaxed">
              Nikmati santapan firman harian dari FKKP, khazanah Alkitab Versi Pemulihan, 46 pokok pembinaan dasar, dan 30 seri pembentukan karakter rohani.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Badge variant="outline" className="bg-white/5 border-white/20 text-[#D6D3D1] text-xs py-1 px-3 rounded-full">
                <BookmarkCheck className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
                <span>{books.length} Buku Santapan Siap Dibaca</span>
              </Badge>
              <Badge variant="outline" className="bg-white/5 border-white/20 text-[#D6D3D1] text-xs py-1 px-3 rounded-full">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
                <span>Sinkronisasi Otomatis Cloud</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map(cat => (
              <Button
                key={cat}
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 btn-lift ${
                  selectedCategory === cat
                    ? 'bg-[#3B4B34] text-[#F4EFE6] border-[#3B4B34] shadow-sm'
                    : 'bg-white/80 text-[#57534E] hover:bg-[#1C1917]/5 border-[#1C1917]/10'
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C] z-10" />
            <Input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari judul buku atau penulis..."
              className="pl-10 pr-9 bg-white rounded-full text-xs h-10 border-[#1C1917]/15 focus:border-[#3B4B34] shadow-xs text-[#1C1917]"
            />
            {searchQuery && (
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-[#78716C] hover:text-[#1C1917]"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Catalog Grid */}
        {isLoadingBooks ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#3B4B34] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#78716C] font-semibold">Menyiapkan hidangan buku santapan...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <Card className="rounded-[32px] p-12 text-center bg-white/70 border border-[#1C1917]/10 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EAE3D5] text-[#3B4B34] flex items-center justify-center mx-auto text-2xl">
              📖
            </div>
            <h3 className="font-serif font-bold text-lg text-[#1C1917]">Tidak Ada Buku yang Cocok</h3>
            <p className="text-xs text-[#78716C] max-w-sm mx-auto">
              Cobalah mengganti kata kunci pencarian atau memilih kategori yang berbeda.
            </p>
            {userRole === 'admin' && (
              <Button
                onClick={() => {
                  if (!isLoggedIn) {
                    setIsAuthModalOpen(true);
                  } else {
                    setIsUploadModalOpen(true);
                  }
                }}
                className="bg-[#3B4B34] hover:bg-[#20251A] text-white rounded-full text-xs font-bold shadow-sm btn-lift"
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
                className="group relative rounded-[28px] p-5 bg-[#F7F4ED] border border-[#1C1917]/10 hover:border-[#8E9C75] hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden btn-lift"
              >
                {/* Book Cover Area */}
                <div>
                  <div className={`relative aspect-[3/4] rounded-2xl overflow-hidden mb-4 shadow-md group-hover:shadow-lg transition flex items-center justify-center p-4 bg-gradient-to-tr ${
                    book.cover_gradient || 'from-[#1C2317] via-[#293322] to-[#3B4B34]'
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
                        <h4 className="font-bold text-sm leading-tight line-clamp-3 text-white font-serif">
                          {book.title}
                        </h4>
                        <p className="text-[11px] text-amber-200 font-medium tracking-wide">
                          {book.author}
                        </p>
                      </div>
                    )}

                    {/* Badge Category */}
                    <Badge variant="secondary" className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold border-white/20 rounded-full">
                      {book.category || 'Umum'}
                    </Badge>

                    {/* Hover Play Button Overlay */}
                    <div className="absolute inset-0 bg-[#1C1917]/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#3B4B34] text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition duration-200">
                        <Play className="w-5 h-5 ml-0.5 fill-current" />
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <h3 className="font-serif font-bold text-[#1C1917] text-base line-clamp-1 group-hover:text-[#3B4B34] transition">
                    {book.title}
                  </h3>
                  <p className="text-xs text-[#78716C] mt-1 line-clamp-1 font-semibold">
                    Oleh {book.author}
                  </p>
                  {book.description && (
                    <p className="text-[11px] text-[#57534E] mt-2 line-clamp-2 leading-relaxed">
                      {book.description}
                    </p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-3 border-t border-[#1C1917]/8 flex items-center justify-between text-xs">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDetailBook(book);
                    }}
                    className="h-8 w-8 text-[#78716C] hover:text-[#1C1917] rounded-full"
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
                        className="h-8 w-8 text-[#78716C] hover:text-rose-600 rounded-full"
                        title="Hapus dari katalog"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}

                    <span className="inline-flex items-center gap-1 font-bold text-xs text-[#3B4B34] group-hover:text-[#20251A] transition">
                      Baca <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer (Identik dengan Landing Page) */}
      <footer className="mt-20 py-10 bg-[#EFE9DF] border-t border-[#1C1917]/10 text-xs text-[#78716C]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm text-[#1C1917]">Baca</span>
            <span>• Pusat Pembacaan Firman &amp; Perpustakaan Hayat Digital</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setViewMode('landing')} className="hover:text-[#1C1917] transition-colors">Beranda</button>
            <button 
              onClick={() => {
                if (!isLoggedIn) {
                  setIsAuthModalOpen(true);
                  showToast('Silakan masuk atau buat akun baru terlebih dahulu untuk membaca Alkitab.');
                } else {
                  setViewMode('bible');
                }
              }} 
              className="hover:text-[#1C1917] transition-colors"
            >
              Alkitab (66 Kitab)
            </button>
            <button onClick={() => setIsAuthModalOpen(true)} className="hover:text-[#1C1917] transition-colors">Admin Portal</button>
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
          setIsLoggedIn(true);
          setUser({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.email.split('@')[0]
          });
          showToast(`Selamat datang, ${authUser.user_metadata?.full_name || authUser.email}!`);
          fetchBooks();
        }}
      />

      {/* Book Detail Modal */}
      <Dialog open={!!selectedDetailBook} onOpenChange={(open) => !open && setSelectedDetailBook(null)}>
        {selectedDetailBook && (
          <DialogContent className="max-w-md rounded-[32px] p-7 bg-[#F7F4ED] border border-[#1C1917]/15 text-[#1C1917]">
            <DialogHeader className="space-y-2 text-left">
              <div>
                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-[#3B4B34] bg-[#8E9C75]/20 border-[#8E9C75]/40 rounded-full">
                  {selectedDetailBook.category || 'Umum'}
                </Badge>
              </div>
              <DialogTitle className="text-xl font-serif font-bold text-[#1C1917]">
                {selectedDetailBook.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#78716C]">
                Penulis: {selectedDetailBook.author}
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 bg-white rounded-2xl text-xs text-[#57534E] leading-relaxed border border-[#1C1917]/8">
              <p className="font-bold text-[#1C1917] mb-1">Sinopsis / Ringkasan:</p>
              {selectedDetailBook.description || 'Tidak ada deskripsi tambahan.'}
            </div>

            <div className="space-y-1 text-[11px] text-[#78716C]">
              <p>Ditambahkan: {selectedDetailBook.created_at ? new Date(selectedDetailBook.created_at).toLocaleDateString('id-ID') : '-'}</p>
            </div>

            <DialogFooter className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDetailBook(null)}
                className="rounded-full text-xs font-bold border-[#1C1917]/20 text-[#1C1917]"
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
                className="rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-white btn-lift"
              >
                <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                Baca Buku Ini
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
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
