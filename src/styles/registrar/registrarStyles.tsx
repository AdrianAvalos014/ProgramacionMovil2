import { StyleSheet } from "react-native";
import { COLORS, FONT_SIZES } from "../../../types";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "bold",
    color: "red",
    textAlign: "center",
  },
  subtitle: {
    fontSize: FONT_SIZES.small,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: FONT_SIZES.medium,
    marginTop: 12,
  },
  helperText: {
    fontSize: FONT_SIZES.small,
    color: "#888",
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    marginTop: 24,
    backgroundColor: "red",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
});