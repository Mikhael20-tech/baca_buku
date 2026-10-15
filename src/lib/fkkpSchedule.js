// src/lib/fkkpSchedule.js
// Pengelolaan Jadwal Harian FKKP & Konfigurasi Admin

export const FKKP_DEFAULT_DAYS_WEEK2 = {
  1: {
    day: 1,
    dayName: 'Senin',
    verse: 'Dalam Dia ada hidup dan hidup itu adalah terang manusia... Siapa yang memiliki Anak, ia memiliki hidup; siapa yang tidak memiliki Anak, ia tidak memiliki hidup.',
    verseRef: 'Yohanes 1:4; 1 Yohanes 5:12 • FKKP Minggu 2 Hari 1',
    theme: 'Berkat Hayat Kekal di Zaman Sekarang',
    summary: 'Hayat kekal merupakan berkat terbesar yang Allah berikan kepada kita dalam keselamatan-Nya. Menerima Anak Allah berarti menerima hidup ilahi yang tak terbinasakan, menerangi batin, dan menghidupkan roh kita hari demi hari.',
    prayer: 'Tuhan Yesus, terima kasih atas berkat hayat kekal di dalam-Mu. Pagi ini aku membuka hatiku untuk dipenuhi oleh terang hayat-Mu.',
    file: 'FKKP_2026-4_Summer_Training-13.xhtml',
    anchor: '#_idParaDest-22'
  },
  2: {
    day: 2,
    dayName: 'Selasa',
    verse: '...orang itu pada zaman ini juga akan menerima kembali seratus kali lipat... dan pada zaman yang akan datang ia akan menerima hidup yang kekal... Hendaklah engkau setia sampai mati, dan Aku akan mengaruniakan kepadamu mahkota kehidupan.',
    verseRef: 'Markus 10:29-30; Wahyu 2:10 • FKKP Minggu 2 Hari 2',
    theme: 'Menerima Hayat Kekal Sebagai Pahala di Zaman Kerajaan',
    summary: 'Mendapatkan hayat kekal pada zaman yang akan datang di zaman Kerajaan Seribu Tahun berkaitan dengan pahala atas kesetiaan kita mengikut Tuhan dan memikul salib, beroleh mahkota kehidupan bersama Kristus.',
    prayer: 'Tuhan, kuatkan imanku agar setia melangkah di jalan-Mu, mengejar mahkota kehidupan dan perkenanan-Mu di masa depan.',
    file: 'FKKP_2026-4_Summer_Training-14.xhtml',
    anchor: '#_idParaDest-24'
  },
  3: {
    day: 3,
    dayName: 'Rabu',
    verse: '...Sebaliknya air yang akan Kuberikan kepadanya, akan menjadi mata air di dalam dirinya, yang terus-menerus memancar sampai pada hidup yang kekal... Orang yang haus akan Kuberi minum dengan cuma-cuma dari mata air kehidupan.',
    verseRef: 'Yohanes 4:14; Wahyu 21:6 • FKKP Minggu 2 Hari 3',
    theme: 'Mata Air Hayat Memancar Menuju Kekekalan',
    summary: 'Begitu kita percaya dan menerima Kristus, nama kita tercatat pada kitab kehidupan. Air hidup yang Tuhan anugerahkan menjadi mata air batin yang terus memancar menyegarkan jiwa kita sampai kepada kepenuhan Yerusalem Baru.',
    prayer: 'Oh Tuhan Yesus, aku datang dengan dahaga rohani, minumi aku dengan air hayat-Mu agar hidupku terus memancarkan kesegaran ilahi.',
    file: 'FKKP_2026-4_Summer_Training-15.xhtml',
    anchor: '#_idParaDest-26'
  },
  4: {
    day: 4,
    dayName: 'Kamis',
    verse: 'Aku akan minta kepada Bapa, dan Ia akan memberikan kepadamu seorang Penolong yang lain, supaya Ia menyertai kamu selama-lamanya, yaitu Roh Kebenaran... Dialah yang akan mengajarkan segala sesuatu kepadamu dan akan mengingatkan kamu akan semua yang telah Kukatakan kepadamu.',
    verseRef: 'Yohanes 14:16-17, 26 • FKKP Minggu 2 Hari 4',
    theme: 'Roh Kebenaran Sebagai Penolong & Roh Hayat',
    summary: 'Roh yang berhuni di dalam kita adalah Roh esensial bagi keberadaan dan hayat kita. Roh Kudus sebagai Penolong mengajarkan, mengingatkan firman Kristus, serta menyertai kaum beriman selama-lamanya.',
    prayer: 'Tuhan Yesus, terima kasih atas Roh Kebenaran yang hidup di dalamku. Ajar dan pimpinlah aku melalui bisikan Roh-Mu hari ini.',
    file: 'FKKP_2026-4_Summer_Training-16.xhtml',
    anchor: '#_idParaDest-28'
  },
  5: {
    day: 5,
    dayName: 'Jumat',
    verse: 'Sungguh, Engkau Allah yang menyembunyikan diri, Allah Israel, Juru Selamat... Tidak seorang pun yang pernah melihat Allah; tetapi Anak Tunggal Allah yang ada di pangkuan Bapa, Dialah yang menyatakan-Nya.',
    verseRef: 'Yesaya 45:15; Yohanes 1:18 • FKKP Minggu 2 Hari 5',
    theme: 'Allah yang Menyembunyikan Diri & Bekerja Secara Rahasia',
    summary: 'Allah senang bekerja di dalam batin secara tersembunyi dan rahasia, bukan lewat pertunjukan lahiriah yang mencolok. Melalui Kristus yang menyatakan Bapa, kita belajar menikmati hadirat-Nya yang tenang di ruang batin terdalam.',
    prayer: 'Ya Allah yang menyembunyikan diri, tolong aku untuk tidak mencari perkara lahiriah belaka, tetapi menikmati persekutuan rahasia dengan-Mu di dalam roh.',
    file: 'FKKP_2026-4_Summer_Training-17.xhtml',
    anchor: '#_idParaDest-30'
  },
  6: {
    day: 6,
    dayName: 'Sabtu',
    verse: 'Yesus menyampaikan suatu perumpamaan kepada mereka untuk menegaskan bahwa mereka harus selalu berdoa tanpa jemu-jemu... "Belalah hakku terhadap lawanku."',
    verseRef: 'Lukas 18:1-3; 2 Korintus 11:2 • FKKP Minggu 2 Hari 6',
    theme: 'Berdoa Selalu Tanpa Jemu-Jemu di Zaman Ini',
    summary: 'Kaum beriman di zaman ini digambarkan sebagai janda yang merindukan Suami surgawinya. Kita terus berdiri di atas firman, berseru dalam doa tanpa jemu-jemu menantikan kedatangan dan pembelaan Kristus yang penuh kasih karunia.',
    prayer: 'Tuhan Yesus, nyalakan kembali api doaku. Ajarku untuk selalu berdoa tanpa jemu-jemu dan tetap berjaga-jaga sampai hari kedatangan-Mu.',
    file: 'FKKP_2026-4_Summer_Training-18.xhtml',
    anchor: '#_idParaDest-32'
  },
  7: {
    day: 7,
    dayName: 'Hari Tuhan (Minggu)',
    verse: 'Berkatalah seorang kepada yang lain dalam mazmur, kidung puji-pujian, dan nyanyian rohani. Bernyanyi dan bersoraklah bagi Tuhan dengan segenap hati.',
    verseRef: 'Efesus 5:19; Kolose 3:16 • FKKP Minggu 2 Kidung & Review',
    theme: 'Tinjauan Garis Besar & Memadahkan Kidung Pujian',
    summary: 'Hari Tuhan adalah waktu bersekutu dan meninjau kembali seluruh butir pengajaran sepekan ini. Bersama saudara-saudari kita menyerap Kristus melalui kidung pujian dan menikmati meja perjamuan Tubuh-Nya.',
    prayer: 'Tuhan, satukan kami dalam satu Tubuh untuk memuji dan menikmati kekayaan kasih karunia-Mu di meja perjamuan Kudus.',
    file: 'FKKP_2026-4_Summer_Training-19.xhtml',
    anchor: '#_idParaDest-34'
  }
};

const STORAGE_KEY = 'baca_fkkp_schedule_settings';

export const DEFAULT_FKKP_SETTINGS = {
  mode: 'auto', // 'auto' (otomatis sesuai hari kalender) | 'manual' (kunci hari & minggu tertentu)
  currentWeek: 2, // Minggu ke-1 s/d 12
  manualDay: 4, // 1 (Senin) - 7 (Minggu)
  customOverrides: {} // format: { 'w2d4': { summary, verse, theme, prayer } }
};

export function getFkkpSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_FKKP_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to parse FKKP settings:', e);
  }
  return DEFAULT_FKKP_SETTINGS;
}

export function saveFkkpSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('fkkp_settings_updated', { detail: settings }));
  } catch (e) {
    console.error('Failed to save FKKP settings:', e);
  }
}

/**
 * Menghitung hari kalender saat ini (1 = Senin, 2 = Selasa, ..., 6 = Sabtu, 7 = Minggu)
 */
export function getCalendarDayIndex() {
  const jsDay = new Date().getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  if (jsDay === 0) return 7; // Hari Tuhan / Minggu
  return jsDay; // 1 s/d 6
}

export const DAY_NAMES = {
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
  7: 'Minggu'
};

/**
 * Mengambil data hari FKKP aktif (ayat, tema, ringkasan, initialLocation EPUB)
 */
export function getCurrentFkkpDay(customSettings = null) {
  const settings = customSettings || getFkkpSettings();
  const week = settings.currentWeek || 2;
  
  // Tentukan nomor hari (1-7)
  let dayNum = 4;
  if (settings.mode === 'auto') {
    dayNum = getCalendarDayIndex();
  } else {
    dayNum = Number(settings.manualDay) || 4;
  }

  // Cari data default hari
  let dayData = FKKP_DEFAULT_DAYS_WEEK2[dayNum];
  if (!dayData) {
    dayData = FKKP_DEFAULT_DAYS_WEEK2[4];
  }

  // Hitung perkiraan anchor EPUB jika week berbeda
  let targetFile = dayData.file;
  let targetAnchor = dayData.anchor;
  if (week !== 2) {
    // Estimasi rumus bab FKKP (8 bab per minggu)
    const fileIndex = 4 + (week - 1) * 8 + (dayNum === 7 ? 7 : (dayNum - 1));
    targetFile = `FKKP_2026-4_Summer_Training-${fileIndex}.xhtml`;
    targetAnchor = '';
  }

  const overrideKey = `w${week}d${dayNum}`;
  const override = settings.customOverrides?.[overrideKey] || {};

  const resolved = {
    week,
    day: dayNum,
    dayName: DAY_NAMES[dayNum] || dayData.dayName,
    badge: `Minggu ${week} • Hari ${dayNum} (${DAY_NAMES[dayNum] || dayData.dayName})`,
    theme: override.theme || dayData.theme,
    verse: override.verse || dayData.verse,
    verseRef: override.verseRef || (week === 2 ? dayData.verseRef : `FKKP Minggu ${week} Hari ${dayNum}`),
    summary: override.summary || dayData.summary,
    prayer: override.prayer || dayData.prayer,
    initialLocation: `${targetFile}${targetAnchor}`,
    mode: settings.mode
  };

  return resolved;
}
