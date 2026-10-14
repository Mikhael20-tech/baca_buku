import re

with open(r'd:\Magang\Baca\pdb\roti_hayat_full.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Let's find words in clean text where words appear without cross refs or digits
# For instance, words that appear frequently
all_words = re.findall(r'\b[a-z]{3,}\b', text.lower())
word_freq = {}
for w in all_words:
    word_freq[w] = word_freq.get(w, 0) + 1

print(f"Total distinct lowercase words (length >= 3): {len(word_freq)}")
print("ditunjukkan freq:", word_freq.get('ditunjukkan', 0))
print("bangsa freq:", word_freq.get('bangsa', 0))
print("abangsa freq:", word_freq.get('abangsa', 0))
print("kilat freq:", word_freq.get('kilat', 0))
print("akilat freq:", word_freq.get('akilat', 0))
print("putih freq:", word_freq.get('putih', 0))
print("bputih freq:", word_freq.get('bputih', 0))
print("bukit freq:", word_freq.get('bukit', 0))
print("ukit freq:", word_freq.get('ukit', 0))
print("baptislah freq:", word_freq.get('baptislah', 0))
print("aptislah freq:", word_freq.get('aptislah', 0))
print("ajarlah freq:", word_freq.get('ajarlah', 0))
print("jarlah freq:", word_freq.get('jarlah', 0))
