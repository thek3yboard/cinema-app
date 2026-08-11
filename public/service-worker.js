const CACHE_NAME = 'cinema-static-v3';
const IS_DEVELOPMENT = ['localhost', '127.0.0.1', '::1'].includes(self.location.hostname);
const STATIC_ASSETS = [
  '/favicon.ico',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/fallback-portrait.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isStaticAsset = url.origin === self.location.origin
    && (
      STATIC_ASSETS.includes(url.pathname)
      // Next development chunks change between hot reloads. Caching them can
      // combine old client code with fresh server HTML and break hydration.
      || (!IS_DEVELOPMENT && url.pathname.startsWith('/_next/static/'))
    );

  // Never cache navigations, auth callbacks, RSC payloads or API responses.
  if (!isStaticAsset) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((response) => {
        if (response.ok) {
          const responseToCache = response.clone();
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache))
          );
        }
        return response;
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
