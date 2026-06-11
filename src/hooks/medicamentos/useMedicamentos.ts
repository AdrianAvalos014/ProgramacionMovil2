import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "../../context/UserContext";
import { syncEvents } from "../../Events/syncEvents";
import { medicamentosService } from "../../services/medicamentos/medicamentosService";
import { Medicamento } from "../../../types/medicamentos/medicamentosTypes";

export const useMedicamentos = () => {
  const { user } = useUser();
  const userId = user?.user_id ?? null;
  const isSyncing = false;
  const lastSyncError = null;
  const [meds, setMeds] = useState<Medicamento[]>([]);
  const [loadingMeds, setLoadingMeds] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [dosisMg, setDosisMg] = useState("");
  const [cadaHoras, setCadaHoras] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [umbral, setUmbral] = useState("5");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const cargarMeds = useCallback(async () => {
    if (!userId) {
      setMeds([]);
      setLoadingMeds(false);
      return;
    }
    setLoadingMeds(true);
    const data = await medicamentosService.getAll(userId);
    setMeds(data as Medicamento[]);
    setLoadingMeds(false);
  }, [userId]);

  const cargarMedsRef = useRef(cargarMeds);

  useEffect(() => {
    cargarMeds();
  }, [cargarMeds]);

  useEffect(() => {
    cargarMedsRef.current = cargarMeds;
  }, [cargarMeds]);

  useEffect(() => {
    const unsub = syncEvents.subscribe(() => cargarMedsRef.current());
    return () => unsub();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setNombre("");
    setDosisMg("");
    setCadaHoras("");
    setCantidad("");
    setUmbral("5");
    setPhotoUri(null);
    setModalVisible(false);
  };

  const empezarEditar = (m: Medicamento) => {
    setEditingId(m.id);
    setNombre(m.nombre);
    setDosisMg(m.dosisMg);
    setCadaHoras(m.cadaHoras);
    setCantidad(m.cantidad);
    setUmbral(m.umbral);
    setPhotoUri(m.photoUri ?? null);
    setModalVisible(true);
  };


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

    if (!res.canceled && res.assets.length > 0) {
      setPhotoUri(res.assets[0].uri);
    }
  };

  const guardar = async () => {
    // Valida que el nombre no esté vacío.
    if (!nombre.trim()) {
      return Alert.alert("Faltan datos", "Escribe el nombre.");
    }

    // Valida que la dosis no esté vacía.
    if (!dosisMg.trim()) {
      return Alert.alert("Faltan datos", "Indica la dosis.");
    }

    // Valida que el horario no esté vacío.
    if (!cadaHoras.trim()) {
      return Alert.alert("Faltan datos", "Indica cada cuántas horas.");
    }
    const horas = Number(cadaHoras);

    if (Number.isNaN(horas) || horas <= 0) {
      return Alert.alert(
        "Horario inválido",
        "El horario debe ser un número mayor a cero."
      );
    }
    // Valida que la cantidad no esté vacía.
    if (!cantidad.trim()) {
      return Alert.alert("Faltan datos", "Indica la cantidad.");
    }

    // Valida que la foto sea obligatoria.
    if (!photoUri) {
      return Alert.alert("Faltan datos", "La foto es obligatoria.");
    }

    if (!userId) return;

    // Confirmación antes de guardar
    const confirmado = await new Promise<boolean>((resolve) => {
      Alert.alert(
        "Confirmar",
        editingId
          ? `¿Actualizar "${nombre.trim()}"?`
          : `¿Registrar "${nombre.trim()}"?`,
        [
          { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
          { text: "Confirmar", onPress: () => resolve(true) },
        ]
      );
    });

    if (!confirmado) return;

    const data = {
      nombre: nombre.trim(),
      dosisMg,
      cadaHoras,
      cantidad,
      umbral,
      photoUri,
    };

    if (editingId) {
      await medicamentosService.update(editingId, data);

      Alert.alert("Medicamentos", "Medicamento actualizado.");
    } 
    
    else {
      await medicamentosService.create(userId, data);
      Alert.alert("Medicamentos", "Medicamento registrado.");
    }

    await cargarMeds();

    resetForm();
  };

  const eliminar = (id: string) => {
    const med = meds.find((m) => m.id === id);
    if (!med) return;
    Alert.alert("Eliminar", `¿Eliminar "${med.nombre}"?`, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await medicamentosService.remove(id);
          await cargarMeds();
        },
      },
    ]);
  };

  const tomarDosis = async (id: string) => {
    const med = meds.find((m) => m.id === id);
    if (!med) return;
    await medicamentosService.update(id, {
      cantidad: String(Math.max(0, Number(med.cantidad) - 1)),
      lastTaken: Date.now(),
    });
    await cargarMeds();
  };
  const proximaTomaTexto = (m: Medicamento) => {
    if (!m.lastTaken) return "—";
    const horas = Number(m.cadaHoras || "0");
    if (!horas) return "—";
    return new Date(
      m.lastTaken + horas * 3600 * 1000
    ).toLocaleString();
  };

  return {
    isSyncing,
    lastSyncError,

    meds,
    loadingMeds,

    editingId,

    nombre,
    dosisMg,
    cadaHoras,
    cantidad,
    umbral,
    photoUri,

    setNombre,
    setDosisMg,
    setCadaHoras,
    setCantidad,
    setUmbral,

    guardar,
    eliminar,
    tomarDosis,

    empezarEditar,
    resetForm,
    tomarFoto,

    proximaTomaTexto,

    modalVisible,
    setModalVisible,
  };
};