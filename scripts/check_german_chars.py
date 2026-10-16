import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('public/kidung/kidung_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

german_songs = []
for song_list in [data['kidung'], data['suplemen']]:
    for song in song_list:
        if 'de' in song.get('languages', {}):
            german_songs.append(song['languages']['de'])

print(f"Total German songs in database: {len(german_songs)}")

special_chars = {
    'ß': 0, 'ẞ': 0,
    'ä': 0, 'Ä': 0,
    'ö': 0, 'Ö': 0,
    'ü': 0, 'Ü': 0,
}

sample_words_with_eszett = set()
sample_words_with_umlaut = set()

for s in german_songs:
    full_text = s.get('title', '') + ' '
    for st in s.get('stanzas', []):
        full_text += ' '.join(st.get('lines', [])) + ' '
    
    for c in special_chars:
        special_chars[c] += full_text.count(c)
        
    for word in full_text.split():
        clean = word.strip('.,;:!?()-"\'')
        if 'ß' in clean or 'ẞ' in clean:
            sample_words_with_eszett.add(clean)
        if any(u in clean for u in 'äöüÄÖÜ'):
            sample_words_with_umlaut.add(clean)

print("\nOccurrences of German special characters:")
for char, count in special_chars.items():
    print(f"  '{char}': {count} kali")

print("\nSample words using 'ß' (Eszett):")
for w in sorted(list(sample_words_with_eszett))[:20]:
    print(f"  - {w}")

print("\nSample words using Umlaut (ä, ö, ü):")
for w in sorted(list(sample_words_with_umlaut))[:15]:
    print(f"  - {w}")
