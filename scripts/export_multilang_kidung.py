import json
import sqlite3
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

SQLITE_PATH = r'd:\Magang\Baca\Kidung\hymnaldb-v30.sqlite'
JSON_IN_PATH = r'd:\Magang\Baca\public\kidung\kidung_data.json'
JSON_OUT_PATH = r'd:\Magang\Baca\public\kidung\kidung_data.json'
DIST_OUT_PATH = r'd:\Magang\Baca\dist\kidung\kidung_data.json'

LANG_MAP = {
    0: ("en", "English", "🇬🇧"),
    1: ("nl", "Nederlands", "🇳🇱"),
    2: ("de", "Deutsch", "🇩🇪"),
    3: ("zht", "繁體中文", "🇭🇰"),
    4: ("zh", "简体中文", "🇨🇳"),
    5: ("ceb", "Cebuano", "🇵🇭"),
    6: ("tl", "Tagalog", "🇵🇭"),
    7: ("fr", "Français", "🇫🇷"),
    8: ("es", "Español", "🇪🇸"),
    9: ("ko", "한국어", "🇰🇷"),
    10: ("ja", "日本語", "🇯🇵"),
    11: ("fa", "فارسی", "🇮🇷"),
    12: ("ru", "Русский", "🇷🇺"),
    13: ("pt", "Português", "🇧🇷"),
}

# Preference order when multiple songs exist for a language
# e.g. for English, HymnType 0 (Classic Hymns) > 2 (New Songs) > 1 (Children)
def get_hymn_type_priority(h_type):
    if h_type in (0, 7, 8, 14, 15, 16):
        return 1
    if h_type in (2, 9, 10):
        return 2
    return 3

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
            h_type = 0
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

def main():
    print("Opening SQLite database...")
    conn = sqlite3.connect(SQLITE_PATH)
    cursor = conn.cursor()

    print("Loading JSON data...")
    with open(JSON_IN_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Pre-cache songs in sqlite for fast lookup: (hymn_type, hymn_number) -> (id, title, lang, lyrics_blob)
    print("Building memory cache of all songs in hymnaldb...")
    cursor.execute("""
        SELECT i.HYMN_TYPE, i.HYMN_NUMBER, s.ID, s.SONG_TITLE, s.SONG_LANGUAGE, s.SONG_LYRICS, s.SONG_META_DATA_LANGUAGES
        FROM SONG_IDS i
        JOIN SONG_DATA s ON i.SONG_ID = s.ID
    """)
    rows = cursor.fetchall()
    
    song_map = {}
    id_map = {}
    for r in rows:
        ht, hn, sid, title, lang, lyrics, lang_blob = r
        song_map[(ht, str(hn))] = (sid, title, lang, lyrics, lang_blob)
        if ht == 17:
            id_map[str(hn)] = (sid, title, lang, lyrics, lang_blob)

    print(f"Loaded {len(song_map)} entries from hymnaldb (Indonesian songs: {len(id_map)}).")

    stats = {
        "kidung_with_multilang": 0,
        "suplemen_with_multilang": 0,
        "total_lang_instances": 0
    }

    def process_song_list(song_list, is_suplemen=False):
        for song in song_list:
            n = song['number']
            # Find in id_map
            sqlite_entry = None
            if not is_suplemen:
                sqlite_entry = id_map.get(str(n))
            else:
                # Try 1000 + n, then n
                if n < 1000 and str(1000 + n) in id_map:
                    sqlite_entry = id_map[str(1000 + n)]
                elif str(n) in id_map:
                    sqlite_entry = id_map[str(n)]

            if not sqlite_entry:
                continue

            sid, title, lang, lyrics, lang_blob = sqlite_entry
            links = parse_language_links(lang_blob)
            if not links:
                continue

            # Process links
            languages_dict = {}
            for h_type, h_num in links:
                target_entry = song_map.get((h_type, str(h_num)))
                if not target_entry:
                    continue

                t_sid, t_title, t_lang, t_lyrics, _ = target_entry
                if t_lang not in LANG_MAP:
                    continue

                lang_code, lang_name, lang_flag = LANG_MAP[t_lang]

                # Check if already exists, check priority
                if lang_code in languages_dict:
                    current_priority = get_hymn_type_priority(languages_dict[lang_code]['hymnType'])
                    new_priority = get_hymn_type_priority(h_type)
                    if new_priority >= current_priority:
                        continue # keep existing higher priority

                # Parse lyrics
                stanzas = parse_song_lyrics(t_lyrics)
                if not stanzas:
                    continue

                languages_dict[lang_code] = {
                    "code": lang_code,
                    "name": lang_name,
                    "flag": lang_flag,
                    "hymnType": h_type,
                    "hymnNumber": str(h_num),
                    "title": t_title or "",
                    "stanzas": stanzas
                }

            if languages_dict:
                if not is_suplemen:
                    stats["kidung_with_multilang"] += 1
                else:
                    stats["suplemen_with_multilang"] += 1
                stats["total_lang_instances"] += len(languages_dict)

                # Available languages list, ordered with 'id' first, then 'en', 'zh', 'es', etc.
                lang_order = ["id", "en", "zh", "zht", "es", "ko", "ja", "de", "fr", "pt", "tl", "ceb", "ru", "nl", "fa"]
                available = ["id"] + [l for l in lang_order if l in languages_dict]
                # Any remaining not in lang_order
                for l in languages_dict:
                    if l not in available:
                        available.append(l)

                song["availableLanguages"] = available
                song["languages"] = languages_dict
            else:
                song["availableLanguages"] = ["id"]
                song["languages"] = {}

    print("Processing Kidung...")
    process_song_list(data['kidung'], is_suplemen=False)

    print("Processing Suplemen...")
    process_song_list(data['suplemen'], is_suplemen=True)

    print(f"\nStats:")
    print(f"  Kidung with multilang: {stats['kidung_with_multilang']} / {len(data['kidung'])}")
    print(f"  Suplemen with multilang: {stats['suplemen_with_multilang']} / {len(data['suplemen'])}")
    print(f"  Total multilingual songs linked: {stats['total_lang_instances']}")

    # Save to public
    print(f"Writing to {JSON_OUT_PATH}...")
    with open(JSON_OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)

    file_size_mb = os.path.getsize(JSON_OUT_PATH) / (1024 * 1024)
    print(f"Saved {JSON_OUT_PATH} ({file_size_mb:.2f} MB)")

    # Save to dist if exists
    if os.path.exists(os.path.dirname(DIST_OUT_PATH)):
        print(f"Writing to {DIST_OUT_PATH}...")
        with open(DIST_OUT_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=1)
        print("Updated dist copy as well.")

if __name__ == '__main__':
    main()
