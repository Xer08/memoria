# 🎴 Memoria - Juego de Cartas PWA

Juego de memoria de cartas instalable (Progressive Web App) optimizado para dispositivos Android. Funciona 100% sin conexión a internet.

## 🎮 Características

- **3 niveles de dificultad**: Fácil (5 parejas), Intermedio (10 parejas), Difícil (20 parejas)
- **Sistema de vidas**: Comienzas con 5 vidas, pierdes 1 por cada error
- **Temática de emojis**: Cartas con emojis de la vida diaria (comidas, transportes, música, etc.)
- **Sistema de récords**: Guarda tus mejores tiempos por dificultad usando localStorage
- **100% Offline**: Funciona sin conexión a internet gracias al Service Worker
- **Instalable**: Instálalo como app nativa en Android
- **Animaciones 3D**: Efectos de volteo de cartas con CSS transforms
- **Responsive**: Optimizado para móviles Android

## 📁 Estructura de Archivos

```
memoria/
├── index.html      # Página principal del juego
├── styles.css      # Estilos con Grid/Flexbox y animaciones 3D
├── game.js         # Lógica del juego (comentarios detallados incluidos)
├── manifest.json    # Manifest de la PWA para instalación
├── sw.js           # Service Worker con estrategia Cache First
├── icon.png        # Icono de la aplicación
└── README.md       # Este archivo
```

## 🚀 Instalación

### 1. Servir los archivos

Para que el Service Worker funcione correctamente, necesitas servir los archivos a través de un servidor HTTP (no funciona con file://).

**Opción A: Usar Python**
```bash
python -m http.server 8000
```

**Opción B: Usar Node.js (http-server)**
```bash
npx http-server -p 8000
```

**Opción C: Usar VS Code Live Server**
- Instala la extensión "Live Server"
- Click derecho en index.html → "Open with Live Server"

### 2. Abrir en el navegador

Abre tu navegador y navega a `http://localhost:8000`

### 3. Instalar en Android

1. Abre Chrome en tu dispositivo Android
2. Navega a la URL donde está hospedado el juego
3. Verás un prompt "Añadir a pantalla de inicio" o haz click en el menú (⋮)
4. Selecciona "Instalar app" o "Añadir a pantalla de inicio"
5. La app aparecerá en tu pantalla de inicio como una app nativa

## 🎯 Cómo Jugar

1. **Selecciona dificultad**: Elige entre Fácil, Intermedio o Difícil
2. **Voltea cartas**: Toca una carta para voltearla
3. **Encuentra parejas**: Voltea dos cartas, si coinciden se quedan volteadas
4. **Gestiona tus vidas**: Tienes 5 vidas, pierdes 1 por cada error
5. **Gana**: Encuentra todas las parejas antes de perder todas tus vidas
6. **Récords**: Si ganas, tu tiempo se guardará si es el mejor de esa dificultad

## 💻 Tecnologías Utilizadas

- **HTML5**: Estructura semántica del juego
- **CSS3**: Grid/Flexbox para layout, animaciones 3D para volteo de cartas
- **Vanilla JavaScript**: Lógica del juego sin frameworks
- **Service Worker**: Cache First strategy para funcionalidad offline
- **localStorage**: Persistencia de récords localmente
- **PWA Manifest**: Instalación como app nativa

## 🔧 Configuración del Service Worker

El Service Worker (`sw.js`) implementa una estrategia **Cache First**:

1. **Install**: Pre-cachéa todos los archivos necesarios
2. **Activate**: Limpia caches antiguos
3. **Fetch**: 
   - Primero busca en cache (rápido, funciona offline)
   - Si no está en cache, busca en red
   - Si encuentra en red, lo guarda en cache
   - Si no hay red ni cache, retorna error

Para actualizar los archivos cacheados:
1. Cambia `CACHE_NAME` en `sw.js` (ej: `'memoria-game-v2'`)
2. El nuevo Service Worker se instalará con el nuevo cache
3. El cache antiguo se eliminará automáticamente

## 📱 Comentarios en el Código

- **game.js**: Comentarios detallados explicando cada función y el flujo del juego
- **sw.js**: Comentarios extensos explicando cómo funciona el Service Worker, la estrategia Cache First, y cómo se gestionan las peticiones sin internet

## 🎨 Personalización

### Cambiar emojis de las cartas

Edita el array `EMOJIS` en `game.js`:

```javascript
const EMOJIS = [
    '🍕', '🍔', '🍟', // Tus emojis personalizados
    // ... más emojis
];
```

### Cambiar colores

Edita las variables CSS en `styles.css`:

```css
:root {
    --primary-color: #1a1a2e;
    --accent-color: #e94560;
    // ... más variables
}
```

### Ajustar dificultades

Edita `DIFFICULTY_CONFIG` en `game.js`:

```javascript
const DIFFICULTY_CONFIG = {
    easy: { pairs: 5, gridClass: 'easy' },
    medium: { pairs: 10, gridClass: 'medium' },
    hard: { pairs: 20, gridClass: 'hard' }
};
```

## 🖼️ Iconos Necesarios

El `manifest.json` hace referencia a dos iconos que debes crear:

- **icon-192.png**: Icono de 192x192 píxeles
- **icon-512.png**: Icono de 512x512 píxeles

Puedes crear estos iconos usando:
- Herramientas online como favicon.io
- Software de diseño como GIMP, Photoshop, Canva
- Convertir una imagen PNG/JPG a estos tamaños

Coloca los iconos en la misma carpeta que los demás archivos.

## 🐛 Solución de Problemas

### El Service Worker no se instala

- Asegúrate de servir los archivos through HTTP (no file://)
- Verifica que la ruta a `sw.js` sea correcta en `game.js`
- Abre la consola del navegador para ver errores

### La app no funciona offline

- Verifica que el Service Worker esté activo en DevTools → Application → Service Workers
- Asegúrate de que todos los archivos estén listados en `ASSETS_TO_CACHE` en `sw.js`
- Recarga la página con el Service Worker activo

### Los iconos no aparecen

- Verifica que `icon-192.png` y `icon-512.png` existan en la carpeta
- Asegúrate de que sean imágenes PNG válidas
- Limpia el cache del navegador y recarga

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso personal y educativo.

## 👨‍💻 Aprendizaje

Este proyecto fue diseñado con comentarios detallados en `game.js` y `sw.js` para facilitar el aprendizaje de:
- Desarrollo de juegos con JavaScript
- Programación de Service Workers
- Estrategias de cache para PWAs
- Desarrollo offline-first
- Gestión de estado en aplicaciones web

¡Disfruta jugando y aprendiendo! 🎮
