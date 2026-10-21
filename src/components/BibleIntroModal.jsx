import React, { useState, useEffect } from 'react';
import { Sparkles, X, BookOpen, Clock, MapPin, User, Users, FileText, Scroll, Compass, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

function renderFormattedDoc(text) {
  if (!text) return null;
  const paragraphs = text.split(/\n\s*\n/);

  return (
    <div className="space-y-4">
      {paragraphs.map((p, idx) => {
        const trimmed = p.trim();
        if (!trimmed) return null;

        // Signature / Date lines
        if (
          trimmed.includes('C. I. SCOFIELD') ||
          trimmed.startsWith('"Greyshingles"') ||
          trimmed.startsWith('Jan. 1909') ||
          trimmed.startsWith('Jan. 1, 1917')
        ) {
          return (
            <div key={idx} className="pt-3 pb-1 border-t border-amber-200/60 dark:border-zinc-700/60 text-right">
              <p className="font-serif italic font-bold text-stone-800 dark:text-zinc-200 text-sm whitespace-pre-line">
                {trimmed}
              </p>
            </div>
          );
        }

        // Roman numeral features (I. to XI.) or Major divisions (First. to Fifth.)
        const isRomanFeature = /^[I|V|X]+\.\s/.test(trimmed);
        const isOrdinalDivision = /^(First|Second|Third|Fourth|Fifth)\.\s/.test(trimmed);

        if (isRomanFeature || isOrdinalDivision) {
          const lines = trimmed.split('\n');
          const heading = lines[0];
          const body = lines.slice(1).join('\n');

          return (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 dark:bg-zinc-800/60 border border-amber-200/80 dark:border-zinc-700 space-y-2.5 shadow-2xs"
            >
              <h5 className="font-sans font-extrabold text-amber-900 dark:text-amber-300 text-sm sm:text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400 shrink-0 inline-block" />
                <span>{heading}</span>
              </h5>
              {body && (
                <div className="font-serif text-stone-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed whitespace-pre-line text-justify">
                  {body}
                </div>
              )}
            </div>
          );
        }

        // Bulleted lists or grouped classifications (e.g. • or - or numbered items)
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || /^\d+\.\s+[A-Z]+/.test(trimmed)) {
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-800/40 border border-amber-200/50 dark:border-zinc-700/60 font-serif text-sm sm:text-base leading-relaxed whitespace-pre-line text-stone-800 dark:text-zinc-200 space-y-1 shadow-2xs"
            >
              {trimmed}
            </div>
          );
        }

        // Footnote section
        if (trimmed.toLowerCase().startsWith('footnote:')) {
          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-amber-100/50 dark:bg-zinc-800/80 border border-amber-200/80 dark:border-zinc-700 text-xs font-serif text-stone-700 dark:text-zinc-300 whitespace-pre-line"
            >
              {trimmed}
            </div>
          );
        }

        // Default paragraph
        return (
          <p
            key={idx}
            className="font-serif text-stone-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed text-justify"
          >
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

export default function BibleIntroModal({ isOpen, onClose, bookData, bibleLang, initialTab = 'book' }) {
  const isEn = ['en', 'kjv', 'asv', 'net', 'scofield'].includes(bibleLang);
  const isScofield = bibleLang === 'scofield' || bookData?.translation_short === 'Scofield 1917' || initialTab !== 'book';

  if (!isOpen) return null;
  if (!isScofield && (!bookData || !bookData.intro)) return null;

  const intro = bookData?.intro || {};

  const [activeTab, setActiveTab] = useState(initialTab || (isScofield && !intro.text ? 'preface' : 'book'));
  const [frontmatter, setFrontmatter] = useState(null);
  const [isLoadingFrontmatter, setIsLoadingFrontmatter] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, frontmatter]);

  const subject = isEn ? intro.Subject : (intro.Pokok || intro.Subject);
  const author = isEn ? intro.Author : (intro.Penulis || intro.Author);
  const time = isEn ? intro['Time of Writing'] : (intro['Waktu Penulisan'] || intro['Time of Writing']);
  const place = isEn ? intro['Place of Writing'] : (intro['Tempat penulisan'] || intro['Tempat Penulisan'] || intro['Place of Writing']);
  const recipients = isEn ? intro.Recipients : (intro.Penerima || intro.Recipients);

  const scofieldTabs = [
    ...(bookData?.name && intro.text ? [{ id: 'book', label: `Kitab: ${bookData.name}`, icon: BookOpen }] : []),
    { id: 'preface', label: 'Preface (1917)', icon: Scroll },
    { id: 'intro', label: 'Introduction (1909)', icon: FileText },
    { id: 'panoramic', label: 'Panoramic View', icon: Eye },
    { id: 'pentateuch', label: 'The Pentateuch', icon: Compass },
    { id: 'malachi_to_matthew', label: 'Malachi to Matthew', icon: Clock },
    { id: 'four_gospels', label: 'The Four Gospels', icon: BookOpen }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-modal-backdrop-in"
      onClick={onClose}
    >
      <div 
        className="bg-[#fcfaf5] dark:bg-zinc-900 rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-amber-300/80 dark:border-amber-700/60 max-h-[90vh] flex flex-col gap-3.5 animate-modal-card-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-200/70 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-zinc-100 font-serif truncate">
                {isScofield 
                  ? `The Scofield Reference Bible (1917)` 
                  : isEn ? `Book Overview: ${bookData?.name}` : `Pengantar Kitab: ${bookData?.name}`}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono truncate">
                {isScofield 
                  ? 'Expository Notes, Dispensations & Dokumen Otentik Oxford 1917' 
                  : isEn ? 'Holy Bible Recovery Version • Footnotes & Outlines' : 'Alkitab Versi Pemulihan • Catatan Kaki & Garis Besar'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector Khusus Scofield (Horizontal Scrollable with proper vertical clearance) */}
        {isScofield && (
          <div className="shrink-0 flex items-center gap-2 overflow-x-auto py-1.5 px-0.5 scrollbar-none border-b border-amber-200/60 dark:border-zinc-800">
            {scofieldTabs.map(tab => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/30'
                      : 'bg-amber-500/10 text-stone-700 dark:text-stone-300 hover:bg-amber-500/20'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5 shrink-0" />
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
                <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-800/60 border border-amber-200/80 dark:border-zinc-700 space-y-3 shadow-2xs font-serif">
                  <div className="border-b border-amber-200/60 dark:border-zinc-700 pb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400 block">
                      {intro.title || `${bookData?.name} — Book Introduction`}
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
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
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
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
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
                      <Users className="w-3.5 h-3.5 text-amber-600" />
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
            <div className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-zinc-800/60 border border-amber-200/80 dark:border-zinc-700 space-y-5 font-serif shadow-xs">
              <div className="border-b border-amber-200/70 dark:border-zinc-700 pb-3 text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-amber-700 dark:text-amber-400 block mb-1">
                  Oxford University Press • 1917 Edition
                </span>
                <h4 className="font-extrabold text-lg sm:text-2xl text-stone-900 dark:text-zinc-100 font-serif">
                  Preface to the Present Edition
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-sans mt-1">
                  Penjelasan Pembaruan Teks, Tipografi Baru & Sistem Referensi Rantai
                </p>
              </div>

              {isLoadingFrontmatter ? (
                <div className="py-12 text-center text-xs text-stone-500">Memuat naskah otentik...</div>
              ) : frontmatter?.preface ? (
                renderFormattedDoc(frontmatter.preface)
              ) : (
                <div className="py-12 text-center text-xs text-stone-500">Dokumen tidak ditemukan.</div>
              )}
            </div>
          )}

          {/* TAB 3: INTRODUCTION (1909) */}
          {activeTab === 'intro' && (
            <div className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-zinc-800/60 border border-amber-200/80 dark:border-zinc-700 space-y-5 font-serif shadow-xs">
              <div className="border-b border-amber-200/70 dark:border-zinc-700 pb-3 text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-amber-700 dark:text-amber-400 block mb-1">
                  First Edition 1909 • Essential Treatise
                </span>
                <h4 className="font-extrabold text-lg sm:text-2xl text-stone-900 dark:text-zinc-100 font-serif">
                  Introduction (To Be Read)
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-sans mt-1">
                  11 Fitur & Keistimewaan Utama Scofield Reference Bible
                </p>
              </div>

              {isLoadingFrontmatter ? (
                <div className="py-12 text-center text-xs text-stone-500">Memuat naskah otentik...</div>
              ) : frontmatter?.introduction ? (
                renderFormattedDoc(frontmatter.introduction)
              ) : (
                <div className="py-12 text-center text-xs text-stone-500">Dokumen tidak ditemukan.</div>
              )}
            </div>
          )}

          {/* TAB 4: A PANORAMIC VIEW OF THE BIBLE */}
          {activeTab === 'panoramic' && (
            <div className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-zinc-800/60 border border-amber-200/80 dark:border-zinc-700 space-y-5 font-serif shadow-xs">
              <div className="border-b border-amber-200/70 dark:border-zinc-700 pb-3 text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-amber-700 dark:text-amber-400 block mb-1">
                  Biblical Panorama • Scofield 1917
                </span>
                <h4 className="font-extrabold text-lg sm:text-2xl text-stone-900 dark:text-zinc-100 font-serif">
                  A Panoramic View of the Bible
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-sans mt-1">
                  Kesatuan Menyeluruh 66 Kitab Menuju Pribadi & Karya Kristus
                </p>
              </div>

              {isLoadingFrontmatter ? (
                <div className="py-12 text-center text-xs text-stone-500">Memuat naskah otentik...</div>
              ) : frontmatter?.panoramic_view ? (
                renderFormattedDoc(frontmatter.panoramic_view)
              ) : (
                <div className="py-12 text-center text-xs text-stone-500">Dokumen tidak ditemukan.</div>
              )}
            </div>
          )}

          {/* TAB 5: THE PENTATEUCH */}
          {activeTab === 'pentateuch' && (
            <div className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-zinc-800/60 border border-amber-200/80 dark:border-zinc-700 space-y-5 font-serif shadow-xs">
              <div className="border-b border-amber-200/70 dark:border-zinc-700 pb-3 text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-amber-700 dark:text-amber-400 block mb-1">
                  The Five Books of Moses • Scofield 1917
                </span>
                <h4 className="font-extrabold text-lg sm:text-2xl text-stone-900 dark:text-zinc-100 font-serif">
                  The Pentateuch
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-sans mt-1">
                  Pengantar 5 Kitab Taurat: Fondasi Wahyu Progresif & Keaslian Sejarah Musa
                </p>
              </div>

              {isLoadingFrontmatter ? (
                <div className="py-12 text-center text-xs text-stone-500">Memuat naskah otentik...</div>
              ) : frontmatter?.the_pentateuch ? (
                renderFormattedDoc(frontmatter.the_pentateuch)
              ) : (
                <div className="py-12 text-center text-xs text-stone-500">Dokumen tidak ditemukan.</div>
              )}
            </div>
          )}

          {/* TAB 6: FROM MALACHI TO MATTHEW */}
          {activeTab === 'malachi_to_matthew' && (
            <div className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-zinc-800/60 border border-amber-200/80 dark:border-zinc-700 space-y-5 font-serif shadow-xs">
              <div className="border-b border-amber-200/70 dark:border-zinc-700 pb-3 text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-amber-700 dark:text-amber-400 block mb-1">
                  The Intertestamental Period • Scofield 1917
                </span>
                <h4 className="font-extrabold text-lg sm:text-2xl text-stone-900 dark:text-zinc-100 font-serif">
                  From Malachi to Matthew
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-sans mt-1">
                  Jembatan Sejarah &amp; Rohani Masa 400 Tahun Keheningan Profetik Menuju Kedatangan Kristus
                </p>
              </div>

              {isLoadingFrontmatter ? (
                <div className="py-12 text-center text-xs text-stone-500">Memuat naskah otentik...</div>
              ) : frontmatter?.from_malachi_to_matthew ? (
                renderFormattedDoc(frontmatter.from_malachi_to_matthew)
              ) : (
                <div className="py-12 text-center text-xs text-stone-500">Dokumen tidak ditemukan.</div>
              )}
            </div>
          )}

          {/* TAB 7: THE FOUR GOSPELS */}
          {activeTab === 'four_gospels' && (
            <div className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-zinc-800/60 border border-amber-200/80 dark:border-zinc-700 space-y-5 font-serif shadow-xs">
              <div className="border-b border-amber-200/70 dark:border-zinc-700 pb-3 text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-amber-700 dark:text-amber-400 block mb-1">
                  General Introduction • Scofield 1917
                </span>
                <h4 className="font-extrabold text-lg sm:text-2xl text-stone-900 dark:text-zinc-100 font-serif">
                  The Four Gospels
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-sans mt-1">
                  Pengantar Empat Injil &amp; 7 Prinsip Esensial Memahami Pribadi dan Karya Kristus
                </p>
              </div>

              {isLoadingFrontmatter ? (
                <div className="py-12 text-center text-xs text-stone-500">Memuat naskah otentik...</div>
              ) : frontmatter?.the_four_gospels ? (
                renderFormattedDoc(frontmatter.the_four_gospels)
              ) : (
                <div className="py-12 text-center text-xs text-stone-500">Dokumen tidak ditemukan.</div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-amber-200/60 dark:border-zinc-800 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
            {isScofield ? 'The Scofield Reference Bible 1917 • Oxford University Press' : (bookData?.translation || (isEn ? 'Holy Bible' : 'Alkitab Versi Pemulihan'))}
          </span>
          <Button
            size="sm"
            onClick={onClose}
            className="rounded-xl px-5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer shadow-xs"
          >
            {isEn ? 'Close' : 'Tutup'}
          </Button>
        </div>
      </div>
    </div>
  );
}
