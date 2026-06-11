import { getDB } from '../db';
import { addToSyncQueue } from './syncQueueRepository';
import * as Crypto from 'expo-crypto';

export const medicamentosRepository = {
  getAll: async (userId: string): Promise<any[]> => {
    const db = await getDB();
    try {
      return await db.getAllAsync(
        `SELECT * FROM medicamentos WHERE user_id = ? AND deleted = 0 ORDER BY nombre ASC`,
        [userId]
      );
    } catch {
      return [];
    }
  },

  getById: async (id: string): Promise<any | null> => {
    const db = await getDB();
    try {
      return await db.getFirstAsync(`SELECT * FROM medicamentos WHERE id = ?`, [id]);
    } catch {
      return null;
    }
  },

  create: async (userId: string, data: { nombre: string; dosisMg?: string; cadaHoras?: string; cantidad?: string; umbral?: string; photoUri?: string }) => {
    const db = await getDB();
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    const record = {
      id,
      user_id: userId,
      nombre: data.nombre,
      dosisMg: data.dosisMg || null,
      cadaHoras: data.cadaHoras || null,
      cantidad: data.cantidad || null,
      umbral: data.umbral || null,
      photoUri: data.photoUri || null,
      lastTaken: null,
      created_at: now,
      updated_at: now,
      sync_status: 'pending',
      deleted: 0,
    };

    try {
      await db.runAsync(
        `INSERT INTO medicamentos (id, user_id, nombre, dosisMg, cadaHoras, cantidad, umbral, photoUri, lastTaken, created_at, updated_at, sync_status, deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [record.id, record.user_id, record.nombre, record.dosisMg, record.cadaHoras, record.cantidad, record.umbral, record.photoUri, record.lastTaken, record.created_at, record.updated_at, record.sync_status, record.deleted]
      );

      await addToSyncQueue('medicamentos', id, 'INSERT', record);
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
      await db.runAsync(`UPDATE medicamentos SET ${setClause} WHERE id = ?`, values);

      const updatedRecord = await medicamentosRepository.getById(id);
      if (updatedRecord) {
        await addToSyncQueue('medicamentos', id, 'UPDATE', updatedRecord);
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
        `UPDATE medicamentos SET deleted = 1, sync_status = 'pending', updated_at = ? WHERE id = ?`,
        [now, id]
      );

      await addToSyncQueue('medicamentos', id, 'DELETE', { id, deleted: 1, updated_at: now });
    } catch (error) {
      throw error;
    }
  },

  markAsSynced: async (id: string): Promise<void> => {
    const db = await getDB();
    try {
      await db.runAsync(`UPDATE medicamentos SET sync_status = 'synced' WHERE id = ?`, [id]);
    } catch {}
  },

  getPending: async (): Promise<any[]> => {
    const db = await getDB();
    try {
      return await db.getAllAsync(`SELECT * FROM medicamentos WHERE sync_status = 'pending'`);
    } catch {
      return [];
    }
  }
};