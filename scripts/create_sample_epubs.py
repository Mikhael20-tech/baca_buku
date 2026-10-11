import zipfile
import os

def xml_clean(s):
    return str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

def create_epub(output_path, title, author, chapters, category="Filsafat"):
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
h1, h2 {
  font-family: sans-serif;
  color: #2c3e50;
  margin-top: 1.2em;
  margin-bottom: 0.6em;
}
h1 { font-size: 1.8em; border-bottom: 1px solid #eaeaea; padding-bottom: 0.3em; }
h2 { font-size: 1.3em; }
p {
  margin-bottom: 1.2em;
  text-indent: 1.5em;
  text-align: justify;
}
blockquote {
  margin: 1.5em 2em;
  padding: 0.8em 1.2em;
  border-left: 4px solid #f59e0b;
  background: #fffbeb;
  font-style: italic;
}
.lead {
  font-size: 1.1em;
  font-weight: 500;
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
        content_opf = f'''<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>{safe_title}</dc:title>
    <dc:creator opf:role="aut">{safe_author}</dc:creator>
    <dc:language>id</dc:language>
    <dc:subject>{safe_category}</dc:subject>
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

    print(f"Created EPUB: {output_path}")

meditasi_chapters = [
    ("Buku I: Catatan Syukur dan Pembelajaran Hidup", """
<p class="lead">Dari kakekku Verus, aku belajar tentang kebaikan hati dan ketenangan batin dalam menghadapi amarah.</p>
<p>Dari nama baik dan ingatan tentang ayahku: kerendahan hati dan kepribadian yang teguh. Dari ibuku: kesalehan hidup, kedermawanan, serta pantangan bukan saja terhadap tindakan jahat, tetapi bahkan terhadap pikiran jahat.</p>
<p>Dari Diognetus: tidak menyibukkan diri dengan perkara-perkara sepele, tidak mudah percaya pada cerita takhayul tentang pesulap atau pengusir setan, serta keberanian mendengarkan kebenaran yang diucapkan tanpa polesan.</p>
<blockquote>"Ketenangan pikiran yang sejati diperoleh saat manusia mampu menguasai pikirannya sendiri dan melepaskan kendali atas hal-hal di luar kuasanya."</blockquote>
<p>Aku bersyukur bahwa ketika aku berhasrat mendalami filsafat, aku tidak jatuh ke tangan seorang sofis yang gemar berdebat kusir, melainkan menemukan esensi kebajikan yang dapat diterapkan dalam kehidupan nyata sehari-hari.</p>
"""),
    ("Buku II: Mengawali Pagi dengan Kewarasan Pikiran", """
<p class="lead">Katakanlah kepada dirimu sendiri pada waktu fajar: Hari ini aku akan berhadapan dengan orang yang suka mencampuri urusan orang lain, orang yang tidak tahu terima kasih, sombong, licik, iri hati, dan tidak bersahabat.</p>
<p>Mereka berperilaku demikian semata-mata karena mereka tidak dapat membedakan mana yang benar-benar baik dan mana yang jahat. Namun bagiku, yang telah memahami keindahan dari kebaikan moral, tak ada satu pun dari mereka yang dapat merusak jiwaku.</p>
<p>Kita diciptakan untuk bekerja bersama, seperti kedua belah kaki, kedua belah tangan, atau dua deretan gigi atas dan bawah. Maka menghalangi satu sama lain bertentangan dengan hukum alam.</p>
<blockquote>"Waktu kehidupan manusia hanyalah sebuah titik, substansinya selalu mengalir, persepsinya redup, dan seluruh tubuh fana ini mudah membusuk. Yang dapat memandu kita hanyalah satu hal: filsafat."</blockquote>
<p>Lepaskanlah beban masa lalu dan jangan cemas berlebihan akan masa depan yang belum tiba. Kehidupanmu hanya ada pada saat ini—detik yang sedang kamu jalani saat ini.</p>
"""),
    ("Buku IV: Benteng Pertahanan Batin", """
<p class="lead">Manusia mencari tempat peristirahatan di tepi pantai, di puncak pegunungan, atau di pedesaan yang tenang. Namun semua itu adalah bentuk pelarian yang tidak perlu.</p>
<p>Sebab di manakah manusia dapat menemukan peristirahatan yang lebih tenang dan bebas dari gangguan selain di dalam relung jiwanya sendiri? Terutama jika jiwanya dipenuhi oleh prinsip-prinsip luhur yang memberikannya kedamaian seketika.</p>
<p>Ingatlah senantiasa dua hal sederhana ini: Pertama, hal-hal luar tidak dapat menyentuh jiwamu kecuali jika pikiranmu sendiri mengizinkannya. Kedua, segala sesuatu yang kamu lihat di dunia ini senantiasa berubah dan segera sirna.</p>
<blockquote>"Dunia adalah perubahan; kehidupan kita dibentuk oleh pikiran kita sendiri."</blockquote>
<p>Jika kamu disakiti oleh seseorang, tanyakan pada dirimu: persepsi apa yang sedang kupertahankan sehingga aku merasa terluka? Hapuslah persepsi itu, maka rasa sakit tersebut pun akan lenyap seketika.</p>
""")
]

sang_pangeran_chapters = [
    ("Bab I: Berbagai Macam Bentuk Kekuasaan", """
<p class="lead">Semua negara, semua pemerintahan yang pernah memerintah dan memiliki wewenang atas umat manusia, adalah republik atau kepangeranan.</p>
<p>Kepangeranan dapat berupa warisan turun-temurun, di mana keluarga penguasa telah lama menduduki takhta, atau kepangeranan baru yang baru saja dibentuk atau direbut melalui kepiawaian politik.</p>
<p>Kekuasaan yang diperoleh melalui kebiasaan keluarga penguasa jauh lebih mudah dipertahankan dibandingkan kekuasaan yang baru dibangun, asalkan sang penguasa tidak melanggar adat istiadat pendahulunya.</p>
"""),
    ("Bab XVII: Tentang Kekejaman dan Kasih Sayang", """
<p class="lead">Timbul pertanyaan penting: apakah lebih baik bagi seorang pemimpin untuk dicintai daripada ditakuti, atau sebaliknya?</p>
<p>Jawabannya adalah bahwa seseorang idealnya menginginkan keduanya. Namun, karena sangat sulit menggabungkan keduanya, jauh lebih aman untuk ditakuti daripada dicintai jika salah satu dari keduanya harus ditiadakan.</p>
<blockquote>"Cinta diikat oleh rantai kewajiban yang rapuh, yang akan diputus oleh manusia demi kepentingannya sendiri begitu kesempatan datang; tetapi rasa takut didukung oleh ketakutan akan hukuman yang tak pernah gagal."</blockquote>
<p>Meski demikian, seorang penguasa harus membuat dirinya ditakuti sedemikian rupa sehingga, jika ia tidak memenangkan cinta rakyatnya, setidaknya ia tidak dibenci. Karena ditakuti dan tidak dibenci dapat berjalan beriringan dengan sangat harmonis.</p>
""")
]

create_epub("public/books/meditasi-marcus-aurelius.epub", "Meditasi: Menemukan Kedamaian Stoa", "Marcus Aurelius", meditasi_chapters, "Filsafat dan Pengembangan Diri")
create_epub("public/books/sang-pangeran-machiavelli.epub", "Sang Pangeran (Il Principe)", "Niccolo Machiavelli", sang_pangeran_chapters, "Filsafat dan Politik")
print("Done updating sample EPUB files!")
