import glob, json, re

all_files = glob.glob('public/bible/*.json')
all_words = set()

for fpath in all_files:
    if 'books.json' in fpath:
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        d = json.load(f)
    for c, ch in d.get('chapters', {}).items():
        for v in ch.get('verses', []):
            txt = v.get('text', '')
            for w in re.findall(r'\b[a-zA-Z]+(?:-[a-zA-Z]+)*\b', txt):
                all_words.add(w)

print(f"Total unique words in output Bible: {len(all_words)}")

# Look for suspicious words starting with [a-h] attached to common words
suspicious = []
for w in sorted(all_words):
    low = w.lower()
    if '-' in low:
        parts = low.split('-')
        # Check reduplication mismatch e.g. ukit-bukit or bimam-imam
        if parts[0] != parts[1]:
            if parts[0][1:] == parts[1]: # e.g. bimam-imam
                suspicious.append(("attached_prefix_in_redup", w))
            elif parts[0] == parts[1][1:]: # e.g. ukit-bukit
                suspicious.append(("truncated_in_redup", w))

print(f"Suspicious hyphenated words found: {len(suspicious)}")
for s in suspicious:
    print(" ", s)
