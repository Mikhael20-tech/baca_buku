import zipfile
import os
import sys
import re
import shutil
from fix_all_book_typos import clean_text

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
file_path = r"D:\Magang\Baca\pdb\roti_hayat_full.txt"

def xml_clean(s):
    if not s:
        return ""
    return str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

def build_epub(output_path, title, author, chapters, category="Alkitab & Firman", description=""):
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
h2 { font-size: 1.35em; color: #1e40af; margin-top: 1.8em; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.2em; }
h3 { font-size: 1.1em; color: #334155; }
p {
  margin-bottom: 1.1em;
  text-indent: 1.5em;
  text-align: justify;
}
.outline-heading {
  font-family: sans-serif;
  font-size: 1.05em;
  font-weight: 700;
  color: #1e3a8a;
  margin-top: 1.4em;
  margin-bottom: 0.3em;
  text-indent: 0 !important;
}
.outline-sub {
  font-family: sans-serif;
  font-size: 0.9em;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.6em;
  text-indent: 0 !important;
}
.verse {
  margin-bottom: 0.7em;
  text-indent: 0;
  line-height: 1.85;
}
.verse-num {
  font-weight: 800;
  color: #2563eb;
  margin-right: 0.35em;
  font-size: 1.05em;
}
'''
        epub.writestr('OEBPS/style.css', css_content, compress_type=zipfile.ZIP_DEFLATED)
        
        manifest_items = [
            '<item id="style" href="style.css" media-type="text/css"/>',
            '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>'
        ]
        spine_items = []
        nav_points = []
        
        for idx, (chap_title, chap_html, sub_navs) in enumerate(chapters, start=1):
            file_name = f"book_{idx}.xhtml"
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
            
            sub_xml = []
            for sub_id, sub_label, sub_anchor in sub_navs:
                safe_sub_label = xml_clean(sub_label)
                sub_xml.append(f'''
      <navPoint id="np-{sub_id}" playOrder="{sub_id}">
        <navLabel><text>{safe_sub_label}</text></navLabel>
        <content src="{file_name}#{sub_anchor}"/>
      </navPoint>''')
                
            nav_points.append(f'''
    <navPoint id="navPoint-{idx}" playOrder="{idx}">
      <navLabel><text>{safe_chap_title}</text></navLabel>
      <content src="{file_name}"/>
      {''.join(sub_xml)}
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
    <meta name="dtb:depth" content="2"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>{safe_title}</text></docTitle>
  <navMap>
    {''.join(nav_points)}
  </navMap>
</ncx>'''
        epub.writestr('OEBPS/toc.ncx', toc_ncx, compress_type=zipfile.ZIP_DEFLATED)
    print(f"Created EPUB: {output_path} ({len(chapters)} books, {os.path.getsize(output_path):,} bytes)")

def parse_bible_slice_to_html(lines, book_name):
    html_parts = []
    sub_navs = [] # (sub_id, label, anchor)
    cur_chapter = None
    sub_counter = 1000
    
    for l in lines:
        s = l.strip()
        if not s or s == '\xa0':
            continue
        if s.startswith('o---') or s.startswith('---') or s.startswith('>>>>') or s.startswith('Ayat :') or s.startswith('Ayat:'):
            continue
            
        # Match Chapter heading e.g. "PASAL 1", "MAZMUR 1", "PASAL 24"
        m_pasal = re.match(r'^(PASAL|MAZMUR)\s+(\d+)$', s, re.IGNORECASE)
        if m_pasal:
            cur_chapter = int(m_pasal.group(2))
            anchor = f"pasal-{cur_chapter}"
            label = f"{book_name} Pasal {cur_chapter}"
            sub_navs.append((sub_counter, label, anchor))
            sub_counter += 1
            html_parts.append(f'<h2 id="{anchor}">{xml_clean(label)}</h2>')
            continue
            
        # Match Outline headings (e.g. "I. Penciptaan Allah", "A. Keinginan dan Tujuan", "1. Ciptaan Allah")
        if re.match(r'^[I|V|X|A-Z0-9\.\s—\-\:\(\)]+$', s) and len(s) < 80 and not re.search(r'\b(dan|yang|kepada|di|oleh|dengan)\b', s):
            html_parts.append(f'<p class="outline-heading">{xml_clean(s)}</p>')
            continue
            
        # Match verse: starts with digit e.g. "1   1aPada 2mulanya...", "26 Berfirmanlah Allah:..."
        m_verse = re.match(r'^(\d+)\s+(.+)', s)
        if m_verse and int(m_verse.group(1)) <= 176:
            v_num = m_verse.group(1)
            v_txt = m_verse.group(2)
            clean_body = re.sub(r'\b\d+[a-z]?([A-Za-z])', r'\1', v_txt)
            clean_body = clean_text(clean_body)
            html_parts.append(f'<p class="verse"><span class="verse-num">{v_num}</span>{xml_clean(clean_body)}</p>')
        else:
            # continuation or general paragraph
            clean_s = clean_text(s)
            html_parts.append(f'<p>{xml_clean(clean_s)}</p>')
            
    return "\n".join(html_parts), sub_navs

print("Loading full text...")
all_lines = []
with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    for line in f:
        all_lines.append(line)

print(f"Loaded {len(all_lines):,} lines")

# Canonical 39 OT Books
OT_DEFS = [
    ("Kitab Kejadian", 682211, 689457),
    ("Kitab Keluaran", 689457, 695639),
    ("Kitab Imamat", 695639, 699429),
    ("Kitab Bilangan", 699429, 704223),
    ("Kitab Ulangan", 704223, 708253),
    ("Kitab Yosua", 708253, 710701),
    ("Kitab Hakim-Hakim", 710701, 712841),
    ("Kitab Rut", 712841, 713377),
    ("Kitab 1 Samuel", 713377, 716231),
    ("Kitab 2 Samuel", 716231, 718559),
    ("Kitab 1 Raja-Raja", 718559, 721639),
    ("Kitab 2 Raja-Raja", 721639, 724237),
    ("Kitab 1 Tawarikh", 724237, 727279),
    ("Kitab 2 Tawarikh", 727279, 730371),
    ("Kitab Ezra", 730371, 731501),
    ("Kitab Nehemia", 731501, 732949),
    ("Kitab Ester", 732949, 733629),
    ("Kitab Ayub", 733629, 737257),
    ("Kitab Mazmur", 737257, 746215),
    ("Kitab Amsal", 746215, 748795),
    ("Kitab Pengkhotbah", 748795, 749705),
    ("Kitab Kidung Agung", 749705, 750923),
    ("Kitab Yesaya", 750923, 756311),
    ("Kitab Yeremia", 756311, 761143),
    ("Kitab Ratapan", 761143, 761799),
    ("Kitab Yehezkiel", 761799, 766401),
    ("Kitab Daniel", 766401, 768257),
    ("Kitab Hosea", 768257, 769381),
    ("Kitab Yoel", 769381, 769761),
    ("Kitab Amos", 769761, 770543),
    ("Kitab Obaja", 770543, 770739),
    ("Kitab Yunus", 770739, 771057),
    ("Kitab Mikha", 771057, 771595),
    ("Kitab Nahum", 771595, 771919),
    ("Kitab Habakuk", 771919, 772295),
    ("Kitab Zefanya", 772295, 772653),
    ("Kitab Hagai", 772653, 772953),
    ("Kitab Zakharia", 772953, 774289),
    ("Kitab Maleakhi", 774289, 774718),
]

# Canonical 27 NT Books
NT_DEFS = [
    ("Injil Matius", 774719, 784079),
    ("Injil Markus", 784079, 788483),
    ("Injil Lukas", 788483, 795185),
    ("Injil Yohanes", 795185, 800639),
    ("Kisah Para Rasul", 800639, 809355),
    ("Surat Roma", 809355, 811473),
    ("Surat 1 Korintus", 811473, 817047),
    ("Surat 2 Korintus", 817047, 819795),
    ("Surat Galatia", 819795, 821755),
    ("Surat Efesus", 821755, 824201),
    ("Surat Filipi", 824201, 825257),
    ("Surat Kolose", 825257, 826603),
    ("Surat 1 Tesalonika", 826603, 827509),
    ("Surat 2 Tesalonika", 827509, 828245),
    ("Surat 1 Timotius", 828245, 829805),
    ("Surat 2 Timotius", 829805, 830500),
    ("Surat Titus", 830500, 831390),
    ("Surat Filemon", 831390, 832745),
    ("Surat Ibrani", 832745, 834485),
    ("Surat Yakobus", 834485, 836257),
    ("Surat 1 Petrus", 836257, 837891),
    ("Surat 2 Petrus", 837891, 839233),
    ("Surat 1 Yohanes", 839233, 840809),
    ("Surat 2 Yohanes", 840809, 841185),
    ("Surat 3 Yohanes", 841185, 841369),
    ("Surat Yudas", 841369, 841897),
    ("Kitab Wahyu", 841897, 847775),
]

print("\n--- Generating Perjanjian Baru (27 Kitab Lengkap) ---")
nt_chapters = []
for name, s_idx, e_idx in NT_DEFS:
    raw_slice = all_lines[s_idx-1 : e_idx-1]
    html, sub_navs = parse_bible_slice_to_html(raw_slice, name)
    nt_chapters.append((name, html, sub_navs))

pb_epub_path = r"D:\Magang\Baca\public\books\alkitab-perjanjian-baru.epub"
build_epub(
    pb_epub_path,
    "Alkitab: Perjanjian Baru (27 Kitab Lengkap)",
    "Yasperin / Living Stream Ministry",
    nt_chapters,
    "Alkitab & Firman",
    "Alkitab Versi Pemulihan Perjanjian Baru lengkap 27 Kitab dari Injil Matius sampai Kitab Wahyu dengan seluruh ayat firman, outline teologis, dan navigasi pasal lengkap."
)

print("\n--- Generating Perjanjian Lama (39 Kitab Lengkap) ---")
ot_chapters = []
for name, s_idx, e_idx in OT_DEFS:
    raw_slice = all_lines[s_idx-1 : e_idx-1]
    html, sub_navs = parse_bible_slice_to_html(raw_slice, name)
    ot_chapters.append((name, html, sub_navs))

pl_epub_path = r"D:\Magang\Baca\public\books\alkitab-perjanjian-lama.epub"
build_epub(
    pl_epub_path,
    "Alkitab: Perjanjian Lama (39 Kitab Lengkap)",
    "Yasperin / Living Stream Ministry",
    ot_chapters,
    "Alkitab & Firman",
    "Alkitab Versi Pemulihan Perjanjian Lama lengkap 39 Kitab dari Kitab Kejadian sampai Kitab Maleakhi dengan seluruh ayat firman, outline teologis, dan navigasi pasal lengkap."
)

# Copy to dist
dist_dir = r"D:\Magang\Baca\dist\books"
if os.path.exists(dist_dir):
    shutil.copy2(pb_epub_path, dist_dir)
    shutil.copy2(pl_epub_path, dist_dir)
    print("Copied PL & PB epubs to dist/books/")

print("\nFinished generating complete Bible EPUBs (PL + PB)!")
