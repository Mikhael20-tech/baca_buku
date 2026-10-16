import urllib.request
import re
import json
import time

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
}

products = {}

for page in range(1, 10):
    url = f"https://yasperin.com/?post_type=product&paged={page}"
    print(f"Fetching page {page}: {url}...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=20) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            
            # match images
            imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\'][^>]*alt=["\']([^"\']*)["\']', html)
            alt_imgs = re.findall(r'<img[^>]+alt=["\']([^"\']+)["\'][^>]*src=["\']([^"\']*)["\']', html)
            all_imgs = imgs + [(src, alt) for alt, src in alt_imgs]
            
            new_found = 0
            for src, alt in all_imgs:
                if 'wp-content/uploads' in src and not 'cropped-Untitled-design' in src:
                    clean_alt = alt.strip()
                    if clean_alt and clean_alt not in products:
                        products[clean_alt] = src
                        new_found += 1
                        print(f"  [{page}] {clean_alt} -> {src}")
                        
            print(f"Page {page}: found {new_found} new products (total {len(products)})")
            if new_found == 0:
                print("No more new products, stopping.")
                break
            time.sleep(1)
    except Exception as e:
        print(f"Page {page} error: {e}")
        break

with open("scripts/yasperin_com_all_products.json", "w", encoding="utf-8") as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

print(f"\nTotal yasperin.com products saved: {len(products)}")
