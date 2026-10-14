import zipfile
import os

def xml_clean(s):
    return str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

def create_epub(output_path, title, author, chapters, category="FKKP (Kebangunan Pagi)"):
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
  padding: 1.8em;
  color: #1a1a1a;
  background-color: transparent;
}
h1, h2, h3 {
  font-family: sans-serif;
  color: #1e293b;
  margin-top: 1.2em;
  margin-bottom: 0.6em;
}
h1 { font-size: 1.8em; border-bottom: 2px solid #d97706; padding-bottom: 0.3em; color: #92400e; }
h2 { font-size: 1.3em; color: #b45309; margin-top: 1.5em; border-bottom: 1px solid #fde68a; padding-bottom: 0.2em; }
h3 { font-size: 1.1em; color: #475569; }
p {
  margin-bottom: 1.2em;
  text-indent: 1.5em;
  text-align: justify;
}
.verses-box {
  margin: 1.5em 0;
  padding: 1.2em 1.5em;
  border-left: 4px solid #f59e0b;
  background: #fffbeb;
  border-radius: 8px;
}
.verses-box p {
  text-indent: 0;
  margin-bottom: 0.6em;
  font-weight: 500;
  color: #78350f;
}
.lead {
  font-size: 1.1em;
  font-weight: 600;
  text-indent: 0;
  color: #92400e;
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
            file_name = f"day_{idx}.xhtml"
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
            manifest_items.append(f'<item id="day_{idx}" href="{file_name}" media-type="application/xhtml+xml"/>')
            spine_items.append(f'<itemref idref="day_{idx}"/>')
            nav_points.append(f'''
    <navPoint id="navPoint-{idx}" playOrder="{idx}">
      <navLabel><text>{safe_chap_title}</text></navLabel>
      <content src="{file_name}"/>
    </navPoint>''')

        safe_title = xml_clean(title)
        safe_author = xml_clean(author)
        safe_category = xml_clean(category)
        content_opf = f'''<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>{safe_title}</dc:title>
    <dc:creator opf:role="aut">{safe_author}</dc:creator>
    <dc:language>id</dc:language>
    <dc:subject>{safe_category}</dc:subject>
    <dc:identifier id="BookId">urn:uuid:baca-fkkp-{abs(hash(title))}</dc:identifier>
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
    <meta name="dtb:uid" content="urn:uuid:baca-fkkp-{abs(hash(title))}"/>
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

    print(f"Created FKKP EPUB: {output_path}")

fkkp_m1_chapters = [
    ("Minggu 1 — Hari Senin: Menikmati Kristus sebagai Hayat yang Sejati", """
<p class="lead">Doa-Makan Firman Pagi Ini:</p>
<div class="verses-box">
  <p><strong>Yohanes 1:4</strong> — "Di dalam Dia ada hayat dan hayat itu adalah terang manusia."</p>
  <p><strong>Yohanes 10:10b</strong> — "Aku datang, supaya mereka mempunyai hayat, dan mempunyainya dalam segala kelimpahan."</p>
</div>
<h2>Bacaan Pelayanan Pagi</h2>
<p>Kekristenan bukan sekadar rangkaian doktrin atau aturan lahiriah mengenai perilaku moral yang baik. Pada hakikatnya, keselamatan Allah di dalam Kristus berpusat pada pemberian hayat ilahi (zoe) kepada manusia berdosa yang menerima Dia.</p>
<p>Ketika kita bangun di pagi hari, tindakan pertama yang paling mulia bagi seorang anak Tuhan adalah menghampiri takhta kasih karunia melalui seruan nama Tuhan Yesus: <em>"O, Tuhan Yesus!"</em> Melalui doa-makan firman Tuhan, kita memakan Kristus sebagai bekal hayat dan mengizinkan firman-Nya membersihkan pikiran kita dari segala kepenatan duniawi.</p>
<p>Biarlah terang firman menerangi setiap langkah kita hari ini, sehingga hayat Kristus mengalir dalam perkataan, sikap, dan persekutuan kita dengan saudara-saudari seiman.</p>
"""),
    ("Minggu 1 — Hari Selasa: Kristus sebagai Roti Hayat", """
<p class="lead">Doa-Makan Firman Pagi Ini:</p>
<div class="verses-box">
  <p><strong>Yohanes 6:35</strong> — "Kata Yesus kepada mereka: 'Akulah roti hayat; barangsiapa datang kepada-Ku, ia tidak akan lapar lagi, dan barangsiapa percaya kepada-Ku, ia tidak akan haus lagi.'"</p>
  <p><strong>Yohanes 6:57</strong> — "Sama seperti Bapa yang hidup mengutus Aku dan Aku hidup oleh Bapa, demikian juga barangsiapa yang memakan Aku, ia juga akan hidup oleh Aku."</p>
</div>
<h2>Bacaan Pelayanan Pagi</h2>
<p>Di dalam Yohanes pasal 6, Tuhan Yesus menyatakan diri-Nya sebagai roti sorgawi yang turun dari surga untuk memberi hayat kepada dunia. Sebagaimana tubuh jasmani kita memerlukan sarapan jasmani setiap pagi agar memiliki tenaga untuk bekerja, manusia batiniah kita pun sangat memerlukan santapan rohani harian.</p>
<p>Memakan Kristus berarti menyerap sabda-Nya ke dalam batin kita dengan iman dan doa. Saat kita mengunyah firman-Nya kata demi kata, firman tersebut berubah menjadi pasokan hayat yang memuaskan rasa lapar batiniah kita. Jangan biarkan hari ini berlalu tanpa menikmati setidaknya beberapa butir firman yang mengenyangkan roh kita.</p>
"""),
    ("Minggu 1 — Hari Rabu: Minum Air Hayat di dalam Roh", """
<p class="lead">Doa-Makan Firman Pagi Ini:</p>
<div class="verses-box">
  <p><strong>Yohanes 7:37-38</strong> — "Barangsiapa haus, baiklah ia datang kepada-Ku dan minum! Barangsiapa percaya kepada-Ku, dari dalam hatinya akan mengalir aliran-aliran air hayat."</p>
  <p><strong>1 Korintus 12:13b</strong> — "...dan kita semua diberi minum dari satu Roh."</p>
</div>
<h2>Bacaan Pelayanan Pagi</h2>
<p>Dahaga batin manusia tidak dapat dipuaskan oleh hiburan materi, kedudukan, atau kesuksesan duniawi. Hanya Roh Kudus sebagai air hayat yang mengalir dari takhta Allah dan Anak Domba yang sanggup melenyapkan rasa haus kita.</p>
<p>Cara untuk minum air hayat sangatlah sederhana: bukalah mulut dan hatimu kepada Tuhan. Berdoalah dengan jujur, nyanyikan pujian syukur, dan serahkan segala beban kekhawatiranmu kepada-Nya. Seketika itu juga, sukacita dan damai sejahtera ilahi akan meluap membasahi jiwamu yang kering.</p>
"""),
    ("Minggu 1 — Hari Kamis: Berakar dan Dibangun di dalam Dia", """
<p class="lead">Doa-Makan Firman Pagi Ini:</p>
<div class="verses-box">
  <p><strong>Kolose 2:6-7</strong> — "Kamu telah menerima Kristus Yesus, Tuhan kita. Karena itu hendaklah hidupmu tetap di dalam Dia. Hendaklah kamu berakar di dalam Dia dan dibangun di atas Dia..."</p>
</div>
<h2>Bacaan Pelayanan Pagi</h2>
<p>Seperti pohon rindang yang membutuhkan akar yang menghunjam kuat ke dalam tanah yang subur, orang beriman pun harus membiarkan akar kehidupannya menyerap kekayaan Kristus setiap hari. Tanah yang kaya itu adalah Kristus sendiri dalam segala kepenuhan keallahan-Nya.</p>
<p>Ketika akar batin kita menyerap damai, kesabaran, kekudusan, dan kasih Kristus, maka kehidupan lahiriah kita akan kokoh tak tergoyahkan kendati badai pencobaan menerpa.</p>
"""),
    ("Minggu 1 — Hari Jumat: Berjalan Menurut Roh", """
<p class="lead">Doa-Makan Firman Pagi Ini:</p>
<div class="verses-box">
  <p><strong>Galatia 5:16</strong> — "Maksudku ialah: hiduplah oleh Roh, maka kamu tidak akan menuruti keinginan daging."</p>
  <p><strong>Galatia 5:22-23</strong> — "Tetapi buah Roh ialah: kasih, sukacita, damai sejahtera, kesabaran, kemurahan, kebaikan, kesetiaan, kelemahlembutan, penguasaan diri."</p>
</div>
<h2>Bacaan Pelayanan Pagi</h2>
<p>Perjalanan hidup orang Kristen bukanlah pergumulan keras melawan kelemahan diri sendiri dengan kekuatan daging, melainkan penyerahan diri untuk dipimpin oleh Roh Kudus yang berdiam di dalam roh kita.</p>
<p>Saat kita menyelaraskan langkah dengan kehendak Roh, buah hayat yang manis—kasih, sukacita, dan damai sejahtera—akan terbit secara wajar tanpa kepura-puraan.</p>
"""),
    ("Minggu 1 — Hari Sabtu: Membangun Tubuh Kristus", """
<p class="lead">Doa-Makan Firman Pagi Ini:</p>
<div class="verses-box">
  <p><strong>Efesus 4:15-16</strong> — "...tetapi dengan teguh berpegang kepada kebenaran di dalam kasih kita bertumbuh di dalam segala hal ke arah Dia, Kristus, yang adalah Kepala. Dari pada-Nyalah seluruh tubuh rapi tersusun dan diikat menjadi satu..."</p>
</div>
<h2>Bacaan Pelayanan Pagi</h2>
<p>Tujuan akhir dari kebangunan rohani harian kita bukanlah untuk kepuasan diri pribadi semata, melainkan untuk pembangunan Tubuh Kristus, yaitu gereja. Setiap anggota memiliki fungsi yang unik dan berharga dalam menyalurkan hayat Allah.</p>
<p>Hari Sabtu adalah waktu yang sangat baik untuk mempersiapkan hati menjelang persekutuan meja Tuhan di hari Minggu. Bawalah kekayaan Kristus yang telah kamu nikmati dari Senin sampai Sabtu untuk dibagikan kepada saudara-saudari di dalam perhimpunan kudus.</p>
""")
]

create_epub("public/books/fkkp-kebangunan-pagi-minggu-1.epub", "FKKP: Menikmati Kristus sebagai Hayat (Minggu 1)", "Yasperin / Living Stream Ministry", fkkp_m1_chapters, "FKKP (Kebangunan Pagi)")
print("Done creating sample FKKP EPUB!")
