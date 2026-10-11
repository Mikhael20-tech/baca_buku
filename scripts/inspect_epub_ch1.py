import zipfile

with zipfile.ZipFile(r"D:\Magang\Baca\public\books\alkitab-pb-pemulihan.epub", 'r') as z:
    c1 = z.read("OEBPS/chapter_1.xhtml").decode('utf-8')
    lines = c1.splitlines()
    print("Chapter 1 lines count:", len(lines))
    print("Sample lines 1-30:")
    for l in lines[:30]:
        print(l)
    print("Sample lines 100-130:")
    for l in lines[100:130]:
        print(l)
