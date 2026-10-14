import re, json

print("Building vocabulary from commentary in roti_hayat_full.txt...")
VALID_WORDS = set()
with open(r'd:\Magang\Baca\pdb\roti_hayat_full.txt', 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        if len(line) > 80 and not re.match(r'^\(?\d+', line):
            for w in re.findall(r'\b[a-z]{2,}\b', line.lower()):
                VALID_WORDS.add(w)

print(f"Loaded {len(VALID_WORDS)} clean Indonesian words.")

# Legitimate native words starting with a, b, c, d, e, f, g that must NEVER be stripped:
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
    'gunung', 'gurau', 'gurih', 'gurun', 'guru'
}

def clean_cross_refs_smart(txt):
    t = txt
    
    # 1. Lowercase letter before Capitalized word (e.g. aKelahiran, bMaria, cAllah, dYesus, eHerodes)
    t = re.sub(r'(?:^|(?<=[\s"\'\(\[\{“‘«„\—\–\:\u201c\u2018\ufffd]))[a-h]([A-Z][a-zA-Z\-]*)', r'\1', t)
    
    # 2. Lowercase letter before standard Indonesian affixes:
    # ber-, ter-, ke-, pem-, pen-, peng-, peny-, per-, se-
    affixes = r'(?:ber|ter|ke|pem|pen|peng|peny|per|se)'
    t = re.sub(r'(?:^|(?<=[\s"\'\(\[\{“‘«„\—\–\:\u201c\u2018\ufffd]))[a-h](' + affixes + r'[a-z]+(?:-[a-z]+)*)', r'\1', t)
    
    # 3. Lowercase letter before di- (passive verbs)
    def clean_di(m):
        full = m.group(1)
        if full.lower() in SAFE_WORDS:
            return full
        if full[0] in 'abcdefgh' and full[1:].startswith('di'):
            return full[1:]
        return full
    t = re.sub(r'(?:^|(?<=[\s"\'\(\[\{“‘«„\—\–\:\u201c\u2018\ufffd]))([a-h]di[a-z]+(?:-[a-z]+)*)\b', clean_di, t)
    
    # 4. Lowercase letter before me- / men- / mem- / meng- / meny- (active verbs)
    t = re.sub(r'(?:^|(?<=[\s"\'\(\[\{“‘«„\—\–\:\u201c\u2018\ufffd]))[a-h](me[a-z]+(?:-[a-z]+)*)\b', r'\1', t)
    
    # 5. Smart vocabulary clean:
    # For any word starting with [a-h] + rest:
    # If full is NOT in SAFE_WORDS, but rest IS in VALID_WORDS or SAFE_WORDS:
    def clean_vocab(m):
        w = m.group(1)
        w_lower = w.lower()
        if w_lower in SAFE_WORDS:
            return w
        ref = w[0]
        rest = w[1:]
        rest_lower = rest.lower()
        if rest_lower in SAFE_WORDS or rest_lower in VALID_WORDS:
            return rest
        return w

    t = re.sub(r'(?:^|(?<=[\s"\'\(\[\{“‘«„\—\–\:\u201c\u2018\ufffd]))([a-h][a-z]+(?:-[a-z]+)*)\b', clean_vocab, t)
    
    return t

print("\n--- Testing Matius 28:16-20 with smart cleaner ---")
sample_v16 = "16  Kesebelas murid itu berangkat ke aGalilea, ke 1bukit yang telah ditunjukkan Yesus kepada mereka."
sample_v19 = "19  1Karena itu, pergilah, 2jadikanlah semua abangsa murid-Ku dan 3baptislah mereka 4dalam 5nama 6Bapa dan Anak dan Roh Kudus,"
sample_v20 = "20   dan 1ajarlah mereka amelakukan segala sesuatu yang telah bKuperintahkan kepadamu. Ketahuilah, Aku 2cmenyertai kamu senantiasa sampai 3dkepada akhir zaman."

for s in [sample_v16, sample_v19, sample_v20]:
    print("RAW:  ", s)
    print("CLEAN:", clean_cross_refs_smart(s))
