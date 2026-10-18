import json
import re
import os
import glob

def check_frontmatter():
    path = 'public/bible/scofield/frontmatter_scofield_1917.json'
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print("=== Checking Scofield Frontmatter ===")
    for k, v in data.items():
        if isinstance(v, str):
            text = v
            title = text.split('\n')[0] if text else k
            paras = [p.strip() for p in text.split('\n\n') if p.strip()]
        else:
            title = v.get('title', k)
            paras = v.get('paragraphs', [])
        print(f"\n[Document: {k}] - Title: '{title}' ({len(paras)} paragraphs)")
        for idx, p in enumerate(paras):
            # Check broken hyphenated words
            broken = re.findall(r'\b[a-zA-Z]+-\s+[a-zA-Z]+\b', p)
            if broken:
                print(f"  Line {idx} hyphenation: {broken}")
            # Check double words e.g. "the the"
            doubles = re.findall(r'\b([a-zA-Z]{3,})\s+\1\b', p, re.IGNORECASE)
            if doubles:
                print(f"  Line {idx} repeated words: {doubles}")
            # Check suspicious unclosed parentheses or brackets
            if p.count('(') != p.count(')'):
                # some bib refs might span, but good to check
                pass

def check_bible_books():
    print("\n=== Checking Indonesian Bible JSON Integrity ===")
    files = glob.glob('public/bible/*.json')
    bad_files = []
    total_verses = 0
    total_notes = 0
    for fpath in files:
        fname = os.path.basename(fpath)
        if fname in ['books.json']:
            continue
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                d = json.load(f)
            bname = d.get('name', '')
            chapters = d.get('chapters', {})
            for c_num, c_data in chapters.items():
                verses = c_data.get('verses', [])
                total_verses += len(verses)
                footnotes = c_data.get('footnotes', [])
                total_notes += len(footnotes)
                for v in verses:
                    v_text = v.get('text', '')
                    if not v_text or len(v_text.strip()) == 0:
                        print(f"  Empty verse in {fname} ch {c_num} v {v.get('verse')}")
        except Exception as e:
            bad_files.append((fname, str(e)))
    print(f"Checked {len(files)} books: Total {total_verses} verses, {total_notes} footnotes. Errors: {len(bad_files)}")
    if bad_files:
        for fn, err in bad_files:
            print(f"  Error in file {fn}: {err}")

def check_scofield_books():
    print("\n=== Checking Scofield 1917 JSON Integrity ===")
    files = glob.glob('public/bible/scofield/*.json')
    bad_files = []
    total_verses = 0
    total_notes = 0
    for fpath in files:
        fname = os.path.basename(fpath)
        if fname in ['books.json', 'frontmatter_scofield_1917.json', 'scofield_topical_index.json']:
            continue
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                d = json.load(f)
            chapters = d.get('chapters', {})
            for c_num, c_data in chapters.items():
                verses = c_data.get('verses', [])
                total_verses += len(verses)
                footnotes = c_data.get('footnotes', [])
                total_notes += len(footnotes)
                for v in verses:
                    v_text = v.get('text', '')
                    if not v_text or len(v_text.strip()) == 0:
                        print(f"  Empty verse in Scofield {fname} ch {c_num} v {v.get('verse')}")
        except Exception as e:
            bad_files.append((fname, str(e)))
    print(f"Checked {len(files)} Scofield books: Total {total_verses} verses, {total_notes} notes. Errors: {len(bad_files)}")

if __name__ == '__main__':
    check_frontmatter()
    check_bible_books()
    check_scofield_books()
