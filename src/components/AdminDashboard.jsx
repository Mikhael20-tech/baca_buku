import React, { useState } from 'react';
import { 
  ShieldCheck, UploadCloud, Database, Smartphone, 
  Trash2, Play, RefreshCw, CheckCircle2, AlertTriangle, 
  Sparkles, Layers, BookOpen, Users, DollarSign, Settings,
  Eye, Check, Pin, X, Plus, Edit2, Search, Filter, Phone,
  Mail, MapPin, UserCheck, UserX, Camera, Clock, FileCheck
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
  getStoreVerifications, 
  updateVerificationStatus, 
  deleteStoreVerification 
} from '../lib/storeSync';

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
  initialTab = 'books'
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'books' | 'users' | 'stores' | 'community' | 'ai'
  
  // Store sync state
  const [isSyncingStore, setIsSyncingStore] = useState(false);
  const [syncStatusNote, setSyncStatusNote] = useState('');
  const [verifications, setVerifications] = useState(getStoreVerifications());
  const [verificationFilter, setVerificationFilter] = useState('all');

  // AI Summary State
  const [editedAiSummary, setEditedAiSummary] = useState(aiSummary || '');
  const [aiSavedNotice, setAiSavedNotice] = useState(false);

  // User Management State (CRUD)
  const [users, setUsers] = useState(getStoredUsers());
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userTierFilter, setUserTierFilter] = useState('all'); // 'all' | 'standart' | 'premium' | 'ultimate'
  
  // Modal State for User Create / Edit
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userFormName, setUserFormName] = useState('');
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormWhatsapp, setUserFormWhatsapp] = useState('');
  const [userFormDistrikLokal, setUserFormDistrikLokal] = useState('');
  const [userFormPhotoUrl, setUserFormPhotoUrl] = useState('');
  const [userFormTier, setUserFormTier] = useState('premium');
  const [userFormStatus, setUserFormStatus] = useState('active');

  const handleTriggerStoreSync = () => {
    setIsSyncingStore(true);
    setTimeout(() => {
      setIsSyncingStore(false);
      setSyncStatusNote('Katalog berhasil diselaraskan dengan Google Play Books Partner Center & Apple App Store!');
      setTimeout(() => setSyncStatusNote(''), 4000);
    }, 1500);
  };

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

  // Delete User
  const handleDeleteUser = (id, name) => {
    if (window.confirm(`Hapus pengguna "${name}" dari perpustakaan?`)) {
      const updated = deleteUser(id);
      setUsers(updated);
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
                Pusat kendali katalog buku EPUB, data pengguna &amp; paket langganan, sinkronisasi Google Play &amp; Apple Books, moderasi bagi nikmat, dan santapan Meja Perjamuan.
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
              <span>Integrasi Toko Buku</span>
              <Smartphone className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-serif font-bold text-white">Google &amp; Apple</p>
            <p className="text-[10px] text-emerald-400 font-semibold">Sync Berjalan Normal</p>
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
          onClick={() => setActiveTab('stores')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'stores'
              ? 'bg-[#1C1917] text-white shadow-sm'
              : 'text-[#78716C] hover:text-[#1C1917] hover:bg-stone-200/50'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Integrasi Google Play &amp; App Store</span>
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
                            onClick={(e) => onDeleteBook(b.id, e)}
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
                              onClick={() => handleDeleteUser(u.id, u.full_name)}
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

      {/* ======================= TAB 3: INTEGRASI TOKO BUKU ======================= */}
      {activeTab === 'stores' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-3xl bg-white border border-[#1C1917]/10 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1917]/8">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1C1917]">
                  Status Lisensi &amp; Integrasi Toko Buku Digital
                </h3>
                <p className="text-xs text-[#78716C]">
                  Sinkronisasi Google Play Books dan Apple App Store dengan database Baca.
                </p>
              </div>

              <Button
                size="sm"
                onClick={handleTriggerStoreSync}
                disabled={isSyncingStore}
                className="rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncingStore ? 'animate-spin' : ''}`} />
                {isSyncingStore ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
              </Button>
            </div>

            {syncStatusNote && (
              <div className="p-3.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{syncStatusNote}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#F7F4ED] border border-[#1C1917]/8 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#1C1917]">Google Play Books</span>
                  <Badge className="bg-emerald-600 text-white text-[10px]">Terhubung (Active)</Badge>
                </div>
                <p className="text-xs text-[#57534E] leading-relaxed">
                  Menghubungkan akun Google Play Merchant dan verifikasi receipt buku terbitan Yasperin / LSM.
                </p>
                <div className="text-[11px] text-[#78716C] pt-2 border-t border-[#1C1917]/8">
                  <p>Client ID: <span className="font-mono text-[#1C1917]">baca-google-play-partner-v2</span></p>
                  <p>Sinkronisasi Terakhir: Baru saja (Otomatis)</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#F7F4ED] border border-[#1C1917]/8 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#1C1917]">Apple App Store &amp; Books</span>
                  <Badge className="bg-emerald-600 text-white text-[10px]">Terhubung (Active)</Badge>
                </div>
                <p className="text-xs text-[#57534E] leading-relaxed">
                  StoreKit v2 Transaction API memeriksa Apple ID pengguna untuk lisensi buku yang sudah dibeli di iOS/iPadOS.
                </p>
                <div className="text-[11px] text-[#78716C] pt-2 border-t border-[#1C1917]/8">
                  <p>Bundle ID: <span className="font-mono text-[#1C1917]">cloud.baca.perpustakaan</span></p>
                  <p>Sinkronisasi Terakhir: Baru saja (Otomatis)</p>
                </div>
              </div>
            </div>

            {/* Antrean Verifikasi Order ID Pembelian Toko */}
            <div className="pt-6 border-t border-[#1C1917]/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-serif font-bold text-base text-[#1C1917] flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-amber-700" />
                    Antrean Verifikasi Order ID Pembelian Pengguna
                  </h4>
                  <p className="text-xs text-[#78716C]">
                    Tinjau nomor pesanan Google Play (GPA) dan Apple Books untuk mengaktifkan lisensi buku di akun pengguna.
                  </p>
                </div>

                {/* Filter Status */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: 'pending', label: 'Menunggu' },
                    { id: 'verified', label: 'Disetujui' },
                    { id: 'rejected', label: 'Ditolak' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setVerificationFilter(f.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        verificationFilter === f.id
                          ? 'bg-[#1C1917] text-white shadow-xs'
                          : 'bg-[#F7F4ED] text-[#78716C] hover:text-[#1C1917]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Antrean */}
              <div className="overflow-x-auto rounded-2xl border border-[#1C1917]/10 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-[#78716C] font-bold border-b border-[#1C1917]/10 uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Pengguna</th>
                      <th className="p-3.5">Platform</th>
                      <th className="p-3.5">Order ID / Receipt</th>
                      <th className="p-3.5">Judul Buku</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Aksi Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C1917]/5">
                    {verifications
                      .filter((v) => verificationFilter === 'all' || v.status === verificationFilter)
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-[#FBF9F5] transition">
                          <td className="p-3.5">
                            <p className="font-bold text-[#1C1917]">{item.user_name}</p>
                            <p className="text-[11px] text-[#78716C]">{item.user_email}</p>
                          </td>
                          <td className="p-3.5">
                            <Badge
                              variant="outline"
                              className={`text-[9px] font-bold ${
                                item.platform === 'Google Play Books'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-blue-50 text-blue-800 border-blue-300'
                              }`}
                            >
                              {item.platform}
                            </Badge>
                          </td>
                          <td className="p-3.5 font-mono text-[11px] font-semibold text-[#1C1917]">
                            {item.order_id}
                          </td>
                          <td className="p-3.5 text-[#57534E]">
                            <p className="font-medium">{item.book_title}</p>
                            {item.notes && (
                              <p className="text-[10px] text-[#78716C] italic">{item.notes}</p>
                            )}
                          </td>
                          <td className="p-3.5">
                            {item.status === 'verified' ? (
                              <Badge className="bg-emerald-600 text-white text-[9px] gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>Terverifikasi</span>
                              </Badge>
                            ) : item.status === 'rejected' ? (
                              <Badge className="bg-rose-600 text-white text-[9px]">
                                Ditolak
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500 text-white text-[9px] gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>Menunggu</span>
                              </Badge>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {item.status !== 'verified' && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const updated = updateVerificationStatus(item.id, 'verified');
                                    setVerifications(updated);
                                  }}
                                  className="h-7 px-2.5 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                  title="Setujui dan Aktifkan Lisensi Buku"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Setujui</span>
                                </Button>
                              )}
                              {item.status !== 'rejected' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const updated = updateVerificationStatus(item.id, 'rejected');
                                    setVerifications(updated);
                                  }}
                                  className="h-7 px-2.5 rounded-lg text-[10px] font-bold border-rose-300 text-rose-700 hover:bg-rose-50 gap-1"
                                  title="Tolak Pengajuan"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Tolak</span>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (window.confirm('Hapus entri antrean ini?')) {
                                    const updated = deleteStoreVerification(item.id);
                                    setVerifications(updated);
                                  }
                                }}
                                className="h-7 w-7 p-0 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Hapus Entri"
                              >
                                <Trash2 className="w-3 h-3" />
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
                      onClick={() => onDeleteEnjoyment(item.id)}
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
          <div className="p-6 rounded-3xl bg-white border border-[#1C1917]/10 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1917]/8">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1C1917]">
                  Rangkuman Santapan FKKP Meja Perjamuan Hari Ini
                </h3>
                <p className="text-xs text-[#78716C]">
                  Rangkuman ini akan langsung ditampilkan di bagian Meja Perjamuan bagi seluruh pengguna.
                </p>
              </div>

              <Button
                onClick={handleSaveAi}
                className="rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-white"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Simpan Perubahan Santapan
              </Button>
            </div>

            {aiSavedNotice && (
              <div className="p-3.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Rangkuman Santapan Meja Perjamuan berhasil diperbarui dan dipublikasikan!</span>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-xs font-bold text-[#1C1917] block">
                Teks Intisari &amp; Bagi Nikmat (FKKP Hari Ini):
              </label>
              <textarea
                value={editedAiSummary}
                onChange={(e) => setEditedAiSummary(e.target.value)}
                rows={6}
                className="w-full rounded-2xl p-4 bg-[#FBF9F5] border border-[#1C1917]/15 text-xs text-[#1C1917] leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-[#3B4B34]"
              />
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

    </div>
  );
}
