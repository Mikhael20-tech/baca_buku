import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('public/kidung/kidung_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

tie_counts = {}

for pool in [data['kidung'], data['suplemen']]:
    for song in pool:
        for lk, lobj in song.get('languages', {}).items():
            text = lobj.get('title', '') + ' ' + ' '.join(' '.join(st.get('lines', [])) for st in lobj.get('stanzas', []))
            count_35c = text.count('\u035c')
            count_361 = text.count('\u0361')
            count_203f = text.count('\u203f')
            count_2040 = text.count('\u2040')
            total = count_35c + count_361 + count_203f + count_2040
            if total > 0:
                tie_counts[lk] = tie_counts.get(lk, 0) + total

print("Tie / sinalefa character counts by language:")
for lk, count in tie_counts.items():
    print(f"  {lk}: {count} kali")
