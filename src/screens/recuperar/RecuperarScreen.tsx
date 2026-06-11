import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";

type Nav = StackNavigationProp<RootStackParamList, "RecuperarScreen">;

export default function RecuperarScreen({ navigation }: { navigation: Nav }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Recuperar Contraseña</Text>
        <Text style={styles.message}>
          Para recuperar tu contraseña, contacta al administrador o
          inicia sesión y cámbiala desde tu perfil.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "beige", 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20 
  },
  card:{ 
    width: "100%", 
    maxWidth: 340, 
    backgroundColor: "#fff", 
    borderRadius: 16, 
    padding: 20, 
    gap: 12 
  },
  title:{ 
    fontSize: FONT_SIZES.xxlarge, 
    fontWeight: "bold", 
    color: "red", 
    textAlign: "center" 
  },
  message:{ 
    fontSize: 
    FONT_SIZES.medium, 
    color: COLORS.text, 
    textAlign: "center", 
    lineHeight: 22 
  },
  button:{ 
    backgroundColor: "red", 
    height: 50, 
    borderRadius: 10, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  buttonText:{ 
    color: "#fff", 
    fontSize: FONT_SIZES.medium, 
    fontWeight: "bold" 
  },
});