/**
 * vocales.js
 * Zona "Vocales": una canción real en MP3 por cada vocal (A, E, I, O,
 * U). Al tocar una vocal, suena su canción completa desde
 * assets/audio/. El botón "Cantar la canción de las vocales"
 * reproduce las 5 canciones en fila, con la tarjeta de la vocal que
 * está sonando animada.
 *
 * DÓNDE VAN LOS ARCHIVOS MP3 Y CÓMO SE DEBEN LLAMAR:
 *   www/assets/audio/vocal-a.mp3
 *   www/assets/audio/vocal-e.mp3
 *   www/assets/audio/vocal-i.mp3
 *   www/assets/audio/vocal-o.mp3
 *   www/assets/audio/vocal-u.mp3
 *
 * Basta con copiar los 5 archivos con esos nombres exactos dentro de
 * esa carpeta (minúsculas, sin tildes ni espacios) y volver a
 * generar el APK; no hace falta tocar nada más de código. Si algún
 * archivo falta o no carga, esa vocal cae automáticamente a la voz
 * de la app diciendo "A... de Árbol" para que nunca se quede muda.
 */

const VOCALES_CANCION = [
  { letter: 'A', id: 'arbol', word: 'Árbol', audio: 'assets/audio/vocal-a.mp3',
    palabras: [{ id: 'abeja', word: 'Abeja' }, { id: 'agua-abc', word: 'Agua' }, { id: 'arbol', word: 'Árbol' }, { id: 'amigo-abc', word: 'Amigo' }] },
  { letter: 'E', id: 'escuela', word: 'Escuela', audio: 'assets/audio/vocal-e.mp3',
    palabras: [{ id: 'elefante', word: 'Elefante' }, { id: 'escuela', word: 'Escuela' }, { id: 'estrella', word: 'Estrella' }, { id: 'espejo', word: 'Espejo' }] },
  { letter: 'I', id: 'iglesia', word: 'Iglesia', audio: 'assets/audio/vocal-i.mp3',
    palabras: [{ id: 'insecto', word: 'Insecto' }, { id: 'isla', word: 'Isla' }, { id: 'iguana-vocales', word: 'Iguana', keyword: 'iguana' }, { id: 'iglesia', word: 'Iglesia' }] },
  { letter: 'O', id: 'oso', word: 'Oso', audio: 'assets/audio/vocal-o.mp3',
    palabras: [{ id: 'oso', word: 'Oso' }, { id: 'oveja', word: 'Oveja' }, { id: 'ojo', word: 'Ojo' }, { id: 'oreja', word: 'Oreja' }] },
  { letter: 'U', id: 'uva', word: 'Uva', audio: 'assets/audio/vocal-u.mp3',
    palabras: [{ id: 'unicornio', word: 'Unicornio' }, { id: 'uva', word: 'Uva' }, { id: 'urraca-vocales', word: 'Urraca', keyword: 'urraca' }] }
];

// Un <audio> reutilizable por vocal (se crea una sola vez al iniciar).
const audiosVocales = {};

// La canción que está sonando en este momento, si hay alguna, para
// poder pararla al tocar otra vocal o al presionar "Detener".
let audioVocalActivo = null;

// Si hay una reproducción en curso, esta función permite "resolverla"
// a la fuerza desde afuera (por ejemplo al tocar "Detener"), porque
// pausar un <audio> con .pause() NO dispara el evento "ended": sin
// esto, la función que espera a que termine la canción se quedaba
// esperando para siempre y la app quedaba bloqueada.
let resolverReproduccionActual = null;

// Función para detener la animación de trazos del "escenario" (la
// devuelve iniciarEscenarioLetra, de letras-animadas.js).
let detenerEscenarioLetra = null;

// Temporizador del carrusel de palabras del escenario.
let temporizadorPalabrasEscenario = null;

let cancionVocalesActiva = false;
let cancelarCancionVocales = false;

function pausaMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resaltarTarjetaVocal(letra, activar) {
  const tarjeta = document.getElementById(`vocal-card-${letra}`);
  if (tarjeta) tarjeta.classList.toggle('activa', activar);
}

/** Arranca el escenario animado (letra dibujándose + carrusel de
 * palabras) para la vocal que empieza a sonar. */
function mostrarEscenarioVocal(entry) {
  ocultarEscenarioVocal();

  const panel = document.getElementById('escenario-vocales');
  panel.classList.remove('oculto');

  const contenedorLetra = document.getElementById('escenario-letra');
  detenerEscenarioLetra = iniciarEscenarioLetra(contenedorLetra, entry.letter);

  const contenedorPalabras = document.getElementById('escenario-palabras');
  contenedorPalabras.innerHTML = '';
  const palabras = entry.palabras && entry.palabras.length ? entry.palabras : [entry];
  let indice = 0;

  function mostrarSiguientePalabra() {
    contenedorPalabras.innerHTML = '';
    const tarjeta = crearTarjetaPictograma(palabras[indice], 'vowels', { size: 'small' });
    contenedorPalabras.appendChild(tarjeta);
    indice = (indice + 1) % palabras.length;
  }

  mostrarSiguientePalabra();
  temporizadorPalabrasEscenario = setInterval(mostrarSiguientePalabra, 2200);
}

/** Apaga el escenario animado (se llama al terminar, fallar o
 * detener una canción). */
function ocultarEscenarioVocal() {
  if (detenerEscenarioLetra) {
    detenerEscenarioLetra();
    detenerEscenarioLetra = null;
  }
  if (temporizadorPalabrasEscenario) {
    clearInterval(temporizadorPalabrasEscenario);
    temporizadorPalabrasEscenario = null;
  }
  const panel = document.getElementById('escenario-vocales');
  if (panel) panel.classList.add('oculto');
  const contenedorPalabras = document.getElementById('escenario-palabras');
  if (contenedorPalabras) contenedorPalabras.innerHTML = '';
}

function crearAudiosVocales() {
  VOCALES_CANCION.forEach((entry) => {
    const audio = new Audio(entry.audio);
    audio.preload = 'auto';
    audiosVocales[entry.letter] = audio;
  });
}

function detenerAudioVocalActivo() {
  if (audioVocalActivo) {
    audioVocalActivo.pause();
    audioVocalActivo.currentTime = 0;
  }
  audioVocalActivo = null;
  VOCALES_CANCION.forEach((entry) => resaltarTarjetaVocal(entry.letter, false));
  ocultarEscenarioVocal();

  // Si algo estaba esperando a que esta canción terminara (el "await"
  // dentro de reproducirAudioVocal), lo liberamos ahora mismo: de lo
  // contrario esa espera nunca se resuelve porque .pause() no dispara
  // el evento "ended", y toda la zona Vocales se queda bloqueada.
  if (resolverReproduccionActual) {
    const resolver = resolverReproduccionActual;
    resolverReproduccionActual = null;
    resolver();
  }
}

/**
 * Reproduce la canción completa de una vocal y devuelve una promesa
 * que se resuelve cuando termina (o cuando falla y ya se dijo el
 * respaldo por voz, o cuando se detiene manualmente), para poder
 * encadenarlas en la canción completa.
 */
function reproducirAudioVocal(entry) {
  return new Promise((resolve) => {
    detenerAudioVocalActivo();
    const audio = audiosVocales[entry.letter];
    audioVocalActivo = audio;
    resaltarTarjetaVocal(entry.letter, true);
    mostrarEscenarioVocal(entry);

    let yaResuelto = false;
    const terminar = () => {
      if (yaResuelto) return;
      yaResuelto = true;
      audio.removeEventListener('ended', alTerminar);
      audio.removeEventListener('error', alFallar);
      resaltarTarjetaVocal(entry.letter, false);
      ocultarEscenarioVocal();
      if (audioVocalActivo === audio) audioVocalActivo = null;
      if (resolverReproduccionActual === terminar) resolverReproduccionActual = null;
      resolve();
    };
    const alTerminar = () => terminar();
    const alFallar = async () => {
      console.warn(`No se encontró o no se pudo reproducir ${entry.audio}; uso la voz de respaldo.`);
      await hablar(`${entry.letter}... de ${entry.word}`, 0.85);
      terminar();
    };

    resolverReproduccionActual = terminar;

    audio.addEventListener('ended', alTerminar, { once: true });
    audio.addEventListener('error', alFallar, { once: true });

    audio.currentTime = 0;
    audio.play().catch(alFallar);
  });
}

async function cantarUnaVocal(entry) {
  if (cancionVocalesActiva) return; // no interrumpir la canción completa
  await reproducirAudioVocal(entry);
}

function renderizarGrillaVocales() {
  const grid = document.getElementById('grid-vocales');
  grid.innerHTML = '';
  VOCALES_CANCION.forEach((entry) => {
    const tarjeta = crearTarjetaPictograma(entry, 'vowels', {
      clickable: true,
      onClick: () => cantarUnaVocal(entry)
    });
    tarjeta.id = `vocal-card-${entry.letter}`;
    tarjeta.classList.add('vocal-card');
    grid.appendChild(tarjeta);
  });
}

async function cantarCancionVocales() {
  const boton = document.getElementById('btn-cantar-vocales');

  if (cancionVocalesActiva) {
    // Ya está sonando: este toque es para detenerla.
    cancelarCancionVocales = true;
    detenerAudioVocalActivo();
    detenerHabla();
    return;
  }

  cancionVocalesActiva = true;
  cancelarCancionVocales = false;
  boton.textContent = '⏸️ Detener la canción';
  boton.classList.remove('primary');
  boton.classList.add('danger');

  for (const entry of VOCALES_CANCION) {
    if (cancelarCancionVocales) break;
    await reproducirAudioVocal(entry);
    if (cancelarCancionVocales) break;
    await pausaMs(300);
  }

  if (!cancelarCancionVocales) {
    reproducirSonido('logro');
    lanzarConfeti();
    mostrarAviso('¡Genial! Ya cantamos las 5 vocales 🎉', 'exito');
  }

  cancionVocalesActiva = false;
  cancelarCancionVocales = false;
  boton.textContent = '🎵 Cantar la canción de las vocales';
  boton.classList.remove('danger');
  boton.classList.add('primary');
}

function iniciarVocales() {
  crearAudiosVocales();
  renderizarGrillaVocales();
  document.getElementById('btn-cantar-vocales').addEventListener('click', cantarCancionVocales);
}
