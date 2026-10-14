import os, json, re, glob

bible_files = glob.glob('public/bible/*.json')
print(f"Scanning {len(bible_files)} Bible books for anomalies...")

stuck_digit_pattern = re.compile(r'(?:^|[\s"\'\(\[\{“‘«„\—\–\:\u201c\u2018\ufffd])(\d{1,2}[a-zA-Z]+)')
suspect_truncated_pattern = re.compile(r'\b(ukit|aptislah|jarlah|empa)\b', re.IGNORECASE)

issues = []

for fpath in bible_files:
    fname = os.path.basename(fpath)
    if fname == 'books.json':
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for c_str, chap in data.get('chapters', {}).items():
        for v in chap.get('verses', []):
            txt = v.get('text', '')
            vn = v.get('verse', 0)
            
            # Check stuck digits in plain text
            m_stuck = stuck_digit_pattern.findall(txt)
            if m_stuck:
                issues.append((fname, c_str, vn, "stuck_digit", m_stuck, txt[:80]))
                
            # Check known truncated words
            m_trunc = suspect_truncated_pattern.findall(txt)
            if m_trunc:
                issues.append((fname, c_str, vn, "truncated_word", m_trunc, txt[:80]))

print(f"Total issues found: {len(issues)}")
if issues:
    print("First 20 issues:")
    for iss in issues[:20]:
        print(" ", iss)
else:
    print("PERFECT! Zero stuck digits and zero truncated words across all books!")
