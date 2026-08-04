export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  creado_en?: string;
  categoria_id?: number | null;
  categoria?: string | null;
}

export interface NuevoProducto {
  nombre: string;
  descripcion: string;
  precio: number;
  categoria_id?: number | null;
}