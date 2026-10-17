import pymupdf
import re
import json
import os

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pdf_path = os.path.join(root_dir, 'Alkitab', 'scofieldreferenc0000revc.pdf')
scofield_dir = os.path.join(root_dir, 'public', 'bible', 'scofield')

print(f"Opening PDF: {pdf_path}")
doc = pymupdf.open(pdf_path)
print(f"Total PDF pages: {len(doc)}")

# Load all book files in public/bible/scofield/
scofield_files = [f for f in os.listdir(scofield_dir) if f.endswith('.json')]
print(f"Found {len(scofield_files)} Scofield book JSON files.")

# Map english name to file name
book_file_map = {}
for fname in scofield_files:
    fpath = os.path.join(scofield_dir, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        if isinstance(data, dict):
            bname = data.get('name', '').strip().upper()
            if bname:
                book_file_map[bname] = fname

print(f"Mapped {len(book_file_map)} book names to files.")

# Scan all pages for Outlines and Missing Footnotes
# For each page:
# 1. Determine book from header
# 2. Extract outline headings
# 3. Extract footnotes at bottom
outlines_by_book = {} # outlines_by_book[book_name][chapter] = list of {verse_hint, outline_text}

for p in range(12, len(doc)):
    page = doc[p]
    blocks = page.get_text("blocks")
    if not blocks:
        continue
        
    # Read header block (y0 < 45)
    hdr_block = ""
    for b in blocks:
        if b[1] < 45:
            hdr_block = b[4].strip().replace('\n', ' ')
            break
            
    if not hdr_block:
        continue
        
    hdr_upper = hdr_block.upper()
    matched_book = None
    for bname in book_file_map.keys():
        if bname in hdr_upper:
            matched_book = bname
            break
            
    if not matched_book:
        continue
        
    # Parse chapter and verse range from header: e.g. "1 1] GENESIS. [1 4" or "3 1] EXODUS. [3 22"
    m = re.search(r'(\d+)\s+(\d+)\]\s*[A-Z\s\.]+\s*\[(\d+)\s+(\d+)', hdr_upper)
    ch_start = 1
    if m:
        ch_start = int(m.group(1))
    else:
        nums = re.findall(r'\b\d+\b', hdr_block)
        if nums:
            ch_start = int(nums[0])
            
    # Find outline headings: small centered blocks between y0=40 and y0=330
    for b in blocks:
        x0, y0, x1, y1, text, b_num, b_type = b
        clean = text.strip()
        lines = [l.strip() for l in clean.splitlines() if l.strip()]
        if 1 <= len(lines) <= 3 and 40 < y0 < 320:
            joined = ' '.join(lines)
            # Filter outline candidates
            if len(joined) > 12 and not re.match(r'^\d+\s+[A-Za-z]', joined) and not any(k in joined.upper() for k in ['CHAPTER', 'GENESIS', 'EXODUS', 'MATTHEW']):
                if (joined.endswith('.') or joined.endswith(')')) and any(w in joined.lower() for w in ['the ', 'covenant', 'type of', 'rest', 'creation', 'judgment', 'day', 'fall', 'blessing', 'vision', 'ministry', 'epistle']):
                    if matched_book not in outlines_by_book:
                        outlines_by_book[matched_book] = {}
                    if ch_start not in outlines_by_book[matched_book]:
                        outlines_by_book[matched_book][ch_start] = []
                    outlines_by_book[matched_book][ch_start].append(joined)

print(f"Extracted outline headings for {len(outlines_by_book)} books from PDF!")

# Enrich book JSONs where outlines were found
updated_count = 0
for bname, chap_dict in outlines_by_book.items():
    fname = book_file_map.get(bname)
    if not fname or fname == 'kejadian.json': # Genesis already manually perfected
        continue
    fpath = os.path.join(scofield_dir, fname)
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            bdata = json.load(f)
            
        modified = False
        for ch_num_str, outlines_list in chap_dict.items():
            ch_data = bdata.get('chapters', {}).get(str(ch_num_str))
            if not ch_data or not ch_data.get('verses'):
                continue
                
            verses = ch_data['verses']
            # Assign first outline to verse 1 if not already assigned
            if outlines_list and not verses[0].get('outlines'):
                verses[0]['outlines'] = outlines_list[0]
                modified = True
                
        if modified:
            with open(fpath, 'w', encoding='utf-8') as f:
                json.dump(bdata, f, ensure_ascii=False, indent=2)
            updated_count += 1
    except Exception as e:
        print(f"Error enriching {fname}: {e}")

print(f"Successfully enriched {updated_count} books with PDF outline headings!")
