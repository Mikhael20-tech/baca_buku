import sys
import re

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def split_inline_verses(text, cur_v):
    """
    If text contains the next verse concatenated (e.g. '. 15Perhatikanlah' or '. 25Saudara-saudara' or ' 5a...'),
    split it into (cur_verse_text, next_v_num, next_v_text).
    """
    pattern = re.compile(r'([\.\;\!\?\:\”\"\’\)])\s*(\d{1,3})([a-b]?)(?:\s+|(?=[A-Z]))([A-Z].*)')
    m = pattern.search(text)
    if m:
        cand_v = int(m.group(2))
        if cand_v == cur_v + 1:
            part1 = text[:m.start() + len(m.group(1))].strip()
            rest = m.group(4).strip()
            return part1, cand_v, rest
    return text, None, None

tests = [
    ("Ia yang memanggil kamu adalah setia, Ia juga akan menggenapinya. 25Saudara-saudara, doakanlah kami.", 24),
    ("Setiap orang yang lahir dari Allah, tidak berbuat dosa... 10Inilah tandanya anak-anak Allah...", 9),
    ("...membalas yang jahat... 15Perhatikanlah, supaya jangan ada orang...", 14),
    ("...sehingga 10hidupmu layak di hadapan-Nya...", 9),
]

for t, cv in tests:
    p1, nv, nvt = split_inline_verses(t, cv)
    print(f"Cur V={cv} -> part1: {repr(p1[-30:])}")
    print(f"        -> Next V={nv}: {repr(nvt[:40])}")
    print("-" * 50)
