import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
file_path = r"D:\Magang\Baca\pdb\roti_hayat_full.txt"

print("Checking books in lines 401057 - 682000...")
books_to_check = [
    "INJIL MATIUS", "INJIL MARKUS", "INJIL LUKAS", "INJIL YOHANES",
    "KISAH PARA RASUL", "ROMA", "WAHYU"
]

with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    for cur, line in enumerate(f, 1):
        if 401050 <= cur <= 682000:
            s = line.strip().upper()
            for b in books_to_check:
                if s == b or s == f"SURAT {b}" or s == f"KITAB {b}":
                    print(f"L{cur}: {s}")
        elif cur > 682000:
            break
