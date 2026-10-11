import React, { useState } from 'react';
import { X, BookOpen, Search, Bookmark, ChevronRight, Sparkles } from 'lucide-react';

const OT_BOOKS = [
  "Kejadian", "Keluaran", "Imamat", "Bilangan", "Ulangan",
  "Yosua", "Hakim-Hakim", "Rut", "1 Samuel", "2 Samuel",
  "1 Raja-Raja", "2 Raja-Raja", "1 Tawarikh", "2 Tawarikh", "Ezra",
  "Nehemia", "Ester", "Ayub", "Mazmur", "Amsal",
  "Pengkhotbah", "Kidung Agung", "Yesaya", "Yeremia", "Ratapan",
  "Yehezkiel", "Daniel", "Hosea", "Yoel", "Amos",
  "Obaja", "Yunus", "Mikha", "Nahum", "Habakuk",
  "Zefanya", "Hagai", "Zakharia", "Maleakhi"
];

const NT_BOOKS = [
  "Matius", "Markus", "Lukas", "Yohanes", "Kisah Para Rasul",
  "Roma", "1 Korintus", "2 Korintus", "Galatia", "Efesus",
  "Filipi", "Kolose", "1 Tesalonika", "2 Tesalonika", "1 Timotius",
  "2 Timotius", "Titus", "Filemon", "Ibrani", "Yakobus",
  "1 Petrus", "2 Petrus", "1 Yohanes", "2 Yohanes", "3 Yohanes",
  "Yudas", "Wahyu"
];

export default function BibleSelectorModal({ isOpen, onClose, onSelectBibleBook }) {
  const [activeTab, setActiveTab] = useState('PB'); // 'PB' | 'PL'
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const currentList = activeTab === 'PB' ? NT_BOOKS : OT_BOOKS;
  const filteredList = currentList.filter(b => b.toLowerCase().includes(search.toLowerCase()));

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 my-6 space-y-5 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                Alkitab Versi Pemulihan (66 Kitab)
              </h3>
              <p className="text-xs text-slate-500">
                Lengkap Perjanjian Lama &amp; Perjanjian Baru • Dari Kitab Kejadian sampai Kitab Wahyu
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex p-1 bg-slate-100 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('PB')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'PB'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Perjanjian Baru</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">27 Kitab</span>
            </button>
            <button
              onClick={() => setActiveTab('PL')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'PL'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Perjanjian Lama</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">39 Kitab</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama kitab..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Action Buka Seluruh Bagian */}
        <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="font-semibold">
              Buka seluruh volume {activeTab === 'PB' ? 'Perjanjian Baru (Matius – Wahyu)' : 'Perjanjian Lama (Kejadian – Maleakhi)'}
            </span>
          </div>
          <button
            onClick={() => onSelectBibleBook(activeTab === 'PB' ? 'PB_FULL' : 'PL_FULL')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1"
          >
            Baca Volume Ini <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Grid Daftar Kitab */}
        <div className="overflow-y-auto pr-1 flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {filteredList.map((bookName, idx) => (
              <button
                key={bookName}
                onClick={() => onSelectBibleBook(activeTab === 'PB' ? 'PB_BOOK' : 'PL_BOOK', bookName)}
                className="p-3 rounded-2xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 hover:shadow-xs transition text-left flex items-center justify-between group"
              >
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {idx + 1}.
                  </span>
                  <h5 className="font-bold text-xs text-slate-800 group-hover:text-amber-700 transition">
                    {bookName}
                  </h5>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => onSelectBibleBook('MATIUS_CATATAN')}
            className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Bookmark className="w-4 h-4 text-amber-600" />
            Injil Matius: Khusus dengan Catatan Kaki Interaktif Lengkap
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
