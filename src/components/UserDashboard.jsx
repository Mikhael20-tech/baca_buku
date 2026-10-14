import React, { useState } from 'react';
import { 
  BookOpen, Flame, Sparkles, CheckCircle2, Utensils, 
  Smartphone, RefreshCw, Send, ArrowRight, Bookmark, 
  Heart, Sun, Sunrise, Play, BookMarked, ShieldCheck,
  ChevronRight, ExternalLink, User, Settings, Phone,
  Mail, MapPin, Camera, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
];

export default function UserDashboard({ 
  user, 
  onUpdateProfile,
  plan, 
  onOpenPricing, 
  onOpenBook, 
  onOpenBible,
  onEnterLibrary,
  enjoyments,
  onAddEnjoyment,
  initialTab = 'santapan'
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'santapan' | 'profile' | 'stores'

  // Profile Edit State
  const [fullName, setFullName] = useState(user?.full_name || 'Budi Pembaca');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '0812-3456-7890');
  const [email, setEmail] = useState(user?.email || 'baca@perpustakaan.cloud');
  const [distrikLokal, setDistrikLokal] = useState(user?.distrik_lokal || 'Surabaya - Rungkut');
  const [photoUrl, setPhotoUrl] = useState(
    user?.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  );
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Bagi Nikmat State
  const [enjoymentInput, setEnjoymentInput] = useState('');
  const [submittedFeedback, setSubmittedFeedback] = useState(false);

  // Simpan Perubahan Profil Pengguna
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedProfile = {
      ...user,
      full_name: fullName.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      distrik_lokal: distrikLokal.trim(),
      photo_url: photoUrl.trim()
    };
    if (typeof onUpdateProfile === 'function') {
      onUpdateProfile(updatedProfile);
    }
    setProfileSavedMsg(true);
    setTimeout(() => setProfileSavedMsg(false), 3500);
  };

  // Submit Bagi Nikmat Harian
  const handleSubmitEnjoyment = (e) => {
    e.preventDefault();
    if (!enjoymentInput.trim()) return;
    onAddEnjoyment({
      name: fullName || user?.full_name || 'Pembaca Hayat',
      city: distrikLokal || 'Indonesia',
      text: enjoymentInput
    });
    setEnjoymentInput('');
    setSubmittedFeedback(true);
    setTimeout(() => setSubmittedFeedback(false), 3000);
  };

  const planBadgeColor = {
    standart: 'bg-stone-200 text-stone-800 border-stone-300',
    premium: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    ultimate: 'bg-amber-100 text-amber-900 border-amber-300'
  }[plan?.tier || 'premium'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner: User Profile Overview & Quick Stats */}
      <div className="relative overflow-hidden rounded-[32px] p-6 sm:p-8 text-[#F4EFE6] border border-white/10 shadow-2xl" style={{ background: 'linear-gradient(135deg, #1C2317 0%, #293322 55%, #151A11 100%)' }}>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              <img 
                src={photoUrl} 
                alt={fullName} 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#8E9C75]/40 shadow-lg"
              />
              <button 
                onClick={() => setActiveTab('profile')}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#8E9C75] text-[#1C1917] flex items-center justify-center shadow-md hover:bg-white transition"
                title="Ganti Foto Profil"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-[#8E9C75]/25 text-[#8E9C75] border border-[#8E9C75]/40">
                  Dashboard Pembaca
                </span>
                <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider ${planBadgeColor}`}>
                  Paket {plan?.tier ? plan.tier.toUpperCase() : 'PREMIUM'}
                </Badge>
                <span className="text-[11px] text-[#A8A29E] flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Streak 14 Hari
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl font-serif font-bold text-[#F4EFE6]">
                {fullName || 'Saudara Pembaca'}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#A8A29E]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-300" />
                  {distrikLokal || 'Belum diatur'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {whatsapp || '-'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-300" />
                  {email || '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setActiveTab('profile')}
              variant="outline"
              className="rounded-full text-xs font-bold border-white/20 text-white hover:bg-white/10 bg-white/5 btn-lift gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              Pengaturan Profil
            </Button>

            <Button
              onClick={onOpenPricing}
              className="rounded-full text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 px-5 shadow-lg btn-lift gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Kelola Paket
            </Button>
          </div>
        </div>

        {/* Tab Switcher Horizontal Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('santapan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'santapan' 
                ? 'bg-white text-[#1C1917] shadow-md' 
                : 'text-stone-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Santapan &amp; Bagi Nikmat</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'profile' 
                ? 'bg-white text-[#1C1917] shadow-md' 
                : 'text-stone-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4 text-[#3B4B34]" />
            <span>Pengaturan Akun &amp; Profil</span>
          </button>

          <button
            onClick={() => setActiveTab('stores')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'stores' 
                ? 'bg-white text-[#1C1917] shadow-md' 
                : 'text-stone-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-4 h-4 text-blue-400" />
            <span>Sinkron Google &amp; Apple Books</span>
          </button>
        </div>

        {/* Notifikasi Pengingat Cara B: Lengkapi Profil Nanti di Pengaturan */}
        {(!whatsapp || whatsapp === '-' || !distrikLokal || distrikLokal === 'Belum diatur') && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-400/15 border border-amber-300/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Profil belum lengkap:</strong> Nomor WhatsApp dan Distrik - Lokal Anda belum diisi.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-[11px] whitespace-nowrap self-start sm:self-auto transition shadow-xs"
            >
              Lengkapi di Pengaturan Profil &rarr;
            </button>
          </div>
        )}
      </div>

      {/* ======================= TAB 1: SANTAPAN & BAGI NIKMAT ======================= */}
      {activeTab === 'santapan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          
          {/* Kolom Kiri: Terang dan Inspirasi FKKP Hari Ini */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-[28px] p-6 sm:p-7 bg-white border border-[#1C1917]/10 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-[#1C1917]/8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <Badge variant="outline" className="text-[9px] uppercase font-bold text-amber-800 bg-amber-100 border-amber-300">
                      FKKP Harian
                    </Badge>
                    <h3 className="font-serif font-bold text-lg text-[#1C1917] mt-0.5">
                      Terang dan Inspirasi Hari Ini
                    </h3>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-[#8E9C75]">Minggu 1 • Hari Ini</span>
              </div>

              {/* Reading Verse & Thought */}
              <div className="my-5 p-5 rounded-2xl bg-[#FBF9F5] border border-[#1C1917]/8 space-y-3">
                <p className="font-serif text-base sm:text-lg italic text-[#1C1917] leading-relaxed">
                  "Sama seperti Bapa yang hidup mengutus Aku dan Aku hidup oleh Bapa, demikian juga barangsiapa yang memakan Aku, ia pun akan hidup oleh Aku."
                </p>
                <p className="text-xs font-bold text-[#8E9C75]">
                  Yohanes 6:57 • Tema Santapan FKKP
                </p>
                <div className="pt-2 text-xs text-[#57534E] leading-relaxed border-t border-[#1C1917]/5">
                  <span className="font-bold text-[#1C1917]">Pancaran Terang:</span> Tuhan Yesus tidak memanggil kita sekadar menjadi pengagum ajaran-Nya, melainkan menjadi penikmat hidup-Nya. Saat kita memakan firman melalui doa-makan di awal fajar, zat hayat ilahi itu membaur ke dalam batin kita.
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Button
                  size="sm"
                  onClick={() => onOpenBook({
                    id: 'fkkp-kebangunan-pagi-m1',
                    title: 'FKKP: Menikmati Kristus sebagai Hayat (Minggu 1)',
                    author: 'Yasperin / Living Stream Ministry',
                    file_path: '/books/fkkp-kebangunan-pagi-minggu-1.epub',
                    cover_icon: '🌅'
                  })}
                  className="rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-white btn-lift"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  Mulai Doa-Makan FKKP
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenBible}
                  className="rounded-full text-xs font-bold border-[#1C1917]/20 text-[#1C1917] hover:bg-[#1C1917]/5"
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1 text-[#3B4B34]" />
                  Buka Alkitab Pemulihan
                </Button>
              </div>
            </div>

            {/* Rak Bacaan Cepat */}
            <div className="rounded-[28px] p-6 bg-white border border-[#1C1917]/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#1C1917] flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-[#3B4B34]" />
                  Lanjutkan Pembacaan Anda
                </h3>
                <button 
                  onClick={onEnterLibrary}
                  className="text-xs font-bold text-[#8E9C75] hover:text-[#3B4B34] flex items-center gap-1"
                >
                  Lihat Semua Katalog <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div 
                  onClick={() => onOpenBook({
                    id: 'buku-karakter-wl',
                    title: 'Buku Karakter: 30 Butir',
                    author: 'Witness Lee',
                    has_series: true
                  })}
                  className="p-4 rounded-2xl bg-[#F7F4ED] hover:bg-[#EAE3D5] border border-[#1C1917]/8 transition cursor-pointer flex items-center gap-3.5 group btn-lift"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-sm">
                    💎
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xs text-[#1C1917] group-hover:text-[#3B4B34]">
                      30 Butir Karakter
                    </h4>
                    <p className="text-[10px] text-[#78716C]">Seri 1 s/d 30 • Witness Lee</p>
                  </div>
                </div>

                <div 
                  onClick={() => onOpenBook({
                    id: 'pembinaan-dasar-wn',
                    title: 'Pembinaan Dasar: 46 Pelajaran',
                    author: 'Watchman Nee',
                    has_series: true
                  })}
                  className="p-4 rounded-2xl bg-[#F7F4ED] hover:bg-[#EAE3D5] border border-[#1C1917]/8 transition cursor-pointer flex items-center gap-3.5 group btn-lift"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-lg shadow-sm">
                    🌱
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xs text-[#1C1917] group-hover:text-[#3B4B34]">
                      Pembinaan Dasar
                    </h4>
                    <p className="text-[10px] text-[#78716C]">46 Pokok Pelajaran • Watchman Nee</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Tempat Bagi Nikmat Pembacaan di Hari Itu */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-[28px] p-6 sm:p-7 bg-white border border-[#1C1917]/10 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#1C1917]/8">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-800 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1C1917]">
                    Tempat Bagi Nikmat Hari Ini
                  </h3>
                  <p className="text-[11px] text-[#78716C]">Bagikan kenikmatan firman singkat Anda</p>
                </div>
              </div>

              {submittedFeedback && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Puji Tuhan! Kenikmatan Anda telah dibagikan ke komunitas pembaca.</span>
                </div>
              )}

              <form onSubmit={handleSubmitEnjoyment} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-[#1C1917] block mb-1">
                    Nama Anda
                  </label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Samuel"
                    className="rounded-xl text-xs h-9 bg-[#FBF9F5]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#1C1917] block mb-1">
                    Distrik - Lokal / Kota
                  </label>
                  <Input
                    type="text"
                    value={distrikLokal}
                    onChange={(e) => setDistrikLokal(e.target.value)}
                    placeholder="Contoh: Surabaya - Rungkut"
                    className="rounded-xl text-xs h-9 bg-[#FBF9F5]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#1C1917] block mb-1">
                    Bagi Nikmat Hari Ini (Singkat &amp; Padat)
                  </label>
                  <Textarea
                    value={enjoymentInput}
                    onChange={(e) => setEnjoymentInput(e.target.value)}
                    placeholder="Bagikan 1-2 kalimat kenikmatan firman yang Anda kecap hari ini..."
                    className="rounded-xl text-xs min-h-[90px] bg-[#FBF9F5]"
                    required
                  />
                  <p className="text-[10px] text-[#78716C] mt-1 italic">
                    *Cukup singkat saja agar mudah dinikmati sesama pembaca.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-white shadow-sm btn-lift gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirimkan Bagi Nikmat Saya</span>
                </Button>
              </form>

              {/* List Kenikmatan Terkini Komunitas */}
              <div className="pt-4 border-t border-[#1C1917]/8 space-y-2.5">
                <span className="text-[11px] font-bold text-[#78716C] block uppercase tracking-wider">
                  Bagi Nikmat Terbaru Kaum Beriman
                </span>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {enjoyments.slice(0, 4).map((item) => (
                    <div 
                      key={item.id} 
                      className="p-3 rounded-xl bg-[#F7F4ED] border border-[#1C1917]/5 text-xs space-y-1 hover:bg-[#FAF7F2] transition"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#1C1917]">{item.name} ({item.city})</span>
                        <span className="text-[10px] text-[#78716C]">{item.time}</span>
                      </div>
                      <p className="text-[#57534E] text-[11px] italic">"{item.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ======================= TAB 2: PENGATURAN PROFIL ======================= */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto rounded-[32px] p-6 sm:p-8 bg-white border border-[#1C1917]/10 shadow-lg space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 pb-4 border-b border-[#1C1917]/8">
            <div className="w-10 h-10 rounded-2xl bg-[#3B4B34] text-white flex items-center justify-center">
              <Settings className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-[#1C1917]">
                Pengaturan Profil Pembaca
              </h2>
              <p className="text-xs text-[#78716C]">
                Lengkapi identitas Anda untuk persekutuan dan catatan pembacaan rohani.
              </p>
            </div>
          </div>

          {profileSavedMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profil Anda berhasil diperbarui dan tersimpan!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Foto Profil & Avatar Presets */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#1C1917] block">
                Foto Profil Anda
              </label>
              <div className="flex items-center gap-4">
                <img 
                  src={photoUrl} 
                  alt="Preview" 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#3B4B34] shadow-sm"
                />
                <div className="flex-1 space-y-1">
                  <Input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="URL Foto (https://...)"
                    className="rounded-xl text-xs h-9 bg-[#FBF9F5]"
                  />
                  <p className="text-[10px] text-[#78716C]">
                    Masukkan link URL gambar atau pilih avatar yang tersedia di bawah:
                  </p>
                </div>
              </div>

              {/* Pilihan Avatar Siap Pakai */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-bold text-[#78716C]">Avatar Cepat:</span>
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhotoUrl(url)}
                    className={`w-8 h-8 rounded-xl overflow-hidden border-2 transition ${
                      photoUrl === url ? 'border-[#3B4B34] scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#3B4B34]" />
                  Nama Lengkap
                </label>
                <Input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Pembaca"
                  className="rounded-xl text-xs bg-[#FBF9F5]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  Nomor WhatsApp
                </label>
                <Input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Contoh: 0812-3456-7890"
                  className="rounded-xl text-xs bg-[#FBF9F5]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  Alamat Email
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="rounded-xl text-xs bg-[#FBF9F5]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-700" />
                  Distrik - Lokal
                </label>
                <Input
                  type="text"
                  value={distrikLokal}
                  onChange={(e) => setDistrikLokal(e.target.value)}
                  placeholder="Contoh: Surabaya - Rungkut"
                  className="rounded-xl text-xs bg-[#FBF9F5]"
                />
              </div>
            </div>

            {/* Info Langganan Aktif */}
            <div className="p-4 rounded-2xl bg-[#F7F4ED] border border-[#1C1917]/10 flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-[#1C1917]">Status Paket Langganan Saat Ini</p>
                <p className="text-[11px] text-[#78716C]">
                  Tier: <strong className="uppercase text-[#3B4B34]">{plan?.tier || 'PREMIUM'}</strong> • Berlaku hingga {plan?.expiresAt || '31 Des 2027'}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenPricing}
                className="text-xs rounded-full border-[#3B4B34]/30 text-[#3B4B34] font-bold"
              >
                Ganti Paket
              </Button>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setActiveTab('santapan')}
                className="text-xs rounded-full"
              >
                Kembali
              </Button>
              <Button
                type="submit"
                className="rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-white px-6 shadow-md btn-lift gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Pengaturan Profil</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ======================= TAB 3: PAKET & SINKRON TOKO ======================= */}
      {activeTab === 'stores' && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
          <div className="rounded-[32px] p-6 sm:p-8 bg-white border border-[#1C1917]/10 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1917]/8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1C1917]">
                    Sinkronisasi Toko Digital &amp; Bebas Beli Dua Kali
                  </h3>
                  <p className="text-xs text-[#78716C]">
                    Verifikasi pembelian buku dari Google Play Books dan Apple Books.
                  </p>
                </div>
              </div>

              <Badge variant="outline" className={`text-[10px] font-bold uppercase ${planBadgeColor}`}>
                {plan?.tier ? plan.tier.toUpperCase() : 'PREMIUM'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#F7F4ED] border border-[#1C1917]/8 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5 text-[#1C1917]">
                    <Smartphone className="w-4 h-4 text-emerald-700" />
                    Google Play Books
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 text-[10px]">Tersambung</Badge>
                </div>
                <p className="text-[11px] text-[#57534E]">
                  Akun: <strong>{user?.email || 'budi.pembaca@gmail.com'}</strong>
                </p>
                <p className="text-[10px] text-[#78716C]">
                  7 Buku telah terverifikasi secara otomatis tanpa biaya tambahan.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F7F4ED] border border-[#1C1917]/8 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5 text-[#1C1917]">
                    <Smartphone className="w-4 h-4 text-blue-700" />
                    Apple App Store / Books
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 text-[10px]">Tersambung</Badge>
                </div>
                <p className="text-[11px] text-[#57534E]">
                  Apple ID: <strong>{user?.email || 'budi.pembaca@icloud.com'}</strong>
                </p>
                <p className="text-[10px] text-[#78716C]">
                  7 Buku terverifikasi via StoreKit Receipt Sync.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                onClick={onOpenPricing}
                className="rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-white"
              >
                Lihat Opsi Paket Langganan Lengkap
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
