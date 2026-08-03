# API de productos con Railway y MySQL

## Objetivo

La aplicación conservará la vista de tarjetas y agregará una tabla para consultar, registrar, editar y eliminar productos. Los datos se guardarán en MySQL y Angular nunca tendrá acceso a la contraseña de la base.

```text
Angular + PrimeNG
        │ solicitudes HTTP
        ▼
API con Node y Express en Railway
        │ red privada
        ▼
MySQL en Railway
```

> Railway ofrece actualmente un plan `Free` de USD 0 con USD 1 mensual de consumo. La prueba inicial proporciona USD 5 durante un máximo de 30 días. Es suficiente para una práctica breve y de poco uso, pero no debe presentarse como alojamiento ilimitado.

## Mapa del proyecto

```text
tema3/
├── backend/                         API separada de Angular
│   ├── package.json
│   ├── sql/
│   │   ├── 01_crear_tabla_productos.sql
│   │   └── 02_insertar_productos.sql
│   └── src/index.js
├── src/
│   ├── proxy.conf.json              proxy para ng serve
│   ├── environments/                URL local y URL de producción
│   └── app/
│       ├── app.config.ts            habilita HttpClient
│       ├── modelos/producto.ts
│       ├── servicios/productos.ts   consume la API
│       └── paginas/
│           ├── productos/           CRUD, tarjetas y tabla
│           └── detalle-producto/    consulta por identificador
├── angular.json
├── firebase.json                    publicación del frontend
└── .firebaserc                      proyecto Firebase seleccionado
```

## ¿Angular y la API van en el mismo repositorio?

Sí. Para esta práctica se utilizará **un solo repositorio de GitHub**. Esta organización se conoce como monorepositorio: contiene dos aplicaciones separadas, pero relacionadas.

```text
Repositorio de GitHub: tema3
│
├── package.json             dependencias y comandos de Angular
├── package-lock.json        versiones instaladas en Angular
├── angular.json
├── src/                     frontend Angular
│
└── backend/
    ├── package.json         dependencias y comando de la API
    ├── package-lock.json    versiones instaladas en la API
    ├── src/index.js
    └── sql/
```

Los dos archivos `package.json` no están duplicados por error:

| Archivo | Quién lo utiliza | Comando principal |
|---|---|---|
| `/package.json` | Angular en tu computadora | `ng serve` o `ng build` |
| `/backend/package.json` | Railway para ejecutar Express | `npm start` |

Railway se conectará al repositorio completo, pero se configurará **Root Directory = `/backend`**. Desde ese momento, para el servicio `api-productos`, Railway verá lo siguiente:

```text
Raíz que ve Railway
├── package.json
├── package-lock.json
├── src/index.js
└── sql/
```

Railway no compilará Angular. La publicación queda separada así:

```text
Un repositorio de GitHub
        │
        ├── /backend ─────────► Railway: servicio api-productos
        │                              │
        │                              └─► MySQL: otro servicio de Railway
        │
        └── /src + angular.json ─► Firebase Hosting: frontend
```

MySQL no es una carpeta ni otro repositorio. Railway lo crea como servicio administrado dentro del mismo proyecto donde vive la API.

Se podría utilizar un repositorio separado para la API, pero agregaría administración innecesaria para esta práctica. Todos los pasos siguientes asumen un solo repositorio.

## Mapa de rutas

| Ruta | Tipo | Función |
|---|---|---|
| `/productos` | Angular | Muestra tarjetas o tabla. |
| `/productos/:id` | Angular | Muestra el detalle. |
| `GET /api/productos` | API | Consulta todos los productos. |
| `GET /api/productos/:id` | API | Consulta uno. |
| `POST /api/productos` | API | Inserta. |
| `PUT /api/productos/:id` | API | Actualiza. |
| `DELETE /api/productos/:id` | API | Elimina. |

## Uso de terminales

- Si `ng serve` está activo al instalar paquetes o configurar el proxy, presiona `Ctrl + C`.
- Usa una terminal en la raíz `tema3/` para preparar el proyecto.
- Cuando vuelvas a ejecutar `ng serve`, déjalo activo y abre otra terminal para las pruebas con `curl`.
- No se instalará MySQL localmente y no se utilizarán emuladores.
- Después de modificar un archivo, guárdalo con `Ctrl + S` o `Cmd + S` antes de ejecutar la comprobación.

## Antes de comenzar

Necesitas:

- una cuenta de GitHub con acceso al repositorio;
- una cuenta de Railway vinculada con GitHub;
- una cuenta de Google para publicar Angular en Firebase Hosting;
- Node.js 22, npm, Angular CLI y Git.
- MySQL Workbench Community para ejecutar el script sobre Railway.

Abre una terminal en Visual Studio Code y confirma que estás en la raíz del proyecto. En esa carpeta deben aparecer `angular.json`, `package.json` y `src/`.

Ejecuta:

```bash
node --version
npm --version
ng version
git --version
git remote -v
```

Resultados esperados:

- `node --version` comienza con `v22`;
- `ng version` reconoce el proyecto Angular;
- `git remote -v` muestra el repositorio de GitHub.

Si `git remote -v` no muestra ningún repositorio, no continúes con el despliegue en Railway hasta conectar y publicar el proyecto en GitHub.

## Compatibilidad revisada

El proyecto actual utiliza Angular 21.2, pero su `package.json` todavía declara PrimeNG 22. PrimeNG 22 requiere Angular 22. No cambiaremos Angular; antes de comenzar ejecuta desde la raíz:

```bash
npm install primeng@21 @primeuix/themes@2
ng build
```

Continúa únicamente si la compilación termina sin errores. Esta corrección conserva el enfoque standalone y no reinstala el proyecto.

---

## Paso 1. Crear el backend

**Terminal:** raíz `tema3/`, con `ng serve` detenido.

```bash
mkdir -p backend/src backend/sql
cd backend
npm init -y
npm install express cors mysql2
```

Abre `backend/package.json` y sustituye todo por:

```json
{
  "name": "api-productos",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node src/index.js"
  },
  "engines": {
    "node": "22"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^5.1.0",
    "mysql2": "^3.14.0"
  }
}
```

Actualiza el archivo de bloqueo:

```bash
npm install
```

### Concepto

`express` crea la API, `mysql2` ejecuta SQL y `cors` limita qué sitios pueden llamar a la API desde un navegador.

**Comprueba:** dentro de `backend/` deben aparecer `package.json`, `package-lock.json`, `node_modules/`, `sql/` y `src/`.

**Pregunta:** ¿por qué las dependencias del backend se guardan fuera del `package.json` de Angular?

---

## Paso 2. Crear el script de la base de datos

En el explorador de Visual Studio Code abre `backend/sql/`.

### 2.1 Crear la estructura

Crea:

```text
01_crear_tabla_productos.sql
```

Agrega:

```sql
CREATE TABLE productos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);
```

Este primer script pertenece al lenguaje de definición de datos o **DDL**: describe cómo será la tabla.

### 2.2 Insertar los datos iniciales

Crea:

```text
02_insertar_productos.sql
```

Agrega:

```sql
INSERT INTO productos (nombre, descripcion, precio)
VALUES
  ('Teclado', 'Teclado compacto para practicar Angular.', 650.00),
  ('Ratón', 'Ratón inalámbrico de uso diario.', 420.00),
  ('Monitor', 'Monitor de 24 pulgadas.', 3200.00);

SELECT id, nombre, descripcion, precio, creado_en
FROM productos
ORDER BY id;
```

Guarda ambos archivos. Todavía no los ejecutes: primero crearemos MySQL en Railway.

El segundo script pertenece al lenguaje de manipulación de datos o **DML**: agrega y consulta filas.

### ¿Qué enseña el script?

| Instrucción | Función |
|---|---|
| `CREATE TABLE` | Define la estructura de la tabla. |
| `AUTO_INCREMENT` | Hace que MySQL genere el identificador. |
| `PRIMARY KEY` | Identifica cada fila de manera única. |
| `NOT NULL` | Impide guardar campos obligatorios vacíos. |
| `DECIMAL(10, 2)` | Guarda importes con dos decimales. |
| `DEFAULT CURRENT_TIMESTAMP` | Registra la fecha de creación. |
| `INSERT INTO` | Agrega los datos iniciales. |
| `SELECT` | Comprueba el contenido guardado. |

Los scripts deben ejecutarse en orden. Cada uno está pensado para ejecutarse una sola vez. Si repites el primero, MySQL indicará que la tabla ya existe; si repites el segundo, insertarás productos duplicados. No agregaremos `DROP TABLE` porque podría eliminar trabajo realizado por el grupo.

**Pregunta:** ¿por qué conviene que `precio` sea `DECIMAL` y no un texto?

---

## Paso 3. Crear la API

En el explorador de Visual Studio Code abre `backend/src/`. Presiona **Nuevo archivo**, escribe `index.js` y agrega:

```js
import cors from 'cors';
import express from 'express';
import mysql from 'mysql2/promise';

const aplicacion = express();
const puerto = Number(process.env.PORT ?? 3000);

const origenesPermitidos = (
  process.env.ORIGENES_PERMITIDOS ?? 'http://localhost:4200'
)
  .split(',')
  .map((origen) => origen.trim());

aplicacion.use(
  cors({
    origin(origen, continuar) {
      if (!origen || origenesPermitidos.includes(origen)) {
        continuar(null, true);
        return;
      }

      continuar(new Error('Origen no permitido por CORS.'));
    }
  })
);

aplicacion.use(express.json());

const conexion = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: Number(process.env.MYSQLPORT ?? 3306),
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 5,
  decimalNumbers: true
});

function validarProducto(datos) {
  const producto = {
    nombre: String(datos.nombre ?? '').trim(),
    descripcion: String(datos.descripcion ?? '').trim(),
    precio: Number(datos.precio)
  };

  if (
    !producto.nombre ||
    !producto.descripcion ||
    !Number.isFinite(producto.precio) ||
    producto.precio <= 0
  ) {
    return null;
  }

  return producto;
}

aplicacion.get('/', (_solicitud, respuesta) => {
  respuesta.json({ mensaje: 'API de productos en funcionamiento.' });
});

aplicacion.get('/api/productos', async (_solicitud, respuesta) => {
  try {
    const [productos] = await conexion.query(
      `SELECT id, nombre, descripcion, precio
       FROM productos ORDER BY id`
    );
    respuesta.json(productos);
  } catch (error) {
    console.error(error);
    respuesta.status(500).json({ mensaje: 'No fue posible consultar.' });
  }
});

aplicacion.get('/api/productos/:id', async (solicitud, respuesta) => {
  try {
    const [productos] = await conexion.execute(
      `SELECT id, nombre, descripcion, precio
       FROM productos WHERE id = ?`,
      [solicitud.params.id]
    );

    if (productos.length === 0) {
      respuesta.status(404).json({ mensaje: 'Producto no encontrado.' });
      return;
    }

    respuesta.json(productos[0]);
  } catch (error) {
    console.error(error);
    respuesta.status(500).json({ mensaje: 'No fue posible consultar.' });
  }
});

aplicacion.post('/api/productos', async (solicitud, respuesta) => {
  const producto = validarProducto(solicitud.body);

  if (!producto) {
    respuesta.status(400).json({ mensaje: 'Los datos no son válidos.' });
    return;
  }

  try {
    const [resultado] = await conexion.execute(
      `INSERT INTO productos (nombre, descripcion, precio)
       VALUES (?, ?, ?)`,
      [producto.nombre, producto.descripcion, producto.precio]
    );

    respuesta.status(201).json({ id: resultado.insertId, ...producto });
  } catch (error) {
    console.error(error);
    respuesta.status(500).json({ mensaje: 'No fue posible guardar.' });
  }
});

aplicacion.put('/api/productos/:id', async (solicitud, respuesta) => {
  const producto = validarProducto(solicitud.body);

  if (!producto) {
    respuesta.status(400).json({ mensaje: 'Los datos no son válidos.' });
    return;
  }

  try {
    const [resultado] = await conexion.execute(
      `UPDATE productos
       SET nombre = ?, descripcion = ?, precio = ?
       WHERE id = ?`,
      [
        producto.nombre,
        producto.descripcion,
        producto.precio,
        solicitud.params.id
      ]
    );

    if (resultado.affectedRows === 0) {
      respuesta.status(404).json({ mensaje: 'Producto no encontrado.' });
      return;
    }

    respuesta.json({ id: Number(solicitud.params.id), ...producto });
  } catch (error) {
    console.error(error);
    respuesta.status(500).json({ mensaje: 'No fue posible actualizar.' });
  }
});

aplicacion.delete('/api/productos/:id', async (solicitud, respuesta) => {
  try {
    const [resultado] = await conexion.execute(
      'DELETE FROM productos WHERE id = ?',
      [solicitud.params.id]
    );

    if (resultado.affectedRows === 0) {
      respuesta.status(404).json({ mensaje: 'Producto no encontrado.' });
      return;
    }

    respuesta.status(204).send();
  } catch (error) {
    console.error(error);
    respuesta.status(500).json({ mensaje: 'No fue posible eliminar.' });
  }
});

aplicacion.use((error, _solicitud, respuesta, _continuar) => {
  console.error(error);
  respuesta.status(403).json({ mensaje: error.message });
});

aplicacion.listen(puerto, '0.0.0.0', () => {
  console.log(`API disponible en el puerto ${puerto}.`);
});
```

La API no crea tablas ni inserta datos iniciales. Solamente atiende solicitudes y ejecuta las operaciones CRUD. Los signos `?` separan los datos de la instrucción SQL y ayudan a evitar inyección SQL.

No ejecutes todavía `npm start`: las variables de MySQL se crearán en Railway.

---

## Paso 4. Subir el backend, crear MySQL e importar el script

La terminal continúa dentro de `backend/`. Regresa a la raíz:

```bash
cd ..
```

Comprueba que realmente regresaste al repositorio Angular:

```bash
pwd
git rev-parse --show-toplevel
git branch --show-current
git remote -v
```

- Las dos primeras rutas deben terminar en la carpeta `tema3`.
- `git branch --show-current` muestra la rama que Railway deberá desplegar.
- `git remote -v` debe mostrar la dirección del repositorio de GitHub.

En este momento la carpeta local debe tener esta forma:

```text
tema3/                         raíz del repositorio
├── package.json                 Angular
├── package-lock.json            Angular
├── angular.json
├── src/
└── backend/
    ├── package.json             Express
    ├── package-lock.json        Express
    ├── src/index.js
    └── sql/
```

Antes de ejecutar `git add`, abre `.gitignore`. El proyecto actual ignora solamente el `node_modules` principal. Agrega al final:

```text
/backend/node_modules/
```

Esto evita subir miles de archivos instalados. Guarda `.gitignore` y comprueba:

```bash
git status --short
```

`backend/node_modules/` no debe aparecer en la lista.

Desde la raíz ejecuta:

```bash
git add .gitignore backend
git status
```

Revisa la lista antes de crear el commit. No debe incluir contraseñas, archivos `.env` ni `backend/node_modules/`. Sí debe incluir los dos scripts SQL, `backend/package.json`, `backend/package-lock.json` y `backend/src/index.js`.

Si la lista es correcta, ejecuta:

```bash
git commit -m "Agrega API de productos con MySQL"
git push
```

Si Git informa que la rama todavía no tiene un destino remoto, utiliza el nombre mostrado anteriormente:

```bash
git push -u origin NOMBRE-DE-TU-RAMA
```

Abre GitHub en el navegador y verifica que aparezcan:

```text
backend/package.json
backend/package-lock.json
backend/sql/01_crear_tabla_productos.sql
backend/sql/02_insertar_productos.sql
backend/src/index.js
```

### 4.1 Crear MySQL en Railway

En [Railway](https://railway.com/):

1. Inicia sesión con GitHub.
2. Crea **New Project > Empty Project**.
3. Selecciona **Create > Database > Add MySQL**.
4. Espera a que el servicio MySQL esté activo.

Abre el servicio MySQL y revisa:

```text
Variables
Data
Settings > Networking
```

Railway debe mostrar variables como `MYSQLUSER`, `MYSQLPASSWORD` y `MYSQLDATABASE`. En **Data** todavía no aparecerá la tabla `productos`.

### 4.2 Conectar MySQL Workbench

MySQL Workbench Community es un cliente gratuito. No instala ni emula la base de datos del proyecto: solamente permite enviar el script al MySQL real de Railway.

1. Descarga [MySQL Workbench Community](https://dev.mysql.com/downloads/workbench/).
2. Instálalo y ábrelo.
3. En Railway abre el servicio MySQL.
4. En **Settings > Networking**, localiza **TCP Proxy**.
5. Si no está activo, habilítalo para el puerto interno `3306`.
6. Anota el dominio y el puerto público asignados.
7. En Railway abre **Variables** y consulta `MYSQLUSER`, `MYSQLPASSWORD` y `MYSQLDATABASE`.

En MySQL Workbench presiona el botón `+` de **MySQL Connections** y captura:

| Campo | Valor |
|---|---|
| Connection Name | `MySQL Railway` |
| Connection Method | `Standard (TCP/IP)` |
| Hostname | Dominio del TCP Proxy, sin `https://` |
| Port | Puerto público del TCP Proxy |
| Username | Valor de `MYSQLUSER` |
| Password | Valor de `MYSQLPASSWORD` |
| Default Schema | Valor de `MYSQLDATABASE` |

Presiona **Test Connection**. Debe aparecer un mensaje de conexión correcta. Si Workbench ofrece guardar la contraseña en el llavero o bóveda del sistema, puedes aceptarlo; no la escribas en ningún archivo del proyecto.

### 4.3 Ejecutar el script SQL

1. Abre la conexión `MySQL Railway`.
2. En el panel **SCHEMAS**, haz doble clic sobre el esquema indicado por `MYSQLDATABASE`. Debe mostrarse en negritas.
3. Selecciona **File > Open SQL Script**.
4. Abre `backend/sql/01_crear_tabla_productos.sql`.
5. Presiona el icono del rayo para ejecutar todo el archivo.
6. Revisa **Action Output**. `CREATE TABLE` debe terminar sin errores.
7. Selecciona nuevamente **File > Open SQL Script**.
8. Abre `backend/sql/02_insertar_productos.sql`.
9. Presiona el icono del rayo.
10. La instrucción `SELECT` mostrará tres filas.
11. Regresa a Railway, abre **MySQL > Data** y actualiza la vista.

Debe aparecer:

```text
productos
├── 1  Teclado
├── 2  Ratón
└── 3  Monitor
```

No vuelvas a ejecutar `02_insertar_productos.sql` sobre la misma tabla. Los nuevos registros se agregarán después desde la API.

El TCP Proxy se utiliza únicamente para administrar MySQL desde Workbench. La API usará la red privada. Puedes desactivar el TCP Proxy al terminar la práctica de SQL y activarlo nuevamente cuando necesites administrar la base.

### 4.4 Desplegar la API

En el mismo proyecto de Railway:

1. Regresa al lienzo donde aparece el servicio MySQL.
2. Selecciona **Create > Empty Service**.
3. Asigna el nombre `api-productos`.
4. Abre el servicio `api-productos` y entra a **Settings**.
5. En **Root Directory**, escribe exactamente `/backend`.
6. En **Watch Paths**, agrega `/backend/**`.
7. En **Source**, presiona **Connect Repo**.
8. Selecciona el mismo repositorio donde está Angular.
9. Selecciona la rama donde hiciste `git push`.

Si el repositorio no aparece, abre la configuración de la aplicación Railway en GitHub y autoriza el repositorio. No crees otro repositorio como solución.

En **Settings**, revisa la configuración de construcción:

| Configuración | Valor |
|---|---|
| Root Directory | `/backend` |
| Watch Paths | `/backend/**` |
| Build Command | déjalo vacío; Railway instalará las dependencias |
| Start Command | `npm start` |

La opción esencial es **Root Directory**. Si se deja `/`, Railway intentará interpretar el `package.json` de Angular y no el de Express.

Ahora abre **Variables** en `api-productos`.

Si la base se llama `MySQL`, agrega:

```text
MYSQLHOST=${{MySQL.MYSQLHOST}}
MYSQLPORT=${{MySQL.MYSQLPORT}}
MYSQLUSER=${{MySQL.MYSQLUSER}}
MYSQLPASSWORD=${{MySQL.MYSQLPASSWORD}}
MYSQLDATABASE=${{MySQL.MYSQLDATABASE}}
ORIGENES_PERMITIDOS=http://localhost:4200
```

Utiliza el autocompletado de Railway. Si el servicio tiene otro nombre, sustituye `MySQL` por el nombre real.

No agregues una variable `PORT`. Railway la crea automáticamente y `index.js` ya la lee con `process.env.PORT`.

Aplica todos los cambios pendientes con **Deploy**. Espera a que el estado cambie a **Success**. Si aparece **Failed**, abre **Deployments > View Logs** antes de continuar.

Durante el despliegue Railway realizará, conceptualmente:

```text
Repositorio de GitHub
        │
        └── entra a /backend
                │
                ├── instala package-lock.json
                ├── ejecuta npm start
                └── inicia node src/index.js
```

Abre **Deployments > View Logs**. Debe aparecer un mensaje semejante a:

```text
API disponible en el puerto 12345.
```

El número cambia porque Railway asigna el puerto; no necesitas copiarlo.

Después:

1. Abre **Settings > Networking**.
2. Presiona **Generate Domain**.
3. Guarda la dirección, por ejemplo:

```text
https://api-productos-production.up.railway.app
```

La API se comunica con MySQL mediante la red privada; no le asignes el dominio ni el puerto públicos. El TCP Proxy queda reservado para Workbench. No copies credenciales en Angular.

**Comprueba:**

```text
https://TU-API.up.railway.app/
https://TU-API.up.railway.app/api/productos
```

La primera dirección muestra un mensaje y la segunda los tres productos.

---

## Paso 5. Probar las cuatro operaciones

Abre una segunda terminal. Sustituye `TU-API`.

```bash
# Consultar
curl https://TU-API.up.railway.app/api/productos

# Insertar
curl -X POST https://TU-API.up.railway.app/api/productos \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Bocinas","descripcion":"Bocinas USB","precio":850}'
```

La respuesta de `POST` incluye el nuevo `id`. Anótalo. En los dos comandos siguientes sustituye `ID-NUEVO` por ese número:

```bash
# Actualizar
curl -X PUT https://TU-API.up.railway.app/api/productos/ID-NUEVO \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Bocinas compactas","descripcion":"Bocinas USB","precio":900}'

# Eliminar
curl -i -X DELETE https://TU-API.up.railway.app/api/productos/ID-NUEVO
```

Al eliminar, el cuerpo queda vacío y el encabezado debe mostrar `204 No Content`. Ejecuta nuevamente `GET /api/productos` para confirmar que el registro desapareció.

Los verbos HTTP corresponden a SQL:

```text
GET → SELECT    POST → INSERT    PUT → UPDATE    DELETE → DELETE
```

**Pregunta:** ¿qué protege la API al impedir que Angular conozca el usuario y la contraseña de MySQL?

---

## Paso 6. Conectar Angular con la API

### 6.1 Configurar el proxy

Detén `ng serve` con `Ctrl + C`.

Crea `src/proxy.conf.json`:

```json
{
  "/api": {
    "target": "https://TU-API.up.railway.app",
    "secure": true,
    "changeOrigin": true
  }
}
```

En `angular.json`, dentro de `projects > tema3 > architect > serve`, agrega `options` antes de `configurations`:

```json
"options": {
  "proxyConfig": "src/proxy.conf.json"
},
```

### 6.2 Habilitar HTTP

En `src/app/app.config.ts`, agrega:

```ts
import { provideHttpClient } from '@angular/common/http';
```

Agrega `provideHttpClient()` al arreglo `providers`:

```ts
providers: [
  provideBrowserGlobalErrorListeners(),
  provideRouter(routes),
  provideHttpClient(),
  providePrimeNG({
```

### 6.3 Actualizar el modelo

Sustituye `src/app/modelos/producto.ts` por:

```ts
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
}

export type NuevoProducto = Omit<Producto, 'id'>;
```

### 6.4 Actualizar el servicio

Sustituye `src/app/servicios/productos.ts` por:

```ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NuevoProducto, Producto } from '../modelos/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductosServicio {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/productos';

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.url);
  }

  obtenerProductoPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.url}/${id}`);
  }

  crearProducto(producto: NuevoProducto): Observable<Producto> {
    return this.http.post<Producto>(this.url, producto);
  }

  actualizarProducto(producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.url}/${producto.id}`, producto);
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
```

Inicia nuevamente:

```bash
ng serve
```

Abre `http://localhost:4200/api/productos`. Si modificas el proxy después, reinicia `ng serve`. Deja esta terminal activa mientras realizas los pasos 7 y 8; Angular actualizará la aplicación al guardar los archivos.

---

## Paso 7. Implementar el CRUD sin perder las tarjetas

Sustituye `src/app/paginas/productos/productos.ts` por:

```ts
import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TarjetaProducto } from '../../compartidos/tarjeta-producto/tarjeta-producto';
import { NuevoProducto, Producto } from '../../modelos/producto';
import { ProductosServicio } from '../../servicios/productos';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CurrencyPipe,
    FormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    TableModule,
    TarjetaProducto
  ],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class Productos implements OnInit {
  private readonly servicio = inject(ProductosServicio);

  productos: Producto[] = [];
  modoVista: 'tarjetas' | 'tabla' = 'tarjetas';
  productoEditandoId: number | null = null;
  cargando = false;
  mensajeError = '';

  formulario: NuevoProducto = {
    nombre: '',
    descripcion: '',
    precio: 0
  };

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.servicio.obtenerProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.cargando = false;
      },
      error: () => {
        this.mensajeError = 'No fue posible cargar los productos.';
        this.cargando = false;
      }
    });
  }

  guardarProducto(): void {
    if (this.productoEditandoId !== null) {
      const producto = { id: this.productoEditandoId, ...this.formulario };

      this.servicio.actualizarProducto(producto).subscribe({
        next: () => this.finalizarOperacion(),
        error: () => this.mensajeError = 'No fue posible actualizar.'
      });
      return;
    }

    this.servicio.crearProducto(this.formulario).subscribe({
      next: () => this.finalizarOperacion(),
      error: () => this.mensajeError = 'No fue posible guardar.'
    });
  }

  editarProducto(producto: Producto): void {
    this.productoEditandoId = producto.id;
    this.formulario = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio
    };
  }

  eliminarProducto(id: number): void {
    if (!confirm('¿Deseas eliminar este producto?')) {
      return;
    }

    this.servicio.eliminarProducto(id).subscribe({
      next: () => this.finalizarOperacion(),
      error: () => this.mensajeError = 'No fue posible eliminar.'
    });
  }

  finalizarOperacion(): void {
    this.cancelarEdicion();
    this.cargarProductos();
  }

  cancelarEdicion(): void {
    this.productoEditandoId = null;
    this.formulario = { nombre: '', descripcion: '', precio: 0 };
  }
}
```

Sustituye `src/app/paginas/productos/productos.html` por:

```html
<header class="encabezado">
  <p>CATÁLOGO EN MYSQL</p>
  <h1>Administración de productos</h1>
</header>

<div class="selector-vista">
  <p-button
    label="Tarjetas"
    [outlined]="modoVista !== 'tarjetas'"
    (onClick)="modoVista = 'tarjetas'"
  />
  <p-button
    label="Tabla"
    [outlined]="modoVista !== 'tabla'"
    (onClick)="modoVista = 'tabla'"
  />
</div>

<section class="formulario-producto">
  <input pInputText placeholder="Nombre" [(ngModel)]="formulario.nombre" />
  <input
    pInputText
    placeholder="Descripción"
    [(ngModel)]="formulario.descripcion"
  />
  <input
    pInputText
    type="number"
    min="1"
    placeholder="Precio"
    [(ngModel)]="formulario.precio"
  />

  <p-button
    [label]="productoEditandoId !== null ? 'Actualizar' : 'Guardar'"
    (onClick)="guardarProducto()"
    [disabled]="
      !formulario.nombre.trim() ||
      !formulario.descripcion.trim() ||
      formulario.precio <= 0
    "
  />

  @if (productoEditandoId !== null) {
    <p-button
      label="Cancelar"
      severity="secondary"
      [outlined]="true"
      (onClick)="cancelarEdicion()"
    />
  }
</section>

@if (mensajeError) {
  <p class="error">{{ mensajeError }}</p>
}

@if (modoVista === 'tarjetas') {
  <section class="cuadricula">
    @for (producto of productos; track producto.id) {
      <app-tarjeta-producto [producto]="producto" />
    } @empty {
      <p>No hay productos registrados.</p>
    }
  </section>
} @else {
  <p-table [value]="productos" [loading]="cargando">
    <ng-template #header>
      <tr>
        <th>Nombre</th>
        <th>Descripción</th>
        <th>Precio</th>
        <th>Acciones</th>
      </tr>
    </ng-template>

    <ng-template #body let-producto>
      <tr>
        <td>{{ producto.nombre }}</td>
        <td>{{ producto.descripcion }}</td>
        <td>{{ producto.precio | currency: 'MXN' }}</td>
        <td class="acciones">
          <a [routerLink]="['/productos', producto.id]" pButton>
            <span pButtonLabel>Ver</span>
          </a>
          <p-button
            label="Editar"
            severity="secondary"
            [outlined]="true"
            (onClick)="editarProducto(producto)"
          />
          <p-button
            label="Eliminar"
            severity="danger"
            [outlined]="true"
            (onClick)="eliminarProducto(producto.id)"
          />
        </td>
      </tr>
    </ng-template>

    <ng-template #emptymessage>
      <tr>
        <td colspan="4">No hay productos registrados.</td>
      </tr>
    </ng-template>
  </p-table>
}
```

Abre `productos.css`. Conserva los estilos anteriores y agrega el siguiente bloque al final. Si alguna regla ya existe, sustituye esa regla en lugar de duplicarla:

```css
.selector-vista,
.acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selector-vista,
.formulario-producto {
  margin-bottom: 1rem;
}

.formulario-producto {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr auto auto;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 0.75rem;
}

.error {
  color: #b91c1c;
}

@media (max-width: 800px) {
  .formulario-producto {
    grid-template-columns: 1fr;
  }
}
```

---

## Paso 8. Adaptar el detalle a una respuesta asíncrona

En `src/app/paginas/detalle-producto/detalle-producto.ts`:

1. Cambia el import inicial:

```ts
import { Component, inject, OnInit } from '@angular/core';
```

2. Agrega:

```ts
import { Producto } from '../../modelos/producto';
```

3. Sustituye solamente la clase:

```ts
export class DetalleProducto implements OnInit {
  private readonly ruta = inject(ActivatedRoute);
  private readonly servicio = inject(ProductosServicio);

  producto: Producto | null = null;
  cargando = true;
  mostrarDialogo = false;

  ngOnInit(): void {
    const id = Number(this.ruta.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.cargando = false;
      return;
    }

    this.servicio.obtenerProductoPorId(id).subscribe({
      next: (producto) => {
        this.producto = producto;
        this.cargando = false;
      },
      error: () => {
        this.producto = null;
        this.cargando = false;
      }
    });
  }
}
```

En `detalle-producto.html`, sustituye la primera línea:

```html
@if (producto) {
```

por:

```html
@if (cargando) {
  <p-message severity="info">Cargando producto...</p-message>
} @else if (producto) {
```

No modifiques el resto del HTML.

---

## Paso 9. Comprobar la práctica

Si `ng serve` continúa activo desde el paso 6, no abras una segunda instancia. Espera a que la terminal indique que los cambios se compilaron. Si ya lo detuviste, ejecútalo nuevamente desde la raíz:

```bash
ng serve
```

Visita `http://localhost:4200/productos` y comprueba:

1. aparecen los productos iniciales;
2. los botones cambian entre tarjetas y tabla;
3. guardar inserta un producto;
4. editar y actualizar modifican el registro;
5. eliminar borra el registro;
6. ver abre `/productos/:id`;
7. al recargar, los datos permanecen en MySQL.

Después detén el servidor:

```text
Ctrl + C
```

Y compila:

```bash
ng build
```

---

## Paso 10. Publicar Angular y configurar CORS

Durante `ng serve`, el proxy usa `/api`. En producción Angular debe llamar al dominio real de Railway. Usaremos dos archivos de configuración para no cambiar la URL manualmente.

### 10.1 Crear las configuraciones de Angular

Crea la carpeta `src/environments`. Puedes hacerlo desde el explorador de Visual Studio Code o desde la raíz:

```bash
mkdir -p src/environments
```

Crea `src/environments/environment.ts`:

```ts
export const environment = {
  apiUrl: ''
};
```

Crea `src/environments/environment.production.ts`:

```ts
export const environment = {
  apiUrl: 'https://TU-API.up.railway.app'
};
```

En `angular.json`, dentro de `build > configurations > production`, agrega:

```json
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.production.ts"
  }
],
```

En `src/app/servicios/productos.ts`, agrega:

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

Así, `ng serve` utiliza el proxy y `ng build` utiliza automáticamente la URL de Railway.

Guarda todo y comprueba primero el desarrollo:

```bash
ng serve
```

Visita `/productos`. Si funciona, detén el servidor con `Ctrl + C`.

### 10.2 Crear el proyecto para Firebase Hosting

Firebase Hosting alojará únicamente los archivos estáticos de Angular. No se crearán Functions, Firestore ni emuladores.

1. Entra a [Firebase Console](https://console.firebase.google.com/).
2. Presiona **Crear un proyecto**.
3. Escribe un nombre, por ejemplo `catalogo-angular-grupo`.
4. Google Analytics no es necesario para esta práctica.
5. Espera a que termine la creación.
6. Abre **Configuración del proyecto** y anota el **ID del proyecto**.

Las direcciones públicas serán:

```text
https://ID-PROYECTO.web.app
https://ID-PROYECTO.firebaseapp.com
```

Firebase Hosting puede utilizarse con el plan Spark, sin registrar un método de pago, mientras se respeten sus cuotas gratuitas.

### 10.3 Autorizar el frontend en Railway

Abre:

```text
api-productos > Variables > ORIGENES_PERMITIDOS
```

Configura, sin diagonal final:

```text
http://localhost:4200,https://ID-PROYECTO.web.app,https://ID-PROYECTO.firebaseapp.com
```

Aplica el cambio con **Deploy**.

No uses `ORIGENES_PERMITIDOS=*`. CORS debe autorizar únicamente los dominios conocidos.

```text
localhost:4200 ───────────────┐
                              ├── permitidos
ID-PROYECTO.web.app ──────────┘

otro-sitio.example ─────────────── rechazado
```

> CORS no sustituye un inicio de sesión. Para esta práctica evita almacenar información sensible, porque cualquier programa externo puede enviar solicitudes directamente a una API pública.

### 10.4 Compilar Angular

Desde la raíz ejecuta:

```bash
ng build
```

Comprueba que exista:

```text
dist/tema3/browser/index.html
```

Si el nombre de la carpeta generada es diferente, utiliza la ruta que muestre `ng build` en los pasos siguientes.

### 10.5 Instalar e iniciar Firebase Hosting

Instala la herramienta una sola vez:

```bash
npm install -g firebase-tools
firebase --version
firebase login
```

`firebase login` abre el navegador. Inicia sesión con la misma cuenta utilizada para crear el proyecto.

Desde la raíz ejecuta:

```bash
firebase init hosting
```

Responde:

```text
Use an existing project: selecciona el proyecto creado
Public directory: dist/tema3/browser
Configure as a single-page app: Yes
Set up automatic builds and deploys with GitHub: No
```

Si pregunta si debe sobrescribir `dist/tema3/browser/index.html`, responde **No**.

Al terminar deben aparecer:

```text
.firebaserc
firebase.json
```

Abre `firebase.json` y comprueba que la sección de Hosting sea equivalente a:

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

La reescritura permite abrir directamente rutas como `/productos/1` sin recibir un error 404 de Hosting.

### 10.6 Desplegar y comprobar

Ejecuta:

```bash
firebase deploy --only hosting
```

La terminal mostrará la dirección terminada en `.web.app`. Ábrela y comprueba:

1. inicio y navegación;
2. consulta de productos;
3. cambio entre tarjetas y tabla;
4. registro, actualización y eliminación;
5. acceso directo a `/productos/1`;
6. recarga de la página sin error 404;
7. ausencia de errores CORS en la consola del navegador.

Para publicar cambios posteriores:

```bash
ng build
firebase deploy --only hosting
```

La API se vuelve a desplegar automáticamente cuando se hace `git push` con cambios en `backend/`. Las modificaciones solamente visuales no requieren cambiar MySQL.

### 10.7 Guardar la configuración del proyecto

Antes de crear el commit revisa:

```bash
git status
```

No deben aparecer contraseñas, archivos `.env` ni `node_modules`.

Agrega únicamente los archivos de la práctica que hayas revisado:

```bash
git add angular.json firebase.json .firebaserc \
  src/proxy.conf.json \
  src/environments \
  src/app/app.config.ts \
  src/app/modelos/producto.ts \
  src/app/servicios/productos.ts \
  src/app/paginas/productos \
  src/app/paginas/detalle-producto
git status
git commit -m "Conecta Angular con la API de productos"
git push
```

---

## Paso 11. Errores frecuentes y control de consumo

### Error de CORS

Verifica que el origen mostrado por el navegador coincida exactamente con `ORIGENES_PERMITIDOS`. Guarda la variable y vuelve a desplegar la API.

### `404` desde localhost

Revisa `src/proxy.conf.json` y `angular.json`. Después reinicia `ng serve`; el proxy no se recarga automáticamente.

### `ECONNREFUSED` o `ENOTFOUND`

Revisa las variables de referencia `MYSQLHOST` y `MYSQLPORT`. La API y MySQL deben estar en el mismo proyecto de Railway.

### Workbench no logra conectarse

Comprueba que:

- el TCP Proxy de MySQL esté activo;
- el hostname no incluya `https://`;
- estés usando el puerto público del TCP Proxy;
- el usuario y la contraseña provengan del servicio MySQL;
- no estés usando el hostname privado `MYSQLHOST` desde tu computadora.

### `Table 'productos' doesn't exist`

La API está conectada, pero falta el esquema. Ejecuta primero `01_crear_tabla_productos.sql` y después `02_insertar_productos.sql` en el mismo valor de `MYSQLDATABASE`.

### `Table 'productos' already exists`

El primer script ya fue ejecutado. No lo repitas. Continúa con el segundo únicamente si todavía no insertaste los datos iniciales.

### Aparecen productos duplicados

Se ejecutó más de una vez `02_insertar_productos.sql`. Elimina los registros duplicados desde la tabla de Railway o mediante el botón **Eliminar** de Angular. No vuelvas a importar el segundo script.

### `Application failed to respond`

Abre **api-productos > Deployments > View Logs**. Comprueba que Railway use `/backend`, ejecute `npm start` y entregue la variable `PORT`.

### Evitar consumo innecesario

- Usa un proyecto de Railway por grupo.
- No dupliques servicios MySQL.
- Conserva `connectionLimit: 5`.
- Revisa **Usage** durante la práctica.
- Elimina servicios que ya no se necesiten.
- Respalda cualquier dato importante antes de que termine la prueba.

## Fuentes oficiales

- [Planes de Railway](https://docs.railway.com/pricing/plans)
- [Prueba gratuita](https://docs.railway.com/pricing/free-trial)
- [MySQL en Railway](https://docs.railway.com/databases/mysql)
- [Desplegar Express](https://docs.railway.com/guides/express)
- [Desplegar un monorepositorio en Railway](https://docs.railway.com/deployments/monorepo)
- [Variables de Railway](https://docs.railway.com/variables)
- [Vista de bases de datos de Railway](https://docs.railway.com/databases/database-view)
- [MySQL Workbench Community](https://dev.mysql.com/downloads/workbench/)
- [Importación SQL con MySQL Workbench](https://dev.mysql.com/doc/workbench/en/wb-admin-export-import-management.html)
- [Guía oficial de Firebase Hosting](https://firebase.google.com/docs/hosting/quickstart)
- [Precios y cuotas de Firebase](https://firebase.google.com/pricing)

## Comprobación final

- [ ] La API y MySQL están en el mismo proyecto de Railway.
- [ ] Las credenciales solo existen como variables del backend.
- [ ] Funcionan `GET`, `POST`, `PUT` y `DELETE`.
- [ ] Angular conserva tarjetas y tabla.
- [ ] El detalle consulta la API por identificador.
- [ ] El proxy funciona con `ng serve`.
- [ ] CORS permite localhost y el frontend publicado.
- [ ] `ng build` termina sin errores.

La idea central es:

```text
Angular → API → MySQL
```

La API protege las credenciales, valida los datos y controla las consultas SQL que puede ejecutar el frontend.
