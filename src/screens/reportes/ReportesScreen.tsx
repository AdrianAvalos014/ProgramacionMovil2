import React, { useEffect, useMemo, useRef, useCallback, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
} from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { FONT_SIZES } from "../../../types";
import { useIsFocused } from "@react-navigation/native";
import { useUser } from "../../context/UserContext"; 
import { tareasRepository } from "../../database/repositories/tareasRepository";
import { agendaRepository } from "../../database/repositories/agendaRepository";
import { comprasRepository } from "../../database/repositories/comprasRepository";
import { syncEvents } from "../../Events/syncEvents";

interface Tarea {
  id: string;
  titulo: string;
  descripcion?: string;
  fechaLimite?: string; 
  prioridad: "Baja" | "Media" | "Alta";
  completada: number;   
}

interface Evento {
  id: string;
  titulo: string;
  fecha: string;       
  hora: string;
  descripcion?: string;
  asistencia?: "asistio" | "no_asistio" | null;
}

interface ProductoCompra {
  id: string;
  descripcion: string;
  cantidad: number;
  precio: number;
}

interface Compra {
  id: string;
  categoria: string;
  productos: string;   
  total: number;
  fecha: string;       
}


function parseSQLiteDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    const [d, m, y] = parts.map(Number);
    if (!d || !m || !y) return null;
    return new Date(y, m - 1, d); 
  }

  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  return new Date(year, month, day);
}

function isSameMonthDate(d: Date | null, year: number, month0: number) {
  return !!d && d.getFullYear() === year && d.getMonth() === month0;
}

function parseProductos(raw: string): ProductoCompra[] {
  try { return JSON.parse(raw); }
  catch { return []; }
}

function getCompraTotal(c: Compra): number {
  if (typeof c.total === "number" && Number.isFinite(c.total)) return c.total;
  return parseProductos(c.productos).reduce((acc, p) => {
    const cant  = Number.isFinite(Number(p.cantidad)) ? Number(p.cantidad) : 0;
    const price = Number.isFinite(Number(p.precio))   ? Number(p.precio)   : 0;
    return acc + cant * price;
  }, 0);
}

const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

const CATEGORIAS_REPORTE = [
  "Todas","Supermercado","Comida","Transporte",
  "Ropa","Salud","Suscripciones","Otros",
] as const;
type CategoriaReporte = (typeof CATEGORIAS_REPORTE)[number];

type FiltroTareas           = "Todas" | "Completadas" | "Pendientes";
type OrdenFecha             = "fechaAsc" | "fechaDesc";
type FiltroMonto            = "Todas" | "Cara" | "Barata";
type FiltroEventosAsistencia = "Todos" | "Asistio" | "NoAsistio" | "SinMarcar";


const ReportesScreen: React.FC = () => {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const isFocused = useIsFocused();

  const { user } = useUser();
  const userId = user?.user_id ?? null;

  const [year,   setYear]   = useState(now.getFullYear());
  const [month0, setMonth0] = useState(now.getMonth());
  const labelMes = `${MESES[month0]} ${year}`;

  const [modalTipo, setModalTipo] = useState<"tareas" | "eventos" | "compras" | null>(null);

  const [tareas,  setTareas]  = useState<Tarea[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);

  const [tareasFiltro,             setTareasFiltro]             = useState<FiltroTareas>("Todas");
  const [tareasOrden,              setTareasOrden]              = useState<OrdenFecha>("fechaAsc");
  const [eventosOrden,             setEventosOrden]             = useState<OrdenFecha>("fechaAsc");
  const [eventosFiltroAsistencia,  setEventosFiltroAsistencia]  = useState<FiltroEventosAsistencia>("Todos");
  const [comprasOrden,             setComprasOrden]             = useState<OrdenFecha>("fechaDesc");
  const [comprasFiltroCategoria,   setComprasFiltroCategoria]   = useState<CategoriaReporte>("Todas");
  const [comprasFiltroMonto,       setComprasFiltroMonto]       = useState<FiltroMonto>("Todas");

  const cargarDatos = useCallback(async () => {
    if (!userId) return;
    try {
      const [ts, ev, cp] = await Promise.all([
        tareasRepository.getAll(userId),
        agendaRepository.getAll(userId),
        comprasRepository.getAll(userId),
      ]);
      console.log("📊 Reportes recargados — tareas:", ts?.length, "eventos:", ev?.length, "compras:", cp?.length);
      setTareas((ts || []) as Tarea[]);
      setEventos((ev || []) as Evento[]);
      setCompras((cp || []) as Compra[]);
    } catch (error) {
      console.error("Error cargando repositorios locales:", error);
    }
  }, [userId]);

  useEffect(() => {
    if (isFocused) cargarDatos();
  }, [isFocused, cargarDatos]);

  const cargarDatosRef = useRef(cargarDatos);
  useEffect(() => { cargarDatosRef.current = cargarDatos; }, [cargarDatos]);
  useEffect(() => {
    const unsub = syncEvents.subscribe(() => { cargarDatosRef.current(); });
    return () => unsub();
  }, []);

  const tareasMes = useMemo(
    () => tareas.filter((t) => isSameMonthDate(parseSQLiteDate(t.fechaLimite), year, month0)),
    [tareas, year, month0]
  );
  const eventosMes = useMemo(
    () => eventos.filter((e) => isSameMonthDate(parseSQLiteDate(e.fecha), year, month0)),
    [eventos, year, month0]
  );
  const comprasMes = useMemo(
    () => compras.filter((c) => isSameMonthDate(parseSQLiteDate(c.fecha), year, month0)),
    [compras, year, month0]
  );

  const totalTareas  = tareasMes.length;
  const completadas  = tareasMes.filter((t) => t.completada === 1).length;
  const pendientes   = totalTareas - completadas;
  const avance       = totalTareas === 0 ? 0 : Math.round((completadas * 100) / totalTareas);
  const totalEventos = eventosMes.length;
  const totalGasto   = comprasMes.reduce((acc, c) => acc + getCompraTotal(c), 0);

  const gastoPorCategoria = comprasMes.reduce<Record<string, number>>((acc, c) => {
    const cat = c.categoria || "Otros";
    acc[cat] = (acc[cat] || 0) + getCompraTotal(c);
    return acc;
  }, {});

  const categoriaTop =
    comprasMes.length === 0
      ? "Sin datos"
      : Object.entries(gastoPorCategoria).sort((a, b) => b[1] - a[1])[0][0];

  const proximoEventoMes = useMemo(() => {
    if (!eventosMes.length) return null;
    return [...eventosMes].sort((a, b) => {
      const da = parseSQLiteDate(a.fecha)?.getTime() ?? 0;
      const db = parseSQLiteDate(b.fecha)?.getTime() ?? 0;
      return da - db;
    })[0];
  }, [eventosMes]);

  const cambiarMes = (delta: number) => {
    const d = new Date(year, month0, 1);
    d.setMonth(d.getMonth() + delta);
    setYear(d.getFullYear());
    setMonth0(d.getMonth());
  };
  const tareasDetalle = useMemo(() => {
    let base = [...tareasMes].sort((a, b) => {
      const da = parseSQLiteDate(a.fechaLimite)?.getTime() ?? 0;
      const db = parseSQLiteDate(b.fechaLimite)?.getTime() ?? 0;
      return tareasOrden === "fechaAsc" ? da - db : db - da;
    });
    if (tareasFiltro === "Completadas") return base.filter((t) => t.completada === 1);
    if (tareasFiltro === "Pendientes")  return base.filter((t) => t.completada === 0);
    return base;
  }, [tareasMes, tareasFiltro, tareasOrden]);

  const eventosDetalle = useMemo(() => {
    let base = [...eventosMes];
    if (eventosFiltroAsistencia === "Asistio")    base = base.filter((e) => e.asistencia === "asistio");
    else if (eventosFiltroAsistencia === "NoAsistio")  base = base.filter((e) => e.asistencia === "no_asistio");
    else if (eventosFiltroAsistencia === "SinMarcar")  base = base.filter((e) => !e.asistencia);

    base.sort((a, b) => {
      const da   = parseSQLiteDate(a.fecha)?.getTime() ?? 0;
      const db   = parseSQLiteDate(b.fecha)?.getTime() ?? 0;
      const diffA = da - today.getTime();
      const diffB = db - today.getTime();
      if (diffA >= 0 && diffB < 0) return -1;
      if (diffA < 0  && diffB >= 0) return 1;
      return eventosOrden === "fechaAsc" ? da - db : db - da;
    });
    return base;
  }, [eventosMes, eventosOrden, eventosFiltroAsistencia, today]);

  const comprasDetalle = useMemo(() => {
    let base = [...comprasMes];
    if (comprasFiltroCategoria !== "Todas")
      base = base.filter((c) => c.categoria === comprasFiltroCategoria);
    if (!base.length) return [];

    const totales = base.map((c) => getCompraTotal(c));
    const max = Math.max(...totales);
    const min = Math.min(...totales);
    if (comprasFiltroMonto === "Cara")   base = base.filter((c) => getCompraTotal(c) === max);
    if (comprasFiltroMonto === "Barata") base = base.filter((c) => getCompraTotal(c) === min);

    base.sort((a, b) => {
      const da = parseSQLiteDate(a.fecha)?.getTime() ?? 0;
      const db = parseSQLiteDate(b.fecha)?.getTime() ?? 0;
      return comprasOrden === "fechaAsc" ? da - db : db - da;
    });
    return base;
  }, [comprasMes, comprasFiltroCategoria, comprasFiltroMonto, comprasOrden]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="red" barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Reporte del mes</Text>
          <Text style={styles.headerSubtitle}>Resumen de tareas, eventos y gastos</Text>
        </View>
      </View>

      <View style={styles.monthSelector}>
        <TouchableOpacity style={styles.monthArrow} onPress={() => cambiarMes(-1)}>
          <MaterialIcons name="chevron-left" size={26} color="red" />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{labelMes}</Text>
        <TouchableOpacity style={styles.monthArrow} onPress={() => cambiarMes(1)}>
          <MaterialIcons name="chevron-right" size={26} color="red" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/*TAREAS*/}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconCircle}>
              <FontAwesome5 name="tasks" size={18} color="red" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Tareas del mes</Text>
              <Text style={styles.cardSubtitle}>Cómo vas con tus pendientes.</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalTareas}</Text>
              <Text style={styles.statLabel}>Tareas</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{completadas}</Text>
              <Text style={styles.statLabel}>Completadas</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{pendientes}</Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>
          </View>
          <Text style={styles.smallLabel}>Progreso</Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${avance}%` }]} />
          </View>
          <Text style={styles.progressText}>{avance}% completado</Text>
          <TouchableOpacity style={styles.detailButton} onPress={() => setModalTipo("tareas")}>
            <Text style={styles.detailButtonText}>Ver detalle</Text>
          </TouchableOpacity>
        </View>

        {/*EVENTOS*/}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconCircle}>
              <FontAwesome5 name="calendar-alt" size={18} color="red" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Eventos del mes</Text>
              <Text style={styles.cardSubtitle}>Citas y actividades agendadas.</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalEventos}</Text>
              <Text style={styles.statLabel}>Eventos</Text>
            </View>
          </View>
          <Text style={styles.smallLabel}>
            Próximo evento:
            <Text style={styles.highlightText}>
              {" "}{proximoEventoMes ? proximoEventoMes.titulo : "No hay eventos"}
            </Text>
          </Text>
          <TouchableOpacity style={styles.detailButton} onPress={() => setModalTipo("eventos")}>
            <Text style={styles.detailButtonText}>Ver detalle</Text>
          </TouchableOpacity>
        </View>

        {/*GASTOS*/}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconCircle}>
              <FontAwesome5 name="shopping-cart" size={18} color="red" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Gastos del mes</Text>
              <Text style={styles.cardSubtitle}>Cuánto has gastado y en qué categorías.</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{comprasMes.length}</Text>
              <Text style={styles.statLabel}>Compras</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>${totalGasto.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total gastado</Text>
            </View>
          </View>
          <Text style={styles.smallLabel}>
            Categoría donde más gastas:
            <Text style={styles.highlightText}> {categoriaTop}</Text>
          </Text>
          <TouchableOpacity style={styles.detailButton} onPress={() => setModalTipo("compras")}>
            <Text style={styles.detailButtonText}>Ver detalle</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/*MODALES DE DETALLE*/}
      <Modal
        animationType="slide"
        transparent
        visible={modalTipo !== null}
        onRequestClose={() => setModalTipo(null)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>

            {/*MODAL TAREAS*/}
            {modalTipo === "tareas" && (
              <>
                <Text style={styles.modalTitle}>Tareas de {labelMes}</Text>
                <View style={styles.filtersRow}>
                  <Text style={styles.filterLabel}>Estado:</Text>
                  {(["Todas","Completadas","Pendientes"] as FiltroTareas[]).map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={[styles.chip, tareasFiltro === f && styles.chipActive]}
                      onPress={() => setTareasFiltro(f)}
                    >
                      <Text style={[styles.chipText, tareasFiltro === f && styles.chipTextActive]}>{f}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.filtersRow}>
                  <Text style={styles.filterLabel}>Orden:</Text>
                  {(["fechaAsc","fechaDesc"] as OrdenFecha[]).map((o) => (
                    <TouchableOpacity
                      key={o}
                      style={[styles.chip, tareasOrden === o && styles.chipActive]}
                      onPress={() => setTareasOrden(o)}
                    >
                      <Text style={[styles.chipText, tareasOrden === o && styles.chipTextActive]}>
                        {o === "fechaAsc" ? "Próximos primero" : "Lejanos primero"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {tareasDetalle.length === 0 ? (
                  <Text style={styles.emptyText}>No hay tareas que coincidan con el filtro.</Text>
                ) : (
                  <ScrollView style={{ maxHeight: 260 }}>
                    {tareasDetalle.map((t) => (
                      <View key={t.id} style={styles.modalItem}>
                        <Text style={styles.modalItemTitle}>{t.titulo}</Text>
                        <Text style={styles.modalItemText}>
                          Fecha límite: {t.fechaLimite || "Sin fecha"}
                        </Text>
                        <Text style={styles.modalItemText}>
                          Estado:{" "}
                          <Text style={styles.boldText}>
                            {t.completada === 1 ? "Completada" : "Pendiente"}
                          </Text>
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </>
            )}

            {/*MODAL EVENTO*/}
            {modalTipo === "eventos" && (
              <>
                <Text style={styles.modalTitle}>Eventos de {labelMes}</Text>
                <View style={styles.filtersRow}>
                  <Text style={styles.filterLabel}>Asistencia:</Text>
                  {(["Todos","Asistio","NoAsistio","SinMarcar"] as FiltroEventosAsistencia[]).map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={[styles.chip, eventosFiltroAsistencia === f && styles.chipActive]}
                      onPress={() => setEventosFiltroAsistencia(f)}
                    >
                      <Text style={[styles.chipText, eventosFiltroAsistencia === f && styles.chipTextActive]}>
                        {f === "Todos" ? "Todos" : f === "Asistio" ? "Asistí" : f === "NoAsistio" ? "No asistí" : "Sin marcar"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.filtersRow}>
                  <Text style={styles.filterLabel}>Orden:</Text>
                  {(["fechaAsc","fechaDesc"] as OrdenFecha[]).map((o) => (
                    <TouchableOpacity
                      key={o}
                      style={[styles.chip, eventosOrden === o && styles.chipActive]}
                      onPress={() => setEventosOrden(o)}
                    >
                      <Text style={[styles.chipText, eventosOrden === o && styles.chipTextActive]}>
                        {o === "fechaAsc" ? "Próximos primero" : "Lejanos primero"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {eventosDetalle.length === 0 ? (
                  <Text style={styles.emptyText}>No hay eventos registrados este mes.</Text>
                ) : (
                  <ScrollView style={{ maxHeight: 260 }}>
                    {eventosDetalle.map((e) => (
                      <View key={e.id} style={styles.modalItem}>
                        <Text style={styles.modalItemTitle}>{e.titulo}</Text>
                        <Text style={styles.modalItemText}>Fecha: {e.fecha} · Hora: {e.hora}</Text>
                        {e.asistencia && (
                          <Text style={styles.modalItemText}>
                            Asistencia:{" "}
                            <Text style={styles.boldText}>
                              {e.asistencia === "asistio" ? "Asistí" : "No asistí"}
                            </Text>
                          </Text>
                        )}
                      </View>
                    ))}
                  </ScrollView>
                )}
              </>
            )}

            {/*MODAL COMPRAS*/}
            {modalTipo === "compras" && (
              <>
                <Text style={styles.modalTitle}>Gastos de {labelMes}</Text>
                {comprasMes.length === 0 ? (
                  <Text style={styles.emptyText}>No hay compras registradas este mes.</Text>
                ) : (
                  <>
                    <View style={styles.filtersRowWrap}>
                      <Text style={styles.filterLabel}>Categoría:</Text>
                      <View style={styles.chipRowWrap}>
                        {CATEGORIAS_REPORTE.map((cat) => (
                          <TouchableOpacity
                            key={cat}
                            style={[styles.chip, comprasFiltroCategoria === cat && styles.chipActive]}
                            onPress={() => setComprasFiltroCategoria(cat)}
                          >
                            <Text style={[styles.chipText, comprasFiltroCategoria === cat && styles.chipTextActive]}>
                              {cat}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    <View style={styles.filtersRow}>
                      <Text style={styles.filterLabel}>Orden:</Text>
                      {(["fechaAsc","fechaDesc"] as OrdenFecha[]).map((o) => (
                        <TouchableOpacity
                          key={o}
                          style={[styles.chip, comprasOrden === o && styles.chipActive]}
                          onPress={() => setComprasOrden(o)}
                        >
                          <Text style={[styles.chipText, comprasOrden === o && styles.chipTextActive]}>
                            {o === "fechaAsc" ? "Más antiguas primero" : "Más recientes primero"}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.filtersRow}>
                      <Text style={styles.filterLabel}>Monto:</Text>
                      {(["Todas","Cara","Barata"] as FiltroMonto[]).map((m) => (
                        <TouchableOpacity
                          key={m}
                          style={[styles.chip, comprasFiltroMonto === m && styles.chipActive]}
                          onPress={() => setComprasFiltroMonto(m)}
                        >
                          <Text style={[styles.chipText, comprasFiltroMonto === m && styles.chipTextActive]}>
                            {m === "Todas" ? "Todas" : m === "Cara" ? "Más cara" : "Más barata"}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <ScrollView style={{ maxHeight: 220 }}>
                      {comprasDetalle.length === 0 ? (
                        <Text style={styles.emptyText}>No hay compras que coincidan con los filtros.</Text>
                      ) : (
                        comprasDetalle.map((c) => {
                          const productos = parseProductos(c.productos);
                          return (
                            <View key={c.id} style={styles.modalItem}>
                              <Text style={styles.modalItemTitle}>{c.categoria}</Text>
                              <Text style={styles.modalItemText}>Fecha: {c.fecha}</Text>
                              <Text style={styles.modalItemText}>
                                Total: <Text style={styles.boldText}>${getCompraTotal(c).toFixed(2)}</Text>
                              </Text>
                              {productos.map((p) => (
                                <Text key={p.id} style={styles.modalItemText}>
                                  • {p.descripcion} · Cant: {p.cantidad} · ${Number(p.precio).toFixed(2)}
                                </Text>
                              ))}
                            </View>
                          );
                        })
                      )}
                    </ScrollView>
                    <Text style={[styles.modalItemText, { marginTop: 8 }]}>
                      Total gastado: <Text style={styles.boldText}>${totalGasto.toFixed(2)}</Text>
                    </Text>
                    {Object.entries(gastoPorCategoria).map(([cat, val]) => (
                      <Text key={cat} style={styles.modalItemText}>• {cat}: ${Number(val).toFixed(2)}</Text>
                    ))}
                  </>
                )}
              </>
            )}

            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalTipo(null)}>
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "beige",
  },
  header: {
    backgroundColor: "red",
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.small,
    color: "#ffe",
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#FFF3E0",
  },
  monthArrow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  monthLabel: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: "red",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFE6E6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  cardTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
    color: "#333",
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.small,
    color: "#777",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: "red",
  },
  statLabel: {
    fontSize: FONT_SIZES.small,
    color: "#555",
    marginTop: 2,
  },
  smallLabel: {
    marginTop: 10,
    fontSize: FONT_SIZES.small,
    color: "#444",
  },
  highlightText: {
    fontWeight: "bold",
    color: "red",
  },
  progressBarBackground: {
    marginTop: 6,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#eee",
    overflow: "hidden",
  },
  progressBarFill: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "red",
  },
  progressText: {
    marginTop: 4,
    fontSize: FONT_SIZES.small,
    color: "#555",
  },
  detailButton: {
    marginTop: 12,
    alignSelf: "flex-end",
    backgroundColor: "red",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  detailButtonText: {
    color: "#fff",
    fontSize: FONT_SIZES.small,
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
  },
  modalTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  modalItemTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: "#333",
  },
  modalItemText: {
    fontSize: FONT_SIZES.small,
    color: "#555",
  },
  emptyText: {
    fontSize: FONT_SIZES.small,
    color: "#777",
    textAlign: "center",
    marginVertical: 16,
  },
  boldText: {
    fontWeight: "bold",
  },
  modalCloseButton: {
    marginTop: 14,
    alignSelf: "center",
    backgroundColor: "red",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  modalCloseText: {
    color: "#fff",
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  filtersRowWrap: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: FONT_SIZES.small,
    color: "#444",
    marginRight: 6,
  },
  chipRowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 6,
    marginTop: 4,
  },
  chipActive: {
    backgroundColor: "red",
    borderColor: "red",
  },
  chipText: {
    fontSize: FONT_SIZES.small,
    color: "#444",
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
});
export default ReportesScreen;