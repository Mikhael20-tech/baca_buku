import os
import sys
import json
import re
import urllib.request
from html import unescape

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
}

def replace_anchor(m):
    sup_content = m.group(1)
    word = m.group(2)
    digits = re.findall(r'\d+', sup_content)
    if digits:
        return f"{word}<fn n=\"{digits[0]}\"/>"
    return word

def fix_book_outlines(book_slug, json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for ch_str, ch_data in data['chapters'].items():
        ch_num = int(ch_str)
        v_url = f"https://bibleread.online/bible/{book_slug}/{ch_num}/"
        try:
            req = urllib.request.Request(v_url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=15) as resp:
                v_html = resp.read().decode('utf-8', errors='ignore')
        except Exception as e:
            print(f"Failed to fetch {v_url}: {e}")
            continue

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

        # Update verses in ch_data
        for v in ch_data['verses']:
            v_num = v['verse']
            v['outlines'] = verse_outlines_map.get(v_num, None)

        ch_data['outlines'] = chapter_outlines
        print(f"  Fixed {book_slug} ch {ch_num} (outlines distributed to verses: {list(verse_outlines_map.keys())})")

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)
    print(f"Saved fixed outlines to {json_path}")

if __name__ == '__main__':
    fix_book_outlines('mark', 'public/bible/en/markus.json')
