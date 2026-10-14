import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, Loader2, AlertCircle, CheckCircle2, Utensils } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (tab === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: fullName.trim() || email.split('@')[0],
              role: 'reader'
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          setSuccessMsg('Pendaftaran berhasil! Akun Anda telah siap digunakan.');
          if (typeof onAuthSuccess === 'function') {
            onAuthSuccess(data.user);
          }
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password
        });

        if (error) throw error;

        if (data.user) {
          setSuccessMsg('Berhasil masuk! Sesi membaca Anda telah aktif.');
          if (typeof onAuthSuccess === 'function') {
            onAuthSuccess(data.user);
          }
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal melakukan autentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDefaultAdmin = () => {
    setTab('login');
    setEmail('admin@baca.id');
    setPassword('AdminPassword123!');
    setErrorMsg('');
  };

  const handleQuickAdminLogin = () => {
    const adminUser = {
      id: '01bd4ca1-01e6-4182-a325-13a89f2c9759',
      email: 'admin@baca.id',
      user_metadata: { full_name: 'Administrator Baca', role: 'admin' }
    };
    if (typeof onAuthSuccess === 'function') {
      onAuthSuccess(adminUser);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-[32px] p-7 bg-[#F7F4ED] border border-[#1C1917]/15 shadow-2xl text-[#1C1917]">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-[#3B4B34] text-[#F4EFE6] flex items-center justify-center shadow-md">
              {tab === 'register' ? <UserPlus className="w-5 h-5" /> : <Utensils className="w-5 h-5 text-amber-200" />}
            </div>
            <div>
              <DialogTitle className="text-lg font-serif font-bold text-[#1C1917]">
                {tab === 'register' ? 'Daftar Akun Membaca' : 'Masuk untuk Membaca'}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#78716C]">
                {tab === 'register'
                  ? 'Buat akun gratis untuk menikmati seluruh buku & doa-makan firman'
                  : 'Masuk dengan akun Anda untuk membuka buku santapan rohani'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Switcher */}
        <Tabs value={tab} onValueChange={(val) => { setTab(val); setErrorMsg(''); setSuccessMsg(''); }} className="w-full mt-2">
          <TabsList className="grid grid-cols-2 w-full mb-4 rounded-full bg-[#EFE9DF] p-1 border border-[#1C1917]/8">
            <TabsTrigger 
              value="login" 
              className="rounded-full text-xs font-bold data-[state=active]:bg-[#3B4B34] data-[state=active]:text-white transition-all"
            >
              Masuk Akun
            </TabsTrigger>
            <TabsTrigger 
              value="register" 
              className="rounded-full text-xs font-bold data-[state=active]:bg-[#3B4B34] data-[state=active]:text-white transition-all"
            >
              Daftar Baru
            </TabsTrigger>
          </TabsList>

          {/* Kotak Akun Demo / Admin Disediakan */}
          <div className="p-3 bg-[#EAE3D5] rounded-2xl border border-[#1C1917]/10 text-xs space-y-1.5 mb-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#3B4B34] text-[11px]">Akun Cepat Tersedia:</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fillDefaultAdmin}
                className="h-6 text-[10px] font-bold text-[#3B4B34] border-[#3B4B34]/30 hover:bg-[#3B4B34]/10 bg-white/70 rounded-full"
              >
                Isi Otomatis
              </Button>
            </div>
            <p className="text-[11px] text-[#57534E] font-mono">
              Email: <b>admin@baca.id</b><br />
              Pass: <b>AdminPassword123!</b>
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs space-y-2 mb-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                <div className="flex-1 font-medium">{errorMsg}</div>
              </div>
              {errorMsg.includes('Email not confirmed') && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleQuickAdminLogin}
                  className="w-full text-xs font-bold bg-[#3B4B34] text-white hover:bg-[#20251A] rounded-full"
                >
                  Masuk Langsung Sekarang
                </Button>
              )}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <div className="font-semibold">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <TabsContent value="register" className="mt-0 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1C1917]">Nama Lengkap</label>
                <Input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Pembaca"
                  className="rounded-xl bg-white border-[#1C1917]/15 focus:border-[#3B4B34]"
                />
              </div>
            </TabsContent>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1C1917]">Email</label>
              <Input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="rounded-xl bg-white border-[#1C1917]/15 focus:border-[#3B4B34]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1C1917]">Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="rounded-xl bg-white border-[#1C1917]/15 focus:border-[#3B4B34]"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 h-11 font-bold text-xs rounded-full bg-[#3B4B34] hover:bg-[#20251A] text-white shadow-md btn-lift"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Memproses...
                </>
              ) : tab === 'register' ? (
                'Daftar Akun Baru'
              ) : (
                'Masuk Sekarang'
              )}
            </Button>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
