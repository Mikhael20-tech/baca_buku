import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BookOpen, Search, UploadCloud, Database, ShieldCheck, UserCheck, 
  Trash2, Play, Info, Sparkles, CheckCircle2, Copy, 
  ExternalLink, X, BookmarkCheck, ArrowRight, BookMarked
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { deleteBookFromIndexedDB } from './lib/bookStorage';
import CloudEpubReader from './components/CloudEpubReader';
import AdminUploadModal from './components/AdminUploadModal';
import AuthModal from './components/AuthModal';
import LandingPage from './components/LandingPage';

const INITIAL_DEMO_BOOKS = [
  {
    id: 'buku-karakter-wl',
    title: 'Karakter: 30 Butir Pembentukan Karakter Manusia',
    author: 'Witness Lee',
    category: 'Pembinaan Karakter',
    description: 'Panduan pembentukan 30 butir karakter manusia yang berguna bagi Tuhan: Benar, Tepat, Ketat, Rajin, Lapang, Cermat, Stabil, Sabar, Dalam, Murni, Seimbang, Tenang, Tulus, Umum, Terbuka, Akrab, Gairah, Luwes, Teguh, Lembut, Taat, Derita, Rendah, Miskin, Tekun, Sulit, Tekan, Jernih, Murah Hati, dan Bobot.',
    cover_gradient: 'from-blue-600 via-indigo-800 to-slate-900',
    cover_icon: '💎',
    file_path: '/books/buku-karakter-witness-lee.epub',
    created_at: new Date('2026-01-05').toISOString()
  },
  {
    id: 'pembinaan-dasar-wn',
    title: 'Pembinaan Dasar Kaum Beriman (Semua Seri)',
    author: 'Watchman Nee',
    category: 'Pembinaan Rohani',
    description: 'Kumpulan lengkap 46 pelajaran pembinaan dasar orang beriman: Bangun Pagi-pagi, Baptisan, Berdoa, Bersaksi, Bersidang, Konsikrasi, Membaca Alkitab, dan wawasan kehidupan kristiani yang praktis.',
    cover_gradient: 'from-emerald-600 via-teal-800 to-slate-900',
    cover_icon: '🌱',
    file_path: '/books/pembinaan-dasar-watchman-nee.epub',
    created_at: new Date('2026-01-04').toISOString()
  },
  {
    id: 'alkitab-pb-pemulihan',
    title: 'Alkitab PB Versi Pemulihan (Catatan Kaki)',
    author: 'Yasperin / Living Stream Ministry',
    category: 'Alkitab & Firman',
    description: 'Alkitab Perjanjian Baru Versi Pemulihan lengkap dengan garis besar pokok kitab, keterangan penulis, ayat firman, dan catatan kaki penjelasan wahyu rohani (Injil Matius s/d Kitab Wahyu).',
    cover_gradient: 'from-amber-600 via-yellow-800 to-stone-900',
    cover_icon: '📖',
    file_path: '/books/alkitab-pb-pemulihan.epub',
    created_at: new Date('2026-01-03').toISOString()
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
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          // Gabungkan dengan INITIAL_DEMO_BOOKS agar koleksi lokal bawaan selalu tersedia
          const combined = [...data, ...INITIAL_DEMO_BOOKS];
          const uniqueBooks = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
          setBooks(uniqueBooks);
          setIsLoadingBooks(false);
          return;
        }
      }

      // Mode Demo / Local Storage Fallback
      const localBooks = JSON.parse(localStorage.getItem('baca_demo_books') || '[]');
      const combined = [...localBooks, ...INITIAL_DEMO_BOOKS];
      
      // Hapus duplikasi berdasarkan ID
      const uniqueBooks = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      setBooks(uniqueBooks);
    } catch (err) {
      console.warn('Gagal fetch buku:', err);
      setBooks(INITIAL_DEMO_BOOKS);
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
      if (isSupabaseConfigured() && !bookId.startsWith('demo-') && !bookId.startsWith('local-')) {
        const { error } = await supabase.from('books').delete().eq('id', bookId);
        if (error) throw error;
      } else {
        // Hapus dari localStorage & IndexedDB
        await deleteBookFromIndexedDB(bookId);
        const localBooks = JSON.parse(localStorage.getItem('baca_demo_books') || '[]');
        const updated = localBooks.filter(b => b.id !== bookId);
        localStorage.setItem('baca_demo_books', JSON.stringify(updated));
      }

      setBooks(prev => prev.filter(b => b.id !== bookId));
      showToast('Buku berhasil dihapus dari perpustakaan.');
    } catch (err) {
      alert('Gagal menghapus buku: ' + err.message);
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
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setViewMode('landing')}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white hover:scale-105 transition"
              title="Kembali ke Beranda"
            >
              <BookOpen className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('landing')}
                  className="font-extrabold text-xl tracking-tight text-slate-900 hover:text-amber-700 transition text-left"
                >
                  Baca
                </button>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                  Cloud EPUB
                </span>
                <button
                  onClick={() => setViewMode('landing')}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-2 ml-1"
                >
                  Beranda
                </button>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Perpustakaan Digital & Reader Berbasis Supabase</p>
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-3">
            
            {/* Supabase Connection Status Pill */}
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                isSupabaseConfigured()
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isSupabaseConfigured() ? 'Supabase Live' : 'Mode Demo / Offline'}
              </span>
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured() ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            </button>

            {/* Role Switcher */}
            <div className="bg-slate-100 p-0.5 rounded-full flex items-center border border-slate-200 text-xs">
              <button
                onClick={() => setUserRole('reader')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition ${
                  userRole === 'reader' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Mode Pembaca: Baca & buat anotasi"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Pembaca</span>
              </button>
              <button
                onClick={() => setUserRole('admin')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition ${
                  userRole === 'admin' 
                    ? 'bg-amber-600 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Mode Admin: Unggah dan kelola koleksi buku"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Admin</span>
              </button>
            </div>

            {/* User Account / Login Button */}
            {isSupabaseConfigured() && (
              isLoggedIn ? (
                <div className="flex items-center gap-2 bg-slate-100 pl-3 pr-1.5 py-1 rounded-full text-xs border border-slate-200">
                  <span className="font-semibold text-slate-800 text-[11px] max-w-[100px] sm:max-w-[140px] truncate">
                    {user.full_name || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-2 py-0.5 hover:bg-slate-200 text-slate-600 rounded-full font-medium text-[10px] transition"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-full text-xs font-semibold border border-amber-200 transition"
                >
                  Masuk Akun
                </button>
              )
            )}

            {/* Upload Button */}
            {userRole === 'admin' && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
              >
                <UploadCloud className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Unggah EPUB</span>
              </button>
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
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <BookmarkCheck className="w-4 h-4 text-amber-400" />
                <span>{books.length} Buku Siap Dibaca</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <BookMarked className="w-4 h-4 text-amber-400" />
                <span>Highlight & Catatan Tersimpan</span>
              </div>
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
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari judul buku atau penulis..."
              className="w-full pl-10 pr-9 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Catalog Grid */}
        {isLoadingBooks ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Memuat katalog buku...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Tidak ada buku ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ada buku yang cocok dengan pencarian &quot;{searchQuery}&quot;. Coba ubah kata kunci atau unggah buku baru.
            </p>
            {userRole === 'admin' && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <UploadCloud className="w-4 h-4" />
                Unggah File EPUB
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map(book => (
              <div
                key={book.id}
                onClick={() => setCurrentBook(book)}
                className="group relative bg-white rounded-3xl border border-slate-200/90 hover:border-amber-400 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer flex flex-col justify-between"
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
                    <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/20">
                      {book.category || 'Umum'}
                    </span>

                    {/* Hover Play Button Overlay */}
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition duration-200">
                        <Play className="w-5 h-5 ml-0.5 fill-current" />
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-amber-700 transition">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    Oleh {book.author}
                  </p>
                  {book.description && (
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {book.description}
                    </p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDetailBook(book);
                    }}
                    className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition"
                    title="Informasi Buku"
                  >
                    <Info className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    {userRole === 'admin' && (
                      <button
                        onClick={(e) => handleDeleteBook(book.id, e)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                        title="Hapus dari katalog"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <span className="inline-flex items-center gap-1 font-semibold text-amber-700 hover:text-amber-800">
                      Baca <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
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
      {selectedDetailBook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                  {selectedDetailBook.category || 'Umum'}
                </span>
                <h3 className="font-bold text-lg text-slate-900 mt-2">
                  {selectedDetailBook.title}
                </h3>
                <p className="text-xs text-slate-500">Penulis: {selectedDetailBook.author}</p>
              </div>
              <button 
                onClick={() => setSelectedDetailBook(null)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 leading-relaxed border border-slate-100">
              <p className="font-semibold text-slate-700 mb-1">Sinopsis / Ringkasan:</p>
              {selectedDetailBook.description || 'Tidak ada deskripsi tambahan.'}
            </div>

            <div className="space-y-1 text-[11px] text-slate-400">
              <p>Path File: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">{selectedDetailBook.file_path}</code></p>
              <p>Ditambahkan: {selectedDetailBook.created_at ? new Date(selectedDetailBook.created_at).toLocaleDateString('id-ID') : '-'}</p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedDetailBook(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  const b = selectedDetailBook;
                  setSelectedDetailBook(null);
                  setCurrentBook(b);
                }}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Baca Buku Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Integration Guide Modal */}
      {isSupabaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 my-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Panduan Integrasi Supabase Cloud</h3>
                  <p className="text-[11px] text-slate-500">Status sinkronisasi & langkah deployment backend</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSupabaseModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Connection Status Box */}
            <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
              isSupabaseConfigured()
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
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
            <div className="space-y-4 text-xs text-slate-700">
              <h4 className="font-bold text-slate-900 text-sm">Langkah Menghubungkan Supabase Cloud:</h4>
              
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">1. Atur Kredensial di file .env</span>
                    <button 
                      onClick={copyEnvSample}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedEnv ? 'Tersalin!' : 'Salin Contoh'}
                    </button>
                  </div>
                  <pre className="p-2.5 bg-slate-900 text-amber-300 rounded-xl font-mono text-[11px] overflow-x-auto">
{`VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>`}
                  </pre>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                  <p className="font-bold text-slate-800">2. Jalankan Skrip Database</p>
                  <p className="text-slate-500 text-[11px]">
                    Buka menu <b>SQL Editor</b> di Supabase, lalu jalankan seluruh isi berkas <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">supabase/schema.sql</code> untuk membuat tabel <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">books</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">annotations</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">reading_progress</code>, dan RLS policies.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                  <p className="font-bold text-slate-800">3. Siapkan Storage Buckets</p>
                  <p className="text-slate-500 text-[11px]">
                    Di menu <b>Storage</b> Supabase, pastikan ada 2 bucket:
                  </p>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5 text-slate-600 pl-1">
                    <li><b>books</b>: Private Bucket (hanya dapat diakses melalui Signed URL)</li>
                    <li><b>book-covers</b>: Public Bucket (untuk gambar sampul)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Buka Supabase Dashboard <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setIsSupabaseModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
