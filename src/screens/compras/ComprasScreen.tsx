import React from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";

import { ConnectionBadge } from "../../components/ConnectionBadge";
import { useCompras } from "../../hooks/compras/useCompras";
import { comprasStyles as styles } from "../../styles/compras/comprasStyles";

import { CompraCard } from "../../components/compras/compraCard";
import { SummaryCard } from "../../components/compras/summaryCard";
import { CategoryGrid } from "../../components/compras/categoryGrid";
import { CompraFormModal } from "../../components/compras/compraFormModal";
import { CalendarioModal } from "../../components/compras/calendarioModal";

const ComprasScreen = () => {
  const compras = useCompras();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="red" barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Registra tus compras!</Text>
        <FontAwesome5 name="shopping-cart" size={24} color="white" />
      </View>

      <ConnectionBadge />

      {compras.isSyncing && (
        <Text style={styles.syncText}>Sincronizando cambios...</Text>
      )}

      {compras.lastSyncError && (
        <Text style={styles.syncError}>
          No se pudo sincronizar. Se intentará después.
        </Text>
      )}

      <SummaryCard totalGastado={compras.totalGastado} />

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#777" />

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar producto..."
          value={compras.busqueda}
          onChangeText={compras.setBusqueda}
        />
      </View>

      <CategoryGrid
        selectedCategory={compras.filtroCategoria}
        onSelectCategory={compras.setFiltroCategoria}
      />

      <FlatList
        data={compras.comprasFiltradas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CompraCard
            compra={item}
            onEdit={compras.abrirEditarCompra}
            onDelete={compras.eliminarCompra}
          />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      />

      <TouchableOpacity style={styles.fab} onPress={compras.abrirNuevaCompra}>
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>

      <CompraFormModal
        visible={compras.modalVisible}
        editingCompra={compras.editingCompra}
        categoria={compras.categoria}
        fecha={compras.fecha}
        productos={compras.productos}
        prodDesc={compras.prodDesc}
        prodCant={compras.prodCant}
        prodPrecio={compras.prodPrecio}
        totalCompra={compras.totalCompra}
        saving={compras.saving}
        onClose={compras.cerrarModal}
        onSave={compras.guardarCompra}
        onOpenCalendar={() => compras.setCalendarVisible(true)}
        onChangeCategoria={compras.setCategoria}
        onChangeProdDesc={compras.setProdDesc}
        onChangeProdCant={compras.setProdCant}
        onChangeProdPrecio={compras.setProdPrecio}
        onAddProduct={compras.agregarProducto}
        onDeleteProduct={compras.eliminarProducto}
      />

      <CalendarioModal
        visible={compras.calendarVisible}
        calYear={compras.calYear}
        calMonth0={compras.calMonth0}
        calRows={compras.calRows}
        tempDateISO={compras.tempDateISO}
        onClose={() => compras.setCalendarVisible(false)}
        onChangeMonth={compras.cambiarMes}
        onSelectDate={compras.setTempDateISO}
        onConfirm={compras.confirmarFecha}
      />
    </SafeAreaView>
  );
};

export default ComprasScreen;