import urllib.request
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

url = 'https://yasperin.com/?post_type=product'
print(f"Connecting to {url}...")
try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        print(f"Success! Status: {resp.status}, HTML size: {len(html)}")
        
        # Cari semua gambar produk woocommerce
        # Biasanya: <img ... class="...attachment-woocommerce_thumbnail..." ... src="..." ... alt="..."
        imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\'][^>]*alt=["\']([^"\']*)["\']', html)
        alt_imgs = re.findall(r'<img[^>]+alt=["\']([^"\']+)["\'][^>]*src=["\']([^"\']*)["\']', html)
        all_imgs = imgs + [(src, alt) for alt, src in alt_imgs]
        
        products = {}
        for src, alt in all_imgs:
            if 'wp-content/uploads' in src:
                clean_alt = alt.strip()
                if clean_alt and clean_alt not in products:
                    products[clean_alt] = src
                    print(f"Found: {clean_alt} -> {src}")
                    
        with open("scripts/yasperin_com_products.json", "w", encoding="utf-8") as f:
            json.dump(products, f, indent=2, ensure_ascii=False)
        print(f"Total products saved: {len(products)}")
except Exception as e:
    print(f"Error: {e}")
