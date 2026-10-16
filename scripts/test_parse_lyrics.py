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
    """
    Decodes protobuf structure for lyrics:
    Lyrics message:
      repeated Stanza (field 1 = 0x0A)
    Stanza message:
      repeated Line (field 2 = 0x12)
      optional stanza_type or chorus marker (field 1 = varint? or field 3?)
    Line message:
      field 1 (0x0A) = string (line text)
    """
    if not blob:
        return []
    
    stanzas = []
    idx = 0
    while idx < len(blob):
        tag = blob[idx]
        idx += 1
        wire_type = tag & 0x07
        field_num = tag >> 3
        
        if wire_type == 2: # length-delimited
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
                            # inside line
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
                                    # skip other wire types if any
                                    idx = send
                            if line_text:
                                lines.append(line_text.strip())
                        else:
                            idx = send
                    elif swire == 0:
                        val, idx = read_varint(blob, idx)
                        # Maybe stanza type (chorus)?
                        if sfield == 1:
                            # let's see what values this has (1=verse, 2=chorus?)
                            is_chorus = (val == 2 or val == 3) # let's check
                    else:
                        idx = sub_end
                if lines:
                    stanzas.append({"is_chorus": is_chorus, "lines": lines})
            else:
                idx = sub_end
        elif wire_type == 0:
            _, idx = read_varint(blob, idx)
        else:
            break
            
    return stanzas

# Test on English 1
cursor.execute("""
    SELECT s.SONG_LYRICS FROM SONG_IDS i
    JOIN SONG_DATA s ON i.SONG_ID = s.ID
    WHERE i.HYMN_TYPE = 0 AND i.HYMN_NUMBER = '1'
""")
blob = cursor.fetchone()[0]
stanzas = parse_song_lyrics(blob)
print(f"Decoded {len(stanzas)} stanzas for English 1:")
for s_idx, st in enumerate(stanzas):
    print(f"\n[Stanza {s_idx+1}] (Chorus: {st['is_chorus']}):")
    for l in st['lines']:
        print("  ", l)

# Test on another song with chorus, e.g. English 300 or 100
cursor.execute("""
    SELECT i.HYMN_NUMBER, s.SONG_TITLE, s.SONG_LYRICS FROM SONG_IDS i
    JOIN SONG_DATA s ON i.SONG_ID = s.ID
    WHERE i.HYMN_TYPE = 0 AND i.HYMN_NUMBER = '130'
""")
row = cursor.fetchone()
if row:
    print(f"\n--- English {row[0]}: {row[1]} ---")
    stanzas = parse_song_lyrics(row[2])
    for s_idx, st in enumerate(stanzas):
        print(f"\n[Stanza {s_idx+1}] (Chorus: {st['is_chorus']}):")
        for l in st['lines']:
            print("  ", l)
