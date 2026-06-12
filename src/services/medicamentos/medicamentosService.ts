import { medicamentosRepository } from "../../database/repositories/medicamentosRepository";

export const medicamentosService = {

  getAll: async (userId: string) => {
    if (!userId) {
      return [];
    }
    return await medicamentosRepository.getAll(userId);
  },

  create: async (userId: string, data: any) => {
    if (!userId) {
      throw new Error("Usuario no válido");
    }
    if (!data.nombre?.trim()) {
      throw new Error("El nombre del medicamento es obligatorio");
    }
    return await medicamentosRepository.create(userId, {
      nombre: data.nombre.trim(),
      dosisMg: data.dosisMg?.trim() || null,
      cadaHoras: data.cadaHoras?.trim() || null,
      cantidad: data.cantidad?.trim() || null,
      umbral: data.umbral?.trim() || null,
      photoUri: data.photoUri || null,
    });
  },

  update: async (id: string, data: any) => {
    if (!id) {
      throw new Error("ID de medicamento no válido");
    }
    const updates: Record<string, any> = {};
    if (data.nombre !== undefined) {
      updates.nombre = data.nombre.trim();
    }
    if (data.dosisMg !== undefined) {
      updates.dosisMg = data.dosisMg?.trim() || null;
    }
    if (data.cadaHoras !== undefined) {
      updates.cadaHoras = data.cadaHoras?.trim() || null;
    }
    if (data.cantidad !== undefined) {
      updates.cantidad = data.cantidad?.trim() || null;
    }
    if (data.umbral !== undefined) {
      updates.umbral = data.umbral?.trim() || null;
    }
    if (data.photoUri !== undefined) {
      updates.photoUri = data.photoUri;
    }
    if (data.lastTaken !== undefined) {
      updates.lastTaken = data.lastTaken;
    }
    return await medicamentosRepository.update(id, updates);
  },

  remove: async (id: string) => {
    if (!id) {
      throw new Error("ID de medicamento no válido");
    }
    return await medicamentosRepository.remove(id);
  },
};