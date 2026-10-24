import { supabase, isSupabaseConfigured, isValidUUID } from './supabase';

// Data Pengguna & Langganan Perpustakaan Digital Baca
export const INITIAL_USERS = [
  {
    id: 'user-budi-1',
    full_name: 'Budi Pembaca',
    email: 'baca@perpustakaan.cloud',
    password: '123456',
    whatsapp: '0812-3456-7890',
    distrik_lokal: 'Surabaya - Rungkut',
    photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    plan_tier: 'premium', // 'standart' | 'premium' | 'ultimate'
    status: 'active', // 'active' | 'suspended'
    joined_date: '2026-01-10',
    google_play_synced: true,
    apple_books_synced: true
  },
  {
    id: 'user-samuel-2',
    full_name: 'Samuel Hartono',
    email: 'samuel.h@gmail.com',
    password: '123456',
    whatsapp: '0813-8822-1199',
    distrik_lokal: 'Jakarta Pusat - Kemayoran',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    plan_tier: 'ultimate',
    status: 'active',
    joined_date: '2026-02-01',
    google_play_synced: true,
    apple_books_synced: false
  },
  {
    id: 'user-deborah-3',
    full_name: 'Deborah Anggraini',
    email: 'deborah.anggraini@yahoo.com',
    password: '123456',
    whatsapp: '0821-4455-6677',
    distrik_lokal: 'Surabaya Barat - Darmo',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    plan_tier: 'premium',
    status: 'active',
    joined_date: '2026-02-15',
    google_play_synced: false,
    apple_books_synced: true
  },
  {
    id: 'user-lukas-4',
    full_name: 'Lukas Pratama',
    email: 'lukas.pratama@ugm.ac.id',
    password: '123456',
    whatsapp: '0857-9911-3322',
    distrik_lokal: 'Yogyakarta - Gejayan',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    plan_tier: 'standart',
    status: 'active',
    joined_date: '2026-03-01',
    google_play_synced: false,
    apple_books_synced: false
  },
  {
    id: 'user-ruth-5',
    full_name: 'Ruth Melinda',
    email: 'ruth.melinda@outlook.com',
    password: '123456',
    whatsapp: '0811-2233-4455',
    distrik_lokal: 'Bandung - Dago',
    photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    plan_tier: 'ultimate',
    status: 'active',
    joined_date: '2026-03-12',
    google_play_synced: true,
    apple_books_synced: true
  }
];

export function getStoredUsers() {
  try {
    const data = localStorage.getItem('baca_registered_users');
    if (data) {
      return JSON.parse(data);
    }
    localStorage.setItem('baca_registered_users', JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  } catch (e) {
    return INITIAL_USERS;
  }
}

export function saveStoredUsers(users) {
  try {
    localStorage.setItem('baca_registered_users', JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users', e);
  }
}

export function addUser(user) {
  const current = getStoredUsers();
  const newUser = {
    id: 'user-' + Date.now(),
    full_name: user.full_name || 'Pembaca Baru',
    email: user.email || 'user@baca.id',
    password: user.password || '123456',
    whatsapp: user.whatsapp || '-',
    distrik_lokal: user.distrik_lokal || 'Indonesia',
    photo_url: user.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    plan_tier: user.plan_tier || 'standart',
    status: user.status || 'active',
    joined_date: new Date().toISOString().split('T')[0],
    google_play_synced: !!user.google_play_synced,
    apple_books_synced: !!user.apple_books_synced
  };
  const updated = [newUser, ...current];
  saveStoredUsers(updated);
  return updated;
}

export function updateUser(id, updatedFields) {
  const current = getStoredUsers();
  const updated = current.map(u => u.id === id ? { ...u, ...updatedFields } : u);
  saveStoredUsers(updated);

  // Jika UUID valid dan Supabase dikonfigurasi, selaraskan ke tabel profiles
  if (isSupabaseConfigured() && isValidUUID(id)) {
    supabase
      .from('profiles')
      .update(updatedFields)
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.warn('Supabase profile update warning:', error);
      });
  }

  return updated;
}

export function deleteUser(id) {
  const current = getStoredUsers();
  const updated = current.filter(u => u.id !== id);
  saveStoredUsers(updated);

  if (isSupabaseConfigured() && isValidUUID(id)) {
    supabase
      .from('profiles')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.warn('Supabase profile delete warning:', error);
      });
  }

  return updated;
}

/**
 * Menyinkronkan profil pengguna saat ini ke Supabase
 */
export async function syncUserProfileToSupabase(profile) {
  if (!profile || !profile.id) return profile;

  // Simpan secara lokal segera
  try {
    localStorage.setItem('baca_user_profile', JSON.stringify(profile));
  } catch (e) {}

  if (!isSupabaseConfigured() || !isValidUUID(profile.id)) {
    return profile;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        whatsapp: profile.whatsapp,
        distrik_lokal: profile.distrik_lokal,
        photo_url: profile.photo_url,
        plan_tier: profile.plan_tier || 'premium',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Gagal sync ke Supabase profiles:', error.message);
      return profile;
    }

    return { ...profile, ...data };
  } catch (err) {
    console.warn('Network sync exception:', err);
    return profile;
  }
}

/**
 * Mengambil profil pengguna dari Supabase jika tersedia
 */
export async function fetchUserProfileFromSupabase(userId) {
  if (!userId || !isSupabaseConfigured() || !isValidUUID(userId)) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return data;
  } catch (e) {
    return null;
  }
}
