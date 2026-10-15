// Cross-Reference Parser & Resolver for Recovery Version Footnotes

// Map of Indonesian & English abbreviations to canonical book IDs
export const BOOK_ABBR_MAP = {
  // Indonesian
  'kej': 'kejadian', 'kel': 'keluaran', 'im': 'imamat', 'bil': 'bilangan', 'ul': 'ulangan',
  'yos': 'yosua', 'hak': 'hakim-hakim', 'rut': 'rut',
  '1sam': '1-samuel', '2sam': '2-samuel', '1raj': '1-raja-raja', '2raj': '2-raja-raja',
  '1taw': '1-tawarikh', '2taw': '2-tawarikh', 'ezr': 'ezra', 'neh': 'nehemia', 'est': 'ester',
  'ayb': 'ayub', 'mzm': 'mazmur', 'ams': 'amsal', 'pkh': 'pengkhotbah', 'kid': 'kidung-agung',
  'yes': 'yesaya', 'yer': 'yeremia', 'rat': 'ratapan', 'yeh': 'yehezkiel', 'dan': 'daniel',
  'hos': 'hosea', 'yl': 'yoel', 'am': 'amos', 'ob': 'obaja', 'yun': 'yunus',
  'mi': 'mikha', 'nah': 'nahum', 'hab': 'habakuk', 'zef': 'zefanya', 'hag': 'hagai',
  'za': 'zakharia', 'mal': 'maleakhi',
  'mat': 'matius', 'mrk': 'markus', 'luk': 'lukas', 'yoh': 'yohanes', 'kis': 'kisah-para-rasul',
  'rm': 'roma', '1kor': '1-korintus', '2kor': '2-korintus', 'gal': 'galatia', 'ef': 'efesus',
  'flp': 'filipi', 'kol': 'kolose', '1tes': '1-tesalonika', '2tes': '2-tesalonika',
  '1tim': '1-timotius', '2tim': '2-timotius', 'tit': 'titus', 'flm': 'filemon', 'ibr': 'ibrani',
  'yak': 'yakobus', '1ptr': '1-petrus', '2ptr': '2-petrus', '1yoh': '1-yohanes', '2yoh': '2-yohanes',
  '3yoh': '3-yohanes', 'yud': 'yudas', 'why': 'wahyu',

  // English
  'gen': 'kejadian', 'exo': 'keluaran', 'exod': 'keluaran', 'lev': 'imamat', 'num': 'bilangan', 'deut': 'ulangan',
  'josh': 'yosua', 'judg': 'hakim-hakim', 'ruth': 'rut',
  '1sam': '1-samuel', '2sam': '2-samuel', '1kings': '1-raja-raja', '2kings': '2-raja-raja',
  '1chron': '1-tawarikh', '2chron': '2-tawarikh', 'ezra': 'ezra', 'nehemiah': 'nehemia', 'esther': 'ester',
  'job': 'ayub', 'psa': 'mazmur', 'psalm': 'mazmur', 'psalms': 'mazmur', 'prov': 'amsal', 'eccl': 'pengkhotbah',
  'song': 'kidung-agung', 'isa': 'yesaya', 'jer': 'yeremia', 'lam': 'ratapan', 'ezek': 'yehezkiel', 'dan': 'daniel',
  'hosea': 'hosea', 'joel': 'yoel', 'amos': 'amos', 'obad': 'obaja', 'jonah': 'yunus',
  'micah': 'mikha', 'nahum': 'nahum', 'hab': 'habakuk', 'zeph': 'zefanya', 'hag': 'hagai',
  'zech': 'zakharia', 'mal': 'maleakhi',
  'matt': 'matius', 'mark': 'markus', 'luke': 'lukas', 'john': 'yohanes', 'acts': 'kisah-para-rasul',
  'rom': 'roma', '1cor': '1-korintus', '2cor': '2-korintus', 'gal': 'galatia', 'eph': 'efesus',
  'phil': 'filipi', 'col': 'kolose', '1thes': '1-tesalonika', '1thess': '1-tesalonika',
  '2thes': '2-tesalonika', '2thess': '2-tesalonika', '1tim': '1-timotius', '2tim': '2-timotius',
  'titus': 'titus', 'philem': 'filemon', 'heb': 'ibrani', 'james': 'yakobus',
  '1pet': '1-petrus', '2pet': '2-petrus', '1john': '1-yohanes', '2john': '2-yohanes', '3john': '3-yohanes',
  'jude': 'yudas', 'rev': 'wahyu'
};

// Regex to capture cross-references like "Rev. 22:21", "2 Sam. 7:12-14", "Luk. 3:23", "Rom. 9:6-8"
export const REF_REGEX = /\b([1-3]\s*[A-Za-z]+|[A-Za-z]+)\.?\s+(\d+):(\d+)(?:-(\d+))?\b/g;

export function parseReference(refString) {
  const match = refString.match(/\b([1-3]\s*[A-Za-z]+|[A-Za-z]+)\.?\s+(\d+):(\d+)(?:-(\d+))?\b/);
  if (!match) return null;

  const rawBook = match[1].replace(/\s+/g, '').toLowerCase().replace(/\./g, '');
  const chapter = Number(match[2]);
  const verseStart = Number(match[3]);
  const verseEnd = match[4] ? Number(match[4]) : verseStart;

  const bookId = BOOK_ABBR_MAP[rawBook] || rawBook;
  return {
    raw: match[0],
    bookId,
    chapter,
    verseStart,
    verseEnd
  };
}
