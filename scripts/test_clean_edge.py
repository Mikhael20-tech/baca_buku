import re

def parse_marker(num_str, cross_ref, word):
    if cross_ref:
        cand_full = cross_ref + word
        vowel_stems = (
            'nugerah', 'nak', 'ntara', 'tas', 'khir', 'mpun', 'mat', 'ku', 'ir', 
            'pabila', 'sal', 'da', 'gama', 'hli', 'kar', 'kal', 'lamat', 'man', 
            'manat', 'lam', 'nggur', 'ngin', 'nggota', 'pa'
        )
        if cross_ref == 'a' and (word.startswith(vowel_stems) or (not re.match(r'^[A-Z]', word) and word.startswith(('nak', 'da', 'pa')))):
            return int(num_str), "", cand_full
        if cross_ref == 'b' and word.startswith(('enar', 'erhala', 'umi', 'aik', 'angun', 'esar')):
            return int(num_str), "", cand_full
        if cross_ref == 'd' and word.startswith(('ijanjikan', 'ibaptis', 'ikatakan', 'iberikan', 'ibuat', 'iantara', 'ialam', 'ia', 'unia', 'emikian', 'an')):
            return int(num_str), "", cand_full
    return int(num_str), cross_ref, word

def test_process(text):
    t = text
    # Clean S e l a
    t = re.sub(r'\bS\s+e\s+l\s+a\b', 'Sela', t, flags=re.I)
    # Clean (-40b)
    t = re.sub(r'^\(\-\d+[a-z]?\)\s*', '', t)
    
    # Pre-clean period immediately followed by digit marker: e.g. ALLAH.1aBertobatlah -> ALLAH. 1aBertobatlah
    t = re.sub(r'(\.)(\d{1,2}[a-g]?[A-Za-z])', r'\1 \2', t)
    
    pattern = re.compile(r'(^|[\s"\'\(\[\{“‘«„\—\–\-\:\;\u201c\u2018\ufffd])(\d{1,2})([a-g]?)([A-Za-z]+(?:-[A-Za-z]+)*)')
    matches = list(pattern.finditer(t))
    
    clean_chars = []
    marked_chars = []
    keywords_map = {}
    last_idx = 0
    
    for idx, m in enumerate(matches):
        prefix = m.group(1)
        raw_num_str = m.group(2)
        raw_cross_ref = m.group(3)
        raw_word = m.group(4)
        
        note_int, cross_ref, word = parse_marker(raw_num_str, raw_cross_ref, raw_word)
        
        clean_chars.append(t[last_idx : m.start()])
        marked_chars.append(t[last_idx : m.start()])
        
        clean_chars.append(prefix)
        marked_chars.append(prefix)
        
        word_start = m.start() + len(prefix) + len(raw_num_str) + len(cross_ref)
        
        if prefix in '“"‘\u201c\u2018':
            close_quote = '”' if prefix in '“\u201c' else ('’' if prefix == '‘' else '"')
            close_idx = t.find(close_quote, word_start)
            if close_idx != -1 and (close_idx - word_start) <= 35:
                phrase = t[word_start : close_idx]
                clean_chars.append(phrase + close_quote)
                marked_chars.append(f"{phrase}{close_quote}<fn n=\"{note_int}\"/>")
                keywords_map[note_int] = phrase
                last_idx = close_idx + len(close_quote)
                continue
                
        clean_chars.append(word)
        marked_chars.append(f"{word}<fn n=\"{note_int}\"/>")
        keywords_map[note_int] = word
        last_idx = m.end()
        
    clean_chars.append(t[last_idx:])
    marked_chars.append(t[last_idx:])
    
    clean_text = "".join(clean_chars)
    marked_text = "".join(marked_chars)
    
    clean_text = re.sub(r'(?:^|(?<=[\s\"\'\(\[\{“‘«„\—\–\:\ufffd]))\d+([a-zA-Z\-]*)', r'\1', clean_text)
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    marked_text = re.sub(r'\s+', ' ', marked_text).strip()
    
    return clean_text, marked_text, keywords_map

cases = [
    'Dan inilah janji yang telah 1dijanjikan-2Nya sendiri kepada kita, yaitu 3ahidup yang kekal.',
    'Aku akan mematahkan palang pintu Damsyik dan melenyapkan penduduk dari 1Bikeat-2Awen serta pemegang tongkat',
    'matilah Haran di negeri kelahirannya, di 1aUr-2Kasdim.',
    'Sebab kita ini keturunan-4Nya juga.',
    '(-40b) Dan dengan kata-kata itu ia membubarkan kumpulan rakyat itu.',
    'Baginya tidak ada pertolongan dari pada Allah.1S e l a',
    'demikianlah firman Tuhan ALLAH.1aBertobatlah dan berpalinglah',
    'disampaikan oleh 1nabi-nabi, bahwa Ia akan disebut: “3Orang Nazaret” 2.'
]

for c in cases:
    cl, mk, kw = test_process(c)
    print('RAW:   ', c)
    print('CLEAN: ', cl)
    print('MARKED:', mk)
    print('KW:    ', kw)
    print('-'*50)
