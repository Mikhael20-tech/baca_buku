import sys
import re

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

test_line = 'Setibanya di sana iapun tinggal di sebuah kota yang bernama 1aNazaret. Hal itu terjadi supaya bdigenapi firman yang disampaikan oleh 2nabi-nabi, bahwa Ia akan disebut: “3Orang Nazaret”.'

def transform_verse(raw_t, available_notes=None):
    t = raw_t.replace('\xa0', ' ')
    t = t.replace('\ufffd', '—').replace('\x96', '–').replace('\x97', '—').replace('\x85', '...')
    
    # Syllable breaks containing '?'
    t = re.sub(r'(\w)(?:[\?\-‑]*\?+[\?\-‑]*)(\w)', r'\1\2', t)
    t = re.sub(r'(\w)(?:[\?\-‑]*\?+[\?\-‑]*)(\w)', r'\1\2', t)
    t = re.sub(r'\?+[\-‑]*\?*', '', t)
    t = re.sub(r'(\w)\-\-+([\w])', r'\1-\2', t)
    t = re.sub(r"\'Tuhan\b", "Tuhan", t)
    t = re.sub(r"\'Allah\b", "Allah", t)
    
    # Strip standalone cross-reference before capitalized words e.g. aKelahiran -> Kelahiran
    t = re.sub(r'(?:^|(?<=[\s\"\'\(\[\{“‘«„\—\–\:]))([a-z])([A-Z][a-zA-Z\-]*)', r'\2', t)
    
    # Standalone cross references before known lowercase words (bdigenapi -> digenapi, amalaikat -> malaikat, etc.)
    common_stems = [
        'digenapi', 'melahirkan', 'mencemarkan', 'malaikat', 'mimpi', 'melakukan', 'seorang', 
        'perempuan', 'seperti', 'waktu', 'hari', 'ketika', 'supaya', 'siapa', 'daerah', 'suara',
        'mengaku', 'belalang', 'madu', 'bulu', 'tobat', 'pengampunan', 'dosa', 'anak', 'ibu',
        'menciptakan', 'belum', 'terang', 'kelahiran', 'janji'
    ]
    t = re.sub(r'(?:^|(?<=[\s\"\'\(\[\{“‘«„\—\–\:]))[a-g](' + '|'.join(common_stems) + r')\b', r'\1', t)
    
    # Footnote marker regex:
    pattern = re.compile(r'(^|[\s"\'\(\[\{“‘«„\—\–\-\:\;\u201c\u2018])(\d{1,2})([a-g]?)([A-Za-z\-]+)')
    
    matches = list(pattern.finditer(t))
    if not matches:
        return t, t, {}
        
    # We will build clean_text and marked_text
    # For each match:
    # prefix = m.group(1) e.g. ' ', '“', '-'
    # note_num = int(m.group(2))
    # cross_ref = m.group(3)
    # first_word = m.group(4)
    
    # Find what word or phrase the footnote applies to:
    # 1. If inside quotes (prefix is '“' or '"' or '‘'):
    #    The phrase extends until the closing quote '”' or '"' or '’'!
    # 2. Otherwise:
    #    The target is the word itself (m.group(4))!
    
    # Let's inspect each match:
    keywords_map = {}
    
    # We can process from right to left or build by segments
    marked_chars = []
    clean_chars = []
    last_idx = 0
    
    for idx, m in enumerate(matches):
        prefix = m.group(1)
        num_str = m.group(2)
        note_int = int(num_str)
        cross_ref = m.group(3)
        word = m.group(4)
        
        # Everything before the match
        clean_chars.append(t[last_idx : m.start()])
        marked_chars.append(t[last_idx : m.start()])
        
        # Add the prefix (e.g. space or quote)
        clean_chars.append(prefix)
        marked_chars.append(prefix)
        
        # Where does the targeted word/phrase end?
        word_start = m.start() + len(prefix) + len(num_str) + len(cross_ref)
        
        if prefix in '“"‘\u201c\u2018':
            # Phrase inside quotes: find the closing quote
            # Look ahead for closing quote
            close_quote = '”' if prefix in '“\u201c' else ('’' if prefix == '‘' else '"')
            close_idx = t.find(close_quote, word_start)
            if close_idx != -1:
                phrase = t[word_start : close_idx]
                clean_chars.append(phrase + close_quote)
                marked_chars.append(f"{phrase}{close_quote}<fn n=\"{note_int}\"/>")
                keywords_map[note_int] = phrase
                last_idx = close_idx + len(close_quote)
                continue
                
        # Normal word: ends at end of word (m.end())
        phrase = word
        clean_chars.append(phrase)
        marked_chars.append(f"{phrase}<fn n=\"{note_int}\"/>")
        keywords_map[note_int] = phrase
        last_idx = m.end()
        
    clean_chars.append(t[last_idx:])
    marked_chars.append(t[last_idx:])
    
    clean_text = "".join(clean_chars)
    marked_text = "".join(marked_chars)
    
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    marked_text = re.sub(r'\s+', ' ', marked_text).strip()
    
    return clean_text, marked_text, keywords_map

clean_v, marked_v, kw_map = transform_verse(test_line)
print("ORIGINAL:", test_line)
print("CLEAN   :", clean_v)
print("MARKED  :", marked_v)
print("KEYWORDS:", kw_map)
