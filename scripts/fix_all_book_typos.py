import zipfile
import os
import re
import glob

def clean_text(text):
    # 0. Clean previously broken replacement characters or symbols
    text = re.sub(r'<p style="font-weight: 600; color: #b45309; text-indent: 0; margin-top: -0.5em; margin-bottom: 1.2em;">[\u2014\-–—\s]*', '<p>', text)
    text = text.replace('', '')
    text = text.replace('&mdash;', '&#8212;').replace('&ndash;', '&#8211;').replace('&hellip;', '&#8230;').replace('&nbsp;', '&#160;')

    # 1. Fix ?- and corrupt hyphenation patterns from PalmDOC/iSilo
    # e.g., ke?-hendak -> kehendak, sesung?-guhnya -> sesungguhnya, peru?-bahan -> perubahan
    def repl_hyphen(m):
        w1 = m.group(1)
        w2 = m.group(2)
        # Reduplication check (e.g., orang-orang, benar-benar, pikiran-pikiranku)
        w2_stem = re.sub(r'(ku|mu|nya|lah|kah|kan|an)$', '', w2.lower())
        if w1.lower() == w2.lower() or w1.lower() == w2_stem:
            return f"{w1}-{w2}"
        # ke- prefix with digit (e.g., ke-2, ke-10)
        if w1.lower() == 'ke' and w2.isdigit():
            return f"{w1}-{w2}"
        return f"{w1}{w2}"

    # Pattern with ? and dash: ke?-hendak, ke-?hendak, ke? -hendak
    text = re.sub(r'([A-Za-z]+)\s*\?+[\-‑–—]+\s*([A-Za-z0-9]+)', repl_hyphen, text)
    text = re.sub(r'([A-Za-z]+)\s*[\-‑–—]+\?+\s*([A-Za-z0-9]+)', repl_hyphen, text)
    
    # Pattern with standalone ? between syllables: ke?hendak, Tri?tunggal, Arti?nya, datang?lah
    text = re.sub(r'([A-Za-z]{2,})\?+([A-Za-z]{2,})', repl_hyphen, text)
    text = re.sub(r'([A-Za-z]{2,})\?+(lah|kah|kan|an|nya|ku|mu)\b', r'\1\2', text, flags=re.IGNORECASE)

    # 2. Fix common Indonesian OCR typos:
    text = re.sub(r'\bbalk\b', 'baik', text)
    text = re.sub(r'\bBalk\b', 'Baik', text)
    text = re.sub(r'\bakhimya\b', 'akhirnya', text)
    text = re.sub(r'\bAkhimya\b', 'Akhirnya', text)
    text = re.sub(r'\bpemah\b', 'pernah', text)
    text = re.sub(r'\bPemah\b', 'Pernah', text)
    text = re.sub(r'\bKaIau\b', 'Kalau', text)
    text = re.sub(r'\bkaIau\b', 'kalau', text)
    text = re.sub(r'\bmen yembah\b', 'menyembah', text)
    text = re.sub(r'\bMen yembah\b', 'Menyembah', text)
    text = re.sub(r'\bsia\s*\?*[\-‑–—]?\?*\s*sia\b', 'sia-sia', text)

    # Common Indonesian reduplications that lost their hyphens
    text = re.sub(r'\btergesagesa\b', 'tergesa-gesa', text)
    text = re.sub(r'\bcepatcepat\b', 'cepat-cepat', text)
    text = re.sub(r'\bpikiranpikiranku\b', 'pikiran-pikiranku', text)
    text = re.sub(r'\bpikiranpikiran\b', 'pikiran-pikiran', text)
    text = re.sub(r'\borangorang\b', 'orang-orang', text)
    text = re.sub(r'\bmalammalam\b', 'malam-malam', text)
    text = re.sub(r'\bsendirisendiri\b', 'sendiri-sendiri', text)

    # 3. Fix merged scripture verse ranges:
    # e.g., 4:2425 -> 4:24-25, 1:1011 -> 1:10-11, 27:2122 -> 27:21-22, 2:1115 -> 2:11-15
    def fix_verse_num_4(m):
        ch = m.group(1)
        v1 = int(m.group(2))
        v2 = int(m.group(3))
        if 0 < v1 < 200 and 0 < v2 < 200 and v1 < v2 <= v1 + 30:
            return f"{ch}:{v1}-{v2}"
        return m.group(0)

    text = re.sub(r'\b(\d+):(\d{2})(\d{2})\b', fix_verse_num_4, text)

    def fix_verse_num_3(m):
        ch = m.group(1)
        v1 = int(m.group(2))
        v2 = int(m.group(3))
        if 0 < v1 < 10 and 0 < v2 < 25 and v1 < v2 <= v1 + 10:
            return f"{ch}:{v1}-{v2}"
        return m.group(0)

    text = re.sub(r'\b(\d+):(\d{1})(\d{2})\b', fix_verse_num_3, text)

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
    # Apply text typo cleaning
    cleaned = clean_text(content)
    
    # Strip any previously broken div.verse-quote wrappers cleanly without touching other valid divs
    cleaned = re.sub(r'<div class="verse-quote">\s*(.*?)\s*</div>', r'\1', cleaned, flags=re.DOTALL)
    
    # Pattern 1: 2-line quote followed by verse ref
    # E.g. <p>“Bersukacitalah...”</p><p>dan bertekunlah...”</p><p>Roma 12:12</p>
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

    # Pattern 2: 1-line quote followed by verse ref on next line
    # E.g. <p>“Allah adalah Benar”</p><p>Roma 3:4</p>
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

    # Pattern 3: Standalone quote (including quotes that already have inline verse citation at end)
    def repl_quote_only(m):
        inner = m.group(1).strip()
        is_q = (inner.startswith('“') or inner.startswith('"') or inner.startswith('&quot;'))
        ends_q = (inner.endswith('”') or inner.endswith('"') or inner.endswith('&quot;') or re.search(r'\d+:\d+', inner))
        if is_q and ends_q and len(inner) < 500:
            return f'<p class="verse-quote">{inner}</p>'
        return m.group(0)

    cleaned = re.sub(r'<p>(.*?)</p>', repl_quote_only, cleaned)

    return cleaned

def process_epub(epub_path):
    # FKKP memiliki UI, UX, dan format font asli bawaan yang tidak boleh diubah
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
