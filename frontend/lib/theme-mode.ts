"use client";

import type { Scope } from "@/services/api";

export type ThemeMode = "system" | "light" | "dark";

export const THEME_MODE_STORAGE_KEY = "theme";
export const THEME_MODE_CHANGE_EVENT = "ezprint-theme-mode-change";

export const isThemeMode = (value: unknown): value is ThemeMode =>
  value === "system" || value === "light" || value === "dark";

export const readStoredThemeMode = (): ThemeMode | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);
  return isThemeMode(storedValue) ? storedValue : null;
};

export const getNextManualThemeMode = (
  themeMode: string | undefined,
  resolvedTheme: string | undefined,
): Exclude<ThemeMode, "system"> => {
  if (themeMode === "light") {
    return "dark";
  }

  if (themeMode === "dark") {
    return "light";
  }

  return resolvedTheme === "dark" ? "light" : "dark";
};

export const dispatchThemeModeChange = (themeMode: ThemeMode) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(THEME_MODE_CHANGE_EVENT, { detail: themeMode }),
  );
};

export const getThemePreferencesPath = (scope: Scope) =>
  scope === "admin" ? "/admin/settings/preferences" : "/user/settings/preferences";
