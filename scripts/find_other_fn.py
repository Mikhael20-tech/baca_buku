import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
file_path = r"D:\Magang\Baca\pdb\roti_hayat_full.txt"

with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    for cur, line in enumerate(f, 1):
        s = line.strip()
        if "Catatan Kaki" in s and any(b in s for b in ["Markus", "Lukas", "Yohanes", "Roma"]):
            print(f"L{cur}: {s}")
