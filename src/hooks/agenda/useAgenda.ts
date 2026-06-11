import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";

import { useUser } from "../../context/UserContext";
import { syncEvents } from "../../Events/syncEvents";
import { agendaService } from "../../services/agenda/agendaService";
import { AmPm, Evento, MESES, ModoAgenda } from "../../../types/agenda/agendaTypes";

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export const toISO = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayISO = () => toISO(new Date());

export const monthLabel = (year: number, month0: number) => {
  return `${MESES[month0]} ${year}`;
};

export const monthMatrix = (year: number, month0: number) => {
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
};

export const horaToMinutes = (hora: string) => {
  const m = hora.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = m[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + min;
};

export const useAgenda = () => {
  const { user } = useUser();
  const userId = user?.user_id ?? null;

  const isSyncing = false;
  const lastSyncError = null;

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMesVisible, setModalMesVisible] = useState(false);
  const [changeDateVisible, setChangeDateVisible] = useState(false);

  const [modo, setModo] = useState<ModoAgenda>("registrar");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [originalDate, setOriginalDate] = useState<string | null>(null);

  const [hourPart, setHourPart] = useState("");
  const [minutePart, setMinutePart] = useState("");
  const [amPm, setAmPm] = useState<AmPm>("AM");

  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth0, setCalMonth0] = useState(new Date().getMonth());

  const [changeDateId, setChangeDateId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState(todayISO());
  const [changeCalYear, setChangeCalYear] = useState(new Date().getFullYear());
  const [changeCalMonth0, setChangeCalMonth0] = useState(new Date().getMonth());

  const calRows = useMemo(
    () => monthMatrix(calYear, calMonth0),
    [calYear, calMonth0]
  );

  const changeCalRows = useMemo(
    () => monthMatrix(changeCalYear, changeCalMonth0),
    [changeCalYear, changeCalMonth0]
  );

  const cargarEventos = useCallback(async () => {
    if (!userId) return;
    const data = await agendaService.getAll(userId);
    setEventos(data as Evento[]);
  }, [userId]);

  const cargarEventosRef = useRef(cargarEventos);

  useEffect(() => { cargarEventos(); }, [cargarEventos]);
  useEffect(() => { cargarEventosRef.current = cargarEventos; }, [cargarEventos]);

  useEffect(() => {
    const unsub = syncEvents.subscribe(() => cargarEventosRef.current());
    return () => unsub();
  }, []);

  const resetForm = () => {
    setTitulo("");
    setDescripcion("");
    setHourPart("");
    setMinutePart("");
    setAmPm("AM");
    setEditId(null);
    setOriginalDate(null);
    setModo("registrar");
  };

  const abrirRegistrar = () => {
    resetForm();
    setModo("registrar");
    setModalVisible(true);
  };

  const abrirEditar = (evento: Evento) => {
    setModo("editar");
    setEditId(evento.id);
    setOriginalDate(evento.fecha);
    setSelectedDate(evento.fecha);
    setTitulo(evento.titulo);
    setDescripcion(evento.descripcion ?? "");
    const match = evento.hora.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      setHourPart(match[1]);
      setMinutePart(match[2]);
      setAmPm(match[3].toUpperCase() as AmPm);
    }
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const onChangeHour = (value: string) => {
    const clean = value.replace(/[^0-9]/g, "");
    const num = Number(clean);
    if (clean === "") { setHourPart(""); return; }
    if (num >= 1 && num <= 12) setHourPart(clean);
  };

  const onChangeMinute = (value: string) => {
    const clean = value.replace(/[^0-9]/g, "");
    const num = Number(clean);
    if (clean === "") { setMinutePart(""); return; }
    if (num >= 0 && num <= 59) setMinutePart(clean.padStart(2, "0"));
  };

  const guardar = async () => {
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
    const horaFinal = `${parseInt(hourPart, 10)}:${minutePart} ${amPm}`;
    const nuevaHoraMin = horaToMinutes(horaFinal);
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
    try {
      if (modo === "registrar" && userId) {
        await agendaService.create(userId, {
          titulo: titulo.trim(),
          fecha: selectedDate,
          hora: horaFinal,
          descripcion: descripcion.trim(),
          asistencia: "",
        });
        Alert.alert("Eventos", "Evento registrado.");
      } else if (modo === "editar" && editId) {
        await agendaService.update(editId, {
          titulo: titulo.trim(),
          fecha: selectedDate,
          hora: horaFinal,
          descripcion: descripcion.trim(),
        });
        Alert.alert("Eventos", "Evento actualizado.");
      }
      await cargarEventos();
      cerrarModal();
    } catch {
      Alert.alert("Error", "No se pudo guardar el evento.");
    }
  };

  const eliminar = (evento: Evento) => {
    Alert.alert("Confirmar", `¿Eliminar "${evento.titulo}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive",
        onPress: async () => {
          await agendaService.remove(evento.id);
          await cargarEventos();
        },
      },
    ]);
  };

  const marcarAsistencia = async (evento: Evento, estado: "asistio" | "no_asistio") => {
    await agendaService.update(evento.id, { asistencia: estado });
    await cargarEventos();
  };

  const abrirCambiarFecha = (evento: Evento) => {
    setChangeDateId(evento.id);
    setNewDate(evento.fecha);
    const [year, month] = evento.fecha.split("-").map(Number);
    setChangeCalYear(year);
    setChangeCalMonth0(month - 1);
    setChangeDateVisible(true);
  };

  const confirmarCambioFecha = async () => {
    const hoy = todayISO();
    if (newDate < hoy) {
      Alert.alert("Fecha inválida", "La nueva fecha debe ser hoy o posterior.");
      return;
    }
    if (!changeDateId) return;
    await agendaService.update(changeDateId, { fecha: newDate });
    await cargarEventos();
    Alert.alert("Evento", "Fecha actualizada correctamente.");
    setChangeDateVisible(false);
  };

  const gotoPrevMonth = () => {
    const d = new Date(calYear, calMonth0 - 1, 1);
    setCalYear(d.getFullYear());
    setCalMonth0(d.getMonth());
  };

  const gotoNextMonth = () => {
    const d = new Date(calYear, calMonth0 + 1, 1);
    setCalYear(d.getFullYear());
    setCalMonth0(d.getMonth());
  };

  const gotoPrevMonthChange = () => {
    const d = new Date(changeCalYear, changeCalMonth0 - 1, 1);
    setChangeCalYear(d.getFullYear());
    setChangeCalMonth0(d.getMonth());
  };

  const gotoNextMonthChange = () => {
    const d = new Date(changeCalYear, changeCalMonth0 + 1, 1);
    setChangeCalYear(d.getFullYear());
    setChangeCalMonth0(d.getMonth());
  };

  const eventosDelDia = useMemo(() => {
    return eventos
      .filter((ev) => ev.fecha === selectedDate)
      .sort((a, b) => horaToMinutes(a.hora) - horaToMinutes(b.hora));
  }, [eventos, selectedDate]);

  const eventosDelMesActual = useMemo(() => {
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = hoy.getMonth() + 1;
    return eventos
      .filter((e) => {
        const [yy, mm] = e.fecha.split("-").map(Number);
        return yy === y && mm === m;
      })
      .sort((a, b) => (a.fecha > b.fecha ? 1 : -1));
  }, [eventos]);

  const proximo = useMemo(() => {
    const ahora = todayISO();
    return eventos
      .filter((e) => e.fecha >= ahora)
      .sort((a, b) => {
        if (a.fecha !== b.fecha) return a.fecha > b.fecha ? 1 : -1;
        return horaToMinutes(a.hora) - horaToMinutes(b.hora);
      })[0];
  }, [eventos]);

  return {
    isSyncing, lastSyncError,
    eventosDelDia, eventosDelMesActual, proximo,
    modalVisible, modalMesVisible, changeDateVisible,
    modo, titulo, descripcion, hourPart, minutePart, amPm,
    selectedDate, calYear, calMonth0, calRows,
    newDate, changeCalYear, changeCalMonth0, changeCalRows,
    setTitulo, setDescripcion, setAmPm, setSelectedDate,
    setModalMesVisible, setChangeDateVisible, setNewDate,
    abrirRegistrar, abrirEditar, cerrarModal, guardar, eliminar,
    marcarAsistencia, abrirCambiarFecha, confirmarCambioFecha,
    onChangeHour, onChangeMinute,
    gotoPrevMonth, gotoNextMonth, gotoPrevMonthChange, gotoNextMonthChange,
  };
};