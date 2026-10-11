import zipfile

with zipfile.ZipFile(r"D:\Magang\Baca\public\books\pembinaan-dasar-watchman-nee.epub", 'r') as z:
    content = z.read("OEBPS/chapter_37.xhtml").decode('utf-8')
    lines = content.splitlines()
    print("Chapter 37 line 28:")
    print(lines[27][:150])
    print(lines[27][490:540])
