import json
import re
import time
import pypinyin
from korean_romanizer.romanizer import Romanizer
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

JSON_IN_PATH = r'd:\Magang\Baca\public\kidung\kidung_data.json'
DIST_OUT_PATH = r'd:\Magang\Baca\dist\kidung\kidung_data.json'

def clean_pinyin_line(line_hanzi):
    if not line_hanzi or not line_hanzi.strip():
        return ""
    # Generate pinyin with tones
    pinyin_parts = pypinyin.lazy_pinyin(line_hanzi, style=pypinyin.Style.TONE)
    raw = ' '.join(pinyin_parts)
    # Remove awkward spaces before punctuation marks
    cleaned = re.sub(r'\s+([，。！？、；：,!?~…])', r'\1', raw)
    return cleaned.strip()

def clean_korean_roman_line(line_korean):
    if not line_korean or not line_korean.strip():
        return ""
    try:
        raw = Romanizer(line_korean.strip()).romanize()
        return raw.strip()
    except Exception as e:
        return ""

def main():
    print("Loading kidung_data.json...")
    t0 = time.time()
    with open(JSON_IN_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    total_chinese = 0
    total_korean = 0

    print("Generating Pinyin for Chinese songs (zh and zht)...")
    for pool_name, pool in [("Kidung", data['kidung']), ("Suplemen", data['suplemen'])]:
        for song in pool:
            languages = song.get('languages', {})
            for lk in ['zh', 'zht']:
                if lk in languages:
                    item = languages[lk]
                    title = item.get('title', '')
                    item['pinyinTitle'] = clean_pinyin_line(title)
                    for st in item.get('stanzas', []):
                        lines = st.get('lines', [])
                        st['pinyinLines'] = [clean_pinyin_line(l) for l in lines]
                    total_chinese += 1

    print(f"Generated Pinyin for {total_chinese} Chinese songs.")

    print("Generating Romanization for Korean songs (ko)...")
    for pool_name, pool in [("Kidung", data['kidung']), ("Suplemen", data['suplemen'])]:
        for song in pool:
            languages = song.get('languages', {})
            if 'ko' in languages:
                item = languages['ko']
                title = item.get('title', '')
                item['romanTitle'] = clean_korean_roman_line(title)
                for st in item.get('stanzas', []):
                    lines = st.get('lines', [])
                    st['romanLines'] = [clean_korean_roman_line(l) for l in lines]
                total_korean += 1

    print(f"Generated Romanization for {total_korean} Korean songs.")
    print(f"Total processing completed in {time.time()-t0:.2f}s.")

    # Save compact json
    print(f"Writing to {JSON_IN_PATH}...")
    with open(JSON_IN_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))

    size_mb = os.path.getsize(JSON_IN_PATH) / (1024 * 1024)
    print(f"Updated {JSON_IN_PATH} ({size_mb:.2f} MB)")

    if os.path.exists(os.path.dirname(DIST_OUT_PATH)):
        print(f"Writing to {DIST_OUT_PATH}...")
        with open(DIST_OUT_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
        print("Updated dist copy.")

if __name__ == '__main__':
    main()
