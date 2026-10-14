import json

with open('public/bible/wahyu.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

c2 = d['chapters']['2']
for v in c2['verses']:
    print(f"[{v['verse']}] Text: {v['text']}")
