import sqlite3
import sys

# Set stdout encoding to utf-8 to prevent charmap error
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect(r'd:\Magang\Baca\Kidung\hymnaldb-v30.sqlite')
cursor = conn.cursor()

# Get English 1 (HymnType 0, Number 1)
cursor.execute("""
    SELECT s.ID, s.SONG_TITLE, s.SONG_LANGUAGE, s.FLATTENED_LYRICS, s.SONG_LYRICS
    FROM SONG_IDS i
    JOIN SONG_DATA s ON i.SONG_ID = s.ID
    WHERE i.HYMN_TYPE = 0 AND i.HYMN_NUMBER = '1'
""")
en_row = cursor.fetchone()
print("English 1:", en_row[:3])
print("\n--- FLATTENED_LYRICS ---")
print(en_row[3])

print("\n--- SONG_LYRICS structure ---")
raw_lyrics = en_row[4]
print("Raw lyrics len:", len(raw_lyrics) if raw_lyrics else 0)

# Check hex representation of raw_lyrics
if raw_lyrics:
    print("Hex prefix (first 200 bytes):")
    print(raw_lyrics[:200].hex())

# Let's inspect Chinese 1 (HymnType 7, Number 1)
cursor.execute("""
    SELECT s.ID, s.SONG_TITLE, s.SONG_LANGUAGE, s.FLATTENED_LYRICS
    FROM SONG_IDS i
    JOIN SONG_DATA s ON i.SONG_ID = s.ID
    WHERE i.HYMN_TYPE = 7 AND i.HYMN_NUMBER = '1'
""")
zh_row = cursor.fetchone()
print("\nChinese 1:", zh_row[:3])
print(zh_row[3][:300] if zh_row and zh_row[3] else "None")
