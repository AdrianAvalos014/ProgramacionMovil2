import { comprasRepository } from "../../database/repositories/comprasRepository";
import { ProductoCompra } from "../../../types/compras/comprasTypes";

export const comprasService = {
  // Obtener compras
  getAll: async (userId: string) => {
    if (!userId) {
      return [];
    }
    return await comprasRepository.getAll(userId);
  },

  // Crear compra
  create: async (
    userId: string,
    data: {
      categoria: string;
      productos: ProductoCompra[];
      total: number;
      fecha: string;
    }
  ) => {
    if (!userId) {
      throw new Error("Usuario no válido");
    }
    if (!data.categoria?.trim()) {
      throw new Error("La categoría es obligatoria");
    }
    if (!data.productos || data.productos.length === 0) {
      throw new Error("La lista de compras no puede estar vacía");
    }
    return await comprasRepository.create(userId, {
      categoria: data.categoria.trim(),
      productos: JSON.stringify(data.productos),
      total: data.total ?? 0,
      fecha: data.fecha,
    });
  },

  // Editar compra
  update: async (
    id: string,
    data: {
      categoria?: string;
      productos?: ProductoCompra[];
      total?: number;
      fecha?: string;
    }
  ) => {
    if (!id) {
      throw new Error("ID de compra no válido");
    }
    const updates: Record<string, any> = {};
    if (data.categoria !== undefined) {
      updates.categoria = data.categoria.trim();
    }
    if (data.productos !== undefined) {
      updates.productos = JSON.stringify(data.productos);
    }
    if (data.total !== undefined) {
      updates.total = data.total;
    }
    if (data.fecha !== undefined) {
      updates.fecha = data.fecha;
    }
    return await comprasRepository.update(id, updates);
  },

  // Eliminar compra
  remove: async (id: string) => {
    if (!id) {
      throw new Error("ID de compra no válido");
    }
    return await comprasRepository.remove(id);
  },
};