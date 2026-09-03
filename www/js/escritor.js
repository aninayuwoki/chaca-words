/**
 * escritor.js
 * Zona "Escribir": un teclado con las 27 letras del abecedario
 * (reutiliza el arreglo ALPHABET de alphabet.js) y una pantalla que
 * va mostrando la palabra que se arma letra por letra, por ejemplo
 * J + U + A + N = "JUAN". Un botón permite escuchar esa palabra (o
 * frase, si se usa la barra espaciadora) con la misma voz que usa el
 * resto de la app.
 */

let escritorTexto = '';

function actualizarPantallaEscritor() {
  const span = document.getElementById('texto-escritor');
  span.textContent = escritorTexto;

  const hayTexto = escritorTexto.trim().length > 0;
  document.getElementById('btn-leer-palabra').disabled = !hayTexto;
  document.getElementById('btn-borrar-letra').disabled = escritorTexto.length === 0;
  document.getElementById('btn-vaciar-escritor').disabled = escritorTexto.length === 0;
}

function agregarLetraEscritor(entry) {
  escritorTexto += entry.letter;
  actualizarPantallaEscritor();
  // Retroalimentación auditiva breve: se escucha el nombre de la
  // letra al tocarla (igual que en el Abecedario), para que quien
  // escribe sepa qué letra acaba de elegir.
  hablar(entry.name, 1.05);
}

function agregarEspacioEscritor() {
  if (escritorTexto.length === 0 || escritorTexto.endsWith(' ')) return;
  escritorTexto += ' ';
  actualizarPantallaEscritor();
}

function borrarUltimaLetraEscritor() {
  if (escritorTexto.length === 0) return;
  escritorTexto = escritorTexto.slice(0, -1);
  actualizarPantallaEscritor();
}

function vaciarEscritor() {
  escritorTexto = '';
  actualizarPantallaEscritor();
}

function leerPalabraEscritor() {
  const texto = escritorTexto.trim();
  if (!texto) return;
  hablar(texto, 0.85);
}

function renderizarTecladoEscritor() {
  const teclado = document.getElementById('teclado-escritor');
  teclado.innerHTML = '';
  ALPHABET.forEach((entry) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'letra-card';
    btn.textContent = entry.letter;
    btn.setAttribute('aria-label', `Agregar la letra ${entry.letter}`);
    btn.addEventListener('click', () => agregarLetraEscritor(entry));
    teclado.appendChild(btn);
  });
}

function iniciarEscritor() {
  renderizarTecladoEscritor();
  actualizarPantallaEscritor();

  document.getElementById('btn-leer-palabra').addEventListener('click', leerPalabraEscritor);
  document.getElementById('btn-borrar-letra').addEventListener('click', borrarUltimaLetraEscritor);
  document.getElementById('btn-espacio-escritor').addEventListener('click', agregarEspacioEscritor);
  document.getElementById('btn-vaciar-escritor').addEventListener('click', vaciarEscritor);
}
