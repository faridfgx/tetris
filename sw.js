// Simple service worker for local testing
self.addEventListener('install', function(event) {
    self.skipWaiting();
    console.log('Service Worker installed');
});

self.addEventListener('activate', function(event) {
    console.log('Service Worker activated');
});

self.addEventListener('fetch', function(event) {
    // Just pass through all requests - we're not doing caching for this simplified version
    event.respondWith(fetch(event.request));
});