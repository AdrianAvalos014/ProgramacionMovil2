import { getDB } from "./db";

export const initializeDatabase = async (): Promise<void> => {
  const db = await getDB();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tareas (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      completada INTEGER DEFAULT 0,
      fechaLimite TEXT,
      prioridad TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      sync_status TEXT DEFAULT 'pending',
      deleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS agenda (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      asistencia TEXT,
      fecha TEXT NOT NULL,
      hora TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      sync_status TEXT DEFAULT 'pending',
      deleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS compras (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    categoria TEXT,
    productos TEXT, -- JSON string
    total REAL,
    fecha TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    sync_status TEXT DEFAULT 'pending',
    deleted INTEGER DEFAULT 0
    );

    
    CREATE TABLE IF NOT EXISTS medicamentos (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    nombre TEXT NOT NULL,
    dosisMg TEXT,
    cadaHoras TEXT,
    cantidad TEXT,
    umbral TEXT,
    photoUri TEXT,
    lastTaken INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    sync_status TEXT DEFAULT 'pending',
    deleted INTEGER DEFAULT 0
    );

    
    CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL,
    payload TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    attempts INTEGER DEFAULT 0,
    last_error TEXT,          
    synced INTEGER DEFAULT 0  
    );

    CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    token TEXT,
    password_hash TEXT,
    synced INTEGER DEFAULT 1,
    pending_register INTEGER DEFAULT 0
    );
  `);
  await db.execAsync(`
  ALTER TABLE users ADD COLUMN password_hash TEXT;
  `).catch(() => {});
  await db.execAsync(`
  ALTER TABLE users ADD COLUMN synced INTEGER DEFAULT 1;
  `).catch(() => {});
  await db.execAsync(`
  ALTER TABLE users ADD COLUMN pending_register INTEGER DEFAULT 0;
  `).catch(() => {});
};

