// const CACHE_NAME = 'notes-app-v1';
// const BASE_PATH = '/phrasesnap/';
// const urlsToCache = [
//   BASE_PATH,
//   BASE_PATH + 'favicon.svg',
//   BASE_PATH + 'manifest.json'
// ];

// // Install event - cache resources
// self.addEventListener('install', event => {
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then(cache => {
//         return cache.addAll(urlsToCache);
//       })
//   );
//   self.skipWaiting();
// });

// // Fetch event - serve from cache if available, handle navigation
// self.addEventListener('fetch', event => {
//   // Handle navigation requests - serve from cache first to prevent reloads
//   if (event.request.mode === 'navigate') {
//     event.respondWith(
//       caches.match(BASE_PATH)
//         .then(response => {
//           // Return cached version if available, otherwise fetch from network
//           return response || fetch(event.request).catch(() => {
//             // If both cache and network fail, return cached index
//             return caches.match(BASE_PATH) || caches.match('/');
//           });
//         })
//     );
//     return;
//   }

//   // For other requests, try cache first, then network
//   event.respondWith(
//     caches.match(event.request)
//       .then(response => {
//         // Return cached version or fetch from network
//         return response || fetch(event.request);
//       })
//   );
// });

// // Message event - handle skip waiting
// self.addEventListener('message', event => {
//   if (event.data && event.data.type === 'SKIP_WAITING') {
//     self.skipWaiting();
//   }
// });

// // Activate event - clean up old caches and claim clients
// self.addEventListener('activate', event => {
//   event.waitUntil(
//     Promise.all([
//       // Clean up old caches
//       caches.keys().then(cacheNames => {
//         return Promise.all(
//           cacheNames.map(cacheName => {
//             if (cacheName !== CACHE_NAME) {
//               return caches.delete(cacheName);
//             }
//           })
//         );
//       }),
//       // Take control of all open clients
//       self.clients.claim()
//     ])
//   );
// });