import React from 'react';
import { 
  BookOpen, ShieldCheck, ArrowRight, Sparkles, Cloud, 
  Highlighter, Eye, HardDrive, CheckCircle2, Play
} from 'lucide-react';

export default function LandingPage({ onEnterLibrary, onOpenBible, onOpenLogin, isSupabaseActive: _isSupabaseActive }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Glow Orbs Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-white">Baca</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                  Digital Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Alkitab Versi Pemulihan &amp; Perpustakaan Buku</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenBible}
              className="px-3.5 py-2 text-xs font-bold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 rounded-xl transition border border-amber-500/20 flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Alkitab (66 Kitab)</span>
            </button>
            <button
              onClick={onEnterLibrary}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              Katalog Buku
            </button>
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/25 transition active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section dengan Dua Opsi Utama */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex flex-col justify-center space-y-12">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pusat Pembacaan Firman &amp; Buku Rohani</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Pilih Bahan Bacaan Anda Hari Ini.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Tersedia dua bagian utama yang terpisah: <b>Alkitab Versi Pemulihan</b> dengan navigasi per kitab, pasal, dan ayat, atau <b>Perpustakaan Buku</b> untuk membaca buku pembinaan, seri karakter, dan biografi iman.
          </p>
        </div>

        {/* 2 Big Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl">
          
          {/* Card 1: ALKITAB VERSI PEMULIHAN */}
          <div 
            onClick={onOpenBible}
            className="group relative bg-gradient-to-b from-slate-800/90 to-slate-900/90 hover:from-amber-950/40 hover:to-slate-900 border border-slate-700/80 hover:border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg text-2xl">
                  📖
                </div>
                <span className="text-[11px] font-bold px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30 uppercase tracking-wider">
                  66 Kitab Lengkap
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-amber-300 transition">
                  Alkitab Versi Pemulihan
                </h3>
                <p className="text-xs text-amber-200/70 font-medium mt-1">
                  Perjanjian Lama &amp; Perjanjian Baru (Kejadian sampai Wahyu)
                </p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Aplikasi pembacaan Alkitab terstruktur per <b>Kitab, Pasal, dan Ayat</b>. Dilengkapi garis besar ilahi (outlines), catatan kaki rohani, pengubah ukuran teks, tema malam/sepia, dan navigasi pasal yang cepat.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 group-hover:text-white transition">
                Kejadian • Mazmur • Injil • Surat • Wahyu
              </span>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md">
                <span>Buka Alkitab</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>

          {/* Card 2: PERPUSTAKAAN BUKU */}
          <div 
            onClick={onEnterLibrary}
            className="group relative bg-gradient-to-b from-slate-800/90 to-slate-900/90 hover:from-blue-950/40 hover:to-slate-900 border border-slate-700/80 hover:border-blue-500/60 rounded-3xl p-6 sm:p-8 shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-lg text-2xl">
                  📚
                </div>
                <span className="text-[11px] font-bold px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30 uppercase tracking-wider">
                  EPUB Reader &amp; Anotasi
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-blue-300 transition">
                  Perpustakaan Buku Rohani
                </h3>
                <p className="text-xs text-blue-200/70 font-medium mt-1">
                  Karya Watchman Nee, Witness Lee &amp; Literatur Pilihan
                </p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Koleksi buku digital dengan fitur <b>highlight / penandaan warna</b>, catatan pribadi, pemilih <b>Seri Buku Karakter (1 – 10)</b>, dan 46 Pelajaran Pembinaan Dasar Kaum Beriman.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 group-hover:text-white transition">
                Seri Karakter • Pembinaan Dasar • Martir &amp; Salib
              </span>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 group-hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition shadow-md">
                <span>Buka Katalog Buku</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>

        </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-400 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Penyorot Teks Bebas Bug</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Font Disleksia & Tema Sepia/Malam</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Penyimpanan Aman Supabase & Lokal</span>
            </div>
          </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-20">
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm space-y-3 hover:border-amber-500/40 transition group">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
              <Highlighter className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Highlight Presisi</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sorot kalimat dan kutipan buku multi-warna tanpa kotak berlebih pada jeda baris bait atau puisi.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm space-y-3 hover:border-amber-500/40 transition group">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Tipografi Ramah Mata</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ganti font (Merriweather, Literata, Inter, OpenDyslexic) dan beralih tema Terang, Sepia, atau Gelap.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm space-y-3 hover:border-amber-500/40 transition group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <Cloud className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Sinkronisasi Supabase</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Penyimpanan berkas buku privat dan database PostgreSQL untuk catatan dan progres membaca.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm space-y-3 hover:border-amber-500/40 transition group">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">IndexedDB Offline</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Buku yang Anda unggah otomatis tersimpan aman di browser Anda dan bisa dibaca kapan pun tanpa internet.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Baca - Cloud EPUB Reader & Annotation System</p>
      </footer>
    </div>
  );
}
