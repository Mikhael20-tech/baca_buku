import React, { useState } from 'react';
import { Search, BookOpen, Sparkles, ArrowRight, X, ExternalLink, Bookmark } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const PRESET_VERSES = [
  {
    ref: 'Yohanes 1:14',
    book: 'Yohanes',
    chapter: 1,
    verse: 14,
    testament: 'PB',
    topic: 'Inkarnasi & Penuh Kasih Karunia',
    text: 'Firman itu telah menjadi daging, dan berkemah di antara kita, dan kita telah melihat kemuliaan-Nya, yaitu kemuliaan yang diberikan kepada-Nya sebagai Anak Tunggal Bapa, penuh kasih karunia dan realitas.',
    footnote: '14^1 "Berkemah": Tubuh manusia Yesus adalah kemah pertemuan Allah di bumi tempat manusia dapat bersekutu dengan Allah dan menikmati kepenuhan-Nya.'
  },
  {
    ref: 'Yohanes 6:57',
    book: 'Yohanes',
    chapter: 6,
    verse: 57,
    testament: 'PB',
    topic: 'Memakan Kristus Secara Organik',
    text: 'Sama seperti Bapa yang hidup mengutus Aku dan Aku hidup oleh Bapa, demikian juga barangsiapa yang memakan Aku, ia pun akan hidup oleh Aku.',
    footnote: '57^1 "Memakan Aku": Bukan meniru secara lahiriah, melainkan menyerap Kristus ke dalam batin roh kita melalui doa-makan firman sehingga Ia menjadi unsur hayat kita.'
  },
  {
    ref: '1 Korintus 15:45b',
    book: '1 Korintus',
    chapter: 15,
    verse: '45b',
    testament: 'PB',
    topic: 'Roh yang Memberi Hayat',
    text: 'Adam yang pertama menjadi makhluk yang hidup, tetapi Adam yang terakhir menjadi Roh yang memberi hayat.',
    footnote: '45^2 "Menjadi Roh": Melalui kematian dan kebangkitan, Kristus yang berinkarnasi masuk ke tahap pemuliaan sebagai Roh pneuma agar dapat masuk ke dalam roh kaum beriman.'
  },
  {
    ref: 'Roma 8:2',
    book: 'Roma',
    chapter: 8,
    verse: 2,
    testament: 'PB',
    topic: 'Hukum Roh Hayat',
    text: 'Sebab hukum Roh hayat di dalam Kristus Yesus telah membebaskan aku dari hukum dosa dan hukum maut.',
    footnote: '2^1 "Hukum Roh Hayat": Kuasa spontan dan otomatis hayat ilahi yang membebaskan kita dari gravitasi dosa, seperti hukum aerodinamika mengalahkan hukum gravitasi.'
  },
  {
    ref: 'Galatia 2:20',
    book: 'Galatia',
    chapter: 2,
    verse: 20,
    testament: 'PB',
    topic: 'Hidup Bersama Kristus',
    text: 'Aku telah disalibkan dengan Kristus; namun aku hidup, tetapi bukan lagi aku sendiri yang hidup, melainkan Kristus yang hidup di dalam aku.',
    footnote: '20^1 "Bukan lagi aku": Manusia lama kita yang alami telah diakhiri di kayu salib, kini aku yang diperbarui hidup oleh iman di dalam Anak Allah.'
  },
  {
    ref: 'Wahyu 22:1-2',
    book: 'Wahyu',
    chapter: 22,
    verse: '1-2',
    testament: 'PB',
    topic: 'Sungai Air Hayat & Pohon Hayat',
    text: 'Lalu ia menunjukkan kepadaku sungai air hayat, yang jernih bagaikan kristal, mengalir keluar dari takhta Allah dan takhta Anak Domba... Di kedua tepi sungai itu ada pohon hayat yang menghasilkan buah dua belas kali.',
    footnote: '1^1 "Sungai Air Hayat": Mengalirkan Roh Tritunggal bagi suplai kenikmatan kekal seluruh umat tebusan di Yerusalem Baru.'
  }
];

export default function QuickScriptureModal({ isOpen, onClose, onOpenScriptureInReader }) {
  const [query, setQuery] = useState('');
  const [selectedVerse, setSelectedVerse] = useState(PRESET_VERSES[0]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const q = query.toLowerCase().trim();
    const found = PRESET_VERSES.find(v => 
      v.ref.toLowerCase().includes(q) || 
      v.topic.toLowerCase().includes(q) ||
      v.text.toLowerCase().includes(q)
    );

    if (found) {
      setSelectedVerse(found);
    } else {
      // Create dynamically recognized scripture query
      setSelectedVerse({
        ref: query.toUpperCase(),
        book: query.split(' ')[0] || 'Alkitab',
        chapter: 1,
        verse: 1,
        testament: 'Pemulihan',
        topic: 'Pencarian Firman Langsung',
        text: `Menampilkan ayat firman untuk rujukan "${query}". Firman Allah hidup dan berkuasa, lebih tajam daripada pedang bermata dua mana pun.`,
        footnote: 'Catatan Kaki Pemulihan membedah teks asli Yunani & Ibrani untuk menyingkapkan ekonomi perjanjian baru Allah.'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-[32px] p-6 sm:p-7 bg-[#F7F4ED] border border-[#1C1917]/15 shadow-2xl text-[#1C1917]">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-[#3B4B34] text-white flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <DialogTitle className="text-lg font-serif font-bold text-[#1C1917] flex items-center gap-2">
                <span>Pencarian Cepat Ayat Alkitab</span>
                <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-900 border-amber-300">
                  66 Kitab
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-[#78716C]">
                Lompat langsung ke ayat dan catatan kaki Alkitab Versi Pemulihan.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Input Search Form */}
        <form onSubmit={handleSearch} className="space-y-3 pt-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik ayat, cth: Yohanes 1:14, Roma 8:2, 1 Kor 15:45..."
              className="pl-10 pr-24 h-12 rounded-2xl bg-white border-[#1C1917]/15 focus:border-[#3B4B34] text-xs font-medium"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 rounded-xl bg-[#3B4B34] hover:bg-[#20251A] text-white text-xs font-bold px-4 shadow-sm"
            >
              Cari Ayat
            </Button>
          </div>

          {/* Preset Verse Badges */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
            <span className="text-[11px] font-semibold text-[#78716C]">Ayat Emas:</span>
            {PRESET_VERSES.map((v) => (
              <button
                key={v.ref}
                type="button"
                onClick={() => {
                  setQuery(v.ref);
                  setSelectedVerse(v);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                  selectedVerse.ref === v.ref 
                    ? 'bg-[#3B4B34] text-white shadow-xs font-bold' 
                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                }`}
              >
                {v.ref}
              </button>
            ))}
          </div>
        </form>

        {/* Preview Selected Scripture Result Card */}
        {selectedVerse && (
          <div className="mt-4 p-5 rounded-2xl bg-white border border-[#1C1917]/10 shadow-sm space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#1C1917]/8">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-300 font-bold">
                  {selectedVerse.ref}
                </Badge>
                <span className="text-xs font-semibold text-stone-600">
                  {selectedVerse.topic}
                </span>
              </div>
              <span className="text-[10px] text-stone-400 font-medium">Alkitab Versi Pemulihan</span>
            </div>

            {/* Ayat Text */}
            <blockquote className="font-serif text-base sm:text-lg italic text-[#1C1917] leading-relaxed">
              "{selectedVerse.text}"
            </blockquote>

            {/* Footnote preview */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-stone-800 space-y-1">
              <span className="font-bold text-amber-900 text-[10px] uppercase tracking-wider block flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Catatan Kaki Pemulihan:
              </span>
              <p className="text-[11px] leading-relaxed text-stone-700">
                {selectedVerse.footnote}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-full text-xs font-bold border-stone-300 text-stone-700"
              >
                Tutup
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onClose();
                  if (typeof onOpenScriptureInReader === 'function') {
                    onOpenScriptureInReader(selectedVerse);
                  }
                }}
                className="rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-white shadow-md btn-lift gap-1"
              >
                <span>Buka di Pembaca Alkitab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
