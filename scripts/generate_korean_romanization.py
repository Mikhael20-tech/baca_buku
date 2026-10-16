import json
import time
from korean_romanizer.romanizer import Romanizer
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

JSON_IN_PATH = r'd:\Magang\Baca\public\kidung\kidung_data.json'
DIST_OUT_PATH = r'd:\Magang\Baca\dist\kidung\kidung_data.json'

def romanize_text(text):
    if not text or not text.strip():
        return ""
    try:
        r = Romanizer(text.strip())
        return r.romanize().strip()
    except Exception as e:
        return text.strip()

def main():
    print("Loading kidung_data.json...")
    t0 = time.time()
    with open(JSON_IN_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    total_processed = 0

    print("Generating Romanization for Korean songs (ko)...")
    for pool_name, pool in [("Kidung", data['kidung']), ("Suplemen", data['suplemen'])]:
        for song in pool:
            languages = song.get('languages', {})
            if 'ko' in languages:
                item = languages['ko']
                # Title
                title = item.get('title', '')
                item['romanTitle'] = romanize_text(title)
                
                # Stanzas
                for st in item.get('stanzas', []):
                    lines = st.get('lines', [])
                    st['romanLines'] = [romanize_text(l) for l in lines]
                
                total_processed += 1

    print(f"Generated Romanization for {total_processed} Korean songs in {time.time()-t0:.2f}s.")

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
