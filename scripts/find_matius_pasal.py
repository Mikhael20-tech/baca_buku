import sys
import re

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
file_path = r"D:\Magang\Baca\pdb\roti_hayat_full.txt"

print("Finding Matius chapter line boundaries in 401057 - 411175...")
pasal_lines = []
with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    for cur, line in enumerate(f, 1):
        if 401057 <= cur <= 411175:
            s = line.strip()
            # Match "PASAL 1", "PASAL 2", etc.
            m = re.match(r'^PASAL\s+(\d+)$', s, re.IGNORECASE)
            if m:
                pasal_lines.append((int(m.group(1)), cur, s))
        elif cur > 411175:
            break

print(f"Found {len(pasal_lines)} PASAL markers:")
for p_num, line_no, text in pasal_lines:
    print(f"  Pasal {p_num}: Line {line_no}")
