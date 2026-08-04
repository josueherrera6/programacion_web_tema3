import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Producto } from '../../modelos/producto';
import { FavoritosServicio } from '../../servicios/favoritos';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Favoritos implements OnInit {
  private readonly servicio = inject(FavoritosServicio);
  private readonly detectorCambios = inject(ChangeDetectorRef);

  favoritos: Producto[] = [];
  cargando = false;
  mensajeError = '';

  ngOnInit(): void {
    this.cargarFavoritos();
  }

  cargarFavoritos(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.servicio.obtenerFavoritos().subscribe({
      next: (datos) => {
        queueMicrotask(() => {
          this.favoritos = datos;
          this.cargando = false;
          this.detectorCambios.markForCheck();
        });
      },
      error: (error) => {
        console.error('Error al cargar favoritos:', error);
        queueMicrotask(() => {
          this.mensajeError = 'No fue posible cargar los favoritos.';
          this.cargando = false;
          this.detectorCambios.markForCheck();
        });
      }
    });
  }
}
