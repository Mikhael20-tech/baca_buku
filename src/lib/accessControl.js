/**
 * Logika Kontrol Akses & Pembatasan Tingkat Langganan (Tier Access Control)
 * 
 * Aturan Akses:
 * - Standart (Gratis):
 *     1. Akses 66 Kitab Alkitab Versi Pemulihan lengkap (selalu gratis)
 *     2. FKKP Kebangunan Pagi edisi minggu berjalan (gratis)
 *     3. Buku demonstrasi filosofis umum
 *     4. Mode gulir otomatis doa-makan & penyimpanan lokal
 * 
 * - Premium (Rp 29.000/bln):
 *     1. Semua fitur Standart
 *     2. Akses seluruh 30 Seri Buku Karakter (Witness Lee)
 *     3. Akses seluruh 46 Pokok Pembinaan Dasar Kaum Beriman (Watchman Nee)
 *     4. Koleksi biografi rohani (Kisah Martir dan Salib Kristus, dll)
 *     5. Arsip edisi FKKP lengkap
 *     6. Catatan perenungan firman & highlight di Cloud
 * 
 * - Ultimate (Rp 49.000/bln):
 *     1. Semua fitur Premium
 *     2. Multi-device sync & prioritas terbitan baru
 * 
 * - Admin Role (admin123):
 *     Bebas akses penuh ke seluruh buku tanpa batasan langganan.
 */

export function getBookAccessInfo(book) {
  if (!book) {
    return {
      requiredTier: 'standart',
      isFree: true,
      label: 'Gratis'
    };
  }

  const id = String(book.id || '').toLowerCase();
  const title = String(book.title || '').toLowerCase();
  const category = String(book.category || '').toLowerCase();

  // 1. Alkitab Versi Pemulihan 66 Kitab selalu GRATIS untuk semua pengguna
  if (
    book.is_bible || 
    id.startsWith('alkitab-') || 
    title.includes('alkitab') || 
    category.includes('alkitab') ||
    title.includes('matius')
  ) {
    return {
      requiredTier: 'standart',
      isFree: true,
      label: 'Akses Gratis (Semua Paket)'
    };
  }

  // 2. FKKP Edisi Minggu Berjalan GRATIS untuk Standart
  // Hanya arsip edisi lama yang memerlukan Premium
  if (
    (id === 'fkkp-kaum-beriman' || 
     id === '4e109d2d-08d5-4d3e-8c12-5a79a9f3e472' || 
     title.includes('fkkp') || 
     title.includes('kebangunan pagi')) &&
    !id.includes('arsip')
  ) {
    return {
      requiredTier: 'standart',
      isFree: true,
      label: 'Gratis (Edisi Minggu Ini)'
    };
  }

  // 3. Buku Karakter (Witness Lee, 30 Seri) -> Wajib Premium
  if (
    id === 'buku-karakter-wl' || 
    id.startsWith('buku-karakter') || 
    title.includes('karakter') ||
    category.includes('karakter')
  ) {
    return {
      requiredTier: 'premium',
      isFree: false,
      label: 'Paket Premium'
    };
  }

  // 4. Pembinaan Dasar Kaum Beriman (Watchman Nee, 46 Pokok) -> Wajib Premium
  if (
    id === 'pembinaan-dasar-wn' || 
    id.startsWith('pembinaan-dasar') || 
    title.includes('pembinaan dasar') ||
    category.includes('pembinaan')
  ) {
    return {
      requiredTier: 'premium',
      isFree: false,
      label: 'Paket Premium'
    };
  }

  // 5. Kisah Martir dan Salib Kristus / Buku Rohani Mendalam -> Wajib Premium
  if (
    id.includes('martir') || 
    title.includes('martir') || 
    book.is_premium || 
    book.required_tier === 'premium'
  ) {
    return {
      requiredTier: 'premium',
      isFree: false,
      label: 'Paket Premium'
    };
  }

  // 6. Jika buku secara spesifik membutuhkan Ultimate
  if (book.required_tier === 'ultimate') {
    return {
      requiredTier: 'ultimate',
      isFree: false,
      label: 'Paket Ultimate'
    };
  }

  // Default untuk buku umum / demonstrasi lokal (misal: Meditasi Marcus Aurelius, Sang Pangeran)
  return {
    requiredTier: 'standart',
    isFree: true,
    label: 'Standart (Gratis)'
  };
}

/**
 * Memeriksa apakah buku terkunci untuk pengguna saat ini
 * @param {Object} book - Data buku
 * @param {Object} userPlan - Objek plan pengguna ({ tier: 'standart'|'premium'|'ultimate', ... })
 * @param {string} userRole - Peran pengguna ('admin' | 'reader' | 'guest')
 * @returns {boolean} true jika terkunci, false jika bisa dibaca
 */
export function isBookLocked(book, userPlan, userRole = 'reader') {
  // Admin selalu bebas akses penuh
  if (userRole === 'admin') return false;

  const userTier = (userPlan?.tier || 'standart').toLowerCase();

  // Ultimate membuka semua buku tanpa terkecuali
  if (userTier === 'ultimate') return false;

  const access = getBookAccessInfo(book);

  if (access.requiredTier === 'ultimate') {
    return userTier !== 'ultimate';
  }

  if (access.requiredTier === 'premium') {
    return userTier !== 'premium' && userTier !== 'ultimate';
  }

  return false;
}
