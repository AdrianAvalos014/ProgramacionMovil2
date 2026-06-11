import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

import { MESES, toISO, todayISO } from "../../hooks/compras/useCompras";
import { comprasStyles as styles } from "../../styles/compras/comprasStyles";

interface Props {
  visible: boolean;

  calYear: number;
  calMonth0: number;
  calRows: (Date | null)[][];

  tempDateISO: string;

  onClose: () => void;
  onChangeMonth: (value: number) => void;
  onSelectDate: (iso: string) => void;
  onConfirm: () => void;
}

export const CalendarioModal = ({
  visible,
  calYear,
  calMonth0,
  calRows,
  tempDateISO,
  onClose,
  onChangeMonth,
  onSelectDate,
  onConfirm,
}: Props) => {
  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.modalBackground}>
        <View style={styles.calendarCard}>
          <View style={styles.calHeader}>
            <TouchableOpacity onPress={() => onChangeMonth(-1)}>
              <FontAwesome5 name="chevron-left" />
            </TouchableOpacity>

            <Text style={styles.calTitle}>
              {MESES[calMonth0]} {calYear}
            </Text>

            <TouchableOpacity onPress={() => onChangeMonth(1)}>
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
                const disabled = !!cell && iso < todayISO();

                return (
                  <TouchableOpacity
                    key={j}
                    style={[
                      styles.dayCell,
                      iso === tempDateISO && styles.daySelected,
                      disabled && styles.dayDisabled,
                    ]}
                    disabled={!cell || disabled}
                    onPress={() => onSelectDate(iso)}
                  >
                    <Text>{cell ? cell.getDate() : ""}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          <View style={styles.modalButtonsRow}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={onConfirm}
            >
              <Text style={styles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};