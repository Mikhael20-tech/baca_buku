// Lightweight Service Worker for Baca App (Offline & PWA Support)
const CACHE_NAME = 'baca-cache-v8';
const CORE_URLS = [
  '/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/bible/books.json',
  '/bible/en/books.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_URLS).catch((err) => {
        console.warn('PWA core cache warmup error:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Purging old PWA cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // For API or supabase or foreign protocols, skip
  if (!url.protocol.startsWith('http')) return;

  // Network-first with fallback to cache for HTML navigation/documents
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match(event.request);
        })
    );
    return;
  }

  // Stale-while-revalidate for Bible, Kidung, Covers, and static assets
  if (
    url.pathname.startsWith('/bible/') || 
    url.pathname.startsWith('/kidung/') || 
    url.pathname.startsWith('/covers/') || 
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Default: Cache first, fallback to network
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
