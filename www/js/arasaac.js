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

async function obtenerListaPictogramas(url) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const datos = await resp.json();
    return Array.isArray(datos) && datos.length ? datos : null;
  } catch {
    return null;
  }
}

/**
 * Busca, dentro de una lista de resultados de la API, un pictograma
 * cuya palabra clave coincida LITERALMENTE con lo que escribió la
 * persona (mismas letras, mismas tildes). Esto es necesario porque
 * el endpoint "bestsearch" de ARASAAC tolera errores de tipeo y, por
 * esa tolerancia, puede confundir palabras que en español significan
 * cosas distintas solo por la tilde (ej. "papá" el familiar vs.
 * "papa" la patata/el Papa). Al exigir coincidencia exacta con lo
 * que se buscó, esa ambigüedad se resuelve correctamente.
 */
function encontrarCoincidenciaExacta(pictogramas, clave) {
  for (const picto of pictogramas) {
    if (!Array.isArray(picto.keywords)) continue;
    const tieneCoincidenciaExacta = picto.keywords.some((k) => {
      const texto = k && typeof k.keyword === 'string' ? k.keyword.trim().toLowerCase() : '';
      return texto === clave;
    });
    if (tieneCoincidenciaExacta) return picto._id;
  }
  return null;
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

  const guardarYDevolver = (id) => {
    const resultado = { id, url: urlImagenArasaac(id) };
    memoryCache.set(clave, resultado);
    cacheLocal[clave] = id;
    guardarCacheLocal(cacheLocal);
    return resultado;
  };

  try {
    // 1) Búsqueda literal ("search"): no corrige errores de tipeo, así
    // que es más confiable para no confundir palabras que solo se
    // diferencian por una tilde.
    const resultadosLiteral = await obtenerListaPictogramas(
      `https://api.arasaac.org/api/pictograms/es/search/${encodeURIComponent(clave)}`
    );
    let idElegido = resultadosLiteral && encontrarCoincidenciaExacta(resultadosLiteral, clave);

    if (!idElegido) {
      // 2) Si ahí no hay una coincidencia exacta, probamos "bestsearch"
      // (tolera errores de tipeo) pero, otra vez, priorizando entre
      // SUS resultados la palabra exacta que se escribió, antes de
      // conformarnos con la primera sugerencia "parecida".
      const resultadosTolerantes = await obtenerListaPictogramas(
        `https://api.arasaac.org/api/pictograms/es/bestsearch/${encodeURIComponent(clave)}`
      );
      idElegido = resultadosTolerantes && encontrarCoincidenciaExacta(resultadosTolerantes, clave);

      if (!idElegido) {
        // Ninguna de las dos búsquedas tiene la palabra exacta entre
        // sus etiquetas: usamos el mejor resultado disponible.
        const mejorDisponible = (resultadosTolerantes && resultadosTolerantes[0])
          || (resultadosLiteral && resultadosLiteral[0]);
        if (!mejorDisponible) throw new Error('sin resultados');
        idElegido = mejorDisponible._id;
      }
    }

    return guardarYDevolver(idElegido);
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
