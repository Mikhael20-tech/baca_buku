import os
import sys
import re
import json

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

rh_path = r"d:\Magang\Baca\pdb\rhv2019_full.txt"
output_dir = r"d:\Magang\Baca\public\kidung"
os.makedirs(output_dir, exist_ok=True)
output_file = os.path.join(output_dir, "kidung_data.json")

KIDUNG_CATEGORIES = [
    { "id": "memuji-allah-tritunggal", "name": "Memuji Allah Tritunggal", "range": "001 - 005", "numbers": list(range(1, 6)) },
    { "id": "menyembah-bapa", "name": "Menyembah Bapa", "range": "006 - 052", "numbers": list(range(6, 53)) },
    { "id": "memuji-tuhan", "name": "Memuji Tuhan", "range": "053 - 193, 781 - 782", "numbers": list(range(53, 194)) + [781, 782] },
    { "id": "kepenuhan-roh-kudus", "name": "Kepenuhan Roh Kudus", "range": "194 - 228", "numbers": list(range(194, 229)) },
    { "id": "sukacita-beroleh-selamat", "name": "Bukti dan Sukacita Beroleh Selamat", "range": "229 - 268", "numbers": list(range(229, 269)) },
    { "id": "damba", "name": "Damba", "range": "269 - 329", "numbers": list(range(269, 330)) },
    { "id": "konsekrasi", "name": "Konsekrasi", "range": "330 - 355", "numbers": list(range(330, 356)) },
    { "id": "kesatuan-dengan-kristus", "name": "Kesatuan dengan Kristus", "range": "356 - 366", "numbers": list(range(356, 367)) },
    { "id": "mengalami-kristus", "name": "Mengalami Kristus", "range": "367 - 440", "numbers": list(range(367, 441)) },
    { "id": "mengalami-allah", "name": "Mengalami Allah", "range": "441 - 453, 785 - 786", "numbers": list(range(441, 454)) + [785, 786] },
    { "id": "kemegahan-salib", "name": "Kemegahan Salib", "range": "454 - 457", "numbers": list(range(454, 458)) },
    { "id": "jalan-salib", "name": "Jalan Salib", "range": "458 - 471", "numbers": list(range(458, 472)) },
    { "id": "hayat-kebangkitan", "name": "Hayat Kebangkitan", "range": "472 - 473", "numbers": list(range(472, 474)) },
    { "id": "dorongan", "name": "Dorongan", "range": "474 - 489", "numbers": list(range(474, 490)) },
    { "id": "hiburan-dalam-pencobaan", "name": "Hiburan dalam Pencobaan", "range": "490 - 528", "numbers": list(range(490, 529)) },
    { "id": "berbagai-aspek-hayat-batini", "name": "Berbagai Aspek Hayat Batini", "range": "529 - 547", "numbers": list(range(529, 548)) },
    { "id": "kesembuhan-ilahi", "name": "Kesembuhan Ilahi", "range": "548 - 550", "numbers": list(range(548, 551)) },
    { "id": "doa", "name": "Doa", "range": "551 - 578", "numbers": list(range(551, 579)) },
    { "id": "membaca-alkitab", "name": "Membaca Alkitab", "range": "579 - 591", "numbers": list(range(579, 592)) },
    { "id": "gereja", "name": "Gereja", "range": "592 - 623", "numbers": list(range(592, 624)) },
    { "id": "bersidang", "name": "Bersidang", "range": "624 - 631", "numbers": list(range(624, 632)) },
    { "id": "peperangan-rohani", "name": "Peperangan Rohani", "range": "632 - 649", "numbers": list(range(632, 650)) },
    { "id": "pelayanan", "name": "Pelayanan", "range": "650 - 661", "numbers": list(range(650, 662)) },
    { "id": "memberitakan-injil", "name": "Memberitakan Injil", "range": "662 - 669", "numbers": list(range(662, 670)) },
    { "id": "injil", "name": "Injil", "range": "670 - 739, 783 - 784", "numbers": list(range(670, 740)) + [783, 784] },
    { "id": "baptisan", "name": "Baptisan", "range": "740 - 744", "numbers": list(range(740, 745)) },
    { "id": "kerajaan", "name": "Kerajaan", "range": "745 - 751", "numbers": list(range(745, 752)) },
    { "id": "harapan-mulia", "name": "Harapan Mulia", "range": "752 - 767", "numbers": list(range(752, 768)) },
    { "id": "manifestasi-akhir", "name": "Manifestasi Akhir", "range": "768 - 780", "numbers": list(range(768, 781)) }
]

SUPLEMEN_CATEGORIES = [
    { "id": "s-kata-kata-pujian", "name": "KATA-KATA PUJIAN", "range": "0001 - 0027", "min": 1, "max": 27 },
    { "id": "s-roh-dan-hayat", "name": "ROH DAN HAYAT", "range": "0101 - 0137", "min": 101, "max": 137 },
    { "id": "s-menikmati-kristus", "name": "MENIKMATI KRISTUS", "range": "0201 - 0247", "min": 201, "max": 247 },
    { "id": "s-mendambakan-kristus", "name": "MENDAMBAKAN KRISTUS", "range": "0301 - 0329", "min": 301, "max": 329 },
    { "id": "s-penuntutan-dan-pertumbuhan", "name": "PENUNTUTAN DAN PERTUMBUHAN", "range": "0401 - 0429", "min": 401, "max": 429 },
    { "id": "s-visi-gereja", "name": "VISI GEREJA", "range": "0501 - 0533", "min": 501, "max": 533 },
    { "id": "s-pembangunan-dan-kesatuan", "name": "PEMBANGUNAN DAN KESATUAN", "range": "0601 - 0618", "min": 601, "max": 618 },
    { "id": "s-hidup-gereja", "name": "HIDUP GEREJA", "range": "0701 - 0752", "min": 701, "max": 752 },
    { "id": "s-pelayanan-dan-injil", "name": "PELAYANAN DAN INJIL", "range": "0801 - 0849", "min": 801, "max": 849 },
    { "id": "s-pengharapan-dan-bersiap-sedia", "name": "PENGHARAPAN DAN BERSIAP SEDIA", "range": "0901 - 0915", "min": 901, "max": 915 },
    { "id": "s-ekonomi-allah", "name": "EKONOMI ALLAH", "range": "1001 - 1005", "min": 1001, "max": 1005 },
    { "id": "s-lain-lain", "name": "LAIN-LAIN", "range": "2001 - 2032", "min": 2001, "max": 2032 }
]

def clean_line(s):
    if not s:
        return ""
    return s.strip().replace('\xa0', ' ').replace('\r', '')

def parse_song_block(raw_header, body_lines, song_type):
    # Determine number and title
    if song_type == 'kidung':
        # "No. 001 : Title"
        m = re.match(r'^No\.\s*(\d+)\s*:\s*(.*)', raw_header)
        num_int = int(m.group(1)) if m else 0
        raw_num = f"{num_int:03d}"
        title = m.group(2).strip() if m else ""
        formatted_num = f"No. {num_int:03d}"
        display_num = str(num_int)
        song_id = f"kidung-{num_int}"
        prefix = "No."
        
        # Category lookup
        category = "Lain-lain"
        for cat in KIDUNG_CATEGORIES:
            if num_int in cat["numbers"]:
                category = cat["name"]
                break
    else:
        # Suplemen: "0001 Title" or "2032 Kasih Karunia"
        m = re.match(r'^(\d{4})\s*(.*)', raw_header)
        if m:
            num_str = m.group(1)
            num_int = int(num_str)
            title = m.group(2).strip()
        else:
            m2 = re.match(r'^\d+', raw_header)
            num_int = int(m2.group(0)) if m2 else 0
            num_str = f"{num_int:04d}"
            title = raw_header[len(num_str):].strip()
            
        formatted_num = f"S. {num_str}"
        display_num = f"S. {num_str}"
        song_id = f"suplemen-{num_str}"
        prefix = "S."
        
        # Category lookup
        category = "LAIN-LAIN"
        for cat in SUPLEMEN_CATEGORIES:
            if cat["min"] <= num_int <= cat["max"]:
                category = cat["name"]
                break

    meta_lines = []
    key_meter = ""
    english_ref = ""
    author = ""
    meter = ""

    stanzas = []
    current_stanza_type = None # 'verse' or 'chorus'
    current_stanza_num = None
    current_stanza_lines = []

    # First pass: identify meta lines vs lyrics lines
    in_lyrics = False
    lyrics_lines = []

    for raw_l in body_lines:
        is_break = ('\xa0' in raw_l)
        raw_trimmed = raw_l.strip()
        l = raw_trimmed.replace('\xa0', ' ').replace('\r', '').replace('’', "'").replace('‘', "'").replace('”', '"').replace('“', '"')
        
        if not l:
            if is_break and in_lyrics and current_stanza_lines:
                stanzas.append({
                    "type": current_stanza_type or "verse",
                    "num": current_stanza_num,
                    "lines": current_stanza_lines
                })
                current_stanza_lines = []
                current_stanza_type = None
                current_stanza_num = None
            continue

        if not in_lyrics:
            # Check if this line is metadata
            if l.startswith('('):
                if 'Ing.' in l:
                    english_ref = l.strip('()')
                elif any(a in l for a in ['WL', 'W.L', 'C.W.', 'M.E.B.', 'D.T.', 'B.M.', 'Frances', 'Ken', 'Heber', 'Watts', 'Wesley', 'Cowper', 'Newton']):
                    author = l.strip('()')
                meta_lines.append(l)
                continue
            elif 'Ing.' in l:
                english_ref = l.strip('()')
                meta_lines.append(l)
                continue
            elif re.match(r'^[\d\s]+$', l) and len(l) <= 15:
                # Metrum like "8 5 8 3"
                meter = l
                meta_lines.append(l)
                continue
            elif re.match(r'^(Not lagu|Lagu:)', l, re.IGNORECASE):
                meta_lines.append(l)
                continue
            elif '=' in l or re.match(r'^[A-Ga-g]=', l) or re.match(r'^\d+/\d+', l) or re.match(r'^[A-Ga-g]\s+\d+/\d+', l):
                key_meter = l
                meta_lines.append(l)
                continue
            else:
                in_lyrics = True

        # Now in lyrics
        if l.startswith('KIDUNG INDONESIA') or l.startswith('SUPLEMEN INDONESIA') or re.match(r'^\d{3,4}-\d{3,4}', l):
            break

        # Check verse start: e.g. "1. ..."
        vm = re.match(r'^(\d+)\.\s*(.*)', l)
        if vm:
            if current_stanza_lines:
                stanzas.append({
                    "type": current_stanza_type or "verse",
                    "num": current_stanza_num,
                    "lines": current_stanza_lines
                })
                current_stanza_lines = []
            current_stanza_type = "verse"
            current_stanza_num = int(vm.group(1))
            if vm.group(2).strip():
                current_stanza_lines.append(vm.group(2).strip())
            continue

        # Check chorus start
        cm = re.match(r'^(Koor|Refrein|Chorus)\s*:?\s*(.*)', l, re.IGNORECASE)
        if cm:
            if current_stanza_lines:
                stanzas.append({
                    "type": current_stanza_type or "verse",
                    "num": current_stanza_num,
                    "lines": current_stanza_lines
                })
                current_stanza_lines = []
            current_stanza_type = "chorus"
            current_stanza_num = None
            rest = cm.group(2).strip()
            if rest:
                current_stanza_lines.append(rest)
            continue

        if current_stanza_type is None:
            current_stanza_type = "verse"
        current_stanza_lines.append(l)

    if current_stanza_lines:
        stanzas.append({
            "type": current_stanza_type or "verse",
            "num": current_stanza_num,
            "lines": current_stanza_lines
        })

    # Extract snippets for search & list display
    first_line = ""
    chorus_snippet = ""
    for s in stanzas:
        if s["type"] == "verse" and not first_line and s["lines"]:
            first_line = " ".join(s["lines"])[:120]
        elif s["type"] == "chorus" and not chorus_snippet and s["lines"]:
            chorus_snippet = " ".join(s["lines"])[:100]

    return {
        "id": song_id,
        "type": song_type,
        "number": num_int,
        "displayNumber": display_num,
        "formattedNumber": formatted_num,
        "prefix": prefix,
        "title": title,
        "category": category,
        "keyMeter": key_meter,
        "meter": meter,
        "author": author,
        "englishRef": english_ref,
        "meta": meta_lines,
        "firstLine": first_line,
        "chorusSnippet": chorus_snippet,
        "stanzas": stanzas
    }

print("Reading rhv2019_full.txt...")
with open(rh_path, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

print(f"Loaded {len(lines)} lines.")

# 1. Parse Kidung (from line 219500 to 378000)
kidung_songs = []
seen_kidung_nums = set()
cur_header = None
cur_header_num = None
cur_body = []

for i in range(219500, 378000):
    line = lines[i]
    s = line.strip()
    if cur_header_num == 786 and ('001-005' in s or i > 377938):
        if cur_header and cur_header_num not in seen_kidung_nums:
            parsed = parse_song_block(cur_header, cur_body, "kidung")
            kidung_songs.append(parsed)
            seen_kidung_nums.add(cur_header_num)
        cur_header = None
        break
    m = re.match(r'^No\.\s*(\d+)\s*:\s*(.*)', s)
    if m:
        num = int(m.group(1))
        if cur_header and cur_header_num not in seen_kidung_nums:
            parsed = parse_song_block(cur_header, cur_body, "kidung")
            kidung_songs.append(parsed)
            seen_kidung_nums.add(cur_header_num)
        cur_header = s
        cur_header_num = num
        cur_body = []
    elif cur_header is not None:
        cur_body.append(line)

if cur_header and cur_header_num not in seen_kidung_nums:
    parsed = parse_song_block(cur_header, cur_body, "kidung")
    kidung_songs.append(parsed)
    seen_kidung_nums.add(cur_header_num)

print(f"Parsed {len(kidung_songs)} unique Kidung songs.")

# Sort kidung by number
kidung_songs.sort(key=lambda s: s["number"])

# 2. Parse Suplemen (from line 1114000 to 1142000)
suplemen_songs = []
seen_suplemen_nums = set()
cur_header = None
cur_body = []
cur_num_str = ""

for i in range(1114000, min(1142000, len(lines))):
    line = lines[i]
    s = line.strip()
    if 'DAFTAR ISI MENURUT ABJAD' in s and cur_header:
        parsed = parse_song_block(cur_header, cur_body, "suplemen")
        suplemen_songs.append(parsed)
        seen_suplemen_nums.add(cur_num_str)
        cur_header = None
        break
    m = re.match(r'^(\d{4})\s*(.*)', s)
    if m:
        num_str = m.group(1)
        if cur_header and cur_num_str not in seen_suplemen_nums:
            parsed = parse_song_block(cur_header, cur_body, "suplemen")
            suplemen_songs.append(parsed)
            seen_suplemen_nums.add(cur_num_str)
        cur_header = s
        cur_num_str = num_str
        cur_body = []
    elif cur_header is not None:
        cur_body.append(line)

if cur_header and cur_num_str not in seen_suplemen_nums:
    parsed = parse_song_block(cur_header, cur_body, "suplemen")
    suplemen_songs.append(parsed)
    seen_suplemen_nums.add(cur_num_str)

print(f"Parsed {len(suplemen_songs)} unique Suplemen songs.")
suplemen_songs.sort(key=lambda s: s["number"])

# Combine all data
final_data = {
    "version": "RHV 2019",
    "categories": {
        "kidung": [
            {
                "id": cat["id"],
                "name": cat["name"],
                "range": cat["range"],
                "count": len([s for s in kidung_songs if s["category"] == cat["name"]])
            } for cat in KIDUNG_CATEGORIES
        ],
        "suplemen": [
            {
                "id": cat["id"],
                "name": cat["name"],
                "range": cat["range"],
                "count": len([s for s in suplemen_songs if s["category"] == cat["name"]])
            } for cat in SUPLEMEN_CATEGORIES
        ]
    },
    "kidung": kidung_songs,
    "suplemen": suplemen_songs
}

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(final_data, f, ensure_ascii=False, indent=2)

print(f"Successfully saved to {output_file} ({os.path.getsize(output_file):,} bytes)")

# Also copy to dist if dist exists
dist_dir = r"d:\Magang\Baca\dist\kidung"
if os.path.exists(r"d:\Magang\Baca\dist"):
    os.makedirs(dist_dir, exist_ok=True)
    import shutil
    shutil.copy2(output_file, os.path.join(dist_dir, "kidung_data.json"))
    print("Copied to dist/kidung/kidung_data.json")
