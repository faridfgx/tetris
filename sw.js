const CACHE_NAME = 'tetris-game-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './tetris.js',
  './manifest.json',
  './pwa-install.js',
  './scoreline.wav',
  './rotate.wav',
  './gameover.wav',
  './favicon.png',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png'
];

// Install event - cache all required assets
self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell and assets');
        return cache.addAll(ASSETS);
      })
      .catch(error => {
        console.error('Error during cache.addAll():', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(keyList.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
  );
  
  return self.clients.claim();
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return the cached response if found
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response since we're going to use it in two places
            const responseToCache = response.clone();
            
            // Open the cache and store the new response
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.log('Fetch failed:', error);
            // You could return a custom offline page here
          });
      })
  );
});