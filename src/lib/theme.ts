export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const THEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";

const listeners = new Set<() => void>();

let currentTheme: Theme = "system";
let currentResolvedTheme: ResolvedTheme = "light";

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

export function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia(THEME_MEDIA_QUERY).matches ? "dark" : "light";
}

export function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

/** Applies the theme to the document and keeps the in-memory snapshot in sync. */
export function applyTheme(theme: Theme): ResolvedTheme {
  const resolved = resolveTheme(theme);
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
  }
  currentTheme = theme;
  currentResolvedTheme = resolved;
  return resolved;
}

export function notifyThemeListeners(): void {
  for (const listener of listeners) listener();
}

export function subscribeToTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getThemeSnapshot(): Theme {
  return currentTheme;
}

export function getServerThemeSnapshot(): Theme {
  return "system";
}

export function getResolvedThemeSnapshot(): ResolvedTheme {
  return currentResolvedTheme;
}

export function getServerResolvedThemeSnapshot(): ResolvedTheme {
  return "light";
}

/** Persists the choice, applies it to the document and notifies subscribers. */
export function setTheme(theme: Theme): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this page.
    }
  }
  applyTheme(theme);
  notifyThemeListeners();
}

/**
 * Blocking bootstrap script injected by the server-rendered layout so the correct
 * theme is applied before the first paint (avoids a flash of the wrong theme).
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}")||"system";var d=t==="dark"||(t!=="light"&&window.matchMedia("${THEME_MEDIA_QUERY}").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
