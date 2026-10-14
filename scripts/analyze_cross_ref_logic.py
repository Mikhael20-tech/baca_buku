import re

with open(r'd:\Magang\Baca\pdb\roti_hayat_full.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Let's inspect verses that have cross references
# In Matius 28:
# 2bhari
# 1aGalilea
# 2bGalilea
# 1asaudara-saudara-Ku
# 2cmenyertai
# 3dkepada
# And standalone cross references:
# aSetelah
# akilat
# bputih
# abangsa
# aGalilea
# amelakukan
# bKuperintahkan
# agubernur

# What letters can cross references be?
# In RV Alkitab, cross references are letters a, b, c, d, e, f, g, h, i, j, k, l, m...
# Let's see what follows a number:
# \d+([a-z])([A-Za-z]+)
# When is the letter a cross-ref vs part of the word?
# If the letter is a cross reference:
# 1) If the word following it starts with a Capital letter: e.g. 1aGalilea -> letter is 'a', word is 'Galilea'
# 2) If the word following it is a valid Indonesian word by itself, but WITH the letter prepended, it is NOT a valid Indonesian word!
# Example: 2bhari -> with 'b' prepended: 'bhari' (NOT a valid Indonesian word!). Without 'b': 'hari' (valid Indonesian word!)
# Example: 1asaudara -> 'asaudara' (NOT a valid Indonesian word!). Without 'a': 'saudara' (valid Indonesian word!)
# Example: 2cmenyertai -> 'cmenyertai' (NOT valid!). Without 'c': 'menyertai' (valid!)
# Example: 3dkepada -> 'dkepada' (NOT valid!). Without 'd': 'kepada' (valid!)
# On the other hand:
# 1bukit -> with 'b': 'bukit' (VALID Indonesian word!). Without 'b': 'ukit' (NOT a valid Indonesian word!)
# 3baptislah -> with 'b': 'baptislah' (VALID!). Without 'b': 'aptislah' (NOT valid!)
# 4dalam -> with 'd': 'dalam' (VALID!). Without 'd': 'alam' (Notice 'alam' is a word, but 'dalam' is much more natural, or 'dalam' is a known word)
# 1ajarlah -> with 'a': 'ajarlah' (VALID!). Without 'a': 'jarlah' (NOT valid!)

print("Checking validity test...")
