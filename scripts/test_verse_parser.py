import re

test_verses = [
    '1aPada 2mulanya 3Allah 4bmenciptakan 5langit dan bumi.',
    '1Bumi 2abelum berbentuk dan kosong; 2gelap gulita menutupi 3samudera raya,',
    '1aBerfirmanlah Allah: "Jadilah 1bterang." Lalu terang itu jadi.',
    'Allah melihat bahwa terang itu abaik, lalu 1bdipi?-sah?-kan-Nyalah terang itu dari gelap.',
    'Dan Allah menamai terang itu asiang, dan gelap itu ma?-lam. bJadilah petang dan jadilah pagi, itulah hari per?-tama.',
    'Inilah 1permulaan 2Injil tentang 3Yesus Kristus, 4aAnak Allah.',
    '1Seperti ada tertulis dalam kitab nabi Yesaya: "aLihatlah, 2Aku menyuruh 3utusan-Ku mendahului 4Engkau, ia akan 5mempersiapkan jalan bagi-Mu;',
    'aada 1suara orang yang berseru-seru di 2padang gurun: 3Persiapkanlah jalan untuk Tuhan, luruskanlah jalan bagi-Nya",',
    'demikianlah aYohanes Pembaptis 1tampil di 2bpadang gurun dan memberitakan 3cbaptisan dtobat 4untuk epengampunan 5dosa.',
    'Maka berdatanganlah kepadanya orang-orang dari seluruh adaerah 1Yudea dan semua penduduk Yerusalem, dan sambil bmengaku dosanya mereka 2dibaptis di 3Sungai Yordan.',
    'Yohanes 1memakai jubah abulu unta dan ikat pinggang kulit, dan makanannya bbelalang dan cmadu hutan.'
]

def clean_base_text(t):
    if not t:
        return ""
    t = t.replace('\xa0', ' ')
    t = t.replace('\ufffd', '—').replace('\x96', '–').replace('\x97', '—').replace('\x85', '...')
    t = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', t)
    # Remove syllable breaks with ?
    t = re.sub(r'(\w)(?:[\?\-‑]*\?+[\?\-‑]*)(\w)', r'\1\2', t)
    t = re.sub(r'(\w)(?:[\?\-‑]*\?+[\?\-‑]*)(\w)', r'\1\2', t)
    t = re.sub(r'(\w)(?:[\?\-‑]*\?+[\?\-‑]*)(\w)', r'\1\2', t)
    # Clean ? inside words
    t = re.sub(r'\?+[\-‑]*\?*', '', t)
    t = re.sub(r"\'Tuhan\b", "Tuhan", t)
    t = re.sub(r"\'Allah\b", "Allah", t)
    t = re.sub(r'\s+', ' ', t)
    return t.strip()

def clean_cross_refs_and_extract_fns(raw_t, available_note_indices=None):
    """
    Given a verse text:
    1. Cleans cross reference prefixes (e.g. 'aPada' -> 'Pada', 'aLihatlah' -> 'Lihatlah')
    2. Identifies footnote marker digits: e.g. '1permulaan', '2Injil', '1aPada', '4bmenciptakan'
    3. Produces clean_text, marked_text (with <fn n="X"/>), and keywords_map
    """
    t = clean_base_text(raw_t)
    
    # First: standalone cross-reference letters or before capital letters
    # e.g. " aPada" -> " Pada", " aLihatlah" -> " Lihatlah", " aada" -> " ada", " aYohanes" -> " Yohanes"
    # Match cross-reference letter before capital letter:
    t = re.sub(r'(?:^|(?<=[\s\"\'\(\[\{]))([a-z])([A-Z][a-zA-Z\-]*)', r'\2', t)
    
    # Standalone cross references like 'aada', 'abaik', 'asiang', 'bbelalang', 'cmadu', 'abulu', 'adaerah', 'bmengaku':
    # Note: we shouldn't strip real words like 'ada', 'anak', 'akan', 'antara', 'atas', 'aku', 'air', 'bila', 'bisa', 'dan', 'di', 'dari'
    # But if word starts with a/b/c/d/e followed by common Indonesian word:
    common_stems = [
        'ada', 'baik', 'siang', 'malam', 'belalang', 'madu', 'bulu', 'daerah', 'mengaku', 'tobat', 
        'pengampunan', 'dosa', 'padang', 'baptisan', 'tampil', 'anak', 'ibu', 'orang', 'saudara', 
        'suara', 'digenapi', 'melakukan', 'seorang', 'perempuan', 'seperti', 'waktu', 'hari', 
        'ketika', 'supaya', 'siapa', 'menciptakan', 'belum', 'terang', 'dipisahkan', 'kelahiran'
    ]
    pattern_stems = r'(?:^|(?<=[\s\"\'\(\[\{]))[a-g](' + '|'.join(common_stems) + r')\b'
    t = re.sub(pattern_stems, r'\1', t)
    
    def parse_fn_marker(num_str, rest_str):
        # Case 1: rest_str starts with [a-g] followed by Capital letter:
        # e.g. 1aPada -> 1, 'a', 'Pada'; 4aAnak -> 4, 'a', 'Anak'
        m_cap = re.match(r'^([a-g])([A-Z][a-zA-Z\-]*)', rest_str)
        if m_cap:
            return int(num_str), m_cap.group(1), m_cap.group(2) + rest_str[len(m_cap.group(0)):]
            
        # Case 2: rest_str starts with [a-g] followed by a known lowercase word
        # e.g. 4bmenciptakan -> 4, 'b', 'menciptakan'; 1bterang -> 1, 'b', 'terang'
        # 2bpadang -> 2, 'b', 'padang'; 3cbaptisan -> 3, 'c', 'baptisan'
        m_low = re.match(r'^([a-g])([a-z]+.*)', rest_str)
        if m_low:
            cand_ref = m_low.group(1)
            cand_word = m_low.group(2)
            # Check if cand_word without cand_ref is a known word or if rest_str itself is a word
            # Words starting with p (permulaan), l (langit), s (suara), m (memakai), d (dosa), u (untuk)
            # Should NOT strip cand_ref if rest_str is the real word!
            real_starts = ['permulaan', 'langit', 'suara', 'memakai', 'untuk', 'dosa', 'pintu', 'tanah', 'laut', 'pagi', 'petang', 'pohon', 'burung', 'ikan', 'segala']
            is_real = any(rest_str.lower().startswith(w) for w in real_starts)
            if not is_real and len(cand_word) >= 3 and (
                cand_ref in 'bcdefg' or 
                cand_word.startswith(('anak', 'belum', 'terang', 'padang', 'baptisan', 'menciptakan', 'dipisahkan', 'tobat', 'pengampunan', 'daerah', 'mengaku'))
            ):
                return int(num_str), cand_ref, cand_word

        return int(num_str), "", rest_str

    fn_regex = re.compile(r'(?:^|(?<=[\s\"\'\(\[\{]))(\d{1,2})([a-zA-Z\(\"\'\-]+)')
    matches = list(fn_regex.finditer(t))
    if not matches:
        return t, t, {}
        
    keywords_map = {}
    marked_parts = []
    last_pos = 0
    
    for idx, m in enumerate(matches):
        num_str = m.group(1)
        rest_str = m.group(2)
        note_num, cross_letter, first_word = parse_fn_marker(num_str, rest_str)
        
        # If available_note_indices is provided, verify note_num exists in chapter
        if available_note_indices and note_num not in available_note_indices:
            # Maybe not a footnote marker, or different numbering
            pass
            
        marked_parts.append(t[last_pos:m.start()])
        
        # Word text starts after number and cross-ref letter
        p_start = m.start() + len(m.group(1)) + len(cross_letter)
        p_end = matches[idx+1].start() if idx + 1 < len(matches) else len(t)
        raw_phrase = t[p_start:p_end]
        
        m_punct = re.search(r'([,;:\.\?\!\s]+)$', raw_phrase)
        trailing = m_punct.group(1) if m_punct else ""
        phrase_clean = raw_phrase[:-len(trailing)].strip() if trailing else raw_phrase.strip()
        
        kw = phrase_clean
        if '; ' in phrase_clean:
            first_clause, rest_clause = phrase_clean.split('; ', 1)
            kw = first_clause.strip()
            marked_parts.append(f'{first_clause}<fn n="{note_num}"/>; {rest_clause}{trailing}')
        elif ' dan ' in phrase_clean and len(phrase_clean.split()) > 4:
            first_clause, rest_clause = phrase_clean.split(' dan ', 1)
            kw = first_clause.strip()
            marked_parts.append(f'{first_clause}<fn n="{note_num}"/> dan {rest_clause}{trailing}')
        else:
            marked_parts.append(f'{phrase_clean}<fn n="{note_num}"/>{trailing}')
            
        keywords_map[note_num] = kw
        last_pos = p_end
        
    marked_text = "".join(marked_parts)
    marked_text = re.sub(r'\s+', ' ', marked_text).strip()
    clean_text = re.sub(r'<fn n="\d+"\/>', '', marked_text)
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    
    return clean_text, marked_text, keywords_map

for v in test_verses:
    clean_t, marked_t, kw_map = clean_cross_refs_and_extract_fns(v)
    print("ORIGINAL:", v)
    print("CLEAN   :", clean_t)
    print("MARKED  :", marked_t)
    print("KEYWORDS:", kw_map)
    print("-" * 60)
