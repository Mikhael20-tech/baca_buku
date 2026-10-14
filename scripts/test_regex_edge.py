import re

pattern = re.compile(r'(^|[\s"\'\(\[\{“‘«„”’\—\–\-\:\;\.\u201c\u201d\u2018\u2019\ufffd])(\d{1,2})([a-g]?)([A-Za-z]+(?:-[A-Za-z]+)*)')

t = 'banyak orang yang berkata tentang ku: “Baginya tidak ada pertolongan dari pada Allah.”1Sela'
matches = list(pattern.finditer(t))
print("Matches found:", len(matches))
for m in matches:
    print(repr(m.group(1)), repr(m.group(2)), repr(m.group(3)), repr(m.group(4)))
