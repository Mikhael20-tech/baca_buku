// src/lib/fkkpAccess.js
// Logika Akses & Struktur Materi FKKP untuk Hak Akses Pengguna

// Helper validasi UUID untuk kolom UUID di database Supabase (menghindari error 400 Bad Request jika user demo)
export const isValidUUID = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// Helper mendeteksi nomor minggu dan nomor hari dari teks label atau link file FKKP
export function parseFkkpWeekAndDay(text = '', href = '') {
  let week = null;
  let day = null;

  const cleanText = (text || '').toLowerCase();
  const cleanHref = (href || '').toLowerCase();

  // 1. Ekstraksi Minggu dari Text
  const weekNumMatch = cleanText.match(/(?:minggu|week)(?:\s*(?:ke|-)?\s*)(\d+)/i);
  if (weekNumMatch) {
    week = parseInt(weekNumMatch[1], 10);
  } else if (/(?:minggu|week)\s+(?:xii|12)\b/i.test(cleanText)) {
    week = 12;
  } else if (/(?:minggu|week)\s+(?:xi|11)\b/i.test(cleanText)) {
    week = 11;
  } else if (/(?:minggu|week)\s+(?:x|10)\b/i.test(cleanText)) {
    week = 10;
  } else if (/(?:minggu|week)\s+(?:ix|9)\b/i.test(cleanText)) {
    week = 9;
  } else if (/(?:minggu|week)\s+(?:viii|8)\b/i.test(cleanText)) {
    week = 8;
  } else if (/(?:minggu|week)\s+(?:vii|7)\b/i.test(cleanText)) {
    week = 7;
  } else if (/(?:minggu|week)\s+(?:vi|6)\b/i.test(cleanText)) {
    week = 6;
  } else if (/(?:minggu|week)\s+(?:v|5)\b/i.test(cleanText)) {
    week = 5;
  } else if (/(?:minggu|week)\s+(?:iv|4)\b/i.test(cleanText)) {
    week = 4;
  } else if (/(?:minggu|week)\s+(?:iii|3)\b/i.test(cleanText)) {
    week = 3;
  } else if (/(?:minggu|week)\s+(?:ii|2)\b/i.test(cleanText)) {
    week = 2;
  } else if (/(?:minggu|week)\s+(?:i|1)\b/i.test(cleanText)) {
    week = 1;
  } else if (cleanText.includes('minggu pertama') || cleanText.includes('minggu satu')) {
    week = 1;
  } else if (cleanText.includes('minggu kedua') || cleanText.includes('minggu dua')) {
    week = 2;
  } else if (cleanText.includes('minggu ketiga') || cleanText.includes('minggu tiga')) {
    week = 3;
  } else if (cleanText.includes('minggu keempat') || cleanText.includes('minggu empat')) {
    week = 4;
  } else if (cleanText.includes('minggu kelima') || cleanText.includes('minggu lima')) {
    week = 5;
  } else if (cleanText.includes('minggu keenam') || cleanText.includes('minggu enam')) {
    week = 6;
  } else if (cleanText.includes('minggu ketujuh') || cleanText.includes('minggu tujuh')) {
    week = 7;
  } else if (cleanText.includes('minggu kedelapan') || cleanText.includes('minggu delapan')) {
    week = 8;
  } else if (cleanText.includes('minggu kesembilan') || cleanText.includes('minggu sembilan')) {
    week = 9;
  } else if (cleanText.includes('minggu kesepuluh') || cleanText.includes('minggu sepuluh')) {
    week = 10;
  } else if (cleanText.includes('minggu kesebelas') || cleanText.includes('minggu sebelas')) {
    week = 11;
  } else if (cleanText.includes('minggu kedua belas') || cleanText.includes('minggu dua belas')) {
    week = 12;
  }

  const isGarisBesar = cleanText.includes('garis besar') || cleanText.includes('outline') || cleanHref.includes('garis_besar');

  // 2. Ekstraksi Hari dari Text (Hanya jika BUKAN Garis Besar, agar sub-heading "HARI 1" di dalam Garis Besar tidak mengacaukan status overview)
  if (!isGarisBesar) {
    const dayNumMatch = cleanText.match(/(?:hari|day)(?:\s*(?:ke|-)?\s*)(\d+)/i);
    if (dayNumMatch) {
      day = parseInt(dayNumMatch[1], 10);
    } else if (/\bhari\s+senin\b/i.test(cleanText)) {
      day = 1;
    } else if (/\bhari\s+selasa\b/i.test(cleanText)) {
      day = 2;
    } else if (/\bhari\s+rabu\b/i.test(cleanText)) {
      day = 3;
    } else if (/\bhari\s+kamis\b/i.test(cleanText)) {
      day = 4;
    } else if (/\bhari\s+jumat\b/i.test(cleanText)) {
      day = 5;
    } else if (/\bhari\s+sabtu\b/i.test(cleanText)) {
      day = 6;
    } else if (/\b(?:hari\s+tuhan|hari\s+minggu)\b/i.test(cleanText)) {
      day = 7;
    } else if (/\bhari\s+vii\b/i.test(cleanText)) {
      day = 7;
    } else if (/\bhari\s+vi\b/i.test(cleanText)) {
      day = 6;
    } else if (/\bhari\s+v\b/i.test(cleanText)) {
      day = 5;
    } else if (/\bhari\s+iv\b/i.test(cleanText)) {
      day = 4;
    } else if (/\bhari\s+iii\b/i.test(cleanText)) {
      day = 3;
    } else if (/\bhari\s+ii\b/i.test(cleanText)) {
      day = 2;
    } else if (/\bhari\s+i\b/i.test(cleanText)) {
      day = 1;
    } else if (cleanText.includes('hari pertama')) {
      day = 1;
    } else if (cleanText.includes('hari kedua')) {
      day = 2;
    } else if (cleanText.includes('hari ketiga')) {
      day = 3;
    } else if (cleanText.includes('hari keempat')) {
      day = 4;
    } else if (cleanText.includes('hari kelima')) {
      day = 5;
    } else if (cleanText.includes('hari keenam')) {
      day = 6;
    } else if (cleanText.includes('hari ketujuh')) {
      day = 7;
    }
  } else {
    // Garis Besar bukan hari 1-7, melainkan rangkuman pembuka sepekan (day = 0)
    day = 0;
  }

  // 3. Ekstraksi dari Filename (href) Summer Training (Tiap minggu terdiri dari 8 file: 1 Garis Besar + 7 Hari Santapan)
  // File 4 = Minggu 1 Garis Besar, File 5-11 = Minggu 1 Hari 1-7
  // File 12 = Minggu 2 Garis Besar, File 13-19 = Minggu 2 Hari 1-7
  // File 20 = Minggu 3 Garis Besar, File 21-27 = Minggu 3 Hari 1-7
  const fileMatch = (cleanHref || cleanText).match(/summer_training-(\d+)\.xhtml/i);
  if (fileMatch) {
    const fileNum = parseInt(fileMatch[1], 10);
    if (fileNum >= 4) {
      const offset = fileNum - 4;
      const fileWeek = Math.floor(offset / 8) + 1;
      const fileSubIndex = offset % 8; // 0 = Garis Besar, 1..7 = Hari 1..7
      if (week === null) week = fileWeek;
      if (day === null) {
        day = fileSubIndex === 0 ? 0 : fileSubIndex;
      }
    }
  }

  return { week, day };
}

// Kompatibilitas fungsi deteksi minggu
export function parseFkkpWeekNumber(text) {
  return parseFkkpWeekAndDay(text, text).week;
}

// Logika apakah bagian firman FKKP terkunci untuk paket Standart:
// 1. Minggu sebelumnya (week < activeWeek) -> Buka penuh (kebuka)
// 2. Minggu setelahnya (week > activeWeek) -> Kunci (🔒 Premium)
// 3. Minggu berjalan (week === activeWeek) -> Garis Besar (day 0) buka, hari <= activeDay buka, hari > activeDay kunci
export function isFkkpSectionLocked(week, day, activeWeek = 2, activeDay = 4) {
  if (week === null || week === undefined) return false;

  if (week < activeWeek) {
    return false;
  }

  if (week > activeWeek) {
    return true;
  }

  // Untuk minggu berjalan (week === activeWeek):
  // Garis Besar (day === 0) atau konten umum tanpa hari spesifik selalu dibuka
  if (day === 0 || day === null || day === undefined) {
    return false;
  }

  return day > activeDay;
}

// Memproses struktur Daftar Isi agar item seperti "Rawatan Pagi" mewarisi Minggu dan Hari dari judul di atasnya
export function annotateFkkpToc(items, inheritedWeek = null, inheritedDay = null) {
  let runningWeek = inheritedWeek;
  let runningDay = inheritedDay;

  return items.map((item) => {
    const parsed = parseFkkpWeekAndDay(item.label, item.href);

    if (parsed.week !== null && parsed.week !== runningWeek) {
      runningWeek = parsed.week;
      runningDay = null;
    }

    if (parsed.day !== null) {
      // Jika Garis Besar (day === 0), jangan set runningDay ke angka hari santapan
      runningDay = parsed.day === 0 ? null : parsed.day;
    }

    const itemWeek = parsed.week ?? runningWeek;
    const itemDay = parsed.day ?? runningDay;

    if (parsed.week !== null) runningWeek = parsed.week;

    const subitems = item.subitems && item.subitems.length > 0
      ? annotateFkkpToc(item.subitems, itemWeek, itemDay)
      : item.subitems;

    return {
      ...item,
      fkkpWeek: itemWeek,
      fkkpDay: itemDay,
      subitems
    };
  });
}
