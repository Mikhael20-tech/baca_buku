import sys
import re

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
file_path = r"D:\Magang\Baca\pdb\roti_hayat_full.txt"

all_lines = []
with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    for line in f:
        all_lines.append(line)

print(f"Total lines: {len(all_lines):,}")

# Part 1 (Verses): lines 401115 to 405890
# Part 2 (Footnotes): lines 405895 to 411175
# Let's inspect Pasal 4 footnotes lines 405937 to 406115
print("--- Footnotes of Pasal 4 sample ---")
for cur in range(405937, 405970):
    s = all_lines[cur-1].strip()
    if s and s != '\xa0':
        print(f"L{cur}: {s}")
