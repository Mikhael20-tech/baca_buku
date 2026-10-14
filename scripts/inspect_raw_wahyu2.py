with open(r'd:\Magang\Baca\pdb\roti_hayat_full.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

w_start = text.find('KITAB WAHYU')
if w_start == -1:
    w_start = text.find('WAHYU')
p2_start = text.find('PASAL 2', w_start)
print("=== WAHYU 2 RAW IN ROTI HAYAT ===")
print(text[p2_start:p2_start+4000])
