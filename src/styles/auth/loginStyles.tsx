import { StyleSheet } from "react-native";

export const PRIMARY = "#D32F2F";

export const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#FFF8F8",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },

  loginImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: PRIMARY,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: PRIMARY,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 15,
    color: "#888",
    marginBottom: 32,
  },

  formCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },

  linksContainer: {
    marginTop: 24,
    alignItems: "center",
    gap: 12,
  },

  link: {
    color: PRIMARY,
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
