# scripts/scrape_recovery_bible_en.py
import urllib.request
import re
import json
import os
import sys
import time
from html import unescape
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    if sys.stdout.encoding.lower() != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

NT_BOOKS = [
    {"id": "matius", "name_id": "Matius", "name_en": "Matthew", "slug": "the-gospel-according-to-matthew", "chapters": 28},
    {"id": "markus", "name_id": "Markus", "name_en": "Mark", "slug": "the-gospel-according-to-mark", "chapters": 16},
    {"id": "lukas", "name_id": "Lukas", "name_en": "Luke", "slug": "the-gospel-according-to-luke", "chapters": 24},
    {"id": "yohanes", "name_id": "Yohanes", "name_en": "John", "slug": "the-gospel-according-to-john", "chapters": 21},
    {"id": "kisah-para-rasul", "name_id": "Kisah Para Rasul", "name_en": "Acts", "slug": "the-acts-of-the-apostles", "chapters": 28},
    {"id": "roma", "name_id": "Roma", "name_en": "Romans", "slug": "the-epistle-of-paul-to-the-romans", "chapters": 16},
    {"id": "1-korintus", "name_id": "1 Korintus", "name_en": "1 Corinthians", "slug": "the-first-epistle-of-paul-to-the-corinthians", "chapters": 16},
    {"id": "2-korintus", "name_id": "2 Korintus", "name_en": "2 Corinthians", "slug": "the-second-epistle-of-paul-to-the-corinthians", "chapters": 13},
    {"id": "galatia", "name_id": "Galatia", "name_en": "Galatians", "slug": "the-epistle-of-paul-to-the-galatians", "chapters": 6},
    {"id": "efesus", "name_id": "Efesus", "name_en": "Ephesians", "slug": "the-epistle-of-paul-to-the-ephesians", "chapters": 6},
    {"id": "filipi", "name_id": "Filipi", "name_en": "Philippians", "slug": "the-epistle-of-paul-to-the-philippians", "chapters": 4},
    {"id": "kolose", "name_id": "Kolose", "name_en": "Colossians", "slug": "the-epistle-of-paul-to-the-colossians", "chapters": 4},
    {"id": "1-tesalonika", "name_id": "1 Tesalonika", "name_en": "1 Thessalonians", "slug": "the-first-epistle-of-paul-to-the-thessalonians", "chapters": 5},
    {"id": "2-tesalonika", "name_id": "2 Tesalonika", "name_en": "2 Thessalonians", "slug": "the-second-epistle-of-paul-to-the-thessalonians", "chapters": 3},
    {"id": "1-timotius", "name_id": "1 Timotius", "name_en": "1 Timothy", "slug": "the-first-epistle-of-paul-to-timothy", "chapters": 6},
    {"id": "2-timotius", "name_id": "2 Timotius", "name_en": "2 Timothy", "slug": "the-second-epistle-of-paul-to-timothy", "chapters": 4},
    {"id": "titus", "name_id": "Titus", "name_en": "Titus", "slug": "the-epistle-of-paul-to-titus", "chapters": 3},
    {"id": "filemon", "name_id": "Filemon", "name_en": "Philemon", "slug": "the-epistle-of-paul-to-philemon", "chapters": 1},
    {"id": "ibrani", "name_id": "Ibrani", "name_en": "Hebrews", "slug": "the-epistle-to-the-hebrews", "chapters": 13},
    {"id": "yakobus", "name_id": "Yakobus", "name_en": "James", "slug": "the-epistle-of-james", "chapters": 5},
    {"id": "1-petrus", "name_id": "1 Petrus", "name_en": "1 Peter", "slug": "the-first-epistle-of-peter", "chapters": 5},
    {"id": "2-petrus", "name_id": "2 Petrus", "name_en": "2 Peter", "slug": "the-second-epistle-of-peter", "chapters": 3},
    {"id": "1-yohanes", "name_id": "1 Yohanes", "name_en": "1 John", "slug": "the-first-epistle-of-john", "chapters": 5},
    {"id": "2-yohanes", "name_id": "2 Yohanes", "name_en": "2 John", "slug": "the-second-epistle-of-john", "chapters": 1},
    {"id": "3-yohanes", "name_id": "3 Yohanes", "name_en": "3 John", "slug": "the-third-epistle-of-john", "chapters": 1},
    {"id": "yudas", "name_id": "Yudas", "name_en": "Jude", "slug": "the-epistle-of-jude", "chapters": 1},
    {"id": "wahyu", "name_id": "Wahyu", "name_en": "Revelation", "slug": "revelation", "chapters": 22},
]

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'bible', 'en')
os.makedirs(OUTPUT_DIR, exist_ok=True)

def fetch_with_retry(url, retries=3, delay=1):
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=20) as resp:
                return resp.read().decode('utf-8', errors='ignore')
        except Exception as e:
            if i == retries - 1:
                print(f"  [ERROR] Failed to fetch {url}: {e}")
                return ""
            time.sleep(delay * (i + 1))
    return ""

def replace_anchor(m):
    sup_content = m.group(1)
    word = m.group(2)
    digits = re.findall(r'\d+', sup_content)
    if digits:
        return f"{word}<fn n=\"{digits[0]}\"/>"
    return word

def scrape_chapter(book_slug, ch_num):
    v_url = f"https://bibleread.online/bible/{book_slug}/{ch_num}/"
    n_url = f"https://bibleread.online/note/{book_slug}/{ch_num}/"

    v_html = fetch_with_retry(v_url)
    n_html = fetch_with_retry(n_url)

    if not v_html:
        return ch_num, None

    # 1. Parse Outlines
    outlines = []
    plan_matches = re.findall(
        r'<div class="planPoint">.*?<span class="notation">([^<]+)</span>.*?<span class="text">([^<]+)</span>.*?<span class="spread">([^<]+)</span>',
        v_html,
        re.DOTALL
    )
    for notat, txt, sprd in plan_matches:
        clean_txt = ' '.join(f"{unescape(notat)} {unescape(txt)} ({unescape(sprd)})".split())
        outlines.append({
            'verse': 1,
            'text': clean_txt
        })

    # 2. Parse Verses
    verse_blocks = re.findall(r'<div class="verse_text jVerse" data-num="(\d+)">(.*?)</div>', v_html, re.DOTALL)
    parsed_verses = []
    for v_num_str, v_content in verse_blocks:
        v_num = int(v_num_str)
        # Remove verse url/name headers
        clean_block = re.sub(r'<strong class="verse_url">.*?</strong>', '', v_content, flags=re.DOTALL)
        clean_block = re.sub(r'<strong class="verse_name">.*?</strong>', '', clean_block, flags=re.DOTALL)

        # Replace anchor spans with footnotes
        marked = re.sub(r"<span class=['\"]anchor['\"]>\s*<sup>(.*?)</sup>\s*(.*?)\s*</span>", replace_anchor, clean_block)
        # Remove remaining HTML tags but PRESERVE <fn n="..."/>
        marked = re.sub(r'<(?!/?fn\b)[^>]+>', ' ', marked)
        marked = unescape(marked)
        marked = ' '.join(marked.split())
        marked = re.sub(r'\s+([,.:;?!])', r'\1', marked)

        # Clean plain text
        plain = re.sub(r'<fn n="\d+"/>', '', marked)
        plain = ' '.join(plain.split())
        plain = re.sub(r'\s+([,.:;?!])', r'\1', plain)

        parsed_verses.append({
            'verse': v_num,
            'text': plain,
            'marked_text': marked,
            'outlines': [o['text'] for o in outlines] if (v_num == 1 and outlines) else None
        })

    # 3. Parse Footnotes & References
    all_notes = re.findall(r'<li class="jNote" data-anchor="([^"]+)">(.*?)</li>', n_html, re.DOTALL)
    parsed_notes = []
    for anchor, body in all_notes:
        parts = anchor.split('_')
        if len(parts) < 3:
            continue
        v_num = int(parts[1])
        idx_str = parts[2]
        digits = re.findall(r'\d+', idx_str)
        if not digits:
            continue
        note_idx = int(digits[0])

        kw_match = re.search(r'<b>\s*<a[^>]*>\d+:\d+</a>\s*</b><sup>.*?</sup>\s*<b>([^<]+)</b>', body)
        kw = unescape(kw_match.group(1)).strip() if kw_match else ""

        txt_match = re.search(r'<div class="text">(.*?)</div>', body, re.DOTALL)
        ref_match = re.search(r'<div class="reference">(.*?)</div>', body, re.DOTALL)

        txt = unescape(re.sub(r'<[^>]+>', ' ', txt_match.group(1))).strip() if txt_match else ""
        txt = ' '.join(txt.split())

        ref = unescape(re.sub(r'<[^>]+>', ' ', ref_match.group(1))).strip() if ref_match else ""
        ref = ' '.join(ref.split())

        combined = ""
        if txt and ref:
            combined = f"{txt}\n\nRef: {ref}"
        elif txt:
            combined = txt
        elif ref:
            combined = f"Ref: {ref}"

        if not combined:
            continue

        parsed_notes.append({
            'verse': v_num,
            'note_idx': note_idx,
            'keyword': kw,
            'text': combined
        })

    return ch_num, {
        'chapter': ch_num,
        'outlines': outlines,
        'verses': parsed_verses,
        'footnotes': parsed_notes
    }

def scrape_book(book_meta, force=False):
    book_id = book_meta['id']
    book_name_en = book_meta['name_en']
    book_slug = book_meta['slug']
    chapters_count = book_meta['chapters']
    target_path = os.path.join(OUTPUT_DIR, f"{book_id}.json")

    # If already scraped and valid, skip
    if not force and os.path.exists(target_path) and os.path.getsize(target_path) > 10000:
        try:
            with open(target_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if len(data.get('chapters', {})) == chapters_count:
                    print(f"[SKIP] {book_name_en} already complete ({chapters_count} chs).")
                    return
        except:
            pass

    print(f"\n[START] Scraping {book_name_en} ({chapters_count} chapters)...")
    chapters_dict = {}

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(scrape_chapter, book_slug, ch): ch for ch in range(1, chapters_count + 1)}
        for future in as_completed(futures):
            ch_num = futures[future]
            try:
                ch_res, ch_data = future.result()
                if ch_data:
                    chapters_dict[str(ch_res)] = ch_data
                    print(f"  [OK] {book_name_en} {ch_res}/{chapters_count} (verses: {len(ch_data['verses'])}, notes: {len(ch_data['footnotes'])})")
                else:
                    print(f"  [FAIL] {book_name_en} {ch_num} FAILED")
            except Exception as e:
                print(f"  [FAIL] {book_name_en} {ch_num} EXCEPTION: {e}")

    book_json = {
        "id": book_id,
        "name": book_name_en,
        "name_id": book_meta['name_id'],
        "testament": "PB",
        "chapters_count": chapters_count,
        "intro": {
            "Language": "English (Holy Bible Recovery Version)",
            "Translation": "Recovery Version with Footnotes & Outlines"
        },
        "chapters": dict(sorted(chapters_dict.items(), key=lambda x: int(x[0])))
    }

    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(book_json, f, ensure_ascii=False)

    print(f"[DONE] Saved {book_name_en} -> {target_path} (Size: {os.path.getsize(target_path) / 1024:.1f} KB)")

def main():
    start_time = time.time()
    print("=" * 60)
    print("HOLY BIBLE RECOVERY VERSION (ENGLISH) NT SCRAPER")
    print(f"Target directory: {OUTPUT_DIR}")
    print(f"Total NT Books: {len(NT_BOOKS)}")
    print("=" * 60)

    force = '--force' in sys.argv
    # Scrape books one by one (with multi-threaded chapters per book)
    for b in NT_BOOKS:
        scrape_book(b, force=force)

    # Generate books.json in public/bible/en/books.json
    books_index = []
    parent_books_path = os.path.join(os.path.dirname(OUTPUT_DIR), 'books.json')
    try:
        with open(parent_books_path, 'r', encoding='utf-8') as f:
            id_books = json.load(f)
    except:
        id_books = []

    nt_meta_map = {b['id']: b for b in NT_BOOKS}
    for b in id_books:
        bid = b['id']
        if bid in nt_meta_map:
            books_index.append({
                "id": bid,
                "name": nt_meta_map[bid]['name_en'],
                "name_id": nt_meta_map[bid]['name_id'],
                "testament": "PB",
                "chapters_count": nt_meta_map[bid]['chapters']
            })
        else:
            books_index.append(b)

    with open(os.path.join(OUTPUT_DIR, 'books.json'), 'w', encoding='utf-8') as f:
        json.dump(books_index, f, indent=2, ensure_ascii=False)

    elapsed = time.time() - start_time
    print("\n" + "=" * 60)
    print(f"FINISHED ALL NEW TESTAMENT BOOKS IN {elapsed:.1f}s!")
    print("=" * 60)

if __name__ == '__main__':
    main()
