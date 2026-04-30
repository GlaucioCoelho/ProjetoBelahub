const CACHE_NAME = 'belahub-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Instalar o service worker e fazer cache dos arquivos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Se alguns arquivos não conseguirem fazer cache, continua mesmo assim
        console.log('Alguns arquivos não conseguiram ser cacheados');
      });
    })
  );
  self.skipWaiting();
});

// Ativar o service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Estratégia de fetch: Network first, fall back to cache
self.addEventListener('fetch', (event) => {
  // Para requisições GET
  if (event.request.method === 'GET') {
    // Para API calls, sempre tenta network primeiro
    if (event.request.url.includes('/api/')) {
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            // Atualiza o cache se conseguir
            if (response && response.status === 200) {
              const cache = caches.open(CACHE_NAME);
              cache.then((c) => c.put(event.request, response.clone()));
            }
            return response;
          })
          .catch(() => {
            // Se falhar, tenta cache
            return caches.match(event.request);
          })
      );
    } else {
      // Para arquivos estáticos, usa cache first
      event.respondWith(
        caches.match(event.request).then((response) => {
          return (
            response ||
            fetch(event.request).then((response) => {
              if (response && response.status === 200) {
                const cache = caches.open(CACHE_NAME);
                cache.then((c) => c.put(event.request, response.clone()));
              }
              return response;
            })
          );
        })
      );
    }
  }
});

// Tratamento de mensagens
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
