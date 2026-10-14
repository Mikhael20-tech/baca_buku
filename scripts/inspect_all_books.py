import os
import sys
import re

file_path = r"D:\Magang\Baca\pdb\roti_hayat_full.txt"
from export_bible_json import BIBLE_BOOKS

print(f"Loading text to inspect {len(BIBLE_BOOKS)} books...")
with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    all_lines = f.readlines()

print(f"Total lines: {len(all_lines):,}")

results = []
for b in BIBLE_BOOKS:
    raw = all_lines[b['start']-1 : b['end']-1]
    fn_idx = None
    for idx, l in enumerate(raw):
        if re.search(r'^\s*Catatan\s+[Kk]aki', l, re.IGNORECASE):
            fn_idx = idx
            break
    results.append((b['id'], b['name'], b['testament'], len(raw), fn_idx))

print(f"{'Book':20s} | {'Testament':4s} | {'Lines':6s} | {'FN Line Index':13s}")
print("-" * 55)
for r in results:
    fn_str = str(r[4]) if r[4] is not None else "NO FN FOUND"
    print(f"{r[1]:20s} | {r[2]:4s} | {r[3]:6d} | {fn_str}")
