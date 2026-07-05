/**
 * ui.js
 * Piezas de interfaz reutilizadas tanto por el Comunicador como por
 * el modo Juego: tarjetas de pictograma (con imagen real de ARASAAC
 * y respaldo local si falla la red), notificaciones tipo "toast" y
 * una pequeña celebración de confeti para los logros.
 */

/** Genera un pictograma de respaldo (SVG en memoria) cuando ARASAAC
 * no está disponible, para que la app nunca dependa de un emoji. */
function crearPlaceholderSVG(word, colorVar) {
  const color = getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim() || '#cccccc';
  const inicial = word.trim().charAt(0).toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" rx="28" fill="${color}"/>
      <text x="100" y="122" font-family="Atkinson Hyperlegible, sans-serif"
            font-size="90" font-weight="700" fill="#ffffff"
            text-anchor="middle">${inicial}</text>
    </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Crea una tarjeta de pictograma. La imagen se resuelve de forma
 * asíncrona contra ARASAAC y se reemplaza en cuanto llega.
 *
 * @param {{id:string, word:string, keyword?:string}} entry
 * @param {string} catKey - clave de CATEGORIES
 * @param {object} opts - { clickable, onClick, size }
 */
function crearTarjetaPictograma(entry, catKey, opts = {}) {
  const { clickable = false, onClick = null, size = 'normal' } = opts;
  const cat = CATEGORIES[catKey] || { varName: '--c-neutral' };

  const card = document.createElement('button');
  card.type = 'button';
  card.className = `picto-card picto-${size} cat-${catKey}`;
  card.style.setProperty('--card-color', `var(${cat.varName})`);
  card.setAttribute('aria-label', entry.word);

  const img = document.createElement('img');
  img.alt = entry.word;
  img.loading = 'lazy';
  img.src = crearPlaceholderSVG(entry.word, cat.varName);

  const label = document.createElement('p');
  label.textContent = entry.word;

  card.appendChild(img);
  card.appendChild(label);

  buscarPictograma(entry.keyword || entry.word).then((res) => {
    if (res && res.url) {
      const tmp = new Image();
      tmp.onload = () => { img.src = res.url; };
      tmp.onerror = () => { /* se queda con el placeholder */ };
      tmp.src = res.url;
    }
  });

  if (clickable && onClick) {
    card.addEventListener('click', () => onClick(entry));
  }

  return card;
}

/* ---------- Notificaciones tipo toast ---------- */
function mostrarAviso(mensaje, tipo = 'info') {
  let contenedor = document.getElementById('toast-container');
  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.id = 'toast-container';
    contenedor.setAttribute('aria-live', 'polite');
    document.body.appendChild(contenedor);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.textContent = mensaje;
  contenedor.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

/* ---------- Celebración con confeti (para logros y niveles) ---------- */
function lanzarConfeti() {
  const capa = document.createElement('div');
  capa.className = 'confeti-capa';
  document.body.appendChild(capa);

  const colores = ['var(--c-subject)', 'var(--c-verb)', 'var(--c-object)', 'var(--c-descriptor)', 'var(--c-social)'];

  for (let i = 0; i < 24; i++) {
    const pieza = document.createElement('span');
    pieza.className = 'confeti-pieza';
    pieza.style.left = `${Math.random() * 100}vw`;
    pieza.style.background = colores[i % colores.length];
    pieza.style.animationDelay = `${Math.random() * 0.4}s`;
    pieza.style.transform = `rotate(${Math.random() * 360}deg)`;
    capa.appendChild(pieza);
  }

  setTimeout(() => capa.remove(), 2200);
}

function reproducirSonido(tipo) {
  // Pequeños tonos generados con la Web Audio API: no requieren
  // archivos de audio externos y respetan a personas con sensibilidad
  // al sonido porque son cortos y suaves.
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const frecuencias = { acierto: [660, 880], error: [220], logro: [523, 659, 784] };
    const notas = frecuencias[tipo] || [440];

    osc.type = 'sine';
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    notas.forEach((freq, i) => {
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
    });
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + notas.length * 0.12 + 0.2);
    osc.start();
    osc.stop(ctx.currentTime + notas.length * 0.12 + 0.25);
  } catch {
    /* Web Audio no disponible: no pasa nada, la app sigue funcionando */
  }
}
