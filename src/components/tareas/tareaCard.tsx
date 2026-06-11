import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";

import { Tarea } from "../../../types/tareas/tareasTypes";
import { styles } from "../../styles/tareas/tareasStyles";
import { daysLeftLabel, prioridadColor } from "../../hooks/tareas/useTareas";

interface Props {
  tarea: Tarea;
  onToggle: (tarea: Tarea) => void;
  onEdit: (tarea: Tarea) => void;
  onDelete: (id: string) => void;
}

export const TareaCard = ({ tarea, onToggle, onEdit, onDelete }: Props) => {
  const left = daysLeftLabel(tarea.fechaLimite);
  const completed = Boolean(tarea.completada);

  return (
    <View style={styles.taskCard}>
      <TouchableOpacity
        style={styles.checkWrap}
        onPress={() => onToggle(tarea)}
      >
        <View style={[styles.checkbox, completed && styles.checkboxChecked]}>
          {completed && <FontAwesome5 name="check" size={12} color="white" />}
        </View>
      </TouchableOpacity>

      <View style={styles.taskInfo}>
        <View style={styles.taskTopRow}>
          <Text
            style={[styles.taskTitle, completed && styles.taskTitleCompleted]}
          >
            {tarea.titulo}
          </Text>

          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: prioridadColor(tarea.prioridad) },
            ]}
          >
            <Text style={styles.priorityText}>{tarea.prioridad}</Text>
          </View>
        </View>

        {!!tarea.descripcion && (
          <Text
            style={[styles.taskDesc, completed && styles.taskDescCompleted]}
          >
            {tarea.descripcion}
          </Text>
        )}

        <View style={styles.metaRow}>
          {!!tarea.fechaLimite && (
            <View style={styles.metaItem}>
              <FontAwesome5 name="calendar-alt" size={13} color="#777" />
              <Text style={[styles.metaText, { marginLeft: 6 }]}>
                {tarea.fechaLimite}
              </Text>
            </View>
          )}

          {left && (
            <View style={[styles.leftBadge, { borderColor: left.color }]}>
              <Text style={[styles.leftText, { color: left.color }]}>
                {left.text}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actionsCol}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onEdit(tarea)}>
          <MaterialIcons name="edit" size={22} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => onDelete(tarea.id)}
        >
          <MaterialIcons name="delete" size={22} color="#E53935" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
