import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

import { Evento } from "../../../types/agenda/agendaTypes";
import {  styles } from "../../styles/agenda/agendaStyles";

interface Props {
  evento: Evento;
  onEdit: (evento: Evento) => void;
  onChangeDate: (evento: Evento) => void;
  onDelete: (evento: Evento) => void;
  onAttendance: (evento: Evento, estado: "asistio" | "no_asistio") => void;
}

export const EventoCard = ({
  evento,
  onEdit,
  onChangeDate,
  onDelete,
  onAttendance,
}: Props) => {
  return (
    <View style={styles.itemRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{evento.titulo}</Text>

        <Text style={styles.itemDetail}>
          {evento.fecha} — {evento.hora}
        </Text>

        {evento.descripcion ? (
          <Text style={styles.itemComments}>
            Descripción: {evento.descripcion}
          </Text>
        ) : null}

        <View style={styles.attendanceRow}>
          <TouchableOpacity
            onPress={() => onAttendance(evento, "asistio")}
            style={[
              styles.smallBtn,
              evento.asistencia === "asistio"
                ? styles.btnGreen
                : styles.btnGreenLight,
            ]}
          >
            <FontAwesome5 name="check" color="#fff" size={14} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onAttendance(evento, "no_asistio")}
            style={[
              styles.smallBtn,
              evento.asistencia === "no_asistio"
                ? styles.btnRed
                : styles.btnRedLight,
            ]}
          >
            <FontAwesome5 name="times" color="#fff" size={14} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity
          onPress={() => onEdit(evento)}
          style={[styles.smallBtn, styles.btnBlue]}
        >
          <Text style={styles.smallBtnText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onChangeDate(evento)}
          style={[styles.smallBtn, styles.btnOrange]}
        >
          <Text style={styles.smallBtnText}>Cambiar fecha</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onDelete(evento)}
          style={[styles.smallBtn, styles.btnRed]}
        >
          <Text style={styles.smallBtnText}>Borrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};