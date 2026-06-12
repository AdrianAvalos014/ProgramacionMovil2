import { agendaRepository } from "../../database/repositories/agendaRepository";

export const agendaService = {

  getAll: async (userId: string) => {
    if (!userId) {
      return [];
    }
    return await agendaRepository.getAll(userId);
  },


  create: async (
    userId: string,
    data: {
      titulo: string;
      fecha: string;
      hora: string;
      descripcion?: string;
      asistencia?: string;
    }
  ) => {
    if (!userId) {
      throw new Error("Usuario no válido");
    }
    if (!data.titulo?.trim()) {
      throw new Error("El título del evento es obligatorio");
    }
    if (!data.fecha) {
      throw new Error("La fecha es obligatoria");
    }
    if (!data.hora) {
      throw new Error("La hora es obligatoria");
    }
    return await agendaRepository.create(userId, {
      titulo: data.titulo.trim(),
      fecha: data.fecha,
      hora: data.hora,
      descripcion: data.descripcion?.trim() || undefined,
      asistencia: data.asistencia?.trim() || undefined,
    });
  },

  update: async (id: string, data: any) => {
    if (!id) {
      throw new Error("ID de evento no válido");
    }
    const updates: Record<string, any> = {};
    if (data.titulo !== undefined) {
      updates.titulo = data.titulo.trim();
    }
    if (data.fecha !== undefined) {
      updates.fecha = data.fecha;
    }
    if (data.hora !== undefined) {
      updates.hora = data.hora;
    }
    if (data.descripcion !== undefined) {
      updates.descripcion = data.descripcion?.trim() || undefined;
    }
    if (data.asistencia !== undefined) {
      updates.asistencia = data.asistencia?.trim() || undefined;
    }
    return await agendaRepository.update(id, updates);
  },

  remove: async (id: string) => {
    if (!id) {
      throw new Error("ID de evento no válido");
    }
    return await agendaRepository.remove(id);
  },
};