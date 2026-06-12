import NetInfo from "@react-native-community/netinfo";
import { authService, type AuthUser } from "../authService";
import { userRepository } from "../../database/repositories/userRepository";

export const registerUser = async ({
  nombre,
  email,
  password,
  navigation,
}: any): Promise<AuthUser | null> => {
  const net = await NetInfo.fetch();

  const hasInternet =
    net.isConnected &&
    net.isInternetReachable;

  const emailNorm = email.trim().toLowerCase();
  const nombreNorm = nombre.trim();

  if (hasInternet) {
    const userData = await authService.register(
      emailNorm,
      password,
      nombreNorm
    );

    navigation.goBack();
    return userData;
  }

  const existingUser = await userRepository.getByEmail(emailNorm);

  if (existingUser) {
    throw new Error("Ese correo ya existe en este dispositivo.");
  }

  await userRepository.createOffline({
    id: `${Date.now()}-${Math.random()}`,
    email: emailNorm,
    nombre: nombreNorm,
    password,
  });

  navigation.goBack();

  return null;
};