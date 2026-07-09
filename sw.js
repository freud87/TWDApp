const CACHE_NAME = 'twd-app-v3';
const STATIC_ASSETS = [
  '/TWDApp/',
  '/TWDApp/index.html',
  '/TWDApp/manifest.json',
  '/TWDApp/sw.js',
  '/TWDApp/icon-192.png',
  '/TWDApp/icon-512.png',
  '/TWDApp/icon-maskable-512.png'
];

// Installation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cache ouvert');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Suppression:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stratégie de cache : Stale-While-Revalidate
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Mettre en cache la nouvelle version
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
            return networkResponse;
          })
          .catch(() => {
            // Si le réseau échoue, retourner la réponse en cache
            return cachedResponse;
          });

        // Retourner la réponse en cache ou la réponse réseau
        return cachedResponse || fetchPromise;
      })
  );
});
