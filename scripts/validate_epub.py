import zipfile
import xml.etree.ElementTree as ET

epub_path = r"D:\Magang\Baca\public\books\alkitab-pb-pemulihan.epub"

with zipfile.ZipFile(epub_path, 'r') as z:
    for name in z.namelist():
        if name.endswith('.xhtml') or name.endswith('.opf') or name.endswith('.ncx'):
            content = z.read(name)
            try:
                ET.fromstring(content)
            except Exception as e:
                print(f"XML ERROR in {name}: {e}")
                # find the offending line
                lines = content.decode('utf-8', errors='ignore').splitlines()
                # print snippet
                print(f"Sample error near character")

print("Finished checking XML validity!")
