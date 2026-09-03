# 🚂 El Tren de las Palabras

Comunicador de Comunicación Aumentativa y Alternativa (CAA) + juego
educativo de vocabulario, en una sola aplicación web. Usa pictogramas
**reales** del banco público [ARASAAC](https://arasaac.org), buscados
en vivo por su API — no son emojis ni imágenes inventadas.

## Estructura del proyecto

```
comunicador-pictogramas/
├── index.html            → página única con pestañas Comunicador / Juego
├── css/
│   └── style.css         → todos los estilos (tokens de diseño al inicio)
├── js/
│   ├── data.js            → vocabulario, categorías, estaciones e insignias
│   ├── arasaac.js          → búsqueda y caché de pictogramas de ARASAAC
│   ├── ui.js                → tarjetas de pictograma, avisos, confeti, sonido
│   ├── communicator.js       → modo Comunicador (tren de frases + búsqueda)
│   ├── game.js                 → modo Juego (mapa de estaciones + minijuegos)
│   └── main.js                  → arranque de la app y cambio de pestañas
└── assets/
    └── audio/                    → los 5 MP3 de la canción de las vocales
```

Cada archivo tiene una única responsabilidad, así que si en el futuro
quieres tocar solo el juego, solo el comunicador, o solo el vocabulario,
sabes exactamente dónde entrar.

## Cómo ejecutarlo

No necesita instalación ni backend. Basta con servir la carpeta con
cualquier servidor estático (recomendado, para que las búsquedas a la
API de ARASAAC funcionen sin restricciones del navegador):

```bash
cd comunicador-pictogramas
python3 -m http.server 8080
# abre http://localhost:8080 en el navegador
```

También puedes abrir `index.html` haciendo doble clic, pero algunos
navegadores limitan las peticiones `fetch` desde `file://`; si el
catálogo se ve con las iniciales de colores en vez de los pictogramas
reales, usa el servidor local de arriba.

## Zona Abecedario

Una tercera pestaña con las 27 letras del español (incluye la Ñ). Al
tocar una letra se escucha su nombre (por ejemplo "H" se dice
"hache") y se abre una vista con 2 a 4 pictogramas reales de ARASAAC
cuyas palabras empiezan con esa letra; cada uno se puede tocar para
escuchar la palabra completa. El vocabulario de cada letra vive en
`js/alphabet.js`, en el arreglo `ALPHABET` — agregar una palabra es
tan simple como sumar `{ id: 'algo', word: 'Palabra' }` al arreglo
`words` de la letra correspondiente.

## Zona Vocales

Una pestaña con una canción por cada una de las 5 vocales. Al tocar
una vocal suena su canción completa en MP3; el botón "Cantar la
canción de las vocales" las reproduce las 5 seguidas.

**Los archivos de audio van en `www/assets/audio/`, con estos
nombres exactos (minúsculas, sin tildes ni espacios):**

| Vocal | Archivo |
|---|---|
| A | `assets/audio/vocal-a.mp3` |
| E | `assets/audio/vocal-e.mp3` |
| I | `assets/audio/vocal-i.mp3` |
| O | `assets/audio/vocal-o.mp3` |
| U | `assets/audio/vocal-u.mp3` |

Solo hace falta copiar los 5 MP3 con esos nombres dentro de esa
carpeta y volver a generar el APK (o el build de GitHub Actions); el
código ya los busca ahí (`js/vocales.js`). Si algún archivo falta o
no carga, esa vocal cae automáticamente a la voz de la app diciendo
la vocal y una palabra de ejemplo, para que nunca se quede muda.

## Modo Comunicador

- Toca los pictogramas para subirlos al "tren" y armar una frase.
- **🔊 Leer frase** la dice en voz alta (Web Speech API, español).
- El buscador **"¿No encuentras una palabra?"** consulta la API de
  ARASAAC en vivo por cualquier palabra y, si el resultado sirve, la
  agrega de forma permanente a tu catálogo (se guarda en el navegador).

## Modo Juego

El vocabulario se practica viajando en tren por 6 estaciones:

| Estación | Categoría | Mini-juego |
|---|---|---|
| Saludos | Social | Emparejar palabra ↔ pictograma |
| Familia | Personas | Memoria (parejas) |
| Acciones | Verbos | Emparejar |
| Objetos | Cosas | Memoria |
| Emociones | Sentimientos | Emparejar |
| Final | Mixta | Construir frases completas en orden |

Se gana ⭐ estrellas al completar estaciones y al hablar frases de 2+
palabras en el Comunicador. Con suficientes estrellas se desbloquean
las siguientes estaciones. También se coleccionan 5 insignias por
hitos (primera estación, memoria perfecta, 10 frases correctas, etc).
Todo el progreso se guarda en `localStorage`, sin necesidad de cuentas.

## Cómo agregar más vocabulario "de fábrica"

Edita `js/data.js` y agrega un objeto `{ id, word }` al arreglo de la
categoría que quieras dentro de `VOCABULARY`. El pictograma se buscará
solo la primera vez que cargue esa palabra (después queda cacheado).

```js
verbs: [
  // ...
  { id: 'saltar', word: 'Saltar' }
]
```

Si la palabra en español no encuentra buen resultado en ARASAAC,
agrega `keyword` con un término alternativo:

```js
{ id: 'porfavor', word: 'Por favor', keyword: 'por favor' }
```

## Crédito de los pictogramas

Los pictogramas son propiedad del Gobierno de Aragón y su autor
Sergio Palao, publicados por ARASAAC bajo licencia **CC BY-NC-SA**.
El crédito ya está incluido en el pie de página de la app — no lo
quites si publicas o compartes el proyecto, es una condición de uso
del banco de pictogramas.

## Ideas para seguir subiendo de nivel

- Agregar más categorías (lugares, comida, colores) siguiendo el
  mismo patrón de `data.js`.
- Un modo "historia": encadenar varias estaciones en una narrativa.
- Perfiles múltiples (por ejemplo, un niño/a por dispositivo) usando
  claves de `localStorage` distintas por perfil.
- Exportar el progreso a un archivo para compartirlo entre dispositivos.
