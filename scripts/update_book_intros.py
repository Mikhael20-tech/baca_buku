import urllib.request
import re
import json
import os
from html import unescape

url = 'https://bibleread.online/bible/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=15) as resp:
    html = resp.read().decode('utf-8')

# Find the books collection reset block
match = re.search(r'App\.Collections\.books\.reset\(\s*(\[\s*\{.*?\}\s*\])\s*\);', html, re.DOTALL)
if not match:
    print("Could not find App.Collections.books.reset")
    exit(1)

raw_json = match.group(1)
all_books = json.loads(raw_json)
print(f"Total raw books in collection: {len(all_books)}")

# Filter only BibleBook (not Lifestudy) and testament == "New"
nt_books = [b for b in all_books if b.get('bookType') == 'BibleBook' and b.get('testament') == 'New']
print(f"Total NT Bible books found: {len(nt_books)}")

def parse_intro(desc_html, theme_html):
    intro = {}
    
    # 1. Subject from theme_html
    if theme_html:
        clean_theme = unescape(re.sub(r'<[^>]+>', ' ', theme_html))
        clean_theme = ' '.join(clean_theme.split())
        sub_match = re.search(r'Subject:\s*(.*)', clean_theme, re.IGNORECASE)
        if sub_match:
            intro['Subject'] = sub_match.group(1).strip()
        else:
            intro['Subject'] = clean_theme.strip()
            
    # 2. Key-value fields from description
    if desc_html:
        clean_desc = re.sub(r'<a[^>]*>(.*?)</a>', r'\1', desc_html)
        parts = re.findall(r'<strong>\s*(.*?):?\s*</strong>\s*(.*?)(?=<strong>|$)', clean_desc, re.DOTALL)
        for k, v in parts:
            clean_k = unescape(re.sub(r'<[^>]+>', '', k)).strip().rstrip(':')
            clean_v = unescape(re.sub(r'<[^>]+>', ' ', v))
            clean_v = ' '.join(clean_v.split()).strip()
            if clean_k and clean_v:
                intro[clean_k] = clean_v

    return intro

intros_map = {}
for b in nt_books:
    name = b['fullName'] # e.g. "Matthew"
    intro = parse_intro(b.get('description', ''), b.get('theme', ''))
    intros_map[name.lower()] = {
        'fullName': name,
        'slug': b.get('urlSegment'),
        'intro': intro
    }

# Mapping to our 27 book file IDs in public/bible/en/
NAME_TO_FILE = {
    'matthew': 'matius.json',
    'mark': 'markus.json',
    'luke': 'lukas.json',
    'john': 'yohanes.json',
    'acts': 'kisah-para-rasul.json',
    'romans': 'roma.json',
    '1 corinthians': '1-korintus.json',
    '2 corinthians': '2-korintus.json',
    'galatians': 'galatia.json',
    'ephesians': 'efesus.json',
    'philippians': 'filipi.json',
    'colossians': 'kolose.json',
    '1 thessalonians': '1-tesalonika.json',
    '2 thessalonians': '2-tesalonika.json',
    '1 timothy': '1-timotius.json',
    '2 timothy': '2-timotius.json',
    'titus': 'titus.json',
    'philemon': 'filemon.json',
    'hebrews': 'ibrani.json',
    'james': 'yakobus.json',
    '1 peter': '1-petrus.json',
    '2 peter': '2-petrus.json',
    '1 john': '1-yohanes.json',
    '2 john': '2-yohanes.json',
    '3 john': '3-yohanes.json',
    'jude': 'yudas.json',
    'revelation': 'wahyu.json'
}

EN_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'bible', 'en')
updated_count = 0
for b_name, filename in NAME_TO_FILE.items():
    file_path = os.path.join(EN_DIR, filename)
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
    
    matching_info = intros_map.get(b_name)
    if not matching_info:
        for k, v in intros_map.items():
            if b_name in k or k in b_name:
                matching_info = v
                break
                
    if matching_info:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        data['intro'] = matching_info['intro']
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False)
            
        updated_count += 1
        print(f"[OK] Updated intro for {matching_info['fullName']} in {filename}")
    else:
        print(f"[WARN] No intro found for {b_name}")

print(f"\nSuccessfully updated intro in {updated_count}/27 books!")
