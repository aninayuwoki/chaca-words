/**
 * tts.js
 * Voz en español para toda la app.
 *
 * Antes, communicator.js y alphabet.js llamaban directo a
 * SpeechSynthesisUtterance (Web Speech API). Eso funciona bien en un
 * navegador de escritorio, pero dentro del WebView de Android muchos
 * dispositivos no traen voces instaladas para ese motor y la lectura
 * se queda muda sin avisar — ese era el bug real detrás de "la voz no
 * funciona en el celular".
 *
 * Ahora, si la app corre empaquetada como APK (Capacitor), se usa el
 * plugin nativo @capacitor-community/text-to-speech, que habla con el
 * motor de Android de verdad (el mismo que usan Lector de Google,
 * TalkBack, etc.) y es mucho más confiable. Si la app corre en un
 * navegador normal, o si el plugin nativo no está disponible por
 * cualquier motivo, cae automáticamente al Web Speech API de siempre.
 *
 * El resto del código solo llama a hablar(texto) y no necesita saber
 * en cuál de los dos motores terminó sonando.
 */

function obtenerPluginTTSNativo() {
  return window.Capacitor &&
    typeof window.Capacitor.isNativePlatform === 'function' &&
    window.Capacitor.isNativePlatform() &&
    window.Capacitor.Plugins &&
    window.Capacitor.Plugins.TextToSpeech
    ? window.Capacitor.Plugins.TextToSpeech
    : null;
}

function hablarConWebSpeech(texto, rate) {
  if (!('speechSynthesis' in window)) return Promise.resolve();
  return new Promise((resolve) => {
    window.speechSynthesis.cancel();
    const voz = new SpeechSynthesisUtterance(texto);
    voz.lang = 'es-ES';
    voz.rate = rate;
    voz.pitch = 1;
    voz.onend = resolve;
    voz.onerror = resolve;
    window.speechSynthesis.speak(voz);
  });
}

/**
 * Habla un texto en español. Devuelve una promesa que se resuelve
 * cuando termina de leer (se usa, por ejemplo, para quitar la
 * animación del tren cuando termina de "hablar" una frase).
 */
async function hablar(texto, rate = 0.92) {
  const nativo = obtenerPluginTTSNativo();
  if (nativo) {
    try {
      await nativo.speak({
        text: texto,
        lang: 'es-ES',
        rate,
        pitch: 1.0,
        volume: 1.0,
        category: 'ambient'
      });
      return;
    } catch (err) {
      console.warn('TTS nativo falló, usando la voz del navegador:', err);
    }
  }
  await hablarConWebSpeech(texto, rate);
}
