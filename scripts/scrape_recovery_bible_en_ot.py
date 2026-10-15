import os
import sys
import json
import re
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from html import unescape

# Reconfigure stdout for UTF-8 on Windows
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'bible', 'en')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load mapped OT books from scratch_ot_mapped.json
MAPPED_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'scratch_ot_mapped.json')
with open(MAPPED_PATH, 'r', encoding='utf-8') as f:
    OT_BOOKS = json.load(f)

def fetch_with_retry(url, retries=3, delay=1):
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=20) as resp:
                return resp.read().decode('utf-8', errors='ignore')
        except Exception as e:
            if i == retries - 1:
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
        clean_block = re.sub(r'<strong class="verse_url">.*?</strong>', '', v_content, flags=re.DOTALL)
        clean_block = re.sub(r'<strong class="verse_name">.*?</strong>', '', clean_block, flags=re.DOTALL)

        # Replace anchor spans with footnotes
        marked = re.sub(r"<span class=['\"]anchor['\"]>\s*<sup>(.*?)</sup>\s*(.*?)\s*</span>", replace_anchor, clean_block, flags=re.DOTALL)
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

def parse_intro(desc_html, theme_html):
    intro = {}
    if theme_html:
        clean_theme = unescape(re.sub(r'<[^>]+>', ' ', theme_html))
        clean_theme = ' '.join(clean_theme.split())
        sub_match = re.search(r'Subject:\s*(.*)', clean_theme, re.IGNORECASE)
        if sub_match:
            intro['Subject'] = sub_match.group(1).strip()
        else:
            intro['Subject'] = clean_theme.strip()

    if desc_html:
        clean_desc = re.sub(r'<a[^>]*>(.*?)</a>', r'\1', desc_html)
        parts = re.findall(r'<strong>\s*(.*?):?\s*</strong>\s*(.*?)(?=<strong>|$)', clean_desc, re.DOTALL)
        for k, v in parts:
            clean_k = unescape(re.sub(r'<[^>]+>', '', k)).strip().rstrip(':')
            clean_v = unescape(re.sub(r'<[^>]+>', ' ', v))
            clean_v = ' '.join(clean_v.split()).strip()
            if clean_k and clean_v:
                intro[clean_k] = clean_v

    return intro

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
                if len(data.get('chapters', {})) == chapters_count and data.get('intro', {}).get('Subject'):
                    print(f"[SKIP] {book_name_en} already complete ({chapters_count} chs).")
                    return
        except:
            pass

    print(f"\n[START] Scraping {book_name_en} ({chapters_count} chapters)...")
    chapters_dict = {}

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(scrape_chapter, book_slug, ch): ch for ch in range(1, chapters_count + 1)}
        for future in as_completed(futures):
            ch_num = futures[future]
            try:
                ch_res, ch_data = future.result()
                if ch_data:
                    chapters_dict[str(ch_res)] = ch_data
                    print(f"  [OK] {book_name_en} {ch_res}/{chapters_count} (v: {len(ch_data['verses'])}, fn: {len(ch_data['footnotes'])})")
                else:
                    print(f"  [FAIL] {book_name_en} {ch_num} FAILED")
            except Exception as e:
                print(f"  [FAIL] {book_name_en} {ch_num} EXCEPTION: {e}")

    intro_dict = parse_intro(book_meta.get('description', ''), book_meta.get('theme', ''))

    book_json = {
        "id": book_id,
        "name": book_name_en,
        "name_id": book_meta['name_id'],
        "testament": "PL",
        "chapters_count": chapters_count,
        "intro": intro_dict,
        "chapters": dict(sorted(chapters_dict.items(), key=lambda x: int(x[0])))
    }

    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(book_json, f, ensure_ascii=False)

    print(f"[DONE] Saved {book_name_en} -> {target_path} (Size: {os.path.getsize(target_path) / 1024:.1f} KB)")

def update_books_index():
    books_index = []
    parent_books_path = os.path.join(os.path.dirname(OUTPUT_DIR), 'books.json')
    try:
        with open(parent_books_path, 'r', encoding='utf-8') as f:
            id_books = json.load(f)
    except:
        id_books = []

    all_en_map = {b['id']: b for b in OT_BOOKS}
    # Also include NT books
    nt_path = os.path.join(os.path.dirname(__file__), 'scrape_recovery_bible_en.py')
    # Use existing public/bible/en/books.json if present
    curr_en_path = os.path.join(OUTPUT_DIR, 'books.json')
    curr_en = []
    if os.path.exists(curr_en_path):
        with open(curr_en_path, 'r', encoding='utf-8') as f:
            curr_en = json.load(f)
        for b in curr_en:
            all_en_map[b['id']] = b

    for b in id_books:
        bid = b['id']
        if bid in all_en_map:
            books_index.append({
                "id": bid,
                "name": all_en_map[bid].get('name_en') or all_en_map[bid].get('name'),
                "name_id": b['name'],
                "testament": b['testament'],
                "chapters_count": b['chapters_count']
            })
        else:
            books_index.append(b)

    with open(os.path.join(OUTPUT_DIR, 'books.json'), 'w', encoding='utf-8') as f:
        json.dump(books_index, f, indent=2, ensure_ascii=False)
    print("[INDEX] Updated public/bible/en/books.json with all 66 books")

def main():
    start_time = time.time()
    print("=" * 60)
    print("HOLY BIBLE RECOVERY VERSION (ENGLISH) OT SCRAPER")
    print(f"Target directory: {OUTPUT_DIR}")
    print(f"Total OT Books: {len(OT_BOOKS)}")
    print("=" * 60)

    force = '--force' in sys.argv
    for b in OT_BOOKS:
        scrape_book(b, force=force)
        update_books_index()

    elapsed = time.time() - start_time
    print("\n" + "=" * 60)
    print(f"FINISHED ALL OLD TESTAMENT BOOKS IN {elapsed:.1f}s!")
    print("=" * 60)

if __name__ == '__main__':
    main()
