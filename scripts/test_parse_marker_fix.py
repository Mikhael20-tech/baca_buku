import re

# Let's test parse_marker logic
def parse_marker(num_str, cross_ref, word):
    if not cross_ref:
        return int(num_str), "", word
        
    cand_full = cross_ref + word
    
    # 1. If word starts with Capital letter, cross_ref is definitely a cross reference letter!
    # e.g. 1aNazaret -> note 1, ref 'a', word 'Nazaret'
    # e.g. 1aUr -> note 1, ref 'a', word 'Ur'
    # e.g. 2bKerajaan -> note 2, ref 'b', word 'Kerajaan'
    if re.match(r'^[A-Z]', word):
        return int(num_str), cross_ref, word
        
    # 2. If word starts with standard Indonesian affixes or consonants that cannot follow cross_ref:
    # e.g. 2cmenyertai -> 'c' cannot precede 'menyertai', word is 'menyertai'
    # e.g. 3dkepada -> 'd' cannot precede 'kepada', word is 'kepada'
    # e.g. 1abertobatlah -> 'a' cannot precede 'bertobatlah', word is 'bertobatlah'
    # e.g. 2bdibaptis -> 'b' cannot precede 'dibaptis', word is 'dibaptis'
    if re.match(r'^(?:ber|ter|ke|pe|pem|pen|peng|peny|per|se|di|me|men|mem|meng|meny)[a-z]+', word):
        # But wait! What if cand_full is a root starting with di- like 'diam'?
        # di- in Indonesian affixes is followed by a verb stem: 'dibaptis', 'dilahirkan', 'digenapi'
        return int(num_str), cross_ref, word
        
    if re.match(r'^(?:kepada|melakukan|melihat|mendengar|membawa|datang|pergi)[a-z]*', word):
        return int(num_str), cross_ref, word

    # 3. If cand_full is an ordinary Indonesian word starting with a/b/c/d/e/f/g:
    # e.g. bukit, baptislah, dalam, ajarlah, anak, antara, atas, akhir, ampun, amat, air,
    # batu, bapa, bumi, benar, besar, cawan, darah, dunia, daerah, diri, emas, firman, gunung
    # Then cand_full IS THE WORD! There is NO cross reference!
    # List of known stems / roots:
    stems = (
        'bukit', 'baptis', 'dalam', 'ajar', 'anak', 'antara', 'atas', 'akhir', 'ampun', 
        'amat', 'air', 'ada', 'asal', 'awal', 'akal', 'api', 'anggur', 'awan', 'ahli',
        'batu', 'bapa', 'bumi', 'benar', 'besar', 'baik', 'bangun', 'bukan', 'bahkan',
        'bawa', 'buka', 'bintang', 'binatang', 'bangsa', 'bau', 'buli', 'biji', 'buah',
        'cawan', 'cahaya', 'celaka', 'cinta', 'curah',
        'darah', 'dunia', 'daerah', 'diri', 'dusta', 'duduk', 'dekat', 'diam', 'domba',
        'emas', 'elok', 'erat', 'enam', 'empat',
        'firman', 'fasal', 'faedah',
        'gunung', 'gandum', 'gelap', 'guru', 'gembala', 'gigi'
    )
    for s in stems:
        if cand_full.startswith(s):
            return int(num_str), "", cand_full
            
    # Default: if word does not look like a complete word but cand_full does
    # e.g. ukit (not a word) vs bukit (word)
    # aptislah (not a word) vs baptislah (word)
    # jarlah (not a word) vs ajarlah (word)
    if not re.match(r'^[b-df-hj-np-tv-z]{2,}', word) and len(word) >= 3:
        # Check if word without cross_ref starts with unusual vowel combination
        if cross_ref in 'bd' and word.startswith(('ukit', 'aptis', 'alam', 'arah', 'unia')):
            return int(num_str), "", cand_full
        if cross_ref == 'a' and word.startswith(('jarlah', 'ntara', 'tas', 'nak', 'mpun')):
            return int(num_str), "", cand_full

    return int(num_str), cross_ref, word

test_cases = [
    ('1', '', 'bukit'),
    ('1', 'b', 'ukit'),
    ('3', 'b', 'aptislah'),
    ('4', 'd', 'alam'),
    ('1', 'a', 'jarlah'),
    ('2', 'c', 'menyertai'),
    ('3', 'd', 'kepada'),
    ('1', 'a', 'Nazaret'),
    ('1', 'a', 'bertobatlah'),
    ('2', 'b', 'dibaptis'),
]

for n, ref, w in test_cases:
    num, final_ref, final_w = parse_marker(n, ref, w)
    print(f"Input: {n}{ref}{w} -> note={num}, ref={repr(final_ref)}, word={repr(final_w)}")
