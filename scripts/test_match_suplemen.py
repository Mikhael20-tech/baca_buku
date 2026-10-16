import json
import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect(r'd:\Magang\Baca\Kidung\hymnaldb-v30.sqlite')
cursor = conn.cursor()

with open('public/kidung/kidung_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("Testing Suplemen first 5:")
for s in data['suplemen'][:5]:
    sqlite_num = str(1000 + s['number'])
    cursor.execute('SELECT s.SONG_TITLE FROM SONG_IDS i JOIN SONG_DATA s ON i.SONG_ID=s.ID WHERE i.HYMN_TYPE=17 AND i.HYMN_NUMBER=?', (sqlite_num,))
    res = cursor.fetchone()
    print(f"Suplemen {s['number']} (sqlite {sqlite_num}): JSON title=\"{s['title']}\" | SQLITE title=\"{res[0] if res else 'NOT FOUND'}\"")

print("\nTesting Suplemen last 5:")
for s in data['suplemen'][-5:]:
    sqlite_num = str(s['number']) if s['number'] >= 1000 else str(1000 + s['number'])
    cursor.execute('SELECT s.SONG_TITLE FROM SONG_IDS i JOIN SONG_DATA s ON i.SONG_ID=s.ID WHERE i.HYMN_TYPE=17 AND i.HYMN_NUMBER=?', (sqlite_num,))
    res = cursor.fetchone()
    print(f"Suplemen {s['number']} (sqlite {sqlite_num}): JSON title=\"{s['title']}\" | SQLITE title=\"{res[0] if res else 'NOT FOUND'}\"")
