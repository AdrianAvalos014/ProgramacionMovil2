import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { useUser } from "../../context/UserContext";
import { syncEvents } from "../../Events/syncEvents";
import { tareasService } from "../../services/tareas/tareasService";
import { Filtro, Prioridad, Tarea } from "../../../types/tareas/tareasTypes";

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
export const toISO = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toISO(new Date());
export const fromISOtoDMY = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
export const parseFechaLimite = (fecha: string): Date | null => {
  const parts = fecha.split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y) return null;
  const dt = new Date(y, m - 1, d, 9, 0, 0);
  return isNaN(dt.getTime()) ? null : dt;
};

export const prioridadColor = (p: Prioridad) => {
  switch (p) {
    case "Alta":
      return "#F44336";

    case "Media":
      return "#FF9800";

    default:
      return "#4CAF50";
  }
};

export const daysLeftLabel = (fechaLimite?: string) => {
  if (!fechaLimite) return null;
  const dt = parseFechaLimite(fechaLimite);
  if (!dt) return null;
  const today = new Date();
  const a = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const b = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const days = Math.round((b.getTime() - a.getTime()) / 86400000);
  if (days < 0) return { text: "Vencida", color: "#B71C1C" };
  if (days === 0) return { text: "Hoy", color: "#E53935" };
  if (days === 1) return { text: "Mañana", color: "#FB8C00" };
  return { text: `En ${days} días`, color: "#546E7A" };
};

export const monthMatrix = (year: number, month0: number) => {
  const first = new Date(year, month0, 1);
  const startDow = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++)
    cells.push(new Date(year, month0, d));
  while (cells.length < 42) cells.push(null);
  const rows: (Date | null)[][] = [];
  for (let i = 0; i < 6; i++)
    rows.push(cells.slice(i * 7, i * 7 + 7));
  return rows;
};

export const monthLabel = (year: number, month0: number) => {
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  return `${meses[month0]} ${year}`;
};

export const useTareas = () => {
  const { user } = useUser();
  const userId = user?.user_id ?? null;
  const isSyncing = false;
  const lastSyncError = null;
  const [tareas, setTareas] = useState<Tarea[]>([]);
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
  const [tempDateISO, setTempDateISO] = useState(todayISO());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth0, setCalMonth0] = useState(new Date().getMonth());

  const cargarTareas = useCallback(async () => {
    if (!userId) {
      setTareas([]);
      return;
    }
    const data = await tareasService.getAll(userId);
    setTareas(data as Tarea[]);
  }, [userId]);
  const cargarTareasRef = useRef(cargarTareas);

  useEffect(() => {
    cargarTareas();
  }, [cargarTareas]);

  useEffect(() => {
    cargarTareasRef.current = cargarTareas;
  }, [cargarTareas]);

  useEffect(() => {
    const unsub = syncEvents.subscribe(() => cargarTareasRef.current());

    return () => unsub();
  }, []);

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
    [tareas]
  );
  const totalCompletadas = useMemo(
    () => tareas.filter((t) => t.completada).length,
    [tareas]
  );
  const calRows = useMemo(
    () => monthMatrix(calYear, calMonth0),
    [calYear, calMonth0]
  );
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

  const abrirModalEditar = (tarea: Tarea) => {
    setEditingTask(tarea);
    setTitulo(tarea.titulo);
    setDescripcion(tarea.descripcion || "");
    setFechaLimite(tarea.fechaLimite || "");
    setPrioridad(tarea.prioridad);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const abrirCalendario = () => {
    const base = fechaLimite
      ? fechaLimite.split("/").reverse().join("-")
      : todayISO();

    setTempDateISO(base);
    setCalendarVisible(true);
  };

  const confirmarFecha = () => {
    setFechaLimite(fromISOtoDMY(tempDateISO));
    setCalendarVisible(false);
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

  const guardar = async () => {
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
      const data = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        fechaLimite: fechaLimite.trim(),
        prioridad,
      };

      if (editingTask) {
        await tareasService.update(editingTask.id, data);
      }
      else {
        await tareasService.create(userId, {
          ...data,
          completada: 0,
        });
      }
      await cargarTareas();
      cerrarModal();
    } finally {
      setSaving(false);
    }
  };

  const eliminar = (id: string) => {
    Alert.alert("Eliminar tarea", "¿Eliminar esta tarea?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Eliminar",
        style: "destructive",

        onPress: async () => {
          const tareasPrevias = tareas;

          try {
            setTareas((prev) => prev.filter((t) => t.id !== id));
            await tareasService.remove(id);
          } catch {
            setTareas(tareasPrevias);
            Alert.alert("Error", "No se pudo eliminar la tarea.");
          }
        },
      },
    ]);
  };

  const toggleCompletada = async (tarea: Tarea) => {
    await tareasService.update(tarea.id, {
      completada: tarea.completada ? 0 : 1,
    });

    await cargarTareas();
  };

  return {
    isSyncing,
    lastSyncError,

    tareas,
    tareasFiltradas,
    totalPendientes,
    totalCompletadas,

    busqueda,
    setBusqueda,

    filtro,
    setFiltro,

    modalVisible,
    editingTask,
    abrirModalNueva,
    abrirModalEditar,
    cerrarModal,

    titulo,
    setTitulo,

    descripcion,
    setDescripcion,

    fechaLimite,
    setFechaLimite,

    prioridad,
    setPrioridad,

    saving,

    calendarVisible,
    setCalendarVisible,

    tempDateISO,
    setTempDateISO,

    calYear,
    calMonth0,
    calRows,

    abrirCalendario,
    confirmarFecha,
    gotoPrevMonth,
    gotoNextMonth,

    guardar,
    eliminar,
    toggleCompletada,
  };
};