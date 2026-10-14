import sys
import glob
import json
import re

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

all_jsons = glob.glob('public/bible/*.json')
count = 0
for p in all_jsons:
    if p.endswith('books.json'): continue
    with open(p, 'r', encoding='utf-8') as f:
        d = json.load(f)
    book_name = d.get('name', p)
    for ch_num, ch in d.get('chapters', {}).items():
        for v in ch.get('verses', []):
            txt = v.get('text', '')
            # Look for digits attached to letters
            m = re.findall(r'(?:[^\w\d]|^)(\d+[a-zA-Z]+)', txt)
            if m:
                count += 1
                print(f"{book_name:18s} {ch_num:>3s}:{v.get('verse'):<3d} -> {m}")

print(f"\nTotal stuck digit verses: {count}")
