import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

import { monthLabel, toISO } from "../../hooks/agenda/useAgenda";
import {  styles } from "../../styles/agenda/agendaStyles";

interface Props {
  calYear: number;
  calMonth0: number;
  calRows: (Date | null)[][];
  selectedDate: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: string) => void;
}

export const AgendaCalendar = ({
  calYear,
  calMonth0,
  calRows,
  selectedDate,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}: Props) => {
  return (
    <View style={styles.calendarCard}>
      <View style={styles.calHeader}>
        <TouchableOpacity onPress={onPrevMonth}>
          <FontAwesome5 name="chevron-left" />
        </TouchableOpacity>

        <Text style={styles.calTitle}>{monthLabel(calYear, calMonth0)}</Text>

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
            const isSelected = iso === selectedDate;

            return (
              <TouchableOpacity
                key={j}
                style={[styles.dayCell, isSelected && styles.daySelected]}
                onPress={() => cell && onSelectDate(iso)}
                disabled={!cell}
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

      <Text style={styles.selectedText}>
        Fecha seleccionada: {selectedDate}
      </Text>
    </View>
  );
};