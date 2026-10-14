import re

with open(r'd:\Magang\Baca\pdb\roti_hayat_full.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Find MATIUS and PASAL 28
mat_idx = text.find('MATIUS')
p28_idx = text.find('PASAL 28', mat_idx)
print("=== MATIUS 28 RAW ===")
print(text[p28_idx:p28_idx+3000])
