import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { AmPm, ModoAgenda } from "../../../types/agenda/agendaTypes";
import { styles } from "../../styles/agenda/agendaStyles";

interface Props {
  visible: boolean;
  modo: ModoAgenda;
  titulo: string;
  descripcion: string;
  hourPart: string;
  minutePart: string;
  amPm: AmPm;
  selectedDate: string;
  onChangeTitulo: (value: string) => void;
  onChangeDescripcion: (value: string) => void;
  onChangeHour: (value: string) => void;
  onChangeMinute: (value: string) => void;
  onChangeAmPm: (value: AmPm) => void;
  onSave: () => void;
  onClose: () => void;
}

export const EventoFormModal = ({
  visible,
  modo,
  titulo,
  descripcion,
  hourPart,
  minutePart,
  amPm,
  selectedDate,
  onChangeTitulo,
  onChangeDescripcion,
  onChangeHour,
  onChangeMinute,
  onChangeAmPm,
  onSave,
  onClose,
}: Props) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.eventModalBackdrop}>
        <KeyboardAvoidingView
          style={styles.eventKeyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.eventFormCard}>
            <View style={styles.eventFormHandle} />

            <View style={styles.eventFormHeader}>
              <View style={styles.eventHeaderIcon}>
                <MaterialIcons name="event-note" size={26} color="#D32F2F" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.eventFormTitle}>
                  {modo === "registrar" ? "Nuevo evento" : "Editar evento"}
                </Text>
                <Text style={styles.eventFormSubtitle}>
                  Organiza tu agenda y registra los detalles
                </Text>
              </View>

              <TouchableOpacity style={styles.eventCloseBtn} onPress={onClose}>
                <MaterialIcons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.eventFormContent}
            >
              <View style={styles.eventInfoBox}>
                <MaterialIcons name="today" size={20} color="#D32F2F" />
                <Text style={styles.eventInfoText}>
                  Se guardará para el día{" "}
                  <Text style={styles.eventInfoDate}>{selectedDate}</Text>
                </Text>
              </View>

              <View style={styles.eventSection}>
                <Text style={styles.eventSectionTitle}>Datos del evento</Text>

                <Text style={styles.eventLabel}>Título</Text>
                <View style={styles.eventInputBox}>
                  <MaterialIcons name="title" size={20} color="#999" />
                  <TextInput
                    style={styles.eventInput}
                    placeholder="Ej. Reunión semanal"
                    placeholderTextColor="#AAA"
                    value={titulo}
                    onChangeText={onChangeTitulo}
                  />
                </View>

                <Text style={styles.eventLabel}>Descripción</Text>
                <View style={[styles.eventInputBox, styles.eventTextAreaBox]}>
                  <MaterialIcons name="notes" size={20} color="#999" />
                  <TextInput
                    style={[styles.eventInput, styles.eventTextArea]}
                    placeholder="Notas adicionales..."
                    placeholderTextColor="#AAA"
                    value={descripcion}
                    onChangeText={onChangeDescripcion}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </View>

              <View style={styles.eventSection}>
                <Text style={styles.eventSectionTitle}>Hora del evento</Text>

                <View style={styles.eventTimeRow}>
                  <View style={styles.eventTimeInputGroup}>
                    <Text style={styles.eventSmallLabel}>Hora</Text>
                    <TextInput
                      style={styles.eventTimeInput}
                      placeholder="HH"
                      placeholderTextColor="#AAA"
                      keyboardType="numeric"
                      maxLength={2}
                      value={hourPart}
                      onChangeText={onChangeHour}
                    />
                  </View>

                  <Text style={styles.eventTimeSeparator}>:</Text>

                  <View style={styles.eventTimeInputGroup}>
                    <Text style={styles.eventSmallLabel}>Min</Text>
                    <TextInput
                      style={styles.eventTimeInput}
                      placeholder="MM"
                      placeholderTextColor="#AAA"
                      keyboardType="numeric"
                      maxLength={2}
                      value={minutePart}
                      onChangeText={onChangeMinute}
                    />
                  </View>

                  <View style={styles.eventAmPmGroup}>
                    {(["AM", "PM"] as const).map((v) => {
                      const active = amPm === v;

                      return (
                        <TouchableOpacity
                          key={v}
                          style={[
                            styles.eventAmPmBtn,
                            active && styles.eventAmPmBtnActive,
                          ]}
                          onPress={() => onChangeAmPm(v)}
                          activeOpacity={0.85}
                        >
                          <Text
                            style={[
                              styles.eventAmPmText,
                              active && styles.eventAmPmTextActive,
                            ]}
                          >
                            {v}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.eventFormFooter}>
              <TouchableOpacity
                style={styles.eventCancelButton}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.eventCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.eventSaveButton}
                onPress={onSave}
                activeOpacity={0.85}
              >
                <MaterialIcons name="check-circle" size={20} color="#FFF" />
                <Text style={styles.eventSaveText}>
                  {modo === "registrar" ? "Guardar" : "Actualizar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};