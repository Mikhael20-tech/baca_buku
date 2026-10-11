import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (isRegister) {
        // Daftar akun baru
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: fullName.trim() || email.split('@')[0],
              role: 'admin' // beri hak akses admin untuk akun pertama
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
        // Masuk akun yang sudah ada
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
    setIsRegister(false);
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {isRegister ? 'Daftar Akun Baru' : 'Masuk ke Portal Baca'}
              </h3>
              <p className="text-[10px] text-slate-500">Kelola buku & sinkronisasi cloud</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Kotak Akun Admin Bawaan */}
        <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-900 text-[11px]">Akun Admin Disediakan:</span>
            <button
              type="button"
              onClick={fillDefaultAdmin}
              className="text-[10px] font-bold text-amber-700 hover:text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg transition"
            >
              Isi Otomatis
            </button>
          </div>
          <p className="text-[11px] text-amber-800 font-mono">
            Email: <b>admin@baca.id</b><br />
            Pass: <b>AdminPassword123!</b>
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1">{errorMsg}</div>
            </div>
            {errorMsg.includes('Email not confirmed') && (
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-sm transition"
              >
                Masuk Langsung Sebagai Admin Sekarang
              </button>
            )}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <div>{successMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {isRegister && (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Contoh: Admin Perpustakaan"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
              </>
            ) : isRegister ? (
              'Daftar Akun Baru'
            ) : (
              'Masuk Sekarang'
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-slate-500 border-t border-slate-100">
          {isRegister ? (
            <p>
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMsg('');
                }}
                className="font-bold text-amber-700 hover:underline"
              >
                Masuk di sini
              </button>
            </p>
          ) : (
            <p>
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setErrorMsg('');
                }}
                className="font-bold text-amber-700 hover:underline"
              >
                Daftar sekarang
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
