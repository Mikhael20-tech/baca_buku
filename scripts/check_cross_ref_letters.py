import re

with open(r'd:\Magang\Baca\pdb\roti_hayat_full.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Let's see all single letters between digit and lowercase word:
# e.g. \d+([a-z])([a-z]{3,})
matches = re.findall(r'\b\d+([a-z])([a-z]{3,})\b', text)
letter_counts = {}
for l, w in matches:
    letter_counts[l] = letter_counts.get(l, 0) + 1

print("Single letters following digits before words:")
for l in sorted(letter_counts.keys()):
    print(f"  {l}: {letter_counts[l]}")
