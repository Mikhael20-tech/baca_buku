import re

with open(r'd:\Magang\Baca\pdb\roti_hayat_full.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

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
    'guna', 'guncang', 'gunung', 'guru'
}

def clean_cross_refs(txt):
    t = txt
    # 1. Lowercase letter before Capital letter (e.g. aGalilea -> Galilea, bKuperintahkan -> Kuperintahkan)
    t = re.sub(r'(?:^|(?<=[\s"\'\(\[\{“‘«„\—\–\:\u201c\u2018\ufffd]))[a-h]([A-Z][a-zA-Z\-]*)', r'\1', t)
    
    # 2. Lowercase letter [a-h] before lowercase word
    def clean_word(m):
        full = m.group(1)
        low = full.lower()
        if low in NEVER_STRIP:
            return full
        if low.startswith(('di', 'ber', 'ter', 'se', 'ke')) and CORPUS_FREQ.get(low, 0) >= 3:
            return full
            
        rest = full[1:]
        rest_low = rest.lower()
        
        base_full = re.sub(r'-(?:nya|ku|mu|kami|mereka|dia|lah|kah|pun)$', '', low)
        base_rest = re.sub(r'-(?:nya|ku|mu|kami|mereka|dia|lah|kah|pun)$', '', rest_low)
        
        f_full = CORPUS_FREQ.get(base_full, 0)
        f_rest = CORPUS_FREQ.get(base_rest, 0)
        
        if f_rest >= 5 and f_rest > f_full * 5:
            return rest
            
        return full

    t = re.sub(r'(?:^|(?<=[\s"\'\(\[\{“‘«„\—\–\:\u201c\u2018\ufffd]))([a-h][a-z]+(?:-[a-zA-Z]+)*)\b', clean_word, t)
    return t

def parse_marker(num_str, letter, word):
    if not letter:
        return int(num_str), "", word
    
    # 1. Capitalized word -> letter is cross-ref (e.g. 1aGalilea -> num=1, ref='a', word='Galilea')
    if re.match(r'^[A-Z]', word):
        return int(num_str), letter, word
        
    cand_full = letter + word
    w_low = word.lower()
    c_low = cand_full.lower()
    
    # Specific known cases:
    if w_low in ('ukit', 'aptislah', 'jarlah', 'empa'):
        return int(num_str), "", cand_full
        
    if c_low in NEVER_STRIP or c_low in ('bukit', 'baptislah', 'baptis', 'baptisan', 'ajarlah', 'gempa', 'fajar', 'dalam', 'emas'):
        return int(num_str), "", cand_full
        
    c_freq = CORPUS_FREQ.get(c_low, 0)
    w_freq = CORPUS_FREQ.get(w_low, 0)
    
    if w_freq > 20 and c_freq < 5:
        return int(num_str), letter, word
        
    if c_freq > 20 and w_freq < 5:
        return int(num_str), "", cand_full
        
    if c_freq > w_freq:
        return int(num_str), "", cand_full
        
    return int(num_str), letter, word

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

mat28_start = text.find('PASAL 28')
mat28_text = text[mat28_start:mat28_start+3000]

lines = [l.strip() for l in mat28_text.split('\n') if re.match(r'^\d+\s+', l.strip())]
print("=== MATIUS 28 FINAL PROCESSED VERSES ===")
for l in lines:
    m = re.match(r'^(\d+)\s+(.+)', l)
    if m:
        vn = int(m.group(1))
        cl, mk = process_verse(m.group(2))
        print(f"[{vn}] {cl}")
