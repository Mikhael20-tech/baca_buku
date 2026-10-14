import json

with open('public/bible/matius.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

c28 = d['chapters']['28']
print('=== MATIUS 28:16-20 IN public/bible/matius.json ===')
for v in c28['verses']:
    if v['verse'] >= 16:
        print(f"Ayat {v['verse']}:")
        print('  Text  :', v['text'])
        print('  Marked:', v.get('marked_text', ''))
