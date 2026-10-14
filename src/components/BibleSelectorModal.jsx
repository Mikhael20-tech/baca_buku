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
  const [activeTab, setActiveTab] = useState('PB'); // 'PB' | 'PL'
  const [search, setSearch] = useState('');

  const currentList = activeTab === 'PB' ? NT_BOOKS : OT_BOOKS;
  const filteredList = currentList.filter(b => b.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold">
                Alkitab Versi Pemulihan (66 Kitab)
              </DialogTitle>
              <DialogDescription className="text-xs">
                Lengkap Perjanjian Lama &amp; Perjanjian Baru • Dari Kitab Kejadian sampai Kitab Wahyu
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
          {/* Tab Switcher & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
            <TabsList className="grid grid-cols-2 w-full sm:w-auto h-10 p-1">
              <TabsTrigger value="PB" className="gap-1.5 text-xs font-semibold px-4">
                <span>Perjanjian Baru</span>
                <Badge variant="amber" className="text-[10px] px-1.5 py-0">27</Badge>
              </TabsTrigger>
              <TabsTrigger value="PL" className="gap-1.5 text-xs font-semibold px-4">
                <span>Perjanjian Lama</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">39</Badge>
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama kitab..."
                className="pl-9 h-10"
              />
            </div>
          </div>

          {/* Action Buka Seluruh Bagian */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between text-xs mb-3">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold truncate">
                Buka seluruh volume {activeTab === 'PB' ? 'Perjanjian Baru (Matius – Wahyu)' : 'Perjanjian Lama (Kejadian – Maleakhi)'}
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => onSelectBibleBook(activeTab === 'PB' ? 'PB_FULL' : 'PL_FULL')}
              className="rounded-xl text-xs font-bold gap-1 shrink-0"
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
                  className="p-3 rounded-2xl border border-border/70 bg-card hover:bg-amber-500/10 hover:border-amber-500/50 hover:shadow-xs transition text-left flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] text-muted-foreground font-mono block">
                      {idx + 1}.
                    </span>
                    <h5 className="font-bold text-xs text-foreground group-hover:text-amber-600 transition">
                      {bookName}
                    </h5>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-amber-600 group-hover:translate-x-0.5 transition" />
                </button>
              ))}
            </div>
          </div>
        </Tabs>

        {/* Footer */}
        <DialogFooter className="pt-3 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectBibleBook('MATIUS_CATATAN')}
            className="w-full sm:w-auto text-xs font-semibold gap-1.5"
          >
            <Bookmark className="w-4 h-4 text-amber-600" />
            Injil Matius: Khusus Catatan Kaki Interaktif Lengkap
          </Button>

          <Button
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto text-xs font-semibold"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
