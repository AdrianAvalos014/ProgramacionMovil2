import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface Props extends TextInputProps {
  esPassword?: boolean;
}

export function LoginInput({ esPassword = false, ...rest }: Props) {
  const [mostrarTexto, setMostrarTexto] = useState(false);

  return (
    <View style={styles.contenedor}>
      <TextInput
        style={styles.input}
        placeholderTextColor="#999"
        secureTextEntry={esPassword && !mostrarTexto}
        autoCapitalize="none"
        {...rest}
      />

      {/*OJO*/}
      {esPassword && (
        <TouchableOpacity
          style={styles.ojito}
          onPress={() => setMostrarTexto((prev) => !prev)}
        >
          <MaterialIcons
            name={mostrarTexto ? "visibility" : "visibility-off"}
            size={22}
            color="#888"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 14,
    paddingHorizontal: 14,
  },

  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    color: "#212121",
  },

  ojito: {
    padding: 4,
  },
});
