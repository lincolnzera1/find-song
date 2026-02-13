const CACHE_NAME = 'letras-musica-v1';

// Instalar Service Worker
globalThis.addEventListener('install', (event) => {
  console.log('Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache criado');
      return cache.addAll(['/']);
    })
  );
  globalThis.skipWaiting();
});

// Ativar Service Worker  
globalThis.addEventListener('activate', (event) => {
  console.log('Service Worker ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  globalThis.clients.claim();
});

// Interceptar requisições
globalThis.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    }).catch(() => {
      return caches.match('/');
    })
  );
});