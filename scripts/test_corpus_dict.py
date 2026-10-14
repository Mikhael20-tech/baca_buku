import re

# Load all words from roti_hayat_full.txt that have frequency >= 5
# This represents all valid words in the Bible corpus!
with open(r'd:\Magang\Baca\pdb\roti_hayat_full.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Build frequency map of words
raw_tokens = re.findall(r'\b[a-z]{2,}\b', text.lower())
freq = {}
for t in raw_tokens:
    freq[t] = freq.get(t, 0) + 1

# A valid Indonesian Bible word is any word with freq >= 5 in the corpus,
# OR standard Indonesian dictionary words.
print(f"Total tokens counted: {len(raw_tokens)}")
print(f"Total unique words: {len(freq)}")
valid_words = {w for w, c in freq.items() if c >= 5}
print(f"Words with freq >= 5: {len(valid_words)}")

# Check our target words
for test_w in ['ditunjukkan', 'bangsa', 'abangsa', 'kilat', 'akilat', 'putih', 'bputih', 'bukit', 'ukit', 'baptislah', 'aptislah', 'ajarlah', 'jarlah', 'fajar', 'ajar', 'gempa', 'empa']:
    print(f"  {test_w}: freq={freq.get(test_w, 0)}, isValid={test_w in valid_words}")
