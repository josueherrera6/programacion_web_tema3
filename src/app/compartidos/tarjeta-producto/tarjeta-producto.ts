import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { Producto } from '../../modelos/producto';
import { FavoritosServicio } from '../../servicios/favoritos';

@Component({
  selector: 'app-tarjeta-producto',
  standalone: true,
  imports: [
    RouterLink,
    ButtonModule,
    CardModule,
    TagModule
  ],
  templateUrl: './tarjeta-producto.html',
  styleUrl: './tarjeta-producto.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TarjetaProducto implements OnInit {
  readonly producto = input.required<Producto>();
  private readonly favoritosServicio = inject(FavoritosServicio);
  private readonly detectorCambios = inject(ChangeDetectorRef);

  esFavorito = false;
  cargandoFavorito = false;

  ngOnInit(): void {
    this.sincronizarEstadoDesdeServicio();

    this.favoritosServicio.observarFavoritosIds().subscribe(() => {
      this.sincronizarEstadoDesdeServicio();
    });

    this.favoritosServicio.cargarFavoritosInicial().subscribe({
      next: () => {
        this.sincronizarEstadoDesdeServicio();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  alternarFavorito(evento: Event): void {
    evento.preventDefault();
    evento.stopPropagation();

    if (this.cargandoFavorito) {
      return;
    }

    const productoId = this.producto().id;
    const siguienteEstado = !this.esFavorito;

    this.cargandoFavorito = true;

    const peticion = siguienteEstado
      ? this.favoritosServicio.agregarFavorito(productoId)
      : this.favoritosServicio.quitarFavorito(productoId);

    peticion.subscribe({
      next: () => {
        queueMicrotask(() => {
          this.sincronizarEstadoDesdeServicio();
          this.cargandoFavorito = false;
          this.detectorCambios.detectChanges();
        });
      },
      error: (error) => {
        console.error(error);
        queueMicrotask(() => {
          this.sincronizarEstadoDesdeServicio();
          this.cargandoFavorito = false;
          this.detectorCambios.detectChanges();
        });
      }
    });
  }

  private sincronizarEstadoDesdeServicio(): void {
    const esFavorito = this.favoritosServicio.esFavorito(this.producto().id);
    this.esFavorito = esFavorito;
    this.detectorCambios.markForCheck();
  }
}