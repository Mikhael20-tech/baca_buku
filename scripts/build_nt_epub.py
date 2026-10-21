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
h1 { font-size: 1.8em; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3em; color: #0f172a; }
h2 { font-size: 1.3em; color: #334155; }
h3 { font-size: 1.1em; color: #475569; }
p {
  margin-bottom: 1.2em;
  text-indent: 1.5em;
  text-align: justify;
}
.verse {
  margin-bottom: 0.8em;
  text-indent: 0;
}
.verse-num {
  font-weight: bold;
  color: #2563eb;
  margin-right: 0.4em;
}
.footnote {
  font-size: 0.9em;
  color: #4b5563;
  background: #f1f5f9;
  padding: 0.5em 0.8em;
  border-left: 3px solid #3b82f6;
  margin: 0.6em 0;
  text-indent: 0;
  border-radius: 4px;
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

from fix_all_book_typos import clean_text

def clean_bible_to_html(lines):
    html_out = []
    current_p = []
    for line in lines:
        s = line.strip()
        if not s or s == '\xa0':
            if current_p:
                raw_txt = " ".join(current_p)
                raw_txt = clean_text(raw_txt)
                m_verse = re.match(r'^(\d+)\s+(.+)', raw_txt)
                if m_verse and int(m_verse.group(1)) <= 150:
                    v_num = m_verse.group(1)
                    v_txt = xml_clean(m_verse.group(2))
                    html_out.append(f'<p class="verse"><span class="verse-num">{v_num}</span>{v_txt}</p>')
                elif re.match(r'^[0-9]+[a-z0-9]?\s+', raw_txt) and len(raw_txt) > 30:
                    safe_fn = xml_clean(raw_txt)
                    html_out.append(f'<div class="footnote"><strong>Catatan Kaki:</strong> {safe_fn}</div>')
                elif re.match(r'^(PASAL|Bab)\s+\d+', raw_txt, re.IGNORECASE):
                    safe_h = xml_clean(raw_txt)
                    html_out.append(f'<h2>{safe_h}</h2>')
                elif re.match(r'^[A-Z0-9\.\s—\-]{4,50}$', raw_txt):
                    safe_h = xml_clean(raw_txt)
                    html_out.append(f'<h3>{safe_h}</h3>')
                else:
                    safe_p = xml_clean(raw_txt)
                    html_out.append(f'<p>{safe_p}</p>')
                current_p = []
        else:
            if s.startswith('o---') or s.startswith('---') or s.startswith('>>>>'):
                continue
            current_p.append(s)
    if current_p:
        raw_txt = " ".join(current_p)
        raw_txt = clean_text(raw_txt)
        safe_p = xml_clean(raw_txt)
        html_out.append(f'<p>{safe_p}</p>')
    return "\n".join(html_out)

print("Reading NT lines from 2048759 to 2122000...")
nt_lines = []
with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    for cur, line in enumerate(f, 1):
        if 2048759 <= cur <= 2122000:
            nt_lines.append(line)
        elif cur > 2122000:
            break

print(f"Loaded {len(nt_lines):,} NT lines")

# Split large books so chapters are maximum ~1200 lines each (very fast load in epub.js!)
CHUNK_SIZE = 1200
pb_chapters = []

# Book markers
pb_markers = [
    (0, "Injil Matius"),
    (9360, "Injil Markus"),
    (13764, "Injil Lukas"),
    (20466, "Injil Yohanes"),
    (25920, "Kisah Para Rasul"),
    (34636, "Surat Roma"),
    (47036, "Surat Efesus"),
    (69434, "Kitab Wahyu"),
    (len(nt_lines), "End")
]

for idx in range(len(pb_markers)-1):
    b_start, b_name = pb_markers[idx]
    b_end, _ = pb_markers[idx+1]
    b_lines = nt_lines[b_start:b_end]
    
    # If the book is small (< 1500 lines), make it 1 chapter
    if len(b_lines) <= CHUNK_SIZE:
        html = clean_bible_to_html(b_lines)
        pb_chapters.append((b_name, html))
    else:
        # Split into parts
        num_parts = (len(b_lines) + CHUNK_SIZE - 1) // CHUNK_SIZE
        for p in range(num_parts):
            p_slice = b_lines[p*CHUNK_SIZE : (p+1)*CHUNK_SIZE]
            html = clean_bible_to_html(p_slice)
            pb_chapters.append((f"{b_name} (Bagian {p+1}/{num_parts})", html))

print(f"Total split chapters: {len(pb_chapters)}")

build_epub(
    r"D:\Magang\Baca\public\books\alkitab-pb-pemulihan.epub",
    "Alkitab PB Versi Pemulihan (Catatan Kaki)",
    "Yasperin / Living Stream Ministry",
    pb_chapters,
    "Alkitab dan Firman",
    "Alkitab Perjanjian Baru Versi Pemulihan lengkap dengan garis besar pokok kitab, keterangan penulis, ayat firman, dan catatan kaki penjelasan wahyu rohani (Injil Matius s/d Kitab Wahyu)."
)

# Copy to dist/books/
dist_dir = r"D:\Magang\Baca\dist\books"
if os.path.exists(dist_dir):
    import shutil
    shutil.copy2(r"D:\Magang\Baca\public\books\alkitab-pb-pemulihan.epub", dist_dir)
    print("Copied alkitab-pb-pemulihan.epub to dist/books/")

print("Done building NT EPUB!")
