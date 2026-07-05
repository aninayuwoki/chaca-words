/**
 * alphabet.js
 * Zona "Abecedario": las 27 letras del español (incluye la Ñ). Al
 * tocar una letra se escucha su nombre y se entra a una vista con
 * pictogramas reales de ARASAAC cuyas palabras empiezan con esa letra;
 * cada pictograma se puede tocar para escuchar la palabra completa.
 *
 * Para agregar o cambiar palabras de una letra, edita el arreglo
 * "words" de esa letra aquí abajo.
 */

const ALPHABET = [
  { letter: 'A', name: 'a', words: [{ id: 'abeja', word: 'Abeja' }, { id: 'agua-abc', word: 'Agua' }, { id: 'amigo-abc', word: 'Amigo' }, { id: 'arbol', word: 'Árbol' }] },
  { letter: 'B', name: 'be', words: [{ id: 'bebe', word: 'Bebé' }, { id: 'bicicleta', word: 'Bicicleta' }, { id: 'botella', word: 'Botella' }, { id: 'barco', word: 'Barco' }] },
  { letter: 'C', name: 'ce', words: [{ id: 'casa-abc', word: 'Casa' }, { id: 'comida-abc', word: 'Comida' }, { id: 'coche', word: 'Coche' }, { id: 'cama', word: 'Cama' }] },
  { letter: 'D', name: 'de', words: [{ id: 'dedo', word: 'Dedo' }, { id: 'doctor', word: 'Doctor' }, { id: 'diente', word: 'Diente' }, { id: 'dinosaurio', word: 'Dinosaurio' }] },
  { letter: 'E', name: 'e', words: [{ id: 'escuela', word: 'Escuela' }, { id: 'elefante', word: 'Elefante' }, { id: 'estrella', word: 'Estrella' }, { id: 'espejo', word: 'Espejo' }] },
  { letter: 'F', name: 'efe', words: [{ id: 'familia', word: 'Familia' }, { id: 'flor', word: 'Flor' }, { id: 'fruta', word: 'Fruta' }, { id: 'foco', word: 'Foco' }] },
  { letter: 'G', name: 'ge', words: [{ id: 'gato', word: 'Gato' }, { id: 'globo', word: 'Globo' }, { id: 'guitarra', word: 'Guitarra' }, { id: 'gafas', word: 'Gafas' }] },
  { letter: 'H', name: 'hache', words: [{ id: 'hola-abc', word: 'Hola' }, { id: 'huevo', word: 'Huevo' }, { id: 'helado', word: 'Helado' }, { id: 'hormiga', word: 'Hormiga' }] },
  { letter: 'I', name: 'i', words: [{ id: 'iglesia', word: 'Iglesia' }, { id: 'isla', word: 'Isla' }, { id: 'insecto', word: 'Insecto' }, { id: 'iman', word: 'Imán' }] },
  { letter: 'J', name: 'jota', words: [{ id: 'jugar-abc', word: 'Jugar' }, { id: 'jirafa', word: 'Jirafa' }, { id: 'jabon', word: 'Jabón' }, { id: 'juguete', word: 'Juguete' }] },
  { letter: 'K', name: 'ka', words: [{ id: 'kilo', word: 'Kilo' }, { id: 'koala', word: 'Koala' }, { id: 'kiwi', word: 'Kiwi' }] },
  { letter: 'L', name: 'ele', words: [{ id: 'libro-abc', word: 'Libro' }, { id: 'luna', word: 'Luna' }, { id: 'leon', word: 'León' }, { id: 'leche', word: 'Leche' }] },
  { letter: 'M', name: 'eme', words: [{ id: 'mama-abc', word: 'Mamá' }, { id: 'mesa', word: 'Mesa' }, { id: 'manzana', word: 'Manzana' }, { id: 'mariposa', word: 'Mariposa' }] },
  { letter: 'N', name: 'ene', words: [{ id: 'nariz', word: 'Nariz' }, { id: 'nube', word: 'Nube' }, { id: 'nino', word: 'Niño' }, { id: 'naranja', word: 'Naranja' }] },
  { letter: 'Ñ', name: 'eñe', words: [{ id: 'nandu', word: 'Ñandú' }, { id: 'nu', word: 'Ñu' }, { id: 'name', word: 'Ñame' }] },
  { letter: 'O', name: 'o', words: [{ id: 'oso', word: 'Oso' }, { id: 'ojo', word: 'Ojo' }, { id: 'oreja', word: 'Oreja' }, { id: 'oveja', word: 'Oveja' }] },
  { letter: 'P', name: 'pe', words: [{ id: 'papa-abc', word: 'Papá' }, { id: 'perro', word: 'Perro' }, { id: 'pelota-abc', word: 'Pelota' }, { id: 'pan', word: 'Pan' }] },
  { letter: 'Q', name: 'cu', words: [{ id: 'queso', word: 'Queso' }, { id: 'quiosco', word: 'Quiosco' }, { id: 'quetzal', word: 'Quetzal' }] },
  { letter: 'R', name: 'erre', words: [{ id: 'raton', word: 'Ratón' }, { id: 'reloj', word: 'Reloj' }, { id: 'rana', word: 'Rana' }, { id: 'robot', word: 'Robot' }] },
  { letter: 'S', name: 'ese', words: [{ id: 'sol', word: 'Sol' }, { id: 'silla', word: 'Silla' }, { id: 'sopa', word: 'Sopa' }, { id: 'serpiente', word: 'Serpiente' }] },
  { letter: 'T', name: 'te', words: [{ id: 'taza', word: 'Taza' }, { id: 'tren-abc', word: 'Tren' }, { id: 'tortuga', word: 'Tortuga' }, { id: 'telefono', word: 'Teléfono' }] },
  { letter: 'U', name: 'u', words: [{ id: 'uva', word: 'Uva' }, { id: 'una', word: 'Uña' }, { id: 'uniforme', word: 'Uniforme' }, { id: 'unicornio', word: 'Unicornio' }] },
  { letter: 'V', name: 'uve', words: [{ id: 'vaca', word: 'Vaca' }, { id: 'ventana', word: 'Ventana' }, { id: 'vestido', word: 'Vestido' }, { id: 'violin', word: 'Violín' }] },
  { letter: 'W', name: 'uve doble', words: [{ id: 'wafle', word: 'Wafle' }, { id: 'web', word: 'Web' }, { id: 'wifi', word: 'Wifi' }] },
  { letter: 'X', name: 'equis', words: [{ id: 'xilofono', word: 'Xilófono' }, { id: 'xenon', word: 'Xenón' }] },
  { letter: 'Y', name: 'ye', words: [{ id: 'yoyo', word: 'Yoyo' }, { id: 'yogur', word: 'Yogur' }, { id: 'yate', word: 'Yate' }, { id: 'yema', word: 'Yema' }] },
  { letter: 'Z', name: 'zeta', words: [{ id: 'zapato', word: 'Zapato' }, { id: 'zorro', word: 'Zorro' }, { id: 'zanahoria', word: 'Zanahoria' }, { id: 'zoologico', word: 'Zoológico' }] }
];

function hablarTexto(texto, rate = 0.9) {
  hablar(texto, { rate });
}

function renderizarGrillaLetras() {
  const grid = document.getElementById('grid-letras');
  grid.innerHTML = '';
  ALPHABET.forEach((entry) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'letra-card';
    btn.textContent = entry.letter;
    btn.setAttribute('aria-label', `Letra ${entry.letter}`);
    btn.addEventListener('click', () => abrirLetra(entry));
    grid.appendChild(btn);
  });
}

function abrirLetra(entry) {
  document.getElementById('grid-letras').classList.add('oculto');
  const panel = document.getElementById('panel-letra');
  panel.classList.remove('oculto');
  panel.innerHTML = '';

  hablarTexto(entry.name);

  const encabezado = document.createElement('div');
  encabezado.className = 'letra-encabezado';
  encabezado.innerHTML = `<button type="button" class="btn secondary" id="btn-volver-abc">\u2190 Volver al abecedario</button>`;
  panel.appendChild(encabezado);

  const grande = document.createElement('button');
  grande.type = 'button';
  grande.className = 'letra-grande';
  grande.textContent = entry.letter;
  grande.title = 'Toca para escuchar de nuevo';
  grande.setAttribute('aria-label', `Escuchar la letra ${entry.letter}`);
  grande.addEventListener('click', () => hablarTexto(entry.name));
  panel.appendChild(grande);

  const instruccion = document.createElement('p');
  instruccion.className = 'instruccion';
  instruccion.textContent = `Palabras que empiezan con "${entry.letter}". Tócalas para escucharlas.`;
  panel.appendChild(instruccion);

  const grid = document.createElement('div');
  grid.className = 'picto-grid';
  entry.words.forEach((palabra) => {
    const tarjeta = crearTarjetaPictograma(palabra, 'alphabet', {
      clickable: true,
      onClick: () => hablarTexto(palabra.word)
    });
    grid.appendChild(tarjeta);
  });
  panel.appendChild(grid);

  document.getElementById('btn-volver-abc').addEventListener('click', volverAAbecedario);
}

function volverAAbecedario() {
  document.getElementById('panel-letra').classList.add('oculto');
  document.getElementById('grid-letras').classList.remove('oculto');
}

function iniciarAbecedario() {
  renderizarGrillaLetras();
}
