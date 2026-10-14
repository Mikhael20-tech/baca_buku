import zipfile
import os
import sys
import re
import shutil

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
file_path = r"D:\Magang\Baca\pdb\roti_hayat_full.txt"

def xml_clean(s):
    if not s:
        return ""
    return str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

def build_epub(output_path, title, author, chapters, category="Pembinaan Karakter", description=""):
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

def clean_text_to_html(lines):
    html_paragraphs = []
    current_p = []
    for line in lines:
        s = line.strip()
        if not s or s == '\xa0':
            if current_p:
                p_text = " ".join(current_p)
                p_text = re.sub(r'(\w+)[\?‑\-](\w+)', r'\1\2', p_text)
                safe_p = xml_clean(p_text)
                if re.match(r'^[0-9IVX]+\.\s+[A-Z\s]+$', p_text):
                    html_paragraphs.append(f"<h2>{safe_p}</h2>")
                elif re.match(r'^[a-z0-9]\.\s+', p_text):
                    html_paragraphs.append(f"<h3>{safe_p}</h3>")
                else:
                    html_paragraphs.append(f"<p>{safe_p}</p>")
                current_p = []
        else:
            if s.startswith('o---') or s.startswith('---') or s.startswith('>>>>'):
                continue
            current_p.append(s)
    if current_p:
        p_text = " ".join(current_p)
        p_text = re.sub(r'(\w+)[\?‑\-](\w+)', r'\1\2', p_text)
        safe_p = xml_clean(p_text)
        html_paragraphs.append(f"<p>{safe_p}</p>")
    return "\n".join(html_paragraphs)

print("Reading full text...")
all_lines = []
with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    for line in f:
        all_lines.append(line)

print(f"Loaded {len(all_lines):,} lines")

karakter_defs = [
    ("1. Benar", 1174455, 1174683),
    ("2. Tepat", 1174683, 1174883),
    ("3. Ketat", 1174883, 1175041),
    ("4. Rajin", 1175041, 1175273),
    ("5. Lapang", 1175273, 1175461),
    ("6. Cermat", 1175461, 1175691),
    ("7. Stabil", 1175691, 1175917),
    ("8. Sabar", 1175917, 1176173),
    ("9. Dalam", 1176173, 1176377),
    ("10. Murni", 1176377, 1176529),
    ("11. Seimbang", 1176529, 1176731),
    ("12. Tenang", 1176731, 1176911),
    ("13. Tulus", 1176911, 1177103),
    ("14. Umum", 1177103, 1177301),
    ("15. Terbuka", 1177301, 1177575),
    ("16. Akrab", 1177575, 1177767),
    ("17. Gairah", 1177767, 1177993),
    ("18. Luwes", 1177993, 1178199),
    ("19. Teguh", 1178199, 1178489),
    ("20. Lembut", 1178489, 1178687),
    ("21. Taat", 1178687, 1179185),
    ("22. Derita", 1179185, 1179525),
    ("23. Rendah", 1179525, 1179703),
    ("24. Miskin", 1179703, 1179983),
    ("25. Tekun", 1179983, 1180167),
    ("26. Sulit", 1180167, 1180333),
    ("27. Tekan", 1180333, 1180537),
    ("28. Jernih", 1180537, 1180731),
    ("29. Murah Hati", 1180731, 1180935),
    ("30. Bobot", 1180935, 1181150),
]

# Generate all 30 individual Karakter series
for s_num, (title, s_idx, e_idx) in enumerate(karakter_defs, 1):
    raw_slice = all_lines[s_idx-1 : e_idx-1]
    html = clean_text_to_html(raw_slice)
    # Extract clean trait name without number
    trait_name = re.sub(r'^\d+\.\s*', '', title)
    chapters = [(f"Karakter {s_num}: {trait_name}", html)]
    
    out_file = rf"D:\Magang\Baca\public\books\buku-karakter-seri-{s_num}.epub"
    book_title = f"Buku Karakter Seri {s_num}: {trait_name}"
    book_desc = f"Buku Karakter Seri {s_num}: {trait_name} karya Witness Lee tentang pembentukan karakter manusia yang berguna bagi Tuhan."
    build_epub(out_file, book_title, "Witness Lee", chapters, "Pembinaan Karakter", book_desc)
    
    # Copy to dist
    dist_out = rf"D:\Magang\Baca\dist\books\buku-karakter-seri-{s_num}.epub"
    if os.path.exists(r"D:\Magang\Baca\dist\books"):
        shutil.copy2(out_file, dist_out)

print("Successfully generated all 30 Karakter Series EPUBs!")
