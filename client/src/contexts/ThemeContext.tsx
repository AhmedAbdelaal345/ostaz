import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = Exclude<ThemeMode, "system">;

interface ThemeContextType {
  theme: ResolvedTheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const legacyModes: Record<string, ThemeMode> = {
  "ليلي": "dark",
  "عادي": "light",
  "أوتوماتيك": "system",
};

function readMode(defaultMode: ThemeMode): ThemeMode {
  try {
    const saved = localStorage.getItem("ostazi-theme");
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
    return legacyModes[localStorage.getItem("ostazi-mode") || ""] || defaultMode;
  } catch {
    return defaultMode;
  }
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  switchable = true,
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(() => readMode(defaultTheme));
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => typeof window === "undefined" || !window.matchMedia("(prefers-color-scheme: light)").matches
  );
  const theme: ResolvedTheme = mode === "system"
    ? (systemPrefersDark ? "dark" : "light")
    : mode;

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = (event: MediaQueryListEvent) => setSystemPrefersDark(event.matches);
    setSystemPrefersDark(query.matches);
    query.addEventListener("change", updateSystemTheme);
    return () => query.removeEventListener("change", updateSystemTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;

    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeColor) themeColor.content = theme === "light" ? "#f5f5f5" : "#000000";
    const colorScheme = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
    if (colorScheme) colorScheme.content = theme;

    if (!switchable) return;
    try {
      localStorage.setItem("ostazi-theme", mode);
      localStorage.setItem("ostazi-mode", mode === "system" ? "أوتوماتيك" : mode === "light" ? "عادي" : "ليلي");
    } catch {
      // Theme preference remains active for this session when storage is unavailable.
    }
  }, [mode, switchable, theme]);

  const toggleTheme = () => setMode(current => (current === "system" ? theme : current) === "dark" ? "light" : "dark");
  const value = useMemo(
    () => ({ theme, mode, setMode, toggleTheme, switchable }),
    [theme, mode, switchable]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
