import React, { useState, useMemo } from 'react';
import { X, BookOpen, Sparkles, ChevronRight, Search } from 'lucide-react';

const ALL_46_PEMBINAAN = [
  { id: 1, num: 1, title: 'Berbagai Jenis Sidang', desc: 'Pengenalan berbagai macam pertemuan gereja dan tujuannya bagi kaum beriman.', tag: 'Pertemuan Gereja' },
  { id: 2, num: 2, title: 'Berdoa', desc: 'Prinsip doa yang sejati, syarat doa dijawab, dan ketekunan dalam permohonan.', tag: 'Doa' },
  { id: 3, num: 3, title: 'Bersaksi', desc: 'Kewajiban dan sukacita memberitakan Injil serta bersaksi tentang Kristus.', tag: 'Penginjilan' },
  { id: 4, num: 4, title: 'Bersidang', desc: 'Pentingnya tidak meninggalkan perhimpunan dan saling mendorong dalam kasih.', tag: 'Persekutuan' },
  { id: 5, num: 5, title: 'Cara Mengatur Keuangan', desc: 'Pengelolaan harta benda secara saleh, persembahan, dan bergantung kepada Tuhan.', tag: 'Keuangan' },
  { id: 6, num: 6, title: 'Didikan dan Hajaran Allah', desc: 'Bagaimana Bapa mendidik anak-anak-Nya demi bagian dalam kekudusan-Nya.', tag: 'Didikan Bapa' },
  { id: 7, num: 7, title: 'Hari Tuhan', desc: 'Makna hari pertama dalam minggu (Hari Tuhan) untuk mengingat kebangkitan-Nya.', tag: 'Hari Tuhan' },
  { id: 8, num: 8, title: 'Hayat Kita', desc: 'Mengenal hayat ilahi yang kita terima saat lahir baru dan pertumbuhannya.', tag: 'Hayat Rohani' },
  { id: 9, num: 9, title: 'Jabatan Imam', desc: 'Setiap orang percaya adalah imam yang melayani dan mempersembahkan korban rohani.', tag: 'Imamat' },
  { id: 10, num: 10, title: 'Jalan Gereja', desc: 'Jalan pemulihan gereja, persekutuan kaum saleh, dan kesaksian Tubuh Kristus.', tag: 'Gereja' },
  { id: 11, num: 11, title: 'Kelepasan', desc: 'Kelepasan dari kuasa dosa dan hukum taurat melalui kematian bersama Kristus.', tag: 'Kelepasan' },
  { id: 12, num: 12, title: 'Kesatuan', desc: 'Memelihara kesatuan Roh dalam ikatan damai sejahtera di dalam Tubuh.', tag: 'Kesatuan' },
  { id: 13, num: 13, title: 'Keselamatan Seisi Keluarga', desc: 'Janji Allah tentang keselamatan seisi rumah tangga dan penerapannya.', tag: 'Keluarga' },
  { id: 14, num: 14, title: 'Konsikrasi', desc: 'Menyerahkan segenap diri sebagai persembahan yang hidup dan berkenan.', tag: 'Penyerahan Diri' },
  { id: 15, num: 15, title: 'Masalah Penudungan Kepala', desc: 'Prinsip otoritas ilahi dan penundukan diri dalam tatanan penciptaan Allah.', tag: 'Otoritas' },
  { id: 16, num: 16, title: 'Masuk Gereja', desc: 'Mengenal persekutuan lokal dan diterima sebagai anggota Tubuh Kristus.', tag: 'Kehidupan Gereja' },
  { id: 17, num: 17, title: 'Melawan Iblis', desc: 'Mengenakan seluruh perlengkapan senjata Allah dan berdiri teguh melawan musuh.', tag: 'Peperangan Rohani' },
  { id: 18, num: 18, title: 'Membaca Alkitab', desc: 'Metode praktis membaca dan merenungkan firman Allah setiap hari.', tag: 'Firman' },
  { id: 19, num: 19, title: 'Memilih Jodoh', desc: 'Petunjuk rohani dalam menentukan pasangan hidup yang sepadan dalam Tuhan.', tag: 'Pernikahan' },
  { id: 20, num: 20, title: 'Memimpin Orang Kepada Tuhan', desc: 'Cara membimbing jiwa yang haus untuk bertobat dan menerima keselamatan.', tag: 'Penginjilan' },
  { id: 21, num: 21, title: 'Mencari Kehendak Allah', desc: 'Langkah praktis mengetahui kehendak Allah melalui firman, lingkungan, dan Roh.', tag: 'Kehendak Allah' },
  { id: 22, num: 22, title: 'Mengasihi Saudara', desc: 'Tanda lahir baru adalah kasih persaudaraan yang tulus dan tidak mementingkan diri.', tag: 'Kasih' },
  { id: 23, num: 23, title: 'Menyanyi', desc: 'Memuji Tuhan melalui kidung pujian, nyanyian rohani, dan mazmur syukur.', tag: 'Pujian' },
  { id: 24, num: 24, title: 'Minta Maaf dan Ganti Rugi', desc: 'Menyelesaikan kesalahan terhadap sesama dengan kejujuran dan pemulihan hak.', tag: 'Pemulihan' },
  { id: 25, num: 25, title: 'Mulut Mengaku', desc: 'Mengaku Yesus sebagai Tuhan dengan mulut untuk beroleh keselamatan nyata.', tag: 'Pengakuan Iman' },
  { id: 26, num: 26, title: 'Orang Tua', desc: 'Tanggung jawab orang tua membimbing dan mendidik anak dalam ajaran Tuhan.', tag: 'Keluarga' },
  { id: 27, num: 27, title: 'Pakaian dan Makanan', desc: 'Kewajaran, kesederhanaan, dan kepantasan hidup jasmani orang beriman.', tag: 'Hidup Praktis' },
  { id: 28, num: 28, title: 'Pemecahan Roti', desc: 'Perjamuan Tuhan: mengingat kematian Tuhan dan menyatakan keesaan Tubuh-Nya.', tag: 'Perjamuan Suci' },
  { id: 29, num: 29, title: 'Pengampunan dan Pemulihan', desc: 'Pengampunan Allah dan langkah pemulihan persekutuan ketika berbuat dosa.', tag: 'Pengampunan' },
  { id: 30, num: 30, title: 'Pengampunan Siasat', desc: 'Pengampunan dari sudut siasat disiplin pemerintahan Allah atas umat-Nya.', tag: 'Pemerintahan Allah' },
  { id: 31, num: 31, title: 'Pengaturan Roh Kudus', desc: 'Melihat bahwa segala sesuatu bekerja mendatangkan kebaikan bagi yang mengasihi-Nya.', tag: 'Penyelenggaraan Ilahi' },
  { id: 32, num: 32, title: 'Penumpangan Tangan', desc: 'Arti penumpangan tangan: persekutuan, penyatuan, dan penyaluran berkat rohani.', tag: 'Ordinansi' },
  { id: 33, num: 33, title: 'Penyakit', desc: 'Sikap orang beriman menghadapi sakit penyakit, doa penyembuhan, dan disiplin diri.', tag: 'Kesehatan & Iman' },
  { id: 34, num: 34, title: 'Pernikahan', desc: 'Tujuan mulia pernikahan kudus dalam rencana Allah dan kesaksian keluarga.', tag: 'Pernikahan' },
  { id: 35, num: 35, title: 'Pertapaan', desc: 'Bahaya asketisme palsu dan kebenaran sejati tentang penyaliban manusia lama.', tag: 'Ajaran Sehat' },
  { id: 36, num: 36, title: 'Pisahkan Diri dari Dunia', desc: 'Keluaran dari sistem dunia yang fasik untuk hidup terpisah bagi Tuhan.', tag: 'Kekudusan' },
  { id: 37, num: 37, title: 'Profesi Kaum Imani', desc: 'Pekerjaan yang layak bagi orang kristiani dan menjaga hati nurani murni.', tag: 'Pekerjaan' },
  { id: 38, num: 38, title: 'Reaksi Kaum Imani', desc: 'Bagaimana orang beriman bereaksi terhadap perlakuan tidak adil dan hinaan.', tag: 'Watak Kristus' },
  { id: 39, num: 39, title: 'Rekreasi', desc: 'Prinsip istirahat dan penyegaran yang sehat tanpa merusak kerohanian.', tag: 'Hidup Seimbang' },
  { id: 40, num: 40, title: 'Teman', desc: 'Memilih pergaulan dan persahabatan yang membangun kehidupan rohani.', tag: 'Persahabatan' },
  { id: 41, num: 41, title: 'Terhapusnya Segala Perbedaan', desc: 'Di dalam manusia baru tidak ada lagi diskriminasi ras, kelas, maupun status sosial.', tag: 'Manusia Baru' },
  { id: 42, num: 42, title: 'Tubuh Kristus', desc: 'Realitas organisme hidup dari Kristus di mana setiap anggota saling melengkapi.', tag: 'Tubuh Kristus' },
  { id: 43, num: 43, title: 'Tutur Kata', desc: 'Menjaga lidah dan perkataan yang membangun serta menyalurkan kasih karunia.', tag: 'Perkataan' },
  { id: 44, num: 44, title: 'Wewenang Gereja', desc: 'Otoritas rohani gereja dalam mengikat dan melepaskan di hadapan Tuhan.', tag: 'Otoritas Gereja' },
  { id: 45, num: 45, title: 'Baptisan dan Penumpangan Tangan', desc: 'Ajaran mendalam mengenai signifikansi baptisan air dan identifikasi dengan Kristus.', tag: 'Baptisan' },
  { id: 46, num: 46, title: 'Bangun Pagi-pagi Menghampiri Tuhan', desc: 'Teladan dan manfaat rohani bangun pagi untuk bersekutu dan menikmati hadirat Tuhan.', tag: 'Saat Teduh' }
];

export default function PembinaanTopicsModal({ isOpen, onClose, onSelectTopic }) {
  const [search, setSearch] = useState('');

  const filteredTopics = useMemo(() => {
    if (!search.trim()) return ALL_46_PEMBINAAN;
    const q = search.toLowerCase();
    return ALL_46_PEMBINAAN.filter(t => 
      t.title.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q) ||
      t.tag.toLowerCase().includes(q) ||
      t.num.toString() === q
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
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                Pembinaan Dasar: 46 Topik Lengkap
              </h3>
              <p className="text-xs text-slate-500">
                Karya Watchman Nee • 46 Pelajaran Pembinaan Kaum Beriman Baru (Terpisah 1 per 1)
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
            placeholder="Cari topik (misal: Berdoa, Baptisan, Bangun Pagi, Konsikrasi, Pernikahan)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
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

        {/* Content Area: Grid 46 Topik Terpisah */}
        <div className="overflow-y-auto pr-1 space-y-3 flex-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Daftar Pelajaran ({filteredTopics.length} topik tersedia):</span>
            <span className="text-[11px] text-emerald-600 font-medium">Klik topik untuk mulai membaca</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTopics.map((topik) => (
              <div
                key={topik.id}
                onClick={() => onSelectTopic({ id: topik.id, title: topik.title, summary: topik.desc })}
                className="group relative p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all duration-200 cursor-pointer bg-slate-50/40 hover:bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-emerald-800 bg-emerald-100 border border-emerald-200 shadow-2xs font-mono">
                      Pelajaran {topik.num}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      {topik.tag}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition flex items-center gap-1.5">
                    <span>{topik.num}. {topik.title}</span>
                  </h4>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {topik.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 group-hover:text-slate-600 transition">
                    Buku Pelajaran {topik.num}
                  </span>
                  <span className="text-emerald-600 font-bold flex items-center group-hover:translate-x-0.5 transition">
                    Baca <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredTopics.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              Topik dengan kata kunci "{search}" tidak ditemukan.
            </div>
          )}
        </div>

        {/* Footer: Opsi Buka Semua Sekaligus */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => onSelectTopic({ id: 'all', title: 'Volume Lengkap', summary: '46 Topik Pembinaan Dasar Lengkap' })}
            className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            Baca Semua 46 Topik Sekaligus (Volume Lengkap)
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
