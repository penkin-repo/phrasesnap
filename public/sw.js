const CACHE_NAME = 'phrasesnap-v1';

// Убираем BASE_PATH - SW сам знает свой контекст
const urlsToCache = [
  '/', // главная страница
  '/manifest.json',
  '/favicon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // 1. API запросы к Supabase - сеть с кэшированием
  if (url.href.includes('supabase.co')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            // Кэшируем успешные ответы
            if (response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Оффлайн: пытаемся взять из кэша
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  // 2. Навигация - кэш сначала
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/')
        .then(response => response || fetch(event.request))
    );
    return;
  }

  // 3. Статические ресурсы Astro - кэш сначала
  if (url.pathname.includes('_astro')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
    return;
  }

  // 4. Остальное - сеть сначала
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});

// Сообщения и активация - оставляем как было
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => 
        Promise.all(cacheNames.map(cacheName => 
          cacheName !== CACHE_NAME ? caches.delete(cacheName) : null
        ))
      ),
      self.clients.claim()
    ])
  );
});