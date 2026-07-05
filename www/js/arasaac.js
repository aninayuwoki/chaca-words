/**
 * arasaac.js
 * Integración con la API pública de ARASAAC (https://arasaac.org),
 * el banco de pictogramas de código abierto más usado en Comunicación
 * Aumentativa y Alternativa (CAA).
 *
 * Los pictogramas de ARASAAC son propiedad del Gobierno de Aragón y
 * Sergio Palao, publicados bajo licencia CC BY-NC-SA. Por eso la app
 * muestra un crédito visible en el pie de página (ver index.html).
 *
 * Estrategia:
 *  1. Buscar primero en caché de localStorage (persiste entre sesiones).
 *  2. Si no existe, consultar la API "bestsearch" (mejor coincidencia).
 *  3. Si la API falla (sin internet, offline, CORS caído), devolver
 *     null para que quien llama pinte un pictograma de repuesto local.
 */

const ARASAAC_CACHE_KEY = 'pictogramas_arasaac_cache_v1';
const memoryCache = new Map();

function leerCacheLocal() {
  try {
    const raw = localStorage.getItem(ARASAAC_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function guardarCacheLocal(cache) {
  try {
    localStorage.setItem(ARASAAC_CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* localStorage lleno o bloqueado: seguimos sin cachear */
  }
}

function urlImagenArasaac(id, size = 500) {
  return `https://static.arasaac.org/pictograms/${id}/${id}_${size}.png`;
}

/**
 * Busca el pictograma más adecuado para una palabra.
 * @param {string} keyword - término de búsqueda en español
 * @returns {Promise<{id:number, url:string}|null>}
 */
async function buscarPictograma(keyword) {
  const clave = keyword.trim().toLowerCase();

  if (memoryCache.has(clave)) return memoryCache.get(clave);

  const cacheLocal = leerCacheLocal();
  if (cacheLocal[clave]) {
    const resultado = { id: cacheLocal[clave], url: urlImagenArasaac(cacheLocal[clave]) };
    memoryCache.set(clave, resultado);
    return resultado;
  }

  try {
    const resp = await fetch(`https://api.arasaac.org/api/pictograms/es/bestsearch/${encodeURIComponent(clave)}`);
    if (!resp.ok) throw new Error('respuesta no válida de ARASAAC');
    const datos = await resp.json();
    if (!Array.isArray(datos) || datos.length === 0) throw new Error('sin resultados');

    const id = datos[0]._id;
    const resultado = { id, url: urlImagenArasaac(id) };

    memoryCache.set(clave, resultado);
    cacheLocal[clave] = id;
    guardarCacheLocal(cacheLocal);

    return resultado;
  } catch (err) {
    console.warn(`No se pudo obtener el pictograma de "${clave}":`, err.message);
    memoryCache.set(clave, null);
    return null;
  }
}

/**
 * Precarga en paralelo (con límite de concurrencia) los pictogramas
 * de una lista de palabras. Útil al iniciar la app para que el
 * catálogo aparezca casi completo desde el primer render.
 */
async function precargarPictogramas(palabras, concurrencia = 4) {
  const cola = [...palabras];
  const trabajador = async () => {
    while (cola.length) {
      const palabra = cola.shift();
      await buscarPictograma(palabra);
    }
  };
  await Promise.all(Array.from({ length: concurrencia }, trabajador));
}
