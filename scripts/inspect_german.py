import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('public/kidung/kidung_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

de_songs = []
for k in data['kidung']:
    if 'de' in k.get('languages', {}):
        de_songs.append((k['number'], k['title'], k['languages']['de']))

print(f"Total Kidung with German (de): {len(de_songs)}")
for num, id_title, de_obj in de_songs[:4]:
    h_num = de_obj.get("hymnNumber")
    title = de_obj.get("title")
    print(f"Kidung {num} (De #{h_num}): {title}")
    for st_idx, st in enumerate(de_obj.get('stanzas', [])[:2]):
        print(f"  Stanza {st_idx+1} (Chorus: {st.get('isChorus')}):")
        for line in st.get('lines', []):
            print(f"    {line}")
    print("-" * 50)
