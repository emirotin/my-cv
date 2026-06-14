import { useEffect } from "react";
import {
  COLOR_THEME_STORAGE_KEY,
  COLOR_THEME_SYSTEM_QUERY,
  ColorThemeModes,
  applyColorThemeMode,
  getColorThemeModeSnapshot,
  syncColorThemeModeFromStorage,
} from "@/state/color-theme-store";

export function ColorThemeSync() {
  useEffect(() => {
    syncColorThemeModeFromStorage();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === COLOR_THEME_STORAGE_KEY || event.key === null) {
        syncColorThemeModeFromStorage();
      }
    };

    window.addEventListener("storage", handleStorage);

    const mediaQueryList = window.matchMedia?.(COLOR_THEME_SYSTEM_QUERY);
    const handleSystemThemeChange = () => {
      if (getColorThemeModeSnapshot() === ColorThemeModes.SYSTEM) {
        applyColorThemeMode(ColorThemeModes.SYSTEM, mediaQueryList?.matches ?? false);
      }
    };

    mediaQueryList?.addEventListener("change", handleSystemThemeChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      mediaQueryList?.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  return null;
}
