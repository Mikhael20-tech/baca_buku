import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  CheckCircle2, Clock, Download, Copy, Check, ArrowLeft, 
  Sparkles, ShieldCheck, Smartphone, RefreshCw, AlertCircle, ExternalLink 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function QrisPaymentModal({
  isOpen,
  onClose,
  plan,
  billingCycle = 'monthly', // 'monthly' | 'yearly'
  onPaymentSuccess
}) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 menit
  const [isCopied, setIsCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending' | 'processing' | 'success'
  const [orderId, setOrderId] = useState('');
  const timerRef = useRef(null);

  // Hitung nominal harga numerik
  const rawPrice = billingCycle === 'yearly'
    ? (plan?.priceYearly || 'Rp 299.000')
    : (plan?.priceMonthly || 'Rp 29.000');

  const numericPrice = parseInt(rawPrice.replace(/[^0-9]/g, ''), 10) || 29000;
  // Tambah 3 digit angka unik acak untuk verifikasi identifikasi transfer otomatis
  const [uniqueCode] = useState(() => Math.floor(Math.random() * 800) + 100);
  const totalAmount = numericPrice + (numericPrice > 0 ? uniqueCode : 0);

  // Inisialisasi QR Code dan Order ID saat modal dibuka
  useEffect(() => {
    if (!isOpen || !plan) return;

    const newOrderId = `BACA-QRIS-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    setOrderId(newOrderId);
    setTimeLeft(15 * 60);
    setPaymentStatus('pending');

    // Buat data payload string QRIS Standar (EMVCo format payload simulation)
    const qrisPayload = `00020101021226670016ID.CO.BACA.WWW01189360091800000000000215${newOrderId}5204581253033605407${totalAmount}5802ID5914PERPUSTAKAAN RO6007JAKARTA62190115${newOrderId}6304`;

    QRCode.toDataURL(qrisPayload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#1C1917',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    }).then((url) => {
      setQrCodeUrl(url);
    }).catch((err) => {
      console.error('Failed to generate QR Code:', err);
    });

    // Countdown Timer 15 Menit
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, plan, totalAmount]);

  // Format Waktu MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Salin Nominal Pembayaran
  const handleCopyAmount = () => {
    navigator.clipboard.writeText(totalAmount.toString());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Unduh Gambar QR Code
  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `QRIS-${orderId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Simulasi / Eksekusi Sukses Pembayaran
  const handleSimulateSuccess = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('success');
      setTimeout(() => {
        if (typeof onPaymentSuccess === 'function') {
          onPaymentSuccess({
            tier: plan.id,
            status: 'active',
            billingCycle,
            paidAmount: totalAmount,
            orderId,
            paidAt: new Date().toISOString()
          });
        }
      }, 1600);
    }, 900);
  };

  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && paymentStatus !== 'processing' && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg p-5 sm:p-7 bg-[#F4EFE6] text-[#1C1917] rounded-[32px] border border-[#1C1917]/15 shadow-2xl overflow-y-auto max-h-[95vh]">
        
        {/* ===================== STATUS: SUKSES ===================== */}
        {paymentStatus === 'success' ? (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 inline-block">
                Pembayaran Terkonfirmasi Otomatis
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#1C1917]">
                Selamat Datang di Paket {plan.name}!
              </h2>
              <p className="text-xs sm:text-sm text-[#78716C] max-w-sm mx-auto">
                Transaksi QRIS Anda telah berhasil diproses. Seluruh hak akses buku dan pembacaan telah langsung aktif di akun Anda.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#1C1917]/10 text-left text-xs space-y-2 max-w-sm mx-auto shadow-sm">
              <div className="flex justify-between">
                <span className="text-[#78716C]">Order ID:</span>
                <span className="font-mono font-bold text-[#1C1917]">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716C]">Paket Langganan:</span>
                <span className="font-bold text-emerald-700">{plan.name} ({billingCycle === 'yearly' ? '1 Tahun' : '1 Bulan'})</span>
              </div>
              <div className="flex justify-between border-t border-[#1C1917]/10 pt-2">
                <span className="text-[#78716C]">Total Dibayar:</span>
                <span className="font-bold text-[#1C1917]">Rp {totalAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <p className="text-[11px] text-[#78716C] flex items-center justify-center gap-1.5 pt-2">
              <RefreshCw className="w-3 h-3 animate-spin text-[#3B4B34]" />
              Menyiapkan perpustakaan Anda...
            </p>
          </div>
        ) : (
          /* ===================== STATUS: PENDING & PROSES ===================== */
          <div className="space-y-4">
          <DialogHeader className="space-y-2 text-center">
            {/* Header Tag */}
            <div className="flex items-center justify-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1C1917] text-white text-[11px] font-bold tracking-wider">
                <span className="text-red-500 font-extrabold text-xs">QRIS</span>
                <span className="text-stone-300">Dinamis Otomatis</span>
              </div>
              <span className="text-[11px] font-semibold text-[#78716C]">GPN Terhubung</span>
            </div>

            <DialogTitle className="text-xl sm:text-2xl font-serif font-bold text-[#1C1917]">
              Scan QRIS untuk Membayar
            </DialogTitle>
            <DialogDescription className="text-xs text-[#78716C]">
              Buka aplikasi BCA Mobile, Livin, GoPay, OVO, ShopeePay, DANA atau m-Banking Anda, lalu scan kode QR di bawah ini.
            </DialogDescription>
          </DialogHeader>

          {/* Kartu QRIS */}
          <div className="relative bg-white rounded-3xl p-5 border border-[#1C1917]/15 shadow-md flex flex-col items-center max-w-xs mx-auto">
            {/* Logo QRIS Header */}
            <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-[#1C1917]/10">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-md bg-red-600 flex items-center justify-center text-white font-black text-[10px]">
                  Q
                </div>
                <span className="font-bold text-xs text-[#1C1917] tracking-tight">QRIS</span>
              </div>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                Pembayaran Cepat
              </span>
            </div>

            {/* Gambar Barcode QRIS */}
            <div className="relative w-52 h-52 sm:w-56 sm:h-56 bg-stone-50 rounded-2xl p-2 flex items-center justify-center border border-stone-200 shadow-inner">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="QRIS Code" 
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-stone-400 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#3B4B34]" />
                  <span>Membuat QRIS...</span>
                </div>
              )}

              {/* Overlay Processing */}
              {paymentStatus === 'processing' && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center gap-2 animate-in fade-in">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                  <span className="text-xs font-bold text-[#1C1917]">Memverifikasi Pembayaran...</span>
                </div>
              )}
            </div>

            {/* Nama Merchant & Timer */}
            <div className="w-full text-center mt-3 pt-3 border-t border-[#1C1917]/10 space-y-1">
              <p className="font-bold text-xs text-[#1C1917]">BACA BUKU ROHANI & PEMBINAAN</p>
              <p className="text-[10px] text-[#78716C] font-mono">NMID: ID1020260492817</p>
            </div>
          </div>

          {/* Rincian Tagihan & Timer */}
          <div className="rounded-2xl p-4 bg-white/90 border border-[#1C1917]/10 space-y-2.5 text-xs shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#1C1917]/8">
              <span className="text-[#78716C]">Batas Waktu Bayar:</span>
              <div className="inline-flex items-center gap-1.5 font-bold font-mono text-amber-700 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#78716C]">Paket yang Dipilih:</span>
              <span className="font-bold text-[#1C1917]">
                {plan.name} <Badge variant="outline" className="text-[10px] ml-1 bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold">{billingCycle === 'yearly' ? '1 Tahun' : '1 Bulan'}</Badge>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#78716C]">Total Pembayaran:</span>
              <div className="flex items-center gap-2">
                <span className="font-serif font-extrabold text-base sm:text-lg text-[#1C1917]">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
                <button
                  onClick={handleCopyAmount}
                  className="p-1 rounded-md hover:bg-stone-100 text-[#78716C] hover:text-[#1C1917] transition"
                  title="Salin Nominal"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {uniqueCode > 0 && (
              <p className="text-[10px] text-amber-800 bg-amber-50 rounded-lg p-2 leading-relaxed border border-amber-200/60">
                * Nominal sudah termasuk 3 digit kode unik (<strong>{uniqueCode}</strong>) agar sistem verifikasi otomatis dapat mengenali pembayaran Anda secara instan.
              </p>
            )}
          </div>

          {/* Quick Actions (Unduh QR & Tombol Testing) */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadQR}
                className="rounded-full text-xs font-semibold border-[#1C1917]/20 text-[#1C1917] hover:bg-white"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Unduh Gambar QR
              </Button>

              <Button
                size="sm"
                onClick={handleSimulateSuccess}
                disabled={paymentStatus === 'processing'}
                className="rounded-full text-xs font-bold bg-[#3B4B34] hover:bg-[#20251A] text-white shadow-sm gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Simulasi Bayar (OK)</span>
              </Button>
            </div>

            {/* Status Live Pulse */}
            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-[#78716C]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Menunggu notifikasi pembayaran dari bank/e-wallet...</span>
            </div>
          </div>

          {/* Panduan Singkat Bayar */}
          <div className="pt-2 border-t border-[#1C1917]/10 flex items-center justify-between text-[11px] text-[#78716C]">
            <button
              onClick={onClose}
              className="hover:underline flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3 h-3" />
              Pilih Paket Lain
            </button>
            <span className="flex items-center gap-1 text-emerald-800 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Aman &amp; Terenkripsi QRIS Bank Indonesia
            </span>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
