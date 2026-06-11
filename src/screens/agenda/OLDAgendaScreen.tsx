import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  FlatList,
  ScrollView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

// Conexioncon firebase para obtener el UID del usuario, solamente se usa para eso 
import { auth } from "../../services/firebase-config";

// Conexion al repositorio de agenda de SQLite
import { agendaRepository } from "../../database/repositories/agendaRepository";

// Conexion con la cola de sincronizacion, el syncEvents para regitrar eventos (CRUD) y decirle a la pantalla que vuelva a cargar
// El ConnectionBadge para ver si tenemos internet o no
// El useAutoSync para una vez teniendo internet lo mande a fastapi + render. 
import { syncEvents } from "../../Events/syncEvents";
import { useAutoSync } from "../../hooks/useAutoSync";
import { ConnectionBadge } from "../../components/ConnectionBadge";

/* =======================
   Tipos
   ======================= */
interface Evento {
  id: string;
  user_id: string;
  titulo: string;
  fecha: string;
  hora: string;
  descripcion?: string;
  asistencia?: "asistio" | "no_asistio" | null;
  sync_status: string;
  deleted: number;
  created_at: string;
  updated_at: string;
}

/* =======================
   Utilidades de fecha
   ======================= */
function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function toISO(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function todayISO() { return toISO(new Date()); }
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
  const MES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  return `${MES[month0]} ${year}`;
}
function horaToMinutes(hora: string) {
  const m = hora.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = m[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

/* =======================
   Componente
   ======================= */
const AgendaScreen: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(auth.currentUser?.uid ?? null);

  const [eventos, setEventos]                 = useState<Evento[]>([]);
  const [modalVisible, setModalVisible]       = useState(false);
  const [modo, setModo]                       = useState<"registrar" | "editar">("registrar");
  const [titulo, setTitulo]                   = useState("");
  const [descripcion, setDescripcion]         = useState("");
  const [editId, setEditId]                   = useState<string | null>(null);
  const [originalDate, setOriginalDate]       = useState<string | null>(null);
  const [hourPart, setHourPart]               = useState("");
  const [minutePart, setMinutePart]           = useState("");
  const [amPm, setAmPm]                       = useState<"AM" | "PM">("AM");
  const [modalMesVisible, setModalMesVisible] = useState(false);
  const [selectedDate, setSelectedDate]       = useState<string>(todayISO());
  const [calYear, setCalYear]                 = useState(new Date().getFullYear());
  const [calMonth0, setCalMonth0]             = useState(new Date().getMonth());
  const [changeDateVisible, setChangeDateVisible] = useState(false);
  const [changeDateId, setChangeDateId]           = useState<string | null>(null);
  const [newDate, setNewDate]                     = useState<string>(todayISO());
  const [changeCalYear, setChangeCalYear]         = useState(new Date().getFullYear());
  const [changeCalMonth0, setChangeCalMonth0]     = useState(new Date().getMonth());

  const calRows       = useMemo(() => monthMatrix(calYear, calMonth0), [calYear, calMonth0]);
  const changeCalRows = useMemo(() => monthMatrix(changeCalYear, changeCalMonth0), [changeCalYear, changeCalMonth0]);

  // 🔄 Detecta conexión y sincroniza automáticamente al volver internet
  const { isOnline, isSyncing, lastSyncError } = useAutoSync(userId);

  const proximo = useMemo(() => {
    const hoy = todayISO();
    return [...eventos]
      .sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
      .find((e) => e.fecha >= hoy);
  }, [eventos]);

  // ─── Auth ─────────────────────────────────────────────
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUserId(u?.uid ?? null));
    return unsub;
  }, []);

  // ─── 1. Cargar eventos desde SQLite ───────────────────
  const cargarEventos = useCallback(async () => {
    if (!userId) return;
    const data = await agendaRepository.getAll(userId);
    console.log("📦 Eventos recargados:", data.length);
    setEventos(data as Evento[]);
  }, [userId]);

  // ─── 2. Cargar al montar o cuando cambia userId ───────
  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  // ─── 3. Escuchar syncEvents para recargar cuando la
  //        nube baja datos nuevos (useAutoSync → downloadFromCloud
  //        → syncEvents.emit → aquí se recarga la UI)
  const cargarEventosRef = useRef(cargarEventos);
  useEffect(() => {
    cargarEventosRef.current = cargarEventos;
  }, [cargarEventos]);

  useEffect(() => {
    const unsub = syncEvents.subscribe(() => {
      cargarEventosRef.current();
    });
    return () => unsub(); // limpia al desmontar
  }, []); // sin dependencias: se suscribe una sola vez

  // ─── Helpers hora ─────────────────────────────────────
  function onChangeHour(raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return setHourPart("");
    let n = parseInt(digits, 10);
    if (n < 1) n = 1;
    if (n > 12) n = 12;
    setHourPart(String(n));
  }
  function onChangeMinute(raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return setMinutePart("");
    let n = parseInt(digits, 10);
    if (n < 0) n = 0;
    if (n > 59) n = 59;
    setMinutePart(pad(n));
  }

  // ─── Modales ──────────────────────────────────────────
  function abrirEditar(e: Evento) {
    setModo("editar");
    setTitulo(e.titulo);
    setDescripcion(e.descripcion || "");
    setEditId(e.id);
    setOriginalDate(e.fecha);
    setSelectedDate(e.fecha);
    const [y, m] = e.fecha.split("-").map(Number);
    setCalYear(y); setCalMonth0(m - 1);
    const mHora = e.hora.match(/^\s*([0-9]{1,2})\s*:\s*([0-9]{1,2})\s*([AaPp][Mm])\s*$/);
    if (mHora) {
      setHourPart(mHora[1]);
      setMinutePart(pad(parseInt(mHora[2], 10)));
      setAmPm(mHora[3].toUpperCase() === "PM" ? "PM" : "AM");
    }
    setModalVisible(true);
  }

  function abrirRegistrar() {
    setModo("registrar");
    setTitulo(""); setDescripcion("");
    setHourPart(""); setMinutePart(""); setAmPm("AM");
    setEditId(null); setOriginalDate(null);
    setModalVisible(true);
  }

  function abrirCambiarFecha(e: Evento) {
    setChangeDateId(e.id);
    setNewDate(e.fecha);
    const [y, m] = e.fecha.split("-").map(Number);
    if (y && m) { setChangeCalYear(y); setChangeCalMonth0(m - 1); }
    else { setChangeCalYear(new Date().getFullYear()); setChangeCalMonth0(new Date().getMonth()); }
    setChangeDateVisible(true);
  }

  // ─── Navegación meses ─────────────────────────────────
  function gotoPrevMonth() {
    const d = new Date(calYear, calMonth0, 1); d.setMonth(d.getMonth() - 1);
    setCalYear(d.getFullYear()); setCalMonth0(d.getMonth());
  }
  function gotoNextMonth() {
    const d = new Date(calYear, calMonth0, 1); d.setMonth(d.getMonth() + 1);
    setCalYear(d.getFullYear()); setCalMonth0(d.getMonth());
  }
  function gotoPrevMonthChange() {
    const d = new Date(changeCalYear, changeCalMonth0, 1); d.setMonth(d.getMonth() - 1);
    setChangeCalYear(d.getFullYear()); setChangeCalMonth0(d.getMonth());
  }
  function gotoNextMonthChange() {
    const d = new Date(changeCalYear, changeCalMonth0, 1); d.setMonth(d.getMonth() + 1);
    setChangeCalYear(d.getFullYear()); setChangeCalMonth0(d.getMonth());
  }

  // ─── CRUD ─────────────────────────────────────────────
  async function confirmarCambioFecha() {
    const hoy = todayISO();
    if (newDate < hoy) {
      Alert.alert("Fecha inválida", "La nueva fecha debe ser hoy o posterior.");
      return;
    }
    if (!changeDateId) return;
    await agendaRepository.update(changeDateId, { fecha: newDate });
    await cargarEventos();
    Alert.alert("Evento", "Fecha actualizada correctamente.");
    setChangeDateVisible(false);
  }

  async function guardar() {
    if (!titulo.trim() || !hourPart || !minutePart || !descripcion.trim()) {
      Alert.alert("Faltan datos", "Todos los campos son obligatorios.");
      return;
    }
    const hoy = todayISO();
    if (modo === "registrar" && selectedDate < hoy) {
      Alert.alert("Fecha inválida", "No puedes registrar eventos en fechas pasadas.");
      return;
    }
    if (modo === "editar" && originalDate && selectedDate < originalDate) {
      Alert.alert("Fecha inválida", "No puedes mover el evento a una fecha anterior.");
      return;
    }

    const nuevaHoraMin = horaToMinutes(`${parseInt(hourPart, 10)}:${minutePart} ${amPm}`);
    const conflicto = eventos.some(
      (e) =>
        e.fecha === selectedDate &&
        e.id !== editId &&
        Math.abs(horaToMinutes(e.hora) - nuevaHoraMin) < 120
    );
    if (conflicto) {
      Alert.alert("Conflicto de horario", "Debe haber al menos 2 horas de diferencia entre eventos del mismo día.");
      return;
    }

    const horaFinal = `${parseInt(hourPart, 10)}:${minutePart} ${amPm}`;

    try {
      if (modo === "registrar" && userId) {
        await agendaRepository.create(userId, {
          titulo:      titulo.trim(),
          fecha:       selectedDate,
          hora:        horaFinal,
          descripcion: descripcion.trim(),
          asistencia:  "",
        });
        Alert.alert("Eventos", "Evento registrado.");
      } else if (modo === "editar" && editId) {
        await agendaRepository.update(editId, {
          titulo:      titulo.trim(),
          fecha:       selectedDate,
          hora:        horaFinal,
          descripcion: descripcion.trim(),
        });
        Alert.alert("Eventos", "Evento actualizado.");
      }
      await cargarEventos();
    } finally {
      setModalVisible(false);
    }
  }

  async function eliminar(e: Evento) {
    Alert.alert("Confirmar", `¿Eliminar "${e.titulo}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive",
        onPress: async () => {
          // baseRepository hace el soft-delete y encola en sync_queue.
          // useAutoSync se encarga de enviar la cola cuando haya internet.
          await agendaRepository.remove(e.id);
          await cargarEventos();
        },
      },
    ]);
  }

  async function marcarAsistencia(e: Evento, estado: "asistio" | "no_asistio") {
    await agendaRepository.update(e.id, { asistencia: estado });
    await cargarEventos();
  }

  // ─── Computed ─────────────────────────────────────────
  const eventosDelDia = eventos.filter((ev) => ev.fecha === selectedDate);
  function eventosDelMesActual() {
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = hoy.getMonth() + 1;
    return eventos.filter((e) => {
      const [yy, mm] = e.fecha.split("-").map(Number);
      return yy === y && mm === m;
    });
  }

  /* =======================
     JSX
     ======================= */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#D32F2F" barStyle="light-content" />

      {/* 🔌 Estado de conexión e indicadores de sync */}
      <ConnectionBadge />
      {isSyncing && (
        <Text style={styles.syncText}>Sincronizando cambios...</Text>
      )}
      {lastSyncError && (
        <Text style={styles.syncError}>No se pudo sincronizar. Se intentará después.</Text>
      )}

      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.nextEventCard}>
              <Text style={styles.nextEventTitle}>Tu próximo evento es el:</Text>
              {proximo ? (
                <>
                  <Text style={styles.eventName}>{proximo.titulo}</Text>
                  <Text style={styles.eventDate}>{proximo.fecha} a las {proximo.hora}</Text>
                </>
              ) : (
                <Text style={styles.noEventText}>Aún no tienes eventos.</Text>
              )}
            </View>

            <View style={styles.calendarCard}>
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
                {["L","M","X","J","V","S","D"].map((d) => (
                  <Text key={d} style={styles.weekCell}>{d}</Text>
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
                        onPress={() => cell && setSelectedDate(iso)}
                        disabled={!cell}
                      >
                        <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                          {cell ? cell.getDate() : ""}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
              <Text style={styles.selectedText}>Fecha seleccionada: {selectedDate}</Text>
            </View>

            <TouchableOpacity style={[styles.bigBtn, styles.btnGreen]} onPress={abrirRegistrar}>
              <Text style={styles.bigBtnText}>Registrar Evento</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bigBtn, { backgroundColor: "#1b289aff" }]}
              onPress={() => setModalMesVisible(true)}
            >
              <Text style={styles.bigBtnText}>Eventos registrados este mes</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>— o —</Text>
            <Text style={styles.sectionTitle}>Eventos del {selectedDate}</Text>
          </>
        }
        data={eventosDelDia}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.titulo}</Text>
              <Text style={styles.itemDetail}>{item.fecha} — {item.hora}</Text>
              {item.descripcion ? (
                <Text style={styles.itemComments}>Descripcion: {item.descripcion}</Text>
              ) : null}
              <View style={{ flexDirection: "row", marginTop: 6, gap: 6 }}>
                <TouchableOpacity
                  onPress={() => marcarAsistencia(item, "asistio")}
                  style={[styles.smallBtn, { backgroundColor: item.asistencia === "asistio" ? "#4CAF50" : "#A5D6A7" }]}
                >
                  <FontAwesome5 name="check" color="#fff" size={14} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => marcarAsistencia(item, "no_asistio")}
                  style={[styles.smallBtn, { backgroundColor: item.asistencia === "no_asistio" ? "#D32F2F" : "#EF9A9A" }]}
                >
                  <FontAwesome5 name="times" color="#fff" size={14} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity onPress={() => abrirEditar(item)} style={[styles.smallBtn, styles.btnBlue]}>
                <Text style={styles.smallBtnText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => abrirCambiarFecha(item)} style={[styles.smallBtn, { backgroundColor: "#FF9800" }]}>
                <Text style={styles.smallBtnText}>Cambiar fecha</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => eliminar(item)} style={[styles.smallBtn, styles.btnRed]}>
                <Text style={styles.smallBtnText}>Borrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noEventText}>No hay eventos para este día.</Text>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* Modal Registrar / Editar */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {modo === "registrar" ? "Registrar evento" : "Editar evento"}
              </Text>

              <Text style={styles.label}>Título</Text>
              <TextInput style={styles.input} placeholder="Ej: Reunión semanal" value={titulo} onChangeText={setTitulo} />

              <Text style={styles.label}>Hora</Text>
              <View style={styles.timeRow}>
                <TextInput
                  style={[styles.input, styles.timeInput]} placeholder="HH"
                  keyboardType="numeric" maxLength={2} value={hourPart} onChangeText={onChangeHour}
                />
                <Text style={{ fontSize: 18, alignSelf: "center" }}>:</Text>
                <TextInput
                  style={[styles.input, styles.timeInput]} placeholder="MM"
                  keyboardType="numeric" maxLength={2} value={minutePart} onChangeText={onChangeMinute}
                />
                <View style={styles.amPmGroup}>
                  {(["AM","PM"] as const).map((v) => (
                    <TouchableOpacity
                      key={v}
                      style={[styles.amPmBtn, amPm === v ? styles.amPmSelected : styles.amPmUnselected]}
                      onPress={() => setAmPm(v)}
                    >
                      <Text style={[styles.amPmText, amPm === v && styles.amPmTextSelected]}>{v}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Text style={styles.label}>Descripción</Text>
              <TextInput style={styles.input} placeholder="Notas adicionales..." value={descripcion} onChangeText={setDescripcion} />

              <Text style={styles.helper}>
                * Se guardará con la fecha seleccionada:{" "}
                <Text style={{ fontWeight: "800" }}>{selectedDate}</Text>
              </Text>

              <View style={styles.modalRow}>
                <TouchableOpacity style={[styles.modalBtn, styles.btnGreen]} onPress={guardar}>
                  <Text style={styles.bigBtnText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.btnRed]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.bigBtnText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </Modal>

      {/* Modal Cambiar Fecha */}
      <Modal visible={changeDateVisible} transparent animationType="slide" onRequestClose={() => setChangeDateVisible(false)}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Cambiar fecha del evento</Text>
              <View style={styles.calendarCard}>
                <View style={styles.calHeader}>
                  <TouchableOpacity onPress={gotoPrevMonthChange}><FontAwesome5 name="chevron-left" /></TouchableOpacity>
                  <Text style={styles.calTitle}>{monthLabel(changeCalYear, changeCalMonth0)}</Text>
                  <TouchableOpacity onPress={gotoNextMonthChange}><FontAwesome5 name="chevron-right" /></TouchableOpacity>
                </View>
                <View style={styles.weekHeader}>
                  {["L","M","X","J","V","S","D"].map((d) => (
                    <Text key={d} style={styles.weekCell}>{d}</Text>
                  ))}
                </View>
                {changeCalRows.map((row, i) => (
                  <View key={i} style={styles.weekRow}>
                    {row.map((cell, j) => {
                      const iso = cell ? toISO(cell) : "";
                      const isSelected = iso === newDate;
                      const disabled = !!cell && iso < todayISO();
                      return (
                        <TouchableOpacity
                          key={j}
                          style={[styles.dayCell, isSelected && styles.daySelected, disabled && { opacity: 0.35 }]}
                          onPress={() => { if (!cell || iso < todayISO()) return; setNewDate(iso); }}
                          disabled={!cell || disabled}
                        >
                          <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
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
                <TouchableOpacity style={[styles.modalBtn, styles.btnGreen]} onPress={confirmarCambioFecha}>
                  <Text style={styles.bigBtnText}>Confirmar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.btnRed]} onPress={() => setChangeDateVisible(false)}>
                  <Text style={styles.bigBtnText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </Modal>

      {/* Modal Eventos del Mes */}
      <Modal visible={modalMesVisible} transparent animationType="slide" onRequestClose={() => setModalMesVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Eventos registrados este mes</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {eventosDelMesActual().length === 0 ? (
                <Text style={styles.noEventText}>No hay eventos este mes.</Text>
              ) : (
                eventosDelMesActual()
                  .sort((a, b) => (a.fecha > b.fecha ? 1 : -1))
                  .map((e) => (
                    <View key={e.id} style={{ marginBottom: 10 }}>
                      <Text style={{ fontWeight: "800" }}>{e.titulo}</Text>
                      <Text style={{ color: "#555" }}>{e.fecha} — {e.hora}</Text>
                    </View>
                  ))
              )}
            </ScrollView>
            <TouchableOpacity style={[styles.modalBtn, styles.btnRed]} onPress={() => setModalMesVisible(false)}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

/* =======================
   Estilos
   ======================= */
const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: "#F7F2DF" },
  syncText:         { textAlign: "center", color: "#666", paddingVertical: 4 },
  syncError:        { textAlign: "center", color: "#991B1B", paddingVertical: 4 },
  nextEventCard:    { backgroundColor: "#FFF3E0", borderRadius: 18, borderWidth: 1, borderColor: "#F0C090", padding: 24, margin: 16, elevation: 3 },
  nextEventTitle:   { fontWeight: "800", fontSize: 18, color: "#333" },
  eventName:        { fontSize: 22, fontWeight: "900", color: "#222", marginTop: 6 },
  eventDate:        { color: "#555", fontSize: 16, marginTop: 4 },
  noEventText:      { textAlign: "center", color: "#777", marginTop: 6 },
  calendarCard:     { marginHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: "#EEDAC1", backgroundColor: "#fff", padding: 10 },
  calHeader:        { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  calTitle:         { fontWeight: "800" },
  weekHeader:       { flexDirection: "row" },
  weekCell:         { flex: 1, textAlign: "center", fontWeight: "700", color: "#666" },
  weekRow:          { flexDirection: "row" },
  dayCell:          { flex: 1, height: 40, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#EEE", margin: 1, borderRadius: 6 },
  daySelected:      { backgroundColor: "#FFE3D7", borderColor: "#FFBCA8" },
  dayText:          { fontWeight: "700" },
  dayTextSelected:  { color: "#000" },
  selectedText:     { textAlign: "center", marginTop: 6, color: "#333", fontWeight: "700" },
  bigBtn:           { margin: 16, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  bigBtnText:       { color: "#fff", fontWeight: "700" },
  btnGreen:         { backgroundColor: "#4CAF50" },
  btnRed:           { backgroundColor: "#D32F2F" },
  btnBlue:          { backgroundColor: "#2196F3" },
  orText:           { textAlign: "center", color: "#666", marginBottom: 6 },
  sectionTitle:     { fontWeight: "900", color: "#333", fontSize: 16, marginHorizontal: 16, marginBottom: 8 },
  itemRow:          { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#EEE", borderRadius: 10, padding: 10, marginHorizontal: 16, marginBottom: 8 },
  itemTitle:        { fontWeight: "800", color: "#222" },
  itemDetail:       { color: "#666" },
  itemComments:     { color: "#555", fontStyle: "italic" },
  itemActions:      { flexDirection: "row", gap: 6 },
  smallBtn:         { padding: 8, borderRadius: 8 },
  smallBtnText:     { color: "#fff", fontWeight: "700", fontSize: 12 },
  modalBackdrop:    { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 20 },
  modalCard:        { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  modalTitle:       { fontSize: 18, fontWeight: "800", textAlign: "center", marginBottom: 12 },
  label:            { fontWeight: "700", marginBottom: 4 },
  input:            { borderWidth: 1, borderColor: "#CFCFCF", borderRadius: 10, padding: 10, marginBottom: 10, minWidth: 60 },
  timeRow:          { flexDirection: "row", alignItems: "center", marginBottom: 10, justifyContent: "center" },
  timeInput:        { width: 64, textAlign: "center", marginHorizontal: 6 },
  amPmGroup:        { flexDirection: "row", marginLeft: 8 },
  amPmBtn:          { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, marginHorizontal: 4, justifyContent: "center", alignItems: "center" },
  amPmSelected:     { backgroundColor: "#4CAF50", borderColor: "#388E3C" },
  amPmUnselected:   { backgroundColor: "#FFF", borderColor: "#CCC" },
  amPmText:         { fontWeight: "700", color: "#333" },
  amPmTextSelected: { color: "#fff" },
  helper:           { color: "#666", fontSize: 12, marginBottom: 8 },
  modalRow:         { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  modalBtn:         { flex: 1, marginHorizontal: 4, paddingVertical: 12, borderRadius: 10, alignItems: "center", justifyContent: "center", minHeight: 48 },
});

export default AgendaScreen;