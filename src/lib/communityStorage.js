// Penyimpanan lokal untuk Bagi Nikmat dan Integrasi Toko Buku
export const INITIAL_TESTIMONIALS = [
  {
    id: 'testi-1',
    name: 'Samuel Hartono',
    role: 'Pelayan Remaja • Jakarta',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Aplikasi Baca benar-benar mengubah waktu saat teduh saya. Fitur doa-makan FKKP dengan mode gulir otomatis membuat saya menikmati firman tanpa terdistraksi. Apalagi buku-buku yang pernah saya beli di Google Play Books langsung tersambung otomatis, hemat sekali!',
    date: '3 hari yang lalu'
  },
  {
    id: 'testi-2',
    name: 'Deborah Anggraini',
    role: 'Ibu Rumah Tangga • Surabaya',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Rangkuman di Meja Perjamuan sangat membantu ketika pagi hari saya sibuk menyiapkan anak-anak. Hanya 3 menit membaca intisarinya, roh saya langsung kenyang dan segar untuk menjalani hari.',
    date: '5 hari yang lalu'
  },
  {
    id: 'testi-3',
    name: 'Lukas Pratama',
    role: 'Mahasiswa • Yogyakarta',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Integrasi dengan Apple Books sangat mulus. Saya tidak perlu beli ulang buku-buku Watchman Nee dan Witness Lee yang sudah saya koleksi di iPhone. Rekomendasi wajib untuk semua kaum beriman!',
    date: '1 minggu yang lalu'
  },
  {
    id: 'testi-4',
    name: 'Ruth Melinda',
    role: 'Pekerja Profesional • Bandung',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Kolom Terang dan Inspirasi serta Bagi Nikmat membuat saya merasa tidak bergumul sendirian. Membaca nikmat singkat saudara-saudari dari berbagai kota sungguh menguatkan iman saya.',
    date: '2 minggu yang lalu'
  }
];

export const INITIAL_SHORT_ENJOYMENTS = [
  {
    id: 'nikmat-1',
    name: 'Hadi Kurnia',
    city: 'Surabaya',
    text: 'Kristus adalah air hidup yang memuaskan dahagaku pagi ini.',
    time: '5 menit lalu',
    likes: 12
  },
  {
    id: 'nikmat-2',
    name: 'Grace Natalia',
    city: 'Bandung',
    text: 'Makan firman Yohanes 6 bikin hati damai sejahtera sepanjang hari.',
    time: '18 menit lalu',
    likes: 8
  },
  {
    id: 'nikmat-3',
    name: 'Daniel Prasetyo',
    city: 'Semarang',
    text: 'Memanggil nama Tuhan di kantor mengubah suasana batin jadi terang.',
    time: '34 menit lalu',
    likes: 15
  },
  {
    id: 'nikmat-4',
    name: 'Yohana S.',
    city: 'Jakarta Barat',
    text: 'Karakter Seri 1 menolongku untuk teliti dan jujur dalam hal kecil.',
    time: '1 jam lalu',
    likes: 21
  },
  {
    id: 'nikmat-5',
    name: 'Jonathan Tan',
    city: 'Medan',
    text: 'FKKP hari ini membuka mata hatiku bahwa Tuhan itu santapan nyata!',
    time: '2 jam lalu',
    likes: 19
  },
  {
    id: 'nikmat-6',
    name: 'Maria Esther',
    city: 'Malang',
    text: 'Membaca Alkitab dengan doa membuat firman terasa manis seperti madu.',
    time: '3 jam lalu',
    likes: 14
  }
];

// Helper functions for local state
export function getStoredEnjoyments() {
  try {
    const data = localStorage.getItem('baca_short_enjoyments');
    return data ? JSON.parse(data) : INITIAL_SHORT_ENJOYMENTS;
  } catch (e) {
    return INITIAL_SHORT_ENJOYMENTS;
  }
}

export function saveStoredEnjoyments(enjoyments) {
  try {
    localStorage.setItem('baca_short_enjoyments', JSON.stringify(enjoyments));
  } catch (e) {
    console.error('Failed to save enjoyments', e);
  }
}

export function addEnjoyment({ name, city, text }) {
  const current = getStoredEnjoyments();
  const newItem = {
    id: 'nikmat-' + Date.now(),
    name: name.trim() || 'Sahabat Rohani',
    city: city ? city.trim() : 'Indonesia',
    text: text.trim(),
    time: 'Baru saja',
    likes: 1
  };
  const updated = [newItem, ...current];
  saveStoredEnjoyments(updated);
  return updated;
}

// User Subscription State
export function getUserSubscription() {
  try {
    const data = localStorage.getItem('baca_user_plan');
    return data ? JSON.parse(data) : {
      tier: 'premium', // 'standart' | 'premium' | 'ultimate'
      status: 'active',
      expiresAt: '2027-12-31',
      googlePlayLinked: true,
      googlePlayEmail: 'budi.pembaca@gmail.com',
      appleBooksLinked: true,
      appleId: 'budi.pembaca@icloud.com',
      syncedBooksCount: 14
    };
  } catch (e) {
    return {
      tier: 'premium',
      status: 'active',
      expiresAt: '2027-12-31',
      googlePlayLinked: true,
      googlePlayEmail: 'budi.pembaca@gmail.com',
      appleBooksLinked: true,
      appleId: 'budi.pembaca@icloud.com',
      syncedBooksCount: 14
    };
  }
}

export function saveUserSubscription(plan) {
  try {
    localStorage.setItem('baca_user_plan', JSON.stringify(plan));
  } catch (e) {
    console.error('Failed to save user plan', e);
  }
}
