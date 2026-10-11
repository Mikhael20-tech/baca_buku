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
  line-height: 1.8;
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
.verse {
  margin-bottom: 0.9em;
  text-indent: 0;
  line-height: 1.85;
}
.verse-num {
  font-weight: 800;
  color: #2563eb;
  margin-right: 0.5em;
  font-size: 1.05em;
}
.fn-ref {
  font-size: 0.75em;
  font-weight: bold;
  color: #d97706;
  vertical-align: super;
  padding: 0 1px;
}
.catatan-kaki-box {
  margin-top: 2.5em;
  padding: 1.5em;
  background-color: #f8fafc;
  border-left: 4px solid #3b82f6;
  border-radius: 6px;
}
.catatan-kaki-box h2 {
  margin-top: 0;
  color: #1e3a8a;
  font-size: 1.3em;
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
  font-size: 0.8em;
  font-weight: 700;
  color: #1e40af;
  background-color: #dbeafe;
  padding: 0.2em 0.6em;
  border-radius: 4px;
  margin-bottom: 0.4em;
}
.fn-topic {
  font-family: sans-serif;
  font-weight: 700;
  color: #0f172a;
  margin-left: 0.4em;
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

print("Reading full lines...")
all_lines = []
with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    for line in f:
        all_lines.append(line)

print(f"Loaded {len(all_lines):,} lines")

# Part 1 Verses: Matius 1 to 28
mat_verse_markers = [
    (1, 401115), (2, 401707), (3, 402095), (4, 402493), (5, 402617),
    (6, 402753), (7, 402845), (8, 402927), (9, 403047), (10, 403177),
    (11, 403315), (12, 403435), (13, 403607), (14, 403829), (15, 403941),
    (16, 404059), (17, 404167), (18, 404255), (19, 404341), (20, 404457),
    (21, 404565), (22, 404735), (23, 404883), (24, 405001), (25, 405185),
    (26, 405327), (27, 405583), (28, 405779), (29, 405890)
]

# Part 2 Footnotes: Matius 4 to 28
mat_fn_markers = [
    (4, 405937), (5, 406115), (6, 406535), (7, 406769), (8, 406917),
    (9, 407103), (10, 407401), (11, 407599), (12, 407827), (13, 408043),
    (14, 408303), (15, 408443), (16, 408587), (17, 408797), (18, 408919),
    (19, 409049), (20, 409199), (21, 409369), (22, 409537), (23, 409725),
    (24, 409853), (25, 410235), (26, 410657), (27, 410845), (28, 411057),
    (29, 411175)
]

fn_by_pasal = {}
for i in range(len(mat_fn_markers)-1):
    p_num, s_l = mat_fn_markers[i]
    _, e_l = mat_fn_markers[i+1]
    fn_by_pasal[p_num] = all_lines[s_l-1 : e_l-1]

def parse_fn_lines(fn_slice):
    entries = []
    cur_tag = ""
    cur_text = []
    for line in fn_slice:
        s = line.strip()
        if not s or s == '\xa0':
            continue
        # Pattern like "11    Setelah dibaptis..." or "12  Pertama..."
        m = re.match(r'^(\d{1,2})(\d)\s+(.+)', s)
        if m:
            if cur_tag and cur_text:
                entries.append((cur_tag, " ".join(cur_text)))
                cur_text = []
            ayat = m.group(1)
            cat_no = m.group(2)
            cur_tag = f"Ayat {ayat}, Catatan {cat_no}"
            cur_text.append(m.group(3))
        else:
            if cur_tag:
                cur_text.append(s)
    if cur_tag and cur_text:
        entries.append((cur_tag, " ".join(cur_text)))
    return entries

def parse_verse_slice(verse_slice):
    html_parts = []
    inline_fn_entries = []
    
    for line in verse_slice:
        s = line.strip()
        if not s or s == '\xa0' or s.startswith('o---') or s.startswith('---'):
            continue
        # Check if line is a verse: e.g. "1  Inilah 1adaftar..."
        m_verse = re.match(r'^(\d+)\s+(.+)', s)
        if m_verse and int(m_verse.group(1)) <= 150:
            v_num = m_verse.group(1)
            raw_v_text = m_verse.group(2)
            # Decorate footnote markers in verse: e.g. "1a", "2", "3b"
            decorated = re.sub(r'(\d+[a-z]?)', r'<sup class="fn-ref">[\1]</sup>', raw_v_text)
            html_parts.append(f'<p class="verse"><span class="verse-num">{v_num}</span>{decorated}</p>')
        elif re.match(r'^(PASAL|Bab|Ayat|I|II|III|IV|V|VI|VII|VIII|IX|X|[A-Z])[\.\s]', s):
            html_parts.append(f'<h3>{xml_clean(s)}</h3>')
        elif re.match(r'^(\d{1,2})(\d)\s+(.+)', s):
            # Inline footnote in pasal 1-3
            m_fn = re.match(r'^(\d{1,2})(\d)\s+(.+)', s)
            inline_fn_entries.append((f"Ayat {m_fn.group(1)}, Catatan {m_fn.group(2)}", m_fn.group(3)))
        elif re.match(r'^(\d{1,2})([a-z])\s+(.+)', s):
            # Cross reference
            m_ref = re.match(r'^(\d{1,2})([a-z])\s+(.+)', s)
            inline_fn_entries.append((f"Ayat {m_ref.group(1)}, Referensi {m_ref.group(2)}", m_ref.group(3)))
        else:
            if inline_fn_entries:
                # continuation of last inline footnote
                prev_tag, prev_txt = inline_fn_entries[-1]
                inline_fn_entries[-1] = (prev_tag, prev_txt + " " + s)
            else:
                html_parts.append(f'<p>{xml_clean(s)}</p>')
                
    return "\n".join(html_parts), inline_fn_entries

# Build 28 Chapters for Matius
matius_chapters = []

for i in range(28):
    p_num = i + 1
    s_line = mat_verse_markers[i][1]
    e_line = mat_verse_markers[i+1][1]
    v_slice = all_lines[s_line-1 : e_line-1]
    
    verse_html, inline_fns = parse_verse_slice(v_slice)
    
    # Get external footnotes if any (Pasal 4-28)
    ext_fns = []
    if p_num in fn_by_pasal:
        ext_fns = parse_fn_lines(fn_by_pasal[p_num])
    
    all_fns = inline_fns + ext_fns
    
    # Render footnotes box
    fn_html = ""
    if all_fns:
        fn_cards = []
        for badge, txt in all_fns:
            fn_cards.append(f'''
<div class="fn-entry">
  <span class="fn-badge">{xml_clean(badge)}</span>
  <p class="fn-text">{xml_clean(txt)}</p>
</div>''')
        fn_html = f'''
<div class="catatan-kaki-box">
  <h2>📖 Catatan Kaki &amp; Penjelasan Rohani Pasal {p_num}</h2>
  {''.join(fn_cards)}
</div>'''

    full_chap_html = f'''
<h2>Injil Matius: Pasal {p_num}</h2>
{verse_html}
{fn_html}
'''
    matius_chapters.append((f"Matius: Pasal {p_num}", full_chap_html))

print(f"Generated {len(matius_chapters)} chapters for Matius with full Footnotes!")

build_epub(
    r"D:\Magang\Baca\public\books\alkitab-pb-pemulihan.epub",
    "Injil Matius: Versi Pemulihan (Catatan Kaki Lengkap)",
    "Yasperin / Living Stream Ministry",
    matius_chapters,
    "Alkitab dan Firman",
    "Injil Matius Versi Pemulihan lengkap 28 Pasal dengan seluruh ayat firman, penanda catatan kaki, garis besar teologis, dan penjelasan catatan kaki rohani di setiap pasalnya."
)

# Copy to dist/books/
dist_dir = r"D:\Magang\Baca\dist\books"
if os.path.exists(dist_dir):
    import shutil
    shutil.copy2(r"D:\Magang\Baca\public\books\alkitab-pb-pemulihan.epub", dist_dir)
    print("Copied alkitab-pb-pemulihan.epub to dist/books/")

print("Done building Matius with full Footnotes EPUB!")
