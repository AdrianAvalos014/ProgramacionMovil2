import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { FONT_SIZES } from "../../../types";
import { syncEvents } from "../../Events/syncEvents";

// 🔐 Auth (solo para obtener userId)
import { auth } from "../../services/firebase-config";

// 💾 SQLite
import { tareasRepository } from "../../database/repositories/tareasRepository";
import { useAutoSync } from "../../hooks/useAutoSync";
import { ConnectionBadge } from "../../components/ConnectionBadge";

// ─── Tipos ───────────────────────────────────────────
type Prioridad = "Baja" | "Media" | "Alta";
type Filtro = "Todas" | "Pendientes" | "Completadas";

interface Tarea {
  id: string;
  user_id: string;
  titulo: string;
  descripcion?: string;
  fechaLimite?: string;
  prioridad: Prioridad;
  completada: number; // 0 | 1  (SQLite no tiene boolean)
  sync_status: string;
  deleted: number;
  created_at: string;
  updated_at: string;
}

const PRIORIDADES: Prioridad[] = ["Baja", "Media", "Alta"];

/* ===================== FECHAS ===================== */
function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function toISO(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function fromISOtoDMY(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
function todayISO() {
  return toISO(new Date());
}
function monthMatrix(year: number, month0: number) {
  const first = new Date(year, month0, 1);
  const startDow = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month0, d));
  while (cells.length < 42) cells.push(null);
  const rows: (Date | null)[][] = [];
  for (let i = 0; i < 6; i++) rows.push(cells.slice(i * 7, i * 7 + 7));
  return rows;
}
function monthLabel(year: number, month0: number) {
  const MES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  return `${MES[month0]} ${year}`;
}

/* ===================== UI HELPERS ===================== */
const parseFechaLimite = (fecha: string): Date | null => {
  const parts = fecha.split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y) return null;
  const dt = new Date(y, m - 1, d, 9, 0, 0);
  return isNaN(dt.getTime()) ? null : dt;
};

const prioridadColor = (p: Prioridad) => {
  switch (p) {
    case "Alta":  return "#F44336";
    case "Media": return "#FF9800";
    default:      return "#4CAF50";
  }
};

const daysLeftLabel = (fechaLimite?: string) => {
  if (!fechaLimite) return null;
  const dt = parseFechaLimite(fechaLimite);
  if (!dt) return null;
  const today = new Date();
  const a = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const b = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const days = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { text: "Vencida",  color: "#B71C1C" };
  if (days === 0) return { text: "Hoy",    color: "#E53935" };
  if (days === 1) return { text: "Mañana", color: "#FB8C00" };
  return { text: `En ${days} días`, color: "#546E7A" };
};

/* ===================== COMPONENTE ===================== */
const TareasScreen: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(
    auth.currentUser?.uid ?? null,
  );

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUserId(u?.uid ?? null));
    return unsub;
  }, []);

  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [refreshing] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("Todas");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Tarea | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [prioridad, setPrioridad] = useState<Prioridad>("Media");
  const [saving, setSaving] = useState(false);

  const [calendarVisible, setCalendarVisible] = useState(false);
  const [tempDateISO, setTempDateISO] = useState<string>(todayISO());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth0, setCalMonth0] = useState(new Date().getMonth());
  const calRows = useMemo(
    () => monthMatrix(calYear, calMonth0),
    [calYear, calMonth0],
  );

  const { isOnline, isSyncing, lastSyncError } = useAutoSync(userId);

  // ─── 1. Cargar tareas desde SQLite ───────────────────
  const cargarTareas = React.useCallback(async () => {
    if (!userId) return;
    const data = await tareasRepository.getAll(userId);
    console.log("📦 Tareas recargadas:", data.length);
    setTareas(data as Tarea[]);
  }, [userId]);

  // ─── 2. Cargar al montar o cuando cambia userId ───────
  useEffect(() => {
    cargarTareas();
  }, [cargarTareas]);

  // ─── 3. Suscripción estable a syncEvents (patrón ref) ─
  // El ref guarda siempre la versión más reciente de cargarTareas
  // sin necesidad de re-suscribirse en cada render.
  const cargarTareasRef = useRef(cargarTareas);
  useEffect(() => {
    cargarTareasRef.current = cargarTareas;
  }, [cargarTareas]);

  useEffect(() => {
    const unsub = syncEvents.subscribe(() => {
      cargarTareasRef.current();
    });
    return () => unsub(); // un solo listener, se limpia al desmontar
  }, []); // ← sin dependencias: se suscribe UNA sola vez

  // ─── Filtros y búsqueda ───────────────────────────────
  const tareasFiltradas = useMemo(() => {
    return tareas.filter((t) => {
      const okFiltro =
        filtro === "Todas"
          ? true
          : filtro === "Pendientes"
            ? !t.completada
            : t.completada;
      const term = busqueda.trim().toLowerCase();
      const okSearch =
        !term ||
        t.titulo.toLowerCase().includes(term) ||
        (t.descripcion || "").toLowerCase().includes(term);
      return okFiltro && okSearch;
    });
  }, [tareas, filtro, busqueda]);

  const totalPendientes = useMemo(
    () => tareas.filter((t) => !t.completada).length,
    [tareas],
  );
  const totalCompletadas = useMemo(
    () => tareas.filter((t) => t.completada).length,
    [tareas],
  );

  // ─── Form helpers ─────────────────────────────────────
  const resetForm = () => {
    setTitulo("");
    setDescripcion("");
    setFechaLimite("");
    setPrioridad("Media");
    setEditingTask(null);
  };
  const abrirModalNueva = () => {
    resetForm();
    setModalVisible(true);
  };
  const abrirModalEditar = (t: Tarea) => {
    setEditingTask(t);
    setTitulo(t.titulo);
    setDescripcion(t.descripcion || "");
    setFechaLimite(t.fechaLimite || "");
    setPrioridad(t.prioridad);
    setModalVisible(true);
  };

  // ─── Calendario ──────────────────────────────────────
  const gotoPrevMonth = () => {
    const d = new Date(calYear, calMonth0, 1);
    d.setMonth(d.getMonth() - 1);
    setCalYear(d.getFullYear());
    setCalMonth0(d.getMonth());
  };
  const gotoNextMonth = () => {
    const d = new Date(calYear, calMonth0, 1);
    d.setMonth(d.getMonth() + 1);
    setCalYear(d.getFullYear());
    setCalMonth0(d.getMonth());
  };

  // ─── CRUD ─────────────────────────────────────────────
  const handleGuardar = async () => {
    if (saving || !userId) return;
    if (!titulo.trim()) {
      Alert.alert("Error", "La tarea debe tener un título.");
      return;
    }

    if (fechaLimite) {
      const dt = parseFechaLimite(fechaLimite);
      if (!dt) {
        Alert.alert("Fecha inválida", "Selecciona una fecha válida.");
        return;
      }
      const hoy = new Date();
      const a = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      const b = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
      if (b < a) {
        Alert.alert("Fecha inválida", "Solo puedes usar hoy o una fecha futura.");
        return;
      }
    }

    setSaving(true);
    try {
      if (editingTask) {
        await tareasRepository.update(editingTask.id, {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          fechaLimite: fechaLimite.trim(),
          prioridad,
        });
      } else {
        await tareasRepository.create(userId, {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          fechaLimite: fechaLimite.trim(),
          prioridad,
          completada: 0,
        });
      }
      await cargarTareas();
      setModalVisible(false);
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = (id: string) => {
    Alert.alert("Eliminar tarea", "¿Eliminar esta tarea?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          if (!userId) return;

          const tareasPrevias = tareas;

          try {
            setTareas((prev) => prev.filter((t) => t.id !== id));
            await tareasRepository.remove(id);

            console.log(
              isOnline
                ? "🌐 DELETE encolado y listo para sincronizar"
                : "📴 DELETE guardado offline en cola"
            );
          } catch (error) {
            console.log("❌ Error eliminando:", error);
            setTareas(tareasPrevias);
            Alert.alert("Error", "No se pudo eliminar la tarea.");
          }
        },
      },
    ]);
  };

  const handleToggleCompletada = async (tarea: Tarea) => {
    await tareasRepository.update(tarea.id, {
      completada: tarea.completada ? 0 : 1,
    });
    await cargarTareas();
  };

  // ─── Render item ──────────────────────────────────────
  const renderTarea = ({ item }: { item: Tarea }) => {
    const left = daysLeftLabel(item.fechaLimite);
    return (
      <View style={styles.taskCard}>
        <TouchableOpacity
          style={styles.checkWrap}
          onPress={() => handleToggleCompletada(item)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, item.completada === 1 && styles.checkboxChecked]}>
            {item.completada ? (
              <MaterialIcons name="check" size={16} color="white" />
            ) : null}
          </View>
        </TouchableOpacity>

        <View style={styles.taskInfo}>
          <View style={styles.taskTopRow}>
            <Text
              style={[styles.taskTitle, item.completada === 1 && styles.taskTitleCompleted]}
              numberOfLines={1}
            >
              {item.titulo}
            </Text>
            <View style={[styles.priorityBadge, { backgroundColor: prioridadColor(item.prioridad) }]}>
              <Text style={styles.priorityText}>{item.prioridad}</Text>
            </View>
          </View>

          {item.descripcion ? (
            <Text
              style={[styles.taskDesc, item.completada === 1 && styles.taskDescCompleted]}
              numberOfLines={2}
            >
              {item.descripcion}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            {item.fechaLimite ? (
              <View style={styles.metaItem}>
                <MaterialIcons name="event" size={14} color="#777" />
                <Text style={styles.metaText}> {item.fechaLimite}</Text>
              </View>
            ) : (
              <View style={styles.metaItem}>
                <MaterialIcons name="event-busy" size={14} color="#B0B0B0" />
                <Text style={[styles.metaText, { color: "#B0B0B0" }]}> Sin fecha</Text>
              </View>
            )}
            {left ? (
              <View style={[styles.leftBadge, { borderColor: left.color }]}>
                <Text style={[styles.leftText, { color: left.color }]}>{left.text}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.actionsCol}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => abrirModalEditar(item)}>
            <MaterialIcons name="edit" size={22} color="#FFB300" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => handleEliminar(item.id)}>
            <MaterialIcons name="delete" size={22} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ===================== JSX ===================== */
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

      {isSyncing && (
        <Text style={{ textAlign: "center", color: "#666" }}>
          Sincronizando cambios...
        </Text>
      )}

      {lastSyncError && (
        <Text style={{ textAlign: "center", color: "#991B1B" }}>
          No se pudo sincronizar. Se intentará después.
        </Text>
      )}

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Pendientes</Text>
          <Text style={styles.summaryValue}>{totalPendientes}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Completadas</Text>
          <Text style={styles.summaryValue}>{totalCompletadas}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={22} color="#777" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar tarea..."
          placeholderTextColor="#999"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length ? (
          <TouchableOpacity onPress={() => setBusqueda("")} style={styles.clearBtn}>
            <MaterialIcons name="close" size={18} color="#777" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filtersRow}>
        {(["Todas", "Pendientes", "Completadas"] as Filtro[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filtro === f && styles.filterChipActive]}
            onPress={() => setFiltro(f)}
            activeOpacity={0.85}
          >
            <Text style={[styles.filterText, filtro === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.listWrap}>
        {tareasFiltradas.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5 name="clipboard-list" size={40} color="#cfcfcf" />
            <Text style={styles.emptyTitle}>Sin tareas aún</Text>
            <Text style={styles.emptySub}>Crea tu primera tarea con el botón +</Text>
          </View>
        ) : (
          <FlatList
            data={tareasFiltradas}
            keyExtractor={(i) => i.id}
            renderItem={renderTarea}
            contentContainerStyle={{ paddingBottom: 110 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={abrirModalNueva}>
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* MODAL TAREA */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => { setModalVisible(false); resetForm(); }}
      >
        <View style={styles.modalBg}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>
                  {editingTask ? "Editar tarea" : "Nueva tarea"}
                </Text>

                <Text style={styles.label}>Título</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Entregar reporte"
                  placeholderTextColor="#999"
                  value={titulo}
                  onChangeText={setTitulo}
                />

                <Text style={styles.label}>Descripción (opcional)</Text>
                <TextInput
                  style={[styles.input, { height: 90, textAlignVertical: "top" }]}
                  placeholder="Detalles, pasos, etc."
                  placeholderTextColor="#999"
                  value={descripcion}
                  onChangeText={setDescripcion}
                  multiline
                />

                <Text style={styles.label}>Fecha límite</Text>
                <TouchableOpacity
                  style={styles.input}
                  activeOpacity={0.85}
                  onPress={() => {
                    const base = fechaLimite
                      ? fechaLimite.split("/").reverse().join("-")
                      : todayISO();
                    setTempDateISO(base);
                    setCalendarVisible(true);
                  }}
                >
                  <Text style={{ color: fechaLimite ? "#333" : "#999" }}>
                    {fechaLimite || "Seleccionar fecha"}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.label}>Prioridad</Text>
                <View style={styles.priorityRow}>
                  {PRIORIDADES.map((p) => {
                    const active = prioridad === p;
                    const c = prioridadColor(p);
                    return (
                      <TouchableOpacity
                        key={p}
                        style={[styles.priorityChip, active && { backgroundColor: c, borderColor: c }]}
                        onPress={() => setPrioridad(p)}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.priorityChipText, active && { color: "white" }]}>
                          {p}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.modalBtnsRow}>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: "#F44336" }]}
                    onPress={() => { setModalVisible(false); resetForm(); }}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.modalBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: saving ? "#9E9E9E" : "#4CAF50" }]}
                    onPress={handleGuardar}
                    disabled={saving}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.modalBtnText}>
                      {editingTask ? "Guardar cambios" : "Guardar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* MODAL CALENDARIO */}
      <Modal transparent visible={calendarVisible} animationType="slide">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Seleccionar fecha</Text>
              <View style={styles.calHeader}>
                <TouchableOpacity onPress={gotoPrevMonth}>
                  <FontAwesome5 name="chevron-left" />
                </TouchableOpacity>
                <Text style={styles.calTitle}>{monthLabel(calYear, calMonth0)}</Text>
                <TouchableOpacity onPress={gotoNextMonth}>
                  <FontAwesome5 name="chevron-right" />
                </TouchableOpacity>
              </View>
              <View style={styles.weekHeader}>
                {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
                  <Text key={d} style={styles.weekCell}>{d}</Text>
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
                          disabled && { opacity: 0.35 },
                        ]}
                        disabled={!cell || disabled}
                        onPress={() => setTempDateISO(iso)}
                      >
                        <Text style={styles.dayText}>{cell ? cell.getDate() : ""}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
              <View style={styles.modalBtnsRow}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#F44336" }]}
                  onPress={() => setCalendarVisible(false)}
                >
                  <Text style={styles.modalBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#4CAF50" }]}
                  onPress={() => {
                    setFechaLimite(fromISOtoDMY(tempDateISO));
                    setCalendarVisible(false);
                  }}
                >
                  <Text style={styles.modalBtnText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
};

export default TareasScreen;


/* ===================== ESTILOS ===================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "beige" },
  header: {
    backgroundColor: "red",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },
  headerTitle: { fontSize: FONT_SIZES.large, fontWeight: "bold", color: "white" },
  headerSub: { marginTop: 2, fontSize: FONT_SIZES.small, color: "#f5f5f5" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 14,
    elevation: 2,
    marginHorizontal: 4,
  },
  summaryLabel: { fontSize: FONT_SIZES.small, color: "#777" },
  summaryValue: { marginTop: 4, fontSize: FONT_SIZES.large, fontWeight: "bold", color: "red" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "white",
    elevation: 2,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: FONT_SIZES.medium, color: "#333" },
  clearBtn: { padding: 6, borderRadius: 14 },
  filtersRow: { flexDirection: "row", marginHorizontal: 16, marginTop: 10 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    backgroundColor: "white",
  },
  filterChipActive: { backgroundColor: "red", borderColor: "red" },
  filterText: { fontSize: FONT_SIZES.small, color: "#555" },
  filterTextActive: { color: "white", fontWeight: "bold" },
  listWrap: { flex: 1, marginHorizontal: 16, marginTop: 8 },
  taskCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  checkWrap: { paddingRight: 10, justifyContent: "center" },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "red",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "red" },
  taskInfo: { flex: 1 },
  taskTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  taskTitle: { flex: 1, fontSize: FONT_SIZES.medium, fontWeight: "700", color: "#333" },
  taskTitleCompleted: { textDecorationLine: "line-through", color: "#9E9E9E" },
  taskDesc: { marginTop: 4, fontSize: FONT_SIZES.small, color: "#666" },
  taskDescCompleted: { textDecorationLine: "line-through", color: "#B0B0B0" },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    justifyContent: "space-between",
  },
  metaItem: { flexDirection: "row", alignItems: "center" },
  metaText: { fontSize: FONT_SIZES.small, color: "#777" },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  priorityText: { fontSize: FONT_SIZES.small, color: "white", fontWeight: "bold" },
  leftBadge: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  leftText: { fontSize: FONT_SIZES.small, fontWeight: "700" },
  actionsCol: { justifyContent: "center", alignItems: "flex-end", marginLeft: 8 },
  iconBtn: { padding: 6 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  emptyTitle: { marginTop: 10, fontSize: FONT_SIZES.medium, fontWeight: "700", color: "#555" },
  emptySub: { marginTop: 4, fontSize: FONT_SIZES.small, color: "#888", textAlign: "center" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", padding: 18 },
  modalScroll: { flexGrow: 1, justifyContent: "center" },
  modalCard: { backgroundColor: "white", borderRadius: 14, padding: 18, elevation: 6 },
  modalTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#111",
  },
  label: { fontSize: FONT_SIZES.small, marginBottom: 6, fontWeight: "bold", color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#DADADA",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: FONT_SIZES.medium,
    backgroundColor: "white",
  },
  priorityRow: { flexDirection: "row", marginBottom: 8 },
  priorityChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    backgroundColor: "white",
  },
  priorityChipText: { fontSize: FONT_SIZES.small, color: "#555", fontWeight: "700" },
  modalBtnsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 4,
  },
  modalBtnText: { color: "white", fontSize: FONT_SIZES.medium, fontWeight: "bold" },
  calHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  calTitle: { fontWeight: "800", fontSize: FONT_SIZES.medium },
  weekHeader: { flexDirection: "row" },
  weekCell: { flex: 1, textAlign: "center", fontWeight: "700", color: "#666" },
  weekRow: { flexDirection: "row" },
  dayCell: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EEE",
    margin: 1,
    borderRadius: 6,
  },
  daySelected: { backgroundColor: "#FFE3D7", borderColor: "#FFBCA8" },
  dayText: { fontWeight: "700" },
});
