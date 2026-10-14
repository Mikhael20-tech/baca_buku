import React, { useState } from 'react';
import { 
  Check, Sparkles, ShieldCheck, RefreshCw, Smartphone, 
  ExternalLink, Zap, CheckCircle2, AlertCircle, ArrowRight, X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SubscriptionModal({ isOpen, onClose, currentPlan, onPlanUpdated }) {
  const [selectedBilling, setSelectedBilling] = useState('monthly'); // 'monthly' | 'yearly'
  const [activeTier, setActiveTier] = useState(currentPlan?.tier || 'premium');
  const [isLinkingStore, setIsLinkingStore] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  const plans = [
    {
      id: 'standart',
      name: 'Standart',
      badge: 'Akses Dasar',
      tagline: 'Cocok untuk pembacaan harian pribadi',
      priceMonthly: 'Gratis',
      priceYearly: 'Gratis',
      priceSub: 'Selamanya tanpa biaya',
      color: 'border-stone-200 bg-stone-50/50',
      popular: false,
      features: [
        'Akses 66 Kitab Alkitab Versi Pemulihan lengkap',
        'FKKP Kebangunan Pagi (Edisi minggu berjalan)',
        'Mode gulir vertikal otomatis doa-makan',
        'Penyimpanan progress baca di perangkat lokal',
        'Bisa membagikan nikmat di kolom komunitas'
      ],
      storeSync: 'Sinkronisasi dasar',
      cta: 'Pilih Standart'
    },
    {
      id: 'premium',
      name: 'Premium',
      badge: 'Paling Populer',
      tagline: 'Koleksi lengkap & bebas beli dua kali',
      priceMonthly: 'Rp 29.000',
      priceYearly: 'Rp 299.000',
      priceSub: selectedBilling === 'yearly' ? 'Hemat 15% (Rp 24.900/bln)' : 'Per bulan, batalkan kapan saja',
      color: 'border-[#3B4B34] bg-emerald-950/5 ring-2 ring-[#3B4B34]/20',
      popular: true,
      features: [
        'Semua fitur dalam paket Standart',
        'Akses seluruh 30 Seri Buku Karakter (Witness Lee)',
        'Akses seluruh 46 Pokok Pembinaan Kaum Beriman (Watchman Nee)',
        'Sinkronisasi Google Play Books & Apple App Store (Garansi Tanpa Bayar Dua Kali)',
        'Simpan catatan perenungan firman & highlight di Cloud',
        'Mode baca offline tanpa perlu kuota internet'
      ],
      storeSync: 'Integrasi penuh Google Play & Apple Books',
      cta: 'Berlangganan Premium'
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      badge: 'Makan Berlimpah',
      tagline: 'Meja Perjamuan Lengkap & Multi-device',
      priceMonthly: 'Rp 49.000',
      priceYearly: 'Rp 499.000',
      priceSub: selectedBilling === 'yearly' ? 'Hemat 20% (Rp 41.500/bln)' : 'Per bulan, batalkan kapan saja',
      color: 'border-amber-500 bg-amber-950/5 ring-2 ring-amber-500/30',
      popular: false,
      features: [
        'Semua fitur dalam paket Premium',
        'Rangkuman Hayat di Meja Perjamuan tanpa batas harian',
        'Pencarian & Pelajari Firman berbasis teks Yunani & Ibrani',
        'Sinkronisasi instan multi-perangkat (Android, iOS, iPad, Web)',
        'Audio Doa-Makan & narasi FKKP harian',
        'Akses prioritas terbitan baru Living Stream Ministry & Yasperin'
      ],
      storeSync: 'Prioritas sinkronisasi lisensi digital real-time',
      cta: 'Tingkatkan ke Ultimate'
    }
  ];

  const handleSelectPlan = (tierId) => {
    setActiveTier(tierId);
    if (onPlanUpdated) {
      onPlanUpdated({
        ...currentPlan,
        tier: tierId,
        status: 'active'
      });
    }
    setSyncSuccessMsg(`Paket berhasil diubah ke ${tierId.toUpperCase()}!`);
    setTimeout(() => {
      setSyncSuccessMsg('');
      onClose();
    }, 1500);
  };

  const handleSimulateSync = (store) => {
    setIsLinkingStore(true);
    setTimeout(() => {
      setIsLinkingStore(false);
      setSyncSuccessMsg(`Akun ${store} berhasil disinkronkan! 14 buku berlisensi Anda telah diimpor tanpa biaya tambahan.`);
      if (onPlanUpdated) {
        onPlanUpdated({
          ...currentPlan,
          [store === 'Google Play Books' ? 'googlePlayLinked' : 'appleBooksLinked']: true,
          syncedBooksCount: (currentPlan?.syncedBooksCount || 0) + 7
        });
      }
      setTimeout(() => setSyncSuccessMsg(''), 4000);
    }, 1200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-6 sm:p-8 bg-[#F4EFE6] text-[#1C1917] rounded-[32px] border border-[#1C1917]/15 overflow-y-auto max-h-[92vh]">
        <DialogHeader className="space-y-3 text-center">
          <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1 rounded-full bg-[#8E9C75]/25 border border-[#8E9C75]/40 text-[#3B4B34] text-xs font-bold tracking-wider uppercase mx-auto">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Pilihan Paket Santapan &amp; Sinkronisasi Toko Digital</span>
          </div>

          <DialogTitle className="text-2xl sm:text-4xl font-serif font-bold text-[#1C1917]">
            Pilih Paket Pembacaan Anda
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-[#78716C] max-w-xl mx-auto">
            Terhubung langsung dengan <span className="font-semibold text-[#1C1917]">Google Play Books</span> dan <span className="font-semibold text-[#1C1917]">Apple App Store / Books</span>. Jika Anda sudah pernah membeli buku di kedua platform tersebut, buku akan langsung terbuka di sini tanpa perlu membeli dua kali!
          </DialogDescription>

          {/* Billing Switcher */}
          <div className="inline-flex items-center gap-1 p-1 bg-white/80 rounded-full border border-[#1C1917]/10 mx-auto shadow-xs">
            <button
              onClick={() => setSelectedBilling('monthly')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedBilling === 'monthly'
                  ? 'bg-[#3B4B34] text-white shadow-sm'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Tagihan Bulanan
            </button>
            <button
              onClick={() => setSelectedBilling('yearly')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedBilling === 'yearly'
                  ? 'bg-[#3B4B34] text-white shadow-sm'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <span>Tagihan Tahunan</span>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full">Hemat s/d 20%</span>
            </button>
          </div>
        </DialogHeader>

        {syncSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{syncSuccessMsg}</span>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
          {plans.map((p) => {
            const isCurrent = currentPlan?.tier === p.id;
            return (
              <div
                key={p.id}
                className={`rounded-[24px] p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between relative bg-white/80 ${
                  p.popular ? 'border-[#3B4B34] shadow-xl md:-translate-y-1 ring-2 ring-[#3B4B34]/15' : 'border-[#1C1917]/10 shadow-sm'
                }`}
              >
                {p.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3B4B34] hover:bg-[#20251A] text-white text-[10px] font-bold py-0.5 px-3 rounded-full shadow-sm">
                    {p.badge}
                  </Badge>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-lg text-[#1C1917]">{p.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        Aktif Saat Ini
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#78716C] mt-1">{p.tagline}</p>

                  <div className="mt-4 pb-4 border-b border-[#1C1917]/10">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
                        {selectedBilling === 'yearly' ? p.priceYearly : p.priceMonthly}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#78716C] mt-1 font-medium">{p.priceSub}</p>
                  </div>

                  {/* Feature List */}
                  <ul className="space-y-2.5 my-4 text-xs text-[#57534E]">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1C1917]/8 space-y-2">
                  <div className="text-[10px] text-[#8E9C75] font-semibold flex items-center gap-1.5 bg-[#8E9C75]/10 px-2.5 py-1 rounded-lg">
                    <Smartphone className="w-3 h-3 text-[#3B4B34]" />
                    <span>{p.storeSync}</span>
                  </div>

                  <Button
                    onClick={() => handleSelectPlan(p.id)}
                    disabled={isCurrent}
                    className={`w-full rounded-full text-xs font-bold py-2.5 transition-all ${
                      isCurrent
                        ? 'bg-stone-200 text-stone-500 cursor-default'
                        : p.popular
                        ? 'bg-[#3B4B34] hover:bg-[#20251A] text-white shadow-md'
                        : 'bg-[#1C1917] hover:bg-[#3B4B34] text-white'
                    }`}
                  >
                    {isCurrent ? 'Sedang Digunakan' : p.cta}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Zero Double Charge Banner & Store Linking */}
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-[#3B4B34]/10 border border-[#3B4B34]/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-[#1C1917]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Jaminan Bebas Beli Dua Kali (StoreKit &amp; Google Play Direct Sync)</span>
            </div>
            <p className="text-[11px] text-[#78716C] max-w-lg">
              Pernah membeli buku LSM / Yasperin di Google Play Books atau Apple Books? Hubungkan akun Anda untuk verifikasi instan. Semua buku otomatis muncul di rak bacaan Anda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              disabled={isLinkingStore}
              onClick={() => handleSimulateSync('Google Play Books')}
              className="rounded-full text-xs font-bold border-stone-300 hover:bg-white bg-white/80 text-[#1C1917] h-8 px-3.5 shadow-xs"
            >
              <RefreshCw className={`w-3 h-3 mr-1.5 text-blue-600 ${isLinkingStore ? 'animate-spin' : ''}`} />
              <span>Sinkron Google Play</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isLinkingStore}
              onClick={() => handleSimulateSync('Apple Books')}
              className="rounded-full text-xs font-bold border-stone-300 hover:bg-white bg-white/80 text-[#1C1917] h-8 px-3.5 shadow-xs"
            >
              <RefreshCw className={`w-3 h-3 mr-1.5 text-stone-800 ${isLinkingStore ? 'animate-spin' : ''}`} />
              <span>Sinkron Apple Books</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
