import AsyncStorage from "@react-native-async-storage/async-storage";

/* ======================================================
   UID EFECTIVO (REAL U OFFLINE)
====================================================== */
async function getEffectiveUid(uid?: string | null): Promise<string> {
  if (uid) return uid;

  try {
    const raw = await AsyncStorage.getItem("@tasklife/session");
    if (!raw) return "guest";

    const session = JSON.parse(raw);
    return session?.id ?? "guest";
  } catch {
    return "guest";
  }
}

/* ======================================================
   MEDICAMENTOS
====================================================== */

export const MEDS_KEY_PREFIX = "@tasklife/meds";

export type StoredMed = {
  id: string;
  nombre: string;
  dosisMg: string;
  cadaHoras: string;
  cantidad: string;
  umbral: string;
  photoUri?: string;
  lastTaken?: number;
};

async function medsKeyForUser(uid?: string | null) {
  const effectiveUid = await getEffectiveUid(uid);
  return `${MEDS_KEY_PREFIX}_${effectiveUid}`;
}

export async function loadMeds(uid?: string | null): Promise<StoredMed[]> {
  try {
    const key = await medsKeyForUser(uid);
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.log("Error al cargar medicamentos:", e);
    return [];
  }
}

export async function saveMeds(
  uid: string | null | undefined,
  meds: StoredMed[]
): Promise<void> {
  try {
    const key = await medsKeyForUser(uid);
    await AsyncStorage.setItem(key, JSON.stringify(meds));
  } catch (e) {
    console.log("Error al guardar medicamentos:", e);
  }
}

/* ======================================================
   TAREAS
====================================================== */

export type Prioridad = "Baja" | "Media" | "Alta";

export type StoredTask = {
  id: number;
  titulo: string;
  descripcion?: string;
  fechaLimite?: string;
  prioridad: Prioridad;
  completada: boolean;
};

const TASKS_KEY_PREFIX = "@tasklife/tasks";

async function tasksKeyForUser(uid?: string | null) {
  const effectiveUid = await getEffectiveUid(uid);
  return `${TASKS_KEY_PREFIX}_${effectiveUid}`;
}

export async function loadTasks(uid?: string | null): Promise<StoredTask[]> {
  try {
    const key = await tasksKeyForUser(uid);
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.log("Error al cargar tareas:", e);
    return [];
  }
}

export async function saveTasks(
  uid: string | null | undefined,
  tasks: StoredTask[]
): Promise<void> {
  try {
    const key = await tasksKeyForUser(uid);
    await AsyncStorage.setItem(key, JSON.stringify(tasks));
  } catch (e) {
    console.log("Error al guardar tareas:", e);
  }
}

/* ======================================================
   COMPRAS
====================================================== */

export interface ProductoCompra {
  id: string;
  descripcion: string;
  cantidad: number;
  precio: number;
}

export interface StoredCompra {
  id: string;
  categoria: string;
  productos: ProductoCompra[];
  total: number;
  fecha: number;
}

const COMPRAS_KEY = "@tasklife/compras";

async function comprasKeyForUser(uid?: string | null) {
  const effectiveUid = await getEffectiveUid(uid);
  return `${COMPRAS_KEY}_${effectiveUid}`;
}

export async function loadCompras(
  userId: string | null
): Promise<StoredCompra[]> {
  try {
    const key = await comprasKeyForUser(userId);
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.log("Error al cargar compras:", e);
    return [];
  }
}

export async function saveCompras(
  userId: string | null,
  compras: StoredCompra[]
): Promise<void> {
  try {
    const key = await comprasKeyForUser(userId);
    await AsyncStorage.setItem(key, JSON.stringify(compras));
  } catch (e) {
    console.log("Error al guardar compras:", e);
  }
}

/* ======================================================
   EVENTOS
====================================================== */

export interface StoredEvento {
  id: string;
  titulo: string;
  fecha: string;
  hora: string;
  comentarios?: string;
  asistencia?: "asistio" | "no_asistio";
}

const EVENTOS_KEY = "@tasklife/eventos";

async function eventosKeyForUser(uid?: string | null) {
  const effectiveUid = await getEffectiveUid(uid);
  return `${EVENTOS_KEY}_${effectiveUid}`;
}

export async function loadEventos(userId: string | null) {
  try {
    const key = await eventosKeyForUser(userId);
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.log("Error al cargar eventos:", e);
    return [];
  }
}

export async function saveEventos(
  userId: string | null,
  eventos: StoredEvento[]
) {
  try {
    const key = await eventosKeyForUser(userId);
    await AsyncStorage.setItem(key, JSON.stringify(eventos));
  } catch (e) {
    console.log("Error al guardar eventos:", e);
  }
}

/* ======================================================
   AUTH — OFFLINE FIRST
====================================================== */

export type StoredUser = {
  id: string;        // UID REAL de Firebase
  email: string;
  password: string;
  nombre: string;
  synced: boolean;
  deleted?: boolean;
};

const USERS_KEY = "@tasklife/users";
const SESSION_KEY = "@tasklife/session";

// Usuarios
export async function loadUsers(): Promise<StoredUser[]> {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveUsers(users: StoredUser[]) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Sesión
export async function saveSession(user: StoredUser) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export async function loadSession(): Promise<StoredUser | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

// Eliminación lógica
export async function markUserDeleted(email: string) {
  const users = await loadUsers();
  const normalized = email.toLowerCase();

  const updated = users.map((u) =>
    u.email === normalized ? { ...u, deleted: true } : u
  );

  await saveUsers(updated);
}
