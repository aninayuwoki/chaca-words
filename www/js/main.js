/**
 * main.js
 * Inicializa la aplicación: precarga los pictogramas más usados,
 * arranca el Comunicador y el Juego, y controla el cambio de pestañas.
 */

function cambiarPestana(destino) {
  document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.toggle('activo', btn.dataset.tab === destino));
  document.querySelectorAll('.vista').forEach((vista) => vista.classList.toggle('oculto', vista.id !== `vista-${destino}`));
}

document.addEventListener('DOMContentLoaded', () => {
  iniciarComunicador();
  iniciarAbecedario();
  iniciarJuego();

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => cambiarPestana(btn.dataset.tab));
  });

  // Precarga silenciosa de todo el vocabulario base para que las
  // imágenes reales de ARASAAC ya estén en caché cuando el niño o
  // niña empiece a jugar.
  const palabrasVocabulario = Object.values(VOCABULARY).flat().map((p) => p.keyword || p.word);
  const palabrasAbecedario = ALPHABET.flatMap((entry) => entry.words.map((p) => p.word));
  precargarPictogramas([...palabrasVocabulario, ...palabrasAbecedario]);
});
