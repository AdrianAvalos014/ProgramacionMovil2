import { getDB } from '../db';
import { addToSyncQueue } from './syncQueueRepository';
import * as Crypto from 'expo-crypto';

export const comprasRepository = {
  getAll: async (userId: string): Promise<any[]> => {
    const db = await getDB();
    try {
      return await db.getAllAsync(
        `SELECT * FROM compras WHERE user_id = ? AND deleted = 0 ORDER BY fecha DESC`,
        [userId]
      );
    } catch {
      return [];
    }
  },

  getById: async (id: string): Promise<any | null> => {
    const db = await getDB();
    try {
      return await db.getFirstAsync(`SELECT * FROM compras WHERE id = ?`, [id]);
    } catch {
      return null;
    }
  },

  create: async (userId: string, data: { categoria: string; productos: string; total: number; fecha: string }) => {
    const db = await getDB();
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    const record = {
      id,
      user_id: userId,
      categoria: data.categoria,
      productos: data.productos,
      total: data.total,
      fecha: data.fecha,
      created_at: now,
      updated_at: now,
      sync_status: 'pending',
      deleted: 0,
    };

    try {
      await db.runAsync(
        `INSERT INTO compras (id, user_id, categoria, productos, total, fecha, created_at, updated_at, sync_status, deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [record.id, record.user_id, record.categoria, record.productos, record.total, record.fecha, record.created_at, record.updated_at, record.sync_status, record.deleted]
      );

      await addToSyncQueue('compras', id, 'INSERT', record);
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
      await db.runAsync(`UPDATE compras SET ${setClause} WHERE id = ?`, values);

      const updatedRecord = await comprasRepository.getById(id);
      if (updatedRecord) {
        await addToSyncQueue('compras', id, 'UPDATE', updatedRecord);
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
        `UPDATE compras SET deleted = 1, sync_status = 'pending', updated_at = ? WHERE id = ?`,
        [now, id]
      );

      await addToSyncQueue('compras', id, 'DELETE', { id, deleted: 1, updated_at: now });
    } catch (error) {
      throw error;
    }
  },

  markAsSynced: async (id: string): Promise<void> => {
    const db = await getDB();
    try {
      await db.runAsync(`UPDATE compras SET sync_status = 'synced' WHERE id = ?`, [id]);
    } catch {}
  },

  getPending: async (): Promise<any[]> => {
    const db = await getDB();
    try {
      return await db.getAllAsync(`SELECT * FROM compras WHERE sync_status = 'pending'`);
    } catch {
      return [];
    }
  }
};