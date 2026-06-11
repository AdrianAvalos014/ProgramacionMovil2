import { StyleSheet } from "react-native";

export const comprasStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "beige",
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

  header: {
    backgroundColor: "red",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },

  summaryContainer: {
    margin: 16,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
  },

  summaryLabel: {
    color: "#777",
  },

  summaryAmount: {
    fontSize: 26,
    fontWeight: "bold",
    color: "red",
  },

  searchContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  searchInput: {
    marginLeft: 8,
    flex: 1,
  },

  compraCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  compraCategoria: {
    fontWeight: "bold",
  },

  compraFecha: {
    color: "#777",
    marginBottom: 4,
  },

  compraDetalle: {
    color: "#555",
    marginTop: 2,
  },

  compraTotal: {
    marginTop: 6,
    fontWeight: "bold",
    color: "red",
  },

  cardActions: {
    justifyContent: "center",
    gap: 10,
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
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },

  modalContainer: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },

  // label: {
  //   marginTop: 10,
  //   fontWeight: "bold",
  // },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },

  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },

  // dateText: {
  //   marginLeft: 8,
  // },

  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },

  pickerOption: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 6,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },

  pickerOptionActive: {
    backgroundColor: "red",
    borderColor: "red",
  },

  pickerOptionText: {
    color: "#333",
  },

  pickerOptionTextActive: {
    color: "white",
  },

  // addProductBtn: {
  //   marginTop: 10,
  //   backgroundColor: "#2196F3",
  //   padding: 10,
  //   borderRadius: 8,
  //   alignItems: "center",
  // },

  productoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },

  totalText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "red",
    textAlign: "right",
  },

  modalButtonsRow: {
    flexDirection: "row",
    marginTop: 20,
  },

  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  cancelButton: {
    backgroundColor: "#F44336",
  },

  saveButton: {
    backgroundColor: "#4CAF50",
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },

  calendarCard: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 12,
    padding: 16,
  },

  calHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  calTitle: {
    fontWeight: "bold",
  },

  weekHeader: {
    flexDirection: "row",
    marginTop: 8,
  },

  weekCell: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
  },

  weekRow: {
    flexDirection: "row",
  },

  dayCell: {
    flex: 1,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    margin: 1,
    borderRadius: 6,
  },

  daySelected: {
    backgroundColor: "#FFD6CC",
  },

  dayDisabled: {
    opacity: 0.35,
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 12,
  },

  categoryBox: {
    width: "25%",
    height: 65,
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    elevation: 2,
  },

  categoryBoxActive: {
    backgroundColor: "red",
    shadowOpacity: 0.25,
    elevation: 4,
  },

  categoryBoxText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },

  categoryBoxTextActive: {
    color: "white",
  },
  keyboardContainer: {
  flex: 1,
  justifyContent: "flex-end",
},

formCard: {
  maxHeight: "92%",
  backgroundColor: "#FFF9F3",
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  paddingHorizontal: 18,
  paddingTop: 10,
  paddingBottom: 14,
},

formHandle: {
  width: 46,
  height: 5,
  borderRadius: 20,
  backgroundColor: "#E0D6CC",
  alignSelf: "center",
  marginBottom: 14,
},

formHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 14,
},

formTitle: {
  fontSize: 24,
  fontWeight: "800",
  color: "#2D2D2D",
},

formSubtitle: {
  marginTop: 3,
  color: "#777",
  fontSize: 13,
},

closeButton: {
  width: 38,
  height: 38,
  borderRadius: 19,
  backgroundColor: "#FFFFFF",
  alignItems: "center",
  justifyContent: "center",
  elevation: 2,
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
},

formContent: {
  paddingBottom: 12,
},

formSection: {
  backgroundColor: "#FFFFFF",
  borderRadius: 20,
  padding: 14,
  marginBottom: 14,
  elevation: 2,
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 5,
},

sectionTitle: {
  fontSize: 16,
  fontWeight: "800",
  color: "#333",
  marginBottom: 10,
},

sectionHeaderRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
},

sectionHint: {
  fontSize: 12,
  color: "#999",
},

label: {
  fontSize: 13,
  fontWeight: "700",
  color: "#555",
  marginBottom: 6,
  marginTop: 6,
},

dateInput: {
  minHeight: 48,
  borderRadius: 14,
  backgroundColor: "#FFF5F3",
  borderWidth: 1,
  borderColor: "#FFE0DA",
  paddingHorizontal: 12,
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginBottom: 8,
},

dateText: {
  flex: 1,
  color: "#333",
  fontWeight: "600",
},

datePlaceholder: {
  color: "#AAA",
  fontWeight: "500",
},

chipContainer: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
},

chip: {
  paddingHorizontal: 12,
  paddingVertical: 9,
  borderRadius: 999,
  backgroundColor: "#F7F7F7",
  borderWidth: 1,
  borderColor: "#EEE",
},

chipActive: {
  backgroundColor: "#E53935",
  borderColor: "#E53935",
},

chipText: {
  fontSize: 13,
  fontWeight: "700",
  color: "#555",
},

chipTextActive: {
  color: "#FFFFFF",
},

inputGroup: {
  marginBottom: 10,
},

inputLabel: {
  fontSize: 12,
  fontWeight: "700",
  color: "#666",
  marginBottom: 5,
},

formInput: {
  height: 48,
  borderRadius: 14,
  backgroundColor: "#F8F8F8",
  borderWidth: 1,
  borderColor: "#EFEFEF",
  paddingHorizontal: 12,
  color: "#333",
  fontWeight: "600",
},

doubleInputRow: {
  flexDirection: "row",
  gap: 10,
},

halfInput: {
  flex: 1,
},

addProductBtn: {
  height: 48,
  marginTop: 12,
  borderRadius: 14,
  backgroundColor: "#E53935",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
},

addProductText: {
  color: "#FFFFFF",
  fontWeight: "800",
},

productCounter: {
  color: "#E53935",
  fontSize: 12,
  fontWeight: "800",
},

emptyProductsBox: {
  borderWidth: 1,
  borderStyle: "dashed",
  borderColor: "#DDD",
  borderRadius: 16,
  padding: 18,
  alignItems: "center",
  justifyContent: "center",
},

emptyProductsText: {
  color: "#999",
  marginTop: 6,
  fontWeight: "600",
},

productItem: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#FAFAFA",
  borderRadius: 16,
  padding: 10,
  marginBottom: 8,
},

productIconBox: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: "#FFF0ED",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 10,
},

productInfo: {
  flex: 1,
},

productName: {
  fontWeight: "800",
  color: "#333",
},

productDetail: {
  color: "#888",
  marginTop: 2,
  fontSize: 12,
},

productSubtotal: {
  fontWeight: "800",
  color: "#333",
  marginRight: 8,
},

deleteProductBtn: {
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: "#FFF0ED",
  alignItems: "center",
  justifyContent: "center",
},

formFooter: {
  backgroundColor: "#FFFFFF",
  borderRadius: 22,
  padding: 14,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  elevation: 4,
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowOffset: { width: 0, height: -2 },
  shadowRadius: 8,
},

totalLabel: {
  color: "#777",
  fontSize: 12,
  fontWeight: "700",
},

totalAmount: {
  color: "#E53935",
  fontSize: 24,
  fontWeight: "900",
},

saveFormButton: {
  backgroundColor: "#E53935",
  paddingHorizontal: 22,
  height: 48,
  borderRadius: 16,
  alignItems: "center",
  justifyContent: "center",
},

saveFormButtonText: {
  color: "#FFFFFF",
  fontWeight: "900",
},

disabledButton: {
  backgroundColor: "#9E9E9E",
},
});