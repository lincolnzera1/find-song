const CACHE_NAME = 'letras-musica-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css', 
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Instalar Service Worker e cachear recursos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll([
          '/',
          '/manifest.json'
        ]);
      })
  );
});

// Ativar Service Worker e limpar caches antigos  
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
    })
  );
});

// Interceptar requisições e servir do cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se está no cache, retorna do cache
        if (response) {
          return response;
        }

        // Se não está no cache, busca da rede
        return fetch(event.request).then((response) => {
          // Verifica se a resposta é válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clona a resposta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Se falhar e for uma navegação, retorna a página offline
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// Mostrar notificação quando o app for instalado
self.addEventListener('beforeinstallprompt', (event) => {
  console.log('PWA pode ser instalado');
});