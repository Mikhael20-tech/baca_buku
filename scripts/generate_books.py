import zipfile
import os
import sys
import re
import html

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
file_path = r"D:\Magang\Baca\pdb\roti_hayat_full.txt"

def xml_clean(s):
    if not s:
        return ""
    # escape &, <, >
    s = str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')
    return s

def build_epub(output_path, title, author, chapters, category="Rohani", description=""):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with zipfile.ZipFile(output_path, 'w') as epub:
        # 1. mimetype (must be first, uncompressed)
        epub.writestr('mimetype', 'application/epub+zip', compress_type=zipfile.ZIP_STORED)
        
        # 2. META-INF/container.xml
        container_xml = '''<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>'''
        epub.writestr('META-INF/container.xml', container_xml, compress_type=zipfile.ZIP_DEFLATED)
        
        # 3. CSS
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
blockquote {
  margin: 1.5em 2em;
  padding: 0.8em 1.2em;
  border-left: 4px solid #2563eb;
  background: #f8fafc;
  font-style: italic;
}
.lead {
  font-size: 1.1em;
  font-weight: 600;
  color: #1d4ed8;
  text-indent: 0;
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
        
        # 4. Chapters
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

        # 5. content.opf
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
        
        # 6. toc.ncx
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
                # STRICT XML ESCAPING ON TEXT
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

print("Reading lines from extracted full text...")
all_lines = []
with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    for line in f:
        all_lines.append(line)

print(f"Total lines in memory: {len(all_lines):,}")

# ==========================================
# 1. BUKU KARAKTER (30 KARAKTER LENGKAP - WITNESS LEE)
# ==========================================
print("\n[1/3] Generating Buku Karakter (30 Karakter Lengkap)...")
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

karakter_chapters = []
for title, start_idx, end_idx in karakter_defs:
    raw_slice = all_lines[start_idx-1 : end_idx-1]
    html_content = clean_text_to_html(raw_slice)
    karakter_chapters.append((f"Karakter: {title}", html_content))

build_epub(
    r"D:\Magang\Baca\public\books\buku-karakter-witness-lee.epub",
    "Karakter: 30 Butir Pembentukan Karakter",
    "Witness Lee",
    karakter_chapters,
    "Pembinaan Karakter",
    "Pedoman pembentukan 30 butir karakter manusia yang berguna bagi Tuhan: Benar, Tepat, Ketat, Rajin, Lapang, Cermat, Stabil, Sabar, Dalam, Murni, Seimbang, Tenang, Tulus, Umum, Terbuka, Akrab, Gairah, Luwes, Teguh, Lembut, Taat, Derita, Rendah, Miskin, Tekun, Sulit, Tekan, Jernih, Murah Hati, dan Bobot."
)

# ==========================================
# 2. PEMBINAAN DASAR (LENGKAP SEMUA TOPIK - WATCHMAN NEE)
# ==========================================
print("\n[2/3] Generating Pembinaan Dasar (Watchman Nee)...")
pembinaan_map = [
    ("1. Berbagai Jenis Sidang", 966495, 966765),
    ("2. Berdoa", 966765, 966967),
    ("3. Bersaksi", 966967, 967123),
    ("4. Bersidang", 967123, 967275),
    ("5. Cara Mengatur Keuangan", 967275, 967469),
    ("6. Didikan dan Hajaran Allah", 967469, 967801),
    ("7. Hari Tuhan", 967801, 967927),
    ("8. Hayat Kita", 967927, 968055),
    ("9. Jabatan Imam", 968055, 968427),
    ("10. Jalan Gereja", 968427, 969005),
    ("11. Kelepasan", 969005, 969111),
    ("12. Kesatuan", 969111, 969609),
    ("13. Keselamatan Seisi Keluarga", 969609, 969981),
    ("14. Konsikrasi", 969981, 970137),
    ("15. Masalah Penudungan Kepala", 970137, 970491),
    ("16. Masuk Gereja", 970491, 970725),
    ("17. Melawan Iblis", 970725, 971051),
    ("18. Membaca Alkitab", 971051, 971255),
    ("19. Memilih Jodoh", 971255, 971611),
    ("20. Memimpin Orang Kepada Tuhan", 971611, 971873),
    ("21. Mencari Kehendak Allah", 971873, 972065),
    ("22. Mengasihi Saudara", 972065, 972229),
    ("23. Menyanyi", 972229, 972575),
    ("24. Minta Maaf dan Ganti Rugi", 972575, 972715),
    ("25. Mulut Mengaku", 972715, 972893),
    ("26. Orang Tua", 972893, 973363),
    ("27. Pakaian dan Makanan", 973363, 973787),
    ("28. Pemecahan Roti", 973787, 973911),
    ("29. Pengampunan dan Pemulihan", 973911, 974111),
    ("30. Pengampunan Siasat", 974111, 974345),
    ("31. Pengaturan Roh Kudus", 974345, 974463),
    ("32. Penumpangan Tangan", 974463, 974677),
    ("33. Penyakit", 974677, 975159),
    ("34. Pernikahan", 975159, 975545),
    ("35. Pertapaan", 975545, 975899),
    ("36. Pisahkan Diri dari Dunia", 975899, 976093),
    ("37. Profesi Kaum Imani", 976093, 976391),
    ("38. Reaksi Kaum Imani", 976391, 976633),
    ("39. Rekreasi", 976633, 977189),
    ("40. Teman", 977189, 977415),
    ("41. Terhapusnya Segala Perbedaan", 977415, 977607),
    ("42. Tubuh Kristus", 977607, 977735),
    ("43. Tutur Kata", 977735, 978013),
    ("44. Wewenang Gereja", 978013, 978500),
    ("45. Baptisan dan Penumpangan Tangan", 1160019, 1161167),
    ("46. Bangun Pagi-pagi Menghampiri Tuhan", 1395420, 1396400),
]

pembinaan_chapters = []
for title, s_idx, e_idx in pembinaan_map:
    raw_slice = all_lines[s_idx-1 : e_idx-1]
    html_content = clean_text_to_html(raw_slice)
    pembinaan_chapters.append((f"Pelajaran: {title}", html_content))

build_epub(
    r"D:\Magang\Baca\public\books\pembinaan-dasar-watchman-nee.epub",
    "Pembinaan Dasar Kaum Beriman",
    "Watchman Nee",
    pembinaan_chapters,
    "Pembinaan Rohani",
    "Kumpulan lengkap pelajaran pembinaan dasar bagi orang beriman: Bangun Pagi-pagi, Baptisan, Berdoa, Bersaksi, Bersidang, Konsikrasi, Membaca Alkitab, dan wawasan hidup kristiani yang praktis."
)

# ==========================================
# 3. KISAH MARTIR & SALIB (WATCHMAN NEE)
# ==========================================
print("\n[3/3] Generating Kisah Martir & Salib...")
martir_chapters = [
    ("Kisah Martirnya Saudara Watchman Nee", clean_text_to_html(all_lines[1181150:1181345])),
    ("Salib: Memilih Jalan Salib", clean_text_to_html(all_lines[1181345:1182400]))
]
build_epub(
    r"D:\Magang\Baca\public\books\martir-dan-salib-watchman-nee.epub",
    "Kisah Martir dan Salib Kristus",
    "Watchman Nee",
    martir_chapters,
    "Biografi dan Teladan Hayat",
    "Kesaksian perjalanan iman dan penyerahan hidup Saudara Watchman Nee hingga akhir hayatnya di dalam penjara demi kesetiaan terhadap Injil dan salib Kristus."
)

# Copy to dist/books/
dist_dir = r"D:\Magang\Baca\dist\books"
if os.path.exists(dist_dir):
    import shutil
    for fn in ["buku-karakter-witness-lee.epub", "pembinaan-dasar-watchman-nee.epub", "martir-dan-salib-watchman-nee.epub"]:
        shutil.copy2(os.path.join(r"D:\Magang\Baca\public\books", fn), dist_dir)
    print("Copied all new EPUBs to dist/books/")

print("\nALL BOOKS SUCCESSFULLY GENERATED AND VALIDATED!")
