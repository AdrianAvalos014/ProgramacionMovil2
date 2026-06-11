import NetInfo from "@react-native-community/netinfo";
import { API_URL } from "../services/api";
import { userRepository } from "../database/repositories/userRepository";
export interface AuthUser {
  user_id: string;
  email: string;
  nombre: string;
  token: string;
}
export const authService = {
  async register(
    email: string,
    password: string,
    nombre: string
  ): Promise<AuthUser> {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.toLowerCase(),
        password,
        nombre,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Error al registrar");
    }

    const data: AuthUser = await res.json();
    await authService.saveUser(data, password);
    return data;
  },

  async login(email: string, password: string): Promise<AuthUser> {
    const net = await NetInfo.fetch();
    const hasInternet =
      net.isConnected &&
      net.isInternetReachable;

    if (hasInternet) {
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.toLowerCase(),
            password,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Credenciales incorrectas");
        }

        const data: AuthUser = await res.json();
        await authService.saveUser(data, password);
        return data;
      } catch (e: any) {
        if (e.message === "Credenciales incorrectas") {
          throw e;
        }

        return await authService.loginOffline(email, password);
      }
    }
    return await authService.loginOffline(email, password);
  },
  async loginOffline(email: string, password: string): Promise<AuthUser> {
    const row = await userRepository.getByEmail(email.toLowerCase());
    if (!row) {
      throw new Error("No hay sesión guardada para este correo.");
    }
    if (!row.password_hash) {
      throw new Error("Necesitas internet para iniciar sesión la primera vez.");
    }
    const validPassword = await userRepository.validatePassword(
      password,
      row.password_hash
    );
    if (!validPassword) {
      throw new Error("Contraseña incorrecta.");
    }
    return {
      user_id: row.id,
      email: row.email,
      nombre: row.nombre,
      token: row.token || "",
    };
  },
  async saveUser(user: AuthUser, password?: string): Promise<void> {
    await userRepository.setCurrentUser({
      id: user.user_id,
      email: user.email,
      nombre: user.nombre,
      token: user.token,
      password,
    });
  },
  async getStoredUser(): Promise<AuthUser | null> {
    const row = await userRepository.getCurrentUser()
    if (!row) {
      return null;
    }
    return {
      user_id: row.id,
      email: row.email,
      nombre: row.nombre,
      token: row.token || "",
    };
  },
  async logout(): Promise<void> {
    await userRepository.logout();
  },
};