import React, { useState } from 'react';
import { 
  BookOpen, Flame, Sparkles, CheckCircle2, Utensils, 
  Smartphone, RefreshCw, Send, ArrowRight, Bookmark, 
  Heart, Sun, Sunrise, Play, BookMarked, ShieldCheck,
  ChevronRight, ExternalLink, User, Settings, Phone,
  Mail, MapPin, Camera, Save, Highlighter, Trash2,
  Edit3, Plus, Search, Check, Clock, AlertCircle, FileCheck, Lock,
  Upload, Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { getStoredNotes, saveStoredNotes, addNote, deleteNote } from '../lib/notesStorage';
import { getCurrentFkkpDay } from '../lib/fkkpSchedule';

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
  initialTab = 'santapan',
  books = []
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'santapan' | 'notes' | 'profile' | 'stores'

  // Profile Edit State
  const [fullName, setFullName] = useState(user?.full_name || 'Budi Pembaca');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '0812-3456-7890');
  const [email, setEmail] = useState(user?.email || 'baca@perpustakaan.cloud');
  const [distrikLokal, setDistrikLokal] = useState(user?.distrik_lokal || 'Surabaya - Rungkut');
  const [photoUrl, setPhotoUrl] = useState(() => {
    return user?.photo_url || localStorage.getItem('baca_user_avatar') || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
  });
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = React.useRef(null);

  // Unggah & kompresi foto profil lokal via Canvas (160x160 ~5KB)
  const handlePhotoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Harap pilih file gambar (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 10MB.');
      return;
    }

    setIsUploadingPhoto(true);
    setUploadError('');

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Buat thumbnail persegi 160x160 (kualitas 80% JPEG hanya ~5KB, tajam dan sangat ringan)
          const size = 160;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');

          // Crop center (square cover)
          const minSide = Math.min(img.width, img.height);
          const startX = (img.width - minSide) / 2;
          const startY = (img.height - minSide) / 2;

          ctx.drawImage(img, startX, startY, minSide, minSide, 0, 0, size, size);

          // Konversi ke JPEG base64 berkualitas tinggi tapi hemat ruang (~5KB)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.80);
          setPhotoUrl(compressedDataUrl);
          try {
            localStorage.setItem('baca_user_avatar', compressedDataUrl);
          } catch (storageErr) {}
          setIsUploadingPhoto(false);
        };
        img.onerror = () => {
          setUploadError('Gagal memproses gambar.');
          setIsUploadingPhoto(false);
        };
        img.src = event.target.result;
      };
      reader.onerror = () => {
        setUploadError('Gagal membaca berkas gambar.');
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error handling photo file:', err);
      setUploadError('Terjadi kesalahan saat mengunggah foto.');
      setIsUploadingPhoto(false);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Bagi Nikmat State
  const [enjoymentInput, setEnjoymentInput] = useState('');
  const [submittedFeedback, setSubmittedFeedback] = useState(false);

  // Notes & Highlights State
  const [userNotes, setUserNotes] = useState(getStoredNotes());
  const [noteSearch, setNoteSearch] = useState('');

  // Dynamic FKKP Schedule State
  const [fkkpDay, setFkkpDay] = useState(getCurrentFkkpDay());

  React.useEffect(() => {
    const handleUpdate = () => {
      setFkkpDay(getCurrentFkkpDay());
    };
    window.addEventListener('fkkp_settings_updated', handleUpdate);
    return () => window.removeEventListener('fkkp_settings_updated', handleUpdate);
  }, []);

  React.useEffect(() => {
    if (user?.full_name) setFullName(user.full_name);
    if (user?.whatsapp) setWhatsapp(user.whatsapp);
    if (user?.email) setEmail(user.email);
    if (user?.distrik_lokal) setDistrikLokal(user.distrik_lokal);
    const customAvatar = localStorage.getItem('baca_user_avatar');
    if (customAvatar) {
      setPhotoUrl(customAvatar);
    } else if (user?.photo_url) {
      setPhotoUrl(user.photo_url);
    }
  }, [user]);

  const [noteColorFilter, setNoteColorFilter] = useState('all');
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [newNoteBook, setNewNoteBook] = useState('Alkitab Versi Pemulihan');
  const [newNoteRef, setNewNoteRef] = useState('');
  const [newNoteHighlight, setNewNoteHighlight] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteColor, setNewNoteColor] = useState('amber');

  // Simpan Perubahan Profil Pengguna
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const finalPhoto = photoUrl.trim() || localStorage.getItem('baca_user_avatar') || '';
    const updatedProfile = {
      ...user,
      full_name: fullName.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      distrik_lokal: distrikLokal.trim(),
      photo_url: finalPhoto
    };
    try {
      if (finalPhoto) localStorage.setItem('baca_user_avatar', finalPhoto);
    } catch (err) {}
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
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'notes' 
                ? 'bg-white text-[#1C1917] shadow-md' 
                : 'text-stone-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Highlighter className="w-4 h-4 text-amber-400" />
            <span>Catatan &amp; Sorotan Firman</span>
            {userNotes.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold ml-1">
                {userNotes.length}
              </span>
            )}
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

                <span className="text-[11px] font-semibold text-[#8E9C75]">{fkkpDay.badge}</span>
              </div>

              {/* Reading Verse & Thought */}
              <div className="my-5 p-5 rounded-2xl bg-[#FBF9F5] border border-[#1C1917]/8 space-y-3">
                <p className="font-serif text-base sm:text-lg italic text-[#1C1917] leading-relaxed">
                  "{fkkpDay.verse}"
                </p>
                <p className="text-xs font-bold text-[#8E9C75]">
                  {fkkpDay.verseRef}
                </p>
                <div className="pt-2 text-xs text-[#57534E] leading-relaxed border-t border-[#1C1917]/5">
                  <span className="font-bold text-[#1C1917]">Pancaran Terang ({fkkpDay.theme}):</span> {fkkpDay.summary}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Button
                  size="sm"
                  onClick={() => {
                    const fkkpBook = books.find(b => b.title?.toLowerCase().includes('fkkp')) || {
                      id: '4e109d2d-08d5-4d3e-8c12-5a79a9f3e472',
                      title: `FKKP Kaum Beriman (${fkkpDay.badge})`,
                      author: 'Living Stream Ministry / Yasperin',
                      file_path: 'epubs/1792029937814-693nqm.epub',
                      cover_url: '/covers/fkkp-kaum-beriman.png',
                      cover_icon: '🌅'
                    };
                    onOpenBook({
                      ...fkkpBook,
                      initialLocation: fkkpDay.initialLocation
                    });
                  }}
                  className="rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-white btn-lift"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  Mulai Doa-Makan {fkkpDay.badge}
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
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-serif font-bold text-xs text-[#1C1917] group-hover:text-[#3B4B34]">
                        30 Butir Karakter
                      </h4>
                      {(plan?.tier || 'standart') === 'standart' && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded-full inline-flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> Premium
                        </span>
                      )}
                    </div>
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
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-serif font-bold text-xs text-[#1C1917] group-hover:text-[#3B4B34]">
                        Pembinaan Dasar
                      </h4>
                      {(plan?.tier || 'standart') === 'standart' && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded-full inline-flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> Premium
                        </span>
                      )}
                    </div>
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

      {/* ======================= TAB: CATATAN & SOROTAN FIRMAN ======================= */}
      {activeTab === 'notes' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header & Actions Bar */}
          <div className="rounded-[28px] p-6 bg-white border border-[#1C1917]/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                  <Highlighter className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#1C1917]">
                  Catatan &amp; Sorotan Firman Pribadi
                </h3>
              </div>
              <p className="text-xs text-[#78716C] mt-1">
                Koleksi mutiara sabda, rhema dan catatan doa yang Anda simpan saat membaca Alkitab dan buku pelayanan.
              </p>
            </div>

            <Button
              onClick={() => setIsAddNoteModalOpen(true)}
              className="rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-white shadow-md btn-lift gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Sorotan &amp; Catatan</span>
            </Button>
          </div>

          {/* Search & Color Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Cari ayat, kitab, atau isi catatan..."
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                className="pl-9 rounded-2xl text-xs bg-white border-[#1C1917]/10"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Semua Warna' },
                { id: 'amber', label: 'Emas Hayat', color: 'bg-amber-400' },
                { id: 'emerald', label: 'Hijau Doa', color: 'bg-emerald-500' },
                { id: 'blue', label: 'Biru Kebenaran', color: 'bg-blue-500' },
                { id: 'purple', label: 'Ungu Rohani', color: 'bg-purple-500' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setNoteColorFilter(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    noteColorFilter === c.id
                      ? 'bg-[#1C1917] text-white shadow-xs'
                      : 'bg-white text-[#78716C] hover:text-[#1C1917] border border-[#1C1917]/8'
                  }`}
                >
                  {c.color && <span className={`w-2 h-2 rounded-full ${c.color}`} />}
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes Grid Display */}
          {userNotes.filter((n) => {
            const matchSearch =
              n.book_title.toLowerCase().includes(noteSearch.toLowerCase()) ||
              n.reference.toLowerCase().includes(noteSearch.toLowerCase()) ||
              n.highlighted_text.toLowerCase().includes(noteSearch.toLowerCase()) ||
              n.note.toLowerCase().includes(noteSearch.toLowerCase());
            const matchColor = noteColorFilter === 'all' || n.color === noteColorFilter;
            return matchSearch && matchColor;
          }).length === 0 ? (
            <div className="rounded-[28px] p-10 bg-white border border-[#1C1917]/10 text-center space-y-3">
              <Highlighter className="w-8 h-8 text-amber-500/50 mx-auto" />
              <p className="font-bold text-sm text-[#1C1917]">Belum ada catatan atau sorotan yang cocok</p>
              <p className="text-xs text-[#78716C] max-w-sm mx-auto">
                Tandai ayat indah saat Anda membaca firman atau klik "Tambah Sorotan" untuk menuliskan rhema baru.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddNoteModalOpen(true)}
                className="rounded-full text-xs font-bold mt-2"
              >
                Tulis Catatan Sekarang
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userNotes
                .filter((n) => {
                  const matchSearch =
                    n.book_title.toLowerCase().includes(noteSearch.toLowerCase()) ||
                    n.reference.toLowerCase().includes(noteSearch.toLowerCase()) ||
                    n.highlighted_text.toLowerCase().includes(noteSearch.toLowerCase()) ||
                    n.note.toLowerCase().includes(noteSearch.toLowerCase());
                  const matchColor = noteColorFilter === 'all' || n.color === noteColorFilter;
                  return matchSearch && matchColor;
                })
                .map((item) => {
                  const colorConfig = {
                    amber: { border: 'border-l-amber-400', bg: 'bg-amber-50/70', badge: 'bg-amber-100 text-amber-900 border-amber-300' },
                    emerald: { border: 'border-l-emerald-500', bg: 'bg-emerald-50/70', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
                    blue: { border: 'border-l-blue-500', bg: 'bg-blue-50/70', badge: 'bg-blue-100 text-blue-900 border-blue-300' },
                    purple: { border: 'border-l-purple-500', bg: 'bg-purple-50/70', badge: 'bg-purple-100 text-purple-900 border-purple-300' }
                  }[item.color || 'amber'];

                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl p-5 bg-white border border-[#1C1917]/10 border-l-4 ${colorConfig.border} shadow-sm space-y-3.5 flex flex-col justify-between hover:shadow-md transition`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="outline" className={`text-[10px] font-bold ${colorConfig.badge}`}>
                            {item.reference}
                          </Badge>
                          <span className="text-[10px] text-[#78716C]">{item.book_title}</span>
                        </div>

                        {item.highlighted_text && (
                          <div className={`p-3 rounded-xl ${colorConfig.bg} border border-[#1C1917]/5`}>
                            <p className="font-serif italic text-xs text-[#1C1917] leading-relaxed">
                              "{item.highlighted_text}"
                            </p>
                          </div>
                        )}

                        {item.note && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-[#8E9C75] uppercase tracking-wider block">
                              Catatan &amp; Refleksi:
                            </span>
                            <p className="text-xs text-[#57534E] leading-relaxed">
                              {item.note}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#1C1917]/5 flex items-center justify-between text-[10px] text-[#78716C]">
                        <span>Dibuat: {item.created_at}</span>
                        <button
                          onClick={() => {
                            if (window.confirm('Hapus catatan ini?')) {
                              const updated = deleteNote(item.id);
                              setUserNotes(updated);
                            }
                          }}
                          className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Dialog Tambah Catatan Baru */}
          <Dialog open={isAddNoteModalOpen} onOpenChange={setIsAddNoteModalOpen}>
            <DialogContent className="sm:max-w-md rounded-3xl bg-[#FAF8F5] border border-[#1C1917]/15">
              <DialogHeader>
                <DialogTitle className="font-serif font-bold text-lg text-[#1C1917] flex items-center gap-2">
                  <Highlighter className="w-4 h-4 text-amber-600" />
                  Tambah Catatan &amp; Sorotan Baru
                </DialogTitle>
                <DialogDescription className="text-xs text-[#78716C]">
                  Tuliskan ayat firman atau kalimat buku yang Anda nikmati beserta perenungan batin Anda.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newNoteRef.trim() || !newNoteContent.trim()) {
                    alert('Mohon isi referensi ayat/kitab dan catatan refleksi.');
                    return;
                  }
                  const updated = addNote({
                    book_title: newNoteBook,
                    reference: newNoteRef,
                    highlighted_text: newNoteHighlight,
                    note: newNoteContent,
                    color: newNoteColor
                  });
                  setUserNotes(updated);
                  setIsAddNoteModalOpen(false);
                  setNewNoteRef('');
                  setNewNoteHighlight('');
                  setNewNoteContent('');
                }}
                className="space-y-3.5 py-2"
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1917]">Buku / Sumber Pelayanan:</label>
                  <Input
                    value={newNoteBook}
                    onChange={(e) => setNewNoteBook(e.target.value)}
                    placeholder="Contoh: Injil Yohanes atau Buku Karakter"
                    className="rounded-xl text-xs bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1917]">Ayat / Bab / Referensi:</label>
                  <Input
                    required
                    value={newNoteRef}
                    onChange={(e) => setNewNoteRef(e.target.value)}
                    placeholder="Contoh: Yohanes 1:14 atau Seri 1: Benar"
                    className="rounded-xl text-xs bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1917]">Teks Ayat / Kalimat Disorot:</label>
                  <Textarea
                    rows={2}
                    value={newNoteHighlight}
                    onChange={(e) => setNewNoteHighlight(e.target.value)}
                    placeholder="Kutipan ayat atau kalimat yang menyentuh hati..."
                    className="rounded-xl text-xs bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1917]">Catatan Refleksi &amp; Rhema Doa:</label>
                  <Textarea
                    required
                    rows={3}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Apa yang Roh Kudus bicarakan ke dalam batin Anda hari ini..."
                    className="rounded-xl text-xs bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1C1917] block">Pilihan Warna Sorotan:</label>
                  <div className="flex items-center gap-3">
                    {[
                      { id: 'amber', name: 'Amber (Emas)', class: 'bg-amber-400' },
                      { id: 'emerald', name: 'Emerald (Hayat)', class: 'bg-emerald-500' },
                      { id: 'blue', name: 'Biru (Kebenaran)', class: 'bg-blue-500' },
                      { id: 'purple', name: 'Ungu (Mulia)', class: 'bg-purple-500' }
                    ].map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setNewNoteColor(col.id)}
                        className={`w-7 h-7 rounded-full ${col.class} flex items-center justify-center transition shadow-xs ${
                          newNoteColor === col.id ? 'ring-2 ring-offset-2 ring-[#1C1917]' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={col.name}
                      >
                        {newNoteColor === col.id && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsAddNoteModalOpen(false)}
                    className="rounded-full text-xs"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-white px-5 shadow-sm btn-lift"
                  >
                    Simpan Catatan
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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

              {/* Hidden File Input untuk memilih file dari komputer / HP */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoFileUpload}
              />

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-[#FBF9F5] border border-[#1C1917]/10">
                {/* Avatar Preview dengan Clickable Overlay Kamera */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group w-20 h-20 rounded-2xl overflow-hidden cursor-pointer border-2 border-[#3B4B34] shadow-sm shrink-0 bg-stone-200"
                  title="Klik untuk memilih foto dari galeri / perangkat"
                >
                  <img 
                    src={photoUrl} 
                    alt="Preview Foto Profil" 
                    className="w-full h-full object-cover transition duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition duration-200">
                    <Camera className="w-5 h-5 mb-0.5 text-amber-200" />
                    <span className="text-[10px] font-bold">Ubah Foto</span>
                  </div>
                </div>

                {/* Tombol Aksi Upload & URL */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="rounded-xl text-xs font-bold bg-[#3B4B34] hover:bg-[#2C3827] text-[#F4EFE6] h-9 px-3.5 shadow-sm flex items-center gap-1.5 btn-lift"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-200" />
                      <span>{isUploadingPhoto ? 'Memproses Foto...' : 'Upload Foto dari Galeri / Kamera'}</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="rounded-xl text-xs font-bold border-[#1C1917]/15 bg-white hover:bg-stone-50 text-[#1C1917] h-9 px-3 shadow-xs flex items-center gap-1.5"
                    >
                      <LinkIcon className="w-3.5 h-3.5 text-stone-500" />
                      <span>{showUrlInput ? 'Tutup URL' : 'Gunakan Link URL'}</span>
                    </Button>

                    {photoUrl !== PRESET_AVATARS[0] && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => { 
                          setPhotoUrl(PRESET_AVATARS[0]); 
                          setUploadError(''); 
                          try { localStorage.removeItem('baca_user_avatar'); } catch (e) {}
                        }}
                        className="rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-9 px-2.5 flex items-center gap-1"
                        title="Kembalikan ke avatar default"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reset</span>
                      </Button>
                    )}
                  </div>

                  {uploadError && (
                    <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {uploadError}
                    </p>
                  )}

                  {showUrlInput ? (
                    <div className="space-y-1 pt-1 animate-in fade-in duration-150">
                      <Input
                        type="url"
                        value={photoUrl.startsWith('data:') ? '' : photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="Tempel tautan URL gambar (https://...)"
                        className="rounded-xl text-xs h-8 bg-white border-[#1C1917]/15"
                      />
                    </div>
                  ) : (
                    <p className="text-[10px] text-[#78716C]">
                      Pilih foto langsung dari HP / Laptop Anda (JPG, PNG, WebP) atau pilih Avatar Cepat di bawah.
                    </p>
                  )}
                </div>
              </div>

              {/* Pilihan Avatar Siap Pakai */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-bold text-[#78716C]">Avatar Cepat:</span>
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setPhotoUrl(url); setUploadError(''); }}
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

    </div>
  );
}
