import React, { useState } from 'react';
import ePub from 'epubjs';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { saveBookToIndexedDB } from '../lib/bookStorage';
import { Upload, X, Loader2, Book, AlertCircle } from 'lucide-react';

export default function AdminUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Filsafat & Pengembangan Diri');
  const [description, setDescription] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [coverBlobUrl, setCoverBlobUrl] = useState(null);

  if (!isOpen) return null;

  // Baca metadata otomatis saat file dipilih
  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setErrorMsg('');
    setFile(selectedFile);
    setIsParsing(true);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const book = ePub(buffer);
      const metadata = await book.loaded.metadata;

      setTitle(metadata.title || selectedFile.name.replace(/\.epub$/i, ''));
      setAuthor(metadata.creator || 'Penulis Tidak Diketahui');
      setDescription(metadata.description || '');

      // Coba ekstrak cover jika ada
      try {
        const coverUrl = await book.loaded.cover;
        if (coverUrl) {
          const coverBlob = await book.archive.getBlob(coverUrl);
          if (coverBlob) {
            setCoverBlobUrl(URL.createObjectURL(coverBlob));
          }
        }
      } catch {
        // cover extraction is optional
      }
    } catch (err) {
      console.warn('Metadata tidak dapat diekstrak otomatis:', err);
      setTitle(selectedFile.name.replace(/\.epub$/i, ''));
    } finally {
      setIsParsing(false);
    }
  };

  const saveBookLocally = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const buffer = await file.arrayBuffer();
      const bookId = `local-${Date.now()}`;
      await saveBookToIndexedDB(bookId, buffer);

      const newLocalBook = {
        id: bookId,
        title: title.trim() || file.name,
        author: author.trim() || 'Penulis Tidak Diketahui',
        category: category.trim() || 'Umum',
        description: description.trim() || 'Buku diunggah dalam penyimpanan browser lokal.',
        cover_url: coverBlobUrl,
        file_path: `idb://${bookId}`,
        created_at: new Date().toISOString()
      };

      const existing = JSON.parse(localStorage.getItem('baca_demo_books') || '[]');
      localStorage.setItem('baca_demo_books', JSON.stringify([newLocalBook, ...existing]));

      if (typeof onUploadSuccess === 'function') {
        onUploadSuccess(newLocalBook);
      }
      onClose();
    } catch (err) {
      setErrorMsg('Gagal menyimpan berkas lokal: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setErrorMsg('');
    setIsUploading(true);

    try {
      // Jika Supabase belum dikonfigurasi (mode demo/lokal)
      if (!isSupabaseConfigured()) {
        saveBookLocally();
        return;
      }

      // Live Supabase Mode: Cek sesi login
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg('AUTH_REQUIRED');
        setIsUploading(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `epubs/${uniqueName}`;

      // 1. Upload ke Storage Private 'books'
      const { error: uploadError } = await supabase.storage
        .from('books')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Gagal upload storage: ${uploadError.message}. Pastikan bucket 'books' sudah dibuat di Supabase.`);
      }

      // 2. Insert baris baru ke tabel 'books'
      const { data: insertedBook, error: dbError } = await supabase.from('books').insert({
        title: title.trim() || file.name,
        author: author.trim() || 'Penulis Tidak Diketahui',
        category: category.trim() || 'Umum',
        description: description.trim() || '',
        cover_url: coverBlobUrl || null,
        file_path: filePath,
        created_by: user.id
      }).select().single();

      if (dbError) throw dbError;

      if (typeof onUploadSuccess === 'function') {
        onUploadSuccess(insertedBook);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat mengunggah buku.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Book className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Tambah Koleksi Buku EPUB</h3>
              <p className="text-[11px] text-slate-500">Unggah berkas .epub ke koleksi pembaca</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg === 'AUTH_REQUIRED' ? (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-3">
            <div className="flex items-start gap-2 text-amber-900">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="font-bold">Belum Terautentikasi di Akun Supabase</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Untuk menyimpan berkas langsung ke cloud storage Supabase, Anda perlu masuk ke akun Supabase. Anda juga dapat memilih <b>Simpan di Browser Lokal</b> agar buku bisa langsung dibaca detik ini juga!
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={saveBookLocally}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-xs shadow-sm transition"
              >
                Simpan di Browser Lokal (Baca Sekarang)
              </button>
            </div>
          </div>
        ) : errorMsg ? (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              File Dokumen (.epub) <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-2xl p-4 transition text-center cursor-pointer relative bg-slate-50/50">
              <input
                type="file"
                accept=".epub"
                required
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-7 h-7 mx-auto mb-2 text-amber-600" />
              {file ? (
                <div className="space-y-1">
                  <p className="font-semibold text-slate-800 text-xs">{file.name}</p>
                  <p className="text-[10px] text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <p className="text-slate-500 text-xs">
                  Klik atau seret file <span className="font-semibold text-amber-600">.epub</span> ke sini
                </p>
              )}
            </div>
            {isParsing && (
              <p className="text-[11px] text-amber-600 mt-2 flex items-center gap-1.5 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Membaca informasi judul dan penulis buku...
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Judul Buku <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Filosofi Teras"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Penulis <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Henry Manampiring"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Kategori</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Sinopsis Singkat</label>
            <textarea
              rows={3}
              placeholder="Ringkasan atau gambaran isi buku..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={saveBookLocally}
              disabled={isUploading || isParsing || !file}
              className="px-3.5 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition disabled:opacity-50 text-xs"
              title="Simpan buku di memori browser lokal tanpa perlu login"
            >
              Simpan Lokal (Tanpa Login)
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isUploading || isParsing || !file}
                className="px-5 py-2 font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2 transition text-xs"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> Simpan ke Cloud
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
