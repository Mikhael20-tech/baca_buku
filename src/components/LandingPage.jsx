import React from 'react';
import { 
  BookOpen, ShieldCheck, ArrowRight, Sparkles, Cloud, 
  Highlighter, Eye, HardDrive, CheckCircle2, Play
} from 'lucide-react';

export default function LandingPage({ onEnterLibrary, onOpenLogin, isSupabaseActive: _isSupabaseActive }) {
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
                  Cloud EPUB
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Web Reader & Admin Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onEnterLibrary}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              Lihat Katalog
            </button>
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/25 transition active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>Login Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col justify-center">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Pembaca Buku Digital & Sinkronisasi Cloud</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Membaca Karya Digital dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400">Elegan & Presisi</span>.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Aplikasi web pembaca berkas <b>.EPUB</b> dengan teknologi penyorotan teks cerdas, catatan pribadi, manajemen katalog buku, serta integrasi database cloud Supabase & offline IndexedDB.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-sm shadow-xl shadow-amber-500/25 transition transform hover:-translate-y-0.5 active:scale-95"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Masuk Sebagai Admin</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onEnterLibrary}
              className="flex items-center gap-2 px-6 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-bold rounded-2xl text-sm transition active:scale-95 backdrop-blur"
            >
              <Play className="w-4 h-4 fill-current text-amber-400" />
              <span>Buka Perpustakaan Sekarang</span>
            </button>
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
