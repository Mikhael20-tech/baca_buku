import re

def fix_redup(w):
    parts = w.split('-')
    if len(parts) >= 2:
        p1 = parts[0]
        p2 = re.sub(r'(?:[Nn]ya|[Kk]u|[Mm]u|[Ll]ah|[Kk]ah|[Pp]un)$', '', parts[1])
        # Check if p1 is missing its first letter: e.g. ukit-bukit -> bukit-bukit
        if len(p2) == len(p1) + 1 and p2[1:].lower() == p1.lower():
            lead_char = p2[0].upper() if p1[0].isupper() else p2[0].lower()
            return lead_char + p1 + '-' + '-'.join(parts[1:])
        # Check if p1 has an extra letter: e.g. cbangsa-bangsa -> bangsa-bangsa
        if len(p1) == len(p2) + 1 and p1[1:].lower() == p2.lower():
            return p1[1:] + '-' + '-'.join(parts[1:])
    return w

test_words = [
    'ukit-bukit', 'bpapan-papan', 'bpekerja-pekerja', 'bpemimpin-pemimpin',
    'cahli-ahli', 'canak-anak', 'cbangsa-bangsa', 'cnabi-nabi', 'corang-orang',
    'embala-gembala', 'enda-benda', 'ewa-dewa', 'inatang-binatang', 'intang-bintang',
    'omba-domba-Ku', 'osa-dosa', 'uah-buah', 'ulan-bulan', 'unga-bunga', 'unung-gunung',
    'urung-burung', 'lat-alat', 'nak-anak-Nya', 'nggota-anggota', 'nting-anting'
]

for tw in test_words:
    print(f"{tw:22s} -> {fix_redup(tw)}")
