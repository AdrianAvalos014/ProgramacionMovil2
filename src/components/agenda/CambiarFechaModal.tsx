import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

import { monthLabel, toISO, todayISO } from "../../hooks/agenda/useAgenda";
import {  styles } from "../../styles/agenda/agendaStyles";

interface Props {
  visible: boolean;
  newDate: string;
  calYear: number;
  calMonth0: number;
  calRows: (Date | null)[][];
  onClose: () => void;
  onConfirm: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: string) => void;
}

export const CambiarFechaModal = ({
  visible,
  newDate,
  calYear,
  calMonth0,
  calRows,
  onClose,
  onConfirm,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}: Props) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cambiar fecha del evento</Text>

            <View style={styles.calendarCardInsideModal}>
              <View style={styles.calHeader}>
                <TouchableOpacity onPress={onPrevMonth}>
                  <FontAwesome5 name="chevron-left" />
                </TouchableOpacity>

                <Text style={styles.calTitle}>
                  {monthLabel(calYear, calMonth0)}
                </Text>

                <TouchableOpacity onPress={onNextMonth}>
                  <FontAwesome5 name="chevron-right" />
                </TouchableOpacity>
              </View>

              <View style={styles.weekHeader}>
                {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
                  <Text key={d} style={styles.weekCell}>
                    {d}
                  </Text>
                ))}
              </View>

              {calRows.map((row, i) => (
                <View key={i} style={styles.weekRow}>
                  {row.map((cell, j) => {
                    const iso = cell ? toISO(cell) : "";
                    const isSelected = iso === newDate;
                    const disabled = !!cell && iso < todayISO();

                    return (
                      <TouchableOpacity
                        key={j}
                        style={[
                          styles.dayCell,
                          isSelected && styles.daySelected,
                          disabled && styles.dayDisabled,
                        ]}
                        onPress={() => cell && !disabled && onSelectDate(iso)}
                        disabled={!cell || disabled}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            isSelected && styles.dayTextSelected,
                          ]}
                        >
                          {cell ? cell.getDate() : ""}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}

              <Text style={styles.selectedText}>Nueva fecha: {newDate}</Text>
            </View>

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.btnGreen]}
                onPress={onConfirm}
              >
                <Text style={styles.bigBtnText}>Confirmar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.btnRed]}
                onPress={onClose}
              >
                <Text style={styles.bigBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};