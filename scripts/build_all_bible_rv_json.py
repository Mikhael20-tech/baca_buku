import os
import sys
import re
import json
import shutil
import time

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

file_path = r"D:\Magang\Baca\pdb\roti_hayat_full.txt"
public_dir = r"D:\Magang\Baca\public\bible"
dist_dir = r"D:\Magang\Baca\dist\bible"

os.makedirs(public_dir, exist_ok=True)
os.makedirs(dist_dir, exist_ok=True)

BIBLE_BOOKS = [
    # Perjanjian Lama (39 Kitab)
    {"id": "kejadian", "name": "Kejadian", "testament": "PL", "start": 682211, "end": 689457},
    {"id": "keluaran", "name": "Keluaran", "testament": "PL", "start": 689457, "end": 695639},
    {"id": "imamat", "name": "Imamat", "testament": "PL", "start": 695639, "end": 699429},
    {"id": "bilangan", "name": "Bilangan", "testament": "PL", "start": 699429, "end": 704223},
    {"id": "ulangan", "name": "Ulangan", "testament": "PL", "start": 704223, "end": 708253},
    {"id": "yosua", "name": "Yosua", "testament": "PL", "start": 708253, "end": 710701},
    {"id": "hakim-hakim", "name": "Hakim-Hakim", "testament": "PL", "start": 710701, "end": 712841},
    {"id": "rut", "name": "Rut", "testament": "PL", "start": 712841, "end": 713377},
    {"id": "1-samuel", "name": "1 Samuel", "testament": "PL", "start": 713377, "end": 716231},
    {"id": "2-samuel", "name": "2 Samuel", "testament": "PL", "start": 716231, "end": 718559},
    {"id": "1-raja-raja", "name": "1 Raja-Raja", "testament": "PL", "start": 718559, "end": 721639},
    {"id": "2-raja-raja", "name": "2 Raja-Raja", "testament": "PL", "start": 721639, "end": 724237},
    {"id": "1-tawarikh", "name": "1 Tawarikh", "testament": "PL", "start": 724237, "end": 727279},
    {"id": "2-tawarikh", "name": "2 Tawarikh", "testament": "PL", "start": 727279, "end": 730371},
    {"id": "ezra", "name": "Ezra", "testament": "PL", "start": 730371, "end": 731501},
    {"id": "nehemia", "name": "Nehemia", "testament": "PL", "start": 731501, "end": 732949},
    {"id": "ester", "name": "Ester", "testament": "PL", "start": 732949, "end": 733629},
    {"id": "ayub", "name": "Ayub", "testament": "PL", "start": 733629, "end": 737257},
    {"id": "mazmur", "name": "Mazmur", "testament": "PL", "start": 737257, "end": 746215},
    {"id": "amsal", "name": "Amsal", "testament": "PL", "start": 746215, "end": 748795},
    {"id": "pengkhotbah", "name": "Pengkhotbah", "testament": "PL", "start": 748795, "end": 749705},
    {"id": "kidung-agung", "name": "Kidung Agung", "testament": "PL", "start": 749705, "end": 750923},
    {"id": "yesaya", "name": "Yesaya", "testament": "PL", "start": 750923, "end": 756311},
    {"id": "yeremia", "name": "Yeremia", "testament": "PL", "start": 756311, "end": 761143},
    {"id": "ratapan", "name": "Ratapan", "testament": "PL", "start": 761143, "end": 761799},
    {"id": "yehezkiel", "name": "Yehezkiel", "testament": "PL", "start": 761799, "end": 766401},
    {"id": "daniel", "name": "Daniel", "testament": "PL", "start": 766401, "end": 768257},
    {"id": "hosea", "name": "Hosea", "testament": "PL", "start": 768257, "end": 769381},
    {"id": "yoel", "name": "Yoel", "testament": "PL", "start": 769381, "end": 769761},
    {"id": "amos", "name": "Amos", "testament": "PL", "start": 769761, "end": 770543},
    {"id": "obaja", "name": "Obaja", "testament": "PL", "start": 770543, "end": 770739},
    {"id": "yunus", "name": "Yunus", "testament": "PL", "start": 770739, "end": 771057},
    {"id": "mikha", "name": "Mikha", "testament": "PL", "start": 771057, "end": 771595},
    {"id": "nahum", "name": "Nahum", "testament": "PL", "start": 771595, "end": 771919},
    {"id": "habakuk", "name": "Habakuk", "testament": "PL", "start": 771919, "end": 772295},
    {"id": "zefanya", "name": "Zefanya", "testament": "PL", "start": 772295, "end": 772653},
    {"id": "hagai", "name": "Hagai", "testament": "PL", "start": 772653, "end": 772953},
    {"id": "zakharia", "name": "Zakharia", "testament": "PL", "start": 772953, "end": 774289},
    {"id": "maleakhi", "name": "Maleakhi", "testament": "PL", "start": 774289, "end": 774718},
    
    # Perjanjian Baru (27 Kitab)
    {"id": "matius", "name": "Matius", "testament": "PB", "start": 774719, "end": 784079},
    {"id": "markus", "name": "Markus", "testament": "PB", "start": 784079, "end": 788483},
    {"id": "lukas", "name": "Lukas", "testament": "PB", "start": 788483, "end": 795185},
    {"id": "yohanes", "name": "Yohanes", "testament": "PB", "start": 795185, "end": 800639},
    {"id": "kisah-para-rasul", "name": "Kisah Para Rasul", "testament": "PB", "start": 800639, "end": 807793},
    {"id": "roma", "name": "Roma", "testament": "PB", "start": 807793, "end": 811469},
    {"id": "1-korintus", "name": "1 Korintus", "testament": "PB", "start": 811469, "end": 816057},
    {"id": "2-korintus", "name": "2 Korintus", "testament": "PB", "start": 816057, "end": 819231},
    {"id": "galatia", "name": "Galatia", "testament": "PB", "start": 819231, "end": 821011},
    {"id": "efesus", "name": "Efesus", "testament": "PB", "start": 821011, "end": 823727},
    {"id": "filipi", "name": "Filipi", "testament": "PB", "start": 823727, "end": 824779},
    {"id": "kolose", "name": "Kolose", "testament": "PB", "start": 824779, "end": 826145},
    {"id": "1-tesalonika", "name": "1 Tesalonika", "testament": "PB", "start": 826145, "end": 827261},
    {"id": "2-tesalonika", "name": "2 Tesalonika", "testament": "PB", "start": 827261, "end": 827805},
    {"id": "1-timotius", "name": "1 Timotius", "testament": "PB", "start": 827805, "end": 829443},
    {"id": "2-timotius", "name": "2 Timotius", "testament": "PB", "start": 829443, "end": 830591},
    {"id": "titus", "name": "Titus", "testament": "PB", "start": 830591, "end": 831389},
    {"id": "filemon", "name": "Filemon", "testament": "PB", "start": 831389, "end": 831729},
    {"id": "ibrani", "name": "Ibrani", "testament": "PB", "start": 831729, "end": 834485},
    {"id": "yakobus", "name": "Yakobus", "testament": "PB", "start": 834485, "end": 835647},
    {"id": "1-petrus", "name": "1 Petrus", "testament": "PB", "start": 835647, "end": 837489},
    {"id": "2-petrus", "name": "2 Petrus", "testament": "PB", "start": 837489, "end": 838751},
    {"id": "1-yohanes", "name": "1 Yohanes", "testament": "PB", "start": 838751, "end": 840609},
    {"id": "2-yohanes", "name": "2 Yohanes", "testament": "PB", "start": 840609, "end": 840965},
    {"id": "3-yohanes", "name": "3 Yohanes", "testament": "PB", "start": 840965, "end": 841369},
    {"id": "yudas", "name": "Yudas", "testament": "PB", "start": 841369, "end": 841897},
    {"id": "wahyu", "name": "Wahyu", "testament": "PB", "start": 841897, "end": 847775},
]

def clean_base_text(t):
    if not t:
        return ""
    t = t.replace('\xa0', ' ')
    t = t.replace('\ufffd', '—').replace('\x96', '–').replace('\x97', '—').replace('\x85', '...')
    t = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', t)
    
    # Syllable breaks containing '?' (e.g. dipi?-sah?-kan, me?-nen?-?-?-tu?-kan, du?-a per?-?-?-janjian)
    t = re.sub(r'(\w)(?:[\?\-‑]*\?+[\?\-‑]*)(\w)', r'\1\2', t)
    t = re.sub(r'(\w)(?:[\?\-‑]*\?+[\?\-‑]*)(\w)', r'\1\2', t)
    t = re.sub(r'(\w)(?:[\?\-‑]*\?+[\?\-‑]*)(\w)', r'\1\2', t)
    t = re.sub(r'\?+[\-‑]*\?*', '', t)
    
    # Double hyphens inside word without space
    t = re.sub(r'(\w)\-\-+([\w])', r'\1-\2', t)
    
    # Clean OCR misplaced quotes
    t = re.sub(r"\'Tuhan\b", "Tuhan", t)
    t = re.sub(r"\'Allah\b", "Allah", t)
    
    # Normalize spaced "S e l a" in Psalms
    t = re.sub(r'S\s*e\s*l\s*a\b', 'Sela', t, flags=re.I)
    # Remove leading verse-numbering editorial artifacts e.g. (-40b)
    t = re.sub(r'^\(\-\d+[a-z]?\)\s*', '', t)
    
    # Common Alkitab typos in raw scans
    typo_map = {
        r'\bALlah\b': 'Allah',
        r'\bHamba-Peneylamat\b': 'Hamba-Penyelamat',
        r'\bPeneylamat\b': 'Penyelamat',
        r'\bseoang\b': 'seorang',
        r'\bpersananya\b': 'personanya',
        r'\bemnagmpuni\b': 'mengampuni',
        r'\bPermulaam\b': 'Permulaan',
        r'\blainnay\b': 'lainnya',
        r'\bmenistri\b': 'ministri',
        r'\bPerjanian\b': 'Perjanjian',
        r'\bKeraajan\b': 'Kerajaan',
        r'\bkeinsaniaan\b': 'keinsanian',
        r'\bkeselamatanLAI\b': 'keselamatan—LAI',
        r'\btoba di Perga\b': 'tiba di Perga',
        r'\bketuhan-Nya\b': 'ketuhanan-Nya',
        r'\bKe\?\-luaran\b': 'Keluaran'
    }
    for pat, rep in typo_map.items():
        t = re.sub(pat, rep, t)
        
    t = re.sub(r'\s+', ' ', t)
    return t.strip()

print("Indexing corpus vocabulary for cross-reference disambiguation...")
with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    _full_corpus = f.read()
raw_tokens = re.findall(r'\b[a-zA-Z]{2,}\b', _full_corpus)
CORPUS_FREQ = {}
for t in raw_tokens:
    low = t.lower()
    CORPUS_FREQ[low] = CORPUS_FREQ.get(low, 0) + 1
del _full_corpus
print(f"Indexed {len(CORPUS_FREQ)} unique words from corpus.")

NEVER_STRIP = {
    'ada', 'adalah', 'adanya', 'adik', 'adil', 'agar', 'ahli', 'air', 'ajaib', 'ajak', 'ajal', 'ajar', 'ajarlah',
    'akan', 'akar', 'akhir', 'akhirnya', 'aku', 'alam', 'alas', 'alasan', 'alat', 'aman', 'amat', 'ambil', 'ambillah',
    'ampun', 'ampunan', 'anak', 'anak-anak', 'angin', 'angkat', 'angkatan', 'anjing', 'antara', 'anugerah', 'apa',
    'apabila', 'apakah', 'apalagi', 'api', 'arah', 'arang', 'arti', 'artinya', 'arus', 'asal', 'asap', 'asin', 'asing',
    'asli', 'atap', 'atas', 'atau', 'atur', 'aturan', 'awal', 'awan', 'awas', 'ayah', 'ayam', 'ayat',
    'babi', 'baca', 'badai', 'badan', 'bagai', 'bagaikan', 'bagaimana', 'bagi', 'bagian', 'bagus', 'bahagia', 'bahkan',
    'bahu', 'bahwa', 'baik', 'bakar', 'bakal', 'baku', 'bala', 'balas', 'balasan', 'balik', 'bangkit', 'bangsa', 'bangun',
    'banjir', 'bantu', 'bantuan', 'banyak', 'bapa', 'bapak', 'baptis', 'baptisan', 'baptislah', 'barang', 'barat', 'baru',
    'basah', 'basuh', 'batal', 'batang', 'batas', 'batu', 'bau', 'bawa', 'bawah', 'bawang', 'bayang', 'bayar', 'bayi',
    'beban', 'bebas', 'beberapa', 'beda', 'begitu', 'bejana', 'bekal', 'bekas', 'bekerja', 'beku', 'bela', 'belajar',
    'belakang', 'belalang', 'beli', 'beliau', 'belum', 'benar', 'bencana', 'benci', 'benda', 'benih', 'bentang', 'benteng',
    'bentuk', 'berangkat', 'berapa', 'beras', 'berat', 'beri', 'berita', 'beritahukan', 'berkat', 'beroleh', 'bersih',
    'besar', 'besi', 'besok', 'betul', 'biar', 'biarkan', 'biasa', 'bibir', 'bicara', 'biji', 'bijak', 'bijaksana', 'bilang',
    'bilamana', 'bilangan', 'bimbang', 'binasa', 'binatang', 'bintang', 'biru', 'bisa', 'bisik', 'bisu', 'bodoh', 'boleh',
    'buah', 'buang', 'buas', 'buat', 'buatan', 'bubar', 'budi', 'buka', 'bukan', 'bukit', 'bukti', 'buku', 'bulan', 'bulat',
    'bulu', 'buluh', 'bumbu', 'bumi', 'bunga', 'bungkus', 'bunuh', 'bunyi', 'buruk', 'burung', 'buta', 'butir', 'butuh',
    'cahaya', 'cair', 'cakap', 'cantik', 'capai', 'cara', 'catat', 'cawan', 'cegah', 'celaka', 'cepat', 'cerita', 'cinta',
    'cipta', 'ciptaan', 'cium', 'coba', 'cobaan', 'cukup', 'cuma',
    'dada', 'daerah', 'daftar', 'daging', 'dahsyat', 'dahulu', 'daku', 'dalam', 'damai', 'dan', 'dana', 'danau', 'dapat',
    'darah', 'darat', 'dari', 'daripada', 'dasar', 'datang', 'datar', 'daun', 'daya', 'debar', 'debu', 'dekat', 'delapan',
    'demi', 'demikian', 'dengar', 'dengki', 'depan', 'derita', 'desa', 'desak', 'detik', 'dewasa', 'di', 'dia', 'diam',
    'didik', 'didikan', 'dinding', 'dingin', 'dini', 'diri', 'dirikan', 'doa', 'dokter', 'domba', 'dorong', 'dosa', 'dua',
    'duduk', 'duka', 'dukacita', 'dulu', 'dunia', 'dupa', 'duri', 'dusta',
    'emas', 'empat', 'enam', 'enak', 'engkau', 'erat',
    'faedah', 'fajar', 'fana', 'fasal', 'fasih', 'firman', 'fitnah',
    'gadis', 'gagah', 'gagal', 'gaib', 'gajah', 'gaji', 'gali', 'gambar', 'gampang', 'ganas', 'ganda', 'gandum', 'ganggu',
    'ganjil', 'ganti', 'gantung', 'garam', 'garis', 'gaun', 'gaya', 'gedung', 'gejala', 'gelap', 'gelar', 'gelas', 'gelisah',
    'gelombang', 'gemar', 'gembala', 'gembira', 'gempa', 'gempar', 'gemuk', 'genap', 'gentar', 'gerak', 'geram', 'gerbang',
    'gereja', 'getah', 'getar', 'gigi', 'gigih', 'gila', 'girang', 'golongan', 'gua', 'gubernur', 'gugur', 'gula', 'gulung',
    'guna', 'guncang', 'gunung', 'guru',
    'habis', 'hamba', 'hampir', 'hanya', 'hapus', 'harap', 'harga', 'hari', 'harta', 'harus', 'hati', 'haus', 'hebat',
    'hewan', 'hidup', 'hilang', 'hina', 'himpun', 'hingga', 'hormat', 'hujan', 'hukum',
    'ia', 'ibu', 'ikut', 'iman', 'indah', 'injil', 'inilah', 'isi', 'istri', 'iblis', 'imam', 'insan', 'iri', 'ingin',
    'jadi', 'jaga', 'jahat', 'jalan', 'jangan', 'janji', 'jarak', 'jatuh', 'jauh', 'jelas', 'jemaat', 'jemaah', 'jemput',
    'jerih', 'jika', 'jikalau', 'jilat', 'jiwa', 'jual', 'juga', 'jujur', 'juru',
    'kabar', 'kadang', 'kain', 'kala', 'kalah', 'kalau', 'kali', 'kalung', 'kambing', 'kami', 'kampung', 'kamu',
    'kanan', 'kandang', 'kandung', 'kantong', 'kantung', 'kapal', 'kapan', 'karang', 'karena', 'karunia',
    'karya', 'kasih', 'kasihan', 'kasur', 'kata', 'kaum', 'kawan', 'kaya', 'kayu', 'keadaan', 'kebal', 'kebun', 'kecil',
    'kecuali', 'kejar', 'kekal', 'kekuatan', 'kelam', 'kelaparan', 'kelas', 'keliling', 'kelima', 'kelompok', 'keluar',
    'keluarga', 'kemah', 'kemari', 'kemarin', 'kembali', 'kembar', 'kemenangan', 'kemiskinan', 'kemudian', 'kemuliaan',
    'kenal', 'kencing', 'kendaraan', 'kendi', 'kental', 'kenyang', 'kepada', 'kepala', 'keping', 'kerah',
    'kerajaan', 'keranjang', 'keras', 'kerbau', 'kereta', 'kerja', 'kering', 'keringat',
    'kesal', 'kesetiaan', 'kesudahan', 'kesusahan', 'ketakutan', 'ketat', 'ketemu', 'ketika', 'ketua', 'ketuhanan', 'keturunan',
    'ketekunan', 'kewajiban', 'khasiat', 'khawatir', 'khianat', 'khotbah', 'khusus', 'kiamat', 'kini', 'kira', 'kirim',
    'kiri', 'kisah', 'kita', 'kitab', 'kolam', 'korban', 'kosong', 'kotor', 'kristen', 'kristus', 'kuasa', 'kuat', 'kubur',
    'kucing', 'kuda', 'kudus', 'kuku', 'kukuh', 'kulit', 'kumpul', 'kunci', 'kuning', 'kunjung', 'kuno', 'kurang', 'kursi',
    'kurus', 'kusta', 'kutuk',
    'lagi', 'langit', 'lain', 'lelah', 'lebih', 'lama', 'lepas', 'lihat', 'lalu',
    'maka', 'mereka', 'makan', 'mati', 'mata', 'mahkota', 'malam', 'mana', 'masih', 'mari', 'masuk', 'mulut', 'murid',
    'memimpin', 'mengokohkan', 'mencari', 'memuji',
    'nama', 'namun', 'negeri', 'nanti', 'nasihat', 'nabiah', 'nabi',
    'orang', 'oleh', 'obat',
    'pada', 'pohon', 'pedang', 'pelita', 'pekerjaan', 'penjara', 'pergi', 'perkataan', 'perbuatan', 'persembahan', 'puji', 'payah',
    'ragu-ragu', 'raja', 'rasul', 'roh', 'rumah', 'rahasia', 'ranjang', 'rendah',
    'satu', 'sampai', 'sabar', 'saksi', 'sama', 'sangat', 'saja', 'saudara', 'sebab', 'segala', 'segera', 'selain', 'selalu',
    'semua', 'semula', 'senantiasa', 'seorang', 'seperti', 'sepuluh', 'setia', 'sesungguhnya', 'sesuatu', 'siapa', 'sudah',
    'surga', 'suara', 'sukacita', 'seketika',
    'takut', 'tangan', 'tanah', 'tempat', 'tetapi', 'telah', 'tahu', 'tajam', 'takhta', 'taman', 'telinga', 'tembaga', 'tembikar',
    'terakhir', 'tersembunyi', 'tiang', 'tidak', 'tidur', 'tinggal', 'timur', 'tuliskanlah', 'tuan', 'tuhan', 'tujuh',
    'uang', 'umat', 'unta', 'untuk', 'utara',
    'wanita', 'waktu', 'wajah', 'wangi',
    'yang', 'yaitu'
}

def fix_redup(text):
    """
    Clean reduplicated words (hyphenated) where either:
    - First part had cross-reference attached: e.g. cbangsa-bangsa -> bangsa-bangsa, bpemimpin-pemimpin -> pemimpin-pemimpin
    - First part had first letter stripped by footnote digit: e.g. ukit-bukit -> bukit-bukit, omba-domba -> domba-domba
    """
    def _repl(m):
        w = m.group(0)
        parts = w.split('-')
        if len(parts) >= 2:
            p1 = parts[0]
            p2 = re.sub(r'(?:[Nn]ya|[Kk]u|[Mm]u|[Ll]ah|[Kk]ah|[Pp]un)$', '', parts[1])
            # Missing leading letter: e.g. ukit-bukit -> bukit-bukit
            if len(p2) == len(p1) + 1 and p2[1:].lower() == p1.lower():
                lead_char = p2[0].upper() if p1[0].isupper() else p2[0].lower()
                return lead_char + p1 + '-' + '-'.join(parts[1:])
            # Attached cross-reference letter: e.g. cbangsa-bangsa -> bangsa-bangsa
            if len(p1) == len(p2) + 1 and p1[1:].lower() == p2.lower():
                return p1[1:] + '-' + '-'.join(parts[1:])
        return w
    return re.sub(r'\b[a-zA-Z]+(?:-[a-zA-Z]+)+\b', _repl, text)

def clean_cross_refs(txt):
    """
    Remove pure cross-reference letters attached to words in text:
    - [a-z] before Capitalized word: aKelahiran -> Kelahiran, aGalilea -> Galilea
    - [a-z] before lowercase word: removes cross-reference without corrupting real Indonesian words.
    """
    t = fix_redup(txt)
    # 1. Lowercase letter before Capital letter (e.g. aGalilea -> Galilea, bKuperintahkan -> Kuperintahkan)
    t = re.sub(r'(?:^|(?<=[\s"\'\(\[\{“‘«„\—\–\:\u201c\u2018\ufffd]))[a-z]([A-Z][a-zA-Z\-]*)', r'\1', t)
    
    # 2. Lowercase letter [a-z] before lowercase word
    def clean_word(m):
        full = m.group(1)
        low = full.lower()
        if low in NEVER_STRIP:
            return full
            
        # Handle hyphenated words e.g. asegala-galanya -> segala-galanya, cpuji-pujian -> puji-pujian
        if "-" in full:
            parts = full.split("-")
            p0 = parts[0]
            p0_low = p0.lower()
            if p0_low in NEVER_STRIP:
                return full
            rest0 = p0[1:]
            rest0_low = rest0.lower()
            base_rest0 = re.sub(r'(?:nya|ku|mu|lah|kah|pun)$', '', rest0_low)
            f_rest0 = CORPUS_FREQ.get(base_rest0, 0) or CORPUS_FREQ.get(rest0_low, 0)
            f_p0 = CORPUS_FREQ.get(p0_low, 0)
            if base_rest0 in NEVER_STRIP or rest0_low in NEVER_STRIP or (f_rest0 >= 5 and f_rest0 > f_p0 * 3):
                return rest0 + "-" + "-".join(parts[1:])
            return full

        if low.startswith(('di', 'ber', 'ter', 'se', 'ke')) and CORPUS_FREQ.get(low, 0) >= 3:
            return full
            
        rest = full[1:]
        rest_low = rest.lower()
        
        base_full = re.sub(r'(?:nya|ku|mu|lah|kah|pun)$', '', low)
        base_rest = re.sub(r'(?:nya|ku|mu|lah|kah|pun)$', '', rest_low)
        
        if base_full in NEVER_STRIP:
            return full
            
        f_full = CORPUS_FREQ.get(base_full, 0) or CORPUS_FREQ.get(low, 0)
        f_rest = CORPUS_FREQ.get(base_rest, 0) or CORPUS_FREQ.get(rest_low, 0)
        
        # If base_rest is in NEVER_STRIP and f_rest is significantly higher than f_full
        if (base_rest in NEVER_STRIP or rest_low in NEVER_STRIP) and f_rest > f_full * 3:
            return rest
            
        if f_rest >= 10 and f_rest > f_full * 5:
            return rest
            
        return full

    t = re.sub(r'(?:^|(?<=[\s"\'\(\[\{“‘«„\—\–\:\u201c\u2018\ufffd]))([a-z][a-z]+(?:-[a-zA-Z]+)*)\b', clean_word, t)
    return fix_redup(t)

def parse_book(b_info, raw_slice):
    b_id = b_info["id"]
    b_name = b_info["name"]
    b_testament = b_info["testament"]
    
    # 1. Find footnote boundary
    fn_start_idx = None
    for idx, l in enumerate(raw_slice):
        s = l.strip().replace('\xa0', ' ')
        # Matches: Catatan Kaki, Cacatan Kaki, Catatan Kakai
        if re.search(r'^\s*Ca[ct]atan\s+Ka[ck]a?i', s, re.IGNORECASE):
            fn_start_idx = idx
            break
            
    # 2. Parse Book Intro (from line 0 up to real scripture start)
    book_intro = {}
    cur_intro_key = None
    intro_acc = []
    intro_end_idx = 0
    
    has_seen_intro_key = False
    for idx in range(min(250, len(raw_slice))):
        l = raw_slice[idx].strip().replace('\xa0', ' ')
        if not l or l == b_name.upper():
            continue
        # Table of contents line like '1 2 3 4 5 6...' or 'PASAL :'
        if re.match(r'^(?:PASAL|MAZMUR)\s*:\s*$', l, re.I) or re.match(r'^\d+(\s+\d+)+$', l):
            continue
            
        # Detect intro header like 'Penulis :', 'Pokok :', 'Waktu Penulisan :'
        if l.endswith(':') and not re.match(r'^\d+:\d+', l) and not l.startswith('Ayat'):
            has_seen_intro_key = True
            if cur_intro_key:
                book_intro[cur_intro_key] = clean_base_text(' '.join(intro_acc))
            cur_intro_key = l[:-1].strip()
            intro_acc = []
            continue
            
        # If we have seen intro keys, and we encounter outline 'I. ' or 'PASAL 1' / 'MAZMUR 1'
        if has_seen_intro_key:
            if re.match(r'^(?:[I|V|X]+\.|\bA\.)\s+', l) or re.match(r'^(?:PASAL|MAZMUR)\s*1\b', l, re.I):
                intro_end_idx = idx
                break
                
        if cur_intro_key:
            intro_acc.append(l)
            
    if cur_intro_key and intro_acc:
        book_intro[cur_intro_key] = clean_base_text(' '.join(intro_acc))
        
    if intro_end_idx == 0:
        for idx in range(min(60, len(raw_slice))):
            l = raw_slice[idx].strip().replace('\xa0', ' ')
            if re.match(r'^(?:[I|V|X]+\.|\bA\.)\s+', l) or re.match(r'^(?:PASAL|MAZMUR)\s*1\b', l, re.I):
                intro_end_idx = idx
                break
                
    # 3. Parse Footnotes (from fn_start_idx to end)
    footnotes_by_chap = {}
    if fn_start_idx is not None:
        fn_slice = raw_slice[fn_start_idx:]
        cur_fn_chap = 1
        cur_fn_verse = None
        cur_fn_idx = None
        cur_fn_text = ""
        
        def flush_fn():
            nonlocal cur_fn_chap, cur_fn_verse, cur_fn_idx, cur_fn_text
            if cur_fn_chap and cur_fn_verse and cur_fn_text.strip():
                if cur_fn_chap not in footnotes_by_chap:
                    footnotes_by_chap[cur_fn_chap] = []
                cleaned_t = clean_base_text(cur_fn_text)
                footnotes_by_chap[cur_fn_chap].append({
                    "verse": cur_fn_verse,
                    "note_idx": cur_fn_idx,
                    "text": cleaned_t
                })
            cur_fn_verse = None
            cur_fn_idx = None
            cur_fn_text = ""
            
        for l in fn_slice:
            s = l.strip().replace('\xa0', ' ')
            if not s or re.search(r'^\s*Ca[ct]atan\s+Ka[ck]a?i', s, re.IGNORECASE) or s.lower().startswith('injil ') or s.lower().startswith('kitab '):
                continue
                
            m_chap = re.match(r'^(?:PASAL|MAZMUR)\s*(\d+)', s, re.IGNORECASE)
            if m_chap:
                flush_fn()
                cur_fn_chap = int(m_chap.group(1))
                continue
                
            # Pattern: 11 Footnote text or 1 1 Footnote text or 101 Footnote text
            m_num_spaced = re.match(r'^(\d+)\s+(\d)\s+(.+)', s)
            m_num = re.match(r'^(\d{2,})\s+(.+)', s)
            
            if m_num_spaced:
                flush_fn()
                cur_fn_verse = int(m_num_spaced.group(1))
                cur_fn_idx = int(m_num_spaced.group(2))
                cur_fn_text = m_num_spaced.group(3)
                continue
            elif m_num:
                num_str = m_num.group(1)
                content_str = m_num.group(2)
                flush_fn()
                cur_fn_verse = int(num_str[:-1])
                cur_fn_idx = int(num_str[-1])
                cur_fn_text = content_str
                continue
                
            # Continuation line
            if cur_fn_verse is not None:
                cur_fn_text += " " + s
                
        flush_fn()
        
    # 4. Parse Scripture Chapters, Outlines & Verses
    scripture_slice = raw_slice[intro_end_idx : fn_start_idx] if fn_start_idx else raw_slice[intro_end_idx:]
    chapters_data = {}
    cur_chap = 1
    pending_outlines = []
    accumulating_outline = []
    
    def parse_marker(num_str, cross_ref, word):
        if not cross_ref:
            return int(num_str), "", word
        
        # 1. Capitalized word -> letter is cross-ref (e.g. 1aGalilea -> num=1, ref='a', word='Galilea')
        if re.match(r'^[A-Z]', word):
            return int(num_str), cross_ref, word
            
        cand_full = cross_ref + word
        w_low = word.lower()
        c_low = cand_full.lower()
        
        # Reduplication check:
        if '-' in word:
            parts = word.split('-')
            p1 = parts[0]
            p2 = re.sub(r'(?:[Nn]ya|[Kk]u|[Mm]u|[Ll]ah|[Kk]ah|[Pp]un)$', '', parts[1])
            if len(p2) == len(p1) + 1 and p2.lower() == (cross_ref + p1).lower():
                return int(num_str), "", cand_full
                
        # Specific known cases where word was truncated by digit:
        if w_low in ('ukit', 'aptislah', 'jarlah', 'empa'):
            return int(num_str), "", cand_full
            
        if c_low in NEVER_STRIP or c_low in ('bukit', 'baptislah', 'baptis', 'baptisan', 'ajarlah', 'gempa', 'fajar', 'dalam', 'emas'):
            return int(num_str), "", cand_full
            
        base_c = re.sub(r'(?:nya|ku|mu|lah|kah|pun)$', '', c_low)
        base_w = re.sub(r'(?:nya|ku|mu|lah|kah|pun)$', '', w_low)
        
        if base_w in NEVER_STRIP and base_c not in NEVER_STRIP:
            return int(num_str), cross_ref, word
        if base_c in NEVER_STRIP and base_w not in NEVER_STRIP:
            return int(num_str), "", cand_full
            
        c_freq = CORPUS_FREQ.get(base_c, 0)
        w_freq = CORPUS_FREQ.get(base_w, 0)
        
        if w_freq > 20 and c_freq < 5:
            return int(num_str), cross_ref, word
            
        if c_freq > 20 and w_freq < 5:
            return int(num_str), "", cand_full
            
        if c_freq > w_freq:
            return int(num_str), "", cand_full
            
        return int(num_str), cross_ref, word

    def build_marked_text(v_num, raw_text, chap_num):
        t = clean_base_text(raw_text)
        t = clean_cross_refs(t)
        
        # Pre-clean period immediately followed by digit marker: e.g. ALLAH.1aBertobatlah -> ALLAH. 1aBertobatlah
        t = re.sub(r'(\.)(\d{1,2}[a-z]?[A-Za-z])', r'\1 \2', t)
        
        # Footnote marker regex:
        # Preceded by start, space, quote (including closing quotes), paren, bracket, dash/hyphen, colon, semicolon
        # Followed by 1-2 digits, optional cross-reference letter [a-z], then word (handles hyphenated phrases like nabi-nabi)
        pattern = re.compile(r'(^|[\s"\'\(\[\{“‘«„”’\—\–\-\:\;\.\u201c\u201d\u2018\u2019\ufffd])(\d{1,2})([a-z]?)([A-Za-z]+(?:-[A-Za-z]+)*)')
        matches = list(pattern.finditer(t))
        
        if not matches:
            clean_t = re.sub(r'(?:^|(?<=[\s\"\'\(\[\{“‘«„”’\—\–\:\u201c\u201d\u2018\u2019\ufffd]))\d+([a-zA-Z\-]*)', r'\1', t)
            clean_t = re.sub(r'\s+\d+([\.\,\;\:\?\!])', r'\1', clean_t)
            clean_t = re.sub(r'\s+\d+\s*$', '', clean_t)
            clean_t = re.sub(r'\s+', ' ', clean_t).strip()
            return clean_t, t, {}
            
        keywords_map = {}
        marked_chars = []
        clean_chars = []
        last_idx = 0
        
        for idx, m in enumerate(matches):
            prefix = m.group(1)
            raw_num_str = m.group(2)
            raw_cross_ref = m.group(3)
            raw_word = m.group(4)
            
            note_int, cross_ref, word = parse_marker(raw_num_str, raw_cross_ref, raw_word)
            
            # Text preceding this match
            clean_chars.append(t[last_idx : m.start()])
            marked_chars.append(t[last_idx : m.start()])
            
            # Add prefix (e.g. quote, space, hyphen)
            clean_chars.append(prefix)
            marked_chars.append(prefix)
            
            word_start = m.start() + len(prefix) + len(raw_num_str) + len(cross_ref)
            
            # Check if this marker is inside quotes for a short title/phrase e.g. “3Orang Nazaret”
            if prefix in '“"‘\u201c\u2018':
                close_quote = '”' if prefix in '“\u201c' else ('’' if prefix == '‘' else '"')
                close_idx = t.find(close_quote, word_start)
                if close_idx != -1 and (close_idx - word_start) <= 35:
                    phrase = t[word_start : close_idx]
                    clean_chars.append(phrase + close_quote)
                    marked_chars.append(f"{phrase}{close_quote}<fn n=\"{note_int}\"/>")
                    keywords_map[note_int] = phrase
                    last_idx = close_idx + len(close_quote)
                    continue
                    
            # Normal word
            clean_chars.append(word)
            marked_chars.append(f"{word}<fn n=\"{note_int}\"/>")
            keywords_map[note_int] = word
            last_idx = m.end()
            
        clean_chars.append(t[last_idx:])
        marked_chars.append(t[last_idx:])
        
        clean_text = "".join(clean_chars)
        marked_text = "".join(marked_chars)
        
        # Strip any leftover digit stuck to words in clean_text
        clean_text = re.sub(r'(?:^|(?<=[\s\"\'\(\[\{“‘«„”’\—\–\:\u201c\u201d\u2018\u2019\ufffd]))\d+([a-zA-Z\-]*)', r'\1', clean_text)
        clean_text = re.sub(r'\s+\d+([\.\,\;\:\?\!])', r'\1', clean_text)
        clean_text = re.sub(r'\s+\d+\s*$', '', clean_text)
        
        clean_text = fix_redup(clean_text)
        marked_text = fix_redup(marked_text)
        
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        marked_text = re.sub(r'\s+', ' ', marked_text).strip()
        
        return clean_text, marked_text, keywords_map

    def add_verse(c_num, vn, raw_vt, verse_outlines=None):
        clean_t, marked_t, kw_map = build_marked_text(vn, raw_vt, c_num)
        
        if verse_outlines:
            for o in verse_outlines:
                chapters_data[c_num]["outlines"].append({
                    "verse": vn,
                    "text": o
                })
                
        chapters_data[c_num]["verses"].append({
            "verse": vn,
            "text": clean_t,
            "marked_text": marked_t,
            "outlines": verse_outlines if verse_outlines else None,
            "_raw_kw": kw_map,
            "_raw_text": raw_vt
        })

    for idx, l in enumerate(scripture_slice):
        s = l.strip().replace('\xa0', ' ')
        if not s or s.startswith('---') or s.startswith('o---') or s.startswith('Ayat :') or s.startswith('Ayat:'):
            continue
        if re.match(r'^\d+\~\d+', s):
            continue
            
        m_chap = re.match(r'^(?:PASAL|MAZMUR)\s*(?::\s*)?(\d+)', s, re.IGNORECASE)
        if m_chap:
            cur_chap = int(m_chap.group(1))
            if cur_chap not in chapters_data:
                chapters_data[cur_chap] = {
                    "chapter": cur_chap,
                    "outlines": [],
                    "verses": [],
                    "footnotes": []
                }
            continue
            
        if cur_chap not in chapters_data:
            chapters_data[cur_chap] = {
                "chapter": cur_chap,
                "outlines": [],
                "verses": [],
                "footnotes": []
            }
            
        is_outline_start = bool(re.match(r'^(?:[I|V|X]+\.|\b[A-Z]\.|\b\d+\.)\s+', s))
        is_range = bool(re.match(r'^\d+:\d+', s))
        
        if is_outline_start:
            if accumulating_outline:
                full_o = clean_base_text(' '.join(accumulating_outline))
                pending_outlines.append(full_o)
                accumulating_outline = []
            accumulating_outline.append(s)
            continue
        elif is_range and accumulating_outline:
            accumulating_outline.append(f"({s})")
            full_o = clean_base_text(' '.join(accumulating_outline))
            pending_outlines.append(full_o)
            accumulating_outline = []
            continue
        elif accumulating_outline and not re.match(r'^\d+\s+', s):
            accumulating_outline.append(s)
            continue
            
        # Match verse line (handles '15Perhatikanlah' as well as '15 Perhatikanlah')
        m_v = re.match(r'^(\d{1,3})(?:[a-b]?)(?:\s+|(?=[A-Za-z]))(.+)', s)
        if m_v and cur_chap:
            if accumulating_outline:
                full_o = clean_base_text(' '.join(accumulating_outline))
                pending_outlines.append(full_o)
                accumulating_outline = []
                
            vn = int(m_v.group(1))
            raw_vt = m_v.group(2)
            
            verse_outlines = list(pending_outlines)
            pending_outlines = []
            
            # Check for inline concatenated next verse e.g. "... 25Saudara-saudara..." or "... 5\"Mengapa..."
            inline_pattern = re.compile(r'([\.\;\!\?\:\”\"\’\)\,])\s*(\d{1,3})([a-b]?)(?:\s+|(?=[A-Z]))([A-Z].*)')
            m_inline = inline_pattern.search(raw_vt)
            if m_inline and int(m_inline.group(2)) == vn + 1:
                cur_vt = raw_vt[:m_inline.start() + len(m_inline.group(1))].strip()
                next_vn = int(m_inline.group(2))
                next_vt = m_inline.group(4).strip()
                add_verse(cur_chap, vn, cur_vt, verse_outlines)
                add_verse(cur_chap, next_vn, next_vt, None)
            else:
                add_verse(cur_chap, vn, raw_vt, verse_outlines)
                
        elif cur_chap in chapters_data and chapters_data[cur_chap]["verses"]:
            # Continuation line of previous verse if not an outline
            if not is_outline_start and not is_range:
                last_v_obj = chapters_data[cur_chap]["verses"][-1]
                
                # Check if this continuation line actually starts a concatenated next verse
                # e.g. line starts with '15Perhatikanlah'
                m_next = re.match(r'^(\d{1,3})(?:[a-b]?)(?:\s+|(?=[A-Za-z]))(.+)', s)
                if m_next and int(m_next.group(1)) == last_v_obj["verse"] + 1:
                    next_vn = int(m_next.group(1))
                    next_vt = m_next.group(2)
                    add_verse(cur_chap, next_vn, next_vt, None)
                else:
                    # Append raw line and re-run build_marked_text on full combined verse!
                    combined_raw = last_v_obj.get("_raw_text", "") + " " + s
                    last_v_obj["_raw_text"] = combined_raw
                    clean_t, marked_t, kw_map = build_marked_text(last_v_obj["verse"], combined_raw, cur_chap)
                    last_v_obj["text"] = clean_t
                    last_v_obj["marked_text"] = marked_t
                    last_v_obj["_raw_kw"].update(kw_map)

    # 5. Connect Footnotes with Keywords
    total_fns_count = 0
    for chap_num, chap_obj in chapters_data.items():
        raw_notes = footnotes_by_chap.get(chap_num, [])
        v_kw_lookup = {}
        for v in chap_obj["verses"]:
            v_kw_lookup[v["verse"]] = v.pop("_raw_kw", {})
            v.pop("_raw_text", None)
            
        final_fns = []
        for fn in raw_notes:
            v_num = fn["verse"]
            n_idx = fn["note_idx"]
            kw = v_kw_lookup.get(v_num, {}).get(n_idx, "")
            final_fns.append({
                "verse": v_num,
                "note_idx": n_idx,
                "keyword": kw,
                "text": fn["text"]
            })
        chap_obj["footnotes"] = final_fns
        total_fns_count += len(final_fns)
        
    payload = {
        "id": b_id,
        "name": b_name,
        "testament": b_testament,
        "chapters_count": len(chapters_data),
        "intro": book_intro,
        "chapters": chapters_data
    }
    
    return payload, total_fns_count

def main():
    t_start = time.time()
    print("Loading full bible text from roti_hayat_full.txt...")
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        all_lines = f.readlines()
    print(f"Loaded {len(all_lines):,} lines in {time.time()-t_start:.1f}s\n")
    
    books_meta = []
    
    for idx, b_info in enumerate(BIBLE_BOOKS, start=1):
        b_id = b_info["id"]
        b_name = b_info["name"]
        b_testament = b_info["testament"]
        
        # Exception: Matius was already curated or we can parse it through the unified pipeline
        # Our unified pipeline matches the Matius template 100%!
        raw_slice = all_lines[b_info['start']-1 : b_info['end']-1]
        
        payload, fns_count = parse_book(b_info, raw_slice)
        
        # Save to public/bible/{b_id}.json
        target_pub = os.path.join(public_dir, f"{b_id}.json")
        with open(target_pub, "w", encoding="utf-8") as f_out:
            json.dump(payload, f_out, ensure_ascii=False)
            
        # Save to dist/bible/{b_id}.json
        target_dist = os.path.join(dist_dir, f"{b_id}.json")
        with open(target_dist, "w", encoding="utf-8") as f_out:
            json.dump(payload, f_out, ensure_ascii=False)
            
        chap_cnt = payload["chapters_count"]
        books_meta.append({
            "id": b_id,
            "name": b_name,
            "testament": b_testament,
            "chapters_count": chap_cnt
        })
        
        print(f"[{idx:2d}/66] [{b_testament}] {b_name:20s}: {chap_cnt:3d} pasal, {fns_count:4d} catatan kaki")

    # Save books.json
    books_pub = os.path.join(public_dir, "books.json")
    with open(books_pub, "w", encoding="utf-8") as f:
        json.dump(books_meta, f, ensure_ascii=False, indent=2)
        
    books_dist = os.path.join(dist_dir, "books.json")
    with open(books_dist, "w", encoding="utf-8") as f:
        json.dump(books_meta, f, ensure_ascii=False, indent=2)
        
    print(f"\nAll 66 books built successfully in {time.time()-t_start:.1f}s!")
    print(f"Index written to {books_pub} and {books_dist}")

if __name__ == "__main__":
    main()
