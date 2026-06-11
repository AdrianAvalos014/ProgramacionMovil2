import { getDB } from "../db";

// Agregar a la cola de sincronización
export const addToSyncQueue = async (
  tableName: string,
  recordId: string,
  operation: "INSERT" | "UPDATE" | "DELETE",
  payload: Record<string, any>
): Promise<void> => {
  const db = await getDB();
  await db.runAsync(
    `DELETE FROM sync_queue
     WHERE table_name = ?
     AND record_id = ?`,
    [tableName, recordId]
  );
  await db.runAsync(
    `INSERT INTO sync_queue
      (table_name, record_id, operation, payload)
     VALUES (?, ?, ?, ?)`,
    [tableName, recordId, operation, JSON.stringify(payload)]
  );
};

// Obtener pendientes
export const getPendingQueue = async (): Promise<any[]> => {
  const db = await getDB();
  return await db.getAllAsync(
    `SELECT * FROM sync_queue
     WHERE attempts < 5
     ORDER BY created_at ASC`
  );
};

// Eliminar de la cola
export const removeFromQueue = async (id: number): Promise<void> => {
  const db = await getDB();
  await db.runAsync(
    `DELETE FROM sync_queue WHERE id = ?`,
    [id]
  );
};

// Incrementar intentos
export const incrementAttempts = async (id: number): Promise<void> => {
  const db = await getDB();
  await db.runAsync(
    `UPDATE sync_queue
     SET attempts = attempts + 1,
         updated_at = datetime('now')
     WHERE id = ?`,
    [id]
  );
};