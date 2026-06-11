import { StyleSheet } from "react-native";

export const headerColor = "#D32F2F";

export const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8F1EA",
  },

  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: headerColor,
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 4,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },

  scroller: {
    padding: 16,
    paddingBottom: 100,
  },

  syncText: {
    textAlign: "center",
    color: "#666",
    paddingVertical: 4,
  },

  syncError: {
    textAlign: "center",
    color: "#991B1B",
    paddingVertical: 4,
  },

  // ── Card genérica ────────────────────────────────
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 4,
  },

  cardSubtitle: {
    fontSize: 13,
    color: "#757575",
    marginBottom: 16,
  },

  empty: {
    fontSize: 14,
    color: "#757575",
    marginTop: 10,
  },

  // ── Formulario: campos ───────────────────────────
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#616161",
    marginBottom: 5,
    marginTop: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "#FAFAFA",
    color: "#000",
  },

  doubleRow: {
    flexDirection: "row",
    gap: 14,
  },

  halfInput: {
    flex: 1,
  },

  // ── Formulario: foto ─────────────────────────────
  photoPicker: {
    height: 160,
    borderRadius: 20,
    backgroundColor: "#EFE5D8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D6C2AE",
    overflow: "hidden",
  },

  photoLarge: {
    width: "100%",
    height: "100%",
  },

  photoPickerText: {
    marginTop: 8,
    color: "#8B7355",
    fontWeight: "600",
    fontSize: 14,
  },

  // ── Modal ────────────────────────────────────────
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },

  modalScroll: {
    padding: 20,
  },

  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
    elevation: 8,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#212121",
  },

  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBtnsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },

  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  cancelBtn: {
    backgroundColor: "#9CA3AF",
  },

  saveBtn: {
    backgroundColor: headerColor,
  },

  modalBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },

  // ── FAB (botón flotante agregar) ─────────────────
  fab: {
    alignSelf: "flex-end",
    marginTop: 8,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: headerColor,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  // ── Lista: cada ítem de medicamento ─────────────
  medItem: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  medHeader: {
    flexDirection: "row",
    gap: 12,
  },

  medInfo: {
    flex: 1,
  },

  medName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 3,
  },

  medLine: {
    fontSize: 13,
    color: "#757575",
    marginBottom: 2,
  },

  medPhotoSmall: {
    width: 55,
    height: 55,
    borderRadius: 14,
  },

  medPhotoPlaceholder: {
    width: 55,
    height: 55,
    borderRadius: 14,
    backgroundColor: "#FFEBEE",
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Lista: botones de acción ─────────────────────
  btnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 8,
  },

  smallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },

  smallBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },

  takeBtn: {
    backgroundColor: "#43A047",
  },

  editBtn: {
    backgroundColor: "#FB8C00",
  },

  deleteBtn: {
    backgroundColor: "#E53935",
  },
});
