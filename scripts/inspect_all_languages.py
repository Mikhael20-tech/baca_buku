import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('public/kidung/kidung_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

k1 = data['kidung'][0]
print("K1 available languages:", k1.get('availableLanguages'))

langs_to_check = ['es', 'fr', 'pt', 'zh', 'zht', 'ko', 'ja', 'ru', 'fa']

for lang in langs_to_check:
    if lang in k1.get('languages', {}):
        item = k1['languages'][lang]
        name = item.get('name')
        title = item.get('title')
        print(f"\n=== {lang.upper()} ({name}) ===")
        print(f"Title: {title}")
        st = item['stanzas'][0]
        print("Sample lines:")
        for l in st['lines'][:3]:
            print(f"  {l}")

# Check Spanish special punctuation across database
print("\n--- Checking Spanish ¿ and ¡ in database ---")
es_upside_down_excl = 0
es_upside_down_quest = 0
es_enye = 0
for song in data['kidung']:
    es = song.get('languages', {}).get('es')
    if es:
        text = es.get('title', '') + ' ' + ' '.join(' '.join(st.get('lines', [])) for st in es.get('stanzas', []))
        es_upside_down_excl += text.count('¡')
        es_upside_down_quest += text.count('¿')
        es_enye += text.count('ñ') + text.count('Ñ')

print(f"Spanish '¡': {es_upside_down_excl} times")
print(f"Spanish '¿': {es_upside_down_quest} times")
print(f"Spanish 'ñ/Ñ': {es_enye} times")

# Check French accents across database
print("\n--- Checking French accents in database ---")
fr_accents = {'é': 0, 'è': 0, 'ê': 0, 'à': 0, 'ç': 0, 'œ': 0, 'ô': 0}
for song in data['kidung']:
    fr = song.get('languages', {}).get('fr')
    if fr:
        text = fr.get('title', '') + ' ' + ' '.join(' '.join(st.get('lines', [])) for st in fr.get('stanzas', []))
        for c in fr_accents:
            fr_accents[c] += text.count(c)
print("French accents:", fr_accents)

# Check Portuguese accents
print("\n--- Checking Portuguese accents in database ---")
pt_accents = {'ã': 0, 'õ': 0, 'ç': 0, 'á': 0, 'é': 0, 'í': 0, 'ó': 0, 'ú': 0, 'â': 0, 'ê': 0}
for song in data['kidung']:
    pt = song.get('languages', {}).get('pt')
    if pt:
        text = pt.get('title', '') + ' ' + ' '.join(' '.join(st.get('lines', [])) for st in pt.get('stanzas', []))
        for c in pt_accents:
            pt_accents[c] += text.count(c)
print("Portuguese accents:", pt_accents)

