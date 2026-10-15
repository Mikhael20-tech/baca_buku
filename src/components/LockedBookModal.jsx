import React from 'react';
import { 
  Lock, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, 
  BookOpen, Compass, HeartHandshake, X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function LockedBookModal({
  isOpen,
  onClose,
  book,
  userPlan,
  onOpenPricing
}) {
  if (!isOpen || !book) return null;

  const currentTier = (userPlan?.tier || 'standart').toUpperCase();

  const handleUpgradeClick = () => {
    onClose();
    if (typeof onOpenPricing === 'function') {
      onOpenPricing();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-6 sm:p-8 bg-[#F4EFE6] text-[#1C1917] rounded-[32px] border border-[#1C1917]/15 shadow-2xl">
        <DialogHeader className="space-y-3 text-center">
          {/* Glowing Lock Badge */}
          <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-900 text-xs font-bold uppercase tracking-wider mx-auto">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Koleksi Paket Premium</span>
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-serif font-bold text-[#1C1917] leading-snug">
            Akses Khusus Pelanggan Premium
          </DialogTitle>

          <DialogDescription className="text-xs sm:text-sm text-[#57534E] max-w-md mx-auto leading-relaxed">
            Buku <strong className="text-[#1C1917]">"{book.title}"</strong> karya <span className="font-semibold text-[#3B4B34]">{book.author || 'Penulis Rohani'}</span> hanya tersedia untuk pelanggan paket <strong>Premium</strong> dan <strong>Ultimate</strong>.
          </DialogDescription>
        </DialogHeader>

        {/* Current Plan vs Premium Callout */}
        <div className="my-4 p-4 rounded-2xl bg-white border border-[#1C1917]/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-[#1C1917]/8">
            <span className="text-[#78716C]">Paket Anda Saat Ini:</span>
            <Badge variant="outline" className="font-bold text-stone-700 bg-stone-100 border-stone-300">
              {currentTier}
            </Badge>
          </div>

          <div className="space-y-2 text-xs">
            <p className="font-bold text-[#1C1917] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Keuntungan Berlangganan Premium:
            </p>
            <ul className="space-y-1.5 pl-1 text-[#57534E]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Akses seluruh <strong>30 Seri Buku Karakter</strong> (Witness Lee)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Akses seluruh <strong>46 Pokok Pembinaan Dasar</strong> (Watchman Nee)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Kisah Martir dan Salib Kristus serta terbitan rohani lengkap</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Simpan catatan perenungan firman & highlight di Cloud</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="rounded-full text-xs font-semibold text-[#78716C] hover:text-[#1C1917] hover:bg-stone-200/50 order-2 sm:order-1"
          >
            Nanti Saja
          </Button>

          <Button
            type="button"
            onClick={handleUpgradeClick}
            className="rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-white px-5 shadow-lg btn-lift gap-2 order-1 sm:order-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Lihat Paket &amp; Upgrade Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
