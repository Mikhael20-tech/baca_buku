import React, { useState } from 'react';
import { X, BookMarked, Search, Trash2, ArrowRight, Calendar, Copy, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BibleNotesListModal({
  isOpen,
  onClose,
  notes = {},
  onSelectNote,
  onDeleteNote,
  bibleLang = 'id'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);
  const isEn = ['en', 'kjv', 'asv', 'net', 'scofield'].includes(bibleLang);

  if (!isOpen) return null;

  // Convert notes object to list
  const notesList = Object.entries(notes).map(([key, data]) => ({
    key,
    ...data
  })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const filteredNotes = notesList.filter(item => {
    const q = searchQuery.toLowerCase();
    const noteMatch = item.note?.toLowerCase().includes(q);
    const bookMatch = item.bookName?.toLowerCase().includes(q);
    const citation = `${item.bookName} ${item.chapter}:${item.verse}`.toLowerCase();
    return noteMatch || bookMatch || citation.includes(q);
  });

  const generateFormattedText = () => {
    const title = isEn ? '=== MY BIBLE REFLECTION NOTES ===' : '=== CATATAN RENUNGAN PRIBADI ALKITAB ===';
    const total = isEn ? `Total: ${filteredNotes.length} Notes` : `Total: ${filteredNotes.length} Catatan`;
    const lines = [title, total, ''];

    filteredNotes.forEach((item, idx) => {
      const langBadge = item.lang === 'id' ? 'AVP' : item.lang === 'en' ? 'RCV' : (item.lang || 'AVP').toUpperCase();
      lines.push(`${idx + 1}. ${item.bookName} ${item.chapter}:${item.verse} [${langBadge}]${item.date ? ` • ${item.date}` : ''}`);
      if (item.verseText) {
        lines.push(`   Ayat: "${item.verseText}"`);
      }
      lines.push(`   Renungan: ${item.note}`);
      lines.push('');
    });

    return lines.join('\n');
  };

  const handleCopyAllNotes = () => {
    if (filteredNotes.length === 0) return;
    const text = generateFormattedText();
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2200);
  };

  const handleDownloadNotes = () => {
    if (filteredNotes.length === 0) return;
    const text = generateFormattedText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isEn ? 'bible_reflection_notes.txt' : 'catatan_renungan_alkitab.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-modal-backdrop-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-amber-300/80 dark:border-amber-700/60 flex flex-col space-y-4 max-h-[85vh] animate-modal-card-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-zinc-100">
                {isEn ? 'My Personal Notes' : 'Catatan Renungan Pribadi'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                {notesList.length} {isEn ? 'saved notes' : 'catatan tersimpan'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {notesList.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleCopyAllNotes}
                  className="px-2.5 py-1 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-zinc-200 transition shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95"
                  title={isEn ? "Copy All Notes" : "Salin Semua Catatan"}
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-600" />}
                  <span className="hidden sm:inline">{copiedAll ? (isEn ? "Copied!" : "Tersalin!") : (isEn ? "Copy" : "Salin")}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadNotes}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-zinc-200 transition shadow-2xs cursor-pointer active:scale-95"
                  title={isEn ? "Download as .txt" : "Unduh berkas .txt"}
                >
                  <Download className="w-3.5 h-3.5 text-amber-600" />
                </button>
              </>
            )}
            <button 
              onClick={onClose}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? "Search your notes or verses..." : "Cari isi catatan atau ayat..."}
            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
          />
        </div>

        {/* Notes List */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="py-14 text-center space-y-2">
              <BookMarked className="w-10 h-10 mx-auto text-slate-300 dark:text-zinc-700" />
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {searchQuery 
                  ? (isEn ? 'No notes matched your search.' : 'Tidak ada catatan yang cocok dengan pencarian.')
                  : (isEn ? 'No personal notes yet. Tap any verse to write a reflection note.' : 'Belum ada catatan pribadi. Klik pada ayat apa saja untuk menulis renungan.')}
              </p>
            </div>
          ) : (
            filteredNotes.map(item => (
              <div
                key={item.key}
                className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 hover:border-amber-400 dark:hover:border-amber-600 transition space-y-2 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono font-bold text-xs text-amber-700 dark:text-amber-400">
                      📖 {item.bookName} {item.chapter}:{item.verse}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-bold font-mono text-[9px] uppercase">
                      {item.lang === 'id' ? 'AVP' : item.lang === 'en' ? 'RCV' : (item.lang || 'AVP').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.date && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </span>
                    )}
                    <button
                      onClick={() => onDeleteNote(item.key)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                      title={isEn ? 'Delete Note' : 'Hapus Catatan'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Note Text */}
                <p className="text-xs sm:text-sm text-slate-800 dark:text-zinc-200 font-sans leading-relaxed whitespace-pre-wrap">
                  {item.note}
                </p>

                {/* Verse Excerpt */}
                {item.verseText && (
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 italic font-serif border-l-2 border-amber-400/60 pl-2">
                    "{item.verseText}"
                  </div>
                )}

                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => {
                      onSelectNote({ bookId: item.bookId, chapter: item.chapter, verse: item.verse, lang: item.lang });
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 transition"
                  >
                    <span>{isEn ? 'Go to Verse' : 'Buka Ayat'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
