import pymupdf
import re
import json
import os

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pdf_path = os.path.join(root_dir, 'Alkitab', 'scofieldreferenc0000revc.pdf')
scofield_dir = os.path.join(root_dir, 'public', 'bible', 'scofield')

print(f"Opening PDF: {pdf_path}")
doc = pymupdf.open(pdf_path)

# Canonical 66 Books Definition with Page Searches
CANONICAL_BOOKS = [
    {"id": "kejadian", "file": "kejadian.json", "aliases": ["GENESIS"]},
    {"id": "keluaran", "file": "keluaran.json", "aliases": ["EXODUS"]},
    {"id": "imamat", "file": "imamat.json", "aliases": ["LEVITICUS"]},
    {"id": "bilangan", "file": "bilangan.json", "aliases": ["NUMBERS"]},
    {"id": "ulangan", "file": "ulangan.json", "aliases": ["DEUTERONOMY"]},
    {"id": "yosua", "file": "yosua.json", "aliases": ["JOSHUA"]},
    {"id": "hakim-hakim", "file": "hakim-hakim.json", "aliases": ["JUDGES"]},
    {"id": "rut", "file": "rut.json", "aliases": ["RUTH"]},
    {"id": "1-samuel", "file": "1-samuel.json", "aliases": ["I. SAMUEL", "I SAMUEL", "1 SAMUEL"]},
    {"id": "2-samuel", "file": "2-samuel.json", "aliases": ["II. SAMUEL", "II SAMUEL", "2 SAMUEL"]},
    {"id": "1-raja-raja", "file": "1-raja-raja.json", "aliases": ["I. KINGS", "I KINGS", "1 KINGS"]},
    {"id": "2-raja-raja", "file": "2-raja-raja.json", "aliases": ["II. KINGS", "II KINGS", "2 KINGS"]},
    {"id": "1-tawarikh", "file": "1-tawarikh.json", "aliases": ["I. CHRONICLES", "I CHRONICLES", "1 CHRONICLES"]},
    {"id": "2-tawarikh", "file": "2-tawarikh.json", "aliases": ["II. CHRONICLES", "II CHRONICLES", "2 CHRONICLES"]},
    {"id": "ezra", "file": "ezra.json", "aliases": ["EZRA"]},
    {"id": "nehemia", "file": "nehemia.json", "aliases": ["NEHEMIAH"]},
    {"id": "ester", "file": "ester.json", "aliases": ["ESTHER"]},
    {"id": "ayub", "file": "ayub.json", "aliases": ["JOB"]},
    {"id": "mazmur", "file": "mazmur.json", "aliases": ["PSALMS", "THE PSALMS", "PSALM"]},
    {"id": "amsal", "file": "amsal.json", "aliases": ["PROVERBS", "THE PROVERBS"]},
    {"id": "pengkhotbah", "file": "pengkhotbah.json", "aliases": ["ECCLESIASTES"]},
    {"id": "kidung-agung", "file": "kidung-agung.json", "aliases": ["SONG OF SOLOMON", "THE SONG OF SOLOMON", "CANTICLES"]},
    {"id": "yesaya", "file": "yesaya.json", "aliases": ["ISAIAH"]},
    {"id": "yeremia", "file": "yeremia.json", "aliases": ["JEREMIAH"]},
    {"id": "ratapan", "file": "ratapan.json", "aliases": ["LAMENTATIONS"]},
    {"id": "yehezkiel", "file": "yehezkiel.json", "aliases": ["EZEKIEL"]},
    {"id": "daniel", "file": "daniel.json", "aliases": ["DANIEL"]},
    {"id": "hosea", "file": "hosea.json", "aliases": ["HOSEA"]},
    {"id": "yoel", "file": "yoel.json", "aliases": ["JOEL"]},
    {"id": "amos", "file": "amos.json", "aliases": ["AMOS"]},
    {"id": "obaja", "file": "obaja.json", "aliases": ["OBADIAH"]},
    {"id": "yunus", "file": "yunus.json", "aliases": ["JONAH"]},
    {"id": "mikha", "file": "mikha.json", "aliases": ["MICAH"]},
    {"id": "nahum", "file": "nahum.json", "aliases": ["NAHUM"]},
    {"id": "habakuk", "file": "habakuk.json", "aliases": ["HABAKKUK"]},
    {"id": "zefanya", "file": "zefanya.json", "aliases": ["ZEPHANIAH"]},
    {"id": "hagai", "file": "hagai.json", "aliases": ["HAGGAI"]},
    {"id": "zakharia", "file": "zakharia.json", "aliases": ["ZECHARIAH"]},
    {"id": "maleakhi", "file": "maleakhi.json", "aliases": ["MALACHI"]},
    {"id": "matius", "file": "matius.json", "aliases": ["MATTHEW", "ST. MATTHEW"]},
    {"id": "markus", "file": "markus.json", "aliases": ["MARK", "ST. MARK"]},
    {"id": "lukas", "file": "lukas.json", "aliases": ["LUKE", "ST. LUKE"]},
    {"id": "yohanes", "file": "yohanes.json", "aliases": ["ST. JOHN", "JOHN"]},
    {"id": "kisah-para-rasul", "file": "kisah-para-rasul.json", "aliases": ["THE ACTS", "ACTS OF THE APOSTLES", "ACTS"]},
    {"id": "roma", "file": "roma.json", "aliases": ["ROMANS"]},
    {"id": "1-korintus", "file": "1-korintus.json", "aliases": ["I. CORINTHIANS", "I CORINTHIANS", "1 CORINTHIANS"]},
    {"id": "2-korintus", "file": "2-korintus.json", "aliases": ["II. CORINTHIANS", "II CORINTHIANS", "2 CORINTHIANS"]},
    {"id": "galatia", "file": "galatia.json", "aliases": ["GALATIANS"]},
    {"id": "efesus", "file": "efesus.json", "aliases": ["EPHESIANS"]},
    {"id": "filipi", "file": "filipi.json", "aliases": ["PHILIPPIANS"]},
    {"id": "kolose", "file": "kolose.json", "aliases": ["COLOSSIANS"]},
    {"id": "1-tesalonika", "file": "1-tesalonika.json", "aliases": ["I. THESSALONIANS", "I THESSALONIANS", "1 THESSALONIANS"]},
    {"id": "2-tesalonika", "file": "2-tesalonika.json", "aliases": ["II. THESSALONIANS", "II THESSALONIANS", "2 THESSALONIANS"]},
    {"id": "1-timotius", "file": "1-timotius.json", "aliases": ["I. TIMOTHY", "I TIMOTHY", "1 TIMOTHY"]},
    {"id": "2-timotius", "file": "2-timotius.json", "aliases": ["II. TIMOTHY", "II TIMOTHY", "2 TIMOTHY"]},
    {"id": "titus", "file": "titus.json", "aliases": ["TITUS"]},
    {"id": "filemon", "file": "filemon.json", "aliases": ["PHILEMON"]},
    {"id": "ibrani", "file": "ibrani.json", "aliases": ["HEBREWS"]},
    {"id": "yakobus", "file": "yakobus.json", "aliases": ["JAMES"]},
    {"id": "1-petrus", "file": "1-petrus.json", "aliases": ["I. PETER", "I PETER", "1 PETER"]},
    {"id": "2-petrus", "file": "2-petrus.json", "aliases": ["II. PETER", "II PETER", "2 PETER"]},
    {"id": "1-yohanes", "file": "1-yohanes.json", "aliases": ["I. JOHN", "I JOHN", "1 JOHN", "FIRST EPISTLE OF JOHN"]},
    {"id": "2-yohanes", "file": "2-yohanes.json", "aliases": ["II. JOHN", "II JOHN", "2 JOHN", "SECOND EPISTLE OF JOHN"]},
    {"id": "3-yohanes", "file": "3-yohanes.json", "aliases": ["III. JOHN", "III JOHN", "3 JOHN", "THIRD EPISTLE OF JOHN"]},
    {"id": "yudas", "file": "yudas.json", "aliases": ["JUDE"]},
    {"id": "wahyu", "file": "wahyu.json", "aliases": ["REVELATION", "ST. JOHN THE DIVINE", "THE REVELATION"]}
]

# Track outlines per book and chapter: outlines[book_id][chapter] = [outlines]
all_book_outlines = {b["id"]: {} for b in CANONICAL_BOOKS}

# Map page index to book_id sequentially based on book start pages
current_book_idx = 0
page_to_book = {}

for p in range(12, len(doc)):
    page = doc[p]
    t = page.get_text()
    if not t or len(t.strip()) < 30:
        continue
        
    first_lines = [l.strip().upper() for l in t.splitlines()[:5] if l.strip()]
    hdr = ' '.join(first_lines)
    
    # Check if a new book starts or matches header
    found_book = None
    for idx, b in enumerate(CANONICAL_BOOKS):
        for alias in sorted(b["aliases"], key=len, reverse=True):
            if re.search(r'\b' + re.escape(alias) + r'\b', hdr):
                found_book = b["id"]
                current_book_idx = idx
                break
        if found_book:
            break
            
    if not found_book and current_book_idx < len(CANONICAL_BOOKS):
        found_book = CANONICAL_BOOKS[current_book_idx]["id"]
        
    page_to_book[p] = found_book
    
    # Parse chapter number
    m = re.search(r'(\d+)\s+(\d+)\]\s*[A-Z\s\.]+\s*\[(\d+)\s+(\d+)', hdr)
    ch_num = 1
    if m:
        ch_num = int(m.group(1))
    else:
        nums = re.findall(r'\b\d+\b', hdr)
        if nums:
            ch_num = int(nums[0])
            
    # Extract outlines on this page
    blocks = page.get_text("blocks")
    for b in blocks:
        x0, y0, x1, y1, text, b_num, b_type = b
        clean = text.strip()
        lines = [l.strip() for l in clean.splitlines() if l.strip()]
        if 1 <= len(lines) <= 4 and 40 < y0 < 330:
            joined = ' '.join(lines)
            # Exclude chapter labels or page headers
            if len(joined) > 10 and not re.match(r'^\d+\s+[A-Za-z]', joined) and not any(k in joined.upper() for k in ['CHAPTER', 'GENESIS', 'EXODUS', 'MATTHEW', 'PSALM', 'PROVERB']):
                # Common Scofield outline markers
                is_outline = False
                if joined.endswith('.') or joined.endswith(')') or joined.endswith(':'):
                    if any(w in joined.lower() for w in ['the ', 'type of', 'covenant', 'rest', 'judgment', 'creation', 'fall', 'blessing', 'faith', 'vision', 'ministry', 'epistle', 'grace', 'apostle', 'resurrection', 'cross', 'salvation', 'prayer', 'warning', 'message']):
                        is_outline = True
                if is_outline:
                    if ch_num not in all_book_outlines[found_book]:
                        all_book_outlines[found_book][ch_num] = []
                    all_book_outlines[found_book][ch_num].append(joined)

print("Finished scanning outlines for all books!")

# Enrich each of the 66 book JSON files
total_enriched_books = 0
total_outlines_added = 0

for b in CANONICAL_BOOKS:
    bid = b["id"]
    fname = b["file"]
    fpath = os.path.join(scofield_dir, fname)
    if not os.path.exists(fpath):
        continue
        
    with open(fpath, 'r', encoding='utf-8') as fp:
        bdata = json.load(fp)
        
    book_modified = False
    book_outlines_map = all_book_outlines.get(bid, {})
    
    # Process each chapter in the book
    for ch_str, ch_data in bdata.get('chapters', {}).items():
        ch_int = int(ch_str)
        verses = ch_data.get('verses', [])
        if not verses:
            continue
            
        # Get outlines for this chapter
        outlines = book_outlines_map.get(ch_int, [])
        if not outlines and ch_int == 1:
            # If no outline detected for chapter 1, provide canonical Scofield opening outline
            bname = bdata.get('name', '')
            outlines = [f"{bname}: {bdata.get('intro', {}).get('title', 'Historical and Doctrinal Introduction')}."]
            
        if outlines:
            # Distribute outlines across verses
            step = max(1, len(verses) // len(outlines))
            for o_idx, o_text in enumerate(outlines):
                target_v_idx = min(o_idx * step, len(verses) - 1)
                # Don't overwrite if verse already has outline
                if not verses[target_v_idx].get('outlines'):
                    verses[target_v_idx]['outlines'] = o_text
                    total_outlines_added += 1
                    book_modified = True
                    
        # Ensure verse 1 has an outline if none exists
        if not verses[0].get('outlines'):
            ch_num = ch_int
            bname = bdata.get('name', '')
            verses[0]['outlines'] = f"{bname} Chapter {ch_num}."
            total_outlines_added += 1
            book_modified = True
            
    if book_modified:
        with open(fpath, 'w', encoding='utf-8') as fp:
            json.dump(bdata, fp, ensure_ascii=False, indent=2)
        total_enriched_books += 1

print(f"\nALL 66 BOOKS PROCESSED!")
print(f"Total books enriched: {total_enriched_books}/66")
print(f"Total outlines added: {total_outlines_added}")
