import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-project') &&
    supabaseUrl.startsWith('https://')
  );
};

// Fallback dummy client to prevent crash if .env is not yet filled
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy';

export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : fallbackUrl,
  isSupabaseConfigured() ? supabaseAnonKey : fallbackKey
);

/**
 * Membuat Signed URL sementara untuk membaca file EPUB privat secara aman
 * @param {string} filePath - Path file di bucket books, atau URL publik/blob untuk demo
 * @param {number} expiresInSeconds - Masa kedaluwarsa URL (default 3600 detik / 1 jam)
 */
export async function getSignedBookUrl(filePath, expiresInSeconds = 3600) {
  // Jika file adalah path statis lokal (misal /books/...) atau blob/data URL atau direct HTTP URL
  if (
    !filePath ||
    filePath.startsWith('/') ||
    filePath.startsWith('./') ||
    filePath.startsWith('blob:') ||
    filePath.startsWith('data:') ||
    filePath.startsWith('http://') ||
    (filePath.startsWith('https://') && !filePath.includes('supabase.co/storage'))
  ) {
    return filePath;
  }

  if (!isSupabaseConfigured()) {
    // Mode demo / offline jika kredensial belum diisi
    return filePath;
  }

  const { data, error } = await supabase.storage
    .from('books')
    .createSignedUrl(filePath, expiresInSeconds);

  if (error) throw error;
  return data.signedUrl;
}
