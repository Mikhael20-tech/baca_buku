import urllib.request
import os
import json

covers_map = {
    # Pelajaran Hayat
    "ph-matius.jpg": "https://yasperin.com/wp-content/uploads/2015/12/PH-Matius-4_resize-250x380.jpg",
    "ph-markus.jpg": "https://yasperin.com/wp-content/uploads/2016/10/PH-Markus-1_resize-250x380.jpg",
    "ph-lukas.jpg": "https://yasperin.com/wp-content/uploads/2015/12/PH-Lukas-3_resize-250x380.jpg",
    "ph-yohanes.jpg": "https://yasperin.com/wp-content/uploads/2015/12/PH-Yohanes-3_resize-250x380.jpg",
    "ph-roma.jpg": "https://yasperin.com/wp-content/uploads/Pelajaran-Hayat-Roma-40006-250x377.jpg",
    "ph-korintus.jpg": "https://yasperin.com/wp-content/uploads/Pelajaran-Hayat-1-Korintus-30006-250x383.jpg",
    "ph-galatia-efesus.jpg": "https://yasperin.com/wp-content/uploads/Pelajaran-Hayat-Galatia-2-250x388.jpg",
    "ph-filipi-kolose.jpg": "https://yasperin.com/wp-content/uploads/Pelajaran-Hayat-Filipi-30005-250x376.jpg",
    "ph-ibrani.jpg": "https://yasperin.com/wp-content/uploads/IMG_9017-2-250x375.jpg",
    "ph-wahyu.jpg": "https://s3-library.yasperin.com/books/92c74eea-893d-4e30-9201-d1e061889ee4/cover-extracted.jpg?v=9753382d",
    "ph-kejadian-keluaran.jpg": "https://yasperin.com/wp-content/uploads/Pelajaran-Hayat-Kejadian-8-250x378.jpg",
    
    # Karakter, Martir, Pembinaan
    "buku-karakter-wl.jpg": "https://s3-library.yasperin.com/books/460f069f-6110-4273-bf0f-e2bdcc13aae7/cover-extracted.jpg?v=2d68386d",
    "martir-salib-wn.jpg": "https://s3-library.yasperin.com/books/12ab3610-c5fa-46c2-8ecf-ba00bbca89f5/cover-extracted.jpg?v=43f84af9",
    "pembinaan-dasar-wn.jpg": "https://s3-library.yasperin.com/books/cb325430-06e5-4c47-b9ae-6f52eeef0ca7/cover-extracted.jpg?v=867e2388",
    "kidung-jemaat.jpg": "https://s3-library.yasperin.com/books/4c19952f-1932-4d13-bac8-4299510a6ddb/cover-extracted.jpg?v=de70dc4e",
    "suplemen-kidung.jpg": "https://s3-library.yasperin.com/books/75775b48-5f68-47cc-aaea-ef17d467c89b/cover-extracted.jpg?v=cfae9146",
    "release-of-the-spirit.jpg": "https://s3-library.yasperin.com/books/8e06a8f1-6465-417f-b065-04bdf69e144e/cover-extracted.jpg?v=18f2b0a3",

    # Ministry Classics
    "the-all-inclusive-christ.jpg": "https://www.lsm.org/books/all-inclusive-christ.jpg",
    "the-economy-of-god.jpg": "https://www.lsm.org/books/economy-of-god.jpg",
    "the-glorious-church.jpg": "https://www.lsm.org/books/glorious-church.jpg",
    "the-normal-christian-church-life.jpg": "https://www.lsm.org/books/normal-christian-church-life.jpg",
    "the-knowledge-of-life.jpg": "https://www.lsm.org/books/knowledge-of-life.jpg",
    "the-experience-of-life.jpg": "https://www.lsm.org/books/experience-of-life.jpg",
    "spiritual-authority.jpg": "https://www.lsm.org/books/spiritual-authority.jpg"
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
}

dest_dir = "public/covers"
os.makedirs(dest_dir, exist_ok=True)

downloaded = []
for filename, url in covers_map.items():
    dest_path = os.path.join(dest_dir, filename)
    print(f"Downloading {filename} from {url}...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read()
            if len(content) > 1000:
                with open(dest_path, "wb") as f:
                    f.write(content)
                downloaded.append((filename, len(content)))
                print(f"  OK ({len(content)} bytes)")
            else:
                print(f"  File too small ({len(content)} bytes), skipped.")
    except Exception as e:
        print(f"  Failed {filename}: {e}")

print(f"\nSuccessfully downloaded {len(downloaded)} cover images.")
