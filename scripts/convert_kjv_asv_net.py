import os
import json
from pysword.modules import SwordModules

def main():
    with open('public/bible/en/books.json', 'r', encoding='utf-8') as f:
        master_books = json.load(f)
    print(f"Loaded {len(master_books)} master books.")

    # -------------------------------------------------------------
    # 1. PROCESS KJV
    # -------------------------------------------------------------
    print("\n--- Processing KJV ---")
    os.makedirs('public/bible/kjv', exist_ok=True)
    with open('Alkitab/KJV.json', 'r', encoding='utf-8') as f:
        kjv_raw = json.load(f)
    kjv_books_raw = kjv_raw['books']
    assert len(kjv_books_raw) == 66, f"Expected 66 books in KJV, got {len(kjv_books_raw)}"

    kjv_index = []
    total_kjv_verses = 0
    for idx, mb in enumerate(master_books):
        b_id = mb['id']
        b_name_en = mb['name']
        b_name_id = mb.get('name_id', mb['name'])
        testament = mb['testament']
        ch_count = mb['chapters_count']
        kjv_b = kjv_books_raw[idx]

        chapters_dict = {}
        for ch_obj in kjv_b['chapters']:
            ch_num = ch_obj['chapter']
            verses_list = []
            for v_obj in ch_obj['verses']:
                v_num = v_obj['verse']
                v_text = v_obj['text'].strip()
                verses_list.append({
                    "verse": v_num,
                    "text": v_text,
                    "marked_text": v_text,
                    "outlines": null_or_none(None)
                })
                total_kjv_verses += 1
            chapters_dict[str(ch_num)] = {
                "chapter": ch_num,
                "outlines": [],
                "verses": verses_list,
                "footnotes": []
            }

        book_data = {
            "id": b_id,
            "name": b_name_en,
            "name_id": b_name_id,
            "name_en": b_name_en,
            "testament": testament,
            "chapters_count": ch_count,
            "version": "KJV",
            "version_name": "King James Version (1769)",
            "chapters": chapters_dict
        }

        with open(f"public/bible/kjv/{b_id}.json", "w", encoding="utf-8") as out_f:
            json.dump(book_data, out_f, ensure_ascii=False)

        kjv_index.append({
            "id": b_id,
            "name": b_name_en,
            "name_id": b_name_id,
            "testament": testament,
            "chapters_count": ch_count
        })

    with open("public/bible/kjv/books.json", "w", encoding="utf-8") as out_f:
        json.dump(kjv_index, out_f, indent=2, ensure_ascii=False)
    print(f"KJV complete: 66 books, {total_kjv_verses} verses written to public/bible/kjv/")

    # -------------------------------------------------------------
    # 2. PROCESS ASV
    # -------------------------------------------------------------
    print("\n--- Processing ASV ---")
    os.makedirs('public/bible/asv', exist_ok=True)
    with open('Alkitab/ASV.json', 'r', encoding='utf-8') as f:
        asv_books_raw = json.load(f)
    assert len(asv_books_raw) == 66, f"Expected 66 books in ASV, got {len(asv_books_raw)}"

    asv_index = []
    total_asv_verses = 0
    for idx, mb in enumerate(master_books):
        b_id = mb['id']
        b_name_en = mb['name']
        b_name_id = mb.get('name_id', mb['name'])
        testament = mb['testament']
        ch_count = mb['chapters_count']
        asv_b = asv_books_raw[idx]

        chapters_dict = {}
        for ch_idx, ch_verses in enumerate(asv_b['chapters']):
            ch_num = ch_idx + 1
            verses_list = []
            for v_idx, v_text in enumerate(ch_verses):
                v_num = v_idx + 1
                v_text_clean = v_text.strip()
                verses_list.append({
                    "verse": v_num,
                    "text": v_text_clean,
                    "marked_text": v_text_clean,
                    "outlines": null_or_none(None)
                })
                total_asv_verses += 1
            chapters_dict[str(ch_num)] = {
                "chapter": ch_num,
                "outlines": [],
                "verses": verses_list,
                "footnotes": []
            }

        book_data = {
            "id": b_id,
            "name": b_name_en,
            "name_id": b_name_id,
            "name_en": b_name_en,
            "testament": testament,
            "chapters_count": ch_count,
            "version": "ASV",
            "version_name": "American Standard Version (1901)",
            "chapters": chapters_dict
        }

        with open(f"public/bible/asv/{b_id}.json", "w", encoding="utf-8") as out_f:
            json.dump(book_data, out_f, ensure_ascii=False)

        asv_index.append({
            "id": b_id,
            "name": b_name_en,
            "name_id": b_name_id,
            "testament": testament,
            "chapters_count": ch_count
        })

    with open("public/bible/asv/books.json", "w", encoding="utf-8") as out_f:
        json.dump(asv_index, out_f, indent=2, ensure_ascii=False)
    print(f"ASV complete: 66 books, {total_asv_verses} verses written to public/bible/asv/")

    # -------------------------------------------------------------
    # 3. PROCESS NET
    # -------------------------------------------------------------
    print("\n--- Processing NET ---")
    os.makedirs('public/bible/net', exist_ok=True)
    modules = SwordModules('Alkitab/net_sword')
    modules.parse_modules()
    net_bible = modules.get_bible_from_module('NETtext')
    structure = net_bible.get_structure()
    sword_books = structure._books['ot'] + structure._books['nt']
    assert len(sword_books) == 66, f"Expected 66 books in NET, got {len(sword_books)}"

    net_index = []
    total_net_verses = 0
    for idx, mb in enumerate(master_books):
        b_id = mb['id']
        b_name_en = mb['name']
        b_name_id = mb.get('name_id', mb['name'])
        testament = mb['testament']
        ch_count = mb['chapters_count']
        sword_b = sword_books[idx]

        chapters_dict = {}
        for ch_num in range(1, ch_count + 1):
            try:
                raw_verses = list(net_bible.get_iter([sword_b.name], [ch_num]))
            except Exception as e:
                print(f"Error fetching {sword_b.name} chapter {ch_num}: {e}")
                raw_verses = []

            verses_list = []
            for v_idx, v_text in enumerate(raw_verses):
                v_num = v_idx + 1
                v_text_clean = v_text.strip()
                verses_list.append({
                    "verse": v_num,
                    "text": v_text_clean,
                    "marked_text": v_text_clean,
                    "outlines": null_or_none(None)
                })
                total_net_verses += 1

            chapters_dict[str(ch_num)] = {
                "chapter": ch_num,
                "outlines": [],
                "verses": verses_list,
                "footnotes": []
            }

        book_data = {
            "id": b_id,
            "name": b_name_en,
            "name_id": b_name_id,
            "name_en": b_name_en,
            "testament": testament,
            "chapters_count": ch_count,
            "version": "NET",
            "version_name": "New English Translation (NET Bible)",
            "chapters": chapters_dict
        }

        with open(f"public/bible/net/{b_id}.json", "w", encoding="utf-8") as out_f:
            json.dump(book_data, out_f, ensure_ascii=False)

        net_index.append({
            "id": b_id,
            "name": b_name_en,
            "name_id": b_name_id,
            "testament": testament,
            "chapters_count": ch_count
        })

    with open("public/bible/net/books.json", "w", encoding="utf-8") as out_f:
        json.dump(net_index, out_f, indent=2, ensure_ascii=False)
    print(f"NET complete: 66 books, {total_net_verses} verses written to public/bible/net/")
    print("\nAll translations (KJV, ASV, NET) generated successfully!")

def null_or_none(x):
    return None

if __name__ == '__main__':
    main()
