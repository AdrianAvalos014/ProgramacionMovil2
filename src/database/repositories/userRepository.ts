import { getDB } from "../db";
import * as Crypto from "expo-crypto";

export type LocalUser = {
  id: string;
  email: string;
  nombre: string;
  token: string | null;
  password_hash: string | null;
  synced?: number;
  pending_register?: number;
};

const hashPassword = async (password: string): Promise<string> => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
};

export const userRepository = {
  setCurrentUser: async (user: {
    id: string;
    email: string;
    nombre: string;
    token: string;
    password?: string;
  }): Promise<void> => {
    const db = await getDB();

    const passwordHash = user.password
      ? await hashPassword(user.password)
      : null;

    await db.runAsync(
      `
      INSERT INTO users (
        id,
        email,
        nombre,
        token,
        password_hash,
        synced,
        pending_register
      )
      VALUES (?, ?, ?, ?, ?, 1, 0)
      ON CONFLICT(id) DO UPDATE SET
        email = excluded.email,
        nombre = excluded.nombre,
        token = excluded.token,
        password_hash = COALESCE(excluded.password_hash, users.password_hash),
        synced = 1,
        pending_register = 0
      `,
      [
        user.id,
        user.email.toLowerCase(),
        user.nombre,
        user.token,
        passwordHash,
      ]
    );
  },

  getCurrentUser: async (): Promise<LocalUser | null> => {
    const db = await getDB();

    return await db.getFirstAsync<LocalUser>(
      `
      SELECT *
      FROM users
      ORDER BY rowid DESC
      LIMIT 1
      `
    );
  },

  getByEmail: async (email: string): Promise<LocalUser | null> => {
    const db = await getDB();

    return await db.getFirstAsync<LocalUser>(
      `
      SELECT *
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email.toLowerCase()]
    );
  },

  createOffline: async (user: {
    id: string;
    email: string;
    nombre: string;
    password: string;
  }): Promise<void> => {
    const db = await getDB();

    const passwordHash = await hashPassword(user.password);

    await db.runAsync(
      `
      INSERT INTO users (
        id,
        email,
        nombre,
        token,
        password_hash,
        synced,
        pending_register
      )
      VALUES (?, ?, ?, '', ?, 0, 1)
      `,
      [
        user.id,
        user.email.toLowerCase(),
        user.nombre,
        passwordHash,
      ]
    );
  },

  validatePassword: async (
    password: string,
    storedHash: string
  ): Promise<boolean> => {
    const hash = await hashPassword(password);
    return hash === storedHash;
  },

  logout: async (): Promise<void> => {
    const db = await getDB();
    await db.runAsync(`DELETE FROM users`);
  },
};