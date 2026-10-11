import re

def clean_verse_text(txt):
    t = txt
    # 1. Number + optional single letter before capitalized word: 1aPada -> Pada, 2Yesus -> Yesus, 3Allah -> Allah, 1Inilah -> Inilah
    t = re.sub(r'(\"|\'|\b)\d+[a-z]?([A-Z][a-zA-Z]*)', r'\1\2', t)
    
    # 2. Number + letter + lowercase word: 4bmenciptakan -> menciptakan, 1adaftar -> daftar, 4canak -> anak
    # When rest has a letter [a-z] followed by consonant or known word:
    def repl_num_lower(m):
        prefix = m.group(1) # quotes or boundary
        rest = m.group(2)   # e.g. adaftar, mulanya, bmenciptakan, canak, langit, bumi
        # If rest starts with letter + consonant cluster or vowel:
        # Check if first char is a footnote marker:
        # In recovery version, note letter is [a-z], e.g. 'a' in 'adaftar' (daftar), 'b' in 'bmenciptakan' (menciptakan), 'c' in 'canak' (anak)
        if len(rest) >= 4 and rest[0] in 'abcdefg' and (
            rest[1] in 'bcdfghjklmnpqrstvwxyz' or # e.g. bmenciptakan, cdan
            rest[1:] in ['daftar', 'anak', 'saudaranya', 'isteri', 'tulus', 'menceraikannya', 'seluruhnya', 'keturunan', 'sampai', 'pembuangan']
        ):
            return prefix + rest[1:]
        return prefix + rest

    t = re.sub(r'(\"|\'|\b)\d+([a-z]+)', repl_num_lower, t)
    
    # 3. Cross reference markers before capital letters: aKelahiran -> Kelahiran, bMaria -> Maria, cRoh -> Roh
    t = re.sub(r'(?:^|(?<=\s))[a-z]([A-Z][a-zA-Z]*)', r'\1', t)
    
    # 4. Remove spurious ? inside words: dipi?-sah?-kan -> dipisahkan
    t = re.sub(r'\?[\-‑]?', '', t)
    t = re.sub(r'(\w+)\-+(\w+)', r'\1-\2', t)
    t = re.sub(r'\s+', ' ', t)
    return t.strip()

samples = [
    "1aPada 2mulanya 3Allah 4bmenciptakan 5langit dan bumi.",
    "Inilah 1adaftar nenek moyang 2Yesus 3bKristus, 4canak Daud, 5danak Abraham.",
    "Abraham mempunyai anak, 1aIshak; Ishak mempunyai anak, 2bYakub; Yakub mempunyai anak, 3cYehuda; dan 4dsaudara-saudaranya;",
    "aKelahiran Yesus Kristus adalah seperti berikut: Pada waktu bMaria, ibu-Nya, bertunangan dengan Yusuf, ternyata ia mengandung 1dari cRoh Kudus, sebelum mereka hidup sebagai suami isteri.",
    "Allah melihat bahwa terang itu abaik, lalu 1bdipi?-sah?-kan-Nyalah terang itu dari gelap.",
    'lalu terdengarlah asuara dari surga yang mengatakan: "1Inilah bAnak-Ku yang Kukasihi, kepada-Nyalah Aku cberkenan."'
]

for s in samples:
    print("ORIG :", s)
    print("CLEAN:", clean_verse_text(s))
    print()
