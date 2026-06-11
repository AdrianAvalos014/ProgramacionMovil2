export interface ProductoCompra {
  id: string;
  descripcion: string;
  cantidad: number;
  precio: number;
}

export interface Compra {
  id: string;
  user_id: string;
  categoria: string;
  productos: string;
  total: number;
  fecha: string;
  sync_status: string;
  deleted: number;
  created_at: string;
  updated_at: string;
}

export const CATEGORIAS = [
  "Supermercado",
  "Comida",
  "Transporte",
  "Ropa",
  "Salud",
  "Suscripciones",
  "Otros",
];

export const parseProductos = (raw: string): ProductoCompra[] => {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const calcularTotal = (productos: ProductoCompra[]) => {
  return productos.reduce((acc, p) => acc + p.cantidad * p.precio, 0);
};