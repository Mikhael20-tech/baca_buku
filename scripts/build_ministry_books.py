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
  font-size: 1.7em;
  font-weight: 800;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.4em;
  margin-top: 1em;
  margin-bottom: 0.8em;
  color: #1e293b;
}
h2 {
  font-size: 1.25em;
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
  background: #f8fafc;
  border-left: 4px solid #0284c7;
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
            
            xhtml_doc = f'''<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>{safe_chap_title}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
<h1>{safe_chap_title}</h1>
{chap_html}
</body>
</html>'''
            epub.writestr(f'OEBPS/{file_name}', xhtml_doc, compress_type=zipfile.ZIP_DEFLATED)
            
        safe_title = xml_clean(title)
        safe_author = xml_clean(author)
        safe_desc = xml_clean(description)
        safe_cat = xml_clean(category)
        
        content_opf = f'''<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>{safe_title}</dc:title>
    <dc:creator opf:role="aut">{safe_author}</dc:creator>
    <dc:language>en</dc:language>
    <dc:identifier id="BookId">urn:uuid:baca-{abs(hash(title))}</dc:identifier>
    <dc:subject>{safe_cat}</dc:subject>
    <dc:description>{safe_desc}</dc:description>
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

print("Reading ministrybooks_full.txt lines into memory...")
all_lines = []
with open(mb_path, 'r', encoding='utf-8', errors='ignore') as f:
    for line in f:
        all_lines.append(line)

print(f"Loaded {len(all_lines):,} lines.")

# Define top classics in Ministry Books
ministry_volumes = [
    {
        "filename": "the-all-inclusive-christ.epub",
        "title": "The All-Inclusive Christ",
        "author": "Witness Lee",
        "start_line": 10317,
        "end_line": 18218,
        "description": "Witness Lee's masterpiece expounding the rich types of the good land in Deuteronomy as a type of the all-inclusive Christ who is our full inheritance."
    },
    {
        "filename": "the-normal-christian-church-life.epub",
        "title": "The Normal Christian Church Life",
        "author": "Watchman Nee",
        "start_line": 18219,
        "end_line": 18459,
        "description": "Watchman Nee's essential work on the biblical pattern and practice of the church, the apostles, the elders, and the boundary of the local church."
    },
    {
        "filename": "the-glorious-church.epub",
        "title": "The Glorious Church",
        "author": "Watchman Nee",
        "start_line": 18461,
        "end_line": 28510,
        "description": "Four profound biblical types of the church in God's eternal purpose: Eve, Rebekah, Asenath, and the Sun-clothed Woman in Revelation."
    },
    {
        "filename": "the-economy-of-god.epub",
        "title": "The Economy of God",
        "author": "Witness Lee",
        "start_line": 33530,
        "end_line": 46875,
        "description": "A landmark classic unfolding God's household administration to impart Himself in His Divine Trinity into His chosen believers as their life and everything."
    },
    {
        "filename": "the-knowledge-of-life.epub",
        "title": "The Knowledge of Life",
        "author": "Witness Lee",
        "start_line": 46877,
        "end_line": 70760,
        "description": "The foundational teaching on divine life: What life is, the law of the spirit of life, the sense of life, and the clearance of the past."
    },
    {
        "filename": "the-release-of-the-spirit.epub",
        "title": "The Release of the Spirit",
        "author": "Watchman Nee",
        "start_line": 142345,
        "end_line": 148170,
        "description": "Watchman Nee's profound messages on the breaking of the outer man so that the inner man and the Holy Spirit may be released to minister life to others."
    },
    {
        "filename": "the-experience-of-life.epub",
        "title": "The Experience of Life",
        "author": "Witness Lee",
        "start_line": 207619,
        "end_line": 226590,
        "description": "The definitive guide to the nineteen progressive steps of spiritual experience in Christ: from regeneration and consecration to reigning in life."
    },
    {
        "filename": "spiritual-authority.epub",
        "title": "Spiritual Authority",
        "author": "Watchman Nee",
        "start_line": 522919,
        "end_line": 544580,
        "description": "Watchman Nee's authoritative messages on God's throne, the authority of Christ, and the spiritual principles of obedience and delegated authority in the church."
    }
]

for vol in ministry_volumes:
    s_idx = vol["start_line"] - 1
    e_idx = vol["end_line"] - 1
    raw_slice = all_lines[s_idx:e_idx]
    
    # Split raw slice into chapters based on CHAPTER headers
    chapters = []
    cur_title = None
    cur_lines = []
    chap_num = 0
    
    for line in raw_slice:
        s = line.strip()
        m_chap = re.match(r'^(CHAPTER\s+[A-Z0-9\s\-]+)', s, re.IGNORECASE)
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
        
    if not chapters:
        chunk_size = 250
        for i in range(0, len(raw_slice), chunk_size):
            chunk = raw_slice[i:i+chunk_size]
            chapters.append((f"Section {len(chapters)+1}", clean_paragraphs_html(chunk)))
            
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

print("\nALL MINISTRY BOOKS GENERATED SUCCESSFULLY!")
