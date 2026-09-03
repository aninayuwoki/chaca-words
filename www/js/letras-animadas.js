/**
 * letras-animadas.js
 * Animación original de "trazos" (líneas que se dibujan solas) para
 * cada vocal, en mayúscula y minúscula, inspirada en el orden de
 * trazo con el que se enseña a escribir cada letra (línea, curva,
 * círculo...). No reproduce ninguna canción ni texto de terceros:
 * son formas geométricas propias, pensadas para acompañar visualmente
 * cualquier audio que se esté reproduciendo en la zona Vocales.
 *
 * Cada letra es una lista de "trazos" (segmentos <path> o <circle>)
 * que se dibujan uno tras otro con la técnica de stroke-dasharray /
 * stroke-dashoffset, y luego el ciclo se reinicia para que la
 * animación se repita mientras dura la canción.
 */

const TRAZOS_LETRAS = {
  A: {
    mayuscula: [
      { tag: 'path', d: 'M40,175 L100,30' },
      { tag: 'path', d: 'M100,30 L160,175' },
      { tag: 'path', d: 'M65,120 L135,120' }
    ],
    minuscula: [
      { tag: 'circle', cx: 90, cy: 118, r: 42 },
      { tag: 'path', d: 'M132,72 L132,158' }
    ]
  },
  E: {
    mayuscula: [
      { tag: 'path', d: 'M55,30 L55,175' },
      { tag: 'path', d: 'M55,30 L155,30' },
      { tag: 'path', d: 'M55,102 L135,102' },
      { tag: 'path', d: 'M55,175 L155,175' }
    ],
    minuscula: [
      { tag: 'circle', cx: 100, cy: 118, r: 42 },
      { tag: 'path', d: 'M60,113 L140,113' }
    ]
  },
  I: {
    mayuscula: [
      { tag: 'path', d: 'M60,30 L140,30' },
      { tag: 'path', d: 'M100,30 L100,175' },
      { tag: 'path', d: 'M60,175 L140,175' }
    ],
    minuscula: [
      { tag: 'circle', cx: 100, cy: 58, r: 9 },
      { tag: 'path', d: 'M100,90 L100,175' }
    ]
  },
  O: {
    mayuscula: [
      { tag: 'circle', cx: 100, cy: 103, r: 72 }
    ],
    minuscula: [
      { tag: 'circle', cx: 100, cy: 122, r: 46 }
    ]
  },
  U: {
    mayuscula: [
      { tag: 'path', d: 'M55,30 L55,120 Q55,175 100,175 Q145,175 145,120 L145,30' }
    ],
    minuscula: [
      { tag: 'path', d: 'M65,80 L65,140 Q65,168 90,168 Q115,168 115,140 L115,80' },
      { tag: 'path', d: 'M115,140 L115,172' }
    ]
  }
};

const NS_SVG = 'http://www.w3.org/2000/svg';

function crearElementoTrazo(def) {
  const el = document.createElementNS(NS_SVG, def.tag);
  if (def.tag === 'circle') {
    el.setAttribute('cx', def.cx);
    el.setAttribute('cy', def.cy);
    el.setAttribute('r', def.r);
  } else {
    el.setAttribute('d', def.d);
  }
  el.setAttribute('class', 'trazo-letra');
  return el;
}

function crearSvgLetra(letra, forma) {
  const svg = document.createElementNS(NS_SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 200 200');
  svg.setAttribute('class', 'svg-letra-animada');

  const trazos = (TRAZOS_LETRAS[letra] && TRAZOS_LETRAS[letra][forma]) || [];
  trazos.forEach((def) => svg.appendChild(crearElementoTrazo(def)));

  return svg;
}

/** Dibuja (o vuelve a dibujar) todos los trazos de un SVG en orden,
 * uno después del otro. */
function animarTrazosDeSvg(svg) {
  const trazos = Array.from(svg.querySelectorAll('.trazo-letra'));
  trazos.forEach((el, i) => {
    const largo = el.getTotalLength();
    el.style.transition = 'none';
    el.style.strokeDasharray = largo;
    el.style.strokeDashoffset = largo;
    // Fuerza al navegador a aplicar el estado inicial antes de animar.
    // eslint-disable-next-line no-unused-expressions
    el.getBoundingClientRect();
    el.style.transition = `stroke-dashoffset 0.85s ease ${i * 0.8}s`;
    requestAnimationFrame(() => {
      el.style.strokeDashoffset = '0';
    });
  });
  const duracionTotal = trazos.length * 800 + 850;
  return duracionTotal;
}

/**
 * Crea el "escenario" animado de una vocal (mayúscula + minúscula,
 * ambas dibujándose) dentro del contenedor dado, y arranca el bucle
 * que las repite mientras la canción suena. Devuelve una función
 * para detener el bucle y limpiar el contenedor.
 */
function iniciarEscenarioLetra(contenedor, letra) {
  contenedor.innerHTML = '';

  const bloqueMayus = document.createElement('div');
  bloqueMayus.className = 'bloque-letra-animada';
  const svgMayus = crearSvgLetra(letra, 'mayuscula');
  const etiquetaMayus = document.createElement('p');
  etiquetaMayus.textContent = `${letra} mayúscula`;
  bloqueMayus.appendChild(svgMayus);
  bloqueMayus.appendChild(etiquetaMayus);

  const bloqueMinus = document.createElement('div');
  bloqueMinus.className = 'bloque-letra-animada';
  const svgMinus = crearSvgLetra(letra, 'minuscula');
  const etiquetaMinus = document.createElement('p');
  etiquetaMinus.textContent = `${letra.toLowerCase()} minúscula`;
  bloqueMinus.appendChild(svgMinus);
  bloqueMinus.appendChild(etiquetaMinus);

  contenedor.appendChild(bloqueMayus);
  contenedor.appendChild(bloqueMinus);

  let temporizador = null;

  function ciclo() {
    const d1 = animarTrazosDeSvg(svgMayus);
    animarTrazosDeSvg(svgMinus);
    const espera = Math.max(d1, 900) + 500;
    temporizador = setTimeout(ciclo, espera);
  }
  ciclo();

  return function detener() {
    if (temporizador) clearTimeout(temporizador);
    contenedor.innerHTML = '';
  };
}
