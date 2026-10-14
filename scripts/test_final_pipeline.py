import re, json

with open(r'd:\Magang\Baca\pdb\roti_hayat_full.txt', 'r', encoding='utf-8', errors='ignore') as f:
    raw_lines = f.readlines()

print("Raw lines loaded:", len(raw_lines))

# Extract Matius 28 lines from raw_lines (around index 405800)
mat28_lines = []
for idx in range(405800, 405860):
    l = raw_lines[idx].strip()
    if re.match(r'^\d+\s+', l):
        mat28_lines.append(l)

print(f"Found {len(mat28_lines)} verses in Matius 28")

SAFE_WORDS = {
    'ada', 'adalah', 'adanya', 'adik', 'adil', 'adinda', 'adipati', 'adab', 'adat', 'agama',
    'agar', 'agung', 'ahli', 'aib', 'air', 'ajaib', 'ajak', 'ajal', 'ajar', 'ajarlah',
    'akal', 'akan', 'akar', 'akhir', 'akhirat', 'akhirnya', 'akibat', 'akibatnya', 'aku',
    'alam', 'alamat', 'alang', 'alas', 'alasan', 'alat', 'alih', 'aliran', 'alis', 'alpa',
    'aman', 'amanat', 'amat', 'ambil', 'ambillah', 'ambang', 'ambruk', 'ampun', 'ampunan',
    'anak', 'anak-anak', 'ancam', 'ancaman', 'anda', 'andai', 'andalkan', 'aneh', 'angan',
    'anggap', 'anggapan', 'anggar', 'anggaran', 'anggota', 'anggrek', 'angguk', 'anggur',
    'angin', 'angkat', 'angkatan', 'angkuh', 'angsa', 'anjing', 'anjur', 'anjuran', 'antara',
    'antri', 'anugerah', 'anutan', 'anyam', 'apa', 'apabila', 'apakah', 'apalagi', 'aparat',
    'api', 'apung', 'arah', 'arak', 'arang', 'aras', 'arasy', 'arit', 'arti', 'artinya',
    'arus', 'arwah', 'asa', 'sah', 'asal', 'asalkan', 'asap', 'asas', 'asin', 'asing',
    'asli', 'asuh', 'asuhan', 'atap', 'atas', 'atasan', 'atau', 'atur', 'aturan', 'awak',
    'awal', 'awalan', 'awam', 'awan', 'awas', 'ayah', 'ayak', 'ayam', 'ayan', 'ayat',
    'ayun', 'ayunan', 'azab', 'azimat',
    # b
    'babi', 'baca', 'bada', 'badai', 'badan', 'bagai', 'bagaikan', 'bagaimana', 'bagi',
    'bagian', 'baginda', 'bagus', 'bahagia', 'bahana', 'bahang', 'bahas', 'bahaya',
    'bahkan', 'bahu', 'bahwa', 'baik', 'baja', 'bajak', 'baju', 'bak', 'bakar', 'bakal',
    'bakat', 'bakti', 'baku', 'bala', 'balai', 'balak', 'balang', 'balas', 'balasan',
    'balik', 'balok', 'balon', 'balut', 'bambu', 'banci', 'bandar', 'bandel', 'banding',
    'bangang', 'bangau', 'bangga', 'bangkai', 'bangkit', 'bangsa', 'bangun', 'banjir',
    'bantah', 'bantai', 'bantal', 'bantu', 'bantuan', 'banyak', 'bapa', 'bapak', 'baptis',
    'baptisan', 'baptislah', 'bara', 'barang', 'barat', 'baring', 'baris', 'baru', 'barus',
    'basah', 'basi', 'basmi', 'basuh', 'bata', 'batal', 'batang', 'batas', 'batu', 'batuk',
    'bau', 'baur', 'bawa', 'bawah', 'bawang', 'baya', 'bayang', 'bayar', 'bayi', 'bebal',
    'beban', 'bebas', 'bebat', 'bebek', 'beber', 'beberapa', 'becak', 'beda', 'bedak',
    'bedil', 'begitu', 'bejana', 'bekal', 'bekas', 'bekerja', 'beku', 'bela', 'belah',
    'belajar', 'belakang', 'belalang', 'belang', 'belanja', 'belas', 'belasungkawa', 'beli',
    'beliau', 'belimbing', 'belit', 'belok', 'belum', 'belut', 'benak', 'benang', 'benar',
    'bencana', 'benci', 'benda', 'bendera', 'bendung', 'bengis', 'bengkok', 'benih', 'bening',
    'bentang', 'benteng', 'bentuk', 'bentur', 'beo', 'berahi', 'berak', 'berang', 'berangkat',
    'berapa', 'beras', 'berat', 'berhala', 'beri', 'berita', 'beritahukan', 'berkat',
    'beroleh', 'bersih', 'bersin', 'bersuka', 'bersukacita', 'bersumpah', 'besar', 'besi',
    'besok', 'betina', 'betis', 'betul', 'biang', 'biar', 'biarkan', 'biasa', 'biaya',
    'bibir', 'bibit', 'bicara', 'bidadari', 'bidang', 'biji', 'bijak', 'bijaksana', 'bilah',
    'bilal', 'bilang', 'bilamana', 'bilangan', 'bilas', 'bilik', 'bimbang', 'bimbing',
    'binasa', 'binatang', 'bingkai', 'bingung', 'bini', 'bintang', 'bintik', 'biola', 'biru',
    'bisa', 'bisik', 'bisnis', 'bisu', 'bisul', 'bius', 'bobot', 'bocah', 'bocor', 'bodoh',
    'bohong', 'bola', 'boleh', 'bolong', 'bolos', 'bom', 'bongkar', 'bonus', 'bopeng',
    'bor', 'boros', 'bosan', 'botak', 'botol', 'buah', 'buai', 'buak', 'bual', 'buang',
    'buas', 'buat', 'buatan', 'buaya', 'bubar', 'bubu', 'bubuk', 'bubur', 'budi', 'bujang',
    'bujuk', 'bujur', 'buka', 'bukan', 'bukit', 'bukti', 'buku', 'bula', 'bulan', 'bulang',
    'bulat', 'bulir', 'bulu', 'buluh', 'bumbu', 'bumi', 'buncit', 'bunda', 'bunga', 'bungkam',
    'bungkuk', 'bungkus', 'buntung', 'buntut', 'bunuh', 'bunyi', 'bura', 'buron', 'buru',
    'buruh', 'buruk', 'burung', 'busa', 'busuk', 'busur', 'buta', 'butir', 'butuh', 'buyut',
    # c, d, e, f, g
    'cahaya', 'cair', 'cakap', 'cakar', 'candi', 'cangkir', 'cantik', 'capai', 'cara',
    'catat', 'cawan', 'cegah', 'celaka', 'cemas', 'cemburu', 'cepat', 'cerah', 'cerdas',
    'cerita', 'cermin', 'cinta', 'cipta', 'ciptaan', 'cium', 'coba', 'cobaan', 'cocok',
    'contoh', 'corak', 'cuaca', 'cuci', 'cucu', 'cukup', 'cuma', 'curah', 'curiga',
    'dada', 'dadu', 'daerah', 'daftar', 'dagang', 'daging', 'dahan', 'dahi', 'dahsyat',
    'dahulu', 'daki', 'daku', 'dalam', 'dalih', 'damai', 'dampak', 'dan', 'dana', 'danau',
    'dapat', 'darah', 'darat', 'dari', 'daripada', 'darma', 'dasar', 'daster', 'datang',
    'datar', 'daulat', 'daun', 'dawai', 'daya', 'dayung', 'debar', 'debu', 'dedak', 'dekat',
    'delapan', 'delima', 'demam', 'demi', 'demikian', 'denda', 'dendam', 'dengar', 'dengki',
    'denyut', 'depan', 'derajat', 'deras', 'derita', 'dermaga', 'derma', 'desa', 'desak',
    'desau', 'desir', 'detik', 'dewan', 'dewasa', 'dewi', 'di', 'dia', 'diam', 'dian',
    'didik', 'didikan', 'dikit', 'dinding', 'dingin', 'dini', 'diri', 'dirikan', 'doa',
    'dobrak', 'dokok', 'dokter', 'domba', 'dorong', 'dosa', 'dua', 'duduk', 'duda', 'duga',
    'duit', 'duka', 'dukacita', 'dukung', 'dulang', 'dulu', 'dunia', 'dupa', 'duri', 'dusta',
    'dusun', 'duta',
    'edar', 'emas', 'empat', 'enam', 'enak', 'engkau', 'enggan', 'erat', 'esok',
    'faedah', 'fajar', 'fakir', 'falsafah', 'fana', 'fasal', 'fasiq', 'fasih', 'firman', 'fitnah',
    'gading', 'gadis', 'gadai', 'gagah', 'gagal', 'gagang', 'gagap', 'gaib', 'gairah', 'gajah',
    'gaji', 'gala', 'galak', 'galang', 'gali', 'galau', 'gambar', 'gamang', 'gampang', 'gana',
    'ganas', 'ganda', 'gandum', 'ganggang', 'ganggu', 'ganjil', 'ganti', 'gantung', 'gapai',
    'garam', 'garang', 'garis', 'garpu', 'garuk', 'gas', 'gatal', 'gaul', 'gaun', 'gaung',
    'gaya', 'gayung', 'gedung', 'gejala', 'gelak', 'gelang', 'gelap', 'gelar', 'gelas', 'gelembung',
    'geli', 'gelimang', 'gelincir', 'gelisah', 'gelombang', 'gelora', 'gemar', 'gembala', 'gembira',
    'gembok', 'gembung', 'gemerlap', 'gempa', 'gempar', 'gempur', 'gemuk', 'genap', 'gencat',
    'gendang', 'genggam', 'genit', 'genta', 'gentar', 'genting', 'gerak', 'geram', 'gerang',
    'gerbang', 'gereja', 'gergaji', 'gerombolan', 'gerutu', 'geser', 'getah', 'getar', 'getir',
    'gigi', 'gigih', 'gigit', 'gila', 'gilang', 'giling', 'gilir', 'giliran', 'girang', 'giring',
    'gitar', 'godaan', 'goda', 'golong', 'golongan', 'gondok', 'goreng', 'gores', 'gosok', 'goyang',
    'gua', 'gubernur', 'gugur', 'gugus', 'gula', 'gulat', 'guling', 'gulung', 'guna', 'guncang',
    'gunung', 'gurau', 'gurih', 'gurun', 'guru',
    # common roots that had cross-ref in Bible
    'mur', 'mimpi', 'mati', 'kilat', 'putih'
}

STEMS_ALL = (
    'ajar', 'ambil', 'ampun', 'antara', 'atas', 'anak', 'akhir', 'awal', 'air', 'api', 'akal', 'arah', 'asal',
    'ikut', 'ingat', 'isi', 'ikat', 'iman', 'indah', 'injil', 'inilah', 'itu', 'iblis', 'imam', 'ibu',
    'ujung', 'umat', 'ular', 'unta', 'utus', 'ukur', 'undian', 'upah',
    'bukit', 'baptis', 'batu', 'bapa', 'bumi', 'benar', 'besar', 'baik', 'bangun', 'bukan', 'bahkan',
    'bawa', 'buka', 'bintang', 'binatang', 'bangsa', 'bau', 'buli', 'biji', 'buah', 'berkat', 'berita',
    'beroleh', 'bersih', 'berat', 'beras', 'berdiri', 'berjalan', 'berkata', 'berbicara', 'berbuat',
    'berdoa', 'berada', 'berangkat', 'berkuasa', 'berfirman', 'berkumpul',
    'dalam', 'darah', 'dunia', 'daerah', 'diri', 'dusta', 'duduk', 'dekat', 'diam', 'domba', 'desa',
    'dosa', 'dari', 'dan', 'di', 'dia', 'diberi', 'dibuat', 'dikatakan', 'dilihat', 'didengar', 'digenapi',
    'dilahirkan', 'dibaptis', 'dikuduskan', 'ditebus', 'diselamatkan', 'dibangkitkan', 'diurapi',
    'gempa', 'gunung', 'gandum', 'gelap', 'guru', 'gembala', 'gigi', 'garam', 'gajah', 'gadis', 'ganti',
    'gentar', 'genap', 'gerbang', 'gereja',
    'fajar', 'firman', 'fasal', 'faedah', 'faham', 'fitnah',
    'emas', 'empat', 'enam', 'elok', 'erat', 'ekor', 'edar', 'engkau'
)

def clean_cross_refs(txt):
    t = txt
    # Lowercase before Capital (e.g. aGalilea -> Galilea, bKuperintahkan -> Kuperintahkan)
    t = re.sub(r'(?:^|(?<=[\s"\'\(\[\{“‘«„\—\–\:\u201c\u2018\ufffd]))[a-h]([A-Z][a-zA-Z\-]*)', r'\1', t)
    
    # Lowercase before standard affixes: ber-, ter-, ke-, pem-, pen-, peng-, peny-, per-, se-, di-, me-
    affixes = r'(?:ber|ter|ke|pem|pen|peng|peny|per|se|di|me|men|mem|meng|meny)'
    def clean_affix(m):
        w = m.group(1)
        w_lower = w.lower()
        if w_lower in SAFE_WORDS:
            return w
        # Strip first letter [a-h]
        return w[1:]
    t = re.sub(r'(?:^|(?<=[\s"\'\(\[\{“‘«„\—\–\:\u201c\u2018\ufffd]))([a-h]' + affixes + r'[a-z]+(?:-[a-z]+)*)\b', clean_affix, t)
    
    # Lowercase before roots that are in SAFE_WORDS (e.g. abangsa -> bangsa, akilat -> kilat, bputih -> putih)
    def clean_root(m):
        w = m.group(1)
        w_lower = w.lower()
        if w_lower in SAFE_WORDS:
            return w
        rest = w[1:]
        if rest.lower() in SAFE_WORDS or rest.lower().startswith(STEMS_ALL):
            return rest
        return w
    t = re.sub(r'(?:^|(?<=[\s"\'\(\[\{“‘«„\—\–\:\u201c\u2018\ufffd]))([a-h][a-z]+(?:-[a-z]+)*)\b', clean_root, t)
    return t

def parse_marker(num_str, cross_ref, word):
    if not cross_ref:
        return int(num_str), "", word
    
    cand_full = cross_ref + word
    
    # 1. Capitalized -> real cross reference (e.g. 1aNazaret, 1aUr)
    if re.match(r'^[A-Z]', word):
        return int(num_str), cross_ref, word
        
    cand_lower = cand_full.lower()
    word_lower = word.lower()
    
    # 2. If cand_lower matches known stems -> cand_full IS the word!
    # e.g. 1bukit -> bukit
    # e.g. 3baptislah -> baptislah
    # e.g. 4dalam -> dalam
    # e.g. 1ajarlah -> ajarlah
    # e.g. 1fajar -> fajar
    # e.g. 1gempa -> gempa
    # e.g. 1berbicara -> berbicara
    if cand_lower.startswith(STEMS_ALL) or cand_lower in SAFE_WORDS:
        return int(num_str), "", cand_full
        
    # 3. If word starts with affix that cannot follow cross_ref:
    # e.g. 2cmenyertai -> menyertai
    # e.g. 3dkepada -> kepada
    if re.match(r'^(?:ber|ter|ke|pem|pen|peng|peny|per|se|di|me|men|mem|meng|meny|kepada)', word_lower):
        return int(num_str), cross_ref, word
        
    # 4. If word is safe word and cand_full is not:
    if word_lower in SAFE_WORDS and cand_lower not in SAFE_WORDS:
        return int(num_str), cross_ref, word
        
    return int(num_str), cross_ref, word

def process_verse(v_raw):
    t = clean_cross_refs(v_raw)
    pattern = re.compile(r'(^|[\s"\'\(\[\{“‘«„”’\—\–\-\:\;\.\u201c\u201d\u2018\u2019\ufffd])(\d{1,2})([a-g]?)([A-Za-z]+(?:-[A-Za-z]+)*)')
    matches = list(pattern.finditer(t))
    
    clean_chars = []
    marked_chars = []
    last_idx = 0
    
    for m in matches:
        prefix = m.group(1)
        raw_num = m.group(2)
        raw_ref = m.group(3)
        raw_word = m.group(4)
        
        note_int, cross_ref, word = parse_marker(raw_num, raw_ref, raw_word)
        
        clean_chars.append(t[last_idx : m.start()])
        marked_chars.append(t[last_idx : m.start()])
        
        clean_chars.append(prefix)
        marked_chars.append(prefix)
        
        clean_chars.append(word)
        marked_chars.append(f"{word}<fn n=\"{note_int}\"/>")
        last_idx = m.end()
        
    clean_chars.append(t[last_idx:])
    marked_chars.append(t[last_idx:])
    
    cl = re.sub(r'\s+', ' ', "".join(clean_chars)).strip()
    mk = re.sub(r'\s+', ' ', "".join(marked_chars)).strip()
    return cl, mk

print("\n=== FINAL TEST MATIUS 28:16-20 ===")
for line in mat28_lines:
    m_v = re.match(r'^(\d+)\s+(.+)', line)
    if m_v:
        vn = int(m_v.group(1))
        if vn >= 16:
            cl, mk = process_verse(m_v.group(2))
            print(f"Verse {vn}:")
            print("  CLEAN :", cl)
            print("  MARKED:", mk)
