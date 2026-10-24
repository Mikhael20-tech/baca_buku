import React, { useState } from 'react';
import { 
  Check, Sparkles, ShieldCheck, Smartphone, 
  CheckCircle2, Phone, MessageSquare, Copy, X, Info
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SubscriptionModal({ isOpen, onClose, currentPlan, onPlanUpdated }) {
  const [selectedBilling, setSelectedBilling] = useState('monthly'); // 'monthly' | 'yearly'
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');
  
  // Modal Kontak Admin untuk Upgrade
  const [contactAdminModal, setContactAdminModal] = useState({ isOpen: false, plan: null });
  const [copiedText, setCopiedText] = useState(false);

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
        'FKKP Kebangunan Pagi (Edisi minggu berjalan per hari)',
        'Mode gulir vertikal otomatis doa-makan',
        'Penyimpanan progress baca di perangkat lokal',
        'Bisa membagikan nikmat di kolom komunitas'
      ],
      storeSync: 'Akses bacaan standar',
      cta: 'Pilih Standart'
    },
    {
      id: 'premium',
      name: 'Premium',
      badge: 'Paling Populer',
      tagline: 'Koleksi lengkap santapan rohani',
      priceMonthly: 'Rp 29.000',
      priceYearly: 'Rp 299.000',
      priceSub: selectedBilling === 'yearly' ? 'Hemat 15% (Rp 24.900/bln)' : 'Per bulan, batalkan kapan saja',
      color: 'border-[#3B4B34] bg-emerald-950/5 ring-2 ring-[#3B4B34]/20',
      popular: true,
      features: [
        'Semua fitur dalam paket Standart',
        'Akses seluruh 30 Seri Buku Karakter (Witness Lee)',
        'Akses seluruh 46 Pokok Pembinaan Kaum Beriman (Watchman Nee)',
        'Arsip lengkap FKKP seluruh minggu & hari tanpa gembok',
        'Simpan catatan perenungan firman & highlight di Cloud',
        'Dukungan penuh pembacaan di HP, Tablet & Laptop'
      ],
      storeSync: 'Aktivasi langsung oleh Admin',
      cta: 'Minta Upgrade ke Admin'
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
        'Akses prioritas terbitan baru Living Stream Ministry & Yasperin',
        'Jaminan bebas biaya pembaruan seluruh edisi buku'
      ],
      storeSync: 'Aktivasi langsung oleh Admin',
      cta: 'Minta Upgrade ke Admin'
    }
  ];

  const handleSelectPlan = (tierId) => {
    if (tierId === 'standart') {
      if (onPlanUpdated) {
        onPlanUpdated({
          ...currentPlan,
          tier: 'standart',
          status: 'active'
        });
      }
      setSyncSuccessMsg('Paket Standart (Gratis) aktif.');
      setTimeout(() => {
        setSyncSuccessMsg('');
        onClose();
      }, 1200);
      return;
    }

    // Untuk paket berbayar (Premium / Ultimate), buka modal kontak admin untuk upgrade
    const targetPlan = plans.find(p => p.id === tierId);
    setContactAdminModal({ isOpen: true, plan: targetPlan });
  };

  const getUpgradeMessage = (plan) => {
    if (!plan) return '';
    const cycle = selectedBilling === 'yearly' ? 'Tahunan' : 'Bulanan';
    const price = selectedBilling === 'yearly' ? plan.priceYearly : plan.priceMonthly;
    return `Syalom Admin Perpustakaan Baca, saya ingin meminta upgrade akun saya ke paket ${plan.name} (${cycle} - ${price}). Mohon bantuan aktivasi akun saya. Terima kasih!`;
  };

  const handleOpenWhatsApp = (plan) => {
    const text = encodeURIComponent(getUpgradeMessage(plan));
    window.open(`https://wa.me/628960671871?text=${text}`, '_blank');
  };

  const handleCopyMessage = (plan) => {
    const text = getUpgradeMessage(plan);
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl p-6 sm:p-8 bg-[#F4EFE6] text-[#1C1917] rounded-[32px] border border-[#1C1917]/15 overflow-y-auto max-h-[92vh] scrollbar-thin">
          <DialogHeader className="space-y-3 text-center">
            <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1 rounded-full bg-[#8E9C75]/25 border border-[#8E9C75]/40 text-[#3B4B34] text-xs font-bold tracking-wider uppercase mx-auto">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Pilihan Paket Pembacaan Santapan Rohani</span>
            </div>

            <DialogTitle className="text-2xl sm:text-4xl font-serif font-bold text-[#1C1917]">
              Pilih Paket Pembacaan Anda
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-[#78716C] max-w-xl mx-auto">
              Tingkatkan pertumbuhan rohani Anda dengan akses penuh firman dan buku pembinaan. Untuk sementara, pendaftaran akun dan upgrade paket dilakukan langsung melalui <strong>Administrator</strong>.
            </DialogDescription>

            {/* Billing Switcher */}
            <div className="inline-flex items-center gap-1 p-1 bg-white/80 rounded-full border border-[#1C1917]/10 mx-auto shadow-xs">
              <button
                type="button"
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
                type="button"
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
                    <div className="text-[10px] text-[#3B4B34] font-semibold flex items-center gap-1.5 bg-[#8E9C75]/15 px-2.5 py-1.5 rounded-xl">
                      {p.id === 'standart' ? (
                        <Smartphone className="w-3 h-3 text-[#3B4B34]" />
                      ) : (
                        <Phone className="w-3 h-3 text-emerald-700" />
                      )}
                      <span>{p.storeSync}</span>
                    </div>

                    <Button
                      type="button"
                      onClick={() => handleSelectPlan(p.id)}
                      disabled={isCurrent}
                      className={`w-full rounded-full text-xs font-bold py-2.5 transition-all btn-lift ${
                        isCurrent
                          ? 'bg-stone-200 text-stone-500 cursor-default'
                          : p.popular
                          ? 'bg-[#3B4B34] hover:bg-[#20251A] text-white shadow-md'
                          : 'bg-[#1C1917] hover:bg-[#3B4B34] text-white shadow-xs'
                      }`}
                    >
                      {isCurrent ? 'Sedang Digunakan' : (
                        <span className="flex items-center justify-center gap-1.5">
                          {p.id !== 'standart' && <MessageSquare className="w-3.5 h-3.5" />}
                          {p.cta}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-[#1C1917]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#78716C]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Pendaftaran &amp; upgrade paket sementara dikonfirmasi langsung oleh Administrator.
            </span>
            <span className="text-[10px] text-[#3B4B34] font-bold">
              Hubungi Admin untuk Bantuan &amp; Upgrade
            </span>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Dialog Khusus: Minta Upgrade ke Admin */}
      <Dialog open={contactAdminModal.isOpen} onOpenChange={(open) => !open && setContactAdminModal({ isOpen: false, plan: null })}>
        <DialogContent className="max-w-md p-6 sm:p-7 bg-[#FAF7F2] text-[#1C1917] rounded-[32px] border border-[#1C1917]/15 shadow-2xl">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-[#3B4B34] text-[#F4EFE6] flex items-center justify-center shadow-md">
                <MessageSquare className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <DialogTitle className="text-lg font-serif font-bold text-[#1C1917]">
                  Minta Upgrade ke Admin
                </DialogTitle>
                <DialogDescription className="text-xs text-[#78716C]">
                  Paket Pilihan: <strong className="text-[#3B4B34] font-bold">{contactAdminModal.plan?.name}</strong> ({selectedBilling === 'yearly' ? 'Tahunan' : 'Bulanan'} - {selectedBilling === 'yearly' ? contactAdminModal.plan?.priceYearly : contactAdminModal.plan?.priceMonthly})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Pendaftaran &amp; upgrade paket saat ini ditangani langsung oleh Administrator. Admin akan mengaktifkan paket Anda melalui Dashboard Manajemen Pengguna.
              </p>
            </div>

            {/* Info Kontak Admin */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#1C1917]/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 font-medium">WhatsApp Admin:</span>
                <span className="font-bold text-emerald-800 font-mono">0896-0671-871</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 font-medium">Email Pengelola:</span>
                <span className="font-bold text-stone-800 font-mono">admin123@baca.id</span>
              </div>
            </div>

            {/* Format Pesan */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-600 block">Pesan Permintaan:</label>
              <div className="p-3 bg-stone-100/80 border border-stone-200 rounded-xl text-xs text-stone-700 font-mono leading-relaxed select-all">
                {getUpgradeMessage(contactAdminModal.plan)}
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-col gap-2 pt-1">
              <Button
                type="button"
                onClick={() => handleOpenWhatsApp(contactAdminModal.plan)}
                className="w-full h-11 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md btn-lift flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Chat WhatsApp Admin Sekarang</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleCopyMessage(contactAdminModal.plan)}
                className="w-full h-10 rounded-full border-[#1C1917]/15 bg-white text-stone-800 font-bold text-xs hover:bg-stone-50 flex items-center justify-center gap-2"
              >
                {copiedText ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Pesan Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-stone-600" />
                    <span>Salin Format Pesan</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
