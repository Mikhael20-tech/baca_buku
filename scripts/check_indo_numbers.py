import sqlite3

conn = sqlite3.connect(r'd:\Magang\Baca\Kidung\hymnaldb-v30.sqlite')
cursor = conn.cursor()

cursor.execute("""
    SELECT i.HYMN_NUMBER, s.SONG_TITLE
    FROM SONG_IDS i
    JOIN SONG_DATA s ON i.SONG_ID = s.ID
    WHERE i.HYMN_TYPE = 17
    ORDER BY CAST(i.HYMN_NUMBER AS INTEGER)
""")
rows = cursor.fetchall()
print(f"Total Indonesian songs: {len(rows)}")
print("First 5:", rows[:5])
print("Middle around 786:", [r for r in rows if r[0] in ['785', '786', '787', '1001', '1002', '1', '2']])
print("Highest 5:", rows[-5:])
