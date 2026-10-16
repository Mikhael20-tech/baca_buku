import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, ShieldCheck, ArrowRight, Sparkles, 
  ChevronRight, Heart, Flame, Sun, Sunrise, Compass,
  CheckCircle2, Utensils, MessageSquare, Quote, Layers,
  ChevronDown, BookMarked, Play, Star, Smartphone, RefreshCw,
  Send, User, Volume2, ChevronLeft, LogIn, Settings, Users, Search, Music
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
    <div className="min-h-screen bg-[#F4EFE6] text-[#1C1917] flex flex-col font-sans selection:bg-[#B96A4A]/25 selection:text-[#3B4B34] transition-colors duration-300 relative overflow-x-hidden">
      
      {/* Floating Ambient Glow Atmospheric Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="float-slow absolute -top-32 left-1/4 w-[650px] h-[650px] bg-gradient-to-br from-[#8E9C75]/25 via-[#3B4B34]/15 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="float-slow-reverse absolute top-1/3 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-[#B96A4A]/20 via-[#B96A4A]/10 to-transparent rounded-full blur-3xl opacity-65" />
        <div className="float-slow absolute -bottom-40 left-10 w-[550px] h-[550px] bg-gradient-to-tr from-[#3B4B34]/20 to-transparent rounded-full blur-3xl opacity-60" />
      </div>

      {/* ===================== HEADER ===================== */}
      <header className="sticky top-0 z-50 border-b border-[#1C1917]/8 bg-[#F4EFE6]/90 backdrop-blur-md">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-[#3B4B34] text-[#F4EFE6] flex items-center justify-center shadow-md shadow-[#3B4B34]/20 btn-lift">
              <Utensils className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-[#1C1917] font-serif">
                  Baca.
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-[#8E9C75]/25 text-[#3B4B34] border border-[#8E9C75]/30 whitespace-nowrap">
                  Mari Makan Tuhan
                </span>
              </div>
              <p className="text-[11px] text-[#78716C] hidden sm:block whitespace-nowrap">Perpustakaan Santapan Hayat &amp; Alkitab Pemulihan</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#78716C] shrink-0">
            <a href="#santapan" className="whitespace-nowrap hover:text-[#1C1917] transition-colors">
              Meja Perjamuan
            </a>
            <a href="#testimoni" className="whitespace-nowrap hover:text-[#1C1917] transition-colors">
              Testimoni &amp; Nikmat
            </a>
            <a href="#pilar" className="whitespace-nowrap hover:text-[#1C1917] transition-colors">
              4 Pilar
            </a>
            <a href="#faq" className="whitespace-nowrap hover:text-[#1C1917] transition-colors">
              Tanya Jawab
            </a>
          </nav>

          {/* Action Buttons: Clean & Never Overflowing */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Quick Scripture Search Button (Only shown when logged in) */}
            {isLoggedIn && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenQuickScripture}
                className="rounded-full text-xs font-bold border-amber-600/30 text-amber-900 hover:bg-amber-100/50 bg-amber-50/70 h-9 px-3.5 shadow-xs btn-lift whitespace-nowrap"
                title="Cari Cepat Ayat Alkitab & Catatan Kaki"
              >
                <Search className="w-3.5 h-3.5 mr-1 text-amber-700" />
                <span className="hidden sm:inline">Cari Ayat</span>
              </Button>
            )}

            {/* Read Bible Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenBible}
              className="rounded-full text-xs font-bold border-[#3B4B34]/30 text-[#3B4B34] hover:bg-[#3B4B34]/10 bg-white/70 h-9 px-3.5 shadow-xs btn-lift whitespace-nowrap"
              title="Buka 66 Kitab Alkitab Versi Pemulihan"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1 text-[#3B4B34]" />
              <span className="hidden sm:inline">Alkitab</span>
            </Button>

            {/* Kidung & Suplemen Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenKidung && onOpenKidung('kidung')}
              className="rounded-full text-xs font-bold border-amber-600/30 text-amber-900 hover:bg-amber-100/50 bg-amber-50/70 h-9 px-3.5 shadow-xs btn-lift whitespace-nowrap"
              title="Kidung Rohani & Suplemen"
            >
              <Music className="w-3.5 h-3.5 mr-1 text-amber-700" />
              <span className="hidden sm:inline">Kidung</span>
            </Button>

            {/* Katalog Buku Button */}
            <Button
              size="sm"
              onClick={onEnterLibrary}
              className="rounded-full text-xs font-bold bg-[#1C1917] hover:bg-[#3B4B34] text-[#F4EFE6] h-9 px-3.5 shadow-md btn-lift whitespace-nowrap"
            >
              <span>Katalog</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>

            {/* Unified Portal & Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 bg-white/80 hover:bg-white text-[#1C1917] px-3 py-1.5 rounded-full border border-[#1C1917]/15 text-xs font-bold shadow-xs transition btn-lift">
                  {isLoggedIn ? (
                    <>
                      {user?.photo_url ? (
                        <img 
                          src={user.photo_url} 
                          alt="Foto Profil" 
                          className="w-5 h-5 rounded-full object-cover border border-[#3B4B34]/30 shrink-0" 
                        />
                      ) : (
                        <div className={`w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold ${userRole === 'admin' ? 'bg-amber-800' : 'bg-[#3B4B34]'}`}>
                          {userRole === 'admin' ? 'A' : (user?.full_name?.charAt(0) || 'U')}
                        </div>
                      )}
                      <span className="max-w-[85px] truncate hidden sm:inline text-[11px]">
                        {userRole === 'admin' ? 'Admin' : (user?.full_name?.split(' ')[0] || 'User')}
                      </span>
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5 text-[#3B4B34]" />
                      <span className="text-[11px]">Masuk / Akun</span>
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
                        <p className="font-bold text-xs text-white">Masuk / Daftar Akun</p>
                        <p className="text-[10px] text-amber-100/80">Pilih peran di halaman login</p>
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
          </div>
        </div>
      </header>

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative z-10 pt-14 sm:pt-20 pb-12 sm:pb-16 overflow-hidden text-center">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8">
          
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8E9C75]/20 border border-[#8E9C75]/40 text-[#3B4B34] text-xs font-bold tracking-wider uppercase mb-7 shadow-xs w-anim" style={{ animationDelay: '100ms' }}>
            <Flame className="w-3.5 h-3.5 text-[#B96A4A] animate-pulse" />
            <span>Pusat Doa-Makan Firman &amp; Santapan Hayat Rohani</span>
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
            Bukan sekadar membaca huruf di pikiran, melainkan menyerap Kristus ke dalam batin roh kita melalui <span className="font-semibold text-[#1C1917]">doa-makan firman harian</span>, FKKP, dan santapan firman di Meja Perjamuan.
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
              <span>Buka Alkitab (66 Kitab)</span>
            </Button>
          </div>

        </div>

        {/* ===================== MEJA PERJAMUAN (FKKP RANGKUMAN FAJAR) ===================== */}
        <div id="santapan" className="relative mt-14 sm:mt-18 max-w-[1140px] mx-auto px-4 sm:px-8 reveal-item scroll-mt-24">
          
          <div className="rounded-[32px] p-2.5 sm:p-4 bg-white/70 backdrop-blur-xl border border-white/90 shadow-2xl shadow-[#1C1917]/10 transition-all duration-500 hover:shadow-3xl">
            <div className="rounded-[24px] overflow-hidden bg-[#FAF7F2] border border-[#1C1917]/8 flex flex-col md:flex-row text-left min-h-[480px]">
              
              {/* Left Navigation Sidebar */}
              <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#1C1917]/8 bg-[#F2EDE4] p-5 flex flex-col justify-between shrink-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#1C1917]/10">
                    <span className="text-xl">🍞</span>
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#1C1917] leading-tight flex items-center gap-1.5">
                        <span>Meja Perjamuan</span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      </h4>
                      <p className="text-[11px] text-[#78716C]">Rangkuman &amp; Santapan Hayat</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <button
                      onClick={() => setActiveTab('fkkp')}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between gap-2 ${
                        activeTab === 'fkkp'
                          ? 'bg-[#3B4B34] text-[#F4EFE6] shadow-sm translate-x-1'
                          : 'text-[#57534E] hover:bg-[#1C1917]/5'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Sunrise className="w-4 h-4 text-amber-300 shrink-0" />
                        <span className="truncate">FKKP Rangkuman</span>
                      </span>
                      <span className="text-[10px] shrink-0 font-medium px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30 whitespace-nowrap">
                        Hari Ini
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('alkitab')}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between ${
                        activeTab === 'alkitab'
                          ? 'bg-[#3B4B34] text-[#F4EFE6] shadow-sm translate-x-1'
                          : 'text-[#57534E] hover:bg-[#1C1917]/5'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-amber-300" />
                        <span>Alkitab Pemulihan</span>
                      </span>
                      <span className="text-[10px] opacity-70">66 Kitab</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('karakter')}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between ${
                        activeTab === 'karakter'
                          ? 'bg-[#3B4B34] text-[#F4EFE6] shadow-sm translate-x-1'
                          : 'text-[#57534E] hover:bg-[#1C1917]/5'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-amber-300" />
                        <span>Buku Karakter</span>
                      </span>
                      <span className="flex items-center gap-1 text-[10px] opacity-80">
                        <span>30 Butir</span>
                        <span className="text-[9px] font-bold text-amber-300 bg-amber-400/20 px-1 py-0.2 rounded">🔒 Premium</span>
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('pembinaan')}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between ${
                        activeTab === 'pembinaan'
                          ? 'bg-[#3B4B34] text-[#F4EFE6] shadow-sm translate-x-1'
                          : 'text-[#57534E] hover:bg-[#1C1917]/5'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Pembinaan Dasar</span>
                      </span>
                      <span className="flex items-center gap-1 text-[10px] opacity-80">
                        <span>46 Pelajaran</span>
                        <span className="text-[9px] font-bold text-amber-300 bg-amber-400/20 px-1 py-0.2 rounded">🔒 Premium</span>
                      </span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1C1917]/8">
                  <p className="text-[11px] text-[#78716C] italic leading-tight">
                    "Manusia hidup bukan dari roti saja, tetapi dari setiap firman yang keluar dari mulut Allah."
                  </p>
                  <p className="text-[10px] font-bold text-[#3B4B34] mt-1">— Matius 4:4</p>
                </div>
              </aside>

              {/* Main Preview Screen */}
              <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
                
                {/* Header in Preview */}
                <div className="flex items-center justify-between pb-4 border-b border-[#1C1917]/8">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#B96A4A] bg-[#B96A4A]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                      <Sparkles className="w-3 h-3 text-[#B96A4A]" />
                      {activeTab === 'fkkp' ? 'FKKP Rangkuman Fajar (Bagi Nikmat Hari Ini)' : activeTab === 'alkitab' ? 'Wahyu Ilahi' : 'Pertumbuhan Rohani'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1917] mt-1.5 transition-all duration-300">
                      {activeTab === 'fkkp' && `Kaum Beriman: ${fkkpDay.badge} (Rangkuman Fajar)`}
                      {activeTab === 'alkitab' && 'Injil Yohanes: Firman yang Menjadi Daging'}
                      {activeTab === 'karakter' && 'Pembentukan Karakter yang Berguna bagi Tuhan'}
                      {activeTab === 'pembinaan' && '46 Pokok Pelajaran Bagi Kaum Beriman Baru'}
                    </h3>
                  </div>
                </div>

                {/* Content Box with AI Digest */}
                <div className="my-5 p-5 sm:p-6 rounded-2xl bg-white border border-[#1C1917]/8 shadow-sm space-y-4">
                  {activeTab === 'fkkp' ? (
                    <div className="space-y-3.5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-serif text-lg sm:text-xl italic text-[#1C1917] leading-relaxed">
                            "{fkkpDay.verse}"
                          </p>
                          <p className="text-xs font-bold text-[#8E9C75] mt-1">
                            {fkkpDay.verseRef}
                          </p>
                        </div>
                      </div>

                      {/* Summary Highlight */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 via-emerald-50/40 to-stone-50 border border-amber-200/60 text-xs leading-relaxed space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-900 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            Rangkuman Hayat ({fkkpDay.theme}):
                          </span>
                          <span className="text-[10px] text-stone-500">Disarikan dari Bahan FKKP Pagi</span>
                        </div>
                        <p className="text-stone-800 leading-relaxed">
                          {fkkpDay.summary}
                        </p>
                        <p className="text-[#3B4B34] font-medium italic pt-1 border-t border-amber-200/40">
                          Doa Serapan: "{fkkpDay.prayer}"
                        </p>
                      </div>
                    </div>
                  ) : activeTab === 'alkitab' ? (
                    <div className="space-y-3.5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-serif text-lg sm:text-xl italic text-[#1C1917] leading-relaxed">
                            "Pada mulanya adalah Firman; Firman itu bersama-sama dengan Allah dan Firman itu adalah Allah... Di dalam Dia ada hidup dan hidup itu adalah terang manusia."
                          </p>
                          <p className="text-xs font-bold text-blue-800 mt-1">
                            Yohanes 1:1, 4 • Alkitab Versi Pemulihan
                          </p>
                        </div>
                      </div>

                      {/* Alkitab Highlight Card */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-stone-50 border border-blue-200/60 text-xs leading-relaxed space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-950 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            Mutiara Catatan Kaki &amp; Garis Besar Pemulihan
                          </span>
                          <span className="text-[10px] text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full font-semibold">
                            66 Kitab PL &amp; PB
                          </span>
                        </div>
                        <p className="text-stone-800">
                          Alkitab Versi Pemulihan membuka misteri kebenaran tertinggi: Allah berproses melalui penjelmaan, penyaliban, dan kebangkitan untuk menjadi <strong>Roh yang memberi hayat</strong> ke dalam roh manusia. Dilengkapi catatan kaki teologis, referensi silang, dan garis besar kitab terlengkap.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-blue-200/50 text-[11px]">
                          <div className="bg-white/80 p-2 rounded-lg border border-blue-100">
                            <span className="font-bold text-blue-900 block">Yohanes 1:14</span>
                            <span className="text-stone-600">Firman menjadi daging, berkemah di antara kita.</span>
                          </div>
                          <div className="bg-white/80 p-2 rounded-lg border border-blue-100">
                            <span className="font-bold text-blue-900 block">1 Kor. 15:45b</span>
                            <span className="text-stone-600">Adam terakhir menjadi Roh yang memberi hayat.</span>
                          </div>
                          <div className="bg-white/80 p-2 rounded-lg border border-blue-100">
                            <span className="font-bold text-blue-900 block">Wahyu 22:1-2</span>
                            <span className="text-stone-600">Sungai air hayat mengalir dari takhta Allah &amp; Anak Domba.</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                          <span className="font-semibold text-stone-600">Pintasan Kitab:</span>
                          {['Kejadian', 'Mazmur', 'Matius', 'Yohanes', 'Roma', 'Efesus', 'Wahyu'].map((kitab) => (
                            <span key={kitab} className="bg-white px-2 py-0.5 rounded-md border border-stone-200 text-[#1C1917] font-medium shadow-2xs">
                              {kitab}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : activeTab === 'karakter' ? (
                    <div className="space-y-3.5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Compass className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-serif text-lg sm:text-xl italic text-[#1C1917] leading-relaxed">
                            "Karakter adalah gabungan antara tabiat alami yang telah didisiplin oleh Roh Kudus dengan kebiasaan rohani yang dibina secara konsisten."
                          </p>
                          <p className="text-xs font-bold text-amber-800 mt-1">
                            Witness Lee • Buku Karakter Seri 1: Benar
                          </p>
                        </div>
                      </div>

                      {/* Karakter Highlight Card */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 via-stone-50 to-emerald-50/40 border border-amber-200/60 text-xs leading-relaxed space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-950 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            30 Butir Karakter bagi Kegunaan Tuhan
                          </span>
                          <span className="text-[10px] text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full font-semibold">
                            30 Butir Lengkap
                          </span>
                        </div>
                        <p className="text-stone-800">
                          Hayat rohani memerlukan bejana yang terdidik. Karakter kita bagaikan pipa penyalur air: bila pipa bengkok, berkarat, atau tersumbat, aliran hayat Kristus terhalang keluar kepada sesama. Pembinaan 30 butir karakter melatih kita menjadi wadah yang mulia dan berguna bagi Tuhan.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-amber-200/50 text-[11px]">
                          <div className="bg-white/80 p-2 rounded-lg border border-amber-100/80">
                            <span className="font-bold text-amber-950 block">1. Benar &amp; Lurus</span>
                            <span className="text-stone-600">Tidak berbelit-belit dan tulus di hadapan Allah.</span>
                          </div>
                          <div className="bg-white/80 p-2 rounded-lg border border-amber-100/80">
                            <span className="font-bold text-amber-950 block">2. Tepat &amp; Akurat</span>
                            <span className="text-stone-600">Tepat waktu, janji, dan perkataan.</span>
                          </div>
                          <div className="bg-white/80 p-2 rounded-lg border border-amber-100/80">
                            <span className="font-bold text-amber-950 block">3. Ketat &amp; Disiplin</span>
                            <span className="text-stone-600">Ketat terhadap diri sendiri, lapang bagi sesama.</span>
                          </div>
                          <div className="bg-white/80 p-2 rounded-lg border border-amber-100/80">
                            <span className="font-bold text-amber-950 block">4. Rajin &amp; Ulet</span>
                            <span className="text-stone-600">Tidak bermalas-malasan merebut kesempatan.</span>
                          </div>
                          <div className="bg-white/80 p-2 rounded-lg border border-amber-100/80">
                            <span className="font-bold text-amber-950 block">5. Cepat &amp; Sigap</span>
                            <span className="text-stone-600">Sigap menaati pimpinan Roh Kudus.</span>
                          </div>
                          <div className="bg-white/80 p-2 rounded-lg border border-amber-100/80">
                            <span className="font-bold text-amber-950 block">6. Tenang &amp; Berakar</span>
                            <span className="text-stone-600">Tetap tenang dan bersandar dalam hadirat Tuhan.</span>
                          </div>
                        </div>
                        <p className="text-[#3B4B34] font-medium italic pt-1 border-t border-amber-200/40 text-[11px]">
                          Latihan Hari Ini: "Mempraktikkan ketepatan waktu dalam persekutuan doa dan ketepatan berbicara sesuai fakta."
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-serif text-lg sm:text-xl italic text-[#1C1917] leading-relaxed">
                            "Bila seseorang baru diselamatkan, hal pertama yang harus dibangun bukanlah pengetahuan teologis, melainkan kebiasaan bangun pagi bersekutu dengan Tuhan."
                          </p>
                          <p className="text-xs font-bold text-emerald-800 mt-1">
                            Watchman Nee • Pembinaan Dasar Pelajaran 46
                          </p>
                        </div>
                      </div>

                      {/* Pembinaan Dasar Highlight Card */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-stone-50 border border-emerald-200/60 text-xs leading-relaxed space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                            Pondasi Kokoh Kaum Beriman Baru
                          </span>
                          <span className="text-[10px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full font-semibold">
                            46 Pelajaran Pokok
                          </span>
                        </div>
                        <p className="text-stone-800">
                          Koleksi 46 pelajaran penting karya Watchman Nee yang membimbing orang percaya sejak awal keselamatan, bagaimana bersekutu dengan Tuhan setiap pagi, membaca Alkitab, mengaku dosa, melayani dalam gereja, hingga hidup berserah penuh kepada Kristus.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-emerald-200/50 text-[11px]">
                          <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                            <span className="font-bold text-emerald-900 block">Pelajaran 1–10: Awal Hayat</span>
                            <span className="text-stone-600">Kepastian Keselamatan, Baptisan, Bangun Pagi, Membaca Alkitab.</span>
                          </div>
                          <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                            <span className="font-bold text-emerald-900 block">Pelajaran 11–25: Pembersihan</span>
                            <span className="text-stone-600">Mengaku Dosa, Ganti Rugi, Bersaksi, Memutuskan Masa Lalu.</span>
                          </div>
                          <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                            <span className="font-bold text-emerald-900 block">Pelajaran 26–46: Pelayanan</span>
                            <span className="text-stone-600">Perjamuan Tuhan, Menyerahkan Diri, Melayani dalam Sidang Jemaat.</span>
                          </div>
                        </div>
                        <p className="text-[#3B4B34] font-medium italic pt-1 border-t border-emerald-200/40 text-[11px]">
                          Langkah Hari Ini: "Mulai hari dengan doa fajar 10 menit sebelum menyentuh pekerjaan atau gawai."
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ===================== TESTIMONI & BAGI NIKMAT YANG GONTA-GANTI ===================== */}
        <div id="testimoni" className="relative mt-16 max-w-[1140px] mx-auto px-4 sm:px-8 space-y-10 scroll-mt-24">
          
          {/* 1. BAGI NIKMAT SINGKAT YANG BERGANTI-GANTI (ROTATING LIVE TICKER) */}
          <div className="rounded-[28px] p-5 sm:p-7 bg-white/80 backdrop-blur-md border border-[#1C1917]/10 shadow-lg reveal-item relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1C1917]/8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-800 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-[#1C1917] flex items-center gap-2">
                    <span>Bagi Nikmat Hari Ini</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  </h4>
                  <p className="text-[11px] text-[#78716C]">Kenikmatan singkat pembaca yang berganti-ganti secara langsung</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setIsShareModalOpen(true)}
                  className="rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-white h-8 px-4 shadow-sm btn-lift gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>Bagi Nikmat Saya</span>
                </Button>
              </div>
            </div>

            {/* Rotating Enjoyment Display Card */}
            <div className="my-5 p-5 rounded-2xl bg-[#F7F4ED] border border-[#1C1917]/8 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-500">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#3B4B34] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {activeEnjoyment.name?.charAt(0) || 'P'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#1C1917]">
                      {activeEnjoyment.name}
                    </span>
                    <span className="text-[11px] text-[#78716C] bg-white px-2 py-0.5 rounded-full border border-[#1C1917]/10">
                      {activeEnjoyment.city}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {activeEnjoyment.time}
                    </span>
                  </div>
                  <p className="font-serif text-base text-[#1C1917] italic mt-1 leading-snug">
                    "{activeEnjoyment.text}"
                  </p>
                </div>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => setCurrentEnjoymentIndex((prev) => (prev - 1 + enjoyments.length) % enjoyments.length)}
                  className="w-7 h-7 rounded-full bg-white border border-[#1C1917]/15 flex items-center justify-center text-[#1C1917] hover:bg-stone-100 transition shadow-xs"
                  title="Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {enjoyments.slice(0, 5).map((_, idx) => (
                    <span
                      key={idx}
                      onClick={() => setCurrentEnjoymentIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === currentEnjoymentIndex % 5 ? 'w-5 bg-[#3B4B34]' : 'w-1.5 bg-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setCurrentEnjoymentIndex((prev) => (prev + 1) % enjoyments.length)}
                  className="w-7 h-7 rounded-full bg-white border border-[#1C1917]/15 flex items-center justify-center text-[#1C1917] hover:bg-stone-100 transition shadow-xs"
                  title="Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick ticker of names and short enjoyments */}
            <div className="pt-2 text-xs text-[#78716C] flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[#1C1917]">Nikmat Terkini:</span>
              {enjoyments.slice(0, 3).map((item) => (
                <span key={item.id} className="inline-flex items-center gap-1 bg-[#FBF9F5] px-2.5 py-1 rounded-full border border-[#1C1917]/8 text-[11px]">
                  <strong className="text-[#3B4B34]">{item.name} ({item.city}):</strong> 
                  <span className="truncate max-w-[200px] text-stone-700 italic">"{item.text}"</span>
                </span>
              ))}
            </div>
          </div>

          {/* 2. TESTIMONI PEMBACA LENGKAP DENGAN FOTO */}
          <div className="space-y-6 text-center reveal-item">
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-widest uppercase text-[#8E9C75]">Kesaksian Hayat</span>
              <h3 className="text-2xl sm:text-4xl font-serif font-bold text-[#1C1917]">
                Testimoni Para Pembaca Firman
              </h3>
              <p className="text-xs sm:text-sm text-[#78716C] max-w-xl mx-auto">
                Pengalaman nyata menikmati doa-makan harian, kemudahan membaca firman dan khazanah rohani kapan saja.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-left pt-2">
              {INITIAL_TESTIMONIALS.map((testi) => (
                <Card 
                  key={testi.id}
                  className="rounded-[24px] p-5 bg-white border border-[#1C1917]/10 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Rating Stars */}
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(testi.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>

                    <p className="font-serif italic text-xs sm:text-[13px] text-[#1C1917] leading-relaxed">
                      "{testi.text}"
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#1C1917]/8 flex items-center gap-3">
                    <img 
                      src={testi.photo} 
                      alt={testi.name} 
                      className="w-10 h-10 rounded-full object-cover border border-[#1C1917]/10 shadow-xs" 
                    />
                    <div>
                      <h5 className="font-bold text-xs text-[#1C1917]">{testi.name}</h5>
                      <p className="text-[10px] text-[#78716C]">{testi.role}</p>
                    </div>
                  </div>
                </Card>
              ))}
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

      {/* ===================== 4 PILAR SANTAPAN ===================== */}
      <section id="pilar" className="relative z-10 py-20 sm:py-28 bg-[#EDE7DC] scroll-mt-24">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 text-center space-y-4">
          
          <div className="reveal-item space-y-3">
            <span className="text-xs font-bold tracking-widest uppercase text-[#8E9C75]">Katalog Terpadu</span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#1C1917] tracking-tight">
              Empat Hidangan Santapan Rohani
            </h2>
            <p className="max-w-xl mx-auto text-sm sm:text-base text-[#57534E] leading-relaxed">
              Disediakan khusus untuk menolong setiap orang beriman bertumbuh dalam hayat, mengenal kebenaran murni, dan melayani Tuhan.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            
            {/* Card 1: FKKP */}
            <Card className="rounded-[28px] p-6 bg-[#F7F4ED] border border-[#1C1917]/10 hover:border-[#8E9C75] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between reveal-item btn-lift">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center text-xl shadow-md mb-5 float-y">
                  🌅
                </div>
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 border-amber-300">
                  Santapan Harian
                </Badge>
                <h3 className="text-lg font-serif font-bold text-[#1C1917] mt-3">
                  FKKP: Kebangunan Pagi
                </h3>
                <p className="text-xs text-[#57534E] mt-2 leading-relaxed">
                  Panduan doa-makan firman harian (Senin–Sabtu). Dilengkapi ayat kunci dan santapan pagi untuk menyegarkan roh saat bangun fajar.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1C1917]/8 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#8E9C75]">Mode Gulir Otomatis</span>
                <Button 
                  size="sm" 
                  onClick={onEnterLibrary} 
                  className="rounded-full text-xs font-bold bg-[#3B4B34] text-white hover:bg-[#20251A] h-8 px-3 btn-lift"
                >
                  Buka FKKP
                </Button>
              </div>
            </Card>

            {/* Card 2: Alkitab Versi Pemulihan */}
            <Card className="relative overflow-hidden rounded-[28px] p-6 bg-[#F7F4ED] border border-amber-600/30 hover:border-amber-600 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between reveal-item btn-lift bible-glow-card">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-amber-400/20 via-orange-300/10 to-transparent rounded-full blur-2xl pointer-events-none divine-ray" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-700 to-[#3B4B34] text-white flex items-center justify-center text-xl shadow-md">
                    📖
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/90 border border-amber-300/60 px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" /> 66 Kitab
                  </span>
                </div>

                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-[#3B4B34] bg-[#8E9C75]/20 border-[#8E9C75]/40">
                  Firman Murni &amp; Hayat
                </Badge>
                
                <h3 className="text-lg font-serif font-bold text-[#1C1917] mt-3 hover:text-amber-800 transition-colors">
                  Alkitab Versi Pemulihan
                </h3>
                <p className="text-xs text-[#57534E] mt-2 leading-relaxed">
                  66 Kitab Perjanjian Lama &amp; Perjanjian Baru lengkap catatan kaki rohani, garis besar kitab, dan penanda ayat emas yang hidup.
                </p>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-[#1C1917]/8 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-800">Kejadian – Wahyu</span>
                <Button 
                  size="sm" 
                  onClick={onOpenBible} 
                  className="rounded-full text-xs font-bold bg-[#1C1917] text-white hover:bg-[#3B4B34] h-8 px-3 btn-lift"
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1 text-amber-300" />
                  Baca Alkitab
                </Button>
              </div>
            </Card>

            {/* Card 3: Pembinaan Dasar */}
            <Card className="rounded-[28px] p-6 bg-[#F7F4ED] border border-[#1C1917]/10 hover:border-[#B96A4A] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between reveal-item btn-lift">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-800 text-white flex items-center justify-center text-xl shadow-md mb-5 float-y">
                  🌱
                </div>
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border-emerald-300">
                  Fondasi Iman
                </Badge>
                <h3 className="text-lg font-serif font-bold text-[#1C1917] mt-3">
                  Pembinaan Dasar (46 Topik)
                </h3>
                <p className="text-xs text-[#57534E] mt-2 leading-relaxed">
                  Karya Watchman Nee untuk meletakkan dasar hidup beriman: doa, baptisan, membaca Alkitab, memecahkan roti, dan persekutuan Tubuh.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1C1917]/8 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-700">Pilih Pelajaran</span>
                <Button 
                  size="sm" 
                  onClick={onEnterLibrary} 
                  className="rounded-full text-xs font-bold bg-[#3B4B34] text-white hover:bg-[#20251A] h-8 px-3 btn-lift"
                >
                  Pilih Topik
                </Button>
              </div>
            </Card>

            {/* Card 4: Buku Karakter */}
            <Card className="rounded-[28px] p-6 bg-[#F7F4ED] border border-[#1C1917]/10 hover:border-blue-500 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between reveal-item btn-lift">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-900 text-white flex items-center justify-center text-xl shadow-md mb-5 float-y">
                  💎
                </div>
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 border-blue-300">
                  Bejana Mulia
                </Badge>
                <h3 className="text-lg font-serif font-bold text-[#1C1917] mt-3">
                  Buku Karakter (30 Seri)
                </h3>
                <p className="text-xs text-[#57534E] mt-2 leading-relaxed">
                  Karya Witness Lee mengenai 30 butir karakter manusia: Benar, Tepat, Ketat, Rajin, Lapang, Cermat, dll. Membentuk bejana yang pas bagi Tuhan.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1C1917]/8 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-blue-700">30 Butir Seri</span>
                <Button 
                  size="sm" 
                  onClick={onEnterLibrary} 
                  className="rounded-full text-xs font-bold bg-[#1C1917] text-white hover:bg-[#3B4B34] h-8 px-3 btn-lift"
                >
                  Pilih Seri
                </Button>
              </div>
            </Card>

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
            Tersedia paket Standart (Gratis), Premium, dan Ultimate untuk mendukung pertumbuhan rohani harian Anda.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={onOpenBible}
              className="w-full sm:w-auto rounded-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-8 py-6 shadow-xl text-sm btn-lift"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Buka Alkitab Versi Pemulihan
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
            <span>• Pusat Pembacaan Firman &amp; Perpustakaan Hayat Digital</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={onOpenBible} className="hover:text-[#1C1917] transition-colors">Alkitab (66 Kitab)</button>
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

    </div>
  );
}
