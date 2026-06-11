import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";

import { useUser } from "../../context/UserContext";
import { syncEvents } from "../../Events/syncEvents";
import { comprasService } from "../../services/compras/comprasService";
import {
  Compra, ProductoCompra, CATEGORIAS, parseProductos, calcularTotal,
} from "../../../types/compras/comprasTypes";

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export const toISO = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayISO = () => toISO(new Date());

export const fromISOtoDMY = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

export const fromDMYtoISO = (dmy: string) => dmy.split("/").reverse().join("-");

export const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

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

export const useCompras = () => {
  const { user } = useUser();
  const userId = user?.user_id ?? null;

  const isSyncing = false;
  const lastSyncError = null;

  const [compras, setCompras] = useState<Compra[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [editingCompra, setEditingCompra] = useState<Compra | null>(null);
  const [fecha, setFecha] = useState("");
  const [tempDateISO, setTempDateISO] = useState(todayISO());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth0, setCalMonth0] = useState(new Date().getMonth());
  const [productos, setProductos] = useState<ProductoCompra[]>([]);
  const [prodDesc, setProdDesc] = useState("");
  const [prodCant, setProdCant] = useState("");
  const [prodPrecio, setProdPrecio] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [saving, setSaving] = useState(false);

  const calRows = useMemo(
    () => monthMatrix(calYear, calMonth0),
    [calYear, calMonth0]
  );

  const cargarCompras = useCallback(async () => {
    if (!userId) return;
    const data = await comprasService.getAll(userId);
    setCompras(data as Compra[]);
  }, [userId]);

  const cargarComprasRef = useRef(cargarCompras);

  useEffect(() => { cargarCompras(); }, [cargarCompras]);
  useEffect(() => { cargarComprasRef.current = cargarCompras; }, [cargarCompras]);

  useEffect(() => {
    const unsub = syncEvents.subscribe(() => cargarComprasRef.current());
    return () => unsub();
  }, []);

  const resetForm = () => {
    setCategoria(CATEGORIAS[0]);
    setProductos([]);
    setProdDesc("");
    setProdCant("");
    setProdPrecio("");
    setFecha("");
    setEditingCompra(null);
  };

  const abrirNuevaCompra = () => { resetForm(); setModalVisible(true); };
  const cerrarModal = () => { setModalVisible(false); resetForm(); };

  const agregarProducto = () => {
    if (!prodDesc.trim() || !prodCant.trim() || !prodPrecio.trim()) {
      Alert.alert("Error", "Completa el producto");
      return;
    }
    const cantidad = Number(prodCant);
    const precio = Number(prodPrecio);
    if (Number.isNaN(cantidad) || Number.isNaN(precio)) {
      Alert.alert("Error", "Cantidad y precio deben ser números");
      return;
    }
    if (cantidad <= 0 || precio <= 0) {
      Alert.alert("Error", "Cantidad o precio inválidos");
      return;
    }
    setProductos((prev) => [
      ...prev,
      { id: Date.now().toString(), descripcion: prodDesc.trim(), cantidad, precio },
    ]);
    setProdDesc(""); setProdCant(""); setProdPrecio("");
  };

  const eliminarProducto = (id: string) =>
    setProductos((prev) => prev.filter((p) => p.id !== id));

  const totalCompra = useMemo(() => calcularTotal(productos), [productos]);

  const abrirEditarCompra = (compra: Compra) => {
    setEditingCompra(compra);
    setCategoria(compra.categoria);
    setProductos(parseProductos(compra.productos));
    setFecha(fromISOtoDMY(compra.fecha));
    setModalVisible(true);
  };

  const guardarCompra = async () => {
    if (saving || !userId) return;
    if (!editingCompra && !fecha) {
      Alert.alert("Error", "Selecciona una fecha");
      return;
    }
    if (productos.length === 0) {
      Alert.alert("Error", "Agrega al menos un producto");
      return;
    }
    if (totalCompra <= 0) {
      Alert.alert("Error", "El total de la compra debe ser mayor a cero");
      return;
    }
    setSaving(true);
    try {
      if (editingCompra) {
        await comprasService.update(editingCompra.id, {
          categoria, productos, total: totalCompra,
        });
      } else {
        await comprasService.create(userId, {
          categoria, productos, total: totalCompra, fecha: fromDMYtoISO(fecha),
        });
      }
      await cargarCompras();
      setModalVisible(false);
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const eliminarCompra = (id: string) => {
    Alert.alert("Eliminar", "¿Eliminar esta compra?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive",
        onPress: async () => {
          await comprasService.remove(id);
          await cargarCompras();
        },
      },
    ]);
  };

  const comprasFiltradas = useMemo(() => {
    return compras.filter((c) => {
      const matchCat = filtroCategoria === "Todas" || c.categoria === filtroCategoria;
      const productosCompra = parseProductos(c.productos);
      const matchBusqueda =
        !busqueda ||
        productosCompra.some((p) =>
          p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
        );
      return matchCat && matchBusqueda;
    });
  }, [compras, filtroCategoria, busqueda]);

  const totalGastado = useMemo(
    () => compras.reduce((acc, c) => acc + c.total, 0),
    [compras]
  );

  const cambiarMes = (value: number) => {
    const d = new Date(calYear, calMonth0 + value, 1);
    setCalYear(d.getFullYear());
    setCalMonth0(d.getMonth());
  };

  const confirmarFecha = () => {
    setFecha(fromISOtoDMY(tempDateISO));
    setCalendarVisible(false);
  };

  return {
    isSyncing, 
    lastSyncError,
    comprasFiltradas, 
    totalGastado,
    modalVisible, 
    calendarVisible, 
    editingCompra,
    categoria, 
    fecha, 
    productos, 
    prodDesc, 
    prodCant, 
    prodPrecio,
    filtroCategoria, 
    busqueda, 
    saving,
    tempDateISO, 
    calYear, 
    calMonth0, 
    calRows,
    setCategoria, 
    setProdDesc, 
    setProdCant, 
    setProdPrecio,
    setFiltroCategoria, 
    setBusqueda, 
    setCalendarVisible, 
    setTempDateISO,
    abrirNuevaCompra, 
    cerrarModal, 
    agregarProducto, 
    eliminarProducto,
    abrirEditarCompra, 
    guardarCompra, 
    eliminarCompra, 
    cambiarMes, 
    confirmarFecha,
    totalCompra,
  };
};