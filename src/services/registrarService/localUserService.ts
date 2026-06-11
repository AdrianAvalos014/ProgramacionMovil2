import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "users";

export const loadUsers = async () => {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
};

export const saveUsers = async (users: any[]) => {
  await AsyncStorage.setItem(KEY, JSON.stringify(users));
};
