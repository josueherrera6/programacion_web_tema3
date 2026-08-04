import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import { Categoria } from '../modelos/categoria';

@Injectable({
  providedIn: 'root'
})
export class CategoriasServicio {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/api/categorias`;

  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria | Categoria[] | { value?: Categoria | Categoria[] }>(this.url).pipe(
      map((respuesta) => this.normalizarCategorias(respuesta))
    );
  }

  private normalizarCategorias(respuesta: Categoria | Categoria[] | { value?: Categoria | Categoria[] } | null | undefined): Categoria[] {
    if (Array.isArray(respuesta)) {
      return respuesta;
    }

    if (respuesta && typeof respuesta === 'object' && 'value' in respuesta) {
      return this.normalizarCategorias((respuesta as { value?: Categoria | Categoria[] }).value);
    }

    if (respuesta && typeof respuesta === 'object') {
      return [respuesta as Categoria];
    }

    return [];
  }

crearCategoria(categoria:Categoria):Observable<any>{

 return this.http.post(this.url,categoria);

}


actualizarCategoria(categoria:Categoria):Observable<any>{

 return this.http.put(
 `${this.url}/${categoria.id}`,
 categoria
 );

}


eliminarCategoria(id:number):Observable<any>{

 return this.http.delete(
 `${this.url}/${id}`
 );

}


}