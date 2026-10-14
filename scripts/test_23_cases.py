import sys
import re

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

test_str = 'Dengan perantaraan Silwanus yang kuanggap sebagai seorang saudara seiman yang dapat dipercayai, ku menulis dengan singkat kepada kamu untuk menasihati dan 1cmeyakinkan kamu bahwa ini adalah 2anugerah yang benar-benar dari Allah. Berdirilah dengan teguh di dalamnya!'
pattern = re.compile(r'(^|[\s"\'\(\[\{“‘«„\—\–\-\:\;\u201c\u2018\ufffd])(\d{1,2})([a-g]?)([A-Za-z\-]+)')
matches = list(pattern.finditer(test_str))
print('Matches count:', len(matches))
for m in matches:
    print('Match:', repr(m.group(0)), 'prefix:', repr(m.group(1)), 'num:', repr(m.group(2)), 'cross:', repr(m.group(3)), 'word:', repr(m.group(4)))
