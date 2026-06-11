import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FILTROS, Filtro } from "../../../types/tareas/tareasTypes";
import { styles } from "../../styles/tareas/tareasStyles";

interface Props {
  filtro: Filtro;
  setFiltro: (value: Filtro) => void;
}

export const TareasFilters = ({ filtro, setFiltro }: Props) => {
  return (
    <View style={styles.filtersRow}>
      {FILTROS.map((f) => {
        const active = filtro === f;

        return (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, active && styles.filterChipActive]}
            onPress={() => setFiltro(f)}
          >
            <Text
              style={[styles.filterText, active && styles.filterTextActive]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
