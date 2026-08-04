import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { Producto } from '../modelos/producto';



@Injectable({
providedIn:'root'
})


export class FavoritosServicio {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/api/favoritos`;
  private readonly favoritosIdsSubject = new BehaviorSubject<number[]>([]);
  private readonly favoritosIds = new Set<number>();
  private cargandoFavoritos = false;
  private favoritosCargados = false;

  obtenerFavoritos(): Observable<Producto[]> {
    return this.http.get<Producto | Producto[] | { value?: Producto | Producto[] }>(this.url).pipe(
      map((respuesta) => this.normalizarProductos(respuesta)),
      tap((productos) => this.sincronizarFavoritos(productos))
    );
  }

  observarFavoritosIds(): Observable<number[]> {
    return this.favoritosIdsSubject.asObservable();
  }

  cargarFavoritosInicial(): Observable<number[]> {
    if (this.favoritosCargados) {
      return this.favoritosIdsSubject.asObservable();
    }

    if (this.cargandoFavoritos) {
      return this.favoritosIdsSubject.asObservable();
    }

    this.cargandoFavoritos = true;

    return this.obtenerFavoritos().pipe(
      map((productos) => productos.map((producto) => producto.id)),
      tap((ids) => {
        this.favoritosIdsSubject.next(ids);
        this.favoritosCargados = true;
        this.cargandoFavoritos = false;
      }),
      catchError((error) => {
        this.cargandoFavoritos = false;
        return throwError(() => error);
      })
    );
  }

  esFavorito(productoId: number): boolean {
    return this.favoritosIds.has(productoId);
  }

  agregarFavorito(productoId: number): Observable<unknown> {
    return this.http.post(this.url, { producto_id: productoId }).pipe(
      tap(() => {
        this.favoritosIds.add(productoId);
        this.notificarCambioFavoritos();
      })
    );
  }

  quitarFavorito(productoId: number): Observable<unknown> {
    return this.http.delete(`${this.url}/${productoId}`).pipe(
      tap(() => {
        this.favoritosIds.delete(productoId);
        this.notificarCambioFavoritos();
      })
    );
  }

  eliminarFavorito(id: number): Observable<unknown> {
    return this.quitarFavorito(id);
  }

  private normalizarProductos(respuesta: Producto | Producto[] | { value?: Producto | Producto[] } | null | undefined): Producto[] {
    if (Array.isArray(respuesta)) {
      return respuesta;
    }

    if (respuesta && typeof respuesta === 'object' && 'value' in respuesta) {
      return this.normalizarProductos((respuesta as { value?: Producto | Producto[] }).value);
    }

    if (respuesta && typeof respuesta === 'object') {
      return [respuesta as Producto];
    }

    return [];
  }

  private sincronizarFavoritos(productos: Producto[]): void {
    this.favoritosIds.clear();
    productos.forEach((producto) => this.favoritosIds.add(producto.id));
    this.notificarCambioFavoritos();
    this.favoritosCargados = true;
    this.cargandoFavoritos = false;
  }

  private notificarCambioFavoritos(): void {
    queueMicrotask(() => {
      this.favoritosIdsSubject.next(Array.from(this.favoritosIds));
    });
  }
}