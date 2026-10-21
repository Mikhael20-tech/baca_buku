import zipfile
import os
import re
import glob

def clean_text(text):
    # 0. Clean previously broken replacement characters or symbols
    text = re.sub(r'<p style="font-weight: 600; color: #b45309; text-indent: 0; margin-top: -0.5em; margin-bottom: 1.2em;">[\u2014\-–—\s]*', '<p>', text)
    text = text.replace('&mdash;', '&#8212;').replace('&ndash;', '&#8211;').replace('&hellip;', '&#8230;').replace('&nbsp;', '&#160;')

    # 1. Fix ?- and corrupt hyphenation patterns from PalmDOC/iSilo/OCR
    def repl_hyphen(m):
        w1 = m.group(1)
        w2 = m.group(2)
        # Reduplication check (e.g., orang-orang, benar-benar, pikiran-pikiranku, apa-apa)
        w2_stem = re.sub(r'(ku|mu|nya|lah|kah|kan|an)$', '', w2.lower())
        if w1.lower() == w2.lower() or w1.lower() == w2_stem:
            return f"{w1}-{w2}"
        # ke- prefix with digit (e.g., ke-2, ke-10)
        if w1.lower() == 'ke' and w2.isdigit():
            return f"{w1}-{w2}"
        # Divine pronouns
        if w2 in ('Nya', 'Ku', 'Mu'):
            return f"{w1}-{w2}"
        return f"{w1}{w2}"

    # Pattern with ? and dash: ke?-hendak, ke-?hendak, ke? -hendak, ke?--hendak, sia-?-sia
    text = re.sub(r'([A-Za-z]+)\s*[\-‑–—]+\?+[\-‑–—]+\s*([A-Za-z0-9]+)', repl_hyphen, text)
    text = re.sub(r'([A-Za-z]+)\s*\?+[\-‑–—]+\s*([A-Za-z0-9]+)', repl_hyphen, text)
    text = re.sub(r'([A-Za-z]+)\s*[\-‑–—]+\?+\s*([A-Za-z0-9]+)', repl_hyphen, text)
    
    # Standalone ? between syllables: ke?hendak, Tri?tunggal, Arti?nya, datang?lah
    text = re.sub(r'([A-Za-z]{2,})\?+([A-Za-z]{2,})', repl_hyphen, text)
    text = re.sub(r'([A-Za-z]{2,})\?+(lah|kah|kan|an|nya|ku|mu)\b', r'\1\2', text, flags=re.IGNORECASE)

    # 2. Fix broken prefix: men y... and pen y... (e.g. men yembah -> menyembah, men yembahNya -> menyembah-Nya)
    text = re.sub(r'\b(m|M)en\s+y([a-zA-Z]+)\b', r'\1eny\2', text)
    text = re.sub(r'\b(p|P)en\s+y([a-zA-Z]+)\b', r'\1eny\2', text)

    # 3. Fix common Indonesian OCR character confusion & typos:
    ocr_map = {
        r'\bbalk\b': 'baik',
        r'\bBalk\b': 'Baik',
        r'\bakhimya\b': 'akhirnya',
        r'\bAkhimya\b': 'Akhirnya',
        r'\bpemah\b': 'pernah',
        r'\bPemah\b': 'Pernah',
        r'\bKaIau\b': 'Kalau',
        r'\bkaIau\b': 'kalau',
        r'\bjaIan\b': 'jalan',
        r'\bmisaInya\b': 'misalnya',
        r'\bInjit\b': 'Injil',
        r'\bItulab\b': 'Itulah',
        r'\bIngln\b': 'Ingin',
        r'\bsa1ju\b': 'salju',
        r'\b1ain\b': 'lain',
        r'\bha1\b': 'hal',
        r'\bWAJ1B\b': 'WAJIB',
        r'\bRasu15\b': 'Rasul 5',
        r'\bDial\s+Jangan\b': 'Dia! Jangan',
        r'\bsia\s*\?*[\-‑–—]?\?*\s*sia\b': 'sia-sia',
        r'\bkesia\s*\?*[\-‑–—]?\?*\s*siaan\b': 'kesia-siaan',
        r'\bber\s+air\b': 'berair',
        r'\bdi\s+masak\b': 'dimasak',
    }
    for pat, repl in ocr_map.items():
        text = re.sub(pat, repl, text)

    # 4. Fix Indonesian reduplications that lost their hyphens:
    reduplications = [
        'hal-hal', 'orang-orang', 'meja-meja', 'ahli-ahli', 'anak-anak',
        'kata-kata', 'hari-hari', 'tanda-tanda', 'berpura-pura', 'pura-pura',
        'berturut-turut', 'seolah-olah', 'masing-masing', 'sungguh-sungguh',
        'terus-menerus', 'tiap-tiap', 'rata-rata', 'selama-lamanya', 'malam-malam',
        'bermalam-malam', 'berlaksa-laksa', 'sendiri-sendiri', 'tergesa-gesa',
        'cepat-cepat', 'benar-benar', 'kasih-kasihan', 'macam-macam', 'tumbuh-tumbuhan',
        'pertanyaan-pertanyaan', 'bintang-bintang', 'ujung-ujungnya', 'kadang-kadang',
        'mudah-mudahan', 'pelan-pelan', 'sampar-sampar', 'hambatan-hambatan',
        'peristiwa-peristiwa', 'gerakan-gerakan', 'masalah-masalah', 'pikiran-pikiran',
        'pikiran-pikiranku', 'berjual-beli', 'kolega-kolega', 'saudara-saudara',
        'Saudara-saudara', 'buku-buku', 'ayat-ayat', 'nama-nama', 'tempat-tempat',
        'perkara-perkara', 'golongan-golongan', 'pribadi-pribadi', 'unsur-unsur',
        'contoh-contoh', 'musuh-musuh', 'kota-kota', 'negeri-negeri', 'surat-surat',
        'murid-murid', 'rasul-rasul', 'pengikut-pengikut', 'hukum-hukum', 'kebenaran-kebenaran',
        'pengajaran-pengajaran', 'janji-janji', 'bangsa-bangsa', 'jiwa-jiwa', 'tubuh-tubuh',
        'orang-orangan'
    ]
    for r in reduplications:
        unhyphen = r.replace('-', '')
        text = re.sub(rf'\b{unhyphen}\b', r, text, flags=re.IGNORECASE)

    # 5. Fix Divine Pronouns missing hyphens:
    # e.g. padaNya -> pada-Nya, firmanNya -> firman-Nya, menyembahNya -> menyembah-Nya
    text = re.sub(
        r'(?<!-)\b([a-zA-Z]+)Nya\b',
        r'\1-Nya',
        text
    )
    # Divine first person: -Ku
    text = re.sub(
        r'(?<!-)\b(umat|kepada|perkataan|perintah|kasih|nama|hadirat|firman|suara|anak|takhta|tubuh|darah)Ku\b',
        r'\1-Ku',
        text
    )
    # Divine second person: -Mu
    text = re.sub(
        r'(?<!-)\b(firman|nama|kehendak|kasih|rencana|umat|hadirat|takhta|suara|hajat|janji|hukum|kuasa|kemuliaan|jalan|kebenaran)Mu\b',
        r'\1-Mu',
        text
    )

    # 6. Fix Merged Scripture verse numbers:
    # e.g., 15:89 -> 15:8-9, 15:56 -> 15:5-6, 10:23 -> 10:2-3, 3:13 -> 3:1-3, 4:2425 -> 4:24-25
    known_verse_fixes = {
        r'\b15:89\b': '15:8-9',
        r'\b15:56\b': '15:5-6',
        r'\b10:23\b': '10:2-3',
        r'\b3:13\b': '3:1-3',
        r'\b4:2425\b': '4:24-25',
        r'\b27:2122\b': '27:21-22',
        r'\b1:1011\b': '1:10-11',
        r'\b2:1115\b': '2:11-15',
        r'\b3:35\b': '3:3-5',
        r'\b8:1112\b': '8:11-12'
    }
    for pat, repl in known_verse_fixes.items():
        text = re.sub(pat, repl, text)

    return text

MODERN_CSS = '''
body {
  font-family: 'Merriweather', Georgia, serif;
  line-height: 1.85;
  padding: 2.5em 1.8em 6em 1.8em;
  color: #1e293b;
  background-color: transparent;
  max-width: 760px;
  margin: 0 auto;
  text-rendering: optimizeLegibility;
  column-count: 1 !important;
}
h1, h2, h3, h4 {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -0.015em;
}
h1 {
  font-size: 1.75em;
  font-weight: 800;
  margin-top: 1.2em;
  margin-bottom: 0.8em;
  padding-bottom: 0.35em;
  border-bottom: 2.5px solid #d97706;
  color: #78350f;
}
h2 {
  font-size: 1.25em;
  font-weight: 700;
  color: #1e293b;
  margin-top: 1.8em;
  margin-bottom: 0.6em;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding-bottom: 0.25em;
}
h3 {
  font-size: 1.05em;
  font-weight: 600;
  color: #334155;
  margin-top: 1.4em;
  margin-bottom: 0.4em;
}
p {
  margin-top: 0;
  margin-bottom: 1.25em;
  text-align: justify;
  text-justify: inter-word;
  text-indent: 1.5em;
}
.verse-quote {
  margin: 1.4em 0 !important;
  padding: 0.9em 1.25em !important;
  border-left: 3.5px solid #d97706 !important;
  background-color: rgba(245, 158, 11, 0.08) !important;
  border-radius: 0 10px 10px 0 !important;
  font-style: italic !important;
  color: #78350f !important;
  text-indent: 0 !important;
  text-align: left !important;
}
.verse-quote p {
  text-indent: 0 !important;
  margin-bottom: 0 !important;
  color: inherit !important;
  font-style: italic !important;
}
.lead {
  font-size: 1.08em;
  font-weight: 600;
  text-indent: 0;
  color: #92400e;
}
'''

def enhance_xhtml_content(content):
    # 1. Apply text typo cleaning
    cleaned = clean_text(content)
    
    # 2. Strip any previously broken div.verse-quote wrappers cleanly
    cleaned = re.sub(r'<div class="verse-quote">\s*(.*?)\s*</div>', r'\1', cleaned, flags=re.DOTALL)
    
    # 3. Pattern 2-line quote followed by verse ref
    pattern_2line = re.compile(
        r'<p(?: class="[^"]*")?>((?:&quot;|[“\"])[^<]*?)</p>\s*<p(?: class="[^"]*")?>([^<]*?(?:&quot;|[”\"]))</p>\s*<p(?: class="[^"]*")?>[\u2014\-–—&#8212;\s]*([A-Z0-9][^<]*?\d+:\d+[^<]*?)</p>',
        re.DOTALL
    )
    def repl_2line(m):
        q1 = m.group(1).strip()
        q2 = m.group(2).strip()
        ref = re.sub(r'^[\u2014\-–—&#8212;\s]+', '', m.group(3)).strip()
        return f'<p class="verse-quote">{q1} {q2} ({ref})</p>'

    cleaned = pattern_2line.sub(repl_2line, cleaned)

    # 4. Pattern 1-line quote followed by verse ref on next line
    pattern_1line = re.compile(
        r'<p(?: class="[^"]*")?>((?:&quot;|[“\"])[^<]*?(?:&quot;|[”\"]))</p>\s*<p(?: class="[^"]*")?>[\u2014\-–—&#8212;\s]*([A-Z0-9][^<]*?\d+:\d+[^<]*?)</p>',
        re.DOTALL
    )
    def repl_1line(m):
        q = m.group(1).strip()
        ref = re.sub(r'^[\u2014\-–—&#8212;\s]+', '', m.group(2)).strip()
        if ref.lower() in q.lower():
            return f'<p class="verse-quote">{q}</p>'
        return f'<p class="verse-quote">{q} ({ref})</p>'

    cleaned = pattern_1line.sub(repl_1line, cleaned)

    # 5. Standalone quote (including quotes that already have inline verse citation at end)
    def repl_quote_only(m):
        inner = m.group(1).strip()
        is_q = (inner.startswith('“') or inner.startswith('"') or inner.startswith('&quot;'))
        ends_q = (inner.endswith('”') or inner.endswith('"') or inner.endswith('&quot;') or re.search(r'\d+:\d+', inner))
        if is_q and ends_q and len(inner) < 500:
            return f'<p class="verse-quote">{inner}</p>'
        return m.group(0)

    cleaned = re.sub(r'<p>(.*?)</p>', repl_quote_only, cleaned)

    # 6. Split multiple glued quotes in verse-quote
    # e.g. <p class="verse-quote">"Quote 1" Ref 1 "Quote 2" (Ref 2)</p>
    split_quote_pat = re.compile(
        r'<p class="verse-quote">(.*?[”"&quot;])\s*([A-Z0-9][a-zA-Z\s\.]*\d+:\d+(?:-\d+)?)\s*([“"&quot;].*?)</p>',
        re.DOTALL
    )
    # Loop to handle cases with 2 or more glued quotes
    for _ in range(5):
        if not split_quote_pat.search(cleaned):
            break
        cleaned = split_quote_pat.sub(r'<p class="verse-quote">\1 (\2)</p>\n<p class="verse-quote">\3</p>', cleaned)

    return cleaned

def process_epub(epub_path):
    if 'fkkp' in epub_path.lower():
        return False

    temp_path = epub_path + '.tmp'
    modified = False
    
    with zipfile.ZipFile(epub_path, 'r') as zin, zipfile.ZipFile(temp_path, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename.endswith('.xhtml') or item.filename.endswith('.html'):
                orig_text = data.decode('utf-8', errors='ignore')
                new_text = enhance_xhtml_content(orig_text)
                if new_text != orig_text:
                    modified = True
                data = new_text.encode('utf-8')
            elif item.filename.endswith('style.css'):
                data = MODERN_CSS.encode('utf-8')
                modified = True
            zout.writestr(item, data)
            
    if modified:
        os.replace(temp_path, epub_path)
        return True
    else:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return False

def main():
    target_dirs = ['public/books', 'dist/books']
    for tdir in target_dirs:
        if not os.path.exists(tdir):
            continue
        epubs = glob.glob(os.path.join(tdir, '*.epub'))
        print(f"Processing {len(epubs)} epubs in {tdir}...")
        count = 0
        for ep in epubs:
            if process_epub(ep):
                count += 1
        print(f"Successfully cleaned and modernized {count}/{len(epubs)} epubs in {tdir}")

if __name__ == '__main__':
    main()
