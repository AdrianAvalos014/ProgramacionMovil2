import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

export function ConnectionBadge() {
  const { isOnline } = useNetworkStatus();

  return (
    <View style={[styles.badge, isOnline ? styles.online : styles.offline]}>
      <Text style={[styles.text, isOnline ? styles.textOnline : styles.textOffline]}>
        {isOnline ? "En línea" : "Sin conexión"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "center",
    marginVertical: 8,
  },
  online: {
    backgroundColor: "#DCFCE7",
  },
  offline: {
    backgroundColor: "#FEE2E2",
  },
  text: {
    fontWeight: "700",
    fontSize: 12,
  },
  textOnline: {
    color: "#166534",
  },
  textOffline: {
    color: "#991B1B",
  },
});