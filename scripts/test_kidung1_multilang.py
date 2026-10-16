import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect(r'd:\Magang\Baca\Kidung\hymnaldb-v30.sqlite')
cursor = conn.cursor()

def read_varint(blob, idx):
    val = 0
    shift = 0
    while idx < len(blob):
        b = blob[idx]
        idx += 1
        val |= (b & 0x7F) << shift
        if not (b & 0x80):
            break
        shift += 7
    return val, idx

def parse_song_lyrics(blob):
    if not blob:
        return []
    
    stanzas = []
    idx = 0
    while idx < len(blob):
        tag = blob[idx]
        idx += 1
        wire_type = tag & 0x07
        field_num = tag >> 3
        
        if wire_type == 2:
            length, idx = read_varint(blob, idx)
            sub_end = idx + length
            if field_num == 1: # Stanza
                lines = []
                is_chorus = False
                while idx < sub_end:
                    stag = blob[idx]
                    idx += 1
                    swire = stag & 0x07
                    sfield = stag >> 3
                    if swire == 2:
                        slen, idx = read_varint(blob, idx)
                        send = idx + slen
                        if sfield == 2: # Line
                            line_text = ""
                            while idx < send:
                                ltag = blob[idx]
                                idx += 1
                                lwire = ltag & 0x07
                                lfield = ltag >> 3
                                if lwire == 2:
                                    llen, idx = read_varint(blob, idx)
                                    if lfield == 1:
                                        line_text = blob[idx:idx+llen].decode('utf-8', errors='ignore')
                                    idx += llen
                                elif lwire == 0:
                                    _, idx = read_varint(blob, idx)
                                else:
                                    idx = send
                            if line_text:
                                lines.append(line_text.strip())
                        else:
                            idx = send
                    elif swire == 0:
                        val, idx = read_varint(blob, idx)
                        if sfield == 1:
                            is_chorus = (val > 0)
                    else:
                        idx = sub_end
                if lines:
                    stanzas.append({"isChorus": is_chorus, "lines": lines})
            else:
                idx = sub_end
        elif wire_type == 0:
            _, idx = read_varint(blob, idx)
        else:
            break
            
    return stanzas

# Let's test Kidung 1 links
cursor.execute("""
    SELECT s.SONG_META_DATA_LANGUAGES
    FROM SONG_IDS i
    JOIN SONG_DATA s ON i.SONG_ID = s.ID
    WHERE i.HYMN_TYPE = 17 AND i.HYMN_NUMBER = '1'
""")
blob = cursor.fetchone()[0]

def parse_language_links(blob):
    links = []
    if not blob:
        return links
    idx = 0
    while idx < len(blob):
        tag = blob[idx]
        idx += 1
        if tag == 0x0A:
            sub_len = blob[idx]
            idx += 1
            sub_end = idx + sub_len
            h_type = 0 # Default is 0 if 0x08 is omitted
            h_num = None
            while idx < sub_end:
                stag = blob[idx]
                idx += 1
                if stag == 0x08:
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
                elif stag == 0x12:
                    strlen = blob[idx]
                    idx += 1
                    h_num = blob[idx:idx+strlen].decode('utf-8', errors='ignore')
                    idx += strlen
                else:
                    idx += 1
            if h_num is not None:
                links.append((h_type, h_num))
        else:
            break
    return links

links = parse_language_links(blob)
print(f"Kidung 1 links ({len(links)}):")
for h_type, h_num in links:
    cursor.execute("""
        SELECT s.ID, s.SONG_TITLE, s.SONG_LANGUAGE, s.SONG_LYRICS
        FROM SONG_IDS i
        JOIN SONG_DATA s ON i.SONG_ID = s.ID
        WHERE i.HYMN_TYPE = ? AND i.HYMN_NUMBER = ?
    """, (h_type, h_num))
    res = cursor.fetchone()
    if res:
        stanzas = parse_song_lyrics(res[3])
        print(f"  HymnType {h_type:2d}, Num {h_num:4s} | Lang {res[2]:2d} | Title: {res[1][:30]:30s} | Stanzas: {len(stanzas)}")
