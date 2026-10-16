import sqlite3

conn = sqlite3.connect(r'd:\Magang\Baca\Kidung\hymnaldb-v30.sqlite')
cursor = conn.cursor()

# Cari lagu yang di judul atau liriknya ada kata "Chorus" atau cek beberapa lagu
cursor.execute("""
    SELECT i.HYMN_NUMBER, s.SONG_TITLE, s.SONG_LYRICS
    FROM SONG_IDS i
    JOIN SONG_DATA s ON i.SONG_ID = s.ID
    WHERE i.HYMN_TYPE = 0 AND s.FLATTENED_LYRICS LIKE '%chorus%'
    LIMIT 5
""")
rows = cursor.fetchall()

def inspect_stanza_fields(blob):
    idx = 0
    while idx < len(blob):
        tag = blob[idx]
        idx += 1
        wire_type = tag & 0x07
        field_num = tag >> 3
        if wire_type == 2 and field_num == 1: # Stanza
            length = blob[idx]
            idx += 1
            sub_end = idx + length
            fields = []
            while idx < sub_end:
                stag = blob[idx]
                idx += 1
                swire = stag & 0x07
                sfield = stag >> 3
                if swire == 0: # varint
                    val = blob[idx]
                    idx += 1
                    fields.append((sfield, 'varint', val))
                elif swire == 2:
                    slen = blob[idx]
                    idx += 1
                    fields.append((sfield, 'bytes', slen))
                    idx += slen
            print("  Stanza internal fields:", fields)
        else:
            idx += 1

for r in rows:
    print(f"\nHymn {r[0]}: {r[1]}")
    inspect_stanza_fields(r[2])
