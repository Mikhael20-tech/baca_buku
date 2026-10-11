import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
file_path = r"D:\Magang\Baca\pdb\roti_hayat_full.txt"

print("Searching where Gospels and Epistles with Footnotes are located...")
# We know Matius footnotes are at 401057-411175
# What about Markus, Lukas, Yohanes, Kisah, Roma, etc.?
# Let's search for "INJIL MARKUS" across the whole file
with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    for cur, line in enumerate(f, 1):
        s = line.strip()
        if s.startswith("INJIL MARKUS") or s.startswith("Injil Markus") or s == "MARKUS":
            print(f"L{cur}: {s}")
