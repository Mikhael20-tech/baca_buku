import os
import sys
import json
import re
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from html import unescape

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
}

EN_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'bible', 'en')

# Load NT and OT books
from scrape_recovery_bible_en import NT_BOOKS

MAPPED_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'scratch_ot_mapped.json')
# If scratch_ot_mapped.json doesn't exist, we can reconstruct or load from scripts/map_ot_books
with open(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'bible', 'en', 'books.json'), 'r', encoding='utf-8') as f:
    ALL_BOOKS = json.load(f)

# Build slug map for all 66 books
# Load OT map from map_ot_books logic
SLUG_MAP = {
    'kejadian': 'genesis', 'keluaran': 'exodus', 'imamat': 'leviticus', 'bilangan': 'numbers', 'ulangan': 'deuteronomy',
    'yosua': 'joshua', 'hakim-hakim': 'judges', 'rut': 'ruth', '1-samuel': 'first-samuel', '2-samuel': 'second-samuel',
    '1-raja-raja': 'first-kings', '2-raja-raja': 'second-kings', '1-tawarikh': 'first-chronicles', '2-tawarikh': 'second-chronicles',
    'ezra': 'ezra', 'nehemia': 'nehemiah', 'ester': 'esther', 'ayub': 'job', 'mazmur': 'psalms', 'amsal': 'proverbs',
    'pengkhotbah': 'ecclesiastes', 'kidung-agung': 'song-of-songs', 'yesaya': 'isaiah', 'yeremia': 'jeremiah',
    'ratapan': 'lamentations', 'yehezkiel': 'ezekiel', 'daniel': 'daniel', 'hosea': 'hosea', 'yoel': 'joel',
    'amos': 'amos', 'obaja': 'obadiah', 'yunus': 'jonah', 'mikha': 'micah', 'nahum': 'nahum', 'habakuk': 'habakkuk',
    'zefanya': 'zephaniah', 'hagai': 'haggai', 'zakharia': 'zechariah', 'maleakhi': 'malachi',
    # NT
    'matius': 'the-gospel-according-to-matthew', 'markus': 'the-gospel-according-to-mark', 'lukas': 'the-gospel-according-to-luke',
    'yohanes': 'the-gospel-according-to-john', 'kisah-para-rasul': 'the-acts-of-the-apostles', 'roma': 'the-epistle-of-paul-to-the-romans',
    '1-korintus': 'the-first-epistle-of-paul-to-the-corinthians', '2-korintus': 'the-second-epistle-of-paul-to-the-corinthians',
    'galatia': 'the-epistle-of-paul-to-the-galatians', 'efesus': 'the-epistle-of-paul-to-the-ephesians',
    'filipi': 'the-epistle-of-paul-to-the-philippians', 'kolose': 'the-epistle-of-paul-to-the-colossians',
    '1-tesalonika': 'the-first-epistle-of-paul-to-the-thessalonians', '2-tesalonika': 'the-second-epistle-of-paul-to-the-thessalonians',
    '1-timotius': 'the-first-epistle-of-paul-to-timothy', '2-timotius': 'the-second-epistle-of-paul-to-timothy',
    'titus': 'the-epistle-of-paul-to-titus', 'filemon': 'the-epistle-of-paul-to-philemon', 'ibrani': 'the-epistle-to-the-hebrews',
    'yakobus': 'the-epistle-of-james', '1-petrus': 'the-first-epistle-of-peter', '2-petrus': 'the-second-epistle-of-peter',
    '1-yohanes': 'the-first-epistle-of-john', '2-yohanes': 'the-second-epistle-of-john', '3-yohanes': 'the-third-epistle-of-john',
    'yudas': 'the-epistle-of-jude', 'wahyu': 'revelation'
}

def fetch_chapter_outlines(book_slug, ch_num):
    v_url = f"https://bibleread.online/bible/{book_slug}/{ch_num}/"
    for _ in range(3):
        try:
            req = urllib.request.Request(v_url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=15) as resp:
                v_html = resp.read().decode('utf-8', errors='ignore')
                break
        except:
            time.sleep(1)
            v_html = ""

    if not v_html:
        return ch_num, {}, []

    tokens = re.finditer(
        r'<div class="planPoint">.*?<span class="notation">([^<]+)</span>.*?<span class="text">([^<]+)</span>.*?<span class="spread">([^<]+)</span>.*?</div>|<div class="verse_text jVerse" data-num="(\d+)">',
        v_html,
        re.DOTALL
    )

    pending_outlines = []
    verse_outlines_map = {}
    chapter_outlines = []

    for m in tokens:
        if m.group(1):
            notat = unescape(m.group(1)).strip()
            txt = unescape(m.group(2)).strip()
            sprd = unescape(m.group(3)).strip()
            otl_text = ' '.join(f"{notat} {txt} ({sprd})".split())
            pending_outlines.append(otl_text)
        elif m.group(4):
            v_num = int(m.group(4))
            if pending_outlines:
                verse_outlines_map[v_num] = list(pending_outlines)
                for o in pending_outlines:
                    chapter_outlines.append({'verse': v_num, 'text': o})
                pending_outlines = []

    return ch_num, verse_outlines_map, chapter_outlines

def fix_book(book_id):
    slug = SLUG_MAP.get(book_id)
    if not slug:
        print(f"No slug for {book_id}")
        return

    json_path = os.path.join(EN_DIR, f"{book_id}.json")
    if not os.path.exists(json_path):
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    ch_keys = list(data.get('chapters', {}).keys())
    if not ch_keys:
        return

    # Use thread pool to fetch chapters
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(fetch_chapter_outlines, slug, int(ch)): str(ch) for ch in ch_keys}
        for future in as_completed(futures):
            ch_str = futures[future]
            ch_num, v_map, ch_outlines = future.result()
            if ch_str in data['chapters']:
                ch_obj = data['chapters'][ch_str]
                for v in ch_obj.get('verses', []):
                    v['outlines'] = v_map.get(v['verse'], None)
                ch_obj['outlines'] = ch_outlines

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)

    print(f"[OK] Fixed outlines for {book_id} ({len(ch_keys)} chs)")

def main():
    start = time.time()
    print("=" * 60)
    print("DISTRIBUTING OUTLINES PER-VERSE FOR ALL 66 BOOKS")
    print("=" * 60)

    for b in ALL_BOOKS:
        fix_book(b['id'])

    print(f"\nFINISHED ALL 66 BOOKS IN {time.time() - start:.1f}s!")

if __name__ == '__main__':
    main()
