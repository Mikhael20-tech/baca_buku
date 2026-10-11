import React from 'react';
import { X, BookOpen, Sparkles, ChevronRight, Bookmark } from 'lucide-react';

const KARAKTER_SERIES = [
  {
    id: 1,
    title: 'Seri 1',
    traits: ['1. Benar', '2. Tepat', '3. Ketat'],
    summary: 'Benar, Tepat, Ketat',
    desc: 'Fondasi kebenaran, ketelitian, dan kedisiplinan diri di hadapan Tuhan.',
    color: 'from-blue-600 to-indigo-700'
  },
  {
    id: 2,
    title: 'Seri 2',
    traits: ['4. Rajin', '5. Lapang', '6. Cermat'],
    summary: 'Rajin, Lapang, Cermat',
    desc: 'Kerajinan dalam pelayanan, kebesaran hati (kelapangan), dan kecermatan budi.',
    color: 'from-cyan-600 to-blue-700'
  },
  {
    id: 3,
    title: 'Seri 3',
    traits: ['7. Stabil', '8. Sabar', '9. Dalam'],
    summary: 'Stabil, Sabar, Dalam',
    desc: 'Kestabilan emosi, ketabahan dalam proses, serta kedalaman batiniah.',
    color: 'from-teal-600 to-emerald-700'
  },
  {
    id: 4,
    title: 'Seri 4',
    traits: ['10. Murni', '11. Seimbang', '12. Tenang'],
    summary: 'Murni, Seimbang, Tenang',
    desc: 'Kemurnian motivasi, keseimbangan rohani, dan ketenangan jiwa.',
    color: 'from-emerald-600 to-green-800'
  },
  {
    id: 5,
    title: 'Seri 5',
    traits: ['13. Tulus', '14. Umum', '15. Terbuka'],
    summary: 'Tulus, Umum, Terbuka',
    desc: 'Ketulusan hati, keterbukaan kepada sesama, dan watak yang tidak eksklusif.',
    color: 'from-amber-600 to-yellow-800'
  },
  {
    id: 6,
    title: 'Seri 6',
    traits: ['16. Akrab', '17. Gairah', '18. Luwes'],
    summary: 'Akrab, Gairah, Luwes',
    desc: 'Kehangatan berelasi, kegairahan bagi Injil, dan keluwesan dalam pergaulan.',
    color: 'from-orange-600 to-rose-700'
  },
  {
    id: 7,
    title: 'Seri 7',
    traits: ['19. Teguh', '20. Lembut', '21. Taat'],
    summary: 'Teguh, Lembut, Taat',
    desc: 'Keteguhan memegang kebenaran, kelemahlembutan Kristus, dan kepatuhan iman.',
    color: 'from-rose-600 to-pink-800'
  },
  {
    id: 8,
    title: 'Seri 8',
    traits: ['22. Derita', '23. Rendah', '24. Miskin'],
    summary: 'Derita, Rendah, Miskin',
    desc: 'Rela menanggung derita, kerendahan hati, dan miskin di hadapan Allah.',
    color: 'from-purple-600 to-violet-800'
  },
  {
    id: 9,
    title: 'Seri 9',
    traits: ['25. Tekun', '26. Sulit', '27. Tekan'],
    summary: 'Tekun, Sulit, Tekan',
    desc: 'Ketekunan tanpa henti, kesanggupan menghadapi kesulitan, dan daya tahan tekanan.',
    color: 'from-indigo-600 to-slate-800'
  },
  {
    id: 10,
    title: 'Seri 10',
    traits: ['28. Jernih', '29. Murah Hati', '30. Bobot'],
    summary: 'Jernih, Murah Hati, Bobot',
    desc: 'Kejernihan pandangan, kemurahan hati memberi, dan bobot rohani yang mendalam.',
    color: 'from-slate-700 to-stone-900'
  }
];

export default function KarakterSeriesModal({ isOpen, onClose, onSelectSeries }) {
  if (!isOpen) return null;

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
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                Buku Karakter: Pilih Seri (1 – 10)
              </h3>
              <p className="text-xs text-slate-500">
                Karya Witness Lee • 30 Butir Pembentukan Karakter Manusia yang Berguna bagi Tuhan
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

        {/* Content Area: Grid 10 Seri */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1">
          <p className="text-xs text-slate-600">
            Silakan pilih seri pembentukan karakter yang ingin Anda baca hari ini:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {KARAKTER_SERIES.map((seri) => (
              <div
                key={seri.id}
                onClick={() => onSelectSeries(seri)}
                className="group relative p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer bg-slate-50/50 hover:bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white bg-gradient-to-r ${seri.color} shadow-xs`}>
                      {seri.title}
                    </span>
                    <span className="text-slate-400 group-hover:text-blue-600 transition flex items-center text-xs font-semibold">
                      Baca <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition" />
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition">
                    {seri.summary}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {seri.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex flex-wrap gap-1.5">
                  {seri.traits.map((t) => (
                    <span 
                      key={t}
                      className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
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
