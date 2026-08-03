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