import React, { useState } from 'react';
import { BookOpen, Search, Bookmark, ChevronRight, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
  const [activeTab, setActiveTab] = useState('PL'); // 'PL' | 'PB'
  const [search, setSearch] = useState('');

  const currentList = activeTab === 'PB' ? NT_BOOKS : OT_BOOKS;
  const filteredList = currentList.filter(b => b.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-6 rounded-[32px] bg-[#F7F4ED] border border-[#1C1917]/15 text-[#1C1917] shadow-2xl">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-amber-400/30 blur-md pulse-glow" />
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-700 to-[#3B4B34] text-white flex items-center justify-center shadow-md book-flutter">
                <BookOpen className="w-5 h-5 text-amber-200" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base sm:text-xl font-bold font-serif text-[#1C1917]">
                  Alkitab Versi Pemulihan (66 Kitab)
                </DialogTitle>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/90 border border-amber-300/60 px-2 py-0.5 rounded-full pulse-glow">
                  Lengkap PL &amp; PB
                </span>
              </div>
              <DialogDescription className="text-xs text-[#78716C]">
                Lengkap Perjanjian Lama &amp; Perjanjian Baru • Dilengkapi Catatan Kaki Rohani &amp; Garis Besar
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
          {/* Tab Switcher & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
            <TabsList className="grid grid-cols-2 w-full sm:w-auto h-10 p-1 bg-[#EFE9DF] rounded-full border border-[#1C1917]/10">
              <TabsTrigger 
                value="PL" 
                className="gap-1.5 text-xs font-bold px-4 rounded-full data-[state=active]:bg-[#3B4B34] data-[state=active]:text-[#F4EFE6] transition-all"
              >
                <span>Perjanjian Lama</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-200/50 text-[#1C1917]">39</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="PB" 
                className="gap-1.5 text-xs font-bold px-4 rounded-full data-[state=active]:bg-[#3B4B34] data-[state=active]:text-[#F4EFE6] transition-all"
              >
                <span>Perjanjian Baru</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-200/50 text-[#1C1917]">27</Badge>
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama kitab..."
                className="pl-9 h-10 rounded-full bg-white/90 border-[#1C1917]/15 text-xs focus:ring-[#3B4B34]"
              />
            </div>
          </div>

          {/* Action Buka Seluruh Bagian (With Animated Glow) */}
          <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/5 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs mb-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-amber-950">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 pulse-glow" />
              <span className="font-bold truncate text-[11px] sm:text-xs">
                Buka seluruh volume {activeTab === 'PB' ? 'Perjanjian Baru (Matius – Wahyu)' : 'Perjanjian Lama (Kejadian – Maleakhi)'}
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => onSelectBibleBook(activeTab === 'PB' ? 'PB_FULL' : 'PL_FULL')}
              className="rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-[#F4EFE6] gap-1 shrink-0 btn-lift shadow-sm"
            >
              Baca Volume Ini <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Grid Daftar Kitab */}
          <div className="overflow-y-auto pr-1 flex-1 min-h-[260px]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {filteredList.map((bookName, idx) => (
                <button
                  key={bookName}
                  onClick={() => onSelectBibleBook(activeTab === 'PB' ? 'PB_BOOK' : 'PL_BOOK', bookName)}
                  className="p-3 rounded-2xl border border-[#1C1917]/10 bg-white/80 hover:bg-amber-50 hover:border-amber-400/60 hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer btn-lift"
                >
                  <div>
                    <span className="text-[10px] text-[#A8A29E] font-mono block">
                      {idx + 1}.
                    </span>
                    <h5 className="font-bold text-xs text-[#1C1917] group-hover:text-amber-800 transition">
                      {bookName}
                    </h5>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E] group-hover:text-amber-700 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </Tabs>

        {/* Footer */}
        <DialogFooter className="pt-3 border-t border-[#1C1917]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectBibleBook('MATIUS_CATATAN')}
            className="w-full sm:w-auto text-xs font-bold gap-1.5 rounded-full border-amber-600/30 text-amber-900 bg-amber-50/50 hover:bg-amber-100 btn-lift"
          >
            <Bookmark className="w-4 h-4 text-amber-600" />
            Injil Matius: Khusus Catatan Kaki Interaktif Lengkap
          </Button>

          <Button
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto text-xs font-bold rounded-full bg-[#1C1917] hover:bg-[#3B4B34] text-[#F4EFE6] px-5 btn-lift"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
