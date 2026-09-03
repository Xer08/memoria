const CACHE_NAME = 'memoria-game-v2';

const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './game.js',
  './manifest.json',
  './icon.png'
];

// Instala la nueva versión y precarga los archivos principales.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Activa la nueva versión y elimina cachés antiguos.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Estrategia Network First:
// - Si hay Internet, siempre intenta obtener la versión actual.
// - Guarda la respuesta en caché para poder usarla sin conexión.
// - Si no hay Internet, usa la versión guardada.
self.addEventListener('fetch', event => {
  const request = event.request;

  // Solo procesamos peticiones GET.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Solo procesamos recursos del mismo origen.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request, { cache: 'no-cache' })
      .then(response => {
        if (response && response.ok) {
          const responseClone = response.clone();

          event.waitUntil(
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseClone))
          );
        }

        return response;
      })
      .catch(() => {
        return caches.match(request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Para navegaciones, intenta cargar index.html como último recurso.
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }

          return new Response('Recurso no disponible sin conexión.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {
              'Content-Type': 'text/plain; charset=utf-8'
            }
          });
        });
      })
  );
});

// Permite forzar la activación o limpiar la caché desde la aplicación.
self.addEventListener('message', event => {
  if (!event.data) return;

  if (event.data.type === 'skipWaiting') {
    self.skipWaiting();
  }

  if (event.data.type === 'clearCache') {
    event.waitUntil(
      caches.keys().then(keys =>
        Promise.all(keys.map(key => caches.delete(key)))
      )
    );
  }
});

// Evita que un error inesperado detenga silenciosamente el Service Worker.
self.addEventListener('error', event => {
  console.error('[Memoria SW] Error:', event.error || event.message);
});

self.addEventListener('unhandledrejection', event => {
  console.error('[Memoria SW] Promesa rechazada:', event.reason);
});