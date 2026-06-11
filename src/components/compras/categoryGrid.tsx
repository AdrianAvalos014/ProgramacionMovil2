import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";


import {CATEGORIAS} from "../../../types/compras/comprasTypes";
import { comprasStyles as styles } from "../../styles/compras/comprasStyles";

const getCategoriaIcon = (cat: string) => {
  switch (cat) {
    case "Supermercado":
      return "local-grocery-store";
    case "Comida":
      return "restaurant";
    case "Transporte":
      return "directions-bus";
    case "Ropa":
      return "checkroom";
    case "Salud":
      return "health-and-safety";
    case "Suscripciones":
      return "subscriptions";
    default:
      return "category";
  }
};

interface Props {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryGrid = ({ selectedCategory, onSelectCategory }: Props) => {
  return (
    <View style={styles.categoryGrid}>
      {["Todas", ...CATEGORIAS].map((cat) => {
        const active = selectedCategory === cat;

        return (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryBox, active && styles.categoryBoxActive]}
            onPress={() => onSelectCategory(cat)}
            activeOpacity={0.85}
          >
            <MaterialIcons
              name={getCategoriaIcon(cat)}
              size={22}
              color={active ? "white" : "#666"}
            />

            <Text
              style={[
                styles.categoryBoxText,
                active && styles.categoryBoxTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};