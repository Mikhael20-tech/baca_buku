import sys
import re

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
file_path = r"D:\Magang\Baca\pdb\roti_hayat_full.txt"

all_lines = []
with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    for line in f:
        all_lines.append(line)

# Let's inspect the footnotes across Matius 1-28
# In lines 401115 to 405890 (Verses and inline footnotes)
# and lines 405895 to 411175 (Footnotes of pasal 4-28)

def extract_footnotes_pasal_4_to_28():
    fn_dict = {} # (pasal, ayat, cat_num) -> text
    cur_pasal = None
    cur_key = None
    cur_text = []

    for cur in range(405895, 411175):
        s = all_lines[cur-1].strip()
        if not s or s == '\xa0':
            continue
        m_pasal = re.match(r'^PASAL\s+(\d+)$', s, re.IGNORECASE)
        if m_pasal:
            if cur_key and cur_text:
                fn_dict[cur_key] = " ".join(cur_text)
                cur_text = []
            cur_pasal = int(m_pasal.group(1))
            cur_key = None
            continue
        
        # Match footnote marker like "11  Setelah dibaptis..." or "161  Sesudah dibaptis..."
        m_fn = re.match(r'^(\d+)(\d)\s+(.+)', s)
        if m_fn and cur_pasal:
            if cur_key and cur_text:
                fn_dict[cur_key] = " ".join(cur_text)
                cur_text = []
            ayat = int(m_fn.group(1))
            cat_num = int(m_fn.group(2))
            cur_key = (cur_pasal, ayat, cat_num)
            cur_text.append(m_fn.group(3))
        else:
            if cur_key:
                cur_text.append(s)

    if cur_key and cur_text:
        fn_dict[cur_key] = " ".join(cur_text)

    return fn_dict

fn_dict = extract_footnotes_pasal_4_to_28()
print(f"Extracted {len(fn_dict)} footnotes for Pasal 4-28!")
# Test sample
print("Sample Matius 4:1 cat 1:", fn_dict.get((4, 1, 1), "")[:80])
print("Sample Matius 5:3 cat 1:", fn_dict.get((5, 3, 1), "")[:80])
print("Sample Matius 28:19 cat 1:", fn_dict.get((28, 19, 1), "")[:80])
