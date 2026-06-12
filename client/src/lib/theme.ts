/** NukaSoft Theme Registry + Runtime Helpers
    Vault Refit: two sanctioned themes + CRT toggle.
    Fan themes retired to themes/community/ (kept on disk, not registered). */

export interface ThemeMeta {
  id: string;
  label: string;
  category: "sanctioned";
  categoryLabel: string;
  description: string;
  swatch: string; // primary color hex for preview dots
  ready: boolean;
}

export const THEMES: ThemeMeta[] = [
  { id: "vault",    label: "VAULT",    category: "sanctioned", categoryLabel: "NukaSoft", description: "Cola brown, cream, command red", swatch: "#C41E24", ready: true },
  { id: "terminal", label: "TERMINAL", category: "sanctioned", categoryLabel: "NukaSoft", description: "The CRT-green nod",              swatch: "#54C47A", ready: true },
];

export type ThemeName = string;

const STORAGE_KEY = "nukasoft-theme";
const CRT_KEY = "sk-crt";

export function getStoredTheme(): string {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && THEMES.some((t) => t.id === v)) return v;
    return "vault"; // default; any retired fan-theme value migrates here
  } catch {
    return "vault";
  }
}

export function applyTheme(theme: string) {
  // Strip all theme-* classes
  document.body.className = document.body.className
    .replace(/\btheme-\S+/g, "")
    .trim();
  if (theme !== "vault") {
    document.body.classList.add(`theme-${theme}`);
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}

/** CRT overlay toggle — default OFF, persisted, applied as html[data-crt] */
export function getStoredCrt(): boolean {
  try {
    return localStorage.getItem(CRT_KEY) === "on";
  } catch {
    return false;
  }
}

export function applyCrt(on: boolean) {
  document.documentElement.setAttribute("data-crt", on ? "on" : "off");
  try {
    localStorage.setItem(CRT_KEY, on ? "on" : "off");
  } catch {
    // ignore
  }
}

export function getThemeMeta(id: string): ThemeMeta | undefined {
  return THEMES.find((t) => t.id === id);
}

/** Read current theme colors from CSS custom properties */
export function getThemeColors() {
  const style = getComputedStyle(document.body);
  const get = (prop: string, fallback: string) =>
    style.getPropertyValue(prop).trim() || fallback;

  return {
    primary: get("--pip-primary", "#F5E6C8"),
    dim: get("--pip-dim", "rgba(245, 230, 200, 0.72)"),
    dark: get("--pip-dark", "rgba(245, 230, 200, 0.45)"),
    glow: get("--pip-glow", "rgba(196, 30, 36, 0.22)"),
    data: get("--pip-data", "#F5E6C8"),
    amber: get("--pip-amber", "#F1C40F"),
    crit: get("--pip-crit", "#E43A41"),
    bg: get("--pip-bg", "#241007"),
    surface3: get("--pip-surface-3", "#3D1C0B"),
    border: get("--pip-border", "rgba(245, 230, 200, 0.14)"),
    accent: get("--pip-accent", "#C41E24"),
    sky: get("--pip-sky", "#87CEEB"),
    green: get("--pip-green", "#54C47A"),
  };
}
