import sys
import re

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

samples = [
    '“3Orang Nazaret”',
    '"3Orang Nazaret"',
    '\u201c3Orang Nazaret\u201d',
    '\ufffd3Orang Nazaret\ufffd',
    '‘1Mengapa kamu',
    '"1Pergilah',
    'Bikeat-2Awen',
    'dijanjikan-2Nya',
    '1aNazaret.',
    '2nabi-nabi,',
    '4edupa',
    '1abintang',
    '1bGalilea.'
]

# We want a regex that matches footnote markers inside verse text:
# Preceded by: start, space, any quote, paren, bracket, hyphen/dash, colon, semicolon
# Followed by: 1 or 2 digits, optional cross-reference letter, then word
# E.g. in '“3Orang Nazaret”':
# prefix quote: '“'
# digit: '3'
# cross-ref: ''
# word: 'Orang'

pattern = re.compile(r'(^|[\s"\'\(\[\{“‘«„\—\–\-\:\;\ufffd\u201c\u2018])(\d{1,2})([a-g]?)([A-Za-z\-]+)')

for s in samples:
    matches = list(pattern.finditer(s))
    res = [(m.group(1), m.group(2), m.group(3), m.group(4)) for m in matches]
    print(f"{s:25s} -> {res}")
