# PrimeNG aplicado al catálogo de productos

## Presentación

La aplicación ya cuenta cxon rutas, páginas, componentes reutilizables, un servicio local y un formulario. El siguiente avance consiste en mejorar su presentación con PrimeNG sin cambiar la organización que ya funciona.

PrimeNG es una biblioteca de componentes visuales para Angular. Proporciona botones, tarjetas, barras de herramientas, cuadros de diálogo, campos de formulario, mensajes y otros elementos con una apariencia uniforme. Cada componente se importa únicamente en el archivo donde se utiliza, lo cual coincide con el enfoque *standalone* del proyecto.

En esta práctica se conservarán:

- las rutas actuales;
- el servicio local de productos;
- el modelo `Producto`;
- los nombres de páginas y componentes;
- la carga diferida con `loadComponent`;
- el formulario basado en `ngModel`.

El trabajo se realizará en siete pasos breves. Al terminar cada uno conviene revisar el navegador antes de continuar.

## Resultado esperado

Al finalizar, la aplicación tendrá:

- un tema visual uniforme;
- una barra de navegación construida con `Toolbar` y `Button`;
- una portada con mejor jerarquía visual;
- un catálogo organizado mediante `Card` y `Tag`;
- una página de detalle con un cuadro de diálogo;
- un formulario con campos, validaciones y mensajes visuales;
- una página 404 integrada con el mismo diseño.

La instalación y los nombres de los componentes utilizados corresponden a la documentación vigente de [PrimeNG](https://primeng.org/installation).

---

## Paso 1. Instalar y configurar PrimeNG

### Propósito

Primero se instalará la biblioteca y uno de sus temas. La configuración se realizará en `app.config.ts`, porque la aplicación utiliza componentes standalone y se inicia mediante `bootstrapApplication()`.

### 1.1 Instalar las dependencias

Detén temporalmente el servidor con `Ctrl + C` si está en ejecución. Después escribe:

```bash
npm install primeng @primeuix/themes
```

No es necesario crear otro proyecto, cambiar la versión de Angular ni instalar un `NgModule`.

### 1.2 Configurar el tema

Abre:

```text
src/app/app.config.ts
```

Sustituye todo su contenido por:

```ts
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false
        }
      }
    })
  ]
};
```

`providePrimeNG()` registra la configuración general de la biblioteca. `Aura` es el tema visual elegido y `ripple: true` activa una respuesta visual breve al presionar los componentes compatibles.

La opción `darkModeSelector: false` mantiene la práctica en modo claro, aunque el sistema operativo utilice un tema oscuro. Esto permite que todo el grupo observe el mismo resultado.

### 1.3 Agregar estilos generales

Abre:

```text
src/styles.css
```

Sustituye el comentario existente por:

```css
* {
  box-sizing: border-box;
}

html {
  font-family:
    Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #1f2937;
  background: #f3f6fb;
}

body {
  margin: 0;
  min-width: 320px;
}

h1,
h2,
p {
  margin-top: 0;
}
```

Estos estilos no sustituyen el tema de PrimeNG. Solamente establecen una base para el documento completo.

### 1.4 Comprobar el paso

Ejecuta:

```bash
npm start
```

La aplicación debe compilar sin errores. En este momento el cambio visual será discreto, porque todavía no se han colocado componentes de PrimeNG.

### Para reflexionar

¿Por qué `providePrimeNG()` se agrega en `app.config.ts` y los módulos visuales se importan después en cada componente?

---

## Paso 2. Transformar la barra de navegación

### Propósito

La navegación actual funciona correctamente. No se cambiarán sus rutas; únicamente se presentará dentro de un componente `Toolbar` y los enlaces tendrán apariencia de botones.

### 2.1 Importar los componentes necesarios

Abre:

```text
src/app/compartidos/barra-navegacion/barra-navegacion.ts
```

Sustituye todo su contenido por:

```ts
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-barra-navegacion',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    ToolbarModule
  ],
  templateUrl: './barra-navegacion.html',
  styleUrl: './barra-navegacion.css'
})
export class BarraNavegacion {}
```

`ToolbarModule` aporta el contenedor de navegación y `ButtonModule` permite aplicar el estilo `pButton` a los enlaces existentes.

### 2.2 Sustituir la plantilla

Abre:

```text
src/app/compartidos/barra-navegacion/barra-navegacion.html
```

Sustituye todo por:

```html
<p-toolbar>
  <ng-template #start>
    <a class="marca" routerLink="/">Catálogo Angular</a>
  </ng-template>

  <ng-template #end>
    <nav aria-label="Navegación principal">
      <a
        routerLink="/"
        routerLinkActive="activo"
        [routerLinkActiveOptions]="{ exact: true }"
        pButton
      >
        <span pButtonLabel>Inicio</span>
      </a>

      <a routerLink="/productos" routerLinkActive="activo" pButton>
        <span pButtonLabel>Productos</span>
      </a>

      <a routerLink="/contacto" routerLinkActive="activo" pButton>
        <span pButtonLabel>Contacto</span>
      </a>
    </nav>
  </ng-template>
</p-toolbar>
```

Los enlaces siguen usando `routerLink`. La directiva `pButton` modifica su presentación, pero no altera la navegación de Angular.

### 2.3 Aplicar estilos del componente

Abre:

```text
src/app/compartidos/barra-navegacion/barra-navegacion.css
```

Sustituye todo por:

```css
:host {
  display: block;
  position: sticky;
  top: 0;
  z-index: 10;
}

.marca {
  color: var(--p-primary-color);
  font-size: 1.15rem;
  font-weight: 700;
  text-decoration: none;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

nav a {
  text-decoration: none;
}

nav a.activo {
  outline: 3px solid color-mix(in srgb, var(--p-primary-color) 25%, transparent);
  outline-offset: 2px;
}

@media (max-width: 620px) {
  :host {
    position: static;
  }

  nav {
    margin-top: 0.75rem;
  }
}
```

### 2.4 Mejorar el espacio de las páginas

Abre:

```text
src/app/app.css
```

Agrega:

```css
main {
  width: min(1100px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 2rem 0 4rem;
}
```

### Comprobar el paso

Revisa Inicio, Productos y Contacto. La barra debe permanecer visible, los enlaces deben seguir funcionando y la opción activa debe quedar señalada.

### Para reflexionar

¿Qué responsabilidad conserva `routerLink` y qué responsabilidad añade `pButton`?

---

## Paso 3. Crear una portada con mejor jerarquía visual

### Propósito

La página de inicio se convertirá en una presentación breve del catálogo. Se utilizarán `Card` y `Button`, sin agregar lógica nueva.

### 3.1 Modificar el componente

Abre:

```text
src/app/paginas/inicio/inicio.ts
```

Sustituye todo por:

```ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, ButtonModule, CardModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {}
```

### 3.2 Sustituir la plantilla

Abre:

```text
src/app/paginas/inicio/inicio.html
```

Sustituye todo por:

```html
<section class="portada">
  <p-card>
    <p class="distintivo">PRÁCTICA CON ANGULAR Y PRIMENG</p>
    <h1>Un catálogo sencillo, claro y reutilizable</h1>
    <p class="introduccion">
      Explora productos locales, consulta sus detalles y utiliza el formulario
      de contacto. La aplicación conserva la organización standalone y ahora
      incorpora componentes visuales reutilizables.
    </p>

    <a routerLink="/productos" pButton>
      <span pButtonLabel>Explorar productos</span>
    </a>
  </p-card>

  <div class="resumen">
    <p-card header="Componentes">
      <p>Las páginas se construyen con elementos visuales importados de forma individual.</p>
    </p-card>

    <p-card header="Navegación">
      <p>Las rutas y la carga diferida continúan funcionando sin cambios.</p>
    </p-card>

    <p-card header="Datos locales">
      <p>El servicio de productos sigue siendo la única fuente de información.</p>
    </p-card>
  </div>
</section>
```

### 3.3 Agregar los estilos

Abre:

```text
src/app/paginas/inicio/inicio.css
```

Agrega:

```css
.portada {
  display: grid;
  gap: 1.5rem;
}

.portada > p-card {
  display: block;
  max-width: 760px;
}

.distintivo {
  color: var(--p-primary-color);
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

h1 {
  max-width: 650px;
  margin-bottom: 1rem;
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1.05;
}

.introduccion {
  max-width: 680px;
  margin-bottom: 1.5rem;
  color: #4b5563;
  font-size: 1.05rem;
  line-height: 1.7;
}

.resumen {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.resumen p {
  margin-bottom: 0;
  color: #4b5563;
  line-height: 1.6;
}
```

### Comprobar el paso

Regresa a la ruta `/`. Debe aparecer una portada principal, tres tarjetas informativas y un botón que conduce al catálogo.

### Para reflexionar

¿Por qué `CardModule` se importa en `inicio.ts` y no en `app.ts`?

---

## Paso 4. Convertir cada producto en una tarjeta

### Propósito

El componente `TarjetaProducto` ya es reutilizable y recibe información mediante `input()`. Se conservará esa comunicación; solamente se cambiará su presentación con `Card`, `Tag` y `Button`.

### 4.1 Modificar el componente de tarjeta

Abre:

```text
src/app/compartidos/tarjeta-producto/tarjeta-producto.ts
```

Sustituye todo por:

```ts
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { Producto } from '../../modelos/producto';

@Component({
  selector: 'app-tarjeta-producto',
  standalone: true,
  imports: [RouterLink, ButtonModule, CardModule, TagModule],
  templateUrl: './tarjeta-producto.html',
  styleUrl: './tarjeta-producto.css'
})
export class TarjetaProducto {
  readonly producto = input.required<Producto>();
}
```

### 4.2 Sustituir la plantilla

Abre:

```text
src/app/compartidos/tarjeta-producto/tarjeta-producto.html
```

Sustituye todo por:

```html
<p-card [header]="producto().nombre">
  <p>{{ producto().descripcion }}</p>

  <p-tag
    severity="success"
    [rounded]="true"
    [value]="'$' + producto().precio.toLocaleString('es-MX')"
  />

  <ng-template #footer>
    <a [routerLink]="['/productos', producto().id]" pButton>
      <span pButtonLabel>Ver detalle</span>
    </a>
  </ng-template>
</p-card>
```

### 4.3 Agregar estilos a la tarjeta

Abre:

```text
src/app/compartidos/tarjeta-producto/tarjeta-producto.css
```

Agrega:

```css
:host {
  display: block;
  height: 100%;
}

p-card {
  display: block;
  height: 100%;
}

p {
  min-height: 3rem;
  color: #4b5563;
  line-height: 1.5;
}

a {
  margin-top: 1rem;
  text-decoration: none;
}
```

### 4.4 Organizar el catálogo en columnas

Abre:

```text
src/app/paginas/productos/productos.html
```

Sustituye todo por:

```html
<header class="encabezado">
  <p>CATÁLOGO LOCAL</p>
  <h1>Productos</h1>
  <span>Selecciona un producto para consultar su información completa.</span>
</header>

<section class="cuadricula">
  @for (producto of productos; track producto.id) {
    <app-tarjeta-producto [producto]="producto" />
  } @empty {
    <p>No hay productos disponibles.</p>
  }
</section>
```

Abre:

```text
src/app/paginas/productos/productos.css
```

Agrega:

```css
.encabezado {
  margin-bottom: 1.5rem;
}

.encabezado p {
  margin-bottom: 0.4rem;
  color: var(--p-primary-color);
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.encabezado h1 {
  margin-bottom: 0.5rem;
  font-size: clamp(2rem, 4vw, 3rem);
}

.encabezado span {
  color: #4b5563;
}

.cuadricula {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}
```

### Comprobar el paso

Visita `/productos`. Los tres productos deben aparecer en tarjetas alineadas. El precio se mostrará como una etiqueta verde y el botón de cada tarjeta debe abrir el detalle correcto.

### Para reflexionar

¿Cambió la forma en que el componente padre envía el producto al componente hijo?

---

## Paso 5. Mejorar el detalle y agregar un cuadro de diálogo

### Propósito

La página de detalle utilizará los mismos datos y el mismo parámetro de ruta. Se agregará un cuadro de diálogo para practicar un componente interactivo sin introducir servicios nuevos.

### 5.1 Modificar TypeScript

Abre:

```text
src/app/paginas/detalle-producto/detalle-producto.ts
```

Sustituye todo por:

```ts
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { ProductosServicio } from '../../servicios/productos';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [
    RouterLink,
    ButtonModule,
    CardModule,
    DialogModule,
    MessageModule,
    TagModule
  ],
  templateUrl: './detalle-producto.html',
  styleUrl: './detalle-producto.css'
})
export class DetalleProducto {
  private readonly ruta = inject(ActivatedRoute);
  private readonly productosServicio = inject(ProductosServicio);

  private readonly idProducto = Number(this.ruta.snapshot.paramMap.get('id'));
  readonly producto = this.productosServicio.obtenerProductoPorId(this.idProducto);

  mostrarDialogo = false;
}
```

La única propiedad nueva es `mostrarDialogo`. Su valor determina si la ventana está abierta o cerrada.

### 5.2 Sustituir la plantilla

Abre:

```text
src/app/paginas/detalle-producto/detalle-producto.html
```

Sustituye todo por:

```html
@if (producto) {
  <section class="detalle">
    <p-card [header]="producto.nombre" subheader="Información del producto">
      <p>{{ producto.descripcion }}</p>

      <p-tag
        severity="success"
        [rounded]="true"
        [value]="'$' + producto.precio.toLocaleString('es-MX')"
      />

      <ng-template #footer>
        <div class="acciones">
          <a routerLink="/productos" pButton>
            <span pButtonLabel>Volver al catálogo</span>
          </a>

          <p-button
            label="Solicitar información"
            severity="secondary"
            variant="outlined"
            (onClick)="mostrarDialogo = true"
          />
        </div>
      </ng-template>
    </p-card>

    <p-dialog
      header="Información del producto"
      [(visible)]="mostrarDialogo"
      [modal]="true"
      [style]="{ width: 'min(28rem, 90vw)' }"
    >
      <p>
        Has seleccionado <strong>{{ producto.nombre }}</strong>.
        Puedes utilizar la página de contacto para solicitar más información.
      </p>

      <ng-template #footer>
        <p-button label="Cerrar" (onClick)="mostrarDialogo = false" />
      </ng-template>
    </p-dialog>
  </section>
} @else {
  <section class="sin-producto">
    <p-message severity="warn">No existe un producto con ese identificador.</p-message>

    <a routerLink="/productos" pButton>
      <span pButtonLabel>Volver al catálogo</span>
    </a>
  </section>
}
```

### 5.3 Agregar estilos

Abre:

```text
src/app/paginas/detalle-producto/detalle-producto.css
```

Agrega:

```css
.detalle {
  max-width: 720px;
  margin: 0 auto;
}

.detalle p {
  color: #4b5563;
  font-size: 1.05rem;
  line-height: 1.7;
}

.acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.acciones a,
.sin-producto a {
  text-decoration: none;
}

.sin-producto {
  display: grid;
  justify-items: start;
  gap: 1rem;
}
```

### Comprobar el paso

Abre `/productos/1` y presiona “Solicitar información”. Debe aparecer una ventana sobre la página. Ciérrala y después visita `/productos/99`; debe mostrarse un mensaje de advertencia.

### Para reflexionar

¿Qué relación existe entre `[(visible)]="mostrarDialogo"` y la propiedad declarada en TypeScript?

---

## Paso 6. Dar formato y validación visual al formulario

### Propósito

El formulario conservará `FormsModule` y `ngModel`. PrimeNG aportará la apariencia de los campos, el botón y los mensajes de validación.

### 6.1 Importar los componentes

Abre:

```text
src/app/paginas/contacto/contacto.ts
```

Sustituye todo por:

```ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    TextareaModule
  ],
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

### 6.2 Sustituir la plantilla

Abre:

```text
src/app/paginas/contacto/contacto.html
```

Sustituye todo por:

```html
<section class="contacto">
  <header>
    <p>ESCRÍBENOS</p>
    <h1>Contacto</h1>
    <span>Completa los campos para practicar formularios y validaciones visuales.</span>
  </header>

  <form #formulario="ngForm" (ngSubmit)="enviar()">
    <div class="campo">
      <label for="nombre">Nombre</label>
      <input
        id="nombre"
        name="nombre"
        pInputText
        [(ngModel)]="nombre"
        #nombreCampo="ngModel"
        [invalid]="nombreCampo.invalid && nombreCampo.touched"
        required
      />

      @if (nombreCampo.invalid && nombreCampo.touched) {
        <p-message severity="error" size="small" variant="simple">
          Escribe tu nombre.
        </p-message>
      }
    </div>

    <div class="campo">
      <label for="correo">Correo electrónico</label>
      <input
        id="correo"
        name="correo"
        type="email"
        pInputText
        [(ngModel)]="correo"
        #correoCampo="ngModel"
        [invalid]="correoCampo.invalid && correoCampo.touched"
        required
        email
      />

      @if (correoCampo.invalid && correoCampo.touched) {
        <p-message severity="error" size="small" variant="simple">
          Escribe un correo válido.
        </p-message>
      }
    </div>

    <div class="campo">
      <label for="mensaje">Mensaje</label>
      <textarea
        id="mensaje"
        name="mensaje"
        rows="5"
        pTextarea
        [autoResize]="true"
        [(ngModel)]="mensaje"
        #mensajeCampo="ngModel"
        [invalid]="mensajeCampo.invalid && mensajeCampo.touched"
        required
      ></textarea>

      @if (mensajeCampo.invalid && mensajeCampo.touched) {
        <p-message severity="error" size="small" variant="simple">
          Escribe un mensaje.
        </p-message>
      }
    </div>

    <button type="submit" pButton [disabled]="formulario.invalid">
      <span pButtonLabel>Enviar mensaje</span>
    </button>
  </form>

  @if (enviado) {
    <p-message severity="success" closable>
      Gracias, {{ nombre }}. El mensaje se registró únicamente en esta práctica.
    </p-message>
  }
</section>
```

### 6.3 Agregar estilos

Abre:

```text
src/app/paginas/contacto/contacto.css
```

Agrega:

```css
.contacto {
  display: grid;
  grid-template-columns: minmax(220px, 0.8fr) minmax(280px, 1.2fr);
  gap: 2rem;
  align-items: start;
}

header p {
  margin-bottom: 0.4rem;
  color: var(--p-primary-color);
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

header h1 {
  margin-bottom: 0.5rem;
  font-size: clamp(2rem, 4vw, 3rem);
}

header span {
  color: #4b5563;
  line-height: 1.6;
}

form {
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid #dbe3ef;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 16px 35px rgb(15 23 42 / 8%);
}

.campo {
  display: grid;
  gap: 0.4rem;
}

label {
  font-weight: 650;
}

input,
textarea {
  width: 100%;
}

.contacto > p-message {
  grid-column: 2;
}

@media (max-width: 720px) {
  .contacto {
    grid-template-columns: 1fr;
  }

  .contacto > p-message {
    grid-column: 1;
  }
}
```

### Comprobar el paso

Visita `/contacto` y toca un campo sin escribir información. Debe aparecer su mensaje de validación. Completa correctamente el formulario y presiona el botón; se mostrará un mensaje verde que puede cerrarse.

### Para reflexionar

¿Qué parte de la validación pertenece a Angular Forms y qué parte solamente mejora la presentación?

---

## Paso 7. Integrar la página 404 y verificar el proyecto

### Propósito

El último paso dará a la página de error la misma apariencia visual y comprobará que PrimeNG no afectó las rutas ni la compilación.

### 7.1 Modificar el componente

Abre:

```text
src/app/paginas/no-encontrado/no-encontrado.ts
```

Sustituye todo por:

```ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-no-encontrado',
  standalone: true,
  imports: [RouterLink, ButtonModule, CardModule, MessageModule],
  templateUrl: './no-encontrado.html',
  styleUrl: './no-encontrado.css'
})
export class NoEncontrado {}
```

### 7.2 Sustituir la plantilla

Abre:

```text
src/app/paginas/no-encontrado/no-encontrado.html
```

Sustituye todo por:

```html
<section>
  <p-card header="Página no encontrada" subheader="Error 404">
    <p-message severity="warn">
      La dirección solicitada no corresponde a una página de la aplicación.
    </p-message>

    <ng-template #footer>
      <a routerLink="/" pButton>
        <span pButtonLabel>Volver al inicio</span>
      </a>
    </ng-template>
  </p-card>
</section>
```

### 7.3 Agregar estilos

Abre:

```text
src/app/paginas/no-encontrado/no-encontrado.css
```

Agrega:

```css
section {
  max-width: 620px;
  margin: 3rem auto;
  text-align: center;
}

a {
  margin-top: 1rem;
  text-decoration: none;
}
```

### 7.4 Realizar la comprobación final

Prueba las siguientes direcciones:

```text
/
/productos
/productos/1
/productos/99
/contacto
/ruta-que-no-existe
```

Después detén el servidor con `Ctrl + C` y ejecuta:

```bash
npm run build
```

La compilación debe terminar sin errores. No deben aparecer cambios en `app.routes.ts`, `productos.ts`, `producto.ts` ni en el servicio `productos.ts`.

### Para reflexionar

¿Por qué fue posible cambiar ampliamente el diseño sin modificar el servicio ni las rutas?

---

## Síntesis de componentes utilizados

| Componente o directiva | Uso dentro de la aplicación |
|---|---|
| `Toolbar` | Agrupa la marca y los enlaces principales. |
| `Button` y `pButton` | Presentan acciones y enlaces con un estilo uniforme. |
| `Card` | Organiza la portada, los productos, el detalle y la página 404. |
| `Tag` | Destaca el precio de cada producto. |
| `Dialog` | Muestra información adicional sin cambiar de ruta. |
| `InputText` | Mejora los campos de nombre y correo. |
| `Textarea` | Mejora el campo de mensaje y permite crecimiento automático. |
| `Message` | Presenta validaciones, confirmaciones y advertencias. |

## Ideas esenciales

1. PrimeNG no reemplaza Angular; se integra con sus componentes, rutas, formularios y eventos.
2. En una aplicación standalone, cada componente importa únicamente los elementos visuales que utiliza.
3. Un componente visual no debe alterar la responsabilidad de los datos. Los productos continúan en el servicio.
4. Las directivas de Angular y PrimeNG pueden colaborar sobre un mismo elemento. Un enlace puede utilizar `routerLink` para navegar y `pButton` para presentarse como botón.
5. La apariencia general se configura una vez mediante un tema, mientras que la estructura particular se controla con las plantillas y estilos de cada componente.

## Lista de verificación

- [ ] PrimeNG y `@primeuix/themes` aparecen en `package.json`.
- [ ] El tema Aura está registrado en `app.config.ts`.
- [ ] La navegación funciona y conserva `routerLink`.
- [ ] La página de inicio utiliza tarjetas.
- [ ] El catálogo muestra tres tarjetas de producto.
- [ ] Cada tarjeta abre la ruta de detalle correspondiente.
- [ ] El cuadro de diálogo puede abrirse y cerrarse.
- [ ] El formulario muestra validaciones.
- [ ] La ruta desconocida presenta la página 404.
- [ ] `npm run build` termina correctamente.

## Referencias de consulta

- [Instalación de PrimeNG](https://primeng.org/installation)
- [Temas de PrimeNG](https://primeng.org/theming)
- [Button](https://primeng.org/button)
- [Card](https://primeng.org/card)
- [Toolbar](https://primeng.org/toolbar)
- [Dialog](https://primeng.org/dialog)
- [InputText](https://primeng.org/inputtext)
- [Textarea](https://primeng.org/textarea)
- [Message](https://primeng.org/message)
