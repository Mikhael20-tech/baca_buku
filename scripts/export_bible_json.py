import os
import sys
import json
import re
import shutil

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
file_path = r"D:\Magang\Baca\pdb\roti_hayat_full.txt"
out_dir = r"D:\Magang\Baca\public\bible"
os.makedirs(out_dir, exist_ok=True)

BIBLE_BOOKS = [
    # Perjanjian Lama (39 Kitab)
    {"id": "kejadian", "name": "Kejadian", "testament": "PL", "start": 682211, "end": 689457},
    {"id": "keluaran", "name": "Keluaran", "testament": "PL", "start": 689457, "end": 695639},
    {"id": "imamat", "name": "Imamat", "testament": "PL", "start": 695639, "end": 699429},
    {"id": "bilangan", "name": "Bilangan", "testament": "PL", "start": 699429, "end": 704223},
    {"id": "ulangan", "name": "Ulangan", "testament": "PL", "start": 704223, "end": 708253},
    {"id": "yosua", "name": "Yosua", "testament": "PL", "start": 708253, "end": 710701},
    {"id": "hakim-hakim", "name": "Hakim-Hakim", "testament": "PL", "start": 710701, "end": 712841},
    {"id": "rut", "name": "Rut", "testament": "PL", "start": 712841, "end": 713377},
    {"id": "1-samuel", "name": "1 Samuel", "testament": "PL", "start": 713377, "end": 716231},
    {"id": "2-samuel", "name": "2 Samuel", "testament": "PL", "start": 716231, "end": 718559},
    {"id": "1-raja-raja", "name": "1 Raja-Raja", "testament": "PL", "start": 718559, "end": 721639},
    {"id": "2-raja-raja", "name": "2 Raja-Raja", "testament": "PL", "start": 721639, "end": 724237},
    {"id": "1-tawarikh", "name": "1 Tawarikh", "testament": "PL", "start": 724237, "end": 727279},
    {"id": "2-tawarikh", "name": "2 Tawarikh", "testament": "PL", "start": 727279, "end": 730371},
    {"id": "ezra", "name": "Ezra", "testament": "PL", "start": 730371, "end": 731501},
    {"id": "nehemia", "name": "Nehemia", "testament": "PL", "start": 731501, "end": 732949},
    {"id": "ester", "name": "Ester", "testament": "PL", "start": 732949, "end": 733629},
    {"id": "ayub", "name": "Ayub", "testament": "PL", "start": 733629, "end": 737257},
    {"id": "mazmur", "name": "Mazmur", "testament": "PL", "start": 737257, "end": 746215},
    {"id": "amsal", "name": "Amsal", "testament": "PL", "start": 746215, "end": 748795},
    {"id": "pengkhotbah", "name": "Pengkhotbah", "testament": "PL", "start": 748795, "end": 749705},
    {"id": "kidung-agung", "name": "Kidung Agung", "testament": "PL", "start": 749705, "end": 750923},
    {"id": "yesaya", "name": "Yesaya", "testament": "PL", "start": 750923, "end": 756311},
    {"id": "yeremia", "name": "Yeremia", "testament": "PL", "start": 756311, "end": 761143},
    {"id": "ratapan", "name": "Ratapan", "testament": "PL", "start": 761143, "end": 761799},
    {"id": "yehezkiel", "name": "Yehezkiel", "testament": "PL", "start": 761799, "end": 766401},
    {"id": "daniel", "name": "Daniel", "testament": "PL", "start": 766401, "end": 768257},
    {"id": "hosea", "name": "Hosea", "testament": "PL", "start": 768257, "end": 769381},
    {"id": "yoel", "name": "Yoel", "testament": "PL", "start": 769381, "end": 769761},
    {"id": "amos", "name": "Amos", "testament": "PL", "start": 769761, "end": 770543},
    {"id": "obaja", "name": "Obaja", "testament": "PL", "start": 770543, "end": 770739},
    {"id": "yunus", "name": "Yunus", "testament": "PL", "start": 770739, "end": 771057},
    {"id": "mikha", "name": "Mikha", "testament": "PL", "start": 771057, "end": 771595},
    {"id": "nahum", "name": "Nahum", "testament": "PL", "start": 771595, "end": 771919},
    {"id": "habakuk", "name": "Habakuk", "testament": "PL", "start": 771919, "end": 772295},
    {"id": "zefanya", "name": "Zefanya", "testament": "PL", "start": 772295, "end": 772653},
    {"id": "hagai", "name": "Hagai", "testament": "PL", "start": 772653, "end": 772953},
    {"id": "zakharia", "name": "Zakharia", "testament": "PL", "start": 772953, "end": 774289},
    {"id": "maleakhi", "name": "Maleakhi", "testament": "PL", "start": 774289, "end": 774718},
    
    # Perjanjian Baru (27 Kitab)
    {"id": "matius", "name": "Matius", "testament": "PB", "start": 774719, "end": 784079},
    {"id": "markus", "name": "Markus", "testament": "PB", "start": 784079, "end": 788483},
    {"id": "lukas", "name": "Lukas", "testament": "PB", "start": 788483, "end": 795185},
    {"id": "yohanes", "name": "Yohanes", "testament": "PB", "start": 795185, "end": 800639},
    {"id": "kisah-para-rasul", "name": "Kisah Para Rasul", "testament": "PB", "start": 800639, "end": 807793},
    {"id": "roma", "name": "Roma", "testament": "PB", "start": 807793, "end": 811469},
    {"id": "1-korintus", "name": "1 Korintus", "testament": "PB", "start": 811469, "end": 816057},
    {"id": "2-korintus", "name": "2 Korintus", "testament": "PB", "start": 816057, "end": 819231},
    {"id": "galatia", "name": "Galatia", "testament": "PB", "start": 819231, "end": 821011},
    {"id": "efesus", "name": "Efesus", "testament": "PB", "start": 821011, "end": 823727},
    {"id": "filipi", "name": "Filipi", "testament": "PB", "start": 823727, "end": 824779},
    {"id": "kolose", "name": "Kolose", "testament": "PB", "start": 824779, "end": 826145},
    {"id": "1-tesalonika", "name": "1 Tesalonika", "testament": "PB", "start": 826145, "end": 827261},
    {"id": "2-tesalonika", "name": "2 Tesalonika", "testament": "PB", "start": 827261, "end": 827805},
    {"id": "1-timotius", "name": "1 Timotius", "testament": "PB", "start": 827805, "end": 829443},
    {"id": "2-timotius", "name": "2 Timotius", "testament": "PB", "start": 829443, "end": 830591},
    {"id": "titus", "name": "Titus", "testament": "PB", "start": 830591, "end": 831389},
    {"id": "filemon", "name": "Filemon", "testament": "PB", "start": 831389, "end": 831729},
    {"id": "ibrani", "name": "Ibrani", "testament": "PB", "start": 831729, "end": 834485},
    {"id": "yakobus", "name": "Yakobus", "testament": "PB", "start": 834485, "end": 835647},
    {"id": "1-petrus", "name": "1 Petrus", "testament": "PB", "start": 835647, "end": 837489},
    {"id": "2-petrus", "name": "2 Petrus", "testament": "PB", "start": 837489, "end": 838751},
    {"id": "1-yohanes", "name": "1 Yohanes", "testament": "PB", "start": 838751, "end": 840609},
    {"id": "2-yohanes", "name": "2 Yohanes", "testament": "PB", "start": 840609, "end": 840965},
    {"id": "3-yohanes", "name": "3 Yohanes", "testament": "PB", "start": 840965, "end": 841369},
    {"id": "yudas", "name": "Yudas", "testament": "PB", "start": 841369, "end": 841897},
    {"id": "wahyu", "name": "Wahyu", "testament": "PB", "start": 841897, "end": 847775},
]

print("Loading full text...")
all_lines = []
with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    for line in f:
        all_lines.append(line)

print(f"Loaded {len(all_lines):,} lines")

def clean_verse_text(txt):
    t = txt
    # 1. Number + optional single letter before capitalized word: 1aPada -> Pada, 2Yesus -> Yesus, 3Allah -> Allah, 1Inilah -> Inilah
    t = re.sub(r'(\"|\'|\b)\d+[a-z]?([A-Z][a-zA-Z]*)', r'\1\2', t)
    
    # 2. Number + letter + lowercase word: 4bmenciptakan -> menciptakan, 1adaftar -> daftar, 4canak -> anak
    def repl_num_lower(m):
        prefix = m.group(1)
        rest = m.group(2)
        if len(rest) >= 4 and rest[0] in 'abcdefg' and (
            rest[1] in 'bcdfghjklmnpqrstvwxyz' or
            rest[1:] in ['daftar', 'anak', 'saudaranya', 'isteri', 'tulus', 'menceraikannya', 'seluruhnya', 'keturunan', 'sampai', 'pembuangan']
        ):
            return prefix + rest[1:]
        return prefix + rest

    t = re.sub(r'(\"|\'|\b)\d+([a-z]+)', repl_num_lower, t)
    
    # 3. Cross reference markers before capital letters: aKelahiran -> Kelahiran, bMaria -> Maria, cRoh -> Roh
    t = re.sub(r'(?:^|(?<=\s))[a-z]([A-Z][a-zA-Z]*)', r'\1', t)
    
    # 4. Remove spurious ? inside words: dipi?-sah?-kan -> dipisahkan
    t = re.sub(r'\?[\-‑]?', '', t)
    t = re.sub(r'(\w+)\-+([\w]+)', r'\1-\2', t)
    t = re.sub(r'\s+', ' ', t)
    return t.strip()

def clean_footnote_text(txt):
    """Clean footnote text: replace non-breaking spaces and normalize whitespace."""
    t = txt.replace('\xa0', ' ')
    t = re.sub(r'\s+', ' ', t)
    return t.strip()

def parse_footnote_number(num_str):
    """Parse footnote number like '11' -> (verse=1, note=1), '111' -> (verse=11, note=1), '231' -> (verse=23, note=1).
    The last digit is the footnote index, everything before is the verse number."""
    if len(num_str) < 2:
        return None, None
    verse_num = int(num_str[:-1])
    note_idx = int(num_str[-1])
    return verse_num, note_idx

books_meta = []

for b_info in BIBLE_BOOKS:
    b_id = b_info["id"]
    b_name = b_info["name"]
    s_line = b_info["start"]
    e_line = b_info["end"]
    
    raw_slice = all_lines[s_line-1 : e_line-1]
    
    chapters_data = {}
    cur_chap = None
    cur_v = None
    cur_outlines = []
    
    # ============================================================
    # PHASE 1: Parse main scripture verses (stop at Catatan Kaki)
    # ============================================================
    footnote_start_idx = None
    
    for idx, l in enumerate(raw_slice):
        s = l.replace('\xa0', ' ').strip()
        if not s or s.startswith('---') or s.startswith('o---') or s.startswith('Ayat :') or s.startswith('Ayat:'):
            continue
            
        # Stop at Catatan Kaki - remember index for Phase 2
        if re.search(r'^\s*Catatan\s+[Kk]aki', s, re.IGNORECASE):
            footnote_start_idx = idx
            break
            
        m_chap = re.match(r'^(PASAL|MAZMUR)\s*(?::\s*)?(\d+)$', s, re.IGNORECASE)
        if not m_chap and re.match(r'^(PASAL|MAZMUR)\s*:\s*$', s, re.IGNORECASE):
            for k in range(idx + 1, min(idx + 5, len(raw_slice))):
                sk = raw_slice[k].replace('\xa0', ' ').strip()
                if sk.isdigit():
                    m_chap = re.match(r'^()(\d+)$', sk)
                    break

        if m_chap:
            cur_chap = int(m_chap.group(2))
            if cur_chap not in chapters_data:
                chapters_data[cur_chap] = {
                    "chapter": cur_chap,
                    "outlines": list(cur_outlines),
                    "verses": [],
                    "footnotes": {}
                }
            cur_v = None
            cur_outlines = []
            continue
            
        # Skip standalone chapter number line if following PASAL :
        if cur_chap is not None and s == str(cur_chap) and not chapters_data.get(cur_chap, {}).get("verses"):
            continue

        # Match outline heading e.g. "I. Penciptaan Allah", "A. Keinginan dan Tujuan", "1:1—2:3"
        if re.match(r'^[I|V|X|A-Z0-9\.\s—\-\:\(\)]+$', s) and len(s) < 80 and not re.search(r'\b(dan|yang|kepada|di|oleh|dengan)\b', s):
            if cur_chap is None:
                cur_outlines.append(s)
            elif cur_chap in chapters_data and not chapters_data[cur_chap]["verses"]:
                chapters_data[cur_chap]["outlines"].append(s)
            continue
            
        # Match verse
        m_v = re.match(r'^(\d+)\s+(.+)', s)
        if m_v:
            vn = int(m_v.group(1))
            # If book has no chapter heading yet (e.g. single-chapter epistle), start chapter 1
            if cur_chap is None:
                cur_chap = 1
                chapters_data[1] = {
                    "chapter": 1,
                    "outlines": list(cur_outlines),
                    "verses": [],
                    "footnotes": {}
                }
                cur_outlines = []
                
            if cur_chap in chapters_data:
                # Normal verse number sequence
                if cur_v is None or vn == cur_v + 1 or (cur_v and vn == 1):
                    cur_v = vn
                    raw_vt = m_v.group(2)
                    chapters_data[cur_chap]["verses"].append({
                        "verse": cur_v,
                        "text": clean_verse_text(raw_vt)
                    })
        elif cur_v and cur_chap and cur_chap in chapters_data and chapters_data[cur_chap]["verses"]:
            # Continuation of verse text if not an outline
            if not re.match(r'^[I|V|X|A-Z0-9\.\s—\-\:\(\)]+$', s) and not re.match(r'^\d+:\d+', s):
                last_v = chapters_data[cur_chap]["verses"][-1]
                last_v["text"] += " " + clean_verse_text(s)
    
    # ============================================================
    # PHASE 2: Parse footnotes (after "Catatan Kaki" marker)
    # ============================================================
    if footnote_start_idx is not None:
        fn_chap = 1
        current_fn_verse = None
        current_fn_text = ""
        
        def _flush(chap, verse, text, cdata):
            """Save accumulated footnote text to the chapter data."""
            if chap and verse and text.strip() and chap in cdata:
                v_str = str(verse)
                if v_str not in cdata[chap]["footnotes"]:
                    cdata[chap]["footnotes"][v_str] = []
                cdata[chap]["footnotes"][v_str].append(clean_footnote_text(text))
        
        for idx2 in range(footnote_start_idx + 1, len(raw_slice)):
            raw_line = raw_slice[idx2]
            s2 = raw_line.replace('\xa0', ' ').strip()
            
            if not s2:
                continue
            
            # Check for chapter header in footnotes
            m_fn_chap = re.match(r'^(PASAL|MAZMUR)\s*(?::\s*)?(\d+)$', s2, re.IGNORECASE)
            if not m_fn_chap and re.match(r'^(PASAL|MAZMUR)\s*:\s*$', s2, re.IGNORECASE):
                for k2 in range(idx2 + 1, min(idx2 + 5, len(raw_slice))):
                    sk2 = raw_slice[k2].replace('\xa0', ' ').strip()
                    if sk2.isdigit():
                        m_fn_chap = re.match(r'^()(\d+)$', sk2)
                        break

            if m_fn_chap:
                _flush(fn_chap, current_fn_verse, current_fn_text, chapters_data)
                current_fn_verse = None
                current_fn_text = ""
                fn_chap = int(m_fn_chap.group(2))
                continue
            
            # Check if this line starts a new footnote
            m_fn_spaced = re.match(r'^(\d+)\s+(\d)\s+(.+)', s2)
            m_fn = re.match(r'^(\d{2,})\s*(.*)', s2)
            if m_fn_spaced:
                v_num = int(m_fn_spaced.group(1))
                if v_num > 0:
                    _flush(fn_chap, current_fn_verse, current_fn_text, chapters_data)
                    current_fn_verse = v_num
                    current_fn_text = m_fn_spaced.group(3)
                    continue
            elif m_fn:
                num_str = m_fn.group(1)
                verse_num, note_idx = parse_footnote_number(num_str)
                if verse_num is not None and verse_num > 0:
                    _flush(fn_chap, current_fn_verse, current_fn_text, chapters_data)
                    current_fn_verse = verse_num
                    current_fn_text = m_fn.group(2)
                    continue
            
            # Continuation of current footnote or standalone paragraph
            if current_fn_verse is not None:
                current_fn_text += " " + s2
            else:
                # Standalone paragraph without a verse number (continuation of previous)
                if fn_chap and chapters_data.get(fn_chap, {}).get("footnotes"):
                    fns = chapters_data[fn_chap]["footnotes"]
                    if fns:
                        last_key = list(fns.keys())[-1]
                        if fns[last_key]:
                            fns[last_key][-1] += " " + clean_footnote_text(s2)
        
        # Flush last accumulated footnote
        _flush(fn_chap, current_fn_verse, current_fn_text, chapters_data)
    
    # Build final chapter data - convert footnotes dict to list format
    for chap_num in chapters_data:
        fn_dict = chapters_data[chap_num].get("footnotes", {})
        fn_list = []
        for verse_str, notes in sorted(fn_dict.items(), key=lambda x: int(x[0])):
            for note_text in notes:
                if note_text.strip():
                    fn_list.append({
                        "verse": int(verse_str),
                        "text": note_text
                    })
        chapters_data[chap_num]["footnotes"] = fn_list
    
    chap_count = len(chapters_data)
    
    # Count total footnotes
    total_fn = sum(len(chapters_data[c].get("footnotes", [])) for c in chapters_data)
    
    books_meta.append({
        "id": b_id,
        "name": b_name,
        "testament": b_info["testament"],
        "chapters_count": chap_count
    })
    
    out_book_file = os.path.join(out_dir, f"{b_id}.json")
    book_payload = {
        "id": b_id,
        "name": b_name,
        "testament": b_info["testament"],
        "chapters_count": chap_count,
        "chapters": chapters_data
    }
    with open(out_book_file, "w", encoding="utf-8") as f_out:
        json.dump(book_payload, f_out, ensure_ascii=False)
        
    print(f"[{b_info['testament']}] {b_name:20s}: {chap_count:3d} pasal, {total_fn:4d} catatan kaki -> {out_book_file}")

# Write books.json index
with open(os.path.join(out_dir, "books.json"), "w", encoding="utf-8") as f_idx:
    json.dump(books_meta, f_idx, ensure_ascii=False, indent=2)

# Copy to dist/bible
dist_bible_dir = r"D:\Magang\Baca\dist\bible"
os.makedirs(dist_bible_dir, exist_ok=True)
for item in os.listdir(out_dir):
    s_f = os.path.join(out_dir, item)
    d_f = os.path.join(dist_bible_dir, item)
    if os.path.isfile(s_f):
        shutil.copy2(s_f, d_f)

print(f"\nSuccessfully exported all {len(books_meta)} books with footnotes into JSON!")
