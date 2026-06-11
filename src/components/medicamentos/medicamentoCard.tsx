import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

import { Medicamento } from "../../../types/medicamentos/medicamentosTypes";
import { styles } from "../../styles/medicamentos/medicamentosStyles";

type Props = {
  medicamento: Medicamento;
  tomarDosis: (id: string) => void;
  empezarEditar: (medicamento: Medicamento) => void;
  eliminar: (id: string) => void;
  proximaTomaTexto: (medicamento: Medicamento) => string;
};

export function MedicamentoCard({
  medicamento,
  tomarDosis,
  empezarEditar,
  eliminar,
  proximaTomaTexto,
}: Props) {
  return (
    <View style={styles.medItem}>

      {/*Fila superior*/}
      <View style={styles.medHeader}>

        {/* Foto o ícono placeholder */}
        {medicamento.photoUri ? (
          <Image
            source={{ uri: medicamento.photoUri }}
            style={styles.medPhotoSmall}
          />
        ) : (
          <View style={styles.medPhotoPlaceholder}>
            <FontAwesome5 name="pills" size={18} color="#E53935" />
          </View>
        )}

        {/* Información del medicamento */}
        <View style={styles.medInfo}>
          <Text style={styles.medName}>{medicamento.nombre}</Text>
          <Text style={styles.medLine}>
            Dosis: {medicamento.dosisMg} mg · Cada {medicamento.cadaHoras} h
          </Text>
          <Text style={styles.medLine}>
            Cantidad: {medicamento.cantidad} · Umbral: {medicamento.umbral}
          </Text>
          <Text style={styles.medLine}>
            Próxima toma: {proximaTomaTexto(medicamento)}
          </Text>
        </View>

      </View>

      {/* Botones de acción */}
      <View style={styles.btnRow}>

        <TouchableOpacity
          style={[styles.smallBtn, styles.takeBtn]}
          onPress={() => tomarDosis(medicamento.id)}
        >
          <Text style={styles.smallBtnText}>Tomar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.smallBtn, styles.editBtn]}
          onPress={() => empezarEditar(medicamento)}
        >
          <Text style={styles.smallBtnText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.smallBtn, styles.deleteBtn]}
          onPress={() => eliminar(medicamento.id)}
        >
          <Text style={styles.smallBtnText}>Eliminar</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}
