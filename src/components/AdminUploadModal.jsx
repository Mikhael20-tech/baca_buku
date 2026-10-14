import React, { useState } from 'react';
import ePub from 'epubjs';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { saveBookToIndexedDB } from '../lib/bookStorage';
import { Upload, Loader2, Book, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function AdminUploadModal({ isOpen, onClose, onUploadSuccess, onOpenAuthModal }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Filsafat & Pengembangan Diri');
  const [description, setDescription] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [coverBlobUrl, setCoverBlobUrl] = useState(null);

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

      const extractedTitle = metadata.title || selectedFile.name.replace(/\.epub$/i, '');
      setTitle(extractedTitle);
      setAuthor(metadata.creator || 'Penulis Tidak Diketahui');
      setDescription(metadata.description || '');

      // Otomatis deteksi jika file adalah FKKP (Kebangunan Pagi)
      const combinedCheck = `${selectedFile.name} ${extractedTitle}`.toLowerCase();
      if (combinedCheck.includes('fkkp') || combinedCheck.includes('kebangunan pagi')) {
        setCategory('FKKP (Kebangunan Pagi)');
      }

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 border-border shadow-2xl">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Book className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Tambah Koleksi Buku EPUB</DialogTitle>
              <DialogDescription className="text-xs">
                Unggah berkas .epub ke koleksi pembaca cloud atau memori browser lokal
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {errorMsg === 'AUTH_REQUIRED' ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs space-y-3">
            <div className="flex items-start gap-2 text-amber-900 dark:text-amber-100">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="font-bold">Belum Terautentikasi di Akun Supabase</p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Untuk menyimpan berkas langsung ke cloud storage Supabase, Anda perlu masuk ke akun Supabase. Anda juga dapat memilih <b>Simpan di Browser Lokal</b> agar buku bisa langsung dibaca detik ini juga!
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              {onOpenAuthModal && (
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal();
                  }}
                  className="rounded-xl font-semibold text-xs"
                >
                  Login Akun Admin Sekarang
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={saveBookLocally}
                className="rounded-xl font-semibold text-xs"
              >
                Simpan di Browser Lokal (Baca Sekarang)
              </Button>
            </div>
          </div>
        ) : errorMsg ? (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-foreground block mb-1">
              File Dokumen (.epub) <span className="text-destructive">*</span>
            </label>
            <div className="border-2 border-dashed border-border hover:border-amber-500/60 rounded-2xl p-4 transition text-center cursor-pointer relative bg-muted/30">
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
                  <p className="font-semibold text-foreground text-xs">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">
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
            <div className="space-y-1">
              <label className="font-semibold text-foreground block">
                Judul Buku <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                required
                placeholder="Contoh: Buku Karakter"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground block">
                Penulis <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                required
                placeholder="Contoh: Witness Lee"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground block">Kategori</label>
            <Input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            {/* Rekomendasi Kategori Cepat */}
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              {[
                'FKKP (Kebangunan Pagi)',
                'Pembinaan Karakter',
                'Pembinaan Dasar',
                'Biografi & Teladan Hayat',
                'Filsafat & Pengembangan Diri'
              ].map(cat => (
                <Badge
                  key={cat}
                  variant={category === cat ? "default" : "outline"}
                  onClick={() => setCategory(cat)}
                  className="cursor-pointer text-[10px] px-2.5 py-0.5 rounded-lg"
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground block">Sinopsis Singkat</label>
            <Textarea
              rows={3}
              placeholder="Ringkasan atau gambaran isi buku..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>

          <DialogFooter className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/50">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={saveBookLocally}
              disabled={isUploading || isParsing || !file}
              className="rounded-xl text-xs font-semibold"
              title="Simpan buku di memori browser lokal tanpa perlu login"
            >
              Simpan Lokal (Tanpa Login)
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-xl text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isUploading || isParsing || !file}
                className="rounded-xl text-xs font-semibold gap-1.5"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" /> Simpan ke Cloud
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
