import sys
import re

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
file_path = r"D:\Magang\Baca\pdb\roti_hayat_full.txt"

with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    for cur, line in enumerate(f, 1):
        if 2048830 <= cur <= 2048950:
            s = line.strip()
            if s and s != '\xa0':
                print(f"L{cur}: {s}")
        elif cur > 2048950:
            break
