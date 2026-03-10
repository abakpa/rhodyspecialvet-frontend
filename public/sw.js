const CACHE_NAME = 'rhody-vet-v1';
const STATIC_CACHE = 'rhody-vet-static-v1';
const DYNAMIC_CACHE = 'rhody-vet-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API requests - always go to network
  if (url.pathname.startsWith('/api')) {
    return;
  }

  // For navigation requests, try network first, then cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => cache.put(request, clonedResponse));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For static assets, try cache first, then network
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((response) => {
              const clonedResponse = response.clone();
              caches.open(STATIC_CACHE)
                .then((cache) => cache.put(request, clonedResponse));
              return response;
            });
        })
    );
    return;
  }

  // Default: network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clonedResponse = response.clone();
        caches.open(DYNAMIC_CACHE)
          .then((cache) => cache.put(request, clonedResponse));
        return response;
      })
      .catch(() => caches.match(request))
  );
});
