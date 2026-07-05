/**
 * data.js
 * Vocabulario base, categorías (con sus colores estilo "Fitzgerald Key",
 * el estándar de codificación por color usado en tableros de CAA) y
 * definición de las estaciones del modo Juego.
 *
 * Para agregar una palabra nueva solo hace falta añadir un objeto al
 * arreglo de la categoría correspondiente. "keyword" es el término que
 * se envía a la API de ARASAAC para buscar el pictograma; si no se
 * indica, se usa "word" en minúsculas.
 */

const CATEGORIES = {
  subjects: { label: 'Personas', varName: '--c-subject', icon: '🧑' },
  verbs: { label: 'Acciones', varName: '--c-verb', icon: '🏃' },
  objects: { label: 'Cosas', varName: '--c-object', icon: '🎒' },
  descriptors: { label: 'Cómo me siento', varName: '--c-descriptor', icon: '💛' },
  social: { label: 'Para conversar', varName: '--c-social', icon: '💬' },
  mixed: { label: 'Mis frases', varName: '--c-neutral', icon: '🚂' },
  alphabet: { label: 'Abecedario', varName: '--c-alphabet', icon: '🔤' }
};

const VOCABULARY = {
  subjects: [
    { id: 'yo', word: 'Yo' },
    { id: 'tu', word: 'Tú' },
    { id: 'mama', word: 'Mamá' },
    { id: 'papa', word: 'Papá' },
    { id: 'amigo', word: 'Amigo' },
    { id: 'maestra', word: 'Maestra' }
  ],
  verbs: [
    { id: 'querer', word: 'Querer' },
    { id: 'comer', word: 'Comer' },
    { id: 'beber', word: 'Beber' },
    { id: 'jugar', word: 'Jugar' },
    { id: 'dormir', word: 'Dormir' },
    { id: 'ir', word: 'Ir' },
    { id: 'ver', word: 'Ver' },
    { id: 'ayudar', word: 'Ayudar' }
  ],
  objects: [
    { id: 'agua', word: 'Agua' },
    { id: 'comida', word: 'Comida' },
    { id: 'pelota', word: 'Pelota' },
    { id: 'libro', word: 'Libro' },
    { id: 'bano', word: 'Baño' },
    { id: 'casa', word: 'Casa' },
    { id: 'musica', word: 'Música' }
  ],
  descriptors: [
    { id: 'feliz', word: 'Feliz' },
    { id: 'triste', word: 'Triste' },
    { id: 'enojado', word: 'Enojado' },
    { id: 'cansado', word: 'Cansado' },
    { id: 'bien', word: 'Bien' },
    { id: 'mal', word: 'Mal' }
  ],
  social: [
    { id: 'hola', word: 'Hola' },
    { id: 'adios', word: 'Adiós' },
    { id: 'porfavor', word: 'Por favor', keyword: 'por favor' },
    { id: 'gracias', word: 'Gracias' },
    { id: 'si', word: 'Sí' },
    { id: 'no', word: 'No' }
  ]
};

/**
 * Estaciones del "Tren de las Palabras" (modo Juego).
 * Cada estación se desbloquea con una cantidad mínima de estrellas
 * acumuladas y practica una categoría con un tipo de mini-juego.
 *
 * gameType: 'memory' | 'match' | 'phrase'
 */
const STATIONS = [
  {
    id: 'estacion-saludos',
    name: 'Estación Saludos',
    category: 'social',
    gameType: 'match',
    starsToUnlock: 0,
    description: 'Empareja cada palabra social con su pictograma.'
  },
  {
    id: 'estacion-familia',
    name: 'Estación Familia',
    category: 'subjects',
    gameType: 'memory',
    starsToUnlock: 3,
    description: 'Encuentra las parejas de personas escondidas.'
  },
  {
    id: 'estacion-acciones',
    name: 'Estación Acciones',
    category: 'verbs',
    gameType: 'match',
    starsToUnlock: 6,
    description: 'Une cada acción con su pictograma correcto.'
  },
  {
    id: 'estacion-objetos',
    name: 'Estación Objetos',
    category: 'objects',
    gameType: 'memory',
    starsToUnlock: 10,
    description: 'Memoriza dónde están las cosas cotidianas.'
  },
  {
    id: 'estacion-emociones',
    name: 'Estación Emociones',
    category: 'descriptors',
    gameType: 'match',
    starsToUnlock: 14,
    description: 'Reconoce cómo se siente cada pictograma.'
  },
  {
    id: 'estacion-final',
    name: 'Estación Final: Mis Frases',
    category: 'mixed',
    gameType: 'phrase',
    starsToUnlock: 18,
    description: 'Arma frases completas subiendo los vagones correctos al tren.',
    phrases: [
      ['yo', 'querer', 'agua'],
      ['tu', 'querer', 'jugar'],
      ['mama', 'ayudar'],
      ['yo', 'ver', 'pelota'],
      ['papa', 'querer', 'comida'],
      ['yo', 'ir', 'bano']
    ]
  }
];

/**
 * Definición de insignias (logros) del modo Juego.
 * "check" recibe el objeto de progreso (ver game.js) y devuelve
 * true/false para saber si la insignia debe otorgarse.
 */
const BADGES = [
  {
    id: 'primer-viaje',
    name: 'Primer Viaje',
    emoji: '🚂',
    description: 'Completaste tu primera estación.',
    check: (p) => p.stationsCompleted.length >= 1
  },
  {
    id: 'memoria-elefante',
    name: 'Memoria de Elefante',
    emoji: '🐘',
    description: 'Ganaste un juego de memoria sin ningún error.',
    check: (p) => p.perfectMemoryGames >= 1
  },
  {
    id: 'comunicador-experto',
    name: 'Comunicador Experto',
    emoji: '🗣️',
    description: 'Construiste 10 frases correctas.',
    check: (p) => p.phrasesBuilt >= 10
  },
  {
    id: 'coleccionista',
    name: 'Coleccionista de Estaciones',
    emoji: '🏅',
    description: 'Desbloqueaste todas las estaciones del tren.',
    check: (p) => p.stationsCompleted.length >= STATIONS.length
  },
  {
    id: 'estrella-fugaz',
    name: 'Estrella Fugaz',
    emoji: '🌟',
    description: 'Acumulaste 50 estrellas.',
    check: (p) => p.stars >= 50
  }
];
