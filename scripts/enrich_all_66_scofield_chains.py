import sqlite3
import re
import json
import os

DB_INDEX = r'd:\Magang\Baca\Alkitab\scofield_reference_index.sqlite'
BOOKS_DIR = r'd:\Magang\Baca\public\bible\scofield'

# 66 Book abbreviation mapping
ABBR_TO_BOOK = {
    # Old Testament (39)
    "Gen": "kejadian", "Exo": "keluaran", "Lev": "imamat", "Num": "bilangan", "Deu": "ulangan",
    "Jos": "yosua", "Jdg": "hakim-hakim", "Rth": "rut", "1Sa": "1-samuel", "2Sa": "2-samuel",
    "1Ki": "1-raja-raja", "2Ki": "2-raja-raja", "1Ch": "1-tawarikh", "2Ch": "2-tawarikh",
    "Ezr": "ezra", "Neh": "nehemia", "Est": "ester", "Job": "ayub", "Psa": "mazmur",
    "Pro": "amsal", "Ecc": "pengkhotbah", "Son": "kidung-agung", "Isa": "yesaya", "Jer": "yeremia",
    "Lam": "ratapan", "Eze": "yehezkiel", "Dan": "daniel", "Hos": "hosea", "Joe": "yoel",
    "Amo": "amos", "Oba": "obaja", "Jon": "yunus", "Mic": "mikha", "Nah": "nahum",
    "Hab": "habakuk", "Zep": "zefanya", "Hag": "hagai", "Zec": "zakharia", "Mal": "maleakhi",
    # New Testament (27)
    "Mat": "matius", "Mar": "markus", "Luk": "lukas", "Joh": "yohanes", "Act": "kisah-para-rasul",
    "Rom": "roma", "1Co": "1-korintus", "2Co": "2-korintus", "Gal": "galatia", "Eph": "efesus",
    "Php": "filipi", "Col": "kolose", "1Th": "1-tesalonika", "2Th": "2-tesalonika", "1Ti": "1-timotius",
    "2Ti": "2-timotius", "Tit": "titus", "Phm": "filemon", "Heb": "ibrani", "Jas": "yakobus",
    "1Pe": "1-petrus", "2Pe": "2-petrus", "1Jn": "1-yohanes", "2Jn": "2-yohanes", "3Jn": "3-yohanes",
    "Jud": "yudas", "Rev": "wahyu"
}

def load_chain_topics():
    conn = sqlite3.connect(DB_INDEX)
    c = conn.cursor()
    c.execute('SELECT Topic, Definition FROM Dictionary')
    rows = c.fetchall()
    
    # Store by (book_id, chapter, verse) -> list of entries
    chains = {}
    
    for topic, defn in rows:
        paragraphs = defn.split('</p>')
        for p in paragraphs:
            p_clean = re.sub(r'<[^>]+>', ' ', p).strip()
            if not p_clean:
                continue
            # find subtopic e.g. <b>type of Christ:</b>
            sub_m = re.search(r'<b>(.*?)</b>', p)
            subtopic = sub_m.group(1).replace(':', '').strip() if sub_m else ""
            
            # extract all scripture references in this clause
            refs = re.findall(r'<ref>([1-3]?[A-Za-z]+)\s+(\d+)[\:\.](\d+)</ref>', p)
            all_refs = [f"{b} {ch}:{vs}" for b, ch, vs in refs]
            
            for b_abbr, ch, vs in refs:
                book_id = ABBR_TO_BOOK.get(b_abbr)
                if not book_id:
                    continue
                key = (book_id, int(ch), int(vs))
                chains.setdefault(key, []).append({
                    'topic': topic,
                    'subtopic': subtopic,
                    'desc': p_clean,
                    'refs': all_refs
                })
    conn.close()
    return chains

def main():
    chains = load_chain_topics()
    print(f"Loaded {len(chains)} verse reference targets from Scofield Index Dictionary.")
    
    total_injected = 0
    books_updated = 0
    
    for b_abbr, book_id in ABBR_TO_BOOK.items():
        json_path = os.path.join(BOOKS_DIR, f"{book_id}.json")
        if not os.path.exists(json_path):
            continue
            
        with open(json_path, 'r', encoding='utf-8') as f:
            book_data = json.load(f)
            
        chapters = book_data.get('chapters', {})
        book_injected = 0
        
        for ch_str, ch_data in chapters.items():
            ch_num = int(ch_str)
            existing_fns = ch_data.get('footnotes', [])
            
            # Check if chapter already has manual lettered margin notes (e.g. Matthew 1, 2, 3, 4)
            has_manual_letters = any(bool(fn.get('letter')) for fn in existing_fns)
            if book_id == 'matius' and ch_num in [1, 2, 3, 4] and has_manual_letters:
                continue
                
            verses = ch_data.get('verses', [])
            v_dict = {v['verse']: v for v in verses}
            
            # Find all chain topics for this chapter
            ch_topics = []
            for v_num in sorted(v_dict.keys()):
                key = (book_id, ch_num, v_num)
                if key in chains:
                    for item in chains[key]:
                        ch_topics.append((v_num, item))
                        
            if not ch_topics:
                continue
                
            # Assign letters a..z, aa..zz
            new_margin_fns = []
            max_existing_idx = max([fn.get('note_idx', 0) for fn in existing_fns], default=0)
            
            for idx, (v_num, item) in enumerate(ch_topics):
                if idx < 26:
                    letter = chr(97 + idx) # a..z
                else:
                    letter = chr(97 + ((idx - 26) % 26)) + chr(97 + ((idx - 26) % 26)) # aa, bb..
                    
                v_obj = v_dict[v_num]
                v_text = v_obj.get('marked_text') or v_obj.get('text', '')
                
                # Check if marker already exists for this letter
                marker = f'<fn n="{letter}"/>'
                if marker not in v_text:
                    # Try to insert after topic keyword if keyword appears in verse
                    kw = item['topic']
                    kw_clean = re.sub(r'\(.*?\)', '', kw).strip()
                    pattern = re.compile(re.escape(kw_clean), re.IGNORECASE)
                    m = pattern.search(v_text)
                    if m and len(kw_clean) > 3:
                        pos = m.end()
                        v_obj['marked_text'] = v_text[:pos] + marker + v_text[pos:]
                    else:
                        # Append to end of verse
                        v_obj['marked_text'] = v_text + marker
                        
                # Create margin note entry
                note_idx = max_existing_idx + idx + 1
                topic_title = item['topic'] + (f" ({item['subtopic']})" if item['subtopic'] else "")
                
                new_fn = {
                    "verse": v_num,
                    "note_idx": note_idx,
                    "letter": letter,
                    "keyword": topic_title,
                    "text": f"{topic_title}: {item['desc']}",
                    "html": f"<p><b>{topic_title}</b>: {item['desc']}</p>",
                    "references": item['refs']
                }
                new_margin_fns.append(new_fn)
                book_injected += 1
                total_injected += 1
                
            # Prepend or append new margin notes to chapter footnotes
            # Margin notes first, then existing doctrinal footnotes
            ch_data['footnotes'] = new_margin_fns + existing_fns
            
        if book_injected > 0:
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(book_data, f, ensure_ascii=False, indent=2)
            books_updated += 1
            print(f"[{book_id}] Injected {book_injected} chain margin notes.")

    print(f"\nSUCCESS: Enriched {books_updated} books with a total of {total_injected} margin chain references!")

if __name__ == '__main__':
    main()
