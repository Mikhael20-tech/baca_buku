import sys, os, re
sys.path.append(r"D:\Magang\Baca\scripts")
from export_bible_json import BIBLE_BOOKS

with open(r"D:\Magang\Baca\pdb\roti_hayat_full.txt", "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

def test_extraction():
    all_books_stats = []
    
    for b in BIBLE_BOOKS:
        s_idx = b['start'] - 1
        e_idx = b['end'] - 1
        raw_slice = lines[s_idx:e_idx]
        
        chapters = {}
        cur_chap = None
        cur_v = None
        in_footnotes = False
        
        for l in raw_slice:
            s = l.replace('\xa0', ' ').strip()
            if not s or s.startswith('---') or s.startswith('o---') or s.startswith('Ayat :') or s.startswith('Ayat:'):
                continue
                
            if re.search(r'^\s*Catatan\s+[Kk]aki', s, re.IGNORECASE):
                in_footnotes = True
                continue
                
            m_c = re.match(r'^(PASAL|MAZMUR)\s+(\d+)$', s, re.IGNORECASE)
            if m_c:
                chap_num = int(m_c.group(2))
                if in_footnotes:
                    # If chapter rolls back (e.g. 1 after 28 or 50), end-of-book footnotes started!
                    if cur_chap is not None and chap_num <= cur_chap:
                        break
                    # Otherwise, next chapter in per-chapter book
                    in_footnotes = False
                    
                cur_chap = chap_num
                cur_v = None
                if cur_chap not in chapters:
                    chapters[cur_chap] = {'chapter': cur_chap, 'verses': []}
                continue
                
            if in_footnotes:
                continue
                
            m_v = re.match(r'^(\d+)\s+(.+)', s)
            if m_v:
                vn = int(m_v.group(1))
                if cur_chap is None:
                    cur_chap = 1
                    chapters[1] = {'chapter': 1, 'verses': []}
                if cur_v is None or vn == cur_v + 1 or (cur_v and vn == 1):
                    cur_v = vn
                    chapters[cur_chap]['verses'].append((vn, m_v.group(2)[:30]))
                    
        total_verses = sum(len(c['verses']) for c in chapters.values())
        all_books_stats.append((b['name'], len(chapters), total_verses))
        
    for name, c_cnt, v_cnt in all_books_stats:
        print(f"{name:20s}: {c_cnt:3d} pasal, {v_cnt:5d} ayat")

test_extraction()
