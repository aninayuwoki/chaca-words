/**
 * game.js
 * Modo "Juego": el vocabulario se practica viajando por estaciones de
 * un tren. Cada estación desbloqueada ofrece un mini-juego distinto
 * (emparejar, memoria o construir frases). Se gana estrellas, se
 * desbloquean nuevas estaciones y se coleccionan insignias.
 *
 * Todo el progreso se guarda en localStorage, así que se conserva
 * entre sesiones sin necesidad de servidor ni cuentas de usuario.
 */

const PROGRESO_KEY = 'pictogramas_progreso_v1';

function progresoInicial() {
  return {
    stars: 0,
    stationsCompleted: [],
    badgesEarned: [],
    perfectMemoryGames: 0,
    phrasesBuilt: 0
  };
}

let progreso = progresoInicial();

function cargarProgreso() {
  try {
    progreso = { ...progresoInicial(), ...JSON.parse(localStorage.getItem(PROGRESO_KEY)) };
  } catch {
    progreso = progresoInicial();
  }
}

function guardarProgreso() {
  localStorage.setItem(PROGRESO_KEY, JSON.stringify(progreso));
}

function otorgarEstrellas(cantidad) {
  progreso.stars += cantidad;
  guardarProgreso();
  actualizarEncabezadoJuego();
  comprobarLogros();
}

/* Práctica libre: hablar una frase de 2+ palabras en el Comunicador
 * también suma una pequeña recompensa, para unir ambos modos. */
function registrarFraseComunicada(longitud) {
  if (longitud < 2) return;
  cargarProgreso();
  otorgarEstrellas(1);
}

function comprobarLogros() {
  let huboNuevo = false;
  BADGES.forEach((badge) => {
    if (!progreso.badgesEarned.includes(badge.id) && badge.check(progreso)) {
      progreso.badgesEarned.push(badge.id);
      huboNuevo = true;
      mostrarAviso(`¡Nueva insignia! ${badge.emoji} ${badge.name}`, 'logro');
    }
  });
  if (huboNuevo) {
    guardarProgreso();
    reproducirSonido('logro');
    lanzarConfeti();
    renderizarInsignias();
  }
}

function mezclar(array) {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/* ---------- Encabezado del modo juego (estrellas + insignias) ---------- */
function actualizarEncabezadoJuego() {
  document.getElementById('contador-estrellas').textContent = progreso.stars;
}

function renderizarInsignias() {
  const cont = document.getElementById('lista-insignias');
  cont.innerHTML = '';
  BADGES.forEach((badge) => {
    const ganada = progreso.badgesEarned.includes(badge.id);
    const chip = document.createElement('div');
    chip.className = `insignia ${ganada ? 'ganada' : 'bloqueada'}`;
    chip.title = ganada ? badge.description : `Bloqueada: ${badge.description}`;
    chip.innerHTML = `<span>${badge.emoji}</span>`;
    cont.appendChild(chip);
  });
}

/* ---------- Mapa de estaciones ---------- */
function renderizarMapaEstaciones() {
  const mapa = document.getElementById('mapa-estaciones');
  mapa.innerHTML = '';

  STATIONS.forEach((estacion) => {
    const desbloqueada = progreso.stars >= estacion.starsToUnlock;
    const completada = progreso.stationsCompleted.includes(estacion.id);

    const tarjeta = document.createElement('button');
    tarjeta.type = 'button';
    tarjeta.className = `estacion-card ${desbloqueada ? '' : 'bloqueada'} ${completada ? 'completada' : ''}`;
    tarjeta.disabled = !desbloqueada;
    tarjeta.innerHTML = `
      <span class="estacion-icono">${completada ? '✅' : desbloqueada ? (CATEGORIES[estacion.category]?.icon || '🚂') : '🔒'}</span>
      <span class="estacion-nombre">${estacion.name}</span>
      <span class="estacion-desc">${desbloqueada ? estacion.description : `Necesitas ${estacion.starsToUnlock} ⭐`}</span>
    `;
    if (desbloqueada) tarjeta.addEventListener('click', () => abrirEstacion(estacion));
    mapa.appendChild(tarjeta);
  });
}

function volverAlMapa() {
  document.getElementById('panel-minijuego').classList.add('oculto');
  document.getElementById('mapa-estaciones').classList.remove('oculto');
  renderizarMapaEstaciones();
}

function marcarEstacionCompleta(estacion) {
  if (!progreso.stationsCompleted.includes(estacion.id)) {
    progreso.stationsCompleted.push(estacion.id);
    guardarProgreso();
  }
  otorgarEstrellas(3);
  mostrarAviso(`\u00a1Estación completada! ${estacion.name}`, 'exito');
  lanzarConfeti();
}

/* ---------- Enrutador de mini-juegos ---------- */
function abrirEstacion(estacion) {
  document.getElementById('mapa-estaciones').classList.add('oculto');
  const panel = document.getElementById('panel-minijuego');
  panel.classList.remove('oculto');
  panel.innerHTML = '';

  const encabezado = document.createElement('div');
  encabezado.className = 'minijuego-encabezado';
  encabezado.innerHTML = `<button class="btn secondary" id="btn-volver-mapa">\u2190 Volver al mapa</button><h3>${estacion.name}</h3>`;
  panel.appendChild(encabezado);

  const area = document.createElement('div');
  area.id = 'area-minijuego';
  panel.appendChild(area);

  document.getElementById('btn-volver-mapa').addEventListener('click', volverAlMapa);

  if (estacion.gameType === 'match') iniciarJuegoEmparejar(estacion, area);
  else if (estacion.gameType === 'memory') iniciarJuegoMemoria(estacion, area);
  else if (estacion.gameType === 'phrase') iniciarJuegoFrases(estacion, area);
}

/* ---------- Mini-juego 1: Emparejar palabra con pictograma ---------- */
function iniciarJuegoEmparejar(estacion, area) {
  const palabras = mezclar(VOCABULARY[estacion.category]).slice(0, 6);
  let seleccionActiva = null;
  let aciertos = 0;

  area.innerHTML = `
    <p class="instruccion">Toca una palabra y luego el pictograma que le corresponde.</p>
    <div class="emparejar-zona">
      <div class="columna-palabras" id="col-palabras"></div>
      <div class="columna-imagenes" id="col-imagenes"></div>
    </div>`;

  const colPalabras = area.querySelector('#col-palabras');
  const colImagenes = area.querySelector('#col-imagenes');

  palabras.forEach((p) => {
    const btn = document.createElement('button');
    btn.className = 'palabra-chip';
    btn.textContent = p.word;
    btn.dataset.id = p.id;
    btn.addEventListener('click', () => {
      colPalabras.querySelectorAll('.palabra-chip').forEach((b) => b.classList.remove('activa'));
      btn.classList.add('activa');
      seleccionActiva = p.id;
    });
    colPalabras.appendChild(btn);
  });

  mezclar(palabras).forEach((p) => {
    const tarjeta = crearTarjetaPictograma(p, estacion.category, {
      clickable: true,
      onClick: () => {
        if (!seleccionActiva) return;
        if (seleccionActiva === p.id) {
          tarjeta.classList.add('correcta');
          tarjeta.disabled = true;
          colPalabras.querySelector(`[data-id="${p.id}"]`).classList.add('correcta');
          colPalabras.querySelector(`[data-id="${p.id}"]`).disabled = true;
          reproducirSonido('acierto');
          aciertos++;
          seleccionActiva = null;
          if (aciertos === palabras.length) marcarEstacionCompleta(estacion);
        } else {
          tarjeta.classList.add('incorrecta');
          reproducirSonido('error');
          setTimeout(() => tarjeta.classList.remove('incorrecta'), 400);
        }
      }
    });
    colImagenes.appendChild(tarjeta);
  });
}

/* ---------- Mini-juego 2: Memoria ---------- */
function iniciarJuegoMemoria(estacion, area) {
  const base = mezclar(VOCABULARY[estacion.category]).slice(0, 6);
  const mazo = mezclar([...base, ...base].map((p, i) => ({ ...p, uid: `${p.id}-${i}` })));
  let primera = null;
  let bloqueado = false;
  let paresEncontrados = 0;
  let huboError = false;

  area.innerHTML = `<p class="instruccion">Encuentra las parejas de pictogramas iguales.</p><div class="memoria-grid" id="memoria-grid"></div>`;
  const grid = area.querySelector('#memoria-grid');

  mazo.forEach((carta) => {
    const casilla = document.createElement('button');
    casilla.className = 'memoria-carta';
    casilla.innerHTML = '<span class="reverso">?</span>';
    casilla.addEventListener('click', () => {
      if (bloqueado || casilla.classList.contains('volteada')) return;

      casilla.classList.add('volteada');
      casilla.innerHTML = '';
      casilla.appendChild(crearTarjetaPictograma(carta, estacion.category, { size: 'small' }));

      if (!primera) {
        primera = { carta, casilla };
        return;
      }

      bloqueado = true;
      if (primera.carta.id === carta.id) {
        reproducirSonido('acierto');
        paresEncontrados++;
        primera = null;
        bloqueado = false;
        if (paresEncontrados === base.length) {
          if (!huboError) progreso.perfectMemoryGames++;
          guardarProgreso();
          marcarEstacionCompleta(estacion);
        }
      } else {
        huboError = true;
        reproducirSonido('error');
        setTimeout(() => {
          casilla.classList.remove('volteada');
          casilla.innerHTML = '<span class="reverso">?</span>';
          primera.casilla.classList.remove('volteada');
          primera.casilla.innerHTML = '<span class="reverso">?</span>';
          primera = null;
          bloqueado = false;
        }, 900);
      }
    });
    grid.appendChild(casilla);
  });
}

/* ---------- Mini-juego 3: Construir frases ---------- */
function iniciarJuegoFrases(estacion, area) {
  const desafios = mezclar(estacion.phrases);
  let indiceDesafio = 0;
  let construccion = [];

  function buscarPalabra(id) {
    for (const cat of Object.keys(VOCABULARY)) {
      const encontrada = VOCABULARY[cat].find((p) => p.id === id);
      if (encontrada) return { ...encontrada, catKey: cat };
    }
    return null;
  }

  function render() {
    if (indiceDesafio >= desafios.length) {
      marcarEstacionCompleta(estacion);
      return;
    }

    const objetivo = desafios[indiceDesafio].map(buscarPalabra);
    const distractores = mezclar(VOCABULARY.objects.concat(VOCABULARY.verbs))
      .filter((p) => !objetivo.some((o) => o.id === p.id))
      .slice(0, 2)
      .map((p) => ({ ...p, catKey: VOCABULARY.objects.includes(p) ? 'objects' : 'verbs' }));

    const piezas = mezclar([...objetivo, ...distractores]);
    construccion = [];

    area.innerHTML = `
      <p class="instruccion">Toca los vagones en el orden correcto para formar la frase.</p>
      <div class="tren-construccion" id="tren-construccion"></div>
      <div class="piezas-disponibles" id="piezas-disponibles"></div>
      <button class="btn primary" id="btn-comprobar-frase" disabled>Comprobar frase</button>
    `;

    const tren = area.querySelector('#tren-construccion');
    const piezasCont = area.querySelector('#piezas-disponibles');
    const btnComprobar = area.querySelector('#btn-comprobar-frase');

    function refrescarTren() {
      tren.innerHTML = '';
      if (construccion.length === 0) {
        tren.innerHTML = '<p class="phrase-empty">Tu frase aparecerá aquí</p>';
      }
      construccion.forEach((p) => tren.appendChild(crearTarjetaPictograma(p, p.catKey, { size: 'small' })));
      btnComprobar.disabled = construccion.length === 0;
    }

    piezas.forEach((p) => {
      const pieza = crearTarjetaPictograma(p, p.catKey, {
        clickable: true,
        onClick: () => {
          construccion.push(p);
          refrescarTren();
        }
      });
      piezasCont.appendChild(pieza);
    });

    btnComprobar.addEventListener('click', () => {
      const ordenCorrecto = construccion.map((p) => p.id).join(',') === objetivo.map((p) => p.id).join(',');
      if (ordenCorrecto) {
        reproducirSonido('acierto');
        progreso.phrasesBuilt++;
        guardarProgreso();
        otorgarEstrellas(2);
        mostrarAviso('¡Frase correcta!', 'exito');
        indiceDesafio++;
        render();
      } else {
        reproducirSonido('error');
        mostrarAviso('Ese orden todavía no suena bien, intenta de nuevo', 'info');
        construccion = [];
        refrescarTren();
      }
    });

    refrescarTren();
  }

  render();
}

function iniciarJuego() {
  cargarProgreso();
  actualizarEncabezadoJuego();
  renderizarInsignias();
  renderizarMapaEstaciones();
}
