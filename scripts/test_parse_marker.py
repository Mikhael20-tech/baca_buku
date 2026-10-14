import sys
import re

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def parse_marker(num_str, cross_ref, word):
    # Check if 'cross_ref' was mistakenly stolen from the start of the word
    if cross_ref:
        cand_full = cross_ref + word
        vowel_stems = (
            'nugerah', 'nak', 'ntara', 'tas', 'khir', 'mpun', 'mat', 'ku', 'ir', 
            'pabila', 'sal', 'da', 'gama', 'hli', 'kar', 'kal', 'lamat', 'man', 
            'manat', 'lam', 'nggur', 'ngin', 'nggota', 'pa', 'tas'
        )
        if cross_ref == 'a' and (word.startswith(vowel_stems) or not re.match(r'^[A-Z]', word) and word.startswith(('nak', 'da', 'pa'))):
            return int(num_str), "", cand_full
        # What if cross_ref is 'b' and word starts with 'enar', 'erhala', 'umi', 'aik'?
        if cross_ref == 'b' and word.startswith(('enar', 'erhala', 'umi', 'aik', 'angun', 'esar')):
            return int(num_str), "", cand_full
            
    return int(num_str), cross_ref, word

test_words = [
    ('2', 'a', 'nugerah'),
    ('1', 'a', 'Nazaret'),
    ('2', '', 'nabi-nabi'),
    ('1', 'c', 'meyakinkan'),
    ('3', '', 'Orang'),
    ('1', 'b', 'dipi-sah-kan')
]

for n, c, w in test_words:
    note_int, final_c, final_w = parse_marker(n, c, w)
    print(f"({n}, {c}, {w}) -> note={note_int}, cross={repr(final_c)}, word={repr(final_w)}")
