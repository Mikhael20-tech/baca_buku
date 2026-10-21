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

export const FKKP_DEFAULT_DAYS_WEEK3 = {
  1: {
    day: 1,
    dayName: 'Senin',
    verse: 'Tetapi oleh karena Dia kamu berada dalam Kristus Yesus, yang oleh Allah telah menjadi hikmat bagi kita: Ia membenarkan dan menguduskan dan menebus kita... Kasih karunia Tuhan Yesus Kristus menyertai rohmu.',
    verseRef: '1 Korintus 1:30; Filemon 1:25 • FKKP Minggu 3 Hari 1',
    theme: 'Kristus Menjadi Hikmat, Kebenaran, dan Pengudusan Kita',
    summary: 'Allah menempatkan kita di dalam Kristus Yesus sehingga segala sesuatu yang kita perlukan bagi pertumbuhan hayat menjadi bagian kita. Kristus bukan sekadar teladan luar, melainkan hikmat hidup yang menguduskan dan memperbarui batin kita setiap hari.',
    prayer: 'Tuhan Yesus, terima kasih telah menjadi bagian dan hikmat hidupku. Pagi ini aku membuka hatiku untuk dipenuhi oleh limpahan kasih karunia-Mu.',
    file: 'FKKP_2026-4_Summer_Training-21.xhtml',
    anchor: ''
  },
  2: {
    day: 2,
    dayName: 'Selasa',
    verse: 'Namun aku hidup, tetapi bukan lagi aku sendiri yang hidup, melainkan Kristus yang hidup di dalam aku. Dan hidup yang kuhidupi sekarang di dalam daging, adalah hidup oleh iman dalam Anak Allah yang telah mengasihi aku...',
    verseRef: 'Galatia 2:20 • FKKP Minggu 3 Hari 2',
    theme: 'Bukan Lagi Aku, Melainkan Kristus yang Hidup di Dalamku',
    summary: 'Kunci kehidupan kaum beriman adalah kehidupan yang dicangkokkan dengan Kristus. Manusia lama kita telah disalibkan bersama Dia, dan kini hayat kebangkitan Kristus yang berkuasa mengalir di dalam roh kita.',
    prayer: 'Tuhan, aku menyangkal diriku dan berserah kepada-Mu. Hiduplah dan berekspresilah melalui pikiranku, perasaanku, dan kehendakku hari ini.',
    file: 'FKKP_2026-4_Summer_Training-22.xhtml',
    anchor: ''
  },
  3: {
    day: 3,
    dayName: 'Rabu',
    verse: 'Sebab di dalam Dialah berdiam secara jasmaniah seluruh kepenuhan ke-Allahan, dan kamu telah dipenuhi di dalam Dia... Marilah kita dengan penuh keberanian menghampiri takhta kasih karunia...',
    verseRef: 'Kolose 2:9-10; Ibrani 4:16 • FKKP Minggu 3 Hari 3',
    theme: 'Dipenuhi oleh Kepenuhan Kristus di Takhta Kasih Karunia',
    summary: 'Di dalam Kristus berdiam seluruh kepenuhan keallahan. Ketika kita berdoa dan berpaling kepada roh, takhta kasih karunia terbuka lebar bagi kita untuk menerima pertolongan, damai sejahtera, dan pasokan hayat yang berlimpah tepat pada waktunya.',
    prayer: 'Ya Tuhan Yesus, dengan penuh keberanian aku menghampiri takhta kasih karunia-Mu pagi ini. Basahi dan penuhilah bejanaku dengan limpah ruah kepenuhan-Mu.',
    file: 'FKKP_2026-4_Summer_Training-23.xhtml',
    anchor: ''
  },
  4: {
    day: 4,
    dayName: 'Kamis',
    verse: 'Tetapi barangsiapa mengikatkan dirinya pada Tuhan, menjadi satu roh dengan Dia... Roh itu bersaksi bersama-sama dengan roh kita, bahwa kita adalah anak-anak Allah.',
    verseRef: '1 Korintus 6:17; Roma 8:16 • FKKP Minggu 3 Hari 4',
    theme: 'Satu Roh dengan Tuhan di dalam Roh yang Berbaur',
    summary: 'Misteri terbesar dalam pengalaman kaum beriman adalah penyatuan roh kita dengan Roh Kudus. Di dalam roh yang berbaur inilah kita menerima bimbingan ilahi, sukacita, dan kekuatan untuk menang atas segala tantangan.',
    prayer: 'Tuhan, jaga rohku agar tetap peka dan senantiasa bersatu erat dengan Roh-Mu di sepanjang aktivitas harianku.',
    file: 'FKKP_2026-4_Summer_Training-24.xhtml',
    anchor: ''
  },
  5: {
    day: 5,
    dayName: 'Jumat',
    verse: 'Hiduplah oleh Roh, maka kamu tidak akan menuruti keinginan daging... Jikalau kita hidup oleh Roh, baiklah hidup kita juga dipimpin oleh Roh.',
    verseRef: 'Galatia 5:16, 25 • FKKP Minggu 3 Hari 5',
    theme: 'Berjalan dan Hidup Menurut Pimpinan Roh Kudus',
    summary: 'Hidup kristiani bukanlah menaati hukum lahiriah dengan daya upaya pribadi, melainkan belajar selaras dengan dorongan Roh di dalam batin. Saat kita berjalan menurut Roh, buah hayat berupa kasih, sukacita, dan kelemahlembutan akan terbit secara wajar.',
    prayer: 'Tuhan Yesus, ajar aku untuk taat pada sentuhan halus Roh-Mu. Aku memilih untuk hidup dan melangkah menurut pimpinan Roh hari ini.',
    file: 'FKKP_2026-4_Summer_Training-25.xhtml',
    anchor: ''
  },
  6: {
    day: 6,
    dayName: 'Sabtu',
    verse: 'Kamu adalah surat Kristus... ditulis bukan dengan tinta, tetapi dengan Roh dari Allah yang hidup, bukan pada loh-loh batu, melainkan pada loh-loh daging, yaitu di dalam hati manusia.',
    verseRef: '2 Korintus 3:3 • FKKP Minggu 3 Hari 6',
    theme: 'Menjadi Surat Kristus yang Mengalirkan Hayat',
    summary: 'Setiap pengalaman doa-makan firman memeteraikan dan menuliskan unsur Kristus ke dalam hati kita. Kita dipersiapkan menjadi surat hidup yang memancarkan aroma kemuliaan Kristus bagi sesama.',
    prayer: 'Tuhan, tuliskanlah sifat ilahi-Mu semakin dalam di lubuk hatiku. Biarlah sesamaku dapat melihat dan menikmati Kristus melalui hidupku.',
    file: 'FKKP_2026-4_Summer_Training-26.xhtml',
    anchor: ''
  },
  7: {
    day: 7,
    dayName: 'Hari Tuhan (Minggu)',
    verse: 'Cawan pengucapan syukur, yang atasnya kita mengucap syukur, bukankah itu persekutuan dengan darah Kristus? Roti yang kita pecah-pecahkan, bukankah itu persekutuan dengan tubuh Kristus?',
    verseRef: '1 Korintus 10:16-17 • FKKP Minggu 3 Kidung & Review',
    theme: 'Mengecap Persekutuan Tubuh Kristus di Meja Perjamuan',
    summary: 'Di hari perhentian kudus ini, kita datang menghadap meja perjamuan Tuhan. Mengingat kembali anugerah sepekan ini bersama saudara-saudari, menaikkan puji-pujian, dan memproklamasikan keesaan satu Tubuh Kristus.',
    prayer: 'Tuhan Yesus yang kami kasihi, kami bersyukur atas keselamatan dan persekutuan Tubuh-Mu. Terimalah kidung syukur dan sembah kami di hadirat-Mu.',
    file: 'FKKP_2026-4_Summer_Training-27.xhtml',
    anchor: ''
  }
};

const STORAGE_KEY = 'baca_fkkp_schedule_settings';

export const DEFAULT_FKKP_SETTINGS = {
  mode: 'auto', // 'auto' (otomatis sesuai hari dan minggu kalender) | 'manual' (kunci hari & minggu tertentu)
  startDate: '2026-10-05', // Tanggal mulai Minggu 1 Hari 1 (Senin 5 Okt 2026)
  currentWeek: 3, // Minggu ke-1 s/d 12
  manualDay: 4, // 1 (Senin) - 7 (Minggu)
  customOverrides: {} // format: { 'w3d3': { summary, verse, theme, prayer } }
};

export function getFkkpSettings() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_FKKP_SETTINGS, ...parsed };
      }
    }
  } catch (e) {
    console.error('Failed to parse FKKP settings:', e);
  }
  return DEFAULT_FKKP_SETTINGS;
}

export function saveFkkpSettings(settings) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent('fkkp_settings_updated', { detail: settings }));
    }
  } catch (e) {
    console.error('Failed to save FKKP settings:', e);
  }
}

/**
 * Menghitung nomor minggu FKKP otomatis (1 s/d 12) berdasarkan selisih hari kalender dari tanggal mulai (startDate).
 * Setiap hari Senin 00:00 akan otomatis berganti ke minggu berikutnya.
 */
export function calculateFkkpWeek(startDateStr, now = new Date()) {
  const baseStr = startDateStr || DEFAULT_FKKP_SETTINGS.startDate;
  try {
    const [year, month, day] = baseStr.split('-').map(Number);
    const start = new Date(year, month - 1, day, 0, 0, 0, 0);
    const current = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const diffMs = current.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 1;
    const computedWeek = Math.floor(diffDays / 7) + 1;
    return Math.min(Math.max(computedWeek, 1), 12);
  } catch (e) {
    console.error('Error calculating FKKP week:', e);
    return 3;
  }
}

/**
 * Menghitung hari kalender saat ini (1 = Senin, 2 = Selasa, ..., 6 = Sabtu, 7 = Minggu)
 */
export function getCalendarDayIndex(now = new Date()) {
  const jsDay = now.getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
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
 * Mengambil data default hari FKKP berdasarkan minggu dan hari
 */
export function getDefaultFkkpDay(week, dayNum) {
  const safeDay = Number(dayNum) || 1;
  const safeWeek = Number(week) || 3;

  if (safeWeek === 2 && FKKP_DEFAULT_DAYS_WEEK2[safeDay]) {
    return FKKP_DEFAULT_DAYS_WEEK2[safeDay];
  }
  if (safeWeek === 3 && FKKP_DEFAULT_DAYS_WEEK3[safeDay]) {
    return FKKP_DEFAULT_DAYS_WEEK3[safeDay];
  }

  // Fallback generik untuk minggu lainnya jika belum ada template spesifik
  const fileIndex = 4 + (safeWeek - 1) * 8 + safeDay;
  return {
    day: safeDay,
    dayName: DAY_NAMES[safeDay] || `Hari ${safeDay}`,
    verse: `Tuhan itu setia; Ia akan menguatkan hatimu dan memelihara kamu terhadap yang jahat... Hendaklah damai sejahtera Kristus memerintah dalam hatimu.`,
    verseRef: `FKKP Minggu ${safeWeek} Hari ${safeDay}`,
    theme: `Menikmati Kristus sebagai Bagian Hidup Kaum Beriman`,
    summary: `Santapan fajar FKKP Minggu ke-${safeWeek} Hari ${safeDay}. Teruslah membuka hati dalam doa-makan firman untuk menikmati penyaluran hayat dan pembaharuan batin dari Roh Kudus.`,
    prayer: `Tuhan Yesus, basahi dan segarkan rohku dengan firman-Mu pagi ini. Jadikan hariku penuh dengan perkenanan dan damai sejahtera-Mu.`,
    file: `FKKP_2026-4_Summer_Training-${fileIndex}.xhtml`,
    anchor: ''
  };
}

/**
 * Mengambil data hari FKKP aktif (ayat, tema, ringkasan, initialLocation EPUB)
 */
export function getCurrentFkkpDay(customSettings = null, now = new Date()) {
  const settings = customSettings || getFkkpSettings();
  
  let week = 3;
  let dayNum = 3;

  // Jika mode 'auto', baik hari maupun minggu dihitung otomatis dari tanggal kalender
  if (settings.mode === 'auto') {
    dayNum = getCalendarDayIndex(now);
    week = calculateFkkpWeek(settings.startDate || DEFAULT_FKKP_SETTINGS.startDate, now);
  } else {
    // Mode manual: gunakan nilai statis yang dikunci admin
    week = Number(settings.currentWeek) || 3;
    dayNum = Number(settings.manualDay) || 4;
  }

  // Cari data default hari untuk minggu & hari terkait
  const dayData = getDefaultFkkpDay(week, dayNum);

  // File EPUB bab FKKP (8 bab per minggu: 1 Garis Besar + 7 Hari Santapan)
  const fileIndex = 4 + (week - 1) * 8 + dayNum;
  const targetFile = dayData.file || `FKKP_2026-4_Summer_Training-${fileIndex}.xhtml`;
  const targetAnchor = dayData.anchor || '';

  const overrideKey = `w${week}d${dayNum}`;
  const override = settings.customOverrides?.[overrideKey] || {};

  const resolved = {
    week,
    day: dayNum,
    dayName: DAY_NAMES[dayNum] || dayData.dayName,
    badge: `Minggu ${week} • Hari ${dayNum} (${DAY_NAMES[dayNum] || dayData.dayName})`,
    theme: override.theme || dayData.theme,
    verse: override.verse || dayData.verse,
    verseRef: override.verseRef || dayData.verseRef || `FKKP Minggu ${week} Hari ${dayNum}`,
    summary: override.summary || dayData.summary,
    prayer: override.prayer || dayData.prayer,
    initialLocation: `${targetFile}${targetAnchor}`,
    mode: settings.mode,
    startDate: settings.startDate || DEFAULT_FKKP_SETTINGS.startDate
  };

  return resolved;
}
