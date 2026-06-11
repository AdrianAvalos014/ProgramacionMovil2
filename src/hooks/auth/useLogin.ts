import { useState } from "react";
import { Alert } from "react-native";
import { authService } from "../../services/authService";
import { useUser } from "../../context/UserContext";

export const useLogin = (onSuccess: () => void) => {
  const { setUser } = useUser();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validar = (): boolean => {
    const emailNorm = email.trim().toLowerCase();
    if (!emailNorm || !password.trim()) {
      Alert.alert("Faltan datos", "Ingresa correo y contraseña.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      Alert.alert("Correo inválido", "Escribe un correo válido.");
      return false;
    }
    if (password.trim().length < 8) {
      Alert.alert(
        "Contraseña inválida",
        "La contraseña debe tener al menos 8 caracteres."
      );
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validar()) return;
    setIsLoading(true);
    try {
      const userData = await authService.login(
        email.trim().toLowerCase(),
        password.trim()
      );
      setUser(userData);
      onSuccess();
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  return { email, setEmail, password, setPassword, isLoading, handleLogin };
};