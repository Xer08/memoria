// ============================================
// SERVICE WORKER - CACHE FIRST STRATEGY
// ============================================
// Este Service Worker implementa una estrategia de "Cache First"
// para garantizar que el juego funcione 100% sin conexión a internet.
//
// ¿CÓMO FUNCIONA EL SERVICE WORKER?
// ============================================
// Un Service Worker es un script que el navegador ejecuta en segundo plano,
// separado de la página web. Actúa como un proxy de red interceptando
// las peticiones HTTP que hace la aplicación.
//
// CICLO DE VIDA DEL SERVICE WORKER:
// 1. INSTALL: El Service Worker se descarga y se instala
// 2. ACTIVATE: El Service Worker se activa y toma el control
// 3. FETCH: Intercepta todas las peticiones de red de la aplicación
//
// ESTRATEGIA CACHE FIRST:
// ========================
// Esta estrategia prioriza el cache sobre la red:
// 1. Cuando se solicita un recurso, primero buscamos en el cache
// 2. Si el recurso está en cache, lo retornamos inmediatamente (muy rápido)
// 3. Si no está en cache, lo buscamos en la red
// 4. Si lo encontramos en la red, lo guardamos en cache para futuras peticiones
// 5. Si no está en la red ni en cache, retornamos un error
//
// VENTAJAS DE CACHE FIRST:
// - Carga instantánea de recursos ya cacheados
// - Funciona sin conexión a internet (offline-first)
// - Reduce el consumo de datos móviles
// - Mejora el rendimiento general de la aplicación
//
// DESVENTAJAS:
// - Los usuarios podrían ver contenido antiguo si no hay conexión
// - Requiere actualización manual del cache para ver cambios nuevos

// ============================================
// CONFIGURACIÓN DEL CACHE
// ============================================

// Nombre del cache - Usamos versión para forzar actualizaciones
const CACHE_NAME = 'memoria-game-v1';

// Lista de recursos a cachear durante la instalación
// Estos son todos los archivos necesarios para que el juego funcione offline
const ASSETS_TO_CACHE = [
    './',                    // Directorio raíz
    './index.html',          // Página principal
    './styles.css',          // Hoja de estilos
    './game.js',             // Lógica del juego
    './manifest.json',       // Manifest de la PWA
    './icon.png'             // Icono de la aplicación
];

// ============================================
// EVENTO: INSTALL
// ============================================
// Este evento se dispara cuando el Service Worker se instala por primera vez.
// Aquí pre-cachemos todos los recursos necesarios para el juego.
//
// ¿POR QUÉ PRE-CACHEAR?
// Cuando el Service Worker se instala, aprovechamos para descargar todos
// los archivos necesarios y guardarlos en el cache. Así, cuando el usuario
// abra la aplicación sin internet, todos los archivos ya estarán disponibles.
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker: Instalando...');
    
    // waitUntil() le dice al navegador que espere a que el cache se complete
    // antes de considerar la instalación como exitosa
    event.waitUntil(
        // Abrimos el cache con el nombre especificado
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Cache abierto, añadiendo archivos...');
                
                // Añadimos todos los archivos al cache
                // addAll() intenta descargar todos los recursos y falla si alguno no se puede descargar
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('✅ Service Worker: Todos los archivos cacheados correctamente');
                
                // skipWaiting() fuerza al Service Worker a activarse inmediatamente
                // en lugar de esperar a que todas las pestañas se cierren
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker: Error durante la instalación:', error);
            })
    );
});

// ============================================
// EVENTO: ACTIVATE
// ============================================
// Este evento se dispara cuando el Service Worker se activa.
// Aquí limpiamos caches antiguos para no ocupar espacio innecesario.
//
// ¿POR QUÉ LIMPIAR CACHES ANTIGUOS?
// Cada vez que actualizamos la versión del cache (CACHE_NAME),
// los caches antiguos quedan obsoletos. Los eliminamos para:
// 1. No ocupar espacio de almacenamiento del usuario
// 2. Evitar conflictos con versiones antiguas de archivos
// 3. Garantizar que siempre se use la versión más reciente
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activando...');
    
    event.waitUntil(
        // Obtenemos todos los nombres de caches existentes
        caches.keys()
            .then((cacheNames) => {
                console.log('🔍 Service Worker: Limpiando caches antiguos...');
                
                // Filtramos para encontrar caches que no coinciden con el nombre actual
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Si el nombre del cache no coincide con el actual, lo eliminamos
                        if (cacheName !== CACHE_NAME) {
                            console.log('🗑️ Service Worker: Eliminando cache antiguo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Caches antiguos eliminados');
                
                // claim() le dice al Service Worker que tome el control
                // inmediatamente de todas las páginas bajo su scope
                return self.clients.claim();
            })
            .catch((error) => {
                console.error('❌ Service Worker: Error durante la activación:', error);
            })
    );
});

// ============================================
// EVENTO: FETCH
// ============================================
// Este evento se dispara cada vez que la aplicación hace una petición de red.
// Aquí implementamos la estrategia "Cache First".
//
// FLUJO DE CACHE FIRST:
// 1. El navegador solicita un recurso (ej: index.html, styles.css)
// 2. El Service Worker intercepta la petición
// 3. Primero buscamos el recurso en el cache
// 4. Si está en cache → Lo retornamos (respuesta rápida, sin red)
// 5. Si no está en cache → Lo buscamos en la red
// 6. Si está en red → Lo guardamos en cache y lo retornamos
// 7. Si no está en red → Retornamos error offline
//
// ¿POR QUÉ ESTA ESTRATEGIA PARA UN JUEGO?
// - Los archivos del juego (HTML, CSS, JS) no cambian frecuentemente
// - Priorizamos la velocidad de carga sobre tener la última versión
// - Queremos que el juego funcione sin conexión
// - El usuario prefiere jugar rápido aunque sea una versión ligeramente antigua
self.addEventListener('fetch', (event) => {
    console.log('🌐 Service Worker: Interceptando petición:', event.request.url);
    
    // respondWith() nos permite proporcionar una respuesta personalizada
    // en lugar de dejar que el navegador maneje la petición normalmente
    event.respondWith(
        // Primero buscamos en el cache
        caches.match(event.request)
            .then((cachedResponse) => {
                // Si encontramos el recurso en cache
                if (cachedResponse) {
                    console.log('✅ Service Worker: Recurso encontrado en cache:', event.request.url);
                    
                    // Retornamos la respuesta del cache inmediatamente
                    // Esto es muy rápido porque no hay espera de red
                    return cachedResponse;
                }
                
                // Si no está en cache, buscamos en la red
                console.log('🌐 Service Worker: Recurso no en cache, buscando en red:', event.request.url);
                
                // Hacemos la petición a la red
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Verificamos que la respuesta sea válida
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            console.log('⚠️ Service Worker: Respuesta de red no válida, retornando sin cachear');
                            return networkResponse;
                        }
                        
                        // Clonamos la respuesta porque las respuestas solo pueden usarse una vez
                        // Una para el usuario, otra para el cache
                        const responseToCache = networkResponse.clone();
                        
                        // Abrimos el cache y guardamos la respuesta
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                console.log('💾 Service Worker: Guardando en cache:', event.request.url);
                                cache.put(event.request, responseToCache);
                            });
                        
                        // Retornamos la respuesta de la red al usuario
                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('❌ Service Worker: Error de red:', error);
                        
                        // Si estamos offline y el recurso no está en cache
                        // podríamos retornar una página de error offline personalizada
                        // Para este juego simple, retornamos el error
                        throw error;
                    });
            })
            .catch((error) => {
                console.error('❌ Service Worker: Error general en fetch:', error);
                throw error;
            })
    );
});

// ============================================
// EVENTO: MESSAGE
// ============================================
// Este evento permite comunicación entre la aplicación y el Service Worker.
// Útil para acciones manuales como limpiar el cache o forzar actualizaciones.
//
// ¿CÓMO USAR ESTE EVENTO?
// Desde la aplicación podemos enviar mensajes al Service Worker:
// navigator.serviceWorker.controller.postMessage({
//   action: 'skipWaiting'
// });
self.addEventListener('message', (event) => {
    console.log('📨 Service Worker: Mensaje recibido:', event.data);
    
    if (event.data && event.data.action === 'skipWaiting') {
        console.log('⏭️ Service Worker: Saltando espera...');
        self.skipWaiting();
    }
    
    if (event.data && event.data.action === 'clearCache') {
        console.log('🗑️ Service Worker: Limpiando cache...');
        caches.delete(CACHE_NAME).then(() => {
            console.log('✅ Service Worker: Cache eliminado');
        });
    }
});

// ============================================
// FIN DEL SERVICE WORKER
// ============================================
//
// RESUMEN DEL FUNCIONAMIENTO OFFLINE:
// ============================================
// 1. INSTALACIÓN: El Service Worker descarga y cachea todos los archivos
// 2. ACTIVACIÓN: El Service Worker toma control de la aplicación
// 3. PETICIONES: Cada petición se maneja con estrategia Cache First
// 4. OFFLINE: Si no hay red, los archivos se sirven desde cache
// 5. ONLINE: Si hay red, los archivos se actualizan en cache
//
// ESTADO DE PETICIONES SIN INTERNET:
// ============================================
// Cuando el dispositivo no tiene conexión a internet:
//
// - El Service Worker sigue interceptando las peticiones
// - caches.match() busca en el cache local
// - Si el recurso está cacheado → Se sirve inmediatamente
// - Si no está cacheado → fetch() falla (sin conexión)
// - La aplicación sigue funcionando con recursos cacheados
//
// Para este juego de memoria:
// - index.html, styles.css, game.js están siempre cacheados
// - El usuario puede jugar sin conexión
// - Los récords se guardan en localStorage (funciona offline)
// - La única limitación es que no se pueden actualizar archivos
//
// ACTUALIZACIÓN DEL CACHE:
// ============================================
// Para actualizar los archivos cacheados:
// 1. Cambiar CACHE_NAME (ej: 'memoria-game-v2')
// 2. El nuevo Service Worker se instala con nuevo cache
// 3. El evento activate elimina el cache antiguo
// 4. Los usuarios obtienen la nueva versión
//
// Esto garantiza que los usuarios siempre tengan la versión más reciente
// cuando tengan conexión, pero puedan seguir jugando offline con la versión
// que tengan cacheada.
