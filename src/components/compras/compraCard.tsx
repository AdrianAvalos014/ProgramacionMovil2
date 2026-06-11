import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import {Compra,parseProductos,} from "../../../types/compras/comprasTypes";
import { fromISOtoDMY } from "../../hooks/compras/useCompras";
import { comprasStyles as styles } from "../../styles/compras/comprasStyles";

interface Props {
  compra: Compra;
  onEdit: (compra: Compra) => void;
  onDelete: (id: string) => void;
}

export const CompraCard = ({ compra, onEdit, onDelete }: Props) => {
  const productos = parseProductos(compra.productos);

  return (
    <View style={styles.compraCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.compraCategoria}>{compra.categoria}</Text>

        <Text style={styles.compraFecha}>
          {compra.fecha ? fromISOtoDMY(compra.fecha) : ""}
        </Text>

        {productos.map((p) => (
          <Text key={p.id} style={styles.compraDetalle}>
            • {p.descripcion} ({p.cantidad} × ${p.precio})
          </Text>
        ))}

        <Text style={styles.compraTotal}>
          Total: ${compra.total.toFixed(2)}
        </Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => onEdit(compra)}>
          <MaterialIcons name="edit" size={22} color="#FF9800" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onDelete(compra.id)}>
          <MaterialIcons name="delete" size={22} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );
};