const CACHE_NAME = 'bardak-v1';
const STATIC_ASSETS = [
  '/bardak-studio/',
  '/bardak-studio/index.html',
  '/bardak-studio/manifest.json',
  '/bardak-studio/icon-192.png',
  '/bardak-studio/icon-512.png',
];

// Install — cache static assets
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS).catch(function(err) {
        console.log('Cache error (ok):', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', function(e) {
  // Skip Firebase and external requests — always network
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('gstatic') ||
      e.request.url.includes('railway.app') ||
      e.request.url.includes('telegram') ||
      e.request.method !== 'GET') {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(function(response) {
        // Cache fresh response
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
        return response;
      })
      .catch(function() {
        // Offline — try cache
        return caches.match(e.request).then(function(cached) {
          return cached || caches.match('/bardak-studio/');
        });
      })
  );
});
