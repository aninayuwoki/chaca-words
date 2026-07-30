# Cómo convertir "El Tren de las Palabras" en una APK instalable

Este proyecto ya está listo (envuelto con **Capacitor**, no Flutter — tu
HTML/CSS/JS original queda intacto en `www/`, no se reescribió nada).
Capacitor mete tu web app dentro de un WebView nativo de Android, así
que las búsquedas a la API de ARASAAC, el `localStorage` y el
`speechSynthesis` siguen funcionando igual que en el navegador.

Solo falta un paso que **no se puede hacer en este sandbox** (no tiene
Android SDK ni acceso a los servidores de Google/Gradle): compilar el
`.apk` final. Tienes dos caminos, elige el que te acomode:

## Opción A — GitHub Actions (recomendada, no instalas nada)

1. Sube esta carpeta completa a un repositorio de GitHub (público o
   privado, da igual).
2. Ya incluye el workflow `.github/workflows/build-apk.yml`. En cuanto
   hagas push a `main`, GitHub compila la APK automáticamente.
3. Ve a la pestaña **Actions** del repo → entra a la ejecución → baja
   hasta **Artifacts** → descarga `tren-de-las-palabras-debug-apk`.
4. Ese `.zip` trae el `app-debug.apk`. Pásalo a tu celular (o instálalo
   desde el propio teléfono si clonas el repo con Termux) y ábrelo
   para instalar (activa "orígenes desconocidos" si Android lo pide).

Esta es una APK de **debug**, perfecta para instalar y probar en tu
celular o el de quien la vaya a usar. Para publicarla en Play Store
más adelante habría que generarla en modo "release" y firmarla con una
keystore (te ayudo con eso cuando llegue el momento).

## Opción B — Local, con Android Studio en tu Arch

```bash
# Dependencias del sistema (AUR/pacman)
sudo pacman -S jdk21-openjdk
yay -S android-studio

npm install
npx cap sync android
npx cap open android
```

Esto abre el proyecto en Android Studio. Ahí:
- Deja que baje el SDK/Gradle la primera vez (necesita internet).
- `Build → Build Bundle(s) / APK(s) → Build APK(s)`.
- El APK queda en `android/app/build/outputs/apk/debug/app-debug.apk`.

También puedes usar la CLI sin abrir la IDE, una vez tengas el SDK
instalado (`sudo pacman -S android-tools` no basta, necesitas el SDK
completo vía Android Studio o `sdkmanager`):

```bash
cd android
./gradlew assembleDebug
```

## Cosas que ya están resueltas en el proyecto

- Permiso `INTERNET` ya agregado en `AndroidManifest.xml` (lo necesitas
  para las peticiones a `api.arasaac.org` / `static.arasaac.org`).
- `appId`: `com.trendelaspalabras.caa` — cámbialo en
  `capacitor.config.json` antes de publicar si quieres otro.
- Nombre de la app: "El Tren de las Palabras".

## Cosas que te conviene revisar antes de instalar en el celular de un niño

1. **Ícono y splash screen**: ahora mismo usa el ícono genérico de
   Capacitor. Cuando tengas un ícono propio, `npx cap` tiene un
   generador (`@capacitor/assets`) que te lo reparte en todas las
   resoluciones automáticamente.
2. **Voz**: la app usa el plugin nativo
   `@capacitor-community/text-to-speech`, que habla con el motor TTS
   real de Android (el mismo que usan TalkBack y el Lector de Google),
   en vez de depender del Web Speech API del WebView, que en muchos
   dispositivos Android no trae voces instaladas y se queda mudo sin
   avisar. `npm install` + `npx cap sync android` (ya están en el
   workflow de GitHub Actions) instalan y registran el plugin
   automáticamente, no hace falta tocar nada más. Si por algún motivo
   el plugin nativo no está disponible (por ejemplo si abres `www/`
   directo en un navegador de escritorio), la app cae sola al Web
   Speech API de siempre — no depende de una sola vía.
3. **Sin conexión**: la primera vez que carga cada palabra necesita
   internet para traer el pictograma de ARASAAC; después queda
   cacheada en `localStorage` y funciona offline. Si vas a usarla en
   un sitio sin wifi, conviene abrir la app una vez con internet para
   que precargue el catálogo completo.

## Cada vez que modifiques el sitio web

Si tocas algo en `www/` (o mejor, en tu carpeta original y luego
copias), corre:

```bash
npx cap sync android
```

y vuelve a compilar. Eso reempaqueta los archivos web dentro del
proyecto Android.
