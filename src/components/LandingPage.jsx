import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, ShieldCheck, ArrowRight, Sparkles, 
  ChevronRight, Heart, Flame, Sun, Sunrise, Compass,
  CheckCircle2, Utensils, MessageSquare, Quote, Layers,
  ChevronDown, BookMarked, Play, Star, Smartphone, RefreshCw,
  Send, User, Volume2, ChevronLeft, LogIn, Settings, Users, Search, Music,
  Menu, X, Home, Tv
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuLabel 
} from '@/components/ui/dropdown-menu';
import { INITIAL_TESTIMONIALS, INITIAL_SHORT_ENJOYMENTS } from '../lib/communityStorage';
import { getCurrentFkkpDay } from '../lib/fkkpSchedule';

// Animated Words component for staggered reveal effect
function AnimatedWords({ text, baseDelay = 0, className = "" }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className="w-anim inline-block"
          style={{ animationDelay: `${baseDelay + i * 85}ms`, marginRight: "0.26em" }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

// Smooth animated counter component for stats
function AnimatedCounter({ target, suffix = '', duration = 1400 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animatedRef.current) {
            animatedRef.current = true;
            let startTime = null;
            const animate = (timestamp) => {
              if (!startTime) startTime = timestamp;
              const progress = Math.min((timestamp - startTime) / duration, 1);
              const easeProgress = 1 - Math.pow(1 - progress, 3);
              setCount(Math.round(target * easeProgress));
              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            };
            requestAnimationFrame(animate);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, [target, suffix, duration]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

export default function LandingPage({ 
  onEnterLibrary, 
  onOpenBible, 
  onOpenKidung,
  onOpenPresenter,
  onOpenQuickScripture,
  onOpenLogin, 
  isLoggedIn, 
  user, 
  userRole = 'guest',
  onLogout,
  onOpenUserDashboard,
  onOpenAdminDashboard,
  onOpenPricing,
  enjoyments = INITIAL_SHORT_ENJOYMENTS,
  onAddEnjoyment,
  books = [],
  onOpenBook
}) {
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('fkkp');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Rotating short enjoyments state
  const [currentEnjoymentIndex, setCurrentEnjoymentIndex] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareName, setShareName] = useState(user?.full_name || '');
  const [shareCity, setShareCity] = useState('Surabaya');
  const [shareText, setShareText] = useState('');
  const [shareSubmitted, setShareSubmitted] = useState(false);

  // Dynamic FKKP Schedule State
  const [fkkpDay, setFkkpDay] = useState(getCurrentFkkpDay());

  useEffect(() => {
    const handleUpdate = () => {
      setFkkpDay(getCurrentFkkpDay());
    };
    window.addEventListener('fkkp_settings_updated', handleUpdate);
    return () => window.removeEventListener('fkkp_settings_updated', handleUpdate);
  }, []);

  // Auto-rotate short enjoyments every 4 seconds
  useEffect(() => {
    if (!enjoyments || enjoyments.length === 0) return;
    const interval = setInterval(() => {
      setCurrentEnjoymentIndex((prev) => (prev + 1) % enjoyments.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [enjoyments]);

  // Reveal-on-scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.reveal-item');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleQuickSubmitShare = (e) => {
    e.preventDefault();
    if (!shareText.trim()) return;
    if (onAddEnjoyment) {
      onAddEnjoyment({
        name: shareName.trim() || 'Sahabat Pembaca',
        city: shareCity.trim() || 'Indonesia',
        text: shareText.trim()
      });
    }
    setShareSubmitted(true);
    setTimeout(() => {
      setShareSubmitted(false);
      setIsShareModalOpen(false);
      setShareText('');
    }, 1500);
  };

  const faqs = [
    {
      q: 'Apakah istilah "Makan Tuhan" benar-benar Alkitabiah?',
      a: 'Sangat Alkitabiah. Dalam Injil Yohanes 6:57, Tuhan Yesus sendiri bersabda: "Sama seperti Bapa yang hidup mengutus Aku dan Aku hidup oleh Bapa, demikian juga barangsiapa yang memakan Aku, ia pun akan hidup oleh Aku." Tuhan Yesus memperkenalkan diri-Nya bukan sebagai filsafat di otak, melainkan sebagai Roti Hayat (Yohanes 6:35) dan Air Hayat (Yohanes 4:14) yang harus kita telan dan nikmati ke dalam batin roh kita.'
    },
    {
      q: 'Apakah buku bisa diunduh atau dibaca secara offline?',
      a: 'Tidak. Aplikasi Baca disajikan secara online (Cloud Streaming Reader). Seluruh buku dan santapan firman diakses secara online guna menjaga keamanan hak cipta penerbit serta memastikan seluruh catatan dan progres pembacaan Anda tersimpan aman dan tersinkronisasi di server cloud.'
    },
    {
      q: 'Apa itu Meja Perjamuan FKKP?',
      a: 'Meja Perjamuan menyajikan intisari FKKP (Firman Kudus untuk Kebangunan Pagi) hari itu. Mutiara kebenaran disaring menjadi butir-butir santapan ringkas, doa-makan serapan, dan terang inspirasi harian agar Anda dapat langsung memakannya dalam waktu singkat di awal fajar.'
    },
    {
      q: 'Apa bedanya paket Standart, Premium, dan Ultimate?',
      a: 'Paket Standart (Gratis) memberi Anda akses penuh ke 66 Kitab Alkitab Versi Pemulihan dan FKKP edisi minggu ini. Paket Premium membuka seluruh 30 Seri Buku Karakter, 46 Pokok Pembinaan Dasar, dan penyimpanan catatan di Cloud. Paket Ultimate menambahkan fitur Meja Perjamuan lengkap tanpa batas, sinkronisasi multi-perangkat instan, serta jaminan akses pembaruan buku seumur hidup.'
    }
  ];

  const activeEnjoyment = enjoyments[currentEnjoymentIndex] || enjoyments[0];

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1C1917] flex flex-col font-sans selection:bg-[#B96A4A]/25 selection:text-[#3B4B34] transition-colors duration-300 relative overflow-x-hidden pb-20 md:pb-0">
      
      {/* Floating Ambient Glow Atmospheric Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="float-slow absolute -top-32 left-1/4 w-[650px] h-[650px] bg-gradient-to-br from-[#8E9C75]/25 via-[#3B4B34]/15 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="float-slow-reverse absolute top-1/3 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-[#B96A4A]/20 via-[#B96A4A]/10 to-transparent rounded-full blur-3xl opacity-65" />
        <div className="float-slow absolute -bottom-40 left-10 w-[550px] h-[550px] bg-gradient-to-tr from-[#3B4B34]/20 to-transparent rounded-full blur-3xl opacity-60" />
      </div>

      {/* ===================== HEADER ===================== */}
      <header className="sticky top-0 z-50 border-b border-[#1C1917]/8 bg-[#F4EFE6]/90 backdrop-blur-md">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#3B4B34] text-[#F4EFE6] flex items-center justify-center shadow-md shadow-[#3B4B34]/20 btn-lift">
              <Utensils className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-amber-200" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#1C1917] font-serif">
                  Baca.
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-[#3B4B34]/10 text-[#3B4B34] border border-[#3B4B34]/20 whitespace-nowrap hidden 2xl:inline-flex">
                  Ministry Suite
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links (Visible on desktop xl: 1280px+) */}
          <nav className="hidden xl:flex items-center gap-6 text-xs font-semibold text-[#78716C] shrink-0">
            <a href="#santapan" className="whitespace-nowrap hover:text-[#1C1917] transition-colors">
              Fitur Utama
            </a>
            <a href="#faq" className="whitespace-nowrap hover:text-[#1C1917] transition-colors">
              Tanya Jawab
            </a>
          </nav>

          {/* Action Buttons: Clean & Perfectly Distributed across Viewports */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Scripture Search Button (Desktop xl: 1280px+) */}
            {isLoggedIn && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenQuickScripture}
                className="hidden xl:inline-flex rounded-full text-xs font-bold border-amber-600/30 text-amber-900 hover:bg-amber-100/50 bg-amber-50/70 h-9 px-3.5 shadow-xs btn-lift whitespace-nowrap"
                title="Cari Cepat Ayat Alkitab & Catatan Kaki"
              >
                <Search className="w-3.5 h-3.5 mr-1 text-amber-700" />
                <span>Cari Ayat</span>
              </Button>
            )}

            {/* Read Bible Button (Tablet & Desktop: sm+) */}
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenBible}
              className="hidden sm:inline-flex rounded-full text-xs font-bold border-[#3B4B34]/30 text-[#3B4B34] hover:bg-[#3B4B34]/10 bg-white/70 h-8 sm:h-9 px-3 sm:px-3.5 shadow-xs btn-lift whitespace-nowrap"
              title="Buka 66 Kitab Alkitab Versi Pemulihan"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1 text-[#3B4B34]" />
              <span>Alkitab</span>
            </Button>

            {/* Kidung & Suplemen Button (lg+) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenKidung && onOpenKidung('kidung')}
              className="hidden lg:inline-flex rounded-full text-xs font-bold border-amber-600/30 text-amber-900 hover:bg-amber-100/50 bg-amber-50/70 h-8 sm:h-9 px-3 sm:px-3.5 shadow-xs btn-lift whitespace-nowrap"
              title="Kidung Rohani & Suplemen"
            >
              <Music className="w-3.5 h-3.5 mr-1 text-amber-700" />
              <span>Kidung</span>
            </Button>

            {/* Live Stage Presenter Button (lg+) */}
            {onOpenPresenter && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenPresenter}
                className="hidden lg:inline-flex rounded-full text-xs font-bold border-[#3B4B34]/30 text-[#3B4B34] hover:bg-[#3B4B34]/10 bg-white/70 h-8 sm:h-9 px-3 sm:px-3.5 shadow-xs btn-lift whitespace-nowrap"
                title="Buka Live Stage Presenter Console untuk Proyektor"
              >
                <Tv className="w-3.5 h-3.5 mr-1 text-[#3B4B34]" />
                <span>Live Stage</span>
              </Button>
            )}

            {/* Katalog Buku Button (sm+: on mobile < sm, available in bottom nav & hamburger) */}
            <Button
              size="sm"
              onClick={onEnterLibrary}
              className="hidden sm:inline-flex rounded-full text-xs font-bold bg-[#1C1917] hover:bg-[#3B4B34] text-[#F4EFE6] h-8 sm:h-9 px-3 sm:px-3.5 shadow-md btn-lift whitespace-nowrap items-center"
            >
              <span>Katalog</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 hidden md:inline" />
            </Button>

            {/* Unified Portal & Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 bg-white/80 hover:bg-white text-[#1C1917] px-2.5 sm:px-3 py-1.5 rounded-full border border-[#1C1917]/15 text-xs font-bold shadow-xs transition btn-lift">
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
                      <span className="text-[11px] font-bold">Masuk</span>
                    </>
                  )}
                  <ChevronDown className="w-3 h-3 text-[#78716C]" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl bg-[#F7F4ED] border border-[#1C1917]/15 text-[#1C1917] shadow-xl">
                {isLoggedIn && userRole === 'admin' ? (
                  <>
                    <DropdownMenuLabel className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-amber-900 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-700" />
                      Akun Administrator
                    </DropdownMenuLabel>

                    <DropdownMenuItem 
                      onClick={() => onOpenAdminDashboard('books')}
                      className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer flex items-center gap-2 hover:bg-white focus:bg-white"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <div>
                        <p className="font-bold text-xs text-[#1C1917]">Dashboard Admin</p>
                        <p className="text-[10px] text-[#78716C]">Kelola katalog, toko &amp; moderasi</p>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => onOpenAdminDashboard('users')}
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
                      onClick={onLogout}
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
                          Akun Pembaca
                        </p>
                      </div>
                    </div>

                    <DropdownMenuItem 
                      onClick={() => onOpenUserDashboard('santapan')}
                      className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer flex items-center gap-2 hover:bg-white focus:bg-white"
                    >
                      <User className="w-4 h-4 text-emerald-700" />
                      <div>
                        <p className="font-bold text-xs text-[#1C1917]">Dashboard Saya</p>
                        <p className="text-[10px] text-[#78716C]">Terang hari ini &amp; bagi nikmat</p>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => onOpenUserDashboard('profile')}
                      className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer flex items-center gap-2 hover:bg-white focus:bg-white"
                    >
                      <Settings className="w-4 h-4 text-[#3B4B34]" />
                      <div>
                        <p className="font-bold text-xs text-[#1C1917]">Pengaturan Profil</p>
                        <p className="text-[10px] text-[#78716C]">Nama, WA, Email, Distrik - Lokal</p>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={onOpenPricing}
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
                      onClick={onLogout}
                      className="rounded-xl px-2.5 py-1.5 text-xs font-semibold text-rose-700 cursor-pointer hover:bg-rose-50 focus:bg-rose-50"
                    >
                      Keluar dari Akun
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem 
                      onClick={() => onOpenLogin()}
                      className="rounded-xl px-2.5 py-2.5 text-xs font-bold cursor-pointer flex items-center gap-2 bg-[#3B4B34] text-white hover:bg-[#20251A] focus:bg-[#20251A]"
                    >
                      <LogIn className="w-4 h-4 text-amber-300" />
                      <div>
                        <p className="font-bold text-xs text-white">Masuk ke Akun</p>
                        <p className="text-[10px] text-amber-100/80">Akses akun pembaca &amp; pengelola</p>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1 bg-[#1C1917]/10" />

                    <DropdownMenuItem 
                      onClick={onOpenPricing}
                      className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer flex items-center gap-2 hover:bg-white focus:bg-white"
                    >
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <div>
                        <p className="font-bold text-xs text-[#1C1917]">Pilihan Paket Santapan</p>
                        <p className="text-[10px] text-[#78716C]">Standart, Premium, Ultimate</p>
                      </div>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Hamburger Menu Toggle Button (Visible on screens < xl) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 hover:bg-white border border-[#1C1917]/15 text-[#1C1917] transition active:scale-95 shadow-xs"
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

        {/* Mobile Slide-down Drawer (Scrollable and responsive) */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-[#1C1917]/10 bg-[#FAF7F2]/95 backdrop-blur-xl px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl max-h-[calc(100vh-4.5rem)] overflow-y-auto">
            {/* Quick Action Tiles */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onEnterLibrary();
                }}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#3B4B34] text-white shadow-xs active:scale-95 transition"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>Katalog Buku</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenBible();
                }}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-[#1C1917]/10 text-[#3B4B34] shadow-xs active:scale-95 transition"
              >
                <BookMarked className="w-4 h-4 text-[#3B4B34]" />
                <span>Alkitab Pemulihan</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenKidung) onOpenKidung('kidung');
                }}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-600/20 text-amber-900 shadow-xs active:scale-95 transition"
              >
                <Music className="w-4 h-4 text-amber-700" />
                <span>Kidung &amp; Suplemen</span>
              </button>

              {onOpenPresenter && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenPresenter();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#3B4B34]/10 border border-[#3B4B34]/20 text-[#3B4B34] shadow-xs active:scale-95 transition"
                >
                  <Tv className="w-4 h-4 text-[#3B4B34]" />
                  <span>Live Stage (Proyektor)</span>
                </button>
              )}

              {isLoggedIn ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onOpenQuickScripture) onOpenQuickScripture();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-100 border border-stone-300 text-stone-800 shadow-xs active:scale-95 transition"
                >
                  <Search className="w-4 h-4 text-stone-700" />
                  <span>Cari Cepat Ayat</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenLogin();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-600/20 text-emerald-900 shadow-xs active:scale-95 transition"
                >
                  <LogIn className="w-4 h-4 text-emerald-700" />
                  <span>Masuk Akun</span>
                </button>
              )}
            </div>

            {/* In-Page Anchor Links */}
            <div className="pt-2 border-t border-[#1C1917]/10">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] mb-2 px-1">
                Jelajahi Bagian Halaman
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold text-[#1C1917]">
                <a
                  href="#santapan"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/70 border border-[#1C1917]/8 hover:bg-white flex items-center justify-between"
                >
                  <span>Meja Perjamuan</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#78716C]" />
                </a>
                <a
                  href="#testimoni"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/70 border border-[#1C1917]/8 hover:bg-white flex items-center justify-between"
                >
                  <span>Testimoni Nikmat</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#78716C]" />
                </a>
                <a
                  href="#pilar"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/70 border border-[#1C1917]/8 hover:bg-white flex items-center justify-between"
                >
                  <span>4 Pilar Hayat</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#78716C]" />
                </a>
                <a
                  href="#faq"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/70 border border-[#1C1917]/8 hover:bg-white flex items-center justify-between"
                >
                  <span>Tanya Jawab</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#78716C]" />
                </a>
              </div>
            </div>

            {/* User Dashboard / Admin Shortcut if logged in */}
            {isLoggedIn && (
              <div className="pt-2 border-t border-[#1C1917]/10 flex flex-col gap-1.5">
                {userRole === 'admin' ? (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (onOpenAdminDashboard) onOpenAdminDashboard();
                    }}
                    className="w-full p-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold flex items-center gap-2 justify-center shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Buka Dashboard Admin</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (onOpenUserDashboard) onOpenUserDashboard();
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#3B4B34] text-white text-xs font-bold flex items-center gap-2 justify-center shadow-xs"
                  >
                    <User className="w-4 h-4 text-amber-300" />
                    <span>Buka Dashboard Saya</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative z-10 pt-14 sm:pt-20 pb-12 sm:pb-16 overflow-hidden text-center">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8">
          
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8E9C75]/20 border border-[#8E9C75]/40 text-[#3B4B34] text-xs font-bold tracking-wider uppercase mb-7 shadow-xs w-anim" style={{ animationDelay: '100ms' }}>
            <Flame className="w-3.5 h-3.5 text-[#B96A4A] animate-pulse" />
            <span>Digital Ministry &amp; Worship Suite — Studi, BFY &amp; Live Stage</span>
          </div>

          {/* Majestic Hero Headline */}
          <h1 className="tracking-tight text-[#1C1917] font-serif leading-[1.08]">
            <span className="block text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal">
              <AnimatedWords text="Mari Makan Tuhan." baseDelay={180} />
            </span>
            <span className="block text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light italic text-[#3B4B34] mt-2 sm:mt-3">
              <AnimatedWords text="Menikmati Kristus sebagai Hayat." baseDelay={550} />
            </span>
          </h1>

          {/* Narrative Subtitle */}
          <p 
            className="mt-8 mx-auto max-w-2xl text-base sm:text-lg text-[#57534E] leading-relaxed font-sans font-normal w-anim"
            style={{ animationDelay: '850ms' }}
          >
            Satu platform ringan untuk <span className="font-semibold text-[#1C1917]">studi firman pribadi (7 terjemahan &amp; catatan kaki)</span>, persekutuan BFY &amp; kelompok sel, hingga <span className="font-semibold text-[#1C1917]">Live Stage Proyektor Ibadah</span> lengkap dengan Kidung, lagu kustom, dan presentasi.
          </p>

          {/* CTA Buttons */}
          <div 
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-anim"
            style={{ animationDelay: '1050ms' }}
          >
            <Button
              size="lg"
              onClick={onEnterLibrary}
              className="w-full sm:w-auto rounded-full bg-[#1C1917] hover:bg-[#3B4B34] text-[#F4EFE6] text-sm font-bold px-8 py-6 shadow-xl shadow-[#1C1917]/20 btn-lift gap-2"
            >
              <Utensils className="w-4 h-4 text-amber-300" />
              <span>Mulai Doa-Makan Sekarang</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onOpenBible}
              className="w-full sm:w-auto rounded-full border-[#1C1917]/20 text-[#1C1917] hover:bg-[#1C1917]/5 bg-white/70 text-sm font-bold px-7 py-6 btn-lift gap-2"
            >
              <BookOpen className="w-4 h-4 text-[#3B4B34]" />
              <span>Buka Alkitab (7 Terjemahan)</span>
            </Button>
          </div>

        </div>

        {/* ===================== SHOWCASE 3 PILAR UTAMA (LIVE STAGE, 7 TERJEMAHAN, BFY & KIDUNG) ===================== */}
        <div id="santapan" className="relative mt-14 sm:mt-18 max-w-[1140px] mx-auto px-4 sm:px-8 reveal-item scroll-mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            {/* Pilar 1: Live Stage & Proyektor */}
            <div className="rounded-[28px] p-6 sm:p-7 bg-white/80 backdrop-blur-xl border border-white/90 shadow-xl shadow-[#1C1917]/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B4B34]/10 text-[#3B4B34] text-[11px] font-bold uppercase tracking-wider mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Live Stage &amp; Proyektor</span>
                </div>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#1C1917] leading-snug">
                  Presentasi Ibadah Tanpa Software Berat
                </h3>
                <p className="text-xs sm:text-sm text-[#57534E] mt-2.5 leading-relaxed">
                  Susun setlist, tayangkan ayat &amp; catatan kaki langsung ke layar proyektor, jalankan Teks Berjalan, import PPTX/PDF/Word/Gambar, dan kontrol jarak jauh dari HP.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1C1917]/8">
                <Button
                  size="sm"
                  onClick={onOpenPresenter}
                  className="w-full rounded-full bg-[#3B4B34] hover:bg-[#2C3827] text-white text-xs font-bold h-10 btn-lift"
                >
                  Buka Live Stage
                </Button>
              </div>
            </div>

            {/* Pilar 2: Alkitab 7 Terjemahan & Catatan Kaki */}
            <div className="rounded-[28px] p-6 sm:p-7 bg-white/80 backdrop-blur-xl border border-amber-500/25 shadow-xl shadow-[#1C1917]/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-4">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>7 Terjemahan &amp; Studi</span>
                </div>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#1C1917] leading-snug">
                  Alkitab Lengkap dengan Catatan Kaki
                </h3>
                <p className="text-xs sm:text-sm text-[#57534E] mt-2.5 leading-relaxed">
                  Bandingkan AVP, TB, RCV, KJV, ASV, NET, dan Scofield 1917. Dilengkapi rujukan silang interaktif, garis besar kitab, dan catatan pribadi.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1C1917]/8">
                <Button
                  size="sm"
                  onClick={onOpenBible}
                  className="w-full rounded-full bg-[#1C1917] hover:bg-[#3B4B34] text-white text-xs font-bold h-10 btn-lift"
                >
                  Buka Alkitab (7 Versi)
                </Button>
              </div>
            </div>

            {/* Pilar 3: BFY, Kidung & Lagu Kustom */}
            <div className="rounded-[28px] p-6 sm:p-7 bg-white/80 backdrop-blur-xl border border-white/90 shadow-xl shadow-[#1C1917]/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-4">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>BFY &amp; Persekutuan</span>
                </div>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#1C1917] leading-snug">
                  Kidung, Suplemen &amp; Lagu Kustom
                </h3>
                <p className="text-xs sm:text-sm text-[#57534E] mt-2.5 leading-relaxed">
                  Siap pakai untuk acara BFY, kelompok sel, camp, dan gereja lokal. Tersedia 786 Kidung, Suplemen, serta dukungan lagu kustom (KJ, NKB, PKJ).
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1C1917]/8">
                <Button
                  size="sm"
                  onClick={onOpenKidung}
                  className="w-full rounded-full bg-white hover:bg-[#1C1917] text-[#1C1917] hover:text-white border border-[#1C1917]/20 text-xs font-bold h-10 btn-lift"
                >
                  Buka Kidung &amp; Pujian
                </Button>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ===================== PROOF & TRUTH RIBBON WITH ANIMATED STATS ===================== */}
      <section id="kebenaran" className="relative z-10 overflow-hidden py-16 sm:py-20 text-[#F4EFE6] reveal-item" style={{ background: 'linear-gradient(135deg, #1C2317 0%, #293322 55%, #151A11 100%)' }}>
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div className="max-w-xl space-y-3">
            <span className="text-xs font-bold tracking-widest uppercase text-[#8E9C75]">Kebenaran Yang Memerdekakan</span>
            <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-light leading-snug">
              Bukan hanya membaca pengetahuan, tetapi <span className="italic font-normal text-[#8E9C75]">memakan firman</span> sampai menjadi hayat dan darah-daging rohani di dalam kita.
            </p>
            <p className="text-xs text-[#A8A29E] pt-1">
              "Apabila aku bertemu dengan perkataan-perkataan-Mu, aku memakannya; perkataan-perkataan-Mu itu menjadi kegirangan bagiku..." — Yeremia 15:16
            </p>
          </div>

          {/* Animated Statistics Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 shrink-0 w-full lg:w-auto">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center btn-lift">
              <p className="text-3xl sm:text-4xl font-serif font-bold text-amber-200">
                <AnimatedCounter target={66} />
              </p>
              <p className="text-[11px] text-[#A8A29E] mt-1 font-medium">Kitab Lengkap PL &amp; PB</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center btn-lift">
              <p className="text-3xl sm:text-4xl font-serif font-bold text-amber-200">
                <AnimatedCounter target={46} />
              </p>
              <p className="text-[11px] text-[#A8A29E] mt-1 font-medium">Topik Pembinaan Dasar</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center btn-lift">
              <p className="text-3xl sm:text-4xl font-serif font-bold text-amber-200">
                <AnimatedCounter target={30} />
              </p>
              <p className="text-[11px] text-[#A8A29E] mt-1 font-medium">Seri Butir Karakter</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center btn-lift">
              <p className="text-3xl sm:text-4xl font-serif font-bold text-amber-200">
                <AnimatedCounter target={100} suffix="%" />
              </p>
              <p className="text-[11px] text-[#A8A29E] mt-1 font-medium">Bebas Akses &amp; Iklan</p>
            </div>
          </div>
        </div>
      </section>


      {/* ===================== 3 LANGKAH PRAKTIS CARA MAKAN TUHAN ===================== */}
      <section id="langkah" className="relative z-10 py-20 sm:py-28 bg-[#F4EFE6]">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8">
          <div className="text-center space-y-3 reveal-item">
            <span className="text-xs font-bold tracking-widest uppercase text-[#B96A4A]">Praktik Rohani</span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#1C1917]">
              Bagaimana Cara Kita Memakan Tuhan?
            </h2>
            <p className="max-w-xl mx-auto text-sm sm:text-base text-[#57534E]">
              Tiga langkah sederhana untuk menyerap hayat ilahi ke dalam batin setiap hari.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="rounded-[28px] p-8 bg-white border border-[#1C1917]/8 shadow-sm space-y-4 reveal-item btn-lift hover:shadow-xl transition-all duration-300">
              <span className="w-10 h-10 rounded-2xl bg-[#8E9C75]/20 text-[#3B4B34] font-serif font-bold text-lg flex items-center justify-center">
                1
              </span>
              <h3 className="text-xl font-serif font-bold text-[#1C1917]">Berpaling ke dalam Roh</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Tutup mata, heningkan pikiran dari kesibukan duniawi, dan berseru dengan tulus: <span className="font-semibold text-[#1C1917]">"O Tuhan Yesus!"</span> Memanggil nama Tuhan adalah bernapas secara rohani untuk menyentuh hadirat-Nya.
              </p>
            </div>

            <div className="rounded-[28px] p-8 bg-white border border-[#1C1917]/8 shadow-sm space-y-4 reveal-item btn-lift hover:shadow-xl transition-all duration-300">
              <span className="w-10 h-10 rounded-2xl bg-[#B96A4A]/20 text-[#B96A4A] font-serif font-bold text-lg flex items-center justify-center">
                2
              </span>
              <h3 className="text-xl font-serif font-bold text-[#1C1917]">Doa-Makan Setiap Ayat</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Bukalah satu atau dua ayat (misal dari FKKP atau Alkitab). Bacalah dengan doa, perkatakan firman itu berulang-ulang, ucapkan syukur atas setiap janji di dalamnya sampai hatimu hangat dan kenyang.
              </p>
            </div>

            <div className="rounded-[28px] p-8 bg-white border border-[#1C1917]/8 shadow-sm space-y-4 reveal-item btn-lift hover:shadow-xl transition-all duration-300">
              <span className="w-10 h-10 rounded-2xl bg-[#3B4B34]/20 text-[#3B4B34] font-serif font-bold text-lg flex items-center justify-center">
                3
              </span>
              <h3 className="text-xl font-serif font-bold text-[#1C1917]">Mencerna &amp; Hidup Oleh Firman</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Firman yang dimakan akan terserap menjadi unsur hayat kita. Sepanjang hari, firman itu membimbing tutur kata, menjaga hati nurani, dan memampukan kita hidup berkemenangan oleh hayat Kristus.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ===================== FAQ ACCORDION ===================== */}
      <section id="faq" className="relative z-10 py-20 sm:py-28 bg-[#EDE7DC] scroll-mt-28">
        <div className="max-w-[840px] mx-auto px-5 sm:px-8 space-y-4">
          <div className="text-center space-y-2 mb-10 pt-2 reveal-item">
            <span className="text-xs font-bold tracking-widest uppercase text-[#8E9C75]">Tanya Jawab Rohani</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1C1917]">
              Mengenal Prinsip Doa-Makan Firman
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-[#1C1917]/8 bg-white overflow-hidden transition-all duration-300 shadow-xs hover:shadow-md reveal-item"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full text-left px-6 py-4.5 flex items-center justify-between gap-4 font-serif font-bold text-base text-[#1C1917] transition-colors hover:text-[#3B4B34]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#78716C] transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-[#3B4B34]' : ''}`} />
                  </button>

                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-5 pt-1 text-xs text-[#57534E] leading-relaxed border-t border-[#1C1917]/5 font-sans">
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== CALL TO ACTION BANNER ===================== */}
      <section className="relative z-10 py-16 sm:py-24 text-center text-[#F4EFE6] reveal-item" style={{ background: 'linear-gradient(135deg, #1C2317 0%, #20251A 60%, #151812 100%)' }}>
        <div className="max-w-[900px] mx-auto px-5 sm:px-8 space-y-6">
          <span className="text-xs font-bold tracking-widest uppercase text-[#8E9C75]">Meja Terhidang Untuk Anda</span>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal leading-tight">
            Datanglah kepada Kristus, <br />
            <span className="italic font-light text-amber-200">Kecaplah dan Nikmatilah Kebaikan-Nya.</span>
          </h2>
          <p className="max-w-xl mx-auto text-sm text-[#A8A29E] leading-relaxed">
            Mulai dari studi firman pribadi, persekutuan BFY, hingga proyektor ibadah (Live Stage) dalam satu platform ringan.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={onOpenBible}
              className="w-full sm:w-auto rounded-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-8 py-6 shadow-xl text-sm btn-lift"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Buka Alkitab (7 Terjemahan)
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onOpenPricing}
              className="w-full sm:w-auto rounded-full border-white/20 text-white hover:bg-white/10 bg-white/5 font-bold px-8 py-6 text-sm btn-lift"
            >
              Lihat Paket Langganan &amp; Sinkron Toko
            </Button>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="relative z-10 py-10 bg-[#EFE9DF] border-t border-[#1C1917]/10 text-xs text-[#78716C]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm text-[#1C1917]">Baca</span>
            <span>— Digital Ministry &amp; Worship Presenter Suite</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={onOpenBible} className="hover:text-[#1C1917] transition-colors">Alkitab (7 Terjemahan)</button>
            <button onClick={onEnterLibrary} className="hover:text-[#1C1917] transition-colors">Katalog Buku</button>
            {isLoggedIn && userRole === 'reader' && (
              <button onClick={onOpenUserDashboard} className="hover:text-[#1C1917] transition-colors font-bold text-[#3B4B34]">Dashboard Saya</button>
            )}
            {isLoggedIn && userRole === 'admin' && (
              <button onClick={onOpenAdminDashboard} className="hover:text-[#1C1917] transition-colors font-bold text-amber-800">Admin Portal</button>
            )}
            {!isLoggedIn && (
              <button onClick={onOpenLogin} className="hover:text-[#1C1917] transition-colors">Masuk Akun</button>
            )}
          </div>
        </div>
      </footer>

      {/* Modal Cepat Bagikan Nikmat */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="max-w-md p-6 bg-[#F4EFE6] text-[#1C1917] rounded-[28px] border border-[#1C1917]/15">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="font-serif font-bold text-xl text-[#1C1917] flex items-center gap-2">
              <Heart className="w-5 h-5 text-emerald-700" />
              Bagi Nikmat Hari Ini
            </DialogTitle>
            <DialogDescription className="text-xs text-[#78716C]">
              Bagikan 1-2 kalimat singkat kenikmatan firman Tuhan yang Anda kecap hari ini.
            </DialogDescription>
          </DialogHeader>

          {shareSubmitted && (
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Kenikmatan Anda berhasil dibagikan!
            </div>
          )}

          <form onSubmit={handleQuickSubmitShare} className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] font-bold text-[#1C1917] block mb-1">Nama</label>
              <Input
                value={shareName}
                onChange={(e) => setShareName(e.target.value)}
                placeholder="Nama Anda"
                className="bg-white rounded-xl text-xs h-9"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#1C1917] block mb-1">Kota</label>
              <Input
                value={shareCity}
                onChange={(e) => setShareCity(e.target.value)}
                placeholder="Contoh: Surabaya"
                className="bg-white rounded-xl text-xs h-9"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#1C1917] block mb-1">Kenikmatan Singkat</label>
              <Textarea
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                placeholder="Misal: 'Pagi ini doa-makan Yohanes 6:57 bikin hati damai sejahtera!'"
                className="bg-white rounded-xl text-xs min-h-[80px]"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-white"
            >
              Kirimkan Bagi Nikmat
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Floating Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-xl border-t border-[#1C1917]/10 px-3 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[#3B4B34] font-bold transition"
        >
          <Home className="w-5 h-5 stroke-[2.5]" />
          <span className="text-[10px]">Beranda</span>
        </button>

        <button
          onClick={onEnterLibrary}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[#78716C] hover:text-[#1C1917] transition"
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px]">Katalog</span>
        </button>

        <button
          onClick={() => onOpenKidung && onOpenKidung('kidung')}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[#78716C] hover:text-[#1C1917] transition"
        >
          <Music className="w-5 h-5 text-amber-600" />
          <span className="text-[10px]">Kidung</span>
        </button>

        <button
          onClick={onOpenBible}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[#78716C] hover:text-[#1C1917] transition"
        >
          <BookMarked className="w-5 h-5 text-[#3B4B34]" />
          <span className="text-[10px]">Alkitab</span>
        </button>

        {isLoggedIn ? (
          userRole === 'admin' ? (
            <button
              onClick={() => onOpenAdminDashboard && onOpenAdminDashboard()}
              className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[#78716C] hover:text-[#1C1917] transition"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-[10px]">Admin</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenUserDashboard && onOpenUserDashboard()}
              className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[#78716C] hover:text-[#1C1917] transition"
            >
              <User className="w-5 h-5 text-amber-600" />
              <span className="text-[10px]">Dashboard</span>
            </button>
          )
        ) : (
          <button
            onClick={() => onOpenLogin()}
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
