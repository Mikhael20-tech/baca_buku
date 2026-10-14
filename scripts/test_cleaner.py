import re

def clean_pdb_text(txt):
    if not txt:
        return ""
    t = txt.replace('\xa0', ' ')
    
    # 1. Clean corrupted characters
    t = t.replace('\ufffd', '—').replace('\x96', '–').replace('\x97', '—').replace('\x85', '...')
    # Replace single non-ascii chars that represent dash or quotes
    t = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', t)
    
    # 2. Syllable breaks with '?' and optional hyphens:
    # e.g. 'dipi?-sah?-kan' -> 'dipisahkan', 'me?-nen?-?-?-tu?-kan' -> 'menentukan'
    # 'sam?-pai' -> 'sampai', 'se?-be?-lum' -> 'sebelum', 'di?-sebut' -> 'disebut'
    # Pattern: \w followed by (?- or -? or ? or ?-) followed by \w
    # But preserve real hyphenated words like 'orang-orang', 'anak-anak', 'mati-matian'
    
    # Syllable breaks containing '?':
    # Any sequence of ? and hyphens between word characters that contains at least one '?'
    # e.g. me?-nen?-?-?-tu?-kan -> menentukan
    t = re.sub(r'(\w)(?:[\?\-‑]*\?+[\?\-‑]*)(\w)', r'\1\2', t)
    # Run once more in case of overlapping matches like a?-b?-c
    t = re.sub(r'(\w)(?:[\?\-‑]*\?+[\?\-‑]*)(\w)', r'\1\2', t)
    t = re.sub(r'(\w)(?:[\?\-‑]*\?+[\?\-‑]*)(\w)', r'\1\2', t)
    
    # 3. Leading quote on Tuhan: 'Tuhan -> Tuhan
    t = re.sub(r"\'Tuhan\b", "Tuhan", t)
    t = re.sub(r"\'Allah\b", "Allah", t)
    
    # 4. Common Alkitab typos:
    typo_map = {
        r'\bALlah\b': 'Allah',
        r'\bHamba-Peneylamat\b': 'Hamba-Penyelamat',
        r'\bPeneylamat\b': 'Penyelamat',
        r'\bseoang\b': 'seorang',
        r'\bpersananya\b': 'personanya',
        r'\bemnagmpuni\b': 'mengampuni',
        r'\bPermulaam\b': 'Permulaan',
        r'\blainnay\b': 'lainnya',
        r'\bmenistri\b': 'ministri',
        r'\bPerjanian\b': 'Perjanjian',
        r'\bKeraajan\b': 'Kerajaan',
        r'\bkeinsaniaan\b': 'keinsanian',
        r'\bkeselamatanLAI\b': 'keselamatan—LAI',
        r'\bkeselamatanLAI\b': 'keselamatan—LAI'
    }
    for pat, rep in typo_map.items():
        t = re.sub(pat, rep, t)
        
    t = re.sub(r'\s+', ' ', t)
    return t.strip()

samples = [
    'dipi?-sah?-kan-Nyalah',
    'ma?-lam',
    'per?-tama',
    'Ke?-luaran',
    'sam?-pai',
    'me?-nen?-?-?-tu?-kan',
    'se?-be?-lum',
    'bu?-kan?-lah',
    'ja?-min?-an',
    'ter?-genapi',
    'memper?-lihatkan',
    'men?-dapatkan',
    'mendu?-duki?-nya',
    'bagi?-mana',
    'me?-nikmati',
    'kebia?-saan',
    'ber?-kaitan',
    'penyembah?-an',
    'per?-ingatan',
    'se?-rius',
    'men?-derita',
    'kehi?-langan',
    'kenik?-matan',
    'diang?-kutnya',
    'ke?-rajaan',
    'di?-sebut',
    'merupa?-kan',
    'selanjut?-nya',
    'me?-ngenai',
    'dipersem?-bahkan',
    'orang-orang',
    'anak-anak',
    'Hamba-Peneylamat',
    'ALlah',
    'seoang seoang'
]

for s in samples:
    print(f"{s:25s} -> {clean_pdb_text(s)}")
