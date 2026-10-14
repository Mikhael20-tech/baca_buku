import re

with open(r'd:\Magang\Baca\pdb\roti_hayat_full.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Build frequency map
raw_tokens = re.findall(r'\b[a-zA-Z]{2,}\b', text)
freq = {}
for t in raw_tokens:
    low = t.lower()
    freq[low] = freq.get(low, 0) + 1

# Let's test marker parsing
def test_parse_marker(num_str, letter, word):
    if not letter:
        return int(num_str), "", word
    
    # 1. Capitalized -> letter is cross-ref
    if re.match(r'^[A-Z]', word):
        return int(num_str), letter, word
        
    cand_full = letter + word
    w_low = word.lower()
    c_low = cand_full.lower()
    
    # If cand_full starts with affix (ber, ter, di, me, pe, ke, se):
    # e.g. 1berbicara, 1dilahirkan, 1menyerahkan
    # but not if letter + affix (e.g. 2cmenyertai -> c + menyertai)
    
    # Let's compare freq[c_low] vs freq[w_low]
    c_freq = freq.get(c_low, 0)
    w_freq = freq.get(w_low, 0)
    
    # Specific known cases where w_low is not a standalone Indonesian word or c_low is the intended word:
    # ukit -> bukit
    # aptislah -> baptislah
    # jarlah -> ajarlah
    # empa -> gempa
    # ajar in 'fajar'
    # alam in 'dalam'
    if w_low in ('ukit', 'aptislah', 'jarlah', 'empa'):
        return int(num_str), "", cand_full
        
    if c_low in ('bukit', 'baptislah', 'baptis', 'baptisan', 'ajarlah', 'gempa', 'fajar', 'dalam', 'emas'):
        return int(num_str), "", cand_full
        
    # If w_low is a frequent word and c_low is rare/nonexistent:
    # e.g. hari (freq=6000) vs bhari (freq=1) -> letter is cross_ref
    # e.g. saudara (freq=1500) vs asaudara (freq=1) -> letter is cross_ref
    # e.g. menyertai (freq=120) vs cmenyertai (freq=0) -> letter is cross_ref
    # e.g. kepada (freq=8000) vs dkepada (freq=1) -> letter is cross_ref
    if w_freq > 20 and c_freq < 5:
        return int(num_str), letter, word
        
    # If c_low is a valid frequent word and w_low is rare:
    if c_freq > 20 and w_freq < 5:
        return int(num_str), "", cand_full
        
    # Default: if c_low is much more frequent than w_low:
    if c_freq > w_freq:
        return int(num_str), "", cand_full
        
    return int(num_str), letter, word

# Test all occurrences of \d+[a-z][A-Za-z]+ in Matius 28
mat28_start = text.find('PASAL 28')
mat28 = text[mat28_start:mat28_start+3000]

print("=== Testing Matius 28 markers ===")
matches = re.findall(r'(\d{1,2})([a-z]?)([A-Za-z]+(?:-[A-Za-z]+)*)', mat28)
for num, letter, word in matches:
    n, cr, res_word = test_parse_marker(num, letter, word)
    if letter:
        print(f"Original: {num}{letter}{word} -> Num: {n}, Ref: '{cr}', Word: '{res_word}'")
