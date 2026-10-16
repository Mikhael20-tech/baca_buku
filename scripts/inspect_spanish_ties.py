import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('public/kidung/kidung_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

k1_es = data['kidung'][0]['languages']['es']
print("K1 ES stanzas with raw characters:")
for st_idx, st in enumerate(k1_es['stanzas']):
    print(f"\nStanza {st_idx+1}:")
    for l in st['lines']:
        chars = [(c, hex(ord(c)), c.encode('unicode_escape').decode()) for c in l if ord(c) > 127 and c not in 'áéíóúÁÉÍÓÚñÑ¡¿']
        print(f"  {l}")
        if chars:
            print(f"     Non-standard chars: {chars}")

