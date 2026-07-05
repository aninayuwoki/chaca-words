/**
 * tts.js
 * Wrapper de texto a voz.
 *
 * El WebView de Android no implementa bien la Web Speech API
 * (speechSynthesis.speak() no suena, o getVoices() viene vacío), así
 * que cuando la app corre empaquetada usamos el plugin nativo
 * @capacitor-community/text-to-speech, que habla con el motor TTS real
 * del sistema operativo.
 *
 * Cuando el sitio se abre en un navegador normal (por ejemplo con
 * `python3 -m http.server` mientras desarrollas), no existe ese
 * plugin nativo, así que usamos speechSynthesis como respaldo.
 */

function esAppNativa() {
  return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
}

function ttsNativoDisponible() {
  return esAppNativa() && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech;
}

/**
 * Habla un texto en español.
 * @param {string} texto
 * @param {object} opciones - { rate, pitch, onEnd }
 * @returns {Promise<void>}
 */
async function hablar(texto, opciones = {}) {
  if (!texto) return;
  const rate = opciones.rate ?? 0.92;
  const pitch = opciones.pitch ?? 1.0;

  if (ttsNativoDisponible()) {
    try {
      await window.Capacitor.Plugins.TextToSpeech.stop();
      await window.Capacitor.Plugins.TextToSpeech.speak({
        text: texto,
        lang: 'es-ES',
        rate,
        pitch,
        volume: 1.0,
        category: 'playback',
      });
    } catch (err) {
      console.warn('El TTS nativo falló:', err);
    } finally {
      if (typeof opciones.onEnd === 'function') opciones.onEnd();
    }
    return;
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const voz = new SpeechSynthesisUtterance(texto);
    voz.lang = 'es-ES';
    voz.rate = rate;
    voz.pitch = pitch;
    if (typeof opciones.onEnd === 'function') voz.onend = opciones.onEnd;
    window.speechSynthesis.speak(voz);
    return;
  }

  // Ni plugin nativo ni Web Speech API disponibles: no hay voz posible.
  if (typeof opciones.onEnd === 'function') opciones.onEnd();
}
