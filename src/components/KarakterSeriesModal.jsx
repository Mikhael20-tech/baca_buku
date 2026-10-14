import React, { useState, useMemo } from 'react';
import { X, BookOpen, Sparkles, ChevronRight, Search } from 'lucide-react';

const ALL_30_KARAKTER = [
  { id: 1, num: 1, title: 'Benar', desc: 'Kebenaran, integritas, dan keadilan di hadapan Allah dan manusia.', tag: 'Fondasi Karakter' },
  { id: 2, num: 2, title: 'Tepat', desc: 'Ketepatan waktu, perkataan, dan tindakan tanpa meleset.', tag: 'Ketelitian' },
  { id: 3, num: 3, title: 'Ketat', desc: 'Kedisiplinan diri yang teguh dan keteraturan hidup rohani.', tag: 'Disiplin' },
  { id: 4, num: 4, title: 'Rajin', desc: 'Kerajinan dalam pelayanan, tidak malas, dan giat bekerja bagi Tuhan.', tag: 'Pelayanan' },
  { id: 5, num: 5, title: 'Lapang', desc: 'Kelapangan dan kebesaran hati yang menampung orang lain.', tag: 'Kasih' },
  { id: 6, num: 6, title: 'Cermat', desc: 'Kecermatan, ketelitian batin, dan kehati-hatian berpikir.', tag: 'Ketelitian' },
  { id: 7, num: 7, title: 'Stabil', desc: 'Kestabilan emosi dan rohani yang tidak mudah goyah oleh badai.', tag: 'Kematangan' },
  { id: 8, num: 8, title: 'Sabar', desc: 'Ketabahan dan kesabaran menanggung proses serta ujian hidup.', tag: 'Ketabahan' },
  { id: 9, num: 9, title: 'Dalam', desc: 'Kedalaman batiniah, tidak dangkal atau tergesa-gesa dalam bersikap.', tag: 'Kedalaman' },
  { id: 10, num: 10, title: 'Murni', desc: 'Kemurnian motif, hati yang bersih tanpa kepura-puraan di hadapan Allah.', tag: 'Kemurnian' },
  { id: 11, num: 11, title: 'Seimbang', desc: 'Keseimbangan watak rohani, tidak condong ke ekstrem mana pun.', tag: 'Keseimbangan' },
  { id: 12, num: 12, title: 'Tenang', desc: 'Ketenangan jiwa dan damai sejahtera Kristus di tengah gejolak.', tag: 'Damai' },
  { id: 13, num: 13, title: 'Tulus', desc: 'Ketulusan hati yang polos tanpa tipu muslihat atau agenda tersembunyi.', tag: 'Integritas' },
  { id: 14, num: 14, title: 'Umum', desc: 'Tidak eksklusif, bersahabat, wajar, dan dapat didekati oleh semua orang.', tag: 'Pergaulan' },
  { id: 15, num: 15, title: 'Terbuka', desc: 'Keterbukaan batin kepada terang Tuhan dan masukan sesama saudara.', tag: 'Keterbukaan' },
  { id: 16, num: 16, title: 'Akrab', desc: 'Kehangatan, perhatian tulus, dan kedekatan kasih dalam berelasi.', tag: 'Keakraban' },
  { id: 17, num: 17, title: 'Gairah', desc: 'Kegairahan yang berkobar bagi keselamatan jiwa dan Injil Kristus.', tag: 'Semangat' },
  { id: 18, num: 18, title: 'Luwes', desc: 'Keluwesan dan fleksibilitas beradaptasi dalam menghadapi berbagai situasi.', tag: 'Keluwesan' },
  { id: 19, num: 19, title: 'Teguh', desc: 'Keteguhan memegang kebenaran dan pendirian rohani yang kokoh.', tag: 'Keteguhan' },
  { id: 20, num: 20, title: 'Lembut', desc: 'Kelemahlembutan Kristus yang tidak membalas kejahatan dengan kejahatan.', tag: 'Kelembutan' },
  { id: 21, num: 21, title: 'Taat', desc: 'Ketaatan dan kepatuhan iman kepada otoritas serta kehendak Allah.', tag: 'Ketaatan' },
  { id: 22, num: 22, title: 'Derita', desc: 'Kesediaan rela menanggung derita dan salib demi kehendak Tuhan.', tag: 'Pengorbanan' },
  { id: 23, num: 23, title: 'Rendah', desc: 'Kerendahan hati yang sejati, menganggap orang lain lebih utama dari diri.', tag: 'Kerendahan Hati' },
  { id: 24, num: 24, title: 'Miskin', desc: 'Miskin di hadapan Allah dalam roh, selalu lapar dan haus akan hayat-Nya.', tag: 'Kehausan Hayat' },
  { id: 25, num: 25, title: 'Tekun', desc: 'Ketekunan yang teguh dan pantang menyerah sampai mencapai garis akhir.', tag: 'Ketekunan' },
  { id: 26, num: 26, title: 'Sulit', desc: 'Kesanggupan mengatasi masa-masa sulit dan menghadapi tugas berat.', tag: 'Daya Juang' },
  { id: 27, num: 27, title: 'Tekan', desc: 'Daya tahan menanggung beban dan tekanan yang berat tanpa hancur.', tag: 'Ketahanan' },
  { id: 28, num: 28, title: 'Jernih', desc: 'Kejernihan pandangan rohani yang melihat fakta Allah secara terang.', tag: 'Kejernihan' },
  { id: 29, num: 29, title: 'Murah Hati', desc: 'Kemurahan hati yang rela memberi, berkorban, dan memberkati sesama.', tag: 'Kemurahan' },
  { id: 30, num: 30, title: 'Bobot', desc: 'Bobot dan kadar rohani yang berat, bernilai kekal di hadapan Tuhan.', tag: 'Bobot Rohani' }
];

export default function KarakterSeriesModal({ isOpen, onClose, onSelectSeries }) {
  const [search, setSearch] = useState('');

  const filteredTraits = useMemo(() => {
    if (!search.trim()) return ALL_30_KARAKTER;
    const q = search.toLowerCase();
    return ALL_30_KARAKTER.filter(k => 
      k.title.toLowerCase().includes(q) ||
      k.desc.toLowerCase().includes(q) ||
      k.tag.toLowerCase().includes(q) ||
      k.num.toString() === q
    );
  }, [search]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-5xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 my-6 space-y-4 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                Buku Karakter: 30 Seri Lengkap
              </h3>
              <p className="text-xs text-slate-500">
                Karya Witness Lee • 30 Buku Pembentukan Karakter Manusia yang Berguna bagi Tuhan (Terpisah 1 per 1)
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

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari karakter (misal: Benar, Rajin, Murni, Sabar, Bobot)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Content Area: Grid 30 Buku Terpisah */}
        <div className="overflow-y-auto pr-1 space-y-3 flex-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Daftar 30 Seri Buku ({filteredTraits.length} buku tersedia):</span>
            <span className="text-[11px] text-blue-600 font-medium">Klik seri untuk mulai membaca</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTraits.map((seri) => (
              <div
                key={seri.id}
                onClick={() => onSelectSeries({ id: seri.id, title: seri.title, summary: seri.desc })}
                className="group relative p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer bg-slate-50/40 hover:bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-blue-700 bg-blue-100 border border-blue-200 shadow-2xs font-mono">
                      Seri {seri.num}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      {seri.tag}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-base group-hover:text-blue-700 transition flex items-center gap-1.5">
                    <span>{seri.num}. {seri.title}</span>
                  </h4>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {seri.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 group-hover:text-slate-600 transition">
                    Buku Seri {seri.num}
                  </span>
                  <span className="text-blue-600 font-bold flex items-center group-hover:translate-x-0.5 transition">
                    Baca <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredTraits.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              Karakter dengan kata kunci "{search}" tidak ditemukan.
            </div>
          )}
        </div>

        {/* Footer: Opsi Buka Semua Sekaligus */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => onSelectSeries({ id: 'all', title: 'Volume Lengkap', summary: '30 Karakter Lengkap' })}
            className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            Baca Semua 30 Karakter Sekaligus (Volume Lengkap)
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
