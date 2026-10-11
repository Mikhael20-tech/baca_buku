import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
file_path = r"D:\Magang\Baca\pdb\roti_hayat_full.txt"

with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    for cur, line in enumerate(f, 1):
        if 401130 <= cur <= 401260:
            s = line.strip()
            if s and s != '\xa0':
                print(f"L{cur}: {repr(s)}")
        elif cur > 401260:
            break
