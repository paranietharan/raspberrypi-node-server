"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";
interface ThemeContextType { theme: Theme; toggleTheme: () => void }
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
let sessionTheme: Theme | undefined;

function readTheme(): Theme {
  if (sessionTheme) return sessionTheme;
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
  } catch { /* Storage can be disabled; use the OS preference. */ }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function subscribe(listener: () => void) {
  const preference = window.matchMedia("(prefers-color-scheme: dark)");
  const storageChanged = () => { sessionTheme = undefined; listener(); };
  window.addEventListener("storage", storageChanged);
  window.addEventListener("monitor-theme-change", listener);
  preference.addEventListener("change", listener);
  return () => {
    window.removeEventListener("storage", storageChanged);
    window.removeEventListener("monitor-theme-change", listener);
    preference.removeEventListener("change", listener);
  };
}
const serverTheme = (): Theme => "light";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, readTheme, serverTheme);
  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); }, [theme]);
  const toggleTheme = () => {
    sessionTheme = theme === "light" ? "dark" : "light";
    try { localStorage.setItem("theme", sessionTheme); } catch { /* Keep the session preference. */ }
    window.dispatchEvent(new Event("monitor-theme-change"));
  };
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
