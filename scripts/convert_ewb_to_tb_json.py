import sqlite3
import zlib
import json
import os

def decode_verse_data(encoded_bytes):
    verse_length, verse_pointer_1, verse_pointer_2, verse_pointer_3 = encoded_bytes
    verse_pointer = (verse_pointer_3 << 16) | (verse_pointer_2 << 8) | verse_pointer_1
    if verse_pointer % 4 != 0:
        overflow = verse_pointer % 4
        verse_pointer -= overflow
        verse_length += overflow * 256
    verse_pointer //= 4
    return verse_length, verse_pointer

def decode_verse_id(encoded_bytes):
    verse_no, chapter_no, book_no, translation_id = encoded_bytes
    if translation_id % 2 != 0:
        overflow = translation_id % 2
        translation_id -= overflow
        book_no += overflow * 256
    if book_no % 4 != 0:
        overflow = book_no % 4
        book_no -= overflow
        chapter_no += overflow * 256
    if chapter_no % 4 != 0:
        overflow = chapter_no % 4
        chapter_no -= overflow
        verse_no += overflow * 256
    verse_no //= 4
    chapter_no //= 4
    book_no //= 4
    translation_id //= 2
    return verse_no, chapter_no, book_no, translation_id

def main():
    ewb_path = 'Alkitab/TB/paid-tb.ewb'
    output_dir = 'public/bible/tb'
    os.makedirs(output_dir, exist_ok=True)

    with open('public/bible/books.json', 'r', encoding='utf-8') as f:
        books_meta = json.load(f)

    conn = sqlite3.connect(ewb_path)
    cur = conn.cursor()

    cur.execute('SELECT books.rowid, name, abbrev_name, alt_name, book_info, verse_info, stream FROM books JOIN streams ON books.rowid = streams.rowid ORDER BY books.rowid')
    rows = cur.fetchall()

    tb_books_list = []
    total_verses = 0

    for idx, row in enumerate(rows):
        rowid, name, abbrev_name, alt_name, book_info, verse_info, stream_blob = row
        meta = books_meta[idx]
        book_id = meta['id']
        testament = meta['testament']

        # Decompress stream, skip first 2 dummy bytes '%K'
        stream = zlib.decompress(stream_blob).decode('utf-8')[2:]

        chapters_dict = {}
        verse_count = len(verse_info) // 8

        for i in range(0, len(verse_info), 8):
            verse_raw = verse_info[i:i+8]
            v_len, v_ptr = decode_verse_data(verse_raw[:4])
            v_no, c_no, b_no, t_id = decode_verse_id(verse_raw[4:])

            v_txt = stream[v_ptr:v_ptr+v_len].strip()
            total_verses += 1

            c_key = str(c_no)
            if c_key not in chapters_dict:
                chapters_dict[c_key] = {
                    "chapter": c_no,
                    "outlines": [],
                    "verses": [],
                    "footnotes": []
                }

            chapters_dict[c_key]["verses"].append({
                "verse": v_no,
                "text": v_txt,
                "marked_text": v_txt,
                "outlines": None
            })

        chapters_count = len(chapters_dict)
        book_json = {
            "id": book_id,
            "name": name,
            "name_en": alt_name or meta['name'],
            "testament": testament,
            "chapters_count": chapters_count,
            "version": "TB",
            "version_name": "Alkitab Terjemahan Baru (LAI)",
            "chapters": chapters_dict
        }

        book_file_path = os.path.join(output_dir, f"{book_id}.json")
        with open(book_file_path, 'w', encoding='utf-8') as bf:
            json.dump(book_json, bf, ensure_ascii=False)

        tb_books_list.append({
            "id": book_id,
            "name": name,
            "name_en": alt_name or meta['name'],
            "testament": testament,
            "chapters_count": chapters_count,
            "version": "TB"
        })

        print(f"[{idx+1}/66] Processed {name} ({book_id}) - {chapters_count} chaps, {len(chapters_dict.get('1', {}).get('verses', []))} v1")

    # Save tb books.json
    tb_books_path = os.path.join(output_dir, "books.json")
    with open(tb_books_path, 'w', encoding='utf-8') as f:
        json.dump(tb_books_list, f, ensure_ascii=False, indent=2)

    print(f"\nDone! Successfully extracted {len(tb_books_list)} books with {total_verses} total verses into {output_dir}")

if __name__ == '__main__':
    main()
