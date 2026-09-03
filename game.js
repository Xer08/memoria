// ============================================
// JUEGO DE MEMORIA - LÓGICA PRINCIPAL
// ============================================
// Este archivo contiene toda la lógica del juego de memoria,
// incluyendo la gestión del estado, el sistema de récords,
// y la interacción con el DOM.

// ============================================
// SISTEMA DE AUDIO (Web Audio API)
// ============================================

/**
 * Contexto de audio para generar sonidos sintéticos
 * No requiere archivos externos, funciona offline
 */
let audioContext = null;

/**
 * Inicializa el contexto de audio
 * Debe llamarse después de una interacción del usuario (click, touch)
 */
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('🔊 Contexto de audio inicializado');
    }
    
    // Reanudar si está suspendido (requerido por algunos navegadores)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

/**
 * Reproduce un sonido al voltear una carta
 * Sonido breve tipo "whoosh" o "flip"
 */
function playFlipSound() {
    if (!audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Configurar oscilador para sonido de flip
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
        
        // Configurar ganancia para volumen
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        
        // Conectar nodos
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Reproducir
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
        
        console.log('🔊 Sonido de flip reproducido');
    } catch (error) {
        console.error('Error al reproducir sonido de flip:', error);
    }
}

/**
 * Reproduce un sonido de error al no encontrar pareja
 * Sonido tipo "ding" o "chime" suave
 */
function playMismatchSound() {
    if (!audioContext) return;
    
    try {
        // Primer tono (campana principal)
        const oscillator1 = audioContext.createOscillator();
        const gainNode1 = audioContext.createGain();
        
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(880, audioContext.currentTime); // A5
        oscillator1.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.5);
        
        gainNode1.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
        
        oscillator1.connect(gainNode1);
        gainNode1.connect(audioContext.destination);
        
        oscillator1.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + 0.6);
        
        // Segundo tono (armónico para efecto de campana)
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(1760, audioContext.currentTime); // A6
        oscillator2.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.4);
        
        gainNode2.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.5);
        
        console.log('🔊 Sonido de error reproducido');
    } catch (error) {
        console.error('Error al reproducir sonido de error:', error);
    }
}

/**
 * Reproduce un sonido animado al encontrar una pareja correcta
 * Sonido tipo arpegio ascendente celebratorio
 */
function playMatchSound() {
    if (!audioContext) return;
    
    try {
        // Secuencia de notas ascendentes (arpegio)
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (acorde de C mayor)
        const durations = [0.1, 0.1, 0.1, 0.2]; // Duración de cada nota
        
        notes.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.08);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.08);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + index * 0.08 + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.08 + durations[index]);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(audioContext.currentTime + index * 0.08);
            oscillator.stop(audioContext.currentTime + index * 0.08 + durations[index]);
        });
        
        console.log('🔊 Sonido de celebración reproducido');
    } catch (error) {
        console.error('Error al reproducir sonido de celebración:', error);
    }
}

/**
 * Reproduce un sonido de fanfarria de victoria
 * Sonido tipo "ta-da-ta-da" ascendente y triunfante
 */
function playVictorySound() {
    if (!audioContext) return;
    
    try {
        // Fanfarria: notas ascendentes con énfasis
        const fanfare = [
            { freq: 392.00, start: 0.0, duration: 0.15 },  // G4
            { freq: 523.25, start: 0.15, duration: 0.15 }, // C5
            { freq: 659.25, start: 0.30, duration: 0.15 }, // E5
            { freq: 783.99, start: 0.45, duration: 0.20 }, // G5
            { freq: 1046.50, start: 0.65, duration: 0.40 } // C6 (nota final larga)
        ];
        
        fanfare.forEach(note => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime + note.start);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime + note.start);
            gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + note.start + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.start + note.duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(audioContext.currentTime + note.start);
            oscillator.stop(audioContext.currentTime + note.start + note.duration);
        });
        
        console.log('🔊 Sonido de victoria reproducido');
    } catch (error) {
        console.error('Error al reproducir sonido de victoria:', error);
    }
}

/**
 * Reproduce un sonido de derrota
 * Sonido tipo "wah-wah-wah" descendente triste
 */
function playDefeatSound() {
    if (!audioContext) return;
    
    try {
        // Secuencia descendente triste
        const defeatNotes = [
            { freq: 523.25, start: 0.0, duration: 0.2 },  // C5
            { freq: 493.88, start: 0.2, duration: 0.2 }, // B4
            { freq: 440.00, start: 0.4, duration: 0.2 },  // A4
            { freq: 392.00, start: 0.6, duration: 0.3 },  // G4
            { freq: 349.23, start: 0.8, duration: 0.4 }   // F4 (nota final larga)
        ];
        
        defeatNotes.forEach(note => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime + note.start);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime + note.start);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + note.start + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.start + note.duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(audioContext.currentTime + note.start);
            oscillator.stop(audioContext.currentTime + note.start + note.duration);
        });
        
        console.log('🔊 Sonido de derrota reproducido');
    } catch (error) {
        console.error('Error al reproducir sonido de derrota:', error);
    }
}

// ============================================
// CONFIGURACIÓN DEL JUEGO
// ============================================

// Emojis de la vida diaria para las cartas
// Se usarán aleatoriamente en cada partida
const EMOJIS = [
    '🍕', '🍔', '🍟', '🌭', '🍿', '🧁', '🍩', '🍪',
    '🚗', '🚕', '🚌', '🚎', '🏎️', '🚂', '✈️', '🚀',
    '🎸', '🎹', '🎺', '🎻', '🥁', '🎤', '🎧', '📻',
    '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱',
    '🌞', '🌙', '⭐', '☀️', '🌈', '⚡', '❄️', '🔥',
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🥝', '🍌',
    '💻', '📱', '⌚', '🖥️', '📷', '📸', '📺', '📻'
];

// Configuración de dificultades
// pairs: número de parejas de cartas
// gridClass: clase CSS para el grid correspondiente
// timeLimit: límite de tiempo en segundos (solo para contrareloj)
const DIFFICULTY_CONFIG = {
    easy: { pairs: 5, gridClass: 'easy' },
    medium: { pairs: 10, gridClass: 'medium' },
    hard: { pairs: 20, gridClass: 'hard' },
    timetrial: { pairs: 20, gridClass: 'hard', timeLimit: 60 }
};

// ============================================
// ESTADO DEL JUEGO
// ============================================

// Variables globales para mantener el estado del juego
let gameState = {
    currentDifficulty: null,  // Dificultad actual: 'easy', 'medium', 'hard', 'timetrial'
    cards: [],                // Array de cartas del juego
    flippedCards: [],         // Cartas actualmente volteadas (máximo 2)
    matchedPairs: 0,          // Número de parejas encontradas
    totalPairs: 0,            // Total de parejas a encontrar
    lives: 5,                 // Vidas restantes del jugador
    timer: 0,                 // Tiempo transcurrido en segundos (modo normal) o restante (contrareloj)
    timerInterval: null,      // Referencia al intervalo del temporizador
    isLocked: false,          // Bloqueo para evitar clics durante animaciones
    gameStarted: false,       // Indica si el juego ha comenzado
    isTimeTrial: false,       // Indica si es modo contrareloj
    score: 0                  // Puntaje en modo contrareloj
};

// ============================================
// ELEMENTOS DEL DOM
// ============================================

// Referencias a los elementos del DOM que usaremos frecuentemente
// Se inicializan después de que el DOM esté cargado
let elements = {};

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializa las referencias a los elementos del DOM
 * Debe llamarse después de que el DOM esté completamente cargado
 */
function initializeElements() {
    console.log('🔗 Inicializando referencias al DOM...');
    
    elements = {
        // Pantallas
        menuScreen: document.getElementById('menu-screen'),
        gameScreen: document.getElementById('game-screen'),
        gameoverScreen: document.getElementById('gameover-screen'),
        victoryScreen: document.getElementById('victory-screen'),
        
        // Elementos del juego
        gameBoard: document.getElementById('game-board'),
        timer: document.getElementById('timer'),
        lives: document.getElementById('lives'),
        
        // Botones del menú
        difficultyButtons: document.querySelectorAll('.difficulty-btn'),
        
        // Botones de navegación
        backBtn: document.getElementById('back-btn'),
        
        // Botones de game over
        gameoverRestart: document.getElementById('gameover-restart'),
        gameoverMenu: document.getElementById('gameover-menu'),
        
        // Botones de victoria
        victoryRestart: document.getElementById('victory-restart'),
        victoryMenu: document.getElementById('victory-menu'),
        
        // Elementos de récords
        recordEasy: document.getElementById('record-easy'),
        recordMedium: document.getElementById('record-medium'),
        recordHard: document.getElementById('record-hard'),
        recordTimetrial: document.getElementById('record-timetrial'),
        
        // Elementos de victoria
        victoryTime: document.getElementById('victory-time'),
        victoryRecord: document.getElementById('victory-record'),
        
        // Elementos de contrareloj
        timetrialScore: document.getElementById('timetrial-score'),
        timetrialRecord: document.getElementById('timetrial-record'),
        timetrialRestart: document.getElementById('timetrial-restart'),
        timetrialMenu: document.getElementById('timetrial-menu'),
        
        // Elementos de configuración
        settingsBtn: document.getElementById('settings-btn'),
        passwordModal: document.getElementById('password-modal'),
        passwordInput: document.getElementById('password-input'),
        passwordCancel: document.getElementById('password-cancel'),
        passwordConfirm: document.getElementById('password-confirm'),
        livesModal: document.getElementById('lives-modal'),
        livesCancel: document.getElementById('lives-cancel'),
        livesButtons: document.querySelectorAll('.lives-btn'),
        currentLivesDisplay: document.getElementById('current-lives-display')
    };
    
    console.log('✅ Referencias al DOM inicializadas');
}

/**
 * Función de inicialización del juego
 * Se ejecuta cuando el DOM está completamente cargado
 */
function initGame() {
    console.log('🎮 Inicializando juego de memoria...');
    
    // Inicializar referencias al DOM
    initializeElements();
    
    // Cargar configuración de vidas guardada
    loadLivesConfig();
    
    // Cargar récords guardados en localStorage
    loadRecords();
    
    // Registrar event listeners
    registerEventListeners();
    
    // Registrar Service Worker para PWA
    registerServiceWorker();
    
    console.log('✅ Juego inicializado correctamente');
}

/**
 * Registra todos los event listeners del juego
 * Esta función centraliza la gestión de eventos para mejor organización
 */
function registerEventListeners() {
    console.log('🎯 Registrando event listeners...');
    console.log('📊 Botones de dificultad encontrados:', elements.difficultyButtons.length);
    
    // Botones de selección de dificultad
    elements.difficultyButtons.forEach((button, index) => {
        console.log(`🔘 Botón ${index}:`, button, 'data-difficulty:', button.dataset.difficulty);
        
        button.addEventListener('click', (e) => {
            console.log('👆 Click en botón de dificultad');
            console.log('📋 Evento:', e);
            console.log('🎯 Botón:', button);
            console.log('📊 data-difficulty:', button.dataset.difficulty);
            
            const difficulty = button.dataset.difficulty;
            console.log('🚀 Llamando startGame con:', difficulty);
            startGame(difficulty);
        });
    });
    
    console.log('✅ Event listeners de dificultad registrados');
    
    // Botón de volver al menú durante el juego
    if (elements.backBtn) {
        elements.backBtn.addEventListener('click', showMenu);
        console.log('✅ Event listener de back-btn registrado');
    }
    
    // Botones de Game Over
    if (elements.gameoverRestart) {
        elements.gameoverRestart.addEventListener('click', () => {
            startGame(gameState.currentDifficulty);
        });
    }
    if (elements.gameoverMenu) {
        elements.gameoverMenu.addEventListener('click', showMenu);
    }
    
    // Botones de Victoria
    if (elements.victoryRestart) {
        elements.victoryRestart.addEventListener('click', () => {
            startGame(gameState.currentDifficulty);
        });
    }
    if (elements.victoryMenu) {
        elements.victoryMenu.addEventListener('click', showMenu);
    }
    
    // Botones de Contrareloj
    if (elements.timetrialRestart) {
        elements.timetrialRestart.addEventListener('click', () => {
            startGame('timetrial');
        });
    }
    if (elements.timetrialMenu) {
        elements.timetrialMenu.addEventListener('click', showMenu);
    }
    
    // Event listeners de configuración
    if (elements.settingsBtn) {
        elements.settingsBtn.addEventListener('click', showPasswordModal);
    }
    
    if (elements.passwordCancel) {
        elements.passwordCancel.addEventListener('click', hidePasswordModal);
    }
    
    if (elements.passwordConfirm) {
        elements.passwordConfirm.addEventListener('click', verifyPassword);
    }
    
    if (elements.passwordInput) {
        elements.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                verifyPassword();
            }
        });
    }
    
    if (elements.livesCancel) {
        elements.livesCancel.addEventListener('click', hideLivesModal);
    }
    
    // Event listeners de selección de vidas
    elements.livesButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lives = parseInt(button.dataset.lives);
            setLivesConfig(lives);
        });
    });
    
    console.log('✅ Todos los event listeners registrados');
}

/**
 * Registra el Service Worker para funcionalidad PWA
 * El Service Worker permite que el juego funcione sin conexión
 */
function registerServiceWorker() {
    // Verificamos si el navegador soporta Service Workers
    if ('serviceWorker' in navigator) {
        console.log('📡 Registrando Service Worker...');

        // Registramos el archivo sw.js
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('✅ Service Worker registrado:', registration.scope);

                // Comprobar si existe una versión nueva del Service Worker
                registration.update()
                    .then(() => {
                        console.log('🔄 Comprobación de actualización del Service Worker completada');
                    })
                    .catch(error => {
                        console.warn('⚠️ No se pudo comprobar la actualización del Service Worker:', error);
                    });
            })
            .catch(error => {
                console.error('❌ Error al registrar Service Worker:', error);
            });
    } else {
        console.warn('⚠️ El navegador no soporta Service Workers');
    }
}

// ============================================
// GESTIÓN DE PANTALLAS
// ============================================

/**
 * Muestra una pantalla específica y oculta las demás
 * @param {string} screenName - Nombre de la pantalla a mostrar
 */
function showScreen(screenName) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar la pantalla deseada
    const targetScreen = document.getElementById(`${screenName}-screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

/**
 * Muestra el menú principal
 * Detiene cualquier juego en curso y reinicia el estado
 */
function showMenu() {
    console.log('📋 Mostrando menú principal...');
    
    // Detener el temporizador si está activo
    stopTimer();
    
    // Reiniciar el estado del juego
    resetGameState();
    
    // Cargar récords actualizados
    loadRecords();
    
    // Mostrar pantalla del menú
    showScreen('menu');
}

/**
 * Muestra la pantalla de Game Over
 */
function showGameOver() {
    console.log('💔 Mostrando pantalla de Game Over...');
    
    // Reproducir sonido de derrota
    playDefeatSound();
    
    showScreen('gameover');
}

/**
 * Muestra la pantalla de Victoria
 * @param {number} time - Tiempo final del juego
 * @param {boolean} isRecord - Si es un nuevo récord
 */
function showVictory(time, isRecord) {
    console.log('🎉 Mostrando pantalla de Victoria...');
    
    // Actualizar estadísticas de victoria
    elements.victoryTime.textContent = formatTime(time);
    elements.victoryRecord.textContent = isRecord ? '¡Nuevo Récord! 🏆' : 'No';
    
    // Resaltar si es récord
    if (isRecord) {
        elements.victoryRecord.style.color = '#e94560';
        elements.victoryRecord.style.fontWeight = 'bold';
    } else {
        elements.victoryRecord.style.color = '#ffffff';
        elements.victoryRecord.style.fontWeight = 'normal';
    }
    
    showScreen('victory');
}

// ============================================
// GESTIÓN DEL ESTADO DEL JUEGO
// ============================================

/**
 * Reinicia el estado del juego a sus valores iniciales
 * Esta función se llama antes de iniciar una nueva partida
 */
function resetGameState() {
    const configuredLives = getConfiguredLives();
    
    gameState = {
        currentDifficulty: null,
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        totalPairs: 0,
        lives: configuredLives,
        timer: 0,
        timerInterval: null,
        isLocked: false,
        gameStarted: false,
        isTimeTrial: false,
        score: 0
    };
    
    console.log(`🔄 Estado reiniciado con ${configuredLives} vidas`);
}

/**
 * Inicia una nueva partida con la dificultad especificada
 * @param {string} difficulty - Dificultad del juego: 'easy', 'medium', 'hard'
 */
function startGame(difficulty) {
    console.log(`🎮 Iniciando juego en dificultad: ${difficulty}`);
    
    // Reiniciar estado anterior
    resetGameState();
    
    // Configurar dificultad actual
    gameState.currentDifficulty = difficulty;
    const config = DIFFICULTY_CONFIG[difficulty];
    gameState.totalPairs = config.pairs;
    
    // Detectar si es modo contrareloj
    gameState.isTimeTrial = (difficulty === 'timetrial');
    
    // Generar y mezclar las cartas
    const cards = generateCards(config.pairs);
    gameState.cards = shuffleArray(cards);
    
    // Renderizar el tablero de juego
    renderGameBoard(gameState.cards, config.gridClass);
    
    // Mostrar pantalla de juego
    showScreen('game');
    
    // Actualizar UI inicial
    updateLivesDisplay();
    updateTimerDisplay();
    
    // Bloquear el juego durante la vista previa
    gameState.isLocked = true;
    
    // Mostrar todas las cartas (vista previa)
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        card.classList.add('flipped');
    });
    
    // Esperar 1 segundo y luego ocultar las cartas
    setTimeout(() => {
        allCards.forEach(card => {
            card.classList.remove('flipped');
        });
        
        // Desbloquear el juego
        gameState.isLocked = false;
        
        // Iniciar el temporizador después de la vista previa
        startTimer();
        
        // Marcar juego como iniciado
        gameState.gameStarted = true;
        
        console.log('👁️ Vista previa completada, juego iniciado');
    }, 1000);
    
    console.log('👁️ Mostrando vista previa de cartas por 1 segundo...');
}

// ============================================
// GENERACIÓN Y MEZCLA DE CARTAS
// ============================================

/**
 * Genera un array de cartas para el juego
 * @param {number} pairs - Número de parejas a generar
 * @returns {Array} Array de objetos carta con emoji y ID único
 */
function generateCards(pairs) {
    console.log(`🃏 Generando ${pairs} parejas de cartas...`);
    
    // Seleccionar emojis aleatorios del pool
    const selectedEmojis = [];
    const emojiPool = [...EMOJIS]; // Copia del array original
    
    // Seleccionar emojis únicos para cada pareja
    for (let i = 0; i < pairs; i++) {
        // Si nos quedamos sin emojis, reiniciamos el pool
        if (emojiPool.length === 0) {
            emojiPool.push(...EMOJIS);
        }
        
        // Seleccionar un emoji aleatorio
        const randomIndex = Math.floor(Math.random() * emojiPool.length);
        const emoji = emojiPool.splice(randomIndex, 1)[0];
        selectedEmojis.push(emoji);
    }
    
    // Crear parejas de cartas (cada emoji aparece 2 veces)
    const cards = [];
    selectedEmojis.forEach((emoji, index) => {
        // Crear dos cartas con el mismo emoji pero IDs diferentes
        cards.push({
            id: `card-${index}-a`,
            emoji: emoji,
            pairId: index
        });
        cards.push({
            id: `card-${index}-b`,
            emoji: emoji,
            pairId: index
        });
    });
    
    console.log(`✅ ${cards.length} cartas generadas`);
    return cards;
}

/**
 * Mezcla un array usando el algoritmo Fisher-Yates
 * Este algoritmo garantiza una mezcla verdaderamente aleatoria
 * @param {Array} array - Array a mezclar
 * @returns {Array} Array mezclado
 */
function shuffleArray(array) {
    console.log('🔀 Mezclando cartas...');
    
    // Copia del array para no modificar el original
    const shuffled = [...array];
    
    // Algoritmo Fisher-Yates
    for (let i = shuffled.length - 1; i > 0; i--) {
        // Seleccionar un índice aleatorio entre 0 e i
        const j = Math.floor(Math.random() * (i + 1));
        
        // Intercambiar elementos
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    console.log('✅ Cartas mezcladas');
    return shuffled;
}

// ============================================
// RENDERIZADO DEL TABLERO
// ============================================

/**
 * Renderiza el tablero de juego con las cartas
 * @param {Array} cards - Array de cartas a renderizar
 * @param {string} gridClass - Clase CSS para el grid
 */
function renderGameBoard(cards, gridClass) {
    console.log('🎨 Renderizando tablero de juego...');
    
    // Limpiar tablero anterior
    elements.gameBoard.innerHTML = '';
    
    // Establecer clase del grid según dificultad
    elements.gameBoard.className = `game-board ${gridClass}`;
    
    // Crear elemento DOM para cada carta
    cards.forEach(card => {
        const cardElement = createCardElement(card);
        elements.gameBoard.appendChild(cardElement);
    });
    
    console.log(`✅ ${cards.length} cartas renderizadas`);
}

/**
 * Crea el elemento DOM de una carta individual
 * @param {Object} card - Objeto con datos de la carta
 * @returns {HTMLElement} Elemento DOM de la carta
 */
function createCardElement(card) {
    // Crear contenedor de la carta
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.dataset.cardId = card.id;
    cardElement.dataset.pairId = card.pairId;
    
    // Crear cara trasera (reverso del naipe)
    const cardBack = document.createElement('div');
    cardBack.className = 'card-face card-back';
    
    // Crear cara frontal (emoji)
    const cardFront = document.createElement('div');
    cardFront.className = 'card-face card-front';
    cardFront.textContent = card.emoji;
    
    // Añadir ambas caras a la carta
    cardElement.appendChild(cardBack);
    cardElement.appendChild(cardFront);
    
    // Añadir event listener para voltear la carta
    cardElement.addEventListener('click', () => handleCardClick(cardElement));
    
    return cardElement;
}

// ============================================
// LÓGICA DE JUEGO - VOLTEO DE CARTAS
// ============================================

/**
 * Maneja el clic en una carta
 * @param {HTMLElement} cardElement - Elemento DOM de la carta clickeada
 */
function handleCardClick(cardElement) {
    console.log('👆 Carta clickeada:', cardElement.dataset.cardId);
    
    // Verificar si el juego está bloqueado (animación en curso)
    if (gameState.isLocked) {
        console.log('⏸️ Juego bloqueado, ignorando clic');
        return;
    }
    
    // Verificar si la carta ya está volteada o emparejada
    if (cardElement.classList.contains('flipped') || 
        cardElement.classList.contains('matched')) {
        console.log('⏸️ Carta ya volteada o emparejada, ignorando clic');
        return;
    }
    
    // Verificar si ya hay 2 cartas volteadas
    if (gameState.flippedCards.length >= 2) {
        console.log('⏸️ Ya hay 2 cartas volteadas, ignorando clic');
        return;
    }
    
    // Voltear la carta
    flipCard(cardElement);
}

/**
 * Voltea una carta y añade al array de cartas voltedas
 * @param {HTMLElement} cardElement - Elemento DOM de la carta a voltear
 */
function flipCard(cardElement) {
    console.log('🔄 Volteando carta:', cardElement.dataset.cardId);
    
    // Inicializar audio en el primer click
    initAudioContext();
    
    // Reproducir sonido de flip
    playFlipSound();
    
    // Añadir clase para animación 3D
    cardElement.classList.add('flipped');
    
    // Añadir al array de cartas volteadas
    gameState.flippedCards.push(cardElement);
    
    // Si hay 2 cartas volteadas, verificar si coinciden
    if (gameState.flippedCards.length === 2) {
        console.log('🔍 Verificando coincidencia...');
        checkMatch();
    }
}

/**
 * Verifica si las dos cartas volteadas coinciden
 */
function checkMatch() {
    // Bloquear el juego durante la verificación
    gameState.isLocked = true;
    
    const [card1, card2] = gameState.flippedCards;
    const pairId1 = card1.dataset.pairId;
    const pairId2 = card2.dataset.pairId;
    
    console.log(`🔍 Comparando cartas: ${pairId1} vs ${pairId2}`);
    
    // Verificar si coinciden
    if (pairId1 === pairId2) {
        // Las cartas coinciden
        handleMatch(card1, card2);
    } else {
        // Las cartas no coinciden
        handleMismatch(card1, card2);
    }
}

/**
 * Crea efecto de partículas brillantes en una carta
 * @param {HTMLElement} cardElement - Elemento de la carta
 */
function createSparkles(cardElement) {
    console.log('✨ Creando efecto de sparkles mejorado...');
    
    // Crear efecto de explosión de luz
    const burstEffect = document.createElement('div');
    burstEffect.className = 'burst-effect';
    cardElement.appendChild(burstEffect);
    
    // Crear contenedor de sparkles
    const sparkleContainer = document.createElement('div');
    sparkleContainer.className = 'sparkle-container';
    
    // Emojis para los sparkles (solo estrellas)
    const sparkleEmojis = ['⭐', '🌟', '✨', '💫'];
    
    // Crear más sparkles para efecto más llamativo
    for (let i = 0; i < 15; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.textContent = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];
        
        // Posición aleatoria dentro de la carta
        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        sparkle.style.left = `${randomX}%`;
        sparkle.style.top = `${randomY}%`;
        
        // Retraso aleatorio para cada sparkle
        sparkle.style.animationDelay = `${Math.random() * 0.5}s`;
        
        // Tamaño aleatorio para variedad
        const randomSize = 1.5 + Math.random() * 1.5;
        sparkle.style.fontSize = `${randomSize}rem`;
        
        sparkleContainer.appendChild(sparkle);
    }
    
    // Añadir contenedor a la carta
    cardElement.appendChild(sparkleContainer);
    
    // Eliminar efectos después de las animaciones
    setTimeout(() => {
        burstEffect.remove();
    }, 600);
    
    setTimeout(() => {
        sparkleContainer.remove();
    }, 1500);
}

/**
 * Maneja cuando dos cartas coinciden
 * @param {HTMLElement} card1 - Primera carta
 * @param {HTMLElement} card2 - Segunda carta
 */
function handleMatch(card1, card2) {
    console.log('✅ ¡Pareja encontrada!');
    
    // Reproducir sonido de campana
    playMatchSound();
    
    // Marcar cartas como emparejadas
    card1.classList.add('matched');
    card2.classList.add('matched');
    
    // Crear efecto de sparkles en ambas cartas
    createSparkles(card1);
    createSparkles(card2);
    
    // Incrementar contador de parejas encontradas
    gameState.matchedPairs++;
    
    // En modo contrareloj, incrementar puntaje
    if (gameState.isTimeTrial) {
        gameState.score++;
    }
    
    // Limpiar array de cartas volteadas
    gameState.flippedCards = [];
    
    // Desbloquear el juego
    gameState.isLocked = false;
    
    // Verificar si se ganó el juego (solo en modo normal)
    if (!gameState.isTimeTrial && gameState.matchedPairs === gameState.totalPairs) {
        console.log('🎉 ¡Todas las parejas encontradas!');
        handleVictory();
    }
    
    // En modo contrareloj, recargar cartas si se encontraron todas
    if (gameState.isTimeTrial && gameState.matchedPairs === gameState.totalPairs) {
        console.log('🔄 Recargando cartas en modo contrareloj...');
        setTimeout(() => reloadCards(), 1000);
    }
}

/**
 * Maneja cuando dos cartas no coinciden
 * @param {HTMLElement} card1 - Primera carta
 * @param {HTMLElement} card2 - Segunda carta
 */
function handleMismatch(card1, card2) {
    console.log('❌ Las cartas no coinciden');
    
    // Reproducir sonido de error
    playMismatchSound();
    
    // Añadir animación de shake
    card1.classList.add('shake');
    card2.classList.add('shake');
    
    // Solo reducir vidas en modo normal (no en contrareloj)
    if (!gameState.isTimeTrial) {
        gameState.lives--;
        updateLivesDisplay();
        
        // Verificar si se perdió el juego
        if (gameState.lives <= 0) {
            console.log('💔 ¡Juego terminado!');
            stopTimer();
            setTimeout(() => showGameOver(), 500);
            return;
        }
    }
    
    // Esperar antes de volver a voltear las cartas
    setTimeout(() => {
        // Remover animación de shake
        card1.classList.remove('shake');
        card2.classList.remove('shake');
        
        // Voltear las cartas de nuevo
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        
        // Limpiar array de cartas volteadas
        gameState.flippedCards = [];
        
        // Desbloquear el juego
        gameState.isLocked = false;
    }, 1000);
}

/**
 * Recarga las cartas en modo contrareloj cuando se encuentran todas
 */
function reloadCards() {
    console.log('🔄 Recargando cartas...');
    
    // Bloquear el juego durante la recarga
    gameState.isLocked = true;
    
    // Reiniciar contador de parejas
    gameState.matchedPairs = 0;
    
    // Generar nuevas cartas
    const config = DIFFICULTY_CONFIG[gameState.currentDifficulty];
    const newCards = generateCards(config.pairs);
    gameState.cards = shuffleArray(newCards);
    
    // Renderizar nuevo tablero
    renderGameBoard(gameState.cards, config.gridClass);
    
    // Mostrar vista previa de las nuevas cartas
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        card.classList.add('flipped');
    });
    
    // Esperar 1 segundo y ocultar cartas
    setTimeout(() => {
        allCards.forEach(card => {
            card.classList.remove('flipped');
        });
        
        // Desbloquear el juego
        gameState.isLocked = false;
        
        console.log('🔄 Cartas recargadas');
    }, 1000);
}

/**
 * Maneja el fin del modo contrareloj
 */
function handleTimeTrialEnd() {
    console.log('⏱️ Tiempo agotado en modo contrareloj');
    
    // Reproducir sonido de derrota
    playDefeatSound();
    
    // Verificar y guardar récord
    const isRecord = checkAndSaveTimeTrialRecord(gameState.score);
    
    // Mostrar pantalla de resultados
    showTimeTrialResults(gameState.score, isRecord);
}

/**
 * Muestra la pantalla de resultados del modo contrareloj
 * @param {number} score - Puntaje obtenido
 * @param {boolean} isRecord - Si es un nuevo récord
 */
function showTimeTrialResults(score, isRecord) {
    console.log('🏆 Mostrando resultados de contrareloj...');
    
    // Actualizar estadísticas
    elements.timetrialScore.textContent = score;
    elements.timetrialRecord.textContent = isRecord ? '¡Nuevo Récord! 🏆' : 'No';
    
    // Resaltar si es récord
    if (isRecord) {
        elements.timetrialRecord.style.color = '#e94560';
    } else {
        elements.timetrialRecord.style.color = '#ffffff';
    }
    
    // Mostrar pantalla
    showScreen('timetrial');
}

/**
 * Verifica y guarda el récord de contrareloj
 * @param {number} score - Puntaje a verificar
 * @returns {boolean} True si es un nuevo récord, False en caso contrario
 */
function checkAndSaveTimeTrialRecord(score) {
    console.log(`🏆 Verificando récord de contrareloj: ${score} puntos`);
    
    const storageKey = 'memory_record_timetrial';
    const currentRecord = localStorage.getItem(storageKey);
    
    // Si no hay récord previo, guardar el actual
    if (!currentRecord) {
        console.log('🏆 Primer récord de contrareloj');
        localStorage.setItem(storageKey, score.toString());
        return true;
    }
    
    // Convertir récord actual a número
    const currentRecordScore = parseInt(currentRecord, 10);
    
    // Verificar si el nuevo puntaje es mejor (mayor)
    if (score > currentRecordScore) {
        console.log(`🏆 ¡Nuevo récord! ${score} > ${currentRecordScore}`);
        localStorage.setItem(storageKey, score.toString());
        return true;
    }
    
    console.log('📊 No es un nuevo récord');
    return false;
}

// ============================================
// GESTIÓN DEL TEMPORIZADOR
// ============================================

/**
 * Inicia el temporizador del juego
 */
function startTimer() {
    console.log('⏱️ Iniciando temporizador...');
    
    if (gameState.isTimeTrial) {
        // Modo contrareloj: cuenta regresiva desde el límite
        const config = DIFFICULTY_CONFIG[gameState.currentDifficulty];
        gameState.timer = config.timeLimit;
        
        // Crear intervalo que se ejecuta cada segundo
        gameState.timerInterval = setInterval(() => {
            gameState.timer--;
            updateTimerDisplay();
            
            // Verificar si se acabó el tiempo
            if (gameState.timer <= 0) {
                stopTimer();
                handleTimeTrialEnd();
            }
        }, 1000);
    } else {
        // Modo normal: cuenta progresiva
        gameState.timer = 0;
        
        // Crear intervalo que se ejecuta cada segundo
        gameState.timerInterval = setInterval(() => {
            gameState.timer++;
            updateTimerDisplay();
        }, 1000);
    }
}

/**
 * Detiene el temporizador del juego
 */
function stopTimer() {
    console.log('⏸️ Deteniendo temporizador...');
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

/**
 * Actualiza la visualización del temporizador en el DOM
 */
function updateTimerDisplay() {
    if (gameState.isTimeTrial) {
        // En modo contrareloj, mostrar tiempo restante
        elements.timer.textContent = formatTime(gameState.timer);
    } else {
        // En modo normal, mostrar tiempo transcurrido
        elements.timer.textContent = formatTime(gameState.timer);
    }
}

/**
 * Formatea el tiempo en segundos a formato MM:SS
 * @param {number} seconds - Tiempo en segundos
 * @returns {string} Tiempo formateado como MM:SS
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    // Formatear con ceros a la izquierda
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`;
}

// ============================================
// GESTIÓN DE VIDAS
// ============================================

/**
 * Actualiza la visualización de vidas en el DOM
 */
function updateLivesDisplay() {
    elements.lives.textContent = gameState.lives;
    
    // Cambiar color si quedan pocas vidas
    if (gameState.lives <= 2) {
        elements.lives.style.color = '#ef4444';
    } else {
        elements.lives.style.color = '#ffffff';
    }
}

// ============================================
// GESTIÓN DE VICTORIA Y RÉCORDS
// ============================================

/**
 * Maneja la victoria del juego
 */
function handleVictory() {
    console.log('🎉 Procesando victoria...');
    
    // Reproducir sonido de victoria
    playVictorySound();
    
    // Detener el temporizador
    stopTimer();
    
    // Obtener tiempo final
    const finalTime = gameState.timer;
    
    // Verificar si es un nuevo récord
    const isRecord = checkAndSaveRecord(finalTime);
    
    // Mostrar pantalla de victoria
    setTimeout(() => showVictory(finalTime, isRecord), 500);
}

/**
 * Verifica si el tiempo es un récord y lo guarda si lo es
 * @param {number} time - Tiempo final en segundos
 * @returns {boolean} True si es un nuevo récord, False en caso contrario
 */
function checkAndSaveRecord(time) {
    console.log(`🏆 Verificando récord para dificultad: ${gameState.currentDifficulty}`);
    
    // Clave para localStorage
    const storageKey = `memory_record_${gameState.currentDifficulty}`;
    
    // Obtener récord actual
    const currentRecord = localStorage.getItem(storageKey);
    
    // Si no hay récord previo, este es automáticamente el nuevo récord
    if (!currentRecord) {
        console.log('🏆 Primer récord para esta dificultad');
        localStorage.setItem(storageKey, time.toString());
        return true;
    }
    
    // Convertir récord actual a número
    const currentRecordTime = parseInt(currentRecord, 10);
    
    // Verificar si el nuevo tiempo es mejor (menor)
    if (time < currentRecordTime) {
        console.log(`🏆 ¡Nuevo récord! ${time}s < ${currentRecordTime}s`);
        localStorage.setItem(storageKey, time.toString());
        return true;
    }
    
    console.log('📊 No es un nuevo récord');
    return false;
}

/**
 * Carga los récords desde localStorage y los muestra en el menú
 */
function loadRecords() {
    console.log('📊 Cargando récords...');
    
    // Cargar récord para cada dificultad normal
    const difficulties = ['easy', 'medium', 'hard'];
    
    difficulties.forEach(difficulty => {
        const storageKey = `memory_record_${difficulty}`;
        const record = localStorage.getItem(storageKey);
        
        if (record) {
            const recordElement = elements[`record${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`];
            if (recordElement) {
                recordElement.textContent = formatTime(parseInt(record, 10));
            }
        }
    });
    
    // Cargar récord de contrareloj
    const timetrialRecord = localStorage.getItem('memory_record_timetrial');
    if (timetrialRecord) {
        if (elements.recordTimetrial) {
            elements.recordTimetrial.textContent = `${timetrialRecord} pts`;
        }
    }
    
    console.log('✅ Récords cargados');
}

// ============================================
// CONFIGURACIÓN DE VIDAS
// ============================================

const CONFIG_PASSWORD = '6450';
const DEFAULT_LIVES = 5;
const MAX_LIVES = 9;

/**
 * Carga la configuración de vidas desde localStorage
 */
function loadLivesConfig() {
    console.log('⚙️ Cargando configuración de vidas...');
    
    const savedLives = localStorage.getItem('memory_lives_config');
    const lives = savedLives ? parseInt(savedLives, 10) : DEFAULT_LIVES;
    
    // Actualizar display
    if (elements.currentLivesDisplay) {
        elements.currentLivesDisplay.textContent = lives;
    }
    
    // Actualizar botones activos
    updateLivesButtons(lives);
    
    console.log(`✅ Configuración de vidas cargada: ${lives} vidas`);
}

/**
 * Muestra el modal de contraseña
 */
function showPasswordModal() {
    console.log('🔐 Mostrando modal de contraseña...');
    
    if (elements.passwordModal) {
        elements.passwordModal.classList.add('active');
        if (elements.passwordInput) {
            elements.passwordInput.value = '';
            elements.passwordInput.focus();
        }
    }
}

/**
 * Oculta el modal de contraseña
 */
function hidePasswordModal() {
    console.log('🔒 Ocultando modal de contraseña...');
    
    if (elements.passwordModal) {
        elements.passwordModal.classList.remove('active');
    }
}

/**
 * Verifica la contraseña ingresada
 */
function verifyPassword() {
    console.log('🔍 Verificando contraseña...');
    
    const inputPassword = elements.passwordInput ? elements.passwordInput.value : '';
    
    if (inputPassword === CONFIG_PASSWORD) {
        console.log('✅ Contraseña correcta');
        hidePasswordModal();
        showLivesModal();
    } else {
        console.log('❌ Contraseña incorrecta');
        if (elements.passwordInput) {
            elements.passwordInput.value = '';
            elements.passwordInput.focus();
            // Agregar efecto visual de error
            elements.passwordInput.style.borderColor = '#ff0000';
            setTimeout(() => {
                elements.passwordInput.style.borderColor = '';
            }, 1000);
        }
    }
}

/**
 * Muestra el modal de configuración de vidas
 */
function showLivesModal() {
    console.log('❤️ Mostrando modal de configuración de vidas...');
    
    if (elements.livesModal) {
        elements.livesModal.classList.add('active');
        
        // Cargar configuración actual
        const currentLives = localStorage.getItem('memory_lives_config');
        const lives = currentLives ? parseInt(currentLives, 10) : DEFAULT_LIVES;
        
        updateLivesButtons(lives);
    }
}

/**
 * Oculta el modal de configuración de vidas
 */
function hideLivesModal() {
    console.log('❤️ Ocultando modal de configuración de vidas...');
    
    if (elements.livesModal) {
        elements.livesModal.classList.remove('active');
    }
}

/**
 * Actualiza los botones de vidas para mostrar cuál está activo
 * @param {number} activeLives - Número de vidas activas
 */
function updateLivesButtons(activeLives) {
    elements.livesButtons.forEach(button => {
        const buttonLives = parseInt(button.dataset.lives, 10);
        if (buttonLives === activeLives) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

/**
 * Establece la configuración de vidas
 * @param {number} lives - Número de vidas a configurar
 */
function setLivesConfig(lives) {
    console.log(`❤️ Configurando vidas: ${lives}`);
    
    // Validar rango
    if (lives < 1 || lives > MAX_LIVES) {
        console.log('❌ Número de vidas inválido');
        return;
    }
    
    // Guardar en localStorage
    localStorage.setItem('memory_lives_config', lives.toString());
    
    // Actualizar display
    if (elements.currentLivesDisplay) {
        elements.currentLivesDisplay.textContent = lives;
    }
    
    // Actualizar botones activos
    updateLivesButtons(lives);
    
    console.log(`✅ Configuración de vidas actualizada: ${lives} vidas`);
}

/**
 * Obtiene el número de vidas configurado
 * @returns {number} Número de vidas configuradas
 */
function getConfiguredLives() {
    const savedLives = localStorage.getItem('memory_lives_config');
    return savedLives ? parseInt(savedLives, 10) : DEFAULT_LIVES;
}

// ============================================
// INICIALIZACIÓN AL CARGAR EL DOM
// ============================================

// Esperar a que el DOM esté completamente cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    // El DOM ya está cargado, inicializar directamente
    initGame();
}

// ============================================
// FIN DEL ARCHIVO
// ============================================
// Este archivo contiene toda la lógica del juego de memoria.
// Para entender el flujo completo:
// 1. initGame() - Inicializa el juego al cargar
// 2. startGame(difficulty) - Inicia una partida
// 3. generateCards(pairs) - Crea las cartas con emojis
// 4. shuffleArray(array) - Mezcla las cartas aleatoriamente
// 5. renderGameBoard(cards, gridClass) - Muestra las cartas en el DOM
// 6. handleCardClick(cardElement) - Maneja clics en cartas
// 7. checkMatch() - Verifica si las cartas coinciden
// 8. handleMatch() / handleMismatch() - Procesa el resultado
// 9. handleVictory() - Procesa la victoria y verifica récords
// 10. checkAndSaveRecord(time) - Guarda récords en localStorage
