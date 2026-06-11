import { Alert } from "react-native";

export const validateRegister = (
  nombre: string,
  email: string,
  password: string
) => {
  if (!nombre.trim() || !email.trim() || !password.trim()) {
    Alert.alert("Faltan datos", "Completa todos los campos.");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;

  if (!emailRegex.test(email.trim().toLowerCase())) {
    Alert.alert("Correo inválido", "Debe contener @ y terminar en .com");
    return false;
  }

  if (password.length < 8) {
    Alert.alert("Contraseña inválida", "Mínimo 8 caracteres");
    return false;
  }

  return true;
};
