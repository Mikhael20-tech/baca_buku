import sqlite3
import json
import os
import re
import html

def clean_html_to_text(html_content):
    if not html_content:
        return ''
    # Convert <ref>...</ref> into plain citation
    t = re.sub(r'</?ref>', '', html_content)
    t = re.sub(r'</?(?:grk|blu|b|i|p|span|div)[^>]*>', ' ', t)
    t = html.unescape(t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def extract_keyword(comments_html):
    if not comments_html:
        return ''
    m = re.search(r'<b>(.*?)</b>', comments_html, re.IGNORECASE | re.DOTALL)
    if m:
        kw = re.sub(r'<[^>]+>', '', m.group(1))
        return html.unescape(kw).strip()
    return ''

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    alkitab_dir = os.path.join(root_dir, 'Alkitab')
    out_dir = os.path.join(root_dir, 'public', 'bible', 'scofield')
    os.makedirs(out_dir, exist_ok=True)

    with open(os.path.join(root_dir, 'public', 'bible', 'books.json'), 'r', encoding='utf-8') as f:
        app_books = json.load(f)

    with open(os.path.join(alkitab_dir, 'KJV.json'), 'r', encoding='utf-8') as f:
        kjv = json.load(f)

    notes_db = sqlite3.connect(os.path.join(alkitab_dir, 'scofield_reference_notes.sqlite'))
    c_notes = notes_db.cursor()

    index_db = sqlite3.connect(os.path.join(alkitab_dir, 'scofield_reference_index.sqlite'))
    c_index = index_db.cursor()

    # 1. Process Topical Index
    print("Exporting Topical Index...")
    c_index.execute("SELECT Topic, Definition FROM Dictionary ORDER BY Topic COLLATE NOCASE ASC;")
    topics = []
    for topic, definition in c_index.fetchall():
        clean_def = clean_html_to_text(definition)
        # Find all references in definition: <ref>...</ref>
        refs = re.findall(r'<ref>(.*?)</ref>', definition)
        topics.append({
            "topic": topic,
            "definition": clean_def,
            "html": definition,
            "references": refs
        })

    index_out_path = os.path.join(root_dir, 'public', 'bible', 'scofield_index.json')
    with open(index_out_path, 'w', encoding='utf-8') as f:
        json.dump(topics, f, ensure_ascii=False, indent=2)
    print(f"Topical Index written: {len(topics)} topics to {index_out_path}")

    # 2. Process all 66 Books
    scofield_books_list = []
    total_notes_count = 0

    for book_idx in range(len(app_books)):
        book_num = book_idx + 1
        app_book = app_books[book_idx]
        kjv_book = kjv['books'][book_idx]

        book_id = app_book['id']
        book_name_id = app_book['name']
        book_name_en = kjv_book['name']
        testament = app_book.get('testament', 'PL')
        chapters_count = app_book['chapters_count']

        # Get Book Introduction
        c_notes.execute("SELECT Comments FROM BookCommentary WHERE Book = ?;", (book_num,))
        intro_row = c_notes.fetchone()
        intro_html = intro_row[0] if intro_row else ''
        intro_text = clean_html_to_text(intro_html)

        # Get all verse commentaries for this book
        c_notes.execute(
            "SELECT ChapterBegin, VerseBegin, VerseEnd, Comments FROM VerseCommentary WHERE Book = ? ORDER BY ChapterBegin ASC, VerseBegin ASC;",
            (book_num,)
        )
        verse_notes_rows = c_notes.fetchall()

        # Group notes by chapter and verse
        # notes_by_chapter[chapter_num][verse_num] = list of notes
        notes_by_chapter = {}
        for ch_beg, v_beg, v_end, comments in verse_notes_rows:
            if ch_beg not in notes_by_chapter:
                notes_by_chapter[ch_beg] = {}
            if v_beg not in notes_by_chapter[ch_beg]:
                notes_by_chapter[ch_beg][v_beg] = []
            
            kw = extract_keyword(comments)
            clean_cmt = clean_html_to_text(comments)
            # Remove keyword prefix if clean_cmt starts with it
            if kw and clean_cmt.lower().startswith(kw.lower()):
                clean_cmt = clean_cmt[len(kw):].strip()
                if clean_cmt.startswith(':') or clean_cmt.startswith('-'):
                    clean_cmt = clean_cmt[1:].strip()

            refs = re.findall(r'<ref>(.*?)</ref>', comments)
            notes_by_chapter[ch_beg][v_beg].append({
                "verse_begin": v_beg,
                "verse_end": v_end,
                "keyword": kw,
                "text": clean_cmt,
                "html": comments,
                "references": refs
            })
            total_notes_count += 1

        # Build book data structure
        book_chapters = {}
        for chap_idx in range(len(kjv_book['chapters'])):
            chap_num = chap_idx + 1
            kjv_chap = kjv_book['chapters'][chap_idx]
            chap_notes_map = notes_by_chapter.get(chap_num, {})

            chapter_verses = []
            chapter_footnotes = []
            fn_global_idx = 1

            for v_obj in kjv_chap['verses']:
                v_num = v_obj['verse']
                raw_text = v_obj['text']
                v_notes = chap_notes_map.get(v_num, [])

                verse_fn_list = []
                marked_text = raw_text

                if v_notes:
                    for note in v_notes:
                        note_idx = fn_global_idx
                        fn_global_idx += 1

                        fn_item = {
                            "verse": v_num,
                            "note_idx": note_idx,
                            "keyword": note['keyword'],
                            "text": note['text'],
                            "html": note['html'],
                            "references": note['references']
                        }
                        verse_fn_list.append(fn_item)
                        chapter_footnotes.append(fn_item)

                        # Insert <fn n="note_idx"/> in marked_text
                        kw = note['keyword']
                        inserted = False
                        if kw and len(kw) > 2:
                            # Try to match keyword in text
                            pattern = re.compile(re.escape(kw), re.IGNORECASE)
                            m = pattern.search(marked_text)
                            if m:
                                pos = m.end()
                                marked_text = marked_text[:pos] + f'<fn n="{note_idx}"/>' + marked_text[pos:]
                                inserted = True
                        if not inserted:
                            marked_text += f'<fn n="{note_idx}"/>'

                chapter_verses.append({
                    "verse": v_num,
                    "text": raw_text,
                    "marked_text": marked_text,
                    "outlines": None,
                    "footnotes": verse_fn_list if verse_fn_list else None
                })

            book_chapters[str(chap_num)] = {
                "chapter": chap_num,
                "outlines": None,
                "verses": chapter_verses,
                "footnotes": chapter_footnotes
            }

        book_json = {
            "id": book_id,
            "name": book_name_en,
            "name_id": book_name_id,
            "translation": "Scofield Reference Bible (1917)",
            "translation_short": "Scofield 1917",
            "testament": testament,
            "chapters_count": chapters_count,
            "intro": {
                "title": f"Book Introduction - {book_name_en}",
                "html": intro_html,
                "text": intro_text
            },
            "chapters": book_chapters
        }

        book_file_path = os.path.join(out_dir, f"{book_id}.json")
        with open(book_file_path, 'w', encoding='utf-8') as f:
            json.dump(book_json, f, ensure_ascii=False)

        scofield_books_list.append({
            "id": book_id,
            "name": book_name_en,
            "name_id": book_name_id,
            "testament": testament,
            "chapters_count": chapters_count,
            "has_intro": bool(intro_html),
            "notes_count": sum(len(notes_by_chapter.get(c, {}).get(v, [])) for c in notes_by_chapter for v in notes_by_chapter[c])
        })

    # Save books list
    books_list_path = os.path.join(out_dir, "books.json")
    with open(books_list_path, 'w', encoding='utf-8') as f:
        json.dump(scofield_books_list, f, ensure_ascii=False, indent=2)

    print(f"Successfully processed {len(scofield_books_list)} books with {total_notes_count} Scofield notes!")
    print(f"All files saved in {out_dir}")

if __name__ == '__main__':
    main()
