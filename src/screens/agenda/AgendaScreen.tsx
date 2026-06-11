import React from "react";
import { SafeAreaView, StatusBar, FlatList, Text, TouchableOpacity } from "react-native";

import { ConnectionBadge } from "../../components/ConnectionBadge";
import {  styles } from "../../styles/agenda/agendaStyles";
import { useAgenda } from "../../hooks/agenda/useAgenda";

import { NextEventCard } from "../../components/agenda/NextEventCard";
import { AgendaCalendar } from "../../components/agenda/AgendaCalendar";
import { EventoCard } from "../../components/agenda/EventoCard";
import { EventoFormModal } from "../../components/agenda/EventoFormModal";
import { CambiarFechaModal } from "../../components/agenda/CambiarFechaModal";
import { EventosMesModal } from "../../components/agenda/EventosMesModal";

const AgendaScreen = () => {
  const agenda = useAgenda();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#D32F2F" barStyle="light-content" />
      <ConnectionBadge />
      {agenda.isSyncing && (
        <Text style={styles.syncText}>Sincronizando cambios...</Text>
      )}
      {agenda.lastSyncError && (
        <Text style={styles.syncError}>
          No se pudo sincronizar. Se intentará después.
        </Text>
      )}
      <FlatList
        ListHeaderComponent={
          <>
            <NextEventCard proximo={agenda.proximo} />
            <AgendaCalendar
              calYear={agenda.calYear}
              calMonth0={agenda.calMonth0}
              calRows={agenda.calRows}
              selectedDate={agenda.selectedDate}
              onPrevMonth={agenda.gotoPrevMonth}
              onNextMonth={agenda.gotoNextMonth}
              onSelectDate={agenda.setSelectedDate}
            />
            <TouchableOpacity
              style={[styles.bigBtn, styles.btnGreen]}
              onPress={agenda.abrirRegistrar}
            >
              <Text style={styles.bigBtnText}>Registrar Evento</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bigBtn, styles.btnBlueDark]}
              onPress={() => agenda.setModalMesVisible(true)}
            >
              <Text style={styles.bigBtnText}>Eventos registrados este mes</Text>
            </TouchableOpacity>
            <Text style={styles.orText}>— o —</Text>
            <Text style={styles.sectionTitle}>
              Eventos del {agenda.selectedDate}
            </Text>
          </>
        }
        data={agenda.eventosDelDia}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventoCard
            evento={item}
            onEdit={agenda.abrirEditar}
            onChangeDate={agenda.abrirCambiarFecha}
            onDelete={agenda.eliminar}
            onAttendance={agenda.marcarAsistencia}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.noEventText}>No hay eventos para este día.</Text>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <EventoFormModal
        visible={agenda.modalVisible}
        modo={agenda.modo}
        titulo={agenda.titulo}
        descripcion={agenda.descripcion}
        hourPart={agenda.hourPart}
        minutePart={agenda.minutePart}
        amPm={agenda.amPm}
        selectedDate={agenda.selectedDate}
        onChangeTitulo={agenda.setTitulo}
        onChangeDescripcion={agenda.setDescripcion}
        onChangeHour={agenda.onChangeHour}
        onChangeMinute={agenda.onChangeMinute}
        onChangeAmPm={agenda.setAmPm}
        onSave={agenda.guardar}
        onClose={agenda.cerrarModal}
      />

      <CambiarFechaModal
        visible={agenda.changeDateVisible}
        newDate={agenda.newDate}
        calYear={agenda.changeCalYear}
        calMonth0={agenda.changeCalMonth0}
        calRows={agenda.changeCalRows}
        onClose={() => agenda.setChangeDateVisible(false)}
        onConfirm={agenda.confirmarCambioFecha}
        onPrevMonth={agenda.gotoPrevMonthChange}
        onNextMonth={agenda.gotoNextMonthChange}
        onSelectDate={agenda.setNewDate}
      />

      <EventosMesModal
        visible={agenda.modalMesVisible}
        eventos={agenda.eventosDelMesActual}
        onClose={() => agenda.setModalMesVisible(false)}
      />
    </SafeAreaView>
  );
};

export default AgendaScreen;