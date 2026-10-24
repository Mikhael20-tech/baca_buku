import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, UploadCloud, Database, Smartphone, 
  Trash2, Play, RefreshCw, CheckCircle2, AlertTriangle, 
  Sparkles, Layers, BookOpen, Users, DollarSign, Settings,
  Eye, Check, Pin, X, Plus, Edit2, Search, Filter, Phone,
  Mail, MapPin, UserCheck, UserX, Camera, Clock, FileCheck,
  Calendar, Sun, Flame, RotateCcw, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  getStoredUsers, 
  saveStoredUsers, 
  addUser, 
  updateUser, 
  deleteUser 
} from '../lib/userManagement';
import {
  getFkkpSettings,
  saveFkkpSettings,
  getCurrentFkkpDay,
  getDefaultFkkpDay,
  calculateFkkpWeek,
  DAY_NAMES,
  getCalendarDayIndex
} from '../lib/fkkpSchedule';

export default function AdminDashboard({ 
  books, 
  onOpenUpload, 
  onDeleteBook, 
  onOpenBook,
  enjoyments,
  onDeleteEnjoyment,
  onTogglePinEnjoyment,
  aiSummary,
  onUpdateAiSummary,
  initialTab = 'books',
  showToast
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'books' | 'users' | 'community' | 'ai'
  
  // Modal Konfirmasi Hapus Kustom (Admin)
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null, // 'book' | 'user' | 'enjoyment'
    id: null,
    headline: '',
    title: '',
    subtitle: '',
    detail: '',
    icon: null,
    avatar: null,
    badgeText: '',
    warningText: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [adminNotice, setAdminNotice] = useState(null); // { type: 'success' | 'error', message: string }

  // AI Summary State
  const [editedAiSummary, setEditedAiSummary] = useState(aiSummary || '');
  const [aiSavedNotice, setAiSavedNotice] = useState(false);

  // FKKP Schedule State & Controls
  const [fkkpSettings, setFkkpSettings] = useState(getFkkpSettings());
  const [selectedPreviewDay, setSelectedPreviewDay] = useState(() => {
    return fkkpSettings.mode === 'manual' ? fkkpSettings.manualDay : getCalendarDayIndex();
  });
  const [fkkpNotice, setFkkpNotice] = useState(null);

  const currentFkkpLive = getCurrentFkkpDay(fkkpSettings);

  // Day data for currently selected tab in editor
  const previewDayData = useMemo(() => {
    const activeWeek = fkkpSettings.mode === 'auto'
      ? calculateFkkpWeek(fkkpSettings.startDate)
      : (fkkpSettings.currentWeek || 3);
    const defaultData = getDefaultFkkpDay(activeWeek, selectedPreviewDay);
    const key = `w${activeWeek}d${selectedPreviewDay}`;
    const override = fkkpSettings.customOverrides?.[key] || {};
    return {
      verse: override.verse !== undefined ? override.verse : defaultData.verse,
      verseRef: override.verseRef !== undefined ? override.verseRef : defaultData.verseRef,
      theme: override.theme !== undefined ? override.theme : defaultData.theme,
      summary: override.summary !== undefined ? override.summary : defaultData.summary,
      prayer: override.prayer !== undefined ? override.prayer : defaultData.prayer,
      file: defaultData.file,
      anchor: defaultData.anchor,
      isOverridden: !!fkkpSettings.customOverrides?.[key]
    };
  }, [fkkpSettings, selectedPreviewDay]);

  const [formVerse, setFormVerse] = useState(previewDayData.verse);
  const [formVerseRef, setFormVerseRef] = useState(previewDayData.verseRef);
  const [formTheme, setFormTheme] = useState(previewDayData.theme);
  const [formSummary, setFormSummary] = useState(previewDayData.summary);
  const [formPrayer, setFormPrayer] = useState(previewDayData.prayer);

  // Sync edit form when selected day changes or week changes
  useEffect(() => {
    setFormVerse(previewDayData.verse);
    setFormVerseRef(previewDayData.verseRef);
    setFormTheme(previewDayData.theme);
    setFormSummary(previewDayData.summary);
    setFormPrayer(previewDayData.prayer);
  }, [previewDayData, selectedPreviewDay]);

  const handleSaveFkkpSettings = (newSettings, updatedDayFields = null) => {
    let toSave = { ...newSettings };
    if (updatedDayFields) {
      const activeWeek = toSave.mode === 'auto'
        ? calculateFkkpWeek(toSave.startDate)
        : (toSave.currentWeek || 3);
      const key = `w${activeWeek}d${selectedPreviewDay}`;
      toSave.customOverrides = {
        ...(toSave.customOverrides || {}),
        [key]: updatedDayFields
      };
    }
    saveFkkpSettings(toSave);
    setFkkpSettings(toSave);
    setFkkpNotice({ type: 'success', text: 'Pengaturan jadwal & santapan FKKP berhasil disimpan dan langsung aktif!' });
    setTimeout(() => setFkkpNotice(null), 3500);
  };

  const handleResetDayDefault = () => {
    const activeWeek = fkkpSettings.mode === 'auto'
      ? calculateFkkpWeek(fkkpSettings.startDate)
      : (fkkpSettings.currentWeek || 3);
    const key = `w${activeWeek}d${selectedPreviewDay}`;
    const newOverrides = { ...(fkkpSettings.customOverrides || {}) };
    delete newOverrides[key];
    const newSettings = { ...fkkpSettings, customOverrides: newOverrides };
    saveFkkpSettings(newSettings);
    setFkkpSettings(newSettings);
    setFkkpNotice({ type: 'info', text: `Teks Hari ${selectedPreviewDay} dikembalikan ke isi asli buku FKKP.` });
    setTimeout(() => setFkkpNotice(null), 3000);
  };

  const handleTestInReader = () => {
    const fkkpBook = books.find(b => b.title?.toLowerCase().includes('fkkp')) || {
      id: '4e109d2d-08d5-4d3e-8c12-5a79a9f3e472',
      title: 'FKKP Kaum Beriman',
      file_path: 'epubs/1792029937814-693nqm.epub',
      cover_url: '/covers/fkkp-kaum-beriman.png'
    };
    onOpenBook({
      ...fkkpBook,
      initialLocation: currentFkkpLive.initialLocation
    });
  };

  // User Management State (CRUD)
  const [users, setUsers] = useState(getStoredUsers());
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userTierFilter, setUserTierFilter] = useState('all'); // 'all' | 'standart' | 'premium' | 'ultimate'
  
  // Modal State for User Create / Edit
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userFormName, setUserFormName] = useState('');
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormPassword, setUserFormPassword] = useState('123456');
  const [userFormWhatsapp, setUserFormWhatsapp] = useState('');
  const [userFormDistrikLokal, setUserFormDistrikLokal] = useState('');
  const [userFormPhotoUrl, setUserFormPhotoUrl] = useState('');
  const [userFormTier, setUserFormTier] = useState('premium');
  const [userFormStatus, setUserFormStatus] = useState('active');



  const handleSaveAi = () => {
    onUpdateAiSummary(editedAiSummary);
    setAiSavedNotice(true);
    setTimeout(() => setAiSavedNotice(false), 3000);
  };

  // Open Modal for Create
  const handleOpenCreateUser = () => {
    setEditingUserId(null);
    setUserFormName('');
    setUserFormEmail('');
    setUserFormPassword('123456');
    setUserFormWhatsapp('');
    setUserFormDistrikLokal('');
    setUserFormPhotoUrl('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
    setUserFormTier('premium');
    setUserFormStatus('active');
    setIsUserModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditUser = (user) => {
    setEditingUserId(user.id);
    setUserFormName(user.full_name || '');
    setUserFormEmail(user.email || '');
    setUserFormPassword(user.password || '123456');
    setUserFormWhatsapp(user.whatsapp || '');
    setUserFormDistrikLokal(user.distrik_lokal || '');
    setUserFormPhotoUrl(user.photo_url || '');
    setUserFormTier(user.plan_tier || 'standart');
    setUserFormStatus(user.status || 'active');
    setIsUserModalOpen(true);
  };

  // Submit User Create / Update
  const handleSaveUserForm = (e) => {
    e.preventDefault();
    if (editingUserId) {
      // Update
      const updated = updateUser(editingUserId, {
        full_name: userFormName.trim(),
        email: userFormEmail.trim(),
        password: userFormPassword.trim() || '123456',
        whatsapp: userFormWhatsapp.trim(),
        distrik_lokal: userFormDistrikLokal.trim(),
        photo_url: userFormPhotoUrl.trim(),
        plan_tier: userFormTier,
        status: userFormStatus
      });
      setUsers(updated);
    } else {
      // Create
      const updated = addUser({
        full_name: userFormName.trim(),
        email: userFormEmail.trim(),
        password: userFormPassword.trim() || '123456',
        whatsapp: userFormWhatsapp.trim(),
        distrik_lokal: userFormDistrikLokal.trim(),
        photo_url: userFormPhotoUrl.trim(),
        plan_tier: userFormTier,
        status: userFormStatus,
        google_play_synced: true,
        apple_books_synced: true
      });
      setUsers(updated);
    }
    setIsUserModalOpen(false);
  };

  // --- HANDLER MODAL KONFIRMASI HAPUS ADMIN ---
  const triggerDeleteBook = (book, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      type: 'book',
      id: book.id,
      headline: 'Hapus Buku dari Katalog?',
      title: book.title || 'Judul Buku',
      subtitle: `Penulis: ${book.author || 'Anonim'} • Kategori: ${book.category || 'Umum'}`,
      detail: null,
      icon: book.cover_icon || '📖',
      avatar: null,
      badgeText: 'Katalog Perpustakaan',
      warningText: 'Buku ini akan dicabut permanen dari perpustakaan publik, cache peramban, dan penyimpanan cloud.'
    });
  };

  const triggerDeleteUser = (user) => {
    setDeleteModal({
      isOpen: true,
      type: 'user',
      id: user.id,
      headline: 'Hapus Akun Pengguna?',
      title: user.full_name || 'Nama Pengguna',
      subtitle: `${user.email} • ${user.distrik_lokal || 'Distrik Belum Diatur'}`,
      detail: `Paket Langganan: ${(user.plan_tier || 'standart').toUpperCase()} • WhatsApp: ${user.whatsapp || '-'}`,
      icon: null,
      avatar: user.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      badgeText: `User: ${(user.plan_tier || 'standart').toUpperCase()}`,
      warningText: 'Seluruh akses akun pembaca ini akan dinonaktifkan dan dihapus permanen dari sistem perpustakaan.'
    });
  };

  const triggerDeleteEnjoyment = (item) => {
    setDeleteModal({
      isOpen: true,
      type: 'enjoyment',
      id: item.id,
      headline: 'Hapus Bagi Nikmat?',
      title: `Bagi Nikmat: ${item.name}`,
      subtitle: `Asal Kota: ${item.city || '-'} • Waktu: ${item.time || 'Terkini'}`,
      detail: item.text,
      icon: '💬',
      avatar: null,
      badgeText: 'Moderasi Komunitas',
      warningText: 'Kutipan kenikmatan firman ini akan dihapus permanen dari ruang komunitas Meja Perjamuan.'
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id || !deleteModal.type) return;
    setIsDeleting(true);
    try {
      if (deleteModal.type === 'book') {
        if (onDeleteBook) {
          await onDeleteBook(deleteModal.id);
        }
        const msg = `Buku "${deleteModal.title}" berhasil dihapus dari katalog!`;
        if (showToast) showToast(msg);
        setAdminNotice({ type: 'success', message: msg });
      } else if (deleteModal.type === 'user') {
        const updated = deleteUser(deleteModal.id);
        setUsers(updated);
        const msg = `Pengguna "${deleteModal.title}" berhasil dihapus dari perpustakaan!`;
        if (showToast) showToast(msg);
        setAdminNotice({ type: 'success', message: msg });
      } else if (deleteModal.type === 'enjoyment') {
        if (onDeleteEnjoyment) {
          onDeleteEnjoyment(deleteModal.id);
        }
        const msg = `Bagi nikmat dari "${deleteModal.title}" berhasil dihapus dari moderasi!`;
        if (showToast) showToast(msg);
        setAdminNotice({ type: 'success', message: msg });
      }
      setDeleteModal(prev => ({ ...prev, isOpen: false }));
      setTimeout(() => {
        setAdminNotice(null);
      }, 5000);
    } catch (err) {
      console.error('Gagal menghapus item:', err);
      const errMsg = 'Gagal menghapus: ' + (err.message || 'Terjadi kesalahan');
      if (showToast) showToast(errMsg);
      setAdminNotice({ type: 'error', message: errMsg });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.full_name || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.whatsapp || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.distrik_lokal || '').toLowerCase().includes(userSearchQuery.toLowerCase());
    
    const matchesTier = userTierFilter === 'all' || u.plan_tier === userTierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Floating Toast Notifikasi Aksi Admin (Modern, Glassmorphism & Selalu Terlihat Saat Scroll) */}
      {adminNotice && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] animate-in slide-in-from-bottom-5 duration-300">
          <div className={`p-4 rounded-2xl flex items-start gap-3.5 shadow-2xl border backdrop-blur-xl ${
            adminNotice.type === 'success' 
              ? 'bg-[#1C2317]/95 text-stone-100 border-emerald-500/40 shadow-emerald-950/40' 
              : 'bg-[#2A1517]/95 text-stone-100 border-rose-500/40 shadow-rose-950/40'
          }`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
              adminNotice.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {adminNotice.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0 pr-1 pt-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                {adminNotice.type === 'success' ? 'Sukses Memperbarui' : 'Peringatan Admin'}
              </p>
              <p className="text-xs sm:text-sm font-medium leading-snug mt-0.5 text-stone-100">
                {adminNotice.message}
              </p>
            </div>
            <button 
              type="button"
              onClick={() => setAdminNotice(null)}
              className="p-1.5 hover:bg-white/10 rounded-xl transition text-stone-400 hover:text-white shrink-0 -mr-1"
              title="Tutup Notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Admin Banner */}
      <div className="relative overflow-hidden rounded-[32px] p-6 sm:p-8 text-white border border-stone-800 shadow-2xl bg-stone-900">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-400 text-stone-950 font-serif font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-amber-300">
              A
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Portal Administrator
                </span>
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-amber-300 border-amber-400/40 bg-amber-400/10">
                  Mode Pengelola Penuh
                </Badge>
              </div>

              <h1 className="text-xl sm:text-3xl font-serif font-bold text-white">
                Administrator (admin123)
              </h1>
              <p className="text-xs text-stone-400 max-w-xl leading-relaxed">
                Pusat kendali katalog buku EPUB, data pengguna &amp; paket langganan, moderasi bagi nikmat, dan santapan Meja Perjamuan.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                setActiveTab('users');
                handleOpenCreateUser();
              }}
              variant="outline"
              className="rounded-full text-xs font-bold border-stone-700 text-stone-200 hover:bg-stone-800 bg-stone-800/50 btn-lift"
            >
              <Plus className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              Tambah User Baru
            </Button>

            <Button
              onClick={onOpenUpload}
              className="rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-white px-5 shadow-lg btn-lift"
            >
              <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
              Unggah Buku EPUB
            </Button>
          </div>
        </div>

        {/* Admin Quick Stat Cards */}
        <div className="mt-8 pt-6 border-t border-stone-800 grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/60 space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span>Total Koleksi Buku</span>
              <BookOpen className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-serif font-bold text-white">{books.length} Buku</p>
            <p className="text-[10px] text-emerald-400 font-semibold">Tersimpan di Cloud &amp; Lokal</p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/60 space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span>Pengguna Terdaftar</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-serif font-bold text-white">{users.length} User</p>
            <p className="text-[10px] text-stone-300">Standart, Premium, Ultimate</p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/60 space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span>Status Server Cloud</span>
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-serif font-bold text-white">Online &amp; Sinkron</p>
            <p className="text-[10px] text-emerald-400 font-semibold">Database Siap Pakai</p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/60 space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span>Bagi Nikmat Masuk</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <p className="text-2xl font-serif font-bold text-white">{enjoyments.length} Testimoni</p>
            <p className="text-[10px] text-stone-300">Moderasi Komunitas</p>
          </div>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1C1917]/10 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('books')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'books'
              ? 'bg-[#1C1917] text-white shadow-sm'
              : 'text-[#78716C] hover:text-[#1C1917] hover:bg-stone-200/50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Katalog &amp; Hak Akses Buku ({books.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-[#1C1917] text-white shadow-sm'
              : 'text-[#78716C] hover:text-[#1C1917] hover:bg-stone-200/50'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-500" />
          <span>Data Pengguna &amp; Langganan ({users.length})</span>
        </button>



        <button
          onClick={() => setActiveTab('community')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'community'
              ? 'bg-[#1C1917] text-white shadow-sm'
              : 'text-[#78716C] hover:text-[#1C1917] hover:bg-stone-200/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Moderasi Bagi Nikmat ({enjoyments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'ai'
              ? 'bg-[#1C1917] text-white shadow-sm'
              : 'text-[#78716C] hover:text-[#1C1917] hover:bg-stone-200/50'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Pengaturan Santapan FKKP</span>
        </button>
      </div>

      {/* ======================= TAB 1: MANAJEMEN BUKU ======================= */}
      {activeTab === 'books' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1C1917]">
                Daftar Buku di Katalog
              </h3>
              <p className="text-xs text-[#78716C]">
                Semua buku yang aktif dapat diakses oleh pengguna sesuai tier langganan mereka.
              </p>
            </div>

            <Button
              size="sm"
              onClick={onOpenUpload}
              className="rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-white"
            >
              <UploadCloud className="w-3.5 h-3.5 mr-1" />
              Unggah File EPUB Baru
            </Button>
          </div>

          <div className="bg-white rounded-3xl border border-[#1C1917]/10 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-b border-[#1C1917]/8 text-[#78716C] uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Buku &amp; Penulis</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Tier Akses Minimum</th>
                    <th className="py-3.5 px-4">Status Integrasi Toko</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1917]/5 text-[#1C1917]">
                  {books.map((b) => (
                    <tr key={b.id} className="hover:bg-[#FAF7F2]/60 transition">
                      <td className="py-3.5 px-4 font-medium flex items-center gap-3">
                        <span className="text-xl">{b.cover_icon || '📖'}</span>
                        <div>
                          <p className="font-bold text-xs text-[#1C1917]">{b.title}</p>
                          <p className="text-[11px] text-[#78716C]">{b.author}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#78716C]">
                        <Badge variant="outline" className="text-[10px] rounded-full">
                          {b.category || 'Umum'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 text-[10px]">
                          Premium / Ultimate
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-[#78716C]">
                        <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Google &amp; Apple Sync OK
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenBook(b)}
                            className="h-8 px-2 text-[#3B4B34] hover:bg-[#EAE3D5] rounded-xl text-xs"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Baca
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => triggerDeleteBook(b, e)}
                            className="h-8 px-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: DATA PENGGUNA & LANGGANAN (CRUD) ======================= */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1C1917]">
                Manajemen Data Pengguna &amp; Paket Langganan
              </h3>
              <p className="text-xs text-[#78716C]">
                Kelola data akun jemaat, nomor WhatsApp, Distrik - Lokal, serta hak akses paket langganan mereka.
              </p>
            </div>

            <Button
              size="sm"
              onClick={handleOpenCreateUser}
              className="rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-white gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Akun Pengguna Baru
            </Button>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-3 bg-white rounded-2xl border border-[#1C1917]/10 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-2.5" />
              <Input
                type="text"
                placeholder="Cari nama, email, wa, atau distrik..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-[#FAF7F2] border-[#1C1917]/10"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[11px] font-bold text-[#78716C]">Filter Paket:</span>
              <select
                value={userTierFilter}
                onChange={(e) => setUserTierFilter(e.target.value)}
                className="h-9 px-3 text-xs rounded-xl bg-[#FAF7F2] border border-[#1C1917]/10 font-medium text-[#1C1917] focus:outline-none"
              >
                <option value="all">Semua Paket</option>
                <option value="standart">Standart (Gratis)</option>
                <option value="premium">Premium</option>
                <option value="ultimate">Ultimate</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-3xl border border-[#1C1917]/10 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-b border-[#1C1917]/8 text-[#78716C] uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Pengguna</th>
                    <th className="py-3.5 px-4">Kontak (WA &amp; Email)</th>
                    <th className="py-3.5 px-4">Distrik - Lokal</th>
                    <th className="py-3.5 px-4">Paket Langganan</th>
                    <th className="py-3.5 px-4">Status Akun</th>
                    <th className="py-3.5 px-4">Terdaftar</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1917]/5 text-[#1C1917]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#78716C] text-xs">
                        Tidak ada pengguna yang sesuai dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[#FAF7F2]/60 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={u.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                              alt={u.full_name} 
                              className="w-10 h-10 rounded-xl object-cover border border-[#1C1917]/10 shadow-xs"
                            />
                            <div>
                              <p className="font-bold text-xs text-[#1C1917]">{u.full_name}</p>
                              <p className="text-[10px] text-[#78716C]">ID: {u.id.substring(0, 10)}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 space-y-0.5">
                          <p className="text-[11px] font-medium text-emerald-800 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            {u.whatsapp || '-'}
                          </p>
                          <p className="text-[11px] text-[#78716C] flex items-center gap-1">
                            <Mail className="w-3 h-3 text-blue-500" />
                            {u.email}
                          </p>
                          <p className="text-[10px] text-stone-500 font-mono flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-stone-400" />
                            Pass: {u.password || '123456'}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 font-medium text-[11px] text-[#1C1917]">
                            <MapPin className="w-3 h-3 text-amber-700" />
                            {u.distrik_lokal || 'Belum diatur'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] font-bold uppercase ${
                              u.plan_tier === 'ultimate'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : u.plan_tier === 'premium'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : 'bg-stone-100 text-stone-800 border-stone-300'
                            }`}
                          >
                            {u.plan_tier ? u.plan_tier.toUpperCase() : 'STANDART'}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4">
                          {u.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                              <UserCheck className="w-3.5 h-3.5" />
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                              <UserX className="w-3.5 h-3.5" />
                              Ditangguhkan
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-[11px] text-[#78716C]">
                          {u.joined_date || '2026-01-01'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditUser(u)}
                              className="h-8 px-2.5 text-[#3B4B34] hover:bg-[#EAE3D5] rounded-xl text-xs font-semibold"
                            >
                              <Edit2 className="w-3.5 h-3.5 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => triggerDeleteUser(u)}
                              className="h-8 px-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 4: MODERASI BAGI NIKMAT ======================= */}
      {activeTab === 'community' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1C1917]">
                Moderasi Kolom "Bagi Nikmat" Komunitas
              </h3>
              <p className="text-xs text-[#78716C]">
                Semua kenikmatan singkat yang dibagikan oleh jemaat dan pembaca firman.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enjoyments.map((item) => (
              <div 
                key={item.id}
                className="p-4 rounded-2xl bg-white border border-[#1C1917]/10 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-[#1C1917]/5">
                    <span className="font-bold text-[#1C1917]">{item.name} ({item.city})</span>
                    <span className="text-[10px] text-[#78716C]">{item.time}</span>
                  </div>
                  <p className="font-serif italic text-sm text-[#1C1917] mt-2.5 leading-relaxed">
                    "{item.text}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1C1917]/5">
                  <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    {item.likes || 1} Menyukai
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTogglePinEnjoyment(item.id)}
                      className="h-7 px-2 text-[10px] rounded-full text-amber-700 hover:bg-amber-50"
                    >
                      <Pin className="w-3 h-3 mr-1" />
                      Sematkan
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => triggerDeleteEnjoyment(item)}
                      className="h-7 px-2 text-[10px] rounded-full text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB 5: PENGATURAN SANTAPAN FKKP MEJA PERJAMUAN ======================= */}
      {activeTab === 'ai' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-900 via-[#1C1917] to-[#20251A] text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  Pusat Pengaturan Kalender FKKP
                </span>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">
                  Jadwal &amp; Santapan Harian FKKP
                </h3>
                <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
                  Kelola apakah santapan FKKP berganti otomatis mengikuti kalender (Senin - Sabtu), atau tetapkan secara manual minggu dan hari bacaan bagi seluruh jemaat.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleTestInReader}
                  className="rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 px-4 shadow-lg btn-lift"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  Uji Buka di Reader Sekarang
                </Button>
              </div>
            </div>

            {/* Live Status Card */}
            <div className="mt-6 pt-5 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700/60">
                <span className="text-stone-400 text-[11px] block">Mode Berjalan Saat Ini</span>
                <p className="font-bold text-sm text-white mt-0.5 flex items-center gap-1.5">
                  {fkkpSettings.mode === 'auto' ? (
                    <>
                      <Sun className="w-4 h-4 text-emerald-400" />
                      Otomatis Kalender
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-amber-400" />
                      Manual (Terkunci)
                    </>
                  )}
                </p>
                <p className="text-[10px] text-stone-400 mt-1">
                  {fkkpSettings.mode === 'auto' ? 'Berganti sendiri tiap pk 00:00' : 'Sesuai pilihan admin'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700/60">
                <span className="text-stone-400 text-[11px] block">Santapan Tayang Sekarang</span>
                <p className="font-bold text-sm text-amber-300 mt-0.5">
                  {currentFkkpLive.badge}
                </p>
                <p className="text-[10px] text-stone-300 truncate mt-1">
                  {currentFkkpLive.verseRef}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700/60">
                <span className="text-stone-400 text-[11px] block">Pergantian Hari Besok</span>
                <p className="font-bold text-sm text-emerald-400 mt-0.5">
                  {fkkpSettings.mode === 'auto' ? (
                    `Otomatis Hari ${(getCalendarDayIndex() % 7) + 1} (${DAY_NAMES[(getCalendarDayIndex() % 7) + 1] || 'Hari Tuhan'})`
                  ) : (
                    'Tidak berganti (Mode Manual)'
                  )}
                </p>
                <p className="text-[10px] text-stone-400 mt-1">
                  {fkkpSettings.mode === 'auto' ? 'Ayat & renungan otomatis berganti' : 'Ubah ke mode otomatis untuk aktif'}
                </p>
              </div>
            </div>
          </div>

          {/* Feedback Notice */}
          {fkkpNotice && (
            <div className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200 ${
              fkkpNotice.type === 'success' 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{fkkpNotice.text}</span>
            </div>
          )}

          {/* Mode & Schedule Controller */}
          <div className="p-6 rounded-3xl bg-white border border-[#1C1917]/10 space-y-6">
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-base text-[#1C1917]">
                1. Mode Pergantian Hari Santapan
              </h4>
              <p className="text-xs text-[#78716C]">
                Tentukan bagaimana aplikasi menyajikan santapan harian bagi pembaca.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option: Auto */}
              <button
                type="button"
                onClick={() => handleSaveFkkpSettings({ ...fkkpSettings, mode: 'auto' })}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  fkkpSettings.mode === 'auto'
                    ? 'border-[#3B4B34] bg-[#3B4B34]/5 shadow-sm ring-2 ring-[#3B4B34]/20'
                    : 'border-[#1C1917]/10 bg-[#FBF9F5] hover:border-[#1C1917]/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-[#1C1917]">Otomatis Ikuti Kalender (Rekomendasi)</h5>
                      <span className="text-[10px] text-emerald-700 font-semibold">Besok langsung berganti hari</span>
                    </div>
                  </div>
                  {fkkpSettings.mode === 'auto' && (
                    <Badge className="bg-[#3B4B34] text-white text-[10px]">Aktif</Badge>
                  )}
                </div>
                <p className="text-[11px] text-[#78716C] mt-3 leading-relaxed">
                  Sistem otomatis mendeteksi hari kalender (Senin=Hari 1 s/d Sabtu=Hari 6). Setiap hari jam 00:00 santapan, ayat, dan ringkasan akan berganti otomatis tanpa perlu diubah admin lagi.
                </p>
              </button>

              {/* Option: Manual */}
              <button
                type="button"
                onClick={() => handleSaveFkkpSettings({ ...fkkpSettings, mode: 'manual' })}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  fkkpSettings.mode === 'manual'
                    ? 'border-[#3B4B34] bg-[#3B4B34]/5 shadow-sm ring-2 ring-[#3B4B34]/20'
                    : 'border-[#1C1917]/10 bg-[#FBF9F5] hover:border-[#1C1917]/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-[#1C1917]">Manual (Kunci Hari Tertentu)</h5>
                      <span className="text-[10px] text-stone-500">Kunci hari dan minggu santapan</span>
                    </div>
                  </div>
                  {fkkpSettings.mode === 'manual' && (
                    <Badge className="bg-amber-700 text-white text-[10px]">Aktif</Badge>
                  )}
                </div>
                <p className="text-[11px] text-[#78716C] mt-3 leading-relaxed">
                  Admin mengunci tampilan santapan di minggu dan hari tertentu secara statis. Cocok jika jemaat ingin mendalami atau mengejar materi hari tertentu secara serentak.
                </p>
              </button>
            </div>

            {/* Select Week & Manual Day Controls */}
            <div className="pt-4 border-t border-[#1C1917]/8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fkkpSettings.mode === 'auto' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1C1917] flex items-center justify-between">
                      <span>Tanggal Mulai Siklus FKKP (Senin Minggu 1):</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                        Otomatis Berganti Tiap Pekan
                      </span>
                    </label>
                    <input
                      type="date"
                      value={fkkpSettings.startDate || '2026-10-05'}
                      onChange={(e) => handleSaveFkkpSettings({ ...fkkpSettings, startDate: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#FBF9F5] border border-[#1C1917]/15 text-xs font-bold text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#3B4B34]"
                    />
                    <p className="text-[10px] text-[#78716C]">
                      Hari ini otomatis: <strong className="text-[#3B4B34]">Minggu ke-{currentFkkpLive.week} • Hari {currentFkkpLive.day} ({currentFkkpLive.dayName})</strong>. Setiap hari Senin jam 00:00 minggu akan bertambah secara otomatis.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1C1917] block">
                      Pratinjau / Pilih Minggu untuk Diedit:
                    </label>
                    <select
                      value={fkkpSettings.currentWeek || currentFkkpLive.week}
                      onChange={(e) => handleSaveFkkpSettings({ ...fkkpSettings, currentWeek: Number(e.target.value) })}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#FBF9F5] border border-[#1C1917]/15 text-xs font-bold text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#3B4B34]"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Minggu ke-{i + 1} {i + 1 === currentFkkpLive.week ? '(Sedang Berjalan Sekarang)' : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-[#78716C]">
                      Pilih minggu jika ingin melihat atau mengedit santapan minggu tertentu pada editor di bawah.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1C1917] block">
                      Kunci Minggu Santapan (Mode Manual):
                    </label>
                    <select
                      value={fkkpSettings.currentWeek}
                      onChange={(e) => handleSaveFkkpSettings({ ...fkkpSettings, currentWeek: Number(e.target.value) })}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#FBF9F5] border border-[#1C1917]/15 text-xs font-bold text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#3B4B34]"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Minggu ke-{i + 1}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-[#78716C]">
                      Buku FKKP memiliki 12 Minggu. Pilih minggu yang ingin dikunci.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1C1917] block">
                      Kunci Hari Santapan (Mode Manual):
                    </label>
                    <select
                      value={fkkpSettings.manualDay}
                      onChange={(e) => handleSaveFkkpSettings({ ...fkkpSettings, manualDay: Number(e.target.value) })}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#FBF9F5] border border-[#1C1917]/15 text-xs font-bold text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#3B4B34]"
                    >
                      <option value={1}>Hari 1 (Senin)</option>
                      <option value={2}>Hari 2 (Selasa)</option>
                      <option value={3}>Hari 3 (Rabu)</option>
                      <option value={4}>Hari 4 (Kamis)</option>
                      <option value={5}>Hari 5 (Jumat)</option>
                      <option value={6}>Hari 6 (Sabtu)</option>
                      <option value={7}>Hari 7 (Hari Tuhan / Kidung Review)</option>
                    </select>
                    <p className="text-[10px] text-amber-700 font-semibold">
                      Santapan akan terkunci di hari ini sampai admin menggantinya.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Day Content Editor */}
          <div className="p-6 rounded-3xl bg-white border border-[#1C1917]/10 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1C1917]/8">
              <div>
                <h4 className="font-serif font-bold text-base text-[#1C1917]">
                  2. Editor Teks Ayat &amp; Rangkuman Fajar (Bagi Nikmat)
                </h4>
                <p className="text-xs text-[#78716C]">
                  Pilih hari untuk meninjau atau menyesuaikan teks renungan, ayat, dan doa serapan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {previewDayData.isOverridden && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetDayDefault}
                    className="rounded-full text-xs border-amber-300 text-amber-800 hover:bg-amber-50"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset ke Asli Buku
                  </Button>
                )}

                <Button
                  size="sm"
                  onClick={() => handleSaveFkkpSettings(fkkpSettings, {
                    theme: formTheme,
                    verse: formVerse,
                    verseRef: formVerseRef,
                    summary: formSummary,
                    prayer: formPrayer
                  })}
                  className="rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-white px-4 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Simpan Teks Hari {selectedPreviewDay}
                </Button>
              </div>
            </div>

            {/* Day Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => {
                const isSelected = selectedPreviewDay === d;
                const isToday = getCalendarDayIndex() === d;
                const isLive = currentFkkpLive.day === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedPreviewDay(d)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#1C1917] text-white shadow-sm'
                        : 'bg-[#FBF9F5] text-[#78716C] hover:bg-stone-200/60'
                    }`}
                  >
                    <span>Hari {d} ({DAY_NAMES[d]})</span>
                    {isLive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" title="Sedang Tayang Live" />
                    )}
                    {isToday && (
                      <span className="text-[9px] px-1 py-0.2 bg-amber-200 text-amber-900 rounded font-normal">Hari Ini</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Form Fields for Day Content */}
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1917]">
                    Tema Renungan (Pancaran Terang):
                  </label>
                  <Input
                    type="text"
                    value={formTheme}
                    onChange={(e) => setFormTheme(e.target.value)}
                    placeholder="Contoh: Roh Kebenaran Sebagai Penolong"
                    className="rounded-xl bg-[#FBF9F5] text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1917]">
                    Referensi Ayat Alkitab:
                  </label>
                  <Input
                    type="text"
                    value={formVerseRef}
                    onChange={(e) => setFormVerseRef(e.target.value)}
                    placeholder="Contoh: Yohanes 14:16-17, 26"
                    className="rounded-xl bg-[#FBF9F5] text-xs h-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C1917]">
                  Teks Firman / Ayat Kunci:
                </label>
                <textarea
                  value={formVerse}
                  onChange={(e) => setFormVerse(e.target.value)}
                  rows={2}
                  className="w-full rounded-2xl p-3 bg-[#FBF9F5] border border-[#1C1917]/15 text-xs text-[#1C1917] leading-relaxed font-serif italic focus:outline-none focus:ring-2 focus:ring-[#3B4B34]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C1917]">
                  Rangkuman Fajar (Bagi Nikmat Hayat):
                </label>
                <textarea
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl p-3 bg-[#FBF9F5] border border-[#1C1917]/15 text-xs text-[#1C1917] leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-[#3B4B34]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C1917]">
                  Butir Doa Serapan (Doa-Makan Pagi):
                </label>
                <textarea
                  value={formPrayer}
                  onChange={(e) => setFormPrayer(e.target.value)}
                  rows={2}
                  className="w-full rounded-2xl p-3 bg-[#FBF9F5] border border-[#1C1917]/15 text-xs text-[#1C1917] leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-[#3B4B34]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL CRUD USER ======================= */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[32px] p-7 bg-[#F7F4ED] border border-[#1C1917]/15 shadow-2xl text-[#1C1917]">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-lg font-serif font-bold text-[#1C1917] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#3B4B34]" />
              {editingUserId ? 'Edit Data Pengguna & Langganan' : 'Tambah Akun Pengguna Baru'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#78716C]">
              {editingUserId ? 'Ubah informasi profil atau paket langganan pengguna ini.' : 'Tambahkan pembaca baru ke sistem perpustakaan.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveUserForm} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1C1917]">Nama Lengkap</label>
              <Input
                type="text"
                required
                value={userFormName}
                onChange={(e) => setUserFormName(e.target.value)}
                placeholder="Contoh: Samuel Hartono"
                className="rounded-xl bg-white text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C1917]">Nomor WhatsApp</label>
                <Input
                  type="text"
                  value={userFormWhatsapp}
                  onChange={(e) => setUserFormWhatsapp(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="rounded-xl bg-white text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C1917]">Distrik - Lokal</label>
                <Input
                  type="text"
                  value={userFormDistrikLokal}
                  onChange={(e) => setUserFormDistrikLokal(e.target.value)}
                  placeholder="Contoh: Surabaya - Rungkut"
                  className="rounded-xl bg-white text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1C1917]">Alamat Email</label>
              <Input
                type="email"
                required
                value={userFormEmail}
                onChange={(e) => setUserFormEmail(e.target.value)}
                placeholder="user@email.com"
                className="rounded-xl bg-white text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1C1917] flex items-center justify-between">
                <span>Kata Sandi Akun</span>
                <span className="text-[10px] text-stone-500 font-normal">Default: 123456</span>
              </label>
              <Input
                type="text"
                required
                value={userFormPassword}
                onChange={(e) => setUserFormPassword(e.target.value)}
                placeholder="123456"
                className="rounded-xl bg-white text-xs h-9 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1C1917]">URL Foto Profil</label>
              <Input
                type="url"
                value={userFormPhotoUrl}
                onChange={(e) => setUserFormPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="rounded-xl bg-white text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C1917]">Paket Langganan</label>
                <select
                  value={userFormTier}
                  onChange={(e) => setUserFormTier(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-white border border-[#1C1917]/15 text-xs font-bold text-[#1C1917] focus:outline-none"
                >
                  <option value="standart">Standart (Gratis)</option>
                  <option value="premium">Premium</option>
                  <option value="ultimate">Ultimate</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C1917]">Status Akun</label>
                <select
                  value={userFormStatus}
                  onChange={(e) => setUserFormStatus(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-white border border-[#1C1917]/15 text-xs font-bold text-[#1C1917] focus:outline-none"
                >
                  <option value="active">Aktif</option>
                  <option value="suspended">Ditangguhkan</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsUserModalOpen(false)}
                className="text-xs rounded-full"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-white px-5 shadow-sm"
              >
                {editingUserId ? 'Simpan Perubahan' : 'Tambah Pengguna'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================= MODAL DIALOG KONFIRMASI HAPUS ADMIN (MODERN, PRESISI & RESPONSIVE) ======================= */}
      <Dialog 
        open={deleteModal.isOpen} 
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeleteModal(prev => ({ ...prev, isOpen: false }));
          }
        }}
      >
        <DialogContent className="w-[92vw] max-w-[440px] bg-[#FAF7F2] border border-[#1C1917]/15 shadow-2xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 gap-0">
          {/* Header Dialog */}
          <div className="flex items-start gap-3 pb-3.5 border-b border-[#1C1917]/8 pr-6">
            <div className="w-10 h-10 rounded-xl bg-rose-100/80 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
              <Trash2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                  <span>{deleteModal.badgeText || 'Konfirmasi Tindakan'}</span>
                </span>
              </div>
              <DialogTitle className="text-base sm:text-lg font-serif font-bold text-[#1C1917] leading-tight">
                {deleteModal.headline || 'Konfirmasi Penghapusan'}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#78716C] mt-1 leading-snug">
                Tindakan ini permanen. Periksa kembali data di bawah ini.
              </DialogDescription>
            </div>
          </div>

          {/* Kartu Ringkasan Detail Data yang Akan Dihapus */}
          <div className="py-3.5 space-y-2.5">
            <div className="p-3 sm:p-3.5 rounded-xl bg-white border border-[#1C1917]/10 shadow-xs flex items-center gap-3">
              {deleteModal.icon && (
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-xl shadow-2xs shrink-0">
                  {deleteModal.icon}
                </div>
              )}
              {deleteModal.avatar && (
                <img 
                  src={deleteModal.avatar} 
                  alt={deleteModal.title} 
                  className="w-10 h-10 rounded-lg object-cover border border-[#1C1917]/15 shrink-0 shadow-2xs"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-[#1C1917] leading-snug break-words">
                  {deleteModal.title}
                </p>
                <p className="text-[11px] text-[#78716C] mt-0.5 leading-snug break-words">
                  {deleteModal.subtitle}
                </p>
              </div>
            </div>

            {deleteModal.detail && (
              <div className="p-2.5 rounded-xl bg-[#F4EFE6] border border-[#1C1917]/8 text-[11px] text-stone-700 font-serif italic leading-relaxed break-words">
                "{deleteModal.detail}"
              </div>
            )}

            {/* Warning Box */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-amber-950 text-[11px] leading-snug">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span className="font-medium break-words">
                {deleteModal.warningText || 'Data akan dihapus permanen dari sistem.'}
              </span>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="pt-3 border-t border-[#1C1917]/8 flex items-center justify-end gap-2 sm:gap-2.5">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
              className="rounded-xl px-4 h-9 text-xs font-semibold border-stone-300 hover:bg-stone-100 text-stone-700"
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="rounded-xl px-4 sm:px-5 h-9 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ya, Hapus Sekarang</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
