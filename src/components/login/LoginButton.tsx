import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface Props {
  texto: string;
  onPress: () => void;
  deshabilitado?: boolean;
}

export function LoginButton({ texto, onPress, deshabilitado = false }: Props) {
  return (
    <TouchableOpacity
      style={[styles.boton, deshabilitado && styles.botonDeshabilitado]}
      onPress={onPress}
      disabled={deshabilitado}
      activeOpacity={0.85}
    >
      <Text style={styles.texto}>{texto}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  boton: {
    backgroundColor: "#D32F2F",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
    elevation: 3,
  },

  botonDeshabilitado: {
    opacity: 0.6,
  },

  texto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
