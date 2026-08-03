import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { ProductosServicio } from '../../servicios/productos';
import { Producto } from '../../modelos/producto';

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
export class DetalleProducto implements OnInit {
  private readonly ruta = inject(ActivatedRoute);
  private readonly servicio = inject(ProductosServicio);
  private readonly detectorCambios = inject(ChangeDetectorRef);

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
        setTimeout(() => {
          this.producto = producto;
          this.cargando = false;
          this.detectorCambios.detectChanges();
        });
      },
      error: () => {
        setTimeout(() => {
          this.producto = null;
          this.cargando = false;
          this.detectorCambios.detectChanges();
        });
      }
    });
  }
}
