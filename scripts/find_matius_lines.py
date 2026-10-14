with open(r'd:\Magang\Baca\pdb\roti_hayat_full.txt', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

print(f"Total lines in file: {len(lines)}")

# Let's search for lines containing 'PASAL 28' and 'Kesebelas murid itu'
for idx, l in enumerate(lines):
    if 'Kesebelas murid itu' in l:
        print(f"Found 'Kesebelas murid itu' at line {idx+1}: {repr(l[:80])}")
