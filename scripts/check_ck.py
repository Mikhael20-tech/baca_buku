import os, sys, re
sys.path.append(r"D:\Magang\Baca\scripts")
from export_bible_json import BIBLE_BOOKS

with open(r"D:\Magang\Baca\pdb\roti_hayat_full.txt", "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

for b in BIBLE_BOOKS:
    s_idx = b['start'] - 1
    e_idx = b['end'] - 1
    slice_lines = lines[s_idx:e_idx]
    
    ck_lines = [i + s_idx + 1 for i, l in enumerate(slice_lines) if re.search(r'^\s*Catatan\s+[Kk]aki', l)]
    print(f"{b['name']:20s}: slice {b['start']:7d}-{b['end']:7d} | CK: {ck_lines[:2]} (total {len(ck_lines)})")
