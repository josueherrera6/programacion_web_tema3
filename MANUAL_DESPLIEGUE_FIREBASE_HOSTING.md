# Manual mínimo para desplegar la aplicación en Firebase Hosting

## Objetivo

Este manual explica cómo compilar y publicar en producción esta aplicación Angular desde Windows, Linux o macOS.

Se utilizará únicamente:

- Node.js y npm;
- Firebase CLI;
- Firebase Hosting.

No se utilizarán emuladores, Firebase Functions, App Hosting ni despliegues automáticos con GitHub.

> Firebase Hosting publicará solamente el frontend Angular. La API y la base de datos deben estar previamente desplegadas, por ejemplo, en Railway.

---

## 1. Requisitos

### 1.1 Cuenta y proyecto de Firebase

1. Entra a [Firebase Console](https://console.firebase.google.com/).
2. Inicia sesión con una cuenta de Google.
3. Selecciona **Crear un proyecto**.
4. Asigna un nombre al proyecto.
5. Google Analytics no es necesario para este despliegue.
6. Cuando termine la creación, abre **Configuración del proyecto** y anota el **ID del proyecto**.

El sitio tendrá estas direcciones:

```text
https://ID-DEL-PROYECTO.web.app
https://ID-DEL-PROYECTO.firebaseapp.com
```

### 1.2 Node.js

Este proyecto utiliza Angular 21. Instala **Node.js 22 LTS**, versión `22.12.0` o posterior. La instalación de Node.js incluye npm.

- **Windows:** descarga y ejecuta el instalador `.msi` desde [nodejs.org](https://nodejs.org/).
- **macOS:** descarga y ejecuta el instalador `.pkg` desde [nodejs.org](https://nodejs.org/).
- **Linux:** instala Node.js 22 con el administrador de paquetes de tu distribución o con el método indicado en [nodejs.org](https://nodejs.org/).

Después de instalarlo, cierra y vuelve a abrir la terminal. Comprueba:

```bash
node --version
npm --version
```

La versión de Node debe comenzar con `v22` y ser, como mínimo, `v22.12.0`.

### 1.3 Terminal

Puedes utilizar:

- **Windows:** PowerShell, Símbolo del sistema o la terminal de Visual Studio Code.
- **Linux:** la terminal de tu distribución.
- **macOS:** Terminal o la terminal de Visual Studio Code.

Todos los comandos siguientes son iguales en los tres sistemas.

---

## 2. Abrir el proyecto

Descarga o copia la carpeta completa del proyecto. Después abre una terminal dentro de la carpeta raíz, es decir, donde se encuentran estos archivos:

```text
angular.json
package.json
package-lock.json
src/
```

Si utilizas Visual Studio Code:

1. Abre la carpeta del proyecto.
2. Selecciona **Terminal > Nueva terminal**.

Comprueba que estás en la ubicación correcta:

```bash
npm run
```

La salida debe incluir los scripts `start`, `build` y `test`.

---

## 3. Instalar las dependencias del proyecto

Ejecuta:

```bash
npm ci
```

`npm ci` instala exactamente las versiones registradas en `package-lock.json`.

No es necesario instalar Angular CLI de forma global. El proyecto ya incluye su propia versión de Angular CLI.

---

## 4. Configurar la API para producción

Actualmente, el servicio utiliza esta ruta:

```ts
private readonly url = '/api/productos';
```

Esa ruta funciona durante el desarrollo porque `ng serve` utiliza `src/proxy.conf.json`. El proxy de desarrollo no existe después de publicar la aplicación en Firebase.

Para conservar `/api` en desarrollo y utilizar Railway en producción, crea la carpeta:

```text
src/environments/
```

Dentro de ella crea `src/environments/environment.ts`:

```ts
export const environment = {
  apiUrl: ''
};
```

Crea también `src/environments/environment.production.ts`:

```ts
export const environment = {
  apiUrl: 'https://function-bun-production-74c72.up.railway.app'
};
```

En `angular.json`, dentro de:

```text
projects > tema3 > architect > build > configurations > production
```

agrega `fileReplacements`:

```json
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.production.ts"
  }
],
```

La sección `production` deberá conservar también las propiedades `budgets` y `outputHashing` que ya contiene.

Después, en `src/app/servicios/productos.ts`, agrega:

```ts
import { environment } from '../../environments/environment';
```

Sustituye:

```ts
private readonly url = '/api/productos';
```

por:

```ts
private readonly url = `${environment.apiUrl}/api/productos`;
```

De esta forma:

- `npm start` seguirá utilizando el proxy local;
- la compilación de producción llamará directamente a la API de Railway;
- ninguna contraseña de MySQL se guardará en Angular.

### Autorizar Firebase en el CORS de la API

En Railway, agrega los dominios de Firebase a la variable de orígenes permitidos de la API. Para el backend descrito en este proyecto, la variable es `ORIGENES_PERMITIDOS`:

```text
http://localhost:4200,https://ID-DEL-PROYECTO.web.app,https://ID-DEL-PROYECTO.firebaseapp.com
```

Sustituye `ID-DEL-PROYECTO` por el ID real y no agregues `/` al final de los dominios. Guarda la variable y vuelve a desplegar la API en Railway.

---

## 5. Generar la compilación de producción

Ejecuta desde la raíz:

```bash
npm run build
```

Este comando ejecuta internamente:

```bash
ng build
```

Se recomienda `npm run build` porque utiliza la versión de Angular CLI instalada en el proyecto. No requiere el comando `ng` global.

La compilación debe crear:

```text
dist/tema3/browser/index.html
```

Si el comando muestra un error, no continúes con el despliegue hasta corregirlo.

---

## 6. Instalar Firebase CLI

Firebase CLI se instala una sola vez en cada computadora:

```bash
npm install --global firebase-tools
```

Comprueba la instalación:

```bash
firebase --version
```

Después inicia sesión:

```bash
firebase login
```

El navegador se abrirá para autorizar la cuenta de Google. Utiliza la cuenta que tiene acceso al proyecto de Firebase.

---

## 7. Configurar Firebase Hosting

Este paso se realiza una sola vez por proyecto. Desde la raíz ejecuta:

```bash
firebase init hosting
```

Responde de la siguiente manera:

```text
Please select an option:
Use an existing project

Select a default Firebase project:
Selecciona el proyecto que creaste

What do you want to use as your public directory?
dist/tema3/browser

Configure as a single-page app (rewrite all urls to /index.html)?
Yes

Set up automatic builds and deploys with GitHub?
No
```

Si pregunta si debe sobrescribir `dist/tema3/browser/index.html`, responde:

```text
No
```

Al terminar se crearán `.firebaserc` y `firebase.json`.

Comprueba que `firebase.json` contenga:

```json
{
  "hosting": {
    "public": "dist/tema3/browser",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

La regla `rewrites` permite abrir directamente rutas de Angular, como `/productos` o `/productos/1`, sin recibir un error 404.

---

## 8. Desplegar a producción

Ejecuta:

```bash
firebase deploy --only hosting
```

Cuando termine correctamente, la terminal mostrará una dirección similar a:

```text
Hosting URL: https://ID-DEL-PROYECTO.web.app
```

Abre esa dirección y comprueba:

1. que cargue la página de inicio;
2. que funcionen las rutas de navegación;
3. que `/productos` muestre los datos de Railway;
4. que crear, editar y eliminar productos funcione;
5. que la consola del navegador no muestre errores de CORS.

---

## 9. Publicar cambios posteriores

Después del primer despliegue, cada nueva versión requiere solamente:

```bash
npm ci
npm run build
firebase deploy --only hosting
```

Si las dependencias no cambiaron y `node_modules` todavía existe, puede omitirse `npm ci`:

```bash
npm run build
firebase deploy --only hosting
```

No despliegues sin volver a ejecutar `npm run build`, porque Firebase publica el contenido ya generado dentro de `dist/tema3/browser`.

---

## 10. Solución de problemas frecuentes

### `node`, `npm` o `firebase` no se reconoce como comando

Cierra y vuelve a abrir la terminal. Si continúa el problema, revisa que Node.js se haya instalado correctamente y esté agregado al `PATH`.

### PowerShell impide ejecutar npm

Utiliza la terminal **Símbolo del sistema** de Windows o abre el proyecto en Visual Studio Code y cambia el perfil de la terminal a **Command Prompt**.

### La compilación no crea `dist/tema3/browser`

Confirma que ejecutaste el comando desde la raíz del proyecto:

```bash
npm run build
```

No configures `public` como `dist/tema3`; debe apuntar a:

```text
dist/tema3/browser
```

### Firebase muestra una página 404 al actualizar una ruta

Revisa que `firebase.json` contenga la reescritura hacia `/index.html` y vuelve a desplegar:

```bash
firebase deploy --only hosting
```

### La página abre, pero no aparecen los productos

Revisa:

- que `environment.production.ts` contenga la URL correcta de Railway;
- que hayas ejecutado `npm run build` después de modificar la URL;
- que la API de Railway esté activa;
- que `ORIGENES_PERMITIDOS` incluya los dos dominios de Firebase;
- que no exista una diagonal `/` al final de los orígenes permitidos.

### Se seleccionó el proyecto de Firebase equivocado

Ejecuta:

```bash
firebase use
firebase use ID-DEL-PROYECTO
```

Después vuelve a desplegar:

```bash
firebase deploy --only hosting
```

---

## Resumen de comandos

### Primera instalación y primer despliegue

```bash
npm ci
npm run build
npm install --global firebase-tools
firebase login
firebase init hosting
firebase deploy --only hosting
```

### Despliegues posteriores

```bash
npm run build
firebase deploy --only hosting
```

## Referencias oficiales

- [Compatibilidad de versiones de Angular](https://angular.dev/reference/versions)
- [Instalación y uso de Firebase CLI](https://firebase.google.com/docs/cli)
- [Inicio rápido de Firebase Hosting](https://firebase.google.com/docs/hosting/quickstart)
