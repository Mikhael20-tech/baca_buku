import sys
import os
import re
import json

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
file_path = r"D:\Magang\Baca\pdb\roti_hayat_full.txt"
out_file = r"D:\Magang\Baca\public\bible\matius.json"
dist_file = r"D:\Magang\Baca\dist\bible\matius.json"

mat_start = 774719
mat_end = 784079

print("Loading Matius text slice...")
with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = [f.readline() for _ in range(mat_end + 10)]

mat_slice = lines[mat_start-1 : mat_end]
print(f"Loaded {len(mat_slice)} lines of Matius")

# ==============================================================================
# 1. PARSE BOOK INTRODUCTION (Penulis, Waktu, Tempat, Penerima, Pokok)
# ==============================================================================
book_intro = {}
cur_intro_key = None
intro_acc = []
for idx in range(0, 58):
    l = mat_slice[idx].strip().replace('\xa0', ' ')
    if not l or l.startswith('PASAL :') or re.match(r'^\d+\s+\d+', l):
        continue
    if l.endswith(':'):
        if cur_intro_key:
            book_intro[cur_intro_key] = ' '.join(intro_acc).strip()
        cur_intro_key = l[:-1].strip()
        intro_acc = []
    elif cur_intro_key:
        intro_acc.append(l)

if cur_intro_key and intro_acc:
    book_intro[cur_intro_key] = ' '.join(intro_acc).strip()

print("Book Intro parsed:", list(book_intro.keys()))

# ==============================================================================
# 2. PARSE FOOTNOTES (Offset 3658 to end)
# ==============================================================================
fn_slice = mat_slice[3658:]
footnotes_by_chap = {} # chap -> list of {verse, note_idx, text}
cur_fn_chap = None
cur_fn_verse = None
cur_fn_idx = None
cur_fn_text = ""

def flush_fn():
    global cur_fn_chap, cur_fn_verse, cur_fn_idx, cur_fn_text, footnotes_by_chap
    if cur_fn_chap and cur_fn_verse and cur_fn_text.strip():
        if cur_fn_chap not in footnotes_by_chap:
            footnotes_by_chap[cur_fn_chap] = []
        cleaned_t = re.sub(r'\s+', ' ', cur_fn_text).strip()
        footnotes_by_chap[cur_fn_chap].append({
            "verse": cur_fn_verse,
            "note_idx": cur_fn_idx,
            "text": cleaned_t
        })
    cur_fn_verse = None
    cur_fn_idx = None
    cur_fn_text = ""

for idx, l in enumerate(fn_slice):
    s = l.strip().replace('\xa0', ' ')
    if not s or s == 'Injil Matius' or s.startswith('Catatan Kaki'):
        continue
    
    m_chap = re.match(r'^PASAL\s*(\d+)', s, re.I)
    if m_chap:
        flush_fn()
        cur_fn_chap = int(m_chap.group(1))
        continue
        
    m_num = re.match(r'^(\d+)\s+(.+)', s)
    if m_num and cur_fn_chap:
        num_str = m_num.group(1)
        content_str = m_num.group(2)
        if len(num_str) >= 2:
            flush_fn()
            cur_fn_verse = int(num_str[:-1])
            cur_fn_idx = int(num_str[-1])
            cur_fn_text = content_str
            continue
            
    # Continuation
    if cur_fn_verse is not None:
        cur_fn_text += " " + s

flush_fn()
total_parsed_notes = sum(len(v) for v in footnotes_by_chap.values())
print(f"Total footnotes parsed across {len(footnotes_by_chap)} chapters: {total_parsed_notes}")

# ==============================================================================
# 3. PARSE SCRIPTURE CHAPTERS, OUTLINES & VERSES (Offset 58 to 3658)
# ==============================================================================
chapters_data = {}
cur_chap = None
pending_outlines = []
scripture_slice = mat_slice[58:3658]

def clean_cross_refs(txt):
    """
    Remove pure cross-reference letters attached to words in text:
    - [a-z] before Capitalized word: aKelahiran -> Kelahiran, bMaria -> Maria, cAllah -> Allah, dYesus -> Yesus
    - [a-z] before lowercase word where prefix is cross-reference:
      e.g. aanak -> anak, banak -> anak, bibu-Nya -> ibu-Nya
      cmelahirkan -> melahirkan, bmencemarkan -> mencemarkan, amalaikat -> malaikat
      bmimpi -> mimpi, adigenapi -> digenapi, amelakukan -> melakukan
    """
    t = txt
    t = re.sub(r'(?:^|(?<=\s))[a-z]([A-Z][a-zA-Z]*)', r'\1', t)
    t = re.sub(r'(?:^|(?<=\s))a(anak|antara|atas|akhir|ampun|amat|ku|ir|pabila|sal)', r'\1', t)
    t = re.sub(r'(?:^|(?<=\s))b(m[a-z]+|d[a-z]+|anak|ibu[a-zA-Z\-]*|benih|orang|saudara|mereka|dua|tiga|satu)', r'\1', t)
    t = re.sub(r'(?:^|(?<=\s))c(m[a-z]+|j[a-z]+|b[a-z]+|s[a-z]+|d[a-z]+)', r'\1', t)
    t = re.sub(r'(?:^|(?<=\s))a(malaikat|digenapi|melakukan|seorang|perempuan|seperti|waktu|hari|ketika|supaya|siapa)', r'\1', t)
    t = re.sub(r"\'Tuhan\b", "Tuhan", t)
    t = re.sub(r"\?[\-‑]?", "", t)
    t = re.sub(r'(\w+)\-+([\w]+)', r'\1-\2', t)
    t = re.sub(r'\s+', ' ', t)
    return t.strip()

def build_marked_text_and_keywords(v_num, raw_text):
    t = clean_cross_refs(raw_text)
    
    def parse_fn_marker(m):
        f_num = m.group(1)
        rest = m.group(2)
        m_ref = re.match(r'^([a-g])([a-zA-Z\(\"\'\-]+)$', rest)
        if m_ref:
            cand_ref = m_ref.group(1)
            cand_word = m_ref.group(2)
            if cand_ref == 'a' and cand_word in ['nak', 'ir', 'pa', 'tas', 'sal', 'ku']:
                return f_num, "", rest
            elif cand_ref == 'b' and cand_word in ['erhala', 'enar', 'angun', 'aik']:
                return f_num, "", rest
            else:
                return f_num, cand_ref, cand_word
        else:
            return f_num, "", rest

    pattern = re.compile(r'(?:^|(?<=\s))(\d+)([a-zA-Z\(\"\'\-]+)')
    matches = list(pattern.finditer(t))
    
    if not matches:
        return t, t, {}
        
    keywords_map = {}
    marked_parts = []
    last_pos = 0
    
    for idx, m in enumerate(matches):
        note_num, cross_ref, first_word = parse_fn_marker(m)
        note_int = int(note_num)
        
        marked_parts.append(t[last_pos:m.start()])
        
        p_start = m.start() + len(m.group(1)) + (len(cross_ref) if cross_ref else 0)
        p_end = matches[idx+1].start() if idx + 1 < len(matches) else len(t)
        raw_phrase = t[p_start:p_end]
        
        m_punct = re.search(r'([,;:\.\?\!\s]+)$', raw_phrase)
        trailing = m_punct.group(1) if m_punct else ""
        phrase_clean = raw_phrase[:-len(trailing)].strip() if trailing else raw_phrase.strip()
        
        kw = phrase_clean
        if '; ' in phrase_clean:
            first_clause, rest_clause = phrase_clean.split('; ', 1)
            kw = first_clause.strip()
            marked_parts.append(f'{first_clause}<fn n="{note_int}"/>; {rest_clause}{trailing}')
        elif ' dan ' in phrase_clean and len(phrase_clean.split()) > 4:
            first_clause, rest_clause = phrase_clean.split(' dan ', 1)
            kw = first_clause.strip()
            marked_parts.append(f'{first_clause}<fn n="{note_int}"/> dan {rest_clause}{trailing}')
        else:
            marked_parts.append(f'{phrase_clean}<fn n="{note_int}"/>{trailing}')
            
        keywords_map[note_int] = kw
        last_pos = p_end

    marked_text = "".join(marked_parts)
    marked_text = re.sub(r'\s+', ' ', marked_text).strip()
    clean_text = re.sub(r'<fn n="\d+"\/>', '', marked_text)
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    
    return clean_text, marked_text, keywords_map

# Outline accumulator
accumulating_outline = []

for idx, l in enumerate(scripture_slice):
    s = l.strip().replace('\xa0', ' ')
    if not s or s.startswith('---') or s.startswith('o---') or s.startswith('Ayat :') or s.startswith('Ayat:'):
        continue
    if re.match(r'^\d+\~\d+', s):
        continue
        
    m_chap = re.match(r'^PASAL\s*(\d+)', s, re.I)
    if m_chap:
        cur_chap = int(m_chap.group(1))
        if cur_chap not in chapters_data:
            chapters_data[cur_chap] = {
                "chapter": cur_chap,
                "outlines": [],
                "verses": [],
                "footnotes": []
            }
        continue
        
    is_outline_start = bool(re.match(r'^(?:[I|V|X]+\.|\b[A-Z]\.|\b\d+\.)\s+', s))
    is_range = bool(re.match(r'^\d+:\d+', s))
    
    if is_outline_start:
        if accumulating_outline:
            full_o = ' '.join(accumulating_outline).strip()
            pending_outlines.append(full_o)
            accumulating_outline = []
        accumulating_outline.append(s)
        continue
    elif is_range and accumulating_outline:
        accumulating_outline.append(f"({s})")
        full_o = ' '.join(accumulating_outline).strip()
        pending_outlines.append(full_o)
        accumulating_outline = []
        continue
    elif accumulating_outline and not re.match(r'^\d+\s+', s):
        accumulating_outline.append(s)
        continue
        
    # Match verse line
    m_v = re.match(r'^(\d+)\s+(.+)', s)
    if m_v and cur_chap:
        if accumulating_outline:
            full_o = ' '.join(accumulating_outline).strip()
            pending_outlines.append(full_o)
            accumulating_outline = []
            
        vn = int(m_v.group(1))
        raw_vt = m_v.group(2)
        clean_t, marked_t, kw_map = build_marked_text_and_keywords(vn, raw_vt)
        
        verse_outlines = list(pending_outlines)
        pending_outlines = []
        
        for o in verse_outlines:
            chapters_data[cur_chap]["outlines"].append({
                "verse": vn,
                "text": o
            })
            
        chapters_data[cur_chap]["verses"].append({
            "verse": vn,
            "text": clean_t,
            "marked_text": marked_t,
            "outlines": verse_outlines if verse_outlines else None,
            "_raw_kw": kw_map
        })

print(f"Parsed {len(chapters_data)} scripture chapters")

# ==============================================================================
# 4. ASSOCIATE FOOTNOTES WITH KEYWORDS & ASSEMBLE
# ==============================================================================
for chap_num, chap_obj in chapters_data.items():
    raw_notes = footnotes_by_chap.get(chap_num, [])
    v_kw_lookup = {}
    for v in chap_obj["verses"]:
        v_kw_lookup[v["verse"]] = v.pop("_raw_kw", {})
        
    final_fns = []
    for fn in raw_notes:
        v_num = fn["verse"]
        n_idx = fn["note_idx"]
        kw = v_kw_lookup.get(v_num, {}).get(n_idx, "")
        final_fns.append({
            "verse": v_num,
            "note_idx": n_idx,
            "keyword": kw,
            "text": fn["text"]
        })
    chap_obj["footnotes"] = final_fns

payload = {
    "id": "matius",
    "name": "Matius",
    "testament": "PB",
    "chapters_count": len(chapters_data),
    "intro": book_intro,
    "chapters": chapters_data
}

with open(out_file, "w", encoding="utf-8") as f:
    json.dump(payload, f, ensure_ascii=False, indent=2)

os.makedirs(os.path.dirname(dist_file), exist_ok=True)
with open(dist_file, "w", encoding="utf-8") as f:
    json.dump(payload, f, ensure_ascii=False, indent=2)

print(f"\nSuccessfully generated {out_file} and {dist_file}")
