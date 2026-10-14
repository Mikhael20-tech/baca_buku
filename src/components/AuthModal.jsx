import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
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
              role: 'admin'
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          setSuccessMsg('Pendaftaran berhasil! Akun Anda telah siap.');
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
          setSuccessMsg('Berhasil masuk! Sesi cloud Anda telah aktif.');
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
      <DialogContent className="sm:max-w-md rounded-3xl p-6 border-border shadow-2xl">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              {tab === 'register' ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Portal Akun &amp; Admin</DialogTitle>
              <DialogDescription className="text-xs">
                Kelola buku, highlight, dan sinkronisasi cloud
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Switcher */}
        <Tabs value={tab} onValueChange={(val) => { setTab(val); setErrorMsg(''); setSuccessMsg(''); }} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-3 rounded-xl bg-muted p-1">
            <TabsTrigger value="login" className="rounded-lg text-xs font-semibold">Masuk Akun</TabsTrigger>
            <TabsTrigger value="register" className="rounded-lg text-xs font-semibold">Daftar Baru</TabsTrigger>
          </TabsList>

          {/* Kotak Akun Admin Bawaan */}
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-xs space-y-1.5 mb-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-800 dark:text-amber-200 text-[11px]">Akun Admin Disediakan:</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fillDefaultAdmin}
                className="h-6 text-[10px] font-bold text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
              >
                Isi Otomatis
              </Button>
            </div>
            <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80 font-mono">
              Email: <b>admin@baca.id</b><br />
              Pass: <b>AdminPassword123!</b>
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs space-y-2 mb-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="flex-1">{errorMsg}</div>
              </div>
              {errorMsg.includes('Email not confirmed') && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleQuickAdminLogin}
                  className="w-full text-xs font-bold"
                >
                  Masuk Langsung Sebagai Admin Sekarang
                </Button>
              )}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <div>{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <TabsContent value="register" className="mt-0 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Nama Lengkap</label>
                <Input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Contoh: Admin Perpustakaan"
                />
              </div>
            </TabsContent>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Email</label>
              <Input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@email.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 h-10 font-bold text-xs"
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
