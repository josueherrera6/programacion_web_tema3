import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import { Producto } from '../modelos/producto';

@Injectable({
  providedIn: 'root'
})
export class FavoritosServicio {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/api/favoritos`;

  obtenerFavoritos(): Observable<Producto[]> {
    return this.http.get<{ value: Producto[] }>(this.url).pipe(
      map((respuesta) => {
        console.log('Respuesta favoritos:', respuesta);
        return respuesta?.value ?? [];
      })
    );
  }

  agregarFavorito(productoId: number): Observable<unknown> {
    console.log('Agregar favorito:', { producto_id: productoId });
    return this.http.post(this.url, { producto_id: productoId });
  }

  quitarFavorito(productoId: number): Observable<unknown> {
    console.log('Quitar favorito:', productoId);
    return this.http.delete(`${this.url}/${productoId}`);
  }

  eliminarFavorito(id: number): Observable<unknown> {
    return this.quitarFavorito(id);
  }
}
