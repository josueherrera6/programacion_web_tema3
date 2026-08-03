# Práctica guiada: aplicación de productos con Angular moderno

Esta guía está preparada específicamente para el proyecto actual `tema3`. Contiene todos los pasos, pero conviene realizar **uno por uno** y no continuar hasta que la comprobación del paso actual funcione.

## Diagnóstico del proyecto actual

La estructura revisada contiene, entre otros, estos archivos:

```text
src/app/
├── app.config.ts
├── app.css
├── app.html
├── app.routes.ts
├── app.spec.ts
├── app.ts
└── prueba/
    ├── prueba.css
    ├── prueba.html
    ├── prueba.spec.ts
    └── prueba.ts
```

Observaciones importantes:

- Este proyecto usa `app.ts` y `app.html`, no `app.component.ts` y `app.component.html`.
- Es un proyecto **standalone**: `main.ts` inicia la aplicación con `bootstrapApplication()` y `app.config.ts` registra las rutas con `provideRouter()`.
- `app.routes.ts` existe y actualmente no contiene rutas.
- Ya existe un componente `prueba`; no lo borraremos ni lo modificaremos.
- Aunque la práctica solicitada menciona Angular 20, `package.json` indica Angular **21.2**. No se cambiará ni reinstalará la versión. Las herramientas modernas usadas en esta guía también funcionan en este proyecto.
- El componente raíz contiene ejercicios anteriores de enlaces, eventos, `ngModel`, `@if` y `@for`. En un paso posterior sustituiremos su vista para convertirlo en el contenedor de la navegación.

> Regla de trabajo: ejecuta un paso, comprueba el resultado y contesta su pregunta antes de continuar.

---

## Paso 1. Crear el primer componente: Inicio

### Qué vamos a crear

Crearemos la primera página de la aplicación: `Inicio`. Un componente reúne una clase de TypeScript, una plantilla HTML y, opcionalmente, estilos CSS.

### Comando

Desde la raíz del proyecto ejecuta:

```bash
ng generate component paginas/inicio --skip-tests
```

La opción `--skip-tests` evita crear el archivo de prueba durante esta práctica. No uses `--module`, porque el proyecto es standalone.

### Archivos que debes comprobar

El comando debe crear:

```text
src/app/paginas/inicio/inicio.ts
src/app/paginas/inicio/inicio.html
src/app/paginas/inicio/inicio.css
```

En esta versión de Angular, el CLI usa nombres cortos como `inicio.ts`. No cambies el nombre a `inicio.component.ts`.

### Código

Abre `src/app/paginas/inicio/inicio.html` y sustituye todo su contenido por:

```html
<h1>Inicio</h1>
<p>Bienvenido a nuestra aplicación de productos.</p>
```

### Cómo comprobarlo

Por ahora basta con confirmar que los tres archivos existen y que la terminal no mostró errores. Todavía no veremos el componente en el navegador porque aún no tiene una ruta.

**Pregunta:** ¿qué archivo controla la vista del componente: `inicio.ts` o `inicio.html`?

---

## Paso 2. Entender el decorador `@Component`

### Qué vamos a revisar

Abre `src/app/paginas/inicio/inicio.ts`. Debe parecerse a esto:

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {}
```

Si el CLI no escribió `standalone: true`, puedes agregarlo debajo de `selector`. En Angular moderno, standalone ya es el valor predeterminado, pero aquí lo dejamos explícito para aprenderlo.

### Para qué sirve cada parte

- `selector` es el nombre con el que el componente podría insertarse en otra plantilla.
- `standalone: true` indica que no necesita declararse en un `NgModule`.
- `imports` contiene las dependencias que usa su plantilla.
- `templateUrl` enlaza el archivo HTML.
- `styleUrl` enlaza el archivo CSS.
- `export class Inicio` contiene los datos y métodos del componente.

### Comando

No necesitas ejecutar otro comando.

### Cómo comprobarlo

Guarda el archivo y confirma que Visual Studio Code no marque errores en rojo.

**Pregunta:** ¿para qué sirve la propiedad `imports` de un componente standalone?

---

## Paso 3. Crear las demás páginas

### Qué vamos a crear

Crearemos las páginas de productos, detalle, contacto y error 404. Todavía no configuraremos sus rutas.

### Comandos

Ejecuta cada comando por separado:

```bash
ng generate component paginas/productos --skip-tests
ng generate component paginas/detalle-producto --skip-tests
ng generate component paginas/contacto --skip-tests
ng generate component paginas/no-encontrado --skip-tests
```

### Código inicial

Sustituye el contenido de cada HTML por el indicado.

`src/app/paginas/productos/productos.html`:

```html
<h1>Productos</h1>
<p>Aquí aparecerá nuestro catálogo.</p>
```

`src/app/paginas/detalle-producto/detalle-producto.html`:

```html
<h1>Detalle del producto</h1>
<p>Aquí aparecerá la información de un producto.</p>
```

`src/app/paginas/contacto/contacto.html`:

```html
<h1>Contacto</h1>
<p>Aquí construiremos un formulario.</p>
```

`src/app/paginas/no-encontrado/no-encontrado.html`:

```html
<h1>Error 404</h1>
<p>La página solicitada no existe.</p>
```

### Cómo comprobarlo

Comprueba que cada carpeta tenga sus archivos `.ts`, `.html` y `.css`, sin errores en la terminal.

**Pregunta:** ¿por qué una página puede ser también un componente?

---

## Paso 4. Configurar las primeras rutas

### Qué vamos a modificar

Una ruta relaciona una dirección del navegador con un componente. Empezaremos con Inicio, Productos y Contacto.

### Archivo

Abre `src/app/app.routes.ts` y sustituye todo su contenido por:

```ts
import { Routes } from '@angular/router';
import { Contacto } from './paginas/contacto/contacto';
import { Inicio } from './paginas/inicio/inicio';
import { Productos } from './paginas/productos/productos';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'productos', component: Productos },
  { path: 'contacto', component: Contacto }
];
```

### Comando

Inicia el servidor de desarrollo:

```bash
npm start
```

Déjalo ejecutándose. Si necesitas escribir otro comando, abre una segunda terminal.

### Cómo comprobarlo

La terminal mostrará una dirección local, normalmente `http://localhost:4200`. Todavía puede seguir apareciendo el contenido anterior de `app.html`; eso es normal porque falta colocar el `router-outlet`.

**Pregunta:** ¿qué diferencia observas entre `path: ''` y `path: 'productos'`?

---

## Paso 5. Usar `router-outlet`

### Qué vamos a modificar

`router-outlet` es el espacio donde Angular dibuja el componente correspondiente a la URL actual.

### Archivos

Primero abre `src/app/app.ts`. Sustituye todo su contenido por:

```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
```

Después abre `src/app/app.html` y sustituye todo el contenido de los ejercicios anteriores por:

```html
<main>
  <router-outlet />
</main>
```

No debes cambiar `main.ts` ni `app.config.ts`.

### Cómo comprobarlo

Visita estas direcciones:

```text
http://localhost:4200/
http://localhost:4200/productos
http://localhost:4200/contacto
```

El contenido debe cambiar sin reiniciar el servidor.

**Pregunta:** ¿qué componente aparece dentro de `router-outlet` al visitar `/productos`?

---

## Paso 6. Crear la barra de navegación reutilizable

### Qué vamos a crear

Crearemos un componente que se mantendrá visible mientras cambian las páginas.

### Comando

```bash
ng generate component compartidos/barra-navegacion --skip-tests
```

### Código del componente

Abre `src/app/compartidos/barra-navegacion/barra-navegacion.ts` y sustituye todo por:

```ts
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-barra-navegacion',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './barra-navegacion.html',
  styleUrl: './barra-navegacion.css'
})
export class BarraNavegacion {}
```

Abre `barra-navegacion.html` y sustituye todo por:

```html
<nav>
  <a routerLink="/" routerLinkActive="activo" [routerLinkActiveOptions]="{ exact: true }">
    Inicio
  </a>
  <a routerLink="/productos" routerLinkActive="activo">Productos</a>
  <a routerLink="/contacto" routerLinkActive="activo">Contacto</a>
</nav>
```

Abre `barra-navegacion.css` y agrega:

```css
nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

a {
  color: #174ea6;
  text-decoration: none;
}

a.activo {
  font-weight: bold;
  text-decoration: underline;
}
```

### Insertar la barra en el componente raíz

En `src/app/app.ts`, agrega este import debajo de los imports existentes:

```ts
import { BarraNavegacion } from './compartidos/barra-navegacion/barra-navegacion';
```

Sustituye:

```ts
imports: [RouterOutlet],
```

por:

```ts
imports: [RouterOutlet, BarraNavegacion],
```

En `src/app/app.html`, agrega la barra antes de `<main>`:

```html
<app-barra-navegacion />

<main>
  <router-outlet />
</main>
```

### Cómo comprobarlo

Haz clic en los tres enlaces. Deben cambiar la URL y el contenido sin recargar toda la página. El enlace actual debe verse resaltado.

**Pregunta:** ¿por qué usamos `routerLink` en vez de un `href` común para navegar dentro de Angular?

---

## Paso 7. Crear el modelo de producto

### Qué vamos a crear

Una interfaz define la forma que tendrá cada producto. Esto permite que TypeScript detecte datos incompletos o incorrectos.

### Comando

```bash
ng generate interface modelos/producto
```

### Archivo

Abre `src/app/modelos/producto.ts` y sustituye todo por:

```ts
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
}
```

### Cómo comprobarlo

Guarda el archivo. No aparecerá nada nuevo en el navegador porque una interfaz solo ayuda durante el desarrollo y no genera una vista.

**Pregunta:** ¿qué error esperarías si intentamos crear un `Producto` sin la propiedad `precio`?

---

## Paso 8. Crear el servicio local de productos

### Qué vamos a crear

El servicio concentrará los datos y las operaciones de productos para evitar repetirlos en varios componentes.

### Comando

```bash
ng generate service servicios/productos --skip-tests
```

### Archivo

Abre `src/app/servicios/productos.ts` y sustituye todo por:

```ts
import { Injectable } from '@angular/core';
import { Producto } from '../modelos/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductosServicio {
  private readonly productos: Producto[] = [
    {
      id: 1,
      nombre: 'Teclado',
      descripcion: 'Teclado compacto para practicar Angular.',
      precio: 650
    },
    {
      id: 2,
      nombre: 'Ratón',
      descripcion: 'Ratón inalámbrico de uso diario.',
      precio: 420
    },
    {
      id: 3,
      nombre: 'Monitor',
      descripcion: 'Monitor de 24 pulgadas.',
      precio: 3200
    }
  ];

  obtenerProductos(): Producto[] {
    return this.productos;
  }

  obtenerProductoPorId(id: number): Producto | undefined {
    return this.productos.find((producto) => producto.id === id);
  }
}
```

`providedIn: 'root'` hace que Angular pueda proporcionar una sola instancia del servicio en toda la aplicación.

### Cómo comprobarlo

Guarda y confirma que no existan errores. Aún no veremos los datos hasta inyectar el servicio en una página.

**Pregunta:** ¿qué ventaja tiene guardar los productos en un servicio en vez de escribirlos directamente en la plantilla?

---

## Paso 9. Mostrar la lista con `inject()` y `@for`

### Qué vamos a modificar

La página Productos solicitará los datos al servicio mediante inyección de dependencias. `@for` repetirá el HTML por cada producto.

### TypeScript

Abre `src/app/paginas/productos/productos.ts` y sustituye todo por:

```ts
import { Component, inject } from '@angular/core';
import { ProductosServicio } from '../../servicios/productos';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class Productos {
  private readonly productosServicio = inject(ProductosServicio);
  readonly productos = this.productosServicio.obtenerProductos();
}
```

### HTML

Abre `src/app/paginas/productos/productos.html` y sustituye todo por:

```html
<h1>Productos</h1>

@for (producto of productos; track producto.id) {
  <article>
    <h2>{{ producto.nombre }}</h2>
    <p>{{ producto.descripcion }}</p>
    <p>Precio: ${{ producto.precio }}</p>
  </article>
} @empty {
  <p>No hay productos disponibles.</p>
}
```

### Cómo comprobarlo

Visita `/productos`. Deben aparecer tres productos. `track producto.id` ayuda a Angular a identificar cada elemento si la lista cambia.

**Pregunta:** ¿qué función cumple `inject(ProductosServicio)`?

---

## Paso 10. Crear un componente hijo reutilizable

### Qué vamos a crear

Extraeremos la presentación de cada producto a una tarjeta reutilizable. La página será el componente padre y cada tarjeta será un componente hijo.

### Comando

```bash
ng generate component compartidos/tarjeta-producto --skip-tests
```

### TypeScript del hijo

Abre `src/app/compartidos/tarjeta-producto/tarjeta-producto.ts` y sustituye todo por:

```ts
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Producto } from '../../modelos/producto';

@Component({
  selector: 'app-tarjeta-producto',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tarjeta-producto.html',
  styleUrl: './tarjeta-producto.css'
})
export class TarjetaProducto {
  readonly producto = input.required<Producto>();
}
```

### HTML del hijo

Abre `tarjeta-producto.html` y sustituye todo por:

```html
<article>
  <h2>{{ producto().nombre }}</h2>
  <p>{{ producto().descripcion }}</p>
  <p>Precio: ${{ producto().precio }}</p>
  <a [routerLink]="['/productos', producto().id]">Ver detalle</a>
</article>
```

Observa los paréntesis en `producto()`: `input()` crea una señal de entrada y se lee como función.

### Usarlo desde la página padre

En `src/app/paginas/productos/productos.ts`, agrega:

```ts
import { TarjetaProducto } from '../../compartidos/tarjeta-producto/tarjeta-producto';
```

Sustituye:

```ts
imports: [],
```

por:

```ts
imports: [TarjetaProducto],
```

En `productos.html`, sustituye todo por:

```html
<h1>Productos</h1>

@for (producto of productos; track producto.id) {
  <app-tarjeta-producto [producto]="producto" />
} @empty {
  <p>No hay productos disponibles.</p>
}
```

### Cómo comprobarlo

Visita `/productos`. La lista debe conservar los mismos datos y ahora cada producto tendrá el enlace “Ver detalle”. El enlace todavía no funcionará correctamente porque falta la ruta con parámetro.

**Pregunta:** en `[producto]="producto"`, ¿cuál pertenece al componente hijo y cuál es la variable del padre?

---

## Paso 11. Crear una ruta con parámetro

### Qué vamos a modificar

Una ruta como `/productos/1` lleva un valor variable llamado `id`.

### Archivo

En `src/app/app.routes.ts`, agrega este import:

```ts
import { DetalleProducto } from './paginas/detalle-producto/detalle-producto';
```

Después agrega la nueva ruta inmediatamente después de la ruta `productos`:

```ts
{ path: 'productos/:id', component: DetalleProducto },
```

El arreglo debe quedar temporalmente así:

```ts
export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'productos', component: Productos },
  { path: 'productos/:id', component: DetalleProducto },
  { path: 'contacto', component: Contacto }
];
```

### Cómo comprobarlo

Desde `/productos`, haz clic en “Ver detalle”. La URL debe cambiar a `/productos/1`, `/productos/2` o `/productos/3`, y aparecerá el contenido provisional de la página de detalle.

**Pregunta:** ¿qué parte de `productos/:id` representa el valor variable?

---

## Paso 12. Leer el parámetro con `ActivatedRoute`

### Qué vamos a modificar

La página de detalle leerá el `id` de la URL, buscará el producto en el servicio y usará `@if` para manejar tanto el resultado encontrado como el inexistente.

### TypeScript

Abre `src/app/paginas/detalle-producto/detalle-producto.ts` y sustituye todo por:

```ts
import { Component, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductosServicio } from '../../servicios/productos';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './detalle-producto.html',
  styleUrl: './detalle-producto.css'
})
export class DetalleProducto {
  private readonly ruta = inject(ActivatedRoute);
  private readonly productosServicio = inject(ProductosServicio);

  private readonly idProducto = Number(this.ruta.snapshot.paramMap.get('id'));
  readonly producto = this.productosServicio.obtenerProductoPorId(this.idProducto);
}
```

### HTML

Abre `detalle-producto.html` y sustituye todo por:

```html
@if (producto) {
  <h1>{{ producto.nombre }}</h1>
  <p>{{ producto.descripcion }}</p>
  <p>Precio: ${{ producto.precio }}</p>
} @else {
  <h1>Producto no encontrado</h1>
  <p>No existe un producto con ese identificador.</p>
}

<a routerLink="/productos">Volver a productos</a>
```

### Cómo comprobarlo

Prueba estas direcciones:

```text
http://localhost:4200/productos/1
http://localhost:4200/productos/3
http://localhost:4200/productos/99
```

Las dos primeras deben mostrar productos distintos; la última debe mostrar “Producto no encontrado”.

**Pregunta:** ¿por qué usamos `Number(...)` al leer el parámetro `id`?

---

## Paso 13. Crear un formulario sencillo

### Qué vamos a modificar

Crearemos un formulario local con enlace bidireccional mediante `ngModel`. No enviará información a una API ni a una base de datos.

### TypeScript

Abre `src/app/paginas/contacto/contacto.ts` y sustituye todo por:

```ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css'
})
export class Contacto {
  nombre = '';
  correo = '';
  mensaje = '';
  enviado = false;

  enviar(): void {
    this.enviado = true;
  }
}
```

### HTML

Abre `contacto.html` y sustituye todo por:

```html
<h1>Contacto</h1>

<form #formulario="ngForm" (ngSubmit)="enviar()">
  <div>
    <label for="nombre">Nombre</label>
    <input id="nombre" name="nombre" [(ngModel)]="nombre" required />
  </div>

  <div>
    <label for="correo">Correo</label>
    <input id="correo" name="correo" type="email" [(ngModel)]="correo" required email />
  </div>

  <div>
    <label for="mensaje">Mensaje</label>
    <textarea id="mensaje" name="mensaje" [(ngModel)]="mensaje" required></textarea>
  </div>

  <button type="submit" [disabled]="formulario.invalid">Enviar</button>
</form>

@if (enviado) {
  <p>Gracias, {{ nombre }}. Tu mensaje se guardó solamente durante esta práctica.</p>
}
```

### Cómo comprobarlo

Visita `/contacto`. El botón debe permanecer deshabilitado hasta completar correctamente los tres campos. Al enviarlo debe aparecer el mensaje de confirmación, sin recargar la página.

**Pregunta:** ¿por qué cada control que usa `ngModel` dentro del formulario tiene un atributo `name`?

---

## Paso 14. Agregar la página de error 404

### Qué vamos a modificar

La ruta comodín `**` capturará cualquier dirección que no coincida con las rutas anteriores.

### Archivo

En `src/app/app.routes.ts`, agrega este import:

```ts
import { NoEncontrado } from './paginas/no-encontrado/no-encontrado';
```

Agrega al final del arreglo de rutas:

```ts
{ path: '**', component: NoEncontrado }
```

Recuerda agregar una coma después de la ruta anterior. La ruta `**` siempre debe ser la última.

Después abre `src/app/paginas/no-encontrado/no-encontrado.ts`, agrega el import:

```ts
import { RouterLink } from '@angular/router';
```

y sustituye su arreglo vacío:

```ts
imports: [],
```

por:

```ts
imports: [RouterLink],
```

En `no-encontrado.html`, sustituye todo por:

```html
<h1>Error 404</h1>
<p>La página solicitada no existe.</p>
<a routerLink="/">Volver al inicio</a>
```

### Cómo comprobarlo

Visita `http://localhost:4200/ruta-inexistente`. Debe aparecer la página 404 y el enlace debe regresar al inicio.

**Pregunta:** ¿qué ocurriría si colocáramos la ruta `**` al principio del arreglo?

---

## Paso 15. Aplicar carga diferida con `loadComponent`

### Qué vamos a modificar

La carga diferida permite descargar el código de una página cuando se necesita. Sustituiremos los imports directos por imports dinámicos.

### Archivo completo

Abre `src/app/app.routes.ts` y sustituye todo por:

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./paginas/inicio/inicio').then((archivo) => archivo.Inicio)
  },
  {
    path: 'productos',
    loadComponent: () =>
      import('./paginas/productos/productos').then((archivo) => archivo.Productos)
  },
  {
    path: 'productos/:id',
    loadComponent: () =>
      import('./paginas/detalle-producto/detalle-producto').then(
        (archivo) => archivo.DetalleProducto
      )
  },
  {
    path: 'contacto',
    loadComponent: () =>
      import('./paginas/contacto/contacto').then((archivo) => archivo.Contacto)
  },
  {
    path: '**',
    loadComponent: () =>
      import('./paginas/no-encontrado/no-encontrado').then(
        (archivo) => archivo.NoEncontrado
      )
  }
];
```

### Cómo comprobarlo

Primero verifica que todas las rutas sigan funcionando. Después detén el servidor con `Ctrl + C` y ejecuta:

```bash
npm run build
```

La compilación debe terminar sin errores y mostrar varios archivos de salida o fragmentos (*chunks*) asociados con las rutas diferidas.

**Pregunta:** ¿en qué momento se solicita el código de la página Contacto cuando se usa `loadComponent`?

---

## Paso 16. Revisar la organización final

### Qué vamos a comprobar

Ejecuta:

```bash
find src/app -maxdepth 3 -type f | sort
```

La organización principal debe corresponder aproximadamente a:

```text
src/app/
├── compartidos/
│   ├── barra-navegacion/
│   └── tarjeta-producto/
├── modelos/
│   └── producto.ts
├── paginas/
│   ├── contacto/
│   ├── detalle-producto/
│   ├── inicio/
│   ├── no-encontrado/
│   └── productos/
├── servicios/
│   └── productos.ts
├── app.config.ts
├── app.css
├── app.html
├── app.routes.ts
└── app.ts
```

No es necesario eliminar la carpeta `prueba` ni los archivos existentes que no afecten la aplicación.

### Cómo comprobarlo

Ejecuta nuevamente:

```bash
npm start
```

Recorre Inicio, Productos, los tres detalles, Contacto y una URL inexistente.

**Pregunta:** ¿por qué conviene separar `paginas`, `compartidos`, `modelos` y `servicios`?

---

## Paso 17. Standalone frente a `NgModule`

No necesitas modificar archivos en este paso.

En un proyecto standalone:

- Cada componente declara directamente lo que usa en su propiedad `imports`.
- La aplicación inicia con `bootstrapApplication()`.
- Los servicios y rutas se registran mediante proveedores como `provideRouter()`.
- Las rutas pueden cargar componentes directamente con `component` o `loadComponent`.

En un proyecto tradicional basado en `NgModule`:

- Los componentes se agrupan en la propiedad `declarations` de un módulo.
- Las dependencias se agregan a los `imports` del módulo.
- La aplicación suele iniciar mediante un módulo raíz como `AppModule`.
- Las rutas se configuraban habitualmente con `RouterModule.forRoot(routes)`.

Standalone no significa que el componente esté aislado. Significa que declara sus propias dependencias y no necesita ser declarado dentro de un `NgModule`.

**Pregunta final:** si `TarjetaProducto` usa `routerLink`, ¿en qué archivo se importa `RouterLink` y por qué?

---

## Lista final de comprobación

- [ ] El proyecto compila sin errores.
- [ ] La barra de navegación aparece en todas las páginas.
- [ ] Inicio funciona en `/`.
- [ ] La lista aparece en `/productos`.
- [ ] Cada tarjeta recibe un producto mediante `input()`.
- [ ] Los enlaces llevan a `/productos/1`, `/productos/2` y `/productos/3`.
- [ ] El detalle obtiene el parámetro mediante `ActivatedRoute`.
- [ ] La página de detalle usa `@if`.
- [ ] La lista usa `@for`.
- [ ] El formulario valida datos locales.
- [ ] Una ruta inexistente muestra la página 404.
- [ ] Las páginas usan carga diferida mediante `loadComponent`.
- [ ] `npm run build` termina correctamente.

Si aparece un error durante la práctica, no recrees el proyecto ni reinstales Angular. Guarda el paso en el que ocurrió y copia el mensaje completo de la terminal o del navegador para analizar exactamente la causa.
