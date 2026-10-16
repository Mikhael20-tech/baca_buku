import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

JSON_IN_PATH = r'd:\Magang\Baca\public\kidung\kidung_data.json'
DIST_OUT_PATH = r'd:\Magang\Baca\dist\kidung\kidung_data.json'

with open(JSON_IN_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

def clean_sinalefa(text):
    if not text:
        return ""
    # Remove combining tie below \u035c, combining tie above \u0361, undertie \u203f, overtie \u2040
    t = text.replace('\u035c', '').replace('\u0361', '').replace('\u203f', '').replace('\u2040', '')
    # Replace non-breaking spaces with normal spaces
    t = t.replace('\xa0', ' ')
    # Clean multiple spaces into single space
    t = re.sub(r'[ ]{2,}', ' ', t)
    return t.strip()

cleaned_count = 0
for pool in [data['kidung'], data['suplemen']]:
    for song in pool:
        for lk, lobj in song.get('languages', {}).items():
            if 'title' in lobj:
                lobj['title'] = clean_sinalefa(lobj['title'])
            for st in lobj.get('stanzas', []):
                if 'lines' in st:
                    new_lines = []
                    for line in st['lines']:
                        clean_line = clean_sinalefa(line)
                        if clean_line != line:
                            cleaned_count += 1
                        new_lines.append(clean_line)
                    st['lines'] = new_lines

print(f"Cleaned {cleaned_count} lines containing sinalefa ties.")

# Test sample Kidung 1 ES
k1_es = data['kidung'][0]['languages']['es']
print("\nCleaned Kidung 1 ES preview:")
for l in k1_es['stanzas'][0]['lines']:
    print(" ", l)

with open(JSON_IN_PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, separators=(',', ':'))

with open(DIST_OUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, separators=(',', ':'))

print("Updated public and dist json files successfully.")
