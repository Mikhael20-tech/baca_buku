import re
from collections import Counter

with open(r'd:\Magang\Baca\pdb\roti_hayat_full.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Let's search for \d+[a-z][A-Za-z]+ in the text
matches = re.findall(r'(?:^|\s)(\d{1,2})([a-z])([A-Za-z]+)', text)
print(f"Total matches of \\d+[a-z][A-Za-z]+ : {len(matches)}")

# Let's see samples of these matches
counter = Counter()
for num, letter, word in matches:
    full_cand = letter + word
    counter[(letter, full_cand[:10])] += 1

print("\nTop 50 occurrences:")
for (letter, cand), count in counter.most_common(50):
    print(f"  {letter} + {cand}: {count}")
