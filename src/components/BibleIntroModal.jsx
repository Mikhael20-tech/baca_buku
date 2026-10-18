import React, { useState, useEffect } from 'react';
import { Sparkles, X, BookOpen, Clock, MapPin, User, Users, FileText, Scroll, Compass, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BibleIntroModal({ isOpen, onClose, bookData, bibleLang, initialTab = 'book' }) {
  if (!isOpen || !bookData || !bookData.intro) return null;

  const intro = bookData.intro;
  const isEn = bibleLang === 'en' || bibleLang === 'scofield';
  const isScofield = bibleLang === 'scofield' || bookData.translation_short === 'Scofield 1917';

  const [activeTab, setActiveTab] = useState(initialTab || 'book');
  const [frontmatter, setFrontmatter] = useState(null);
  const [isLoadingFrontmatter, setIsLoadingFrontmatter] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen || !isScofield) return;
    if (frontmatter) return;

    setIsLoadingFrontmatter(true);
    fetch('/bible/scofield/frontmatter_scofield_1917.json')
      .then(res => res.json())
      .then(data => {
        setFrontmatter(data);
        setIsLoadingFrontmatter(false);
      })
      .catch(err => {
        console.error('Failed to load Scofield frontmatter:', err);
        setIsLoadingFrontmatter(false);
      });
  }, [isOpen, isScofield, frontmatter]);

  const subject = isEn ? intro.Subject : (intro.Pokok || intro.Subject);
  const author = isEn ? intro.Author : (intro.Penulis || intro.Author);
  const time = isEn ? intro['Time of Writing'] : (intro['Waktu Penulisan'] || intro['Time of Writing']);
  const place = isEn ? intro['Place of Writing'] : (intro['Tempat penulisan'] || intro['Tempat Penulisan'] || intro['Place of Writing']);
  const recipients = isEn ? intro.Recipients : (intro.Penerima || intro.Recipients);

  const scofieldTabs = [
    { id: 'book', label: `Kitab: ${bookData.name}`, icon: BookOpen },
    { id: 'preface', label: 'Preface (1917)', icon: Scroll },
    { id: 'intro', label: 'Introduction (1909)', icon: FileText },
    { id: 'panoramic', label: 'Panoramic View', icon: Eye },
    { id: 'pentateuch', label: 'The Pentateuch', icon: Compass }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-modal-backdrop-in"
      onClick={onClose}
    >
      <div 
        className="bg-[#fcfaf5] dark:bg-zinc-900 rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-amber-300/80 dark:border-amber-700/60 max-h-[88vh] flex flex-col space-y-3.5 animate-modal-card-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-200/70 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-zinc-100 font-serif truncate">
                {isScofield 
                  ? `The Scofield Reference Bible (1917)` 
                  : isEn ? `Book Overview: ${bookData.name}` : `Pengantar Kitab: ${bookData.name}`}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono truncate">
                {isScofield 
                  ? 'Expository Notes, Dispersations & Dokumen Otentik Oxford 1917' 
                  : isEn ? 'Holy Bible Recovery Version • Footnotes & Outlines' : 'Alkitab Versi Pemulihan • Catatan Kaki & Garis Besar'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector Khusus Scofield (Horizontal Scrollable) */}
        {isScofield && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none border-b border-amber-200/40 dark:border-zinc-800">
            {scofieldTabs.map(tab => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-500/10 text-stone-700 dark:text-stone-300 hover:bg-amber-500/20'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Content Body */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4 text-xs sm:text-sm">
          {/* TAB 1: PENGANTAR KITAB INDIVIDUAL */}
          {activeTab === 'book' && (
            <>
              {/* Scofield Book Introduction Text */}
              {intro.text && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-amber-200/80 dark:border-zinc-700 space-y-3 shadow-2xs font-serif">
                  <div className="border-b border-amber-200/60 dark:border-zinc-700 pb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400 block">
                      {intro.title || `${bookData.name} — Book Introduction`}
                    </span>
                  </div>
                  <div className="text-stone-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed space-y-3 whitespace-pre-line text-justify">
                    {intro.text}
                  </div>
                </div>
              )}

              {/* Pokok / Subject (Highlighted Card) */}
              {subject && (
                <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-950 dark:text-amber-200 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400 block">
                    {isEn ? 'Central Subject / Theme' : 'Pokok Utama Kitab'}
                  </span>
                  <p className="font-serif italic font-bold leading-relaxed text-sm sm:text-base">
                    "{subject}"
                  </p>
                </div>
              )}

              {/* Grid Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {author && (
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px] font-bold">
                      <User className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isEn ? 'Author' : 'Penulis'}</span>
                    </div>
                    <p className="text-slate-800 dark:text-zinc-200 font-medium leading-relaxed">
                      {author}
                    </p>
                  </div>
                )}

                {time && (
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px] font-bold">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isEn ? 'Time of Writing' : 'Waktu Penulisan'}</span>
                    </div>
                    <p className="text-slate-800 dark:text-zinc-200 font-medium leading-relaxed">
                      {time}
                    </p>
                  </div>
                )}

                {place && (
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px] font-bold">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isEn ? 'Place of Writing' : 'Tempat Penulisan'}</span>
                    </div>
                    <p className="text-slate-800 dark:text-zinc-200 font-medium leading-relaxed">
                      {place}
                    </p>
                  </div>
                )}

                {recipients && (
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px] font-bold">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span>{isEn ? 'Recipients' : 'Penerima'}</span>
                    </div>
                    <p className="text-slate-800 dark:text-zinc-200 font-medium leading-relaxed">
                      {recipients}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: PREFACE (1917) */}
          {activeTab === 'preface' && (
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-800/60 border border-amber-200/80 dark:border-zinc-700 space-y-4 font-serif">
              <div className="border-b border-amber-200/60 dark:border-zinc-700 pb-3 text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-amber-700 dark:text-amber-400 block mb-1">
                  Oxford University Press • 1917 Edition
                </span>
                <h4 className="font-bold text-lg sm:text-xl text-stone-900 dark:text-zinc-100">
                  Preface to the Present Edition
                </h4>
              </div>
              {isLoadingFrontmatter ? (
                <div className="py-12 text-center text-xs text-stone-500">Memuat naskah asli...</div>
              ) : frontmatter?.preface ? (
                <div className="text-stone-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed space-y-3 whitespace-pre-line text-justify">
                  {frontmatter.preface}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-stone-500">Dokumen tidak ditemukan.</div>
              )}
            </div>
          )}

          {/* TAB 3: INTRODUCTION (1909) */}
          {activeTab === 'intro' && (
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-800/60 border border-amber-200/80 dark:border-zinc-700 space-y-4 font-serif">
              <div className="border-b border-amber-200/60 dark:border-zinc-700 pb-3 text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-amber-700 dark:text-amber-400 block mb-1">
                  Original Edition • 1909
                </span>
                <h4 className="font-bold text-lg sm:text-xl text-stone-900 dark:text-zinc-100">
                  Introduction (To Be Read)
                </h4>
                <p className="text-xs text-stone-500 font-sans mt-0.5">11 Prinsip &amp; Keistimewaan Sistem Referensi Scofield</p>
              </div>
              {isLoadingFrontmatter ? (
                <div className="py-12 text-center text-xs text-stone-500">Memuat naskah asli...</div>
              ) : frontmatter?.introduction ? (
                <div className="text-stone-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed space-y-3 whitespace-pre-line text-justify">
                  {frontmatter.introduction}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-stone-500">Dokumen tidak ditemukan.</div>
              )}
            </div>
          )}

          {/* TAB 4: A PANORAMIC VIEW OF THE BIBLE */}
          {activeTab === 'panoramic' && (
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-800/60 border border-amber-200/80 dark:border-zinc-700 space-y-4 font-serif">
              <div className="border-b border-amber-200/60 dark:border-zinc-700 pb-3 text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-amber-700 dark:text-amber-400 block mb-1">
                  Biblical Panorama
                </span>
                <h4 className="font-bold text-lg sm:text-xl text-stone-900 dark:text-zinc-100">
                  A Panoramic View of the Bible
                </h4>
                <p className="text-xs text-stone-500 font-sans mt-0.5">Kesatuan Menyeluruh 66 Kitab Menuju Pribadi Yesus Kristus</p>
              </div>
              {isLoadingFrontmatter ? (
                <div className="py-12 text-center text-xs text-stone-500">Memuat naskah asli...</div>
              ) : frontmatter?.panoramic_view ? (
                <div className="text-stone-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed space-y-3 whitespace-pre-line text-justify">
                  {frontmatter.panoramic_view}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-stone-500">Dokumen tidak ditemukan.</div>
              )}
            </div>
          )}

          {/* TAB 5: THE PENTATEUCH */}
          {activeTab === 'pentateuch' && (
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-800/60 border border-amber-200/80 dark:border-zinc-700 space-y-4 font-serif">
              <div className="border-b border-amber-200/60 dark:border-zinc-700 pb-3 text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-amber-700 dark:text-amber-400 block mb-1">
                  The Five Books of Moses
                </span>
                <h4 className="font-bold text-lg sm:text-xl text-stone-900 dark:text-zinc-100">
                  The Pentateuch
                </h4>
                <p className="text-xs text-stone-500 font-sans mt-0.5">Struktur Rohani: Kejadian, Keluaran, Imamat, Bilangan, Ulangan</p>
              </div>
              {isLoadingFrontmatter ? (
                <div className="py-12 text-center text-xs text-stone-500">Memuat naskah asli...</div>
              ) : frontmatter?.the_pentateuch ? (
                <div className="text-stone-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed space-y-3 whitespace-pre-line text-justify">
                  {frontmatter.the_pentateuch}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-stone-500">Dokumen tidak ditemukan.</div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center">
          <span className="text-[11px] text-stone-500 font-mono">
            {isScofield ? 'The Scofield Reference Bible 1917' : 'Alkitab Versi Pemulihan'}
          </span>
          <Button
            size="sm"
            onClick={onClose}
            className="rounded-xl px-5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
          >
            {isEn ? 'Close' : 'Tutup'}
          </Button>
        </div>
      </div>
    </div>
  );
}
