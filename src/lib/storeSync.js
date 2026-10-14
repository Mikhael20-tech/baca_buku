// Penyimpanan & Antrean Verifikasi Pembelian Google Play & Apple Books
export const INITIAL_VERIFICATIONS = [
  {
    id: 'verify-1',
    user_name: 'Budi Pembaca',
    user_email: 'baca@perpustakaan.cloud',
    platform: 'Google Play Books',
    order_id: 'GPA.3391-4412-8871-90123',
    book_title: 'Buku Karakter Seri 1: Benar (Witness Lee)',
    status: 'verified', // 'pending' | 'verified' | 'rejected'
    notes: 'Terverifikasi otomatis via Google Play Order ID.',
    submitted_at: '2026-10-10'
  },
  {
    id: 'verify-2',
    user_name: 'Samuel Hartono',
    user_email: 'samuel.h@gmail.com',
    platform: 'Apple Books',
    order_id: 'APL-INV-2026-098812',
    book_title: 'Pembinaan Dasar Kaum Beriman (Watchman Nee)',
    status: 'verified',
    notes: 'Bukti invoice Apple App Store sah.',
    submitted_at: '2026-10-12'
  },
  {
    id: 'verify-3',
    user_name: 'Deborah Anggraini',
    user_email: 'deborah.anggraini@yahoo.com',
    platform: 'Google Play Books',
    order_id: 'GPA.8821-1123-5567-44019',
    book_title: 'Buku Karakter: 30 Butir Lengkap',
    status: 'pending',
    notes: 'Menunggu konfirmasi admin.',
    submitted_at: '2026-10-14'
  }
];

export function getStoreVerifications() {
  try {
    const data = localStorage.getItem('baca_store_verifications');
    if (data) {
      return JSON.parse(data);
    }
    localStorage.setItem('baca_store_verifications', JSON.stringify(INITIAL_VERIFICATIONS));
    return INITIAL_VERIFICATIONS;
  } catch (e) {
    return INITIAL_VERIFICATIONS;
  }
}

export function saveStoreVerifications(items) {
  try {
    localStorage.setItem('baca_store_verifications', JSON.stringify(items));
  } catch (e) {
    console.error('Gagal menyimpan verifikasi toko', e);
  }
}

export function submitStoreVerification(item) {
  const current = getStoreVerifications();
  const newItem = {
    id: 'verify-' + Date.now(),
    user_name: item.user_name || 'Pembaca',
    user_email: item.user_email || 'user@baca.id',
    platform: item.platform || 'Google Play Books',
    order_id: item.order_id || '-',
    book_title: item.book_title || 'Buku Terbitan LSM / Yasperin',
    status: 'pending',
    notes: 'Diajukan oleh pengguna, menunggu tinjauan admin.',
    submitted_at: new Date().toISOString().split('T')[0]
  };
  const updated = [newItem, ...current];
  saveStoreVerifications(updated);
  return updated;
}

export function updateVerificationStatus(id, newStatus, adminNote = '') {
  const current = getStoreVerifications();
  const updated = current.map(item => {
    if (item.id === id) {
      return {
        ...item,
        status: newStatus,
        notes: adminNote || (newStatus === 'verified' ? 'Disetujui oleh Administrator. Akses buku aktif!' : 'Pengajuan ditolak. Nomor pesanan tidak cocok.')
      };
    }
    return item;
  });
  saveStoreVerifications(updated);
  return updated;
}

export function deleteStoreVerification(id) {
  const current = getStoreVerifications();
  const updated = current.filter(item => item.id !== id);
  saveStoreVerifications(updated);
  return updated;
}
