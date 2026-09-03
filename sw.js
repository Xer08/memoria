```javascript
const CACHE_NAME = 'memoria-game-v2';

const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './game.js',
  './manifest.json',
  './icon.png'
];

// ============================================================
// INSTALACIÓN DEL SERVICE WORKER
// ============================================================
// Este evento se ejecuta cuando el navegador instala una nueva
// versión del Service Worker.
//
// Abrimos la caché "memoria-game-v2" y guardamos en ella los
// archivos principales de la aplicación.
//
// self.skipWaiting() indica que queremos que la nueva versión
// del Service Worker pase a la fase "activated" cuanto antes,
// sin esperar a que desaparezcan todas las pestañas antiguas.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});


// ============================================================
// ACTIVACIÓN DEL SERVICE WORKER
// ============================================================
// Este evento se ejecuta cuando el nuevo Service Worker pasa
// a estar activo.
//
// Primero obtenemos todos los nombres de caché existentes.
// Después eliminamos cualquier caché que NO corresponda a la
// versión actual.
//
// Esto es importante porque anteriormente utilizábamos:
//     memoria-game-v1
//
// Y ahora utilizamos:
//     memoria-game-v2
//
// Finalmente, self.clients.claim() hace que el nuevo Service
// Worker pueda controlar inmediatamente las páginas abiertas.
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


// ============================================================
// INTERCEPTAR PETICIONES DE RED
// ============================================================
// El evento "fetch" se ejecuta cada vez que la aplicación
// solicita un recurso mediante HTTP.
//
// Ejemplos:
//     index.html
//     styles.css
//     game.js
//     manifest.json
//     icon.png
//
// La estrategia utilizada aquí es:
//
//     NETWORK FIRST
//
// Es decir:
//
// 1. Intentamos obtener siempre la versión más reciente desde
//    Internet.
//
// 2. Si la petición funciona, guardamos esa versión en caché.
//
// 3. Si no hay Internet, utilizamos la copia almacenada.
//
// De esta manera conseguimos dos cosas:
//
//     ONLINE  -> versión actualizada
//     OFFLINE -> versión guardada
self.addEventListener('fetch', event => {
  const request = event.request;


  // ----------------------------------------------------------
  // Solo procesamos peticiones GET.
  // ----------------------------------------------------------
  // Las peticiones POST, PUT, DELETE, etc. no son interceptadas
  // por este Service Worker.
  if (request.method !== 'GET') return;


  // ----------------------------------------------------------
  // Obtenemos información sobre la URL solicitada.
  // ----------------------------------------------------------
  const url = new URL(request.url);


  // ----------------------------------------------------------
  // Solo interceptamos recursos del mismo dominio/origen.
  // ----------------------------------------------------------
  // Esto evita que nuestro Service Worker intente controlar
  // recursos externos, por ejemplo:
  //
  //     https://otro-sitio.com/archivo.js
  //
  // Solo trabajamos con los archivos pertenecientes a nuestra
  // aplicación.
  if (url.origin !== self.location.origin) return;


  // ----------------------------------------------------------
  // respondWith()
  // ----------------------------------------------------------
  // Le indicamos al navegador que nosotros vamos a decidir qué
  // respuesta devolver para esta petición.
  event.respondWith(

    // ========================================================
    // PRIMER INTENTO: INTERNET
    // ========================================================
    // "cache: no-cache" obliga al navegador a comprobar si existe
    // una versión más reciente del recurso.
    fetch(request, { cache: 'no-cache' })

      .then(response => {

        // ----------------------------------------------------
        // Si la respuesta es correcta, la guardamos en caché.
        // ----------------------------------------------------
        //
        // response es un objeto que solo puede consumirse una
        // vez. Por eso hacemos una copia con clone().
        //
        // La respuesta original se devuelve al navegador y la
        // copia se guarda en la caché.
        if (response && response.ok) {

          const responseClone = response.clone();


          // --------------------------------------------------
          // event.waitUntil()
          // --------------------------------------------------
          // Le decimos al navegador que espere a que termine
          // la operación de actualización de la caché.
          event.waitUntil(
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseClone))
          );
        }


        // ----------------------------------------------------
        // Devolvemos al navegador la versión obtenida de red.
        // ----------------------------------------------------
        return response;
      })


      // ======================================================
      // SEGUNDO INTENTO: CACHÉ
      // ======================================================
      // Si fetch() falla, normalmente significa que no tenemos
      // conexión a Internet.
      //
      // En ese caso buscamos el recurso en nuestra caché.
      .catch(() => {

        return caches.match(request).then(cachedResponse => {

          // --------------------------------------------------
          // Si encontramos el archivo en caché, lo devolvemos.
          // --------------------------------------------------
          if (cachedResponse) {
            return cachedResponse;
          }


          // --------------------------------------------------
          // ÚLTIMO RECURSO PARA LAS NAVEGACIONES
          // --------------------------------------------------
          // Si el usuario está intentando abrir una página y
          // esa página no está disponible directamente, usamos
          // index.html como página de respaldo.
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }


          // --------------------------------------------------
          // Si tampoco tenemos el recurso almacenado, devolvemos
          // un error HTTP 503 indicando que no está disponible
          // sin conexión.
          // --------------------------------------------------
          return new Response(
            'Recurso no disponible sin conexión.',
            {
              status: 503,
              statusText: 'Service Unavailable',

              headers: {
                'Content-Type': 'text/plain; charset=utf-8'
              }
            }
          );
        });
      })
  );
});


// ============================================================
// COMUNICACIÓN ENTRE LA PÁGINA Y EL SERVICE WORKER
// ============================================================
// El Service Worker puede recibir mensajes enviados desde
// JavaScript mediante:
//
//     navigator.serviceWorker.controller.postMessage(...)
//
// En nuestro caso soportamos dos mensajes:
//
//     skipWaiting
//     clearCache
self.addEventListener('message', event => {

  // Si no recibimos ningún dato, no hacemos nada.
  if (!event.data) return;


  // ----------------------------------------------------------
  // FORZAR ACTIVACIÓN
  // ----------------------------------------------------------
  // Permite pedirle al Service Worker que se active
  // inmediatamente.
  if (event.data.type === 'skipWaiting') {
    self.skipWaiting();
  }


  // ----------------------------------------------------------
  // LIMPIAR TODA LA CACHÉ
  // ----------------------------------------------------------
  // Borra todas las cachés disponibles.
  //
  // Esto puede resultar útil durante pruebas o cuando queremos
  // forzar una limpieza completa de los archivos almacenados.
  if (event.data.type === 'clearCache') {

    event.waitUntil(
      caches.keys().then(keys =>
        Promise.all(
          keys.map(key => caches.delete(key))
        )
      )
    );
  }
});


// ============================================================
// MANEJO DE ERRORES
// ============================================================
// Estos eventos no son necesarios para que el Service Worker
// funcione, pero ayudan durante el desarrollo y la depuración.
//
// Si ocurre un error JavaScript dentro del Service Worker,
// aparecerá información en la consola del navegador.
self.addEventListener('error', event => {

  console.error(
    '[Memoria SW] Error:',
    event.error || event.message
  );
});


// ============================================================
// PROMESAS RECHAZADAS
// ============================================================
// Captura promesas que hayan fallado y no hayan sido manejadas
// correctamente.
self.addEventListener('unhandledrejection', event => {

  console.error(
    '[Memoria SW] Promesa rechazada:',
    event.reason
  );
});
```
