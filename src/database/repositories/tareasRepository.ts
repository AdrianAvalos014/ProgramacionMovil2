import { getDB } from '../db';
import { addToSyncQueue } from './syncQueueRepository';
import * as Crypto from 'expo-crypto';

export const tareasRepository = {
  generateId: () => Crypto.randomUUID(),
  getAll: async (userId: string): Promise<any[]> => {
    const db = await getDB();
    try {
      return await db.getAllAsync(
        `SELECT * FROM tareas WHERE user_id = ? AND deleted = 0 ORDER BY created_at DESC`,
        [userId]
      );
    } catch {
      return [];
    }
  },

  getById: async (id: string): Promise<any | null> => {
    const db = await getDB();
    try {
      return await db.getFirstAsync(`SELECT * FROM tareas WHERE id = ?`, [id]);
    } catch {
      return null;
    }
  },

  create: async (
    userId: string,
    data: {
      titulo: string;
      descripcion?: string;
      fechaLimite?: string;
      prioridad?: string;
      completada?: number;
    }
    ) => {
    const db = await getDB();
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    const record = {
      id,
      user_id: userId,
      titulo: data.titulo,
      descripcion: data.descripcion || null,
      completada: data.completada ?? 0,
      fechaLimite: data.fechaLimite || null,
      prioridad: data.prioridad || 'Media',
      created_at: now,
      updated_at: now,
      sync_status: 'pending',
      deleted: 0,
    };

    try {
      await db.runAsync(
        `INSERT INTO tareas (id, user_id, titulo, descripcion, completada, fechaLimite, prioridad, created_at, updated_at, sync_status, deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record.id,
          record.user_id,
          record.titulo,
          record.descripcion,
          record.completada,
          record.fechaLimite,
          record.prioridad,
          record.created_at,
          record.updated_at,
          record.sync_status,
          record.deleted,
        ]
      );

      await addToSyncQueue('tareas', id, 'INSERT', record);
      return record;
    } catch (error) {
      throw error;
    }
  },

  update: async (id: string, data: Record<string, any>): Promise<void> => {
    const db = await getDB();
    const now = new Date().toISOString();

    const updates = { ...data, updated_at: now, sync_status: 'pending' };
    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    try {
      await db.runAsync(`UPDATE tareas SET ${setClause} WHERE id = ?`, values);

      const updatedRecord = await tareasRepository.getById(id);
      if (updatedRecord) {
        await addToSyncQueue('tareas', id, 'UPDATE', updatedRecord);
      }
    } catch (error) {
      throw error;
    }
  },

  remove: async (id: string): Promise<void> => {
    const db = await getDB();
    const now = new Date().toISOString();
    try {
      await db.runAsync(
        `UPDATE tareas SET deleted = 1, sync_status = 'pending', updated_at = ? WHERE id = ?`,
        [now, id]
      );
      await addToSyncQueue('tareas', id, 'DELETE', {
        id,
        deleted: 1,
        updated_at: now,
      });
    } catch (error) {
      throw error;
    }
  },

  markAsSynced: async (id: string): Promise<void> => {
    const db = await getDB();
    try {
      await db.runAsync(
        `UPDATE tareas SET sync_status = 'synced' WHERE id = ?`,
        [id]
      );
    } catch {}
  },

  getPending: async (): Promise<any[]> => {
    const db = await getDB();
    try {
      return await db.getAllAsync(
        `SELECT * FROM tareas WHERE sync_status = 'pending'`
      );
    } catch {
      return [];
    }
  }
};