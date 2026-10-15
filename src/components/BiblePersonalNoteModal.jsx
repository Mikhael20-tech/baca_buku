import React, { useState, useEffect } from 'react';
import { X, BookMarked, Save, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BiblePersonalNoteModal({
  isOpen,
  onClose,
  verseData,
  initialNote = '',
  onSaveNote,
  onDeleteNote,
  bibleLang = 'id'
}) {
  const [noteText, setNoteText] = useState(initialNote);
  const isEn = bibleLang === 'en';

  useEffect(() => {
    if (isOpen) {
      setNoteText(initialNote || '');
    }
  }, [isOpen, initialNote]);

  if (!isOpen || !verseData) return null;

  const verseKey = `${verseData.bookId}-${verseData.chapter}-${verseData.verse}`;
  const citation = `${verseData.bookName} ${verseData.chapter}:${verseData.verse}`;

  const cleanVerseText = (text) => {
    if (!text) return '';
    return text.replace(/<fn n="\d+"\/>/g, '').replace(/\s+/g, ' ').trim();
  };

  const handleSave = () => {
    if (!noteText.trim()) {
      if (initialNote) {
        onDeleteNote(verseKey);
      }
      onClose();
      return;
    }
    onSaveNote(verseKey, noteText.trim());
    onClose();
  };

  const handleDelete = () => {
    if (confirm(isEn ? 'Delete this note?' : 'Hapus catatan ini?')) {
      onDeleteNote(verseKey);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-modal-backdrop-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-amber-300/80 dark:border-amber-700/60 flex flex-col space-y-4 max-h-[85vh] animate-modal-card-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-zinc-100">
                {isEn ? 'Personal Reflection Note' : 'Catatan Renungan Pribadi'}
              </h3>
              <p className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                {citation}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verse Excerpt Preview */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 text-xs text-slate-600 dark:text-zinc-300 italic font-serif leading-relaxed">
          "{cleanVerseText(verseData.text)}"
        </div>

        {/* Note Textarea */}
        <div className="flex-1 flex flex-col space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
            {isEn ? 'Your Notes & Insights:' : 'Catatan & Inspirasi Anda:'}
          </label>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={isEn ? "Write your spiritual notes, revelations, or personal prayers here..." : "Tuliskan renungan rohani, terang firman, atau doa pribadi Anda di sini..."}
            rows={6}
            className="w-full p-3.5 bg-amber-50/30 dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-zinc-100 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 resize-none font-sans"
            autoFocus
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
          {initialNote ? (
            <button
              onClick={handleDelete}
              className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isEn ? 'Delete Note' : 'Hapus'}</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="rounded-xl text-xs font-semibold"
            >
              {isEn ? 'Cancel' : 'Batal'}
            </Button>
            <Button
              onClick={handleSave}
              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isEn ? 'Save Note' : 'Simpan Catatan'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
