import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { styles } from "../../styles/tareas/tareasStyles";
import { monthLabel, toISO } from "../../hooks/tareas/useTareas";

interface Props {
  tareas: any;
}

export const CalendarModal = ({ tareas }: Props) => {
  const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

  return (
    <Modal
      visible={tareas.calendarVisible}
      transparent
      animationType="fade"
      onRequestClose={() => tareas.setCalendarVisible(false)}
    >
      <View style={styles.modalBg}>
        <View style={styles.modalCard}>
          <View style={styles.calHeader}>
            <TouchableOpacity onPress={tareas.gotoPrevMonth}>
              <MaterialIcons name="chevron-left" size={30} color="#333" />
            </TouchableOpacity>

            <Text style={styles.calTitle}>
              {monthLabel(tareas.calYear, tareas.calMonth0)}
            </Text>

            <TouchableOpacity onPress={tareas.gotoNextMonth}>
              <MaterialIcons name="chevron-right" size={30} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekHeader}>
            {weekDays.map((d) => (
              <Text key={d} style={styles.weekCell}>
                {d}
              </Text>
            ))}
          </View>

          {tareas.calRows.map((row: any[], i: number) => (
            <View key={i} style={styles.weekRow}>
              {row.map((date, j) => {
                if (!date) {
                  return <View key={j} style={styles.dayCell} />;
                }

                const iso = toISO(date);
                const selected = iso === tareas.tempDateISO;

                return (
                  <TouchableOpacity
                    key={j}
                    style={[
                      styles.dayCell,
                      selected && styles.daySelected,
                    ]}
                    onPress={() => tareas.setTempDateISO(iso)}
                  >
                    <Text style={styles.dayText}>{date.getDate()}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          <View style={styles.modalBtnsRow}>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: "#999" }]}
              onPress={() => tareas.setCalendarVisible(false)}
            >
              <Text style={styles.modalBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: "red" }]}
              onPress={tareas.confirmarFecha}
            >
              <Text style={styles.modalBtnText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};