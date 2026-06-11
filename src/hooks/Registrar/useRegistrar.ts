import { useState } from "react";
import { registerUser } from "../../services/registrarService/authService";
import { validateRegister } from "../../utils/authValidator";
import { useUser } from "../../context/UserContext";

export const useRegister = (navigation: any) => {
  const { setUser } = useUser();
  const [nombre, setNombre]     = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  const handleRegister = async () => {
    if (!validateRegister(nombre, email, password)) return;
    setLoading(true);
    try {
      const userData = await registerUser({ nombre, email, password, navigation });
      if (userData) setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  return {
    nombre, setNombre,
    email, setEmail,
    password, setPassword,
    loading,
    handleRegister,
  };
};