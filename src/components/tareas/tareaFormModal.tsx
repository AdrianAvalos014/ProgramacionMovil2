import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { PRIORIDADES } from "../../../types/tareas/tareasTypes";
import { styles } from "../../styles/tareas/tareasStyles";
import { prioridadColor } from "../../hooks/tareas/useTareas";

interface Props {
  tareas: any;
}

export const TareaModal = ({ tareas }: Props) => {
  return (
    <Modal
      visible={tareas.modalVisible}
      transparent
      animationType="fade"
      onRequestClose={tareas.cerrarModal}
    >
      <View style={styles.modalBg}>
        <ScrollView contentContainerStyle={styles.modalScroll}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {tareas.editingTask ? "Editar tarea" : "Nueva tarea"}
            </Text>

            <Text style={styles.label}>Título</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Hacer tarea de base de datos"
              value={tareas.titulo}
              onChangeText={tareas.setTitulo}
            />

            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: "top" }]}
              placeholder="Detalles de la tarea..."
              multiline
              value={tareas.descripcion}
              onChangeText={tareas.setDescripcion}
            />

            <Text style={styles.label}>Fecha límite</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={tareas.abrirCalendario}
            >
              <Text style={{ color: tareas.fechaLimite ? "#333" : "#999" }}>
                {tareas.fechaLimite || "Seleccionar fecha"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Prioridad</Text>
            <View style={styles.priorityRow}>
              {PRIORIDADES.map((p) => {
                const active = tareas.prioridad === p;

                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityChip,
                      active && {
                        backgroundColor: prioridadColor(p),
                        borderColor: prioridadColor(p),
                      },
                    ]}
                    onPress={() => tareas.setPrioridad(p)}
                  >
                    <Text
                      style={[
                        styles.priorityChipText,
                        active && { color: "white" },
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalBtnsRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#999" }]}
                onPress={tareas.cerrarModal}
                disabled={tareas.saving}
              >
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "red" }]}
                onPress={tareas.guardar}
                disabled={tareas.saving}
              >
                <Text style={styles.modalBtnText}>
                  {tareas.saving ? "Guardando..." : "Guardar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
