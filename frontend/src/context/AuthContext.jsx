import { createContext, useEffect, useMemo, useState } from "react";
import { DEMO_CREDENTIALS } from "../utils/constants";
export const AuthContext = createContext(null);
const readDemoSession = () => {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const stored = JSON.parse(storage.getItem("drag_ai_session"));
      if (stored?.loginId === DEMO_CREDENTIALS.loginId) return stored;
    } catch {
      storage.removeItem("drag_ai_session");
    }
  }
  return null;
};
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readDemoSession);
  useEffect(() => {
    for (const storage of [localStorage, sessionStorage]) {
      try {
        const stored = JSON.parse(storage.getItem("drag_ai_session"));
        if (stored && stored.loginId !== DEMO_CREDENTIALS.loginId) storage.removeItem("drag_ai_session");
      } catch {
        storage.removeItem("drag_ai_session");
      }
    }
  }, []);
  const login = (authenticatedUser, remember = true, token = null) => {
    if (!authenticatedUser) return;
    const storage = remember ? localStorage : sessionStorage;
    const otherStorage = remember ? sessionStorage : localStorage;
    storage.setItem("drag_ai_session", JSON.stringify(authenticatedUser));
    otherStorage.removeItem("drag_ai_session");
    if (token) {
      localStorage.setItem("drag_ai_token", token);
    }
    setUser(authenticatedUser);
  };
  const logout = () => {
    localStorage.removeItem("drag_ai_session");
    sessionStorage.removeItem("drag_ai_session");
    localStorage.removeItem("drag_ai_token");
    setUser(null);
  };
  const updateUser = (patch) => {
    setUser((current) => {
      if (!current) return null;
      const next = { ...current, ...patch };
      const storage = localStorage.getItem("drag_ai_session") ? localStorage : sessionStorage;
      storage.setItem("drag_ai_session", JSON.stringify(next));
      return next;
    });
  };
  const value = useMemo(() => ({ user, isAuthenticated: Boolean(user), login, logout, updateUser }), [user]);
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
