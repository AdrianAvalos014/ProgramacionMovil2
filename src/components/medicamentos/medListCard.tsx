import React from "react";
import { View, Text } from "react-native";

import { Medicamento } from "../../../types/medicamentos/medicamentosTypes";
import { MedicamentoCard } from "./medicamentoCard";
import { styles } from "../../styles/medicamentos/medicamentosStyles";

type Props = {
  meds: Medicamento[];
  loadingMeds: boolean;
  tomarDosis: (id: string) => void;
  empezarEditar: (medicamento: Medicamento) => void;
  eliminar: (id: string) => void;
  proximaTomaTexto: (medicamento: Medicamento) => string;
};

export function MedListCard({
  meds,
  loadingMeds,
  tomarDosis,
  empezarEditar,
  eliminar,
  proximaTomaTexto,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Medicamentos registrados</Text>

      {/* Cargando */}
      {loadingMeds && (
        <Text style={styles.empty}>Cargando medicamentos...</Text>
      )}

      {/* Lista vacía */}
      {!loadingMeds && meds.length === 0 && (
        <Text style={styles.empty}>Aún no registras medicamentos.</Text>
      )}

      {/* Lista de tarjetas */}
      {!loadingMeds &&
        meds.map((medicamento) => (
          <MedicamentoCard
            key={medicamento.id}
            medicamento={medicamento}
            tomarDosis={tomarDosis}
            empezarEditar={empezarEditar}
            eliminar={eliminar}
            proximaTomaTexto={proximaTomaTexto}
          />
        ))}
    </View>
  );
}
