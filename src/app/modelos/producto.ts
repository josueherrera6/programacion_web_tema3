export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
}
export type NuevoProducto = Omit<Producto, 'id'>;
