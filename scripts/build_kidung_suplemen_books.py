import os
import sys
import re
import zipfile
import html

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

rh_path = r"D:\Magang\Baca\pdb\rhv2019_full.txt"
public_books_dir = r"D:\Magang\Baca\public\books"
dist_books_dir = r"D:\Magang\Baca\dist\books"
os.makedirs(public_books_dir, exist_ok=True)
if os.path.exists(dist_books_dir):
    os.makedirs(dist_books_dir, exist_ok=True)

def xml_clean(s):
    if not s:
        return ""
    return str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

def build_epub(output_path, title, author, chapters, category="Kidung & Pujian", description=""):
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
  font-family: system-ui, -apple-system, sans-serif, serif;
  line-height: 1.8;
  padding: 1.8em 1.2em;
  color: #1e293b;
  max-width: 680px;
  margin: 0 auto;
}
.song-header {
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.8em;
  margin-bottom: 1.5em;
  text-align: center;
}
.song-num {
  font-size: 1.6em;
  font-weight: 800;
  color: #d97706;
  margin: 0;
  letter-spacing: 0.05em;
}
.song-title {
  font-size: 1.3em;
  font-weight: 700;
  color: #0f172a;
  margin: 0.3em 0 0.5em 0;
}
.song-meta {
  font-size: 0.85em;
  color: #64748b;
  margin: 0.2em 0;
  font-style: italic;
}
.verse-stanza {
  margin-bottom: 1.6em;
  padding-left: 0.5em;
  line-height: 1.9;
}
.verse-num {
  font-weight: 800;
  color: #b45309;
  margin-right: 0.4em;
  font-size: 1.05em;
}
.chorus {
  margin: 1.4em 1em;
  padding: 0.8em 1.2em;
  border-left: 4px solid #f59e0b;
  background-color: #fffbeb;
  font-style: italic;
  border-radius: 4px;
}
.chorus-tag {
  font-weight: 800;
  color: #b45309;
  text-transform: uppercase;
  font-size: 0.8em;
  letter-spacing: 0.05em;
  margin-bottom: 0.4em;
}
p {
  margin: 0.4em 0;
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
            file_name = f"song_{idx}.xhtml"
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
    <dc:language>id</dc:language>
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

    print(f"Created EPUB: {output_path} ({len(chapters)} songs, {os.path.getsize(output_path):,} bytes)")

def format_song_html(header_line, body_lines, is_suplemen=False):
    prefix = "Suplemen " if is_suplemen else "Kidung "
    # Parse header: "No. 001 : Title" or "S. 001 : Title"
    parts = header_line.split(":", 1)
    raw_num = parts[0].strip()
    title_text = parts[1].strip() if len(parts) > 1 else ""
    
    num_match = re.search(r'\d+', raw_num)
    num_str = num_match.group(0).lstrip('0') or '0' if num_match else raw_num
    
    meta_lines = []
    stanzas = []
    current_stanza = []
    is_in_chorus = False
    
    for line in body_lines:
        s = line.strip()
        if not s or s == '\xa0':
            if current_stanza:
                stanzas.append((is_in_chorus, current_stanza))
                current_stanza = []
                is_in_chorus = False
            continue
        
        # Check meta lines (before stanzas)
        if not stanzas and (s.startswith('(') or '=' in s or re.match(r'^\d+\s+\d+', s) or s.startswith('Ing.') or s.startswith('G=') or s.startswith('D=') or s.startswith('C=') or s.startswith('F=') or s.startswith('A=') or s.startswith('E=')):
            meta_lines.append(s)
            continue
            
        if re.match(r'^(Koor|Refrein|Chorus)\b', s, re.IGNORECASE):
            if current_stanza:
                stanzas.append((is_in_chorus, current_stanza))
                current_stanza = []
            is_in_chorus = True
            current_stanza.append(s)
            continue
            
        if re.match(r'^\d+\.\s+', s):
            if current_stanza:
                stanzas.append((is_in_chorus, current_stanza))
                current_stanza = []
                is_in_chorus = False
            current_stanza.append(s)
        else:
            current_stanza.append(s)
            
    if current_stanza:
        stanzas.append((is_in_chorus, current_stanza))
        
    html_parts = []
    html_parts.append('<div class="song-header">')
    html_parts.append(f'  <div class="song-num">{prefix}#{num_str}</div>')
    if title_text:
        html_parts.append(f'  <h1 class="song-title">{xml_clean(title_text)}</h1>')
    if meta_lines:
        meta_html = "<br/>".join([xml_clean(m) for m in meta_lines])
        html_parts.append(f'  <div class="song-meta">{meta_html}</div>')
    html_parts.append('</div>')
    
    for is_chorus, lines in stanzas:
        if is_chorus:
            html_parts.append('<div class="chorus">')
            for l in lines:
                if re.match(r'^(Koor|Refrein|Chorus)\b', l, re.IGNORECASE):
                    html_parts.append(f'<div class="chorus-tag">{xml_clean(l)}</div>')
                else:
                    html_parts.append(f'<p>{xml_clean(l)}</p>')
            html_parts.append('</div>')
        else:
            html_parts.append('<div class="verse-stanza">')
            for l in lines:
                vm = re.match(r'^(\d+)\.\s*(.*)', l)
                if vm:
                    html_parts.append(f'<p><span class="verse-num">{vm.group(1)}.</span> {xml_clean(vm.group(2))}</p>')
                else:
                    html_parts.append(f'<p>{xml_clean(l)}</p>')
            html_parts.append('</div>')
            
    return f"{prefix}{num_str}: {title_text}", "\n".join(html_parts)

print("Reading rhv2019_full.txt to extract Kidung and Suplemen...")
kidung_songs = []
suplemen_songs = []

current_header = None
current_body = []
parsing_type = None # 'kidung' or 'suplemen'

with open(rh_path, 'r', encoding='utf-8', errors='ignore') as f:
    for line in f:
        s = line.strip()
        
        # Detect start of Kidung song: "No. 001 : Title"
        m_kidung = re.match(r'^No\.\s*(\d+)\s*:\s*(.*)', s)
        # Detect start of Suplemen song: "S. 001 : Title"
        m_suplemen = re.match(r'^S\.\s*(\d+)\s*:\s*(.*)', s)
        
        if m_kidung:
            if current_header:
                if parsing_type == 'kidung':
                    t, h = format_song_html(current_header, current_body, is_suplemen=False)
                    kidung_songs.append((t, h))
                elif parsing_type == 'suplemen':
                    t, h = format_song_html(current_header, current_body, is_suplemen=True)
                    suplemen_songs.append((t, h))
            current_header = s
            current_body = []
            parsing_type = 'kidung'
            continue
            
        if m_suplemen:
            if current_header:
                if parsing_type == 'kidung':
                    t, h = format_song_html(current_header, current_body, is_suplemen=False)
                    kidung_songs.append((t, h))
                elif parsing_type == 'suplemen':
                    t, h = format_song_html(current_header, current_body, is_suplemen=True)
                    suplemen_songs.append((t, h))
            current_header = s
            current_body = []
            parsing_type = 'suplemen'
            continue
            
        if s == 'PELAJARAN HAYAT' and len(kidung_songs) > 100:
            # End of hymns section
            if current_header:
                if parsing_type == 'kidung':
                    t, h = format_song_html(current_header, current_body, is_suplemen=False)
                    kidung_songs.append((t, h))
                elif parsing_type == 'suplemen':
                    t, h = format_song_html(current_header, current_body, is_suplemen=True)
                    suplemen_songs.append((t, h))
            current_header = None
            current_body = []
            parsing_type = None
            break
            
        if current_header is not None:
            current_body.append(line)

print(f"Extracted {len(kidung_songs)} Kidung songs.")
print(f"Extracted {len(suplemen_songs)} Suplemen songs.")

# Build Kidung EPUB
kidung_epub_path = os.path.join(public_books_dir, "kidung-jemaat-indonesia.epub")
build_epub(
    kidung_epub_path,
    "Kidung Rohani (Kidung 1 – 792)",
    "Yasperin / LSM",
    kidung_songs,
    category="Kidung & Pujian",
    description="Kumpulan lengkap 792 Kidung Rohani (Hymns) terjemahan bahasa Indonesia, mencakup Kidung Pujian kepada Allah Bapa, Yesus Kristus, Roh Kudus, Pengalaman Hayat, dan Pembangunan Gereja."
)

# Build Suplemen EPUB
suplemen_epub_path = os.path.join(public_books_dir, "suplemen-kidung-indonesia.epub")
build_epub(
    suplemen_epub_path,
    "Suplemen Kidung Rohani (S. 1 – 341)",
    "Yasperin / LSM",
    suplemen_songs,
    category="Kidung & Pujian",
    description="Kumpulan lengkap 341 Kidung Suplemen (New Songs) pujian rohani kontemporer dan pengalaman kenikmatan Kristus, Roh, Hayat, serta Pembangunan Tubuh Kristus."
)

# Copy to dist/books/ if dist exists
if os.path.exists(dist_books_dir):
    import shutil
    shutil.copy2(kidung_epub_path, os.path.join(dist_books_dir, "kidung-jemaat-indonesia.epub"))
    shutil.copy2(suplemen_epub_path, os.path.join(dist_books_dir, "suplemen-kidung-indonesia.epub"))
    print("Copied Kidung and Suplemen EPUBs to dist/books/")

print("KIDUNG & SUPLEMEN EPUBS GENERATION COMPLETE!")
