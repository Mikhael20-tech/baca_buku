import json
import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect(r'd:\Magang\Baca\Kidung\hymnaldb-v30.sqlite')
cursor = conn.cursor()

# Cek kidung 782 di json
with open('public/kidung/kidung_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

k782 = [k for k in data['kidung'] if k['number'] == 782][0]
print("Kidung 782 in JSON:", k782['number'], k782['title'], "englishRef:", k782.get('englishRef'))

# Cek di sqlite dengan title atau englishRef
cursor.execute("SELECT i.HYMN_NUMBER, s.SONG_TITLE, hex(substr(s.SONG_META_DATA_LANGUAGES, 1, 40)) FROM SONG_IDS i JOIN SONG_DATA s ON i.SONG_ID=s.ID WHERE i.HYMN_TYPE=17 AND s.SONG_TITLE LIKE '%782%'")
print("Search by 782:", cursor.fetchall())

cursor.execute("SELECT i.HYMN_NUMBER, s.SONG_TITLE FROM SONG_IDS i JOIN SONG_DATA s ON i.SONG_ID=s.ID WHERE i.HYMN_TYPE=17 AND s.SONG_TITLE LIKE ? ", ('%' + k782['title'][:15] + '%',))
print("Search by title:", cursor.fetchall())
