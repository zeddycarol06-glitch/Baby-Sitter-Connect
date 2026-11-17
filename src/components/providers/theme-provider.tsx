"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  applyTheme,
  getResolvedThemeSnapshot,
  getServerResolvedThemeSnapshot,
  getServerThemeSnapshot,
  getThemeSnapshot,
  notifyThemeListeners,
  readStoredTheme,
  setTheme,
  subscribeToTheme,
  THEME_MEDIA_QUERY,
  type ResolvedTheme,
  type Theme,
} from "@/lib/theme";
import type { ReactNode } from "react";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Lightweight theme provider. The blocking bootstrap script in the root layout
 * applies the stored theme before paint; this provider keeps React state in sync
 * and reacts to system preference changes.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);
  const resolvedTheme = useSyncExternalStore(
    subscribeToTheme,
    getResolvedThemeSnapshot,
    getServerResolvedThemeSnapshot,
  );

  useEffect(() => {
    applyTheme(readStoredTheme());
    notifyThemeListeners();

    const mediaQuery = window.matchMedia(THEME_MEDIA_QUERY);
    const handleSystemChange = () => {
      if (getThemeSnapshot() !== "system") return;
      applyTheme("system");
      notifyThemeListeners();
    };
    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
