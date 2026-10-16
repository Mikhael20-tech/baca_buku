import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect(r'd:\Magang\Baca\Kidung\hymnaldb-v30.sqlite')
cursor = conn.cursor()

# Cek apakah ada pinyin di sample lagu chinese
cursor.execute("SELECT SONG_ID, HYMN_TYPE, HYMN_NUMBER FROM SONG_IDS WHERE HYMN_TYPE IN (7, 8) LIMIT 5")
for r in cursor.fetchall():
    sid = r[0]
    cursor.execute("SELECT SONG_TITLE, FLATTENED_LYRICS FROM SONG_DATA WHERE ID=?", (sid,))
    data = cursor.fetchone()
    print(r, data[0])
    print("  lyrics preview:", data[1][:100] if data[1] else "None")

# Cek apakah ada pinyin di file folder Kidung
import os
print("\nFiles in d:\\Magang\\Baca\\Kidung:")
for f in os.listdir(r'd:\Magang\Baca\Kidung'):
    print(" -", f)
