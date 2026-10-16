import json
import sqlite3

conn = sqlite3.connect(r'd:\Magang\Baca\Kidung\hymnaldb-v30.sqlite')
cursor = conn.cursor()

with open('public/kidung/kidung_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Test Kidung matching
kidung_matched = 0
kidung_unmatched = []
for k in data['kidung']:
    num_str = str(k['number'])
    cursor.execute('SELECT SONG_ID FROM SONG_IDS WHERE HYMN_TYPE=17 AND HYMN_NUMBER=?', (num_str,))
    if cursor.fetchone():
        kidung_matched += 1
    else:
        kidung_unmatched.append(k['number'])

print(f"Kidung matched: {kidung_matched} / {len(data['kidung'])}")
if kidung_unmatched:
    print("Kidung unmatched:", kidung_unmatched[:20])

# Test Suplemen matching
suplemen_matched = 0
suplemen_unmatched = []
for s in data['suplemen']:
    n = s['number']
    candidates = [str(1000 + n), str(n)] if n < 1000 else [str(n)]
    found = False
    for c in candidates:
        cursor.execute('SELECT SONG_ID FROM SONG_IDS WHERE HYMN_TYPE=17 AND HYMN_NUMBER=?', (c,))
        if cursor.fetchone():
            found = True
            suplemen_matched += 1
            break
    if not found:
        suplemen_unmatched.append(n)

print(f"Suplemen matched: {suplemen_matched} / {len(data['suplemen'])}")
if suplemen_unmatched:
    print("Suplemen unmatched:", suplemen_unmatched)
