import urllib.request
import re
import json

url = 'https://bibleread.online/bible/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=15) as resp:
    html = resp.read().decode('utf-8')

match = re.search(r'App\.Collections\.books\.reset\(\s*(\[\s*\{.*?\}\s*\])\s*\);', html, re.DOTALL)
if not match:
    print("Could not find App.Collections.books.reset")
    exit(1)

raw_json = match.group(1)
all_books = json.loads(raw_json)

ot_books = [b for b in all_books if b.get('bookType') == 'BibleBook' and b.get('testament') == 'Old']
print(f"Total OT Bible books found on bibleread: {len(ot_books)}")

for b in ot_books:
    print(f"ID:{b.get('id')} | Num:{b.get('number')} | {b.get('fullName')} | slug: '{b.get('urlSegment')}' | chs: {b.get('chaptersCount')}")

# Save OT list to scratch
with open('scratch_ot_books.json', 'w', encoding='utf-8') as f:
    json.dump(ot_books, f, indent=2, ensure_ascii=False)
