import sys
import re

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
file_path = r"D:\Magang\Baca\pdb\roti_hayat_full.txt"

all_lines = []
with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    for line in f:
        all_lines.append(line)

def extract_pasal_1_to_3():
    fn_dict = {}
    verses = {}
    cur_pasal = 1
    cur_verse_num = None
    cur_fn_key = None
    cur_fn_text = []

    # Lines 401115 to 402492
    for cur in range(401115, 402493):
        s = all_lines[cur-1].strip()
        if not s or s == '\xa0' or s.startswith('o---') or s.startswith('---'):
            continue
        m_p = re.match(r'^PASAL\s+(\d+)$', s, re.IGNORECASE)
        if m_p:
            cur_pasal = int(m_p.group(1))
            continue
        
        # Check if line is a verse: "1  Inilah..."
        m_v = re.match(r'^(\d+)\s+(.+)', s)
        # Footnote pattern: "11  daftar" or "12  Yesus" or "1a  Luk..."
        m_fn = re.match(r'^(\d+)([0-9a-z])\s*(.*)', s)
        
        # Distinguish verse vs footnote:
        # A verse starts with a verse number and Indonesian sentence (e.g. "Abraham mempunyai anak", "Inilah...")
        is_verse = False
        if m_v and int(m_v.group(1)) <= 150:
            v_num = int(m_v.group(1))
            rest = m_v.group(2)
            # If rest does not start like a footnote or is long and contains Indonesian verbs
            if cur_verse_num is None or v_num == cur_verse_num + 1 or (cur_verse_num and v_num == 1):
                is_verse = True

        if is_verse:
            if cur_fn_key and cur_fn_text:
                fn_dict[cur_fn_key] = " ".join(cur_fn_text)
                cur_fn_key = None
                cur_fn_text = []
            cur_verse_num = int(m_v.group(1))
            verses[(cur_pasal, cur_verse_num)] = m_v.group(2)
        elif m_fn and cur_verse_num is not None:
            # Footnote or cross-ref
            if cur_fn_key and cur_fn_text:
                fn_dict[cur_fn_key] = " ".join(cur_fn_text)
                cur_fn_text = []
            v_target = int(m_fn.group(1))
            code = m_fn.group(2)
            cur_fn_key = (cur_pasal, v_target, code)
            topic = m_fn.group(3)
            if topic:
                cur_fn_text.append(f"<strong>{topic}</strong>:")
        else:
            if cur_fn_key:
                cur_fn_text.append(s)

    if cur_fn_key and cur_fn_text:
        fn_dict[cur_fn_key] = " ".join(cur_fn_text)

    return verses, fn_dict

verses, fn13 = extract_pasal_1_to_3()
print(f"Verses in Pasal 1-3: {len(verses)}")
print(f"Footnotes in Pasal 1-3: {len(fn13)}")
print("Sample Mat 1:1 fn '2':", fn13.get((1, 1, '2'), "")[:100])
print("Sample Mat 1:1 fn 'a':", fn13.get((1, 1, 'a'), "")[:100])
print("Sample Mat 1:1 fn '1':", fn13.get((1, 1, '1'), "")[:100])
