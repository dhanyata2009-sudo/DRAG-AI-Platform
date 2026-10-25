import { createContext, useState } from "react";

export const ThemeContext = createContext(null);

const STORAGE_KEY = "drag_ai_theme";

function applyTheme(theme) {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("theme-light", theme === "light");
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const initial = saved || "light";
    applyTheme(initial);
    return initial;
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
};