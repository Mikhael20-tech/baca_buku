import sqlite3

conn = sqlite3.connect(r'd:\Magang\Baca\Kidung\hymnaldb-v30.sqlite')
cursor = conn.cursor()

# Join with i.SONG_ID = s.ID
cursor.execute("""
    SELECT s.ID, i.HYMN_TYPE, i.HYMN_NUMBER, s.SONG_TITLE, s.SONG_LANGUAGE
    FROM SONG_IDS i
    JOIN SONG_DATA s ON i.SONG_ID = s.ID
    WHERE i.HYMN_TYPE = 17 AND i.HYMN_NUMBER = '1'
""")
row = cursor.fetchone()
print("Indo Hymn 1:", row)

song_id = row[0]
cursor.execute("SELECT SONG_META_DATA_LANGUAGES, SONG_LYRICS, FLATTENED_LYRICS FROM SONG_DATA WHERE ID=?", (song_id,))
lang_blob, lyrics_blob, flat_lyrics = cursor.fetchone()

print("\n--- SONG_META_DATA_LANGUAGES ---")
print("Blob length:", len(lang_blob) if lang_blob else 0)
print("Blob bytes:", bytes(lang_blob))

# Let's decode protobuf of SONG_META_DATA_LANGUAGES
# Protobuf encoding:
# 0x0A <len> [ 0x08 <varint hymn_type> 0x12 <len> <hymn_number_str> ]
def parse_language_links(blob):
    links = []
    if not blob:
        return links
    idx = 0
    while idx < len(blob):
        tag = blob[idx]
        idx += 1
        if tag == 0x0A: # submessage
            sub_len = blob[idx]
            idx += 1
            sub_end = idx + sub_len
            h_type = None
            h_num = None
            while idx < sub_end:
                stag = blob[idx]
                idx += 1
                if stag == 0x08: # varint hymn_type
                    # simple varint
                    val = 0
                    shift = 0
                    while True:
                        b = blob[idx]
                        idx += 1
                        val |= (b & 0x7F) << shift
                        if not (b & 0x80):
                            break
                        shift += 7
                    h_type = val
                elif stag == 0x12: # string hymn_number
                    strlen = blob[idx]
                    idx += 1
                    h_num = blob[idx:idx+strlen].decode('utf-8', errors='ignore')
                    idx += strlen
                else:
                    idx += 1
            if h_type is not None and h_num is not None:
                links.append((h_type, h_num))
        else:
            # unexpected tag
            break
    return links

links = parse_language_links(lang_blob)
print("\nParsed language links for Song 1:")
for h_type, h_num in links:
    # Query details for each link
    cursor.execute("""
        SELECT s.ID, s.SONG_TITLE, s.SONG_LANGUAGE, s.FLATTENED_LYRICS
        FROM SONG_IDS i
        JOIN SONG_DATA s ON i.SONG_ID = s.ID
        WHERE i.HYMN_TYPE = ? AND i.HYMN_NUMBER = ?
    """, (h_type, h_num))
    target = cursor.fetchone()
    if target:
        print(f"  HymnType {h_type}, Num {h_num} -> Lang {target[2]}, Title: {target[1]}")
    else:
        print(f"  HymnType {h_type}, Num {h_num} -> NOT FOUND")

