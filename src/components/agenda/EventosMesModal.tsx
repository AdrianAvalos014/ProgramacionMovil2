import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";

import { Evento } from "../../../types/agenda/agendaTypes";
import {  styles } from "../../styles/agenda/agendaStyles";

interface Props {
  visible: boolean;
  eventos: Evento[];
  onClose: () => void;
}

export const EventosMesModal = ({ visible, eventos, onClose }: Props) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Eventos registrados este mes</Text>

          <ScrollView style={{ maxHeight: 400 }}>
            {eventos.length === 0 ? (
              <Text style={styles.noEventText}>No hay eventos este mes.</Text>
            ) : (
              eventos.map((e) => (
                <View key={e.id} style={styles.monthEventItem}>
                  <Text style={styles.monthEventTitle}>{e.titulo}</Text>
                  <Text style={styles.monthEventDate}>
                    {e.fecha} — {e.hora}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity
            style={[styles.modalBtn, styles.btnRed]}
            onPress={onClose}
          >
            <Text style={styles.bigBtnText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};