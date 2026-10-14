import os
import sys
import re
import json

file_path = r"D:\Magang\Baca\pdb\roti_hayat_full.txt"

def clean_base_text(t):
    if not t:
        return ""
    t = t.replace('\xa0', ' ')
    t = t.replace('\ufffd', '—').replace('\x96', '–').replace('\x97', '—').replace('\x85', '...')
    t = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', t)
    
    # Syllable breaks containing '?'
    t = re.sub(r'(\w)(?:[\?\-‑]*\?+[\?\-‑]*)(\w)', r'\1\2', t)
    t = re.sub(r'(\w)(?:[\?\-‑]*\?+[\?\-‑]*)(\w)', r'\1\2', t)
    t = re.sub(r'(\w)(?:[\?\-‑]*\?+[\?\-‑]*)(\w)', r'\1\2', t)
    t = re.sub(r'\?+[\-‑]*\?*', '', t)
    
    # Double hyphens inside word without space
    t = re.sub(r'(\w)\-\-+([\w])', r'\1-\2', t)
    
    # Clean OCR leading quotes
    t = re.sub(r"\'Tuhan\b", "Tuhan", t)
    t = re.sub(r"\'Allah\b", "Allah", t)
    
    # Common Alkitab typos
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
    t = re.sub(r'(?:^|(?<=[\s\"\'\(\[\{]))[a-z]([A-Z][a-zA-Z\-]*)', r'\1', t)
    t = re.sub(r'(?:^|(?<=[\s\"\'\(\[\{]))a(anak|antara|atas|akhir|ampun|amat|ku|ir|pabila|sal|ada|baik|siang)\b', r'\1', t)
    t = re.sub(r'(?:^|(?<=[\s\"\'\(\[\{]))b(m[a-z]+|d[a-z]+|anak|ibu[a-zA-Z\-]*|benih|orang|saudara|mereka|dua|tiga|satu|belalang|menciptakan|belum|terang)\b', r'\1', t)
    t = re.sub(r'(?:^|(?<=[\s\"\'\(\[\{]))c(m[a-z]+|j[a-z]+|b[a-z]+|s[a-z]+|d[a-z]+|madu|baptisan)\b', r'\1', t)
    t = re.sub(r'(?:^|(?<=[\s\"\'\(\[\{]))a(malaikat|digenapi|melakukan|seorang|perempuan|seperti|waktu|hari|ketika|supaya|siapa|daerah|suara)\b', r'\1', t)
    t = re.sub(r'(?:^|(?<=[\s\"\'\(\[\{]))d(tobat)\b', r'\1', t)
    t = re.sub(r'(?:^|(?<=[\s\"\'\(\[\{]))e(pengampunan)\b', r'\1', t)
    return t

def parse_book(b_info, raw_slice):
    b_id = b_info["id"]
    b_name = b_info["name"]
    b_testament = b_info["testament"]
    
    # 1. Find footnote boundary
    fn_start_idx = None
    for idx, l in enumerate(raw_slice):
        s = l.strip().replace('\xa0', ' ')
        # Catatan Kaki, Cacatan Kaki, Catatan Kakai
        if re.search(r'^\s*Ca[ct]atan\s+Ka[ck]a?i', s, re.IGNORECASE):
            fn_start_idx = idx
            break
            
    # 2. Parse Book Intro (from line 0 up to real scripture start)
    book_intro = {}
    cur_intro_key = None
    intro_acc = []
    intro_end_idx = 0
    
    # We look for where scripture actually starts:
    # First line that matches: outline like 'I. ' or 'PASAL 1' / 'MAZMUR 1' after 'Penulis' or 'Pokok'
    has_seen_intro_key = False
    for idx in range(min(200, len(raw_slice))):
        l = raw_slice[idx].strip().replace('\xa0', ' ')
        if not l or l == b_name.upper():
            continue
        # Table of contents line like '1 2 3 4 5 6...' or 'PASAL :'
        if re.match(r'^(?:PASAL|MAZMUR)\s*:\s*$', l, re.I) or re.match(r'^\d+(\s+\d+)+$', l):
            continue
            
        # Detect intro header like 'Penulis :', 'Pokok :', 'Waktu Penulisan :'
        if l.endswith(':') and not re.match(r'^\d+:\d+', l) and not l.startswith('Ayat'):
            has_seen_intro_key = True
            if cur_intro_key:
                book_intro[cur_intro_key] = clean_base_text(' '.join(intro_acc))
            cur_intro_key = l[:-1].strip()
            intro_acc = []
            continue
            
        # If we have seen intro keys, and we encounter outline 'I. ' or 'PASAL 1' / 'MAZMUR 1' or verse range
        if has_seen_intro_key:
            if re.match(r'^(?:[I|V|X]+\.|\bA\.)\s+', l) or re.match(r'^(?:PASAL|MAZMUR)\s*1\b', l, re.I):
                intro_end_idx = idx
                break
                
        if cur_intro_key:
            intro_acc.append(l)
            
    if cur_intro_key and intro_acc:
        book_intro[cur_intro_key] = clean_base_text(' '.join(intro_acc))
        
    if intro_end_idx == 0:
        # Fallback if no intro headers found (e.g. some short epistles)
        for idx in range(min(50, len(raw_slice))):
            l = raw_slice[idx].strip().replace('\xa0', ' ')
            if re.match(r'^(?:[I|V|X]+\.|\bA\.)\s+', l) or re.match(r'^(?:PASAL|MAZMUR)\s*1\b', l, re.I):
                intro_end_idx = idx
                break
        
    # 3. Parse Footnotes (from fn_start_idx to end)
    footnotes_by_chap = {}
    if fn_start_idx is not None:
        fn_slice = raw_slice[fn_start_idx:]
        cur_fn_chap = 1
        cur_fn_verse = None
        cur_fn_idx = None
        cur_fn_text = ""
        
        def flush_fn():
            nonlocal cur_fn_chap, cur_fn_verse, cur_fn_idx, cur_fn_text
            if cur_fn_chap and cur_fn_verse and cur_fn_text.strip():
                if cur_fn_chap not in footnotes_by_chap:
                    footnotes_by_chap[cur_fn_chap] = []
                cleaned_t = clean_base_text(cur_fn_text)
                footnotes_by_chap[cur_fn_chap].append({
                    "verse": cur_fn_verse,
                    "note_idx": cur_fn_idx,
                    "text": cleaned_t
                })
            cur_fn_verse = None
            cur_fn_idx = None
            cur_fn_text = ""
            
        for l in fn_slice:
            s = l.strip().replace('\xa0', ' ')
            if not s or re.search(r'^\s*Ca[ct]atan\s+Ka[ck]a?i', s, re.IGNORECASE) or s.lower().startswith('injil ') or s.lower().startswith('kitab '):
                continue
                
            m_chap = re.match(r'^(?:PASAL|MAZMUR)\s*(\d+)', s, re.IGNORECASE)
            if m_chap:
                flush_fn()
                cur_fn_chap = int(m_chap.group(1))
                continue
                
            # Pattern: 11 Footnote text or 1 1 Footnote text or 101 Footnote text
            m_num_spaced = re.match(r'^(\d+)\s+(\d)\s+(.+)', s)
            m_num = re.match(r'^(\d{2,})\s+(.+)', s)
            
            if m_num_spaced:
                flush_fn()
                cur_fn_verse = int(m_num_spaced.group(1))
                cur_fn_idx = int(m_num_spaced.group(2))
                cur_fn_text = m_num_spaced.group(3)
                continue
            elif m_num:
                num_str = m_num.group(1)
                content_str = m_num.group(2)
                flush_fn()
                cur_fn_verse = int(num_str[:-1])
                cur_fn_idx = int(num_str[-1])
                cur_fn_text = content_str
                continue
                
            # Continuation line
            if cur_fn_verse is not None:
                cur_fn_text += " " + s
                
        flush_fn()
        
    # 4. Parse Scripture Chapters, Outlines & Verses
    scripture_slice = raw_slice[intro_end_idx : fn_start_idx] if fn_start_idx else raw_slice[intro_end_idx:]
    chapters_data = {}
    cur_chap = 1
    pending_outlines = []
    accumulating_outline = []
    
    def build_marked_text(v_num, raw_text, chap_num):
        t = clean_base_text(raw_text)
        t = clean_cross_refs(t)
        
        # Get valid note indices for this verse in this chapter
        chap_notes = footnotes_by_chap.get(chap_num, [])
        valid_indices = {fn["note_idx"] for fn in chap_notes if fn["verse"] == v_num}
        
        def parse_fn_marker(m):
            f_num = m.group(1)
            rest = m.group(2)
            m_ref = re.match(r'^([a-g])([a-zA-Z\(\"\'\-]+)$', rest)
            if m_ref:
                cand_ref = m_ref.group(1)
                cand_word = m_ref.group(2)
                if cand_ref == 'a' and cand_word in ['nak', 'ir', 'pa', 'tas', 'sal', 'ku', 'da']:
                    return f_num, "", rest
                elif cand_ref == 'b' and cand_word in ['erhala', 'enar', 'angun', 'aik', 'umi']:
                    return f_num, "", rest
                elif cand_ref == 'd' and cand_word.startswith(('ibaptis', 'iberi', 'iampuni', 'iatas', 'i-')):
                    return f_num, "", rest
                else:
                    return f_num, cand_ref, cand_word
            return f_num, "", rest

        pattern = re.compile(r'(?:^|(?<=[\s\"\'\(\[\{]))(\d+)([a-zA-Z\(\"\'\-]+)')
        matches = list(pattern.finditer(t))
        
        if not matches:
            return t, t, {}
            
        keywords_map = {}
        marked_parts = []
        last_pos = 0
        
        for idx, m in enumerate(matches):
            note_num_str, cross_ref, first_word = parse_fn_marker(m)
            note_int = int(note_num_str)
            
            # If we have valid indices and note_int is not one of them, check if valid
            if valid_indices and note_int not in valid_indices:
                # Still check if reasonable
                pass
                
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

    for idx, l in enumerate(scripture_slice):
        s = l.strip().replace('\xa0', ' ')
        if not s or s.startswith('---') or s.startswith('o---') or s.startswith('Ayat :') or s.startswith('Ayat:'):
            continue
        if re.match(r'^\d+\~\d+', s):
            continue
            
        m_chap = re.match(r'^(?:PASAL|MAZMUR)\s*(?::\s*)?(\d+)', s, re.IGNORECASE)
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
            
        if cur_chap not in chapters_data:
            chapters_data[cur_chap] = {
                "chapter": cur_chap,
                "outlines": [],
                "verses": [],
                "footnotes": []
            }
            
        is_outline_start = bool(re.match(r'^(?:[I|V|X]+\.|\b[A-Z]\.|\b\d+\.)\s+', s))
        is_range = bool(re.match(r'^\d+:\d+', s))
        
        if is_outline_start:
            if accumulating_outline:
                full_o = clean_base_text(' '.join(accumulating_outline))
                pending_outlines.append(full_o)
                accumulating_outline = []
            accumulating_outline.append(s)
            continue
        elif is_range and accumulating_outline:
            accumulating_outline.append(f"({s})")
            full_o = clean_base_text(' '.join(accumulating_outline))
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
                full_o = clean_base_text(' '.join(accumulating_outline))
                pending_outlines.append(full_o)
                accumulating_outline = []
                
            vn = int(m_v.group(1))
            raw_vt = m_v.group(2)
            clean_t, marked_t, kw_map = build_marked_text(vn, raw_vt, cur_chap)
            
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
        elif cur_chap in chapters_data and chapters_data[cur_chap]["verses"]:
            # Continuation line of previous verse if not an outline
            if not is_outline_start and not is_range:
                last_v = chapters_data[cur_chap]["verses"][-1]
                cont_clean = clean_base_text(s)
                cont_clean = clean_cross_refs(cont_clean)
                last_v["text"] += " " + cont_clean
                last_v["marked_text"] += " " + cont_clean

    # 5. Connect Footnotes with Keywords
    total_fns_count = 0
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
        total_fns_count += len(final_fns)
        
    payload = {
        "id": b_id,
        "name": b_name,
        "testament": b_testament,
        "chapters_count": len(chapters_data),
        "intro": book_intro,
        "chapters": chapters_data
    }
    
    print(f"[{b_testament}] {b_name:20s}: {len(chapters_data):3d} chaps, {total_fns_count:4d} footnotes, Intro keys: {list(book_intro.keys())}")
    return payload

if __name__ == "__main__":
    from export_bible_json import BIBLE_BOOKS
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        all_lines = f.readlines()
        
    test_ids = ['keluaran', 'filemon', 'obaja']
    for b in BIBLE_BOOKS:
        if b['id'] in test_ids:
            raw = all_lines[b['start']-1 : b['end']-1]
            p = parse_book(b, raw)
            # Inspect chapter 1
            ch1 = p['chapters'].get(1) or p['chapters'].get('1')
            if ch1:
                print(f"  Ch1 Verses: {len(ch1['verses'])}, Footnotes: {len(ch1['footnotes'])}")
                print(f"  V1: {ch1['verses'][0]['marked_text']}")
                if ch1['footnotes']:
                    print(f"  FN1: {ch1['footnotes'][0]}")
