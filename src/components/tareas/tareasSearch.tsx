import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "../../styles/tareas/tareasStyles";

interface Props {
  busqueda: string;
  setBusqueda: (value: string) => void;
}

export const TareasSearch = ({ busqueda, setBusqueda }: Props) => {
  return (
    <View style={styles.searchContainer}>
      <FontAwesome5 name="search" size={16} color="#777" />

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar tarea..."
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {busqueda.length > 0 && (
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() => setBusqueda("")}
        >
          <FontAwesome5 name="times" size={14} color="#777" />
        </TouchableOpacity>
      )}
    </View>
  );
};