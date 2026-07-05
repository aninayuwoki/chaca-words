/**
 * communicator.js
 * Modo "Comunicador": catálogo de pictogramas por categoría, tren de
 * construcción de frases, lectura en voz alta y una caja de búsqueda
 * que permite agregar CUALQUIER palabra nueva (se busca en vivo en
 * ARASAAC), guardándola como vocabulario personalizado para que la
 * próxima visita ya aparezca en el catálogo.
 */

const CUSTOM_VOCAB_KEY = 'pictogramas_vocab_personalizado_v1';
let fraseActual = [];

function cargarVocabularioPersonalizado() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CUSTOM_VOCAB_KEY) || '{}');
    Object.entries(guardado).forEach(([catKey, palabras]) => {
      if (VOCABULARY[catKey]) {
        palabras.forEach((p) => {
          if (!VOCABULARY[catKey].some((existing) => existing.id === p.id)) {
            VOCABULARY[catKey].push(p);
          }
        });
      }
    });
  } catch {
    /* si el guardado está corrupto, seguimos con el vocabulario base */
  }
}

function guardarPalabraPersonalizada(catKey, entry) {
  const guardado = JSON.parse(localStorage.getItem(CUSTOM_VOCAB_KEY) || '{}');
  guardado[catKey] = guardado[catKey] || [];
  guardado[catKey].push(entry);
  localStorage.setItem(CUSTOM_VOCAB_KEY, JSON.stringify(guardado));
}

function renderizarCatalogo() {
  Object.keys(VOCABULARY).forEach((catKey) => {
    const grid = document.getElementById(`grid-${catKey}`);
    if (!grid) return;
    grid.innerHTML = '';
    VOCABULARY[catKey].forEach((entry) => {
      grid.appendChild(crearTarjetaPictograma(entry, catKey, { clickable: true, onClick: (e) => agregarAFrase(e, catKey) }));
    });
  });
}

function agregarAFrase(entry, catKey) {
  fraseActual.push({ ...entry, catKey });
  renderizarTren();
}

function quitarDeFrase(indice) {
  fraseActual.splice(indice, 1);
  renderizarTren();
}

function renderizarTren() {
  const contenedor = document.getElementById('phrase-container');
  contenedor.innerHTML = '';

  if (fraseActual.length === 0) {
    const vacio = document.createElement('p');
    vacio.className = 'phrase-empty';
    vacio.textContent = 'Toca los pictogramas de abajo para subirlos al tren \u2192';
    contenedor.appendChild(vacio);
    document.getElementById('btn-speak').disabled = true;
    return;
  }

  document.getElementById('btn-speak').disabled = false;

  fraseActual.forEach((entry, i) => {
    const vagon = crearTarjetaPictograma(entry, entry.catKey, { size: 'small', clickable: true, onClick: () => quitarDeFrase(i) });
    vagon.classList.add('vagon');
    vagon.title = 'Toca para quitar del tren';
    contenedor.appendChild(vagon);
  });
}

function leerFrase() {
  if (fraseActual.length === 0) return;
  const texto = fraseActual.map((p) => p.word).join(' ');

  const tren = document.getElementById('phrase-container');
  tren.classList.add('tren-en-marcha');
  hablar(texto, {
    rate: 0.92,
    pitch: 1,
    onEnd: () => tren.classList.remove('tren-en-marcha'),
  });

  // El modo Juego también cuenta las frases habladas como práctica.
  if (typeof registrarFraseComunicada === 'function') registrarFraseComunicada(fraseActual.length);
}

function limpiarFrase() {
  fraseActual = [];
  renderizarTren();
}

/* ---------- Búsqueda de vocabulario nuevo ---------- */
async function buscarYMostrarResultadoPersonalizado() {
  const input = document.getElementById('busqueda-palabra');
  const categoriaSelect = document.getElementById('busqueda-categoria');
  const resultadoBox = document.getElementById('resultado-busqueda');
  const palabra = input.value.trim();

  if (!palabra) return;

  resultadoBox.innerHTML = '<p class="buscando">Buscando pictograma\u2026</p>';
  const res = await buscarPictograma(palabra);
  resultadoBox.innerHTML = '';

  if (!res) {
    resultadoBox.innerHTML = '<p class="sin-resultado">No se encontró un pictograma para esa palabra. Intenta con otro término.</p>';
    return;
  }

  const catKey = categoriaSelect.value;
  const entry = { id: `custom-${Date.now()}`, word: palabra.charAt(0).toUpperCase() + palabra.slice(1), keyword: palabra };
  const tarjeta = crearTarjetaPictograma(entry, catKey, {});
  resultadoBox.appendChild(tarjeta);

  const btnAgregar = document.createElement('button');
  btnAgregar.className = 'btn secondary';
  btnAgregar.textContent = `+ Agregar a "${CATEGORIES[catKey].label}"`;
  btnAgregar.addEventListener('click', () => {
    VOCABULARY[catKey].push(entry);
    guardarPalabraPersonalizada(catKey, entry);
    renderizarCatalogo();
    mostrarAviso(`"${entry.word}" se agregó a tu catálogo`, 'exito');
    input.value = '';
    resultadoBox.innerHTML = '';
  });
  resultadoBox.appendChild(btnAgregar);
}

function iniciarComunicador() {
  cargarVocabularioPersonalizado();
  renderizarCatalogo();
  renderizarTren();

  document.getElementById('btn-speak').addEventListener('click', leerFrase);
  document.getElementById('btn-clear').addEventListener('click', limpiarFrase);
  document.getElementById('btn-buscar-palabra').addEventListener('click', buscarYMostrarResultadoPersonalizado);
  document.getElementById('busqueda-palabra').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') buscarYMostrarResultadoPersonalizado();
  });
}
