import {
  getPendingQueue,
  removeFromQueue,
  incrementAttempts,
  addToSyncQueue,
} from "../database/repositories/syncQueueRepository";
import { getDB } from "../database/db";
import { syncEvents } from "../Events/syncEvents";
import { API_URL } from "../services/api";

const getAuthHeader = async (): Promise<Record<string, string>> => {
  try {
    const db = await getDB();
    const row = await db.getFirstAsync<{ token: string }>(
      `SELECT token FROM users ORDER BY rowid DESC LIMIT 1`
    );
    if (!row?.token) return {};
    return { Authorization: `Bearer ${row.token}` };
  } catch {
    return {};
  }
};

export const repairSyncQueue = async (): Promise<void> => {
  const db = await getDB();
  const tables = ["tareas", "agenda", "compras", "medicamentos"];

  for (const table of tables) {
    const pending: any[] = await db.getAllAsync(
      `SELECT * FROM ${table} WHERE sync_status = 'pending'`,
    );
    for (const record of pending) {
      let operation: "INSERT" | "UPDATE" | "DELETE";
      if (record.deleted === 1) {
        operation = "DELETE";
      } else if (record.created_at === record.updated_at) {
        operation = "INSERT";
      } else {
        operation = "UPDATE";
      }
      await addToSyncQueue(table, record.id, operation, record);
    }
  }
};

export const processSyncQueue = async (): Promise<void> => {
  let queue: any[] = [];
  try {
    queue = await getPendingQueue();
  } catch {
    return;
  }

  if (!queue.length) return;

  const authHeader = await getAuthHeader();

  for (const item of queue) {
    try {
      const { id, table_name, operation, payload, record_id } = item;
      const data = JSON.parse(payload);

      const response = await fetch(`${API_URL}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ table_name, operation, payload: data }),
      });

      const responseText = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${responseText}`);

      const db = await getDB();
      if (operation === "DELETE") {
        await db.runAsync(`DELETE FROM ${table_name} WHERE id = ?`, [record_id]);
      } else {
        await db.runAsync(
          `UPDATE ${table_name} SET sync_status = 'synced' WHERE id = ?`,
          [record_id],
        );
      }
      await removeFromQueue(id);

    } catch (error: any) {
      try {
        await incrementAttempts(item.id);
        const db = await getDB();
        await db.runAsync(
          `UPDATE sync_queue SET last_error = ? WHERE id = ?`,
          [error?.message ?? "unknown", item.id],
        );
      } catch {}
    }
  }
};

export const downloadFromCloud = async (userId: string): Promise<void> => {
  const db = await getDB();
  const authHeader = await getAuthHeader();

  const tables = [
    { name: "tareas",       endpoint: "tareas" },
    { name: "agenda",       endpoint: "agenda" },
    { name: "compras",      endpoint: "compras" },
    { name: "medicamentos", endpoint: "medicamentos" },
  ];

  for (const { name, endpoint } of tables) {
    try {
      const response = await fetch(`${API_URL}/${endpoint}/${userId}`, {
        headers: { ...authHeader },
      });

      if (!response.ok) continue;

      const json = await response.json();
      const records: any[] = json.data ?? [];

      for (const record of records) {
        const existing = await db.getFirstAsync(
          `SELECT id, updated_at FROM ${name} WHERE id = ?`,
          [record.id],
        );

        if (!existing) {
          const columns = Object.keys(record).join(", ");
          const placeholders = Object.keys(record).map(() => "?").join(", ");
          const values = Object.values(record).map((v) => v as string | number | null);
          await db.runAsync(
            `INSERT INTO ${name} (${columns}) VALUES (${placeholders})`,
            values,
          );
          await db.runAsync(
            `UPDATE ${name} SET sync_status = 'synced' WHERE id = ?`,
            [record.id],
          );
        } else {
          const localDate = (existing as any).updated_at ?? "";
          const cloudDate = record.updated_at ?? "";
          if (cloudDate > localDate) {
            const entries = Object.entries(record).filter(([k]) => k !== "id");
            const setClause = entries.map(([k]) => `${k} = ?`).join(", ");
            const values = [
              ...entries.map(([, v]) => v as string | number | null),
              record.id as string,
            ];
            await db.runAsync(`UPDATE ${name} SET ${setClause} WHERE id = ?`, values);
            await db.runAsync(
              `UPDATE ${name} SET sync_status = 'synced' WHERE id = ?`,
              [record.id],
            );
          }
        }
      }

      const cloudIds = records.map((r) => r.id);
      const localRecords: any[] = await db.getAllAsync(
        `SELECT id FROM ${name} WHERE user_id = ? AND sync_status = 'synced'`,
        [userId],
      );
      for (const local of localRecords) {
        if (!cloudIds.includes(local.id)) {
          await db.runAsync(`DELETE FROM ${name} WHERE id = ?`, [local.id]);
        }
      }

    } catch {}
  }

  syncEvents.emit();
};

export const processQueue = async (_userId?: string): Promise<void> => {
  await processSyncQueue();
};
