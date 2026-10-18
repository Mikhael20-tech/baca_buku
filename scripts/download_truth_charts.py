import urllib.request
import urllib.parse
import re
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_URL = "https://www.mswe1.org/truthchart/"
INDEX_URL = "https://www.mswe1.org/truthchart/index_en.html"

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

CHART_LIST = [
    {"num": 1, "file": "1. THE RELATIONSHIP BETWEEN GOD AND MAN.html", "title_id": "Hubungan Antara Allah dan Manusia"},
    {"num": 2, "file": "2. THE PROCESS OF THE DIVINE ECONOMY.html", "title_id": "Proses Ekonomi Ilahi"},
    {"num": 3, "file": "3. THE PURE REVELATION OF THE TRIUNE GOD.html", "title_id": "Wahyu Murni Mengenai Allah Tri-Tunggal"},
    {"num": 4, "file": "4. CHRIST BECOMING FLESH.html", "title_id": "Kristus Menjadi Daging"},
    {"num": 5, "file": "5. THE SPIRIT WITH OUR SPIRIT.html", "title_id": "Roh Itu Bersama Roh Kita"},
    {"num": 6, "file": "6. THREE PARTS OF MAN—SPIRIT, SOUL, BODY.html", "title_id": "Tiga Bagian Manusia: Roh, Jiwa, Tubuh"},
    {"num": 7, "file": "7. THE TABERNACLE.html", "title_id": "Bagan Kemah Suci & Perabotannya"},
    {"num": 8, "file": "8. GOD’S OBJECTIVE SALVATION AND SUBJECTIVE SALVATION.html", "title_id": "Keselamatan Objektif & Subjektif Allah"},
    {"num": 9, "file": "9. THE TRIUNE GOD BEING LIFE TO SATURATE THE TRIPARTITE MAN.html", "title_id": "Allah Tri-Tunggal Menjadi Hayat Meresapi Manusia Tripartit"},
    {"num": 10, "file": "10. A CHART SHOWING THE DIFFERENCE BTW THE KOH AND THE KOG.html", "title_id": "Perbedaan Kerajaan Sorga dan Kerajaan Allah"},
    {"num": 11, "file": "11. THE ETERNAL ECONOMY OF GOD.html", "title_id": "Ekonomi Kekal Allah"},
    {"num": 12, "file": "12. GOD’S NEW TESTAMENT ECONOMY.html", "title_id": "Ekonomi Perjanjian Baru Allah"},
    {"num": 12.1, "file": "12. GOD’S NEW TESTAMENT ECONOMY (EXTENSIVE).html", "title_id": "Ekonomi Perjanjian Baru Allah (Versi Lengkap)"},
    {"num": 13, "file": "13. THE LORD’S RECOVERY, GOD’S ECONOMY, GOD’S ADMINISTRATION, GOD’S DISPENSING, AND STEWARDSHIP.html", "title_id": "Pemulihan Tuhan, Ekonomi, Administrasi, Penyaluran & Penatalayanan"},
    {"num": 14, "file": "14. KNOWING THE THREE ASPECTS.html", "title_id": "Mengenal Tiga Aspek"},
    {"num": 15, "file": "15. THE LORD’S RECOVERY.html", "title_id": "Pemulihan Tuhan"},
    {"num": 16, "file": "16. THE GROUND OF ONENESS OF THE LOCAL CHURCH.html", "title_id": "Dasar Keesaan Gereja Lokal"},
    {"num": 17, "file": "17. THE GROWTH OF LIFE UNTO THE BUILDING UP OF THE BODY OF CHRIST.html", "title_id": "Pertumbuhan Hayat demi Pembangunan Tubuh Kristus"},
    {"num": 18, "file": "18. GOD’S DISPENSING FOR THE BUILDING UP.html", "title_id": "Penyaluran Allah demi Pembangunan Tubuh Kristus"},
    {"num": 19, "file": "19. THE GREAT MYSTERY—CHRIST AND THE CHURCH.html", "title_id": "Rahasia Besar: Kristus dan Gereja"},
    {"num": 20, "file": "20. THE HIGH PEAK OF THE DIVINE REVELATION.html", "title_id": "Puncak Tertinggi Wahyu Ilahi"},
    {"num": 21, "file": "21. THE MINGLING OF DIVINITY AND HUMANITY.html", "title_id": "Bauran Keallahan dan Kemanusiaan"},
    {"num": 22, "file": "22. THE CHART OF THE SEVENTY WEEKS.html", "title_id": "Bagan 70 Minggu Daniel, Kedatangan Kristus & Pengangkatan Orang Kudus"}
]

os.makedirs("public/truthcharts/svg", exist_ok=True)

all_charts_data = []

for item in CHART_LIST:
    fname = item["file"]
    encoded_fname = urllib.parse.quote(fname)
    url = BASE_URL + encoded_fname
    print(f"Fetching [{item['num']}] {fname} ...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  Error fetching {url}: {e}")
        continue

    # Extract Title
    title_match = re.search(r'<title>(.*?)</title>', html, re.I)
    title_en = title_match.group(1).strip() if title_match else fname.replace('.html', '')

    # Extract JS functions (func1, func2, ...)
    # document.getElementById('part0').innerHTML = "..."
    # document.getElementById('part1').innerHTML = "..."
    # document.getElementById('part2').innerHTML = "..."
    funcs = {}
    func_blocks = re.findall(r'function\s+(func\d+)\s*\(\)\s*\{([^}]+)\}', html, re.DOTALL)
    for fn_name, fn_body in func_blocks:
        part0 = re.search(r"document\.getElementById\(['\"]part0['\"]\)\.innerHTML\s*=\s*['\"](.*?)['\"];?", fn_body)
        part1 = re.search(r"document\.getElementById\(['\"]part1['\"]\)\.innerHTML\s*=\s*['\"](.*?)['\"];?", fn_body)
        part2 = re.search(r"document\.getElementById\(['\"]part2['\"]\)\.innerHTML\s*=\s*['\"](.*?)['\"];?", fn_body)
        
        funcs[fn_name] = {
            "title": part0.group(1).strip() if part0 else "",
            "verses": part1.group(1).strip() if part1 else "",
            "reference": part2.group(1).strip() if part2 else ""
        }

    # Extract SVG
    svg_match = re.search(r'(<svg[^>]*>.*?</svg>)', html, re.DOTALL | re.I)
    if not svg_match:
        print(f"  No SVG found in {fname}")
        continue
    
    svg_content = svg_match.group(1)
    
    # Clean SVG attributes for React responsiveness
    # Ensure viewBox exists
    svg_file_name = f"chart_{str(item['num']).replace('.', '_')}.svg"
    svg_path = f"public/truthcharts/svg/{svg_file_name}"
    with open(svg_path, 'w', encoding='utf-8') as svg_f:
        svg_f.write(svg_content)

    chart_record = {
        "id": f"chart-{str(item['num']).replace('.', '_')}",
        "number": item["num"],
        "title_en": title_en,
        "title_id": item["title_id"],
        "file": fname,
        "svg_file": f"/truthcharts/svg/{svg_file_name}",
        "nodes_count": len(funcs),
        "nodes": funcs
    }
    all_charts_data.append(chart_record)
    print(f"  Success: {len(funcs)} nodes, SVG saved ({os.path.getsize(svg_path):,} bytes)")

out_json = "public/truthcharts/truth_charts_data.json"
with open(out_json, 'w', encoding='utf-8') as f:
    json.dump(all_charts_data, f, ensure_ascii=False, indent=2)

print(f"\nAll done! Saved {len(all_charts_data)} truth charts to {out_json}")
