import re
from test_vocab_cleaner import clean_cross_refs_smart, VALID_WORDS, SAFE_WORDS

def parse_marker(num_str, cross_ref, word):
    if not cross_ref:
        return int(num_str), "", word
        
    cand_full = cross_ref + word
    
    # 1. If word starts with Capital letter, cross_ref is a reference letter (e.g. 1aNazaret, 1aUr, 2bMaria)
    if re.match(r'^[A-Z]', word):
        return int(num_str), cross_ref, word
        
    cand_lower = cand_full.lower()
    word_lower = word.lower()
    
    # 2. If cand_full is in VALID_WORDS/SAFE_WORDS and word is NOT:
    # e.g. bukit vs ukit, baptislah vs aptislah, ajarlah vs jarlah, gempa vs empa, fajar vs ajar
    if (cand_lower in SAFE_WORDS or cand_lower in VALID_WORDS) and word_lower not in SAFE_WORDS and word_lower not in VALID_WORDS:
        return int(num_str), "", cand_full
        
    # Common words where cand_full is definitely the real word:
    if cand_lower in ('dalam', 'fajar', 'dari', 'di', 'anak', 'antara', 'atas', 'akhir', 'ampun', 'amat', 'air', 'api'):
        return int(num_str), "", cand_full

    # 3. If word starts with an Indonesian affix that cannot follow cross_ref:
    # e.g. 2cmenyertai -> menyertai
    # e.g. 3dkepada -> kepada
    # e.g. 1abertobatlah -> bertobatlah
    # e.g. 2bdibaptis -> dibaptis
    if re.match(r'^(?:ber|ter|ke|pem|pen|peng|peny|per|se|di|me|men|mem|meng|meny|kepada)', word_lower):
        return int(num_str), cross_ref, word
        
    # 4. If word is a valid word and cand_full is NOT:
    # e.g. 1aimam -> imam vs aimam
    # e.g. 2bbintang -> bintang vs bbintang
    # e.g. 4edupa -> dupa vs edupa
    if (word_lower in SAFE_WORDS or word_lower in VALID_WORDS) and (cand_lower not in SAFE_WORDS and cand_lower not in VALID_WORDS):
        return int(num_str), cross_ref, word
        
    return int(num_str), cross_ref, word

def test_verse(v_raw):
    t = clean_cross_refs_smart(v_raw)
    pattern = re.compile(r'(^|[\s"\'\(\[\{“‘«„”’\—\–\-\:\;\.\u201c\u201d\u2018\u2019\ufffd])(\d{1,2})([a-g]?)([A-Za-z]+(?:-[A-Za-z]+)*)')
    matches = list(pattern.finditer(t))
    
    clean_chars = []
    marked_chars = []
    last_idx = 0
    
    for m in matches:
        prefix = m.group(1)
        raw_num = m.group(2)
        raw_ref = m.group(3)
        raw_word = m.group(4)
        
        note_int, cross_ref, word = parse_marker(raw_num, raw_ref, raw_word)
        
        clean_chars.append(t[last_idx : m.start()])
        marked_chars.append(t[last_idx : m.start()])
        
        clean_chars.append(prefix)
        marked_chars.append(prefix)
        
        clean_chars.append(word)
        marked_chars.append(f"{word}<fn n=\"{note_int}\"/>")
        last_idx = m.end()
        
    clean_chars.append(t[last_idx:])
    marked_chars.append(t[last_idx:])
    
    cl = re.sub(r'\s+', ' ', "".join(clean_chars)).strip()
    mk = re.sub(r'\s+', ' ', "".join(marked_chars)).strip()
    return cl, mk

v16 = "16  Kesebelas murid itu berangkat ke aGalilea, ke 1bukit yang telah ditunjukkan Yesus kepada mereka."
v19 = "19  1Karena itu, pergilah, 2jadikanlah semua abangsa murid-Ku dan 3baptislah mereka 4dalam 5nama 6Bapa dan Anak dan Roh Kudus,"
v20 = "20   dan 1ajarlah mereka amelakukan segala sesuatu yang telah bKuperintahkan kepadamu. Ketahuilah, Aku 2cmenyertai kamu senantiasa sampai 3dkepada akhir zaman."

for v in [v16, v19, v20]:
    cl, mk = test_verse(v)
    print("CLEAN :", cl)
    print("MARKED:", mk)
    print("-" * 60)
