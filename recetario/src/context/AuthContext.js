import React, { createContext, useContext, useEffect, useState } from 'react';
import * as auth from '../services/authService';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auth.getSessionUser().then(setUser).finally(() => setLoading(false));
  }, []);

  const value = {
    user,
    loading,
    login: async (u, p) => setUser(await auth.login(u, p)),
    register: async (data) => setUser(await auth.register(data)),
    logout: async () => {
      await auth.logout();
      setUser(null);
    },
    updateProfile: async (data) => setUser(await auth.updateProfile(user.id, data)),
    deleteAccount: async () => {
      await auth.deleteAccount(user.id);
      setUser(null);
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
