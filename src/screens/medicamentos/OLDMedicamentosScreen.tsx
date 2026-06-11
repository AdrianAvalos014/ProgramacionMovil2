import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

// 🔐 Auth
import { auth } from "../../services/firebase-config";

// 💾 SQLite
import { medicamentosRepository } from "../../database/repositories/medicamentosRepository";

// 🔄 Sync
import { syncEvents } from "../../Events/syncEvents";
import { useAutoSync } from "../../hooks/useAutoSync";
import { ConnectionBadge } from "../../components/ConnectionBadge";

const headerColor = "red";

// ======================
// Tipos
// ======================
interface Medicamento {
  id: string;
  user_id: string;
  nombre: string;
  dosisMg: string;
  cadaHoras: string;
  cantidad: string;
  umbral: string;
  photoUri?: string;
  lastTaken?: number;
  sync_status: string;
  deleted: number;
  created_at: string;
  updated_at: string;
}

export default function MedicamentosScreen() {
  const [userId, setUserId] = useState(auth.currentUser?.uid ?? null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUserId(u?.uid ?? null));
    return unsub;
  }, []);

  // 🔄 Detecta conexión y sincroniza automáticamente al volver internet
  const { isSyncing, lastSyncError } = useAutoSync(userId);

  // ── Form ──────────────────────────────────────────
  const [nombre, setNombre]       = useState("");
  const [dosisMg, setDosisMg]     = useState("");
  const [cadaHoras, setCadaHoras] = useState("");
  const [cantidad, setCantidad]   = useState("");
  const [umbral, setUmbral]       = useState("5");
  const [photoUri, setPhotoUri]   = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // ── Lista ─────────────────────────────────────────
  const [meds, setMeds]               = useState<Medicamento[]>([]);
  const [loadingMeds, setLoadingMeds] = useState(true);

  // ─── 1. Cargar medicamentos desde SQLite ──────────
  const cargarMeds = useCallback(async () => {
    if (!userId) {
      setMeds([]);
      setLoadingMeds(false);
      return;
    }
    setLoadingMeds(true);
    const data = await medicamentosRepository.getAll(userId);
    console.log("📦 Medicamentos recargados:", data.length);
    setMeds(data as Medicamento[]);
    setLoadingMeds(false);
  }, [userId]);

  // ─── 2. Cargar al montar o cuando cambia userId ───
  useEffect(() => {
    cargarMeds();
  }, [cargarMeds]);

  // ─── 3. Escuchar syncEvents para recargar cuando la
  //        nube baja datos nuevos (useAutoSync → downloadFromCloud
  //        → syncEvents.emit → aquí se recarga la UI)
  const cargarMedsRef = useRef(cargarMeds);
  useEffect(() => {
    cargarMedsRef.current = cargarMeds;
  }, [cargarMeds]);

  useEffect(() => {
    const unsub = syncEvents.subscribe(() => {
      cargarMedsRef.current();
    });
    return () => unsub(); // limpia al desmontar
  }, []); // sin dependencias: se suscribe una sola vez

  // ── Helpers ───────────────────────────────────────
  const limpiarForm = () => {
    setNombre("");
    setDosisMg("");
    setCadaHoras("");
    setCantidad("");
    setUmbral("5");
    setPhotoUri(null);
    setEditingId(null);
  };

  // ── Foto ──────────────────────────────────────────
  const tomarFoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permiso requerido", "Debes permitir el uso de la cámara.");
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!res.canceled && res.assets.length > 0) setPhotoUri(res.assets[0].uri);
  };

  // ── CRUD ──────────────────────────────────────────
  const registrarOModificar = async () => {
    if (!nombre.trim())   return Alert.alert("Faltan datos", "Escribe el nombre.");
    if (!dosisMg.trim())  return Alert.alert("Faltan datos", "Indica la dosis.");
    if (!cadaHoras.trim()) return Alert.alert("Faltan datos", "Indica cada cuántas horas.");
    if (!cantidad.trim()) return Alert.alert("Faltan datos", "Indica la cantidad.");
    if (!userId) return;

    const data = {
      nombre: nombre.trim(),
      dosisMg,
      cadaHoras,
      cantidad,
      umbral,
      photoUri: photoUri ?? "",
    };

    if (editingId) {
      await medicamentosRepository.update(editingId, data);
      Alert.alert("Medicamentos", "Medicamento actualizado.");
    } else {
      await medicamentosRepository.create(userId, data);
      Alert.alert("Medicamentos", "Medicamento registrado.");
    }

    await cargarMeds();
    limpiarForm();
  };

  const eliminarMed = (id: string) => {
    const med = meds.find((m) => m.id === id);
    if (!med) return;
    Alert.alert("Eliminar", `¿Eliminar "${med.nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive",
        onPress: async () => {
          // baseRepository hace el soft-delete y encola en sync_queue.
          // useAutoSync se encarga de enviar la cola cuando haya internet.
          await medicamentosRepository.remove(id);
          await cargarMeds();
        },
      },
    ]);
  };

  const tomarDosis = async (id: string) => {
    const med = meds.find((m) => m.id === id);
    if (!med) return;
    await medicamentosRepository.update(id, {
      cantidad: String(Math.max(0, Number(med.cantidad) - 1)),
      lastTaken: Date.now(),
    });
    await cargarMeds();
  };

  const empezarEditar = (m: Medicamento) => {
    setEditingId(m.id);
    setNombre(m.nombre);
    setDosisMg(m.dosisMg);
    setCadaHoras(m.cadaHoras);
    setCantidad(m.cantidad);
    setUmbral(m.umbral);
    setPhotoUri(m.photoUri ?? null);
  };

  const proximaTomaTexto = (m: Medicamento) => {
    if (!m.lastTaken) return "—";
    const horas = Number(m.cadaHoras || "0");
    if (!horas) return "—";
    return new Date(m.lastTaken + horas * 3600 * 1000).toLocaleString();
  };

  // ── JSX ───────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={headerColor} barStyle="light-content" />

      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Registra tus medicamentos!</Text>
        <MaterialIcons name="medication" size={22} color="#fff" />
      </View>

      {/* 🔌 Estado de conexión e indicadores de sync */}
      <ConnectionBadge />
      {isSyncing && (
        <Text style={styles.syncText}>Sincronizando cambios...</Text>
      )}
      {lastSyncError && (
        <Text style={styles.syncError}>No se pudo sincronizar. Se intentará después.</Text>
      )}

      <ScrollView contentContainerStyle={styles.scroller}>
        {/* FORMULARIO */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {editingId ? "Modificar medicamento" : "Registrar medicamento"}
          </Text>

          <View style={styles.photoRow}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <View style={[styles.photo, styles.photoPlaceholder]}>
                <MaterialIcons name="photo-camera" size={32} color="#9E9E9E" />
                <Text style={styles.photoPlaceholderText}>Sin foto</Text>
              </View>
            )}
            <TouchableOpacity style={styles.photoButton} onPress={tomarFoto}>
              <MaterialIcons name="photo-camera" size={20} color="#fff" />
              <Text style={styles.photoButtonText}>Tomar foto</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Nombre:</Text>
            <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Ej. Paracetamol" />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dosis (mg):</Text>
            <TextInput style={styles.input} value={dosisMg} onChangeText={setDosisMg} keyboardType="numeric" />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cada (hrs):</Text>
            <TextInput style={styles.input} value={cadaHoras} onChangeText={setCadaHoras} keyboardType="numeric" />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cantidad (Stock):</Text>
            <TextInput style={styles.input} value={cantidad} onChangeText={setCantidad} keyboardType="numeric" />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Umbral (Avisar):</Text>
            <TextInput style={styles.input} value={umbral} onChangeText={setUmbral} keyboardType="numeric" />
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={registrarOModificar}>
            <Text style={styles.primaryBtnText}>
              {editingId ? "Guardar cambios" : "Guardar medicamento"}
            </Text>
          </TouchableOpacity>

          {editingId && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={limpiarForm}>
              <Text style={styles.secondaryBtnText}>Cancelar edición</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* LISTA */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Medicamentos registrados</Text>

          {loadingMeds ? (
            <Text style={styles.empty}>Cargando medicamentos...</Text>
          ) : meds.length === 0 ? (
            <Text style={styles.empty}>Aún no registras medicamentos.</Text>
          ) : (
            meds.map((m) => (
              <View key={m.id} style={styles.medItem}>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {m.photoUri ? (
                    <Image source={{ uri: m.photoUri }} style={styles.medPhotoSmall} />
                  ) : (
                    <View style={styles.medPhotoPlaceholder}>
                      <FontAwesome5 name="pills" size={16} color="#FF9800" />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.medName}>{m.nombre}</Text>
                    <Text style={styles.medLine}>Dosis: {m.dosisMg} mg · Cada {m.cadaHoras} h</Text>
                    <Text style={styles.medLine}>Cantidad: {m.cantidad} (umbral {m.umbral})</Text>
                    <Text style={styles.medLine}>Próxima toma: {proximaTomaTexto(m)}</Text>
                  </View>
                </View>

                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: "#4CAF50" }]}
                    onPress={() => tomarDosis(m.id)}
                  >
                    <Text style={styles.smallBtnText}>Tomar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: "#FF9800" }]}
                    onPress={() => empezarEditar(m)}
                  >
                    <Text style={styles.smallBtnText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: "#F44336" }]}
                    onPress={() => eliminarMed(m.id)}
                  >
                    <Text style={styles.smallBtnText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: "beige" },
  syncText:             { textAlign: "center", color: "#666", paddingVertical: 4 },
  syncError:            { textAlign: "center", color: "#991B1B", paddingVertical: 4 },
  headerBar:            { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: headerColor, paddingHorizontal: 20, paddingVertical: 14, elevation: 4 },
  headerTitle:          { fontSize: 22, fontWeight: "bold", color: "#fff" },
  scroller:             { padding: 16, paddingBottom: 40 },
  card:                 { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, elevation: 3 },
  cardTitle:            { fontSize: 20, fontWeight: "bold", marginBottom: 8, color: "black" },
  row:                  { marginBottom: 10 },
  label:                { fontSize: 14, color: "#777", marginBottom: 4 },
  input:                { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 15, backgroundColor: "#f5f5f5", color: "#000" },
  photoRow:             { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 12 },
  photo:                { width: 70, height: 70, borderRadius: 10 },
  photoPlaceholder:     { backgroundColor: "#EEEEEE", justifyContent: "center", alignItems: "center" },
  photoPlaceholderText: { fontSize: 12, color: "#9E9E9E" },
  photoButton:          { backgroundColor: headerColor, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 6 },
  photoButtonText:      { color: "#fff", fontWeight: "bold", fontSize: 13 },
  primaryBtn:           { backgroundColor: headerColor, borderRadius: 8, paddingVertical: 10, alignItems: "center", marginTop: 10 },
  primaryBtnText:       { color: "#fff", fontWeight: "bold", fontSize: 16 },
  secondaryBtn:         { borderRadius: 8, paddingVertical: 8, alignItems: "center", marginTop: 8, borderWidth: 1, borderColor: headerColor },
  secondaryBtnText:     { color: headerColor, fontSize: 14, fontWeight: "bold" },
  empty:                { fontSize: 14, color: "#777", marginTop: 10 },
  medItem:              { borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 10, marginTop: 10 },
  medName:              { fontSize: 16, fontWeight: "bold", color: "black" },
  medLine:              { fontSize: 13, color: "#777" },
  btnRow:               { flexDirection: "row", justifyContent: "flex-end", marginTop: 8, gap: 8 },
  smallBtn:             { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  smallBtnText:         { color: "#fff", fontSize: 13, fontWeight: "bold" },
  medPhotoSmall:        { width: 50, height: 50, borderRadius: 8 },
  medPhotoPlaceholder:  { width: 50, height: 50, borderRadius: 8, backgroundColor: "#FFF3E0", justifyContent: "center", alignItems: "center" },
});