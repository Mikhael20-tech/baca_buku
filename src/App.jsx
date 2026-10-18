import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BookOpen, Search, UploadCloud, Database, ShieldCheck, UserCheck, 
  Trash2, Play, Info, Sparkles, CheckCircle2, Copy, 
  ExternalLink, X, BookmarkCheck, ArrowRight, BookMarked, Utensils,
  User, Smartphone, ChevronDown, LogIn, Settings, Users, Lock, Music,
  Menu, Home
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuLabel 
} from '@/components/ui/dropdown-menu';
import { supabase, isSupabaseConfigured, isValidUUID } from './lib/supabase';
import { deleteBookFromIndexedDB } from './lib/bookStorage';
const CloudEpubReader = React.lazy(() => import('./components/CloudEpubReader'));
const BibleReaderView = React.lazy(() => import('./components/BibleReaderView'));
const KidungReaderView = React.lazy(() => import('./components/KidungReaderView'));
const UserDashboard = React.lazy(() => import('./components/UserDashboard'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));

const ViewLoadingFallback = ({ text = 'Memuat...' }) => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-[#3B4B34]">
    <div className="w-9 h-9 border-3 border-[#3B4B34]/25 border-t-[#3B4B34] rounded-full animate-spin mb-2.5"></div>
    <p className="text-xs font-semibold tracking-wider uppercase font-mono text-stone-600">{text}</p>
  </div>
);

import AdminUploadModal from './components/AdminUploadModal';
import AuthModal from './components/AuthModal';
import LandingPage from './components/LandingPage';
import KarakterSeriesModal from './components/KarakterSeriesModal';
import PembinaanTopicsModal from './components/PembinaanTopicsModal';
import BibleSelectorModal from './components/BibleSelectorModal';
import SubscriptionModal from './components/SubscriptionModal';
import QuickScriptureModal from './components/QuickScriptureModal';
import LockedBookModal from './components/LockedBookModal';
import { isBookLocked, getBookAccessInfo } from './lib/accessControl';
import { 
  getStoredEnjoyments, 
  saveStoredEnjoyments, 
  addEnjoyment, 
  getUserSubscription, 
  saveUserSubscription 
} from './lib/communityStorage';
import { syncUserProfileToSupabase } from './lib/userManagement';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const INITIAL_DEMO_BOOKS = [
  {
    id: 'buku-karakter-wl',
    title: 'Buku Karakter: 30 Butir (Pilih Seri 1 – 30)',
    author: 'Witness Lee',
    category: 'Pembinaan Karakter',
    description: 'Klik untuk memilih Seri 1 s/d Seri 30 pembentukan karakter rohani atau baca 30 butir karakter lengkap karya Witness Lee.',
    cover_url: '/covers/buku-karakter-wl.jpg',
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
    cover_url: '/covers/pembinaan-dasar-wn.jpg',
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
    cover_url: '/covers/martir-salib-wn.jpg',
    cover_gradient: 'from-rose-600 via-purple-900 to-stone-950',
    cover_icon: '✝️',
    file_path: '/books/martir-dan-salib-watchman-nee.epub',
    created_at: new Date('2026-01-02').toISOString()
  },
  // ==========================================
  // KIDUNG & SUPLEMEN (Koleksi Lagu Pujian Rohani)
  // ==========================================
  {
    id: 'kidung-jemaat-indonesia',
    title: 'Kidung Rohani (Kidung 1 – 786)',
    author: 'Yasperin / LSM',
    category: 'Kidung & Pujian',
    description: 'Koleksi lengkap 786 Kidung Rohani (Hymns) Indonesia: lirik bait, koor/refrein, nada/birama, dan indeks 29 kategori tematik.',
    cover_url: '/covers/kidung-jemaat.jpg',
    cover_gradient: 'from-amber-600 via-yellow-700 to-amber-950',
    cover_icon: '🎵',
    file_path: '/books/kidung-jemaat-indonesia.epub',
    created_at: new Date('2026-01-07').toISOString()
  },
  {
    id: 'suplemen-kidung-indonesia',
    title: 'Suplemen Kidung Rohani (S. 0001 – S. 2032)',
    author: 'Yasperin / LSM',
    category: 'Kidung & Pujian',
    description: 'Koleksi lengkap 372 Kidung Suplemen penomoran 4 digit (S. 0001 – S. 2032): Kata-kata Pujian, Roh & Hayat, Menikmati Kristus, Visi Gereja, hingga S. 2032 Kasih Karunia.',
    cover_url: '/covers/suplemen-kidung.jpg',
    cover_gradient: 'from-amber-500 via-orange-700 to-amber-900',
    cover_icon: '🎶',
    file_path: '/books/suplemen-kidung-indonesia.epub',
    created_at: new Date('2026-01-07').toISOString()
  },
  // ==========================================
  // PELAJARAN HAYAT (Life-Study of the Bible)
  // ==========================================
  {
    id: 'ph-matius',
    title: 'Pelajaran Hayat: Injil Matius',
    author: 'Witness Lee',
    category: 'Pelajaran Hayat',
    description: '105 Berita eksposisi hayat atas Injil Kerajaan (Matius): Silsilah Raja, Pelayanan Raja Surgawi, dan Salib serta Kebangkitan Kristus.',
    cover_url: '/covers/ph-matius.jpg',
    cover_gradient: 'from-blue-700 via-sky-800 to-slate-900',
    cover_icon: '👑',
    file_path: '/books/pelajaran-hayat-matius.epub',
    required_tier: 'premium',
    created_at: new Date('2026-01-08').toISOString()
  },
  {
    id: 'ph-markus',
    title: 'Pelajaran Hayat: Injil Markus',
    author: 'Witness Lee',
    category: 'Pelajaran Hayat',
    description: '141 Berita eksposisi hayat atas Injil Hamba Allah (Markus): Pelayanan Juruselamat-Hamba yang setia dalam kasih karunia dan kuasa ilahi.',
    cover_url: '/covers/ph-markus.jpg',
    cover_gradient: 'from-cyan-700 via-blue-900 to-slate-950',
    cover_icon: '🕊️',
    file_path: '/books/pelajaran-hayat-markus.epub',
    required_tier: 'premium',
    created_at: new Date('2026-01-08').toISOString()
  },
  {
    id: 'ph-lukas',
    title: 'Pelajaran Hayat: Injil Lukas',
    author: 'Witness Lee',
    category: 'Pelajaran Hayat',
    description: '106 Berita eksposisi hayat atas Injil Manusia Sejati (Lukas): Juruselamat-Manusia yang sempurna dalam belas kasihan ilahi.',
    cover_url: '/covers/ph-lukas.jpg',
    cover_gradient: 'from-teal-700 via-emerald-900 to-slate-950',
    cover_icon: '🌿',
    file_path: '/books/pelajaran-hayat-lukas.epub',
    required_tier: 'premium',
    created_at: new Date('2026-01-08').toISOString()
  },
  {
    id: 'ph-yohanes',
    title: 'Pelajaran Hayat: Injil Yohanes',
    author: 'Witness Lee',
    category: 'Pelajaran Hayat',
    description: '52 Berita eksposisi hayat atas Injil Hayat (Yohanes): Kristus sebagai Firman Allah, Anak Domba Allah, Roti Hayat, dan Pokok Anggur Sejati.',
    cover_url: '/covers/ph-yohanes.jpg',
    cover_gradient: 'from-indigo-700 via-blue-900 to-slate-950',
    cover_icon: '✨',
    file_path: '/books/pelajaran-hayat-yohanes.epub',
    required_tier: 'premium',
    created_at: new Date('2026-01-08').toISOString()
  },
  {
    id: 'ph-roma',
    title: 'Pelajaran Hayat: Surat Roma',
    author: 'Witness Lee',
    category: 'Pelajaran Hayat',
    description: '70 Berita eksposisi lengkap Surat Roma: Pembenaran oleh iman, Pengudusan dalam hayat, Pemuliaan, dan Kehidupan Praktis Tubuh Kristus.',
    cover_url: '/covers/ph-roma.jpg',
    cover_gradient: 'from-violet-700 via-purple-900 to-slate-950',
    cover_icon: '📜',
    file_path: '/books/pelajaran-hayat-roma.epub',
    required_tier: 'premium',
    created_at: new Date('2026-01-08').toISOString()
  },
  {
    id: 'ph-korintus',
    title: 'Pelajaran Hayat: Surat 1 & 2 Korintus',
    author: 'Witness Lee',
    category: 'Pelajaran Hayat',
    description: '223 Berita eksposisi lengkap Surat Korintus: Kristus sebagai bagian unik kita, Roh Pemberi Hayat, dan Pelayanan Perjanjian Baru.',
    cover_url: '/covers/ph-korintus.jpg',
    cover_gradient: 'from-amber-700 via-orange-900 to-stone-950',
    cover_icon: '🏛️',
    file_path: '/books/pelajaran-hayat-korintus.epub',
    required_tier: 'premium',
    created_at: new Date('2026-01-08').toISOString()
  },
  {
    id: 'ph-galatia-efesus',
    title: 'Pelajaran Hayat: Surat Galatia & Efesus',
    author: 'Witness Lee',
    category: 'Pelajaran Hayat',
    description: '208 Berita: Kemerdekaan dalam Kristus (Galatia), serta Rahasia Ekonomi Allah dan Kemuliaan Tubuh Kristus (Efesus).',
    cover_url: '/covers/ph-galatia-efesus.jpg',
    cover_gradient: 'from-emerald-700 via-teal-900 to-slate-950',
    cover_icon: '🌟',
    file_path: '/books/pelajaran-hayat-galatia-efesus.epub',
    required_tier: 'premium',
    created_at: new Date('2026-01-08').toISOString()
  },
  {
    id: 'ph-filipi-kolose',
    title: 'Pelajaran Hayat: Surat Filipi & Kolose',
    author: 'Witness Lee',
    category: 'Pelajaran Hayat',
    description: '669 Berita: Pengalaman kenikmatan Kristus sebagai pola (Filipi), serta Kealmuhitan dan Keunggulan Kristus di atas segala sesuatu (Kolose).',
    cover_url: '/covers/ph-filipi-kolose.jpg',
    cover_gradient: 'from-fuchsia-700 via-purple-900 to-slate-950',
    cover_icon: '💎',
    file_path: '/books/pelajaran-hayat-filipi-kolose.epub',
    required_tier: 'premium',
    created_at: new Date('2026-01-08').toISOString()
  },
  {
    id: 'ph-ibrani',
    title: 'Pelajaran Hayat: Surat Ibrani',
    author: 'Witness Lee',
    category: 'Pelajaran Hayat',
    description: '70 Berita eksposisi Surat Ibrani: Kristus Imam Besar Agung kita di Tempat Mahakudus menurut peraturan Melkisedek.',
    cover_url: '/covers/ph-ibrani.jpg',
    cover_gradient: 'from-rose-700 via-pink-900 to-slate-950',
    cover_icon: '⚓',
    file_path: '/books/pelajaran-hayat-ibrani.epub',
    required_tier: 'premium',
    created_at: new Date('2026-01-08').toISOString()
  },
  {
    id: 'ph-wahyu',
    title: 'Pelajaran Hayat: Kitab Wahyu',
    author: 'Witness Lee',
    category: 'Pelajaran Hayat',
    description: '69 Berita Wahyu Yesus Kristus: Tujuh kaki dian emas, Tujuh Materai, Tujuh Terompet, Pemenang, dan Yerusalem Baru.',
    cover_url: '/covers/ph-wahyu.jpg',
    cover_gradient: 'from-red-700 via-amber-900 to-stone-950',
    cover_icon: '🎺',
    file_path: '/books/pelajaran-hayat-wahyu.epub',
    required_tier: 'premium',
    created_at: new Date('2026-01-08').toISOString()
  },
  {
    id: 'ph-kejadian-keluaran',
    title: 'Pelajaran Hayat: Kitab Kejadian & Keluaran',
    author: 'Witness Lee',
    category: 'Pelajaran Hayat',
    description: '291 Berita: Tujuan penciptaan Allah, panggilan para bapa leluhur, penebusan Paskah di Mesir, dan Pembangunan Kemah Suci.',
    cover_url: '/covers/ph-kejadian-keluaran.jpg',
    cover_gradient: 'from-stone-700 via-stone-800 to-stone-950',
    cover_icon: '🌄',
    file_path: '/books/pelajaran-hayat-kejadian-keluaran.epub',
    required_tier: 'premium',
    created_at: new Date('2026-01-08').toISOString()
  },
  // ==========================================
  // MINISTRY BOOKS (Buku-buku Pelayanan Rohani)
  // ==========================================
  {
    id: 'mb-all-inclusive-christ',
    title: 'The All-Inclusive Christ',
    author: 'Witness Lee',
    category: 'Ministry Books',
    description: 'Witness Lee\'s masterpiece expounding the rich types of the good land in Deuteronomy as a type of the all-inclusive Christ.',
    cover_url: '/covers/the-all-inclusive-christ.jpg',
    cover_gradient: 'from-blue-600 via-indigo-900 to-slate-950',
    cover_icon: '🌾',
    file_path: '/books/the-all-inclusive-christ.epub',
    required_tier: 'premium',
    created_at: new Date('2026-01-09').toISOString()
  },
  {
    id: 'mb-economy-of-god',
    title: 'The Economy of God',
    author: 'Witness Lee',
    category: 'Ministry Books',
    description: 'A landmark classic unfolding God\'s household administration to impart Himself in His Divine Trinity into His chosen believers.',
    cover_url: '/covers/the-economy-of-god.jpg',
    cover_gradient: 'from-emerald-700 via-teal-950 to-slate-950',
    cover_icon: '🏛️',
    file_path: '/books/the-economy-of-god.epub',
    required_tier: 'premium',
    created_at: new Date('2026-01-09').toISOString()
  },
  {
    id: 'mb-glorious-church',
    title: 'The Glorious Church',
    author: 'Watchman Nee',
    category: 'Ministry Books',
    description: 'Four profound biblical types of the church in God\'s eternal purpose: Eve, Rebekah, Asenath, and the Sun-clothed Woman.',
    cover_url: '/covers/the-glorious-church.jpg',
    cover_gradient: 'from-purple-700 via-indigo-950 to-slate-950',
    cover_icon: '👰',
    file_path: '/books/the-glorious-church.epub',
    required_tier: 'premium',
    created_at: new Date('2026-01-09').toISOString()
  },
  {
    id: 'mb-normal-church-life',
    title: 'The Normal Christian Church Life',
    author: 'Watchman Nee',
    category: 'Ministry Books',
    description: 'Watchman Nee\'s essential work on the biblical pattern and practice of the church, the apostles, and the boundary of the local church.',
    cover_url: '/covers/the-normal-christian-church-life.jpg',
    cover_gradient: 'from-cyan-700 via-sky-950 to-slate-950',
    cover_icon: '⛪',
    file_path: '/books/the-normal-christian-church-life.epub',
    required_tier: 'premium',
    created_at: new Date('2026-01-09').toISOString()
  },
  {
    id: 'mb-knowledge-of-life',
    title: 'The Knowledge of Life',
    author: 'Witness Lee',
    category: 'Ministry Books',
    description: 'The foundational teaching on divine life: What life is, the law of the spirit of life, the sense of life, and the clearance of the past.',
    cover_url: '/covers/the-knowledge-of-life.jpg',
    cover_gradient: 'from-amber-600 via-orange-950 to-stone-950',
    cover_icon: '🌱',
    file_path: '/books/the-knowledge-of-life.epub',
    required_tier: 'premium',
    created_at: new Date('2026-01-09').toISOString()
  },
  {
    id: 'mb-experience-of-life',
    title: 'The Experience of Life',
    author: 'Witness Lee',
    category: 'Ministry Books',
    description: 'The definitive guide to the progressive steps of spiritual experience in Christ: from regeneration and consecration to reigning in life.',
    cover_url: '/covers/the-experience-of-life.jpg',
    cover_gradient: 'from-rose-700 via-rose-950 to-stone-950',
    cover_icon: '🕊️',
    file_path: '/books/the-experience-of-life.epub',
    required_tier: 'premium',
    created_at: new Date('2026-01-09').toISOString()
  },
  {
    id: 'mb-release-of-the-spirit',
    title: 'The Release of the Spirit',
    author: 'Watchman Nee',
    category: 'Ministry Books',
    description: 'Profound messages on the breaking of the outer man so that the inner man and the Holy Spirit may be released to minister life.',
    cover_url: '/covers/release-of-the-spirit.jpg',
    cover_gradient: 'from-teal-600 via-slate-900 to-stone-950',
    cover_icon: '💧',
    file_path: '/books/the-release-of-the-spirit.epub',
    required_tier: 'premium',
    created_at: new Date('2026-01-09').toISOString()
  },
  {
    id: 'mb-spiritual-authority',
    title: 'Spiritual Authority',
    author: 'Watchman Nee',
    category: 'Ministry Books',
    description: 'Authoritative messages on God\'s throne, the authority of Christ, and the spiritual principles of obedience and delegated authority.',
    cover_url: '/covers/spiritual-authority.jpg',
    cover_gradient: 'from-indigo-800 via-slate-950 to-black',
    cover_icon: '👑',
    file_path: '/books/spiritual-authority.epub',
    required_tier: 'premium',
    created_at: new Date('2026-01-09').toISOString()
  }
];

export default function App() {
  // All state hooks at the top
  const [currentBook, setCurrentBook] = useState(null);
  const [viewMode, setViewMode] = useState('landing'); // 'landing' | 'library' | 'bible' | 'user-dashboard' | 'admin-dashboard'
  const [books, setBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('baca_is_logged_in') === 'true');
  const [userRole, setUserRole] = useState(() => {
    const logged = localStorage.getItem('baca_is_logged_in') === 'true';
    if (!logged) return 'guest';
    return localStorage.getItem('baca_user_role') || 'reader';
  });
  const [toastMessage, setToastMessage] = useState('');
  const [authModalRole, setAuthModalRole] = useState('reader'); // 'reader' | 'admin'
  const [userDashboardTab, setUserDashboardTab] = useState('santapan');
  const [adminDashboardTab, setAdminDashboardTab] = useState('books');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDetailBook, setSelectedDetailBook] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [userPlan, setUserPlan] = useState(getUserSubscription());
  const [enjoyments, setEnjoyments] = useState(getStoredEnjoyments());
  const [aiSummary, setAiSummary] = useState(
    'Pagi ini firman menyingkapkan bahwa hubungan kita dengan Kristus bukanlah sekadar mengikuti agama lahiriah, melainkan memakan Dia secara organik (Yohanes 6:57). Kristus adalah roti hidup yang telah dipecah-pecahkan di kayu salib agar dapat kita kecap, telan, dan cerna menjadi hayat sejati sepanjang hari ini.'
  );
  const [isKarakterSeriesModalOpen, setIsKarakterSeriesModalOpen] = useState(false);
  const [isPembinaanModalOpen, setIsPembinaanModalOpen] = useState(false);
  const [isBibleSelectorModalOpen, setIsBibleSelectorModalOpen] = useState(false);
  const [isQuickScriptureOpen, setIsQuickScriptureOpen] = useState(false);
  const [lockedBookNotice, setLockedBookNotice] = useState(null);
  const [kidungInitialTab, setKidungInitialTab] = useState('kidung');
  const [kidungInitialSongId, setKidungInitialSongId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('baca_user_profile');
    const customAvatar = localStorage.getItem('baca_user_avatar');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        if (customAvatar) parsed.photo_url = customAvatar;
        return parsed;
      } catch (e) {}
    }
    return {
      id: 'user-demo-baca',
      email: 'baca@perpustakaan.cloud',
      full_name: 'Budi Pembaca',
      photo_url: customAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };
  });

  // Callbacks and handlers defined after all states
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  }, []);

  const handleUpdateProfile = useCallback(async (updatedProfile) => {
    setUser(updatedProfile);
    try {
      localStorage.setItem('baca_user_profile', JSON.stringify(updatedProfile));
      if (updatedProfile.photo_url) {
        localStorage.setItem('baca_user_avatar', updatedProfile.photo_url);
      }
    } catch (e) {
      console.warn('Gagal menyimpan profil ke localStorage:', e);
    }

    // Jika Supabase aktif, simpan juga ke user_metadata Supabase Auth agar permanen
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.updateUser({
          data: {
            full_name: updatedProfile.full_name,
            photo_url: updatedProfile.photo_url,
            whatsapp: updatedProfile.whatsapp,
            distrik_lokal: updatedProfile.distrik_lokal
          }
        });
      } catch (err) {
        console.warn('Supabase auth metadata update error:', err);
      }
    }

    syncUserProfileToSupabase(updatedProfile);
    showToast('Pengaturan profil berhasil disimpan & disinkronkan.');
  }, [showToast]);

  const openAuthModal = useCallback((targetRole = 'reader') => {
    setAuthModalRole(targetRole);
    setIsAuthModalOpen(true);
  }, []);

  // Memuat data buku dari Supabase atau LocalStorage fallback
  const fetchBooks = useCallback(async () => {
    setIsLoadingBooks(true);
    try {
      const hiddenIds = JSON.parse(localStorage.getItem('baca_hidden_books') || '[]');
      const isVisibleItem = (b) => 
        !b.is_bible && 
        !b.id?.startsWith('alkitab-') && 
        !b.id?.startsWith('demo-') &&
        b.category !== 'Alkitab & Firman' &&
        !hiddenIds.includes(b.id);

      let dbBooks = [];
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('books')
            .select('*')
            .order('created_at', { ascending: false });
          if (!error && data) {
            dbBooks = data;
          }
        } catch (supabaseErr) {
          console.warn('Supabase fetch books error:', supabaseErr);
        }
      }

      const localUploaded = JSON.parse(localStorage.getItem('baca_demo_books') || '[]');

      // Gabungkan buku database Supabase, buku upload lokal, dan buku katalog bawaan (INITIAL_DEMO_BOOKS)
      const allCandidates = [...dbBooks, ...localUploaded, ...INITIAL_DEMO_BOOKS];
      const seenIds = new Set();
      const uniqueBooks = [];

      for (const b of allCandidates) {
        if (!b || !b.id) continue;
        if (!seenIds.has(b.id)) {
          seenIds.add(b.id);
          if (isVisibleItem(b)) {
            let processed = { ...b };
            const defaultCovers = {
              'buku-karakter-wl': '/covers/buku-karakter-wl.jpg',
              'pembinaan-dasar-wn': '/covers/pembinaan-dasar-wn.jpg',
              'martir-salib-wn': '/covers/martir-salib-wn.jpg',
              'kidung-jemaat-indonesia': '/covers/kidung-jemaat.jpg',
              'suplemen-kidung-indonesia': '/covers/suplemen-kidung.jpg',
              'ph-matius': '/covers/ph-matius.jpg',
              'ph-markus': '/covers/ph-markus.jpg',
              'ph-lukas': '/covers/ph-lukas.jpg',
              'ph-yohanes': '/covers/ph-yohanes.jpg',
              'ph-roma': '/covers/ph-roma.jpg',
              'ph-korintus': '/covers/ph-korintus.jpg',
              'ph-galatia-efesus': '/covers/ph-galatia-efesus.jpg',
              'ph-filipi-kolose': '/covers/ph-filipi-kolose.jpg',
              'ph-ibrani': '/covers/ph-ibrani.jpg',
              'ph-wahyu': '/covers/ph-wahyu.jpg',
              'ph-kejadian-keluaran': '/covers/ph-kejadian-keluaran.jpg',
              'mb-all-inclusive-christ': '/covers/the-all-inclusive-christ.jpg',
              'mb-economy-of-god': '/covers/the-economy-of-god.jpg',
              'mb-glorious-church': '/covers/the-glorious-church.jpg',
              'mb-normal-church-life': '/covers/the-normal-christian-church-life.jpg',
              'mb-knowledge-of-life': '/covers/the-knowledge-of-life.jpg',
              'mb-experience-of-life': '/covers/the-experience-of-life.jpg',
              'mb-release-of-the-spirit': '/covers/release-of-the-spirit.jpg',
              'mb-spiritual-authority': '/covers/spiritual-authority.jpg',
            };
            if (!processed.cover_url || processed.cover_url.startsWith('blob:')) {
              if (defaultCovers[processed.id]) {
                processed.cover_url = defaultCovers[processed.id];
              } else if (processed.title?.toLowerCase().includes('fkkp')) {
                processed.cover_url = '/covers/fkkp-kaum-beriman.png';
              }
            }
            uniqueBooks.push(processed);
          }
        }
      }

      setBooks(uniqueBooks);
    } catch (err) {
      console.warn('Gagal fetch buku:', err);
      setBooks(INITIAL_DEMO_BOOKS);
    } finally {
      setIsLoadingBooks(false);
    }
  }, []);

  // Strict role-guard effect: Admin stays in Admin, Reader stays in Reader
  useEffect(() => {
    if (isLoggedIn) {
      if (userRole === 'admin' && viewMode === 'user-dashboard') {
        setViewMode('admin-dashboard');
      } else if (userRole === 'reader' && viewMode === 'admin-dashboard') {
        setViewMode('user-dashboard');
      }
    } else {
      if (viewMode === 'user-dashboard' || viewMode === 'admin-dashboard') {
        setViewMode('landing');
      }
    }
  }, [isLoggedIn, userRole, viewMode]);

  const handleAuthSuccess = useCallback((authUser) => {
    setIsLoggedIn(true);
    setIsQuickScriptureOpen(false);
    setIsBibleSelectorModalOpen(false);
    setIsKarakterSeriesModalOpen(false);
    setIsPembinaanModalOpen(false);
    const role = authUser.role || authUser.user_metadata?.role || (authUser.username === 'admin123' || authUser.email?.startsWith('admin') ? 'admin' : 'reader');
    setUserRole(role);
    localStorage.setItem('baca_user_role', role);
    localStorage.setItem('baca_is_logged_in', 'true');
    const customAvatar = role === 'admin' ? null : localStorage.getItem('baca_user_avatar');
    const profile = {
      id: authUser.id,
      email: authUser.email,
      full_name: role === 'admin' ? 'Administrator' : (authUser.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Pembaca Hayat'),
      photo_url: role === 'admin' ? '' : (customAvatar || authUser.photo_url || authUser.user_metadata?.photo_url || authUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
      role: role
    };
    setUser(profile);
    localStorage.setItem('baca_user_profile', JSON.stringify(profile));

    if (role === 'admin') {
      setViewMode('admin-dashboard');
      showToast('Berhasil masuk sebagai Administrator (admin123)!');
    } else {
      setViewMode('user-dashboard');
      showToast(`Selamat datang, ${profile.full_name}!`);
    }
    fetchBooks();
  }, [fetchBooks, showToast]);

  // Handler memilih Seri Buku Karakter
  const handleSelectKarakterSeries = (seri) => {
    setIsKarakterSeriesModalOpen(false);
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      showToast('Silakan masuk atau daftar akun terlebih dahulu untuk membaca.');
      return;
    }
    // Cek apakah paket saat ini mengizinkan membaca seri buku karakter (Wajib Premium/Ultimate)
    if (isBookLocked({ id: 'buku-karakter-wl' }, userPlan, userRole)) {
      setLockedBookNotice({
        id: 'buku-karakter-wl',
        title: seri.id === 'all' ? 'Buku Karakter: 30 Butir Lengkap' : `Buku Karakter Seri ${seri.id}: ${seri.title}`,
        author: 'Witness Lee',
        cover_icon: '💎'
      });
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
    // Cek apakah paket saat ini mengizinkan membaca pembinaan dasar (Wajib Premium/Ultimate)
    if (isBookLocked({ id: 'pembinaan-dasar-wn' }, userPlan, userRole)) {
      setLockedBookNotice({
        id: 'pembinaan-dasar-wn',
        title: topik.id === 'all' ? 'Pembinaan Dasar Kaum Beriman (Volume Lengkap)' : `Pembinaan Dasar: Pelajaran ${topik.id} - ${topik.title}`,
        author: 'Watchman Nee',
        cover_icon: '🌱'
      });
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

  // Handler membuka buku (wajib login & cek hak akses paket)
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
    } else if (book.id === 'kidung-jemaat-indonesia') {
      setKidungInitialTab('kidung');
      setKidungInitialSongId(null);
      setViewMode('kidung');
    } else if (book.id === 'suplemen-kidung-indonesia') {
      setKidungInitialTab('suplemen');
      setKidungInitialSongId(null);
      setViewMode('kidung');
    } else {
      // Periksa apakah buku memerlukan paket Premium/Ultimate
      if (isBookLocked(book, userPlan, userRole)) {
        setLockedBookNotice(book);
        return;
      }
      setCurrentBook(book);
    }
  };

  // Handler Bagi Nikmat
  const handleAddEnjoyment = (newNikmat) => {
    const updated = addEnjoyment(newNikmat);
    setEnjoyments(updated);
    showToast('Kenikmatan firman Anda berhasil dibagikan!');
  };

  const handleDeleteEnjoyment = (id) => {
    const updated = enjoyments.filter(e => e.id !== id);
    setEnjoyments(updated);
    saveStoredEnjoyments(updated);
    showToast('Bagi nikmat berhasil dihapus dari moderasi.');
  };

  const handleTogglePinEnjoyment = (id) => {
    showToast('Bagi nikmat berhasil disematkan ke Meja Perjamuan.');
  };

  // Handler Update Plan
  const handlePlanUpdated = (newPlan) => {
    setUserPlan(newPlan);
    saveUserSubscription(newPlan);
    showToast(`Paket berhasil diperbarui ke ${newPlan.tier.toUpperCase()}!`);
  };

  useEffect(() => {
    fetchBooks();

    // Cek sesi autentikasi Supabase jika aktif
    if (isSupabaseConfigured()) {
      const applyAuthUser = (authUser) => {
        let saved = {};
        try {
          const raw = localStorage.getItem('baca_user_profile');
          if (raw) saved = JSON.parse(raw);
        } catch (e) {}

        const customAvatar = localStorage.getItem('baca_user_avatar');

        const finalProfile = {
          ...saved,
          id: authUser.id,
          email: authUser.email,
          full_name: (saved.full_name && saved.full_name !== authUser.email?.split('@')[0])
            ? saved.full_name
            : (authUser.user_metadata?.full_name || saved.full_name || authUser.email?.split('@')[0] || 'Pembaca Hayat'),
          photo_url: customAvatar || saved.photo_url || authUser.user_metadata?.photo_url || authUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          whatsapp: saved.whatsapp || authUser.user_metadata?.whatsapp || '',
          distrik_lokal: saved.distrik_lokal || authUser.user_metadata?.distrik_lokal || ''
        };

        setUser(finalProfile);
        try {
          localStorage.setItem('baca_user_profile', JSON.stringify(finalProfile));
          localStorage.setItem('baca_is_logged_in', 'true');
          if (finalProfile.photo_url) {
            localStorage.setItem('baca_user_avatar', finalProfile.photo_url);
          }
        } catch (e) {}
        setIsLoggedIn(true);
      };

      supabase.auth.getUser().then(({ data: { user: authUser } }) => {
        if (authUser) {
          applyAuthUser(authUser);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          applyAuthUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          // Hanya logout jika user secara eksplisit memicu event SIGNED_OUT dari Supabase
          setIsLoggedIn(false);
          localStorage.removeItem('baca_is_logged_in');
          localStorage.removeItem('baca_user_role');
          setUser({
            id: 'guest',
            email: '',
            full_name: 'Tamu'
          });
        }
        // Jangan logout pada event INITIAL_SESSION tanpa session, agar sesi lokal tetap bertahan!
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [fetchBooks]);

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      try { await supabase.auth.signOut(); } catch (e) {}
    }
    setIsLoggedIn(false);
    setIsQuickScriptureOpen(false);
    setIsBibleSelectorModalOpen(false);
    setIsKarakterSeriesModalOpen(false);
    setIsPembinaanModalOpen(false);
    setUserRole('guest');
    localStorage.removeItem('baca_is_logged_in');
    localStorage.removeItem('baca_user_role');
    localStorage.removeItem('baca_user_profile');
    setUser({
      id: 'guest',
      email: '',
      full_name: 'Tamu'
    });
    setViewMode('landing');
    showToast('Berhasil keluar dari akun.');
  };

  // Handler Hapus Buku (Khusus Admin)
  const handleDeleteBook = async (bookId, e) => {
    if (e && e.stopPropagation) e.stopPropagation();

    try {
      // 1. Selalu catat ID buku yang dihapus ke baca_hidden_books agar langsung hilang permanen dari katalog
      const hiddenBooks = JSON.parse(localStorage.getItem('baca_hidden_books') || '[]');
      if (!hiddenBooks.includes(bookId)) {
        hiddenBooks.push(bookId);
        localStorage.setItem('baca_hidden_books', JSON.stringify(hiddenBooks));
      }

      // 2. Bersihkan dari daftar demo/lokal jika ada
      const localBooks = JSON.parse(localStorage.getItem('baca_demo_books') || '[]');
      const updated = localBooks.filter(b => b.id !== bookId);
      localStorage.setItem('baca_demo_books', JSON.stringify(updated));

      // 3. Hapus berkas dari IndexedDB peramban jika tersimpan secara lokal
      try {
        await deleteBookFromIndexedDB(bookId);
      } catch (err) {
        console.warn('Gagal hapus berkas IndexedDB:', err);
      }

      // 4. Hapus dari database Supabase jika dikonfigurasi & merupakan ID Supabase
      if (isSupabaseConfigured() && isValidUUID(bookId)) {
        try {
          const { error } = await supabase.from('books').delete().eq('id', bookId);
          if (error) console.warn('Peringatan hapus buku Supabase:', error.message);
        } catch (supabaseErr) {
          console.warn('Gagal menghapus baris di Supabase Cloud:', supabaseErr);
        }
      }

      // 5. Update state tampilan saat ini
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

  // ----------------------------------------------------
  // Jika sedang membaca buku -> Tampilkan Full Reader View
  // ----------------------------------------------------
  if (currentBook) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <React.Suspense fallback={<ViewLoadingFallback text="Memuat Pembaca Buku..." />}>
          <CloudEpubReader 
            book={currentBook} 
            userId={user.id} 
            userPlan={userPlan}
            userRole={userRole}
            onOpenPricing={() => setIsSubscriptionModalOpen(true)}
            onBack={() => setCurrentBook(null)} 
          />
        </React.Suspense>
      </div>
    );
  }

  // ----------------------------------------------------
  // Jika sedang membaca Alkitab (66 Kitab Lengkap)
  // ----------------------------------------------------
  if (!currentBook && viewMode === 'bible') {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <React.Suspense fallback={<ViewLoadingFallback text="Memuat Alkitab Pemulihan..." />}>
          <BibleReaderView 
            onBackToHome={() => setViewMode('landing')} 
            onOpenLibrary={() => setViewMode('library')} 
          />
        </React.Suspense>
      </div>
    );
  }

  // ----------------------------------------------------
  // Jika sedang membaca Kidung Rohani & Suplemen (RHV 2019)
  // ----------------------------------------------------
  if (!currentBook && viewMode === 'kidung') {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <React.Suspense fallback={<ViewLoadingFallback text="Memuat Kidung Rohani..." />}>
          <KidungReaderView 
            initialTab={kidungInitialTab}
            initialSongId={kidungInitialSongId}
            onBackToHome={() => setViewMode('landing')} 
            onOpenLibrary={() => setViewMode('library')} 
            onOpenBible={() => setViewMode('bible')}
          />
        </React.Suspense>
      </div>
    );
  }

  // ----------------------------------------------------
  // Halaman Page Awal (Landing Page)
  // ----------------------------------------------------
  if (!currentBook && viewMode === 'landing') {
    return (
      <>
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
              openAuthModal('reader');
              showToast('Silakan masuk atau buat akun baru terlebih dahulu untuk membaca Alkitab.');
            } else {
              setViewMode('bible');
            }
          }}
          onOpenKidung={(targetTab = 'kidung', targetSongId = null) => {
            setKidungInitialTab(targetTab);
            setKidungInitialSongId(targetSongId);
            setViewMode('kidung');
          }}
          onOpenQuickScripture={() => {
            if (!isLoggedIn) {
              openAuthModal('reader');
              showToast('Silakan masuk akun terlebih dahulu untuk mencari ayat.');
            } else {
              setIsQuickScriptureOpen(true);
            }
          }}
          onOpenLogin={(targetRole = 'reader') => openAuthModal(targetRole)}
          isLoggedIn={isLoggedIn}
          user={user}
          userRole={userRole}
          onLogout={handleLogout}
          onOpenUserDashboard={() => {
            if (!isLoggedIn) {
              openAuthModal('reader');
            } else if (userRole === 'admin') {
              setViewMode('admin-dashboard');
              showToast('Anda masuk sebagai Admin. Ini adalah portal pengelolaan Anda.');
            } else {
              setViewMode('user-dashboard');
            }
          }}
          onOpenAdminDashboard={() => {
            if (!isLoggedIn || userRole !== 'admin') {
              openAuthModal('admin');
              showToast('Silakan masuk dengan akun Admin (user admin123 pass 123456).');
            } else {
              setViewMode('admin-dashboard');
            }
          }}
          onOpenPricing={() => setIsSubscriptionModalOpen(true)}
          enjoyments={enjoyments}
          onAddEnjoyment={handleAddEnjoyment}
          books={books}
          onOpenBook={handleOpenBook}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          initialRole={authModalRole}
        />

        <SubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          currentPlan={userPlan}
          onPlanUpdated={handlePlanUpdated}
        />

        <LockedBookModal
          isOpen={!!lockedBookNotice}
          onClose={() => setLockedBookNotice(null)}
          book={lockedBookNotice}
          userPlan={userPlan}
          onOpenPricing={() => setIsSubscriptionModalOpen(true)}
        />

        <KarakterSeriesModal
          isOpen={isKarakterSeriesModalOpen}
          onClose={() => setIsKarakterSeriesModalOpen(false)}
          onSelectSeries={handleSelectKarakterSeries}
          userPlan={userPlan}
          userRole={userRole}
          onOpenPricing={() => setIsSubscriptionModalOpen(true)}
        />

        <PembinaanTopicsModal
          isOpen={isPembinaanModalOpen}
          onClose={() => setIsPembinaanModalOpen(false)}
          onSelectTopic={handleSelectPembinaanTopic}
          userPlan={userPlan}
          userRole={userRole}
          onOpenPricing={() => setIsSubscriptionModalOpen(true)}
        />

        <BibleSelectorModal
          isOpen={isBibleSelectorModalOpen}
          onClose={() => setIsBibleSelectorModalOpen(false)}
          onSelectBibleBook={handleSelectBibleBook}
        />

        <QuickScriptureModal
          isOpen={isQuickScriptureOpen}
          onClose={() => setIsQuickScriptureOpen(false)}
          onNavigateToVerse={(verse) => {
            setIsQuickScriptureOpen(false);
            if (!isLoggedIn) {
              setIsAuthModalOpen(true);
              showToast('Silakan masuk akun terlebih dahulu untuk membaca Alkitab.');
            } else {
              setViewMode('bible');
              showToast(`Membuka ${verse.book} ${verse.chapter}:${verse.verse} di Pembaca Alkitab`);
            }
          }}
        />
      </>
    );
  }

  // ----------------------------------------------------
  // Layout Utama: Library, User Dashboard, & Admin Dashboard
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

      {/* Top Navigation Bar with Role and Dashboard Switcher */}
      <header className="sticky top-0 z-40 bg-[#F4EFE6]/90 backdrop-blur-md border-b border-[#1C1917]/8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={() => setViewMode('landing')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#3B4B34] text-[#F4EFE6] flex items-center justify-center shadow-md shadow-[#3B4B34]/20 btn-lift"
              title="Kembali ke Beranda"
            >
              <Utensils className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-amber-200" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('landing')}
                  className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#1C1917] font-serif hover:text-[#3B4B34] transition text-left"
                >
                  Baca.
                </button>
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#8E9C75]/25 text-[#3B4B34] border border-[#8E9C75]/30 whitespace-nowrap hidden 2xl:inline-flex">
                  Mari Makan Tuhan
                </span>
              </div>
              <p className="text-[11px] text-[#78716C] hidden xl:block whitespace-nowrap">Perpustakaan Santapan Hayat &amp; Alkitab Pemulihan</p>
            </div>
          </div>

          {/* Navigation Items (ROLE-SEPARATED: Admin only sees Admin, Reader only sees Reader) */}
          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 p-1 bg-white/70 rounded-full border border-[#1C1917]/10 text-xs shadow-xs shrink-0">
            <button
              onClick={() => setViewMode('landing')}
              className="px-2.5 lg:px-3 py-1.5 rounded-full font-semibold text-[#78716C] hover:text-[#1C1917] hover:bg-stone-100 transition whitespace-nowrap"
            >
              Beranda
            </button>

            <button
              onClick={() => setViewMode('library')}
              className={`px-2.5 lg:px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'library'
                  ? 'bg-[#3B4B34] text-white shadow-xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Katalog</span>
            </button>

            <button
              onClick={() => {
                setKidungInitialTab('kidung');
                setKidungInitialSongId(null);
                setViewMode('kidung');
              }}
              className={`px-2.5 lg:px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'kidung'
                  ? 'bg-[#3B4B34] text-white shadow-xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <Music className="w-3.5 h-3.5 text-amber-400" />
              <span>Kidung</span>
            </button>

            {/* HANYA MUNCUL JIKA USER PEMBACA */}
            {isLoggedIn && userRole === 'reader' && (
              <button
                onClick={() => setViewMode('user-dashboard')}
                className={`px-2.5 lg:px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  viewMode === 'user-dashboard'
                    ? 'bg-[#3B4B34] text-white shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                <User className="w-3.5 h-3.5 text-amber-300" />
                <span><span className="hidden xl:inline">Dashboard </span>Saya</span>
              </button>
            )}

            {/* HANYA MUNCUL JIKA ADMIN */}
            {isLoggedIn && userRole === 'admin' && (
              <button
                onClick={() => setViewMode('admin-dashboard')}
                className={`px-2.5 lg:px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  viewMode === 'admin-dashboard'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span><span className="hidden xl:inline">Dashboard </span>Admin</span>
              </button>
            )}
          </nav>

          {/* Actions: Clean & Compact */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Scripture Search Button (Only shown when logged in, desktop/tablet) */}
            {isLoggedIn && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsQuickScriptureOpen(true)}
                className="hidden md:inline-flex rounded-full text-xs font-bold border-amber-600/30 text-amber-900 hover:bg-amber-100/50 bg-amber-50/70 h-9 px-2.5 xl:px-3.5 shadow-xs btn-lift whitespace-nowrap"
                title="Cari Cepat Ayat Alkitab & Catatan Kaki"
              >
                <Search className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="hidden xl:inline ml-1">Cari Ayat</span>
              </Button>
            )}

            {/* Switch to Bible Section */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!isLoggedIn) {
                  setIsAuthModalOpen(true);
                  showToast('Silakan masuk akun terlebih dahulu untuk membaca Alkitab.');
                } else {
                  setViewMode('bible');
                }
              }}
              className="hidden sm:inline-flex rounded-full text-xs font-bold border-[#3B4B34]/30 text-[#3B4B34] hover:bg-[#3B4B34]/10 bg-white/70 h-9 px-2.5 lg:px-3.5 shadow-xs btn-lift whitespace-nowrap"
              title="Buka 66 Kitab Alkitab Versi Pemulihan"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#3B4B34] shrink-0" />
              <span className="hidden md:inline ml-1">Alkitab</span>
            </Button>

            {/* Dropdown Akun & Paket (ROLE-SEPARATED) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 bg-white/80 hover:bg-white text-[#1C1917] px-2.5 sm:px-3 py-1.5 rounded-full border border-[#1C1917]/15 text-xs font-bold shadow-xs transition btn-lift shrink-0">
                  {isLoggedIn ? (
                    <>
                      {userRole === 'admin' ? (
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-[10px] font-black shadow-xs shrink-0">
                          A
                        </div>
                      ) : user?.photo_url ? (
                        <img 
                          src={user.photo_url} 
                          alt="Foto Profil" 
                          className="w-5 h-5 rounded-full object-cover border border-[#3B4B34]/30 shrink-0" 
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold bg-[#3B4B34] shrink-0">
                          {user?.full_name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <span className="max-w-[85px] truncate hidden sm:inline text-[11px]">
                        {userRole === 'admin' ? 'Admin' : (user?.full_name?.split(' ')[0] || 'User')}
                      </span>
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5 text-[#3B4B34]" />
                      <span className="text-[11px]">Masuk</span>
                    </>
                  )}
                  <ChevronDown className="w-3 h-3 text-[#78716C]" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl bg-[#F7F4ED] border border-[#1C1917]/15 text-[#1C1917] shadow-xl">
                {isLoggedIn && userRole === 'admin' ? (
                  <>
                    <div className="px-2.5 py-1.5 border-b border-[#1C1917]/10 mb-1">
                      <p className="font-bold text-xs text-[#1C1917] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-amber-700" />
                        Administrator (admin123)
                      </p>
                      <p className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider">
                        Akses Penuh Pengelola
                      </p>
                    </div>

                    <DropdownMenuItem 
                      onClick={() => {
                        setAdminDashboardTab('books');
                        setViewMode('admin-dashboard');
                      }}
                      className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer flex items-center gap-2 hover:bg-white focus:bg-white"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <div>
                        <p className="font-bold text-xs text-[#1C1917]">Dashboard Admin</p>
                        <p className="text-[10px] text-[#78716C]">Kelola katalog, toko &amp; moderasi</p>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => {
                        setAdminDashboardTab('users');
                        setViewMode('admin-dashboard');
                      }}
                      className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer flex items-center gap-2 hover:bg-white focus:bg-white"
                    >
                      <Users className="w-4 h-4 text-emerald-700" />
                      <div>
                        <p className="font-bold text-xs text-[#1C1917]">Data Pengguna &amp; Langganan</p>
                        <p className="text-[10px] text-[#78716C]">Kelola CRUD akun user &amp; paket</p>
                      </div>
                    </DropdownMenuItem>


                    <DropdownMenuSeparator className="my-1 bg-[#1C1917]/10" />

                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="rounded-xl px-2.5 py-1.5 text-xs font-semibold text-rose-700 cursor-pointer hover:bg-rose-50 focus:bg-rose-50"
                    >
                      Keluar dari Akun Admin
                    </DropdownMenuItem>
                  </>
                ) : isLoggedIn && userRole === 'reader' ? (
                  <>
                    <div className="px-2.5 py-2 border-b border-[#1C1917]/10 mb-1 flex items-center gap-2.5">
                      {user?.photo_url ? (
                        <img 
                          src={user.photo_url} 
                          alt="Avatar" 
                          className="w-8 h-8 rounded-full object-cover border border-[#3B4B34]/30 shrink-0" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#3B4B34] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {user?.full_name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-[#1C1917] truncate">{user?.full_name || 'Pembaca'}</p>
                        <p className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider">
                          Paket: {userPlan?.tier ? userPlan.tier.toUpperCase() : 'PREMIUM'}
                        </p>
                      </div>
                    </div>

                    <DropdownMenuItem 
                      onClick={() => {
                        setUserDashboardTab('santapan');
                        setViewMode('user-dashboard');
                      }}
                      className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer flex items-center gap-2 hover:bg-white focus:bg-white"
                    >
                      <User className="w-4 h-4 text-emerald-700" />
                      <div>
                        <p className="font-bold text-xs text-[#1C1917]">Dashboard Saya</p>
                        <p className="text-[10px] text-[#78716C]">Terang hari ini &amp; bagi nikmat</p>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => {
                        setUserDashboardTab('profile');
                        setViewMode('user-dashboard');
                      }}
                      className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer flex items-center gap-2 hover:bg-white focus:bg-white"
                    >
                      <Settings className="w-4 h-4 text-[#3B4B34]" />
                      <div>
                        <p className="font-bold text-xs text-[#1C1917]">Pengaturan Profil</p>
                        <p className="text-[10px] text-[#78716C]">Nama, WA, Email, Distrik - Lokal</p>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => setIsSubscriptionModalOpen(true)}
                      className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer flex items-center gap-2 hover:bg-white focus:bg-white"
                    >
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <div>
                        <p className="font-bold text-xs text-[#1C1917]">Pilihan Paket Santapan</p>
                        <p className="text-[10px] text-[#78716C]">Standart, Premium, Ultimate</p>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1 bg-[#1C1917]/10" />

                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="rounded-xl px-2.5 py-1.5 text-xs font-semibold text-rose-700 cursor-pointer hover:bg-rose-50 focus:bg-rose-50"
                    >
                      Keluar dari Akun
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem 
                      onClick={() => setIsAuthModalOpen(true)}
                      className="rounded-xl px-2.5 py-2.5 text-xs font-bold cursor-pointer flex items-center gap-2 bg-[#3B4B34] text-white hover:bg-[#20251A] focus:bg-[#20251A]"
                    >
                      <LogIn className="w-4 h-4 text-amber-300" />
                      <div>
                        <p className="font-bold text-xs text-white">Masuk / Daftar Akun</p>
                        <p className="text-[10px] text-amber-100/80">Pilih peran di halaman login</p>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1 bg-[#1C1917]/10" />

                    <DropdownMenuItem 
                      onClick={() => setIsSubscriptionModalOpen(true)}
                      className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer flex items-center gap-2 hover:bg-white focus:bg-white"
                    >
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-bold text-xs text-[#1C1917]">Paket &amp; Sinkron Toko</p>
                        <p className="text-[10px] text-[#78716C]">Standart, Premium, Ultimate</p>
                      </div>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 hover:bg-white border border-[#1C1917]/15 text-[#1C1917] transition active:scale-95 shadow-xs"
              aria-label="Toggle menu navigasi mobile"
            >
              {isMobileMenuOpen ? (
                <X className="w-4.5 h-4.5 text-[#3B4B34]" />
              ) : (
                <Menu className="w-4.5 h-4.5 text-[#1C1917]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#1C1917]/10 bg-[#FAF7F2]/95 backdrop-blur-xl px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl">
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => {
                  setViewMode('landing');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl transition active:scale-95 ${
                  viewMode === 'landing' ? 'bg-[#3B4B34] text-white shadow-xs' : 'bg-white border border-[#1C1917]/10 text-[#1C1917]'
                }`}
              >
                <Home className="w-4 h-4 text-amber-300" />
                <span>Beranda</span>
              </button>

              <button
                onClick={() => {
                  setViewMode('library');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl transition active:scale-95 ${
                  viewMode === 'library' ? 'bg-[#3B4B34] text-white shadow-xs' : 'bg-white border border-[#1C1917]/10 text-[#1C1917]'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>Katalog Buku</span>
              </button>

              <button
                onClick={() => {
                  setKidungInitialTab('kidung');
                  setKidungInitialSongId(null);
                  setViewMode('kidung');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl transition active:scale-95 ${
                  viewMode === 'kidung' ? 'bg-[#3B4B34] text-white shadow-xs' : 'bg-amber-50 border border-amber-600/20 text-amber-900'
                }`}
              >
                <Music className="w-4 h-4 text-amber-600" />
                <span>Kidung &amp; Suplemen</span>
              </button>

              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    setIsAuthModalOpen(true);
                    showToast('Silakan masuk akun terlebih dahulu untuk membaca Alkitab.');
                  } else {
                    setViewMode('bible');
                  }
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl transition active:scale-95 ${
                  viewMode === 'bible' ? 'bg-[#3B4B34] text-white shadow-xs' : 'bg-white border border-[#1C1917]/10 text-[#3B4B34]'
                }`}
              >
                <BookMarked className="w-4 h-4 text-[#3B4B34]" />
                <span>Alkitab Pemulihan</span>
              </button>
            </div>

            {isLoggedIn ? (
              <div className="pt-2 border-t border-[#1C1917]/10 flex flex-col gap-1.5 text-xs font-bold">
                {userRole === 'admin' ? (
                  <button
                    onClick={() => {
                      setViewMode('admin-dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full p-2.5 rounded-xl bg-stone-900 text-white flex items-center justify-center gap-2 shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Buka Dashboard Admin</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setViewMode('user-dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#3B4B34] text-white flex items-center justify-center gap-2 shadow-xs"
                  >
                    <User className="w-4 h-4 text-amber-300" />
                    <span>Buka Dashboard Saya</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsQuickScriptureOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl bg-amber-50 border border-amber-600/20 text-amber-900 flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4 text-amber-700" />
                  <span>Cari Cepat Ayat Alkitab</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#1C1917]/10">
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#3B4B34] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                >
                  <LogIn className="w-4 h-4 text-amber-300" />
                  <span>Masuk / Daftar Akun</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-8 py-8 pb-24 md:pb-8 space-y-8">
        
        {/* RENDER VIEW 1: USER DASHBOARD */}
        {viewMode === 'user-dashboard' && (
          <React.Suspense fallback={<ViewLoadingFallback text="Memuat Dashboard Saya..." />}>
            <UserDashboard
              user={user}
              onUpdateProfile={handleUpdateProfile}
              plan={userPlan}
              onOpenPricing={() => setIsSubscriptionModalOpen(true)}
              onOpenBook={handleOpenBook}
              onOpenBible={() => setViewMode('bible')}
              onEnterLibrary={() => setViewMode('library')}
              enjoyments={enjoyments}
              onAddEnjoyment={handleAddEnjoyment}
              initialTab={userDashboardTab}
              books={books}
            />
          </React.Suspense>
        )}

        {/* RENDER VIEW 2: ADMIN DASHBOARD */}
        {viewMode === 'admin-dashboard' && (
          <React.Suspense fallback={<ViewLoadingFallback text="Memuat Dashboard Admin..." />}>
            <AdminDashboard
              books={books}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onDeleteBook={handleDeleteBook}
              onOpenBook={handleOpenBook}
              enjoyments={enjoyments}
              onDeleteEnjoyment={handleDeleteEnjoyment}
              onTogglePinEnjoyment={handleTogglePinEnjoyment}
              aiSummary={aiSummary}
              onUpdateAiSummary={(newSummary) => {
                setAiSummary(newSummary);
                showToast('Rangkuman Meja Perjamuan berhasil disimpan.');
              }}
              initialTab={adminDashboardTab}
              showToast={showToast}
            />
          </React.Suspense>
        )}

        {/* RENDER VIEW 3: KATALOG BUKU (LIBRARY) */}
        {viewMode === 'library' && (
          <>
            {/* Hero Section Banner */}
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
                    <span>Cloud Streaming &amp; Mode Doa-Makan</span>
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
                <h3 className="font-serif font-bold text-lg text-[#1C1917]">
                  {books.length === 0 ? 'Belum Ada Buku di Perpustakaan' : 'Tidak Ada Buku yang Cocok'}
                </h3>
                <p className="text-xs text-[#78716C] max-w-sm mx-auto">
                  {books.length === 0 
                    ? 'Koleksi buku santapan rohani akan tampil di sini setelah diunggah oleh Admin.' 
                    : 'Cobalah mengganti kata kunci pencarian atau memilih kategori yang berbeda.'}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map(book => (
                  <Card
                    key={book.id}
                    onClick={() => handleOpenBook(book)}
                    className="group relative rounded-[28px] p-5 bg-[#F7F4ED] border border-[#1C1917]/10 hover:border-[#8E9C75] hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden btn-lift"
                  >
                    <div>
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4 shadow-md group-hover:shadow-lg transition flex items-center justify-center bg-stone-100">
                        {(() => {
                          const effectiveCover = (book.cover_url && !book.cover_url.startsWith('blob:'))
                            ? book.cover_url
                            : (book.title?.toLowerCase().includes('fkkp') ? '/covers/fkkp-kaum-beriman.png' : null);

                          return effectiveCover ? (
                            <img 
                              src={effectiveCover} 
                              alt={book.title} 
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className={`w-full h-full flex flex-col items-center justify-center text-center text-white space-y-3 p-4 bg-gradient-to-tr ${
                              book.cover_gradient || 'from-[#1C2317] via-[#293322] to-[#3B4B34]'
                            }`}>
                              <span className="text-4xl filter drop-shadow">{book.cover_icon || '📖'}</span>
                              <h4 className="font-bold text-sm leading-tight line-clamp-3 text-white font-serif">
                                {book.title}
                              </h4>
                              <p className="text-[11px] text-amber-200 font-medium tracking-wide">
                                {book.author}
                              </p>
                            </div>
                          );
                        })()}

                        <Badge variant="secondary" className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold border-white/20 rounded-full">
                          {book.category || 'Umum'}
                        </Badge>

                        {isBookLocked(book, userPlan, userRole) && (
                          <Badge className="absolute top-3 right-3 bg-amber-500 text-stone-950 font-bold text-[10px] border border-amber-400/40 rounded-full flex items-center gap-1 shadow-sm">
                            <Lock className="w-2.5 h-2.5" /> Premium
                          </Badge>
                        )}

                        <div className="absolute inset-0 bg-[#1C1917]/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-[#3B4B34] text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition duration-200">
                            {isBookLocked(book, userPlan, userRole) ? (
                              <Lock className="w-5 h-5 text-amber-300" />
                            ) : (
                              <Play className="w-5 h-5 ml-0.5 fill-current" />
                            )}
                          </div>
                        </div>
                      </div>

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
                        {isBookLocked(book, userPlan, userRole) ? (
                          <span className="inline-flex items-center gap-1 font-bold text-xs text-amber-800">
                            <Lock className="w-3.5 h-3.5 text-amber-600" /> Khusus Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-xs text-[#3B4B34] group-hover:text-[#20251A] transition">
                            Baca <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-20 py-10 bg-[#EFE9DF] border-t border-[#1C1917]/10 text-xs text-[#78716C]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm text-[#1C1917]">Baca</span>
            <span>• Pusat Pembacaan Firman &amp; Perpustakaan Hayat Digital</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setViewMode('landing')} className="hover:text-[#1C1917] transition-colors">Beranda</button>
            <button onClick={() => setViewMode('library')} className="hover:text-[#1C1917] transition-colors">Katalog Buku</button>
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
            {isLoggedIn && userRole === 'reader' && (
              <button onClick={() => setViewMode('user-dashboard')} className="hover:text-[#1C1917] transition-colors font-bold text-[#3B4B34]">Dashboard Saya</button>
            )}
            {isLoggedIn && userRole === 'admin' && (
              <button onClick={() => setViewMode('admin-dashboard')} className="hover:text-[#1C1917] transition-colors font-bold text-amber-800">Dashboard Admin</button>
            )}
            {!isLoggedIn && (
              <button onClick={() => openAuthModal('reader')} className="hover:text-[#1C1917] transition-colors">Masuk Akun</button>
            )}
          </div>
        </div>
      </footer>

      {/* Admin Upload Modal */}
      <AdminUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onOpenAuthModal={() => openAuthModal('admin')}
        onUploadSuccess={(newBook) => {
          setBooks(prev => [newBook, ...prev]);
          showToast(`Buku "${newBook.title}" berhasil ditambahkan ke katalog!`);
        }}
      />

      {/* Supabase / Local Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialRole={authModalRole}
      />

      {/* Subscription Pricing Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        currentPlan={userPlan}
        onPlanUpdated={handlePlanUpdated}
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
        userPlan={userPlan}
        userRole={userRole}
        onOpenPricing={() => setIsSubscriptionModalOpen(true)}
      />

      {/* Modal Pemilih Topik Pembinaan Dasar */}
      <PembinaanTopicsModal
        isOpen={isPembinaanModalOpen}
        onClose={() => setIsPembinaanModalOpen(false)}
        onSelectTopic={handleSelectPembinaanTopic}
        userPlan={userPlan}
        userRole={userRole}
        onOpenPricing={() => setIsSubscriptionModalOpen(true)}
      />

      {/* Modal Upgrade / Akses Buku Terkunci */}
      <LockedBookModal
        isOpen={!!lockedBookNotice}
        onClose={() => setLockedBookNotice(null)}
        book={lockedBookNotice}
        userPlan={userPlan}
        onOpenPricing={() => setIsSubscriptionModalOpen(true)}
      />

      {/* Modal Pemilih Kitab Alkitab */}
      <BibleSelectorModal
        isOpen={isBibleSelectorModalOpen}
        onClose={() => setIsBibleSelectorModalOpen(false)}
        onSelectBibleBook={handleSelectBibleBook}
      />

      {/* Modal Pencarian Cepat Ayat Alkitab & Catatan Kaki */}
      <QuickScriptureModal
        isOpen={isQuickScriptureOpen}
        onClose={() => setIsQuickScriptureOpen(false)}
        onNavigateToVerse={(verse) => {
          setIsQuickScriptureOpen(false);
          if (!isLoggedIn) {
            setIsAuthModalOpen(true);
            showToast('Silakan masuk akun terlebih dahulu untuk membaca Alkitab.');
          } else {
            setViewMode('bible');
          }
        }}
      />

      {/* Floating Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-xl border-t border-[#1C1917]/10 px-3 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setViewMode('landing')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
            viewMode === 'landing' ? 'text-[#3B4B34] font-bold' : 'text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <Home className={`w-5 h-5 ${viewMode === 'landing' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Beranda</span>
        </button>

        <button
          onClick={() => setViewMode('library')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
            viewMode === 'library' ? 'text-[#3B4B34] font-bold' : 'text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <BookOpen className={`w-5 h-5 ${viewMode === 'library' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Katalog</span>
        </button>

        <button
          onClick={() => {
            setKidungInitialTab('kidung');
            setKidungInitialSongId(null);
            setViewMode('kidung');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
            viewMode === 'kidung' ? 'text-[#3B4B34] font-bold' : 'text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <Music className={`w-5 h-5 text-amber-600 ${viewMode === 'kidung' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Kidung</span>
        </button>

        <button
          onClick={() => {
            if (!isLoggedIn) {
              setIsAuthModalOpen(true);
              showToast('Silakan masuk akun terlebih dahulu untuk membaca Alkitab.');
            } else {
              setViewMode('bible');
            }
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
            viewMode === 'bible' ? 'text-[#3B4B34] font-bold' : 'text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <BookMarked className={`w-5 h-5 text-[#3B4B34] ${viewMode === 'bible' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Alkitab</span>
        </button>

        {isLoggedIn ? (
          userRole === 'admin' ? (
            <button
              onClick={() => setViewMode('admin-dashboard')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
                viewMode === 'admin-dashboard' ? 'text-stone-950 font-bold' : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <ShieldCheck className={`w-5 h-5 text-emerald-600 ${viewMode === 'admin-dashboard' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px]">Admin</span>
            </button>
          ) : (
            <button
              onClick={() => setViewMode('user-dashboard')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
                viewMode === 'user-dashboard' ? 'text-[#3B4B34] font-bold' : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <User className={`w-5 h-5 text-amber-600 ${viewMode === 'user-dashboard' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px]">Dashboard</span>
            </button>
          )
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[#78716C] hover:text-[#1C1917] transition"
          >
            <LogIn className="w-5 h-5 text-[#3B4B34]" />
            <span className="text-[10px]">Masuk</span>
          </button>
        )}
      </nav>
    </div>
  );
}
