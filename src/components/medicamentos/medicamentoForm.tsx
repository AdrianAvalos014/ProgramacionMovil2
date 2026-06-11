import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { styles } from "../../styles/medicamentos/medicamentosStyles";

type Props = {
  visible: boolean;
  onClose: () => void;
  editingId: string | null;
  nombre: string;
  setNombre: (v: string) => void;
  dosisMg: string;
  setDosisMg: (v: string) => void;
  cadaHoras: string;
  setCadaHoras: (v: string) => void;
  cantidad: string;
  setCantidad: (v: string) => void;
  umbral: string;
  setUmbral: (v: string) => void;
  photoUri: string | null;
  onTomarFoto: () => void;
  onGuardar: () => void;
};

export const MedicamentoForm = ({
  visible,
  onClose,
  editingId,
  nombre,
  setNombre,
  dosisMg,
  setDosisMg,
  cadaHoras,
  setCadaHoras,
  cantidad,
  setCantidad,
  umbral,
  setUmbral,
  photoUri,
  onTomarFoto,
  onGuardar,
}: Props) => {

  // Verifica que los campos estén completos y con valores válidos
  const validarFormulario = (): boolean => {

    // Nombre obligatorio
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return false;
    }

    // Dosis: obligatoria, debe ser número mayor a cero
    const dosisNum = Number(dosisMg);
    if (!dosisMg.trim() || isNaN(dosisNum) || dosisNum <= 0) {
      Alert.alert("Error", "La dosis debe ser un número mayor a cero");
      return false;
    }

    // Horas: obligatorias, debe ser número mayor a cero
    const horasNum = Number(cadaHoras);
    if (!cadaHoras.trim() || isNaN(horasNum) || horasNum <= 0) {
      Alert.alert("Error", "Las horas deben ser un número mayor a cero");
      return false;
    }

    // Cantidad: obligatoria, debe ser número mayor a cero
    const cantidadNum = Number(cantidad);
    if (!cantidad.trim() || isNaN(cantidadNum) || cantidadNum <= 0) {
      Alert.alert("Error", "La cantidad debe ser un número mayor a cero");
      return false;
    }

    // Umbral: obligatorio
    if (!umbral.trim()) {
      Alert.alert("Error", "El umbral es obligatorio");
      return false;
    }

    // Foto obligatoria
    if (!photoUri) {
      Alert.alert("Error", "La foto es obligatoria");
      return false;
    }

    return true;
  };

  // Solo guarda si todas las validaciones pasan
  const handleGuardar = () => {
    if (validarFormulario()) {
      onGuardar();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Fondo oscuro semitransparente */}
      <View style={styles.modalBg}>
        <ScrollView contentContainerStyle={styles.modalScroll}>
          <View style={styles.modalCard}>

            {/* HEADER: título*/}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? "Editar medicamento" : "Nuevo medicamento"}
              </Text>

              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            {/* FOTO */}
            <TouchableOpacity style={styles.photoPicker} onPress={onTomarFoto}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoLarge} />
              ) : (
                <>
                  <MaterialIcons name="add-a-photo" size={40} color="#9A8478" />
                  <Text style={styles.photoPickerText}>Tomar foto</Text>
                </>
              )}
            </TouchableOpacity>

            {/* NOMBRE */}
            <Text style={styles.label}>Nombre del medicamento</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Paracetamol"
              placeholderTextColor="#999"
              value={nombre}
              onChangeText={setNombre}
            />

            {/* DOSIS */}
            <Text style={styles.label}>Dosis (mg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 500"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={dosisMg}
              onChangeText={setDosisMg}
            />

            {/* CADA HORAS y STOCK en fila doble */}
            <View style={styles.doubleRow}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Cada horas</Text>
                <TextInput
                  style={styles.input}
                  placeholder="8"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={cadaHoras}
                  onChangeText={setCadaHoras}
                />
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Stock</Text>
                <TextInput
                  style={styles.input}
                  placeholder="20"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={cantidad}
                  onChangeText={setCantidad}
                />
              </View>
            </View>

            {/* UMBRAL */}
            <Text style={styles.label}>Umbral mínimo</Text>
            <TextInput
              style={styles.input}
              placeholder="5"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={umbral}
              onChangeText={setUmbral}
            />

            {/* BOTONES: Cancelar y Guardar */}
            <View style={styles.modalBtnsRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={onClose}
              >
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleGuardar}
              >
                <Text style={styles.modalBtnText}>Guardar</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
