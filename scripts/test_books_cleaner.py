import json
from test_comprehensive_cleaner import clean_cross_refs_comprehensive

total_changes = 0
for book in ['matius.json', 'markus.json', 'kejadian.json', 'roma.json']:
    with open('public/bible/' + book, 'r', encoding='utf-8') as f:
        d = json.load(f)
    print(f'=== {book} ===')
    count = 0
    for ch, cdata in d['chapters'].items():
        for v in cdata['verses']:
            cleaned = clean_cross_refs_comprehensive(v['text'])
            if cleaned != v['text']:
                count += 1
                if count <= 5:
                    old_words = set(v['text'].split())
                    new_words = set(cleaned.split())
                    diff = old_words - new_words
                    print(f"  {ch}:{v['verse']} replaced: {diff}")
    print(f'  Total verses cleaned in {book}: {count}')
    total_changes += count
