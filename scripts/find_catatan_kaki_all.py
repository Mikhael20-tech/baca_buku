import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
file_path = r"D:\Magang\Baca\pdb\roti_hayat_full.txt"

print("Searching for 'Catatan Kaki' across entire file...")
matches = []
with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    for cur, line in enumerate(f, 1):
        s = line.strip()
        if "Catatan Kaki" in s:
            matches.append((cur, s))

print(f"Total 'Catatan Kaki' occurrences: {len(matches)}")
# Group matches by 10,000 line intervals
from collections import defaultdict
grouped = defaultdict(int)
for cur, _ in matches:
    grouped[cur // 50000] += 1

for k in sorted(grouped.keys()):
    print(f"Lines {k*50000} - {(k+1)*50000}: {grouped[k]} hits")
