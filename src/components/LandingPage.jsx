import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, ShieldCheck, ArrowRight, Sparkles, 
  ChevronRight, Heart, Flame, Sun, Sunrise, Compass,
  CheckCircle2, Utensils, MessageSquare, Quote, Layers,
  ChevronDown, BookMarked, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

// Animated Words component for staggered reveal effect from web-model
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
              // ease-out cubic curve (from web-model)
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

export default function LandingPage({ onEnterLibrary, onOpenBible, onOpenLogin, isLoggedIn, user, onLogout }) {
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('fkkp');

  // Reveal-on-scroll observer from web-model
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

  const faqs = [
    {
      q: 'Apakah istilah "Makan Tuhan" benar-benar Alkitabiah?',
      a: 'Sangat Alkitabiah. Dalam Injil Yohanes 6:57, Tuhan Yesus sendiri bersabda: "Sama seperti Bapa yang hidup mengutus Aku dan Aku hidup oleh Bapa, demikian juga barangsiapa yang memakan Aku, ia pun akan hidup oleh Aku." Tuhan Yesus memperkenalkan diri-Nya bukan sebagai filsafat untuk dipelajari di otak, melainkan sebagai Roti Hayat (Yohanes 6:35) dan Air Hayat (Yohanes 4:14) yang harus kita nikmati dan telan ke dalam batin roh kita.'
    },
    {
      q: 'Bagaimana cara kita "memakan" Tuhan secara praktis hari ini?',
      a: 'Dalam Yohanes 6:63 Tuhan berkata: "Perkataan-perkataan yang Kukatakan kepadamu adalah roh dan hidup." Firman Tuhan adalah makanan itu sendiri. Yeremia 15:16 bersaksi: "Apabila aku bertemu dengan perkataan-perkataan-Mu, aku memakannya; perkataan-perkataan-Mu itu menjadi kegirangan bagiku." Cara memakannya adalah melalui Doa-Makan (Pray-reading)—mengambil ayat firman kudus dan menjadikannya bahan doa, memperkatakannya dengan roh, memuji, bersyukur, dan menyerap hayat ilahi di dalamnya.'
    },
    {
      q: 'Apa itu FKKP (Firman Kudus untuk Kebangunan Pagi)?',
      a: 'FKKP adalah panduan santapan firman harian dari Senin hingga Sabtu. Setiap hari menyediakan ayat-ayat doa-makan pagi dan uraian kebenaran untuk menyegarkan roh, memulihkan persekutuan dengan Kristus di waktu subuh, dan memperlengkapi kaum beriman hidup berkemenangan sepanjang hari.'
    },
    {
      q: 'Apa keistimewaan Alkitab Versi Pemulihan (Recovery Version) di website ini?',
      a: 'Alkitab Versi Pemulihan dilengkapi dengan terjemahan yang akurat sesuai naskah asli Yunani & Ibrani, catatan kaki rohani yang menyingkapkan Kristus dan Tubuh-Nya, garis besar historis dan doktrinal, serta referensi silang yang membawa pembaca dari huruf mati kepada roh dan hayat.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1C1917] flex flex-col font-sans selection:bg-[#B96A4A]/25 selection:text-[#3B4B34] transition-colors duration-300 relative overflow-x-hidden">
      
      {/* Floating Ambient Glow Atmospheric Orbs (Living Breathing Background) */}
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

          {/* Navigation Links (Clean Non-Wrapping) */}
          <nav className="hidden xl:flex items-center gap-6 text-xs font-semibold text-[#78716C] shrink-0">
            <a href="#santapan" className="whitespace-nowrap hover:text-[#1C1917] transition-colors">Meja Santapan</a>
            <a href="#pilar" className="whitespace-nowrap hover:text-[#1C1917] transition-colors">4 Pilar Makanan</a>
            <a href="#langkah" className="whitespace-nowrap hover:text-[#1C1917] transition-colors">Cara Makan Firman</a>
            <a href="#kebenaran" className="whitespace-nowrap hover:text-[#1C1917] transition-colors">Kebenaran Alkitab</a>
            <a href="#faq" className="whitespace-nowrap hover:text-[#1C1917] transition-colors">Tanya Jawab</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenBible}
              className="rounded-full text-xs font-bold border-[#3B4B34]/30 text-[#3B4B34] hover:bg-[#3B4B34]/10 bg-white/70 h-9 px-3.5 shadow-xs btn-lift whitespace-nowrap"
              title="Buka 66 Kitab Alkitab Versi Pemulihan"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1.5 text-[#3B4B34]" />
              <span>Baca Alkitab</span>
            </Button>

            <Button
              size="sm"
              onClick={onEnterLibrary}
              className="rounded-full text-xs font-bold bg-[#1C1917] hover:bg-[#3B4B34] text-[#F4EFE6] h-9 px-4 shadow-md btn-lift whitespace-nowrap"
            >
              <span>Katalog Buku</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>

            {/* Auth Button: Masuk / Daftar vs Profile */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2 bg-white/80 px-3 py-1 rounded-full border border-[#1C1917]/10 text-xs shadow-xs">
                <span className="font-semibold text-[#1C1917] text-[11px] max-w-[110px] truncate">
                  {user?.full_name || user?.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="h-6 px-2 text-[10px] rounded-full text-[#78716C] hover:text-[#1C1917]"
                >
                  Keluar
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={onOpenLogin}
                className="rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-[#F4EFE6] h-9 px-4 shadow-sm btn-lift whitespace-nowrap"
              >
                <span>Masuk / Daftar</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-14 sm:pb-20 overflow-hidden text-center">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8">
          
          {/* Eyebrow Badge with animation */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8E9C75]/20 border border-[#8E9C75]/40 text-[#3B4B34] text-xs font-bold tracking-wider uppercase mb-7 shadow-xs w-anim" style={{ animationDelay: '100ms' }}>
            <Flame className="w-3.5 h-3.5 text-[#B96A4A] animate-pulse" />
            <span>Pusat Doa-Makan Firman &amp; Santapan Hayat Rohani</span>
          </div>

          {/* Majestic Hero Headline with Word-by-Word Staggered Blur Reveal */}
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
            Bukan sekadar membaca huruf sebagai pengetahuan luar di pikiran, melainkan menyerap Kristus ke dalam batin roh kita melalui <span className="font-semibold text-[#1C1917]">doa-makan firman harian</span>, Firman Kudus untuk Kebangunan Pagi (FKKP), dan kekayaan Alkitab Versi Pemulihan.
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

        {/* ===================== INTERACTIVE WORKSPACE PREVIEW (Meja Santapan) ===================== */}
        <div id="santapan" className="relative mt-14 sm:mt-20 max-w-[1140px] mx-auto px-4 sm:px-8 reveal-item">
          


          <div className="rounded-[32px] p-2.5 sm:p-4 bg-white/60 backdrop-blur-xl border border-white/80 shadow-2xl shadow-[#1C1917]/10 transition-all duration-500 hover:shadow-3xl">
            <div className="rounded-[24px] overflow-hidden bg-[#FAF7F2] border border-[#1C1917]/8 flex flex-col md:flex-row text-left min-h-[460px]">
              
              {/* Left Navigation Sidebar */}
              <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#1C1917]/8 bg-[#F2EDE4] p-5 flex flex-col justify-between shrink-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#1C1917]/10">
                    <span className="text-xl">🍞</span>
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#1C1917] leading-tight">Meja Perjamuan</h4>
                      <p className="text-[11px] text-[#78716C]">Pilih santapan rohani hari ini</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <button
                      onClick={() => setActiveTab('fkkp')}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between ${
                        activeTab === 'fkkp'
                          ? 'bg-[#3B4B34] text-[#F4EFE6] shadow-sm translate-x-1'
                          : 'text-[#57534E] hover:bg-[#1C1917]/5'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Sunrise className="w-4 h-4 text-amber-300" />
                        <span>FKKP Pagi Hari</span>
                      </span>
                      <Badge variant="outline" className="text-[9px] border-amber-300/40 text-inherit">Minggu 1</Badge>
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
                      <span className="text-[10px] opacity-70">30 Butir</span>
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
                      <span className="text-[10px] opacity-70">46 Pelajaran</span>
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
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#B96A4A] bg-[#B96A4A]/10 px-2.5 py-0.5 rounded-full">
                      {activeTab === 'fkkp' ? 'Doa-Makan Pagi' : activeTab === 'alkitab' ? 'Wahyu Ilahi' : 'Pertumbuhan Rohani'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1917] mt-1.5 transition-all duration-300">
                      {activeTab === 'fkkp' && 'Menikmati Kristus sebagai Hayat Sejati'}
                      {activeTab === 'alkitab' && 'Injil Yohanes: Firman yang Menjadi Daging'}
                      {activeTab === 'karakter' && 'Pembentukan Karakter yang Berguna bagi Tuhan'}
                      {activeTab === 'pembinaan' && '46 Pokok Pelajaran Bagi Kaum Beriman Baru'}
                    </h3>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      if (!isLoggedIn) {
                        onOpenLogin();
                      } else {
                        if (activeTab === 'alkitab') {
                          onOpenBible();
                        } else {
                          onEnterLibrary();
                        }
                      }
                    }}
                    className="rounded-full text-xs font-bold bg-[#3B4B34] text-[#F4EFE6] hover:bg-[#20251A] btn-lift"
                  >
                    Buka Langsung <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>

                {/* Content Box */}
                <div className="my-6 p-6 rounded-2xl bg-white border border-[#1C1917]/8 shadow-sm space-y-4 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <Quote className="w-8 h-8 text-[#8E9C75] shrink-0 opacity-60" />
                    <div>
                      <p className="font-serif text-lg sm:text-xl text-[#1C1917] italic leading-relaxed">
                        {activeTab === 'fkkp' && '"Sama seperti Bapa yang hidup mengutus Aku dan Aku hidup oleh Bapa, demikian juga barangsiapa yang memakan Aku, ia pun akan hidup oleh Aku."'}
                        {activeTab === 'alkitab' && '"Pada mulanya adalah Firman; Firman itu bersama-sama dengan Allah dan Firman itu adalah Allah... Di dalam Dia ada hidup dan hidup itu adalah terang manusia."'}
                        {activeTab === 'karakter' && '"Karakter adalah gabungan antara tabiat alami yang telah didisiplin oleh Roh Kudus dengan kebiasaan rohani yang dibina secara konsisten."'}
                        {activeTab === 'pembinaan' && '"Bila seseorang baru diselamatkan, hal pertama yang harus dibangun bukanlah pengetahuan teologis, melainkan kebiasaan bangun pagi bersekutu dengan Tuhan."'}
                      </p>
                      <p className="text-xs font-bold text-[#8E9C75] mt-2">
                        {activeTab === 'fkkp' && 'Yohanes 6:57 • Tema Santapan FKKP Minggu 1'}
                        {activeTab === 'alkitab' && 'Yohanes 1:1, 4 • Alkitab Versi Pemulihan'}
                        {activeTab === 'karakter' && 'Witness Lee • Buku Karakter Seri 1: Benar'}
                        {activeTab === 'pembinaan' && 'Watchman Nee • Pembinaan Dasar Pelajaran 46'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F7F4ED] border border-[#1C1917]/5 text-xs text-[#57534E] leading-relaxed">
                    <span className="font-bold text-[#1C1917]">Cara Doa-Makan:</span> Ambillah firman di atas, perkatakan kalimat demi kalimat dengan doa: <span className="italic text-[#3B4B34]">"Tuhan Yesus, terima kasih Engkau telah datang! Aku ingin memakan Engkau! Engkaulah makananku hari ini!"</span>
                  </div>
                </div>



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

      {/* ===================== 4 PILAR SANTAPAN ===================== */}
      <section id="pilar" className="relative z-10 py-20 sm:py-28 bg-[#EDE7DC]">
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
            <Card className="rounded-[28px] p-6 bg-[#F7F4ED] border border-[#1C1917]/10 hover:border-[#3B4B34] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between reveal-item btn-lift">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#3B4B34] to-[#8E9C75] text-white flex items-center justify-center text-xl shadow-md mb-5 float-y">
                  📖
                </div>
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-[#3B4B34] bg-[#8E9C75]/20 border-[#8E9C75]/40">
                  Firman Murni
                </Badge>
                <h3 className="text-lg font-serif font-bold text-[#1C1917] mt-3">
                  Alkitab Versi Pemulihan
                </h3>
                <p className="text-xs text-[#57534E] mt-2 leading-relaxed">
                  66 Kitab Perjanjian Lama &amp; Perjanjian Baru dilengkapi ribuan catatan kaki teologis rohani, garis besar kitab, dan penanda ayat emas.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1C1917]/8 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#3B4B34]">Kejadian – Wahyu</span>
                <Button 
                  size="sm" 
                  onClick={onOpenBible} 
                  className="rounded-full text-xs font-bold bg-[#1C1917] text-white hover:bg-[#3B4B34] h-8 px-3 btn-lift"
                >
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
                Firman yang dimakan akan terserap menjadi unsur hayat kita. Sepanjang hari, firman itu akan membimbing tutur kata, menjaga hati nurani, dan memampukan kita hidup berkemenangan oleh hayat Kristus.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ===================== KUTIPAN SAKSI IMAN ===================== */}
      <section className="relative z-10 py-16 bg-[#EDE7DC] border-y border-[#1C1917]/8">
        <div className="max-w-[1000px] mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-7 rounded-3xl bg-[#F4EFE6] border border-[#1C1917]/8 shadow-sm flex flex-col justify-between reveal-item btn-lift hover:shadow-xl transition-all duration-300">
              <p className="font-serif italic text-base text-[#1C1917] leading-relaxed">
                "Kekristenan sejati bukanlah serangkaian aturan moral yang kaku, melainkan Kristus Sendiri yang masuk ke dalam batin manusia sebagai makanan dan hayat untuk dihidupkan keluar."
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#3B4B34] text-white flex items-center justify-center font-serif font-bold text-sm">
                  WN
                </div>
                <div>
                  <h5 className="font-bold text-xs text-[#1C1917]">Watchman Nee</h5>
                  <p className="text-[10px] text-[#78716C]">Hamba Kristus &amp; Pengarang Pembinaan Kaum Beriman</p>
                </div>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-[#F4EFE6] border border-[#1C1917]/8 shadow-sm flex flex-col justify-between reveal-item btn-lift hover:shadow-xl transition-all duration-300">
              <p className="font-serif italic text-base text-[#1C1917] leading-relaxed">
                "Bila Anda membaca Alkitab hanya dengan akal budi, Anda hanya mendapatkan huruf mati. Namun bila Anda datang dengan roh dan doa, setiap perkataan Alkitab menjadi santapan rohani yang memuaskan."
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#B96A4A] text-white flex items-center justify-center font-serif font-bold text-sm">
                  WL
                </div>
                <div>
                  <h5 className="font-bold text-xs text-[#1C1917]">Witness Lee</h5>
                  <p className="text-[10px] text-[#78716C]">Pelayan Firman &amp; Penerjemah Alkitab Versi Pemulihan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FAQ ACCORDION ===================== */}
      <section id="faq" className="relative z-10 py-20 sm:py-28 bg-[#F4EFE6]">
        <div className="max-w-[840px] mx-auto px-5 sm:px-8 space-y-4">
          <div className="text-center space-y-2 mb-10 reveal-item">
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
            Mulailah hari ini dengan membaca firman yang murni, menumbuhkan karakter manusia yang berbobot, dan menikmati santapan fajar doa-makan.
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
              onClick={onEnterLibrary}
              className="w-full sm:w-auto rounded-full border-white/20 text-white hover:bg-white/10 bg-white/5 font-bold px-8 py-6 text-sm btn-lift"
            >
              Katalog Buku Lengkap
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
            <button onClick={onOpenLogin} className="hover:text-[#1C1917] transition-colors">Admin Portal</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
