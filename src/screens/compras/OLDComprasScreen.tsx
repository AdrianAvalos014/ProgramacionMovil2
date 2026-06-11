import React, { useEffect, useMemo, useRef, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";

// 🔐 Auth
import { auth } from "../../services/firebase-config";

// 💾 SQLite
import { comprasRepository } from "../../database/repositories/comprasRepository";

// 🔄 Sync
import { syncEvents } from "../../Events/syncEvents";
import { useAutoSync } from "../../hooks/useAutoSync";
import { ConnectionBadge } from "../../components/ConnectionBadge";

// ======================
// Tipos
// ======================
interface ProductoCompra {
  id: string;
  descripcion: string;
  cantidad: number;
  precio: number;
}

interface Compra {
  id: string;
  user_id: string;
  categoria: string;
  productos: string; // JSON string en SQLite
  total: number;
  fecha: string;    // ISO string
  sync_status: string;
  deleted: number;
  created_at: string;
  updated_at: string;
}

const parseProductos = (raw: string): ProductoCompra[] => {
  try { return JSON.parse(raw); }
  catch { return []; }
};

// ======================
// Categorías
// ======================
const CATEGORIAS = [
  "Supermercado","Comida","Transporte","Ropa","Salud","Suscripciones","Otros",
];

// ======================
// Helpers calendario
// ======================
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toISO = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISOtoDMY = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
const todayISO = () => toISO(new Date());
const monthMatrix = (year: number, month0: number) => {
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
const Meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

// ======================
// Pantalla
// ======================
const ComprasScreen: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(auth.currentUser?.uid ?? null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUserId(u?.uid ?? null));
    return unsub;
  }, []);

  // 🔄 Detecta conexión y sincroniza automáticamente al volver internet
  const { isSyncing, lastSyncError } = useAutoSync(userId);

  const [compras, setCompras]             = useState<Compra[]>([]);
  const [modalVisible, setModalVisible]   = useState(false);
  const [categoria, setCategoria]         = useState(CATEGORIAS[0]);
  const [editingCompra, setEditingCompra] = useState<Compra | null>(null);

  // ---- fecha ----
  const [fecha, setFecha]                     = useState("");
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [tempDateISO, setTempDateISO]         = useState(todayISO());
  const [calYear, setCalYear]                 = useState(new Date().getFullYear());
  const [calMonth0, setCalMonth0]             = useState(new Date().getMonth());
  const calRows = useMemo(() => monthMatrix(calYear, calMonth0), [calYear, calMonth0]);

  // ---- carrito ----
  const [productos, setProductos]   = useState<ProductoCompra[]>([]);
  const [prodDesc, setProdDesc]     = useState("");
  const [prodCant, setProdCant]     = useState("");
  const [prodPrecio, setProdPrecio] = useState("");

  // ---- filtros ----
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [busqueda, setBusqueda]               = useState("");
  const [saving, setSaving]                   = useState(false);

  // ─── 1. Cargar compras desde SQLite ───────────────────
  const cargarCompras = useCallback(async () => {
    if (!userId) return;
    const data = await comprasRepository.getAll(userId);
    console.log("📦 Compras recargadas:", data.length);
    setCompras(data as Compra[]);
  }, [userId]);

  // ─── 2. Cargar al montar o cuando cambia userId ───────
  useEffect(() => {
    cargarCompras();
  }, [cargarCompras]);

  // ─── 3. Escuchar syncEvents para recargar cuando la
  //        nube baja datos nuevos (useAutoSync → downloadFromCloud
  //        → syncEvents.emit → aquí se recarga la UI)
  const cargarComprasRef = useRef(cargarCompras);
  useEffect(() => {
    cargarComprasRef.current = cargarCompras;
  }, [cargarCompras]);

  useEffect(() => {
    const unsub = syncEvents.subscribe(() => {
      cargarComprasRef.current();
    });
    return () => unsub(); // limpia al desmontar
  }, []); // sin dependencias: se suscribe una sola vez

  // ======================
  // Helpers
  // ======================
  const resetForm = () => {
    setCategoria(CATEGORIAS[0]);
    setProductos([]);
    setProdDesc(""); setProdCant(""); setProdPrecio("");
    setFecha(""); setEditingCompra(null);
  };

  // ======================
  // Carrito
  // ======================
  const agregarProducto = () => {
    if (!prodDesc || !prodCant || !prodPrecio) {
      Alert.alert("Error", "Completa el producto"); return;
    }
    const cantidad = Number(prodCant);
    const precio   = Number(prodPrecio);
    if (cantidad <= 0 || precio <= 0) {
      Alert.alert("Error", "Cantidad o precio inválidos"); return;
    }
    setProductos((prev) => [
      ...prev,
      { id: Date.now().toString(), descripcion: prodDesc.trim(), cantidad, precio },
    ]);
    setProdDesc(""); setProdCant(""); setProdPrecio("");
  };

  const eliminarProducto = (id: string) =>
    setProductos((prev) => prev.filter((p) => p.id !== id));

  const totalCompra = useMemo(
    () => productos.reduce((acc, p) => acc + p.cantidad * p.precio, 0),
    [productos]
  );

  const handleEliminarCompra = (id: string) => {
    Alert.alert("Eliminar", "¿Eliminar esta compra?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive",
        onPress: async () => {
          // baseRepository hace el soft-delete y encola en sync_queue.
          // useAutoSync se encarga de enviar la cola cuando haya internet.
          await comprasRepository.remove(id);
          await cargarCompras();
        },
      },
    ]);
  };

  const abrirEditarCompra = (compra: Compra) => {
    setEditingCompra(compra);
    setCategoria(compra.categoria);
    setProductos(parseProductos(compra.productos));
    setFecha(fromISOtoDMY(compra.fecha));
    setModalVisible(true);
  };

  const handleGuardarCompra = async () => {
    if (saving || !userId) return;
    if (!editingCompra && !fecha) {
      Alert.alert("Error", "Selecciona una fecha"); return;
    }
    if (productos.length === 0) {
      Alert.alert("Error", "Agrega al menos un producto"); return;
    }

    setSaving(true);
    try {
      if (editingCompra) {
        await comprasRepository.update(editingCompra.id, {
          categoria,
          productos: JSON.stringify(productos),
          total:     totalCompra,
        });
      } else {
        const fechaISO = fecha.split("/").reverse().join("-");
        await comprasRepository.create(userId, {
          categoria,
          productos: JSON.stringify(productos),
          total:     totalCompra,
          fecha:     fechaISO,
        });
      }
      await cargarCompras();
      setModalVisible(false);
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  // ======================
  // Filtros
  // ======================
  const comprasFiltradas = useMemo(() => {
    return compras.filter((c) => {
      const matchCat = filtroCategoria === "Todas" || c.categoria === filtroCategoria;
      const prods    = parseProductos(c.productos);
      const matchBusqueda =
        !busqueda ||
        prods.some((p) => p.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
      return matchCat && matchBusqueda;
    });
  }, [compras, filtroCategoria, busqueda]);

  const totalGastado = useMemo(
    () => compras.reduce((acc, c) => acc + c.total, 0),
    [compras]
  );

  // ======================
  // Render
  // ======================
  const getCategoriaIcon = (cat: string) => {
    switch (cat) {
      case "Supermercado":  return "local-grocery-store";
      case "Comida":        return "restaurant";
      case "Transporte":    return "directions-bus";
      case "Ropa":          return "checkroom";
      case "Salud":         return "health-and-safety";
      case "Suscripciones": return "subscriptions";
      default:              return "category";
    }
  };

  const renderCompra = ({ item }: { item: Compra }) => {
    const prods = parseProductos(item.productos);
    return (
      <View style={styles.compraCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.compraCategoria}>{item.categoria}</Text>
          <Text style={styles.compraFecha}>
            {item.fecha ? fromISOtoDMY(item.fecha) : ""}
          </Text>
          {prods.map((p) => (
            <Text key={p.id} style={styles.compraDetalle}>
              • {p.descripcion} ({p.cantidad} × ${p.precio})
            </Text>
          ))}
          <Text style={styles.compraTotal}>Total: ${item.total.toFixed(2)}</Text>
        </View>
        <View style={{ justifyContent: "center", gap: 10 }}>
          <TouchableOpacity onPress={() => abrirEditarCompra(item)}>
            <MaterialIcons name="edit" size={22} color="#FF9800" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleEliminarCompra(item.id)}>
            <MaterialIcons name="delete" size={22} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="red" barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Registra tus compras!</Text>
        <FontAwesome5 name="shopping-cart" size={24} color="white" />
      </View>

      {/* 🔌 Estado de conexión e indicadores de sync */}
      <ConnectionBadge />
      {isSyncing && (
        <Text style={styles.syncText}>Sincronizando cambios...</Text>
      )}
      {lastSyncError && (
        <Text style={styles.syncError}>No se pudo sincronizar. Se intentará después.</Text>
      )}

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryLabel}>Total gastado</Text>
        <Text style={styles.summaryAmount}>${totalGastado.toFixed(2)}</Text>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#777" />
        <TextInput
          style={styles.searchInput} placeholder="Buscar producto..."
          value={busqueda} onChangeText={setBusqueda}
        />
      </View>

      <View style={styles.categoryGrid}>
        {["Todas", ...CATEGORIAS].map((cat) => {
          const active = filtroCategoria === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryBox, active && styles.categoryBoxActive]}
              onPress={() => setFiltroCategoria(cat)}
              activeOpacity={0.85}
            >
              <MaterialIcons name={getCategoriaIcon(cat)} size={22} color={active ? "white" : "#666"} />
              <Text style={[styles.categoryBoxText, active && styles.categoryBoxTextActive]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={comprasFiltradas}
        keyExtractor={(item) => item.id}
        renderItem={renderCompra}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => { resetForm(); setModalVisible(true); }}>
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* MODAL COMPRA */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView contentContainerStyle={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                {editingCompra ? "Editar compra" : "Nueva compra"}
              </Text>

              <Text style={styles.label}>Fecha *</Text>
              {editingCompra ? (
                <View style={styles.dateBtn}>
                  <MaterialIcons name="event" size={18} color="#555" />
                  <Text style={styles.dateText}>{fecha}</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.dateBtn} onPress={() => setCalendarVisible(true)}>
                  <MaterialIcons name="event" size={18} color="#555" />
                  <Text style={styles.dateText}>{fecha || "Seleccionar fecha"}</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.label}>Categoría</Text>
              <View style={styles.pickerContainer}>
                {CATEGORIAS.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.pickerOption, categoria === cat && styles.pickerOptionActive]}
                    onPress={() => setCategoria(cat)}
                  >
                    <Text style={[styles.pickerOptionText, categoria === cat && styles.pickerOptionTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Producto</Text>
              <TextInput style={styles.input} placeholder="Descripción" value={prodDesc} onChangeText={setProdDesc} />
              <TextInput style={styles.input} placeholder="Cantidad" keyboardType="numeric" value={prodCant} onChangeText={setProdCant} />
              <TextInput style={styles.input} placeholder="Precio" keyboardType="numeric" value={prodPrecio} onChangeText={setProdPrecio} />

              <TouchableOpacity style={styles.addProductBtn} onPress={agregarProducto}>
                <Text style={styles.buttonText}>+ Agregar producto</Text>
              </TouchableOpacity>

              {productos.map((p) => (
                <View key={p.id} style={styles.productoRow}>
                  <Text>{p.descripcion} — ${(p.cantidad * p.precio).toFixed(2)}</Text>
                  <TouchableOpacity onPress={() => eliminarProducto(p.id)}>
                    <MaterialIcons name="close" size={18} color="#F44336" />
                  </TouchableOpacity>
                </View>
              ))}

              <Text style={styles.totalText}>Total: ${totalCompra.toFixed(2)}</Text>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#F44336" }]}
                  onPress={() => { setModalVisible(false); resetForm(); }}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: saving ? "#9E9E9E" : "#4CAF50" }]}
                  onPress={handleGuardarCompra} disabled={saving}
                >
                  <Text style={styles.buttonText}>{editingCompra ? "Guardar cambios" : "Guardar"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* MODAL CALENDARIO */}
      <Modal transparent visible={calendarVisible} animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.calendarCard}>
            <View style={styles.calHeader}>
              <TouchableOpacity onPress={() => {
                const d = new Date(calYear, calMonth0 - 1, 1);
                setCalYear(d.getFullYear()); setCalMonth0(d.getMonth());
              }}>
                <FontAwesome5 name="chevron-left" />
              </TouchableOpacity>
              <Text style={styles.calTitle}>{Meses[calMonth0]} {calYear}</Text>
              <TouchableOpacity onPress={() => {
                const d = new Date(calYear, calMonth0 + 1, 1);
                setCalYear(d.getFullYear()); setCalMonth0(d.getMonth());
              }}>
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
                  const disabled = !!cell && iso < todayISO();
                  return (
                    <TouchableOpacity
                      key={j}
                      style={[styles.dayCell, iso === tempDateISO && styles.daySelected, disabled && { opacity: 0.35 }]}
                      disabled={!cell || disabled}
                      onPress={() => setTempDateISO(iso)}
                    >
                      <Text>{cell ? cell.getDate() : ""}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#F44336" }]}
                onPress={() => setCalendarVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#4CAF50" }]}
                onPress={() => { setFecha(fromISOtoDMY(tempDateISO)); setCalendarVisible(false); }}
              >
                <Text style={styles.buttonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ComprasScreen;

const styles = StyleSheet.create({
  container:              { flex: 1, backgroundColor: "beige" },
  syncText:               { textAlign: "center", color: "#666", paddingVertical: 4 },
  syncError:              { textAlign: "center", color: "#991B1B", paddingVertical: 4 },
  header:                 { backgroundColor: "red", padding: 16, flexDirection: "row", justifyContent: "space-between" },
  title:                  { color: "white", fontSize: 20, fontWeight: "bold" },
  summaryContainer:       { margin: 16, backgroundColor: "white", padding: 16, borderRadius: 12 },
  summaryLabel:           { color: "#777" },
  summaryAmount:          { fontSize: 26, fontWeight: "bold", color: "red" },
  searchContainer:        { flexDirection: "row", marginHorizontal: 16, backgroundColor: "white", padding: 10, borderRadius: 10, alignItems: "center" },
  searchInput:            { marginLeft: 8, flex: 1 },
  compraCard:             { backgroundColor: "white", borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: "row", justifyContent: "space-between" },
  compraCategoria:        { fontWeight: "bold" },
  compraFecha:            { color: "#777", marginBottom: 4 },
  compraDetalle:          { color: "#555", marginTop: 2 },
  compraTotal:            { marginTop: 6, fontWeight: "bold", color: "red" },
  fab:                    { position: "absolute", right: 20, bottom: 30, width: 58, height: 58, borderRadius: 29, backgroundColor: "red", alignItems: "center", justifyContent: "center" },
  modalBackground:        { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center" },
  modalContainer:         { backgroundColor: "white", margin: 20, borderRadius: 12, padding: 20 },
  modalTitle:             { fontSize: 20, fontWeight: "bold", textAlign: "center" },
  label:                  { marginTop: 10, fontWeight: "bold" },
  input:                  { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginTop: 6 },
  dateBtn:                { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginTop: 6 },
  dateText:               { marginLeft: 8 },
  pickerContainer:        { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  pickerOption:           { borderWidth: 1, borderColor: "#ccc", padding: 6, borderRadius: 8, marginRight: 6, marginBottom: 6 },
  pickerOptionActive:     { backgroundColor: "red", borderColor: "red" },
  pickerOptionText:       { color: "#333" },
  pickerOptionTextActive: { color: "white" },
  addProductBtn:          { marginTop: 10, backgroundColor: "#2196F3", padding: 10, borderRadius: 8, alignItems: "center" },
  productoRow:            { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  totalText:              { marginTop: 10, fontSize: 18, fontWeight: "bold", color: "red", textAlign: "right" },
  modalButtonsRow:        { flexDirection: "row", marginTop: 20 },
  modalButton:            { flex: 1, marginHorizontal: 5, padding: 12, borderRadius: 8, alignItems: "center" },
  buttonText:             { color: "white", fontWeight: "bold" },
  calendarCard:           { backgroundColor: "white", margin: 20, borderRadius: 12, padding: 16 },
  calHeader:              { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  calTitle:               { fontWeight: "bold" },
  weekHeader:             { flexDirection: "row", marginTop: 8 },
  weekCell:               { flex: 1, textAlign: "center", fontWeight: "bold" },
  weekRow:                { flexDirection: "row" },
  dayCell:                { flex: 1, height: 36, alignItems: "center", justifyContent: "center", margin: 1, borderRadius: 6 },
  daySelected:            { backgroundColor: "#FFD6CC" },
  categoryGrid:           { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 16, marginTop: 12 },
  categoryBox:            { width: "25%", height: 65, backgroundColor: "#fff", borderRadius: 14, marginBottom: 12, alignItems: "center", justifyContent: "center", gap: 6, shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  categoryBoxActive:      { backgroundColor: "red", shadowOpacity: 0.25, elevation: 4 },
  categoryBoxText:        { fontSize: 13, fontWeight: "600", color: "#555" },
  categoryBoxTextActive:  { color: "white" },
});