import React, { createContext, useContext, useEffect, useState } from "react";
import { authService, type AuthUser } from "../services/authService";

interface UserContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  isLoading: true,
  setUser: () => {},
  logout: async () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService.getStoredUser()
      .then(setUserState)
      .finally(() => setIsLoading(false));
  }, []);

  const setUser = (u: AuthUser | null) => setUserState(u);

  const logout = async () => {
    await authService.logout();
    setUserState(null);
  };

  return (
    <UserContext.Provider value={{ user, isLoading, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);