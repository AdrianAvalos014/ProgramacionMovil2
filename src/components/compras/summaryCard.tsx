import React from "react";
import { View, Text } from "react-native";
import { comprasStyles as styles } from "../../styles/compras/comprasStyles";

interface Props {
  totalGastado: number;
}

export const SummaryCard = ({ totalGastado }: Props) => {
  return (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryLabel}>Total gastado</Text>
      <Text style={styles.summaryAmount}>${totalGastado.toFixed(2)}</Text>
    </View>
  );
};