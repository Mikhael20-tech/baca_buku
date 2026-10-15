import json

with open('public/bible/books.json', 'r', encoding='utf-8') as f:
    id_books = json.load(f)

with open('scratch_ot_books.json', 'r', encoding='utf-8') as f:
    online_ot = json.load(f)

ot_id_books = [b for b in id_books if b['testament'] == 'PL']
print(f'Local PL books: {len(ot_id_books)}, Online OT books: {len(online_ot)}')

mapped = []
for i in range(len(ot_id_books)):
    local = ot_id_books[i]
    online = online_ot[i]
    print(f"{i+1}. Local: {local['id']} ({local['name']}) -> Online: {online['fullName']} (slug: {online['urlSegment']}, chs: {online['chaptersCount']})")
    mapped.append({
        'id': local['id'],
        'name_en': online['fullName'],
        'name_id': local['name'],
        'slug': online['urlSegment'],
        'chapters': online['chaptersCount'],
        'description': online.get('description', ''),
        'theme': online.get('theme', '')
    })

with open('scratch_ot_mapped.json', 'w', encoding='utf-8') as f:
    json.dump(mapped, f, indent=2, ensure_ascii=False)

print("Saved mapped OT books to scratch_ot_mapped.json")
