import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { getStoredTheme, applyTheme, getThemeMeta, THEMES } from "../lib/theme";
import type { ThemeMeta } from "../lib/theme";

interface ThemeContextValue {
  theme: string;
  label: string;
  setTheme: (id: string) => void;
  themes: ThemeMeta[];
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: "vault",
  label: "VAULT",
  setTheme: () => {},
  themes: THEMES,
});

export function useThemeProvider(): ThemeContextValue {
  const [theme, setThemeState] = useState<string>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Sync if another tab changes the theme
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "nukasoft-theme" && e.newValue) {
        setThemeState(e.newValue);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const setTheme = useCallback((id: string) => {
    const meta = getThemeMeta(id);
    if (meta && meta.ready) {
      setThemeState(id);
    }
  }, []);

  return {
    theme,
    label: getThemeMeta(theme)?.label ?? "VAULT",
    setTheme,
    themes: THEMES,
  };
}

export function useTheme() {
  return useContext(ThemeContext);
}
