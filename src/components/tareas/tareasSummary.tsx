import React from "react";
import { View, Text } from "react-native";
import { styles } from "../../styles/tareas/tareasStyles";

interface Props {
  pendientes: number;
  completadas: number;
}

export const TareasSummary = ({ pendientes, completadas }: Props) => {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Pendientes</Text>
        <Text style={styles.summaryValue}>{pendientes}</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Completadas</Text>
        <Text style={styles.summaryValue}>{completadas}</Text>
      </View>
    </View>
  );
};