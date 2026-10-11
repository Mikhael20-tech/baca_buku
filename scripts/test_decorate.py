import sys
import re

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
file_path = r"D:\Magang\Baca\pdb\roti_hayat_full.txt"

all_lines = []
with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    for line in f:
        all_lines.append(line)

# Let's run a test on Matius 1:1 and 1:2
verses = {}
fn_dict = {}

cur_pasal = 1
cur_v_num = None
cur_fn_key = None
cur_fn_text = []

for cur in range(401115, 401707):
    s = all_lines[cur-1].strip()
    if not s or s == '\xa0' or s.startswith('o---') or s.startswith('---'):
        continue
    m_v = re.match(r'^(\d+)\s+(.+)', s)
    m_fn = re.match(r'^(\d+)([0-9a-z])\s*(.*)', s)
    
    is_v = False
    if m_v and int(m_v.group(1)) <= 150:
        vn = int(m_v.group(1))
        if cur_v_num is None or vn == cur_v_num + 1 or (cur_v_num and vn == 1):
            is_v = True
            
    if is_v:
        if cur_fn_key and cur_fn_text:
            fn_dict[cur_fn_key] = " ".join(cur_fn_text)
            cur_fn_key = None
            cur_fn_text = []
        cur_v_num = int(m_v.group(1))
        verses[cur_v_num] = m_v.group(2)
    elif m_fn and cur_v_num:
        if cur_fn_key and cur_fn_text:
            fn_dict[cur_fn_key] = " ".join(cur_fn_text)
            cur_fn_text = []
        cur_fn_key = (cur_v_num, m_fn.group(2))
        top = m_fn.group(3)
        if top:
            cur_fn_text.append(top + ":")
    else:
        if cur_fn_key:
            cur_fn_text.append(s)

if cur_fn_key and cur_fn_text:
    fn_dict[cur_fn_key] = " ".join(cur_fn_text)

print(f"Matius 1 Verses: {len(verses)}")
print(f"Matius 1 Footnotes: {len(fn_dict)}")

# Now decorate verse 1
v1_raw = verses[1]
print("V1 Raw:", v1_raw)

def decorate_verse(p_num, v_num, text, fns):
    def repl(m):
        code = m.group(1)
        # lookup in fns
        content = fns.get((v_num, code), "")
        if not content:
            # try first digit or letter
            content = fns.get((v_num, code[0]), "")
        clean_content = content.replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')
        return f'<a class="footnote-ref" href="#fn-{p_num}-{v_num}-{code}" data-title="Matius {p_num}:{v_num} (Catatan {code})" data-fn="{clean_content}"><sup>[{code}]</sup></a>'
    
    return re.sub(r'(\d+[a-z]?)', repl, text)

print("\nV1 Decorated:")
print(decorate_verse(1, 1, v1_raw, fn_dict)[:300])
