import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { addUser } from '../lib/userManagement';
import { LogIn, UserPlus, Loader2, AlertCircle, CheckCircle2, Utensils, ShieldCheck, User, Phone, MapPin, Camera } from 'lucide-react';
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

const REGISTER_PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
];

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialRole = 'reader' }) {
  const [roleMode, setRoleMode] = useState(initialRole); // 'reader' | 'admin'
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [distrikLokal, setDistrikLokal] = useState('');
  const [photoUrl, setPhotoUrl] = useState(REGISTER_PRESET_AVATARS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync roleMode if initialRole changes when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setRoleMode(initialRole);
      setErrorMsg('');
      setSuccessMsg('');
      if (initialRole === 'admin') {
        setEmail('');
        setPassword('');
        setTab('login');
      } else {
        setEmail('');
        setPassword('');
      }
    }
  }, [isOpen, initialRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    const cleanUser = email.trim().toLowerCase();

    // 1. Cek Login Khusus Admin: user admin123 pass 123456
    if (roleMode === 'admin' || cleanUser === 'admin123' || cleanUser === 'admin') {
      if ((cleanUser === 'admin123' || cleanUser === 'admin' || cleanUser === 'admin123@baca.id') && password === '123456') {
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
      } else {
        setErrorMsg('Kredensial Admin tidak valid! Gunakan Username: admin123 & Password: 123456');
        setIsLoading(false);
        return;
      }
    }

    // 2. Akun Demo User / Pembaca Cepat
    if (cleanUser === 'user' || cleanUser === 'user123' || cleanUser === 'budi' || cleanUser === 'pembaca') {
      const demoUser = {
        id: 'user-demo-baca',
        email: 'budi@pembaca.id',
        username: cleanUser,
        full_name: 'Budi Pembaca',
        whatsapp: '0812-3456-7890',
        distrik_lokal: 'Surabaya - Rungkut',
        photo_url: REGISTER_PRESET_AVATARS[0],
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

    try {
      if (tab === 'register') {
        const newUserData = {
          id: 'user-' + Date.now(),
          full_name: fullName.trim() || email.split('@')[0],
          email: email.trim(),
          whatsapp: whatsapp.trim() || '-',
          distrik_lokal: distrikLokal.trim() || 'Indonesia',
          photo_url: photoUrl || REGISTER_PRESET_AVATARS[0],
          role: 'reader',
          plan_tier: 'standart',
          status: 'active'
        };

        if (isSupabaseConfigured()) {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
              data: {
                full_name: newUserData.full_name,
                whatsapp: newUserData.whatsapp,
                distrik_lokal: newUserData.distrik_lokal,
                photo_url: newUserData.photo_url,
                role: 'reader'
              }
            }
          });

          if (error) throw error;

          if (data.user) {
            addUser(newUserData);
            setSuccessMsg('Pendaftaran berhasil! Akun pembaca Anda telah aktif.');
            if (typeof onAuthSuccess === 'function') {
              onAuthSuccess({
                ...data.user,
                ...newUserData
              });
            }
            setTimeout(() => onClose(), 1000);
            return;
          }
        }

        // Pendaftaran lokal & sinkron ke manajemen pengguna Admin
        addUser(newUserData);
        localStorage.setItem('baca_user_profile', JSON.stringify(newUserData));
        setSuccessMsg('Akun pembaca berhasil didaftarkan dan aktif!');
        if (typeof onAuthSuccess === 'function') {
          onAuthSuccess(newUserData);
        }
        setTimeout(() => onClose(), 1000);

      } else {
        // Mode Login
        if (isSupabaseConfigured() && email.includes('@')) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password
          });

          if (!error && data.user) {
            setSuccessMsg('Berhasil masuk!');
            if (typeof onAuthSuccess === 'function') {
              onAuthSuccess({
                ...data.user,
                role: data.user.user_metadata?.role || 'reader',
                full_name: data.user.user_metadata?.full_name || data.user.email.split('@')[0]
              });
            }
            setTimeout(() => onClose(), 1000);
            return;
          }
        }

        // Fallback login akun user umum
        const loggedUser = {
          id: 'user-' + Date.now(),
          email: email.trim(),
          full_name: email.split('@')[0] || 'Pembaca Hayat',
          role: 'reader'
        };
        setSuccessMsg('Berhasil masuk sebagai Pembaca!');
        if (typeof onAuthSuccess === 'function') {
          onAuthSuccess(loggedUser);
        }
        setTimeout(() => onClose(), 1000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal melakukan autentikasi.');
    } finally {
      setIsLoading(false);
    }
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

      // Masuk Akun Google (Cara B: WhatsApp & Distrik Lokal dapat dilengkapi kapan saja di Pengaturan Profil)
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
            <div className={`w-10 h-10 rounded-2xl text-[#F4EFE6] flex items-center justify-center shadow-md ${
              roleMode === 'admin' ? 'bg-stone-900' : 'bg-[#3B4B34]'
            }`}>
              {roleMode === 'admin' ? (
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              ) : tab === 'register' ? (
                <UserPlus className="w-5 h-5 text-amber-200" />
              ) : (
                <User className="w-5 h-5 text-amber-200" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg font-serif font-bold text-[#1C1917]">
                {roleMode === 'admin' 
                  ? 'Login Portal Administrator' 
                  : tab === 'register' 
                    ? 'Daftar Akun Pembaca' 
                    : 'Masuk Akun Pembaca'}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#78716C]">
                {roleMode === 'admin' 
                  ? 'Akses khusus administrator dan pengelola sistem.' 
                  : 'Akses santapan firman, saat teduh & bagi nikmat.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Pemilih Peran Akun Secara Tegas */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#EAE3D5] rounded-2xl mb-3 border border-[#1C1917]/10">
          <button
            type="button"
            onClick={() => {
              setRoleMode('reader');
              setErrorMsg('');
              setSuccessMsg('');
              setEmail('');
              setPassword('');
            }}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              roleMode === 'reader'
                ? 'bg-[#3B4B34] text-white shadow-md'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Akun Pembaca</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRoleMode('admin');
              setErrorMsg('');
              setSuccessMsg('');
              setEmail('');
              setPassword('');
            }}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              roleMode === 'admin'
                ? 'bg-stone-900 text-white shadow-md'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Akun Admin</span>
          </button>
        </div>

        {/* JIKA MODE ADMIN */}
        {roleMode === 'admin' ? (
          <div className="space-y-3">

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

            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1C1917]">Username Administrator</label>
                <Input
                  type="text"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin123"
                  className="rounded-xl bg-white border-[#1C1917]/15 focus:border-stone-900 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1C1917]">Password Administrator</label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="123456"
                  className="rounded-xl bg-white border-[#1C1917]/15 focus:border-stone-900"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 h-11 font-bold text-xs rounded-full bg-stone-900 hover:bg-black text-white shadow-md btn-lift flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Memverifikasi Admin...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Masuk Sebagai Administrator
                  </>
                )}
              </Button>
            </form>
          </div>
        ) : (
          /* JIKA MODE PEMBACA / USER */
          <Tabs value={tab} onValueChange={(val) => { setTab(val); setErrorMsg(''); setSuccessMsg(''); }} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-3 rounded-full bg-[#EFE9DF] p-1 border border-[#1C1917]/8">
              <TabsTrigger 
                value="login" 
                className="rounded-full text-xs font-bold data-[state=active]:bg-[#3B4B34] data-[state=active]:text-white transition-all"
              >
                Masuk Pembaca
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="rounded-full text-xs font-bold data-[state=active]:bg-[#3B4B34] data-[state=active]:text-white transition-all"
              >
                Daftar Baru
              </TabsTrigger>
            </TabsList>


            {/* Tombol Masuk dengan Google */}
            <div className="space-y-2.5 mb-3">
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
                  atau isi data pembaca
                </span>
                <div className="border-t border-[#1C1917]/10 w-full" />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2 mb-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                <div className="flex-1 font-medium">{errorMsg}</div>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <div className="font-semibold">{successMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {tab === 'register' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1C1917] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#3B4B34]" />
                      <span>Nama Lengkap Pembaca</span>
                    </label>
                    <Input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Contoh: Budi Pembaca"
                      className="rounded-xl bg-white border-[#1C1917]/15 focus:border-[#3B4B34]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#1C1917] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Nomor WhatsApp</span>
                      </label>
                      <Input
                        type="tel"
                        required
                        value={whatsapp}
                        onChange={e => setWhatsapp(e.target.value)}
                        placeholder="0812-3456-7890"
                        className="rounded-xl bg-white border-[#1C1917]/15 focus:border-[#3B4B34]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#1C1917] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span>Distrik - Lokal</span>
                      </label>
                      <Input
                        type="text"
                        required
                        value={distrikLokal}
                        onChange={e => setDistrikLokal(e.target.value)}
                        placeholder="Contoh: Surabaya - Rungkut"
                        className="rounded-xl bg-white border-[#1C1917]/15 focus:border-[#3B4B34]"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1C1917]">
                  {tab === 'register' ? 'Email Pembaca' : 'Email atau Username Pembaca'}
                </label>
                <Input
                  type={tab === 'register' ? 'email' : 'text'}
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={tab === 'register' ? 'nama@email.com' : 'user atau email Anda'}
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
                  placeholder="Password akun"
                  className="rounded-xl bg-white border-[#1C1917]/15 focus:border-[#3B4B34]"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 h-11 font-bold text-xs rounded-full bg-[#3B4B34] hover:bg-[#20251A] text-white shadow-md btn-lift"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Memproses...
                  </>
                ) : tab === 'register' ? (
                  'Daftar Akun Pembaca'
                ) : (
                  'Masuk Sebagai Pembaca'
                )}
              </Button>
            </form>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
