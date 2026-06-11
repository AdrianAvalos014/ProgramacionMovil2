import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F2DF",
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

  nextEventCard: {
    backgroundColor: "#FFF3E0",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F0C090",
    padding: 24,
    margin: 16,
    elevation: 3,
  },

  nextEventTitle: {
    fontWeight: "800",
    fontSize: 18,
    color: "#333",
  },

  eventName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#222",
    marginTop: 6,
  },

  eventDate: {
    color: "#555",
    fontSize: 16,
    marginTop: 4,
  },

  noEventText: {
    textAlign: "center",
    color: "#777",
    marginTop: 6,
  },

  calendarCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEDAC1",
    backgroundColor: "#fff",
    padding: 10,
  },

  calendarCardInsideModal: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEDAC1",
    backgroundColor: "#fff",
    padding: 10,
  },

  calHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  calTitle: {
    fontWeight: "800",
  },

  weekHeader: {
    flexDirection: "row",
  },

  weekCell: {
    flex: 1,
    textAlign: "center",
    fontWeight: "700",
    color: "#666",
  },

  weekRow: {
    flexDirection: "row",
  },

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

  dayDisabled: {
    opacity: 0.35,
  },

  dayText: {
    fontWeight: "700",
  },

  dayTextSelected: {
    color: "#000",
  },

  selectedText: {
    textAlign: "center",
    marginTop: 6,
    color: "#333",
    fontWeight: "700",
  },

  bigBtn: {
    margin: 16,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  bigBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  btnGreen: {
    backgroundColor: "#4CAF50",
  },

  btnGreenLight: {
    backgroundColor: "#A5D6A7",
  },

  btnRed: {
    backgroundColor: "#D32F2F",
  },

  btnRedLight: {
    backgroundColor: "#EF9A9A",
  },

  btnBlue: {
    backgroundColor: "#2196F3",
  },

  btnBlueDark: {
    backgroundColor: "#1b289aff",
  },

  btnOrange: {
    backgroundColor: "#FF9800",
  },

  orText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 6,
  },

  sectionTitle: {
    fontWeight: "900",
    color: "#333",
    fontSize: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 8,
  },

  itemTitle: {
    fontWeight: "800",
    color: "#222",
  },

  itemDetail: {
    color: "#666",
  },

  itemComments: {
    color: "#555",
    fontStyle: "italic",
  },

  attendanceRow: {
    flexDirection: "row",
    marginTop: 6,
    gap: 6,
  },

  itemActions: {
    flexDirection: "row",
    gap: 6,
  },

  smallBtn: {
    padding: 8,
    borderRadius: 8,
  },

  smallBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },

  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },

  label: {
    fontWeight: "700",
    marginBottom: 4,
  },

  input: {
    borderWidth: 1,
    borderColor: "#CFCFCF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    minWidth: 60,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "center",
  },

  timeInput: {
    width: 64,
    textAlign: "center",
    marginHorizontal: 6,
  },

  timeSeparator: {
    fontSize: 18,
    alignSelf: "center",
  },

  amPmGroup: {
    flexDirection: "row",
    marginLeft: 8,
  },

  amPmBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  amPmSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#388E3C",
  },

  amPmUnselected: {
    backgroundColor: "#FFF",
    borderColor: "#CCC",
  },

  amPmText: {
    fontWeight: "700",
    color: "#333",
  },

  amPmTextSelected: {
    color: "#fff",
  },

  helper: {
    color: "#666",
    fontSize: 12,
    marginBottom: 8,
  },

  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  modalBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },

  monthEventItem: {
    marginBottom: 10,
  },

  monthEventTitle: {
    fontWeight: "800",
  },

  monthEventDate: {
    color: "#555",
  },
  eventModalBackdrop: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.45)",
  justifyContent: "flex-end",
},

eventKeyboardContainer: {
  flex: 1,
  justifyContent: "flex-end",
},

eventFormCard: {
  maxHeight: "92%",
  backgroundColor: "#FFF9F1",
  borderTopLeftRadius: 30,
  borderTopRightRadius: 30,
  paddingHorizontal: 18,
  paddingTop: 10,
  paddingBottom: 14,
},

eventFormHandle: {
  width: 48,
  height: 5,
  borderRadius: 20,
  backgroundColor: "#E5D8C8",
  alignSelf: "center",
  marginBottom: 14,
},

eventFormHeader: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
},

eventHeaderIcon: {
  width: 48,
  height: 48,
  borderRadius: 18,
  backgroundColor: "#FFE7E2",
  alignItems: "center",
  justifyContent: "center",
},

eventFormTitle: {
  fontSize: 24,
  fontWeight: "900",
  color: "#2D2D2D",
},

eventFormSubtitle: {
  fontSize: 13,
  color: "#777",
  marginTop: 2,
},

eventCloseBtn: {
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

eventFormContent: {
  paddingBottom: 10,
},

eventInfoBox: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#FFFFFF",
  borderRadius: 18,
  padding: 12,
  marginBottom: 14,
  borderWidth: 1,
  borderColor: "#FFE0D8",
},

eventInfoText: {
  flex: 1,
  marginLeft: 8,
  color: "#555",
  fontWeight: "600",
},

eventInfoDate: {
  color: "#D32F2F",
  fontWeight: "900",
},

eventSection: {
  backgroundColor: "#FFFFFF",
  borderRadius: 22,
  padding: 14,
  marginBottom: 14,
  elevation: 2,
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 5,
},

eventSectionTitle: {
  fontSize: 16,
  fontWeight: "900",
  color: "#333",
  marginBottom: 12,
},

eventLabel: {
  fontSize: 13,
  fontWeight: "800",
  color: "#555",
  marginBottom: 6,
},

eventSmallLabel: {
  fontSize: 12,
  fontWeight: "800",
  color: "#777",
  marginBottom: 5,
  textAlign: "center",
},

eventInputBox: {
  minHeight: 50,
  borderRadius: 16,
  backgroundColor: "#F8F8F8",
  borderWidth: 1,
  borderColor: "#EFEFEF",
  paddingHorizontal: 12,
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginBottom: 12,
},

eventInput: {
  flex: 1,
  color: "#333",
  fontWeight: "700",
},

eventTextAreaBox: {
  height: 96,
  alignItems: "flex-start",
  paddingTop: 12,
},

eventTextArea: {
  height: "100%",
  paddingTop: 0,
},

eventTimeRow: {
  flexDirection: "row",
  alignItems: "flex-end",
},

eventTimeInputGroup: {
  width: 72,
},

eventTimeInput: {
  height: 52,
  borderRadius: 16,
  backgroundColor: "#F8F8F8",
  borderWidth: 1,
  borderColor: "#EFEFEF",
  textAlign: "center",
  fontSize: 18,
  fontWeight: "900",
  color: "#333",
},

eventTimeSeparator: {
  fontSize: 28,
  fontWeight: "900",
  color: "#D32F2F",
  marginHorizontal: 8,
  marginBottom: 9,
},

eventAmPmGroup: {
  flex: 1,
  flexDirection: "row",
  backgroundColor: "#F8F8F8",
  borderRadius: 16,
  padding: 4,
  marginLeft: 10,
  height: 52,
},

eventAmPmBtn: {
  flex: 1,
  borderRadius: 13,
  alignItems: "center",
  justifyContent: "center",
},

eventAmPmBtnActive: {
  backgroundColor: "#D32F2F",
},

eventAmPmText: {
  fontWeight: "900",
  color: "#777",
},

eventAmPmTextActive: {
  color: "#FFFFFF",
},

eventFormFooter: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  backgroundColor: "#FFFFFF",
  borderRadius: 22,
  padding: 12,
  elevation: 4,
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowOffset: { width: 0, height: -2 },
  shadowRadius: 8,
},

eventCancelButton: {
  flex: 1,
  height: 50,
  borderRadius: 16,
  backgroundColor: "#F4F4F4",
  alignItems: "center",
  justifyContent: "center",
},

eventCancelText: {
  color: "#555",
  fontWeight: "900",
},

eventSaveButton: {
  flex: 1.3,
  height: 50,
  borderRadius: 16,
  backgroundColor: "#D32F2F",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row",
  gap: 7,
},

eventSaveText: {
  color: "#FFFFFF",
  fontWeight: "900",
},
});