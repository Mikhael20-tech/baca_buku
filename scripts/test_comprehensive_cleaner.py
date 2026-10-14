import re, json

def clean_cross_refs_comprehensive(txt):
    t = txt
    
    # Cross-reference letters are ONLY [a-h] in Indonesian RV
    # 1. Lowercase letter [a-h] before Capitalized word (e.g. aKelahiran, bMaria, cAllah, dYesus, eHerodes)
    t = re.sub(r'(?:^|(?<=[\s"\'\(\[\{“‘«„\—\–\:\u201c\u2018\ufffd]))[a-h]([A-Z][a-zA-Z\-]*)', r'\1', t)
    
    # 2. Lowercase letter [a-h] before standard Indonesian affixes:
    # ber-, ter-, ke-, pe-/pem-/pen-/peng-/peny-/per-, se-
    # e.g. aberdoa -> berdoa, bberkata -> berkata, bpemimpin -> pemimpin, akerajaan -> kerajaan
    affixes = r'(?:ber|ter|ke|pem|pen|peng|peny|per|se)'
    t = re.sub(r'(?:^|(?<=[\s"\'\(\[\{“‘«„\—\–\:\u201c\u2018\ufffd]))[a-h](' + affixes + r'[a-z]+(?:-[a-z]+)*)', r'\1', t)
    
    # pe- (distinguish from real roots like pelita, perak, pedang)
    t = re.sub(r'(?:^|(?<=[\s"\'\(\[\{“‘«„\—\–\:\u201c\u2018\ufffd]))[a-h](pe(?:mimpin|rempuan|rsembahan|rjalanan|nyelamat|ngampunan|layanan|rtama|cah|nuh))\b', r'\1', t)
    
    # 3. Lowercase letter [a-h] before di- (passive verbs)
    def clean_di(m):
        full = m.group(1)
        # Check if actual word is adil, adik, adinda, adipati
        if re.match(r'^adi(?:l|k|nda|pati)(?:nya|lah|kah|pun)?$', full):
            return full
        if full[0] in 'abcdefgh' and full[1:].startswith('di'):
            return full[1:]
        return full
    t = re.sub(r'(?:^|(?<=[\s"\'\(\[\{“‘«„\—\–\:\u201c\u2018\ufffd]))([a-h]di[a-z]+(?:-[a-z]+)*)\b', clean_di, t)
    
    # 4. Lowercase letter [a-h] before me- / men- / mem- / meng- / meny- (active verbs)
    t = re.sub(r'(?:^|(?<=[\s"\'\(\[\{“‘«„\—\–\:\u201c\u2018\ufffd]))[a-h](me[a-z]+(?:-[a-z]+)*)\b', r'\1', t)
    
    # 5. Lowercase letter [a-h] before common Biblical / standard roots (cross ref is ONLY [a-h]!)
    common_roots = (
        r'ahli|mimpi|mati|emas|mur|orang(?:-[a-z]+)*|anak(?:-[a-z]+)*|ibu(?:-[A-Za-z]+)*|'
        r'dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh|'
        r'mereka|saudara(?:-[a-z]+)*|malaikat|suara|nama|hari|waktu|tempat|rumah|kota|negeri|'
        r'tanah|raja|hukum|janji|kasih|iman|roh|Rouh|jiwa|tubuh|darah|hidup|maut|dosa|jalan|'
        r'terang|kegelapan|langit|bumi|air|api|roti|anggur|pohon|batu|tobat|baptisan|'
        r'madu|belalang|kain|kulit|unta|sungai|laut|pintu|kunci|kuasa|tanda|firman|'
        r'bapa(?:-[A-Za-z]+)*|tuan|hamba|murid(?:-[a-z]+)*|rasul(?:-[a-z]+)*|imam(?:-[a-z]+)*|'
        r'mesbah|korban|bait|kudus|kemah|tabut|pelita|tiang|awan|gunung|padang|lembah'
    )
    t = re.sub(r'(?:^|(?<=[\s"\'\(\[\{“‘«„\—\–\:\u201c\u2018\ufffd]))[a-h](' + common_roots + r')\b', r'\1', t)
    
    return t

with open('public/bible/matius.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

print('=== MATIUS 2 BEFORE & AFTER ===')
for v in d['chapters']['2']['verses']:
    cleaned = clean_cross_refs_comprehensive(v['text'])
    if cleaned != v['text']:
        print(f"V{v['verse']}:")
        print("  OLD:", v['text'])
        print("  NEW:", cleaned)
