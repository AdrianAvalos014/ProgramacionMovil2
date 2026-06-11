import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";

import { useTareas } from "../../hooks/tareas/useTareas";
import { styles } from "../../styles/tareas/tareasStyles";
import { ConnectionBadge } from "../../components/ConnectionBadge";

import { TareaCard } from "../../components/tareas/tareaCard";
import { TareasSummary } from "../../components/tareas/tareasSummary";
import { TareasSearch } from "../../components/tareas/tareasSearch";
import { TareasFilters } from "../../components/tareas/tareaFilters";
import { TareaModal } from "../../components/tareas/tareaFormModal";
import { CalendarModal } from "../../components/tareas/tareaCalendarModal";

const TareasScreen = () => {
  const tareas = useTareas();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="red" barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Gestión de Tareas</Text>
          <Text style={styles.headerSub}>¡Registra tus próximas tareas!</Text>
        </View>

        <FontAwesome5 name="tasks" size={28} color="white" />
      </View>

      <ConnectionBadge />

      {tareas.isSyncing && (
        <Text style={{ textAlign: "center", color: "#666" }}>
          Sincronizando cambios...
        </Text>
      )}

      {tareas.lastSyncError && (
        <Text style={{ textAlign: "center", color: "#991B1B" }}>
          No se pudo sincronizar. Se intentará después.
        </Text>
      )}

      <TareasSummary
        pendientes={tareas.totalPendientes}
        completadas={tareas.totalCompletadas}
      />

      <TareasSearch
        busqueda={tareas.busqueda}
        setBusqueda={tareas.setBusqueda}
      />

      <TareasFilters filtro={tareas.filtro} setFiltro={tareas.setFiltro} />

      <View style={styles.listWrap}>
        {tareas.tareasFiltradas.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5 name="clipboard-list" size={40} color="#cfcfcf" />
            <Text style={styles.emptyTitle}>Sin tareas aún</Text>
            <Text style={styles.emptySub}>Crea tu primera tarea con el botón +</Text>
          </View>
        ) : (
          <FlatList
            data={tareas.tareasFiltradas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TareaCard
                tarea={item}
                onToggle={tareas.toggleCompletada}
                onEdit={tareas.abrirModalEditar}
                onDelete={tareas.eliminar}
              />
            )}
            contentContainerStyle={{ paddingBottom: 110 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={tareas.abrirModalNueva}
      >
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>

      <TareaModal tareas={tareas} />

      <CalendarModal tareas={tareas} />
    </SafeAreaView>
  );
};

export default TareasScreen;