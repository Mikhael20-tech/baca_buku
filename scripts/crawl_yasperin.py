import urllib.request
import re
import os
import time
import json
from urllib.parse import urljoin

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

def get_html(url):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=12) as resp:
            return resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error {url}: {e}")
        return ""

found_books = {}

# Crawl pages from library
for page in range(1, 15):
    url = f"https://library.yasperin.com/library?page={page}"
    print(f"Fetching page {page}...")
    html = get_html(url)
    if not html:
        break
    
    # regex match books
    # <img ... alt="..." ... src="..."
    matches = re.findall(r'<img[^>]+src=["\']([^"\']+)["\'][^>]*alt=["\']([^"\']*)["\']', html)
    alt_matches = re.findall(r'<img[^>]+alt=["\']([^"\']+)["\'][^>]*src=["\']([^"\']*)["\']', html)
    
    all_pairs = matches + [(src, alt) for alt, src in alt_matches]
    
    page_count = 0
    for src, title in all_pairs:
        if 'cover' in src.lower() and title:
            clean_title = title.strip()
            if clean_title not in found_books:
                found_books[clean_title] = src
                page_count += 1
                
    print(f" Page {page}: found {page_count} covers (total {len(found_books)})")
    if page_count == 0 and page > 3:
        break
    time.sleep(0.5)

# Also check authors/lyd
lyd_html = get_html("https://library.yasperin.com/authors/lyd")
matches = re.findall(r'<img[^>]+src=["\']([^"\']+)["\'][^>]*alt=["\']([^"\']*)["\']', lyd_html)
alt_matches = re.findall(r'<img[^>]+alt=["\']([^"\']+)["\'][^>]*src=["\']([^"\']*)["\']', lyd_html)
for src, title in (matches + [(src, alt) for alt, src in alt_matches]):
    if 'cover' in src.lower() and title:
        found_books[title.strip()] = src

print(f"\nTotal books found with covers: {len(found_books)}")

with open("scripts/yasperin_covers_found.json", "w", encoding="utf-8") as f:
    json.dump(found_books, f, indent=2, ensure_ascii=False)

print("Saved to scripts/yasperin_covers_found.json")
