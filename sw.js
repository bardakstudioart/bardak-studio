// Minimal service worker - required for PWA/APK
// Does NOT cache Firebase or app data to avoid login issues

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  self.clients.claim();
});

// Pass ALL requests through to network - no caching
self.addEventListener('fetch', function(e) {
  e.respondWith(fetch(e.request));
});
