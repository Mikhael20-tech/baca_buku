// Penyimpanan Catatan Renungan & Sorotan (Highlight) Firman Pengguna
export const INITIAL_NOTES = [
  {
    id: 'note-1',
    book_title: 'Injil Yohanes',
    reference: 'Yohanes 1:1, 4',
    highlighted_text: 'Pada mulanya adalah Firman; Firman itu bersama-sama dengan Allah dan Firman itu adalah Allah... Di dalam Dia ada hidup dan hidup itu adalah terang manusia.',
    note: 'Hayat (Zoe) adalah Allah sendiri yang masuk menjadi terang kita di dalam roh manusia. Bukan sekadar huruf luar.',
    color: 'amber', // 'amber' | 'emerald' | 'blue' | 'purple'
    created_at: '2026-10-12'
  },
  {
    id: 'note-2',
    book_title: 'FKKP Minggu 1',
    reference: 'Yohanes 6:57',
    highlighted_text: 'Sama seperti Bapa yang hidup mengutus Aku dan Aku hidup oleh Bapa, demikian juga barangsiapa yang memakan Aku, ia pun akan hidup oleh Aku.',
    note: 'Memakan Kristus secara organik melalui doa-makan firman setiap fajar adalah rahasia hidup orang beriman.',
    color: 'emerald',
    created_at: '2026-10-13'
  },
  {
    id: 'note-3',
    book_title: 'Buku Karakter Seri 1: Benar',
    reference: 'Pelajaran 1: Definisi Benar',
    highlighted_text: 'Karakter adalah gabungan antara tabiat alami yang telah didisiplin oleh Roh Kudus dengan kebiasaan rohani yang dibina secara konsisten.',
    note: 'Karakter adalah bejana bagi hayat. Latihan praktis: tidak berdusta dan tepat waktu dalam janji.',
    color: 'blue',
    created_at: '2026-10-14'
  }
];

export function getStoredNotes() {
  try {
    const data = localStorage.getItem('baca_user_notes');
    if (data) {
      return JSON.parse(data);
    }
    localStorage.setItem('baca_user_notes', JSON.stringify(INITIAL_NOTES));
    return INITIAL_NOTES;
  } catch (e) {
    return INITIAL_NOTES;
  }
}

export function saveStoredNotes(notes) {
  try {
    localStorage.setItem('baca_user_notes', JSON.stringify(notes));
  } catch (e) {
    console.error('Gagal menyimpan catatan', e);
  }
}

export function addNote(noteData) {
  const current = getStoredNotes();
  const newNote = {
    id: 'note-' + Date.now(),
    book_title: noteData.book_title || 'Alkitab Versi Pemulihan',
    reference: noteData.reference || 'Catatan Pribadi',
    highlighted_text: noteData.highlighted_text || '',
    note: noteData.note || '',
    color: noteData.color || 'amber',
    created_at: new Date().toISOString().split('T')[0]
  };
  const updated = [newNote, ...current];
  saveStoredNotes(updated);
  return updated;
}

export function updateNote(id, updatedFields) {
  const current = getStoredNotes();
  const updated = current.map(n => n.id === id ? { ...n, ...updatedFields } : n);
  saveStoredNotes(updated);
  return updated;
}

export function deleteNote(id) {
  const current = getStoredNotes();
  const updated = current.filter(n => n.id !== id);
  saveStoredNotes(updated);
  return updated;
}
