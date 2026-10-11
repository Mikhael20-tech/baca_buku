import zipfile
import glob
import xml.etree.ElementTree as ET
import os

epub_files = glob.glob(r"D:\Magang\Baca\public\books\*.epub")

for ep in epub_files:
    print(f"\n--- Checking {os.path.basename(ep)} ---")
    with zipfile.ZipFile(ep, 'r') as z:
        for name in z.namelist():
            if name.endswith(('.xhtml', '.opf', '.ncx', '.xml')):
                content = z.read(name)
                try:
                    ET.fromstring(content)
                except Exception as e:
                    print(f"  ERROR in {name}: {e}")
