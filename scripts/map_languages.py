import sqlite3

conn = sqlite3.connect(r'd:\Magang\Baca\Kidung\hymnaldb-v30.sqlite')
cursor = conn.cursor()

cursor.execute("""
    SELECT DISTINCT i.HYMN_TYPE, s.SONG_LANGUAGE, count(*)
    FROM SONG_IDS i
    JOIN SONG_DATA s ON i.SONG_ID = s.ID
    GROUP BY i.HYMN_TYPE, s.SONG_LANGUAGE
    ORDER BY i.HYMN_TYPE
""")
rows = cursor.fetchall()
print("HYMN_TYPE to SONG_LANGUAGE mapping:")
for r in rows:
    print(f"HymnType: {r[0]:2d} | Lang: {r[1]:2d} | Count: {r[2]}")

cursor.execute("SELECT DISTINCT SONG_LANGUAGE, count(*) FROM SONG_DATA GROUP BY SONG_LANGUAGE")
print("\nSONG_LANGUAGE counts:")
for r in cursor.fetchall():
    print(f"Lang: {r[0]:2d} | Count: {r[1]}")
