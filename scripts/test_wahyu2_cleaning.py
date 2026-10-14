import re, json

with open(r'd:\Magang\Baca\pdb\roti_hayat_full.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Build frequency map
raw_tokens = re.findall(r'\b[a-zA-Z]{2,}\b', text)
CORPUS_FREQ = {}
for t in raw_tokens:
    low = t.lower()
    CORPUS_FREQ[low] = CORPUS_FREQ.get(low, 0) + 1

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
    'hari', 'harus', 'hidup', 'hati', 'hamba', 'hukum', 'hujan', 'hutan', 'harta', 'hawa', 'haus', 'hebat', 'hina',
    'ia', 'ibu', 'ikut', 'ingat', 'ini', 'itu', 'iman', 'indah', 'injil', 'inilah', 'isi', 'istri', 'iblis', 'imam',
    'juga', 'jika', 'jikalau', 'jangan', 'jiwa', 'jalan', 'janji', 'jatuh', 'jauh', 'jahat', 'jelas', 'jemaat', 'jemaah',
    'karena', 'kamu', 'kami', 'kita', 'kata', 'kasih', 'kaki', 'kaya', 'kemiskinan', 'kesusahan', 'kematian', 'kuasa', 'kudus',
    'lagi', 'langit', 'lain', 'lelah', 'lebih', 'lama', 'lepas', 'lihat', 'lalu',
    'maka', 'mereka', 'makan', 'mati', 'mata', 'mahkota', 'malam', 'mana', 'masih', 'mari', 'masuk', 'mulut', 'murid',
    'nama', 'namun', 'negeri', 'nanti', 'nasihat', 'nabiah', 'nabi',
    'orang', 'oleh', 'obat',
    'pada', 'pohon', 'pedang', 'pelita', 'pekerjaan', 'penjara', 'pergi', 'perkataan', 'perbuatan', 'persembahan',
    'ragu-ragu', 'raja', 'rasul', 'roh', 'rumah', 'rahasia', 'ranjang',
    'satu', 'sampai', 'sabar', 'saksi', 'sama', 'sangat', 'saja', 'saudara', 'sebab', 'segala', 'segera', 'selain', 'selalu',
    'semua', 'semula', 'senantiasa', 'seorang', 'seperti', 'sepuluh', 'setia', 'sesungguhnya', 'sesuatu', 'siapa', 'sudah',
    'surga', 'suara', 'sukacita',
    'takut', 'tangan', 'tanah', 'tempat', 'tetapi', 'telah', 'tahu', 'tajam', 'takhta', 'taman', 'telinga', 'tembaga', 'tembikar',
    'terakhir', 'tersembunyi', 'tiang', 'tidak', 'tidur', 'tinggal', 'timur', 'tuliskanlah', 'tuan', 'tuhan', 'tujuh',
    'uang', 'umat', 'unta', 'untuk', 'utara',
    'wanita', 'waktu', 'wajah',
    'yang', 'yaitu'
}

def fix_redup(text):
    def _repl(m):
        w = m.group(0)
        parts = w.split('-')
        if len(parts) >= 2:
            p1 = parts[0]
            p2 = re.sub(r'(?:[Nn]ya|[Kk]u|[Mm]u|[Ll]ah|[Kk]ah|[Pp]un)$', '', parts[1])
            if len(p2) == len(p1) + 1 and p2[1:].lower() == p1.lower():
                lead_char = p2[0].upper() if p1[0].isupper() else p2[0].lower()
                return lead_char + p1 + '-' + '-'.join(parts[1:])
            if len(p1) == len(p2) + 1 and p1[1:].lower() == p2.lower():
                return p1[1:] + '-' + '-'.join(parts[1:])
        return w
    return re.sub(r'\b[a-zA-Z]+(?:-[a-zA-Z]+)+\b', _repl, text)

def clean_cross_refs(txt):
    t = fix_redup(txt)
    # 1. Lowercase letter before Capital letter (e.g. aGalilea -> Galilea, bKuperintahkan -> Kuperintahkan)
    t = re.sub(r'(?:^|(?<=[\s"\'\(\[\{“‘«„\—\–\:\u201c\u2018\ufffd]))[a-z]([A-Z][a-zA-Z\-]*)', r'\1', t)
    
    # 2. Lowercase letter before lowercase word
    def clean_word(m):
        full = m.group(1)
        low = full.lower()
        if low in NEVER_STRIP:
            return full
        if low.startswith(('di', 'ber', 'ter', 'se', 'ke')) and CORPUS_FREQ.get(low, 0) >= 3:
            return full
            
        rest = full[1:]
        rest_low = rest.lower()
        
        # Check base forms without suffixes
        base_full = re.sub(r'-(?:nya|ku|mu|kami|mereka|dia|lah|kah|pun)$', '', low)
        base_full = re.sub(r'(?:nya|ku|mu|lah|kah|pun)$', '', base_full)
        
        base_rest = re.sub(r'-(?:nya|ku|mu|kami|mereka|dia|lah|kah|pun)$', '', rest_low)
        base_rest = re.sub(r'(?:nya|ku|mu|lah|kah|pun)$', '', base_rest)
        
        if base_full in NEVER_STRIP:
            return full
            
        f_full = CORPUS_FREQ.get(base_full, 0)
        f_rest = CORPUS_FREQ.get(base_rest, 0)
        
        # If rest is a valid word and either base_rest in NEVER_STRIP or f_rest is much higher than f_full
        if base_rest in NEVER_STRIP or (f_rest >= 5 and f_rest > f_full * 3):
            return rest
            
        return full

    t = re.sub(r'(?:^|(?<=[\s"\'\(\[\{“‘«„\—\–\:\u201c\u2018\ufffd]))([a-z][a-z]+(?:-[a-zA-Z]+)*)\b', clean_word, t)
    return fix_redup(t)

def parse_marker(num_str, cross_ref, word):
    if not cross_ref:
        return int(num_str), "", word
    
    # 1. Capitalized word -> letter is cross-ref
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
            
    if w_low.startswith(('ukit', 'aptislah', 'jarlah', 'empa')):
        return int(num_str), "", cand_full
        
    if c_low in NEVER_STRIP or c_low.startswith(('bukit', 'baptis', 'ajarlah', 'gempa', 'fajar', 'dalam', 'emas')):
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

def build_marked_text(raw_text):
    t = clean_cross_refs(raw_text)
    pattern = re.compile(r'(^|[\s"\'\(\[\{“‘«„”’\—\–\-\:\;\.\u201c\u201d\u2018\u2019\ufffd])(\d{1,2})([a-z]?)([A-Za-z]+(?:-[A-Za-z]+)*)')
    matches = list(pattern.finditer(t))
    
    clean_chars = []
    marked_chars = []
    last_idx = 0
    
    for m in matches:
        prefix = m.group(1)
        raw_num_str = m.group(2)
        raw_cross_ref = m.group(3)
        raw_word = m.group(4)
        
        note_int, cross_ref, word = parse_marker(raw_num_str, raw_cross_ref, raw_word)
        
        clean_chars.append(t[last_idx : m.start()])
        marked_chars.append(t[last_idx : m.start()])
        
        clean_chars.append(prefix)
        marked_chars.append(prefix)
        
        clean_chars.append(word)
        marked_chars.append(f"{word}<fn n=\"{note_int}\"/>")
        last_idx = m.end()
        
    clean_chars.append(t[last_idx:])
    marked_chars.append(t[last_idx:])
    
    clean_text = "".join(clean_chars)
    marked_text = "".join(marked_chars)
    
    clean_text = fix_redup(clean_text)
    marked_text = fix_redup(marked_text)
    
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    marked_text = re.sub(r'\s+', ' ', marked_text).strip()
    return clean_text, marked_text

# Test on Wahyu 2:2, 10, 27
raw_samples = [
    '2 Aku tahu segala 1pekerjaanmu, baik 2jerih payahmu maupun cketekunanmu. Aku tahu bahwa engkau tidak dapat sabar terhadap 3orang-orang jahat bahwa engkau telah 4menguji mereka yang 5menyebut dirinya rasul, tetapi yang sebenarnya tidak demikian bahwa engkau telah mendapati mereka 6pendusta.',
    '10 Jangan takut terhadap apa yang harus engkau derita! Sesungguhnya 1Iblis akan melemparkan beberapa orang dari antara kamu ke dalam penjara supaya kamu dicobai dan kamu akan beroleh kesusahan selama 2sepuluh hari. Hendaklah engkau setia isampai mati, dan Aku akan mengaruniakan kepadamu 3jmahkota kehidupan.',
    '27 dan ia akan 1memerintah mereka dengan tongkat besi; mereka akan diremukkan seperti btembikar tukang periuk -- sama seperti kuasa yang 2Kuterima dari Bapa-Ku --'
]

print("=== TESTING CLEANING ON WAHYU 2 VERSES ===")
for s in raw_samples:
    cl, mk = build_marked_text(s)
    print("CLEAN :", cl)
    print("MARKED:", mk)
    print()
