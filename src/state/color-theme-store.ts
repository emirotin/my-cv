import { useSyncExternalStore } from "react";

export const COLOR_THEME_STORAGE_KEY = "ai-cv.colorTheme";
export const COLOR_THEME_SYSTEM_QUERY = "(prefers-color-scheme: dark)";

export const ColorThemeModes = {
  DARK: "dark",
  LIGHT: "light",
  SYSTEM: "system",
} as const;

export type ColorThemeMode = (typeof ColorThemeModes)[keyof typeof ColorThemeModes];
export type ResolvedColorThemeMode = typeof ColorThemeModes.DARK | typeof ColorThemeModes.LIGHT;

type ColorThemeListener = () => void;

const listeners = new Set<ColorThemeListener>();

let currentMode = readStoredColorThemeMode();

export function parseColorThemeMode(value: unknown): ColorThemeMode {
  if (
    value === ColorThemeModes.DARK ||
    value === ColorThemeModes.LIGHT ||
    value === ColorThemeModes.SYSTEM
  ) {
    return value;
  }

  return ColorThemeModes.SYSTEM;
}

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }

  return window.matchMedia(COLOR_THEME_SYSTEM_QUERY).matches;
}

export function resolveColorThemeMode(
  mode: ColorThemeMode,
  systemPrefersDark = getSystemPrefersDark(),
): ResolvedColorThemeMode {
  if (mode === ColorThemeModes.DARK || (mode === ColorThemeModes.SYSTEM && systemPrefersDark)) {
    return ColorThemeModes.DARK;
  }

  return ColorThemeModes.LIGHT;
}

export function applyColorThemeMode(
  mode: ColorThemeMode,
  systemPrefersDark = getSystemPrefersDark(),
): void {
  if (typeof document === "undefined") {
    return;
  }

  const resolvedMode = resolveColorThemeMode(mode, systemPrefersDark);
  const root = document.documentElement;

  root.classList.toggle("dark", resolvedMode === ColorThemeModes.DARK);
  root.dataset.colorTheme = mode;
  root.style.setProperty("color-scheme", resolvedMode);
}

export function readStoredColorThemeMode(): ColorThemeMode {
  if (typeof window === "undefined") {
    return ColorThemeModes.SYSTEM;
  }

  try {
    return parseColorThemeMode(window.localStorage.getItem(COLOR_THEME_STORAGE_KEY));
  } catch {
    return ColorThemeModes.SYSTEM;
  }
}

function writeStoredColorThemeMode(mode: ColorThemeMode): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(COLOR_THEME_STORAGE_KEY, mode);
  } catch {
    /* localStorage can throw in private-browsing modes; the in-memory choice still applies. */
  }
}

function emitColorThemeChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

function setCurrentColorThemeMode(mode: ColorThemeMode): void {
  currentMode = mode;
  emitColorThemeChange();
}

export function getColorThemeModeSnapshot(): ColorThemeMode {
  return currentMode;
}

function getServerColorThemeModeSnapshot(): ColorThemeMode {
  return ColorThemeModes.SYSTEM;
}

function subscribeToColorThemeMode(listener: ColorThemeListener): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function setColorThemeMode(mode: ColorThemeMode): void {
  const parsedMode = parseColorThemeMode(mode);

  writeStoredColorThemeMode(parsedMode);
  applyColorThemeMode(parsedMode);
  setCurrentColorThemeMode(parsedMode);
}

export function syncColorThemeModeFromStorage(): void {
  const mode = readStoredColorThemeMode();

  applyColorThemeMode(mode);
  setCurrentColorThemeMode(mode);
}

export function applyCurrentColorThemeMode(systemPrefersDark = getSystemPrefersDark()): void {
  applyColorThemeMode(currentMode, systemPrefersDark);
}

export function useColorThemeMode(): ColorThemeMode {
  return useSyncExternalStore(
    subscribeToColorThemeMode,
    getColorThemeModeSnapshot,
    getServerColorThemeModeSnapshot,
  );
}

export const COLOR_THEME_BOOTSTRAP_SCRIPT = `
(() => {
  try {
    const storedMode = window.localStorage.getItem("${COLOR_THEME_STORAGE_KEY}");
    const mode = storedMode === "dark" || storedMode === "light" || storedMode === "system"
      ? storedMode
      : "system";
    const systemPrefersDark = window.matchMedia?.("${COLOR_THEME_SYSTEM_QUERY}").matches ?? false;
    const resolvedMode = mode === "dark" || (mode === "system" && systemPrefersDark)
      ? "dark"
      : "light";
    const root = document.documentElement;

    root.classList.toggle("dark", resolvedMode === "dark");
    root.dataset.colorTheme = mode;
    root.style.setProperty("color-scheme", resolvedMode);
  } catch {}
})();
`;
