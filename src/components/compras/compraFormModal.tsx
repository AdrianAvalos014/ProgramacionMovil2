import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import {Compra,ProductoCompra,CATEGORIAS,} from "../../../types/compras/comprasTypes";
import { comprasStyles as styles } from "../../styles/compras/comprasStyles";

interface Props {
  visible: boolean;
  editingCompra: Compra | null;
  categoria: string;
  fecha: string;
  productos: ProductoCompra[];
  prodDesc: string;
  prodCant: string;
  prodPrecio: string;
  totalCompra: number;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onOpenCalendar: () => void;
  onChangeCategoria: (categoria: string) => void;
  onChangeProdDesc: (text: string) => void;
  onChangeProdCant: (text: string) => void;
  onChangeProdPrecio: (text: string) => void;
  onAddProduct: () => void;
  onDeleteProduct: (id: string) => void;
}

export const CompraFormModal = ({
  visible,
  editingCompra,
  categoria,
  fecha,
  productos,
  prodDesc,
  prodCant,
  prodPrecio,
  totalCompra,
  saving,
  onClose,
  onSave,
  onOpenCalendar,
  onChangeCategoria,
  onChangeProdDesc,
  onChangeProdCant,
  onChangeProdPrecio,
  onAddProduct,
  onDeleteProduct,
}: Props) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackground}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.formCard}>
            <View style={styles.formHandle} />

            <View style={styles.formHeader}>
              <View>
                <Text style={styles.formTitle}>
                  {editingCompra ? "Editar compra" : "Nueva compra"}
                </Text>
                <Text style={styles.formSubtitle}>
                  Agrega tus productos y calcula el total
                </Text>
              </View>

              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <MaterialIcons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formContent}
            >
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Datos generales</Text>

                <Text style={styles.label}>Fecha</Text>

                {editingCompra ? (
                  <View style={styles.dateInput}>
                    <MaterialIcons name="event" size={20} color="#E53935" />
                    <Text style={styles.dateText}>{fecha}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={onOpenCalendar}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="event" size={20} color="#E53935" />
                    <Text
                      style={[
                        styles.dateText,
                        !fecha && styles.datePlaceholder,
                      ]}
                    >
                      {fecha || "Seleccionar fecha"}
                    </Text>
                    <MaterialIcons
                      name="keyboard-arrow-right"
                      size={24}
                      color="#999"
                    />
                  </TouchableOpacity>
                )}

                <Text style={styles.label}>Categoría</Text>

                <View style={styles.chipContainer}>
                  {CATEGORIAS.map((cat) => {
                    const active = categoria === cat;

                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => onChangeCategoria(cat)}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            active && styles.chipTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.formSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Producto</Text>
                  <Text style={styles.sectionHint}>Puedes agregar varios</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Descripción</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ej. Leche, pan, shampoo..."
                    placeholderTextColor="#AAA"
                    value={prodDesc}
                    onChangeText={onChangeProdDesc}
                  />
                </View>

                <View style={styles.doubleInputRow}>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Cantidad</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="0"
                      placeholderTextColor="#AAA"
                      keyboardType="numeric"
                      value={prodCant}
                      onChangeText={onChangeProdCant}
                    />
                  </View>

                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Precio</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="$0.00"
                      placeholderTextColor="#AAA"
                      keyboardType="numeric"
                      value={prodPrecio}
                      onChangeText={onChangeProdPrecio}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.addProductBtn}
                  onPress={onAddProduct}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="add-circle-outline" size={20} color="white" />
                  <Text style={styles.addProductText}>Agregar producto</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Lista de productos</Text>
                  <Text style={styles.productCounter}>
                    {productos.length} agregado(s)
                  </Text>
                </View>

                {productos.length === 0 ? (
                  <View style={styles.emptyProductsBox}>
                    <MaterialIcons name="shopping-bag" size={30} color="#DDD" />
                    <Text style={styles.emptyProductsText}>
                      Todavía no hay productos
                    </Text>
                  </View>
                ) : (
                  productos.map((p) => (
                    <View key={p.id} style={styles.productItem}>
                      <View style={styles.productIconBox}>
                        <MaterialIcons
                          name="shopping-basket"
                          size={18}
                          color="#E53935"
                        />
                      </View>

                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{p.descripcion}</Text>
                        <Text style={styles.productDetail}>
                          {p.cantidad} × ${p.precio}
                        </Text>
                      </View>

                      <Text style={styles.productSubtotal}>
                        ${(p.cantidad * p.precio).toFixed(2)}
                      </Text>

                      <TouchableOpacity
                        style={styles.deleteProductBtn}
                        onPress={() => onDeleteProduct(p.id)}
                      >
                        <MaterialIcons name="delete-outline" size={20} color="#E53935" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>

            <View style={styles.formFooter}>
              <View>
                <Text style={styles.totalLabel}>Total de compra</Text>
                <Text style={styles.totalAmount}>${totalCompra.toFixed(2)}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.saveFormButton,
                  saving && styles.disabledButton,
                ]}
                onPress={onSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                <Text style={styles.saveFormButtonText}>
                  {saving
                    ? "Guardando..."
                    : editingCompra
                    ? "Actualizar"
                    : "Guardar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};