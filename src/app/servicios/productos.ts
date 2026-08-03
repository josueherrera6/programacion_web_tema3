import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NuevoProducto, Producto } from '../modelos/producto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductosServicio {
  private readonly http = inject(HttpClient);
 private readonly url = `${environment.apiUrl}/api/productos`;

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