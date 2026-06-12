import { tareasRepository } from "../../database/repositories/tareasRepository";

export const tareasService = {
  getAll: async (userId: string) => {
    if (!userId) {
      return [];
    }
    return await tareasRepository.getAll(userId);
  },

  create: async (userId: string, data: any) => {
    if (!userId) {
      throw new Error("Usuario no válido");
    }
    if (!data.titulo?.trim()) {
      throw new Error("El título es obligatorio");
    }
    return await tareasRepository.create(userId, {
      titulo: data.titulo.trim(),
      descripcion: data.descripcion?.trim() || null,
      completada: data.completada ?? 0,
      fechaLimite: data.fechaLimite ?? null,
      prioridad: data.prioridad ?? "Media",
    });
  },

  update: async (id: string, data: any) => {
    if (!id) {
      throw new Error("ID de tarea no válido");
    }
    const updates: Record<string, any> = {};
    if (data.titulo !== undefined) {
      updates.titulo = data.titulo.trim();
    }
    if (data.descripcion !== undefined) {
      updates.descripcion = data.descripcion?.trim() || null;
    }
    if (data.completada !== undefined) {
      updates.completada = data.completada;
    }
    if (data.fechaLimite !== undefined) {
      updates.fechaLimite = data.fechaLimite;
    }
    if (data.prioridad !== undefined) {
      updates.prioridad = data.prioridad;
    }
    return await tareasRepository.update(id, updates);
  },

  remove: async (id: string) => {
    if (!id) {
      throw new Error("ID de tarea no válido");
    }
    return await tareasRepository.remove(id);
  },
};