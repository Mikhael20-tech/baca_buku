import zipfile
import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
file_path = r"D:\Magang\Baca\pdb\roti_hayat_full.txt"

def xml_clean(s):
    if not s:
        return ""
    return str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

def build_epub(output_path, title, author, chapters, category="Kitab Suci dan Firman", description=""):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with zipfile.ZipFile(output_path, 'w') as epub:
        epub.writestr('mimetype', 'application/epub+zip', compress_type=zipfile.ZIP_STORED)
        
        container_xml = '''<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>'''
        epub.writestr('META-INF/container.xml', container_xml, compress_type=zipfile.ZIP_DEFLATED)
        
        css_content = '''
body {
  font-family: serif;
  line-height: 1.85;
  padding: 1.5em;
  color: #1a1a1a;
  background-color: transparent;
}
h1, h2, h3 {
  font-family: sans-serif;
  color: #1e293b;
  margin-top: 1.4em;
  margin-bottom: 0.6em;
}
h1 { font-size: 1.8em; border-bottom: 2px solid #3b82f6; padding-bottom: 0.3em; color: #1e3a8a; }
h2 { font-size: 1.3em; color: #1e40af; margin-top: 1.8em; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.2em; }
h3 { font-size: 1.1em; color: #334155; }
p {
  margin-bottom: 1.1em;
  text-indent: 1.5em;
  text-align: justify;
}
.outline-heading {
  font-family: sans-serif;
  font-size: 1.1em;
  font-weight: 700;
  color: #1e3a8a;
  margin-top: 1.4em;
  margin-bottom: 0.4em;
  text-indent: 0 !important;
}
.outline-sub {
  font-family: sans-serif;
  font-size: 0.95em;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.8em;
  text-indent: 0 !important;
}
.verse {
  margin-bottom: 0.8em;
  text-indent: 0;
  line-height: 1.9;
}
.verse-num {
  font-weight: 800;
  color: #2563eb;
  margin-right: 0.4em;
  font-size: 1.05em;
}
.footnote-ref {
  display: inline-block;
  cursor: pointer;
  text-decoration: none;
  font-family: sans-serif;
  font-weight: 700;
  color: #2563eb !important;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  padding: 0 4px;
  margin: 0 2px;
  vertical-align: 0.3em;
  font-size: 0.72em;
  line-height: 1.2;
}
.footnote-ref:hover {
  background-color: #dbeafe;
  border-color: #3b82f6;
  text-decoration: underline;
}
.catatan-kaki-box {
  margin-top: 3em;
  padding: 1.5em;
  background-color: #f8fafc;
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
}
.catatan-kaki-box h2 {
  margin-top: 0;
  color: #1e3a8a;
  font-size: 1.25em;
  border-bottom: 1px solid #bfdbfe;
  padding-bottom: 0.4em;
}
.fn-entry {
  margin-bottom: 1.2em;
  padding-bottom: 0.8em;
  border-bottom: 1px dashed #e2e8f0;
}
.fn-entry:last-child {
  border-bottom: none;
}
.fn-badge {
  display: inline-block;
  font-family: sans-serif;
  font-size: 0.82em;
  font-weight: 700;
  color: #1e40af;
  background-color: #dbeafe;
  padding: 0.2em 0.6em;
  border-radius: 4px;
  margin-bottom: 0.4em;
}
.fn-text {
  font-size: 0.95em;
  color: #334155;
  margin-top: 0.3em;
  text-indent: 0 !important;
  line-height: 1.7;
}
'''
        epub.writestr('OEBPS/style.css', css_content, compress_type=zipfile.ZIP_DEFLATED)
        
        manifest_items = [
            '<item id="style" href="style.css" media-type="text/css"/>',
            '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>'
        ]
        spine_items = []
        nav_points = []
        
        for idx, (chap_title, chap_html) in enumerate(chapters, start=1):
            file_name = f"chapter_{idx}.xhtml"
            safe_chap_title = xml_clean(chap_title)
            full_html = f'''<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="id">
<head>
  <meta charset="utf-8"/>
  <title>{safe_chap_title}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <h1>{safe_chap_title}</h1>
  {chap_html}
</body>
</html>'''
            epub.writestr(f'OEBPS/{file_name}', full_html, compress_type=zipfile.ZIP_DEFLATED)
            manifest_items.append(f'<item id="chap_{idx}" href="{file_name}" media-type="application/xhtml+xml"/>')
            spine_items.append(f'<itemref idref="chap_{idx}"/>')
            nav_points.append(f'''
    <navPoint id="navPoint-{idx}" playOrder="{idx}">
      <navLabel><text>{safe_chap_title}</text></navLabel>
      <content src="{file_name}"/>
    </navPoint>''')

        safe_title = xml_clean(title)
        safe_author = xml_clean(author)
        safe_category = xml_clean(category)
        safe_desc = xml_clean(description)

        content_opf = f'''<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>{safe_title}</dc:title>
    <dc:creator opf:role="aut">{safe_author}</dc:creator>
    <dc:language>id</dc:language>
    <dc:subject>{safe_category}</dc:subject>
    <dc:description>{safe_desc}</dc:description>
    <dc:identifier id="BookId">urn:uuid:baca-{abs(hash(title))}</dc:identifier>
  </metadata>
  <manifest>
    {' '.join(manifest_items)}
  </manifest>
  <spine toc="ncx">
    {' '.join(spine_items)}
  </spine>
</package>'''
        epub.writestr('OEBPS/content.opf', content_opf, compress_type=zipfile.ZIP_DEFLATED)
        
        toc_ncx = f'''<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:baca-{abs(hash(title))}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>{safe_title}</text></docTitle>
  <navMap>
    {''.join(nav_points)}
  </navMap>
</ncx>'''
        epub.writestr('OEBPS/toc.ncx', toc_ncx, compress_type=zipfile.ZIP_DEFLATED)
    print(f"Created EPUB: {output_path} ({len(chapters)} chapters, {os.path.getsize(output_path):,} bytes)")

print("Loading full text...")
all_lines = []
with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    for line in f:
        all_lines.append(line)

print(f"Loaded {len(all_lines):,} lines")

# 1. EXTRACT FOOTNOTES FOR PASAL 4-28 (Lines 405895 - 411175)
fn_dict_4_28 = {}
cur_pasal = None
cur_key = None
cur_text = []

for cur in range(405895, 411175):
    s = all_lines[cur-1].strip()
    if not s or s == '\xa0':
        continue
    m_p = re.match(r'^PASAL\s+(\d+)$', s, re.IGNORECASE)
    if m_p:
        if cur_key and cur_text:
            fn_dict_4_28[cur_key] = " ".join(cur_text)
            cur_text = []
        cur_pasal = int(m_p.group(1))
        cur_key = None
        continue
    
    m_fn = re.match(r'^(\d+)(\d)\s+(.+)', s)
    if m_fn and cur_pasal:
        if cur_key and cur_text:
            fn_dict_4_28[cur_key] = " ".join(cur_text)
            cur_text = []
        ayat = int(m_fn.group(1))
        cat_no = int(m_fn.group(2))
        cur_key = (cur_pasal, ayat, str(cat_no))
        cur_text.append(m_fn.group(3))
    else:
        if cur_key:
            cur_text.append(s)

if cur_key and cur_text:
    fn_dict_4_28[cur_key] = " ".join(cur_text)

print(f"Extracted {len(fn_dict_4_28)} footnotes for Pasal 4-28")

# 2. EXTRACT PASAL 1-3 VERSES & FOOTNOTES (Lines 401115 - 402492)
verses_1_3 = {} # (pasal, ayat) -> text
fn_dict_1_3 = {} # (pasal, ayat, code) -> text

cur_p = 1
cur_v = None
cur_k = None
cur_t = []

for cur in range(401115, 402493):
    s = all_lines[cur-1].strip()
    if not s or s == '\xa0' or s.startswith('o---') or s.startswith('---'):
        continue
    m_p = re.match(r'^PASAL\s+(\d+)$', s, re.IGNORECASE)
    if m_p:
        cur_p = int(m_p.group(1))
        continue
    
    m_v = re.match(r'^(\d+)\s+(.+)', s)
    m_fn = re.match(r'^(\d+)([0-9a-z])\s*(.*)', s)
    
    is_v = False
    if m_v and int(m_v.group(1)) <= 150:
        vn = int(m_v.group(1))
        if cur_v is None or vn == cur_v + 1 or (cur_v and vn == 1):
            is_v = True
            
    if is_v:
        if cur_k and cur_t:
            fn_dict_1_3[cur_k] = " ".join(cur_t)
            cur_k = None
            cur_t = []
        cur_v = int(m_v.group(1))
        verses_1_3[(cur_p, cur_v)] = m_v.group(2)
    elif m_fn and cur_v:
        if cur_k and cur_t:
            fn_dict_1_3[cur_k] = " ".join(cur_t)
            cur_t = []
        cur_k = (cur_p, int(m_fn.group(1)), m_fn.group(2))
        top = m_fn.group(3)
        if top:
            cur_t.append(top + ":")
    else:
        if cur_k:
            cur_t.append(s)

if cur_k and cur_t:
    fn_dict_1_3[cur_k] = " ".join(cur_t)

print(f"Extracted {len(verses_1_3)} verses & {len(fn_dict_1_3)} footnotes for Pasal 1-3")

# 3. EXTRACT PASAL 4-28 CLEAN VERSES (Lines 402493 - 405890)
verses_4_28 = {}
cur_p = 4
cur_v = None

for cur in range(402493, 405890):
    s = all_lines[cur-1].strip()
    if not s or s == '\xa0' or s.startswith('o---') or s.startswith('---'):
        continue
    m_p = re.match(r'^PASAL\s+(\d+)$', s, re.IGNORECASE)
    if m_p:
        cur_p = int(m_p.group(1))
        cur_v = None
        continue
    m_v = re.match(r'^(\d+)\s+(.+)', s)
    if m_v and int(m_v.group(1)) <= 150:
        vn = int(m_v.group(1))
        cur_v = vn
        verses_4_28[(cur_p, cur_v)] = m_v.group(2)
    else:
        # outline or heading or continuation
        if cur_v:
            # check if outline
            if re.match(r'^[A-Z0-9\.\s—\-]{4,80}$', s) and not any(w in s for w in ["dan", "yang", "kepada"]):
                verses_4_28[(cur_p, f"head_{cur}")] = s
            else:
                verses_4_28[(cur_p, cur_v)] = verses_4_28[(cur_p, cur_v)] + " " + s
        else:
            verses_4_28[(cur_p, f"head_{cur}")] = s

print(f"Extracted verses for Pasal 4-28!")

# COMBINE ALL FOOTNOTES INTO ONE LOOKUP
all_fn = {}
for (p, v, code), txt in fn_dict_1_3.items():
    all_fn[(p, v, str(code))] = txt
for (p, v, code), txt in fn_dict_4_28.items():
    all_fn[(p, v, str(code))] = txt

# FUNCTION TO DECORATE A VERSE
def decorate_verse(pasal_num, ayat_num, raw_text):
    def repl(m):
        code = m.group(1)
        # Find footnote text
        fn_content = all_fn.get((pasal_num, ayat_num, code), "")
        if not fn_content and len(code) > 1:
            fn_content = all_fn.get((pasal_num, ayat_num, code[0]), "")
        if not fn_content and len(code) > 1:
            fn_content = all_fn.get((pasal_num, ayat_num, code[1]), "")
            
        safe_title = xml_clean(f"Matius {pasal_num}:{ayat_num} (Catatan {code})")
        safe_fn = xml_clean(fn_content if fn_content else f"Catatan kaki {code}")
        
        return f'<a class="footnote-ref" href="#fn-{pasal_num}-{ayat_num}-{code}" data-title="{safe_title}" data-fn="{safe_fn}"><sup>[{code}]</sup></a>'

    # Replace markers like 1a, 2, 3b, 4c, 5d
    decorated = re.sub(r'(\d+[a-z]?)', repl, raw_text)
    return decorated

# BUILD THE 28 CHAPTERS
matius_chapters = []

for p_num in range(1, 29):
    chapter_verses_html = []
    chapter_fn_entries = []
    
    if p_num <= 3:
        # Collect from verses_1_3
        v_keys = sorted([k for k in verses_1_3.keys() if k[0] == p_num], key=lambda x: x[1])
        for _, v_no in v_keys:
            raw_t = verses_1_3[(p_num, v_no)]
            dec = decorate_verse(p_num, v_no, raw_t)
            chapter_verses_html.append(f'<p class="verse"><span class="verse-num">{v_no}</span>{dec}</p>')
    else:
        # Collect from verses_4_28
        v_keys = [k for k in verses_4_28.keys() if k[0] == p_num]
        for _, k_item in v_keys:
            raw_t = verses_4_28[(p_num, k_item)]
            if isinstance(k_item, str) and k_item.startswith("head_"):
                chapter_verses_html.append(f'<p class="outline-heading">{xml_clean(raw_t)}</p>')
            else:
                dec = decorate_verse(p_num, k_item, raw_t)
                chapter_verses_html.append(f'<p class="verse"><span class="verse-num">{k_item}</span>{dec}</p>')

    # Collect all footnotes for this chapter
    p_fns = sorted([k for k in all_fn.keys() if k[0] == p_num], key=lambda x: (x[1], x[2]))
    for _, v_no, code in p_fns:
        txt = all_fn[(p_num, v_no, code)]
        chapter_fn_entries.append((v_no, code, txt))

    # Build Footnote Cards HTML
    fn_cards = []
    for v_no, code, txt in chapter_fn_entries:
        fn_cards.append(f'''
<div class="fn-entry" id="fn-{p_num}-{v_no}-{code}">
  <span class="fn-badge">Ayat {v_no}, Catatan [{code}]</span>
  <p class="fn-text">{xml_clean(txt)}</p>
</div>''')

    fn_box_html = ""
    if fn_cards:
        fn_box_html = f'''
<div class="catatan-kaki-box">
  <h2>📖 Catatan Kaki &amp; Penjelasan Rohani Pasal {p_num}</h2>
  {''.join(fn_cards)}
</div>'''

    full_html = f'''
<h2>Injil Matius: Pasal {p_num}</h2>
{''.join(chapter_verses_html)}
{fn_box_html}
'''
    matius_chapters.append((f"Matius: Pasal {p_num}", full_html))

print(f"Successfully generated {len(matius_chapters)} chapters with clean verses & clickable footnotes!")

build_epub(
    r"D:\Magang\Baca\public\books\alkitab-pb-pemulihan.epub",
    "Injil Matius: Versi Pemulihan (Catatan Kaki Lengkap)",
    "Yasperin / Living Stream Ministry",
    matius_chapters,
    "Alkitab dan Firman",
    "Injil Matius Versi Pemulihan lengkap 28 Pasal dengan seluruh ayat firman yang bersih, penanda catatan kaki interaktif yang bisa diklik [1a], [2], dan penjelasan catatan kaki rohani di bawahnya."
)

# Copy to dist/books/
dist_dir = r"D:\Magang\Baca\dist\books"
if os.path.exists(dist_dir):
    import shutil
    shutil.copy2(r"D:\Magang\Baca\public\books\alkitab-pb-pemulihan.epub", dist_dir)
    print("Copied alkitab-pb-pemulihan.epub to dist/books/")

print("Finished!")
