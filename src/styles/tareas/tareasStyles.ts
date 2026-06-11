import { StyleSheet } from "react-native";
import { FONT_SIZES } from "../../../types";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "beige" },

  header: {
    backgroundColor: "red",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },

  headerTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: "white",
  },

  headerSub: {
    marginTop: 2,
    fontSize: FONT_SIZES.small,
    color: "#f5f5f5",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 12,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 14,
    elevation: 2,
    marginHorizontal: 4,
  },

  summaryLabel: { fontSize: FONT_SIZES.small, color: "#777" },

  summaryValue: {
    marginTop: 4,
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: "red",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "white",
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: FONT_SIZES.medium,
    color: "#333",
  },

  clearBtn: { padding: 6, borderRadius: 14 },

  filtersRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 10,
  },

  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    backgroundColor: "white",
  },

  filterChipActive: { backgroundColor: "red", borderColor: "red" },

  filterText: { fontSize: FONT_SIZES.small, color: "#555" },

  filterTextActive: { color: "white", fontWeight: "bold" },

  listWrap: { flex: 1, marginHorizontal: 16, marginTop: 8 },

  taskCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },

  checkWrap: { paddingRight: 10, justifyContent: "center" },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "red",
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxChecked: { backgroundColor: "red" },

  taskInfo: { flex: 1 },

  taskTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  taskTitle: {
    flex: 1,
    fontSize: FONT_SIZES.medium,
    fontWeight: "700",
    color: "#333",
  },

  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#9E9E9E",
  },

  taskDesc: {
    marginTop: 4,
    fontSize: FONT_SIZES.small,
    color: "#666",
  },

  taskDescCompleted: {
    textDecorationLine: "line-through",
    color: "#B0B0B0",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    justifyContent: "space-between",
  },

  metaItem: { flexDirection: "row", alignItems: "center" },

  metaText: { fontSize: FONT_SIZES.small, color: "#777" },

  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  priorityText: {
    fontSize: FONT_SIZES.small,
    color: "white",
    fontWeight: "bold",
  },

  leftBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  leftText: {
    fontSize: FONT_SIZES.small,
    fontWeight: "700",
  },

  actionsCol: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginLeft: 8,
  },

  iconBtn: { padding: 6 },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: FONT_SIZES.medium,
    fontWeight: "700",
    color: "#555",
  },

  emptySub: {
    marginTop: 4,
    fontSize: FONT_SIZES.small,
    color: "#888",
    textAlign: "center",
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: 18,
  },

  modalScroll: {
    flexGrow: 1,
    justifyContent: "center",
  },

  modalCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 18,
    elevation: 6,
  },

  modalTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#111",
  },

  label: {
    fontSize: FONT_SIZES.small,
    marginBottom: 6,
    fontWeight: "bold",
    color: "#333",
  },

  input: {
    borderWidth: 1,
    borderColor: "#DADADA",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: FONT_SIZES.medium,
    backgroundColor: "white",
  },

  priorityRow: {
    flexDirection: "row",
    marginBottom: 8,
  },

  priorityChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    backgroundColor: "white",
  },

  priorityChipText: {
    fontSize: FONT_SIZES.small,
    color: "#555",
    fontWeight: "700",
  },

  modalBtnsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },

  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 4,
  },

  modalBtnText: {
    color: "white",
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },

  calHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  calTitle: {
    fontWeight: "800",
    fontSize: FONT_SIZES.medium,
  },

  weekHeader: { flexDirection: "row" },

  weekCell: {
    flex: 1,
    textAlign: "center",
    fontWeight: "700",
    color: "#666",
  },

  weekRow: { flexDirection: "row" },

  dayCell: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EEE",
    margin: 1,
    borderRadius: 6,
  },

  daySelected: {
    backgroundColor: "#FFE3D7",
    borderColor: "#FFBCA8",
  },

  dayText: { fontWeight: "700" },
});