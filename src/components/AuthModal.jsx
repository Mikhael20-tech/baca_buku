import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getStoredUsers, addUser } from '../lib/userManagement';
import { LogIn, Loader2, AlertCircle, CheckCircle2, ShieldCheck, User, Info, Lock, Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialRole = 'reader' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reset state on open
  React.useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setErrorMsg('');
      setSuccessMsg('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    const cleanUser = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Cek Kredensial Admin Langsung lewat Satu Form
    if (
      (cleanUser === 'admin123' || cleanUser === 'admin' || cleanUser === 'admin@baca.id' || cleanUser === 'admin123@baca.id') &&
      cleanPass === '123456'
    ) {
      const adminUser = {
        id: 'admin-id-123',
        email: 'admin123@baca.id',
        username: 'admin123',
        full_name: 'Administrator',
        role: 'admin',
        user_metadata: { role: 'admin', full_name: 'Administrator' }
      };
      setSuccessMsg('Berhasil masuk sebagai Administrator!');
      if (typeof onAuthSuccess === 'function') {
        onAuthSuccess(adminUser);
      }
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 700);
      return;
    }

    // 2. Cek Akun Pengguna yang Didaftarkan oleh Admin di Manajemen Pengguna
    const storedUsers = getStoredUsers();
    const matchedUser = storedUsers.find((u) => {
      const uEmail = (u.email || '').trim().toLowerCase();
      const uName = (u.full_name || '').trim().toLowerCase();
      const uUsername = (u.username || '').trim().toLowerCase();
      return uEmail === cleanUser || uName === cleanUser || uUsername === cleanUser;
    });

    if (matchedUser) {
      const expectedPassword = (matchedUser.password || '123456').trim();
      if (cleanPass === expectedPassword) {
        const userObj = {
          ...matchedUser,
          role: matchedUser.role || 'reader',
          user_metadata: {
            role: matchedUser.role || 'reader',
            full_name: matchedUser.full_name
          }
        };
        localStorage.setItem('baca_user_profile', JSON.stringify(userObj));
        setSuccessMsg(`Berhasil masuk! Selamat datang, ${matchedUser.full_name}.`);
        if (typeof onAuthSuccess === 'function') {
          onAuthSuccess(userObj);
        }
        setTimeout(() => {
          setIsLoading(false);
          onClose();
        }, 700);
        return;
      } else {
        setErrorMsg('Kata sandi salah. Silakan periksa kembali kata sandi Anda.');
        setIsLoading(false);
        return;
      }
    }

    // 3. Akun Demo Cepat (Budi Pembaca / User Demo)
    if (
      (cleanUser === 'user' || cleanUser === 'user123' || cleanUser === 'budi' || cleanUser === 'pembaca') &&
      (cleanPass === '123456' || cleanPass === '')
    ) {
      const demoUser = {
        id: 'user-demo-baca',
        email: 'budi@pembaca.id',
        username: cleanUser,
        full_name: 'Budi Pembaca',
        whatsapp: '0812-3456-7890',
        distrik_lokal: 'Surabaya - Rungkut',
        photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        role: 'reader',
        user_metadata: { role: 'reader', full_name: 'Budi Pembaca' }
      };
      setSuccessMsg('Berhasil masuk sebagai Pembaca!');
      if (typeof onAuthSuccess === 'function') {
        onAuthSuccess(demoUser);
      }
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 700);
      return;
    }

    // 4. Supabase Sign In (jika akun terdaftar di Supabase)
    try {
      if (isSupabaseConfigured() && email.includes('@')) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: cleanPass
        });

        if (!error && data.user) {
          const userRole = data.user.user_metadata?.role || 'reader';
          setSuccessMsg(userRole === 'admin' ? 'Berhasil masuk sebagai Administrator!' : 'Berhasil masuk!');
          if (typeof onAuthSuccess === 'function') {
            onAuthSuccess({
              ...data.user,
              role: userRole,
              full_name: data.user.user_metadata?.full_name || data.user.email.split('@')[0]
            });
          }
          setTimeout(() => {
            setIsLoading(false);
            onClose();
          }, 700);
          return;
        }
      }
    } catch (err) {
      console.warn('Supabase auth attempt:', err);
    }

    // Jika tidak cocok dengan data admin maupun pengguna terdaftar
    setErrorMsg('Akun atau kata sandi tidak cocok. Pendaftaran publik ditutup sementara; silakan hubungi Administrator untuk pembuatan akun Anda.');
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
        return;
      }

      // Masuk Akun Google lokal
      const googleUser = {
        id: 'google-user-' + Date.now(),
        email: 'pembaca.google@gmail.com',
        full_name: 'Pembaca Akun Google',
        whatsapp: '',
        distrik_lokal: '',
        photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        role: 'reader',
        plan_tier: 'standart',
        status: 'active',
        google_play_synced: true
      };

      addUser(googleUser);
      localStorage.setItem('baca_user_profile', JSON.stringify(googleUser));
      setSuccessMsg('Berhasil masuk dengan Akun Google!');
      if (typeof onAuthSuccess === 'function') {
        onAuthSuccess(googleUser);
      }
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal masuk dengan Google.');
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[92vh] overflow-y-auto rounded-[32px] p-6 sm:p-7 bg-[#F7F4ED] border border-[#1C1917]/15 shadow-2xl text-[#1C1917] scrollbar-thin">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl text-[#F4EFE6] flex items-center justify-center shadow-md bg-[#3B4B34]">
              <User className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <DialogTitle className="text-lg font-serif font-bold text-[#1C1917]">
                Masuk ke Akun
              </DialogTitle>
              <DialogDescription className="text-xs text-[#78716C]">
                Akses santapan firman, saat teduh, &amp; perpustakaan.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Informasi penutupan registrasi publik sementara */}
        <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-900 flex items-center justify-between gap-2.5">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong className="font-semibold">Pendaftaran ditangani langsung oleh Admin.</strong> Hubungi admin untuk buat akun.
            </p>
          </div>
          <a
            href="https://wa.me/628960671871?text=Syalom%20Admin%20Baca,%20saya%20ingin%20minta%20dibuatkan%20akun%20pembaca%20baru."
            target="_blank"
            rel="noreferrer"
            className="shrink-0 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-xs transition"
          >
            <Phone className="w-3 h-3" />
            <span>WA Admin</span>
          </a>
        </div>

        {/* Tombol Masuk dengan Google */}
        <div className="space-y-2.5">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="w-full h-11 rounded-2xl border-[#1C1917]/15 bg-white hover:bg-stone-50 text-[#1C1917] text-xs font-bold shadow-xs flex items-center justify-center gap-2.5 transition-all btn-lift"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Masuk dengan Akun Google</span>
          </Button>

          <div className="relative flex items-center justify-center pt-1">
            <div className="border-t border-[#1C1917]/10 w-full" />
            <span className="bg-[#F7F4ED] px-3 text-[10px] uppercase font-bold text-stone-400 whitespace-nowrap">
              atau masuk dengan akun
            </span>
            <div className="border-t border-[#1C1917]/10 w-full" />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <div className="font-semibold">{successMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#1C1917] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#3B4B34]" />
              <span>Email atau Username</span>
            </label>
            <Input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Contoh: user, email, atau admin123"
              className="rounded-xl bg-white border-[#1C1917]/15 focus:border-[#3B4B34] text-xs h-10"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#1C1917] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#3B4B34]" />
              <span>Kata Sandi</span>
            </label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
              className="rounded-xl bg-white border-[#1C1917]/15 focus:border-[#3B4B34] text-xs h-10"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 h-11 font-bold text-xs rounded-full bg-[#3B4B34] hover:bg-[#20251A] text-white shadow-md btn-lift flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Memverifikasi Akun...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Masuk ke Akun
              </>
            )}
          </Button>

          <p className="text-center text-[11px] text-stone-500 pt-1">
            Belum memiliki akun? Hubungi WhatsApp Admin di{' '}
            <a
              href="https://wa.me/628960671871?text=Syalom%20Admin%20Baca,%20saya%20ingin%20minta%20dibuatkan%20akun%20pembaca%20baru."
              target="_blank"
              rel="noreferrer"
              className="font-bold text-emerald-800 underline hover:text-emerald-950"
            >
              0896-0671-871
            </a>{' '}
            untuk didaftarkan.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
