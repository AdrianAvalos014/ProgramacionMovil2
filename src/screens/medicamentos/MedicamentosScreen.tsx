import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { ConnectionBadge } from "../../components/ConnectionBadge";
import { MedicamentoForm } from "../../components/medicamentos/medicamentoForm";
import { MedListCard } from "../../components/medicamentos/medListCard";
import { useMedicamentos } from "../../hooks/medicamentos/useMedicamentos";
import { styles } from "../../styles/medicamentos/medicamentosStyles";

export default function MedicamentosScreen() {

  const {
    isSyncing,
    lastSyncError,
    meds,
    loadingMeds,
    editingId,
    nombre, setNombre,
    dosisMg, setDosisMg,
    cadaHoras, setCadaHoras,
    cantidad, setCantidad,
    umbral, setUmbral,
    photoUri,
    guardar,
    eliminar,
    tomarDosis,
    empezarEditar,
    resetForm,
    tomarFoto,
    proximaTomaTexto,
    modalVisible,
    setModalVisible,
  } = useMedicamentos();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={headerColor} barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Mis medicamentos</Text>
        <MaterialIcons name="medication" size={24} color="#fff" />
      </View>

      {/* componente connectionbadge, de la barra de arriba*/}
      <ConnectionBadge />
      {isSyncing && (
        <Text style={styles.syncText}>Sincronizando cambios...</Text>
      )}
      {lastSyncError && (
        <Text style={styles.syncError}>
          No se pudo sincronizar. Se intentará después.
        </Text>
      )}

      <ScrollView contentContainerStyle={styles.scroller}>

        {/* FORMULARIO */}
        <MedicamentoForm
          visible={modalVisible}
          onClose={resetForm}
          editingId={editingId}
          nombre={nombre}
          setNombre={setNombre}
          dosisMg={dosisMg}
          setDosisMg={setDosisMg}
          cadaHoras={cadaHoras}
          setCadaHoras={setCadaHoras}
          cantidad={cantidad}
          setCantidad={setCantidad}
          umbral={umbral}
          setUmbral={setUmbral}
          photoUri={photoUri}
          onTomarFoto={tomarFoto}
          onGuardar={guardar}
        />

        {/* Lista de medicamentos */}
        <MedListCard
          meds={meds}
          loadingMeds={loadingMeds}
          proximaTomaTexto={proximaTomaTexto}
          tomarDosis={tomarDosis}
          empezarEditar={empezarEditar}
          eliminar={eliminar}
        />

        {/* boton para abrir el formulario*/}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="add" size={32} color="#fff" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const headerColor = "#D32F2F";