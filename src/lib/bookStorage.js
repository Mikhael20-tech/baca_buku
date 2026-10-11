// IndexedDB Helper untuk menyimpan berkas EPUB secara permanen di browser lokal
const DB_NAME = 'baca_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'book_files';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Menyimpan ArrayBuffer atau Blob buku ke IndexedDB
 * @param {string} bookId 
 * @param {ArrayBuffer|Blob} data 
 */
export async function saveBookToIndexedDB(bookId, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(data, bookId);

    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Mengambil ArrayBuffer buku dari IndexedDB
 * @param {string} bookId 
 * @returns {Promise<ArrayBuffer|null>}
 */
export async function getBookFromIndexedDB(bookId) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(bookId);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Gagal membaca dari IndexedDB:', err);
    return null;
  }
}

/**
 * Menghapus berkas buku dari IndexedDB
 * @param {string} bookId 
 */
export async function deleteBookFromIndexedDB(bookId) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(bookId);

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Gagal menghapus dari IndexedDB:', err);
  }
}
