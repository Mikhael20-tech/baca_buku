import os
import sys
import re
import zipfile

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

mb_path = r"D:\Magang\Baca\pdb\ministrybooks_full.txt"
public_books_dir = r"D:\Magang\Baca\public\books"
dist_books_dir = r"D:\Magang\Baca\dist\books"
os.makedirs(public_books_dir, exist_ok=True)
if os.path.exists(dist_books_dir):
    os.makedirs(dist_books_dir, exist_ok=True)

def xml_clean(s):
    if not s:
        return ""
    return str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

def build_epub(output_path, title, author, chapters, category="Ministry Books", description=""):
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
  font-family: system-ui, -apple-system, Georgia, Cambria, serif;
  line-height: 1.85;
  padding: 2em 1.5em;
  color: #1e293b;
  max-width: 720px;
  margin: 0 auto;
}
h1, h2, h3 {
  font-family: system-ui, -apple-system, sans-serif;
  color: #0f172a;
}
h1 {
  font-size: 1.6em;
  font-weight: 800;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.4em;
  margin-top: 1em;
  margin-bottom: 0.8em;
  color: #1e293b;
}
h2 {
  font-size: 1.2em;
  font-weight: 700;
  color: #334155;
  margin-top: 1.2em;
  margin-bottom: 0.4em;
}
h3 {
  font-size: 1.05em;
  font-weight: 600;
  color: #475569;
  margin-top: 1em;
  margin-bottom: 0.3em;
}
p {
  margin-bottom: 1.1em;
  text-indent: 1.5em;
  text-align: justify;
}
.scripture-quote {
  background: #fefce8;
  border-left: 4px solid #d97706;
  padding: 0.8em 1.2em;
  margin: 1.2em 0;
  font-style: italic;
  font-size: 0.95em;
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
            manifest_items.append(f'<item id="c_{idx}" href="{file_name}" media-type="application/xhtml+xml"/>')
            spine_items.append(f'<itemref idref="c_{idx}"/>')
            nav_points.append(f'''    <navPoint id="np_{idx}" playOrder="{idx}">
      <navLabel><text>{safe_chap_title}</text></navLabel>
      <content src="{file_name}"/>
    </navPoint>''')
            
            xhtml_content = f'''<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>{safe_chap_title}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <h1>{safe_chap_title}</h1>
{chap_html}
</body>
</html>'''
            epub.writestr(f'OEBPS/{file_name}', xhtml_content, compress_type=zipfile.ZIP_DEFLATED)
            
        content_opf = f'''<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">urn:uuid:custom-mb-{re.sub(r'[^a-zA-Z0-9]', '', title.lower())}</dc:identifier>
    <dc:title>{xml_clean(title)}</dc:title>
    <dc:creator>{xml_clean(author)}</dc:creator>
    <dc:language>en</dc:language>
    <dc:publisher>Living Stream Ministry</dc:publisher>
    <dc:description>{xml_clean(description)}</dc:description>
    <meta property="dcterms:modified">2026-01-09T00:00:00Z</meta>
  </metadata>
  <manifest>
    {''.join(manifest_items)}
  </manifest>
  <spine toc="ncx">
    {''.join(spine_items)}
  </spine>
</package>'''
        epub.writestr('OEBPS/content.opf', content_opf, compress_type=zipfile.ZIP_DEFLATED)
        
        toc_ncx = f'''<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:custom-mb-{re.sub(r'[^a-zA-Z0-9]', '', title.lower())}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>{xml_clean(title)}</text></docTitle>
  <navMap>
    {''.join(nav_points)}
  </navMap>
</ncx>'''
        epub.writestr('OEBPS/toc.ncx', toc_ncx, compress_type=zipfile.ZIP_DEFLATED)

    print(f"Created EPUB: {output_path} ({len(chapters)} chapters, {os.path.getsize(output_path):,} bytes)")

def clean_paragraphs_html(lines):
    html_paragraphs = []
    current_p = []
    
    for line in lines:
        s = line.strip()
        if not s or s == '\xa0' or s == 'Next' or s == 'Previous' or s.startswith('Chapter ') or s == 'back to top':
            if current_p:
                p_text = " ".join(current_p)
                safe_p = xml_clean(p_text)
                if re.match(r'^(Scripture Reading|Readings)\s*:\s*', p_text, re.IGNORECASE):
                    html_paragraphs.append(f'<div class="scripture-quote">{safe_p}</div>')
                elif re.match(r'^[0-9IVX]+\.\s+[A-Z\s]+$', p_text):
                    html_paragraphs.append(f'<h2>{safe_p}</h2>')
                elif re.match(r'^[A-Z]\.\s+', p_text):
                    html_paragraphs.append(f'<h3>{safe_p}</h3>')
                else:
                    html_paragraphs.append(f'<p>{safe_p}</p>')
                current_p = []
        else:
            if s.startswith('o---') or s.startswith('---') or s.startswith('>>>>'):
                continue
            current_p.append(s)
            
    if current_p:
        p_text = " ".join(current_p)
        safe_p = xml_clean(p_text)
        html_paragraphs.append(f'<p>{safe_p}</p>')
        
    return "\n".join(html_paragraphs)

print("Reading ministrybooks_full.txt...")
all_lines = []
with open(mb_path, 'r', encoding='utf-8', errors='ignore') as f:
    for line in f:
        all_lines.append(line)

print(f"Loaded {len(all_lines):,} lines.")

books_to_build = [
    {
        "filename": "the-central-line-of-the-divine-revelation.epub",
        "title": "The Central Line of the Divine Revelation",
        "author": "Witness Lee",
        "start_line": 99178,
        "end_line": 106540,
        "split_pattern": r'^(CHAPTER\s+[A-Z0-9\s\-]+|MESSAGE\s+[A-Z0-9\s\-]+)',
        "description": "Witness Lee's systematic masterpiece setting forth the central line of the divine revelation throughout the entire Bible: the Triune God, the divine economy, Christ, the Spirit, the divine life, the church as the Body of Christ, and the New Jerusalem."
    },
    {
        "filename": "life-study-of-job.epub",
        "title": "Life-Study of Job",
        "author": "Witness Lee",
        "start_line": 327720,
        "end_line": 338018,
        "split_pattern": r'^(MESSAGE\s+[A-Z0-9\s\-]+|CHAPTER\s+[A-Z0-9\s\-]+)',
        "description": "The complete Life-study of Job in 38 messages expounding God's dealing with His seekers, stripping them of their self-attained human integrity so they may be filled with the Triune God."
    }
]

for vol in books_to_build:
    s_idx = vol["start_line"] - 1
    e_idx = vol["end_line"] - 1
    raw_slice = all_lines[s_idx:e_idx]
    
    chapters = []
    cur_title = None
    cur_lines = []
    chap_num = 0
    
    for line in raw_slice:
        s = line.strip()
        m_chap = re.match(vol["split_pattern"], s, re.IGNORECASE)
        if m_chap and len(s) < 40:
            if cur_lines:
                ch_title = cur_title or f"Chapter {chap_num}"
                chapters.append((ch_title, clean_paragraphs_html(cur_lines)))
                cur_lines = []
            chap_num += 1
            cur_title = f"{s.title()}"
            continue
            
        cur_lines.append(line)
        
    if cur_lines:
        ch_title = cur_title or f"Chapter {chap_num}"
        chapters.append((ch_title, clean_paragraphs_html(cur_lines)))
        
    out_path = os.path.join(public_books_dir, vol["filename"])
    build_epub(
        out_path,
        vol["title"],
        vol["author"],
        chapters,
        category="Ministry Books",
        description=vol["description"]
    )
    
    if os.path.exists(dist_books_dir):
        import shutil
        shutil.copy2(out_path, os.path.join(dist_books_dir, vol["filename"]))

print("\nFinished building books!")
