import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";

import StackNavigator from "./src/navigation/StackNavigator";
import { initializeDatabase } from "./src/database/schema";
import { UserProvider } from "./src/context/UserContext";
import { useAutoSync } from "./src/hooks/useAutoSync";
import { useUser } from "./src/context/UserContext";

const API_URL = "https://api-cloud-docker.onrender.com";

function AppContent() {
  const { user } = useUser();
  useAutoSync(user?.user_id ?? null);

  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/health`).catch(() => {});
    initializeDatabase()
      .then(() => setDbReady(true))
  }, []);

  if (!dbReady) return null;

  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
