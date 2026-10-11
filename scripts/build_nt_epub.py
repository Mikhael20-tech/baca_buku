import zipfile
import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
file_path = r"D:\Magang\Baca\pdb\roti_hayat_full.txt"

def build_epub(output_path, title, author, chapters, category="Kitab Suci & Firman"):
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
  line-height: 1.7;
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
  padding: 0.4em 0.8em;
  border-left: 3px solid #64748b;
  margin: 0.6em 0;
  text-indent: 0;
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
            full_html = f'''<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="id">
<head>
  <meta charset="utf-8"/>
  <title>{chap_title}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <h1>{chap_title}</h1>
  {chap_html}
</body>
</html>'''
            epub.writestr(f'OEBPS/{file_name}', full_html, compress_type=zipfile.ZIP_DEFLATED)
            manifest_items.append(f'<item id="chap_{idx}" href="{file_name}" media-type="application/xhtml+xml"/>')
            spine_items.append(f'<itemref idref="chap_{idx}"/>')
            nav_points.append(f'''
    <navPoint id="navPoint-{idx}" playOrder="{idx}">
      <navLabel><text>{chap_title}</text></navLabel>
      <content src="{file_name}"/>
    </navPoint>''')

        content_opf = f'''<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>{title}</dc:title>
    <dc:creator opf:role="aut">{author}</dc:creator>
    <dc:language>id</dc:language>
    <dc:subject>{category}</dc:subject>
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
  <docTitle><text>{title}</text></docTitle>
  <navMap>
    {''.join(nav_points)}
  </navMap>
</ncx>'''
        epub.writestr('OEBPS/toc.ncx', toc_ncx, compress_type=zipfile.ZIP_DEFLATED)
    print(f"Created EPUB: {output_path} ({len(chapters)} chapters, {os.path.getsize(output_path):,} bytes)")

def clean_bible_to_html(lines):
    html_out = []
    current_p = []
    for line in lines:
        s = line.strip()
        if not s or s == '\xa0':
            if current_p:
                txt = " ".join(current_p)
                txt = re.sub(r'(\w+)[\?‑\-](\w+)', r'\1\2', txt)
                # Check if it's a verse line like "1 Inilah silsilah..."
                m_verse = re.match(r'^(\d+)\s+(.+)', txt)
                if m_verse and int(m_verse.group(1)) <= 150:
                    v_num = m_verse.group(1)
                    v_txt = m_verse.group(2)
                    html_out.append(f'<p class="verse"><span class="verse-num">{v_num}</span>{v_txt}</p>')
                elif re.match(r'^[0-9]+[a-z0-9]?\s+', txt) and len(txt) > 30:
                    html_out.append(f'<div class="footnote"><strong>Catatan Kaki:</strong> {txt}</div>')
                elif re.match(r'^(PASAL|Bab)\s+\d+', txt, re.IGNORECASE):
                    html_out.append(f'<h2>{txt}</h2>')
                elif re.match(r'^[A-Z0-9\.\s—\-]{4,50}$', txt):
                    html_out.append(f'<h3>{txt}</h3>')
                else:
                    html_out.append(f'<p>{txt}</p>')
                current_p = []
        else:
            if s.startswith('o---') or s.startswith('---') or s.startswith('>>>>'):
                continue
            current_p.append(s)
    if current_p:
        txt = " ".join(current_p)
        txt = re.sub(r'(\w+)[\?‑\-](\w+)', r'\1\2', txt)
        html_out.append(f'<p>{txt}</p>')
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

# Let's find book start lines inside nt_lines
pb_books_list = [
    ("Injil Matius", "INJIL MATIUS"),
    ("Injil Markus", "INJIL MARKUS"),
    ("Injil Lukas", "INJIL LUKAS"),
    ("Injil Yohanes", "INJIL YOHANES"),
    ("Kisah Para Rasul", "KISAH PARA RASUL"),
    ("Surat Roma", "SURAT ROMA"),
    ("Surat 1 Korintus", "1 KORINTUS"),
    ("Surat 2 Korintus", "2 KORINTUS"),
    ("Surat Galatia", "GALATIA"),
    ("Surat Efesus", "SURAT EFESUS"),
    ("Surat Filipi", "FILIPI"),
    ("Surat Kolose", "KOLOSE"),
    ("Surat 1 Tesalonika", "1 TESALONIKA"),
    ("Surat 2 Tesalonika", "2 TESALONIKA"),
    ("Surat 1 Timotius", "1 TIMOTIUS"),
    ("Surat 2 Timotius", "2 TIMOTIUS"),
    ("Surat Titus", "TITUS"),
    ("Surat Filemon", "FILEMON"),
    ("Surat Ibrani", "IBRANI"),
    ("Surat Yakobus", "YAKOBUS"),
    ("Surat 1 Petrus", "1 PETRUS"),
    ("Surat 2 Petrus", "2 PETRUS"),
    ("Surat 1 Yohanes", "1 YOHANES"),
    ("Surat 2 Yohanes", "2 YOHANES"),
    ("Surat 3 Yohanes", "3 YOHANES"),
    ("Surat Yudas", "YUDAS"),
    ("Kitab Wahyu", "SURAT WAHYU")
]

book_positions = []
for idx, line in enumerate(nt_lines):
    s = line.strip().upper()
    for name, tag in pb_books_list:
        if s == tag:
            # avoid duplicates
            if not book_positions or book_positions[-1][0] != name:
                book_positions.append((name, idx))
            break

print("Identified book start indices:")
for name, pos in book_positions:
    print(f"  {name}: relative line {pos}")

# Build chapters
pb_chapters = []
for i in range(len(book_positions)):
    name, start_pos = book_positions[i]
    end_pos = book_positions[i+1][1] if i+1 < len(book_positions) else len(nt_lines)
    slice_lines = nt_lines[start_pos:end_pos]
    html = clean_bible_to_html(slice_lines)
    pb_chapters.append((name, html))

build_epub(
    r"D:\Magang\Baca\public\books\alkitab-pb-pemulihan.epub",
    "Alkitab Perjanjian Baru Versi Pemulihan (Lengkap Catatan Kaki)",
    "Yasperin / Living Stream Ministry",
    pb_chapters,
    "Alkitab & Firman"
)

# Copy to dist/books/
dist_dir = r"D:\Magang\Baca\dist\books"
if os.path.exists(dist_dir):
    import shutil
    shutil.copy2(r"D:\Magang\Baca\public\books\alkitab-pb-pemulihan.epub", dist_dir)
    print("Copied alkitab-pb-pemulihan.epub to dist/books/")

print("Done building NT EPUB!")
