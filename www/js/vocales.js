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
  { letter: 'A', id: 'arbol', word: 'Árbol', audio: 'assets/audio/vocal-a.mp3' },
  { letter: 'E', id: 'escuela', word: 'Escuela', audio: 'assets/audio/vocal-e.mp3' },
  { letter: 'I', id: 'iglesia', word: 'Iglesia', audio: 'assets/audio/vocal-i.mp3' },
  { letter: 'O', id: 'oso', word: 'Oso', audio: 'assets/audio/vocal-o.mp3' },
  { letter: 'U', id: 'uva', word: 'Uva', audio: 'assets/audio/vocal-u.mp3' }
];

// Un <audio> reutilizable por vocal (se crea una sola vez al iniciar).
const audiosVocales = {};

// La canción que está sonando en este momento, si hay alguna, para
// poder pararla al tocar otra vocal o al presionar "Detener".
let audioVocalActivo = null;

let cancionVocalesActiva = false;
let cancelarCancionVocales = false;

function pausaMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resaltarTarjetaVocal(letra, activar) {
  const tarjeta = document.getElementById(`vocal-card-${letra}`);
  if (tarjeta) tarjeta.classList.toggle('activa', activar);
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
}

/**
 * Reproduce la canción completa de una vocal y devuelve una promesa
 * que se resuelve cuando termina (o cuando falla y ya se dijo el
 * respaldo por voz), para poder encadenarlas en la canción completa.
 */
function reproducirAudioVocal(entry) {
  return new Promise((resolve) => {
    detenerAudioVocalActivo();
    const audio = audiosVocales[entry.letter];
    audioVocalActivo = audio;
    resaltarTarjetaVocal(entry.letter, true);

    const terminar = () => {
      audio.removeEventListener('ended', alTerminar);
      audio.removeEventListener('error', alFallar);
      resaltarTarjetaVocal(entry.letter, false);
      if (audioVocalActivo === audio) audioVocalActivo = null;
      resolve();
    };
    const alTerminar = () => terminar();
    const alFallar = async () => {
      console.warn(`No se encontró o no se pudo reproducir ${entry.audio}; uso la voz de respaldo.`);
      await hablar(`${entry.letter}... de ${entry.word}`, 0.85);
      terminar();
    };

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
