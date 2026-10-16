import urllib.request
import re
import os
import json
from urllib.parse import urljoin

urls = [
    'https://yasperin.com/?post_type=product',
    'https://library.yasperin.com/authors/lyd',
    'https://library.yasperin.com/library'
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

for u in urls:
    try:
        req = urllib.request.Request(u, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            print(f'=== {u} (Status: {resp.status}, Length: {len(html)}) ===')
            # cari gambar
            img_matches = re.findall(r'<img[^>]+(?:src|data-src)=["\']([^"\']+)["\'][^>]*alt=["\']([^"\']*)["\']', html)
            if not img_matches:
                img_matches = [(src, '') for src in re.findall(r'<img[^>]+(?:src|data-src)=["\']([^"\']+)["\']', html)]
            print(f'Found {len(img_matches)} images:')
            for src, alt in img_matches[:15]:
                full_src = urljoin(u, src)
                print(f'  ALT: "{alt}" -> {full_src}')
    except Exception as e:
        print(f'Error fetching {u}: {e}')
