import re

pattern = re.compile(r'(?:^|[\s"\'\(\[\{“‘«„”’\—\–\-\:\;\.\u201c\u201d\u2018\u2019\ufffd])(\d{1,2})([a-g]?)([A-Za-z]+)')

samples = []
with open(r'd:\Magang\Baca\pdb\roti_hayat_full.txt', 'r', encoding='utf-8', errors='ignore') as f:
    for idx, l in enumerate(f):
        if 400000 <= idx <= 410000: # Matius
            for m in pattern.finditer(l):
                num, ref, w = m.group(1), m.group(2), m.group(3)
                if ref:
                    samples.append((num, ref, w, l.strip()[:70]))

print(f"Total samples with ref: {len(samples)}")
for s in samples[:40]:
    print(f"num={s[0]:<2} ref={repr(s[1]):<4} word={repr(s[2]):<15} | {s[3]}")
