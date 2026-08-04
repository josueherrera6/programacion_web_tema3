import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { CategoriasServicio } from '../../servicios/categorias';
import { Categoria } from '../../modelos/categoria';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Categorias implements OnInit {
  private readonly servicio = inject(CategoriasServicio);
  private readonly detectorCambios = inject(ChangeDetectorRef);

  categorias: Categoria[] = [];
  cargando = false;
  mensajeError = '';

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.servicio.obtenerCategorias().subscribe({
      next: (datos) => {
        this.categorias = datos;
        this.cargando = false;
        this.detectorCambios.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.mensajeError = 'No fue posible cargar las categorías.';
        this.cargando = false;
        this.detectorCambios.markForCheck();
      }
    });
  }
}