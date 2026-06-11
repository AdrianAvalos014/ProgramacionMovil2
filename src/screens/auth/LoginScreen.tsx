import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";

import { RootStackParamList } from "../../navigation/StackNavigator";
import { useLogin } from "../../hooks/auth/useLogin";
import { LoginInput } from "../../components/login/LoginInput";
import { LoginButton } from "../../components/login/LoginButton";
import {  styles } from "../../styles/auth/loginStyles";

const loginImage = require("../../../assets/login_image.png");

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, "Login">;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {

  // Cuando el login es exitoso, navegamos al Home
  const { email, setEmail, password, setPassword, isLoading, handleLogin } =
    useLogin(() => navigation.replace("Home"));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>

        {/* Logo */}
        <Image source={loginImage} style={styles.loginImage} />

        {/* Título y subtítulo */}
        <Text style={styles.title}>Task&Life</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        {/* Card del formulario */}
        <View style={styles.formCard}>

          {/* Input de correo */}
          <LoginInput
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!isLoading}
          />

          {/* Input de contraseña con ojito */}
          <LoginInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            esPassword
            editable={!isLoading}
          />

          {/* Botón de iniciar sesión */}
          <LoginButton
            texto={isLoading ? "Ingresando..." : "Iniciar Sesión"}
            onPress={handleLogin}
            deshabilitado={isLoading}
          />

        </View>

        {/* Links de recuperar contraseña y registro */}
        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("RecuperarScreen")}>
            <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("RegistrarScreen")}>
            <Text style={styles.link}>Regístrate</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;