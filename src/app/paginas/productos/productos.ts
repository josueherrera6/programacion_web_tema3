import { CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
  private readonly detectorCambios = inject(ChangeDetectorRef);

  productos: Producto[] = [];
  modoVista: 'tarjetas' | 'tabla' = 'tabla';
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
        setTimeout(() => {
          this.productos = productos;
          this.cargando = false;
          this.detectorCambios.detectChanges();
        });
      },
      error: () => {
        setTimeout(() => {
          this.mensajeError = 'No fue posible cargar los productos.';
          this.cargando = false;
          this.detectorCambios.detectChanges();
        });
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
